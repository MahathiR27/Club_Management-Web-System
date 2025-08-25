async function send_email(email){
  const response = await fetch('/email', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email) // this is the body of req in main 
  });
  return await response.json();
};
// Function to fetch data from table (shared function)
async function get_data(query) {
  const response = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  return await response.json();
}

// Main function to setup OCA Dashboard
function setupOCADashboard(userId) {
  const dashboardContainer = document.querySelector('.student-dashboard');
  if (!dashboardContainer) {
    console.error('Dashboard container not found');
    return;
  }

  // Replace entire dashboard content with OCA-only sections
  dashboardContainer.innerHTML = `
    <div class="oca-dashboard">
      <!-- OCA Dashboard Section -->
      <div class="dashboard-section oca-dashboard-section">
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
            <h4>📋 Club Approvals</h4>
            <p>Review and approve new club applications</p>
            <button class="oca-btn" onclick="alert('Club approvals coming soon!')">Review Applications</button>
          </div>
          <div class="oca-card">
            <h4>📢 Announcements</h4>
            <p>Send system-wide announcements and notifications</p>
            <button class="oca-btn" onclick="alert('Announcements coming soon!')">Send Announcements</button>
          </div>
          <div class="oca-card">
            <h4>🔎 Account Verification</h4>
            <p>Review and verify pending user accounts</p>
            <button class="oca-btn" id="accountVerificationBtn">Verify Accounts</button>
          </div>
        </div>
      </div>
      
      <!-- Account Verification Modal -->
      <div id="verificationOverlay" class="verification-overlay">
        <div class="verification-modal">
          <button class="verification-close-btn" onclick="closeVerification()" title="Close">&times;</button>
          <h3>Pending Account Verifications</h3>
          <table id="pendingUsersTable">
            <thead><tr></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Update welcome message for OCA
  document.querySelector('.welcome-section p').textContent =
    'Oversee the entire club management system and university activities.';

  // Setup event handlers after DOM is created
  setupEventHandlers();
}

// Setup all event handlers for OCA dashboard
function setupEventHandlers() {
  // Modal close function
  window.closeVerification = function() {
    document.getElementById('verificationOverlay').classList.remove('show');
  };

  // Account Verification Modal logic
  const accountVerificationBtn = document.getElementById('accountVerificationBtn');
  if (accountVerificationBtn) {
    accountVerificationBtn.addEventListener('click', async function() {
      document.getElementById('verificationOverlay').classList.add('show');
      await loadPendingUsers();
    });
  }

  // Update table headers for filter icons
  const theadRow = document.querySelector('#pendingUsersTable thead tr');
  if (theadRow) {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Action'];
    theadRow.innerHTML = headers.map(h => `<th>${h} <span class='filter-icon' title='Filter'>&#9776;</span></th>`).join('');
  }
}

// Load pending users into the verification table
async function loadPendingUsers() {
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
        <td><button class="approve-btn" data-uid="${user.uid}">Approve</button></td>
      `;
      tbody.appendChild(row);
    });
    
    // Add event listeners for approve buttons
    tbody.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const uid = this.getAttribute('data-uid');
        // Update database - use 'active' status to match the database schema
        await get_data({ sql: `UPDATE user SET status = 'active' WHERE uid = ?`, params: [uid] });

        // Get user data for email
        const user_data = await get_data({ sql: `SELECT * FROM user WHERE uid = ?`, params: [uid] });
        const user = user_data[0]; // Get the first user object
        
        // Change button to green 'Approved'
        this.outerHTML = '<span class="approved-label">Approved</span>';
          
        await send_email({ receiver: user.email,subject: `Account Activated`,
          body: `Dear ${user.name},

Your account has been ACTIVATED. You can now access the dashboard.

Best regards,
OCA`});
      });
    });
  }
}

