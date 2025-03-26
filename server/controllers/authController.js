const User = require("../models/userModel2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Adjust the path if needed


exports.signup = async (req, res) => {
    try {
        const { fname, lname, phone, email, password, dob, image, name } = req.body;
        // const image = req.file ? req.file.buffer : null;

        if (!fname || !lname || !phone || !email || !password || !dob || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        User.createUser({ fname, lname, phone, email, password: hashedPassword, dob, image, name }, (err, result) => {
            if (err) {
                console.error("Signup Error:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: "Signup failed due to server error", error: err });
            }
            res.json({ message: "Signup successful", redirect: "/public/html/login.html" });
        });
    } catch (error) {
        console.error("Signup Exception:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Fetch user correctly
        User.findUserByEmail(email, (err, results) => {
            if (err) {
                console.error("Login Error:", err);
                return res.status(500).json({ error: "Server error occurred" });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = results[0];

            if(password === user.name){
                // Generate JWT token
                const token = jwt.sign({ uid: user.uid, fname: user.fname, lname: user.lname }, process.env.JWT_SECRET, { expiresIn: "1d" });

                console.log("Generated token:", token);
                console.log("User data:", user);

                res.json({ 
                    message: "Login successful", 
                    token,
                    uid: user.uid,
                    fname: user.fname, 
                    lname: user.lname,  
                    redirect: "/public/html/home.html" 
                });
            }
            else {
                return res.status(400).json({ error: "Invalid credentials" });
            }

        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
};

exports.getUserById = (req, res) => {
    const uid = req.params.id;
    
        if (!uid) {
            return res.status(400).json({ error: "User ID is required" });
        }
    const query = "SELECT home_city, country FROM user_full_info WHERE uid = ?";

    db.query(query, [uid], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(404).json({ error: "User not found" });

        res.json(results[0]);
    });
};

exports.getUserTravelStyles = (req, res) => {
    const uid = req.params.id;

    if (!uid) return res.status(400).json({ error: "User ID is required" });

    const query = `
        SELECT ts.style_name 
        FROM user_travel_styles uts
        JOIN travel_styles ts ON uts.style_id = ts.id
        WHERE uts.uid = ?;
    `;

    db.query(query, [uid], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json(results.map(row => row.style_name)); // Return array of style names
    });
};


exports.feedback = (req, res) => {
    res.json({
        message: "Feedback received successfully",
        redirect: "/public/html/home.html"
    });
};