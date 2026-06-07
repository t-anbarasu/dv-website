<?php
/**
 * Environment Configuration (Sample)
 * Copy this file to env.php and fill in your actual credentials.
 * NEVER commit the real env.php to Git.
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Razorpay Keys
define('RAZORPAY_KEY_SECRET', 'your_razorpay_key_secret_here');

// Admin Panel
define('ADMIN_USER', 'admin');
// Generate a hash using: php -r "echo password_hash('password', PASSWORD_BCRYPT);"
define('ADMIN_PASS_HASH', '$2y$10$PLACEHOLDER_HASH');
