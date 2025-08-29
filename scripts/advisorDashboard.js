// Advisor Dashboa          <div class="section-icon">🏛️</div>d Functions

// Setup advisor dashboard
async function setupAdvisorDashboard(userId) {
  // Show home page by default (welcome + announcements)
  showHomePage();
}

// Show Manage Club content
async function showManageClub(userId) {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn");
  setActiveButton(clickedBtn);

  // Hide welcome message and announcements when navigating
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">�️</div>
          <h3>Manage Club</h3>
        </div>
      </div>
      <div class="advisor-content" id="manage-club-content">
        <div class="advisor-card">
          <h4>🏛️ My Assigned Clubs</h4>
          <p>Manage and oversee your assigned clubs</p>
          <button class="advisor-btn" onclick="alert('Club management coming soon!')">View Clubs</button>
        </div>
        <div class="advisor-card">
          <h4>👥 Member Management</h4>
          <p>Oversee club membership and member activities</p>
          <button class="advisor-btn" onclick="alert('Member management coming soon!')">Manage Members</button>
        </div>
        <div class="advisor-card">
          <h4>📊 Club Reports</h4>
          <p>View reports and analytics for your clubs</p>
          <button class="advisor-btn" onclick="alert('Club reports coming soon!')">View Reports</button>
        </div>
      </div>
    </div>
  `;
}

// Show Approve Activities content
async function showApproveActivities(userId) {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

  // Hide welcome message and announcements when navigating
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">✅</div>
          <h3>Approve Activities</h3>
        </div>
      </div>
      <div class="advisor-content" id="approve-activities-content">
        <div class="advisor-card">
          <h4>⏳ Pending Approvals</h4>
          <p>Review and approve club activities awaiting approval</p>
          <button class="advisor-btn" onclick="alert('Pending approvals coming soon!')">View Pending</button>
        </div>
        <div class="advisor-card">
          <h4>✅ Approved Activities</h4>
          <p>View previously approved club activities</p>
          <button class="advisor-btn" onclick="alert('Approved activities coming soon!')">View Approved</button>
        </div>
        <div class="advisor-card">
          <h4>❌ Rejected Activities</h4>
          <p>Review rejected activities and feedback</p>
          <button class="advisor-btn" onclick="alert('Rejected activities coming soon!')">View Rejected</button>
        </div>
      </div>
    </div>
  `;
}
