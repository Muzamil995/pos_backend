const pool = require("../models/db");
const path = require("path");
const fs = require("fs");
const { canUploadImages } = require("../utils/featureAccess");

// ================= GET ALL EMPLOYEES =================
exports.getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employees WHERE userId = ? ORDER BY id DESC",
      [req.user.userId],
    );

    return res.json(rows);
  } catch (err) {
    console.error("Get employees error:", err);
    return res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// ================= GET SINGLE EMPLOYEE =================
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM employees WHERE id = ? AND userId = ?",
      [id, req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Get employee error:", err);
    return res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// ================= CREATE EMPLOYEE =================
// ================= CREATE EMPLOYEE =================
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      empCode,
      dateOfBirth,
      gender,
      nationality,
      joiningDate,
      shift,
      department,
      designation,
      bloodGroup,
      about,
      address,
      country,
      state,
      city,
      zipcode,
      emergencyContact1,
      emergencyRelation1,
      emergencyName1,
      emergencyContact2,
      emergencyRelation2,
      emergencyName2,
      bankName,
      accountNumber,
      ifsc,
      branch,
      status = 1,
    } = req.body;

    if (!firstName || !lastName || !empCode) {
      return res.status(400).json({
        error: "First name, Last name and Employee Code are required",
      });
    }

    // Check duplicate empCode
    const [codeExists] = await pool.query(
      "SELECT id FROM employees WHERE userId = ? AND empCode = ?",
      [req.user.userId, empCode],
    );

    if (codeExists.length > 0) {
      return res.status(400).json({ error: "Employee code already exists" });
    }

    // Check duplicate email
    if (email) {
      const [emailExists] = await pool.query(
        "SELECT id FROM employees WHERE userId = ? AND email = ?",
        [req.user.userId, email],
      );

      if (emailExists.length > 0) {
        return res.status(400).json({ error: "Employee email already exists" });
      }
    }

    let profileImagePath = null;

    if (req.file && canUploadImages(req.subscription)) {
      profileImagePath = `/uploads/${req.user.userId}/employees/${req.file.filename}`;
    } else if (req.file) {
      // 🔥 Silently delete uploaded image if not allowed
      const uploadedPath = req.file.path;

      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO employees (
        userId,
        firstName, lastName, email, contactNumber, empCode,
        dateOfBirth, gender, nationality, joiningDate,
        shift, department, designation, bloodGroup,
        about, address, country, state, city, zipcode,
        emergencyContact1, emergencyRelation1, emergencyName1,
        emergencyContact2, emergencyRelation2, emergencyName2,
        bankName, accountNumber, ifsc, branch,
        profileImagePath, status, createdOn
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )`,
      [
        req.user.userId,
        firstName,
        lastName,
        email || null,
        contactNumber || null,
        empCode,
        dateOfBirth || null,
        gender || null,
        nationality || null,
        joiningDate || null,
        shift || null,
        department || null,
        designation || null,
        bloodGroup || null,
        about || null,
        address || null,
        country || null,
        state || null,
        city || null,
        zipcode || null,
        emergencyContact1 || null,
        emergencyRelation1 || null,
        emergencyName1 || null,
        emergencyContact2 || null,
        emergencyRelation2 || null,
        emergencyName2 || null,
        bankName || null,
        accountNumber || null,
        ifsc || null,
        branch || null,
        profileImagePath, // ✅ placeholder 31
        status ?? 1, // ✅ placeholder 32
      ],
    );

    return res.json({
      success: true,
      id: result.insertId,
      profileImagePath,
      message: "Employee created successfully",
    });
  } catch (err) {
    console.error("Create employee error:", err);
    return res.status(500).json({ error: "Failed to create employee" });
  }
};

// ================= UPDATE EMPLOYEE =================
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingEmployee] = await pool.query(
      "SELECT profileImagePath FROM employees WHERE id = ? AND userId = ?",
      [id, req.user.userId],
    );

    if (existingEmployee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    let profileImagePath = existingEmployee[0].profileImagePath;

    if (req.file && canUploadImages(req.subscription)) {

      // Delete old image if exists
      if (profileImagePath) {
        const oldImageFullPath = path.join(__dirname, "..", profileImagePath);
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }

      profileImagePath = `/uploads/${req.user.userId}/employees/${req.file.filename}`;

    } else if (req.file) {

      // 🔥 Not allowed → delete uploaded file silently
      const uploadedPath = req.file.path;

      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }

      // Keep existing profileImagePath unchanged
    }

    const {
      firstName,
      lastName,
      email,
      contactNumber,
      dateOfBirth,
      gender,
      nationality,
      joiningDate,
      shift,
      department,
      designation,
      bloodGroup,
      about,
      address,
      country,
      state,
      city,
      zipcode,
      emergencyContact1,
      emergencyRelation1,
      emergencyName1,
      emergencyContact2,
      emergencyRelation2,
      emergencyName2,
      bankName,
      accountNumber,
      ifsc,
      branch,
      status,
    } = req.body;

    await pool.query(
      `UPDATE employees SET
        firstName = ?, lastName = ?, email = ?, contactNumber = ?,
        dateOfBirth = ?, gender = ?, nationality = ?, joiningDate = ?,
        shift = ?, department = ?, designation = ?, bloodGroup = ?,
        about = ?, address = ?, country = ?, state = ?, city = ?, zipcode = ?,
        emergencyContact1 = ?, emergencyRelation1 = ?, emergencyName1 = ?,
        emergencyContact2 = ?, emergencyRelation2 = ?, emergencyName2 = ?,
        bankName = ?, accountNumber = ?, ifsc = ?, branch = ?,
        profileImagePath = ?, status = ?
       WHERE id = ? AND userId = ?`,
      [
        firstName,
        lastName,
        email || null,
        contactNumber || null,
        dateOfBirth || null,
        gender || null,
        nationality || null,
        joiningDate || null,
        shift || null,
        department || null,
        designation || null,
        bloodGroup || null,
        about || null,
        address || null,
        country || null,
        state || null,
        city || null,
        zipcode || null,
        emergencyContact1 || null,
        emergencyRelation1 || null,
        emergencyName1 || null,
        emergencyContact2 || null,
        emergencyRelation2 || null,
        emergencyName2 || null,
        bankName || null,
        accountNumber || null,
        ifsc || null,
        branch || null,
        profileImagePath,
        status ?? 1,
        id,
        req.user.userId,
      ],
    );

    return res.json({
      success: true,
      profileImagePath,
      message: "Employee updated successfully",
    });
  } catch (err) {
    console.error("Update employee error:", err);
    return res.status(500).json({ error: "Failed to update employee" });
  }
};

// ================= DELETE EMPLOYEE =================
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT profileImagePath FROM employees WHERE id = ? AND userId = ?",
      [id, req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (rows[0].profileImagePath) {
      const fullPath = path.join(__dirname, "..", rows[0].profileImagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.query("DELETE FROM employees WHERE id = ? AND userId = ?", [
      id,
      req.user.userId,
    ]);

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    console.error("Delete employee error:", err);
    return res.status(500).json({ error: "Failed to delete employee" });
  }
};
