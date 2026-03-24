const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, hotelManagerOnly } = require("../middleware/auth");

// كل routes هذا الملف تتطلب hotel_manager أو admin
router.use(authMiddleware, hotelManagerOnly);

// ============================================================
// 🏨 GET /api/hotel-panel/my-hotel - بيانات الفندق الخاص بالمدير
// ============================================================
router.get("/my-hotel", async (req, res) => {
  try {
    const [hotels] = await db.query(
      "SELECT * FROM hotels WHERE manager_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (!hotels.length) {
      return res.status(404).json({ success: false, message: "لا يوجد فندق مرتبط بهذا الحساب" });
    }

    const hotel = hotels[0];

    const [rooms] = await db.query(
      "SELECT * FROM room_categories WHERE hotel_id = ? ORDER BY price_per_night",
      [hotel.id]
    );

    const [photos] = await db.query(
      "SELECT * FROM hotel_photos WHERE hotel_id = ? ORDER BY sort_order",
      [hotel.id]
    );

    res.json({ success: true, data: { hotel, rooms, photos } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/hotel-panel/bookings - حجوزات الفندق
// ============================================================
router.get("/bookings", async (req, res) => {
  try {
    const [hotels] = await db.query(
      "SELECT id FROM hotels WHERE manager_id = ?",
      [req.user.id]
    );

    if (!hotels.length) {
      return res.status(404).json({ success: false, message: "لا يوجد فندق مرتبط بهذا الحساب" });
    }

    const hotelId = hotels[0].id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT b.*, rc.name_ar AS room_name_ar, rc.name_en AS room_name_en
      FROM bookings b
      LEFT JOIN room_categories rc ON rc.id = b.room_category_id
      WHERE b.hotel_id = ?
    `;
    const params = [hotelId];

    if (status) { query += " AND b.status = ?"; params.push(status); }
    query += " ORDER BY b.check_in ASC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, params);
    const [count] = await db.query(
      "SELECT COUNT(*) as total, SUM(status='pending') as pending, SUM(status='confirmed') as confirmed FROM bookings WHERE hotel_id = ?",
      [hotelId]
    );

    res.json({
      success: true,
      data: bookings,
      stats: count[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📅 GET /api/hotel-panel/blocked-dates - التواريخ المحجوبة
// ============================================================
router.get("/blocked-dates", async (req, res) => {
  try {
    const [hotels] = await db.query(
      "SELECT id FROM hotels WHERE manager_id = ?",
      [req.user.id]
    );
    if (!hotels.length) {
      return res.status(404).json({ success: false, message: "لا يوجد فندق" });
    }

    const [dates] = await db.query(
      "SELECT * FROM blocked_dates WHERE hotel_id = ? ORDER BY blocked_date ASC",
      [hotels[0].id]
    );

    res.json({ success: true, data: dates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔄 PATCH /api/hotel-panel/bookings/:id - تأكيد / رفض حجز
// ============================================================
router.patch("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "الحالة يجب أن تكون confirmed أو cancelled" });
    }

    await db.query(
      "UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    res.json({
      success: true,
      message: status === "confirmed" ? "تم تأكيد الحجز" : "تم رفض الحجز",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
