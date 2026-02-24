const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const createUploader = require("../middleware/upload");
const { verifyToken } = require('../middleware/authMiddleware');
const { checkSubscriptionAccess } = require('../middleware/subscriptionMiddleware');

router.use(verifyToken);
router.use(checkSubscriptionAccess);

// 🔥 products folder uploader
const productUpload = createUploader("products");

router.get("/", verifyToken, controller.getProducts);
router.get("/:id", verifyToken, controller.getProductById);

router.post(
  "/",
  verifyToken,
  productUpload.single("image"),   // 👈 important
  controller.createProduct
);

router.put(
  "/:id",
  verifyToken,
  productUpload.single("image"),   // 👈 important
  controller.updateProduct
);

router.delete("/:id", verifyToken, controller.deleteProduct);

module.exports = router;