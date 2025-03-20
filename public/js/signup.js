document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll(".next");
    const prevBtns = document.querySelectorAll(".prev");

    let currentStep = 0;

    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle("active", index === step);
        });
    }

    nextBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Initialize the first step visibility
    showStep(currentStep);
});


 // Lottie animations
 lottie.loadAnimation({
    container: document.getElementById('google-logo'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../assets/google.json' 
});
lottie.loadAnimation({
    container: document.getElementById('instagram-logo'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../assets/instagram.json' 
});
lottie.loadAnimation({
    container: document.getElementById('facebook-logo'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../assets/facebook.json' 
});

document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    let fname = document.getElementById("fname").value;
    let lname = document.getElementById("lname").value;
    let phone = document.getElementById("phone").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let dob = document.getElementById("dob").value;
    // let image = document.getElementById("image").files[0];
    let name = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fname, lname, phone, email, password, dob, name }),
    });

    const data = await response.json();
    if (data.redirect) {
        window.location.href = "/public/html/login.html"; // Redirect to login page
    } else {
        alert(data.error);
    }
});


document.getElementById("togglePassword").addEventListener("click", function () {
    togglePasswordVisibility("password", "togglePassword");
});
document.getElementById("toggleConfirmPassword").addEventListener("click", function () {
    togglePasswordVisibility("confirm-password", "toggleConfirmPassword");
});

function togglePasswordVisibility(inputId, iconId) {
    let passwordField = document.getElementById(inputId);
    let eyeIcon = document.getElementById(iconId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}

document.getElementById("confirm-password").addEventListener("input", function () {
    let password = document.getElementById("password").value;
    let confirmPassword = this.value;
    let message = document.getElementById("password-match-message");
    let nextButton = document.getElementById("next-btn");
    if (confirmPassword === password && confirmPassword !== "") {
        message.textContent = "✅ Passwords match!";
        message.style.color = "green";
        nextButton.disabled = false;
    } else {
        message.textContent = "❌ Passwords do not match!";
        message.style.color = "red";
        nextButton.disabled = true;
    }
});
