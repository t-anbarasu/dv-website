<?php
/**
 * Drishta Vidya LLP — Contact & Program Enquiry API Endpoint
 * Receives enquiries from contact.html and dispatches notification to namaste@drishtavidya.com
 */
header('Content-Type: application/json; charset=utf-8');

// Enable CORS for same origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    $body = $_POST;
}

$firstName = trim($body['first_name'] ?? '');
$lastName  = trim($body['last_name'] ?? '');
$email     = trim($body['email'] ?? '');
$phone     = trim($body['phone'] ?? '');
$org       = trim($body['organization'] ?? '');
$program   = trim($body['course_interest'] ?? '');
$teamSize  = trim($body['team_size'] ?? '');
$message   = trim($body['message'] ?? '');

// Basic validation
if (empty($firstName) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode([
        'success' => false,
        'error' => 'Please provide a valid first name and email address.'
    ]));
}

$formData = [
    'first_name'      => $firstName,
    'last_name'       => $lastName,
    'email'           => $email,
    'phone'           => $phone,
    'organization'    => $org,
    'course_interest' => $program,
    'team_size'       => $teamSize,
    'message'         => $message,
];

// Try sending email via PHPMailer / Zoho SMTP
$emailSent = false;
try {
    require_once __DIR__ . '/send-email.php';
    if (function_exists('sendEnquiryNotification')) {
        $emailSent = sendEnquiryNotification($formData);
    }
} catch (Throwable $e) {
    error_log("Error in api/contact.php sending email: " . $e->getMessage());
}

// Return clean response
echo json_encode([
    'success'    => true,
    'email_sent' => $emailSent,
    'recipient'  => 'namaste@drishtavidya.com'
]);
