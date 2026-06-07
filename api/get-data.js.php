<?php
/**
 * Dynamic Data Endpoint
 * Connects to the database and outputs Javascript arrays for courses and upcoming programs.
 * This replaces the static js/courses-data.js and js/upcoming-data.js files.
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

$db = getDB();

// 1. Fetch active programs
$programsStmt = $db->query("SELECT * FROM programs WHERE is_active = 1 ORDER BY id");
$programs = $programsStmt->fetchAll();

$coursesData = [];
foreach ($programs as $row) {
    $coursesData[] = [
        'id'           => (int)$row['id'],
        'title'        => $row['title'],
        'program'      => $row['program_family'],
        'audience'     => $row['audience'],
        'description  '=> $row['description'], // Wait, typo check: let's build it safely.
    ];
}

// Re-building the array properly to match the JS structure
$coursesData = [];
foreach ($programs as $row) {
    $tags = json_decode($row['tags'] ?? '[]');
    if (!is_array($tags)) $tags = [];

    $coursesData[] = [
        'id'           => (int)$row['id'],
        'title'        => $row['title'],
        'program'      => $row['program_family'],
        'audience'     => $row['audience'],
        'description'  => $row['description'],
        'duration'     => $row['duration_label'],
        'durationDays' => (int)$row['duration_days'],
        'followUp'     => $row['follow_up'],
        'participants' => $row['participants'],
        'icon'         => $row['icon'],
        'featured'     => (bool)$row['featured'],
        'tags'         => $tags,
        'price'        => (int)$row['price_amount'],
        'priceLabel'   => $row['price_label'],
        'priceNote'    => $row['price_note'],
        'paymentLink'  => $row['payment_link'],
        'upiId'        => $row['upi_id']
    ];
}

// 2. Fetch published program runs
$runsStmt = $db->query("
    SELECT pr.*, p.title AS program_title
    FROM program_runs pr
    JOIN programs p ON p.id = pr.program_id
    WHERE pr.is_published = 1 AND pr.run_date_start >= CURDATE()
    ORDER BY pr.run_date_start ASC
");
$runs = $runsStmt->fetchAll();

$upcomingPrograms = [];
foreach ($runs as $row) {
    $upcomingPrograms[] = [
        'id'       => $row['id'],
        'program'  => $row['program_title'],
        'courseId' => (int)$row['program_id'],
        'date'     => $row['date_display'],
        'location' => $row['location'],
        'venue'    => $row['venue'],
        'mode'     => $row['mode'],
        'seats'    => (int)$row['seats_remaining']
    ];
}

// 3. Output as Javascript
echo "/** Auto-generated from database */\n\n";
echo "const coursesData = " . json_encode($coursesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n\n";
echo "const upcomingPrograms = " . json_encode($upcomingPrograms, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n";
