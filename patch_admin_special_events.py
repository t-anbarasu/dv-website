import re

with open('admin/dashboard.php', 'r') as f:
    content = f.read()

# 1. Add POST handlers for Special Events
special_events_post_handler = """
// Save special event
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_special_event') {
    $id             = (int)($_POST['event_id'] ?? 0);
    $title          = trim($_POST['title'] ?? '');
    $description    = trim($_POST['description'] ?? '');
    $icon           = trim($_POST['icon'] ?? '');
    $badge_text     = trim($_POST['badge_text'] ?? '');
    $link_url       = trim($_POST['link_url'] ?? '');
    $start_date     = trim($_POST['start_date'] ?? '');
    $end_date       = trim($_POST['end_date'] ?? '');
    $is_active      = isset($_POST['is_active']) ? 1 : 0;

    try {
        if ($id > 0) {
            $db->prepare("UPDATE special_events SET title=?, description=?, icon=?, badge_text=?, link_url=?, start_date=?, end_date=?, is_active=? WHERE id=?")
               ->execute([$title, $description, $icon, $badge_text, $link_url, $start_date, $end_date, $is_active, $id]);
        } else {
            $db->prepare("INSERT INTO special_events (title, description, icon, badge_text, link_url, start_date, end_date, is_active) VALUES (?,?,?,?,?,?,?,?)")
               ->execute([$title, $description, $icon, $badge_text, $link_url, $start_date, $end_date, $is_active]);
        }
        header('Location: dashboard.php?tab=special_events&saved=1');
    } catch (PDOException $e) {
        header('Location: dashboard.php?tab=special_events&err=1');
    }
    exit;
}

// Delete special event
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_special_event') {
    $id = (int)($_POST['event_id'] ?? 0);
    if ($id) {
        $db->prepare("DELETE FROM special_events WHERE id=?")->execute([$id]);
    }
    header('Location: dashboard.php?tab=special_events&saved=1');
    exit;
}

// Promos tab
"""

content = content.replace("// Promos tab", special_events_post_handler)


# 2. Fetch Special Events data
special_events_fetch = """// Special Events tab
$allSpecialEvents = [];
if ($tab === 'special_events') {
    $allSpecialEvents = $db->query("SELECT * FROM special_events ORDER BY id DESC")->fetchAll();
}

?>"""
content = content.replace("?>", special_events_fetch, 1)

# 3. Sidebar link
content = content.replace("""<a href="?tab=promos"         class="<?= $tab==='promos'         ? 'active' : '' ?>">🎟️ <span>Promo Codes</span></a>""", """<a href="?tab=promos"         class="<?= $tab==='promos'         ? 'active' : '' ?>">🎟️ <span>Promo Codes</span></a>
    <a href="?tab=special_events" class="<?= $tab==='special_events' ? 'active' : '' ?>">🌟 <span>Special Events</span></a>""")

