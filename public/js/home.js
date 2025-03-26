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
