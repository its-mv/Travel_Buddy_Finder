const db = require("../config/db");

exports.addTrip = (req, res) => {
    const { uid, tname, from_city, from_country, to_city, to_country, date, rdate, duration, description, budget, mode, pace, accomodation, activities} = req.body;
    
    if (!uid) return res.status(400).json({ error: "User ID is required" });
    
    const query = "INSERT INTO trip (uid, tname, from_city, from_country, to_city, to_country, date, rdate, duration, description, budget, mode, pace, accomodation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(query, [uid, tname, from_city, from_country, to_city, to_country, date, rdate, duration, description, budget, mode, pace, accomodation], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        const tid = result.insertId; // Get the inserted trip ID

        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            return res.json({ message: "Trip added successfully, no activities provided" });
        }

        // Insert activities into trip_activities table
        const activityQuery = "INSERT INTO trip_activities (uid, tid, activity_id) VALUES ?";
        const activityValues = activities.map(activity_id => [uid, tid, activity_id]);

        db.query(activityQuery, [activityValues], (err) => {
            if (err) return res.status(500).json({ error: "Error inserting activities" });
            return res.json({ message: "Trip and activities added successfully" });
        });
    });
};

exports.getTrips = (req, res) => {
    const query = `
        SELECT 
            t.uid, t.tid, 
            u.fname, u.lname, u.dob, 
            t.tname, t.from_city, t.from_country, 
            t.to_city, t.to_country, t.date, t.rdate, t.duration, t.description, t.budget, t.mode, t.pace, t.accomodation,t.time, t.tid,
            GROUP_CONCAT(DISTINCT ts.style_name SEPARATOR ', ') AS interests,
            GROUP_CONCAT(DISTINCT a.activity_name SEPARATOR ', ') AS activities
        FROM trip t
        JOIN user u ON t.uid = u.uid
        LEFT JOIN user_travel_styles uts ON u.uid = uts.uid
        LEFT JOIN travel_styles ts ON uts.style_id = ts.id
        LEFT JOIN trip_activities ta ON t.tid = ta.tid
        LEFT JOIN activities a ON ta.activity_id = a.id
        GROUP BY t.tid, t.uid, u.fname, u.lname, u.dob, t.tname, t.from_city, t.from_country, t.to_city, t.to_country, t.date, t.rdate, t.duration, t.budget, t.description, t.mode, t.pace, t.accomodation, t.time
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database query failed", details: err.message });
        }

        console.log("Fetched Trips:", results);

        if (!Array.isArray(results)) {
            console.error("Invalid Response Format:", results);
            return res.status(500).json({ error: "Invalid response format" });
        }

        const trips = results.map(trip => {
            if (!trip.dob) {
                console.error("Missing DOB for user:", trip);
                return null;
            }

            const today = new Date();
            const birthDate = new Date(trip.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
                age--;
            }


            return {
                tid: trip.tid,
                uid: trip.uid,
                name: `${trip.fname} ${trip.lname}`,
                age,
                trip_name: trip.tname,
                location: `${trip.from_city}, ${trip.from_country}`,
                destination: `${trip.to_city}, ${trip.to_country}`,
                date: trip.date,
                return_date: trip.rdate,
                duration: trip.duration,
                budget: trip.budget,
                mode: trip.mode,
                pace: trip.pace,
                accomodation: trip.accomodation,
                description: trip.description,
                time: trip.time,
                interests: trip.interests ? trip.interests.split(', ') : [],
                activities: trip.activities ? trip.activities.split(', ') : []
            };
        }).filter(trip => trip !== null);

        res.json(trips);
    });
};

// Fetch trips categorized
exports.getUserTrips = async (req, res) => {
    const uid = req.params.uid;

    if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const query = `
            SELECT *, 
            CASE 
                WHEN status IN ('completed', 'cancelled') OR rdate < CURDATE() THEN 'completed/cancelled' 
                WHEN rdate = CURDATE() THEN 'ongoing' 
                ELSE 'upcoming' 
            END AS trip_category
            FROM trip WHERE uid = ? ORDER BY date ASC`;

        db.query(query, [uid], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel Trip (For Upcoming & Ongoing trips)
exports.cancelTrip = async (req, res) => {
    const { tid } = req.params;
    try {
        const query = `UPDATE trip SET status = 'cancelled' WHERE tid = ? AND status NOT IN ('completed', 'cancelled')`;
        db.query(query, [tid], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(400).json({ message: "Trip cannot be cancelled." });
            res.json({ message: "Trip cancelled successfully." });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Travel Partners
// exports.addTravelPartners = async (req, res) => {
//     const { tid, emails } = req.body;

//     if (!tid || !emails || !Array.isArray(emails) || emails.length === 0) {
//         return res.status(400).json({ error: "Invalid trip ID or email list" });
//     }

//     try {
//         const userQuery = `SELECT uid FROM user WHERE email IN (?)`;
//         db.query(userQuery, [emails], (err, users) => {
//             // if (err) return res.status(500).json({ error: err.message });
//             if (err) {
//                 console.error("Error fetching user IDs:", err);
//                 return res.status(500).json({ error: "Database error", details: err.message });
//             }

//             if (!users || users.length === 0) {
//                 console.error("No users found for emails:", emails);
//                 return res.status(400).json({ message: "No valid emails found." });
//             }

//             const partnerInserts = users.map(user => [tid, user.uid]);
//             const insertQuery = `INSERT INTO completed_trip_traveller (tid, travellers_id) VALUES ?`;

//             db.query(insertQuery, [partnerInserts], (err) => {
//                 if (err) {
//                     console.error("Error inserting travel partners:", err);
//                     return res.status(500).json({ error: "Database error", details: err.message });
//                 }
//                 console.log("Travel partners added successfully:", partnerInserts);
//                 res.json({ message: "Travel partners added successfully." });
//             });
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
exports.addTravelPartners = async (req, res) => {
    const { tid, emails } = req.body;

    if (!tid || !emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: "Invalid trip ID or email list" });
    }

    try {
        const userQuery = `SELECT uid FROM user WHERE email IN (?)`;
        db.query(userQuery, [emails], (err, users) => {
            if (err) {
                console.error("Error fetching user IDs:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            if (!users || users.length === 0) {
                return res.status(400).json({ message: "No valid emails found." });
            }

            const partnerInserts = users.map(user => [tid, user.uid]);

            // Delete old partners before inserting new ones
            const deleteQuery = `DELETE FROM completed_trip_traveller WHERE tid = ?`;

            db.query(deleteQuery, [tid], (deleteErr) => {
                if (deleteErr) {
                    console.error("Error deleting old partners:", deleteErr);
                    return res.status(500).json({ error: "Error removing existing partners." });
                }

                // Insert new travel partners
                const insertQuery = `INSERT INTO completed_trip_traveller (tid, travellers_id) VALUES ?`;
                db.query(insertQuery, [partnerInserts], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting travel partners:", insertErr);
                        return res.status(500).json({ error: "Database error", details: insertErr.message });
                    }
                    res.json({ message: "Travel partners updated successfully." });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Travel Partners
exports.getTravelPartners = async (req, res) => {
    const { tid } = req.params;

    if (!tid) return res.status(400).json({ error: "Trip ID is required" });

    try {
        const query = `
            SELECT u.email 
            FROM completed_trip_traveller ct
            JOIN user u ON ct.travellers_id = u.uid
            WHERE ct.tid = ?
        `;

        db.query(query, [tid], (err, results) => {
            if (err) {
                console.error("Error fetching travel partners:", err);
                return res.status(500).json({ error: "Database error" });
            }

            const partnerEmails = results.map(row => row.email);
            res.json({ partners: partnerEmails });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Mark Trip as Completed
exports.completeTrip = async (req, res) => {
    const { trip_owner_id, tid, sdate, edate } = req.body;
    try {
        const query = `INSERT INTO completed_trip (trip_owner_id, tid, sdate, edate) VALUES (?, ?, ?, ?)`;
        db.query(query, [trip_owner_id, tid, sdate, edate], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Trip marked as completed." });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

