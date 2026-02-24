const pool = require("../models/db");

// ========================================
// GET ALL ORDERS
// ========================================
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE userId = ? ORDER BY id DESC",
      [req.user.userId],
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ========================================
// GET SINGLE ORDER
// ========================================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND userId = ?",
      [id, req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Order not found or unauthorized",
      });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

// ========================================
// CREATE ORDER (Category Style)
// ========================================
exports.createOrder = async (req, res) => {
  try {
    const {
      orderNumber,
      customerId,
      customerName,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      roundoff,
      totalAmount,
      cashReceived,
      changeAmount,
      paymentMethod,
      status,
    } = req.body;

    if (!orderNumber || !items || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const itemsJson = JSON.stringify(items);

    // 1️⃣ Insert Order
    const [result] = await pool.query(
      `INSERT INTO orders
      (userId, orderNumber, customerId, customerName, items,
       subtotal, shipping, tax, discount, roundoff, totalAmount,
       cashReceived, changeAmount, paymentMethod, status, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        orderNumber,
        customerId || null,
        customerName || null,
        itemsJson,
        subtotal,
        shipping,
        tax,
        discount,
        roundoff,
        totalAmount,
        cashReceived || 0,
        changeAmount || 0,
        paymentMethod,
        status,
      ],
    );

    // 2️⃣ Reduce Stock
    for (const item of items) {
      // 🔥 If no productId → it's a manual/service item
      if (!item.productId) {
        continue; // skip stock handling
      }

      const [productRows] = await pool.query(
        "SELECT quantity FROM products WHERE id = ? AND userId = ?",
        [item.productId, req.user.userId],
      );

      if (productRows.length === 0) {
        return res.status(400).json({ error: "Product not found" });
      }

      await pool.query(
        `UPDATE products
         SET quantity = quantity - ?
         WHERE id = ? AND userId = ?`,
        [item.quantity, item.productId, req.user.userId],
      );
    }

    // 3️⃣ Update Active Shift
    await pool.query(
      `UPDATE shifts
       SET totalSales = totalSales + ?, 
           totalOrders = totalOrders + 1
       WHERE userId = ? AND status = 'active'`,
      [totalAmount, req.user.userId],
    );

    return res.json({
      success: true,
      id: result.insertId,
      message: "Order created successfully",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({
        success: true,
        message: "Order already exists",
      });
    }

    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ========================================
// UPDATE ORDER
// ========================================
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customerId,
      customerName,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      roundoff,
      totalAmount,
      cashReceived,
      changeAmount,
      paymentMethod,
      status,
    } = req.body;

    const itemsJson = JSON.stringify(items);

    const [result] = await pool.query(
      `UPDATE orders SET
       customerId = ?, customerName = ?, items = ?,
       subtotal = ?, shipping = ?, tax = ?, discount = ?,
       roundoff = ?, totalAmount = ?, cashReceived = ?,
       changeAmount = ?, paymentMethod = ?, status = ?
       WHERE id = ? AND userId = ?`,
      [
        customerId || null,
        customerName || null,
        itemsJson,
        subtotal,
        shipping,
        tax,
        discount,
        roundoff,
        totalAmount,
        cashReceived,
        changeAmount,
        paymentMethod,
        status,
        id,
        req.user.userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Order not found or unauthorized",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ========================================
// DELETE ORDER
// ========================================
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND userId = ?",
      [id, req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];
    const items = JSON.parse(order.items);

    // Restore stock
    for (const item of items) {
      await pool.query(
        `UPDATE products
         SET quantity = quantity + ?
         WHERE id = ? AND userId = ?`,
        [item.quantity, item.productId, req.user.userId],
      );
    }

    await pool.query("DELETE FROM orders WHERE id = ? AND userId = ?", [
      id,
      req.user.userId,
    ]);

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
