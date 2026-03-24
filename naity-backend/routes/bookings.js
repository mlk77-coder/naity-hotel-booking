const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

// ============================================================
// 📋 GET /api/bookings - Get all bookings with filters
// ============================================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      hotel_id, 
      user_id,
      from_date, 
      to_date, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT 
        b.*,
        h.name_ar AS hotel_name_ar,
        h.name_en AS hotel_name_en,
        h.city,
        rc.name_ar AS room_name_ar,
        rc.name_en AS room_name_en
      FROM bookings b
      LEFT JOIN hotels h ON h.id = b.hotel_id
      LEFT JOIN room_categories rc ON rc.id = b.room_category_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }

    if (payment_status) {
      query += " AND b.payment_status = ?";
      params.push(payment_status);
    }

    if (hotel_id) {
      query += " AND b.hotel_id = ?";
      params.push(hotel_id);
    }

    if (user_id) {
      query += " AND b.user_id = ?";
      params.push(user_id);
    }

    if (from_date) {
      query += " AND b.check_in >= ?";
      params.push(from_date);
    }

    if (to_date) {
      query += " AND b.check_out <= ?";
      params.push(to_date);
    }

    query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM bookings b WHERE 1=1";
    const countParams = [];

    if (status) {
      countQuery += " AND b.status = ?";
      countParams.push(status);
    }

    if (payment_status) {
      countQuery += " AND b.payment_status = ?";
      countParams.push(payment_status);
    }

    if (hotel_id) {
      countQuery += " AND b.hotel_id = ?";
      countParams.push(hotel_id);
    }

    if (user_id) {
      countQuery += " AND b.user_id = ?";
      countParams.push(user_id);
    }

    const [count] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: bookings,
      total: count[0].total,
    });
  } catch (err) {
    console.error("Error in GET /api/bookings:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📄 GET /api/bookings/:id - Get single booking details
// ============================================================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(
      `SELECT 
        b.*,
        h.name_ar AS hotel_name_ar,
        h.name_en AS hotel_name_en,
        h.city,
        h.address,
        h.contact_phone AS hotel_phone,
        rc.name_ar AS room_name_ar,
        rc.name_en AS room_name_en,
        rc.description_ar AS room_description_ar,
        rc.description_en AS room_description_en
       FROM bookings b
       LEFT JOIN hotels h ON h.id = b.hotel_id
       LEFT JOIN room_categories rc ON rc.id = b.room_category_id
       WHERE b.id = ?`,
      [id]
    );

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    res.json({
      success: true,
      data: bookings[0],
    });
  } catch (err) {
    console.error("Error in GET /api/bookings/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/bookings/:id - Update booking status
// ============================================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, notes } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }

    if (payment_status) {
      updates.push("payment_status = ?");
      params.push(payment_status);
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد تحديثات",
      });
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: "تم تحديث الحجز" });
  } catch (err) {
    console.error("Error in PUT /api/bookings/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
