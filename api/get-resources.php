<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    $resources = $db->query("SELECT * FROM resources ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

    $grouped = [
        'books' => [],
        'apps' => [],
        'newsletters' => []
    ];

    foreach ($resources as $res) {
        if (isset($grouped[$res['category']])) {
            $grouped[$res['category']][] = $res;
        }
    }

    echo json_encode(['success' => true, 'data' => $grouped]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
