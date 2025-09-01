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
          <button class="oca-btn" onclick="create_system_announcement()">Create New</button>
        </div>
        <div class="oca-card">
          <h4><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg> Manage Announcements</h4>
          <p>View and manage existing announcements</p>
          <button class="oca-btn" onclick="alert('Manage announcements coming soon!')">Manage Existing</button>
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

// Create system-wide announcement (for OCA users)
async function create_system_announcement() {
  const currentUser = localStorage.getItem("currentUser");
  
  // Check if user is OCA
  const oca_check = await get_data({
    sql: `SELECT * FROM oca WHERE uid = ?`,
    params: [currentUser]
  });

  if (oca_check.length === 0) {
    alert("Only OCA members can create system-wide announcements!");
    return;
  }

  // For system announcements, we'll use a default page (you might want to create a system page)
  // For now, we'll use the first available page or create announcements without page association
  // Let's get the first page as a default system page
  const system_page = await get_data({
    sql: `SELECT pid FROM page LIMIT 1`
  });

  if (system_page.length === 0) {
    alert("No pages available for announcements!");
    return;
  }

  const pageId = system_page[0].pid;

  // Create announcement modal
  const modalHTML = `
    <div id="oca_announcement_panel" class="announcements-overlay show">
      <div class="announcements-modal" style="width: 600px; max-width: 90vw;">
        <button class="announcements-close-btn" onclick="close_oca_announcement()" title="Close">&times;</button>
        <h3>Create System Announcement</h3>
        <form id="oca-announcement-form" style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <label for="oca-ann-type" style="display: block; margin-bottom: 5px; font-weight: bold;">Type:</label>
            <select id="oca-ann-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="notice">Notice</option>
              <option value="event">Event</option>
              <option value="update">Update</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label for="oca-ann-subject" style="display: block; margin-bottom: 5px; font-weight: bold;">Subject:</label>
            <input type="text" id="oca-ann-subject" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Enter announcement subject" required>
          </div>
          <div style="margin-bottom: 20px;">
            <label for="oca-ann-body" style="display: block; margin-bottom: 5px; font-weight: bold;">Message:</label>
            <textarea id="oca-ann-body" rows="6" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Enter announcement message" required></textarea>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="oca-btn" onclick="close_oca_announcement()" style="background-color: #ccc;">Cancel</button>
            <button type="submit" class="oca-btn" style="background-color: #6BB4F1;">Create Announcement</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Handle form submission
  document.getElementById("oca-announcement-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const type = document.getElementById("oca-ann-type").value;
    const subject = document.getElementById("oca-ann-subject").value.trim();
    const body = document.getElementById("oca-ann-body").value.trim();

    if (!subject || !body) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      // Insert announcement into database
      await get_data({
        sql: `INSERT INTO announcement (type, subject, body, date_time, pid, uid) 
              VALUES (?, ?, ?, NOW(), ?, ?)`,
        params: [type, subject, body, pageId, currentUser]
      });

      close_oca_announcement();
      
      // Refresh announcements if on home page
      if (document.getElementById("announcements-list")) {
        loadRecentAnnouncements();
      }
      
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Error creating announcement. Please try again.");
    }
  });

  // Add event listener for closing by clicking outside
  document.getElementById("oca_announcement_panel").addEventListener("click", function(e) {
    if (e.target === this) {
      close_oca_announcement();
    }
  });
}

// Close OCA announcement modal
function close_oca_announcement() {
  const modal = document.getElementById("oca_announcement_panel");
  if (modal) {
    modal.remove();
  }
}

