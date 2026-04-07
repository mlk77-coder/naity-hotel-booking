-- =====================================================
-- Financial Transactions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS `financial_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(36),
  `transaction_type` ENUM('payment_to_hotel', 'sales_payment', 'refund', 'adjustment') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(36),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL,
  INDEX `idx_transaction_type` (`transaction_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
