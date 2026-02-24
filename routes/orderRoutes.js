const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);
router.get('/', verifyToken, controller.getOrders);
router.get('/:id', verifyToken, controller.getOrderById);
router.post('/', verifyToken, controller.createOrder);
router.put('/:id', verifyToken, controller.updateOrder); // 🔥 NEW
router.delete('/:id', verifyToken, controller.deleteOrder);

module.exports = router;