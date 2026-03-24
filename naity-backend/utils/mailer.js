const nodemailer = require("nodemailer");
require("dotenv").config();

// إعداد المُرسِل
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ إرسال تأكيد الحجز للعميل
const sendBookingConfirmation = async (booking) => {
  const {
    guest_first_name,
    guest_last_name,
    guest_email,
    hotel_name,
    check_in,
    check_out,
    total_price,
    deposit_amount,
    id,
    transaction_hash,
  } = booking;

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: guest_email,
    subject: `✅ تأكيد حجزك في ${hotel_name} - Naity`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a56db; font-size: 28px; margin: 0;">🏨 Naity</h1>
          <p style="color: #64748b; margin-top: 4px;">منصة حجز الفنادق</p>
        </div>

        <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #0369a1; margin: 0 0 8px;">تم تأكيد حجزك بنجاح! 🎉</h2>
          <p style="color: #475569; margin: 0;">عزيزنا ${guest_first_name} ${guest_last_name}، شكراً لاختيارك Naity</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">الفندق</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${hotel_name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">تاريخ الوصول</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${check_in}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">تاريخ المغادرة</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937;">${check_out}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">المجموع الكلي</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1f2937; font-weight: bold;">${total_price} $</td>
          </tr>
          <tr style="background: #fef9c3;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">العربون المدفوع</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #b45309; font-weight: bold;">${deposit_amount} $</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #374151;">رقم الحجز</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #6366f1; font-family: monospace;">${id}</td>
          </tr>
        </table>

        ${transaction_hash ? `
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            🔐 <strong>رمز التحقق:</strong> <code style="font-family: monospace; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">${transaction_hash}</code>
          </p>
        </div>
        ` : ""}

        <div style="text-align: center; color: #64748b; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p>هذا البريد تم إرساله تلقائياً من منصة Naity</p>
          <p>للاستفسار: <a href="mailto:info@naitagfz.com" style="color: #1a56db;">info@naitagfz.com</a></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${guest_email}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    return false;
  }
};

// ✅ إرسال إشعار للفندق عند وجود حجز جديد
const sendHotelNotification = async (booking, hotelEmail) => {
  if (!hotelEmail) return false;

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: hotelEmail,
    subject: `🔔 حجز جديد - ${booking.guest_first_name} ${booking.guest_last_name}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a56db;">🏨 حجز جديد على منصة Naity</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">العميل</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.guest_first_name} ${booking.guest_last_name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">الهاتف</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.phone_country_code || ""}${booking.guest_phone || "غير محدد"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">البريد</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.guest_email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">الوصول</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.check_in}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">المغادرة</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.check_out}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">عدد الضيوف</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.guests_count}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">المجموع</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">${booking.total_price} $</td></tr>
          ${booking.special_requests ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">طلبات خاصة</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.special_requests}</td></tr>` : ""}
        </table>
        <p style="color: #64748b; margin-top: 16px; font-size: 13px;">رقم الحجز: ${booking.id}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("❌ Failed to send hotel notification:", err.message);
    return false;
  }
};

module.exports = { sendBookingConfirmation, sendHotelNotification };
