<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $now = date('Y-m-d H:i:s');
    $pdo = getDB();
    
    // Fetch the active special event that is currently within the date range
    $stmt = $pdo->prepare("SELECT title, description, icon, badge_text, link_url, is_default 
                           FROM special_events 
                           WHERE is_active = 1 
                             AND start_date <= ? 
                             AND end_date >= ? 
                           ORDER BY created_at DESC 
                           LIMIT 1");
    $stmt->execute([$now, $now]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($event) {
        echo json_encode(['success' => true, 'event' => $event]);
    } else {
        // Return default event if no special event is active
        $stmtDefault = $pdo->prepare("SELECT title, description, icon, badge_text, link_url, is_default 
                                      FROM special_events 
                                      WHERE is_default = 1 
                                      LIMIT 1");
        $stmtDefault->execute();
        $defaultEvent = $stmtDefault->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'event' => $defaultEvent ? $defaultEvent : null
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
