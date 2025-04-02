require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("../server/routes/authRoutes");
const tripRoutes = require("../server/routes/tripRoutes");
const feedbackRoutes = require("../server/routes/feedbackRoutes");
const connectionRoutes = require("./connectionRoutes");
const profileRoutes = require("../server/routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/connections", connectionRoutes);
app.use("/auth", authRoutes);
app.use("/api", feedbackRoutes);
app.use("/trips", tripRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
