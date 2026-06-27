<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';

$db  = getDB();
$tab = $_GET['tab'] ?? 'overview';

/* ── Handle POST actions ─────────────────────────────────── */

// Mark registration as paid (UPI / bank transfer)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'mark_paid') {
    $id = trim($_POST['reg_id'] ?? '');
    if ($id) {
        $db->prepare("UPDATE registrations SET payment_status='completed', payment_method=COALESCE(payment_method,'bank_transfer') WHERE id=?")
           ->execute([$id]);
    }
    header('Location: dashboard.php?tab=registrations&saved=1');
    exit;
}

// Toggle event published status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'toggle_run') {
    $id = trim($_POST['run_id'] ?? '');
    if ($id) {
        $db->prepare("UPDATE program_runs SET is_published = 1 - is_published WHERE id=?")
           ->execute([$id]);
    }
    header('Location: dashboard.php?tab=events&saved=1');
    exit;
}

// Add new program run
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'add_run') {
    $pid    = (int)($_POST['program_id'] ?? 0);
    $sid    = trim($_POST['run_date_start'] ?? '');
    $eid    = trim($_POST['run_date_end'] ?? '') ?: null;
    $disp   = trim($_POST['date_display'] ?? '');
    $loc    = trim($_POST['location'] ?? '');
    $venue  = trim($_POST['venue'] ?? '');
    $mode   = $_POST['mode'] ?? 'In-Person';
    $seats  = (int)($_POST['seats_total'] ?? 30);
    $pub    = isset($_POST['is_published']) ? 1 : 0;

    // Auto-generate run ID: first 3 letters of location + month abbrev + year + seq
    $mo  = $sid ? strtoupper(date('MY', strtotime($sid))) : date('MY');
    $loc3 = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $loc), 0, 3));
    $base = "RUN-{$mo}-{$loc3}";
    $cnt  = (int)$db->query("SELECT COUNT(*) FROM program_runs WHERE id LIKE " . $db->quote($base . '%'))->fetchColumn();
    $runId = $base . ($cnt > 0 ? '-' . ($cnt + 1) : '');

    try {
        $db->prepare("
            INSERT INTO program_runs (id, program_id, run_date_start, run_date_end, date_display,
              location, venue, mode, seats_total, seats_remaining, is_published)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        ")->execute([$runId, $pid, $sid, $eid, $disp, $loc, $venue, $mode, $seats, $seats, $pub]);
        header('Location: dashboard.php?tab=events&saved=1');
    } catch (PDOException $e) {
        header('Location: dashboard.php?tab=events&err=1');
    }
    exit;
}

// Delete run (only if no registrations)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_run') {
    $id  = trim($_POST['run_id'] ?? '');
    $cnt = (int)$db->prepare("SELECT COUNT(*) FROM registrations WHERE run_id=?")->execute([$id]) ? 0 : 0;
    $s   = $db->prepare("SELECT COUNT(*) FROM registrations WHERE run_id=?");
    $s->execute([$id]);
    $cnt = (int)$s->fetchColumn();
    if ($cnt === 0) {
        $db->prepare("DELETE FROM program_runs WHERE id=?")->execute([$id]);
    }
    header('Location: dashboard.php?tab=events' . ($cnt > 0 ? '&err=has_registrations' : '&saved=1'));
    exit;
}

// Add/Edit program
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_program') {
    $id             = (int)($_POST['program_id'] ?? 0);
    $title          = trim($_POST['title'] ?? '');
    $family         = trim($_POST['program_family'] ?? '');
    $audience       = trim($_POST['audience'] ?? '');
    $description    = trim($_POST['description'] ?? '');
    $duration_label = trim($_POST['duration_label'] ?? '');
    $duration_days  = (int)($_POST['duration_days'] ?? 0);
    $follow_up      = trim($_POST['follow_up'] ?? '');
    $participants   = trim($_POST['participants'] ?? '');
    $icon           = trim($_POST['icon'] ?? '⭐');
    $featured       = isset($_POST['featured']) ? 1 : 0;
    $is_active      = isset($_POST['is_active']) ? 1 : 0;
    $tags           = json_encode(array_map('trim', explode(',', $_POST['tags'] ?? '')));
    $price_amount   = (int)($_POST['price_amount'] ?? 0);
    $price_label    = trim($_POST['price_label'] ?? '');
    $price_note     = trim($_POST['price_note'] ?? '');
    $upi_id         = trim($_POST['upi_id'] ?? '');

    try {
        if ($id > 0) {
            // Edit
            $db->prepare("UPDATE programs SET title=?, program_family=?, audience=?, description=?, duration_label=?, duration_days=?, follow_up=?, participants=?, icon=?, featured=?, is_active=?, tags=?, price_amount=?, price_label=?, price_note=?, upi_id=? WHERE id=?")->execute([$title, $family, $audience, $description, $duration_label, $duration_days, $follow_up, $participants, $icon, $featured, $is_active, $tags, $price_amount, $price_label, $price_note, $upi_id, $id]);
        } else {
            // Add
            $maxId = (int)$db->query("SELECT MAX(id) FROM programs")->fetchColumn();
            $id = $maxId + 1;
            $db->prepare("INSERT INTO programs (id, title, program_family, audience, description, duration_label, duration_days, follow_up, participants, icon, featured, is_active, tags, price_amount, price_label, price_note, upi_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")->execute([$id, $title, $family, $audience, $description, $duration_label, $duration_days, $follow_up, $participants, $icon, $featured, $is_active, $tags, $price_amount, $price_label, $price_note, $upi_id]);
        }
        header('Location: dashboard.php?tab=courses&saved=1');
    } catch (PDOException $e) {
        header('Location: dashboard.php?tab=courses&err=1');
    }
    exit;
}

