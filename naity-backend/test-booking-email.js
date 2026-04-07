const { sendBookingConfirmation } = require('./utils/mailer');
require('dotenv').config();

console.log("📧 Testing Booking Confirmation Email...\n");

// Sample booking data
const sampleBooking = {
  id: 123,
  guest_first_name: "أحمد",
  guest_last_name: "محمد",
  guest_email: "no-replay@naity.net", // Send to yourself for testing
  hotel_name: "Damascus Grand Hotel",
  hotel_name_ar: "فندق دمشق الكبير",
  city: "Damascus",
  check_in: "2026-05-15",
  check_out: "2026-05-20",
  total_price: 500,
  deposit_amount: 50,
  remaining_amount: 450,
  guests_count: 2,
  room_type: "Deluxe Double Room",
  room_type_ar: "غرفة مزدوجة فاخرة",
  transaction_hash: "ABC123XYZ789",
  hotel_phone: "+963 11 123 4567",
  hotel_address: "شارع بغداد، دمشق، سوريا",
  check_in_time: "2:00 PM",
  check_out_time: "12:00 PM"
};

async function testBookingEmail() {
  try {
    console.log("📨 Sending Arabic booking confirmation email...");
    const resultAr = await sendBookingConfirmation(sampleBooking, 'ar');
    
    if (resultAr) {
      console.log("✅ Arabic email sent successfully!");
      console.log("📬 Check your inbox: no-replay@naity.net\n");
      
      console.log("📨 Sending English booking confirmation email...");
      const resultEn = await sendBookingConfirmation(sampleBooking, 'en');
      
      if (resultEn) {
        console.log("✅ English email sent successfully!");
        console.log("📬 Check your inbox: no-replay@naity.net\n");
        console.log("🎉 All booking confirmation tests passed!");
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testBookingEmail();
