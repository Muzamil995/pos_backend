const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getProducts);
router.get('/:id', verifyToken, controller.getProductById);
router.post('/', verifyToken, controller.createProduct);
router.put('/:id', verifyToken, controller.updateProduct);
router.delete('/:id', verifyToken, controller.deleteProduct);

module.exports = router;
