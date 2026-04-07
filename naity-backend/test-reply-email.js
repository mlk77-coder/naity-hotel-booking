const { sendReplyToContact } = require('./utils/mailer');
require('dotenv').config();

console.log("📧 Testing Admin Reply Email...\n");
console.log("Email Settings:");
console.log("- From:", process.env.MAIL_FROM);
console.log("- SMTP Host:", process.env.MAIL_HOST);
console.log("- SMTP User:", process.env.MAIL_USER);
console.log("\n");

// Sample reply data (as if admin is replying to a customer)
const sampleReply = {
  recipient_email: "no-replay@naity.net", // Send to yourself for testing
  recipient_name: "أحمد محمد",
  original_message: "مرحباً، لدي استفسار بخصوص حجز رقم NAITY-2026-000123. أرجو المساعدة.\n\nHello, I have a question about booking NAITY-2026-000123. Please help.",
  reply_message: "مرحباً أحمد،\n\nشكراً لتواصلك معنا. تم مراجعة حجزك رقم NAITY-2026-000123 وكل شيء على ما يرام. سيتم تأكيد الحجز خلال 24 ساعة.\n\nإذا كان لديك أي استفسارات أخرى، لا تتردد في التواصل معنا.\n\n---\n\nHello Ahmed,\n\nThank you for contacting us. We have reviewed your booking NAITY-2026-000123 and everything is in order. The booking will be confirmed within 24 hours.\n\nIf you have any other questions, please don't hesitate to contact us.",
  admin_name: "فريق الدعم / Support Team"
};

async function testReplyEmail() {
  try {
    console.log("📨 Sending admin reply email...");
    console.log("To:", sampleReply.recipient_email);
    console.log("From:", process.env.MAIL_FROM);
    console.log("\n");
    
    const result = await sendReplyToContact(sampleReply);
    
    if (result) {
      console.log("✅ Admin reply email sent successfully!");
      console.log("📬 Check inbox: no-replay@naity.net\n");
      console.log("🎉 Admin reply email test passed!");
      console.log("\n💡 The email includes:");
      console.log("   - Bilingual greeting (Arabic/English)");
      console.log("   - Admin's reply message");
      console.log("   - Original customer message");
      console.log("   - Admin name/signature");
      console.log("   - Link to website");
      console.log("   - Reply date/time");
    } else {
      console.log("❌ Failed to send email");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testReplyEmail();
