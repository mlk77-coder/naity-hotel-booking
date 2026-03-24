-- =====================================================
-- 🔄 Naity Backend - Database Migration Updates
-- =====================================================
-- Run this script to update your MySQL database for full migration
-- from Supabase to Node.js/Express backend

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. Update contact_messages table
-- =====================================================
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS country VARCHAR(100) AFTER phone,
ADD COLUMN IF NOT EXISTS is_starred TINYINT(1) DEFAULT 0 AFTER is_read,
ADD COLUMN IF NOT EXISTS replied_at DATETIME NULL AFTER is_starred;

-- Rename 'name' to 'full_name' if exists
ALTER TABLE contact_messages 
CHANGE COLUMN name full_name VARCHAR(255) NOT NULL;

-- Add subject if missing
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS subject VARCHAR(255) AFTER phone;

-- =====================================================
-- 2. Create api_companies table
-- =====================================================
CREATE TABLE IF NOT EXISTS `api_companies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255),
  `base_url` VARCHAR(500),
  `api_key` VARCHAR(255) NOT NULL,
  `api_token` VARCHAR(255),
  `username` VARCHAR(255),
  `password` VARCHAR(255),
  `auth_type` VARCHAR(50),
  `get_rooms_path` VARCHAR(255),
  `post_booking_path` VARCHAR(255),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `contact_email` VARCHAR(255),
  `contact_phone` VARCHAR(50),
  `notes` TEXT,
  `last_sync_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. Create tech_partners table
-- =====================================================
CREATE TABLE IF NOT EXISTS `tech_partners` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255),
  `commission_rate` DECIMAL(5,2) DEFAULT 0,
  `contact_email` VARCHAR(255),
  `contact_phone` VARCHAR(50),
  `is_active` TINYINT(1) DEFAULT 1,
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. Create sync_history table
-- =====================================================
CREATE TABLE IF NOT EXISTS `sync_history` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `direction` ENUM('inbound', 'outbound') DEFAULT 'inbound',
  `status` ENUM('success', 'failed', 'pending') DEFAULT 'pending',
  `records_count` INT DEFAULT 0,
  `error_message` TEXT,
  `metadata` JSON,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. Create api_sync_logs table
-- =====================================================
CREATE TABLE IF NOT EXISTS `api_sync_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `company_id` VARCHAR(36) NOT NULL,
  `hotel_id` VARCHAR(36),
  `event_type` VARCHAR(100) NOT NULL,
  `direction` ENUM('inbound', 'outbound'),
  `status` ENUM('success', 'failed') DEFAULT 'failed',
  `request_url` VARCHAR(500),
  `payload` JSON,
  `response` JSON,
  `error_msg` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `api_companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE SET NULL,
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. Create local_sync_settings table
-- =====================================================
CREATE TABLE IF NOT EXISTS `local_sync_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL UNIQUE,
  `api_endpoint` VARCHAR(500),
  `secret_key` VARCHAR(255),
  `is_active` TINYINT(1) DEFAULT 0,
  `last_sync_at` DATETIME,
  `last_heartbeat_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. Create partner_users table (for partner management)
-- =====================================================
CREATE TABLE IF NOT EXISTS `partner_users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `tech_partners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_partner_user` (`partner_id`, `user_id`),
  INDEX `idx_partner_id` (`partner_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. Create webhook_logs table
-- =====================================================
CREATE TABLE IF NOT EXISTS `webhook_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `payload` JSON,
  `status` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. Update hotels table - add missing foreign keys
-- =====================================================
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS company_id VARCHAR(36) AFTER manager_id,
ADD COLUMN IF NOT EXISTS tech_partner_id VARCHAR(36) AFTER company_id;

-- Add foreign keys if they don't exist
ALTER TABLE hotels 
ADD CONSTRAINT fk_hotels_company 
FOREIGN KEY (company_id) REFERENCES api_companies(id) ON DELETE SET NULL;

ALTER TABLE hotels 
ADD CONSTRAINT fk_hotels_tech_partner 
FOREIGN KEY (tech_partner_id) REFERENCES tech_partners(id) ON DELETE SET NULL;

-- =====================================================
-- 10. Update room_availability table structure
-- =====================================================
-- Note: The current structure uses date-based availability
-- If you need to match Supabase structure exactly, uncomment below:

/*
DROP TABLE IF EXISTS room_availability;

CREATE TABLE room_availability (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  room_category_id VARCHAR(36),
  room_number VARCHAR(20) NOT NULL,
  room_kind VARCHAR(100),
  category_name VARCHAR(255),
  status ENUM('available', 'occupied', 'maintenance', 'unlisted') DEFAULT 'available',
  price_per_night DECIMAL(10,2),
  occupied_check_in DATE,
  occupied_check_out DATE,
  sham_soft_room_id VARCHAR(100),
  last_updated_by_hotel DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_category_id) REFERENCES room_categories(id) ON DELETE SET NULL,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_status (status),
  INDEX idx_room_number (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- =====================================================
-- ✅ Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Verify all tables created successfully
-- 2. Test backend API endpoints
-- 3. Update frontend to use new API
-- =====================================================
