const express = require('express');
const router = express.Router();
const controller = require('../controllers/shiftController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

router.get('/active', verifyToken, controller.getActiveShift);
router.post('/open', verifyToken, controller.openShift);
router.post('/close', verifyToken, controller.closeShift);
router.get('/history', verifyToken, controller.getShiftHistory);

module.exports = router;
