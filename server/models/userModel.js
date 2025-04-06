const db = require("../config/db");

const User = {
    createUser: (userData, callback) => {
        const { fname, lname, gender, phone, email, password, dob, image, name } = userData;
        const query = "INSERT INTO user (fname, lname, gender, phone, email, password, dob,  name) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(query, [fname, lname, gender, phone, email, password, dob, name], (err, result) => {
            if (err) return callback(err, null);

            const userId = result.insertId;
            const gender = userData.gender;
            // console.log("User Gender:", gender);

            // Insert into `user_full_info` table using uid
            const infoQuery = `INSERT INTO user_full_info (uid, gender) VALUES (?, ?)`;

            db.query(infoQuery, [userId, gender], (infoErr, infoResult) => {
                if (infoErr) return callback(infoErr, null);
                return callback(null, { userId, message: "User created successfully" });
            });
        });
    },

    findUserByEmail: (email, callback) => {
        const query = "SELECT * FROM user WHERE email = ?";
        db.query(query, [email], callback);
    },

    getUserProfile: (userId, callback) => {
        const query = `SELECT 
                            ufi.bio, 
                            ufi.home_city, 
                            ufi.country, 
                            ufi.address, 
                            ufi.emergency_contact, 
                            ufi.identity_verified, 
                            ufi.instagram, 
                            ufi.snapchat, 
                            ufi.facebook,
                            GROUP_CONCAT(ts.style_name) AS style
                        FROM user_full_info ufi
                        LEFT JOIN user_travel_styles uts ON ufi.uid = uts.uid
                        LEFT JOIN travel_styles ts ON uts.style_id = ts.id
                        WHERE ufi.uid = ?
                        GROUP BY ufi.uid;
                       `;
    
        db.query(query, [userId], (err, results) => {
            if (err) return callback(err, null);
            console.log(results);
            if (results.length === 0) return callback(null, null);
            return callback(null, results[0]);
        })
    },  

    // getUserrProfile (for edit)
    getUserrProfile: (userId, callback) => {
        const query = `SELECT 
                            ufi.bio, 
                            ufi.home_city, 
                            ufi.country, 
                            ufi.address, 
                            ufi.emergency_contact, 
                            ufi.identity_verified, 
                            ufi.instagram, 
                            ufi.snapchat, 
                            ufi.facebook,
                            GROUP_CONCAT(uts.style_id) AS style 
                        FROM user_full_info ufi
                        LEFT JOIN user_travel_styles uts ON ufi.uid = uts.uid
                        WHERE ufi.uid = ?
                        GROUP BY ufi.uid;
                       `;
    
        db.query(query, [userId], (err, results) => {
            if (err) return callback(err, null);
            console.log(results);
            if (results.length === 0) return callback(null, null);
            return callback(null, results[0]);
        })
    },  
    
    updateUserProfile: (userId, userData, callback) => {
        const query = `
            UPDATE user_full_info 
            SET bio = ?, home_city = ?, country = ?, address = ?, 
                emergency_contact = ?,
                instagram = ?, snapchat = ?, facebook = ? 
            WHERE uid = ?
        `;

        db.query(query, [
            userData.bio, userData.home_city, userData.country, userData.address, 
            userData.emergency_contact,
            userData.instagram, userData.snapchat, userData.facebook, userId
        ], callback);
    },

    saveUserStyles: (uid, styles, callback) => {
        // Remove existing styles
        db.query("DELETE FROM user_travel_styles WHERE uid = ?", [uid], (err) => {
            if (err) return callback(err);

            // Insert new styles
            if (styles.length > 0) {
                const values = styles.map(styleId => [uid, styleId]);
                db.query("INSERT INTO user_travel_styles (uid, style_id) VALUES ?", [values], callback);
            } else {
                callback(null);
            }
        });
    }
        // },
    
    // getPendingVerifications: (callback) => {
    //     const query = "SELECT uid, name FROM user_full_info WHERE identity_verified = 0";
    //     db.query(query, callback);
    // },
    
    // approveVerification: (uid, callback) => {
    //     const query = "UPDATE user_full_info SET identity_verified = 1 WHERE uid = ?";
    //     db.query(query, [uid], callback);
    // }
};



module.exports = User;
