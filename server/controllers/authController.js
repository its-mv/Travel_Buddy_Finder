const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { fname, lname, phone, email, password, dob, name } = req.body;

        if (!fname || !lname || !phone || !email || !password || !dob || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        User.createUser({ fname, lname, phone, email, password: hashedPassword, dob, name }, (err, result) => {
            if (err) {
                console.error("Signup Error:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Email or phone number already exists" });
                }
                return res.status(500).json({ error: "Signup failed due to server error" });
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
                    fname: user.fname, 
                    lname: user.lname,  
                    redirect: "/public/html/dashboard.html" 
                });
            }
            else {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            // Compare password
            // bcrypt.compare(password, user.password, (err, match) => {
            //     if (err || !match) {
            //         return res.status(400).json({ error: "Invalid credentials" });
            //     }

            //     // Generate JWT token
            //     const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: "1d" });

            //     res.json({ message: "Login successful", token, redirect: "/public/html/dashboard.html" });
            // });
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
};
