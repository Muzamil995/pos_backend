const pool = require("../models/db");

exports.fullSync = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    // 🔥 Get user
    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [loggedInUserId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const loggedUser = userRows[0];

    // 🔥 BLOCK SUBUSER
    if (loggedUser.parentId) {
      return res.status(403).json({
        error: "SubUsers are not allowed to perform full sync"
      });
    }

    const ownerId = loggedUser.id;

    // 🔥 Get Owner + SubUsers
    const [allUsers] = await pool.query(
      "SELECT * FROM users WHERE id = ? OR parentId = ?",
      [ownerId, ownerId]
    );

    const userIds = allUsers.map(u => u.id);
    const placeholders = userIds.map(() => "?").join(",");

    const [
      categories,
      products,
      customers,
      suppliers,
      employees,
      orders,
      purchases,
      settings,
      shifts,
      permissions,
      barcodes,
      purchaseItems
    ] = await Promise.all([

      pool.query(`SELECT * FROM categories WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM products WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM customers WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM suppliers WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM employees WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM orders WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM purchases WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM settings WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM shifts WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM permissions WHERE userId IN (${placeholders})`, userIds),
      pool.query(`SELECT * FROM generated_barcodes WHERE userId IN (${placeholders})`, userIds),

      pool.query(`
        SELECT pi.* FROM purchase_items pi
        JOIN purchases p ON pi.purchaseId = p.id
        WHERE p.userId IN (${placeholders})
      `, userIds),

    ]);

    res.json({
      success: true,
      ownerId,
      users: allUsers,
      data: {
        categories: categories[0],
        products: products[0],
        customers: customers[0],
        suppliers: suppliers[0],
        employees: employees[0],
        orders: orders[0],
        purchases: purchases[0],
        purchase_items: purchaseItems[0],
        settings: settings[0],
        shifts: shifts[0],
        permissions: permissions[0],
        generated_barcodes: barcodes[0],
      },
    });

  } catch (err) {
    console.error("FULL SYNC ERROR:", err);
    res.status(500).json({ error: "Sync failed" });
  }
};
