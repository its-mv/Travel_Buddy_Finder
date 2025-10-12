const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

router.get("/feedback", feedbackController.getFeedback);
router.get("/popular-destinations", feedbackController.getPopularDestinations);

module.exports = router;
