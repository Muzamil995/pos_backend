const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get('/users', subscriptionController.getAllUsers);
router.post('/create', subscriptionController.createSubscription);
router.get('/user/:userId', subscriptionController.getUserSubscription);

module.exports = router;