// Manual Sync Script - Run once without automatic interval
import { DatabaseConnections } from './connections';
import { InventorySync } from './inventory-sync';
import { ReservationSync } from './reservation-sync';
import { Logger } from './logger';

async function runManualSync() {
  Logger.separator();
  Logger.info('🔄 Running Manual Data Sync');
  Logger.separator();

  try {
    // Test connections
    Logger.info('Testing database connections...');
    const connectionsOk = await DatabaseConnections.testConnections();
    
    if (!connectionsOk) {
      throw new Error('Connection tests failed - check your configuration');
    }

    // Run Inventory Sync
    Logger.separator();
    await InventorySync.syncInventory();

    // Run Reservation Sync
    Logger.separator();
    await ReservationSync.syncReservations();

    Logger.separator();
    Logger.success('✨ Manual Sync Completed Successfully');
    Logger.separator();
  } catch (error) {
    Logger.separator();
    Logger.error('💥 Manual Sync Failed', error);
    Logger.separator();
    process.exit(1);
  } finally {
    await DatabaseConnections.closeConnections();
    process.exit(0);
  }
}

runManualSync();
