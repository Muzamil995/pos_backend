const pool = require("../models/db");

// ================= GET ALL PLANS =================
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

// ================= UPDATE PLAN =================
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      durationDays,
      maxProducts,
      maxCategories,
      maxCustomers,
      maxEmployees,
      maxSuppliers,
      maxUsers,
      hasOnlineBackup,
      hasFullBackupWithImages,
    } = req.body;

    // Helper: Convert empty strings to NULL for database
    const setNullIfEmpty = (val) =>
      val === "" || val === null || val === undefined ? null : val;

    await pool.query(
      `UPDATE plans SET 
        name = ?, price = ?, durationDays = ?, 
        maxProducts = ?, maxCategories = ?, maxCustomers = ?, 
        maxEmployees = ?, maxSuppliers = ?, maxUsers = ?, 
        hasOnlineBackup = ?, hasFullBackupWithImages = ? 
       WHERE id = ?`,
      [
        name,
        price,
        durationDays,
        setNullIfEmpty(maxProducts),
        setNullIfEmpty(maxCategories),
        setNullIfEmpty(maxCustomers),
        setNullIfEmpty(maxEmployees),
        setNullIfEmpty(maxSuppliers),
        setNullIfEmpty(maxUsers),
        hasOnlineBackup ? 1 : 0,
        hasFullBackupWithImages ? 1 : 0,
        id,
      ],
    );

    return res.json({ success: true, message: "Plan updated successfully" });
  } catch (err) {
    console.error("Update plan error:", err);
    return res.status(500).json({ error: "Failed to update plan" });
  }
};
