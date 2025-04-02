const db = require("../config/db");

exports.getUserConnections = (req, res) => {
    const { uid } = req.params;
    const query = `
        SELECT DISTINCT u.uid, u.fname, u.lname FROM connections 
        JOIN user u ON (connections.sender_id = u.uid OR connections.receiver_id = u.uid)
        WHERE (connections.sender_id = ? OR connections.receiver_id = ?) AND connections.status = 'accepted' AND u.uid != ?;
    `;
    db.query(query, [uid, uid, uid], (err, results) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json(results);
    });
};

exports.getMessages = (req, res) => {
    const { uid, rid } = req.params;
    const query = `SELECT * FROM messages WHERE (sid = ? AND rid = ?) OR (sid = ? AND rid = ?) ORDER BY timestamp ASC`;
    db.query(query, [uid, rid, rid, uid], (err, results) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json(results, );
    });
};

exports.sendMessage = (req, res) => {
    const { sid, rid, message } = req.body;
    const query = "INSERT INTO messages (sid, rid, message, status) VALUES (?, ?, ?, 'sent')";
    db.query(query, [sid, rid, message], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: error.message });
        res.json({ success: true, message: "Message sent." });
    });
};

exports.editMessage = (req, res) => {
    const { messageId, newText } = req.body;
    db.query("UPDATE messages SET message = ? WHERE id = ?", [newText, messageId], (err) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ success: true, message: "Message updated successfully" });
    });
};

// exports.deleteMessage = (req, res) => {
//     const { id } = req.params;
//     db.query("DELETE FROM messages WHERE id = ?", [id], (err) => {
//         if (err) return res.status(500).json({ error: "DB error" });
//         res.json({ success: true, message: "Message deleted successfully" });
//     });
// };
exports.deleteMessage = (req, res) => {
    const { id } = req.params;

    db.query(
        "UPDATE messages SET deleted_message = message, message = 'Deleted Message' WHERE id = ? AND message != 'Deleted Message'",
        [id],
        (err) => {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ success: true, message: "Message deleted successfully" });
        }
    );
};
