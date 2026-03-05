const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");

const createUploader = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  checkSubscriptionAccess,
} = require("../middleware/subscriptionMiddleware");

router.use(verifyToken);
router.use(checkSubscriptionAccess);

// 🔥 employees folder uploader
const employeeUpload = createUploader("employees");

router.get("/", verifyToken, controller.getEmployees);
router.get("/:id", verifyToken, controller.getEmployeeById);

router.post(
  "/",
  verifyToken,
  employeeUpload.single("image"), // 👈 important
  controller.createEmployee,
);

router.put(
  "/:id",
  verifyToken,
  employeeUpload.single("image"), // 👈 important
  controller.updateEmployee,
);

router.delete("/:id", verifyToken, controller.deleteEmployee);

module.exports = router;
