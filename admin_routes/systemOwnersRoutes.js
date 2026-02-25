const express = require("express");
const router = express.Router();
// Require from our new custom controller folder
const systemOwnersController = require("../admin_controllers/systemOwnersController");

// The route will be GET /
router.get("/", systemOwnersController.getSystemOwners);

router.post("/users/status", systemOwnersController.toggleUserStatus);

module.exports = router;
