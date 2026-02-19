const { poolPromise } = require('../models/db');

// ================= GET ALL SUPPLIERS =================
exports.getSuppliers = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM suppliers WHERE userId = ? ORDER BY id DESC',
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};


// ================= GET SINGLE SUPPLIER =================
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get supplier error:', err);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};


// ================= CREATE SUPPLIER =================
exports.createSupplier = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      status
    } = req.body;

    const pool = await poolPromise;

    // Optional: prevent duplicate email per user
    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM suppliers WHERE userId = ? AND email = ?',
        [req.user.userId, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Supplier email already exists' });
      }
    }

    await pool.query(
      `INSERT INTO suppliers
      (userId, firstName, lastName, email, phone, city, status, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        firstName,
        lastName,
        email,
        phone,
        city,
        status
      ]
    );

    res.json({ success: true, message: 'Supplier created successfully' });

  } catch (err) {
    console.error('Create supplier error:', err);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};


// ================= UPDATE SUPPLIER =================
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      status
    } = req.body;

    const pool = await poolPromise;

    await pool.query(
      `UPDATE suppliers SET
      firstName = ?,
      lastName = ?,
      email = ?,
      phone = ?,
      city = ?,
      status = ?
      WHERE id = ? AND userId = ?`,
      [
        firstName,
        lastName,
        email,
        phone,
        city,
        status,
        id,
        req.user.userId
      ]
    );

    res.json({ success: true, message: 'Supplier updated successfully' });

  } catch (err) {
    console.error('Update supplier error:', err);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};


// ================= DELETE SUPPLIER =================
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.query(
      'DELETE FROM suppliers WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    res.json({ success: true, message: 'Supplier deleted successfully' });

  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};