// Toggle program status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'toggle_program') {
    $id = (int)($_POST['program_id'] ?? 0);
    if ($id) {
        $db->prepare("UPDATE programs SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
    }
    header('Location: dashboard.php?tab=courses&saved=1');
    exit;
}

// Add/Edit resource
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_resource') {
    $id = (int)($_POST['resource_id'] ?? 0);
    $category = trim($_POST['category'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $link = trim($_POST['link'] ?? '');
    
    // Handle image upload
    $image_path = trim($_POST['existing_image'] ?? '');
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../assets/images/resources/';
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $filename = uniqid('res_') . '.' . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
            $image_path = 'assets/images/resources/' . $filename;
        }
    }

    try {
        if ($id > 0) {
            $db->prepare("UPDATE resources SET category=?, title=?, description=?, link=?, image_path=? WHERE id=?")
               ->execute([$category, $title, $description, $link, $image_path, $id]);
        } else {
            $db->prepare("INSERT INTO resources (category, title, description, link, image_path) VALUES (?,?,?,?,?)")
               ->execute([$category, $title, $description, $link, $image_path]);
        }
        header('Location: dashboard.php?tab=resources&saved=1');
    } catch (PDOException $e) {
        header('Location: dashboard.php?tab=resources&err=1');
    }
    exit;
}

// Delete resource
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_resource') {
    $id = (int)($_POST['resource_id'] ?? 0);
    if ($id) {
        $db->prepare("DELETE FROM resources WHERE id=?")->execute([$id]);
    }
    header('Location: dashboard.php?tab=resources&saved=1');
    exit;
}

// CSV Export
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    $filterRun  = $_GET['run_id'] ?? '';
    $filterStat = $_GET['status'] ?? '';
    $sql = "
        SELECT r.registered_at, r.first_name, r.last_name, r.email, r.phone,
               r.organization, r.designation, pr.title AS program, pu.date_display,
               pu.location, r.payment_method, r.payment_status,
               r.amount_paid_inr, r.razorpay_payment_id
        FROM registrations r
        JOIN program_runs pu ON pu.id = r.run_id
        JOIN programs pr ON pr.id = r.program_id
        WHERE 1=1
    ";
    $params = [];
    if ($filterRun)  { $sql .= " AND r.run_id=?";           $params[] = $filterRun; }
    if ($filterStat) { $sql .= " AND r.payment_status=?";   $params[] = $filterStat; }
    $sql .= " ORDER BY r.registered_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="registrations-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Date','First Name','Last Name','Email','Phone','Organization','Designation',
                   'Program','Event Date','Location','Payment Method','Payment Status','Amount (INR)','Razorpay ID']);
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['registered_at'], $r['first_name'], $r['last_name'], $r['email'], $r['phone'],
            $r['organization'], $r['designation'], $r['program'], $r['date_display'],
            $r['location'], $r['payment_method'], $r['payment_status'],
            $r['amount_paid_inr'], $r['razorpay_payment_id']
        ]);
    }
    fclose($out);
    exit;
}

/* ── Fetch data for current tab ──────────────────────────────── */

// Overview stats
$totalRegs     = (int)$db->query("SELECT COUNT(*) FROM registrations")->fetchColumn();
$monthRegs     = (int)$db->query("SELECT COUNT(*) FROM registrations WHERE MONTH(registered_at)=MONTH(NOW()) AND YEAR(registered_at)=YEAR(NOW())")->fetchColumn();
$upcomingCount = (int)$db->query("SELECT COUNT(*) FROM program_runs WHERE is_published=1 AND run_date_start >= CURDATE()")->fetchColumn();
$monthRevenue  = (int)$db->query("SELECT COALESCE(SUM(amount_paid_inr),0) FROM registrations WHERE payment_status='completed' AND MONTH(registered_at)=MONTH(NOW()) AND YEAR(registered_at)=YEAR(NOW())")->fetchColumn();

// Registrations tab
$filterRun  = trim($_GET['run_id'] ?? '');
$filterStat = trim($_GET['status'] ?? '');
$search     = trim($_GET['q'] ?? '');
$regSql = "
    SELECT r.*, pr.title AS program_title, pu.date_display, pu.location
    FROM registrations r
    JOIN program_runs pu ON pu.id = r.run_id
    JOIN programs pr ON pr.id = r.program_id
    WHERE 1=1
";
$regParams = [];
if ($filterRun)  { $regSql .= " AND r.run_id=?";                                   $regParams[] = $filterRun; }
if ($filterStat) { $regSql .= " AND r.payment_status=?";                            $regParams[] = $filterStat; }
if ($search)     { $regSql .= " AND (r.first_name LIKE ? OR r.last_name LIKE ? OR r.email LIKE ?)"; $s="%$search%"; $regParams=array_merge($regParams,[$s,$s,$s]); }
$regSql .= " ORDER BY r.registered_at DESC LIMIT 200";
$regStmt = $db->prepare($regSql);
$regStmt->execute($regParams);
$registrations = $regStmt->fetchAll();

