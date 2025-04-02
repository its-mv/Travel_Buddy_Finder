const express = require("express");
const { sendRequest, getRequests, updateRequest, getNotifications, getUserRequests } = require("./connectionController");
const authMiddleware = require("../server/middleware/authMiddleware");
const connectionController = require("./connectionController");

const router = express.Router();

router.post("/send-request", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, getRequests);
router.post("/update-request", authMiddleware, updateRequest);router.get("/notifications", authMiddleware, getNotifications);router.get("/user-requests", authMiddleware, getUserRequests);
router.get("/:uid", connectionController.getUserConnections);


module.exports = router;
