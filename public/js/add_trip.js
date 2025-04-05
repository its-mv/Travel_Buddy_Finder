document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored

    if (!isLoggedIn) {
        window.location.href = "../html/index.html"; // Redirect if not logged in
    }
});

document.addEventListener("DOMContentLoaded", function () {
    function showTab(index) {
        const tabs = document.querySelectorAll(".tab-content");
        const buttons = document.querySelectorAll(".tab-btn");

        tabs.forEach((tab, i) => {
            tab.classList.toggle("active", i === index);
        });

        buttons.forEach((btn, i) => {
            btn.classList.toggle("active", i === index);
        });
    }

    document.getElementById("tripForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("uid");
        
        if (!token) {
            alert("User not logged in!");
            window.location.href = "../html/index.html";
            return;
        }

        // Get form values
        const budget = document.getElementById("budget");
        const mode = document.getElementById("travel_mode");
        const pace = document.getElementById("travel_pace");
        const activities = Array.from(document.querySelectorAll('input[name="activities"]:checked'))
                       .map(checkbox => checkbox.value);


        if (budget.value === "") {
            alert("Please select a Budget option.");
            budget.focus();
            return;
        }
        if (mode.value === "") {
            alert("Please select a Travel Mode.");
            travelMode.focus();
            return;
        }
        if (pace.value === "") {
            alert("Please select a Pace of Trip.");
            travelPace.focus();
            return;
        }

        const tripData = {
            uid: uid,
            tname: document.getElementById("tname").value,
            from_city: document.getElementById("from_city").value,
            from_country: document.getElementById("from_country").value,
            to_city: document.getElementById("to_city").value,
            to_country: document.getElementById("to_country").value,
            date: document.getElementById("date").value,
            rdate: document.getElementById("rdate").value,
            duration: document.getElementById("totalDays").innerText,
            description: document.getElementById("description").value,
            budget: budget.value,
            mode: mode.value,
            pace: pace.value,
            accomodation: document.getElementById("accomodation").value,
            activities: activities,
        };

        const response = await fetch("http://localhost:5000/trips/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(tripData),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Trip added successfully!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.error || "Failed to add trip!");
        }
    });

    window.showTab = showTab; // Make function globally accessible
});

function calculateDays() {
    let startDate = document.getElementById("date").value;
    let endDate = document.getElementById("rdate").value;
    let totalDaysElement = document.getElementById("totalDays");

    if (startDate && endDate) {
        let start = new Date(startDate);
        let end = new Date(endDate);
        let timeDifference = end - start;
        let daysDifference = timeDifference / (1000 * 60 * 60 * 24);

        totalDaysElement.textContent = daysDifference >= 0 ? daysDifference : 0;
    } else {
        totalDaysElement.textContent = 0;
    }
}

document.getElementById("date").addEventListener("input", calculateDays);
document.getElementById("rdate").addEventListener("input", calculateDays);