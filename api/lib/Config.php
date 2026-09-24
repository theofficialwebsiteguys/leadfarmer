<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Loads configuration from a file kept outside the web root.
 *
 * Reusable: nothing here is Lead Farmer specific beyond the default file name.
 */
final class Config
{
    private static ?array $values = null;

    /** Absolute path of the config file actually loaded, for diagnostics. */
    private static ?string $loadedFrom = null;

    public static function load(): void
    {
        if (self::$values !== null) {
            return;
        }

        $path = self::locate();
        if ($path === null) {
            Response::error(
                500,
                'server_misconfigured',
                'API configuration file not found. Copy api/config.example.php to a directory outside public_html and set LEADFARMER_CONFIG.'
            );
        }

        /** @var mixed $loaded */
        $loaded = require $path;
        if (!is_array($loaded)) {
            Response::error(500, 'server_misconfigured', 'Configuration file did not return an array.');
        }

        self::$values = $loaded;
        self::$loadedFrom = $path;
    }

    /**
     * Search order is documented in config.example.php. The api/config.php
     * fallback exists so a developer can run locally without env vars; it is
     * git-ignored and blocked from HTTP access by api/.htaccess.
     */
    private static function locate(): ?string
    {
        $apiDir = dirname(__DIR__);
        $candidates = [];

        $fromEnv = getenv('LEADFARMER_CONFIG');
        if (is_string($fromEnv) && $fromEnv !== '') {
            $candidates[] = $fromEnv;
        }

        $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
        if (is_string($docRoot) && $docRoot !== '') {
            $candidates[] = dirname($docRoot) . '/leadfarmer-config/config.php';
        }

        $candidates[] = dirname($apiDir, 2) . '/leadfarmer-config/config.php';
        $candidates[] = $apiDir . '/config.php';

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /** Dot-path lookup, e.g. Config::get('db.host'). */
    public static function get(string $key, mixed $default = null): mixed
    {
        self::load();

        $value = self::$values;
        foreach (explode('.', $key) as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    public static function isDebug(): bool
    {
        return (bool) self::get('debug', false);
    }

    /**
     * Public site origin with no trailing slash, used to build absolute media
     * URLs. Falls back to the current request's scheme+host so a correctly
     * configured single-domain install needs no configuration at all.
     */
    public static function publicBaseUrl(): string
    {
        $configured = self::get('public_base_url');
        if (is_string($configured) && $configured !== '') {
            return rtrim($configured, '/');
        }

        $https = ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off';
        $forwardedProto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? null;
        $scheme = $forwardedProto === 'https' || $https ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

        return $scheme . '://' . $host;
    }

    public static function loadedFrom(): ?string
    {
        return self::$loadedFrom;
    }
}
