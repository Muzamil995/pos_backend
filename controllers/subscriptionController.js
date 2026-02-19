const { poolPromise } = require('../models/db'); // MySQL pool

// Get all users with subscriptions
exports.getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(`
      SELECT 
        u.Id, 
        u.Name, 
        u.Email, 
        u.CreatedAt,
        s.PlanName,
        s.Status,
        s.StartDate,
        s.EndDate
      FROM Users u
      LEFT JOIN Subscriptions s ON u.Id = s.UserId
      ORDER BY u.CreatedAt DESC
    `);

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { userId, planName, startDate, endDate } = req.body;

    if (!userId || !planName || !startDate || !endDate) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const pool = await poolPromise;

    await pool.query(
      `INSERT INTO Subscriptions (UserId, PlanName, Status, StartDate, EndDate)
       VALUES (?, ?, 'Active', ?, ?)`,
      [userId, planName, startDate, endDate]
    );

    res.status(201).json({ success: true, message: 'Subscription created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get subscription by user ID
exports.getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await poolPromise;

    const [rows] = await pool.query(
      `SELECT * FROM Subscriptions 
       WHERE UserId = ? 
       ORDER BY CreatedAt DESC`,
      [userId]
    );

    res.json({ success: true, subscription: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
