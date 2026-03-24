# 📸 Visual Cron Job Setup Guide

## Step-by-Step with Screenshots

---

### Step 1: Login to cPanel
1. Go to Namecheap Dashboard
2. Find your hosting account
3. Click the **"cPanel"** button (usually a big orange/blue button)

---

### Step 2: Find Cron Jobs
1. You'll see the cPanel dashboard with many icons
2. Look for the search box at the top
3. Type: **"cron"**
4. Click on **"Cron Jobs"** icon (looks like a clock)

**OR** scroll down to the **"Advanced"** section and find "Cron Jobs"

---

### Step 3: Add New Cron Job

You'll see a form with these fields:

#### A. Common Settings (Dropdown)
Click the dropdown and select: **"Every 5 minutes"**

This will automatically fill in:
```
Minute: */5
Hour: *
Day: *
Month: *
Weekday: *
```

#### B. Command Field
This is the most important part! Copy and paste this EXACT command:

```
curl -s "https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2"
```

**What this does:**
- `curl -s` = Silently fetch a URL
- Your sync URL with the secret key
- Runs every 5 minutes automatically

---

### Step 4: Click "Add New Cron Job"

Click the blue **"Add New Cron Job"** button at the bottom of the form.

---

### Step 5: Verify It Was Added

After clicking, you should see:
- A success message at the top
- Your new cron job listed in the **"Current Cron Jobs"** section below
- It will show:
  - Schedule: `*/5 * * * *`
  - Command: Your curl command
  - Actions: Edit | Delete buttons

---

## 🎯 What You Should See

### In "Current Cron Jobs" section:
```
Minute  Hour  Day  Month  Weekday  Command
*/5     *     *    *      *        curl -s "https://naity.com/sync/..."
```

---

## ✅ Test It's Working

### Wait 5-10 minutes, then:

1. **Check the logs:**
   Visit: https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
   
   You should see NEW entries with recent timestamps like:
   ```
   [2026-03-16 04:10:52] 🚀 Data Sync Started
   [2026-03-16 04:10:53] ✨ Data Sync Completed Successfully
   [2026-03-16 04:15:52] 🚀 Data Sync Started
   [2026-03-16 04:15:53] ✨ Data Sync Completed Successfully
   ```

2. **Check your email:**
   - Namecheap will send you an email for each cron run
   - Subject: "Cron <username@domain> curl -s ..."
   - If you see these emails, the cron is working!

---

## 🔕 Stop Email Notifications (Optional)

If you're getting too many emails, update the command to:

```
curl -s "https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2" > /dev/null 2>&1
```

This redirects output to nowhere, so no emails are sent.

---

## 🛠️ Troubleshooting

### Problem: Cron job not appearing in list
**Solution:** Make sure you clicked "Add New Cron Job" button

### Problem: Getting error emails
**Solution:** 
1. Check the error message in the email
2. Try the alternative PHP command instead of curl
3. Verify your sync.php file is uploaded correctly

### Problem: No logs appearing after 10 minutes
**Solution:**
1. Test manually first: Visit the sync URL in your browser
2. Check if sync.php is in the correct folder: `/home/naitagfz/public_html/sync/`
3. Verify file permissions (should be 644)

### Problem: "Command not found" error
**Solution:** Use the curl command instead of the PHP command

---

## 📱 Alternative: Use PHP Command

If curl doesn't work, try this command instead:

```
/usr/bin/php /home/naitagfz/public_html/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**To find your PHP path:**
1. In cPanel, open "Terminal" (if available)
2. Type: `which php`
3. Use that path in your cron command

---

## 🎉 Success Checklist

- ✅ Cron job appears in "Current Cron Jobs" list
- ✅ Receiving cron emails (or disabled them)
- ✅ New log entries appearing every 5 minutes
- ✅ Timestamps in logs are recent
- ✅ No error messages in logs

---

## 📊 Monitor Your Sync

**View Logs:**
```
https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Test Connections:**
```
https://naity.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Manual Trigger:**
```
https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

---

## 🔄 The Complete Flow

Once cron is set up, here's what happens automatically:

```
Every 5 minutes:
  ↓
Cron triggers sync.php
  ↓
1. Fetch room availability from Supabase
  ↓
2. Update naitagfz_Naity_Booking (Bridge DB)
  ↓
3. Update naitagfz_Cham_Soft (Target DB)
  ↓
4. Fetch pending bookings from Supabase
  ↓
5. Insert into naitagfz_Naity_Booking
  ↓
6. Insert into naitagfz_Cham_Soft
  ↓
7. Update Supabase status to 'confirmed'
  ↓
8. Log everything to sync_log.txt
  ↓
Done! ✨
```

---

## 🚨 Important Notes

1. **Don't delete the cron job** - Your sync will stop working
2. **Keep the secret key private** - Anyone with it can trigger your sync
3. **Monitor the logs regularly** - Check for errors or issues
4. **Test after setup** - Wait 10 minutes and verify logs are updating

---

## Need Help?

If you're stuck, contact Namecheap support and say:

> "I need help setting up a cron job to run a PHP script every 5 minutes. The command is: curl -s 'https://naity.com/sync/sync.php?key=MYKEY'"

They'll guide you through the cPanel interface.
