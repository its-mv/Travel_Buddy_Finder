document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:5000/api/feedback")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Data:", data); // Debugging line

            if (!Array.isArray(data)) {
                throw new Error("Invalid response format");
            }

            const container = document.getElementById("testimonial-container");
            container.innerHTML = "";
            data.forEach(feedback => {
                const card = document.createElement("div");
                card.classList.add("testimonial-card");
                card.innerHTML = `
                    <p>"${feedback.description}"</p>
                    <h4>${feedback.name}</h4>
                    <span>${feedback.city},</span>
                    <span>${feedback.country}</span>
                    `;
                container.appendChild(card);
            });
        })
        .catch(error => console.error("Error fetching testimonials:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    let allDestinations = []; // Store all fetched destinations
    let showingAll = false; // Toggle flag

    function renderDestinations(data, limit = 3) {
        const container = document.getElementById("popular-destinations");
        container.innerHTML = "";

        const displayData = showingAll ? data.slice(0, 50) : data.slice(0, limit);
        displayData.forEach(dest => {
            const card = document.createElement("div");
            card.classList.add("destination-card");
            card.innerHTML = `<p>${dest.city}, ${dest.country} - ${dest.travelers} travelers</p>`;
            container.appendChild(card);
        });

        const viewAllLink = document.querySelector(".view-all");
        if (data.length > limit) {
            viewAllLink.style.display = "block";
            viewAllLink.textContent = showingAll ? "Show Less" : "View All Destinations";
        } else {
            viewAllLink.style.display = "none";
        }
    }

    fetch("http://localhost:5000/api/popular-destinations")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Destinations:", data);
            allDestinations = data; // Store full data
            renderDestinations(allDestinations); // Show initial 3 cities
        })
        .catch(error => console.error("Error fetching destinations:", error));

    document.querySelector(".view-all").addEventListener("click", function (event) {
        event.preventDefault();
        showingAll = !showingAll; // Toggle state
        renderDestinations(allDestinations);
    });
});
