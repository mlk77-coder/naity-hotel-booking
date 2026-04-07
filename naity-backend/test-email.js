const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("📧 Testing SMTP Configuration...\n");
console.log("SMTP Settings:");
console.log("- Host:", process.env.MAIL_HOST);
console.log("- Port:", process.env.MAIL_PORT);
console.log("- User:", process.env.MAIL_USER);
console.log("- From:", process.env.MAIL_FROM);
console.log("\n");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

async function testEmail() {
  try {
    console.log("🔄 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!\n");

    console.log("📨 Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_USER, // Send to yourself
      subject: "✅ Test Email from Naity Backend",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">✅ SMTP Configuration Successful!</h1>
          <p>Your email system is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${process.env.MAIL_HOST}</li>
            <li>Port: ${process.env.MAIL_PORT}</li>
            <li>User: ${process.env.MAIL_USER}</li>
          </ul>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This is a test email from Naity Backend.<br/>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    console.log("\n🎉 All email tests passed! Your SMTP is configured correctly.");
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error("Error:", error.message);
    if (error.code) console.error("Code:", error.code);
    if (error.command) console.error("Command:", error.command);
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. Check if MAIL_HOST is correct (should be mail.naity.net or smtp.naity.net)");
    console.log("2. Verify email and password are correct");
    console.log("3. Check if port 465 is open on your server");
    console.log("4. Try port 587 with TLS instead of SSL");
  }
}

testEmail();
