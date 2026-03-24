const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ============================================================
// 🔍 GET /api/search - البحث عن فنادق مع فلتر التوفر
// ============================================================
router.get("/", async (req, res) => {
  try {
    const {
      city,
      check_in,
      check_out,
      guests,
      stars,
      property_type,
      min_price,
      max_price,
      amenities, // comma-separated
      limit = 20,
      offset = 0,
    } = req.query;

    // بناء استعلام البحث الأساسي
    let query = `
      SELECT 
        h.*,
        MIN(rc.price_per_night) AS min_room_price,
        MAX(rc.price_per_night) AS max_room_price,
        COUNT(DISTINCT rc.id) AS room_types,
        (
          SELECT photo_url FROM hotel_photos 
          WHERE hotel_id = h.id 
          ORDER BY sort_order ASC LIMIT 1
        ) AS cover_photo
      FROM hotels h
      LEFT JOIN room_categories rc ON rc.hotel_id = h.id 
        AND rc.is_active = 1
        ${guests ? "AND rc.max_guests >= " + parseInt(guests) : ""}
      WHERE h.is_active = 1
    `;
    const params = [];

    if (city) {
      query += " AND h.city = ?";
      params.push(city);
    }
    if (stars) {
      query += " AND h.stars >= ?";
      params.push(parseInt(stars));
    }
    if (property_type) {
      query += " AND h.property_type = ?";
      params.push(property_type);
    }

    // فلتر التوفر (إذا اختار تواريخ)
    if (check_in && check_out) {
      // استثناء الفنادق التي لديها تواريخ محجوبة
      query += `
        AND h.id NOT IN (
          SELECT hotel_id FROM blocked_dates
          WHERE blocked_date >= ? AND blocked_date < ?
        )
      `;
      params.push(check_in, check_out);
    }

    query += " GROUP BY h.id";

    // فلتر السعر بعد GROUP BY
    const havingConditions = [];
    if (min_price) {
      havingConditions.push("min_room_price >= ?");
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      havingConditions.push("min_room_price <= ?");
      params.push(parseFloat(max_price));
    }
    if (havingConditions.length) {
      query += " HAVING " + havingConditions.join(" AND ");
    }

    query += " ORDER BY h.is_featured DESC, h.stars DESC, min_room_price ASC";
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [hotels] = await db.query(query, params);

    // إذا في تواريخ، نجلب الغرف المتاحة لكل فندق
    let results = hotels;
    if (check_in && check_out) {
      results = await Promise.all(
        hotels.map(async (hotel) => {
          const [availableRooms] = await db.query(
            `SELECT 
              rc.*,
              rc.total_rooms - COALESCE((
                SELECT COUNT(*)
                FROM bookings b
                WHERE b.room_category_id = rc.id
                  AND b.status IN ('confirmed', 'pending')
                  AND b.check_in < ?
                  AND b.check_out > ?
              ), 0) AS available_count
            FROM room_categories rc
            WHERE rc.hotel_id = ? 
              AND rc.is_active = 1
              ${guests ? "AND rc.max_guests >= " + parseInt(guests) : ""}
            HAVING available_count > 0
            ORDER BY rc.price_per_night ASC`,
            [check_out, check_in, hotel.id]
          );

          return {
            ...hotel,
            available_rooms: availableRooms,
            is_available: availableRooms.length > 0,
          };
        })
      );

      // فلتر الفنادق غير المتوفرة
      results = results.filter((h) => h.is_available);
    }

    res.json({
      success: true,
      data: results,
      total: results.length,
      filters: { city, check_in, check_out, guests, stars, property_type },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🏙️ GET /api/search/cities - جلب المدن المتوفرة
// ============================================================
router.get("/cities", async (req, res) => {
  try {
    const [cities] = await db.query(
      `SELECT city, COUNT(*) as hotels_count 
       FROM hotels 
       WHERE is_active = 1 
       GROUP BY city 
       ORDER BY hotels_count DESC`
    );

    res.json({ success: true, data: cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
