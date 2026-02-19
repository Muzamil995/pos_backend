const { poolPromise } = require('../models/db');

// ================= GET ACTIVE SHIFT =================
exports.getActiveShift = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ? AND status = 'active' 
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.json({ active: false });
    }

    res.json({
      active: true,
      shift: rows[0]
    });

  } catch (err) {
    console.error('Get shift error:', err);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
};

// ================= OPEN SHIFT =================
exports.openShift = async (req, res) => {
  try {
    const { cashInHand } = req.body;

    const pool = await poolPromise;

    // Check if already active
    const [existing] = await pool.query(
      `SELECT id FROM shifts 
       WHERE userId = ? AND status = 'active'`,
      [req.user.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Shift already active'
      });
    }

    await pool.query(
      `INSERT INTO shifts
      (userId, userName, cashInHand, startTime, totalSales, totalOrders, status, createdOn)
      VALUES (?, ?, ?, NOW(), 0, 0, 'active', NOW())`,
      [
        req.user.userId,
        req.user.name,
        cashInHand || 0
      ]
    );

    res.json({
      success: true,
      message: 'Shift opened successfully'
    });

  } catch (err) {
    console.error('Open shift error:', err);
    res.status(500).json({ error: 'Failed to open shift' });
  }
};

// ================= CLOSE SHIFT =================
exports.closeShift = async (req, res) => {
  try {
    const { closingCash } = req.body;

    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ? AND status = 'active'
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: 'No active shift found'
      });
    }

    const shift = rows[0];

    await pool.query(
      `UPDATE shifts
       SET status = 'closed',
           endTime = NOW()
       WHERE id = ?`,
      [shift.id]
    );

    res.json({
      success: true,
      message: 'Shift closed successfully',
      summary: {
        totalSales: shift.totalSales,
        totalOrders: shift.totalOrders,
        openingCash: shift.cashInHand,
        closingCash: closingCash || shift.cashInHand
      }
    });

  } catch (err) {
    console.error('Close shift error:', err);
    res.status(500).json({ error: 'Failed to close shift' });
  }
};

// ================= SHIFT HISTORY =================
exports.getShiftHistory = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT * FROM shifts 
       WHERE userId = ?
       ORDER BY id DESC`,
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Shift history error:', err);
    res.status(500).json({ error: 'Failed to fetch shift history' });
  }
};
