const pool = require("../models/db");

// ================= GET ACTIVE SHIFT =================
exports.getActiveShift = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ? AND status = 'active' 
       LIMIT 1`,
      [req.user.userId],
    );

    if (rows.length === 0) {
      return res.json({ active: false });
    }

    return res.json({
      active: true,
      shift: rows[0],
    });
  } catch (err) {
    console.error("GET SHIFT ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch shift" });
  }
};

// ================= OPEN SHIFT =================
exports.openShift = async (req, res) => {
  try {
    const { cashInHand } = req.body;

    // 🔥 Get user info from database (safe way)
    const [userRows] = await pool.query(
      `SELECT id, name FROM users WHERE id = ?`,
      [req.user.userId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];

    // Check if already active
    const [existing] = await pool.query(
      `SELECT id FROM shifts 
       WHERE userId = ? AND status = 'active'`,
      [user.id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Shift already active",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO shifts
      (userId, userName, cashInHand, startTime, totalSales, totalOrders, status, createdOn)
      VALUES (?, ?, ?, NOW(), 0, 0, 'active', NOW())`,
      [
        user.id,
        user.name, // 🔥 GUARANTEED NOT NULL
        cashInHand || 0,
      ],
    );

    return res.json({
      success: true,
      id: result.insertId,
      message: "Shift opened successfully",
    });
  } catch (err) {
    console.error("OPEN SHIFT ERROR:", err);
    return res.status(500).json({ error: "Failed to open shift" });
  }
};

// ================= CLOSE SHIFT =================
exports.closeShift = async (req, res) => {
  try {
    const { closingCash } = req.body;

    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ? AND status = 'active'
       LIMIT 1`,
      [req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: "No active shift found",
      });
    }

    const shift = rows[0];

    const [result] = await pool.query(
      `UPDATE shifts
       SET status = 'closed',
           endTime = NOW()
       WHERE id = ?`,
      [shift.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Shift not found",
      });
    }

    return res.json({
      success: true,
      id: shift.id, // 🔥 RETURN UPDATED SHIFT ID
      message: "Shift closed successfully",
      summary: {
        totalSales: shift.totalSales,
        totalOrders: shift.totalOrders,
        openingCash: shift.cashInHand,
        closingCash: closingCash || shift.cashInHand,
      },
    });
  } catch (err) {
    console.error("CLOSE SHIFT ERROR:", err);
    return res.status(500).json({ error: "Failed to close shift" });
  }
};

// ================= SHIFT HISTORY =================
exports.getShiftHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ?
       ORDER BY id DESC`,
      [req.user.userId],
    );

    return res.json(rows);
  } catch (err) {
    console.error("SHIFT HISTORY ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch shift history" });
  }
};
