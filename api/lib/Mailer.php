<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Sends plain-text mail through PHP's mail(), which is what shared cPanel
 * hosting provides.
 *
 * Header safety: every value that lands in a header is stripped of CR/LF before
 * use. Without that, a newline inside a name or subject lets a sender inject
 * extra headers (Bcc:, Content-Type:, …) and turn the contact form into an open
 * relay — the classic email-header-injection bug.
 *
 * Deliverability: the From address must belong to this domain or SPF/DKIM will
 * reject it. The visitor's address goes in Reply-To instead, so hitting reply in
 * a mail client still answers them.
 *
 * Reusable across projects.
 */
final class Mailer
{
    /**
     * Delivers a contact enquiry.
     *
     * Prefers the shared submission service (nodemailer over authenticated
     * SMTP), which delivers far more reliably than PHP's mail() on shared
     * hosting. Falls back to mail() if the service is unreachable — a sleeping
     * dyno or a network blip should not cost the client an enquiry.
     *
     * Called server-to-server, so the browser's CORS rules do not apply and the
     * recipient is never something a visitor can choose.
     *
     * @param array<string,string> $fields Form values, in the order they should read.
     * @return array{sent:bool,via:string}
     */
    public static function deliverEnquiry(string $to, array $fields, string $replyToEmail, string $replyToName): array
    {
        $relayUrl = Config::get('mail.relay_url');

        if (is_string($relayUrl) && $relayUrl !== '') {
            if (self::relay($relayUrl, $to, $fields)) {
                return ['sent' => true, 'via' => 'relay'];
            }
            error_log('[leadfarmer-api] Mailer: relay failed, falling back to mail().');
        }

        $body = [];
        foreach ($fields as $label => $value) {
            if ($value !== '') {
                $body[] = $label . ': ' . $value;
            }
        }

        $sent = self::send($to, 'Form Submission via Website', implode("\n", $body), $replyToEmail, $replyToName);

        return ['sent' => $sent, 'via' => $sent ? 'php_mail' : 'none'];
    }

    /**
     * POSTs to the shared submission service.
     *
     * The service reads `businessEmail` as the recipient and turns every other
     * key into a "Label: value" line, so the keys here are the labels the client
     * sees in their inbox. `email` is special — the service uses it as Reply-To.
     *
     * @param array<string,string> $fields
     */
    private static function relay(string $url, string $to, array $fields): bool
    {
        $payload = ['businessEmail' => $to];
        foreach ($fields as $label => $value) {
            if ($value !== '') {
                // Lower camel keys: the service splits them back into words.
                $payload[lcfirst(str_replace(' ', '', ucwords(strtolower($label))))] = $value;
            }
        }

        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            return false;
        }

        // Generous timeout: a sleeping dyno can take ten seconds to wake. The
        // message is already stored by this point, so a slow send is survivable.
        $timeout = (int) Config::get('mail.relay_timeout', 20);

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $json,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => $timeout,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
            ]);

            $response = curl_exec($ch);
            $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($response === false || $status < 200 || $status >= 300) {
                error_log(sprintf('[leadfarmer-api] Mailer relay HTTP %d: %s', $status, $error !== '' ? $error : (string) $response));
                return false;
            }

            return true;
        }

        // Hosts with cURL disabled still have the streams wrapper.
        $context = stream_context_create([
            'http' => [
                'method'        => 'POST',
                'header'        => "Content-Type: application/json\r\nAccept: application/json\r\n",
                'content'       => $json,
                'timeout'       => $timeout,
                'ignore_errors' => true,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            error_log('[leadfarmer-api] Mailer relay: request failed (no cURL).');
            return false;
        }

        // $http_response_header is set by the streams wrapper.
        $statusLine = $http_response_header[0] ?? '';
        if (preg_match('#\s(\d{3})\s#', $statusLine, $m) !== 1 || (int) $m[1] < 200 || (int) $m[1] >= 300) {
            error_log('[leadfarmer-api] Mailer relay: ' . $statusLine);
            return false;
        }

        return true;
    }

    /**
     * @param string $to      Recipient, from configuration — never from user input.
     * @param string $subject
     * @param string $body    Plain text.
     * @param string|null $replyToEmail
     * @param string|null $replyToName
     */
    public static function send(
        string $to,
        string $subject,
        string $body,
        ?string $replyToEmail = null,
        ?string $replyToName = null
    ): bool {
        $to = self::headerSafe($to);
        if ($to === '' || filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
            error_log('[leadfarmer-api] Mailer: invalid recipient, refusing to send.');
            return false;
        }

        $fromAddress = self::resolveFromAddress();
        $fromName = self::headerSafe((string) Config::get('mail.from_name', 'Lead Farmer Website'));

        $headers = [
            'From: ' . self::formatAddress($fromName, $fromAddress),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: PHP/' . PHP_VERSION,
        ];

        if ($replyToEmail !== null && filter_var($replyToEmail, FILTER_VALIDATE_EMAIL) !== false) {
            $headers[] = 'Reply-To: ' . self::formatAddress(
                self::headerSafe((string) $replyToName),
                self::headerSafe($replyToEmail)
            );
        }

        // Encode the subject so non-ASCII survives, and so it cannot carry a newline.
        $encodedSubject = '=?UTF-8?B?' . base64_encode(self::headerSafe($subject)) . '?=';

        // The 5th argument sets the envelope sender; some hosts reject it when
        // the account is not permitted to, so fall back to a plain send.
        $sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $fromAddress);

        if (!$sent) {
            $sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));
        }

        if (!$sent) {
            error_log('[leadfarmer-api] Mailer: mail() failed for recipient ' . $to);
        }

        return $sent;
    }

    /**
     * A From address on this site's own domain. Configurable, but derived from
     * the public URL when unset so a fresh install still sends something valid.
     */
    private static function resolveFromAddress(): string
    {
        $configured = Config::get('mail.from');
        if (is_string($configured) && filter_var($configured, FILTER_VALIDATE_EMAIL) !== false) {
            return self::headerSafe($configured);
        }

        $host = parse_url(Config::publicBaseUrl(), PHP_URL_HOST) ?: 'localhost';
        $host = preg_replace('/^www\./', '', (string) $host);

        return 'no-reply@' . self::headerSafe((string) $host);
    }

    private static function formatAddress(string $name, string $email): string
    {
        if ($name === '') {
            return $email;
        }

        // Encode the display name so punctuation and non-ASCII cannot break the header.
        return '=?UTF-8?B?' . base64_encode($name) . '?= <' . $email . '>';
    }

    /** Removes anything that could start a new header line. */
    private static function headerSafe(string $value): string
    {
        return trim(str_replace(["\r", "\n", "\0", '%0a', '%0d'], '', $value));
    }
}
