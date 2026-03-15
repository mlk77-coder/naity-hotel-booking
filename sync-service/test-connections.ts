// Test Database Connections
import { DatabaseConnections } from './connections';
import { Logger } from './logger';

async function testConnections() {
  Logger.separator();
  Logger.info('🔍 Testing Database Connections');
  Logger.separator();

  try {
    // Test MySQL Connection
    Logger.info('Testing MySQL connection...');
    const mysqlConn = await DatabaseConnections.getMySQLConnection();
    
    // Try a simple query
    const [mysqlResult] = await mysqlConn.query('SELECT COUNT(*) as count FROM rooms');
    Logger.success('MySQL connection successful', mysqlResult);

    // Test Supabase Connection
    Logger.info('Testing Supabase connection...');
    const supabase = DatabaseConnections.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('hotels')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    Logger.success('Supabase connection successful');

    // Test Supabase bookings table
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .eq('status', 'pending')
      .limit(1);
    
    if (bookingsError) throw bookingsError;
    Logger.success('Supabase bookings table accessible');

    // Test room_availability table
    const { data: roomsData, error: roomsError } = await supabase
      .from('room_availability')
      .select('count')
      .limit(1);
    
    if (roomsError) throw roomsError;
    Logger.success('Supabase room_availability table accessible');

    Logger.separator();
    Logger.success('✅ All connection tests passed!');
    Logger.separator();
    
  } catch (error) {
    Logger.separator();
    Logger.error('❌ Connection test failed', error);
    Logger.separator();
    process.exit(1);
  } finally {
    await DatabaseConnections.closeConnections();
    process.exit(0);
  }
}

testConnections();
