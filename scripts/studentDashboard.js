// Student Dashboard Functions

// Setup dashboard for students
async function setupStudentDashboard(userId) {
  // Update welcome message
  document.querySelector(".welcome-section p").textContent =
    "Stay updated with your club activities and explore new opportunities.";

  // Load student dashboard data
  await loadStudentDashboardData(userId);
}

// Load dashboard data for student
async function loadStudentDashboardData(userId) {
  // Load joined clubs
  await loadJoinedClubs(userId);
  // Load available clubs
  await loadAvailableClubs(userId);
  // Load notifications
  await loadNotifications(userId);
}

// Load clubs that the user has joined
async function loadJoinedClubs(userId) {
  console.log("Loading joined clubs for user:", userId);

  const joinedClubs = await get_data({
    sql: `SELECT c.*, m.joining_sem FROM club c 
          INNER JOIN members m ON c.cid = m.cid 
          WHERE m.student_uid = ?`,
    params: [userId],
  });

  console.log("Joined clubs:", joinedClubs);

  const joinedClubsList = document.getElementById("joined-clubs-list");
  const emptyState = document.getElementById("joined-clubs-empty");

  if (!joinedClubsList) {
    console.error("joined-clubs-list element not found!");
    return;
  }

  if (!emptyState) {
    console.error("joined-clubs-empty element not found!");
    return;
  }

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
            <p>Member since ${club.joining_sem}</p>
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

    console.log("Joined clubs HTML updated");
  } else {
    joinedClubsList.style.display = "none";
    emptyState.style.display = "block";
    console.log("No joined clubs found, showing empty state");
  }
}

// Load clubs available to join
async function loadAvailableClubs(userId) {
  console.log("Loading available clubs for user:", userId);

  // Get clubs that user hasn't joined yet
  const availableClubs = await get_data({
    sql: `SELECT c.* FROM club c 
          WHERE c.cid NOT IN (
            SELECT m.cid FROM members m WHERE m.student_uid = ?
          )`,
    params: [userId],
  });

  console.log("Available clubs:", availableClubs);

  // Get user's applications status
  const applications = await get_data({
    sql: `SELECT cid, status FROM applied WHERE uid = ?`,
    params: [userId],
  });

  console.log("User applications:", applications);

  // Create a map of applications for quick lookup
  const applicationMap = {};
  applications.forEach((app) => {
    applicationMap[app.cid] = app.status;
  });

  const availableClubsList = document.getElementById("available-clubs-list");

  if (!availableClubsList) {
    console.error("available-clubs-list element not found!");
    return;
  }

  availableClubsList.innerHTML = availableClubs
    .map((club) => {
      const applicationStatus = applicationMap[club.cid];
      let buttonHtml = "";
      let statusClass = "";

      if (applicationStatus === "pending" || applicationStatus === "applied") {
        buttonHtml = `<button class="applied-btn" disabled>Application Pending</button>`;
        statusClass = "applied";
      } else if (applicationStatus === "rejected") {
        buttonHtml = `<button class="reapply-btn" onclick="applyToClub('${club.cid}')">Reapply</button>`;
        statusClass = "rejected";
      } else {
        buttonHtml = `<button class="apply-club-btn" onclick="applyToClub('${club.cid}')">Apply Now</button>`;
      }

      return `
      <div class="club-card available ${statusClass}">
        <div class="club-info">
          <div class="club-icon">🏛️</div>
          <div class="club-details">
            <h4>${club.name}</h4>
            <p>${club.description || "Join this amazing club!"}</p>
            <div class="club-stats">
              <span class="category">${club.category || "General"}</span>
              ${
                applicationStatus
                  ? `<span class="application-status ${applicationStatus}">${
                      applicationStatus.charAt(0).toUpperCase() +
                      applicationStatus.slice(1)
                    }</span>`
                  : ""
              }
            </div>
          </div>
        </div>
        ${buttonHtml}
      </div>
    `;
    })
    .join("");

  console.log("Available clubs HTML updated");
}

// Load recent notifications
async function loadNotifications(userId) {
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
}

// Apply to join a club
async function applyToClub(clubId) {
  console.log("applyToClub function called with clubId:", clubId);

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please login first!");
    return;
  }

  try {
    // Check if user has already applied to this club
    const existingApplication = await get_data({
      sql: `SELECT status FROM applied WHERE uid = ? AND cid = ?`,
      params: [currentUser, clubId],
    });

    if (existingApplication.length > 0) {
      const status = existingApplication[0].status;
      if (status === "applied" || status === "pending") {
        alert(
          "You have already applied to this club. Please wait for approval."
        );
        return;
      } else if (status === "approved") {
        alert(
          "Your application has been approved. You are already a s of this club."
        );
        return;
      } else if (status === "rejected") {
        // Allow reapplication if previously rejected
        await get_data({
          sql: `UPDATE applied SET status = 'pending' WHERE uid = ? AND cid = ?`,
          params: [currentUser, clubId],
        });
        alert("Your application has been resubmitted!");
        await loadStudentDashboardData(currentUser);
        return;
      }
    }

    // Check if user is already a member of this club
    const memberCheck = await get_data({
      sql: `SELECT * FROM members WHERE student_uid = ? AND cid = ?`,
      params: [currentUser, clubId],
    });

    if (memberCheck.length > 0) {
      alert("You are already a member of this club!");
      return;
    }

    // Insert new application
    await get_data({
      sql: `INSERT INTO applied (uid, cid, status) VALUES (?, ?, 'pending')`,
      params: [currentUser, clubId],
    });

    alert("Application submitted successfully! Please wait for approval.");

    // Reload the dashboard data to update UI
    await loadStudentDashboardData(currentUser);
  } catch (error) {
    console.error("Error in applyToClub:", error);
    alert(
      "An error occurred while submitting your application. Please try again."
    );
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
