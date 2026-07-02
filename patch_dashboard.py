import re

with open('admin/dashboard.php', 'r') as f:
    content = f.read()

# 1. Add POST handlers for Promos
promos_post_handler = """
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
"""

content = content.replace("// Resources tab\n$allResources = [];", promos_post_handler + "$allResources = [];")


# 2. Fetch Promo codes data
promos_fetch = """// Promos tab
$allPromos = [];
if ($tab === 'promos') {
    $allPromos = $db->query("SELECT * FROM promo_codes ORDER BY id DESC")->fetchAll();
}

?>"""
content = content.replace("?>", promos_fetch, 1)

# 3. Sidebar link
content = content.replace("""<a href="?tab=resources"      class="<?= $tab==='resources'      ? 'active' : '' ?>">📚 <span>Resources</span></a>""", """<a href="?tab=resources"      class="<?= $tab==='resources'      ? 'active' : '' ?>">📚 <span>Resources</span></a>
    <a href="?tab=promos"         class="<?= $tab==='promos'         ? 'active' : '' ?>">🎟️ <span>Promo Codes</span></a>""")

# 4. Insert Promos UI Section
promos_ui = """
<?php elseif ($tab === 'promos'): ?>
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

"""

content = content.replace("</main>", promos_ui + "\n</main>")

with open('admin/dashboard.php', 'w') as f:
    f.write(content)
