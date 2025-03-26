const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");


router.get("/profile-completion", authMiddleware, profileController.getProfileCompletion);
router.put("/update", authMiddleware, profileController.updateProfile);
router.get("/", authMiddleware, profileController.getProfile);
router.get("/styles/:id", authController.getUserTravelStyles);
router.put("/profile/styles", authMiddleware, profileController.updateUserTravelStyles);
router.post("/request-verification", authMiddleware, profileController.requestVerification);

module.exports = router;
