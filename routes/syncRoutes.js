const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");
const { verifyToken } = require('../middleware/authMiddleware');

router.get("/full", verifyToken, syncController.fullSync);

module.exports = router;