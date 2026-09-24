<?php
declare(strict_types=1);

/**
 * Lead Farmer API — front controller.
 *
 * Every /api/* request is rewritten here by api/.htaccess.
 */

use LeadFarmer\Lib\Config;
use LeadFarmer\Lib\Request;
use LeadFarmer\Lib\Response;
use LeadFarmer\Lib\Router;

// ---------------------------------------------------------------------------
// Autoloading — a small PSR-4 style map, no Composer needed on shared hosting.
// ---------------------------------------------------------------------------
spl_autoload_register(static function (string $class): void {
    $prefixes = [
        'LeadFarmer\\Lib\\' => __DIR__ . '/lib/',
        'LeadFarmer\\App\\' => __DIR__ . '/app/',
    ];

    foreach ($prefixes as $prefix => $directory) {
        if (!str_starts_with($class, $prefix)) {
            continue;
        }

        $relative = substr($class, strlen($prefix));
        $path = $directory . str_replace('\\', '/', $relative) . '.php';

        if (is_file($path)) {
            require $path;
            return;
        }
    }
});

// ---------------------------------------------------------------------------
// Error handling — never leak stack traces to the client in production.
// ---------------------------------------------------------------------------
Config::load();

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

set_exception_handler(static function (\Throwable $e): void {
    error_log(sprintf('[leadfarmer-api] %s: %s in %s:%d', $e::class, $e->getMessage(), $e->getFile(), $e->getLine()));

    Response::error(
        500,
        'server_error',
        Config::isDebug()
            ? $e->getMessage() . ' (' . $e->getFile() . ':' . $e->getLine() . ')'
            : 'Something went wrong on our end. Please try again.'
    );
});

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if ((error_reporting() & $severity) === 0) {
        return false;
    }
    throw new \ErrorException($message, 0, $severity, $file, $line);
});

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
$request = Request::capture();

// The SPA and the API are same-origin, so no CORS headers are needed or wanted.
// A preflight can still arrive from a misconfigured client; answer it minimally.
if ($request->method === 'OPTIONS') {
    http_response_code(204);
    header('Allow: GET, POST, PUT, DELETE');
    exit;
}

/** @var Router $router */
$router = require __DIR__ . '/app/routes.php';
$router->dispatch($request);
