const UserModel = require("../models/userModel");
const db = require("../config/db"); 

exports.getProfileCompletion = (req, res) => {
    const userId = req.user.uid;

    UserModel.getUserProfile(userId, (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        const totalFields = 8;
        let completedFields = 0;
        let missingFields = [];

        if (user.bio) completedFields++; else missingFields.push("Bio");
        if (user.home_city) completedFields++; else missingFields.push("Home City");
        if (user.country) completedFields++; else missingFields.push("Country");
        if (user.address) completedFields++; else missingFields.push("Address");
        if (user.style) completedFields++; else missingFields.push("Style");
        if (user.emergency_contact) completedFields++; else missingFields.push("Emergency Contact");
        if (user.identity_verified) completedFields++; else missingFields.push("Identity Verification");

        // Check if at least 2 social media are linked
        let socialMediaCount = [user.instagram, user.snapchat, user.facebook].filter(Boolean).length;
        if (socialMediaCount >= 2) completedFields++;
        else missingFields.push("Connect at least 2 social media accounts");

        let completionPercentage = Math.round((completedFields / totalFields) * 100);

        res.json({ completionPercentage, missingFields });
    });
};

exports.updateProfile = (req, res) => {
    const userId = req.user.uid;
    const updatedData = req.body;

    UserModel.updateUserProfile(userId, updatedData, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });
        res.json({ message: "Profile updated successfully" });
    });
};

exports.getProfile = (req, res) => {
    const userId = req.user.uid;

    UserModel.getUserProfile(userId, (err, profile) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });
        if (!profile) return res.status(404).json({ error: "User not found" });
        res.json(profile);
    });
};

exports.updateUserTravelStyles = (req, res) => {
    const uid = req.user.uid; // Assuming auth middleware
    const { styles } = req.body;
    console.log(styles);

    if (!Array.isArray(styles)) {
        return res.status(400).json({ error: "Styles must be an array" });
    }

    // Delete old styles first
    const deleteQuery = "DELETE FROM user_travel_styles WHERE uid = ?";
    db.query(deleteQuery, [uid], (err) => {
        if (err) return res.status(500).json({ error: "Failed to update styles" });

        if (styles.length === 0) return res.json({ message: "Updated successfully" });

        // Insert new styles
        const insertQuery = "INSERT INTO user_travel_styles (uid, style_id) VALUES ?";
        const values = styles.map(styleId => [uid, styleId]);

        db.query(insertQuery, [values], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update styles" });
            res.json({ message: "Travel styles updated successfully" });
        });
    });
};
