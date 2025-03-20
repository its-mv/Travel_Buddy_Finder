const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const authRoutes = require("../server/routes/authRoutes");
const tripRoutes = require("../server/routes/tripRoutes");
const feedbackRoutes = require("../server/routes/feedbackRoutes");
const connectionRoutes = require("../server/routes/connectionRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
});

// Store connected users
const connectedUsers = {};

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("registerUser", (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        for (const userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
    });
});

// Middleware to attach WebSocket to req
app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/connections", connectionRoutes);
app.use("/auth", authRoutes);
app.use("/api", feedbackRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
