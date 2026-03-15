# Data Sync Agent - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Add Supabase Service Key

Edit `app/.env` and add:

```env
SUPABASE_SERVICE_KEY="your_service_role_key_here"
```

Get it from: **Supabase Dashboard → Project Settings → API → service_role key**

### Step 2: Test Connections

```bash
cd app
npm run sync:test
```

You should see:
```
✅ SUCCESS: MySQL connection test passed
✅ SUCCESS: Supabase connection test passed
✅ All connection tests passed!
```

### Step 3: Run Your First Sync

```bash
npm run sync:manual
```

This runs once and shows you what happens.

## 🎯 Run Automatically (Every 5 Minutes)

```bash
npm run sync
```

Press `Ctrl+C` to stop.

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm run sync:test` | Test database connections |
| `npm run sync:manual` | Run sync once and exit |
| `npm run sync` | Run continuously (every 5 min) |
| `npm run sync:dev` | Run with auto-reload on code changes |
| `npm run sync:health` | Quick health check (for monitoring) |

## ⚙️ What Gets Synced

### Inventory (MySQL → Supabase)
- Room types
- Prices
- Availability counts

### Reservations (Supabase → MySQL)
- New bookings with status='pending'
- Guest information
- Check-in/check-out dates
- Total price

## 🔧 Configuration

Edit `sync-service/config.ts` to change:
- Sync interval (default: 5 minutes)
- MySQL connection details
- Enable/disable auto-sync

## 📝 Logs

Watch the console for detailed logs:
- ℹ️  INFO: General operations
- ✅ SUCCESS: Completed tasks
- ❌ ERROR: Failures with details
- ⚠️  WARNING: Non-critical issues

## 🐛 Troubleshooting

**Can't connect to MySQL?**
- Check if your IP is whitelisted on the MySQL server
- Verify credentials in `config.ts`

**Can't connect to Supabase?**
- Make sure `SUPABASE_SERVICE_KEY` is in `.env`
- Check the key has proper permissions

**No data syncing?**
- Run `mysql-setup.sql` on MySQL
- Run `supabase-setup.sql` on Supabase
- Verify `external_id` column exists in Supabase rooms table

## 🚀 Production Deployment

Use PM2 for production:

```bash
npm install -g pm2
pm2 start npm --name "data-sync-agent" -- run sync
pm2 save
pm2 logs data-sync-agent
```

## Need Help?

1. Check `SETUP_GUIDE.md` for detailed setup
2. Check `README.md` for technical details
3. Review `OVERVIEW.md` (this file) for architecture
