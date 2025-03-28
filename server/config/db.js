const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// console.log(db);

db.connect((err) => {
    // console.log(err);
    if (err) {
        console.error("Database Connection Failed ❌ :", err);
        return;
    }
    console.log("Connected to database ✅");
});

module.exports = db;


// const mysql = require("mysql");
// require("dotenv").config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "travel_buddy_finder"
// });


// db.connect((err) => {
//     if (err) {
//         console.error("❌ Database Connection Failed:", err.code, err.sqlMessage);
//         return;
//     }
//     console.log("✅ Connected to database");
// });

// module.exports = db;
