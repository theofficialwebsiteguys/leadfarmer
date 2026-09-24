<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Config;

/**
 * Turns stored image paths into public URLs.
 *
 * Paths are stored relative ("assets/product/Mac/mac1-flower.jpg",
 * "/uploads/abc.jpg") so the database stays portable between domains and
 * environments; the API resolves them against the configured public base URL on
 * the way out. Angular therefore never has to know where files live on disk.
 */
final class Media
{
    public static function url(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        $path = trim($path);
        if ($path === '') {
            return null;
        }

        // Already absolute (or a protocol-relative URL) — leave it alone.
        if (preg_match('#^(https?:)?//#i', $path) === 1) {
            return $path;
        }

        return Config::publicBaseUrl() . '/' . ltrim($path, '/');
    }
}
