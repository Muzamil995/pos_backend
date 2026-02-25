const pool = require("../models/db");

exports.getAllPlans = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM plans ORDER BY price ASC");
    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Get system plans error:", err);
    return res.status(500).json({ error: "Failed to fetch system plans" });
  }
};
