# 🚀 Quick Upload Reference - Naity to cPanel

## ✅ Build Complete!

Your production files are ready in the `dist` folder.

## 📦 What to Upload

### 1. Main Website Files
**From:** `app/dist/` folder  
**To:** cPanel `public_html/` folder  
**Upload ALL files:**
- ✅ index.html
- ✅ manifest.json
- ✅ .htaccess (IMPORTANT!)
- ✅ All icon files (favicon.ico, icon-192.png, etc.)
- ✅ robots.txt
- ✅ og-image.png.jpeg
- ✅ placeholder.svg
- ✅ assets/ folder (entire folder with all JS/CSS/images)

### 2. Sync Service Files
**From:** `app/sync-service/` folder  
**To:** cPanel `public_html/sync/` folder  
**Upload these 3 files:**
- ✅ sync.php
- ✅ test-connection.php
- ✅ view-logs.php

## 🎯 Upload Steps (cPanel File Manager)

1. **Login to cPanel** → Open File Manager
2. **Go to public_html** folder
3. **Delete old files** (keep sync folder if exists)
4. **Upload all files** from `dist` folder
5. **Create/Enter sync folder**
6. **Upload 3 PHP files** to sync folder
7. **Set permissions:**
   - Files: 644
   - Folders: 755

## 🔍 Test URLs

After upload, test these:

1. **Main Website:**
   ```
   https://naity.com
   ```

2. **Test Database Connections:**
   ```
   https://naity.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
   ```

3. **Test Sync:**
   ```
   https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
   ```

4. **View Logs:**
   ```
   https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
   ```

## ⚙️ Cron Job Setup

**Location:** cPanel → Cron Jobs

**Schedule:** Every 5 minutes
```
*/5 * * * *
```

**Command:**
```bash
/usr/bin/php /home/naitagfz/public_html/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2 > /dev/null 2>&1
```

## 📁 Final Structure on Server

```
public_html/
├── index.html              ← Main app
├── manifest.json           ← PWA manifest
├── .htaccess              ← Routing & security
├── favicon.ico
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── robots.txt
├── og-image.png.jpeg
├── placeholder.svg
├── assets/                ← All JS/CSS/images
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
└── sync/                  ← Sync service
    ├── sync.php
    ├── test-connection.php
    ├── view-logs.php
    └── sync_log.txt (auto-created)
```

## ⚠️ Important Notes

- **Don't forget .htaccess** - Enable "Show Hidden Files" in File Manager
- **manifest.json** - Required for PWA functionality
- **Sync folder** - Must be named exactly "sync"
- **Secret key** - Keep it private!

## 🎉 You're Done!

Once uploaded and tested, your website is live with:
- ✅ React SPA with routing
- ✅ PWA support (manifest)
- ✅ Security headers
- ✅ Automatic database sync
- ✅ HTTPS forced
- ✅ Optimized caching

---

**Need detailed instructions?** See `CPANEL_UPLOAD_GUIDE.md`
