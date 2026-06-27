<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

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

$promoCode = trim($body['promo_code'] ?? '');
$baseAmount = (int) ($body['base_amount'] ?? 0);

if (empty($promoCode)) {
    echo json_encode(['success' => false, 'error' => 'Promo code is required']);
    exit;
}

try {
    $stmt = getDB()->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1");
    $stmt->execute([$promoCode]);
    $promo = $stmt->fetch();

    if (!$promo) {
        echo json_encode(['success' => false, 'error' => 'Invalid promo code']);
        exit;
    }

    if ($promo['valid_until'] && strtotime($promo['valid_until']) < time()) {
        echo json_encode(['success' => false, 'error' => 'Promo code has expired']);
        exit;
    }

    if ($promo['usage_limit'] !== null && $promo['times_used'] >= $promo['usage_limit']) {
        echo json_encode(['success' => false, 'error' => 'Promo code usage limit reached']);
        exit;
    }

    $discountValue = (float)$promo['discount_value'];
    $discountAmount = 0;

    if ($promo['discount_type'] === 'percentage') {
        $discountAmount = ($baseAmount * $discountValue) / 100;
    } else {
        $discountAmount = $discountValue;
    }

    // Ensure discount doesn't exceed base amount
    $discountAmount = min($baseAmount, $discountAmount);
    // Round down or up? Usually nearest integer or ceil
    $discountAmount = round($discountAmount);

    $amountAfterDiscount = $baseAmount - $discountAmount;
    $taxAmount = round($amountAfterDiscount * 0.18);
    $finalAmount = $amountAfterDiscount + $taxAmount;

    echo json_encode([
        'success' => true,
        'discount_amount' => $discountAmount,
        'tax_amount' => $taxAmount,
        'final_amount' => $finalAmount,
        'base_amount' => $baseAmount
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
