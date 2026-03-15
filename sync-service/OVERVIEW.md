# Data Sync Agent - Complete Overview

## What It Does

The Data Sync Agent is a Node.js/TypeScript service that acts as a bridge between:
- **ShamSoft MySQL Database** (184.107.35.137) - Your hotel management system
- **Supabase PostgreSQL** - Your web application backend

It performs two-way synchronization:
1. **Inventory Sync**: MySQL → Supabase (room availability and pricing)
2. **Reservation Sync**: Supabase → MySQL (new bookings)

## Project Structure

```
app/sync-service/
├── index.ts                 # Main service entry point (auto-sync every 5 min)
├── manual-sync.ts          # Run sync once and exit
├── test-connections.ts     # Test database connections
├── config.ts               # Configuration (MySQL, Supabase, intervals)
├── connections.ts          # Database connection managers
├── logger.ts               # Logging utility
├── inventory-sync.ts       # MySQL → Supabase room sync
├── reservation-sync.ts     # Supabase → MySQL booking sync
├── tsconfig.json           # TypeScript configuration
├── mysql-setup.sql         # MySQL schema setup
├── supabase-setup.sql      # Supabase schema setup
├── README.md               # Technical documentation
├── SETUP_GUIDE.md          # Step-by-step setup instructions
└── OVERVIEW.md             # This file
```

## How It Works

### Inventory Sync (MySQL → Supabase)
1. Connects to MySQL ShamSoft database
2. Fetches all rooms with: `id`, `room_type`, `price`, `availability`
3. Updates Supabase `rooms` table matching by `external_id`
4. Updates: `type`, `price_per_night`, `available_rooms`, `updated_at`

### Reservation Sync (Supabase → MySQL)
1. Queries Supabase for bookings where `status = 'pending'`
2. Inserts each booking into MySQL `reservations` table
3. Updates Supabase booking status to `'synced'`
4. Handles duplicates gracefully

### Automatic Execution
- Runs immediately on startup
- Then repeats every 5 minutes (configurable)
- Continues until stopped (Ctrl+C)

## Quick Commands

```bash
# Test connections only
npm run sync:test

# Run one sync cycle and exit
npm run sync:manual

# Run continuous sync (every 5 minutes)
npm run sync

# Run with auto-reload on code changes
npm run sync:dev
```

## Configuration

### MySQL Connection
Edit `sync-service/config.ts`:
```typescript
mysql: {
  host: '184.107.35.137',
  port: 3306,
  user: 'amsoft_naty',
  password: 'g*TZtRDuyHoF',
  database: 'amsoft_Natydb',
}
```

### Supabase Connection
Add to `app/.env`:
```env
SUPABASE_SERVICE_KEY="your_service_role_key_here"
```

### Sync Interval
Edit `sync-service/config.ts`:
```typescript
sync: {
  intervalMs: 5 * 60 * 1000, // 5 minutes
  enableAutoSync: true,
}
```

## Database Requirements

### MySQL Tables

**rooms** (should already exist):
- `id` - INT
- `room_type` - VARCHAR
- `price` - DECIMAL
- `availability` - INT
- `hotel_id` - INT (optional)

**reservations** (create if needed):
- `id` - INT AUTO_INCREMENT
- `supabase_id` - VARCHAR(255) UNIQUE
- `room_id` - VARCHAR(255)
- `guest_name` - VARCHAR(255)
- `guest_email` - VARCHAR(255)
- `check_in` - DATE
- `check_out` - DATE
- `total_price` - DECIMAL(10,2)
- `created_at` - TIMESTAMP

### Supabase Tables

**rooms**:
- `id` - uuid
- `external_id` - text (maps to MySQL room.id)
- `type` - text
- `price_per_night` - numeric
- `available_rooms` - integer
- `updated_at` - timestamp

**bookings**:
- `id` - uuid
- `room_id` - text/uuid
- `guest_name` - text
- `guest_email` - text
- `check_in` - date
- `check_out` - date
- `total_price` - numeric
- `status` - text ('pending', 'synced', etc.)
- `created_at` - timestamp
- `updated_at` - timestamp

## Setup Steps

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure Supabase Service Key**:
   - Get from: Supabase Dashboard > Project Settings > API
   - Add to `.env`: `SUPABASE_SERVICE_KEY="..."`

3. **Setup MySQL schema**:
   ```bash
   # Run mysql-setup.sql on your MySQL database
   ```

4. **Setup Supabase schema**:
   ```bash
   # Run supabase-setup.sql in Supabase SQL Editor
   ```

5. **Test connections**:
   ```bash
   npm run sync:test
   ```

6. **Run first sync**:
   ```bash
   npm run sync:manual
   ```

7. **Start automatic sync**:
   ```bash
   npm run sync
   ```

## Logging

The service provides detailed console output:

```
================================================================================

[2026-03-15T01:30:00.000Z] ℹ️  INFO: 🔄 Starting Data Sync Cycle

================================================================================

[2026-03-15T01:30:01.000Z] ✅ SUCCESS: MySQL connection established
[2026-03-15T01:30:02.000Z] ✅ SUCCESS: Supabase client initialized
[2026-03-15T01:30:03.000Z] ℹ️  INFO: Fetching rooms from MySQL...
[2026-03-15T01:30:04.000Z] ✅ SUCCESS: Inventory sync completed: 25 updated, 0 errors
[2026-03-15T01:30:05.000Z] ℹ️  INFO: Fetching pending reservations...
[2026-03-15T01:30:06.000Z] ✅ SUCCESS: Synced reservation abc-123
[2026-03-15T01:30:07.000Z] ✅ SUCCESS: Reservation sync completed: 3 synced, 0 errors

================================================================================

[2026-03-15T01:30:08.000Z] ✅ SUCCESS: ✨ Data Sync Cycle Completed Successfully

================================================================================
```

## Production Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start npm --name "data-sync-agent" -- run sync
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t data-sync-agent .
docker run -d --name sync-agent --env-file .env data-sync-agent
```

### As a Windows Service
Use `node-windows` or `nssm` to create a Windows service

## Monitoring

- Console logs show all operations
- Add file logging by modifying `logger.ts`
- Set up alerts for failures
- Monitor database connection health
- Track sync success/failure rates

## Troubleshooting

**Connection Issues:**
- Verify MySQL allows remote connections
- Check firewall rules
- Confirm credentials are correct

**No Data Syncing:**
- Check if `external_id` is set in Supabase rooms
- Verify booking status is 'pending'
- Review logs for errors

**Duplicate Errors:**
- Normal for reservations already synced
- Service handles this gracefully

## Security

- Never commit `.env` with real credentials
- Use service role key only in secure environments
- Restrict MySQL user to necessary permissions
- Use SSL/TLS in production
- Rotate credentials regularly

## Support

For issues or questions:
1. Check logs for error messages
2. Run `npm run sync:test` to verify connections
3. Review database schemas match requirements
4. Check network connectivity to both databases
