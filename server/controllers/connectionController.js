const Connection = require("../models/connection");
const db = require("../config/db"); 

exports.sendRequest = (req, res) => {
    const { sender_id, receiver_id } = req.body;

    console.log("Received Request Body:", req.body);

    if (!sender_id || !receiver_id) {
        console.error("Missing sender_id or receiver_id");
        return res.status(400).json({ error: "Both sender and receiver IDs are required" });

    }

    const query = "INSERT INTO connections (sender_id, receiver_id, status) VALUES (?, ?, 'pending')";

    db.query(query, [sender_id, receiver_id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        res.json({ message: "Connection request sent successfully" });
    });
};


exports.getRequests = (req, res) => {
    const userId = req.user ? req.user.uid : req.body.user_id; // Ensure user ID is retrieved correctly

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const query = `
        SELECT c.id, c.sender_id, u.fname, u.lname, u.email 
        FROM connections c
        JOIN user u ON c.sender_id = u.uid
        WHERE c.receiver_id = ? AND c.status = 'pending'
    `;
    
    // console.log("Query:", query);
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        res.status(200).json(results);
    });
};  

exports.updateRequest = (req, res) => {
    const { requestId, status } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ error: "Request ID and status are required" });
    }

    // Allow only "accepted" or "declined" as valid status values
    if (status !== "accepted" && status !== "declined") {
        return res.status(400).json({ error: "Invalid status value" });
    }

    Connection.updateRequest(requestId, status, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        res.json({ message: `Request ${status} successfully` });
    });
};


