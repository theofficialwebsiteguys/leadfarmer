<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * JSON response helpers. Every API response goes through here so headers and
 * the error envelope stay consistent.
 *
 * Reusable across projects.
 */
final class Response
{
    /**
     * Content is edited through the admin panel and must never be served from a
     * stale browser/proxy cache, so every API response opts out explicitly.
     */
    private static function baseHeaders(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: same-origin');
    }

    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        self::baseHeaders();
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function ok(mixed $data = null): never
    {
        self::json(['ok' => true, 'data' => $data]);
    }

    /**
     * @param array<string,string> $fieldErrors Field name => message, for form display.
     */
    public static function error(int $status, string $code, string $message, array $fieldErrors = []): never
    {
        $payload = [
            'ok' => false,
            'error' => ['code' => $code, 'message' => $message],
        ];

        if ($fieldErrors !== []) {
            $payload['error']['fields'] = $fieldErrors;
        }

        self::json($payload, $status);
    }

    public static function notFound(string $message = 'Not found.'): never
    {
        self::error(404, 'not_found', $message);
    }

    public static function unauthorized(string $message = 'You must sign in to do that.'): never
    {
        self::error(401, 'unauthorized', $message);
    }

    /** @param array<string,string> $fieldErrors */
    public static function validationFailed(array $fieldErrors, string $message = 'Please correct the highlighted fields.'): never
    {
        self::error(422, 'validation_failed', $message, $fieldErrors);
    }
}
