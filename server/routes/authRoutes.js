const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const tripRoutes = require("./tripRoutes");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const db = require("../config/db");
// const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// const storage = multer.memoryStorage(); // Store in memory as buffer
const upload = multer({ storage: storage });

router.post("/signup", upload.single("image"), authController.signup);
router.post("/login", authController.login);
router.get("/user/:id", authController.getUserById);
router.use("/trips", tripRoutes);
router.get("/user/:id/travel-styles", authController.getUserTravelStyles);
router.get("/user-trips/:uid", authMiddleware, authController.getUserTrips);
router.delete("/cancel/:tid", authMiddleware, authController.cancelTrip);


// 🚀 **New Route: Get User Info by Email**
router.get("/user-info", async (req, res) => {
    const { uid } = req.query; // Fetch email from query parameter

    if (!uid) {
        return res.status(400).json({ error: "Uid is required" });
    }

    const query = "SELECT home_city, country FROM user_full_info WHERE uid = ?";

    db.query(query, [uid], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length > 0) {
            res.json(results[0]); // Send user details as JSON response
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

module.exports = router;
