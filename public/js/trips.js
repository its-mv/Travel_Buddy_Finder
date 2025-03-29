const userId = localStorage.getItem("uid"); 
const authToken = localStorage.getItem("token");

async function fetchTrips() {
    try {
        const response = await fetch(`http://localhost:5000/trips/user-trips/${userId}`, {
            headers: { Authorization: `Bearer ${authToken}` } // Include token
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const trips = await response.json();
        console.log("Fetched Trips:", trips);

        if (!Array.isArray(trips)) {
            console.error("Invalid response format:", trips);
            return;
        }

        // Get trip sections
        const upcomingContainer = document.getElementById("upcomingTrips");
        const ongoingContainer = document.getElementById("ongoingTrips");
        const completedContainer = document.getElementById("completedTrips");

        // Clear previous data
        upcomingContainer.innerHTML = "";
        ongoingContainer.innerHTML = "";
        completedContainer.innerHTML = "";

        let hasUpcoming = false, hasOngoing = false, hasCompleted = false;

        trips.forEach((trip) => {
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
                <button class="view-btn">View More</button>
                ${trip.trip_category === "upcoming" || trip.trip_category === "ongoing" ? 
                    `<button class="cancel-btn" onclick="cancelTrip(${trip.tid})">Cancel Trip</button>` 
                    : ""}
                ${trip.trip_category === "ongoing" || trip.trip_category === "completed/cancelled" ? 
                    `<button class="partner-btn" onclick="openPartnerModal(${trip.tid})">Add Partners</button>` 
                    : ""}
            `;

            // Append trip to the correct section
            if (trip.trip_category === "upcoming") {
                upcomingContainer.appendChild(tripCard);
                hasCompleted = true;
            } else if (trip.trip_category === "ongoing") {
                ongoingContainer.appendChild(tripCard);
                hasOngoing = true;
            } else {
                completedContainer.appendChild(tripCard);
                hasCompleted = true;
            }
            const viewMoreBtn = tripCard.querySelector(".view-btn");
            const detailsDiv = tripCard.querySelector(".trip-details");
    
            viewMoreBtn.addEventListener("click", () => {
               detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
               viewMoreBtn.textContent = detailsDiv.style.display === "none" ? "View More" : "View Less";
            });
        });

         // Show "No trips available" message if necessary
         if (!hasUpcoming) upcomingContainer.innerHTML = "<p>No upcoming trips.</p>";
         if (!hasOngoing) ongoingContainer.innerHTML = "<p>No ongoing trips.</p>";
         if (!hasCompleted) completedContainer.innerHTML = "<p>No completed or cancelled trips.</p>"; 


    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

async function cancelTrip(tid) {
    const response = await fetch(`http://localhost:5000/trips/cancel-trip/${tid}`, { 
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` } 
    });

    const result = await response.json();
    alert(result.message);
    fetchTrips();
}

// Open modal to add travel partners
function openPartnerModal(tid) {
    document.getElementById("partnerModal").style.display = "block";
    document.getElementById("confirmAddButton").onclick = () => askTravelPartners(tid);
}

// Close modal
function closePartnerModal() {
    document.getElementById("partnerModal").style.display = "none";
}

// Add travel partners
// async function askTravelPartners(tid) {
//     // const emails = prompt("Enter partner emails (comma-separated):").split(",");
//     const emails = document.getElementById("partnerEmails").value.split(",").map(email => email.trim());;
    
//     if (!emails || !Array.isArray(emails) || emails.length === 0) {
//         console.error("Invalid emails array:", emails);
//         alert("Please enter at least one email.");
//         return;
//     }
    
//     console.log("Sending request with:", { tid, emails });

//     try {
//         let response = await fetch("http://localhost:5000/trips/add-travel-partners", {
//             method: "POST",
//             headers: { "Content-Type": "application/json",
//             Authorization: `Bearer ${authToken}`  },
//             body: JSON.stringify({ tid, emails })
//         });

//         let result = await response.json();
//         console.log("API Response:", result);

//         if (!response.ok) {
//             alert(`Error: ${result.error || "Unknown error"}`);
//             return;
//         }

//         if (result.message.includes("User already added")) {
//             if (confirm(result.message + " Do you want to add again?")) {
//                 await askTravelPartners(tid); // Retry adding
//             }
//         } else {
//             alert(result.message);
//         }
//         closePartnerModal();
//     } catch (error) {
//         console.error("Fetch error:", error);
//         alert("Something went wrong. Check console logs.");
//     }
// }
// async function askTravelPartners(tid) {
//     try {
//         // Fetch existing partners for this trip
//         let existingPartnersResponse = await fetch(`http://localhost:5000/trips/get-travel-partners/${tid}`, {
//             headers: { Authorization: `Bearer ${authToken}` }
//         });

//         let existingPartnersData = await existingPartnersResponse.json();
//         let existingPartners = existingPartnersData.partners || [];

//         // If there are already added partners, ask for confirmation
//         if (existingPartners.length > 0) {
//             let confirmReplace = confirm(
//                 `You have already added partners: ${existingPartners.join(", ")}.\nDo you want to replace them?`
//             );

//             if (!confirmReplace) return; // Stop if user cancels
//         }

//         // Show the input box for new emails
//         // let emails = prompt("Enter new partner emails (comma-separated):");
//         const emails = document.getElementById("partnerEmails").value.split(",").map(email => email.trim()).filter(email => email !== "");

//         if (!emails) return;

//         let emailList = emails.split(",").map(email => email.trim()).filter(email => email !== "");
//         if (emailList.length === 0) {
//             alert("Please enter at least one email.");
//             return;
//         }

//         console.log("Sending request with:", { tid, emails: emailList });

//         // Send updated partner list
//         let response = await fetch("http://localhost:5000/trips/add-travel-partners", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${authToken}`
//             },
//             body: JSON.stringify({ tid, emails: emailList })
//         });

//         let result = await response.json();
//         alert(result.message);
//         closePartnerModal(); 
//     } catch (error) {
//         console.error("Fetch error:", error);
//         alert("Something went wrong. Check console logs.");
//     }
// }
async function askTravelPartners(tid) {
    try {
        // Fetch existing partners for this trip
        let existingPartnersResponse = await fetch(`http://localhost:5000/trips/get-travel-partners/${tid}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        let existingPartnersData = await existingPartnersResponse.json();
        let existingPartners = existingPartnersData.partners || [];

        // Ensure existingPartners is an array
        if (!Array.isArray(existingPartners)) {
            console.error("Invalid existing partners format:", existingPartners);
            existingPartners = [];
        }

        // If partners exist, ask for confirmation
        if (existingPartners.length > 0) {
            let confirmReplace = confirm(
                `You have already added partners: ${existingPartners.join(", ")}.\nDo you want to replace them?`
            );

            if (!confirmReplace) return;
        }

        // Get new emails from input field
        const emails = document.getElementById("partnerEmails").value
            .split(",") // Convert from string to array
            .map(email => email.trim()) // Remove spaces
            .filter(email => email !== ""); // Remove empty values

        if (emails.length === 0) {
            alert("Please enter at least one email.");
            return;
        }

        console.log("Sending request with:", { tid, emails });

        // Send request to add travel partners
        let response = await fetch("http://localhost:5000/trips/add-travel-partners", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ tid, emails })
        });

        let result = await response.json();
        alert(result.message);
        closePartnerModal();

    } catch (error) {
        console.error("Fetch error:", error);
        alert("Something went wrong. Check console logs.");
    }
}




fetchTrips();
