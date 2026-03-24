const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware التحقق من التوكن
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "غير مصرح - يجب تسجيل الدخول أولاً",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // نحط بيانات المستخدم في req
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "التوكن غير صالح أو انتهت صلاحيته",
    });
  }
};

// ✅ Middleware للتحقق من الصلاحيات (Admin فقط)
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "غير مصرح - هذا الإجراء يتطلب صلاحيات مدير",
    });
  }
  next();
};

// ✅ Middleware للتحقق من صلاحية مدير الفندق
const hotelManagerOnly = (req, res, next) => {
  if (req.user?.role !== "hotel_manager" && req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "غير مصرح - هذا الإجراء يتطلب صلاحيات مدير فندق",
    });
  }
  next();
};

module.exports = { authMiddleware, adminOnly, hotelManagerOnly };
