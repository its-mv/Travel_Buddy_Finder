const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, tripController.addTrip);
router.get("/trips",authMiddleware, tripController.getTrips);
router.get("/user-trips/:uid", authMiddleware, tripController.getUserTrips);
router.post("/cancel-trip/:tid", authMiddleware, tripController.cancelTrip);
router.post("/add-travel-partners", authMiddleware, tripController.addTravelPartners);
router.post("/complete-trip", authMiddleware, tripController.completeTrip);
router.get("/get-travel-partners/:tid", authMiddleware, tripController.getTravelPartners);

module.exports = router;