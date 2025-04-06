document.addEventListener("DOMContentLoaded", async () => {
    const firstName = localStorage.getItem("fname");
    const lastName = localStorage.getItem("lname");
    const uid = localStorage.getItem("uid");

    if (!uid) {
        console.error("User ID is missing in localStorage!");
        return;
    }
    if (firstName && lastName) {
        document.getElementById("Name").innerText = `${firstName} ${lastName}`;
    }

    if (uid) {
        try {
            const response = await fetch(`http://localhost:5000/auth/user/${uid}`);
            
            if (!response.ok) throw new Error("Failed to fetch user info");
            const data = await response.json();
            
            if (response.ok) {
                const gender = data.gender;
                if (gender == "Male") {
                    document.getElementById("Gender").innerText = `Him/His`;
                }
                else if (gender == "Female") {
                    document.getElementById("Gender").innerText = `She/Her`;
                }
                else {
                    document.getElementById("Gender").innerText = `They/Them`;
                }
                if (data.home_city && data.country) {
                    document.getElementById("Location").innerText = `${data.home_city}, ${data.country}`;
                }
                else {
                    document.getElementById("Location").innerText = 'Location Not Set';
                    document.getElementById("Location").style.backgroundColor = "red";
                }
            } else {
                console.error("User info not found");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }

        // Fetch User Travel Styles
        try {
            const response = await fetch(`http://localhost:5000/auth/user/${uid}/travel-styles`);

            if (!response.ok) {
                document.getElementById("TravelStyles").textContent = "No Styles Set";
                document.getElementById("TravelStyles").style.backgroundColor = "red";
                return;
            }

            const styles = await response.json();
            const stylesContainer = document.getElementById("TravelStyles");
            
            stylesContainer.innerHTML = ""; // Clear previous styles
            
            if (styles.length === 0) {  
                stylesContainer.textContent = "No Styles Set";  
                stylesContainer.style.backgroundColor = "red";  
                return;
            }

            styles.forEach(style => {
                const styleTag = document.createElement("span");
                styleTag.innerText = style;
                styleTag.classList.add("style-tag"); // Add class for styling
                stylesContainer.appendChild(styleTag);
            });

        } catch (error) {
            console.error("Error fetching travel styles:", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../html/index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/profile/profile-completion", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.completionPercentage === 100) {
            document.getElementById("profileCompletion").style.display = "none";
            return;
        }

        document.getElementById("completionPercentage").textContent = `${data.completionPercentage}% Complete`;
        document.getElementById("completionProgress").style.width = `${data.completionPercentage}%`;

        const missingItemsList = document.getElementById("missingItems");
        missingItemsList.innerHTML = "";
        data.missingFields.forEach(field => {
            let listItem = document.createElement("li");
            listItem.textContent = field;
            missingItemsList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching profile completion:", error);
    }
});

// async function fetchUserTrips() {
//     const uid = localStorage.getItem("uid");

//     if (!uid) {
//         console.error("User ID is missing in localStorage!");
//         return;
//     }

//     try {
//         const response = await fetch(`http://localhost:5000/auth/user-trips/${uid}`, {
//             headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
//         });

//         if (!response.ok) throw new Error("Failed to fetch trips");
        
//         const trips = await response.json();
//         const tripContainer = document.getElementById("userTrips");

//         if (trips.length === 0) {
//             tripContainer.innerHTML = "<p>No trips found.</p>";
//             return;
//         }

//         tripContainer.innerHTML = ""; // Clear previous content
//         trips.forEach(trip => {
//             const tripCard = document.createElement("div");
//             tripCard.classList.add("trip-card");
//             tripCard.innerHTML = `
//                 <h3>${trip.tname}</h3>
//                 <p><strong>From:</strong> ${trip.from_city}, ${trip.from_country}</p>
//                 <p><strong>To:</strong> ${trip.to_city}, ${trip.to_country}</p>
//                 <p><strong>Date:</strong> ${trip.date} - ${trip.rdate}</p>
//                 <p><strong>Budget:</strong> ${trip.budget}</p>
//                 <p><strong>Mode:</strong> ${trip.mode}, ${trip.pace}</p>
//                 <p><strong>Accommodation:</strong> ${trip.accomodation}</p>
//                 <p><strong>Activities:</strong> ${trip.activities || "No activities"}</p>
//             `;
//             tripContainer.appendChild(tripCard);
//         });

//     } catch (error) {
//         console.error("Error fetching user trips:", error);
//     }
// }

// // Call the function when the dashboard loads
// document.addEventListener("DOMContentLoaded", fetchUserTrips);

async function fetchUserTrips() {
    const uid = localStorage.getItem("uid");

    if (!uid) {
        console.error("User ID is missing in localStorage!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/auth/user-trips/${uid}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to fetch trips");

        const trips = await response.json();
        const tripContainer = document.getElementById("userTrips");

        if (trips.length === 0) {
            tripContainer.innerHTML = "<p>No trips found.</p>";
            return;
        }

        tripContainer.innerHTML = ""; // Clear previous content
        trips.forEach(trip => {
            const tripCard = document.createElement("div");
            tripCard.classList.add("trip-card");
            
            tripCard.innerHTML = `
                <h3>${trip.tname}</h3>
                <p><strong>From:</strong> ${trip.from_city}, ${trip.from_country}</p>
                <p><strong>To:</strong> ${trip.to_city}, ${trip.to_country}</p>
                <p><strong>Date:</strong> ${new Date(trip.date).toDateString()} - ${new Date(trip.rdate).toDateString()}</p>
                
                <div class="trip-details">
                    <p><strong>Budget:</strong> ${trip.budget}</p>
                    <p><strong>Mode:</strong> ${trip.mode}, ${trip.pace}</p>
                    <p><strong>Accommodation:</strong> ${trip.accomodation}</p>
                    <p><strong>Activities:</strong> ${trip.activities || "No activities"}</p>
                </div>
                
                <div class="trip-buttons">
                    <button class="view-more">View More</button>
                    <button class="cancel-trip">Cancel Trip</button>
                </div>
            `;

            // Add event listeners for buttons
            const viewMoreBtn = tripCard.querySelector(".view-more");
            const cancelBtn = tripCard.querySelector(".cancel-trip");
            const detailsDiv = tripCard.querySelector(".trip-details");

            viewMoreBtn.addEventListener("click", () => {
                detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
                viewMoreBtn.textContent = detailsDiv.style.display === "none" ? "View More" : "View Less";
            });

            cancelBtn.addEventListener("click", () => showCancelConfirmation(trip.tid, tripCard));

            tripContainer.appendChild(tripCard);
        });

    } catch (error) {
        console.error("Error fetching user trips:", error);
    }
}

// Confirmation popup before canceling a trip
function showCancelConfirmation(tripId, tripCard) {
    const confirmBox = document.createElement("div");
    confirmBox.classList.add("confirm-box");
    confirmBox.innerHTML = `
        <p>Are you sure you want to cancel this trip?</p>
        <button class="confirm-yes">Yes</button>
        <button class="confirm-no">No</button>
    `;

    document.body.appendChild(confirmBox);

    // Handle confirmation
    confirmBox.querySelector(".confirm-yes").addEventListener("click", async () => {
        await cancelTrip(tripId, tripCard);
        document.body.removeChild(confirmBox);
    });

    confirmBox.querySelector(".confirm-no").addEventListener("click", () => {
        document.body.removeChild(confirmBox);
    });
}

// Function to cancel the trip
async function cancelTrip(tripId, tripCard) {
    try {
        const response = await fetch(`http://localhost:5000/auth/cancel/${tripId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to cancel trip");

        // Remove trip from UI
        tripCard.remove();
        console.log("Trip canceled successfully");
    } catch (error) {
        console.error("Error canceling trip:", error);
    }
}

// Call function when dashboard loads
document.addEventListener("DOMContentLoaded", fetchUserTrips);

