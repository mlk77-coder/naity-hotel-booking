# 📋 Deployment Checklist - Namecheap

## 🎯 What You Need to Upload

### 1️⃣ Frontend Build (Your Website)
**From**: `app/dist/` folder
**To**: `public_html/` on your Namecheap server

### 2️⃣ PHP Sync Scripts
**From**: `app/sync-service/` folder
**Files**: sync.php, test-connection.php, view-logs.php
**To**: `public_html/sync/` on your Namecheap server

## 📤 Upload Steps

### Part A: Upload Frontend

1. ✅ Open Namecheap cPanel
2. ✅ Go to File Manager
3. ✅ Navigate to `public_html/`
4. ✅ Upload ALL files from `app/dist/` folder:
   - index.html
   - assets/ folder (entire folder)
   - All .png, .ico, .svg files
   - robots.txt

### Part B: Upload PHP Scripts

1. ✅ Still in File Manager
2. ✅ In `public_html/`, create new folder: `sync`
3. ✅ Enter the `sync` folder
4. ✅ Upload these 3 files from `app/sync-service/`:
   - sync.php
   - test-connection.php
   - view-logs.php
5. ✅ Set permissions to 644 (select files → Permissions → 644)

## 🗄️ Database Setup (Before Testing)

### Setup Database 1: naitagfz_Naity_Booking

1. ✅ cPanel → phpMyAdmin
2. ✅ Select database: `naitagfz_Naity_Booking`
3. ✅ Click "SQL" tab
4. ✅ Copy/paste `mysql-setup-naitydb.sql`
5. ✅ Click "Go"
6. ✅ Verify: See `rooms` and `reservations` tables

### Setup Database 2: naitagfz_Cham_Soft

1. ✅ In phpMyAdmin, select: `naitagfz_Cham_Soft`
2. ✅ Click "SQL" tab
3. ✅ Copy/paste `mysql-setup-shamsoftdb.sql`
4. ✅ Click "Go"
5. ✅ Verify: See `rooms` and `reservations` tables

## 🧪 Testing

### Test 1: Website

Visit: `https://yourdomain.com`

✅ Should show your Naity hotel booking website

### Test 2: Database Connections

Visit:
```
https://yourdomain.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

✅ Should show: "All tests passed ✅"

### Test 3: Manual Sync

Visit:
```
https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

✅ Should show JSON with sync results

### Test 4: View Logs

Visit:
```
https://yourdomain.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

✅ Should show sync activity logs

## ⏰ Setup Automatic Sync

1. ✅ cPanel → Cron Jobs
2. ✅ Add New Cron Job:
   - Minute: `*/5`
   - Hour: `*`
   - Day: `*`
   - Month: `*`
   - Weekday: `*`
   - Command:
   ```bash
   curl -s "https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2" > /dev/null 2>&1
   ```
3. ✅ Click "Add New Cron Job"

## 🔑 Your Secret Key

```
naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Save this!** You need it for all sync URLs.

## 📁 Final Server Structure

```
public_html/
├── index.html                    (your website)
├── assets/
│   ├── index-CGFzai7d.js
│   ├── index-ArXx8SEX.css
│   └── (other assets)
├── favicon.ico
├── robots.txt
├── (other public files)
└── sync/
    ├── sync.php              (main sync script)
    ├── test-connection.php   (test connections)
    ├── view-logs.php         (view logs)
    └── sync_log.txt          (auto-generated)
```

## ✅ Complete Checklist

### Database Setup
- [ ] naitagfz_Naity_Booking tables created
- [ ] naitagfz_Cham_Soft tables created
- [ ] Both databases have rooms + reservations tables

### File Upload
- [ ] Frontend files uploaded to public_html/
- [ ] sync/ folder created
- [ ] 3 PHP files uploaded to sync/
- [ ] File permissions set to 644

### Testing
- [ ] Website loads at yourdomain.com
- [ ] test-connection.php shows all green
- [ ] sync.php runs successfully
- [ ] view-logs.php shows logs

### Automation
- [ ] Cron job configured (every 5 minutes)
- [ ] Cron job tested (wait 5 min, check logs)

## 🎉 Success!

When everything is checked:
- ✅ Your website is live
- ✅ Sync runs automatically every 5 minutes
- ✅ Reservations flow: Supabase → Both MySQL databases
- ✅ Room availability syncs: Supabase → Both MySQL databases

## 📞 Quick Reference

**Your Secret Key:**
```
naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Test URL:**
```
https://yourdomain.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Sync URL:**
```
https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Logs URL:**
```
https://yourdomain.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

---

**Ready to deploy!** Follow the checklist above step by step.
