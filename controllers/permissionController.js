const pool = require("../models/db");

// ========================================
// GET PERMISSIONS BY SUB USER
// ========================================
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM permissions WHERE subUserId = ? AND userId = ?",
      [userId, req.user.userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET PERMISSIONS ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

// ========================================
// CREATE PERMISSIONS (Bulk)
// ========================================
exports.createPermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "Invalid permissions data" });
    }

    // 🔥 Delete old permissions first (safe update pattern)
    await pool.query(
      "DELETE FROM permissions WHERE subUserId = ? AND userId = ?",
      [userId, req.user.userId]
    );

    // Insert new permissions
    for (const perm of permissions) {
      await pool.query(
        `INSERT INTO permissions 
        (userId, subUserId, module, canView, canAdd, canEdit, canDelete, createdOn) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.userId,      // owner/admin
          userId,               // sub-user
          perm.module,
          perm.canView ? 1 : 0,
          perm.canAdd ? 1 : 0,
          perm.canEdit ? 1 : 0,
          perm.canDelete ? 1 : 0,
        ]
      );
    }

    return res.json({
      success: true,
      message: "Permissions saved successfully",
    });
  } catch (err) {
    console.error("CREATE PERMISSIONS ERROR:", err);
    return res.status(500).json({ error: "Failed to create permissions" });
  }
};

// ========================================
// UPDATE SINGLE PERMISSION
// ========================================
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { canView, canAdd, canEdit, canDelete } = req.body;

    const [result] = await pool.query(
      `UPDATE permissions 
       SET canView=?, canAdd=?, canEdit=?, canDelete=? 
       WHERE id=? AND userId=?`,
      [
        canView ? 1 : 0,
        canAdd ? 1 : 0,
        canEdit ? 1 : 0,
        canDelete ? 1 : 0,
        id,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Permission not found or unauthorized",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PERMISSION ERROR:", err);
    return res.status(500).json({ error: "Failed to update permission" });
  }
};

// ========================================
// DELETE PERMISSION
// ========================================
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM permissions WHERE id=? AND userId=?",
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Permission not found or unauthorized",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE PERMISSION ERROR:", err);
    return res.status(500).json({ error: "Failed to delete permission" });
  }
};