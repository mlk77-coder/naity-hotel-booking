const { sendContactFormEmail } = require('./utils/mailer');
require('dotenv').config();

console.log("📧 Testing Contact Form Email...\n");
console.log("Support Email Settings:");
console.log("- Host:", process.env.SUPPORT_MAIL_HOST);
console.log("- Port:", process.env.SUPPORT_MAIL_PORT);
console.log("- User:", process.env.SUPPORT_MAIL_USER);
console.log("- Recipient:", process.env.SUPPORT_MAIL_USER);
console.log("\n");

// Sample contact form data
const sampleContact = {
  full_name: "أحمد محمد",
  email: "customer@example.com",
  phone: "+963 981 123 456",
  country: "Syria",
  subject: "booking_issue",
  message: "مرحباً، لدي استفسار بخصوص حجز رقم NAITY-2026-000123. أرجو المساعدة.\n\nHello, I have a question about booking NAITY-2026-000123. Please help."
};

async function testContactEmail() {
  try {
    console.log("📨 Sending contact form email to support@naity.com...");
    const result = await sendContactFormEmail(sampleContact);
    
    if (result) {
      console.log("✅ Contact form email sent successfully!");
      console.log("📬 Check inbox: support@naity.com\n");
      console.log("🎉 Contact form email test passed!");
      console.log("\n💡 The email includes:");
      console.log("   - Customer name and contact info");
      console.log("   - Subject category");
      console.log("   - Full message");
      console.log("   - Reply-To header set to customer email");
    } else {
      console.log("❌ Failed to send email");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testContactEmail();
