<?php
/**
 * POST /api/razorpay-webhook.php
 * Razorpay Webhook endpoint — verifies payment signature and updates
 * registration payment_status to 'completed'.
 *
 * Setup in Razorpay Dashboard > Settings > Webhooks:
 *   URL: https://yourdomain.com/api/razorpay-webhook.php
 *   Events: payment.captured
 *   Secret: (set a webhook secret and add it to config.php as RAZORPAY_WEBHOOK_SECRET)
 *
 * Phase 4 — enable once live Razorpay key is configured.
 */
require_once __DIR__ . '/config.php';

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

$rawBody   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

// Verify webhook signature
// Add RAZORPAY_WEBHOOK_SECRET to config.php (separate from key secret)
$webhookSecret = defined('RAZORPAY_WEBHOOK_SECRET') ? RAZORPAY_WEBHOOK_SECRET : '';
if ($webhookSecret && $signature) {
    $expectedSig = hash_hmac('sha256', $rawBody, $webhookSecret);
    if (!hash_equals($expectedSig, $signature)) {
        http_response_code(400);
        exit('Invalid signature');
    }
}

$event = json_decode($rawBody, true);
if (!$event) {
    http_response_code(400);
    exit('Invalid JSON');
}

$eventType = $event['event'] ?? '';

if ($eventType === 'payment.captured') {
    $payment   = $event['payload']['payment']['entity'] ?? [];
    $paymentId = $payment['id'] ?? '';

    if ($paymentId) {
        try {
            $stmt = getDB()->prepare("
                UPDATE registrations
                SET payment_status = 'completed'
                WHERE razorpay_payment_id = ?
                  AND payment_status = 'pending'
            ");
            $stmt->execute([$paymentId]);
            
            // If the status was successfully updated from pending to completed
            if ($stmt->rowCount() > 0) {
                // Fetch details to send email and update promo
                $stmtDetails = getDB()->prepare("
                    SELECT reg.email, reg.first_name, reg.last_name, reg.promo_code,
                           p.title, r.date_display, r.venue
                    FROM registrations reg
                    JOIN program_runs r ON reg.run_id = r.id
                    JOIN programs p ON reg.program_id = p.id
                    WHERE reg.razorpay_payment_id = ?
                ");
                $stmtDetails->execute([$paymentId]);
                $details = $stmtDetails->fetch();
                
                if ($details) {
                    if (!empty($details['promo_code'])) {
                        $stmtPromo = getDB()->prepare("UPDATE promo_codes SET times_used = times_used + 1 WHERE code = ?");
                        $stmtPromo->execute([$details['promo_code']]);
                    }

                    require_once __DIR__ . '/send-email.php';
                    $fullName = trim($details['first_name'] . ' ' . $details['last_name']);
                    sendWelcomeEmail(
                        $details['email'], 
                        $fullName, 
                        $details['title'], 
                        $details['date_display'], 
                        $details['venue']
                    );
                }
            }
        } catch (PDOException $e) {
            http_response_code(500);
            exit('DB error');
        }
    }
}

http_response_code(200);
echo 'OK';
