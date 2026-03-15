# Integrating Sync Service with Your React App

## Overview

The Data Sync Agent runs as a separate Node.js process, independent of your React application. However, you can integrate monitoring and control features into your React admin panel.

## Integration Options

### Option 1: Status Monitoring (Read-Only)

Add a sync status page to your admin panel that shows:
- Last sync time
- Sync success/failure status
- Number of records synced

**Implementation:**
1. Create a `sync_logs` table in Supabase
2. Modify `logger.ts` to write to this table
3. Query from your React admin panel

### Option 2: Manual Trigger Button

Add a button in your admin panel to trigger a manual sync:

**Implementation:**
1. Create a Supabase Edge Function that calls the sync logic
2. Add a button in your admin panel
3. Call the edge function when clicked

### Option 3: Real-Time Status (WebSocket)

Show live sync status in your admin panel:

**Implementation:**
1. Add WebSocket server to sync service
2. Emit events on sync start/complete
3. Listen in React app with WebSocket client

## Example: Simple Status Display

### 1. Create Sync Logs Table in Supabase

```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'inventory' or 'reservation'
  status TEXT NOT NULL, -- 'success' or 'error'
  records_processed INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
```

### 2. Modify Logger to Write to Supabase

Add to `logger.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export class Logger {
  private static supabase = createClient(
    config.supabase.url,
    config.supabase.serviceKey
  );

  static async logToDatabase(
    syncType: string,
    status: 'success' | 'error',
    recordsProcessed: number,
    errorMessage?: string
  ) {
    try {
      await this.supabase.from('sync_logs').insert({
        sync_type: syncType,
        status,
        records_processed: recordsProcessed,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }
}
```

### 3. Create React Component

```typescript
// src/components/admin/SyncStatus.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  records_processed: number;
  error_message?: string;
  created_at: string;
}

export function SyncStatus() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('sync_logs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sync_logs' },
        (payload) => {
          setLogs(prev => [payload.new as SyncLog, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div 
                key={log.id}
                className={`p-3 rounded border ${
                  log.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{log.sync_type}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  {log.status === 'success' 
                    ? `✅ ${log.records_processed} records synced`
                    : `❌ ${log.error_message}`
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4. Add to Admin Dashboard

```typescript
// In your AdminDashboard.tsx or similar
import { SyncStatus } from '@/components/admin/SyncStatus';

// Add to your dashboard layout
<SyncStatus />
```

## Running Both Services Together

### Development

Terminal 1 (React App):
```bash
npm run dev
```

Terminal 2 (Sync Service):
```bash
npm run sync
```

### Production with PM2

```bash
# Start React app (if serving with Node)
pm2 start npm --name "naity-app" -- run preview

# Start sync service
pm2 start npm --name "data-sync-agent" -- run sync

# Save configuration
pm2 save
```

## Environment Variables

Make sure your `.env` has both:

```env
# For React App
VITE_SUPABASE_URL="https://lfnvnxeymkhyzzsvadbp.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"

# For Sync Service
SUPABASE_SERVICE_KEY="your_service_role_key"
```

## Deployment Considerations

### Separate Deployments (Recommended)
- Deploy React app to Vercel/Netlify/etc.
- Deploy sync service to a VPS/EC2/DigitalOcean
- Keeps concerns separated
- Easier to scale independently

### Same Server Deployment
- Build React app: `npm run build`
- Serve with Express/nginx
- Run sync service with PM2
- Both share same `.env` file

## Security Notes

- Sync service needs `service_role` key (admin access)
- React app uses `anon` key (limited access)
- Never expose service_role key to frontend
- Run sync service in secure backend environment only

## Monitoring Integration

You can add monitoring endpoints to the sync service:

```typescript
// Add to sync-service/index.ts
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', lastSync: lastSyncTime });
});

app.get('/status', (req, res) => {
  res.json({
    isRunning: agent.isRunning,
    lastSync: lastSyncTime,
    nextSync: nextSyncTime,
  });
});

app.listen(3001, () => {
  console.log('Monitoring server on port 3001');
});
```

Then query from your React app:
```typescript
const response = await fetch('http://localhost:3001/status');
const status = await response.json();
```
