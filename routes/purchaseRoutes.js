const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

router.get('/', verifyToken, controller.getPurchases);
router.get('/:id', verifyToken, controller.getPurchaseById);
router.post('/', verifyToken, controller.createPurchase);
router.delete('/:id', verifyToken, controller.deletePurchase);

module.exports = router;
