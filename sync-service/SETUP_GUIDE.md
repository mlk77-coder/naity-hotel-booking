# Data Sync Agent - Setup Guide

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Configure Environment Variables

Edit `app/.env` and add your Supabase Service Role Key:

```env
SUPABASE_SERVICE_KEY="your_service_role_key_here"
```

**Where to find it:**
- Go to your Supabase Dashboard
- Navigate to: Project Settings > API
- Copy the `service_role` key (NOT the anon key)

### 3. Verify Database Schema

#### MySQL (ShamSoft) - Required Tables

```sql
-- Check if rooms table exists
DESCRIBE rooms;

-- Check if reservations table exists
DESCRIBE reservations;

-- If reservations table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supabase_id VARCHAR(255) UNIQUE,
  room_id VARCHAR(255),
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  check_in DATE,
  check_out DATE,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supabase_id (supabase_id)
);
```

#### Supabase - Required Columns

Make sure your `rooms` table has:
- `external_id` (text) - to match MySQL room IDs
- `type` (text)
- `price_per_night` (numeric)
- `available_rooms` (integer)
- `updated_at` (timestamp)

Make sure your `bookings` table has:
- `id` (uuid)
- `room_id` (text/uuid)
- `guest_name` (text)
- `guest_email` (text)
- `check_in` (date)
- `check_out` (date)
- `total_price` (numeric)
- `status` (text) - must support 'pending' and 'synced'
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 4. Test the Connection

Run a manual sync first to test:

```bash
npm run sync:manual
```

This will:
- Test both database connections
- Run one sync cycle
- Exit when complete
- Show detailed logs

### 5. Run the Automatic Sync Service

```bash
npm run sync
```

This will:
- Run continuously
- Sync every 5 minutes
- Log all operations to console
- Press Ctrl+C to stop

## Running in Production

### Option 1: PM2 (Recommended for Node.js)

```bash
# Install PM2 globally
npm install -g pm2

# Start the sync service
pm2 start npm --name "data-sync-agent" -- run sync

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor logs
pm2 logs data-sync-agent

# Stop the service
pm2 stop data-sync-agent

# Restart the service
pm2 restart data-sync-agent
```

### Option 2: Docker

Create `Dockerfile` in sync-service folder:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
CMD ["npm", "run", "sync"]
```

Run:
```bash
docker build -t data-sync-agent .
docker run -d --name sync-agent --env-file .env data-sync-agent
```

### Option 3: Windows Service (using node-windows)

```bash
npm install -g node-windows
```

Then create a service installer script.

## Customization

### Change Sync Interval

Edit `sync-service/config.ts`:

```typescript
sync: {
  intervalMs: 10 * 60 * 1000, // 10 minutes instead of 5
  enableAutoSync: true,
}
```

### Add More Sync Tasks

Create new sync modules following the pattern:
1. Create `your-sync.ts` in sync-service folder
2. Export a class with static async methods
3. Import and call in `index.ts`

### Customize Logging

Modify `logger.ts` to:
- Write to files
- Send to external logging service
- Add custom log levels
- Format differently

## Monitoring & Alerts

Consider adding:
- Health check endpoint (Express server)
- Email notifications on failures
- Slack/Discord webhooks
- Database logging table
- Metrics collection (Prometheus, etc.)

## Security Notes

- Never commit `.env` file with real credentials
- Use service role key only in secure environments
- Restrict MySQL user permissions to necessary tables only
- Use SSL/TLS for database connections in production
- Rotate credentials regularly

## Troubleshooting

### "Connection refused" errors
- Check if MySQL server allows remote connections
- Verify firewall rules
- Confirm IP whitelist includes your server

### "Authentication failed"
- Double-check credentials in config.ts
- Verify Supabase service key is correct
- Check MySQL user has proper permissions

### "Table doesn't exist"
- Run the schema creation scripts
- Verify database names are correct
- Check user has access to the tables

### Sync runs but no data updates
- Check if there's actually data to sync
- Verify the matching logic (external_id, status fields)
- Review logs for silent failures
- Check data type compatibility
