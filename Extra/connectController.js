const db = require("../server/config/db"); // MySQL Database Connection

// 📌 Send Connection Request
exports.sendConnectionRequest = (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is required" });
    }

    const checkQuery = `SELECT * FROM connections WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
    
    db.query(checkQuery, [senderId, receiverId, receiverId, senderId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Connection request already exists" });
        }

        const insertQuery = `INSERT INTO connections (sender_id, receiver_id, status) VALUES (?, ?, 'pending')`;
        db.query(insertQuery, [senderId, receiverId], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.json({ message: "Connection request sent!" });
        });
    });
};

// 📌 Get Pending Connection Requests
exports.getPendingRequests = (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT c.id, c.sender_id, u.fname, u.lname
        FROM connections c
        JOIN user u ON c.sender_id = u.uid
        WHERE c.receiver_id = ? AND c.status = 'pending'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results);
    });
};

// 📌 Accept / Reject Connection Request
exports.respondToRequest = (req, res) => {
    const { requestId, action } = req.body;

    if (!["accepted", "rejected"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    const query = `UPDATE connections SET status = ? WHERE id = ?`;
    db.query(query, [action, requestId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ message: `Request ${action}` });
    });
};

// 📌 Get Connected Users
exports.getConnectedUsers = (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT u.uid, u.fname, u.lname
        FROM connections c
        JOIN user u ON 
            (c.sender_id = u.uid AND c.receiver_id = ?) 
            OR (c.receiver_id = u.uid AND c.sender_id = ?)
        WHERE c.status = 'accepted'
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results);
    });
};
