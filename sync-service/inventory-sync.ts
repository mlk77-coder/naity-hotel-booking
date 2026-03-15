// Inventory Sync: MySQL -> Supabase
import { DatabaseConnections } from './connections';
import { Logger } from './logger';
import { RowDataPacket } from 'mysql2';

interface MySQLRoom extends RowDataPacket {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  hotel_id?: number;
}

export class InventorySync {
  /**
   * Syncs room inventory from MySQL to Supabase
   * Pulls room data from ShamSoft MySQL
   * Updates corresponding records in Supabase room_availability table
   */
  static async syncInventory(): Promise<void> {
    Logger.info('Starting Inventory Sync (MySQL -> Supabase)...');
    
    try {
      const mysqlConn = await DatabaseConnections.getMySQLConnection();
      const supabase = DatabaseConnections.getSupabaseClient();

      // Fetch rooms from MySQL
      Logger.info('Fetching rooms from MySQL ShamSoft database...');
      const [mysqlRooms] = await mysqlConn.query<MySQLRoom[]>(
        'SELECT id, room_number, room_type, price, status FROM rooms'
      );

      if (!mysqlRooms || mysqlRooms.length === 0) {
        Logger.warn('No rooms found in MySQL database');
        return;
      }

      Logger.info(`Found ${mysqlRooms.length} rooms in MySQL`);

      let successCount = 0;
      let errorCount = 0;
      let insertCount = 0;
      let updateCount = 0;

      // First, get the default hotel_id from Supabase (assuming single hotel for now)
      const { data: hotels } = await supabase
        .from('hotels')
        .select('id')
        .limit(1)
        .single();

      if (!hotels) {
        Logger.error('No hotel found in Supabase - please create a hotel first');
        return;
      }

      const defaultHotelId = hotels.id;
      Logger.info(`Using hotel_id: ${defaultHotelId}`);

      // Sync each room to Supabase room_availability
      for (const room of mysqlRooms) {
        try {
          // Check if room already exists
          const { data: existing } = await supabase
            .from('room_availability')
            .select('id')
            .eq('hotel_id', defaultHotelId)
            .eq('room_number', room.room_number)
            .single();

          if (existing) {
            // Update existing room
            const { error } = await supabase
              .from('room_availability')
              .update({
                category_name: room.room_type,
                price_per_night: room.price,
                status: room.status === 'available' ? 'available' : 'occupied',
                last_updated_by_hotel: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);

            if (error) throw error;
            updateCount++;
          } else {
            // Insert new room
            const { error } = await supabase
              .from('room_availability')
              .insert({
                hotel_id: defaultHotelId,
                room_number: room.room_number,
                category_name: room.room_type,
                price_per_night: room.price,
                status: room.status === 'available' ? 'available' : 'occupied',
                last_updated_by_hotel: new Date().toISOString(),
              });

            if (error) throw error;
            insertCount++;
          }

          successCount++;
        } catch (error) {
          Logger.error(`Failed to sync room ${room.room_number}`, error);
          errorCount++;
        }
      }

      Logger.success(
        `Inventory sync completed: ${successCount} synced (${insertCount} new, ${updateCount} updated), ${errorCount} errors`
      );
    } catch (error) {
      Logger.error('Inventory sync failed', error);
      throw error;
    }
  }
}
