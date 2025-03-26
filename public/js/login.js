document.getElementById("login").addEventListener("submit", async (event) => {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password are required");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed!");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("fname", data.fname); 
        localStorage.setItem("lname", data.lname);
        localStorage.setItem("uid", data.uid);

        console.log("Token Stored:", localStorage.getItem("token"));
        console.log("Name Stored:", localStorage.getItem("fname"), localStorage.getItem("lname"));
        
        if (data.redirect) { 
            window.location.href = data.redirect;
            alert("Login successful..!!");
        } else {
            alert("Login Failed..!!");
        }

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("togglePassword").addEventListener("click", function () {
    togglePasswordVisibility("password", "togglePassword");
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

// Lottie animations
lottie.loadAnimation({
    container: document.getElementById('google-logo'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../assets/google.json'  // Ensure correct path
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
