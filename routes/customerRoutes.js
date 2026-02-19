const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getCustomers);
router.get('/:id', verifyToken, controller.getCustomerById);
router.post('/', verifyToken, controller.createCustomer);
router.put('/:id', verifyToken, controller.updateCustomer);
router.delete('/:id', verifyToken, controller.deleteCustomer);

module.exports = router;
