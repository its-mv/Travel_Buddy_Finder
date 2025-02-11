// // document.addEventListener("DOMContentLoaded", () => {
// //     const fname = localStorage.getItem("fname");
// //     const lname = localStorage.getItem("lname");

// //     if (fname && lname) {
// //         document.getElementById("userName").textContent = `${fname} ${lname}`;
// //     } else {
// //         document.getElementById("userName").textContent = "User";
// //     }
// // });

// // const token = localStorage.getItem("token");
// // if (!token) {
// //     window.location.href = "/html/login.html";
// // }

// document.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//         window.location.href = "login.html"; // Redirect if not logged in
//         return;
//     }

//     // Decode JWT to get user info
//     function parseJwt(token) {
//         try {
//             return JSON.parse(atob(token.split(".")[1]));
//         } catch (e) {
//             return null;
//         }
//     }

//     const userData = parseJwt(token);

//     if (userData) {
//         document.getElementById("userName").textContent = `${userData.fname} ${userData.lname}`;
//     } else {
//         document.getElementById("userName").textContent = "User";
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
    const firstName = localStorage.getItem("fname");
    const lastName = localStorage.getItem("lname");
  
    if (firstName && lastName) {
      document.getElementById("welcomeMessage").innerText = `Welcome, ${firstName} ${lastName}!`;
    } else {
      document.getElementById("welcomeMessage").innerText = "Welcome, Guest!";
    }
  });
  
