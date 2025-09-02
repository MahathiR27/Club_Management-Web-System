//============================================== Api Calls ===================================================================
async function send_email(email) {
  const response = await fetch("/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email),
  });
  return await response.json();
}

async function get_data(query) {
  const response = await fetch("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  return await response.json();
}
//============================================================================================================================

async function setupOCADashboard(userId) {
  showHomePage();
}

//================================================ Club Approval =================================================================
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
//============================================================================================================================

//========================================= room ===========================================================================
async function showRoomApprovalWindow() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section room-approval-window' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeRoomApprovalBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Room Approval</h3>
    <div id='room-approval-table'></div>
    <div id='assign-room-modal' style='display:none;'></div>
  </div>`;
  document.getElementById("closeRoomApprovalBtn").onclick = function () {tabContent.innerHTML = "";};
  await loadRoomApprovalTable();
}

async function loadRoomApprovalTable() {
  const tableDiv = document.getElementById("room-approval-table");

  // Store rooms data globally so showAssignRoomModal can access it
  window.rooms = await get_data({
    sql: `SELECT room.*, requisition.cid, requisition.status 
          FROM requisition 
          JOIN room ON requisition.rid = room.rid 
          WHERE requisition.status = 'pending' 
          ORDER BY room.rid ASC`});
  
  if (window.rooms.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No pending room requests found.</p>`;
    return;
  }

  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid; padding: 10px; text-align: left;">RID</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Club</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Type</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Date</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Time</th>
          <th style="border: 1px solid; padding: 10px; text-align: center;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${window.rooms
          .map(
            (room) => `
          <tr>
            <td style="border: 1px solid; padding: 8px;">${room.rid}</td>
            <td style="border: 1px solid; padding: 8px;">${room.cid}</td>
            <td style="border: 1px solid; padding: 8px;">${room.room_type}</td>
            <td style="border: 1px solid; padding: 8px;">${new Date(room.date_requested).toLocaleDateString()}</td>
            <td style="border: 1px solid; padding: 8px;">${room.time_requested_from} - ${room.time_requested_to}</td>
            <td style="border: 1px solid; padding: 8px; text-align: center;">
              <button class='assign-room-btn' data-rid='${room.rid}' style='background:#4fb8fa;color:#fff;border:none;border-radius:6px;font-weight:500;box-shadow:none;padding:8px 18px;cursor:pointer;margin-right:6px;'>Assign</button>
              <button class='reject-room-btn' data-rid='${room.rid}' style='background:#ef4444;color:#fff;border:none;border-radius:6px;font-weight:500;padding:8px 18px;cursor:pointer;'>Reject</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>`;
  tableDiv.innerHTML = tableHtml;

  // Room assign korar jonn window pop up
  document.querySelectorAll(".assign-room-btn").forEach((btn) => {
    btn.onclick = function () {
      const rid = this.getAttribute("data-rid");
      showAssignRoomModal(rid);
    };
  });

  // Reject button
  document.querySelectorAll(".reject-room-btn").forEach((btn) => {
    btn.onclick = async function () {
      const rid = this.getAttribute("data-rid");
      await get_data({sql: `UPDATE requisition SET status = 'rejected' WHERE rid = ?`,params: [rid],});
      await loadRoomApprovalTable();
    };
  });
}

