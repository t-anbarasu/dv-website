-- ============================================================
-- Drishta Vidya LLP — MySQL Schema
-- Run this in phpMyAdmin > SQL editor after creating your DB
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── TABLE: programs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id              INT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  program_family  VARCHAR(100),
  audience        TEXT,
  description     TEXT,
  duration_label  VARCHAR(50),
  duration_days   INT DEFAULT 0,
  follow_up       VARCHAR(20),
  participants    VARCHAR(50),
  icon            VARCHAR(20),
  featured        TINYINT(1) DEFAULT 0,
  is_active       TINYINT(1) DEFAULT 1,
  tags            JSON,
  price_amount    INT DEFAULT 0,
  price_label     VARCHAR(30),
  price_note      VARCHAR(150),
  upi_id          VARCHAR(100),
  payment_link    VARCHAR(500) DEFAULT '',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TABLE: program_runs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS program_runs (
  id                      VARCHAR(30) PRIMARY KEY,
  program_id              INT NOT NULL,
  run_date_start          DATE NOT NULL,
  run_date_end            DATE,
  date_display            VARCHAR(40) NOT NULL,
  location                VARCHAR(100),
  venue                   VARCHAR(200),
  mode                    ENUM('In-Person','Online','Hybrid') DEFAULT 'In-Person',
  seats_total             INT DEFAULT 30,
  seats_remaining         INT DEFAULT 30,
  is_published            TINYINT(1) DEFAULT 1,
  registration_closes_at  DATETIME,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT,
  INDEX idx_date (run_date_start),
  INDEX idx_published (is_published, run_date_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TABLE: registrations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id                    CHAR(36) PRIMARY KEY,
  run_id                VARCHAR(30) NOT NULL,
  program_id            INT NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  email                 VARCHAR(200) NOT NULL,
  phone                 VARCHAR(20) NOT NULL,
  organization          VARCHAR(200),
  designation           VARCHAR(200),
  payment_method        ENUM('razorpay','upi','bank_transfer','enquiry','free') DEFAULT 'razorpay',
  payment_status        ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  razorpay_payment_id   VARCHAR(100),
  amount_paid_inr       INT,
  registered_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes                 TEXT,
  FOREIGN KEY (run_id) REFERENCES program_runs(id) ON DELETE RESTRICT,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_email_run (email, run_id),
  INDEX idx_run_id (run_id),
  INDEX idx_email (email),
  INDEX idx_registered_at (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TRIGGER: auto-decrement seats_remaining ─────────────────
DROP TRIGGER IF EXISTS trg_decrement_seats;
DELIMITER $$
CREATE TRIGGER trg_decrement_seats
AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
  IF NEW.payment_status IN ('completed', 'free') THEN
    UPDATE program_runs
    SET seats_remaining = GREATEST(seats_remaining - 1, 0),
        updated_at = NOW()
    WHERE id = NEW.run_id;
  END IF;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- ─── SEED: programs ──────────────────────────────────────────
INSERT INTO programs (id, title, program_family, audience, description,
  duration_label, duration_days, follow_up, participants, icon, featured, is_active,
  tags, price_amount, price_label, price_note, upi_id)
VALUES
(1, 'High Performance Highway', 'EQ HIGH PERFORMANCE',
 'Senior executives, business owners & entrepreneurs',
 'An intensive 2-day organizational development program designed to transform how senior leaders think, lead, and perform. Drive lasting change through EQ mastery.',
 '2-Day Workshop', 2, '60-day', '20-30', '🚀', 1, 1,
 JSON_ARRAY('Leadership','Organization Development','High Performance'),
 15000, '₹15,000', 'per participant + 18% GST', 'drishtavidya@upi'),

(2, 'Transformation Trail', 'EQ HIGH PERFORMANCE',
 'Mid-level employees and team leads',
 'A deep-dive 2-day workshop that guides mid-level professionals through personal and professional transformation using proven EQ frameworks and behavioral tools.',
 '2-Day Workshop', 2, '60-day', '20-30', '🌱', 1, 1,
 JSON_ARRAY('Emotional Intelligence','Team Performance','Behaviour Change'),
 12000, '₹12,000', 'per participant + 18% GST', 'drishtavidya@upi'),

(3, 'EQnomy Expressway', 'EQ HIGH PERFORMANCE',
 'Students, teachers & educational institutions',
 'A purpose-built 2-day program for the education sector — helping students and teachers harness emotional intelligence as a core life and career skill.',
 '2-Day Workshop', 2, '60-day', '20-30', '🎓', 1, 1,
 JSON_ARRAY('Student Development','Teacher Training','EQ Foundations'),
 10000, '₹10,000', 'per participant + 18% GST', 'drishtavidya@upi'),

(4, 'LEAD — Virtual L&D', 'EQ HIGH PERFORMANCE',
 'HR teams, L&D managers & training departments',
 'A fully managed virtual Learning & Development engagement. We act as your outsourced L&D team — from needs assessment and learning path design to content creation and effectiveness tracking.',
 'Ongoing Engagement', 0, '', 'Open', '🏢', 1, 1,
 JSON_ARRAY('Virtual L&D','Learning Design','HR Partnership'),
 0, 'Custom Pricing', 'Contact us for a tailored quote', 'drishtavidya@upi'),

(5, 'GenAI for Business', 'GENAI FOR BUSINESS',
 'Business owners, founders & senior professionals',
 'A practical 1-day workshop that empowers business leaders and professionals to leverage Generative AI tools for real business outcomes — from productivity to strategy.',
 '1-Day Workshop', 1, '60-day', '15-20', '🤖', 1, 1,
 JSON_ARRAY('GenAI','Productivity','Business Strategy','AI Tools'),
 8000, '₹8,000', 'per participant + 18% GST', 'drishtavidya@upi');

-- ─── SEED: program_runs ──────────────────────────────────────
INSERT INTO program_runs (id, program_id, run_date_start, run_date_end, date_display,
  location, venue, mode, seats_total, seats_remaining, is_published)
VALUES
('HPH-MAY26-CBE', 1, '2026-05-09', '2026-05-10', 'May 9–10, 2026',
 'Coimbatore', 'Coimbatore, Tamil Nadu', 'In-Person', 30, 12, 1),

('GAB-MAY26-CHE', 5, '2026-05-24', NULL, 'May 24, 2026',
 'Chennai', 'Chennai, Tamil Nadu', 'In-Person', 25, 8, 1),

('TT-JUN26-CBE', 2, '2026-06-06', '2026-06-07', 'June 6–7, 2026',
 'Coimbatore', 'Coimbatore, Tamil Nadu', 'In-Person', 30, 15, 1),

('EQN-JUN26-ONL', 3, '2026-06-20', '2026-06-21', 'June 20–21, 2026',
 'Online', 'Online (Zoom link shared after registration)', 'Online', 40, 20, 1),

('GAB-JUL26-BLR', 5, '2026-07-12', NULL, 'July 12, 2026',
 'Bangalore', 'Bangalore, Karnataka', 'In-Person', 25, 10, 1);
