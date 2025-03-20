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
                document.getElementById("Location").innerText = `${data.home_city}, ${data.country}`;
            } else {
                console.error("User info not found");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }

        // Fetch User Travel Styles
        try {
            const response = await fetch(`http://localhost:5000/auth/user/${uid}/travel-styles`);
            if (!response.ok) throw new Error("Failed to fetch travel styles");

            const styles = await response.json();
            const stylesContainer = document.getElementById("TravelStyles");
            
            stylesContainer.innerHTML = ""; // Clear previous styles

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
