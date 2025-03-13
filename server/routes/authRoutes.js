const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");

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

module.exports = router;
