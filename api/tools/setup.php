<?php
declare(strict_types=1);

/**
 * Browser-based first-admin creation — a fallback for hosts with no shell.
 * Prefer tools/create-admin.php over SSH/cPanel Terminal whenever possible.
 *
 * Three independent locks make this safe to leave on disk:
 *   1. It refuses to run unless `setup_token` is set in config.php (which lives
 *      outside public_html). The default is null, so it is inert until you
 *      deliberately enable it.
 *   2. The token must be supplied on the request and is compared in constant
 *      time.
 *   3. It refuses to run at all once any admin account exists — so it cannot be
 *      replayed to add a second, attacker-controlled account.
 *
 * Procedure:
 *   1. Set 'setup_token' => '<long random string>' in config.php.
 *   2. Visit https://yourdomain.com/api/tools/setup.php?token=<that string>
 *   3. Create the account.
 *   4. Set 'setup_token' back to null.
 */

require __DIR__ . '/bootstrap.php';

use LeadFarmer\Lib\Config;
use LeadFarmer\Lib\Database;

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function fail(string $message, int $status = 403): never
{
    http_response_code($status);
    echo '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<body style="font:16px/1.6 system-ui;max-width:40rem;margin:4rem auto;padding:0 1rem">';
    echo '<h1 style="font-size:1.25rem">Setup unavailable</h1><p>' . htmlspecialchars($message, ENT_QUOTES) . '</p></body>';
    exit;
}

// --- Lock 1: the feature must be switched on in config -----------------------
$expectedToken = Config::get('setup_token');
if (!is_string($expectedToken) || strlen($expectedToken) < 16) {
    fail('Setup is disabled. Set a long "setup_token" in config.php to enable it temporarily.');
}

// --- Lock 2: the caller must present that token ------------------------------
$providedToken = (string) ($_REQUEST['token'] ?? '');
if ($providedToken === '' || !hash_equals($expectedToken, $providedToken)) {
    fail('Invalid setup token.');
}

// --- Lock 3: only ever creates the *first* admin -----------------------------
$adminCount = (int) (Database::one('SELECT COUNT(*) AS c FROM admin_users')['c'] ?? 0);
if ($adminCount > 0) {
    fail('An administrator account already exists. Delete this file or leave setup_token unset.');
}

$errors = [];
$created = false;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $email    = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $confirm  = (string) ($_POST['confirm'] ?? '');

    if ($username === '' || mb_strlen($username) > 191) {
        $errors[] = 'Enter a username (1–191 characters).';
    }
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors[] = 'That email address is not valid.';
    }
    if (mb_strlen($password) < 12) {
        $errors[] = 'Password must be at least 12 characters.';
    }
    if (!hash_equals($password, $confirm)) {
        $errors[] = 'Passwords did not match.';
    }

    if ($errors === []) {
        Database::run(
            'INSERT INTO admin_users (username, email, password_hash) VALUES (:username, :email, :hash)',
            [
                'username' => $username,
                'email'    => $email !== '' ? $email : null,
                'hash'     => password_hash($password, PASSWORD_DEFAULT),
            ]
        );
        $created = true;
    }
}

$escapedToken = htmlspecialchars($providedToken, ENT_QUOTES);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lead Farmer — create administrator</title>
<style>
  body { font: 16px/1.6 system-ui, sans-serif; max-width: 30rem; margin: 3rem auto; padding: 0 1rem; color: #0a0a0a; }
  h1 { font-size: 1.4rem; }
  label { display: block; margin: 1rem 0 0.25rem; font-weight: 600; font-size: 0.9rem; }
  input { width: 100%; padding: 0.6rem; border: 1px solid #ccc; font-size: 1rem; }
  button { margin-top: 1.5rem; padding: 0.7rem 1.5rem; background: #0a0a0a; color: #fff; border: 0; font-size: 1rem; cursor: pointer; }
  .error { background: #fde7e7; border-left: 3px solid #c00; padding: 0.75rem 1rem; margin: 1rem 0; }
  .done  { background: #e7f7ea; border-left: 3px solid #0a0; padding: 0.75rem 1rem; margin: 1rem 0; }
</style>
</head>
<body>
<h1>Create administrator</h1>

<?php if ($created): ?>
  <div class="done">
    <strong>Account created.</strong>
    <p>Now set <code>setup_token</code> back to <code>null</code> in config.php, then
       <a href="/admin">sign in to the dashboard</a>.</p>
  </div>
<?php else: ?>

  <?php foreach ($errors as $error): ?>
    <div class="error"><?= htmlspecialchars($error, ENT_QUOTES) ?></div>
  <?php endforeach; ?>

  <form method="post" action="?token=<?= $escapedToken ?>" autocomplete="off">
    <label for="username">Username</label>
    <input id="username" name="username" required maxlength="191"
           value="<?= htmlspecialchars((string) ($_POST['username'] ?? ''), ENT_QUOTES) ?>">

    <label for="email">Email (optional)</label>
    <input id="email" name="email" type="email"
           value="<?= htmlspecialchars((string) ($_POST['email'] ?? ''), ENT_QUOTES) ?>">

    <label for="password">Password (minimum 12 characters)</label>
    <input id="password" name="password" type="password" required minlength="12">

    <label for="confirm">Confirm password</label>
    <input id="confirm" name="confirm" type="password" required minlength="12">

    <button type="submit">Create administrator</button>
  </form>
<?php endif; ?>
</body>
</html>
