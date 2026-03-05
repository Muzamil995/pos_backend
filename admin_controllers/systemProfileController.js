const pool = require("../models/db");
const bcrypt = require("bcryptjs");

// ================= UPDATE PROFILE (Name & Email) =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId; // Extracted securely from JWT token

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      userId,
    ]);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: { id: userId, name, email, role: req.user.role },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    // 1. Get current hashed password from DB
    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Verify current password
    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // 3. Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
};
