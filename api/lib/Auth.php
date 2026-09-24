<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Session-based authentication, CSRF protection and login rate limiting.
 *
 * Design notes:
 *  - Credentials are verified with password_verify() against a password_hash()
 *    digest. Plaintext passwords are never stored or logged.
 *  - The session cookie is HttpOnly + SameSite=Lax (+ Secure in production), so
 *    JavaScript cannot read it and it is not sent on cross-site requests.
 *  - CSRF uses a per-session token that the SPA reads from GET /auth/session and
 *    echoes back in the X-CSRF-Token header on every write. Because the token
 *    lives in the session (not a readable cookie), a cross-site attacker cannot
 *    obtain it even if they can make the browser send the session cookie.
 *  - Failed logins are recorded per IP and per username; both are throttled.
 *
 * Reusable across projects — only the table names are app-specific.
 */
final class Auth
{
    private static bool $started = false;

    public static function startSession(): void
    {
        if (self::$started || session_status() === PHP_SESSION_ACTIVE) {
            self::$started = true;
            return;
        }

        $lifetime = (int) Config::get('session.lifetime', 28800);

        session_set_cookie_params([
            'lifetime' => 0, // session cookie; server-side expiry is authoritative
            'path'     => '/',
            'domain'   => '',
            'secure'   => (bool) Config::get('session.secure', true),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_name((string) Config::get('session.name', 'lf_admin_session'));
        session_start();
        self::$started = true;

        // Idle timeout, enforced server-side.
        $lastSeen = $_SESSION['last_seen'] ?? null;
        if (is_int($lastSeen) && (time() - $lastSeen) > $lifetime) {
            self::logout();
        }

        $_SESSION['last_seen'] = time();

        if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
    }

    public static function csrfToken(): string
    {
        self::startSession();
        return (string) $_SESSION['csrf_token'];
    }

    /** @return array{id:int,username:string,email:?string}|null */
    public static function currentUser(): ?array
    {
        self::startSession();

        $userId = $_SESSION['admin_user_id'] ?? null;
        if (!is_int($userId)) {
            return null;
        }

        $row = Database::one(
            'SELECT id, username, email FROM admin_users WHERE id = :id LIMIT 1',
            ['id' => $userId]
        );

        if ($row === null) {
            // Account deleted mid-session.
            self::logout();
            return null;
        }

        return [
            'id'       => (int) $row['id'],
            'username' => (string) $row['username'],
            'email'    => $row['email'] !== null ? (string) $row['email'] : null,
        ];
    }

    /**
     * Gate for every state-changing endpoint. Angular route guards only affect
     * navigation; this is the actual authorization boundary.
     */
    public static function requireAdmin(): array
    {
        $user = self::currentUser();
        if ($user === null) {
            Response::unauthorized();
        }

        return $user;
    }

    /** Verifies the CSRF header for unsafe methods. Call after requireAdmin(). */
    public static function requireCsrf(Request $request): void
    {
        if (in_array($request->method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }

        $sent = $request->header('X-CSRF-Token') ?? (string) $request->input('csrf_token', '');
        $expected = self::csrfToken();

        if (!is_string($sent) || $sent === '' || !hash_equals($expected, $sent)) {
            Response::error(403, 'csrf_failed', 'Your session expired. Refresh the page and try again.');
        }
    }

    /**
     * @return array{ok:bool,user?:array,message?:string}
     */
    public static function attemptLogin(string $username, string $password, string $ip): array
    {
        self::startSession();

        if (self::isRateLimited($username, $ip)) {
            return [
                'ok' => false,
                'message' => 'Too many failed sign-in attempts. Please wait a few minutes and try again.',
            ];
        }

        $row = Database::one(
            'SELECT id, username, email, password_hash FROM admin_users WHERE username = :username LIMIT 1',
            ['username' => $username]
        );

        // Always run a hash comparison so a missing user and a wrong password
        // take a similar amount of time (no user-enumeration timing signal).
        $hash = is_array($row) ? (string) $row['password_hash'] : '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
        $passwordOk = password_verify($password, $hash);

        if (!is_array($row) || !$passwordOk) {
            self::recordAttempt($username, $ip, false);
            return ['ok' => false, 'message' => 'Incorrect username or password.'];
        }

        // Re-hash if the cost factor has since been raised.
        if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
            Database::run(
                'UPDATE admin_users SET password_hash = :hash WHERE id = :id',
                ['hash' => password_hash($password, PASSWORD_DEFAULT), 'id' => (int) $row['id']]
            );
        }

        self::recordAttempt($username, $ip, true);

        // New session id on privilege change, to defeat session fixation.
        session_regenerate_id(true);
        $_SESSION['admin_user_id'] = (int) $row['id'];
        $_SESSION['last_seen'] = time();
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        Database::run('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id', ['id' => (int) $row['id']]);

        return [
            'ok' => true,
            'user' => [
                'id'       => (int) $row['id'],
                'username' => (string) $row['username'],
                'email'    => $row['email'] !== null ? (string) $row['email'] : null,
            ],
        ];
    }

    public static function logout(): void
    {
        self::startSession();

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires'  => time() - 42000,
                'path'     => $params['path'],
                'domain'   => $params['domain'],
                'secure'   => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => 'Lax',
            ]);
        }

        session_destroy();
        self::$started = false;
    }

    private static function isRateLimited(string $username, string $ip): bool
    {
        $max = (int) Config::get('rate_limit.max_attempts', 8);
        $window = (int) Config::get('rate_limit.window', 900);
        $since = date('Y-m-d H:i:s', time() - $window);

        $row = Database::one(
            'SELECT COUNT(*) AS failures
               FROM login_attempts
              WHERE success = 0
                AND attempted_at >= :since
                AND (ip_address = :ip OR username = :username)',
            ['since' => $since, 'ip' => $ip, 'username' => $username]
        );

        return $row !== null && (int) $row['failures'] >= $max;
    }

    private static function recordAttempt(string $username, string $ip, bool $success): void
    {
        Database::run(
            'INSERT INTO login_attempts (username, ip_address, success, attempted_at)
             VALUES (:username, :ip, :success, NOW())',
            [
                'username' => mb_substr($username, 0, 190),
                'ip'       => mb_substr($ip, 0, 45),
                'success'  => $success ? 1 : 0,
            ]
        );

        // A successful sign-in clears that identity's failure history.
        if ($success) {
            Database::run(
                'DELETE FROM login_attempts WHERE success = 0 AND (username = :username OR ip_address = :ip)',
                ['username' => $username, 'ip' => $ip]
            );
        }

        // Opportunistic cleanup so the table cannot grow without bound.
        Database::run('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 30 DAY)');
    }
}
