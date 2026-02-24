const pool = require("../models/db");
const path = require("path");
const fs = require("fs");

// ================= GET ALL PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE userId = ? ORDER BY id DESC",
      [req.user.userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ================= GET SINGLE PRODUCT =================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// ================= CREATE PRODUCT =================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      brand,
      price,
      unit,
      quantity,
      quantityAlert,
      productType,
      status,
      createdBy,
    } = req.body;

    // Prevent duplicate SKU per user
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE userId = ? AND sku = ?",
      [req.user.userId, sku]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "SKU already exists" });
    }

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.user.userId}/products/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO products
      (userId, name, sku, category, brand, price, unit, quantity,
       quantityAlert, productType, status, createdBy, imagePath, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        name,
        sku,
        category,
        brand,
        price,
        unit,
        quantity,
        quantityAlert,
        productType,
        status,
        createdBy,
        imagePath,
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
      imagePath,
      message: "Product created successfully",
    });

  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// ================= UPDATE PRODUCT =================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      category,
      brand,
      price,
      unit,
      quantity,
      quantityAlert,
      productType,
      status,
    } = req.body;

    // Check duplicate SKU (excluding current product)
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE userId = ? AND sku = ? AND id != ?",
      [req.user.userId, sku, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "SKU already exists" });
    }

    // Get existing product
    const [existingProduct] = await pool.query(
      "SELECT imagePath FROM products WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    let imagePath = existingProduct[0].imagePath;

    // If new image uploaded → delete old image
    if (req.file) {

      if (imagePath) {
        const oldImageFullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }

      imagePath = `/uploads/${req.user.userId}/products/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE products SET
        name = ?,
        sku = ?,
        category = ?,
        brand = ?,
        price = ?,
        unit = ?,
        quantity = ?,
        quantityAlert = ?,
        productType = ?,
        status = ?,
        imagePath = ?
      WHERE id = ? AND userId = ?`,
      [
        name,
        sku,
        category,
        brand,
        price,
        unit,
        quantity,
        quantityAlert,
        productType,
        status,
        imagePath,
        id,
        req.user.userId,
      ]
    );

    res.json({
      success: true,
      imagePath,
      message: "Product updated successfully",
    });

  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ================= DELETE PRODUCT =================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT imagePath FROM products WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete image if exists
    if (rows[0].imagePath) {
      const fullPath = path.join(__dirname, "..", rows[0].imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.query(
      "DELETE FROM products WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    res.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};