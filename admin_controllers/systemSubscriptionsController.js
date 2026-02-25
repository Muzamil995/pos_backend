const pool = require("../models/db");

exports.getAllSubscriptions = async (req, res) => {
  try {
    // Join subscriptions with users and plans to get all details
    const [rows] = await pool.query(
      `SELECT 
         s.id, 
         u.name AS userName, 
         p.name AS planName, 
         s.status, 
         s.startDate, 
         s.endDate, 
         p.price
       FROM subscriptions s
       LEFT JOIN users u ON s.userId = u.id
       LEFT JOIN plans p ON s.planId = p.id
       ORDER BY s.id DESC`,
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Get system subscriptions error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch system subscriptions" });
  }
};
