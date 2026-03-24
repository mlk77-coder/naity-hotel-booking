# cPanel Upload Guide - Naity Hotel Booking

## Step 1: Build the Production Version

Run this command in your terminal (in the `app` folder):

```bash
npm run build
```

This will create a `dist` folder with all your production files.

## Step 2: Files to Upload

### Main Application Files (from `dist` folder)
Upload ALL files from the `dist` folder to your cPanel `public_html` directory:

- `index.html`
- `manifest.json`
- `.htaccess`
- `assets/` folder (contains all CSS, JS, images)
- All icon files (favicon.ico, icon-192.png, icon-512.png, etc.)
- `robots.txt`

### Sync Service Files (from `sync-service` folder)
Upload these to `public_html/sync/` directory:

- `sync.php`
- `test-connection.php`
- `view-logs.php`

## Step 3: Upload via cPanel File Manager

### Method 1: Using cPanel File Manager (Recommended)

1. **Login to cPanel**
   - Go to your Namecheap hosting dashboard
   - Click "cPanel"

2. **Open File Manager**
   - Find "File Manager" in cPanel
   - Click to open

3. **Navigate to public_html**
   - Click on `public_html` folder
   - This is your website root directory

4. **Upload Main Application**
   - Click "Upload" button at the top
   - Select ALL files from your `dist` folder
   - Wait for upload to complete
   - Make sure `.htaccess` is uploaded (enable "Show Hidden Files" in File Manager settings)

5. **Create sync folder**
   - In `public_html`, click "New Folder"
   - Name it: `sync`
   - Enter the `sync` folder

6. **Upload Sync Files**
   - Click "Upload"
   - Upload: `sync.php`, `test-connection.php`, `view-logs.php`

### Method 2: Using FTP (Alternative)

1. **Get FTP Credentials from cPanel**
   - In cPanel, find "FTP Accounts"
   - Create or use existing FTP account

2. **Use FTP Client (FileZilla)**
   - Host: ftp.naity.com (or your domain)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Upload Files**
   - Navigate to `/public_html/`
   - Upload all files from `dist` folder
   - Create `sync` folder and upload PHP files

## Step 4: Verify File Structure

Your `public_html` should look like this:

```
public_html/
├── index.html
├── manifest.json
├── .htaccess
├── favicon.ico
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── robots.txt
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other asset files]
└── sync/
    ├── sync.php
    ├── test-connection.php
    ├── view-logs.php
    └── sync_log.txt (will be created automatically)
```

## Step 5: Set File Permissions

In cPanel File Manager:

1. **For .htaccess**
   - Right-click → Change Permissions
   - Set to: 644

2. **For PHP files in sync folder**
   - Right-click each PHP file → Change Permissions
   - Set to: 644

3. **For sync folder**
   - Right-click → Change Permissions
   - Set to: 755

## Step 6: Test Your Website

1. **Test Main Website**
   - Visit: https://naity.com
   - Should load your React app
   - Check if all pages work (routing)

2. **Test Sync Service**
   - Visit: `https://naity.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`
   - Should show all connections successful

3. **Test Manual Sync**
   - Visit: `https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`
   - Should show sync results

4. **View Logs**
   - Visit: `https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`
   - Should show sync activity

## Step 7: Setup Cron Job (Automatic Sync)

1. **Go to cPanel → Cron Jobs**

2. **Add New Cron Job**
   - Common Settings: "Every 5 minutes" OR
   - Custom: `*/5 * * * *`
   - Command:
   ```bash
   /usr/bin/php /home/naitagfz/public_html/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2 > /dev/null 2>&1
   ```

3. **Save**

## Important Notes

### Security
- ✅ `.htaccess` protects sensitive files
- ✅ Secret key required for sync endpoints
- ✅ HTTPS forced for all connections
- ✅ Security headers enabled

### Performance
- ✅ Gzip compression enabled
- ✅ Browser caching configured
- ✅ Static assets cached for 1 year

### React Router
- ✅ `.htaccess` handles all routes
- ✅ Direct URL access works (e.g., /hotels, /about)
- ✅ Page refresh works on any route

### Sync Service
- ✅ Protected by secret key
- ✅ Logs all activity
- ✅ Runs every 5 minutes via cron

## Troubleshooting

### Issue: 404 on page refresh
**Solution:** Make sure `.htaccess` is uploaded and mod_rewrite is enabled

### Issue: Sync not working
**Solution:** 
- Check file permissions (644 for PHP files)
- Verify database credentials in sync.php
- Check sync logs

### Issue: Images not loading
**Solution:** 
- Verify all files in `assets` folder are uploaded
- Check file paths in browser console

### Issue: Manifest not found
**Solution:** 
- Make sure `manifest.json` is in the root of public_html
- Check that it's referenced in index.html

## Quick Upload Checklist

- [ ] Run `npm run build` in app folder
- [ ] Upload all files from `dist` to `public_html`
- [ ] Upload `.htaccess` to `public_html`
- [ ] Upload `manifest.json` to `public_html`
- [ ] Create `sync` folder in `public_html`
- [ ] Upload PHP files to `sync` folder
- [ ] Set correct file permissions (644 for files, 755 for folders)
- [ ] Test website: https://naity.com
- [ ] Test sync: https://naity.com/sync/test-connection.php?key=...
- [ ] Setup cron job for automatic sync
- [ ] Verify logs are being created

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check sync logs: view-logs.php
3. Check cPanel error logs
4. Verify all files uploaded correctly
