const db = require("../config/db");

const Feedback = {
    getAllFeedback: (callback) => {
        const query = "SELECT description, name, city, country FROM feedback ORDER BY fid DESC";
        db.query(query, callback);
    },
    getPopularDestinations: (callback) => {
        const query = `
            SELECT city, country, COUNT(uid) as travelers
            FROM feedback
            GROUP BY city, country
            ORDER BY travelers DESC
        `;
        db.query(query, callback);
    }
};

module.exports = Feedback;
