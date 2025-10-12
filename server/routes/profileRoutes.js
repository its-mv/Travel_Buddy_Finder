const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const multer = require("multer");

// Configure multer to use memory storage for Supabase upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});


router.get("/profile-completion", authMiddleware, profileController.getProfileCompletion);
router.put("/update", authMiddleware, profileController.updateProfile);
router.get("/", authMiddleware, profileController.getProfile);
router.get("/styles/:id", authController.getUserTravelStyles);
router.put("/profile/styles", authMiddleware, profileController.updateUserTravelStyles);
router.post("/request-verification", authMiddleware, profileController.requestVerification);
router.post("/upload-image", authMiddleware, upload.single("profileImage"), profileController.uploadProfileImage);

module.exports = router;
