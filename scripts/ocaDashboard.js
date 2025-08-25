// OCA Dashboard Functions

// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  return await response.json();
}

// Example usage to fetch user table by uid (prevents SQL injection)
async function fetchUserTableById(userid) {
  const table = await get_data({ sql: `select * from user where uid = ?`, params: [userid]});
  return table;
}

// OCA Dashboard setup and backend logic
function setupOCADashboard(userId) {
  const dashboardContainer = document.querySelector(".student-dashboard");
  dashboardContainer.innerHTML = `
    <div class="oca-dashboard">
      <div class="dashboard-section">
        <div class="section-header">
          <div class="section-icon">🏢</div>
          <h3>OCA Dashboard</h3>
        </div>
        <div class="oca-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; justify-items: stretch; align-items: stretch;">
          <div class="oca-card" style="box-shadow: 0 4px 20px rgba(79,184,250,0.08);">
            <h4 style="font-size:1.15rem; color:#2196f3;">🏛️ All Clubs</h4>
            <p style="color:#666;">Oversee all clubs across the university</p>
            <button class="oca-btn" style="width:100%;margin-top:1rem; background: linear-gradient(135deg,#2196f3,#4fb8fa);" onclick="alert('All clubs management coming soon!')">Manage All Clubs</button>
          </div>
          <div class="oca-card" style="box-shadow: 0 4px 20px rgba(79,184,250,0.08);">
            <h4 style="font-size:1.15rem; color:#4caf50;">📋 Club Approvals</h4>
            <p style="color:#666;">Review and approve new club applications</p>
            <button class="oca-btn" style="width:100%;margin-top:1rem; background: linear-gradient(135deg,#4caf50,#43e97b);" onclick="alert('Club approvals coming soon!')">Review Applications</button>
          </div>
          <div class="oca-card" style="box-shadow: 0 4px 20px rgba(79,184,250,0.08);">
            <h4 style="font-size:1.15rem; color:#ff9800;">📢 Announcements</h4>
            <p style="color:#666;">Send system-wide announcements and notifications</p>
            <button class="oca-btn" style="width:100%;margin-top:1rem; background: linear-gradient(135deg,#ff9800,#ffc107);" onclick="alert('Announcements coming soon!')">Send Announcements</button>
          </div>
          <div class="oca-card" style="box-shadow: 0 4px 20px rgba(79,184,250,0.08);">
            <h4 style="font-size:1.15rem; color:#673ab7;">🔎 Account Verification</h4>
            <p style="color:#666;">Verify pending user accounts</p>
            <button class="oca-btn" style="width:100%;margin-top:1rem; background: linear-gradient(135deg,#673ab7,#4fb8fa);" id="accountVerificationBtn">Account Verification</button>
          </div>
        </div>
      </div>
      <!-- Verification Modal -->
      <div id="verificationOverlay" class="verification-overlay">
        <div class="verification-modal">
          <button class="close-modal-btn right" onclick="closeVerification()" title="Close">❌</button>
          <h3>Pending Account Verification</h3>
          <table id="pendingUsersTable">
            <thead><tr></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Update welcome message for OCA
  document.querySelector(".welcome-section p").textContent =
    "Oversee the entire club management system and university activities.";

  // Set up table headers for filter icons and Approve column
  const theadRow = document.querySelector('#pendingUsersTable thead tr');
  if (theadRow) {
    const headers = ["User ID", "Name", "Email", "Phone", "Approve"];
    theadRow.innerHTML = headers.map((h, i) =>
      i === headers.length - 1
        ? `<th style='text-align:center;'>${h}</th>`
        : `<th>${h} <span class='filter-icon' title='Filter'>&#9776;</span></th>`
    ).join("");
  }

  // Add event listener for account verification button
  document.getElementById('accountVerificationBtn').addEventListener('click', async function() {
    document.getElementById('verificationOverlay').classList.add('show');
    const pending_users = await get_data({ sql: `SELECT * FROM user WHERE status = 'pending'` });
    const tbody = document.querySelector('#pendingUsersTable tbody');
    tbody.innerHTML = '';
    if (!pending_users || pending_users.length === 0) {
      tbody.innerHTML = `<tr><td colspan='5' style='text-align:center;color:#aaa;'>No pending users found.</td></tr>`;
    } else {
      pending_users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.uid}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td style='text-align:center;'>
            <button class='approve-btn' data-uid='${user.uid}'>Approve</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      // Add approve button logic
      tbody.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const uid = this.getAttribute('data-uid');
          // Update database
          await get_data({ sql: `UPDATE user SET status = 'active' WHERE uid = ?`, params: [uid] });
          // Change button to green and text to Approved
          this.outerHTML = `<span class='approved-label'>Approved</span>`;
        });
      });
    }
  });
}

// Logout function for OCA
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('current_user');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  }
}

// Close verification modal
function closeVerification() {
  document.getElementById('verificationOverlay').classList.remove('show');
}

// On page load, set welcome message dynamically for OCA
window.addEventListener('DOMContentLoaded', async () => {
  const current_user = localStorage.getItem('current_user');
  if (current_user) {
    const userData = await get_data({ sql: `SELECT name FROM user WHERE uid = ?`, params: [current_user] });
    if (userData && userData[0]) {
      document.getElementById('welcome-message').textContent = `Welcome, ${userData[0].name}!`;
    }
  } else {
    window.location.href = 'login.html';
  }
});
