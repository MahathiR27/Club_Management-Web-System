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

  // Setup sidebar and dashboard based on role
  setupSidebar(userRole, userId);

  // Load announcements for students and advisors (not OCA)
  if (userRole !== "oca") {
    await loadRecentAnnouncements();
  } else {
    // Hide announcement section for OCA
    document.getElementById("announcement-section").style.display = "none";
  }

  switch (userRole) {
    case "student":
      await setupStudentDashboard(userId);
      break;
    case "advisor":
      await setupAdvisorDashboard(userId);
      break;
    case "oca":
      await setupOCADashboard(userId);
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

// Setup sidebar based on user role
function setupSidebar(userRole, userId) {
  const sidebarContent = document.querySelector(".sidebar-content");
  let sidebarHTML = "";

  switch (userRole) {
    case "student":
      sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon">🏠</span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showMyClubs('${userId}')">
          <span class="icon">🏛️</span>
          My Clubs
        </button>
        <button class="sidebar-btn" onclick="showJoinClubs('${userId}')">
          <span class="icon">➕</span>
          Join Clubs
        </button>
        <div id="manage-clubs-btn" style="display: none;">
          <button class="sidebar-btn" onclick="showManageClubs('${userId}')">
            <span class="icon">⚙️</span>
            Manage Clubs
          </button>
        </div>
      `;
      break;
    case "advisor":
      sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon">🏠</span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showManageClub('${userId}')">
          <span class="icon">🏛️</span>
          Manage Club
        </button>
        <button class="sidebar-btn" onclick="showApproveActivities('${userId}')">
          <span class="icon">✅</span>
          Approve Activities
        </button>
      `;
      break;
    case "oca":
      sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon">🏠</span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showAllClubs()">
          <span class="icon">🏢</span>
          All Clubs
        </button>
        <button class="sidebar-btn" onclick="showClubApproval()">
          <span class="icon">📋</span>
          Club Approval
        </button>
        <button class="sidebar-btn" onclick="showAnnouncements()">
          <span class="icon">📢</span>
          Announcements
        </button>
        <button class="sidebar-btn" onclick="showAccountVerification()">
          <span class="icon">👤</span>
          Account Verification
        </button>
      `;
      break;
  }

  sidebarContent.innerHTML = sidebarHTML;

  // Check if student is a president to show manage clubs button
  if (userRole === "student") {
    checkIfPresident(userId);
  }
}

// Check if student is a president of any club
async function checkIfPresident(userId) {
  try {
    const presidentCheck = await get_data({
      sql: `SELECT cid FROM members WHERE student_uid = ? AND position = 'President'`,
      params: [userId],
    });

    if (presidentCheck.length > 0) {
      document.getElementById("manage-clubs-btn").style.display = "block";
    }
  } catch (error) {
    console.error("Error checking president status:", error);
  }
}

// Function to handle sidebar button clicks
function setActiveButton(clickedBtn) {
  // Remove active class from all buttons
  document.querySelectorAll(".sidebar-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Add active class to clicked button
  clickedBtn.classList.add("active");
}

// Load recent announcements (limit to 3)
async function loadRecentAnnouncements() {
  try {
    const announcements = await get_data({
      sql: `SELECT a.subject as title, a.body as content, a.date_time as date 
            FROM announcement a 
            ORDER BY a.date_time DESC LIMIT 3`,
    });

    const announcementsList = document.getElementById("announcements-list");
    if (announcements.length > 0) {
      announcementsList.innerHTML = announcements
        .map(
          (announcement) => `
        <div class="announcement-item">
          <div class="announcement-content">
            <h4>${announcement.title}</h4>
            <p>${announcement.content}</p>
            <small>Posted on: ${new Date(
              announcement.date
            ).toLocaleDateString()}</small>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      announcementsList.innerHTML =
        '<p class="no-announcements">No recent announcements</p>';
    }
  } catch (error) {
    console.error("Error loading announcements:", error);
    document.getElementById("announcements-list").innerHTML =
      '<p class="error">Error loading announcements</p>';
  }
}

// Function to view all announcements
function viewAllAnnouncements() {
  // This function can be expanded to show a modal or navigate to a full announcements page
  alert("View all announcements feature - coming soon!");
}

// Show home page - shows welcome message and announcements
function showHomePage() {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn");
  setActiveButton(clickedBtn);

  // Show welcome message
  document.querySelector(".welcome-section").style.display = "block";

  // Show announcements only if the section exists (not for OCA)
  const announcementSection = document.getElementById("announcement-section");
  if (announcementSection && announcementSection.style.display !== "none") {
    announcementSection.style.display = "block";
  }

  // Clear dynamic content
  document.getElementById("dynamic-content").innerHTML = "";
}
