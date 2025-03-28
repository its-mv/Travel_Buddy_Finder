document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const requestVerificationBtn = document.getElementById("request-verification");
    const verificationStatusText = document.getElementById("verification-status");

    // Fetch user profile data
    async function fetchProfile() {
        try {
            const res = await fetch("http://localhost:5000/profile", { 
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();

            if (data) {
                document.getElementById("bio").value = data.bio || "";
                document.getElementById("home_city").value = data.home_city || "";
                document.getElementById("country").value = data.country || "";
                document.getElementById("address").value = data.address || "";
                document.getElementById("emergency_contact").value = data.emergency_contact || "";
                // document.getElementById("identity_verified").checked = data.identity_verified;
                document.getElementById("instagram").value = data.instagram || "";
                document.getElementById("snapchat").value = data.snapchat || "";
                document.getElementById("facebook").value = data.facebook || "";

                const userStyles = data.style ? data.style.split(",").map(id => id.trim()) : [];
                // alert("Processed User Styles: " + userStyles.join(", "));


                document.querySelectorAll('input[name="travelStyle"]').forEach(checkbox => {
                    if (userStyles.includes(checkbox.value)) { 
                        checkbox.checked = true;
                    }
                });                

                 // Show verification request button if not verified
                 if (!data.identity_verified) {
                    requestVerificationBtn.style.display = "block";
                    verificationStatusText.innerText = "(❌ Identity not verified.)";
                } else {
                    verificationStatusText.innerText = "✅ Your identity is verified.";
                }

                updateProgressBar(data);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    }

    // Fetch profile data on page load
    fetchProfile();

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            // Get values of social media fields
            let instagram = document.getElementById("instagram").value.trim();
            let snapchat = document.getElementById("snapchat").value.trim();
            let facebook = document.getElementById("facebook").value.trim();

            const selectedStyles = Array.from(document.querySelectorAll('input[name="travelStyle"]:checked')).map(input => parseInt(input.value)); // Convert to integer (style ID)

            console.log("Selected Travel Styles:", selectedStyles);

            // Count non-empty fields
            let filledSocials = [instagram, snapchat, facebook].filter(val => val !== "").length;

            // Enforce minimum 2 required
            if (filledSocials < 2) {
                alert("Please enter at least two of the following: Instagram, Facebook, or Snapchat.");
                return;
            }

            const updatedData = {
                bio: document.getElementById("bio").value,
                home_city: document.getElementById("home_city").value,
                country: document.getElementById("country").value,
                address: document.getElementById("address").value,
                emergency_contact: document.getElementById("emergency_contact").value,
                instagram,
                snapchat,
                facebook,
            };

            // Update user profile (excluding travel styles)
            const profileResponse = await fetch("http://localhost:5000/profile/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!profileResponse.ok) throw new Error(`Profile Update Failed: ${profileResponse.status}`);
            const profileData = await profileResponse.json();
            console.log("Profile Update Response:", profileData);

            // Update travel styles separately
            const stylesResponse = await fetch("http://localhost:5000/profile/profile/styles", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ styles: selectedStyles })
            });

            if (!stylesResponse.ok) throw new Error(`Styles Update Failed: ${stylesResponse.status}`);
            const stylesData = await stylesResponse.json();
            console.log("Styles Update Response:", stylesData);

            alert("Profile updated successfully!");
            updateProgressBar(updatedData);
            window.location.href = '../html/dashboard.html';
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });

    // Handle verification request
    requestVerificationBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:5000/profile/request-verification", {
                method: "POST",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await res.json();
            if (data.success) {
                verificationStatusText.innerText = "🔄 Verification request sent!";
                requestVerificationBtn.style.display = "none"; 
            } else {
                verificationStatusText.innerText = "❌ Error requesting verification.";
            }
        } catch (err) {
            console.error("Error requesting verification:", err);
        }
    });

    // Function to update progress bar
    function updateProgressBar(profile) {
        let filledFields = Object.values(profile).filter(val => val && val !== "Not Set").length;
        let totalFields = Object.keys(profile).length - 1; 
        let percentage = Math.round((filledFields / totalFields) * 100);

        document.getElementById("progress-fill").style.width = `${percentage}%`;
        document.getElementById("progress-text").innerText = `Profile Completion: ${percentage}%`;
    }
});
