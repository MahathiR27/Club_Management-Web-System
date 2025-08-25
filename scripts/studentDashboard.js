// Student Dashboard Functions

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
