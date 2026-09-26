<?php
/**
 * LOCAL DEVELOPMENT configuration — used only by docker-compose.yml.
 *
 * These credentials are deliberately committed: they only ever reach a throwaway
 * container on your own machine, and the database is recreated from
 * api/database/ whenever you run `npm run dev:api:reset`.
 *
 * The real, production config lives OUTSIDE public_html on the server and is
 * never committed. See api/config.example.php and docs/ADMIN-SETUP.md.
 */

return [
    'db' => [
        // "db" is the service name in docker-compose.yml.
        'host'     => 'db',
        'port'     => 3306,
        'name'     => 'leadfarmer',
        'user'     => 'leadfarmer',
        'password' => 'devpassword',
        'charset'  => 'utf8mb4',
    ],

    // Angular's dev server is the origin the browser actually sees: it serves
    // assets/ itself and proxies /uploads through to PHP, so image URLs must
    // point at :4200, not at :8000.
    'public_base_url' => 'http://localhost:4200',

    'uploads' => [
        'dir'           => '/var/www/html/uploads',
        'url_path'      => '/uploads',
        'max_bytes'     => 8 * 1024 * 1024,
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
    ],

    // The dev container has no mail transport, so mail() fails and the contact
    // form falls back to storing the message — which is exactly the path worth
    // exercising locally. Submissions appear under Messages in the dashboard.
    'mail' => [
        'from'      => 'no-reply@localhost',
        'from_name' => 'Lead Farmer Website (local)',
    ],

    'session' => [
        'name' => 'lf_admin_session',
        // MUST be false locally: a Secure cookie is dropped over plain http://.
        'secure'   => false,
        'lifetime' => 60 * 60 * 8,
    ],

    'rate_limit' => [
        'max_attempts' => 20,
        'window'       => 15 * 60,
    ],

    'setup_token' => null,

    // Full error detail in API responses while developing.
    'debug' => true,
];
