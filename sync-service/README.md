# Data Sync Agent

A Node.js/TypeScript service that bridges the ShamSoft MySQL database with Supabase PostgreSQL backend.

## Features

- **Inventory Sync**: Pulls room availability and prices from MySQL and updates Supabase
- **Reservation Sync**: Fetches pending reservations from Supabase and inserts them into MySQL
- **Automatic Execution**: Runs every 5 minutes automatically
- **Detailed Logging**: Console logging for all sync operations and errors
- **Error Handling**: Robust try-catch blocks with detailed error reporting

## Configuration

### Environment Variables

Create or update your `.env` file in the app root:

```env
# Supabase Configuration (already exists)
VITE_SUPABASE_URL=https://lfnvnxeymkhyzzsvadbp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here

# Optional: Service Key for admin operations
SUPABASE_SERVICE_KEY=your_service_key_here
```

### MySQL Configuration

The MySQL connection is pre-configured in `config.ts`:
- Host: 184.107.35.137
- Port: 3306
- User: amsoft_naty
- Database: amsoft_Natydb

## Database Schema Requirements

### MySQL (ShamSoft)

```sql
-- Rooms table
CREATE TABLE rooms (
  id INT PRIMARY KEY,
  room_type VARCHAR(255),
  price DECIMAL(10,2),
  availability INT,
  hotel_id INT
);

-- Reservations table
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supabase_id VARCHAR(255) UNIQUE,
  room_id VARCHAR(255),
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  check_in DATE,
  check_out DATE,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP
);
```

### Supabase

```sql
-- Rooms table should have:
-- - external_id (to match MySQL room id)
-- - type
-- - price_per_night
-- - available_rooms

-- Bookings table should have:
-- - id
-- - room_id
-- - guest_name
-- - guest_email
-- - check_in
-- - check_out
-- - total_price
-- - status ('pending', 'synced', etc.)
-- - created_at
-- - updated_at
```

## Usage

### Run the Sync Service

```bash
# From the app directory
npm run sync

# Or run directly with tsx
npx tsx sync-service/index.ts
```

### Run Once (Manual Sync)

You can modify the service to run once by setting `enableAutoSync: false` in `config.ts`.

## Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "sync": "tsx sync-service/index.ts",
    "sync:dev": "tsx watch sync-service/index.ts"
  }
}
```

## Logging

The service provides detailed console logging:

- ℹ️  INFO: General information
- ✅ SUCCESS: Successful operations
- ❌ ERROR: Errors with stack traces
- ⚠️  WARNING: Warnings and non-critical issues

## Error Handling

- Duplicate reservations are handled gracefully
- Connection failures are logged and retried on next cycle
- Individual record failures don't stop the entire sync
- Detailed error messages with stack traces

## Deployment

### Development
Run locally with `npm run sync`

### Production Options

1. **PM2 (Recommended)**
```bash
npm install -g pm2
pm2 start sync-service/index.ts --name data-sync-agent --interpreter tsx
pm2 save
pm2 startup
```

2. **Docker**
Create a Dockerfile and run as a container

3. **Systemd Service**
Create a systemd service file for Linux servers

4. **Cloud Functions**
Deploy as a scheduled cloud function (AWS Lambda, Google Cloud Functions, etc.)

## Monitoring

Monitor the service by:
- Checking console logs
- Setting up log aggregation (e.g., Winston, Pino)
- Adding health check endpoints
- Implementing alerting for failures

## Troubleshooting

### Connection Issues
- Verify MySQL credentials and network access
- Check Supabase URL and API keys
- Ensure firewall rules allow connections

### Sync Failures
- Check database schema matches expected structure
- Verify data types are compatible
- Review error logs for specific issues

### Performance
- Adjust sync interval in `config.ts`
- Add indexes to frequently queried columns
- Consider batch operations for large datasets
