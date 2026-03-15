-- MySQL Setup Script for ShamSoft Database
-- Run this on your MySQL database: amsoft_Natydb

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supabase_id VARCHAR(255) UNIQUE NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_supabase_id (supabase_id),
  INDEX idx_check_in (check_in),
  INDEX idx_guest_email (guest_email),
  INDEX idx_room_number (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify rooms table structure (should already exist)
-- Expected columns: id, room_number, room_type, price, status
DESCRIBE rooms;

-- Sample query to check rooms data
SELECT id, room_number, room_type, price, status 
FROM rooms 
LIMIT 5;

-- Sample query to check reservations
SELECT * FROM reservations 
ORDER BY created_at DESC 
LIMIT 5;
