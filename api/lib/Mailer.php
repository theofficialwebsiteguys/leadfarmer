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
