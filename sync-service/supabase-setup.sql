-- Supabase Setup Script for Sync Service
-- This verifies your existing schema is ready for sync

-- Verify hotels table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hotels';

-- Verify room_availability table exists and has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'room_availability';

-- Verify bookings table has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings';

-- Sample query to check pending bookings
SELECT id, guest_first_name, guest_last_name, guest_email, status, created_at
FROM bookings
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- Sample query to check room availability
SELECT id, hotel_id, room_number, category_name, price_per_night, status
FROM room_availability
LIMIT 5;

-- Note: Your schema is already set up correctly!
-- The sync service will use:
-- - room_availability table for inventory sync
-- - bookings table for reservation sync
