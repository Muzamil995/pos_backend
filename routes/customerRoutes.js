const express = require("express");
const router = express.Router();
const controller = require("../controllers/customerController");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  checkSubscriptionAccess,
} = require("../middleware/subscriptionMiddleware");

const createUploader = require("../middleware/upload");

router.use(verifyToken);
router.use(checkSubscriptionAccess);

// 🔥 customers folder uploader
const customerUpload = createUploader("customers");

router.get("/", verifyToken, controller.getCustomers);
router.get("/:id", verifyToken, controller.getCustomerById);

router.post(
  "/",
  verifyToken,
  customerUpload.single("image"), // 👈 important
  controller.createCustomer,
);

router.put(
  "/:id",
  verifyToken,
  customerUpload.single("image"), // 👈 important
  controller.updateCustomer,
);

router.delete("/:id", verifyToken, controller.deleteCustomer);

module.exports = router;
