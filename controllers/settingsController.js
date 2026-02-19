const { poolPromise } = require('../models/db');

// ================= GET SETTINGS =================
exports.getSettings = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM settings WHERE userId = ?',
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};


// ================= CREATE OR UPDATE SETTINGS =================
exports.saveSettings = async (req, res) => {
  try {
    const { companyName, logoBase64 } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const pool = await poolPromise;

    // Check if settings exist
    const [existing] = await pool.query(
      'SELECT id FROM settings WHERE userId = ?',
      [req.user.userId]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE settings
         SET companyName = ?, logoBase64 = ?, updatedOn = NOW()
         WHERE userId = ?`,
        [
          companyName,
          logoBase64 || null,
          req.user.userId
        ]
      );

      return res.json({
        success: true,
        message: 'Settings updated successfully'
      });

    } else {
      // Insert first time
      await pool.query(
        `INSERT INTO settings
         (userId, companyName, logoBase64, updatedOn)
         VALUES (?, ?, ?, NOW())`,
        [
          req.user.userId,
          companyName,
          logoBase64 || null
        ]
      );

      return res.json({
        success: true,
        message: 'Settings created successfully'
      });
    }

  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
};
