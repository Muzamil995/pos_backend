const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../models/db'); // MySQL pool

// Register new user (POS App - Flutter)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const pool = await poolPromise;

    // Check if user already exists
    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      'INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully!' 
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// Login user (POS App - Flutter)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pool = await poolPromise;

    // Find user
    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.Password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not defined in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.Id, 
        email: user.Email,
        name: user.Name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.Id,
        name: user.Name,
        email: user.Email
      }
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