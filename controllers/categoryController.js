const { poolPromise } = require('../models/db');

// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE userId = ?',
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    const pool = await poolPromise;

    await pool.query(
      'INSERT INTO categories (userId, name, status, createdOn) VALUES (?, ?, ?, NOW())',
      [req.user.userId, name, status]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const pool = await poolPromise;

    await pool.query(
      'UPDATE categories SET name=?, status=? WHERE id=? AND userId=?',
      [name, status, id, req.user.userId]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.query(
      'DELETE FROM categories WHERE id=? AND userId=?',
      [id, req.user.userId]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
