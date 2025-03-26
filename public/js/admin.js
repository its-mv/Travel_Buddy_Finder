// admin.js
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const verificationList = document.getElementById("verification-list");
    
    async function fetchPendingRequests() {
        const res = await fetch("http://localhost:5000/profile/pending-verifications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const users = await res.json();
        
        verificationList.innerHTML = users.map(user => `
            <tr>
                <td>${user.uid}</td>
                <td>${user.name}</td>
                <td><button onclick="approveVerification(${user.uid})">Approve</button></td>
            </tr>
        `).join("");
    }
    
    window.approveVerification = async (uid) => {
        await fetch("http://localhost:5000/profile/approve-verification", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ uid })
        });
        fetchPendingRequests();
    };
    
    fetchPendingRequests();
});