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

// Show Approvals tab with three buttons
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
          <h3>Approvals</h3>
        </div>
      </div>
      <div class="oca-content" style="display: flex; gap: 2rem;">
        <button class="oca-btn" id="roomApprovalBtn">Room Approval</button>
        <button class="oca-btn" id="billApprovalBtn">Bill Approval</button>
        <button class="oca-btn" id="requisitionHistoryBtn">Requisition History</button>
      </div>
      <div id="approval-tab-content" style="margin-top:2rem;"></div>
    </div>
  `;

  // Add event listeners for the buttons
  document.getElementById("roomApprovalBtn").onclick = showRoomApprovalWindow;
  document.getElementById("billApprovalBtn").onclick = showBillApprovalWindow;
  document.getElementById("requisitionHistoryBtn").onclick = showRequisitionHistory;
}

// Room Approval Window
async function showRoomApprovalWindow() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section room-approval-window' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeRoomApprovalBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Room Approval</h3>
    <div id='room-approval-table'></div>
    <div id='assign-room-modal' style='display:none;'></div>
  </div>`;
  document.getElementById('closeRoomApprovalBtn').onclick = function() {
    tabContent.innerHTML = "";
  };
  await loadRoomApprovalTable();
}

// Load Room Table
async function loadRoomApprovalTable() {
  const tableDiv = document.getElementById("room-approval-table");
  // Get room info and club (cid) from requisition table
  const rooms = await get_data({
    sql: `SELECT room.*, requisition.cid FROM room JOIN requisition ON room.rid = requisition.rid ORDER BY room.rid ASC`
  });
  if (!rooms || rooms.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No room requests found.</p>`;
    return;
  }
  let cardsHtml = `<div class='pending-applications' style='display:flex;flex-direction:column;gap:1.5rem;'>`;
  rooms.forEach(room => {
    let dateOnly = room.date_requested;
    if (typeof dateOnly === 'string' && dateOnly.includes('T')) {
      dateOnly = dateOnly.split('T')[0];
    }
    cardsHtml += `
      <div class='verification-card' style='display:flex;justify-content:space-between;align-items:flex-start;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:1.5rem;border-radius:12px;background:#fff;'>
        <div class='user-info'>
          <p><strong>RID:</strong> ${room.rid}</p>
          <p><strong>Club:</strong> ${room.cid}</p>
          <p><strong>Type:</strong> ${room.room_type}</p>
          <p><strong>Date:</strong> ${dateOnly}</p>
          <p><strong>Time:</strong> ${room.time_requested_from} - ${room.time_requested_to}</p>
        </div>
        <div class='verification-actions' style='display:flex;gap:0.5rem;align-items:center;'>`;
    // Fix: Only show Assign button if room_assigned is exactly the string 'Pending' (case-insensitive, trimmed)
    if (typeof room.room_assigned === "string" && room.room_assigned.trim().toLowerCase() === "pending") {
      cardsHtml += `<button class='assign-room-btn' data-rid='${room.rid}' style='background:#4fb8fa;color:#fff;border:none;border-radius:6px;font-weight:500;box-shadow:none;padding:8px 18px;cursor:pointer;'>Assign</button>`;
    } else {
      cardsHtml += `<span style='color:#10b981;font-weight:600;'>Assigned: ${room.room_assigned}</span>`;
    }
    cardsHtml += `
      </div>
    </div>
  `;
  });
  cardsHtml += `</div>`;
  tableDiv.innerHTML = cardsHtml;

  // Add event listeners for assign buttons
  document.querySelectorAll(".assign-room-btn").forEach(btn => {
    btn.onclick = function() {
      const rid = this.getAttribute("data-rid");
      showAssignRoomModal(rid);
    };
  });
}

// Show modal to assign room
function showAssignRoomModal(rid) {
  // Find the room info for the given rid
  const room = Array.from(document.querySelectorAll('.verification-card'))
    .map(card => {
      const ridText = card.querySelector('p').textContent;
      if (ridText.includes(rid)) {
        return {
          rid,
          club: card.querySelector('p:nth-child(2)').textContent.split(': ')[1],
          type: card.querySelector('p:nth-child(3)').textContent.split(': ')[1],
          date: card.querySelector('p:nth-child(4)').textContent.split(': ')[1],
          time: card.querySelector('p:nth-child(5)').textContent.split(': ')[1]
        };
      }
      return null;
    })
    .filter(Boolean)[0];

  const modalDiv = document.getElementById('assign-room-modal');
  window.scrollTo({ top: 0, behavior: 'auto' }); // Ensure modal is fully visible
  modalDiv.style.display = 'block';
  const approvalWindow = document.querySelector('.room-approval-window');
  if (approvalWindow) approvalWindow.style.overflow = 'hidden';
  if (approvalWindow) approvalWindow.scrollTop = 0; // Ensure approval window is scrolled to top
  modalDiv.innerHTML = `<div style='position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);z-index:9999;'>
    <div style='background:#fff;padding:2rem 2.5rem;border-radius:16px;box-shadow:0 8px 32px rgba(79,184,250,0.15);min-width:320px;max-width:90vw;position:relative;display:flex;flex-direction:column;align-items:center;'>
      <button id='closeAssignRoomModalBtn' style='position:absolute;top:12px;right:18px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;' title='Close'>&times;</button>
      <h3 style='margin-bottom:1.5rem;'>Assign Room</h3>
      <div style='margin-bottom:1.5rem;text-align:left;width:100%;'>
        <p><strong>RID:</strong> ${room.rid}</p>
        <p><strong>Club:</strong> ${room.club}</p>
        <p><strong>Type:</strong> ${room.type}</p>
        <p><strong>Date:</strong> ${room.date}</p>
        <p><strong>Time:</strong> ${room.time}</p>
      </div>
      <div style='margin-bottom:1.5rem;'>
        <input type='text' id='roomNumberInput' placeholder='Enter room number...' style='padding:0.5rem 1rem;border-radius:6px;border:1px solid #e0e0e0;width:220px;'>
      </div>
      <div style='display:flex;flex-direction:row;gap:1rem;width:100%;justify-content:center;'>
        <button id='confirmAssignRoomBtn' style='background:#4fb8fa;color:#fff;border:none;border-radius:6px;font-weight:500;box-shadow:none;padding:8px 18px;cursor:pointer;'>Confirm</button>
        <button id='cancelAssignRoomBtn' style='background:#ef4444;color:#fff;border:none;border-radius:6px;font-weight:500;padding:8px 18px;cursor:pointer;'>Cancel</button>
      </div>
    </div>
  </div>`;
  function restoreScroll() {
    if (approvalWindow) approvalWindow.style.overflow = 'auto';
  }
  document.getElementById('closeAssignRoomModalBtn').onclick = function() {
    modalDiv.style.display = 'none';
    modalDiv.innerHTML = '';
    restoreScroll();
  };
  document.getElementById('cancelAssignRoomBtn').onclick = function() {
    modalDiv.style.display = 'none';
    modalDiv.innerHTML = '';
    restoreScroll();
  };
  document.getElementById('confirmAssignRoomBtn').onclick = async function() {
    const roomNumber = document.getElementById('roomNumberInput').value.trim();
    if (!roomNumber) {
      alert('Please enter a room number.');
      return;
    }
    // Update room_assigned in room table
    await get_data({
      sql: `UPDATE room SET room_assigned = ? WHERE rid = ?`,
      params: [roomNumber, rid]
    });
    // Update status in requisition table
    await get_data({
      sql: `UPDATE requisition SET status = 'approved' WHERE rid = ?`,
      params: [rid]
    });
    modalDiv.style.display = 'none';
    modalDiv.innerHTML = '';
    restoreScroll();
    await loadRoomApprovalTable();
    alert('Room assigned and status updated.');
  };
}

// Bill Approval Window
async function showBillApprovalWindow() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section bill-approval-window' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeBillApprovalBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Bill Approval</h3>
    <div id='bill-approval-table'></div>
  </div>`;
  document.getElementById('closeBillApprovalBtn').onclick = function() {
    tabContent.innerHTML = "";
  };
  await loadBillApprovalTable();
}

// Load Bill Table
async function loadBillApprovalTable() {
  const tableDiv = document.getElementById("bill-approval-table");
  // Only show bills where requisition.status is 'pending'
  const bills = await get_data({
    sql: `SELECT bill.rid, bill.amount, requisition.cid, requisition.status FROM bill JOIN requisition ON bill.rid = requisition.rid WHERE LOWER(TRIM(requisition.status)) = 'pending' ORDER BY bill.rid ASC`
  });
  if (!bills || bills.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No pending bills found.</p>`;
    return;
  }
  let tableHtml = `<table style='width:100%;border-collapse:collapse;'>
    <thead>
      <tr style='background:#f3f4f6;'>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>RID</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Club</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Amount</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Download</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Action</th>
      </tr>
    </thead>
    <tbody>`;
  bills.forEach(bill => {
    tableHtml += `<tr>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${bill.rid}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${bill.cid}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${bill.amount}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'><button class='download-bill-btn' data-rid='${bill.rid}' style='background:#4fb8fa;color:#fff;border:none;border-radius:6px;font-weight:500;box-shadow:none;padding:8px 18px;cursor:pointer;'>Download PDF</button></td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>
        <button class='approve-bill-btn' data-rid='${bill.rid}' style='background:#10b981;color:#fff;border:none;border-radius:6px;font-weight:500;padding:6px 14px;cursor:pointer;margin-right:6px;'>Approve</button>
        <button class='reject-bill-btn' data-rid='${bill.rid}' style='background:#ef4444;color:#fff;border:none;border-radius:6px;font-weight:500;padding:6px 14px;cursor:pointer;'>Reject</button>
      </td>
    </tr>`;
  });
  tableHtml += `</tbody></table>`;
  tableDiv.innerHTML = tableHtml;

  // Add event listeners for download buttons
  document.querySelectorAll(".download-bill-btn").forEach(btn => {
    btn.onclick = function() {
      const rid = this.getAttribute("data-rid");
      window.location.href = `/bill/pdf/${rid}`;
    };
  });

  // Add event listeners for approve/reject buttons
  document.querySelectorAll(".approve-bill-btn").forEach(btn => {
    btn.onclick = async function() {
      const rid = this.getAttribute("data-rid");
      await get_data({
        sql: `UPDATE requisition SET status = 'approved' WHERE rid = ?`,
        params: [rid]
      });
      alert('Bill approved!');
      await loadBillApprovalTable();
    };
  });
  document.querySelectorAll(".reject-bill-btn").forEach(btn => {
    btn.onclick = async function() {
      const rid = this.getAttribute("data-rid");
      if (confirm('Are you sure you want to reject this bill?')) {
        await get_data({
          sql: `UPDATE requisition SET status = 'rejected' WHERE rid = ?`,
          params: [rid]
        });
        alert('Bill rejected!');
        await loadBillApprovalTable();
      }
    };
  });
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

// Show Requisition History
async function showRequisitionHistory() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeRequisitionHistoryBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Requisition History</h3>
    <div id='requisition-history-table'></div>
  </div>`;
  document.getElementById('closeRequisitionHistoryBtn').onclick = function() {
    tabContent.innerHTML = "";
  };
  await loadRequisitionHistoryTable();
}

// Load Requisition History Table
async function loadRequisitionHistoryTable() {
  const tableDiv = document.getElementById("requisition-history-table");
  const history = await get_data({
    sql: `SELECT room.rid, requisition.cid, room.room_type, room.date_requested, room.time_requested_from, room.time_requested_to, room.room_assigned, requisition.status FROM room JOIN requisition ON room.rid = requisition.rid WHERE LOWER(TRIM(room.room_assigned)) != 'pending' ORDER BY room.rid DESC`
  });
  if (!history || history.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No requisition history found.</p>`;
    return;
  }
  let tableHtml = `<table style='width:100%;border-collapse:collapse;'>
    <thead>
      <tr style='background:#f3f4f6;'>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>RID</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Club</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Type</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Date</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Time</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Room Assigned</th>
        <th style='padding:8px;border-bottom:1px solid #e5e7eb;'>Status</th>
      </tr>
    </thead>
    <tbody>`;
  history.forEach(row => {
    let dateOnly = row.date_requested;
    if (typeof dateOnly === 'string' && dateOnly.includes('T')) {
      dateOnly = dateOnly.split('T')[0];
    }
    tableHtml += `<tr>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.rid}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.cid}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.room_type}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${dateOnly}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.time_requested_from} - ${row.time_requested_to}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.room_assigned}</td>
      <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>${row.status}</td>
    </tr>`;
  });
  tableHtml += `</tbody></table>`;
  tableDiv.innerHTML = tableHtml;
}