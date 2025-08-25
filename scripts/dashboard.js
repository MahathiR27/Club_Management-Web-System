// Function to fetch data from table
async function get_data(query) {
  const response = await fetch("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  return await response.json();
}

// Load user information when page loads
window.addEventListener("DOMContentLoaded", async function () {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const userData = await get_data({
      sql: `SELECT name FROM user WHERE uid = ?`,
      params: [currentUser],
    });
    if (userData.length > 0) {
      const username = userData[0].name;
      document.getElementById(
        "welcome-message"
      ).textContent = `Welcome ${username}!`;

      // Load user profile information for the dropdown menu
      await loadUserProfile(currentUser);
      // Check user role and setup dashboard
      await setupDashboardByRole(currentUser);
    } else {
      document.getElementById("welcome-message").textContent = "Welcome!";
    }
  } else {
    // user logged in na thakle login page e pathabe
    window.location.href = "login.html";
  }
});

// check user role and setup dashboard
async function setupDashboardByRole(userId) {
  const roleCheck = await get_data({
    sql: `
        SELECT 'student' as role, uid FROM student WHERE uid = ?
        UNION
        SELECT 'advisor' as role, uid FROM advisor WHERE uid = ?  
        UNION
        SELECT 'oca' as role, uid FROM oca WHERE uid = ?
      `,
    params: [userId, userId, userId],
  });

  // if (roleCheck.length === 0) {
  //   showRoleNotFoundError();
  //   return;
  // }

  const userRole = roleCheck[0].role;

  // Update the user role in the profile dropdown
  const roleDisplayMap = {
    student: "Student",
    advisor: "Advisor",
    oca: "OCA",
  };
  document.getElementById("userRole").textContent = roleDisplayMap[userRole];

  switch (userRole) {
    case "student":
      await setupStudentDashboard(userId);
      break;
    case "advisor":
      setupAdvisorDashboard(userId);
      break;
    case "oca":
      setupOCADashboard(userId);
      break;
    default:
      showRoleNotFoundError();
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    alert("Logged out successfully!");
    window.location.href = "login.html";
  }
}

// Toggle user dropdown menu
function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const userMenu = document.querySelector(".user-menu");
  const dropdown = document.getElementById("userDropdown");

  if (!userMenu.contains(event.target)) {
    dropdown.classList.remove("show");
  }
});

// Load user profile information
async function loadUserProfile(userId) {
  try {
    // Get basic user data
    const userData = await get_data({
      sql: `SELECT name, uid, email FROM user WHERE uid = ?`,
      params: [userId],
    });

    if (userData.length > 0) {
      const user = userData[0];
      document.getElementById("userName").textContent = user.name;
      document.getElementById("userId").textContent = user.uid;
      document.getElementById("userEmail").textContent = user.email;
      // Role will be set by setupDashboardByRole function
    } else {
      // Fallback if user data not found
      document.getElementById("userName").textContent = "User";
      document.getElementById("userRole").textContent = "Unknown";
      document.getElementById("userId").textContent = userId;
      document.getElementById("userEmail").textContent = "No email found";
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    // Fallback on error
    document.getElementById("userName").textContent = "User";
    document.getElementById("userRole").textContent = "Error";
    document.getElementById("userId").textContent = userId;
    document.getElementById("userEmail").textContent = "Error loading email";
  }
}
