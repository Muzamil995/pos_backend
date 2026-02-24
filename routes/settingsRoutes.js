const express = require("express");
const router = express.Router();
const controller = require("../controllers/settingsController");
const createUploader = require("../middleware/upload");
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

const settingsUpload = createUploader("settings");

router.get("/", verifyToken, controller.getSettings);

router.post(
  "/business",
  verifyToken,
  settingsUpload.single("image"),
  controller.saveBusiness
);

router.post("/receipt", verifyToken, controller.saveReceipt);
router.post("/tax", verifyToken, controller.saveTax);
router.post("/security", verifyToken, controller.saveSecurity);

module.exports = router;