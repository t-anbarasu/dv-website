<?php
/**
 * Admin Panel Credentials
 * Change password: php -r "echo password_hash('your-new-password', PASSWORD_BCRYPT);"
 * Then replace ADMIN_PASS_HASH below with the output.
 */
// Load environment configuration safely if not already loaded
$localEnvPath = __DIR__ . '/../../env.php'; // Standard local path
$secureEnvPath = __DIR__ . '/../../../env.php'; // Secure Hostinger path (outside public_html)

if (!defined('ADMIN_USER')) {
    if (@file_exists($secureEnvPath)) {
        require_once $secureEnvPath;
    } elseif (@file_exists($localEnvPath)) {
        require_once $localEnvPath;
    }
}
if (!defined('ADMIN_USER')) {
    define('ADMIN_USER', 'admin');
    define('ADMIN_PASS_HASH', '');
}
// Session timeout in seconds (8 hours)
define('SESSION_TIMEOUT', 28800);
