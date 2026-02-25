const express = require("express");
const router = express.Router();
const systemPlansController = require("../admin_controllers/systemPlansController");

router.get("/", systemPlansController.getAllPlans);

module.exports = router;
