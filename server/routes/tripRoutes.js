const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, tripController.addTrip);
router.get("/trips",authMiddleware, tripController.getTrips);

module.exports = router;