function showAssignRoomModal(rid) {
  // Get room data directly from stored rooms data
  const room = window.rooms.find(r => r.rid == rid);
  if (!room) return;

  const modalDiv = document.getElementById("assign-room-modal");
  window.scrollTo({ top: 0, behavior: "auto" });
  modalDiv.style.display = "block";
  const approvalWindow = document.querySelector(".room-approval-window");
  if (approvalWindow) {
    approvalWindow.style.overflow = "hidden";
    approvalWindow.scrollTop = 0;
  }
  
  modalDiv.innerHTML = `<div style='position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);z-index:9999;'>
    <div style='background:#fff;padding:2rem 2.5rem;border-radius:16px;box-shadow:0 8px 32px rgba(79,184,250,0.15);min-width:320px;max-width:90vw;position:relative;display:flex;flex-direction:column;align-items:center;'>
      <button id='closeAssignRoomModalBtn' style='position:absolute;top:12px;right:18px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;' title='Close'>&times;</button>
      <h3 style='margin-bottom:1.5rem;'>Assign Room</h3>
      <div style='margin-bottom:1.5rem;text-align:left;width:100%;'>
        <p><strong>RID:</strong> ${room.rid}</p>
        <p><strong>Club:</strong> ${room.cid}</p>
        <p><strong>Type:</strong> ${room.room_type}</p>
        <p><strong>Date:</strong> ${new Date(room.date_requested).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${room.time_requested_from} - ${room.time_requested_to}</p>
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
      if (approvalWindow) approvalWindow.style.overflow = "auto";
    }
    
  document.getElementById("closeAssignRoomModalBtn").onclick = function () {modalDiv.style.display = "none";modalDiv.innerHTML = "";
    restoreScroll();
  };
  
  document.getElementById("cancelAssignRoomBtn").onclick = function () {
    modalDiv.style.display = "none";
    modalDiv.innerHTML = "";
    restoreScroll();
  };
  
  document.getElementById("confirmAssignRoomBtn").onclick = async function () {
    const roomNumber = document.getElementById("roomNumberInput").value.trim();

    await get_data({
      sql: `UPDATE room SET room_assigned = ? WHERE rid = ?`,
      params: [roomNumber, rid],
    });

    await get_data({
      sql: `UPDATE requisition SET status = 'approved' WHERE rid = ?`,
      params: [rid],
    });

    modalDiv.style.display = "none";
    modalDiv.innerHTML = "";
    restoreScroll();
    await loadRoomApprovalTable();

// EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
const club_data = await get_data({sql: `SELECT c.email as email, c.name as name FROM requisition r JOIN club c ON r.cid = c.cid WHERE r.rid = ?`,params: [rid]});
const club = club_data[0];
await send_email({
receiver: club.email,
subject: `Room Approval Notification`,
body: `Dear ${club.name} Team,

Your room request (RID: ${rid}) has been approved. Assigned room: ${roomNumber}

Best regards,
OCA`});
// EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

  };
}
//============================================================================================================================

//================================== BILL =============================================================================
async function showBillApprovalWindow() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section bill-approval-window' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeBillApprovalBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Bill Approval</h3>
    <div id='bill-approval-table'></div>
  </div>`;
  document.getElementById("closeBillApprovalBtn").onclick = function () {
    tabContent.innerHTML = "";
  };
  await loadBillApprovalTable();
}

