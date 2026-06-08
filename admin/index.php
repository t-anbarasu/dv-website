<?php
/**
 * Admin Login Page — Drishta Vidya LLP
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/includes/config.php';

// Already logged in?
if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: dashboard.php');
    exit;
}

$error   = '';
$timeout = !empty($_GET['timeout']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = $_POST['password'] ?? '';

    if ($user === ADMIN_USER && password_verify($pass, ADMIN_PASS_HASH)) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in']  = true;
        $_SESSION['admin_last_active'] = time();
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login — Drishta Vidya</title>
<link rel="icon" href="../assets/images/dv-favicon.ico" type="image/x-icon" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0d2137;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login-card {
    background: #fff;
    border-radius: 12px;
    padding: 48px 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0,0,0,.35);
  }
  .login-logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .login-logo img { height: 58px; }
  .login-title {
    font-size: 20px;
    font-weight: 700;
    color: #0d2137;
    text-align: center;
    margin-bottom: 6px;
  }
  .login-subtitle {
    font-size: 13px;
    color: #6b7280;
    text-align: center;
    margin-bottom: 32px;
  }
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  input[type=text], input[type=password] {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: border-color .2s;
    margin-bottom: 18px;
  }
  input:focus { border-color: #0d2137; }
  .btn-login {
    width: 100%;
    padding: 12px;
    background: #c8960c;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s;
  }
  .btn-login:hover { background: #a87a09; }
  .error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 18px;
  }
  .timeout {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 18px;
  }
</style>
</head>
<body>
<div class="login-card">
  <div class="login-logo">
    <img src="../assets/images/dv-logo-header.png" alt="Drishta Vidya">
  </div>
  <div class="login-title">Admin Panel</div>
  <div class="login-subtitle">Sign in to manage registrations & events</div>

  <?php if ($timeout): ?>
    <div class="timeout">Session timed out. Please sign in again.</div>
  <?php endif; ?>
  <?php if ($error): ?>
    <div class="error"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form method="post">
    <label for="username">Username</label>
    <input type="text" id="username" name="username" autocomplete="username"
           value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
    <label for="password">Password</label>
    <input type="password" id="password" name="password" autocomplete="current-password">
    <button type="submit" class="btn-login">Sign In →</button>
  </form>
</div>
</body>
</html>
