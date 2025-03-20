async function fetchPendingRequests() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/connections/pending", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const requests = await response.json();
        console.log("Pending Requests:", requests);

        const pendingList = document.getElementById("pendingList");
        pendingList.innerHTML = ""; // Clear previous data

        if (requests.length === 0) {
            pendingList.innerHTML = "<p>No pending requests</p>";
            return;
        }

        requests.forEach(request => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <p>${request.fname} ${request.lname} sent a connection request.</p>
                <button class="accept-btn" onclick="handleRequest(${request.id}, 'accepted')">Accept</button>
                <button class="reject-btn" onclick="handleRequest(${request.id}, 'rejected')">Reject</button>
            `;
            pendingList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
    }
}

async function handleRequest(requestId, action) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:5000/connections/respond`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ requestId, action })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        alert(`Request ${action}!`);
        fetchPendingRequests(); // Refresh the list
    } catch (error) {
        console.error("Error updating request:", error);
    }
}

fetchPendingRequests();
