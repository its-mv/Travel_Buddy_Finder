document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored

  if (!isLoggedIn) {
      window.location.href = "../html/index.html"; // Redirect if not logged in
  }
});

document.querySelector(".menu-toggle").addEventListener("click", function() {
  document.querySelector(".navbar-nav").classList.toggle("show-nav");
});
  
document.addEventListener("DOMContentLoaded", () => {
  const firstName = localStorage.getItem("fname");
  const lastName = localStorage.getItem("lname");

  if (firstName && lastName) {
    document.getElementById("welcomeMessage").innerText = `Welcome, ${firstName} ${lastName}!`;
  } else {
    document.getElementById("welcomeMessage").innerText = "Welcome, Guest!";
  }
});

window.addEventListener("scroll", function () {
  let header = document.querySelector("header");
  if (window.scrollY > 50) {
      header.classList.add("scrolled");
  } else {
      header.classList.remove("scrolled");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a.logout");
  const confirmationBox = document.createElement("div");

  confirmationBox.innerHTML = `
      <div class="confirm-box">
          <p>Are you sure you want to proceed?</p>
          <button id="confirm-yes">Yes</button>
          <button id="confirm-no">No</button>
      </div>
  `;
  confirmationBox.classList.add("hidden");
  document.body.appendChild(confirmationBox);

  let linkToFollow = null;

  links.forEach(link => {
      link.addEventListener("click", function (event) {
          event.preventDefault();
          linkToFollow = this.href;
          confirmationBox.classList.remove("hidden");
      });
  });

  document.getElementById("confirm-yes").addEventListener("click", function () {
      if (linkToFollow) {
          window.location.href = linkToFollow;
      }
  });

  document.getElementById("confirm-no").addEventListener("click", function () {
      confirmationBox.classList.add("hidden");
  });
});

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
