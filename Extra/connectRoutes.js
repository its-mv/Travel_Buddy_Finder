const express = require("express");
const router = express.Router();
const connectController = require("./connectController"); // ✅ Ensure correct import
const authMiddleware = require("../server/middleware/authMiddleware");

router.post("/send-request", authMiddleware, connectController.sendConnectionRequest);

router.get("/pending", authMiddleware, connectController.getPendingRequests); // ✅ Fixed naming

router.post("/respond", authMiddleware, connectController.respondToRequest);

router.get("/connected", authMiddleware, connectController.getConnectedUsers);

module.exports = router;
