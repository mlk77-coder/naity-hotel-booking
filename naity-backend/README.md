# 🏨 Naity Backend API - الدليل الكامل

## 📁 هيكل المشروع

```
naity-backend/
├── index.js              ← نقطة الدخول الرئيسية
├── package.json
├── .env                  ← إعدادات البيئة (لا ترفعه على GitHub!)
├── .env.example          ← مثال للإعدادات
├── setup.sql             ← إنشاء جداول قاعدة البيانات
├── Procfile              ← لـ cPanel / Heroku
├── config/
│   └── db.js             ← اتصال MySQL
├── middleware/
│   └── auth.js           ← التحقق من JWT والصلاحيات
├── routes/
│   ├── auth.js           ← تسجيل الدخول والمستخدمين
│   ├── hotels.js         ← الفنادق
│   ├── rooms.js          ← أنواع الغرف
│   ├── bookings.js       ← الحجوزات
│   ├── search.js         ← البحث والفلترة
│   ├── contact.js        ← رسائل التواصل
│   ├── admin.js          ← لوحة الأدمن
│   └── hotelPanel.js     ← لوحة مدير الفندق
└── utils/
    └── mailer.js         ← إرسال البريد الإلكتروني
```

---

## ⚙️ خطوات التثبيت

### 1. رفع الملفات على الاستضافة

ارفع كل الملفات **ما عدا** `node_modules/` على cPanel

### 2. إنشاء جداول قاعدة البيانات

في **phpMyAdmin** → اختر قاعدة بياناتك → اضغط SQL → الصق محتوى `setup.sql` ← نفّذ

### 3. تعديل ملف `.env`

```env
DB_HOST=localhost
DB_USER=naitagfz_db
DB_PASSWORD=رمز_قاعدة_البيانات
DB_NAME=naitagfz_db
JWT_SECRET=اكتب_رمز_سري_طويل_هنا
FRONTEND_URL=https://naitagfz.com
```

### 4. تثبيت الحزم

```bash
npm install
```

### 5. تشغيل السيرفر

```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

---

## 🔗 كل الـ Endpoints

### 🔐 المصادقة - `/api/auth`
| Method | Endpoint | الوصف | Auth مطلوب؟ |
|--------|----------|-------|------------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد | ❌ |
| POST | `/api/auth/login` | تسجيل الدخول | ❌ |
| GET | `/api/auth/me` | بيانات المستخدم الحالي | ✅ |
| PUT | `/api/auth/profile` | تعديل الملف الشخصي | ✅ |
| PUT | `/api/auth/change-password` | تغيير كلمة المرور | ✅ |

### 🏨 الفنادق - `/api/hotels`
| Method | Endpoint | الوصف | Auth مطلوب؟ |
|--------|----------|-------|------------|
| GET | `/api/hotels` | جلب كل الفنادق | ❌ |
| GET | `/api/hotels/:id` | تفاصيل فندق | ❌ |
| GET | `/api/hotels/:id/availability` | التحقق من التوفر | ❌ |
| POST | `/api/hotels` | إضافة فندق | ✅ Admin |
| PUT | `/api/hotels/:id` | تعديل فندق | ✅ Admin |
| DELETE | `/api/hotels/:id` | حذف فندق | ✅ Admin |

#### مثال - جلب الفنادق مع فلاتر:
```
GET /api/hotels?city=Damascus&stars=4&property_type=hotel&limit=10&offset=0
```

### 🛏️ الغرف - `/api/rooms`
| Method | Endpoint | الوصف | Auth مطلوب؟ |
|--------|----------|-------|------------|
| GET | `/api/rooms?hotel_id=xxx` | غرف فندق معين | ❌ |
| GET | `/api/rooms/:id` | تفاصيل غرفة | ❌ |
| GET | `/api/rooms/:id/availability` | توفر الغرفة | ❌ |
| POST | `/api/rooms` | إضافة غرفة | ✅ Manager |
| PUT | `/api/rooms/:id` | تعديل غرفة | ✅ Manager |
| DELETE | `/api/rooms/:id` | حذف غرفة | ✅ Admin |

### 📋 الحجوزات - `/api/bookings`
| Method | Endpoint | الوصف | Auth مطلوب؟ |
|--------|----------|-------|------------|
| POST | `/api/bookings` | إنشاء حجز جديد | ❌ |
| GET | `/api/bookings/my` | حجوزاتي | ✅ |
| GET | `/api/bookings/:id` | تفاصيل حجز | ❌ |
| PATCH | `/api/bookings/:id/status` | تغيير الحالة | ✅ Admin |
| PATCH | `/api/bookings/:id/cancel` | إلغاء حجز | ✅ |
| GET | `/api/bookings` | كل الحجوزات | ✅ Admin |

#### مثال - إنشاء حجز:
```json
POST /api/bookings
{
  "hotel_id": "uuid-here",
  "room_category_id": "uuid-here",
  "check_in": "2025-06-01",
  "check_out": "2025-06-05",
  "guests_count": 2,
  "guest_first_name": "محمد",
  "guest_last_name": "أحمد",
  "guest_email": "guest@example.com",
  "guest_phone": "0912345678",
  "phone_country_code": "+963",
  "nationality": "Syrian",
  "breakfast_included": false
}
```

### 🔍 البحث - `/api/search`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/search` | بحث مع فلاتر التوفر |
| GET | `/api/search/cities` | المدن المتاحة |

