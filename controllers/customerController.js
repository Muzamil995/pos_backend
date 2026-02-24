const pool = require("../models/db");
const path = require("path");
const fs = require("fs");

// ================= GET ALL CUSTOMERS =================
exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customers WHERE userId = ? ORDER BY id DESC",
      [req.user.userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// ================= GET SINGLE CUSTOMER =================
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM customers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// ================= CREATE CUSTOMER =================
exports.createCustomer = async (req, res) => {
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

    // Prevent duplicate email per user
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM customers WHERE userId = ? AND email = ?",
        [req.user.userId, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Customer email already exists",
        });
      }
    }

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.user.userId}/customers/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO customers
      (userId, firstName, lastName, email, phone, address,
       city, state, country, postalCode, status, imagePath, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        country,
        postalCode,
        status,
        imagePath,
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
      imagePath,
      message: "Customer created successfully",
    });

  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// ================= UPDATE CUSTOMER =================
exports.updateCustomer = async (req, res) => {
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

    // Prevent duplicate email
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM customers WHERE userId = ? AND email = ? AND id != ?",
        [req.user.userId, email, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Customer email already exists",
        });
      }
    }

    const [existingCustomer] = await pool.query(
      "SELECT imagePath FROM customers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (existingCustomer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    let imagePath = existingCustomer[0].imagePath;

    if (req.file) {

      if (imagePath) {
        const oldImageFullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }

      imagePath = `/uploads/${req.user.userId}/customers/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE customers SET
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
        email,
        phone,
        address,
        city,
        state,
        country,
        postalCode,
        status,
        imagePath,
        id,
        req.user.userId,
      ]
    );

    res.json({
      success: true,
      imagePath,
      message: "Customer updated successfully",
    });

  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// ================= DELETE CUSTOMER =================
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT imagePath FROM customers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Delete image if exists
    if (rows[0].imagePath) {
      const fullPath = path.join(__dirname, "..", rows[0].imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.query(
      "DELETE FROM customers WHERE id = ? AND userId = ?",
      [id, req.user.userId]
    );

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });

  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};