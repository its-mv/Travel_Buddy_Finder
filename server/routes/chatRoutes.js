const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/connections/:uid", chatController.getUserConnections);
router.get("/messages/:uid/:rid", chatController.getMessages);
router.post("/send-message", chatController.sendMessage);
router.post("/edit-message", chatController.editMessage);
router.delete("/delete-message/:id", chatController.deleteMessage);

module.exports = router;
