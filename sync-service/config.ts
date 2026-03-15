// Sync Service Configuration
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // MySQL ShamSoft Configuration
  mysql: {
    host: '184.107.35.137',
    port: 3306,
    user: 'amsoft_naty',
    password: 'g*TZtRDuyHoF',
    database: 'amsoft_Natydb',
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
