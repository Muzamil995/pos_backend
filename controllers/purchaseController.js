const { poolPromise } = require('../models/db');

// ================= GET ALL PURCHASES =================
exports.getPurchases = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM purchases WHERE userId = ? ORDER BY id DESC',
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get purchases error:', err);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
};


// ================= GET SINGLE PURCHASE WITH ITEMS =================
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const [purchaseRows] = await pool.query(
      'SELECT * FROM purchases WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    if (purchaseRows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const [items] = await pool.query(
      'SELECT * FROM purchase_items WHERE purchaseId = ?',
      [id]
    );

    res.json({
      ...purchaseRows[0],
      items
    });

  } catch (err) {
    console.error('Get purchase error:', err);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
};


// ================= CREATE PURCHASE WITH ITEMS =================
exports.createPurchase = async (req, res) => {
  const connection = await (await poolPromise).getConnection();

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
      items
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
        status
      ]
    );

    const purchaseId = result.insertId;

    // Insert purchase items + update stock
    for (const item of items) {

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
          item.totalCost
        ]
      );

      // Update product stock
      await connection.query(
        `UPDATE products
         SET quantity = quantity + ?
         WHERE id = ? AND userId = ?`,
        [
          item.quantity,
          item.productId,
          req.user.userId
        ]
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'Purchase created successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Create purchase error:', err);
    res.status(500).json({ error: 'Failed to create purchase' });
  } finally {
    connection.release();
  }
};


// ================= DELETE PURCHASE (ROLLBACK STOCK) =================
exports.deletePurchase = async (req, res) => {
  const connection = await (await poolPromise).getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get items
    const [items] = await connection.query(
      'SELECT * FROM purchase_items WHERE purchaseId = ?',
      [id]
    );

    // Reduce stock
    for (const item of items) {
      await connection.query(
        `UPDATE products
         SET quantity = quantity - ?
         WHERE id = ? AND userId = ?`,
        [
          item.quantity,
          item.productId,
          req.user.userId
        ]
      );
    }

    // Delete items
    await connection.query(
      'DELETE FROM purchase_items WHERE purchaseId = ?',
      [id]
    );

    // Delete purchase
    await connection.query(
      'DELETE FROM purchases WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    await connection.commit();

    res.json({ success: true, message: 'Purchase deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Delete purchase error:', err);
    res.status(500).json({ error: 'Failed to delete purchase' });
  } finally {
    connection.release();
  }
};