#### مثال - بحث متكامل:
```
GET /api/search?city=Aleppo&check_in=2025-06-01&check_out=2025-06-05&guests=2&stars=3
```

### 📊 لوحة الأدمن - `/api/admin` (يتطلب admin)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/admin/stats` | إحصائيات عامة |
| GET | `/api/admin/users` | كل المستخدمين |
| POST | `/api/admin/users` | إضافة مستخدم |
| PUT | `/api/admin/users/:id` | تعديل مستخدم |
| DELETE | `/api/admin/users/:id` | حذف مستخدم |
| GET | `/api/admin/bookings` | كل الحجوزات |
| POST | `/api/admin/hotels/:id/photos` | إضافة صور |
| POST | `/api/admin/hotels/:id/blocked-dates` | حجب تواريخ |
| DELETE | `/api/admin/hotels/:id/blocked-dates` | رفع الحجب |

### 🏨 لوحة مدير الفندق - `/api/hotel-panel`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/hotel-panel/my-hotel` | بيانات الفندق |
| GET | `/api/hotel-panel/bookings` | الحجوزات |
| GET | `/api/hotel-panel/blocked-dates` | التواريخ المحجوبة |
| PATCH | `/api/hotel-panel/bookings/:id` | تأكيد/رفض حجز |

### 💬 التواصل - `/api/contact`
| Method | Endpoint | الوصف | Auth مطلوب؟ |
|--------|----------|-------|------------|
| POST | `/api/contact` | إرسال رسالة | ❌ |
| GET | `/api/contact` | كل الرسائل | ✅ Admin |
| PATCH | `/api/contact/:id/read` | تعليم كمقروء | ✅ Admin |
| DELETE | `/api/contact/:id` | حذف رسالة | ✅ Admin |

---

## 🔐 كيفية استخدام JWT

بعد تسجيل الدخول، ستحصل على `token`. أضفه في كل طلب يحتاج تسجيل دخول:

```javascript
fetch("/api/bookings/my", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
})
```

---

## 🔑 حساب الأدمن الافتراضي

```
البريد: admin@naitagfz.com
كلمة المرور: Admin@Naity2024
```
**⚠️ غيّر كلمة المرور فوراً بعد أول تسجيل دخول!**

---

## 📦 الحزم المستخدمة

| الحزمة | الاستخدام |
|--------|-----------|
| express | إطار العمل |
| mysql2 | قاعدة البيانات |
| jsonwebtoken | المصادقة JWT |
| bcryptjs | تشفير كلمات المرور |
| cors | السماح للفرونت إند |
| helmet | أمان HTTP headers |
| express-rate-limit | الحماية من الهجمات |
| nodemailer | إرسال البريد |
| uuid | إنشاء IDs فريدة |
| morgan | تسجيل الطلبات |
| dotenv | إدارة المتغيرات |
