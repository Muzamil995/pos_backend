const express = require("express");
const router = express.Router();
const systemPlansController = require("../admin_controllers/systemPlansController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", systemPlansController.getAllPlans);
// Secure the edit route
router.put(
  "/:id",
  authMiddleware.verifyToken,
  systemPlansController.updatePlan,
);

module.exports = router;
