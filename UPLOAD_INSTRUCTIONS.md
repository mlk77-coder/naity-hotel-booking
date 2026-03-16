# 📤 Upload Instructions - UPDATED

## ⚠️ Important Fixes Applied

1. ✅ Supabase URL corrected to: `scmgtoqilbkakxikigtz.supabase.co`
2. ✅ MySQL host changed to: `localhost` (for same-server connection)
3. ✅ Secret key set to: `naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`

## 📦 What to Upload

### Upload 1: Frontend (Website)
**From**: `app/dist/` folder (freshly built)
**To**: `public_html/` on Namecheap

### Upload 2: PHP Sync Scripts
**From**: `app/sync-service/`
**Files**: 
- sync.php (UPDATED)
- test-connection.php (UPDATED)
- view-logs.php (UPDATED)

**To**: `public_html/sync/` on Namecheap

## 🚀 Upload Steps

### Step 1: Upload Frontend

1. Open Namecheap cPanel → File Manager
2. Go to `public_html/`
3. Upload ALL files from `app/dist/`:
   - index.html
   - assets/ folder (entire folder with all files)
   - All .png, .ico, .svg, .jpg files
   - robots.txt

### Step 2: Upload PHP Scripts

1. In `public_html/`, create folder: `sync`
2. Enter the `sync` folder
3. Upload these 3 files from `app/sync-service/`:
   - sync.php
   - test-connection.php  
   - view-logs.php
4. Select all 3 files → Permissions → Set to 644

### Step 3: Setup Databases

**In phpMyAdmin:**

**For naitagfz_Naity_Booking:**
- Select database
- SQL tab
- Paste `mysql-setup-naitydb.sql`
- Click Go

**For naitagfz_Cham_Soft:**
- Select database
- SQL tab
- Paste `mysql-setup-shamsoftdb.sql`
- Click Go

## 🧪 Test After Upload

### Test 1: Website
```
https://yourdomain.com
```

### Test 2: Database Connections
```
https://yourdomain.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

Expected: All tests should pass now!

### Test 3: Run Sync
```
https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

### Test 4: View Logs
```
https://yourdomain.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

## ⏰ Setup Cron Job

cPanel → Cron Jobs → Add:

```
*/5 * * * * curl -s "https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2" > /dev/null 2>&1
```

## 🔑 Your Secret Key

```
naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

## ⚠️ One More Thing Needed

You need to get the **anon/public key** from your Supabase project:

1. Supabase Dashboard → Settings → API
2. Copy the "anon public" key
3. Update `.env` file with it
4. Rebuild: `npm run build`
5. Re-upload the dist/ folder

Or just tell me the anon key and I'll update it for you!

## 📋 Quick Checklist

- [ ] Get Supabase anon key
- [ ] Update .env with anon key
- [ ] Rebuild frontend
- [ ] Upload dist/ to public_html/
- [ ] Upload 3 PHP files to public_html/sync/
- [ ] Setup databases in phpMyAdmin
- [ ] Test all URLs
- [ ] Setup cron job

---

**Almost there!** Just need the Supabase anon key to complete the setup.
