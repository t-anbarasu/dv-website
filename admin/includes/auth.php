<?php
/**
 * Include this at the top of every protected admin page.
 * Redirects to login if the session is not valid.
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config.php';

$loggedIn  = !empty($_SESSION['admin_logged_in']);
$lastActive = $_SESSION['admin_last_active'] ?? 0;
$timedOut  = (time() - $lastActive) > SESSION_TIMEOUT;

if (!$loggedIn || $timedOut) {
    session_unset();
    session_destroy();
    header('Location: index.php?timeout=1');
    exit;
}

$_SESSION['admin_last_active'] = time();
