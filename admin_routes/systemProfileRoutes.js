const express = require("express");
const router = express.Router();
const systemProfileController = require("../admin_controllers/systemProfileController");
const authMiddleware = require("../middleware/authMiddleware"); // Path to your JWT middleware

// Secure these routes with verifyToken
router.put(
  "/update",
  authMiddleware.verifyToken,
  systemProfileController.updateProfile,
);
router.put(
  "/password",
  authMiddleware.verifyToken,
  systemProfileController.updatePassword,
);

module.exports = router;
