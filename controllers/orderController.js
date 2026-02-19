const { poolPromise } = require('../models/db');

// ================= GET ALL ORDERS =================
exports.getOrders = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE userId = ? ORDER BY id DESC',
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};


// ================= GET SINGLE ORDER =================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};


// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  const connection = await (await poolPromise).getConnection();

  try {
    await connection.beginTransaction();

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
      status
    } = req.body;

    // Validate
    if (!orderNumber || !items || !totalAmount) {
      throw new Error('Missing required fields');
    }

    // Convert items array to JSON string
    const itemsJson = JSON.stringify(items);

    // Insert Order
    const [result] = await connection.query(
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
        status
      ]
    );

    // 🔥 Reduce stock
    for (const item of items) {

      const [productRows] = await connection.query(
        'SELECT quantity FROM products WHERE id = ? AND userId = ?',
        [item.productId, req.user.userId]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found`);
      }

      if (productRows[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}`);
      }

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

    // 🔥 Update Active Shift
    await connection.query(
      `UPDATE shifts
       SET totalSales = totalSales + ?, 
           totalOrders = totalOrders + 1
       WHERE userId = ? AND status = 'active'`,
      [
        totalAmount,
        req.user.userId
      ]
    );

    await connection.commit();

    res.json({ success: true, message: 'Order created successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};


// ================= DELETE ORDER =================
exports.deleteOrder = async (req, res) => {
  const connection = await (await poolPromise).getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get order
    const [rows] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = rows[0];
    const items = JSON.parse(order.items);

    // Restore stock
    for (const item of items) {
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

    await connection.query(
      'DELETE FROM orders WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    await connection.commit();

    res.json({ success: true, message: 'Order deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Delete order error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};
