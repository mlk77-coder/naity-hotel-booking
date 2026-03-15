// Reservation Sync: Supabase -> MySQL
import { DatabaseConnections } from './connections';
import { Logger } from './logger';

interface SupabaseBooking {
  id: string;
  hotel_id: string;
  room_category_id: string;
  room_number?: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  special_requests?: string;
  created_at: string;
}

export class ReservationSync {
  /**
   * Syncs reservations from Supabase to MySQL
   * Fetches 'pending' bookings from Supabase
   * Inserts them into MySQL and marks as 'confirmed'
   */
  static async syncReservations(): Promise<void> {
    Logger.info('Starting Reservation Sync (Supabase -> MySQL)...');
    
    try {
      const mysqlConn = await DatabaseConnections.getMySQLConnection();
      const supabase = DatabaseConnections.getSupabaseClient();

      // Fetch pending bookings from Supabase
      Logger.info('Fetching pending bookings from Supabase...');
      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (!bookings || bookings.length === 0) {
        Logger.info('No pending bookings to sync');
        return;
      }

      Logger.info(`Found ${bookings.length} pending bookings`);

      let successCount = 0;
      let errorCount = 0;

      // Insert each booking into MySQL
      for (const booking of bookings) {
        try {
          const guestName = `${booking.guest_first_name} ${booking.guest_last_name}`;
          
          // Insert into MySQL
          await mysqlConn.query(
            `INSERT INTO reservations 
            (supabase_id, room_number, guest_name, guest_email, guest_phone, check_in, check_out, total_price, special_requests, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              booking.id,
              booking.room_number || 'TBD',
              guestName,
              booking.guest_email,
              booking.guest_phone || '',
              booking.check_in,
              booking.check_out,
              booking.total_price,
              booking.special_requests || '',
              booking.created_at,
            ]
          );

          // Update status in Supabase to 'confirmed'
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
              status: 'confirmed',
              hotel_notified_at: new Date().toISOString(),
              hotel_notification_status: 'sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);

          if (updateError) {
            throw updateError;
          }

          Logger.success(`Synced booking ${booking.id} - ${guestName}`);
          successCount++;
        } catch (error: any) {
          // Check if it's a duplicate entry error
          if (error.code === 'ER_DUP_ENTRY') {
            Logger.warn(`Booking ${booking.id} already exists in MySQL, marking as confirmed`);
            
            // Still update Supabase status
            await supabase
              .from('bookings')
              .update({ 
                status: 'confirmed',
                hotel_notified_at: new Date().toISOString(),
                hotel_notification_status: 'sent',
              })
              .eq('id', booking.id);
            
            successCount++;
          } else {
            Logger.error(`Failed to sync booking ${booking.id}`, error);
            errorCount++;
          }
        }
      }

      Logger.success(
        `Reservation sync completed: ${successCount} synced, ${errorCount} errors`
      );
    } catch (error) {
      Logger.error('Reservation sync failed', error);
      throw error;
    }
  }
}
