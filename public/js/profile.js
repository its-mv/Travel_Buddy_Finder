document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const requestVerificationBtn = document.getElementById("request-verification");
    const verificationStatusText = document.getElementById("verification-status");
    
    // Image upload elements
    const profileImageInput = document.getElementById("profile-image-input");
    const uploadImageBtn = document.getElementById("upload-image-btn");
    const saveImageBtn = document.getElementById("save-image-btn");
    const profileImagePreview = document.getElementById("profile-image-preview");
    const uploadStatus = document.getElementById("upload-status");
    let selectedFile = null;

    // Fetch user profile data
    async function fetchProfile() {
        try {
            const res = await fetch("http://localhost:5000/profile", { 
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();

            if (data) {
                // Set profile image if exists, otherwise use default
                if (data.profile_image) {
                    profileImagePreview.src = data.profile_image;
                } else {
                    profileImagePreview.src = "../assets/Man_on_Bike.png";
                }

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

    // Handle image selection
    uploadImageBtn.addEventListener("click", () => {
        profileImageInput.click();
    });

    profileImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                uploadStatus.textContent = "❌ Please select a valid image file (JPEG, PNG, GIF, WebP)";
                uploadStatus.style.color = "red";
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                uploadStatus.textContent = "❌ Image size must be less than 5MB";
                uploadStatus.style.color = "red";
                return;
            }

            selectedFile = file;
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);

            // Show save button
            saveImageBtn.style.display = "inline-block";
            uploadStatus.textContent = "👆 Click 'Save Image' to upload";
            uploadStatus.style.color = "#007bff";
        }
    });

    // Handle image upload to Supabase
    saveImageBtn.addEventListener("click", async () => {
        if (!selectedFile) {
            uploadStatus.textContent = "❌ Please select an image first";
            uploadStatus.style.color = "red";
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        try {
            uploadStatus.textContent = "⏳ Uploading...";
            uploadStatus.style.color = "#007bff";
            saveImageBtn.disabled = true;

            const res = await fetch("http://localhost:5000/profile/upload-image", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                uploadStatus.textContent = "✅ Profile image uploaded successfully!";
                uploadStatus.style.color = "green";
                saveImageBtn.style.display = "none";
                selectedFile = null;
                
                // Update the preview with the uploaded image URL
                if (data.imageUrl) {
                    profileImagePreview.src = data.imageUrl;
                }
            } else {
                uploadStatus.textContent = `❌ ${data.message || 'Upload failed'}`;
                uploadStatus.style.color = "red";
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            uploadStatus.textContent = "❌ Error uploading image";
            uploadStatus.style.color = "red";
        } finally {
            saveImageBtn.disabled = false;
        }
    });
});
