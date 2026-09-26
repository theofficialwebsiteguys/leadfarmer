<?php
/**
 * Lead Farmer API configuration — EXAMPLE FILE.
 *
 * Copy this to a directory OUTSIDE public_html (so it is never web-servable) and
 * fill in real values. On cPanel that usually means:
 *
 *     /home/<cpanel-user>/leadfarmer-config/config.php
 *
 * The API looks for the real config in this order:
 *   1. The path in the LEADFARMER_CONFIG environment variable (set via .htaccess/SetEnv)
 *   2. <document-root-parent>/leadfarmer-config/config.php
 *   3. ../../leadfarmer-config/config.php relative to the api directory
 *   4. api/config.php  (LOCAL DEVELOPMENT ONLY — never commit or deploy this)
 *
 * Never commit a filled-in copy of this file. See api/.gitignore.
 */

return [
    // ---------------------------------------------------------------------
    // Database (cPanel → MySQL Databases). Note cPanel prefixes the database
    // and user names with your account name, e.g. "cpaneluser_leadfarmer".
    // ---------------------------------------------------------------------
    'db' => [
        'host'     => 'localhost',
        'port'     => 3306,
        'name'     => 'REPLACE_WITH_DB_NAME',
        'user'     => 'REPLACE_WITH_DB_USER',
        'password' => 'REPLACE_WITH_DB_PASSWORD',
        'charset'  => 'utf8mb4',
    ],

    // ---------------------------------------------------------------------
    // Public base URL of the site, no trailing slash. Used to build absolute
    // image URLs returned by the API. Example: https://leadfarmer.com
    // Leave as null to auto-detect from the incoming request (works fine when
    // the site is served from a single domain).
    // ---------------------------------------------------------------------
    'public_base_url' => null,

    // ---------------------------------------------------------------------
    // Uploads. `dir` is an absolute filesystem path; `url_path` is the public
    // path it is served from, relative to the site root.
    // ---------------------------------------------------------------------
    'uploads' => [
        'dir'            => dirname(__DIR__) . '/uploads',
        'url_path'       => '/uploads',
        'max_bytes'      => 8 * 1024 * 1024,
        'allowed_mimes'  => ['image/jpeg', 'image/png', 'image/webp'],
    ],

    // ---------------------------------------------------------------------
    // Outgoing mail for the contact form.
    //
    // `from` MUST be an address on this domain — mail claiming to come from the
    // visitor's own address gets rejected or spam-filed by SPF/DKIM. The
    // visitor's address is put in Reply-To instead, so replying still reaches
    // them. Create the mailbox in cPanel → Email Accounts first.
    //
    // Leave `from` null and it is derived from public_base_url as
    // no-reply@yourdomain.com.
    //
    // Where messages are DELIVERED is not set here — it is the contact email
    // under Settings in the dashboard, so the client can change it themselves.
    // ---------------------------------------------------------------------
    // `relay_url` is the shared submission service. Contact enquiries are POSTed
    // there and delivered over authenticated SMTP, which is considerably more
    // reliable than PHP's mail() on shared hosting. The call is made server to
    // server, so CORS does not apply and the recipient is never chosen by the
    // visitor. Set it to null to use mail() directly instead.
    //
    // If the service is unreachable the API falls back to mail() on its own,
    // and either way the enquiry is already saved to the dashboard first.
    'mail' => [
        'relay_url'     => 'https://twg-template-submission-92b1532f00c1.herokuapp.com/send-email-universal',
        'relay_timeout' => 20,
        'from'          => null,
        'from_name'     => 'Lead Farmer Website',
    ],

    // ---------------------------------------------------------------------
    // Session / cookie settings.
    //   secure   — true in production (HTTPS only). Must be false for plain
    //              http:// local development or the cookie is dropped.
    //   lifetime — seconds of inactivity before the admin is logged out.
    // ---------------------------------------------------------------------
    'session' => [
        'name'     => 'lf_admin_session',
        'secure'   => true,
        'lifetime' => 60 * 60 * 8,
    ],

    // ---------------------------------------------------------------------
    // Login rate limiting: max failed attempts per identity/IP within the
    // window (seconds) before further attempts are refused.
    // ---------------------------------------------------------------------
    'rate_limit' => [
        'max_attempts' => 8,
        'window'       => 15 * 60,
    ],

    // ---------------------------------------------------------------------
    // One-time setup token for tools/setup.php (the browser-based first-admin
    // creation flow, for hosts without SSH). Generate a long random value, use
    // it once, then set it back to null. Setup also refuses to run at all once
    // an admin account exists.
    // ---------------------------------------------------------------------
    'setup_token' => null,

    // Set true only while debugging — exposes PHP error details in responses.
    'debug' => false,
];
