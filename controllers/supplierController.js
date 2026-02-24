const pool = require("../models/db");
const path = require("path");
const fs = require("fs");

// ================= GET ALL SUPPLIERS =================
exports.getSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM suppliers WHERE userId = ? ORDER BY id DESC",
      [req.user.userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get suppliers error:", err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

// ================= GET SINGLE SUPPLIER =================
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM suppliers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get supplier error:", err);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
};

// ================= CREATE SUPPLIER =================
exports.createSupplier = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      email = "",
      phone = "",
      address = "",
      city = "",
      state = "",
      country = "",
      postalCode = "",
      status = 1,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "First name and last name are required",
      });
    }

    // 🔍 Prevent duplicate email per user
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM suppliers WHERE userId = ? AND email = ?",
        [req.user.userId, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Supplier email already exists",
        });
      }
    }

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.user.userId}/suppliers/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers
       (userId, firstName, lastName, email, phone, address, city, state, country, postalCode, status, imagePath, createdOn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        firstName,
        lastName,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        country || null,
        postalCode || null,
        status,
        imagePath,
      ]
    );

    res.json({
      success: true,
      message: "Supplier created successfully",
      id: result.insertId,
      imagePath,
    });

  } catch (err) {
    console.error("Create supplier error:", err);
    res.status(500).json({ error: "Failed to create supplier" });
  }
};

// ================= UPDATE SUPPLIER =================
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName = "",
      lastName = "",
      email = "",
      phone = "",
      address = "",
      city = "",
      state = "",
      country = "",
      postalCode = "",
      status = 1,
    } = req.body;

    // 🔍 Prevent duplicate email
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM suppliers WHERE userId = ? AND email = ? AND id != ?",
        [req.user.userId, email, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Supplier email already exists",
        });
      }
    }

    // Get existing supplier (for image delete handling)
    const [existingSupplier] = await pool.query(
      "SELECT imagePath FROM suppliers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    let imagePath = existingSupplier[0].imagePath;

    // If new image uploaded → replace old image
    if (req.file) {
      // Delete old image if exists
      if (imagePath) {
        const oldImageFullPath = path.join(
          __dirname,
          "..",
          imagePath
        );
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }

      imagePath = `/uploads/${req.user.userId}/suppliers/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE suppliers SET
        firstName = ?,
        lastName = ?,
        email = ?,
        phone = ?,
        address = ?,
        city = ?,
        state = ?,
        country = ?,
        postalCode = ?,
        status = ?,
        imagePath = ?
       WHERE id = ? AND userId = ?`,
      [
        firstName,
        lastName,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        country || null,
        postalCode || null,
        status,
        imagePath,
        id,
        req.user.userId,
      ]
    );

    res.json({
      success: true,
      message: "Supplier updated successfully",
      imagePath,
    });

  } catch (err) {
    console.error("Update supplier error:", err);
    res.status(500).json({ error: "Failed to update supplier" });
  }
};

// ================= DELETE SUPPLIER =================
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT imagePath FROM suppliers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Delete image file if exists
    if (rows[0].imagePath) {
      const fullPath = path.join(__dirname, "..", rows[0].imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.query(
      "DELETE FROM suppliers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });

  } catch (err) {
    console.error("Delete supplier error:", err);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
};