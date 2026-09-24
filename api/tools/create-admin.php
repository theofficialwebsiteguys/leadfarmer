<?php
declare(strict_types=1);

/**
 * Creates the first (or an additional) admin account.
 *
 * COMMAND LINE ONLY — refuses to run over HTTP. This is the preferred way to
 * create an admin: no credentials ever travel over the network, and nothing
 * needs to be temporarily exposed on the public site.
 *
 * Usage (cPanel → Terminal, or SSH):
 *
 *     cd ~/public_html/api
 *     php tools/create-admin.php
 *
 * You will be prompted for a username and password. The password is never
 * echoed, never logged, and only its password_hash() digest is stored.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script can only be run from the command line.\n");
}

require __DIR__ . '/bootstrap.php';

use LeadFarmer\Lib\Database;

function prompt(string $label): string
{
    echo $label;
    $line = fgets(STDIN);
    return $line === false ? '' : trim($line);
}

function promptSecret(string $label): string
{
    echo $label;

    // Best effort at hiding input; falls back to visible entry on Windows.
    if (DIRECTORY_SEPARATOR !== '\\' && @shell_exec('which stty') !== null) {
        @shell_exec('stty -echo');
        $value = fgets(STDIN);
        @shell_exec('stty echo');
        echo PHP_EOL;
    } else {
        $value = fgets(STDIN);
    }

    return $value === false ? '' : trim($value);
}

echo "\n=== Lead Farmer — create admin user ===\n\n";

$username = prompt('Username: ');
if ($username === '' || mb_strlen($username) > 191) {
    exit("A username between 1 and 191 characters is required.\n");
}

$existing = Database::one('SELECT id FROM admin_users WHERE username = :u LIMIT 1', ['u' => $username]);
if ($existing !== null) {
    exit("That username already exists. Choose another, or delete the existing row first.\n");
}

$email = prompt('Email (optional): ');
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    exit("That email address is not valid.\n");
}

$password = promptSecret('Password (min 12 characters, will not be shown): ');
if (mb_strlen($password) < 12) {
    exit("Password must be at least 12 characters.\n");
}

$confirm = promptSecret('Confirm password: ');
if (!hash_equals($password, $confirm)) {
    exit("Passwords did not match.\n");
}

Database::run(
    'INSERT INTO admin_users (username, email, password_hash) VALUES (:username, :email, :hash)',
    [
        'username' => $username,
        'email'    => $email !== '' ? $email : null,
        'hash'     => password_hash($password, PASSWORD_DEFAULT),
    ]
);

echo "\nAdmin user '{$username}' created. Sign in at /admin.\n\n";
