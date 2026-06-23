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

// Zoho Mail SMTP configuration
define('ZOHO_SMTP_HOST', 'smtp.zoho.in'); // Use smtp.zoho.com if registered on US DC
define('ZOHO_SMTP_USER', 'your_zoho_email@drishtavidya.com');
define('ZOHO_SMTP_PASS', 'your_zoho_app_password'); // Use App Password, not account password
define('ZOHO_SMTP_PORT', 465); // 465 for SMTPS, 587 for STARTTLS

// Admin Panel
define('ADMIN_USER', 'admin');
// Generate a hash using: php -r "echo password_hash('password', PASSWORD_BCRYPT);"
define('ADMIN_PASS_HASH', '$2y$10$PLACEHOLDER_HASH');
