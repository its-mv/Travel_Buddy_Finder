document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("uid"); // Check if a token is stored

    if (!isLoggedIn) {
        window.location.href = "../html/index.html"; // Redirect if not logged in
    }
});


async function fetchRequests() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/connections/user-requests", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const { sentRequests, receivedRequests } = await response.json();

        // Clear previous data
        ["pendingSent", "acceptedSent", "rejectedSent", "pendingReceived", "acceptedReceived", "rejectedReceived"]
            .forEach(id => document.getElementById(id).innerHTML = "");

        // Sort and categorize
        categorizeRequests(sentRequests, "Sent");
        categorizeRequests(receivedRequests, "Received");

    } catch (error) {
        console.error("Error fetching requests:", error);
    }
}

function categorizeRequests(requests, type) {
    const pending = requests.filter(req => req.status === "pending")
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const accepted = requests.filter(req => req.status === "accepted")
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const rejected = requests.filter(req => req.status === "declined")
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    renderRequests(pending, `pending${type}`);
    renderRequests(accepted, `accepted${type}`);
    renderRequests(rejected, `rejected${type}`);
}

// function renderRequests(requests, containerId) {
//     const container = document.getElementById(containerId);
//     requests.forEach(req => {
//         const div = document.createElement("div");
//         div.classList.add("request-card");
//         div.innerHTML = `
//             <p><strong>Name:</strong> ${req.fname} ${req.lname}</p>
//             <p><strong>Email:</strong> ${req.email}</p>
//             <p><strong>Status:</strong> ${req.status}</p>
//             <p><strong>Requested on:</strong> ${new Date(req.created_at).toLocaleString()}</p>
//             ${req.status !== "pending" ? `<p><strong>Updated on:</strong> ${new Date(req.updated_at).toLocaleString()}</p>` : ""}
//         `;
//         container.appendChild(div);
//     });
// }

function renderRequests(requests, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear previous content

    requests.forEach((req, index) => {
        const div = document.createElement("div");
        div.classList.add("request-card");
        if (index >= 3) {
            div.classList.add("hidden"); // Hide requests beyond 3
        }
        div.innerHTML = `
            <p><strong>Name:</strong> ${req.fname} ${req.lname}</p>
            <p><strong>Email:</strong> ${req.email}</p>
            <p><strong>Status:</strong> ${req.status}</p>
            <p><strong>Requested on:</strong> ${new Date(req.created_at).toLocaleString()}</p>
            ${req.status !== "pending" ? `<p><strong>Updated on:</strong> ${new Date(req.updated_at).toLocaleString()}</p>` : ""}
        `;
        container.appendChild(div);
    });

    if (requests.length > 3) {
        const viewMoreBtn = document.createElement("button");
        viewMoreBtn.classList.add("view-more-btn");
        viewMoreBtn.innerText = "View More";
        viewMoreBtn.addEventListener("click", () => {
            const hiddenCards = container.querySelectorAll(".request-card.hidden");

            if (hiddenCards.length > 0) {
                hiddenCards.forEach(card => card.classList.remove("hidden"));
                viewMoreBtn.innerText = "View Less";
            } else {
                const allCards = container.querySelectorAll(".request-card");
                allCards.forEach((card, index) => {
                    if (index >= 3) card.classList.add("hidden");
                });
                viewMoreBtn.innerText = "View More";
            }
        });
        container.appendChild(viewMoreBtn);
    }
}


fetchRequests();
