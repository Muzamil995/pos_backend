const { poolPromise } = require('../models/db');
const bcrypt = require('bcryptjs');

// ================= GET ALL EMPLOYEES =================
exports.getEmployees = async (req, res) => {
  try {
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE userId = ? ORDER BY id DESC',
      [req.user.userId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};


// ================= GET SINGLE EMPLOYEE =================
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};


// ================= CREATE EMPLOYEE =================
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      empCode,
      designation,
      password,
      status
    } = req.body;

    const pool = await poolPromise;

    // Prevent duplicate empCode per user
    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE userId = ? AND empCode = ?',
      [req.user.userId, empCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee code already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO employees
      (userId, firstName, lastName, email, contactNumber, empCode, designation, password, status, createdOn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        firstName,
        lastName,
        email,
        contactNumber,
        empCode,
        designation,
        hashedPassword,
        status
      ]
    );

    res.json({ success: true, message: 'Employee created successfully' });

  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};


// ================= UPDATE EMPLOYEE =================
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      contactNumber,
      designation,
      status
    } = req.body;

    const pool = await poolPromise;

    await pool.query(
      `UPDATE employees SET
      firstName = ?,
      lastName = ?,
      email = ?,
      contactNumber = ?,
      designation = ?,
      status = ?
      WHERE id = ? AND userId = ?`,
      [
        firstName,
        lastName,
        email,
        contactNumber,
        designation,
        status,
        id,
        req.user.userId
      ]
    );

    res.json({ success: true, message: 'Employee updated successfully' });

  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};


// ================= DELETE EMPLOYEE =================
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.query(
      'DELETE FROM employees WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    res.json({ success: true, message: 'Employee deleted successfully' });

  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
