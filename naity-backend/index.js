require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 🔒 Middleware الأمان
// ============================================================
app.use(helmet());

// CORS - السماح للفرونت إند بالوصول
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:8080",  // Added for Vite alternative port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    // أضف أي domain آخر هنا
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// تحليل JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ============================================================
// 🛡️ Rate Limiting - حماية من الهجمات
// ============================================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200,
  message: { success: false, message: "عدد طلبات كثيرة، حاول بعد قليل" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 محاولات تسجيل دخول كل 15 دقيقة
  message: { success: false, message: "محاولات تسجيل دخول كثيرة، حاول بعد 15 دقيقة" },
});

app.use(generalLimiter);

// ============================================================
// 🚀 Routes
// ============================================================
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/hotels", require("./routes/hotels"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/search", require("./routes/search"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/hotel-panel", require("./routes/hotelPanel"));

// ============================================================
// 🏠 الصفحة الرئيسية
// ============================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏨 Naity API - يعمل بنجاح",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      hotels: "/api/hotels",
      rooms: "/api/rooms",
      bookings: "/api/bookings",
      search: "/api/search",
      contact: "/api/contact",
      admin: "/api/admin",
      hotel_panel: "/api/hotel-panel",
    },
  });
});

// ============================================================
// ❌ معالجة الـ routes غير الموجودة
// ============================================================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `الـ endpoint غير موجود: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// 🚨 معالجة الأخطاء العامة
// ============================================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "خطأ داخلي في السيرفر",
  });
});

// ============================================================
// 🚀 تشغيل السيرفر
// ============================================================
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🏨 Naity Backend API               ║
  ║   🚀 Running on port: ${PORT}          ║
  ║   🌍 Environment: ${process.env.NODE_ENV || "development"}   ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
