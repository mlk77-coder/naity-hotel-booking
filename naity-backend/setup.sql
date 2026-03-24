-- =====================================================
-- 🏨 Naity Hotel Booking - MySQL Database Setup
-- =====================================================
-- شغّل هذا الملف في phpMyAdmin أو cPanel لإنشاء الجداول

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 👥 جدول المستخدمين
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
-- 👤 جدول الملفات الشخصية
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
-- 🏨 جدول الفنادق
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
  FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 📸 جدول صور الفنادق
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
-- 🛏️ جدول أنواع الغرف
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
-- 📅 جدول التوفر (room_availability)
-- =====================================================
CREATE TABLE IF NOT EXISTS `room_availability` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `hotel_id` VARCHAR(36) NOT NULL,
  `room_category_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `available_count` INT DEFAULT 0,
  `price_override` DECIMAL(10,2),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_room_date` (`room_category_id`, `date`),
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_category_id`) REFERENCES `room_categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 🚫 جدول التواريخ المحجوبة
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
-- 📋 جدول الحجوزات
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
-- 🏠 جدول غرف الحجز (booking_rooms)
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
-- 💬 جدول رسائل التواصل
-- =====================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 🔑 إنشاء أول حساب Admin
-- =====================================================
-- كلمة المرور: Admin@Naity2024
-- غيّرها فور الدخول لأول مرة!
INSERT IGNORE INTO `users` (id, full_name, email, password, role)
VALUES (
  'admin-naity-001',
  'Naity Admin',
  'admin@naitagfz.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.Cg5YXCO',
  'admin'
);

-- =====================================================
-- ✅ انتهى إعداد قاعدة البيانات
-- =====================================================