async function loadBillApprovalTable() {
  const tableDiv = document.getElementById("bill-approval-table");

  const bills = await get_data({
    sql: `SELECT bill.rid, bill.amount, bill.documents, requisition.cid FROM bill 
          JOIN requisition ON bill.rid = requisition.rid 
          WHERE requisition.status = 'pending' ORDER BY bill.rid ASC`,
  });

  if (bills.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No pending bills found.</p>`;
    return;
  }
  
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid; padding: 10px; text-align: left;">RID</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Club</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Amount</th>
          <th style="border: 1px solid; padding: 10px; text-align: center;">Download</th>
          <th style="border: 1px solid; padding: 10px; text-align: center;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${bills
          .map(
            (bill) => `
          <tr>
            <td style="border: 1px solid; padding: 8px;">${bill.rid}</td>
            <td style="border: 1px solid; padding: 8px;">${bill.cid}</td>
            <td style="border: 1px solid; padding: 8px;">${bill.amount}</td>
            <td style="border: 1px solid; padding: 8px; text-align: center;">
              <button class='download-bill-btn' file_path='${bill.documents}' style='background:#4fb8fa;color:#fff;border:none;border-radius:6px;font-weight:500;box-shadow:none;padding:8px 18px;cursor:pointer;'>Download PDF</button>
            </td>
            <td style="border: 1px solid; padding: 8px; text-align: center;">
              <button class='approve-bill-btn' data-rid='${bill.rid}' style='background:#10b981;color:#fff;border:none;border-radius:6px;font-weight:500;padding:6px 14px;cursor:pointer;margin-right:6px;'>Approve</button>
              <button class='reject-bill-btn' data-rid='${bill.rid}' style='background:#ef4444;color:#fff;border:none;border-radius:6px;font-weight:500;padding:6px 14px;cursor:pointer;'>Reject</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>`;
  tableDiv.innerHTML = tableHtml;

  // Add event listeners for download buttons
  document.querySelectorAll(".download-bill-btn").forEach((btn) => {
    btn.onclick = function () {
      const path = this.getAttribute("file_path");
      window.location.href = `/${path}`;
    };
  });

  // Add event listeners for approve/reject buttons
  document.querySelectorAll(".approve-bill-btn").forEach((btn) => {
    btn.onclick = async function () {
      const rid = this.getAttribute("data-rid");
      await get_data({
        sql: `UPDATE requisition SET status = 'approved' WHERE rid = ?`,
        params: [rid],
      });
      await loadBillApprovalTable();
// EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
const club_data = await get_data({sql: `SELECT c.email as email, c.name as name FROM requisition r JOIN club c ON r.cid = c.cid WHERE r.rid = ?`,params: [rid]});
const club = club_data[0];
await send_email({
receiver: club.email,
subject: `Bill Approval Notification`,
body: `Dear ${club.name} Team,

Your bill (RID: ${rid}) has been approved.

Best regards,
OCA`});
// EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

    };
  });
  document.querySelectorAll(".reject-bill-btn").forEach((btn) => {
    btn.onclick = async function () {
      const rid = this.getAttribute("data-rid");
      await get_data({
        sql: `UPDATE requisition SET status = 'rejected' WHERE rid = ?`,
        params: [rid],
      });
      await loadBillApprovalTable();
      // EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
const club_data = await get_data({sql: `SELECT c.email as email, c.name as name FROM requisition r JOIN club c ON r.cid = c.cid WHERE r.rid = ?`,params: [rid]});
const club = club_data[0];
await send_email({
receiver: club.email,
subject: `Bill Approval Notification`,
body: `Dear ${club.name} Team,

Your bill (RID: ${rid}) has been rejected.

Best regards,
OCA`});
// EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

    };
  });
}
//============================================================================================================================

//================================================== requisition history ============================================================
// Show Requisition History
async function showRequisitionHistory() {
  const tabContent = document.getElementById("approval-tab-content");
  tabContent.innerHTML = `<div class='dashboard-section' style='max-width:900px; min-width:350px; margin:auto; border-radius:16px; box-shadow:0 4px 24px rgba(79,184,250,0.12); padding:2.5rem 2rem; position:relative; height:70vh; overflow-y:auto;'>
    <button id='closeRequisitionHistoryBtn' style='position:absolute;top:18px;right:22px;background:transparent;border:none;font-size:2rem;line-height:1;color:#9ca3af;cursor:pointer;z-index:2;' title='Close'>&times;</button>
    <h3 style='margin-bottom:2rem;'>Requisition History</h3>
    <div id='requisition-history-table'></div>
  </div>`;
  document.getElementById("closeRequisitionHistoryBtn").onclick = function () {
    tabContent.innerHTML = "";
  };
  await loadRequisitionHistoryTable();
}

// Load Requisition History Table
async function loadRequisitionHistoryTable() {
  const tableDiv = document.getElementById("requisition-history-table");
  // Show all requisitions that are not pending
  const history = await get_data({
    sql: `SELECT rid, cid, date_time, status FROM requisition WHERE status != 'pending' ORDER BY rid DESC`,
  });
  if (!history || history.length === 0) {
    tableDiv.innerHTML = `<p style='text-align:center;color:#aaa;'>No requisition history found.</p>`;
    return;
  }
  
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid; padding: 10px; text-align: left;">RID</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Club ID</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Date Created</th>
          <th style="border: 1px solid; padding: 10px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${history
          .map(
            (row) => {
              let dateCreated = row.date_time;
              if (typeof dateCreated === "string" && dateCreated.includes("T")) {
                dateCreated = dateCreated.split("T")[0];
              }
              
              return `
              <tr>
                <td style="border: 1px solid; padding: 8px;">${row.rid}</td>
                <td style="border: 1px solid; padding: 8px;">${row.cid}</td>
                <td style="border: 1px solid; padding: 8px;">${dateCreated}</td>
                <td style="border: 1px solid; padding: 8px;">${row.status}</td>
              </tr>
            `;
            }
          )
          .join("")}
      </tbody>
    </table>`;
  tableDiv.innerHTML = tableHtml;
}
//=======================================================================================================================

//======================================= Announcement ===================================================================
async function showAnnouncements() {
  const clickedBtn = event?.target;
  setActiveButton(clickedBtn);

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
          <button class="oca-btn" onclick="showManageAnnouncementsModal()">Manage Existing</button>
        </div>
      </div>
    </div>
  `;
}
//============================================================================================================================

//================================================= account verification ================================================================
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


async function loadPendingVerifications() {
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
}

// Approve user account
async function approveUser(userId) {
    await get_data({
      sql: `UPDATE user SET status = 'active' WHERE uid = ?`,
      params: [userId],
    });
    await loadPendingVerifications(); // Refresh the list
const user_data = await get_data({ sql: `SELECT * FROM user WHERE uid = ?`,params: [userId],});
    const user = user_data[0];
    await send_email({
      receiver: user.email,
      subject: `Account Activated`,
      body: `Dear ${user.name},

Your account has been ACTIVATED. You can now access the dashboard.

Best regards,
OCA`,
});
}

// Reject user account
async function rejectUser(userId) {
  const user = user_data[0];
  
  await get_data({
    sql: `UPDATE user SET status = 'rejected' WHERE uid = ?`,
    params: [userId],
  });

  const user_data = await get_data({ sql: `SELECT * FROM user WHERE uid = ?`,params: [userId]});

  await send_email({
    receiver: user.email,
    subject: `Account Application Rejected`,
    body: `Dear ${user.name},

Your account application has been rejected.

Best regards,
OCA`,
});
  
  await loadPendingVerifications(); // Refresh the list
}
//============================================================================================================================

// Create system-wide announcement (for OCA users)
async function create_system_announcement() {
  const currentUser = localStorage.getItem("currentUser");

  // Create announcement modal
  const modalHTML = `
    <div id="oca_announcement_panel" class="announcements-overlay show">
      <div class="announcements-modal" style="width: 600px; max-width: 90vw;">
        <button class="announcements-close-btn" onclick="close_oca_announcement()" title="Close">&times;</button>
        <h3>Create System Announcement</h3>
        <div id="announcement-warning" style="display: none; background: #fee; border: 1px solid #fcc; color: #c66; padding: 10px; margin: 10px 20px; border-radius: 4px;"></div>
        <form id="oca-announcement-form" style="padding: 20px;">
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
  document
    .getElementById("oca-announcement-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const subject = document.getElementById("oca-ann-subject").value.trim();
      const body = document.getElementById("oca-ann-body").value.trim();
      const warningDiv = document.getElementById("announcement-warning");

      if (!subject || !body) {
        warningDiv.textContent = "Please fill in all fields!";
        warningDiv.style.display = "block";
        return;
      }

      // Hide warning if fields are filled
      warningDiv.style.display = "none";

      try {
        // Insert announcement into database
        await get_data({
          sql: `INSERT INTO announcement (subject, body, date_time, cid, uid) 
              VALUES (?, ?, NOW(), ?, ?)`,
          params: [subject, body, null, currentUser],
        });

        close_oca_announcement();

        // Refresh announcements if on home page
        if (document.getElementById("announcements-list")) {
          loadRecentAnnouncements();
        }
      } catch (error) {
        console.error("Error creating announcement:", error);
        const warningDiv = document.getElementById("announcement-warning");
        warningDiv.textContent = "Error creating announcement. Please try again.";
        warningDiv.style.display = "block";
      }
    });

  // Add event listener for closing by clicking outside
  document
    .getElementById("oca_announcement_panel")
    .addEventListener("click", function (e) {
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

// Show manage announcements modal
async function showManageAnnouncementsModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="manage_announcements_panel" class="announcements-overlay show">
      <div class="announcements-modal" style="width: 800px; max-width: 95vw; max-height: 90vh; overflow-y: auto;">
        <button class="announcements-close-btn" onclick="closeManageAnnouncementsModal()" title="Close">&times;</button>
        <h3>Manage Announcements</h3>
        <div id="announcements-list-container" style="padding: 20px;">
          <div id="loading-announcements" style="text-align: center; padding: 20px;">
            Loading announcements...
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Load announcements
  await loadAllAnnouncements();

  // Add event listener for closing by clicking outside
  document
    .getElementById("manage_announcements_panel")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeManageAnnouncementsModal();
      }
    });
}

