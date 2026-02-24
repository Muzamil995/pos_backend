const pool = require("../models/db");

// ========================================
// GET ALL CATEGORIES
// ========================================
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE userId = ? ORDER BY id DESC",
      [req.user.userId],
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// ========================================
// CREATE CATEGORY
// ========================================
exports.createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    const [result] = await pool.query(
      "INSERT INTO categories (userId, name, status, createdOn) VALUES (?, ?, ?, NOW())",
      [req.user.userId, name, status],
    );

    return res.json({
      success: true,
      id: result.insertId, // 🔥 THIS IS YOUR serverId
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({
        success: true,
        message: "Already exists",
      });
    }

    console.error("CREATE CATEGORY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ========================================
// UPDATE CATEGORY
// ========================================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const [result] = await pool.query(
      "UPDATE categories SET name=?, status=? WHERE id=? AND userId=?",
      [name, status, id, req.user.userId],
    );

    console.log("UPDATED ROWS:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Category not found or unauthorized",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Failed to update category" });
  }
};

// ========================================
// DELETE CATEGORY
// ========================================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM categories WHERE id=? AND userId=?",
      [id, req.user.userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Category not found or unauthorized",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Failed to delete category" });
  }
};
