// Main Sync Service Entry Point
import { DatabaseConnections } from './connections';
import { InventorySync } from './inventory-sync';
import { ReservationSync } from './reservation-sync';
import { Logger } from './logger';
import { config } from './config';

class DataSyncAgent {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Runs a complete sync cycle
   */
  async runSyncCycle(): Promise<void> {
    if (this.isRunning) {
      Logger.warn('Sync already in progress, skipping this cycle');
      return;
    }

    this.isRunning = true;
    Logger.separator();
    Logger.info('🔄 Starting Data Sync Cycle');
    Logger.separator();

    try {
      // Test connections first
      const connectionsOk = await DatabaseConnections.testConnections();
      if (!connectionsOk) {
        throw new Error('Connection tests failed');
      }

      // Run Inventory Sync (MySQL -> Supabase)
      Logger.separator();
      await InventorySync.syncInventory();

      // Run Reservation Sync (Supabase -> MySQL)
      Logger.separator();
      await ReservationSync.syncReservations();

      Logger.separator();
      Logger.success('✨ Data Sync Cycle Completed Successfully');
      Logger.separator();
    } catch (error) {
      Logger.separator();
      Logger.error('💥 Data Sync Cycle Failed', error);
      Logger.separator();
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Starts the automatic sync service
   */
  start(): void {
    Logger.info(`🚀 Starting Data Sync Agent (Interval: ${config.sync.intervalMs / 1000}s)`);
    
    // Run immediately on start
    this.runSyncCycle();

    // Then run every 5 minutes
    if (config.sync.enableAutoSync) {
      this.intervalId = setInterval(() => {
        this.runSyncCycle();
      }, config.sync.intervalMs);
      
      Logger.info('✅ Automatic sync enabled - running every 5 minutes');
    }
  }

  /**
   * Stops the automatic sync service
   */
  async stop(): Promise<void> {
    Logger.info('🛑 Stopping Data Sync Agent...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    await DatabaseConnections.closeConnections();
    Logger.success('Data Sync Agent stopped');
  }
}

// Main execution
const agent = new DataSyncAgent();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  Logger.info('Received SIGINT signal');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('Received SIGTERM signal');
  await agent.stop();
  process.exit(0);
});

// Start the agent
agent.start();

export default agent;
