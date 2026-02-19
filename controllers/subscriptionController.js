const { poolPromise } = require('../models/db');

// ================= GET CURRENT SUBSCRIPTION =================
exports.getMySubscription = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT s.*, p.name AS planName, p.price, p.maxProducts, p.maxUsers
       FROM subscriptions s
       JOIN plans p ON s.planId = p.id
       WHERE s.userId = ?
       ORDER BY s.id DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.json({ subscription: null });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

// ================= REQUEST PLAN CHANGE =================
exports.requestPlanUpgrade = async (req, res) => {
  try {
    const { planId, paymentProof } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID required' });
    }

    const pool = await poolPromise;

    // Check plan exists
    const [planRows] = await pool.query(
      'SELECT durationDays FROM plans WHERE id = ? AND status = 1',
      [planId]
    );

    if (planRows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const duration = planRows[0].durationDays;

    // Insert as Pending (admin approval ready)
    await pool.query(
      `INSERT INTO subscriptions
       (userId, planId, status, startDate, endDate, createdAt, paymentProof)
       VALUES (?, ?, 'Pending', CURDATE(),
               DATE_ADD(CURDATE(), INTERVAL ? DAY),
               NOW(), ?)`,
      [
        req.user.userId,
        planId,
        duration,
        paymentProof || null
      ]
    );

    res.json({
      success: true,
      message: 'Plan upgrade request submitted'
    });

  } catch (err) {
    console.error('Upgrade request error:', err);
    res.status(500).json({ error: 'Failed to request upgrade' });
  }
};

// ================= RENEW SUBSCRIPTION =================
exports.renewSubscription = async (req, res) => {
  try {
    const { paymentProof } = req.body;

    const pool = await poolPromise;

    // Get latest subscription
    const [rows] = await pool.query(
      `SELECT * FROM subscriptions
       WHERE userId = ?
       ORDER BY id DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const currentSub = rows[0];

    // Get plan duration
    const [planRows] = await pool.query(
      'SELECT durationDays FROM plans WHERE id = ?',
      [currentSub.planId]
    );

    const duration = planRows[0].durationDays;

    await pool.query(
      `INSERT INTO subscriptions
       (userId, planId, status, startDate, endDate, createdAt, paymentProof)
       VALUES (?, ?, 'Pending', CURDATE(),
               DATE_ADD(CURDATE(), INTERVAL ? DAY),
               NOW(), ?)`,
      [
        req.user.userId,
        currentSub.planId,
        duration,
        paymentProof || null
      ]
    );

    res.json({
      success: true,
      message: 'Renewal request submitted'
    });

  } catch (err) {
    console.error('Renew error:', err);
    res.status(500).json({ error: 'Failed to renew subscription' });
  }
};

// ================= CHECK SUBSCRIPTION STATUS =================
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT * FROM subscriptions
       WHERE userId = ?
       AND status = 'Active'
       AND endDate >= CURDATE()
       ORDER BY id DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.json({
        active: false,
        message: 'Subscription expired or not active'
      });
    }

    res.json({
      active: true,
      subscription: rows[0]
    });

  } catch (err) {
    console.error('Subscription check error:', err);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
};
