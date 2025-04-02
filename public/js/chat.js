// chat.js (frontend)
const socket = io("http://localhost:5000");
const userId = localStorage.getItem("uid"); 

socket.emit("register", userId);

fetch(`http://localhost:5000/api/chat/connections/${userId}`)
    .then(res => res.json())
    .then(data => {
        const connectionsDiv = document.getElementById("connections");
        data.forEach(user => {
            const div = document.createElement("div");
            div.innerText = `${user.fname} ${user.lname}`;
            div.onclick = () => startChat(user.uid, user.fname, user.lname);
            connectionsDiv.appendChild(div);
        });
    });

let currentReceiverId = null;

function startChat(receiverId, receiverFName, receiverLName) {
    currentReceiverId = receiverId;
    document.getElementById("chat-header").innerText = `${receiverFName} ${receiverLName}`;   

    fetch(`http://localhost:5000/api/chat/messages/${userId}/${receiverId}`)
        .then(res => res.json())
        .then(messages => {
            const messagesDiv = document.getElementById("messages");
            messagesDiv.innerHTML = "";

            messages.forEach(msg => {
                displayMessage(msg);
            });
        });
}

// Function to display message in chat
function displayMessage(message) {
    const messagesDiv = document.getElementById("messages");
    const div = document.createElement("div");

    div.className = message.sid == userId ? "message sent" : "message received";
    div.innerText = message.message;

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


window.sendMessage = function () {
    const messageInput = document.getElementById("messageInput");
    if (!messageInput || !currentReceiverId) return;
    const message = messageInput.value.trim();
    if (!message.trim()) return;
    
    const messageData = { sid: userId, rid: currentReceiverId, message };

    displayMessage(messageData);

    messageInput.value = "";

    socket.emit("sendMessage", messageData);

    fetch("http://localhost:5000/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: userId, rid: currentReceiverId, message })
    });
};

socket.on("receiveMessage", (message) => {
    console.log("📥 Received Message Event Triggered:", message);
    displayMessage(message);
});
