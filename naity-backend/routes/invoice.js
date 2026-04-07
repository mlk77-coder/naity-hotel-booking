const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { generateInvoicePDF } = require("../utils/invoiceGenerator");
const path = require("path");
const fs = require("fs");

// ============================================================
// 📄 GET /api/invoice/:bookingId - Generate and download invoice PDF
// ============================================================
router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const [bookings] = await db.query(
      `SELECT 
        b.*,
        h.name_ar AS hotel_name_ar,
        h.name_en AS hotel_name_en,
        h.city AS hotel_city,
        h.contact_phone AS hotel_phone,
        h.contact_email AS hotel_email,
        rc.name_ar AS room_name_ar,
        rc.name_en AS room_name_en,
        rc.price_per_night
       FROM bookings b
       LEFT JOIN hotels h ON h.id = b.hotel_id
       LEFT JOIN room_categories rc ON rc.id = b.room_category_id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Calculate nights
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Format dates
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatTime = (date) => {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    };

    // Prepare booking data for PDF
    const bookingData = {
      id: booking.id,
      booking_reference: `NAITY-${new Date(booking.created_at).getFullYear()}-${booking.id.substring(0, 5).toUpperCase()}`,
      guest_name: `${booking.guest_first_name} ${booking.guest_last_name}`,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone || 'N/A',
      nationality: booking.nationality || 'N/A',
      guests_count: booking.guests_count || 1,
      children_count: booking.children_count || 0,
      hotel_name: booking.hotel_name_en || booking.hotel_name_ar,
      hotel_city: booking.hotel_city,
      hotel_phone: booking.hotel_phone,
      hotel_email: booking.hotel_email,
      room_name: booking.room_name_en || booking.room_name_ar,
      check_in: booking.check_in,
      check_out: booking.check_out,
      check_in_formatted: `${formatDate(booking.check_in)}\n${formatTime(booking.check_in)}`,
      check_out_formatted: `${formatDate(booking.check_out)}\n${formatTime(booking.check_out)}`,
      nights: nights,
      breakfast_included: booking.breakfast_included || false,
      price_per_night: booking.price_per_night || (booking.total_price / nights).toFixed(2),
      total_price: parseFloat(booking.total_price).toFixed(2),
      deposit_amount: parseFloat(booking.deposit_amount || 0).toFixed(2),
      balance_due: (parseFloat(booking.total_price) - parseFloat(booking.deposit_amount || 0)).toFixed(2),
      payment_date: booking.created_at ? formatDate(booking.created_at) : null,
      status: booking.status,
    };

    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Generate PDF filename
    const filename = `invoice-${bookingData.booking_reference}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    // Generate PDF
    await generateInvoicePDF(bookingData, filepath);

    // Send PDF as download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).json({ success: false, message: 'Error generating invoice' });
      }

      // Optional: Delete file after sending (uncomment if you want to clean up)
      // fs.unlinkSync(filepath);
    });

  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error generating invoice",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ============================================================
// 📧 POST /api/invoice/:bookingId/email - Email invoice to guest
// ============================================================
router.post("/:bookingId/email", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const [bookings] = await db.query(
      `SELECT 
        b.*,
        h.name_ar AS hotel_name_ar,
        h.name_en AS hotel_name_en,
        h.city AS hotel_city,
        rc.name_ar AS room_name_ar,
        rc.name_en AS room_name_en,
        rc.price_per_night
       FROM bookings b
       LEFT JOIN hotels h ON h.id = b.hotel_id
       LEFT JOIN room_categories rc ON rc.id = b.room_category_id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Calculate nights
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Format dates
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatTime = (date) => {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    };

    // Prepare booking data
    const bookingData = {
      id: booking.id,
      booking_reference: `NAITY-${new Date(booking.created_at).getFullYear()}-${booking.id.substring(0, 5).toUpperCase()}`,
      guest_name: `${booking.guest_first_name} ${booking.guest_last_name}`,
      guest_email: booking.guest_email,
      nationality: booking.nationality || 'N/A',
      guests_count: booking.guests_count || 1,
      children_count: booking.children_count || 0,
      hotel_name: booking.hotel_name_en || booking.hotel_name_ar,
      hotel_city: booking.hotel_city,
      room_name: booking.room_name_en || booking.room_name_ar,
      check_in: booking.check_in,
      check_out: booking.check_out,
      check_in_formatted: `${formatDate(booking.check_in)}\n${formatTime(booking.check_in)}`,
      check_out_formatted: `${formatDate(booking.check_out)}\n${formatTime(booking.check_out)}`,
      nights: nights,
      breakfast_included: booking.breakfast_included || false,
      price_per_night: booking.price_per_night || (booking.total_price / nights).toFixed(2),
      total_price: parseFloat(booking.total_price).toFixed(2),
      deposit_amount: parseFloat(booking.deposit_amount || 0).toFixed(2),
      balance_due: (parseFloat(booking.total_price) - parseFloat(booking.deposit_amount || 0)).toFixed(2),
      payment_date: booking.created_at ? formatDate(booking.created_at) : null,
    };

    // Create invoices directory
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Generate PDF
    const filename = `invoice-${bookingData.booking_reference}.pdf`;
    const filepath = path.join(invoicesDir, filename);
    await generateInvoicePDF(bookingData, filepath);

    // TODO: Send email with PDF attachment using mailer
    // const { sendInvoiceEmail } = require('../utils/mailer');
    // await sendInvoiceEmail(booking.guest_email, filepath, bookingData);

    res.json({
      success: true,
      message: "Invoice generated successfully",
      invoice_path: filepath
    });

  } catch (err) {
    console.error("Error emailing invoice:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error emailing invoice" 
    });
  }
});

module.exports = router;
