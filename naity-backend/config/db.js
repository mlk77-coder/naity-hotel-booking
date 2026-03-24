const mysql = require("mysql2/promise");
require("dotenv").config();

// ✅ نستخدم Pool بدل connection مباشر - أفضل للإنتاج
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
  charset: "utf8mb4",
});

// اختبار الاتصال عند التشغيل
pool.getConnection()
  .then((conn) => {
    console.log("✅ Connected to MySQL Database");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // اوقف السيرفر لو ما قدر يتصل
  });

module.exports = pool;
