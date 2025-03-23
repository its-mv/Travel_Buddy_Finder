const express = require("express");
const { sendRequest, getRequests, updateRequest, getNotifications, getUserRequests } = require("../controllers/connectionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-request", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, getRequests);
router.post("/update-request", authMiddleware, updateRequest);router.get("/notifications", authMiddleware, getNotifications);router.get("/user-requests", authMiddleware, getUserRequests);


module.exports = router;
