<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Parsed view of the incoming HTTP request.
 *
 * Reusable across projects.
 */
final class Request
{
    /** @var array<string,mixed> */
    private array $body;

    private function __construct(
        public readonly string $method,
        public readonly string $path,
        array $body
    ) {
        $this->body = $body;
    }

    public static function capture(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        // Strip the query string and the /api prefix so routes are declared as
        // "/strains" rather than "/api/strains".
        $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
        $path = (string) parse_url($uri, PHP_URL_PATH);
        $path = preg_replace('#^.*?/api#', '', $path) ?? '';
        $path = '/' . trim($path, '/');

        return new self($method, $path, self::parseBody($method));
    }

    /** @return array<string,mixed> */
    private static function parseBody(string $method): array
    {
        if ($method === 'GET' || $method === 'HEAD') {
            return [];
        }

        $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));

        // Multipart uploads arrive pre-parsed in $_POST alongside $_FILES.
        if (str_contains($contentType, 'multipart/form-data')) {
            return $_POST;
        }

        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            Response::error(400, 'invalid_json', 'Request body must be valid JSON.');
        }

        return $decoded;
    }

    /** @return array<string,mixed> */
    public function body(): array
    {
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function query(string $key, ?string $default = null): ?string
    {
        $value = $_GET[$key] ?? $default;
        return is_string($value) ? $value : $default;
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $_SERVER[$key] ?? null;
        return is_string($value) ? $value : null;
    }

    public function ip(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return is_string($ip) ? $ip : '0.0.0.0';
    }
}
