const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getSettings);
router.post('/', verifyToken, controller.saveSettings);

module.exports = router;
