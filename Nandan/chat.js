// server.js (Backend - Node.js + Express + Socket.io)
const express = require('express');
const { createServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('sendMessage', (messageData) => {
    io.emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

// Chat.js (Frontend - React Component)
import { useEffect, useState } from "react";
import { io as socketClient } from "socket.io-client";

const socket = socketClient("http://localhost:5000");

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = { username, message, timestamp: new Date().toLocaleTimeString() };
      socket.emit("sendMessage", messageData);
      setMessage("");
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <h2>Enter Your Name</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Chat Room</h2>
          <div>
            {messages.map((msg, index) => (
              <p key={index}><strong>{msg.username}</strong> ({msg.timestamp}): {msg.message}</p>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
