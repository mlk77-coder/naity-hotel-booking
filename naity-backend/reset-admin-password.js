require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function resetAdminPassword() {
  console.log("🔐 Resetting admin password...\n");
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
  };

  try {
    const connection = await mysql.createConnection(config);
    
    // Hash the password
    const newPassword = "Admin@Naity2024";
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin user
    await connection.query(
      "UPDATE users SET password = ? WHERE email = 'admin@naitagfz.com'",
      [hashedPassword]
    );
    
    console.log("✅ Admin password reset successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@naitagfz.com");
    console.log("   Password: Admin@Naity2024");
    console.log("\n⚠️  Please change this password after first login!");
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetAdminPassword();
