require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    console.log("✅ Connected to database");

    // Check all tables
    const [tables] = await connection.query("SHOW TABLES");
    console.log("\n📊 Tables in database:");
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0];
      console.log(`${i + 1}. ${tableName}`);
    });

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkTables();
