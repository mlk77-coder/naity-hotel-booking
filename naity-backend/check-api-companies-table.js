const db = require('./config/db');

async function checkTable() {
  try {
    console.log('Checking api_companies table...');
    
    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'api_companies'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Show table structure
      const [columns] = await db.query("DESCRIBE api_companies");
      console.log('\nTable structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
      
      // Count rows
      const [count] = await db.query("SELECT COUNT(*) as total FROM api_companies");
      console.log(`\nTotal rows: ${count[0].total}`);
    } else {
      console.log('\n❌ Table does not exist! Need to create it.');
      console.log('\nRun this SQL to create the table:');
      console.log(`
CREATE TABLE IF NOT EXISTS api_companies (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  base_url VARCHAR(500),
  api_key VARCHAR(255) NOT NULL,
  api_token VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  auth_type VARCHAR(50),
  get_rooms_path VARCHAR(255),
  post_booking_path VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  last_sync_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
