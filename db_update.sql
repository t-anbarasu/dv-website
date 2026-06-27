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
