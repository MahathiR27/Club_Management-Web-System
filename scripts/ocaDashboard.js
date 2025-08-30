async function send_email(email) {
  const response = await fetch("/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email), // this is the body of req in main
  });
  return await response.json();
}
// Function to fetch data from table (shared function)
async function get_data(query) {
  const response = await fetch("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  return await response.json();
}

// Main function to setup OCA Dashboard
async function setupOCADashboard(userId) {
  // Show home page by default (welcome only, no announcements for OCA)
  showHomePage();
}

// Show All Clubs content
async function showAllClubs() {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn");
  setActiveButton(clickedBtn);

  // Hide welcome message for OCA (announcements are already hidden)
  document.querySelector(".welcome-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">🏢</div>
          <h3>All Clubs</h3>
        </div>
      </div>
      <div class="oca-content" id="all-clubs-content">
        <div class="oca-card">
          <h4>🏛️ Active Clubs</h4>
          <p>View and manage all active clubs in the system</p>
          <button class="oca-btn" onclick="alert('Active clubs management coming soon!')">View Active Clubs</button>
        </div>
        <div class="oca-card">
          <h4>📊 Club Statistics</h4>
          <p>View comprehensive statistics about all clubs</p>
          <button class="oca-btn" onclick="alert('Club statistics coming soon!')">View Statistics</button>
        </div>
        <div class="oca-card">
          <h4>⚙️ Club Settings</h4>
          <p>Manage global club settings and policies</p>
          <button class="oca-btn" onclick="alert('Club settings coming soon!')">Manage Settings</button>
        </div>
      </div>
    </div>
  `;
}

// Show Club Approval content - only pending applications
async function showClubApproval() {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

  // Hide welcome message for OCA
  document.querySelector(".welcome-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">📋</div>
          <h3>Pending Club Applications</h3>
        </div>
      </div>
      <div id="pending-applications-list">
        <!-- Pending applications will be loaded here -->
      </div>
    </div>
  `;

  await loadPendingClubApplications();
}

// Load pending club applications
async function loadPendingClubApplications() {
  try {
    // This would be replaced with actual query to get pending club applications
    // For now, showing a placeholder structure
    const pendingList = document.getElementById("pending-applications-list");
    pendingList.innerHTML = `
      <div class="pending-applications">
        <p class="no-content">No pending club applications at this time.</p>
        <p class="note">This feature will connect to the database to show actual pending applications.</p>
      </div>
    `;
  } catch (error) {
    console.error("Error loading pending club applications:", error);
    document.getElementById("pending-applications-list").innerHTML =
      '<p class="error">Error loading applications</p>';
  }
}

// Show Announcements content
async function showAnnouncements() {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

  // Hide welcome message for OCA
  document.querySelector(".welcome-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">📢</div>
          <h3>Announcements</h3>
        </div>
      </div>
      <div class="oca-content" id="announcements-content">
        <div class="oca-card">
          <h4>✍️ Create Announcement</h4>
          <p>Send system-wide announcements and notifications</p>
          <button class="oca-btn" onclick="alert('Create announcement coming soon!')">Create New</button>
        </div>
        <div class="oca-card">
          <h4>📄 Manage Announcements</h4>
          <p>View and manage existing announcements</p>
          <button class="oca-btn" onclick="alert('Manage announcements coming soon!')">Manage Existing</button>
        </div>
        <div class="oca-card">
          <h4>📊 Announcement Analytics</h4>
          <p>View announcement reach and engagement</p>
          <button class="oca-btn" onclick="alert('Announcement analytics coming soon!')">View Analytics</button>
        </div>
      </div>
    </div>
  `;
}

// Show Account Verification content - directly show pending verifications
async function showAccountVerification() {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

  // Hide welcome message for OCA
  document.querySelector(".welcome-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">👤</div>
          <h3>Pending Account Verifications</h3>
        </div>
      </div>
      <div id="pending-verifications-list">
        <!-- Pending verifications will be loaded here -->
      </div>
    </div>
  `;

  await loadPendingVerifications();
}

// Load pending account verifications
async function loadPendingVerifications() {
  try {
    const pendingUsers = await get_data({
      sql: `SELECT uid, name, email, phone 
            FROM user 
            WHERE status = 'pending'`,
    });

    const pendingList = document.getElementById("pending-verifications-list");

    if (pendingUsers.length > 0) {
      pendingList.innerHTML = pendingUsers
        .map(
          (user) => `
        <div class="verification-card">
          <div class="user-info">
            <h4>${user.name}</h4>
            <p><strong>ID:</strong> ${user.uid}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
          </div>
          <div class="verification-actions">
            <button class="approve-btn" onclick="approveUser('${user.uid}')">Approve</button>
            <button class="reject-btn" onclick="rejectUser('${user.uid}')">Reject</button>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      pendingList.innerHTML =
        '<p class="no-content">No pending account verifications at this time.</p>';
    }
  } catch (error) {
    console.error("Error loading pending verifications:", error);
    document.getElementById("pending-verifications-list").innerHTML =
      '<p class="error">Error loading pending verifications: ' +
      error.message +
      "</p>";
  }
}

// Approve user account
async function approveUser(userId) {
  try {
    await get_data({
      sql: `UPDATE user SET status = 'active' WHERE uid = ?`,
      params: [userId],
    });
    alert("User approved successfully!");
    await loadPendingVerifications(); // Refresh the list
  } catch (error) {
    console.error("Error approving user:", error);
    alert("Error approving user: " + error.message);
  }
}

// Reject user account
async function rejectUser(userId) {
  if (
    confirm(
      "Are you sure you want to reject this user? This action cannot be undone."
    )
  ) {
    try {
      await get_data({
        sql: `UPDATE user SET status = 'rejected' WHERE uid = ?`,
        params: [userId],
      });
      alert("User rejected successfully!");
      await loadPendingVerifications(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user: " + error.message);
    }
  }
}

// Show verification modal
function showVerificationModal() {
  const overlay = document.getElementById("verificationOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    loadPendingUsers();
  }
}

// Setup all event handlers for OCA dashboard
function setupEventHandlers() {
  // Modal close function
  window.closeVerification = function () {
    document.getElementById("verificationOverlay").classList.remove("show");
  };

  // Account Verification Modal logic
  const accountVerificationBtn = document.getElementById(
    "accountVerificationBtn"
  );
  if (accountVerificationBtn) {
    accountVerificationBtn.addEventListener("click", async function () {
      document.getElementById("verificationOverlay").classList.add("show");
      await loadPendingUsers();
    });
  }

  // Update table headers for filter icons
  const theadRow = document.querySelector("#pendingUsersTable thead tr");
  if (theadRow) {
    const headers = ["User ID", "Name", "Email", "Phone", "Action"];
    theadRow.innerHTML = headers
      .map(
        (h) =>
          `<th>${h} <span class='filter-icon' title='Filter'>&#9776;</span></th>`
      )
      .join("");
  }
}

// Load pending users into the verification table
async function loadPendingUsers() {
  const pending_users = await get_data({
    sql: `SELECT * FROM user WHERE status = 'pending'`,
  });
  const tbody = document.querySelector("#pendingUsersTable tbody");
  tbody.innerHTML = "";

  if (!pending_users || pending_users.length === 0) {
    tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;color:#aaa;'>No pending users found.</td></tr>`;
  } else {
    pending_users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.uid}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td><button class="approve-btn" data-uid="${user.uid}">Approve</button></td>
      `;
      tbody.appendChild(row);
    });

    // Add event listeners for approve buttons
    tbody.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const uid = this.getAttribute("data-uid");
        // Update database - use 'active' status to match the database schema
        await get_data({
          sql: `UPDATE user SET status = 'active' WHERE uid = ?`,
          params: [uid],
        });

        // Get user data for email
        const user_data = await get_data({
          sql: `SELECT * FROM user WHERE uid = ?`,
          params: [uid],
        });
        const user = user_data[0]; // Get the first user object

        // Send approval email
        await send_email({
          receiver: user.email,
          subject: `Account Activated`,
          body: `Dear ${user.name},

Your account has been ACTIVATED. You can now access the dashboard.

Best regards,
OCA`,
        });

        // Refresh the account verification list to show updated status
        await loadPendingVerifications();
      });
    });
  }
}
