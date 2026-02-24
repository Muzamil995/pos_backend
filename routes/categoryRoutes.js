const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

router.get('/', verifyToken, controller.getCategories);
router.post('/', verifyToken, controller.createCategory);
router.put('/:id', verifyToken, controller.updateCategory);
router.delete('/:id', verifyToken, controller.deleteCategory);

module.exports = router;
