const db = require("../config/db");

const Connection = {
    sendRequest: (senderId, receiverId, tid, callback) => {
        const sql = `INSERT INTO connections (sender_id, receiver_id, tid) VALUES (?, ?, ?)`;
        db.query(sql, [senderId, receiverId, tid], callback);
    },
    getRequests: (userId, callback) => {
        const sql = `SELECT * FROM connections WHERE receiver_id = ? AND status = 'pending'`;
        db.query(sql, [userId], callback);
    },
    updateRequest: (requestId, status, callback) => {
        const sql = `UPDATE connections SET status = ?, updated_at = NOW() WHERE id = ?`;
        db.query(sql, [status, requestId], callback);
    },
};

module.exports = Connection;
