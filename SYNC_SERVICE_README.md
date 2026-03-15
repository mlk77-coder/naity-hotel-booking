# 🔄 Data Sync Agent - Getting Started

Your Data Sync Agent is ready! It bridges your ShamSoft MySQL database with Supabase.

## 📁 Location

All sync service files are in: `app/sync-service/`

## ⚡ Quick Start (3 Steps)

### 1️⃣ Add Supabase Service Key

Edit `app/.env` and add:
```env
SUPABASE_SERVICE_KEY="your_service_role_key_here"
```

Get it from: **Supabase Dashboard → Settings → API → service_role**

### 2️⃣ Test Connections

```bash
npm run sync:test
```

### 3️⃣ Run First Sync

```bash
npm run sync:manual
```

## 🎮 Commands

| Command | What It Does |
|---------|--------------|
| `npm run sync:test` | Test database connections |
| `npm run sync:manual` | Run sync once |
| `npm run sync` | Run every 5 minutes (continuous) |
| `npm run sync:dev` | Run with auto-reload |
| `npm run sync:health` | Quick health check |

## 📚 Documentation

- **QUICKSTART.md** - Fast setup guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **OVERVIEW.md** - What it does and how
- **ARCHITECTURE.md** - Technical architecture
- **INTEGRATION.md** - Integrate with React app
- **README.md** - Full technical documentation

## 🔄 What Gets Synced

**Inventory (MySQL → Supabase):**
- Room types, prices, availability
- Updates every 5 minutes

**Reservations (Supabase → MySQL):**
- New bookings with status='pending'
- Marks as 'synced' after transfer

## 🗄️ Database Setup

Run these SQL scripts:
- `mysql-setup.sql` on MySQL (creates reservations table)
- `supabase-setup.sql` on Supabase (adds external_id column)

## 🚀 Production Deployment

Use PM2 for production:
```bash
npm install -g pm2
pm2 start npm --name "data-sync-agent" -- run sync
pm2 save
```

## 🆘 Need Help?

1. Check `sync-service/QUICKSTART.md` for setup
2. Run `npm run sync:test` to diagnose issues
3. Review logs for error messages

## 🔐 Security

- Service key has admin privileges - keep it secure
- Never commit `.env` file
- Run sync service in secure backend only

---

**Ready to sync?** Run `npm run sync:test` to get started!
