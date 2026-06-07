<?php
/**
 * GET /api/get-runs.php
 * Returns upcoming published program runs as JSON.
 * Used by the homepage ticker and registration modal.
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

try {
    $stmt = getDB()->prepare("
        SELECT
            r.id,
            r.date_display,
            r.location,
            r.venue,
            r.mode,
            r.seats_remaining,
            r.run_date_start,
            p.id          AS program_id,
            p.title       AS program,
            p.price_amount,
            p.price_label,
            p.price_note,
            p.program_family
        FROM program_runs r
        JOIN programs p ON p.id = r.program_id
        WHERE r.is_published = 1
          AND r.run_date_start >= CURDATE()
          AND p.is_active = 1
        ORDER BY r.run_date_start ASC
    ");
    $stmt->execute();
    $runs = $stmt->fetchAll();

    // Cast integer fields
    foreach ($runs as &$run) {
        $run['program_id']    = (int) $run['program_id'];
        $run['price_amount']  = (int) $run['price_amount'];
        $run['seats_remaining'] = (int) $run['seats_remaining'];
    }
    unset($run);

    echo json_encode($runs, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to load programs']);
}
