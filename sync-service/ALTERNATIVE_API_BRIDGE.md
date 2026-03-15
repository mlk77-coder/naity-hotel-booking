# Alternative Solution: API Bridge

If deploying to a cloud server is not an option, you can ask the MySQL provider to create a simple API bridge on their server.

## How It Works

```
Your Sync Service → HTTPS API (on their server) → MySQL (localhost)
```

Since the API runs on the same server as MySQL, it can connect via localhost (no IP whitelist needed).

## What They Need to Create

A simple PHP or Node.js API on their server:

### Option A: PHP API (Most Common)

Create `mysql-api.php` on their server:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simple authentication
$api_key = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($api_key !== 'your-secret-api-key-here') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$conn = new mysqli('localhost', 'amsoft_naty', 'g*TZtRDuyHoF', 'amsoft_Natydb');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_rooms':
        $result = $conn->query('SELECT id, room_number, room_type, price, status FROM rooms');
        $rooms = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(['success' => true, 'data' => $rooms]);
        break;
        
    case 'add_reservation':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare(
            'INSERT INTO reservations (supabase_id, room_number, guest_name, guest_email, guest_phone, check_in, check_out, total_price, special_requests, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->bind_param(
            'sssssssdss',
            $data['supabase_id'],
            $data['room_number'],
            $data['guest_name'],
            $data['guest_email'],
            $data['guest_phone'],
            $data['check_in'],
            $data['check_out'],
            $data['total_price'],
            $data['special_requests'],
            $data['created_at']
        );
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Reservation added']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

$conn->close();
?>
```

### Option B: Node.js API (If They Prefer)

```javascript
// server.js on their server
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());

const API_KEY = 'your-secret-api-key-here';

// Authentication middleware
app.use((req, res, next) => {
    if (req.headers['x-api-key'] !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'amsoft_naty',
    password: 'g*TZtRDuyHoF',
    database: 'amsoft_Natydb'
});

app.get('/api/rooms', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, room_number, room_type, price, status FROM rooms');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reservations', async (req, res) => {
    try {
        const data = req.body;
        await pool.query(
            'INSERT INTO reservations (supabase_id, room_number, guest_name, guest_email, guest_phone, check_in, check_out, total_price, special_requests, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.supabase_id, data.room_number, data.guest_name, data.guest_email, data.guest_phone, data.check_in, data.check_out, data.total_price, data.special_requests, data.created_at]
        );
        res.json({ success: true, message: 'Reservation added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('API running on port 3000'));
```

## Updated Sync Service (Using API)

If they create the API, I can update your sync service to use HTTPS requests instead of direct MySQL connection. This would look like:

```typescript
// Instead of:
const [rooms] = await mysqlConn.query('SELECT * FROM rooms');

// Use:
const response = await fetch('https://their-server.com/mysql-api.php?action=get_rooms', {
    headers: { 'X-API-Key': 'your-secret-api-key' }
});
const { data: rooms } = await response.json();
```

## Pros & Cons

**Pros:**
- No IP whitelist needed
- Works from anywhere
- More secure (API key instead of direct DB access)
- Can add rate limiting, logging, etc.

**Cons:**
- Requires them to set up the API
- Slightly more latency
- Depends on their web server

## Which Should You Choose?

1. **If you can deploy to cloud** → Use Railway/Render (easiest)
2. **If they can create API** → Use API bridge (most flexible)
3. **If neither** → Ask them to whitelist `'%'` (all IPs) - less secure but works

Let me know which approach you prefer and I can help you implement it!
