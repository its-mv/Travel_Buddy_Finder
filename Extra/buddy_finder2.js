function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

async function fetchTrips() {
    try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        const response = await fetch("http://localhost:5000/trips/trips", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Include token
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
        travelersList.innerHTML = "";  // Clear previous data

        trips.forEach(trip => {
            const card = document.createElement("div");
            card.classList.add("traveler-card");
        
            // Create a container for interests
            const interestsContainer = document.createElement("div");
            interestsContainer.classList.add("interests-container");
        
            // Loop through interests and create badge elements
            trip.interests.forEach(interest => {
                const interestBadge = document.createElement("span");
                interestBadge.classList.add("interest-badge");
                interestBadge.textContent = interest;
                interestsContainer.appendChild(interestBadge);
            });
        
            card.innerHTML = `
                <h3>${trip.name}, ${trip.age}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${trip.location}</p>
                <p><i class="fas fa-plane"></i> Traveling to <strong>${trip.destination}</strong></p>
                <p><i class="fas fa-calendar-alt"></i> ${formatDate(trip.date)}</p>
                <p><i class="fas fa-dollar-sign"></i> ${(trip.budget)}</p>
                <p>${(trip.description)}</p>
            `;
        
            card.appendChild(interestsContainer); // Append interests after description
            travelersList.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

fetchTrips();
