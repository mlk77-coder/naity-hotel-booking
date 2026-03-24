# Cron Job Setup for Namecheap Shared Hosting

## What is a Cron Job?
A cron job automatically runs your sync.php script at scheduled intervals (e.g., every 5 minutes) without you having to manually trigger it.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Login to cPanel
- Go to your Namecheap hosting dashboard
- Click "cPanel" button

### Step 2: Open Cron Jobs
- In cPanel, search for "Cron Jobs" in the search bar
- Or find it under "Advanced" section
- Click on "Cron Jobs"

### Step 3: Choose Interval
Select one of these options:

| Option | Runs Every | Best For |
|--------|-----------|----------|
| **Every 5 minutes** | 5 min | Real-time sync (recommended) |
| Every 10 minutes | 10 min | Moderate traffic |
| Every 30 minutes | 30 min | Low traffic |
| Custom | Your choice | Advanced users |

### Step 4: Enter Command
Copy and paste this command:

```bash
curl -s "https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2"
```

**Alternative (if curl doesn't work):**
```bash
/usr/bin/php /home/naitagfz/public_html/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

### Step 5: Save
- Click "Add New Cron Job"
- You should see it appear in "Current Cron Jobs" list below

---

## 📧 Disable Email Notifications (Optional)

Namecheap sends an email every time the cron runs. To disable:

Add `> /dev/null 2>&1` at the end:
```bash
curl -s "https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2" > /dev/null 2>&1
```

---

## ✅ Verify It's Working

After 5-10 minutes, check the logs:

Visit: `https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`

You should see new entries with recent timestamps appearing automatically.

---

## 🔧 Advanced: Custom Schedule

If you want a custom schedule, use this format:

```
Minute: */5    (every 5 minutes)
Hour: *        (every hour)
Day: *         (every day)
Month: *       (every month)
Weekday: *     (every day of week)
```

**Examples:**
- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`
- Every day at 2 AM: `0 2 * * *`
- Every Monday at 9 AM: `0 9 * * 1`

---

## 🐛 Troubleshooting

### Cron not running?

1. **Check PHP path:**
   - Try `/usr/bin/php` or `/usr/local/bin/php`
   - Or use the curl command instead

2. **Check file permissions:**
   - sync.php should be 644 or 755
   - sync_log.txt should be writable (666 or 777)

3. **Check cPanel email:**
   - Namecheap sends error messages to your cPanel email
   - Look for cron job failure notifications

4. **Test manually first:**
   - Visit the sync URL in your browser
   - Make sure it works before setting up cron

### Still not working?

Contact Namecheap support and ask:
- "What is the correct PHP path for cron jobs?"
- "Can you help me set up a cron job to run a PHP script?"

---

## 📊 Monitoring

**Check sync status:**
```
https://naity.com/sync/view-logs.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Test connections:**
```
https://naity.com/sync/test-connection.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

**Manual sync trigger:**
```
https://naity.com/sync/sync.php?key=naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2
```

---

## 🔐 Security Reminder

- Keep your secret key private: `naity_sync_rDqhMn85HXLcuiTBIaRt6vAmeKY3ClP2`
- Don't share the sync URLs publicly
- Only authorized personnel should access these endpoints

---

## ✨ What Happens After Setup

Once the cron job is active:

1. **Every 5 minutes**, the sync runs automatically
2. **Inventory Sync**: Supabase → NaityDB → ShamSoftDB
3. **Reservation Sync**: Supabase → NaityDB & ShamSoftDB
4. **Logs**: All activity recorded in sync_log.txt
5. **Status Updates**: Bookings marked as 'confirmed' in Supabase

Your system is now fully automated! 🎉

