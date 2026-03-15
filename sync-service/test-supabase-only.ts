// Test Supabase Connection Only
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { Logger } from './logger';

async function testSupabase() {
  Logger.separator();
  Logger.info('🔍 Testing Supabase Connection Only');
  Logger.separator();

  try {
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey
    );

    // Test rooms table
    Logger.info('Testing hotels table access...');
    const { data: hotelsData, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .limit(5);
    
    if (hotelsError) throw hotelsError;
    Logger.success(`Hotels table accessible - found ${hotelsData?.length || 0} hotels`);

    // Test room_availability table
    Logger.info('Testing room_availability table access...');
    const { data: roomsData, error: roomsError } = await supabase
      .from('room_availability')
      .select('*')
      .limit(5);
    
    if (roomsError) throw roomsError;
    Logger.success(`Room availability table accessible - found ${roomsData?.length || 0} rooms`);

    // Test bookings table
    Logger.info('Testing bookings table access...');
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    if (bookingsError) throw bookingsError;
    Logger.success(`Bookings table accessible - found ${bookingsData?.length || 0} bookings`);

    // Check for pending bookings
    const { data: pendingData, error: pendingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending');
    
    if (pendingError) throw pendingError;
    Logger.info(`Found ${pendingData?.length || 0} pending bookings to sync`);

    Logger.separator();
    Logger.success('✅ Supabase connection is working perfectly!');
    Logger.separator();
    
    process.exit(0);
  } catch (error) {
    Logger.separator();
    Logger.error('❌ Supabase connection test failed', error);
    Logger.separator();
    process.exit(1);
  }
}

testSupabase();
