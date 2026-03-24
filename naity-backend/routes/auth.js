const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware } = require("../middleware/auth");
require("dotenv").config();

// ============================================================
// 📝 POST /api/auth/register - تسجيل مستخدم جديد
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: full_name, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
    }

    // التحقق من عدم وجود البريد مسبقاً
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "البريد الإلكتروني مستخدم مسبقاً",
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.query(
      `INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', NOW(), NOW())`,
      [userId, full_name, email, hashed]
    );

    // إنشاء الـ profile
    await db.query(
      `INSERT INTO profiles (id, user_id, full_name, email, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [uuidv4(), userId, full_name, email]
    );

    const token = jwt.sign(
      { id: userId, email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: { id: userId, full_name, email, role: "user" },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ============================================================
// 🔐 POST /api/auth/login - تسجيل الدخول
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال البريد الإلكتروني وكلمة المرور",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ============================================================
// 👤 GET /api/auth/me - بيانات المستخدم الحالي
// ============================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    }

    res.json({ success: true, data: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ============================================================
// ✏️ PUT /api/auth/profile - تعديل بيانات المستخدم
// ============================================================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { full_name } = req.body;
    const userId = req.user.id;

    await db.query(
      "UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?",
      [full_name, userId]
    );

    await db.query(
      "UPDATE profiles SET full_name = ?, updated_at = NOW() WHERE user_id = ?",
      [full_name, userId]
    );

    res.json({ success: true, message: "تم تحديث البيانات" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ============================================================
// 🔑 PUT /api/auth/change-password - تغيير كلمة المرور
// ============================================================
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال كلمة المرور القديمة والجديدة",
      });
    }

    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    const isMatch = await bcrypt.compare(old_password, users[0].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور القديمة غير صحيحة",
      });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashed, req.user.id]
    );

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

module.exports = router;
