const pool = require("../models/db");

exports.checkSubscriptionAccess = async (req, res, next) => {
  const [rows] = await pool.query(
    `SELECT * FROM subscriptions
     WHERE userId = ?
     AND status = 'Active'
     ORDER BY endDate DESC
     LIMIT 1`,
    [req.user.userId],
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

  next();
};