// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        credentials: true
    }
});

app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/connections", connectionRoutes);
app.use("/auth", authRoutes);
app.use("/api", feedbackRoutes);
app.use("/trips", tripRoutes);
app.use("/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

let users = {}; // Store online users' socket IDs

io.on("connection", (socket) => {
    // console.log("✅ User connected:", socket.id);

    socket.on("register", (userId) => {
        users[userId] = socket.id;
        
        // console.log(`📌 Registered user ${userId} with socket ${socket.id}`);
    });

    socket.on("sendMessage", (data) => {
        console.log(`📩 Sending Message from ${data.sid} to ${data.rid}:`, data.message);

        if (users[data.rid]) {
            console.log(`🎯 Emitting to receiver: ${users[data.rid]}`);
            io.to(users[data.rid]).emit("receiveMessage", data);
        }
    });

    socket.on("messageDelivered", ({ messageId, receiverId }) => {
        // Notify sender
        for (let userId in users) {
            if (users[userId]) {
                io.to(users[userId]).emit("messageDelivered", { messageId });
            }
        }
    });
    
    socket.on("messageRead", ({ messageId, receiverId }) => {
        for (let userId in users) {
            if (users[userId]) {
                io.to(users[userId]).emit("messageRead", { messageId });
            }
        }
    });    

    socket.on("editMessage", ({ messageId, newText }) => {
        io.emit("messageEdited", { messageId, newText });
    });

    socket.on("deleteMessage", ({ messageId }) => {
        io.emit("messageDeleted", { messageId });
    });

    socket.on("disconnect", () => {
        // console.log("❌ User disconnected");
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));