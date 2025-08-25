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
      const userData = await get_data({sql: `SELECT name FROM user WHERE uid = ?`, params: [currentUser]});
      if (userData.length > 0) {
        const username = userData[0].name;
        document.getElementById("welcome-message").textContent = `Welcome ${username}!`;

        // Load user profile information for the dropdown menu
        await loadUserProfile(currentUser);
        // Check user role and setup dashboard
        await setupDashboardByRole(currentUser);

      } else {
        document.getElementById("welcome-message").textContent = "Welcome!";
      }
  } 
  else {
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
      'student': 'Student',
      'advisor': 'Advisor', 
      'oca': 'OCA'
    };
    document.getElementById('userRole').textContent = roleDisplayMap[userRole];

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

// Setup dashboard for students
async function setupStudentDashboard(userId) {
  try {
    // Update welcome message
    document.querySelector(".welcome-section p").textContent =
      "Stay updated with your club activities and explore new opportunities.";

    // Load student dashboard data
    await loadStudentDashboardData(userId);
  } catch (error) {
    console.error("Error setting up student dashboard:", error);
  }
}

// Advisor Dashboard- apajoto dummy set kora
function setupAdvisorDashboard(userId) {
  const dashboardContainer = document.querySelector(".student-dashboard");
  dashboardContainer.innerHTML = `
    <div class="advisor-dashboard">
      <div class="dashboard-section">
        <div class="section-header">
          <div class="section-icon">👨‍🏫</div>
          <h3>Advisor Dashboard</h3>
        </div>
        <div class="advisor-content">
          <div class="advisor-card">
            <h4>🏛️ My Clubs</h4>
            <p>Manage and oversee your assigned clubs</p>
            <button class="advisor-btn" onclick="alert('Advisor club management coming soon!')">Manage Clubs</button>
          </div>
          <div class="advisor-card">
            <h4>📊 Club Reports</h4>
            <p>View reports and analytics for your clubs</p>
            <button class="advisor-btn" onclick="alert('Club reports coming soon!')">View Reports</button>
          </div>
          <div class="advisor-card">
            <h4>✅ Approve Activities</h4>
            <p>Review and approve club activities and events</p>
            <button class="advisor-btn" onclick="alert('Activity approval coming soon!')">Review Activities</button>
          </div>
          <div class="advisor-card">
            <h4>👥 Member Management</h4>
            <p>Oversee club membership and member activities</p>
            <button class="advisor-btn" onclick="alert('Member management coming soon!')">Manage Members</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update welcome message for advisors
  document.querySelector(".welcome-section p").textContent =
    "Manage your clubs, review activities, and guide student organizations.";
}

// OCA Dashboard- apajoto dummy set kora
function setupOCADashboard(userId) {
  const dashboardContainer = document.querySelector(".student-dashboard");
  dashboardContainer.innerHTML = `
    <div class="oca-dashboard">
      <div class="dashboard-section">
        <div class="section-header">
          <div class="section-icon">🏢</div>
          <h3>OCA Dashboard</h3>
        </div>
        <div class="oca-content">
          <div class="oca-card">
            <h4>🏛️ All Clubs</h4>
            <p>Oversee all clubs across the university</p>
            <button class="oca-btn" onclick="alert('All clubs management coming soon!')">Manage All Clubs</button>
          </div>
          <div class="oca-card">
            <h4>📈 System Analytics</h4>
            <p>View comprehensive system reports and statistics</p>
            <button class="oca-btn" onclick="alert('System analytics coming soon!')">View Analytics</button>
          </div>
          <div class="oca-card">
            <h4>⚙️ System Settings</h4>
            <p>Configure system-wide settings and policies</p>
            <button class="oca-btn" onclick="alert('System settings coming soon!')">System Settings</button>
          </div>
          <div class="oca-card">
            <h4>👨‍🏫 Advisor Management</h4>
            <p>Manage advisor assignments and permissions</p>
            <button class="oca-btn" onclick="alert('Advisor management coming soon!')">Manage Advisors</button>
          </div>
          <div class="oca-card">
            <h4>📋 Club Approvals</h4>
            <p>Review and approve new club applications</p>
            <button class="oca-btn" onclick="alert('Club approvals coming soon!')">Review Applications</button>
          </div>
          <div class="oca-card">
            <h4>📢 Announcements</h4>
            <p>Send system-wide announcements and notifications</p>
            <button class="oca-btn" onclick="alert('Announcements coming soon!')">Send Announcements</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update welcome message for OCA
  document.querySelector(".welcome-section p").textContent =
    "Oversee the entire club management system and university activities.";
}

// Show error when user role is not found
function showRoleNotFoundError() {
  const dashboardContainer = document.querySelector(".student-dashboard");
  dashboardContainer.innerHTML = `
    <div class="error-dashboard">
      <div class="dashboard-section">
        <div class="section-header">
          <div class="section-icon">⚠️</div>
          <h3>Access Error</h3>
        </div>
        <div class="error-content">
          <p>Your account role could not be determined. Please contact the system administrator.</p>
          <button class="error-btn" onclick="logout()">Logout and Try Again</button>
        </div>
      </div>
    </div>
  `;
}

