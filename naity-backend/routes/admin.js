const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// كل routes هذا الملف تتطلب Admin
router.use(authMiddleware, adminOnly);

// ============================================================
// 📊 GET /api/admin/stats - إحصائيات لوحة التحكم
// ============================================================
router.get("/stats", async (req, res) => {
  try {
    // Total hotels (active)
    const [totalHotels] = await db.query(
      "SELECT COUNT(*) as count FROM hotels WHERE is_active = 1"
    );
    
    // Total bookings
    const [totalBookings] = await db.query(
      "SELECT COUNT(*) as count FROM bookings"
    );
    
    // Total managers
    const [totalManagers] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'hotel_manager'"
    );
    
    // Today's check-ins
    const [todayCheckIns] = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(check_in) = CURDATE()"
    );
    
    // Total deposits (paid)
    const [totalDeposits] = await db.query(
      "SELECT COALESCE(SUM(deposit_amount), 0) as total FROM bookings WHERE payment_status = 'paid'"
    );
    
    // Pending sync (bookings not synced to hotel systems)
    const [pendingSync] = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE sync_status IS NULL OR sync_status = 'pending'"
    );
    
    // Recent bookings (last 10)
    const [recentBookings] = await db.query(
      `SELECT 
        b.id,
        b.guest_first_name,
        b.guest_last_name,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        b.created_at,
        h.name_en as hotel_name_en,
        h.name_ar as hotel_name_ar
       FROM bookings b
       LEFT JOIN hotels h ON b.hotel_id = h.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        overview: {
          total_hotels: totalHotels[0].count,
          total_bookings: totalBookings[0].count,
          total_managers: totalManagers[0].count,
          today_checkins: todayCheckIns[0].count,
          total_deposits: totalDeposits[0].total,
          pending_sync: pendingSync[0].count,
        },
        recent_bookings: recentBookings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 👥 GET /api/admin/users - جلب كل المستخدمين
// ============================================================
router.get("/users", async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    let query = "SELECT id, full_name, email, role, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) { query += " AND role = ?"; params.push(role); }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);
    const [count] = await db.query("SELECT COUNT(*) as total FROM users");

    res.json({ success: true, data: users, total: count[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/admin/users - إضافة مستخدم (مدير فندق / أدمن)
// ============================================================
router.post("/users", async (req, res) => {
  try {
    const { full_name, email, password, role, hotel_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: full_name, email, password, role",
      });
    }

    const validRoles = ["admin", "hotel_manager", "user", "viewer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "صلاحية غير صالحة" });
    }

    // Map viewer to user role in database
    const dbRole = role === "viewer" ? "user" : role;

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.query(
      `INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, full_name, email, hashed, dbRole]
    );

    // ربط مدير الفندق بالفندق
    if (role === "hotel_manager" && hotel_id) {
      await db.query(
        "UPDATE hotels SET manager_id = ? WHERE id = ?",
        [userId, hotel_id]
      );
    }

    res.status(201).json({
      success: true,
      message: "تم إضافة المستخدم بنجاح",
      user_id: userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/admin/users/:id - تعديل مستخدم
// ============================================================
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role } = req.body;

    await db.query(
      "UPDATE users SET full_name = ?, role = ?, updated_at = NOW() WHERE id = ?",
      [full_name, role, id]
    );

    res.json({ success: true, message: "تم تعديل المستخدم" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/users/:id - حذف مستخدم
// ============================================================
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "لا يمكنك حذف حسابك الخاص" });
    }
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "تم حذف المستخدم" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🏨 GET /api/admin/bookings - كل الحجوزات مع تفاصيل كاملة
// ============================================================
router.get("/bookings", async (req, res) => {
  try {
    const { status, hotel_id, from_date, to_date, limit = 50, offset = 0 } = req.query;

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

    if (status) { query += " AND b.status = ?"; params.push(status); }
    if (hotel_id) { query += " AND b.hotel_id = ?"; params.push(hotel_id); }
    if (from_date) { query += " AND b.check_in >= ?"; params.push(from_date); }
    if (to_date) { query += " AND b.check_out <= ?"; params.push(to_date); }

    query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.query(query, params);
    const [count] = await db.query("SELECT COUNT(*) as total FROM bookings");

    res.json({ success: true, data: bookings, total: count[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// �‍💼 GET /api/admin/managers - جلب كل مدراء الفنادق
// ============================================================
router.get("/managers", async (req, res) => {
  try {
    const [managers] = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.created_at,
        h.id as hotel_id, h.name_ar as hotel_name_ar, h.name_en as hotel_name_en,
        h.city as hotel_city, h.stars as hotel_stars, h.is_active as hotel_is_active,
        h.cover_image as hotel_cover_image
       FROM users u
       LEFT JOIN hotels h ON h.manager_id = u.id
       WHERE u.role = 'hotel_manager'
       ORDER BY u.created_at DESC`
    );

    // Transform data to match frontend expectations
    const transformedManagers = managers.map(m => ({
      id: m.id,
      profile: {
        full_name: m.full_name,
        email: m.email
      },
      hotel: m.hotel_id ? {
        id: m.hotel_id,
        name_ar: m.hotel_name_ar,
        name_en: m.hotel_name_en,
        city: m.hotel_city,
        stars: m.hotel_stars,
        is_active: m.hotel_is_active,
        cover_image: m.hotel_cover_image
      } : null
    }));

    res.json({ success: true, data: transformedManagers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/admin/managers - إضافة مدير فندق جديد
// ============================================================
router.post("/managers", async (req, res) => {
  try {
    const { full_name, email, password, hotel_id } = req.body;

    if (!full_name || !email || !password || !hotel_id) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: full_name, email, password, hotel_id",
      });
    }

    // التحقق من أن البريد غير مستخدم
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    // التحقق من أن الفندق موجود
    const [hotel] = await db.query("SELECT id FROM hotels WHERE id = ?", [hotel_id]);
    if (!hotel.length) {
      return res.status(404).json({ success: false, message: "الفندق غير موجود" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // إضافة المستخدم
    await db.query(
      `INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'hotel_manager', NOW(), NOW())`,
      [userId, full_name, email, hashed]
    );

    // ربط المدير بالفندق
    await db.query(
      "UPDATE hotels SET manager_id = ? WHERE id = ?",
      [userId, hotel_id]
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة مدير الفندق بنجاح",
      manager_id: userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/admin/managers/:id - تعديل مدير فندق
// ============================================================
router.put("/managers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, hotel_id } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: "يجب إرسال full_name" });
    }

    // تحديث بيانات المستخدم
    await db.query(
      "UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ? AND role = 'hotel_manager'",
      [full_name, id]
    );

    // تحديث الفندق المرتبط إذا تم إرساله
    if (hotel_id) {
      // إزالة المدير من الفندق القديم
      await db.query("UPDATE hotels SET manager_id = NULL WHERE manager_id = ?", [id]);
      
      // ربط المدير بالفندق الجديد
      await db.query("UPDATE hotels SET manager_id = ? WHERE id = ?", [id, hotel_id]);
    }

    res.json({ success: true, message: "تم تعديل مدير الفندق" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/managers/:id - حذف مدير فندق
// ============================================================
router.delete("/managers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // إزالة المدير من الفندق
    await db.query("UPDATE hotels SET manager_id = NULL WHERE manager_id = ?", [id]);

    // حذف المستخدم
    await db.query("DELETE FROM users WHERE id = ? AND role = 'hotel_manager'", [id]);

    res.json({ success: true, message: "تم حذف مدير الفندق" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📸 POST /api/admin/hotels/:id/photos - رفع صور الفندق
// ============================================================
router.post("/hotels/:id/photos", async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body; // array of { photo_url, sort_order, caption_ar, caption_en }

    if (!photos || !Array.isArray(photos) || !photos.length) {
      return res.status(400).json({ success: false, message: "يجب إرسال مصفوفة photos" });
    }

    const values = photos.map((p) => [
      uuidv4(), id, p.photo_url, p.sort_order || 0, p.caption_ar, p.caption_en,
    ]);

    await db.query(
      `INSERT INTO hotel_photos (id, hotel_id, photo_url, sort_order, caption_ar, caption_en)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ success: true, message: `تم إضافة ${photos.length} صورة` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📅 POST /api/admin/hotels/:id/blocked-dates - حجب تواريخ
// ============================================================
router.post("/hotels/:id/blocked-dates", async (req, res) => {
  try {
    const { id } = req.params;
    const { dates, note } = req.body; // dates: array of 'YYYY-MM-DD'

    if (!dates || !Array.isArray(dates) || !dates.length) {
      return res.status(400).json({ success: false, message: "يجب إرسال مصفوفة dates" });
    }

    const values = dates.map((d) => [uuidv4(), id, d, note || null]);

    await db.query(
      `INSERT IGNORE INTO blocked_dates (id, hotel_id, blocked_date, note) VALUES ?`,
      [values]
    );

    res.status(201).json({ success: true, message: `تم حجب ${dates.length} تاريخ` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/hotels/:id/blocked-dates - رفع الحجب
// ============================================================
router.delete("/hotels/:id/blocked-dates", async (req, res) => {
  try {
    const { id } = req.params;
    const { dates } = req.body;

    if (dates && Array.isArray(dates)) {
      await db.query(
        "DELETE FROM blocked_dates WHERE hotel_id = ? AND blocked_date IN (?)",
        [id, dates]
      );
    } else {
      await db.query("DELETE FROM blocked_dates WHERE hotel_id = ?", [id]);
    }

    res.json({ success: true, message: "تم رفع الحجب" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🏨 GET /api/admin/hotels - جلب كل الفنادق للأدمن (بما فيها غير النشطة)
// ============================================================
router.get("/hotels", async (req, res) => {
  try {
    const [hotels] = await db.query(
      `SELECT * FROM hotels ORDER BY created_at DESC`
    );

    res.json({ success: true, data: hotels });
  } catch (err) {
    console.error("Error in /api/admin/hotels:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات", error: err.message });
  }
});

// ============================================================
// 📧 POST /api/admin/hotels/:id/send-welcome - إرسال رسالة ترحيب للفندق
// ============================================================
router.post("/hotels/:id/send-welcome", async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body; // 'ar' or 'en'

    // جلب بيانات الفندق
    const [hotels] = await db.query("SELECT * FROM hotels WHERE id = ?", [id]);
    if (!hotels.length) {
      return res.status(404).json({ success: false, message: "الفندق غير موجود" });
    }

    const hotel = hotels[0];

    // البحث عن بريد المدير أو استخدام بريد الفندق
    let contact_email = hotel.email;
    
    if (hotel.manager_id) {
      const [manager] = await db.query("SELECT email FROM users WHERE id = ?", [hotel.manager_id]);
      if (manager.length && manager[0].email) {
        contact_email = manager[0].email;
      }
    }

    if (!contact_email) {
      return res.status(400).json({ 
        success: false, 
        message: language === 'ar' ? "لا يوجد بريد إلكتروني للفندق" : "No email found for hotel"
      });
    }

    // إرسال البريد
    const { sendHotelWelcome } = require("../utils/mailer");
    const emailData = {
      hotel_name: hotel.name_en,
      hotel_name_ar: hotel.name_ar,
      contact_email: contact_email,
      city: hotel.city,
      stars: hotel.stars,
      created_at: hotel.created_at,
      property_type: hotel.property_type || 'hotel' // Pass property type
    };

    const sent = await sendHotelWelcome(emailData, language || 'ar');

    if (sent) {
      res.json({ 
        success: true, 
        message: language === 'ar' 
          ? "تم إرسال رسالة الترحيب بنجاح" 
          : "Welcome email sent successfully"
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: language === 'ar'
          ? "فشل إرسال البريد الإلكتروني"
          : "Failed to send email"
      });
    }
  } catch (err) {
    console.error("Error sending hotel welcome email:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// ============================================================
// 🤝 GET /api/admin/tech-partners - جلب قائمة الشركاء للاختيار
// ============================================================
router.get("/tech-partners", async (req, res) => {
  try {
    const [partners] = await db.query(
      "SELECT id, name, name_ar, email FROM tech_partners ORDER BY name ASC"
    );
    res.json({ success: true, data: partners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🤝 GET /api/admin/partners - جلب كل الشركاء التقنيين
// ============================================================
router.get("/partners", async (req, res) => {
  try {
    const [partners] = await db.query(
      `SELECT 
        tp.*,
        COUNT(DISTINCT h.id) as hotels_count
       FROM tech_partners tp
       LEFT JOIN hotels h ON h.tech_partner_id = tp.id
       GROUP BY tp.id
       ORDER BY tp.created_at DESC`
    );

    res.json({ success: true, data: partners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/admin/partners - إضافة شريك تقني جديد
// ============================================================
router.post("/partners", async (req, res) => {
  try {
    const { name, name_ar, email, contact_email, phone, contact_phone, commission_rate, notes } = req.body;

    // Accept either email or contact_email
    const partnerEmail = email || contact_email;
    const partnerPhone = phone || contact_phone;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: name",
      });
    }

    const partnerId = uuidv4();

    await db.query(
      `INSERT INTO tech_partners (id, name, name_ar, contact_email, contact_phone, commission_rate, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [partnerId, name, name_ar || null, partnerEmail || null, partnerPhone || null, commission_rate || 0, notes || null]
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة الشريك التقني بنجاح",
      partner_id: partnerId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/admin/partners/:id - تعديل شريك تقني
// ============================================================
router.put("/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_ar, email, contact_email, phone, contact_phone, commission_rate, notes } = req.body;

    // Accept either email or contact_email
    const partnerEmail = email || contact_email;
    const partnerPhone = phone || contact_phone;

    await db.query(
      `UPDATE tech_partners 
       SET name = ?, name_ar = ?, contact_email = ?, contact_phone = ?, commission_rate = ?, notes = ?
       WHERE id = ?`,
      [name, name_ar, partnerEmail, partnerPhone, commission_rate, notes, id]
    );

    res.json({ success: true, message: "تم تعديل الشريك التقني" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/partners/:id - حذف شريك تقني
// ============================================================
router.delete("/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من عدم وجود فنادق مرتبطة
    const [hotels] = await db.query("SELECT COUNT(*) as count FROM hotels WHERE tech_partner_id = ?", [id]);
    if (hotels[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف الشريك لأنه مرتبط بفنادق. قم بإزالة الربط أولاً",
      });
    }

    await db.query("DELETE FROM tech_partners WHERE id = ?", [id]);

    res.json({ success: true, message: "تم حذف الشريك التقني" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 👤 POST /api/admin/partners/create-login - إنشاء حساب دخول لشريك
// ============================================================
router.post("/partners/create-login", async (req, res) => {
  try {
    const { email, password, partner_id } = req.body;

    if (!email || !password || !partner_id) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: email, password, partner_id",
      });
    }

    // التحقق من أن الشريك موجود
    const [partner] = await db.query("SELECT id, name FROM tech_partners WHERE id = ?", [partner_id]);
    if (!partner.length) {
      return res.status(404).json({ success: false, message: "الشريك غير موجود" });
    }

    // التحقق من أن البريد غير مستخدم
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // إنشاء المستخدم
    await db.query(
      `INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'partner', NOW(), NOW())`,
      [userId, partner[0].name, email, hashed]
    );

    // ربط المستخدم بالشريك في جدول partner_users
    await db.query(
      `INSERT INTO partner_users (user_id, partner_id, created_at)
       VALUES (?, ?, NOW())`,
      [userId, partner_id]
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب الدخول بنجاح",
      data: { user_id: userId, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔌 GET /api/admin/api-companies - جلب كل شركات API
// ============================================================
// 🔌 GET /api/admin/api-companies - جلب كل شركات API
// ============================================================
router.get("/api-companies", async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT 
        ac.*,
        COUNT(DISTINCT h.id) as hotels_count
       FROM api_companies ac
       LEFT JOIN hotels h ON h.company_id = ac.id
       GROUP BY ac.id, ac.name, ac.name_ar, ac.base_url, ac.api_key, ac.api_token,
                ac.username, ac.password, ac.auth_type, ac.get_rooms_path,
                ac.post_booking_path, ac.status, ac.contact_email, ac.contact_phone,
                ac.notes, ac.last_sync_at, ac.created_at
       ORDER BY ac.created_at DESC`
    );

    res.json({ success: true, data: companies });
  } catch (err) {
    console.error("Error in GET /api/admin/api-companies:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات", error: err.message });
  }
});

// ============================================================
// ➕ POST /api/admin/api-companies - إضافة شركة API جديدة
// ============================================================
router.post("/api-companies", async (req, res) => {
  try {
    const { 
      name, name_ar, base_url, api_key, api_token, auth_type,
      username, password, get_rooms_path, post_booking_path,
      status, contact_email, contact_phone, notes
    } = req.body;

    if (!name || !base_url) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: name, base_url",
      });
    }

    const companyId = uuidv4();

    await db.query(
      `INSERT INTO api_companies (
        id, name, name_ar, base_url, api_key, api_token, auth_type,
        username, password, get_rooms_path, post_booking_path,
        status, contact_email, contact_phone, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        companyId, name, name_ar || null, base_url, api_key || null,
        api_token || null, auth_type || 'none', username || null,
        password || null, get_rooms_path || null, post_booking_path || null,
        status || 'active', contact_email || null, contact_phone || null, notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة شركة API بنجاح",
      company_id: companyId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📧 POST /api/admin/api-companies/:id/send-welcome - إرسال رسالة ترحيب
// ============================================================
router.post("/api-companies/:id/send-welcome", async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body; // 'ar' or 'en'

    // جلب بيانات الشركة
    const [companies] = await db.query("SELECT * FROM api_companies WHERE id = ?", [id]);
    if (!companies.length) {
      return res.status(404).json({ success: false, message: "الشركة غير موجودة" });
    }

    const company = companies[0];

    if (!company.contact_email) {
      return res.status(400).json({ 
        success: false, 
        message: "لا يوجد بريد إلكتروني للشركة" 
      });
    }

    // جلب عدد الفنادق المرتبطة
    const [hotelsCount] = await db.query(
      "SELECT COUNT(*) as count FROM hotels WHERE company_id = ?",
      [id]
    );

    // إرسال البريد
    const { sendApiCompanyWelcome } = require("../utils/mailer");
    const emailData = {
      company_name: language === 'ar' ? (company.name_ar || company.name) : company.name,
      contact_email: company.contact_email,
      api_endpoint: company.base_url,
      hotels_count: hotelsCount[0].count
    };

    const sent = await sendApiCompanyWelcome(emailData, language || 'ar');

    if (sent) {
      res.json({ 
        success: true, 
        message: language === 'ar' 
          ? "تم إرسال رسالة الترحيب بنجاح" 
          : "Welcome email sent successfully"
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: language === 'ar'
          ? "فشل إرسال البريد الإلكتروني"
          : "Failed to send email"
      });
    }
  } catch (err) {
    console.error("Error sending welcome email:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// ============================================================
// ✏️ PUT /api/admin/api-companies/:id - تعديل شركة API
// ============================================================
router.put("/api-companies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, name_ar, base_url, api_key, api_token, auth_type,
      username, password, get_rooms_path, post_booking_path,
      status, contact_email, contact_phone, notes
    } = req.body;

    await db.query(
      `UPDATE api_companies 
       SET name = ?, name_ar = ?, base_url = ?, api_key = ?, api_token = ?,
           auth_type = ?, username = ?, password = ?, get_rooms_path = ?,
           post_booking_path = ?, status = ?, contact_email = ?, 
           contact_phone = ?, notes = ?
       WHERE id = ?`,
      [
        name, name_ar, base_url, api_key, api_token, auth_type,
        username, password, get_rooms_path, post_booking_path,
        status, contact_email, contact_phone, notes, id
      ]
    );

    res.json({ success: true, message: "تم تعديل شركة API" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/api-companies/:id - حذف شركة API
// ============================================================
router.delete("/api-companies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من عدم وجود فنادق مرتبطة
    const [hotels] = await db.query("SELECT COUNT(*) as count FROM hotels WHERE company_id = ?", [id]);
    if (hotels[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف الشركة لأنها مرتبطة بفنادق. قم بإزالة الربط أولاً",
      });
    }

    await db.query("DELETE FROM api_companies WHERE id = ?", [id]);

    res.json({ success: true, message: "تم حذف شركة API" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔗 GET /api/admin/api-companies/:id/hotels - جلب الفنادق المرتبطة وغير المرتبطة
// ============================================================
router.get("/api-companies/:id/hotels", async (req, res) => {
  try {
    const { id } = req.params;

    // الفنادق المرتبطة بهذه الشركة
    const [linked] = await db.query(
      `SELECT id, name_en, name_ar, city, external_hotel_id
       FROM hotels
       WHERE company_id = ?
       ORDER BY name_en`,
      [id]
    );

    // الفنادق غير المرتبطة بأي شركة
    const [unlinked] = await db.query(
      `SELECT id, name_en, name_ar, city
       FROM hotels
       WHERE company_id IS NULL
       ORDER BY name_en`
    );

    res.json({ success: true, data: { linked, unlinked } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔗 POST /api/admin/api-companies/:id/link-hotel - ربط فندق بشركة
// ============================================================
router.post("/api-companies/:id/link-hotel", async (req, res) => {
  try {
    const { id } = req.params;
    const { hotel_id, external_hotel_id } = req.body;

    if (!hotel_id || !external_hotel_id) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: hotel_id, external_hotel_id",
      });
    }

    await db.query(
      "UPDATE hotels SET company_id = ?, external_hotel_id = ? WHERE id = ?",
      [id, external_hotel_id, hotel_id]
    );

    res.json({ success: true, message: "تم ربط الفندق بالشركة" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🔗 POST /api/admin/api-companies/:id/unlink-hotel - إلغاء ربط فندق
// ============================================================
router.post("/api-companies/:id/unlink-hotel", async (req, res) => {
  try {
    const { hotel_id } = req.body;

    if (!hotel_id) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: hotel_id",
      });
    }

    await db.query(
      "UPDATE hotels SET company_id = NULL, external_hotel_id = NULL WHERE id = ?",
      [hotel_id]
    );

    res.json({ success: true, message: "تم إلغاء ربط الفندق" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🧪 POST /api/admin/api-companies/:id/test - اختبار الاتصال بشركة API
// ============================================================
router.post("/api-companies/:id/test", async (req, res) => {
  try {
    const { id } = req.params;

    const [companies] = await db.query("SELECT * FROM api_companies WHERE id = ?", [id]);
    if (!companies.length) {
      return res.status(404).json({ success: false, message: "الشركة غير موجودة" });
    }

    const company = companies[0];

    // محاولة الاتصال بـ API الشركة
    const axios = require('axios');
    const testUrl = company.base_url + (company.get_rooms_path || '/test');
    
    const headers = {};
    if (company.auth_type === 'api_key' && company.api_key) {
      headers['X-API-Key'] = company.api_key;
    } else if (company.auth_type === 'token' && company.api_token) {
      headers['Authorization'] = `Bearer ${company.api_token}`;
    } else if (company.auth_type === 'basic' && company.username && company.password) {
      const auth = Buffer.from(`${company.username}:${company.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    const response = await axios.get(testUrl, { headers, timeout: 10000 });

    res.json({ 
      success: true, 
      message: "الاتصال ناجح",
      status: response.status,
      data: response.data
    });
  } catch (err) {
    console.error("Test connection error:", err.message);
    res.json({ 
      success: false, 
      error: err.message,
      message: "فشل الاتصال"
    });
  }
});

// ============================================================
// 🔄 POST /api/admin/api-companies/:id/sync - مزامنة كل الفنادق
// ============================================================
router.post("/api-companies/:id/sync", async (req, res) => {
  try {
    const { id } = req.params;

    const [companies] = await db.query("SELECT * FROM api_companies WHERE id = ?", [id]);
    if (!companies.length) {
      return res.status(404).json({ success: false, message: "الشركة غير موجودة" });
    }

    // جلب الفنادق المرتبطة
    const [hotels] = await db.query(
      "SELECT id, external_hotel_id FROM hotels WHERE company_id = ?",
      [id]
    );

    if (hotels.length === 0) {
      return res.json({ 
        success: true, 
        message: "لا توجد فنادق مرتبطة للمزامنة",
        synced: 0
      });
    }

    // تحديث تاريخ آخر مزامنة
    await db.query(
      "UPDATE api_companies SET last_sync_at = NOW() WHERE id = ?",
      [id]
    );

    res.json({ 
      success: true, 
      message: `تمت المزامنة لـ ${hotels.length} فندق`,
      synced: hotels.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/admin/api-companies/:id/logs - جلب سجلات المزامنة
// ============================================================
router.get("/api-companies/:id/logs", async (req, res) => {
  try {
    const { id } = req.params;

    // Note: This requires a sync_logs table which may not exist yet
    // For now, return empty array
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ⚙️ GET /api/admin/sync-settings - جلب إعدادات المزامنة
// ============================================================
router.get("/sync-settings", async (req, res) => {
  try {
    const [settings] = await db.query(
      `SELECT 
        ss.*,
        h.name_ar as hotel_name_ar,
        h.name_en as hotel_name_en,
        h.city
       FROM local_sync_settings ss
       LEFT JOIN hotels h ON h.id = ss.hotel_id
       ORDER BY ss.created_at DESC`
    );

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("Error in GET /api/admin/sync-settings:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ➕ POST /api/admin/sync-settings - إضافة إعدادات مزامنة
// ============================================================
router.post("/sync-settings", async (req, res) => {
  try {
    const { hotel_id, api_endpoint, secret_key, is_active } = req.body;

    if (!hotel_id || !api_endpoint) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: hotel_id, api_endpoint",
      });
    }

    const settingId = uuidv4();

    await db.query(
      `INSERT INTO local_sync_settings (id, hotel_id, api_endpoint, secret_key, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [settingId, hotel_id, api_endpoint, secret_key || null, is_active !== false ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة إعدادات المزامنة",
      setting_id: settingId,
    });
  } catch (err) {
    console.error("Error in POST /api/admin/sync-settings:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// ✏️ PUT /api/admin/sync-settings/:id - تعديل إعدادات مزامنة
// ============================================================
router.put("/sync-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { api_endpoint, secret_key, is_active } = req.body;

    const updates = [];
    const params = [];

    if (api_endpoint) {
      updates.push("api_endpoint = ?");
      params.push(api_endpoint);
    }

    if (secret_key !== undefined) {
      updates.push("secret_key = ?");
      params.push(secret_key);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
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
      `UPDATE local_sync_settings SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: "تم تحديث إعدادات المزامنة" });
  } catch (err) {
    console.error("Error in PUT /api/admin/sync-settings/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/admin/sync-settings/:id - حذف إعدادات مزامنة
// ============================================================
router.delete("/sync-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM local_sync_settings WHERE id = ?", [id]);

    res.json({ success: true, message: "تم حذف إعدادات المزامنة" });
  } catch (err) {
    console.error("Error in DELETE /api/admin/sync-settings/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/admin/webhook-logs - جلب سجلات الـ Webhooks
// ============================================================
router.get("/webhook-logs", async (req, res) => {
  try {
    const { hotel_id, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        wl.*,
        h.name_ar as hotel_name_ar,
        h.name_en as hotel_name_en
      FROM webhook_logs wl
      LEFT JOIN hotels h ON h.id = wl.hotel_id
      WHERE 1=1
    `;
    const params = [];

    if (hotel_id) {
      query += " AND wl.hotel_id = ?";
      params.push(hotel_id);
    }

    if (status) {
      query += " AND wl.status = ?";
      params.push(status);
    }

    query += " ORDER BY wl.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await db.query(query, params);

    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("Error in GET /api/admin/webhook-logs:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
