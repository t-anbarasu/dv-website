<?php
/**
 * Admin Panel Credentials
 * Change password: php -r "echo password_hash('your-new-password', PASSWORD_BCRYPT);"
 * Then replace ADMIN_PASS_HASH below with the output.
 */
// Load environment configuration safely if not already loaded
$envPath = __DIR__ . '/../../env.php';
if (!defined('ADMIN_USER') && file_exists($envPath)) {
    require_once $envPath;
}
if (!defined('ADMIN_USER')) {
    define('ADMIN_USER', 'admin');
    define('ADMIN_PASS_HASH', '');
}
// Session timeout in seconds (8 hours)
define('SESSION_TIMEOUT', 28800);
