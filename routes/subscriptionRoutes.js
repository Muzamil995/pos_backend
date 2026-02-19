const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, controller.getMySubscription);
router.post('/upgrade', verifyToken, controller.requestPlanUpgrade);
router.post('/renew', verifyToken, controller.renewSubscription);
router.get('/status', verifyToken, controller.checkSubscriptionStatus);

module.exports = router;
