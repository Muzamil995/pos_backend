const express = require("express");
const router = express.Router();
const systemSubscriptionsController = require("../admin_controllers/systemSubscriptionsController");

// Route: GET /
router.get("/", systemSubscriptionsController.getAllSubscriptions);

module.exports = router;
