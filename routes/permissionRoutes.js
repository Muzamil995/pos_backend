const express = require("express");
const router = express.Router();
const controller = require("../controllers/permissionController");
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

// GET permissions of a specific sub-user
router.get("/:userId", verifyToken, controller.getUserPermissions);

// CREATE (bulk save)
router.post("/", verifyToken, controller.createPermissions);

// UPDATE single permission
router.put("/:id", verifyToken, controller.updatePermission);

// DELETE single permission
router.delete("/:id", verifyToken, controller.deletePermission);

module.exports = router;