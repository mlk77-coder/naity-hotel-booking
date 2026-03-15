# Deploy Sync Service to Railway.app

Railway provides free hosting with a static IP address - perfect for your MySQL whitelist needs.

## Step 1: Prepare Your Code

Create a `Procfile` in the sync-service folder:

```
worker: npm run sync
```

## Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (free)

## Step 3: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your repository

## Step 4: Configure Environment Variables

In Railway dashboard, add these variables:

```
VITE_SUPABASE_URL=https://lfnvnxeymkhyzzsvadbp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbnZueGV5bWtoeXp6c3ZhZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDM0NzcsImV4cCI6MjA4ODI3OTQ3N30.687F_jpEBWkciZv2ySJNjxt7bBQqxmPEWAzbtjnCLdo
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbWd0b3FpbGJrYWt4aWtpZ3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUzNTA3MywiZXhwIjoyMDg4MTExMDczfQ.EwRswaOkNiC9xZNhjB8vYg-WOR41GAuaobSGTxj3FKM
```

## Step 5: Configure Build Settings

In Railway settings:
- **Root Directory**: `app`
- **Build Command**: `npm install --legacy-peer-deps`
- **Start Command**: `npm run sync`

## Step 6: Get Your Static IP

1. Once deployed, go to Railway dashboard
2. Click on your service
3. Go to "Settings" tab
4. Look for "Networking" or "Public Networking"
5. You'll see your static IP address

## Step 7: Whitelist Railway IP

Send the Railway static IP to your MySQL provider and ask them to whitelist it.

## Alternative: Render.com

Similar process:
1. Go to https://render.com
2. Create "Background Worker"
3. Connect GitHub repo
4. Set build command: `cd app && npm install --legacy-peer-deps`
5. Set start command: `cd app && npm run sync`
6. Add environment variables
7. Get static IP from Render dashboard

## Alternative: DigitalOcean ($4/month)

Most reliable option:
1. Create a $4/month droplet
2. SSH into it
3. Clone your repo
4. Install Node.js
5. Run `npm install && npm run sync`
6. Use PM2 to keep it running
7. Droplet has a static IP that never changes

## Cost Comparison

- **Railway**: Free tier (500 hours/month)
- **Render**: Free tier (750 hours/month)
- **DigitalOcean**: $4/month (always on)
- **AWS EC2**: Free tier for 12 months
- **Google Cloud**: $300 free credit

## Recommended: Railway

Railway is the easiest and has generous free tier. Perfect for this use case.
