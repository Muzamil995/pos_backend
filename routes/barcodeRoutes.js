const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  checkSubscriptionAccess,
} = require("../middleware/subscriptionMiddleware");

const barcodeController = require("../controllers/barcodeController");

router.use(verifyToken);
router.use(checkSubscriptionAccess);
// Create single
router.post("/", verifyToken, barcodeController.createBarcode);

// Bulk sync
router.post("/bulk", verifyToken, barcodeController.bulkCreateBarcodes);

// Get all
router.get("/", verifyToken, barcodeController.getBarcodes);

// Get single
router.get("/:id", verifyToken, barcodeController.getBarcodeById);

// Delete
router.delete("/:id", verifyToken, barcodeController.deleteBarcode);

module.exports = router;
