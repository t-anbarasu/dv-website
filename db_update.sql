CREATE TABLE IF NOT EXISTS promo_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'flat') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  valid_until DATETIME,
  usage_limit INT DEFAULT NULL,
  times_used INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

ALTER TABLE registrations
ADD COLUMN base_amount_inr INT,
ADD COLUMN promo_code VARCHAR(50),
ADD COLUMN discount_amount_inr INT DEFAULT 0,
ADD COLUMN tax_amount_inr INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS special_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20),
  badge_text VARCHAR(100),
  link_url VARCHAR(500),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE special_events ADD COLUMN is_default TINYINT(1) DEFAULT 0;
