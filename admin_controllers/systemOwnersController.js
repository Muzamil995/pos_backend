const pool = require("../models/db"); // Goes up one directory to access your existing DB connection

exports.getSystemOwners = async (req, res) => {
  try {
    // Query the users table specifically for owners
    const [rows] = await pool.query(
      `SELECT id, name, email, status, role, createdOn 
       FROM users 
       WHERE parentId IS NULL AND role = 'owner' 
       ORDER BY id DESC`,
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Get system owners error:", err);
    return res.status(500).json({ error: "Failed to fetch system owners" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { id, status } = req.body; // Expects { id: 5, status: 1 } from frontend

  try {
    // Update the status in the MySQL 'users' table
    const [result] = await pool.query(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    console.error("Toggle status error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Database update failed" });
  }
};
