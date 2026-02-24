const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, parentId, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const allowedRoles = ['owner', 'admin', 'staff'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 🔥 Security Rules
    if (parentId && role === 'owner') {
      return res.status(400).json({ error: 'Sub-user cannot have owner role' });
    }

    if (!parentId && role !== 'owner') {
      return res.status(400).json({ error: 'Only owner can register without parentId' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users 
       (parentId, name, email, password, role, status, createdOn) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        parentId || null,
        name,
        email,
        hashedPassword,
        role,
        1
      ]
    );

    const userId = result.insertId;

    // 🔥 Assign subscription ONLY if OWNER
    if (role === 'owner') {
      const [planRows] = await pool.query(
        'SELECT durationDays FROM plans WHERE id = 1 AND status = 1'
      );

      if (planRows.length > 0) {
        const duration = planRows[0].durationDays;

        await pool.query(
          `INSERT INTO subscriptions 
          (userId, planId, status, startDate, endDate, createdAt, paymentProof)
          VALUES (?, 1, 'Active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), NOW(), NULL)`,
          [userId, duration]
        );
      }
    }

    const token = jwt.sign(
      {
        userId,
        email,
        role,
        parentId: parentId || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        parentId: parentId || null,
        name,
        email,
        role
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT secret missing' });
    }

    // ==========================================
    // 🔥 SUBSCRIPTION OWNER LOGIC
    // ==========================================

    const subscriptionUserId = user.parentId ? user.parentId : user.id;

    const [subRows] = await pool.query(
      `SELECT s.*, p.name AS planName 
       FROM subscriptions s
       JOIN plans p ON s.planId = p.id
       WHERE s.userId = ? 
       AND s.status = 'Active'
       AND s.endDate >= CURDATE()
       LIMIT 1`,
      [subscriptionUserId]
    );

    const subscription = subRows.length > 0 ? subRows[0] : null;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        parentId: user.parentId
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        parentId: user.parentId,
        name: user.name,
        email: user.email,
        role: user.role
      },
      subscription
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ============================================
// SUPER ADMIN FUNCTIONS (Session Based)
// ============================================

// Super Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pool = await poolPromise;

    // Find super admin
    const [rows] = await pool.query('SELECT * FROM SuperAdmin WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.Password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Set session (no JWT, using session)
    req.session.admin = {
      id: admin.Id,
      name: admin.Name,
      email: admin.Email,
      isAdmin: true
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: admin.Id,
        name: admin.Name,
        email: admin.Email
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// Super Admin Logout
exports.adminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({
        success: true,
        message: 'Logout successful'
      });
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Get Admin Session
exports.getAdminSession = async (req, res) => {
  try {
    if (req.session.admin) {
      res.json({
        success: true,
        admin: req.session.admin
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Session check failed' });
  }
};