const pool = require('../models/db');

// ==================================================
// CREATE SINGLE BARCODE
// ==================================================
exports.createBarcode = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      productId,
      productName,
      sku,
      barcodeValue,
      barcodeFormat,
      price,
      companyName,
      sequenceNumber,   // ✅ NEW
      quantity,         // ✅ NEW
      paperSize,
      generatedAt,
    } = req.body;

    if (
      !productId ||
      !barcodeValue ||
      !barcodeFormat ||
      !quantity ||
      !sequenceNumber
    ) {
      return res.status(400).json({
        error: 'Required fields missing',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO generated_barcodes
       (userId, productId, productName, sku, barcodeValue,
        barcodeFormat, price, companyName,
        sequenceNumber, quantity, paperSize, generatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        productId,
        productName,
        sku,
        barcodeValue,
        barcodeFormat,
        price,
        companyName,
        sequenceNumber,
        quantity,
        paperSize,
        generatedAt,
      ]
    );

    return res.status(201).json({
      success: true,
      id: result.insertId,
    });

  } catch (error) {
    console.error('CREATE BARCODE ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



// ==================================================
// BULK CREATE (SYNC)
// ==================================================
exports.bulkCreateBarcodes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const barcodes = req.body.barcodes;

    if (!Array.isArray(barcodes) || barcodes.length === 0) {
      return res.status(400).json({
        error: 'No barcodes provided',
      });
    }

    const values = barcodes.map((b) => [
      userId,
      b.productId,
      b.productName,
      b.sku,
      b.barcodeValue,
      b.barcodeFormat,
      b.price,
      b.companyName,
      b.sequenceNumber,   // ✅
      b.quantity,         // ✅
      b.paperSize,
      b.generatedAt,
    ]);

    const [result] = await pool.query(
      `INSERT INTO generated_barcodes
       (userId, productId, productName, sku, barcodeValue,
        barcodeFormat, price, companyName,
        sequenceNumber, quantity, paperSize, generatedAt)
       VALUES ?`,
      [values]
    );

    const firstId = result.insertId;
    const insertedIds = [];

    for (let i = 0; i < barcodes.length; i++) {
      insertedIds.push(firstId + i);
    }

    return res.status(201).json({
      success: true,
      message: 'Barcodes synced successfully',
      ids: insertedIds,
    });

  } catch (error) {
    console.error('BULK BARCODE SYNC ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



// ==================================================
// GET ALL BARCODES (User Specific)
// ==================================================
exports.getBarcodes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `SELECT *
       FROM generated_barcodes
       WHERE userId = ?
       ORDER BY id DESC`,
      [userId]
    );

    return res.json(rows);

  } catch (error) {
    console.error('GET BARCODES ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



// ==================================================
// GET SINGLE BARCODE
// ==================================================
exports.getBarcodeById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM generated_barcodes
       WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Barcode not found or unauthorized',
      });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error('GET BARCODE ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



// ==================================================
// DELETE BARCODE
// ==================================================
exports.deleteBarcode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM generated_barcodes
       WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Barcode not found or unauthorized',
      });
    }

    return res.json({
      success: true,
      message: 'Barcode deleted successfully',
    });

  } catch (error) {
    console.error('DELETE BARCODE ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};