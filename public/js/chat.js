const socket = io("http://localhost:5000");
const userId = localStorage.getItem("uid");

socket.emit("register", userId);

// Fetch user connections
fetch(`http://localhost:5000/api/chat/connections/${userId}`)
    .then(res => res.json())
    .then(data => {
        const connectionsDiv = document.getElementById("connections");
        connectionsDiv.innerHTML = ""; // Clear previous content

        // Create search bar
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.id = "searchUser";
        searchInput.placeholder = "Search User...                                      🔎";
        searchInput.onkeyup = filterUsers;
        connectionsDiv.appendChild(searchInput);

        // Create list container
        const userList = document.createElement("div");
        userList.id = "userList";
        connectionsDiv.appendChild(userList);

        // Display users
        data.forEach(user => {
            const div = document.createElement("div");
            div.className = "user-item";
            div.dataset.name = `${user.fname.toLowerCase()} ${user.lname.toLowerCase()}`;
            div.innerText = `${user.fname} ${user.lname}`;
            div.onclick = () => startChat(user.uid, user.fname, user.lname);
            userList.appendChild(div);
        });
    });

// Filter function for search
function filterUsers() {
    let input = document.getElementById("searchUser").value.toLowerCase();
    let users = document.querySelectorAll(".user-item");

    users.forEach(user => {
        user.style.display = user.dataset.name.includes(input) ? "" : "none";
    });
}


let currentReceiverId = null;

function startChat(receiverId, receiverFName, receiverLName) {
    currentReceiverId = receiverId;
    document.getElementById("chat-header").innerText = `${receiverFName} ${receiverLName}`;
    document.getElementById("chat-box").style.display = "block";

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

// Function to display messages
function displayMessage(message) {
    const messagesDiv = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = message.sid == userId ? "message sent" : "message received";
    div.innerText = message.message;
    div.dataset.id = message.id;

    // Show status only for sender
    if (message.sid == userId) {
        const status = document.createElement("span");
        status.className = "msg-status";
        // status.innerText = message.status || "sent";
        // Set icon based on message status
        switch (message.status) {
            case "sent":
                status.innerHTML = "&#10003;"; // ✓
                break;
            case "delivered":
                status.innerHTML = "&#10003;&#10003;"; // ✓✓
                break;
            case "read":
                status.innerHTML = `<span class="blue-checks">&#10003;&#10003;</span>`; // ✓✓ in blue
                break;
        }
        div.appendChild(status);
    }

    if (message.sid == userId) {
        div.oncontextmenu = (e) => showOptions(e, message.id, message.message);
        div.ontouchstart = (e) => handleLongPress(e, message.id, message.message);
    } else {
        // Update status to 'delivered'
        fetch("http://localhost:5000/api/chat/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId: message.id, status: "delivered" }),
        }).then(() => {
            socket.emit("messageDelivered", { messageId: message.id, receiverId: userId });
        });

        // Set timeout for "read"
        setTimeout(() => {
            fetch("http://localhost:5000/api/chat/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: message.id, status: "read" }),
            }).then(() => {
                socket.emit("messageRead", { messageId: message.id, receiverId: userId });
            });
        }, 100);
    }

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


// Function to show options for edit/delete
function showOptions(e, messageId, messageText) {
    e.preventDefault();
    if(messageText == "Deleted Message") return;

    // Remove any existing options
    const existingOptions = document.querySelector(".message-options");
    if (existingOptions) existingOptions.remove();

    // Create options div
    const options = document.createElement("div");
    options.className = "message-options";
    options.innerHTML = `
        <div class="menu-btn">
        <button onclick="editMessage(${messageId}, '${messageText}')">Edit</button>
        <button onclick="deleteMessage(${messageId})">Delete</button>
        </div>
    `;

    // Append options to the body
    document.body.appendChild(options);

    // Position the options menu above the clicked message
    const rect = e.target.getBoundingClientRect();
    options.style.top = `${rect.top - options.offsetHeight - 5}px`;
    options.style.left = `${rect.left}px`;
    options.style.display = "block"; // Show options

    // Remove options when clicking outside
    document.addEventListener("click", (event) => {
        if (!options.contains(event.target)) {
            options.remove();
        }
    }, { once: true });
}


// Handle long-press for mobile
let pressTimer;
function handleLongPress(e, messageId, messageText) {
    pressTimer = setTimeout(() => showOptions(e, messageId, messageText), 500);
    e.target.ontouchend = () => clearTimeout(pressTimer);
}

// Edit message inline
function editMessage(messageId, oldText) {
    const messageDiv = document.querySelector(`[data-id='${messageId}']`);
    if (!messageDiv) return;

    const input = document.createElement("input");
    input.value = oldText;
    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            updateMessage(messageId, input.value);
        }
    };

    messageDiv.innerHTML = "";
    messageDiv.appendChild(input);
    input.focus();
}

// Update message
function updateMessage(messageId, newText) {
    fetch("http://localhost:5000/api/chat/edit-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, newText }),
    }).then(() => {
        socket.emit("editMessage", { messageId, newText });
    });
}

// Delete message
function deleteMessage(messageId) {
    fetch(`http://localhost:5000/api/chat/delete-message/${messageId}`, {
        method: "DELETE",
    }).then(() => {
        socket.emit("deleteMessage", { messageId });
        document.querySelector(".message-options")?.remove();
    });
}

// Real-time updates
// socket.on("receiveMessage", displayMessage);
socket.on("receiveMessage", (message) => {
    console.log("New message received:", message, "Current chat with:", currentReceiverId);
    // Only display the message if it's from the user currently selected in the chat
    if (
        (message.sid == currentReceiverId && message.rid == userId) ||
        (message.sid == userId && message.rid == currentReceiverId)
    ) {
        displayMessage(message, true);
    }else {
        // Optionally show unread badge elsewhere
        console.log("Message for a different chat. Ignored in current view.");
    }

    // Optionally: show notification badge elsewhere if message is from someone else
});
socket.on("messageEdited", ({ messageId, newText }) => {
    const msgDiv = document.querySelector(`[data-id='${messageId}']`);
    if (msgDiv) msgDiv.innerText = newText;
});
socket.on("messageDeleted", ({ messageId }) => {
    const msgDiv = document.querySelector(`[data-id='${messageId}']`);
    // if (msgDiv) msgDiv.remove();
    if (msgDiv) msgDiv.innerText = "Deleted Message";
});
socket.on("messageDelivered", ({ messageId }) => {
    const msgDiv = document.querySelector(`[data-id='${messageId}']`);
    if (msgDiv) {
        const status = msgDiv.querySelector(".msg-status");
        if (status && status.innerText === "sent") {
            status.innerHTML = "&#10003;&#10003;"; // ✓✓
        }
    }
});

socket.on("messageRead", ({ messageId }) => {
    const msgDiv = document.querySelector(`[data-id='${messageId}']`);
    if (msgDiv) {
        const status = msgDiv.querySelector(".msg-status");
        if (status) {
            status.innerHTML = `<span class="blue-checks">&#10003;&#10003;</span>`;
        }
    }
});

window.sendMessage = function () {
    const messageInput = document.getElementById("messageInput");
    if (!messageInput || !currentReceiverId) return;
    const message = messageInput.value.trim();
    if (!message) return;

    const messageData = { sid: userId, rid: currentReceiverId, message };
    messageInput.value = "";

    fetch("http://localhost:5000/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            messageData.id = data.messageId;
            messageData.status = "sent";
            displayMessage(messageData);
            socket.emit("sendMessage", messageData);
        }
    });
};
