const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔍 Testing support@naity.com SMTP Configuration...\n");

const config = {
  host: process.env.SUPPORT_MAIL_HOST,
  port: parseInt(process.env.SUPPORT_MAIL_PORT),
  user: process.env.SUPPORT_MAIL_USER,
  pass: process.env.SUPPORT_MAIL_PASS,
};

console.log("Configuration:");
console.log("- Host:", config.host);
console.log("- Port:", config.port);
console.log("- User:", config.user);
console.log("- Pass:", config.pass ? "***" + config.pass.slice(-4) : "NOT SET");
console.log("\n");

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.port === 465,
  auth: {
    user: config.user,
    pass: config.pass,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

async function testConnection() {
  try {
    console.log("🔄 Step 1: Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("🔄 Step 2: Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.SUPPORT_MAIL_FROM,
      to: config.user, // Send to self
      subject: "✅ Test Email - support@naity.com",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #10b981;">✅ SMTP Test Successful!</h1>
          <p>Your support@naity.com email is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>User: ${config.user}</li>
          </ul>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Test time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    console.log("\n🎉 All tests passed! support@naity.com is configured correctly.");
    
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error("Error:", error.message);
    if (error.code) console.error("Code:", error.code);
    if (error.command) console.error("Command:", error.command);
    
    console.log("\n💡 Troubleshooting:");
    
    if (error.message.includes("authentication") || error.code === "EAUTH") {
      console.log("❌ Authentication failed - Possible causes:");
      console.log("   1. Email account doesn't exist on mail.naity.net");
      console.log("   2. Password is incorrect");
      console.log("   3. Email account is on a different server");
      console.log("\n✅ Solution:");
      console.log("   - Create support@naity.com email in cPanel on naity.net domain");
      console.log("   - OR use support@naity.net instead (same server as no-replay@naity.net)");
    } else if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      console.log("❌ Connection timeout - Possible causes:");
      console.log("   1. Email server doesn't exist");
      console.log("   2. Port is blocked");
      console.log("   3. Wrong SMTP host");
      console.log("\n✅ Solution:");
      console.log("   - Verify SMTP host is correct");
      console.log("   - Try different port (587 instead of 465)");
    } else if (error.message.includes("certificate") || error.message.includes("altnames")) {
      console.log("❌ SSL Certificate issue - This is normal for shared hosting");
      console.log("✅ Already handled with rejectUnauthorized: false");
    }
  }
}

testConnection();
