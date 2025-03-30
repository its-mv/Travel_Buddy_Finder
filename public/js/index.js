document.addEventListener("DOMContentLoaded", function () {
    let allReviews = []; // Store all fetched reviews
    let showingAllReviews = false; // Toggle flag
  
    function renderReviews(data, limit = 3) {
        const container = document.getElementById("testimonial-container");
        container.innerHTML = "";
  
        const displayData = showingAllReviews ? data.slice(0, 50) : data.slice(0, limit);
        displayData.forEach(feedback => {
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
  
        const viewMoreButton = document.querySelector(".view-more-reviews");
        if (data.length > limit) {
            viewMoreButton.style.display = "block";
            viewMoreButton.textContent = showingAllReviews ? "Show Less" : "View More Reviews";
        } else {
            viewMoreButton.style.display = "none";
        }
    }
  
    fetch("http://localhost:5000/api/feedback")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Reviews:", data);
            allReviews = data; // Store full data
            renderReviews(allReviews); // Show initial 6 reviews
        })
        .catch(error => console.error("Error fetching testimonials:", error));
  
    document.querySelector(".view-more-reviews").addEventListener("click", function (event) {
        event.preventDefault();
        showingAllReviews = !showingAllReviews; // Toggle state
        renderReviews(allReviews);
    });
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
