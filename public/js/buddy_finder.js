document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored

    if (!isLoggedIn) {
        window.location.href = "../html/index.html"; // Redirect if not logged in
    }
});

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDate2(isoString) {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return `${formattedTime}, ${formattedDate}`;
}

function showErrorMessage(message) {
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    errorText.textContent = message;
    errorMessage.style.display = "flex"; // Show the message
}

function closeErrorMessage() {
    document.getElementById("errorMessage").style.display = "none";
}

async function sendConnectionRequest(trip) {
    try {
        const token = localStorage.getItem("token");
        const sender_id = localStorage.getItem("uid"); 
        const receiver_id = trip.uid;
        const tid = trip.tid;
            
        console.log("Debug: tid before sending request:", tid);
        
        if (!receiver_id) {
            throw new Error("Receiver ID is missing!");
        }

        if (sender_id == receiver_id) {
            alert("You can't send a connection request to yourself.");
            return;
        }

        console.log("Sending connection request for trip ID:", tid);

        const response = await fetch("http://localhost:5000/connections/send-request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ sender_id, receiver_id, tid })
        });

        const data = await response.json();

        if (!response.ok) {
            showErrorMessage(data.error || "Failed to send request");
            return;
        }

        alert(`Connection request sent to ${trip.trip_name}!`);
    } catch (error) {
        console.error("Error sending connection request:", error);
    }
}


function showTripDetails(trip) {
    const modal = document.getElementById("tripDetailsModal");
    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = `
        <h2>${trip.name}, ${trip.age}</h2>
        <p><strong>Trip Name:</strong> ${trip.trip_name}</p>
        <p><strong>From:</strong> ${trip.location}</p>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Travel Dates:</strong> ${formatDate(trip.date)} - ${formatDate(trip.return_date)}</p>
        <p><strong>Duration:</strong> ${trip.duration} days</p>
        <p><strong>Budget:</strong> ${trip.budget}</p>
        <p><strong>Mode of Transport:</strong> ${trip.mode}</p>
        <p><strong>Pace:</strong> ${trip.pace}</p>
        <p><strong>Accomodation:</strong> ${trip.accomodation}</p>
        <p><strong>Description:</strong> ${trip.description}</p>
        <p><strong>Interests:</strong> ${trip.interests.join(", ")}</p>
        <p><strong>Activities:</strong> ${trip.activities.join(", ")}</p>
        <p><strong>Time Posted:</strong> ${formatDate2(trip.time)}</p>
    `;

    modal.style.display = "block";
}

function closeModal() {
    document.getElementById("tripDetailsModal").style.display = "none";
    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = "";
}


async function fetchTrips() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/trips/trips", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const trips = await response.json();
        console.log("Received Data:", trips);

        if (!Array.isArray(trips)) {
            throw new Error("Invalid data format received");
        }

        const travelersList = document.getElementById("travelersList");
        travelersList.innerHTML = ""; // Clear previous data

        trips.forEach(trip => {
            const card = document.createElement("div");
            card.classList.add("traveler-card");

            // 🆕 Interests Container
            const interestsDiv = document.createElement("div");
            interestsDiv.classList.add("interests-container");

            if (trip.interests.length > 0) {
                trip.interests.forEach(interest => {
                    const interestTag = document.createElement("span");
                    interestTag.classList.add("interest-tag");
                    interestTag.textContent = interest;
                    interestsDiv.appendChild(interestTag);
                });
            } else {
                interestsDiv.innerHTML = `<span class="no-interests">No interests added</span>`;
            }

            // 🆕 View More Button
            const viewMoreButton = document.createElement("button");
            viewMoreButton.classList.add("view-more-btn");
            viewMoreButton.textContent = "View More";
            viewMoreButton.addEventListener("click", () => showTripDetails(trip));

            // 🆕 Connect Button
            const connectButton = document.createElement("button");
            connectButton.classList.add("connect-btn");
            connectButton.textContent = "Connect";
            connectButton.addEventListener("click", () => sendConnectionRequest(trip));

            // 🏗️ Add content to the card
            card.innerHTML = `
                <h3>${trip.name}, ${trip.age}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${trip.location}</p>
                <p><i class="fas fa-plane"></i> Traveling to <strong>${trip.destination}</strong></p>
                <p><i class="fas fa-calendar-alt"></i> ${formatDate(trip.date)}</p>
                <p><i class="fas fa-dollar-sign"></i> ${trip.budget}</p>
                <p>${trip.description}</p>
            `;

            card.appendChild(interestsDiv); // 🆕 Append interests
            card.appendChild(viewMoreButton);
            card.appendChild(connectButton); // 🆕 Append Connect button
            travelersList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

fetchTrips();
