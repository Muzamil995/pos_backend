const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getEmployees);
router.get('/:id', verifyToken, controller.getEmployeeById);
router.post('/', verifyToken, controller.createEmployee);
router.put('/:id', verifyToken, controller.updateEmployee);
router.delete('/:id', verifyToken, controller.deleteEmployee);

module.exports = router;
