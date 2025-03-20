const express = require("express");
const { sendRequest, getRequests, updateRequest } = require("../controllers/connectionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-request", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, getRequests);
router.post("/update-request", authMiddleware, updateRequest);

module.exports = router;
