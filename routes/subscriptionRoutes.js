const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionController");
const { verifyToken } = require("../middleware/authMiddleware");
const createUploader = require("../middleware/upload");

const uploadSubscription = createUploader("subscription");

router.get("/plans", controller.getAllPlans);

router.get("/me", verifyToken, controller.getMySubscription);
router.get("/status", verifyToken, controller.checkSubscriptionStatus);

router.post(
  "/upgrade",
  verifyToken,
  uploadSubscription.single("paymentProof"),
  controller.requestPlanUpgrade
);

router.post(
  "/renew",
  verifyToken,
  uploadSubscription.single("paymentProof"),
  controller.renewSubscription
);

router.get("/history", verifyToken, controller.getSubscriptionHistory);

module.exports = router;