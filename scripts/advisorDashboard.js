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
          <div class="section-icon">�<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
          <h3>Manage Club</h3>
        </div>
      </div>
      <div class="advisor-content" id="manage-club-content">
        <div class="advisor-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg> My Assigned Clubs</h4>
          <p>Manage and oversee your assigned clubs</p>
          <button class="advisor-btn" onclick="alert('Club management coming soon!')">View Clubs</button>
        </div>
        <div class="advisor-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg> Member Management</h4>
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
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M680-80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm67-105 28-28-75-75v-112h-40v128l87 87Zm-547 65q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v250q-18-13-38-22t-42-16v-212h-80v120H280v-120h-80v560h212q7 22 16 42t22 38H200Zm280-640q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/></svg> Pending Approvals</h4>
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