// Events tab
$allRuns = $db->query("
    SELECT pr.*, p.title AS program_title
    FROM program_runs pr
    JOIN programs p ON p.id = pr.program_id
    ORDER BY pr.run_date_start DESC
")->fetchAll();

// Programs (courses) list
$allPrograms = $db->query("SELECT id, title, program_family, price_label, is_active FROM programs ORDER BY id")->fetchAll();

// All runs dropdown for filter
$allRunsDropdown = $db->query("SELECT id, date_display, location, program_id FROM program_runs ORDER BY run_date_start DESC")->fetchAll();


// Save promo code
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_promo') {
    $id             = (int)($_POST['promo_id'] ?? 0);
    $code           = strtoupper(trim($_POST['code'] ?? ''));
    $discount_type  = $_POST['discount_type'] === 'flat' ? 'flat' : 'percentage';
    $discount_value = (float)($_POST['discount_value'] ?? 0);
    $valid_until    = trim($_POST['valid_until'] ?? '') ?: null;
    $usage_limit    = (int)($_POST['usage_limit'] ?? 0) ?: null;
    $is_active      = isset($_POST['is_active']) ? 1 : 0;

    try {
        if ($id > 0) {
            $db->prepare("UPDATE promo_codes SET code=?, discount_type=?, discount_value=?, valid_until=?, usage_limit=?, is_active=? WHERE id=?")
               ->execute([$code, $discount_type, $discount_value, $valid_until, $usage_limit, $is_active, $id]);
        } else {
            $db->prepare("INSERT INTO promo_codes (code, discount_type, discount_value, valid_until, usage_limit, is_active) VALUES (?,?,?,?,?,?)")
               ->execute([$code, $discount_type, $discount_value, $valid_until, $usage_limit, $is_active]);
        }
        header('Location: dashboard.php?tab=promos&saved=1');
    } catch (PDOException $e) {
        header('Location: dashboard.php?tab=promos&err=1');
    }
    exit;
}

// Delete promo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_promo') {
    $id = (int)($_POST['promo_id'] ?? 0);
    if ($id) {
        $db->prepare("DELETE FROM promo_codes WHERE id=?")->execute([$id]);
    }
    header('Location: dashboard.php?tab=promos&saved=1');
    exit;
}

// Resources tab
$allResources = [];
if ($tab === 'resources') {
    $allResources = $db->query("SELECT * FROM resources ORDER BY id DESC")->fetchAll();
}

