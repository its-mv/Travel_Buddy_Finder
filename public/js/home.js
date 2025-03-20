document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored

  if (!isLoggedIn) {
      window.location.href = "../html/index.html"; // Redirect if not logged in
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("show");
  });
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
  if (window.scrollY > 50) { // When user scrolls down 50px
      header.classList.add("scrolled");
  } else {
      header.classList.remove("scrolled");
  }
});