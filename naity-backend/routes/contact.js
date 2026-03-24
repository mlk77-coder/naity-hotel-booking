const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ============================================================
// 📧 POST /api/contact - Submit contact form (public)
// ============================================================
router.post("/", async (req, res) => {
  try {
    const { full_name, email, phone, country, subject, message } = req.body;

    if (!full_name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال: full_name, email, message",
      });
    }

    const messageId = uuidv4();

    await db.query(
      `INSERT INTO contact_messages (id, full_name, email, phone, country, subject, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [messageId, full_name, email, phone || null, country || null, subject || 'other', message]
    );

    res.status(201).json({
      success: true,
      message: "تم إرسال رسالتك بنجاح",
      message_id: messageId,
    });
  } catch (err) {
    console.error("Error in POST /api/contact:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/contact - Get all contact messages (admin only)
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { is_read, is_starred, subject, limit = 100, offset = 0 } = req.query;

    let query = "SELECT * FROM contact_messages WHERE 1=1";
    const params = [];

    if (is_read !== undefined) {
      query += " AND is_read = ?";
      params.push(is_read === 'true' || is_read === '1' ? 1 : 0);
    }

    if (is_starred !== undefined) {
      query += " AND is_starred = ?";
      params.push(is_starred === 'true' || is_starred === '1' ? 1 : 0);
    }

    if (subject) {
      query += " AND subject = ?";
      params.push(subject);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [messages] = await db.query(query, params);
    const [count] = await db.query("SELECT COUNT(*) as total FROM contact_messages");

    res.json({
      success: true,
      data: messages,
      total: count[0].total,
    });
  } catch (err) {
    console.error("Error in GET /api/contact:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📝 PUT /api/contact/:id - Update contact message (mark read/starred)
// ============================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, is_starred, replied_at } = req.body;

    const updates = [];
    const params = [];

    if (is_read !== undefined) {
      updates.push("is_read = ?");
      params.push(is_read ? 1 : 0);
    }

    if (is_starred !== undefined) {
      updates.push("is_starred = ?");
      params.push(is_starred ? 1 : 0);
    }

    if (replied_at !== undefined) {
      updates.push("replied_at = ?");
      params.push(replied_at ? new Date(replied_at) : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد تحديثات",
      });
    }

    params.push(id);

    await db.query(
      `UPDATE contact_messages SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: "تم تحديث الرسالة" });
  } catch (err) {
    console.error("Error in PUT /api/contact/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🗑️ DELETE /api/contact/:id - Delete contact message
// ============================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);

    res.json({ success: true, message: "تم حذف الرسالة" });
  } catch (err) {
    console.error("Error in DELETE /api/contact/:id:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
