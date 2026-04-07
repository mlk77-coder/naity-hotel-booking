const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// ============================================================
// 🏨 GET /api/hotels - جلب كل الفنادق مع فلاتر
// ============================================================
router.get("/", async (req, res) => {
  try {
    const {
      city,
      stars,
      property_type,
      min_price,
      max_price,
      is_featured,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    let query = `
      SELECT 
        h.*,
        MIN(rc.price_per_night) AS min_price,
        MAX(rc.price_per_night) AS max_price,
        COUNT(DISTINCT rc.id) AS room_types_count,
        (SELECT photo_url FROM hotel_photos WHERE hotel_id = h.id ORDER BY sort_order ASC LIMIT 1) AS first_photo
      FROM hotels h
      LEFT JOIN room_categories rc ON rc.hotel_id = h.id AND rc.is_active = 1
      WHERE h.is_active = 1
    `;
    const params = [];

    if (city) {
      query += " AND h.city = ?";
      params.push(city);
    }
    if (stars) {
      query += " AND h.stars = ?";
      params.push(parseInt(stars));
    }
    if (property_type) {
      query += " AND h.property_type = ?";
      params.push(property_type);
    }
    if (is_featured === "true") {
      query += " AND h.is_featured = 1";
    }
    if (search) {
      query += " AND (h.name_ar LIKE ? OR h.name_en LIKE ? OR h.city LIKE ? OR h.neighborhood LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (min_price) {
      query += " HAVING min_price >= ?";
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      query += (min_price ? " AND" : " HAVING") + " min_price <= ?";
      params.push(parseFloat(max_price));
    }

    query += " GROUP BY h.id";
    query += " ORDER BY h.is_featured DESC, h.stars DESC, h.created_at DESC";
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [hotels] = await db.query(query, params);

    // Count total
    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM hotels WHERE is_active = 1",
    );

    res.json({
      success: true,
      data: hotels,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🏨 GET /api/hotels/:id - تفاصيل فندق واحد
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // جلب الفندق
    const [hotels] = await db.query(
      "SELECT * FROM hotels WHERE id = ? AND is_active = 1",
      [id]
    );
    if (!hotels.length) {
      return res.status(404).json({ success: false, message: "الفندق غير موجود" });
    }

    // جلب الصور
    const [photos] = await db.query(
      "SELECT * FROM hotel_photos WHERE hotel_id = ? ORDER BY sort_order ASC",
      [id]
    );

    // جلب أنواع الغرف
    const [rooms] = await db.query(
      "SELECT * FROM room_categories WHERE hotel_id = ? AND is_active = 1 ORDER BY price_per_night ASC",
      [id]
    );

    res.json({
      success: true,
      data: {
        hotel: hotels[0],
        photos,
        rooms,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔍 GET /api/hotels/:id/availability - التحقق من التوفر
// ============================================================
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال تاريخ الوصول والمغادرة",
      });
    }

    // التحقق من التواريخ المحجوبة
    const [blocked] = await db.query(
      `SELECT blocked_date FROM blocked_dates 
       WHERE hotel_id = ? AND blocked_date >= ? AND blocked_date < ?`,
      [id, check_in, check_out]
    );

    if (blocked.length > 0) {
      return res.json({
        success: true,
        available: false,
        message: "الفندق غير متوفر في هذه الفترة",
        blocked_dates: blocked.map((b) => b.blocked_date),
      });
    }

    // جلب الغرف المتاحة
    const [rooms] = await db.query(
      `SELECT 
        rc.*,
        rc.total_rooms - COALESCE((
          SELECT SUM(br.guests_count)
          FROM bookings b
          JOIN booking_rooms br ON br.booking_id = b.id
          WHERE br.room_category_id = rc.id
            AND b.status IN ('confirmed', 'pending')
            AND b.check_in < ?
            AND b.check_out > ?
        ), 0) AS available_rooms
      FROM room_categories rc
      WHERE rc.hotel_id = ? AND rc.is_active = 1
      HAVING available_rooms > 0
      ORDER BY rc.price_per_night ASC`,
      [check_out, check_in, id]
    );

    res.json({
      success: true,
      available: rooms.length > 0,
      rooms,
      check_in,
      check_out,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/hotels - إضافة فندق جديد (Admin فقط)
// ============================================================
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      name_ar,
      name_en,
      city,
      stars,
      property_type,
      description_ar,
      description_en,
      address,
      neighborhood,
      contact_email,
      contact_phone,
      amenities,
      check_in_time,
      check_out_time,
      house_rules_ar,
      house_rules_en,
      latitude,
      longitude,
      breakfast_available,
      breakfast_price,
      breakfast_type,
      is_featured,
    } = req.body;

    if (!name_ar || !name_en || !city || !stars || !property_type) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: name_ar, name_en, city, stars, property_type",
      });
    }

    const id = require("uuid").v4();
    const slug = `${name_en.toLowerCase().replace(/\s+/g, "-")}-${id.slice(0, 6)}`;

    await db.query(
      `INSERT INTO hotels (
        id, name_ar, name_en, city, stars, property_type,
        description_ar, description_en, address, neighborhood,
        contact_email, contact_phone, amenities, check_in_time,
        check_out_time, house_rules_ar, house_rules_en,
        latitude, longitude, breakfast_available, breakfast_price,
        breakfast_type, is_featured, is_active, slug,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [
        id, name_ar, name_en, city, stars, property_type,
        description_ar, description_en, address, neighborhood,
        contact_email, contact_phone,
        amenities ? JSON.stringify(amenities) : null,
        check_in_time, check_out_time, house_rules_ar, house_rules_en,
        latitude, longitude,
        breakfast_available ? 1 : 0,
        breakfast_price, breakfast_type,
        is_featured ? 1 : 0,
        slug,
      ]
    );

    // 📧 إرسال رسالة ترحيب تلقائية للفندق (إذا كان هناك بريد إلكتروني)
    if (contact_email) {
      try {
        const { sendHotelWelcome } = require("../utils/mailer");
        const emailData = {
          hotel_name: name_en,
          hotel_name_ar: name_ar,
          contact_email: contact_email,
          city: city,
          stars: stars,
          created_at: new Date(),
          property_type: property_type // Pass property type for apartment/hotel detection
        };
        
        // إرسال بالعربية افتراضياً (يمكن تغييره حسب تفضيلات الفندق)
        await sendHotelWelcome(emailData, 'ar');
        console.log(`✅ Welcome email sent to new ${property_type}: ${name_en}`);
      } catch (emailError) {
        console.error("❌ Failed to send welcome email:", emailError.message);
        // لا نوقف العملية إذا فشل إرسال البريد
      }
    }

    res.status(201).json({
      success: true,
      message: "تم إضافة الفندق بنجاح",
      hotel_id: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/hotels/:id - تعديل فندق (Admin فقط)
// ============================================================
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    delete fields.id;
    delete fields.created_at;

    fields.updated_at = new Date();

    // Convert amenities object to JSON string if present
    if (fields.amenities && typeof fields.amenities === 'object') {
      fields.amenities = JSON.stringify(fields.amenities);
    }

    const keys = Object.keys(fields);
    if (!keys.length) {
      return res.status(400).json({ success: false, message: "لا توجد بيانات للتعديل" });
    }

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...Object.values(fields), id];

    await db.query(`UPDATE hotels SET ${setClause} WHERE id = ?`, values);

    res.json({ success: true, message: "تم التعديل بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/hotels/:id - حذف فندق (Admin فقط)
// ============================================================
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من وجود حجوزات نشطة
    const [activeBookings] = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE hotel_id = ? AND status IN ('confirmed', 'pending')",
      [id]
    );
    
    if (activeBookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف الفندق لوجود حجوزات نشطة. قم بإلغاء الحجوزات أولاً أو استخدم إيقاف التفعيل بدلاً من الحذف",
      });
    }
    
    // حذف الصور المرتبطة
    await db.query("DELETE FROM hotel_photos WHERE hotel_id = ?", [id]);
    
    // حذف التواريخ المحجوبة
    await db.query("DELETE FROM blocked_dates WHERE hotel_id = ?", [id]);
    
    // حذف الغرف المرتبطة
    await db.query("DELETE FROM room_categories WHERE hotel_id = ?", [id]);
    
    // حذف الفندق نهائياً
    await db.query("DELETE FROM hotels WHERE id = ?", [id]);
    
    res.json({ success: true, message: "تم حذف الفندق نهائياً من قاعدة البيانات" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
