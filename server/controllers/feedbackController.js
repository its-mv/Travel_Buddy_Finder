const Feedback = require("../models/feedbackModel");

exports.getFeedback = (req, res) => {
    Feedback.getAllFeedback((err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database query failed", details: err.message });
        }
        res.json(results);
    });
};

// New function to get popular destinations
exports.getPopularDestinations = (req, res) => {
    Feedback.getPopularDestinations((err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database query failed", details: err.message });
        }
        res.json(results);
    });
};
