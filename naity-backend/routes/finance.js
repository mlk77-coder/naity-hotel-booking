const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// All routes require admin authentication
router.use(authMiddleware, adminOnly);

// ============================================================
// 📊 GET /api/finance/distribution - Get financial distribution
// ============================================================
router.get("/distribution", async (req, res) => {
  try {
    const { start_date, end_date, partner_id } = req.query;

    // Build WHERE clause and FROM clause based on filters
    let fromClause = "FROM bookings b";
    let whereClause = "WHERE b.payment_status = 'paid'";
    const params = [];

    // If filtering by partner, we need to join hotels table
    if (partner_id && partner_id !== 'all') {
      fromClause = "FROM bookings b LEFT JOIN hotels h ON b.hotel_id = h.id";
      whereClause += " AND h.tech_partner_id = ?";
      params.push(partner_id);
    }

    if (start_date && end_date) {
      whereClause += " AND b.created_at BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    // Get total deposits from guests
    const [guestDeposits] = await db.query(
      `SELECT COALESCE(SUM(b.deposit_amount), 0) as total
       ${fromClause}
       ${whereClause}`,
      params
    );

    // Get MVA (25% commission)
    const [mvaCommission] = await db.query(
      `SELECT COALESCE(SUM(b.deposit_amount * 0.25), 0) as total
       ${fromClause}
       ${whereClause}`,
      params
    );

    // Get after commission (75% to hotels)
    const [afterCommission] = await db.query(
      `SELECT COALESCE(SUM(b.deposit_amount * 0.75), 0) as total
       ${fromClause}
       ${whereClause}`,
      params
    );

    // Get company payments (payments made to hotels) - check if table exists
    let companyPaymentsTotal = 0;
    let salesPaymentsTotal = 0;
    
    try {
      // Build query for company payments with partner filter if needed
      let ftWhereClause = "WHERE transaction_type = 'payment_to_hotel'";
      let ftParams = [];
      
      if (partner_id && partner_id !== 'all') {
        // Need to join through bookings and hotels to filter by partner
        const [companyPayments] = await db.query(
          `SELECT COALESCE(SUM(ft.amount), 0) as total
           FROM financial_transactions ft
           LEFT JOIN bookings b ON ft.booking_id = b.id
           LEFT JOIN hotels h ON b.hotel_id = h.id
           WHERE ft.transaction_type = 'payment_to_hotel'
           ${start_date && end_date ? 'AND ft.created_at BETWEEN ? AND ?' : ''}
           ${partner_id && partner_id !== 'all' ? 'AND h.tech_partner_id = ?' : ''}`,
          start_date && end_date && partner_id && partner_id !== 'all' 
            ? [start_date, end_date, partner_id]
            : start_date && end_date 
              ? [start_date, end_date]
              : partner_id && partner_id !== 'all'
                ? [partner_id]
                : []
        );
        companyPaymentsTotal = companyPayments[0].total;

        // Get sales payments with partner filter
        const [salesPayments] = await db.query(
          `SELECT COALESCE(SUM(ft.amount), 0) as total
           FROM financial_transactions ft
           LEFT JOIN bookings b ON ft.booking_id = b.id
           LEFT JOIN hotels h ON b.hotel_id = h.id
           WHERE ft.transaction_type = 'sales_payment'
           ${start_date && end_date ? 'AND ft.created_at BETWEEN ? AND ?' : ''}
           ${partner_id && partner_id !== 'all' ? 'AND h.tech_partner_id = ?' : ''}`,
          start_date && end_date && partner_id && partner_id !== 'all' 
            ? [start_date, end_date, partner_id]
            : start_date && end_date 
              ? [start_date, end_date]
              : partner_id && partner_id !== 'all'
                ? [partner_id]
                : []
        );
        salesPaymentsTotal = salesPayments[0].total;
      } else {
        // No partner filter, simpler query
        const [companyPayments] = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM financial_transactions
           WHERE transaction_type = 'payment_to_hotel'
           ${start_date && end_date ? 'AND created_at BETWEEN ? AND ?' : ''}`,
          start_date && end_date ? [start_date, end_date] : []
        );
        companyPaymentsTotal = companyPayments[0].total;

        // Get sales payments (from sales channels)
        const [salesPayments] = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM financial_transactions
           WHERE transaction_type = 'sales_payment'
           ${start_date && end_date ? 'AND created_at BETWEEN ? AND ?' : ''}`,
          start_date && end_date ? [start_date, end_date] : []
        );
        salesPaymentsTotal = salesPayments[0].total;
      }
    } catch (tableErr) {
      // Table doesn't exist yet, use 0
      console.log("financial_transactions table not found, using 0 for payments");
    }

    // Calculate net for Naity (MVA - company payments - sales payments)
    const netNaity = mvaCommission[0].total - companyPaymentsTotal - salesPaymentsTotal;

    // Get booking details for table with payment information
    const [bookingDetails] = await db.query(
      `SELECT 
        b.id,
        b.created_at as date,
        COALESCE(h.name_ar, 'N/A') as hotel_name_ar,
        COALESCE(h.name_en, 'N/A') as hotel_name_en,
        COALESCE(tp.name, 'N/A') as partner_name,
        COALESCE(tp.name_ar, 'N/A') as partner_name_ar,
        b.guest_first_name,
        b.guest_last_name,
        b.total_price,
        b.deposit_amount,
        (b.deposit_amount * 0.25) as mva_commission,
        (b.deposit_amount * 0.75) as after_commission,
        COALESCE(
          (SELECT SUM(amount) 
           FROM financial_transactions 
           WHERE booking_id = b.id 
           AND transaction_type = 'payment_to_hotel'), 
          0
        ) as company_payment,
        COALESCE(
          (SELECT SUM(amount) 
           FROM financial_transactions 
           WHERE booking_id = b.id 
           AND transaction_type = 'sales_payment'), 
          0
        ) as sales_payment,
        (
          (b.deposit_amount * 0.25) - 
          COALESCE(
            (SELECT SUM(amount) 
             FROM financial_transactions 
             WHERE booking_id = b.id 
             AND transaction_type = 'payment_to_hotel'), 
            0
          ) - 
          COALESCE(
            (SELECT SUM(amount) 
             FROM financial_transactions 
             WHERE booking_id = b.id 
             AND transaction_type = 'sales_payment'), 
            0
          )
        ) as naity_profit,
        b.status
       FROM bookings b
       LEFT JOIN hotels h ON b.hotel_id = h.id
       LEFT JOIN tech_partners tp ON h.tech_partner_id = tp.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: {
          guest_deposits: parseFloat(guestDeposits[0].total || 0).toFixed(2),
          mva_commission: parseFloat(mvaCommission[0].total || 0).toFixed(2),
          after_commission: parseFloat(afterCommission[0].total || 0).toFixed(2),
          company_payments: parseFloat(companyPaymentsTotal || 0).toFixed(2),
          sales_payments: parseFloat(salesPaymentsTotal || 0).toFixed(2),
          net_naity: parseFloat(netNaity || 0).toFixed(2),
        },
        bookings: bookingDetails || [],
      },
    });
  } catch (err) {
    console.error("Error in GET /api/finance/distribution:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في قاعدة البيانات",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ============================================================
// 💰 POST /api/finance/transaction - Add financial transaction
// ============================================================
router.post("/transaction", async (req, res) => {
  try {
    const { booking_id, transaction_type, amount, description } = req.body;

    if (!transaction_type || !amount) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال نوع المعاملة والمبلغ",
      });
    }

    const [result] = await db.query(
      `INSERT INTO financial_transactions 
       (booking_id, transaction_type, amount, description, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [booking_id || null, transaction_type, amount, description || null]
    );

    res.json({
      success: true,
      message: "تمت إضافة المعاملة المالية بنجاح",
      transaction_id: result.insertId,
    });
  } catch (err) {
    console.error("Error in POST /api/finance/transaction:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 📋 GET /api/finance/transactions - Get all transactions
// ============================================================
router.get("/transactions", async (req, res) => {
  try {
    const { type, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        ft.*,
        b.id as booking_ref,
        h.name_ar as hotel_name_ar,
        h.name_en as hotel_name_en
      FROM financial_transactions ft
      LEFT JOIN bookings b ON ft.booking_id = b.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += " AND ft.transaction_type = ?";
      params.push(type);
    }

    if (start_date && end_date) {
      query += " AND ft.created_at BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    query += " ORDER BY ft.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [transactions] = await db.query(query, params);

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error in GET /api/finance/transactions:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

// ============================================================
// 🤝 GET /api/finance/partners - Get all tech partners
// ============================================================
router.get("/partners", async (req, res) => {
  try {
    const [partners] = await db.query(
      `SELECT id, name, name_ar, commission_rate, is_active
       FROM tech_partners
       WHERE is_active = 1
       ORDER BY name ASC`
    );

    res.json({ success: true, data: partners });
  } catch (err) {
    console.error("Error in GET /api/finance/partners:", err);
    res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
  }
});

module.exports = router;
