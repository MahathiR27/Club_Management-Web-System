// Advisor Dashboard Functions

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