# 4. Insert Special Events UI Section
special_events_ui = """
<?php elseif ($tab === 'special_events'): ?>
<h1 class="page-title">Manage Special Events</h1>

<div class="card">
  <div class="card-header">
    <div class="card-title">All Special Events</div>
    <button class="btn btn-primary" onclick="openEventModal()">+ Add Event</button>
  </div>
  <div style="overflow-x:auto;">
    <table>
      <tr>
        <th>Title</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Status</th>
        <th style="text-align:right;">Actions</th>
      </tr>
      <?php foreach ($allSpecialEvents as $e): ?>
      <tr>
        <td style="font-weight:600;"><?= htmlspecialchars($e['title']) ?></td>
        <td><?= date('d M Y, h:i A', strtotime($e['start_date'])) ?></td>
        <td><?= date('d M Y, h:i A', strtotime($e['end_date'])) ?></td>
        <td>
          <span class="badge <?= $e['is_active'] ? 'badge-success' : 'badge-error' ?>">
            <?= $e['is_active'] ? 'Active' : 'Inactive' ?>
          </span>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="btn btn-outline" style="padding:4px 10px;font-size:12px;margin-right:4px;" 
                  onclick="editEvent(<?= htmlspecialchars(json_encode($e)) ?>)">Edit</button>
          <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this special event?');">
            <input type="hidden" name="action" value="delete_special_event">
            <input type="hidden" name="event_id" value="<?= $e['id'] ?>">
            <button type="submit" class="btn btn-outline" style="padding:4px 10px;font-size:12px;color:red;border-color:#fca5a5;">Delete</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      <?php if (empty($allSpecialEvents)): ?>
      <tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">No special events found. Create one above!</td></tr>
      <?php endif; ?>
    </table>
  </div>
</div>

<div class="modal-overlay" id="event-modal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="event-modal-title">Add Special Event</div>
      <button type="button" class="modal-close" onclick="closeEventModal()">&times;</button>
    </div>
    <div class="modal-body">
      <form method="POST">
        <input type="hidden" name="action" value="save_special_event">
        <input type="hidden" name="event_id" id="event_id" value="0">
        
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input type="text" class="form-control" name="title" id="event_title" required placeholder="e.g. Special Workshop">
        </div>
        
        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea class="form-control" name="description" id="event_description" required rows="3"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Icon</label>
            <input type="text" class="form-control" name="icon" id="event_icon" placeholder="e.g. 🌟">
          </div>
          <div class="form-group">
            <label class="form-label">Badge Text</label>
            <input type="text" class="form-control" name="badge_text" id="event_badge_text" placeholder="e.g. Available until Friday">
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Link URL</label>
          <input type="text" class="form-control" name="link_url" id="event_link_url" placeholder="e.g. courses.html">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input type="datetime-local" class="form-control" name="start_date" id="event_start_date" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Date *</label>
            <input type="datetime-local" class="form-control" name="end_date" id="event_end_date" required>
          </div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;">
            <input type="checkbox" name="is_active" id="event_is_active" value="1" checked>
            Active
          </label>
        </div>

        <div style="margin-top:24px;display:flex;gap:12px;">
          <button type="submit" class="btn btn-primary">Save Special Event</button>
          <button type="button" class="btn btn-outline" onclick="closeEventModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
function openEventModal() {
  document.getElementById('event-modal-title').textContent = 'Add Special Event';
  document.getElementById('event_id').value = '0';
  document.getElementById('event_title').value = '';
  document.getElementById('event_description').value = '';
  document.getElementById('event_icon').value = '';
  document.getElementById('event_badge_text').value = '';
  document.getElementById('event_link_url').value = '';
  document.getElementById('event_start_date').value = '';
  document.getElementById('event_end_date').value = '';
  document.getElementById('event_is_active').checked = true;
  document.getElementById('event-modal').classList.add('open');
}
function editEvent(e) {
  document.getElementById('event-modal-title').textContent = 'Edit Special Event';
  document.getElementById('event_id').value = e.id;
  document.getElementById('event_title').value = e.title;
  document.getElementById('event_description').value = e.description;
  document.getElementById('event_icon').value = e.icon;
  document.getElementById('event_badge_text').value = e.badge_text;
  document.getElementById('event_link_url').value = e.link_url;
  
  let startDate = '';
  if (e.start_date) startDate = e.start_date.replace(' ', 'T').slice(0, 16);
  document.getElementById('event_start_date').value = startDate;
  
  let endDate = '';
  if (e.end_date) endDate = e.end_date.replace(' ', 'T').slice(0, 16);
  document.getElementById('event_end_date').value = endDate;

  document.getElementById('event_is_active').checked = e.is_active == 1;
  document.getElementById('event-modal').classList.add('open');
}
function closeEventModal() {
  document.getElementById('event-modal').classList.remove('open');
}
</script>

"""

content = content.replace("</main>", special_events_ui + "\n</main>")

with open('admin/dashboard.php', 'w') as f:
    f.write(content)
