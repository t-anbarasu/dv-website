<?php
/**
 * POST /api/register.php
 * Saves a registration to the database.
 * Returns JSON: { success: true, id: "uuid" }
 *           or: { success: false, error: "message" }
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON body']);
    exit;
}

// ─── Honeypot check ──────────────────────────────────────────
if (!empty($body['website'])) {
    // Silently accept — it's a bot
    echo json_encode(['success' => true]);
    exit;
}

// ─── Required field validation ───────────────────────────────
$required = ['run_id', 'program_id', 'first_name', 'last_name', 'email', 'phone'];
foreach ($required as $field) {
    if (empty(trim((string)($body[$field] ?? '')))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

// ─── Generate UUID ───────────────────────────────────────────
$uuid = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

// ─── Sanitise inputs ─────────────────────────────────────────
$runId          = substr(trim($body['run_id']), 0, 30);
$programId      = (int) $body['program_id'];
$firstName      = substr(trim($body['first_name']), 0, 100);
$lastName       = substr(trim($body['last_name']), 0, 100);
$email          = strtolower(substr(trim($body['email']), 0, 200));
$phone          = substr(preg_replace('/[^\d+\s\-]/', '', $body['phone']), 0, 20);
$organization   = !empty($body['organization'])  ? substr(trim($body['organization']), 0, 200)  : null;
$designation    = !empty($body['designation'])   ? substr(trim($body['designation']), 0, 200)   : null;
$paymentMethod  = in_array($body['payment_method'] ?? '', ['razorpay','upi','bank_transfer','enquiry','free'])
                    ? $body['payment_method'] : 'razorpay';
$paymentStatus  = in_array($body['payment_status'] ?? '', ['pending','completed','failed','refunded'])
                    ? $body['payment_status'] : 'pending';
$razorpayId     = !empty($body['razorpay_payment_id']) ? substr(trim($body['razorpay_payment_id']), 0, 100) : null;
$amountInr      = isset($body['amount_paid_inr']) ? (int) $body['amount_paid_inr'] : null;

// ─── Insert ──────────────────────────────────────────────────
try {
    $stmt = getDB()->prepare("
        INSERT INTO registrations
            (id, run_id, program_id, first_name, last_name, email, phone,
             organization, designation, payment_method, payment_status,
             razorpay_payment_id, amount_paid_inr)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $uuid, $runId, $programId,
        $firstName, $lastName, $email, $phone,
        $organization, $designation,
        $paymentMethod, $paymentStatus,
        $razorpayId, $amountInr
    ]);

    echo json_encode(['success' => true, 'id' => $uuid]);

} catch (PDOException $e) {
    if ($e->errorInfo[1] === 1062) {
        // Duplicate (email + run_id) — treat as success (idempotent)
        echo json_encode(['success' => true, 'duplicate' => true]);
    } elseif ($e->errorInfo[1] === 1452) {
        // FK constraint — invalid run_id or program_id
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid program or event']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Registration could not be saved']);
    }
}
