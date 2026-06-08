<?php
/**
 * Drishta Vidya LLP — Database & API Configuration
 * !! This file is blocked from direct browser access via .htaccess !!
 * Fill in your Hostinger MySQL credentials from cPanel > Databases.
 */
// Load environment configuration safely
$localEnvPath = __DIR__ . '/../env.php'; // Standard local path
$secureEnvPath = __DIR__ . '/../../env.php'; // Secure Hostinger path (outside public_html)

if (@file_exists($secureEnvPath)) {
    require_once $secureEnvPath;
} elseif (@file_exists($localEnvPath)) {
    require_once $localEnvPath;
} else {
    // Fail securely if env.php is missing (prevents revealing errors)
    header('HTTP/1.1 500 Internal Server Error');
    exit('Environment configuration missing.');
}

/**
 * Returns a shared PDO connection (singleton).
 */
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
