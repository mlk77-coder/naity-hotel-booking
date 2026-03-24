-- =====================================================
-- 🏨 Naity Hotel Booking - COMPLETE Database Setup
-- =====================================================
-- This script creates ALL tables needed for the migration
-- Run this ONCE in phpMyAdmin or MySQL CLI

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 👥 Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'hotel_manager', 'user') DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. 👤 Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL UNIQUE,
  `full_name` VARCHAR(255),
  `email` VARCHAR(255),
  `avatar_url` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. 🤝 Tech Partners Table
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
-- 4. 🔌 API Companies Table
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
-- 5. 🏨 Hotels Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name_ar` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE,
  `city` VARCHAR(100) NOT NULL,
  `neighborhood` VARCHAR(255),
  `address` TEXT,
  `stars` TINYINT(1) NOT NULL DEFAULT 3,
  `property_type` VARCHAR(50) NOT NULL DEFAULT 'hotel',
  `description_ar` TEXT,
  `description_en` TEXT,
  `amenities` JSON,
  `contact_email` VARCHAR(255),
  `contact_phone` VARCHAR(50),
  `cover_image` TEXT,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `check_in_time` VARCHAR(10),
  `check_out_time` VARCHAR(10),
  `house_rules_ar` TEXT,
  `house_rules_en` TEXT,
  `breakfast_available` TINYINT(1) DEFAULT 0,
  `breakfast_price` DECIMAL(10,2),
  `breakfast_type` VARCHAR(100),
  `breakfast_season_start` DATE,
  `breakfast_season_end` DATE,
  `area_sqm` INT,
  `bedrooms` INT,
  `bathrooms` INT,
  `floor` INT,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `manual_mode` TINYINT(1) DEFAULT 1,
  `manager_id` VARCHAR(36),
  `external_hotel_id` INT,
  `tech_partner_id` VARCHAR(36),
  `company_id` VARCHAR(36),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_city` (`city`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_stars` (`stars`),
  INDEX `idx_property_type` (`property_type`),
  FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`tech_partner_id`) REFERENCES `tech_partners`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`company_id`) REFERENCES `api_companies`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. 📸 Hotel Photos Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `hotel_photos` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `photo_url` TEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  `caption_ar` VARCHAR(255),
  `caption_en` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  INDEX `idx_hotel_id` (`hotel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. 🛏️ Room Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `room_categories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `name_ar` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) NOT NULL,
  `description_ar` TEXT,
  `description_en` TEXT,
  `price_per_night` DECIMAL(10,2) NOT NULL,
  `max_guests` INT DEFAULT 2,
  `total_rooms` INT DEFAULT 1,
  `amenities` JSON,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. 📅 Room Availability Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `room_availability` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `room_category_id` VARCHAR(36),
  `room_number` VARCHAR(20) NOT NULL,
  `room_kind` VARCHAR(100),
  `category_name` VARCHAR(255),
  `status` ENUM('available', 'occupied', 'maintenance', 'unlisted') DEFAULT 'available',
  `price_per_night` DECIMAL(10,2),
  `occupied_check_in` DATE,
  `occupied_check_out` DATE,
  `sham_soft_room_id` VARCHAR(100),
  `last_updated_by_hotel` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_category_id`) REFERENCES `room_categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_room_number` (`room_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. 🚫 Blocked Dates Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `blocked_dates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `blocked_date` DATE NOT NULL,
  `note` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_hotel_date` (`hotel_id`, `blocked_date`),
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. 📋 Bookings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `room_category_id` VARCHAR(36) NOT NULL,
  `room_number` VARCHAR(20),
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `guests_count` INT DEFAULT 1,
  `children_count` INT DEFAULT 0,
  `children_ages` JSON,
  `guest_first_name` VARCHAR(255) NOT NULL,
  `guest_last_name` VARCHAR(255) NOT NULL,
  `guest_email` VARCHAR(255) NOT NULL,
  `guest_phone` VARCHAR(50),
  `phone_country_code` VARCHAR(10),
  `nationality` VARCHAR(100),
  `special_requests` TEXT,
  `breakfast_included` TINYINT(1) DEFAULT 0,
  `breakfast_total` DECIMAL(10,2) DEFAULT 0,
  `total_price` DECIMAL(10,2) NOT NULL,
  `deposit_amount` DECIMAL(10,2),
  `status` ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `payment_status` ENUM('pending','paid','refunded','failed') DEFAULT 'pending',
  `transaction_hash` VARCHAR(100) UNIQUE,
  `stripe_payment_id` VARCHAR(255),
  `hotel_booking_id` VARCHAR(255),
  `guest_user_id` VARCHAR(36),
  `hotel_notification_status` VARCHAR(50),
  `hotel_notified_at` DATETIME,
  `sync_status` VARCHAR(50),
  `check_out_processed` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`room_category_id`) REFERENCES `room_categories`(`id`) ON DELETE RESTRICT,
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_check_in` (`check_in`),
  INDEX `idx_guest_email` (`guest_email`),
  INDEX `idx_guest_user_id` (`guest_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. 🏠 Booking Rooms Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `booking_rooms` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `booking_id` VARCHAR(36) NOT NULL,
  `room_category_id` VARCHAR(36),
  `room_number` VARCHAR(20),
  `guests_count` INT DEFAULT 1,
  `price_per_night` DECIMAL(10,2) DEFAULT 0,
  `deposit_amount` DECIMAL(10,2) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. 💬 Contact Messages Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `country` VARCHAR(100),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `is_starred` TINYINT(1) DEFAULT 0,
  `replied_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. 📊 Sync History Table
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
-- 14. 📝 API Sync Logs Table
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
-- 15. ⚙️ Local Sync Settings Table
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
-- 16. 👥 Partner Users Table
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
-- 17. 🔔 Webhook Logs Table
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

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 🔑 Create Default Admin User
-- =====================================================
-- Password: Admin@Naity2024
-- ⚠️ CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!
INSERT IGNORE INTO `users` (id, full_name, email, password, role)
VALUES (
  'admin-naity-001',
  'Naity Admin',
  'admin@naitagfz.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.Cg5YXCO',
  'admin'
);

-- =====================================================
-- ✅ Database Setup Complete!
-- =====================================================
-- Tables created: 17
-- Default admin user created
-- 
-- Next steps:
-- 1. Change admin password
-- 2. Test backend connection
-- 3. Start migrating frontend
-- =====================================================
