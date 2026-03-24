const db = require('./config/db');

async function checkTable() {
  try {
    console.log('Checking tech_partners table...');
    
    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'tech_partners'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Show table structure
      const [columns] = await db.query("DESCRIBE tech_partners");
      console.log('\nTable structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
      
      // Count rows
      const [count] = await db.query("SELECT COUNT(*) as total FROM tech_partners");
      console.log(`\nTotal rows: ${count[0].total}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
