const express = require("express");
const router = express.Router();
const controller = require("../controllers/supplierController");
const createUploader = require("../middleware/upload");
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

const supplierUpload = createUploader("suppliers");

router.get("/", verifyToken, controller.getSuppliers);
router.get("/:id", verifyToken, controller.getSupplierById);

router.post(
  "/",
  verifyToken,
  supplierUpload.single("image"),
  controller.createSupplier
);

router.put(
  "/:id",
  verifyToken,
  supplierUpload.single("image"),
  controller.updateSupplier
);

router.delete("/:id", verifyToken, controller.deleteSupplier);

module.exports = router;