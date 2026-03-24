const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware, adminOnly, hotelManagerOnly } = require("../middleware/auth");

// ============================================================
// 📋 GET /api/rooms - جلب كل أنواع الغرف
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { hotel_id, include_inactive } = req.query;

    let query = `
      SELECT rc.*, h.name_ar AS hotel_name_ar, h.name_en AS hotel_name_en, h.city
      FROM room_categories rc
      LEFT JOIN hotels h ON h.id = rc.hotel_id
      WHERE 1=1
    `;
    const params = [];

    // Only filter by is_active if not explicitly requesting inactive ones
    if (include_inactive !== 'true') {
      query += " AND rc.is_active = 1";
    }

    if (hotel_id) {
      query += " AND rc.hotel_id = ?";
      params.push(hotel_id);
    }

    query += " ORDER BY h.name_en ASC, rc.price_per_night ASC";

    const [rooms] = await db.query(query, params);
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/rooms/:id - تفاصيل غرفة واحدة
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const [rooms] = await db.query(
      `SELECT rc.*, h.name_ar AS hotel_name_ar, h.name_en AS hotel_name_en, h.city, h.stars
       FROM room_categories rc
       LEFT JOIN hotels h ON h.id = rc.hotel_id
       WHERE rc.id = ? AND rc.is_active = 1`,
      [req.params.id]
    );

    if (!rooms.length) {
      return res.status(404).json({ success: false, message: "الغرفة غير موجودة" });
    }

    res.json({ success: true, data: rooms[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/rooms - إضافة نوع غرفة جديد (Admin / Manager)
// ============================================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      hotel_id,
      name_ar,
      name_en,
      description_ar,
      description_en,
      price_per_night,
      max_guests,
      total_rooms,
      amenities,
    } = req.body;

    if (!hotel_id || !name_ar || !name_en || !price_per_night) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: hotel_id, name_ar, name_en, price_per_night",
      });
    }

    // Check if user is admin or manager of this hotel
    if (req.user.role !== 'admin') {
      const [hotel] = await db.query(
        "SELECT manager_id FROM hotels WHERE id = ?",
        [hotel_id]
      );
      if (!hotel.length || hotel[0].manager_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بإضافة غرف لهذا الفندق",
        });
      }
    }

    const id = uuidv4();

    await db.query(
      `INSERT INTO room_categories (
        id, hotel_id, name_ar, name_en, description_ar, description_en,
        price_per_night, max_guests, total_rooms, amenities,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        id, hotel_id, name_ar, name_en, description_ar, description_en,
        price_per_night,
        max_guests || 2,
        total_rooms || 1,
        amenities ? JSON.stringify(amenities) : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة نوع الغرفة بنجاح",
      room_id: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/rooms/:id - تعديل نوع الغرفة
// ============================================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.hotel_id;
    delete fields.created_at;
    fields.updated_at = new Date();

    // Check if user is admin or manager of this hotel
    if (req.user.role !== 'admin') {
      const [room] = await db.query(
        `SELECT rc.hotel_id, h.manager_id 
         FROM room_categories rc
         JOIN hotels h ON h.id = rc.hotel_id
         WHERE rc.id = ?`,
        [id]
      );
      if (!room.length || room[0].manager_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بتعديل هذه الغرفة",
        });
      }
    }

    const keys = Object.keys(fields);
    if (!keys.length) {
      return res.status(400).json({ success: false, message: "لا توجد بيانات للتعديل" });
    }

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...Object.values(fields), id];

    await db.query(`UPDATE room_categories SET ${setClause} WHERE id = ?`, values);
    res.json({ success: true, message: "تم التعديل بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/rooms/:id - حذف نوع الغرفة
// ============================================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin or manager of this hotel
    if (req.user.role !== 'admin') {
      const [room] = await db.query(
        `SELECT rc.hotel_id, h.manager_id 
         FROM room_categories rc
         JOIN hotels h ON h.id = rc.hotel_id
         WHERE rc.id = ?`,
        [id]
      );
      if (!room.length || room[0].manager_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بحذف هذه الغرفة",
        });
      }
    }

    // Check for active bookings
    const [activeBookings] = await db.query(
      `SELECT COUNT(*) as count 
       FROM booking_rooms br
       JOIN bookings b ON b.id = br.booking_id
       WHERE br.room_category_id = ? 
       AND b.status IN ('confirmed', 'pending')`,
      [id]
    );

    if (activeBookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف الغرفة لوجود حجوزات نشطة",
      });
    }

    // Soft delete
    await db.query(
      "UPDATE room_categories SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [id]
    );
    
    res.json({ success: true, message: "تم حذف نوع الغرفة" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📅 GET /api/rooms/:id/availability - توفر الغرفة في فترة معينة
// ============================================================
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال check_in و check_out",
      });
    }

    const [rooms] = await db.query(
      "SELECT * FROM room_categories WHERE id = ? AND is_active = 1",
      [id]
    );
    if (!rooms.length) {
      return res.status(404).json({ success: false, message: "الغرفة غير موجودة" });
    }

    // عدد الحجوزات المتعارضة مع الفترة المطلوبة
    const [conflicting] = await db.query(
      `SELECT COUNT(*) as count
       FROM bookings b
       JOIN booking_rooms br ON br.booking_id = b.id
       WHERE br.room_category_id = ?
         AND b.status IN ('confirmed', 'pending')
         AND b.check_in < ?
         AND b.check_out > ?`,
      [id, check_out, check_in]
    );

    const room = rooms[0];
    const booked = conflicting[0].count;
    const available = room.total_rooms - booked;

    res.json({
      success: true,
      room_id: id,
      total_rooms: room.total_rooms,
      booked_count: booked,
      available_count: available > 0 ? available : 0,
      is_available: available > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
