// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("profile-form");
    
//     // Fetch user profile data
//     fetch("http://localhost:5000/profile", { 
//         method: "GET",
//         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data) {
//             document.getElementById("bio").value = data.bio || "";
//             document.getElementById("home_city").value = data.home_city || "";
//             document.getElementById("country").value = data.country || "";
//             document.getElementById("address").value = data.address || "";
//             document.getElementById("emergency_contact").value = data.emergency_contact || "";
//             document.getElementById("identity_verified").checked = data.identity_verified;
//             document.getElementById("instagram").value = data.instagram || "";
//             document.getElementById("snapchat").value = data.snapchat || "";
//             document.getElementById("facebook").value = data.facebook || "";

//             // Set selected travel styles
//             const styleSelect = document.getElementById("travel_styles");

//             const userStyles = data.styles || []; // Expecting an array like ["Adventure", "Beach"]
//             Array.from(styleSelect.options).forEach(option => {
//                 if (userStyles.includes(option.textContent)) {
//                     option.selected = true;
//                 }
//             });

//             updateProgressBar(data);
//         }
//     })
//     .catch(err => console.error("Error fetching profile:", err));

//     // Handle form submission
//     form.addEventListener("submit", (e) => {
//         e.preventDefault();

//         // Get values of social media fields
//         let instagram = document.getElementById("instagram").value.trim();
//         let snapchat = document.getElementById("snapchat").value.trim();
//         let facebook = document.getElementById("facebook").value.trim();

//         const selectedStyles = Array.from(document.querySelectorAll('input[name="travelStyle"]:checked')).map(input => input.value);

//         console.log("Selected Travel Styles:", selectedStyles);

//         // Count non-empty fields
//         let filledSocials = [instagram, snapchat, facebook].filter(val => val !== "").length;

//         // Enforce minimum 2 required
//         if (filledSocials < 2) {
//             alert("Please enter at least two of the following: Instagram, Facebook, or Snapchat.");
//             return;
//         }

//         const updatedData = {
//             bio: document.getElementById("bio").value,
//             home_city: document.getElementById("home_city").value,
//             country: document.getElementById("country").value,
//             address: document.getElementById("address").value,
//             emergency_contact: document.getElementById("emergency_contact").value,
//             styles : selectedStyles,
//             instagram,
//             snapchat,
//             facebook,
//         };

//         fetch("http://localhost:5000/profile/update", {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${localStorage.getItem("token")}`
//             },
//             body: JSON.stringify(updatedData)
//         })
//         .then(res => {
//             if (!res.ok) {
//                 throw new Error(`HTTP Error! Status: ${res.status}`);
//             }
//             return res.json();
//         })
//         .then(data => {
//             alert(data.message);
//             updateProgressBar(updatedData);
//             window.location.href = '../html/dashboard.html';
//         })
//         .catch(err => console.error("Error updating profile:", err));
//     });

//     // Function to update progress bar
//     function updateProgressBar(profile) {
//         let filledFields = Object.values(profile).filter(val => val && val !== "Not Set").length;
//         let totalFields = Object.keys(profile).length;
//         totalFields--;
//         let percentage = Math.round((filledFields / totalFields) * 100);

//         document.getElementById("progress-fill").style.width = `${percentage}%`;
//         document.getElementById("progress-text").innerText = `Profile Completion: ${percentage}%`;
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");

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
                document.getElementById("identity_verified").checked = data.identity_verified;
                document.getElementById("instagram").value = data.instagram || "";
                document.getElementById("snapchat").value = data.snapchat || "";
                document.getElementById("facebook").value = data.facebook || "";

                // Set selected travel styles
                const userStyles = data.styles ? data.styles.map(style => String(style)) : []; // Convert to string for comparison
                document.querySelectorAll('input[name="travelStyle"]').forEach(checkbox => {
                    if (userStyles.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });


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

    // Function to update progress bar
    function updateProgressBar(profile) {
        let filledFields = Object.values(profile).filter(val => val && val !== "Not Set").length;
        let totalFields = Object.keys(profile).length - 1; // Exclude styles count
        let percentage = Math.round((filledFields / totalFields) * 100);

        document.getElementById("progress-fill").style.width = `${percentage}%`;
        document.getElementById("progress-text").innerText = `Profile Completion: ${percentage}%`;
    }
});
