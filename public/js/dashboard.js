document.addEventListener("DOMContentLoaded", async () => {
    const firstName = localStorage.getItem("fname");
    const lastName = localStorage.getItem("lname");
    const uid = localStorage.getItem("uid"); // Get email from localStorage

    if (!uid) {
        console.error("User ID is missing in localStorage!");
        return;
    }
    if (firstName && lastName) {
        document.getElementById("Name").innerText = `${firstName} ${lastName}`;
    }

    if (uid) {
        try {
            const response = await fetch(`http://localhost:5000/auth/user/${uid}`);
            
            if (!response.ok) throw new Error("Failed to fetch user info");
            const data = await response.json();
            
            if (response.ok) {
                if (data.home_city && data.country) {
                    document.getElementById("Location").innerText = `${data.home_city}, ${data.country}`;
                }
                else {
                    document.getElementById("Location").innerText = 'Location Not Set';
                    document.getElementById("Location").style.backgroundColor = "red";
                }
            } else {
                console.error("User info not found");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }

        // Fetch User Travel Styles
        try {
            const response = await fetch(`http://localhost:5000/auth/user/${uid}/travel-styles`);

            if (!response.ok) {
                document.getElementById("TravelStyles").textContent = "No Styles Set";
                document.getElementById("TravelStyles").style.backgroundColor = "red";
                return;
            }

            const styles = await response.json();
            const stylesContainer = document.getElementById("TravelStyles");
            
            stylesContainer.innerHTML = ""; // Clear previous styles
            
            if (styles.length === 0) {  
                stylesContainer.textContent = "No Styles Set";  
                stylesContainer.style.backgroundColor = "red";  
                return;
            }

            styles.forEach(style => {
                const styleTag = document.createElement("span");
                styleTag.innerText = style;
                styleTag.classList.add("style-tag"); // Add class for styling
                stylesContainer.appendChild(styleTag);
            });

        } catch (error) {
            console.error("Error fetching travel styles:", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../html/index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/profile/profile-completion", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.completionPercentage === 100) {
            document.getElementById("profileCompletion").style.display = "none";
            return;
        }

        document.getElementById("completionPercentage").textContent = `${data.completionPercentage}% Complete`;
        document.getElementById("completionProgress").style.width = `${data.completionPercentage}%`;

        const missingItemsList = document.getElementById("missingItems");
        missingItemsList.innerHTML = "";
        data.missingFields.forEach(field => {
            let listItem = document.createElement("li");
            listItem.textContent = field;
            missingItemsList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching profile completion:", error);
    }
});
