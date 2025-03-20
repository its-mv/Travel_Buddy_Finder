document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored
  
    if (!isLoggedIn) {
        window.location.href = "../html/index.html"; // Redirect if not logged in
    }
  });

document.addEventListener("DOMContentLoaded", fetchRequests);

async function fetchRequests() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/connections/requests", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error fetching requests");

        const requests = await response.json();
        const requestsList = document.getElementById("requestsList");
        requestsList.innerHTML = "";

        if (requests.length === 0) {
            requestsList.innerHTML = "<p>No pending requests</p>";
            return;
        }

        requests.forEach(req => {
            const card = document.createElement("div");
            card.classList.add("request-card");

            card.innerHTML = `
                <p><strong>${req.fname} ${req.lname}</strong> wants to connect with you.</p>
                <button class="accept-btn" onclick="handleRequest(${req.id}, 'accepted')">Accept</button>
                <button class="decline-btn" onclick="handleRequest(${req.id}, 'declined')">Decline</button>
            `;

            requestsList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
    }
}

async function handleRequest(requestId, status) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized access. Please log in.");
            return;
        }

        const response = await fetch(`http://localhost:5000/connections/update-request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ requestId, status })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error updating request");
        }

        alert(`Request ${status} successfully!`);
        fetchRequests(); // Refresh the request list after update
    } catch (error) {
        console.error("Error updating request:", error);
        alert("Failed to update request. Please try again.");
    }
}
