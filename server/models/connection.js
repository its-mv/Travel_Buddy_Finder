const db = require("../config/db");

const Connection = {
    sendRequest: (senderId, receiverId, callback) => {
        const sql = `INSERT INTO connections (sender_id, receiver_id) VALUES (?, ?)`;
        db.query(sql, [senderId, receiverId], callback);
    },
    getRequests: (userId, callback) => {
        const sql = `SELECT * FROM connections WHERE receiver_id = ? AND status = 'pending'`;
        db.query(sql, [userId], callback);
    },
    updateRequest: (requestId, status, callback) => {
        const sql = `UPDATE connections SET status = ? WHERE id = ?`;
        db.query(sql, [status, requestId], callback);
    },
};

module.exports = Connection;
