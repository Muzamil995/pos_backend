const express = require("express");
const router = express.Router();
const systemSubscriptionsController = require("../admin_controllers/systemSubscriptionsController");

// Route: GET /
router.get("/", systemSubscriptionsController.getAllSubscriptions);
router.post("/status", systemSubscriptionsController.toggleSubscriptionStatus);
router.post("/approve-payment", systemSubscriptionsController.approvePayment);
router.post("/reject-payment", systemSubscriptionsController.rejectPayment);

module.exports = router;
