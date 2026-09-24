<?php
declare(strict_types=1);

/**
 * Shared bootstrap for the CLI tools — autoloader + config, no routing.
 */

spl_autoload_register(static function (string $class): void {
    $prefixes = [
        'LeadFarmer\\Lib\\' => dirname(__DIR__) . '/lib/',
        'LeadFarmer\\App\\' => dirname(__DIR__) . '/app/',
    ];

    foreach ($prefixes as $prefix => $directory) {
        if (!str_starts_with($class, $prefix)) {
            continue;
        }

        $path = $directory . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($path)) {
            require $path;
            return;
        }
    }
});

\LeadFarmer\Lib\Config::load();
