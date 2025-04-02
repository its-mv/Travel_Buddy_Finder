const Connection = require("../server/models/connection");
const db = require("../server/config/db"); 

exports.sendRequest = (req, res) => {
    const { sender_id, receiver_id, tid } = req.body;

    console.log("Received Request Body:", { sender_id, receiver_id, tid });

    if (!sender_id || !receiver_id || !tid) {
        return res.status(400).json({ error: "Both sender and receiver IDs are required" });
    }   

    // Check if a request already exists
    const checkQuery = `
        SELECT * FROM connections 
        WHERE sender_id = ? AND receiver_id = ? AND tid = ? AND status = 'pending'
    `;

    db.query(checkQuery, [sender_id, receiver_id, tid], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "You have already sent a connection request." });
        }

        // Insert new request
        const insertQuery = `
            INSERT INTO connections (sender_id, receiver_id, tid, status) 
            VALUES (?, ?, ?, 'pending')
        `;

        db.query(insertQuery, [sender_id, receiver_id, tid], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            res.json({ message: "Connection request sent successfully" });
        });
    });
};

exports.getRequests = (req, res) => {
    const userId = req.user ? req.user.uid : req.body.uid; // Ensure user ID is retrieved correctly

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const query = `
        SELECT c.id, c.sender_id, u.fname, u.lname, u.email, c.status, c.created_at, c.updated_at
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

exports.getNotifications = (req, res) => {
    const userId = req.user ? req.user.uid : req.body.uid;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const query = `
        SELECT c.id, c.sender_id, c.receiver_id, c.status, u.fname, u.lname, u.email, c.created_at, c.updated_at 
        FROM connections c
        JOIN user u ON c.receiver_id = u.uid
        WHERE c.sender_id = ?
        ORDER BY 
            CASE 
                WHEN c.status = 'pending' THEN 1 
                WHEN c.status = 'accepted' THEN 2 
                WHEN c.status = 'declined' THEN 3 
            END,
            CASE 
                WHEN c.status = 'pending' THEN c.created_at 
                WHEN c.status IN ('accepted', 'declined') THEN c.updated_at 
            END ASC,
            c.updated_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        res.status(200).json(results);
    });
};

exports.getUserRequests = (req, res) => {
    const userId = req.user ? req.user.uid : req.body.uid;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sentQuery = `
        SELECT c.id, c.sender_id, c.receiver_id, u.fname, u.lname, u.email, c.status, c.created_at, c.updated_at
        FROM connections c
        JOIN user u ON c.receiver_id = u.uid
        WHERE c.sender_id = ?
        ORDER BY FIELD(c.status, 'pending', 'accepted', 'declined'),
        CASE WHEN c.status = 'pending' THEN c.created_at ELSE c.updated_at END DESC
    `;

    const receivedQuery = `
        SELECT c.id, c.sender_id, c.receiver_id, u.fname, u.lname, u.email, c.status, c.created_at, c.updated_at
        FROM connections c
        JOIN user u ON c.sender_id = u.uid
        WHERE c.receiver_id = ?
        ORDER BY FIELD(c.status, 'pending', 'accepted', 'declined'),
        CASE WHEN c.status = 'pending' THEN c.created_at ELSE c.updated_at END DESC
    `;

    db.query(sentQuery, [userId], (err, sentResults) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        db.query(receivedQuery, [userId], (err, receivedResults) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            res.status(200).json({ sentRequests: sentResults, receivedRequests: receivedResults });
        });
    });
};

exports.getUserConnections = async (req, res) => {
    const userId = req.params.uid;
    
    const query = `
        SELECT u.uid, u.fname, u.lname 
        FROM connections c
        JOIN user u ON (c.sender_id = u.uid OR c.receiver_id = u.uid)
        WHERE (c.sender_id = ? OR c.receiver_id = ?) AND c.status = 'accepted' AND u.uid != ?
    `;
    
    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
};