// Promos tab
$allPromos = [];
if ($tab === 'promos') {
    $allPromos = $db->query("SELECT * FROM promo_codes ORDER BY id DESC")->fetchAll();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Dashboard — Drishta Vidya</title>
<link rel="icon" href="../assets/images/dv-favicon.ico" type="image/x-icon" />
<style>
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f1f5f9; color:#1e293b; font-size:14px; }

/* ── Sidebar ── */
.sidebar { position:fixed; top:0; left:0; width:220px; height:100vh; background:#0d2137; color:#fff; display:flex; flex-direction:column; z-index:100; }
.sidebar-logo { padding:24px 20px 16px; border-bottom:1px solid rgba(255,255,255,.1); }
.sidebar-logo img { height:48px; filter:brightness(0) invert(1); }
.sidebar-nav { flex:1; padding:16px 0; }
.sidebar-nav a { display:flex; align-items:center; gap:10px; padding:11px 20px; color:rgba(255,255,255,.75); text-decoration:none; font-size:14px; font-weight:500; transition:background .15s,color .15s; }
.sidebar-nav a:hover { background:rgba(255,255,255,.08); color:#fff; }
.sidebar-nav a.active { background:rgba(200,150,12,.18); color:#c8960c; border-left:3px solid #c8960c; }
.sidebar-footer { padding:16px 20px; border-top:1px solid rgba(255,255,255,.1); }
.sidebar-footer a { color:rgba(255,255,255,.5); text-decoration:none; font-size:13px; }
.sidebar-footer a:hover { color:#fff; }

/* ── Main ── */
.main { margin-left:220px; min-height:100vh; padding:32px; }
.page-title { font-size:22px; font-weight:700; color:#0d2137; margin-bottom:24px; }

/* ── Stat cards ── */
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px; }
.stat-card { background:#fff; border-radius:10px; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,.07); }
.stat-label { font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
.stat-value { font-size:28px; font-weight:800; color:#0d2137; }
.stat-sub { font-size:12px; color:#6b7280; margin-top:4px; }

/* ── Table card ── */
.card { background:#fff; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,.07); overflow:hidden; margin-bottom:24px; }
.card-header { padding:16px 20px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
.card-title { font-size:15px; font-weight:700; color:#0d2137; }
table { width:100%; border-collapse:collapse; }
th { background:#f8fafc; font-size:11px; font-weight:700; text-transform:uppercase; color:#6b7280; letter-spacing:.5px; padding:10px 16px; text-align:left; border-bottom:1px solid #e5e7eb; white-space:nowrap; }
td { padding:10px 16px; border-bottom:1px solid #f1f5f9; font-size:13px; vertical-align:middle; }
tr:last-child td { border-bottom:none; }
tr:hover td { background:#f8fafc; }

/* ── Badges ── */
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
.badge-green  { background:#dcfce7; color:#15803d; }
.badge-yellow { background:#fef9c3; color:#92400e; }
.badge-red    { background:#fee2e2; color:#dc2626; }
.badge-gray   { background:#f1f5f9; color:#6b7280; }
.badge-blue   { background:#dbeafe; color:#1e40af; }

/* ── Buttons ── */
.btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; border:none; text-decoration:none; transition:background .15s; }
.btn-gold  { background:#c8960c; color:#fff; } .btn-gold:hover  { background:#a87a09; }
.btn-navy  { background:#0d2137; color:#fff; } .btn-navy:hover  { background:#1a3a5c; }
.btn-gray  { background:#e5e7eb; color:#374151; } .btn-gray:hover  { background:#d1d5db; }
.btn-red   { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; } .btn-red:hover   { background:#fecaca; }
.btn-green { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; } .btn-green:hover { background:#bbf7d0; }
.btn-sm { padding:4px 10px; font-size:12px; }

/* ── Filters bar ── */
.filters { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.filters select, .filters input[type=text] { padding:7px 12px; border:1.5px solid #e5e7eb; border-radius:7px; font-size:13px; background:#fff; outline:none; }
.filters select:focus, .filters input:focus { border-color:#0d2137; }

/* ── Form ── */
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.form-row.single { grid-template-columns:1fr; }
.form-group label { display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px; }
.form-group input, .form-group select, .form-group textarea {
  width:100%; padding:8px 12px; border:1.5px solid #e5e7eb; border-radius:7px; font-size:13px; outline:none; font-family:inherit;
}
.form-group input:focus, .form-group select:focus { border-color:#0d2137; }
.form-group.checkbox { display:flex; align-items:center; gap:8px; }
.form-group.checkbox input { width:auto; }
.form-group.checkbox label { margin:0; font-size:13px; }

/* ── Collapse / expand add-run form ── */
#add-run-panel { display:none; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:20px; }
#add-run-panel.open { display:block; }

/* ── Alert ── */
.alert { padding:10px 16px; border-radius:8px; font-size:13px; margin-bottom:16px; }
.alert-success { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
.alert-error   { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; }

/* ── Mobile ── */
@media (max-width: 900px) {
  .sidebar { width:60px; }
  .sidebar-nav a span { display:none; }
  .sidebar-logo img { height:28px; }
  .main { margin-left:60px; padding:16px; }
  .stats-grid { grid-template-columns:1fr 1fr; }
  .form-row { grid-template-columns:1fr; }
}
@media (max-width: 600px) {
  .stats-grid { grid-template-columns:1fr; }
}
</style>
</head>
<body>

<!-- Sidebar -->
<nav class="sidebar">
  <div class="sidebar-logo">
    <img src="../assets/images/dv-logo-header.png" alt="Drishta Vidya">
  </div>
  <div class="sidebar-nav">
    <a href="?tab=overview"       class="<?= $tab==='overview'       ? 'active' : '' ?>">📊 <span>Overview</span></a>
    <a href="?tab=registrations"  class="<?= $tab==='registrations'  ? 'active' : '' ?>">📋 <span>Registrations</span></a>
    <a href="?tab=events"         class="<?= $tab==='events'         ? 'active' : '' ?>">📅 <span>Events</span></a>
    <a href="?tab=courses"        class="<?= $tab==='courses'        ? 'active' : '' ?>">🎓 <span>Courses</span></a>
    <a href="?tab=resources"      class="<?= $tab==='resources'      ? 'active' : '' ?>">📚 <span>Resources</span></a>
    <a href="?tab=promos"         class="<?= $tab==='promos'         ? 'active' : '' ?>">🎟️ <span>Promo Codes</span></a>
  </div>
  <div class="sidebar-footer">
    <a href="../index.html" target="_blank">↗ View Website</a><br><br>
    <a href="logout.php">⎋ Sign Out</a>
  </div>
</nav>

<!-- Main content -->
<main class="main">

<?php if (!empty($_GET['saved'])): ?>
  <div class="alert alert-success">✅ Changes saved successfully.</div>
<?php endif; ?>
<?php if (!empty($_GET['err']) && $_GET['err'] === 'has_registrations'): ?>
  <div class="alert alert-error">⚠️ Cannot delete this event — it has existing registrations.</div>
<?php elseif (!empty($_GET['err'])): ?>
  <div class="alert alert-error">⚠️ An error occurred. Please try again.</div>
<?php endif; ?>

<!-- ══════════════════════════════════════════════════════════ -->
<?php if ($tab === 'overview'): ?>

<div class="page-title">Overview</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-label">Total Registrations</div>
    <div class="stat-value"><?= $totalRegs ?></div>
    <div class="stat-sub">All time</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">This Month</div>
    <div class="stat-value"><?= $monthRegs ?></div>
    <div class="stat-sub"><?= date('F Y') ?></div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Upcoming Events</div>
    <div class="stat-value"><?= $upcomingCount ?></div>
    <div class="stat-sub">Published & active</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Revenue This Month</div>
    <div class="stat-value">₹<?= number_format($monthRevenue) ?></div>
    <div class="stat-sub">Completed payments</div>
  </div>
</div>

<!-- Recent registrations -->
<?php
$recent = $db->query("
  SELECT r.registered_at, r.first_name, r.last_name, r.email,
         pr.title AS program_title, r.payment_status, r.amount_paid_inr
  FROM registrations r
  JOIN programs pr ON pr.id = r.program_id
  ORDER BY r.registered_at DESC LIMIT 10
")->fetchAll();
?>
<div class="card">
  <div class="card-header">
    <span class="card-title">Recent Registrations</span>
    <a href="?tab=registrations" class="btn btn-gray btn-sm">View All</a>
  </div>
  <table>
    <thead>
      <tr><th>Name</th><th>Email</th><th>Program</th><th>Status</th><th>Amount</th><th>Date</th></tr>
    </thead>
    <tbody>
    <?php foreach ($recent as $r): ?>
      <tr>
        <td><?= htmlspecialchars($r['first_name'] . ' ' . $r['last_name']) ?></td>
        <td><?= htmlspecialchars($r['email']) ?></td>
        <td><?= htmlspecialchars($r['program_title']) ?></td>
        <td><?php
          $cls = match($r['payment_status']) {
            'completed' => 'badge-green', 'pending' => 'badge-yellow',
            'failed' => 'badge-red', default => 'badge-gray'
          };
          echo "<span class='badge $cls'>".htmlspecialchars($r['payment_status'])."</span>";
        ?></td>
        <td><?= $r['amount_paid_inr'] ? '₹'.number_format($r['amount_paid_inr']) : '—' ?></td>
        <td><?= date('d M Y, H:i', strtotime($r['registered_at'])) ?></td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$recent): ?><tr><td colspan="6" style="text-align:center;color:#6b7280;padding:32px">No registrations yet.</td></tr><?php endif; ?>
    </tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════ -->
<?php elseif ($tab === 'registrations'): ?>

<div class="page-title">Registrations</div>

<div class="card" style="margin-bottom:16px">
  <div class="card-header">
    <form method="get" style="display:contents">
      <input type="hidden" name="tab" value="registrations">
      <div class="filters">
        <select name="run_id" onchange="this.form.submit()">
          <option value="">All Events</option>
          <?php foreach ($allRunsDropdown as $run): ?>
            <option value="<?= htmlspecialchars($run['id']) ?>"
              <?= $filterRun === $run['id'] ? 'selected' : '' ?>>
              <?= htmlspecialchars($run['id'] . ' — ' . $run['date_display'] . ', ' . $run['location']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <select name="status" onchange="this.form.submit()">
          <option value="">All Statuses</option>
          <?php foreach (['completed','pending','failed','refunded'] as $s): ?>
            <option value="<?= $s ?>" <?= $filterStat===$s?'selected':'' ?>><?= ucfirst($s) ?></option>
          <?php endforeach; ?>
        </select>
        <input type="text" name="q" placeholder="Search name or email…" value="<?= htmlspecialchars($search) ?>">
        <button class="btn btn-navy btn-sm" type="submit">Filter</button>
        <a href="?tab=registrations" class="btn btn-gray btn-sm">Reset</a>
      </div>
    </form>
    <a href="?export=csv&run_id=<?= urlencode($filterRun) ?>&status=<?= urlencode($filterStat) ?>"
       class="btn btn-gold btn-sm">⬇ Export CSV</a>
  </div>
  <table>
    <thead>
      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Org</th><th>Event</th><th>Date</th><th>Method</th><th>Status</th><th>Amount</th><th>Action</th></tr>
    </thead>
    <tbody>
    <?php foreach ($registrations as $r): ?>
      <tr>
        <td><?= htmlspecialchars($r['first_name'] . ' ' . $r['last_name']) ?></td>
        <td><?= htmlspecialchars($r['email']) ?></td>
        <td><?= htmlspecialchars($r['phone']) ?></td>
        <td><?= htmlspecialchars($r['organization'] ?? '—') ?></td>
        <td style="font-size:12px"><?= htmlspecialchars($r['program_title']) ?><br><span style="color:#6b7280"><?= htmlspecialchars($r['date_display'] . ', ' . $r['location']) ?></span></td>
        <td style="white-space:nowrap"><?= date('d M Y', strtotime($r['registered_at'])) ?></td>
        <td><?= htmlspecialchars($r['payment_method'] ?? '—') ?></td>
        <td><?php
          $cls = match($r['payment_status']) {
            'completed' => 'badge-green', 'pending' => 'badge-yellow',
            'failed' => 'badge-red', default => 'badge-gray'
          };
          echo "<span class='badge $cls'>".htmlspecialchars($r['payment_status'])."</span>";
        ?></td>
        <td><?= $r['amount_paid_inr'] ? '₹'.number_format($r['amount_paid_inr']) : '—' ?></td>
        <td>
          <?php if ($r['payment_status'] === 'pending'): ?>
          <form method="post" onsubmit="return confirm('Mark this registration as paid?')">
            <input type="hidden" name="action" value="mark_paid">
            <input type="hidden" name="reg_id" value="<?= htmlspecialchars($r['id']) ?>">
            <button class="btn btn-green btn-sm" type="submit">✓ Mark Paid</button>
          </form>
          <?php else: ?>
          <span style="color:#6b7280;font-size:12px"><?= htmlspecialchars($r['razorpay_payment_id'] ?? '—') ?></span>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$registrations): ?><tr><td colspan="10" style="text-align:center;color:#6b7280;padding:32px">No registrations found.</td></tr><?php endif; ?>
    </tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════ -->
<?php elseif ($tab === 'events'): ?>

<div class="page-title">Upcoming Events</div>

<!-- Add new event toggle -->
<button class="btn btn-gold" onclick="document.getElementById('add-run-panel').classList.toggle('open')">
  + Add New Event
</button>
<div style="margin-bottom:16px"></div>

<div id="add-run-panel">
  <div style="font-size:15px;font-weight:700;color:#0d2137;margin-bottom:16px">Add New Program Event</div>
  <form method="post">
    <input type="hidden" name="action" value="add_run">
    <div class="form-row">
      <div class="form-group">
        <label>Program *</label>
        <select name="program_id" required>
          <option value="">Select program…</option>
          <?php foreach ($allPrograms as $p): ?>
            <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['title']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>Mode *</label>
        <select name="mode">
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date *</label>
        <input type="date" name="run_date_start" required>
      </div>
      <div class="form-group">
        <label>End Date (leave blank for 1-day)</label>
        <input type="date" name="run_date_end">
      </div>
    </div>
    <div class="form-row single">
      <div class="form-group">
        <label>Display Date * <span style="font-weight:400;color:#6b7280">(shown in ticker — e.g. "May 9–10, 2026")</span></label>
        <input type="text" name="date_display" placeholder="May 9–10, 2026" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>City / Location *</label>
        <input type="text" name="location" placeholder="Chennai" required>
      </div>
      <div class="form-group">
        <label>Full Venue</label>
        <input type="text" name="venue" placeholder="Hotel XYZ, Chennai, Tamil Nadu">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Total Seats</label>
        <input type="number" name="seats_total" value="30" min="1" max="500">
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:4px;">
        <div class="form-group checkbox">
          <input type="checkbox" name="is_published" id="pub_check" checked>
          <label for="pub_check">Publish immediately (show in website ticker)</label>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button type="submit" class="btn btn-gold">Save Event</button>
      <button type="button" class="btn btn-gray" onclick="document.getElementById('add-run-panel').classList.remove('open')">Cancel</button>
    </div>
  </form>
</div>

<div class="card">
  <div class="card-header">
    <span class="card-title">All Events</span>
  </div>
  <table>
    <thead>
      <tr><th>ID</th><th>Program</th><th>Date</th><th>Location</th><th>Mode</th><th>Seats Total</th><th>Seats Left</th><th>Published</th><th>Actions</th></tr>
    </thead>
    <tbody>
    <?php foreach ($allRuns as $run): ?>
      <tr>
        <td style="font-family:monospace;font-size:12px"><?= htmlspecialchars($run['id']) ?></td>
        <td><?= htmlspecialchars($run['program_title']) ?></td>
        <td style="white-space:nowrap"><?= htmlspecialchars($run['date_display']) ?></td>
        <td><?= htmlspecialchars($run['location']) ?></td>
        <td><span class="badge <?= $run['mode']==='Online'?'badge-blue':'badge-gray' ?>"><?= htmlspecialchars($run['mode']) ?></span></td>
        <td><?= (int)$run['seats_total'] ?></td>
        <td><?= (int)$run['seats_remaining'] ?></td>
        <td><span class="badge <?= $run['is_published']?'badge-green':'badge-gray' ?>"><?= $run['is_published']?'Live':'Hidden' ?></span></td>
        <td style="white-space:nowrap">
          <form method="post" style="display:inline">
            <input type="hidden" name="action" value="toggle_run">
            <input type="hidden" name="run_id" value="<?= htmlspecialchars($run['id']) ?>">
            <button class="btn btn-sm <?= $run['is_published']?'btn-gray':'btn-green' ?>" type="submit">
              <?= $run['is_published']?'Hide':'Publish' ?>
            </button>
          </form>
          <form method="post" style="display:inline" onsubmit="return confirm('Delete this event? This cannot be undone.')">
            <input type="hidden" name="action" value="delete_run">
            <input type="hidden" name="run_id" value="<?= htmlspecialchars($run['id']) ?>">
            <button class="btn btn-red btn-sm" type="submit">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$allRuns): ?><tr><td colspan="9" style="text-align:center;color:#6b7280;padding:32px">No events yet. Add one above.</td></tr><?php endif; ?>
    </tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════ -->
<?php elseif ($tab === 'courses'): ?>

<div class="page-title">Courses (Programs)</div>

<!-- Add new course toggle -->
<button class="btn btn-gold" onclick="document.getElementById('add-course-panel').style.display='block'; document.getElementById('course-form').reset(); document.getElementById('course-id').value=''; document.getElementById('course-panel-title').innerText='Add New Program';">
  + Add New Program
</button>
<div style="margin-bottom:16px"></div>

<div id="add-course-panel" style="display:none; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:20px;">
  <div id="course-panel-title" style="font-size:15px;font-weight:700;color:#0d2137;margin-bottom:16px">Add New Program</div>
  <form id="course-form" method="post">
    <input type="hidden" name="action" value="save_program">
    <input type="hidden" name="program_id" id="course-id" value="">
    
    <div class="form-row">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" name="title" id="course-title" required>
      </div>
      <div class="form-group">
        <label>Program Family</label>
        <input type="text" name="program_family" id="course-family" placeholder="e.g. EQ HIGH PERFORMANCE">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Target Audience</label>
        <input type="text" name="audience" id="course-audience">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Description</label>
        <textarea name="description" id="course-desc" rows="3"></textarea>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Duration Label</label>
        <input type="text" name="duration_label" id="course-dur-lbl" placeholder="e.g. 2-Day Workshop">
      </div>
      <div class="form-group">
        <label>Duration Days</label>
        <input type="number" name="duration_days" id="course-dur-days" value="0">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Follow Up</label>
        <input type="text" name="follow_up" id="course-follow" placeholder="e.g. 60-day">
      </div>
      <div class="form-group">
        <label>Participants Limit</label>
        <input type="text" name="participants" id="course-part" placeholder="e.g. 20-30">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Emoji Icon</label>
        <input type="text" name="icon" id="course-icon" placeholder="🚀">
      </div>
      <div class="form-group">
        <label>Tags (Comma separated)</label>
        <input type="text" name="tags" id="course-tags" placeholder="Leadership, EQ, Management">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Price Amount (INR, numbers only)</label>
        <input type="number" name="price_amount" id="course-price" value="0">
      </div>
      <div class="form-group">
        <label>Price Display Label</label>
        <input type="text" name="price_label" id="course-price-lbl" placeholder="e.g. ₹15,000">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Price Note</label>
        <input type="text" name="price_note" id="course-price-note" placeholder="per participant + 18% GST">
      </div>
      <div class="form-group">
        <label>UPI ID</label>
        <input type="text" name="upi_id" id="course-upi" placeholder="drishtavidya@upi">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group checkbox">
        <input type="checkbox" name="featured" id="course-featured" checked>
        <label for="course-featured">Featured (Show on homepage)</label>
      </div>
      <div class="form-group checkbox">
        <input type="checkbox" name="is_active" id="course-active" checked>
        <label for="course-active">Active (Show on website)</label>
      </div>
    </div>
    
    <div style="display:flex;gap:10px;margin-top:8px">
      <button type="submit" class="btn btn-gold">Save Program</button>
      <button type="button" class="btn btn-gray" onclick="document.getElementById('add-course-panel').style.display='none'">Cancel</button>
    </div>
  </form>
</div>

<script>
const allProgramsData = <?= json_encode($db->query("SELECT * FROM programs ORDER BY id")->fetchAll(), JSON_UNESCAPED_UNICODE) ?>;
function editProgram(id) {
    const p = allProgramsData.find(x => x.id == id);
    if(!p) return;
    document.getElementById('add-course-panel').style.display = 'block';
    document.getElementById('course-panel-title').innerText = 'Edit Program';
    document.getElementById('course-id').value = p.id;
    document.getElementById('course-title').value = p.title;
    document.getElementById('course-family').value = p.program_family;
    document.getElementById('course-audience').value = p.audience;
    document.getElementById('course-desc').value = p.description;
    document.getElementById('course-dur-lbl').value = p.duration_label;
    document.getElementById('course-dur-days').value = p.duration_days;
    document.getElementById('course-follow').value = p.follow_up;
    document.getElementById('course-part').value = p.participants;
    document.getElementById('course-icon').value = p.icon;
    let tags = [];
    try { tags = JSON.parse(p.tags); } catch(e){}
    document.getElementById('course-tags').value = (tags||[]).join(', ');
    document.getElementById('course-price').value = p.price_amount;
    document.getElementById('course-price-lbl').value = p.price_label;
    document.getElementById('course-price-note').value = p.price_note;
    document.getElementById('course-upi').value = p.upi_id;
    document.getElementById('course-featured').checked = parseInt(p.featured) === 1;
    document.getElementById('course-active').checked = parseInt(p.is_active) === 1;
    window.scrollTo({top: 0, behavior: 'smooth'});
}
</script>

<div class="card">
  <table>
    <thead>
      <tr><th>ID</th><th>Title</th><th>Family</th><th>Price</th><th>Status</th><th>Actions</th></tr>
    </thead>
    <tbody>
    <?php foreach ($allPrograms as $p): ?>
      <tr>
        <td><?= (int)$p['id'] ?></td>
        <td><?= htmlspecialchars($p['title']) ?></td>
        <td><span class="badge badge-blue"><?= htmlspecialchars($p['program_family']) ?></span></td>
        <td><?= htmlspecialchars($p['price_label'] ?: '—') ?></td>
        <td><span class="badge <?= $p['is_active']?'badge-green':'badge-gray' ?>"><?= $p['is_active']?'Active':'Inactive' ?></span></td>
        <td style="white-space:nowrap">
          <button class="btn btn-navy btn-sm" onclick="editProgram(<?= (int)$p['id'] ?>)">Edit</button>
          <form method="post" style="display:inline">
            <input type="hidden" name="action" value="toggle_program">
            <input type="hidden" name="program_id" value="<?= (int)$p['id'] ?>">
            <button class="btn btn-sm <?= $p['is_active']?'btn-gray':'btn-green' ?>" type="submit">
              <?= $p['is_active']?'Deactivate':'Activate' ?>
            </button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php endif; ?>

<!-- ══════════════════════════════════════════════════════════ -->
<?php if ($tab === 'resources'): ?>

<div class="page-title">Resources</div>

<!-- Add new resource toggle -->
<button class="btn btn-gold" onclick="document.getElementById('add-resource-panel').style.display='block'; document.getElementById('resource-form').reset(); document.getElementById('resource-id').value=''; document.getElementById('resource-panel-title').innerText='Add New Resource';">
  + Add New Resource
</button>
<div style="margin-bottom:16px"></div>

<div id="add-resource-panel" style="display:none; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:20px;">
  <div id="resource-panel-title" style="font-size:15px;font-weight:700;color:#0d2137;margin-bottom:16px">Add New Resource</div>
  <form id="resource-form" method="post" enctype="multipart/form-data">
    <input type="hidden" name="action" value="save_resource">
    <input type="hidden" name="resource_id" id="resource-id" value="">
    <input type="hidden" name="existing_image" id="existing-image" value="">
    
    <div class="form-row">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" name="title" id="resource-title" required>
      </div>
      <div class="form-group">
        <label>Category *</label>
        <select name="category" id="resource-category" required>
          <option value="books">Book</option>
          <option value="apps">App</option>
          <option value="newsletters">Newsletter</option>
        </select>
      </div>
    </div>
    <div class="form-row single">
      <div class="form-group">
        <label>Description (2-3 lines) *</label>
        <textarea name="description" id="resource-desc" rows="3" required></textarea>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Resource URL *</label>
        <input type="url" name="link" id="resource-link" required placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Image *</label>
        <input type="file" name="image" id="resource-image" accept="image/*">
        <div style="font-size:11px;color:#6b7280;margin-top:4px" id="resource-image-help">Leave blank to keep existing image on edit.</div>
      </div>
    </div>
    
    <div style="display:flex;gap:10px;margin-top:8px">
      <button type="submit" class="btn btn-gold">Save Resource</button>
      <button type="button" class="btn btn-gray" onclick="document.getElementById('add-resource-panel').style.display='none'">Cancel</button>
    </div>
  </form>
</div>

<script>
const allResourcesData = <?= json_encode($allResources, JSON_UNESCAPED_UNICODE) ?>;
function editResource(id) {
    const r = allResourcesData.find(x => x.id == id);
    if(!r) return;
    document.getElementById('add-resource-panel').style.display = 'block';
    document.getElementById('resource-panel-title').innerText = 'Edit Resource';
    document.getElementById('resource-id').value = r.id;
    document.getElementById('resource-title').value = r.title;
    document.getElementById('resource-category').value = r.category;
    document.getElementById('resource-desc').value = r.description;
    document.getElementById('resource-link').value = r.link;
    document.getElementById('existing-image').value = r.image_path;
    window.scrollTo({top: 0, behavior: 'smooth'});
}
</script>

<div class="card">
  <table>
    <thead>
      <tr><th>ID</th><th>Image</th><th>Title</th><th>Category</th><th>Link</th><th>Actions</th></tr>
    </thead>
    <tbody>
    <?php foreach ($allResources as $r): ?>
      <tr>
        <td><?= (int)$r['id'] ?></td>
        <td>
            <?php if ($r['image_path']): ?>
            <img src="../<?= htmlspecialchars($r['image_path']) ?>" alt="" style="height:40px;border-radius:4px;">
            <?php else: ?>
            —
            <?php endif; ?>
        </td>
        <td><?= htmlspecialchars($r['title']) ?></td>
        <td><span class="badge badge-blue"><?= ucfirst(htmlspecialchars($r['category'])) ?></span></td>
        <td><a href="<?= htmlspecialchars($r['link']) ?>" target="_blank" style="color:#1e40af;text-decoration:none">Link ↗</a></td>
        <td style="white-space:nowrap">
          <button class="btn btn-navy btn-sm" onclick="editResource(<?= (int)$r['id'] ?>)">Edit</button>
          <form method="post" style="display:inline" onsubmit="return confirm('Delete this resource?')">
            <input type="hidden" name="action" value="delete_resource">
            <input type="hidden" name="resource_id" value="<?= (int)$r['id'] ?>">
            <button class="btn btn-red btn-sm" type="submit">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$allResources): ?><tr><td colspan="6" style="text-align:center;color:#6b7280;padding:32px">No resources yet. Add one above.</td></tr><?php endif; ?>
    </tbody>
  </table>
</div>

<?php endif; ?>

<?php if ($tab === 'promos'): ?>
<h1 class="page-title">Manage Promo Codes</h1>

<div class="card">
  <div class="card-header">
    <div class="card-title">All Promo Codes</div>
    <button class="btn btn-primary" onclick="openPromoModal()">+ Add Promo Code</button>
  </div>
  <div style="overflow-x:auto;">
    <table>
      <tr>
        <th>Code</th>
        <th>Type</th>
        <th>Value</th>
        <th>Valid Until</th>
        <th>Usage Limit</th>
        <th>Times Used</th>
        <th>Status</th>
        <th style="text-align:right;">Actions</th>
      </tr>
      <?php foreach ($allPromos as $p): ?>
      <tr>
        <td style="font-weight:600;"><?= htmlspecialchars($p['code']) ?></td>
        <td><?= ucfirst($p['discount_type']) ?></td>
        <td><?= $p['discount_type'] === 'percentage' ? $p['discount_value'] . '%' : '₹' . number_format($p['discount_value']) ?></td>
        <td><?= $p['valid_until'] ? date('d M Y, h:i A', strtotime($p['valid_until'])) : 'No Expiry' ?></td>
        <td><?= $p['usage_limit'] ? $p['usage_limit'] : 'Unlimited' ?></td>
        <td><?= $p['times_used'] ?></td>
        <td>
          <span class="badge <?= $p['is_active'] ? 'badge-success' : 'badge-error' ?>">
            <?= $p['is_active'] ? 'Active' : 'Inactive' ?>
          </span>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="btn btn-outline" style="padding:4px 10px;font-size:12px;margin-right:4px;" 
                  onclick="editPromo(<?= htmlspecialchars(json_encode($p)) ?>)">Edit</button>
          <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this promo code?');">
            <input type="hidden" name="action" value="delete_promo">
            <input type="hidden" name="promo_id" value="<?= $p['id'] ?>">
            <button type="submit" class="btn btn-outline" style="padding:4px 10px;font-size:12px;color:red;border-color:#fca5a5;">Delete</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      <?php if (empty($allPromos)): ?>
      <tr><td colspan="8" style="text-align:center;padding:30px;color:#6b7280;">No promo codes found. Create one above!</td></tr>
      <?php endif; ?>
    </table>
  </div>
</div>

<div class="modal-overlay" id="promo-modal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="promo-modal-title">Add Promo Code</div>
      <button type="button" class="modal-close" onclick="closePromoModal()">&times;</button>
    </div>
    <div class="modal-body">
      <form method="POST">
        <input type="hidden" name="action" value="save_promo">
        <input type="hidden" name="promo_id" id="promo_id" value="0">
        
        <div class="form-group">
          <label class="form-label">Promo Code *</label>
          <input type="text" class="form-control" name="code" id="promo_code" required placeholder="e.g. EARLYBIRD20" style="text-transform: uppercase;">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Discount Type *</label>
            <select class="form-control" name="discount_type" id="promo_type" required>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Discount Value *</label>
            <input type="number" step="0.01" class="form-control" name="discount_value" id="promo_value" required placeholder="e.g. 20">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Valid Until</label>
            <input type="datetime-local" class="form-control" name="valid_until" id="promo_valid_until">
            <div class="form-help">Leave empty for no expiry</div>
          </div>
          <div class="form-group">
            <label class="form-label">Usage Limit</label>
            <input type="number" class="form-control" name="usage_limit" id="promo_usage_limit" placeholder="e.g. 50">
            <div class="form-help">Max number of times this code can be used</div>
          </div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;">
            <input type="checkbox" name="is_active" id="promo_is_active" value="1" checked>
            Active
          </label>
        </div>

        <div style="margin-top:24px;display:flex;gap:12px;">
          <button type="submit" class="btn btn-primary">Save Promo Code</button>
          <button type="button" class="btn btn-outline" onclick="closePromoModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
function openPromoModal() {
  document.getElementById('promo-modal-title').textContent = 'Add Promo Code';
  document.getElementById('promo_id').value = '0';
  document.getElementById('promo_code').value = '';
  document.getElementById('promo_type').value = 'percentage';
  document.getElementById('promo_value').value = '';
  document.getElementById('promo_valid_until').value = '';
  document.getElementById('promo_usage_limit').value = '';
  document.getElementById('promo_is_active').checked = true;
  document.getElementById('promo-modal').classList.add('open');
}
function editPromo(p) {
  document.getElementById('promo-modal-title').textContent = 'Edit Promo Code';
  document.getElementById('promo_id').value = p.id;
  document.getElementById('promo_code').value = p.code;
  document.getElementById('promo_type').value = p.discount_type;
  document.getElementById('promo_value').value = p.discount_value;
  // Format datetime-local if exists
  let validUntil = '';
  if (p.valid_until) {
    validUntil = p.valid_until.replace(' ', 'T').slice(0, 16);
  }
  document.getElementById('promo_valid_until').value = validUntil;
  document.getElementById('promo_usage_limit').value = p.usage_limit || '';
  document.getElementById('promo_is_active').checked = p.is_active == 1;
  document.getElementById('promo-modal').classList.add('open');
}
function closePromoModal() {
  document.getElementById('promo-modal').classList.remove('open');
}
</script>

<?php endif; ?>

</main>
</body>
</html>
