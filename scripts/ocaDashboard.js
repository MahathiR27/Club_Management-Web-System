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

  // Hide welcome message for OCA
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
          <h3>All Clubs</h3>
        </div>
      </div>
      <div class="oca-content" id="all-clubs-content">
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg> Active Clubs</h4>
          <p>View and manage all active clubs in the system</p>
          <button class="oca-btn" onclick="alert('Active clubs management coming soon!')">View Active Clubs</button>
        </div>
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/></svg> Club Statistics</h4>
          <p>View comprehensive statistics about all clubs</p>
          <button class="oca-btn" onclick="alert('Club statistics coming soon!')">View Statistics</button>
        </div>
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg> Club Settings</h4>
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
  document.getElementById("announcement-section").style.display = "none";


  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Z"/></svg></div>
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
  document.getElementById("billApprovalBtn").onclick = function() {
    document.getElementById("approval-tab-content").innerHTML = `<div class='dashboard-section'>New window opened</div>`;
  };
  document.getElementById("requisitionHistoryBtn").onclick = function() {
    document.getElementById("approval-tab-content").innerHTML = `<div class='dashboard-section'>New window opened</div>`;
  };
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
        <div class='verification-actions' style='display:flex;gap:0.5rem;align-items:center;'>
          `;
    if (room.room_assigned === "Pending") {
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
  modalDiv.style.display = 'block';
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
  document.getElementById('closeAssignRoomModalBtn').onclick = function() {
    modalDiv.style.display = 'none';
    modalDiv.innerHTML = '';
  };
  document.getElementById('cancelAssignRoomBtn').onclick = function() {
    modalDiv.style.display = 'none';
    modalDiv.innerHTML = '';
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
    await loadRoomApprovalTable();
    alert('Room assigned and status updated.');
  };
}

// Show Announcements content
async function showAnnouncements() {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

  // Hide welcome message for OCA
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/></svg></div>
          <h3>Announcements</h3>
        </div>
      </div>
      <div class="oca-content" id="announcements-content">
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg> Create Announcement</h4>
          <p>Send system-wide announcements and notifications</p>
          <button class="oca-btn" onclick="alert('Create announcement coming soon!')">Create New</button>
        </div>
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg> Manage Announcements</h4>
          <p>View and manage existing announcements</p>
          <button class="oca-btn" onclick="alert('Manage announcements coming soon!')">Manage Existing</button>
        </div>
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/></svg> Announcement Analytics</h4>
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
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M680-80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm67-105 28-28-75-75v-112h-40v128l87 87Zm-547 65q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v250q-18-13-38-22t-42-16v-212h-80v120H280v-120h-80v560h212q7 22 16 42t22 38H200Zm280-640q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/></svg></div>
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
    // alert("User approved successfully!");
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
