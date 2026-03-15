// Health Check Script - Returns exit code 0 if healthy, 1 if unhealthy
// Useful for monitoring systems, Docker health checks, etc.

import { DatabaseConnections } from './connections';

async function healthCheck(): Promise<void> {
  try {
    // Quick connection tests
    const mysqlConn = await DatabaseConnections.getMySQLConnection();
    await mysqlConn.ping();
    
    const supabase = DatabaseConnections.getSupabaseClient();
    const { error } = await supabase.from('rooms').select('count').limit(1);
    
    if (error) throw error;
    
    console.log('OK');
    process.exit(0);
  } catch (error) {
    console.error('UNHEALTHY:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await DatabaseConnections.closeConnections();
  }
}

healthCheck();
