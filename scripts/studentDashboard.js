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
  // Load announcements
  await loadAnnouncements();
}

// Load clubs that the user has joined
async function loadJoinedClubs(userId) { 

  const joinedClubs = await get_data({
    sql: `SELECT c.*, m.* FROM club c 
          INNER JOIN members m ON c.cid = m.cid 
          WHERE m.student_uid = ?`,
    params: [userId],
  });

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
              <span class="category">${club.position || "General"}</span>
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
}

// Load clubs available to join
async function loadAvailableClubs(userId) {

  // Get clubs that user hasn't joined yet
  const availableClubs = await get_data({
    sql: `SELECT c.* FROM club c 
          WHERE c.cid NOT IN (
            SELECT m.cid FROM members m WHERE m.student_uid = ?
          )`,
    params: [userId],
  });

  // Get user's applications status
  const applications = await get_data({
    sql: `SELECT cid, status FROM applied WHERE uid = ?`,
    params: [userId],
  });

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

}

// Load recent announcements dynamically from backend
async function loadAnnouncements() {
  const announcementsList = document.getElementById("announcements-list");
  if (!announcementsList) return;

  try {
    // Pull only top 3 via POST /query
    const rows = await get_data({
      sql: `
        SELECT a.aid, a.\`type\`, a.subject, a.body, a.date_time, u.name AS author
        FROM \`announcement\` a
        JOIN \`user\` u ON a.uid = u.uid
        ORDER BY a.date_time DESC
        LIMIT 3
      `,
      params: []
    });

    if (!rows || rows.length === 0) {
      announcementsList.innerHTML = `
        <div class="announcement-item">
          <div class="announcement-content"><h4>No announcements yet</h4></div>
        </div>`;
    } else {
      announcementsList.innerHTML = rows.map(renderAnnouncementItem).join("");
    }

    // Add/refresh the footer with the Show All button (using the existing .view-all-btn style)
    // Avoid duplicates if the function runs again
    const panel = announcementsList.closest(".announcement-panel") || announcementsList.parentElement;
    let footer = panel.querySelector(".announcements-footer");
    if (!footer) {
      footer = document.createElement("div");
      footer.className = "announcements-footer";
      panel.appendChild(footer);
    }
    footer.innerHTML = `<button class="view-all-btn" id="showAllAnnouncementsBtn">Show all</button>`;
    document.getElementById("showAllAnnouncementsBtn").addEventListener("click", openAnnouncementsModal);
  } catch (err) {
    console.error("Failed to load announcements:", err);
  }
}

// Helper to render one announcement card (used by both list & modal)
function renderAnnouncementItem(a) {
  const when = new Date(a.date_time);
  return `
    <div class="announcement-item">
      <div class="announcement-icon">📢</div>
      <div class="announcement-content">
        <h4>${a.subject}</h4>
        <p>${a.body}</p>
        <span class="announcement-time">${when.toLocaleString()} &nbsp;•&nbsp; ${a.author}</span>
      </div>
    </div>`;
}

// Modal: fetch all announcements and show in overlay
async function openAnnouncementsModal() {
  // Create overlay container once if missing
  let overlay = document.getElementById("announcementsOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "announcementsOverlay";
    overlay.className = "announcements-overlay";
    overlay.innerHTML = `
      <div class="announcements-modal" role="dialog" aria-modal="true" aria-label="All announcements">
        <button class="announcements-close-btn" title="Close">&times;</button>
        <h3>All Announcements</h3>
        <div id="announcementsModalList" class="announcements-list-modal"></div>
      </div>`;
    document.body.appendChild(overlay);

    // Close interactions
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("show");
    });
    overlay.querySelector(".announcements-close-btn")
      .addEventListener("click", () => overlay.classList.remove("show"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.classList.remove("show");
    });
  }
  
  // Load every announcement (you can add LIMIT 100 if needed)
  try {
    const rows = await get_data({
      sql: `
        SELECT a.aid, a.\`type\`, a.subject, a.body, a.date_time, u.name AS author
        FROM \`announcement\` a
        JOIN \`user\` u ON a.uid = u.uid
        ORDER BY a.date_time DESC
      `,
      params: []
    });

    const container = document.getElementById("announcementsModalList");
    container.innerHTML = rows && rows.length
      ? rows.map(renderAnnouncementItem).join("")
      : `<div class="announcement-item"><div class="announcement-content"><h4>No announcements found</h4></div></div>`;

    document.getElementById("announcementsOverlay").classList.add("show");
  } catch (err) {
    console.error("Failed to load all announcements:", err);
  }
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