// Load dashboard data for student
async function loadStudentDashboardData(userId) {
  try {
    // Load joined clubs
    await loadJoinedClubs(userId);

    // Load available clubs
    await loadAvailableClubs(userId);

    // Load notifications
    await loadNotifications(userId);
  } catch (error) {
    console.error("Error loading student dashboard data:", error);
  }
}

// Load clubs that the user has joined
async function loadJoinedClubs(userId) {
  try {
    const joinedClubs = await get_data({
      sql: `SELECT c.*, m.join_date FROM club c 
            INNER JOIN member m ON c.cid = m.cid 
            WHERE m.uid = ?`,
      params: [userId],
    });

    const joinedClubsList = document.getElementById("joined-clubs-list");
    const emptyState = document.getElementById("joined-clubs-empty");

    if (joinedClubs.length > 0) {
      joinedClubsList.style.display = "block";
      emptyState.style.display = "none";

      joinedClubsList.innerHTML = joinedClubs
        .map(
          (club) => `
        <div class="club-card joined">
          <div class="club-info">
            <div class="club-icon">🏛️</div>
            <div class="club-details">
              <h4>${club.name}</h4>
              <p>Member since ${new Date(
                club.join_date
              ).toLocaleDateString()}</p>
              <div class="club-stats">
                <span class="member-count">Active</span>
                <span class="category">${club.category || "General"}</span>
              </div>
            </div>
          </div>
          <button class="club-action-btn" onclick="viewClubDetails('${
            club.cid
          }')">View Details</button>
        </div>
      `
        )
        .join("");
    } else {
      joinedClubsList.style.display = "none";
      emptyState.style.display = "block";
    }
  } catch (error) {
    console.error("Error loading joined clubs:", error);
  }
}

// Load clubs available to join
async function loadAvailableClubs(userId) {
  try {
    const availableClubs = await get_data({
      sql: `SELECT c.* FROM club c 
            WHERE c.cid NOT IN (
              SELECT m.cid FROM member m WHERE m.uid = ?
            )`,
      params: [userId],
    });

    const availableClubsList = document.getElementById("available-clubs-list");

    availableClubsList.innerHTML = availableClubs
      .map(
        (club) => `
      <div class="club-card available">
        <div class="club-info">
          <div class="club-icon">🏛️</div>
          <div class="club-details">
            <h4>${club.name}</h4>
            <p>${club.description || "Join this amazing club!"}</p>
            <div class="club-stats">
              <span class="category">${club.category || "General"}</span>
            </div>
          </div>
        </div>
        <button class="join-club-btn" onclick="joinClub('${
          club.cid
        }')">Join Club</button>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading available clubs:", error);
  }
}

// Load recent notifications
async function loadNotifications(userId) {
  try {
    // apajoto static notification deoa pore add korbo bakita
    const notifications = [
      {
        icon: "📅",
        title: "Welcome to Club Management System!",
        message: "Explore clubs and join activities that interest you.",
        time: "Just now",
      },
      {
        icon: "🎉",
        title: "System Updated",
        message: "New features added to enhance your experience.",
        time: "1 day ago",
      },
    ];

    const notificationsList = document.getElementById("notifications-list");
    notificationsList.innerHTML = notifications
      .map(
        (notification) => `
      <div class="notification-item">
        <div class="notification-icon">${notification.icon}</div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <span class="notification-time">${notification.time}</span>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

// Join a club
async function joinClub(clubId) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please login first!");
    return;
  }

  try {
    await get_data({
      sql: `INSERT INTO member (uid, cid, join_date) VALUES (?, ?, CURDATE())`,
      params: [currentUser, clubId],
    });

    alert("Successfully joined the club!");
    // Reload the dashboard data
    await loadStudentDashboardData(currentUser);
  } catch (error) {
    console.error("Error joining club:", error);
    alert("Error joining club. Please try again.");
  }
}

// View club details
function viewClubDetails(clubId) {
  alert(`Club details for ${clubId} - Feature coming soon!`);
}

// View all notifications
function viewAllNotifications() {
  alert("All notifications - Feature coming soon!");
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
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  
  if (!userMenu.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});

// Load user profile information
async function loadUserProfile(userId) {
  try {
    // Get basic user data
    const userData = await get_data({
      sql: `SELECT name, uid, email FROM user WHERE uid = ?`,
      params: [userId]
    });
    
    if (userData.length > 0) {
      const user = userData[0];
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userId').textContent = user.uid;
      document.getElementById('userEmail').textContent = user.email;
      // Role will be set by setupDashboardByRole function
    } else {
      // Fallback if user data not found
      document.getElementById('userName').textContent = 'User';
      document.getElementById('userRole').textContent = 'Unknown';
      document.getElementById('userId').textContent = userId;
      document.getElementById('userEmail').textContent = 'No email found';
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    // Fallback on error
    document.getElementById('userName').textContent = 'User';
    document.getElementById('userRole').textContent = 'Error';
    document.getElementById('userId').textContent = userId;
    document.getElementById('userEmail').textContent = 'Error loading email';
  }
}
