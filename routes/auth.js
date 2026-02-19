const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POS App Routes (Flutter)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Super Admin Routes (Web Dashboard)
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);
router.get('/admin/session', authController.getAdminSession);

module.exports = router;