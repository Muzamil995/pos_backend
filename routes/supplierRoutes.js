const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getSuppliers);
router.get('/:id', verifyToken, controller.getSupplierById);
router.post('/', verifyToken, controller.createSupplier);
router.put('/:id', verifyToken, controller.updateSupplier);
router.delete('/:id', verifyToken, controller.deleteSupplier);

module.exports = router;
