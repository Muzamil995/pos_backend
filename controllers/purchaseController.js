const pool = require("../models/db");

// ========================================
// GET ALL PURCHASES
// ========================================
exports.getPurchases = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM purchases WHERE userId = ? ORDER BY id DESC",
      [req.user.userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch purchases" });
  }
};

// ========================================
// GET SINGLE PURCHASE WITH ITEMS
// ========================================
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const [purchaseRows] = await pool.query(
      "SELECT * FROM purchases WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (purchaseRows.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const [items] = await pool.query(
      "SELECT * FROM purchase_items WHERE purchaseId = ?",
      [id]
    );

    return res.json({
      ...purchaseRows[0],
      items,
    });
  } catch (err) {
    console.error("GET PURCHASE ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch purchase" });
  }
};

// ========================================
// CREATE PURCHASE WITH ITEMS (TRANSACTION)
// ========================================
exports.createPurchase = async (req, res) => {
  const connection = await pool.getConnection(); // ✅ FIXED

  try {
    await connection.beginTransaction();

    const {
      supplierId,
      supplierName,
      reference,
      totalAmount,
      paidAmount,
      dueAmount,
      status,
      items,
    } = req.body;

    // Insert purchase
    const [result] = await connection.query(
      `INSERT INTO purchases
      (userId, supplierId, supplierName, reference, totalAmount, paidAmount, dueAmount, status, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        supplierId,
        supplierName,
        reference,
        totalAmount,
        paidAmount,
        dueAmount,
        status,
      ]
    );

    const purchaseId = result.insertId;

    // Insert items + update stock
    for (const item of items) {
      // Insert item
      await connection.query(
        `INSERT INTO purchase_items
        (purchaseId, productId, productName, quantity, purchasePrice, totalCost)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          purchaseId,
          item.productId,
          item.productName,
          item.quantity,
          item.purchasePrice,
          item.totalCost,
        ]
      );

      // Update stock
      await connection.query(
        `UPDATE products
         SET quantity = quantity + ?
         WHERE id = ? AND userId = ?`,
        [
          item.quantity,
          item.productId,
          req.user.userId,
        ]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      id: purchaseId,
      message: "Purchase created successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("CREATE PURCHASE ERROR:", err);
    return res.status(500).json({ error: "Failed to create purchase" });
  } finally {
    connection.release();
  }
};

// ========================================
// DELETE PURCHASE (ROLLBACK STOCK)
// ========================================
exports.deletePurchase = async (req, res) => {
  const connection = await pool.getConnection(); // ✅ FIXED

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get purchase items
    const [items] = await connection.query(
      "SELECT * FROM purchase_items WHERE purchaseId = ?",
      [id]
    );

    // Rollback stock
    for (const item of items) {
      await connection.query(
        `UPDATE products
         SET quantity = quantity - ?
         WHERE id = ? AND userId = ?`,
        [
          item.quantity,
          item.productId,
          req.user.userId,
        ]
      );
    }

    // Delete items
    await connection.query(
      "DELETE FROM purchase_items WHERE purchaseId = ?",
      [id]
    );

    // Delete purchase
    const [result] = await connection.query(
      "DELETE FROM purchases WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Purchase not found or unauthorized",
      });
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("DELETE PURCHASE ERROR:", err);
    return res.status(500).json({ error: "Failed to delete purchase" });
  } finally {
    connection.release();
  }
};