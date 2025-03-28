import { useEffect, useState } from "react";
import { io as socketClient } from "socket.io-client";
import axios from "axios";

const socket = socketClient("http://localhost:5000");

export default function Chat() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/signup", { username, password });
      alert("Signup successful! Please log in.");
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
      fetchProfile();
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: token }
      });
      setUsername(res.data.username);
      setProfilePicUrl(res.data.profilePic);
    } catch (error) {
      alert("Failed to fetch profile");
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_pic", file);
    formData.append("username", username);

    try {
      const res = await axios.post("http://localhost:5000/upload-profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfilePicUrl(res.data.profilePicUrl);
    } catch (error) {
      alert("Failed to upload profile picture");
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
      {!loggedIn ? (
        <div>
          <h2>Login / Signup</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleSignup}>Signup</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <img src={profilePicUrl || "default-profile.png"} alt="Profile" style={{ width: 100, height: 100, borderRadius: "50%" }} />
          <input type="file" accept="image/*" onChange={handleProfilePicUpload} />
          <h3>Chat Room</h3>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.username}</strong> ({msg.timestamp}): {msg.message}
              </p>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
