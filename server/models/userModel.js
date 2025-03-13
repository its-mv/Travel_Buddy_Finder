const db = require("../config/db");

const User = {
    createUser: (userData, callback) => {
        const { fname, lname, phone, email, password, dob, image, name } = userData;
        const query = "INSERT INTO user (fname, lname, phone, email, password, dob, image, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(query, [fname, lname, phone, email, password, dob, image, name], callback);
    },

    findUserByEmail: (email, callback) => {
        const query = "SELECT * FROM user WHERE email = ?";
        db.query(query, [email], callback);
    }
};

module.exports = User;