// Load all announcements for management
async function loadAllAnnouncements() {
  const announcements = await get_data({
    sql: `SELECT a.aid, a.subject, a.body, a.date_time, a.cid, u.name as author_name
          FROM announcement a 
          JOIN user u ON a.uid = u.uid
          ORDER BY a.date_time DESC`,
  });

  const container = document.getElementById("announcements-list-container");

  if (!announcements || announcements.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #aaa;">No announcements found.</p>`;
    return;
  }

  let announcementsHTML = `<div class="announcements-grid" style="display: flex; flex-direction: column; gap: 15px;">`;

  announcements.forEach((announcement) => {
    const dateTime = new Date(announcement.date_time).toLocaleString();
    const clubInfo = announcement.cid
      ? `Club: ${announcement.cid}`
      : "System-wide";

    announcementsHTML += `
      <div class="announcement-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 15px; margin-bottom: 8px;">
              <span style="color: #666; font-size: 12px;">${clubInfo}</span>
              <span style="color: #666; font-size: 12px;">${dateTime}</span>
            </div>
            <h4 style="margin: 0 0 8px 0; color: #333;">${announcement.subject}</h4>
            <p style="margin: 0 0 8px 0; color: #666; line-height: 1.4;">${announcement.body}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">By: ${announcement.author_name}</p>
          </div>
          <button class="delete-announcement-btn" data-aid="${announcement.aid}" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; margin-left: 15px; font-size: 12px;">Delete</button>
        </div>
      </div>
    `;
  });

  announcementsHTML += `</div>`;
  container.innerHTML = announcementsHTML;

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-announcement-btn").forEach((btn) => {
    btn.onclick = async function () {
      const aid = this.getAttribute("data-aid");
      await deleteAnnouncement(aid);
    };
  });
}

// Delete announcement function
async function deleteAnnouncement(aid) {
  await get_data({
    sql: `DELETE FROM announcement WHERE aid = ?`,
    params: [aid],
  });
  // Reload the announcements list
  await loadAllAnnouncements();

  // Refresh announcements on home page if visible
  if (document.getElementById("announcements-list")) {
    loadRecentAnnouncements();
  }
}

// Close manage announcements modal
function closeManageAnnouncementsModal() {
  const modal = document.getElementById("manage_announcements_panel");
  if (modal) {
    modal.remove();
  }
}
