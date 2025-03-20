const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("../server/routes/authRoutes");
const app = express();
const tripRoutes = require("../server/routes/tripRoutes");
const feedbackRoutes = require("../server/routes/feedbackRoutes");
const connectRoutes = require("./connectRoutes");

app.use("/connections", connectRoutes);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/api", feedbackRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get('/api/user', (req, res) => {
    // Check if user exists in the request (depends on your authentication method)
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({ uid: req.user.uid }); // Ensure this returns uid correctly
});
