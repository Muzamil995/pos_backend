const pool = require("../models/db");

exports.checkSubscriptionAccess = async (req, res, next) => {
  const [rows] = await pool.query(
    `SELECT s.*, p.*
     FROM subscriptions s
     JOIN plans p ON s.planId = p.id
     WHERE s.userId = ?
     AND s.status = 'Active'
     ORDER BY s.endDate DESC
     LIMIT 1`,
    [req.user.userId]
  );

  if (rows.length === 0) {
    return res.status(403).json({ error: "Subscription required" });
  }

  const sub = rows[0];
  const today = new Date();
  const endDate = new Date(sub.endDate);

  if (today > endDate) {
    return res.status(403).json({ error: "Subscription expired" });
  }

  // 🔥 Attach full plan data
  req.subscription = sub;

  next();
};