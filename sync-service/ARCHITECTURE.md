# Data Sync Agent - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Data Sync Agent                              │
│                   (Node.js/TypeScript)                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Main Service (index.ts)                    │    │
│  │  • Runs every 5 minutes                                 │    │
│  │  • Orchestrates sync operations                         │    │
│  │  • Handles errors and logging                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│           ┌───────────────┴───────────────┐                     │
│           ▼                               ▼                     │
│  ┌─────────────────┐            ┌─────────────────┐           │
│  │ Inventory Sync  │            │ Reservation Sync│           │
│  │  MySQL → Supabase│            │ Supabase → MySQL│           │
│  └─────────────────┘            └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌──────────────────────┐            ┌──────────────────────┐
│   MySQL Database     │            │  Supabase PostgreSQL │
│   (ShamSoft)         │            │  (Web Backend)       │
│                      │            │                      │
│  • rooms             │            │  • rooms             │
│  • reservations      │            │  • bookings          │
└──────────────────────┘            └──────────────────────┘
```

## Data Flow

### Flow 1: Inventory Sync (MySQL → Supabase)

```
1. MySQL Query
   ↓
   SELECT id, room_type, price, availability FROM rooms
   ↓
2. For each room
   ↓
3. Supabase Update
   ↓
   UPDATE rooms 
   SET type = ?, price_per_night = ?, available_rooms = ?
   WHERE external_id = ?
   ↓
4. Log Results
```

### Flow 2: Reservation Sync (Supabase → MySQL)

```
1. Supabase Query
   ↓
   SELECT * FROM bookings WHERE status = 'pending'
   ↓
2. For each booking
   ↓
3. MySQL Insert
   ↓
   INSERT INTO reservations (supabase_id, room_id, ...)
   VALUES (?, ?, ...)
   ↓
4. Supabase Update
   ↓
   UPDATE bookings SET status = 'synced' WHERE id = ?
   ↓
5. Log Results
```

## Component Architecture

```
sync-service/
│
├── Core Components
│   ├── index.ts              → Main orchestrator
│   ├── config.ts             → Configuration management
│   ├── connections.ts        → Database connection pool
│   └── logger.ts             → Centralized logging
│
├── Sync Modules
│   ├── inventory-sync.ts     → MySQL → Supabase sync
│   └── reservation-sync.ts   → Supabase → MySQL sync
│
├── Utilities
│   ├── manual-sync.ts        → One-time sync runner
│   ├── test-connections.ts   → Connection tester
│   └── health-check.ts       → Health monitoring
│
└── Documentation
    ├── QUICKSTART.md         → Quick start guide
    ├── SETUP_GUIDE.md        → Detailed setup
    ├── README.md             → Technical docs
    ├── OVERVIEW.md           → High-level overview
    └── ARCHITECTURE.md       → This file
```

## Execution Flow

### Automatic Mode (npm run sync)

```
Start
  ↓
Initialize Connections
  ↓
Test Connections
  ↓
Run Sync Cycle ←──────┐
  ├─ Inventory Sync    │
  └─ Reservation Sync  │
  ↓                    │
Log Results           │
  ↓                    │
Wait 5 minutes ───────┘
  ↓
(Repeat until stopped)
```

### Manual Mode (npm run sync:manual)

```
Start
  ↓
Initialize Connections
  ↓
Test Connections
  ↓
Run Sync Cycle
  ├─ Inventory Sync
  └─ Reservation Sync
  ↓
Log Results
  ↓
Close Connections
  ↓
Exit
```

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Sync Operation Starts            │
└─────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Try Block     │
         └────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────┐              ┌──────────┐
│ Success │              │  Error   │
└─────────┘              └──────────┘
    │                           │
    ▼                           ▼
┌─────────┐              ┌──────────┐
│   Log   │              │   Log    │
│ Success │              │  Error   │
└─────────┘              └──────────┘
    │                           │
    └─────────────┬─────────────┘
                  ▼
         ┌────────────────┐
         │  Continue to   │
         │  Next Record   │
         └────────────────┘
```

## Database Schema Mapping

### Rooms Mapping

```
MySQL (rooms)                 Supabase (rooms)
─────────────────            ──────────────────
id                    →      external_id
room_type             →      type
price                 →      price_per_night
availability          →      available_rooms
                             updated_at (auto)
```

### Reservations Mapping

```
Supabase (bookings)          MySQL (reservations)
───────────────────          ────────────────────
id                    →      supabase_id
room_id               →      room_id
guest_name            →      guest_name
guest_email           →      guest_email
check_in              →      check_in
check_out             →      check_out
total_price           →      total_price
created_at            →      created_at
status: 'pending'     →      (triggers sync)
status: 'synced'      ←      (after sync)
```

## Connection Management

```
┌──────────────────────────────────────┐
│     DatabaseConnections Class        │
├──────────────────────────────────────┤
│                                      │
│  MySQL Connection (Singleton)        │
│  ├─ Created on first use             │
│  ├─ Reused for all operations        │
│  └─ Closed on shutdown               │
│                                      │
│  Supabase Client (Singleton)         │
│  ├─ Created on first use             │
│  ├─ Reused for all operations        │
│  └─ No explicit close needed         │
│                                      │
└──────────────────────────────────────┘
```

## Logging Architecture

```
┌─────────────────────────────────────┐
│         Logger Class                 │
├─────────────────────────────────────┤
│                                     │
│  info()    → ℹ️  Blue text          │
│  success() → ✅ Green text          │
│  error()   → ❌ Red text + stack    │
│  warn()    → ⚠️  Yellow text        │
│                                     │
│  All include:                       │
│  • Timestamp (ISO 8601)             │
│  • Message                          │
│  • Optional data/error object       │
│                                     │
└─────────────────────────────────────┘
```

## Configuration Hierarchy

```
Environment Variables (.env)
  ↓
config.ts (hardcoded + env)
  ↓
Runtime Configuration
  ├─ MySQL credentials
  ├─ Supabase credentials
  └─ Sync settings
```

## Deployment Patterns

### Pattern 1: Standalone Service
```
Server/VM
  └─ Node.js Runtime
      └─ Data Sync Agent
          ├─ Runs continuously
          └─ Managed by PM2/systemd
```

### Pattern 2: Docker Container
```
Docker Host
  └─ Container
      └─ Node.js + Sync Agent
          ├─ Auto-restart on failure
          └─ Environment from secrets
```

### Pattern 3: Scheduled Job
```
Cron/Task Scheduler
  └─ Runs npm run sync:manual
      └─ Every 5 minutes
          └─ Exits after completion
```

## Security Layers

```
┌─────────────────────────────────────┐
│     Application Layer                │
│  • Service key in environment        │
│  • No credentials in code            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Transport Layer                  │
│  • MySQL: TCP (consider SSL)         │
│  • Supabase: HTTPS                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Database Layer                   │
│  • MySQL: User permissions           │
│  • Supabase: RLS policies            │
└─────────────────────────────────────┘
```

## Performance Considerations

- **Connection Pooling**: Single connection reused
- **Batch Operations**: Could be added for large datasets
- **Error Recovery**: Individual failures don't stop sync
- **Logging Overhead**: Minimal, console-only by default
- **Memory Usage**: Low, processes records sequentially

## Scalability

Current design handles:
- ✅ Hundreds of rooms
- ✅ Dozens of reservations per cycle
- ✅ 5-minute sync interval

For higher scale, consider:
- Batch processing
- Parallel operations
- Database connection pooling
- Queue-based architecture
- Horizontal scaling with locks
