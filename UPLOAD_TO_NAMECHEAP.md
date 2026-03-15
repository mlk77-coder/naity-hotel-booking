# 📤 Upload to Namecheap - Complete Guide

## 🎯 What to Upload

You need to upload TWO things:

### 1. Frontend Build (React App)
Location: `app/dist/` folder
Upload to: `public_html/` (your website root)

### 2. PHP Sync Scripts
Location: `app/sync-service/` folder
Files to upload:
- sync.php
- test-connection.php
- view-logs.php

Upload to: `public_html/sync/` (create this folder)

## 📋 Step-by-Step Upload

### Part 1: Upload Frontend (React App)

1. **Log into Namecheap cPanel**

2. **Open File Manager**
   - Click "File Manager" in cPanel

3. **Navigate to public_html**
   - This is your website root

4. **Backup existing files** (if any)
   - Select all files
   - Click "Compress" → Create backup.zip

5. **Delete old files** (optional, or upload over them)
   - Select old files
   - Click "Delete"

6. **Upload new build**
   - Click "Upload" button
   - Select ALL files from `app/dist/` folder:
     - index.html
     - assets/ folder (with all CSS/JS files)
     - All image files (.png, .jpg, .ico, .svg)
     - robots.txt
   - Wait for upload to complete

7. **Verify structure**
   Your public_html should look like:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-CGFzai7d.js
   │   ├── index-ArXx8SEX.css
   │   └── (other asset files)
   ├── apple-touch-icon.png
   ├── favicon.ico
   ├── robots.txt
   └── (other public files)
   ```

### Part 2: Upload PHP Sync Scripts

1. **Still in File Manager**

2. **Navigate to public_html**

3. **Create sync folder**
   - Click "New Folder"
   - Name it: `sync`
   - Click "Create"

4. **Enter sync folder**
   - Double-click the `sync` folder

5. **Upload PHP files**
   - Click "Upload"
   - Select these 3 files from `app/sync-service/`:
     - sync.php
     - test-connection.php
     - view-logs.php
   - Wait for upload to complete

6. **Set file permissions**
   - Select all 3 PHP files
   - Click "Permissions"
   - Set to: 644
   - Click "Change Permissions"

7. **Verify structure**
   Your sync folder should look like:
   ```
   public_html/sync/
   ├── sync.php
   ├── test-connection.php
   └── view-logs.php
   ```

## 🧪 Test Your Upload

### Test Frontend

Visit: `https://yourdomain.com`

You should see your Naity hotel booking website.

### Test PHP Scripts

**Test database connections:**
```
https://yourdomain.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

Should return JSON with "All tests passed ✅"

**Test sync:**
```
https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

Should return JSON with sync results.

## 🔄 Setup Automatic Sync

After testing works:

1. **Go to cPanel → Cron Jobs**

2. **Add New Cron Job:**
   - Minute: `*/5`
   - Hour: `*`
   - Day: `*`
   - Month: `*`
   - Weekday: `*`
   - Command:
   ```bash
   curl -s "https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2" > /dev/null 2>&1
   ```

3. **Click "Add New Cron Job"**

## 📝 Your Secret Key

```
naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Save this key!** You'll need it to:
- Access the sync scripts
- Setup the cron job
- View logs

## ✅ Verification Checklist

- [ ] Frontend uploaded to public_html/
- [ ] Website loads at yourdomain.com
- [ ] sync/ folder created in public_html/
- [ ] 3 PHP files uploaded to sync/
- [ ] File permissions set to 644
- [ ] test-connection.php returns success
- [ ] sync.php runs without errors
- [ ] Cron job configured
- [ ] Logs appear in view-logs.php

## 🎊 You're Done!

Once everything is uploaded and tested:
- Your website is live ✅
- Sync runs every 5 minutes ✅
- Reservations flow to both MySQL databases ✅
- Monitor via view-logs.php ✅

## 📞 Quick Reference URLs

Replace `yourdomain.com` with your actual domain:

```
Website:
https://yourdomain.com

Test Connections:
https://yourdomain.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2

Run Sync:
https://yourdomain.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2

View Logs:
https://yourdomain.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

## 🔒 Security Note

**Never share your SECRET_KEY publicly!** It's like a password for your sync system.
