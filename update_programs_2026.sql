-- ====================================================================
-- Drishta Vidya — Database Migration: EQuip & SimplifAI Rebranding (2026)
-- Run this in phpMyAdmin or MySQL console to update programs and upcoming runs
-- ====================================================================

-- 1. Update Program 1: EQuip for Leaders
UPDATE programs SET
  title = 'EQuip for Leaders',
  program_family = 'EQuip',
  audience = 'Senior executives, business owners & entrepreneurs',
  description = 'Build a high-performance culture by leading with clarity, steadiness and empathy through change and uncertainty.',
  duration_label = '2-Day Live Workshop',
  duration_days = 2,
  follow_up = '60-day in EQ OS',
  participants = '20–30',
  icon = '🚀',
  featured = 1,
  is_active = 1,
  tags = JSON_ARRAY('Leadership','Organization Development','Emotional Intelligence','EQ OS'),
  price_amount = 15000,
  price_label = '₹15,000',
  price_note = 'per participant + 18% GST'
WHERE id = 1;

-- 2. Update Program 2: EQuip for Teams
UPDATE programs SET
  title = 'EQuip for Teams',
  program_family = 'EQuip',
  audience = 'Mid-level managers, team leads & professionals',
  description = 'Break the mindset barriers that hold teams back during growth and change. Handle conflict and work with less friction.',
  duration_label = '2-Day Live Workshop',
  duration_days = 2,
  follow_up = '60-day in EQ OS',
  participants = '20–30',
  icon = '🔄',
  featured = 1,
  is_active = 1,
  tags = JSON_ARRAY('Emotional Intelligence','Team Performance','Collaboration','EQ OS'),
  price_amount = 12000,
  price_label = '₹12,000',
  price_note = 'per participant + 18% GST'
WHERE id = 2;

-- 3. Update Program 3: EQuip for Educators
UPDATE programs SET
  title = 'EQuip for Educators',
  program_family = 'EQuip',
  audience = 'Teachers, faculty & educational institutions',
  description = 'Build emotionally intelligent classrooms and campuses. Foster better relationships between teachers, students and parents.',
  duration_label = '2-Day Live Workshop',
  duration_days = 2,
  follow_up = '60-day in EQ OS',
  participants = '20–30',
  icon = '🧠',
  featured = 1,
  is_active = 1,
  tags = JSON_ARRAY('Education','Teacher Training','Emotional Intelligence','EQ OS'),
  price_amount = 10000,
  price_label = '₹10,000',
  price_note = 'per participant + 18% GST'
WHERE id = 3;

-- 4. Update Program 4: LEAD — Virtual L&D
UPDATE programs SET
  title = 'LEAD — Virtual L&D',
  program_family = 'LEAD',
  audience = 'HR teams, L&D managers & training departments',
  description = 'Your learning & development department without the headcount: needs assessment, learning roadmaps, delivery and effectiveness tracking.',
  duration_label = 'Ongoing Engagement',
  duration_days = 0,
  follow_up = '',
  participants = 'Open',
  icon = '📚',
  featured = 1,
  is_active = 1,
  tags = JSON_ARRAY('Virtual L&D','Learning Design','HR Partnership'),
  price_amount = 0,
  price_label = 'Custom Quote',
  price_note = 'Monthly / annual engagement'
WHERE id = 4;

-- 5. Update Program 5: SimplifAI Workshop
UPDATE programs SET
  title = 'SimplifAI Workshop',
  program_family = 'SimplifAI',
  audience = 'MSME owners, professional practices & managers',
  description = 'A hands-on workshop for business owners: simplify a real process first, then put AI to work on it with a 90-day action plan.',
  duration_label = '1–2 Day Workshop',
  duration_days = 2,
  follow_up = '90-day action plan',
  participants = '15–20',
  icon = '⚡',
  featured = 1,
  is_active = 1,
  tags = JSON_ARRAY('SimplifAI','CLEAR Method','AI Adoption','Process Optimization'),
  price_amount = 7500,
  price_label = '₹7,500',
  price_note = 'per participant + 18% GST'
WHERE id = 5;

-- 6. Insert Program 6: SimplifAI Consulting (if not exists)
INSERT INTO programs (id, title, program_family, audience, description, duration_label, duration_days, follow_up, participants, icon, featured, is_active, tags, price_amount, price_label, price_note, upi_id)
VALUES (6, 'SimplifAI Consulting', 'SimplifAI', 'Growing businesses & leadership teams', 'Takes the CLEAR method into your business over 30 to 90 days. Process audit, AI workflow automation, and team adoption.', '30–90 Days', 60, 'Ongoing advisory', 'Custom', '🤖', 0, 1, JSON_ARRAY('Consulting','Automation','Advisory'), 0, 'Custom Quote', 'Based on scope & processes', 'drishtavidya@upi')
ON DUPLICATE KEY UPDATE
  title = 'SimplifAI Consulting',
  program_family = 'SimplifAI',
  audience = 'Growing businesses & leadership teams',
  description = 'Takes the CLEAR method into your business over 30 to 90 days. Process audit, AI workflow automation, and team adoption.',
  duration_label = '30–90 Days',
  duration_days = 60,
  follow_up = 'Ongoing advisory',
  participants = 'Custom',
  icon = '🤖',
  price_amount = 0,
  price_label = 'Custom Quote',
  price_note = 'Based on scope & processes';

-- 7. Refresh upcoming runs with current 2026-2027 dates
INSERT INTO program_runs (id, program_id, run_date_start, run_date_end, date_display, location, venue, mode, seats_total, seats_remaining, is_published)
VALUES
('EQ-LDR-NOV26-CBE', 1, '2026-11-14', '2026-11-15', 'Nov 14–15, 2026', 'Coimbatore', 'Coimbatore, Tamil Nadu', 'In-Person', 30, 12, 1),
('SIMP-NOV26-CHE', 5, '2026-11-28', NULL, 'Nov 28, 2026', 'Chennai', 'Chennai, Tamil Nadu', 'In-Person', 25, 8, 1),
('EQ-TMS-DEC26-CBE', 2, '2026-12-05', '2026-12-06', 'Dec 5–6, 2026', 'Coimbatore', 'Coimbatore, Tamil Nadu', 'In-Person', 30, 15, 1),
('EQ-EDU-DEC26-ONL', 3, '2026-12-19', '2026-12-20', 'Dec 19–20, 2026', 'Online', 'Online (Zoom link shared after registration)', 'Online', 40, 20, 1),
('SIMP-JAN27-BLR', 5, '2027-01-16', NULL, 'Jan 16, 2027', 'Bangalore', 'Bangalore, Karnataka', 'In-Person', 25, 10, 1)
ON DUPLICATE KEY UPDATE
  date_display = VALUES(date_display),
  run_date_start = VALUES(run_date_start),
  run_date_end = VALUES(run_date_end),
  location = VALUES(location),
  seats_remaining = VALUES(seats_remaining),
  is_published = 1;
