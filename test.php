<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/api/config.php';
echo "API Config loaded successfully.\n";
echo "DB_HOST: " . DB_HOST . "\n";
