// Sync Service Configuration
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // MySQL Configuration - Namecheap Server
  mysql: {
    host: process.env.MYSQL_HOST || '',
    port: 3306,
    // Naity Booking Database (Main System)
    naityDb: {
      database: 'naitagfz_Naity_Booking',
      user: process.env.MYSQL_NAITY_USER || '',
      password: process.env.MYSQL_NAITY_PASSWORD || '',
    },
    // ShamSoft Database (Local Hotel System)
    shamSoftDb: {
      database: 'naitagfz_Cham_Soft',
      user: process.env.MYSQL_CHAM_USER || '',
      password: process.env.MYSQL_CHAM_PASSWORD || '',
    },
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.VITE_SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },
  
  // Sync Configuration
  sync: {
    intervalMs: 5 * 60 * 1000, // 5 minutes
    enableAutoSync: true,
  },
};
