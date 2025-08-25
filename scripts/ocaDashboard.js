// OCA Dashboard Functions

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
