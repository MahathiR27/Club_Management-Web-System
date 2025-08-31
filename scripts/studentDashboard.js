// ================================== Variables ================================================================================
const club_positions = ['Member', 'Executive', 'General Secretary'];
// =============================================================================================================================

// Setup dashboard for students
async function setupStudentDashboard(userId) {
  // Show home page by default (welcome + announcements)
  showHomePage();
}


//=============================================== My Clubs =======================================================================
// Show My Clubs content
async function showMyClubs(userId) {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn");
  setActiveButton(clickedBtn); 

  // Hide welcome message and announcements
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">🏛️</div>
          <h3>My Clubs</h3>
        </div>
      </div>
      <div class="clubs-list" id="joined-clubs-list">
        <!-- Joined clubs -->
      </div>
    </div>`;

  await loadJoinedClubs(userId);
}

// Kon Kon Club er member ber korbe
async function loadJoinedClubs(userId) {
  const joinedClubs = await get_data({
    sql: `SELECT c.*, m.* FROM club c JOIN members m ON c.cid = m.cid 
          WHERE m.student_uid = ?`,
    params: [userId]});

  if (joinedClubs.length > 0) {
    // Iterate through the clubs he has joined to make the list
    val = joinedClubs.map((i) => `
      <div class="club-card joined">
        <div class="club-info">
          <div class="club-icon">🏛️</div>
          <div class="club-details">
            <h4>${i.name}</h4>
            <p>Member since ${i.joining_sem}</p>
            <div class="club-stats">
              <span class="member-count">Active</span>
              <span class="category">${i.position || "General"}</span>
            </div>
          </div>
        </div>
        <button class="club-action-btn" onclick="viewClubDetails('${i.cid}')">View Details</button>
      </div>`);

    val = val.join("");

  } else {
    val = `<p class="no-announcements">You have't joined any club yet</p>`;
  }
  const joinedClubsList = document.getElementById("joined-clubs-list");
  joinedClubsList.style.display = "block"

  joinedClubsList.innerHTML = val
}
//==================================================================================================================================

//=============================================== Join Clubs =======================================================================
async function showJoinClubs(userId) {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn");
  setActiveButton(clickedBtn); 

  // Hide welcome message and announcements
  document.querySelector(".welcome-section").style.display = "none";
  document.getElementById("announcement-section").style.display = "none";

  const dynamicContent = document.getElementById("dynamic-content");
  dynamicContent.innerHTML = `
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">🔍</div>
          <h3>Join Clubs</h3>
        </div>
      </div>
      <div class="clubs-list" id="available-clubs-list">
        <!-- Available clubs-->
      </div>
    </div>`;

  await loadAvailableClubs(userId);
}

// Load clubs available to join
async function loadAvailableClubs(userId) {
  // Get clubs that user hasn't joined yet
  const available_clubs = await get_data({
    sql: `SELECT c.* FROM club c WHERE c.cid NOT IN (SELECT m.cid FROM members m WHERE m.student_uid = ?)`,
    params: [userId]});

  // Get user's applications status
  const applications = await get_data({
    sql: `SELECT cid, status FROM applied WHERE uid = ?`,
    params: [userId]});

  // Kon Kon Club e apply korse ar status ki store
  const application_map = {};
  applications.forEach((i) => {
    application_map[i.cid] = i.status;
  });

  const available_clubs_list = document.getElementById("available-clubs-list");
  
  val = available_clubs.map((i) => {
    const application_status = application_map[i.cid];
    let button_html = "";

    // Depending on application status button ar color set korar jonno
    if (application_status == "pending") {
      button_html = `<button class="applied-btn" disabled>Application Pending</button>`;
  
    } else {
      button_html = `<button class="apply-club-btn" onclick="apply_to_club(${userId},'${i.cid}')">Apply Now</button>`;
    }

    return `
    <div class="club-card available"> 
      <div class="club-info">
        <div class="club-icon">🏛️</div>
        <div class="club-details">
          <h4>${i.name}</h4>
          <p>${i.description || "To-do 11"}</p>
        </div>
      </div>
      ${button_html}
    </div>`;
  })

  val = val.join("");
  available_clubs_list.innerHTML = val
  
}

// Apply to join a club
async function apply_to_club(userId,clubId) {
  await get_data({
    sql: `INSERT INTO applied (uid, cid) VALUES (?, ?)`,
    params: [userId, clubId],});
    
  // auto refresh page
  await showJoinClubs(userId);
}

// View club details
function viewClubDetails(clubId) {
  alert(`Club details for ${clubId} - Feature coming soon!`);
}
//==============================================================================================================================

//============================================== Manage Clubs ==================================================================
// Show Manage Clubs content (for presidents only)
async function showManageClubs(userId) {
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
          <div class="section-icon">⚙️</div>
          <h3>Manage Clubs</h3>
        </div>
      </div>
      <div class="manage-clubs-content" id="manage-clubs-content">
        <!-- Manage clubs -->
      </div>
    </div>
  `;

  await loadManageClubsContent(userId);
}

// Load clubs that the user manages as president
async function loadManageClubsContent(userId) {
  const managed_clubs = await get_data({
    sql: `SELECT c.*, m.position FROM club c 
          JOIN members m ON c.cid = m.cid 
          WHERE m.student_uid = ? AND (m.position = 'President' or m.position = 'Vice President') `,
    params: [userId]});

  if (managed_clubs.length > 0) {
    val = managed_clubs.map((club) => `
      <div class="club-card manage">
        <div class="club-info">
          <div class="club-icon">🏛️</div>
          <div class="club-details">
            <h4>${club.name}</h4>
            <p>Position: ${club.position}</p>
          </div>
        </div>
        <div class="club-actions">
          <button class="club-action-btn" onclick="club_member_list('${club.cid}')">Member List</button>
          <button class="club-action-btn" onclick="club_member_approval('${club.cid}')">Member Apporval</button>
          <button class="club-action-btn" onclick="club_requisition('${club.cid}')">Requisition</button>
        </div>
      </div>
    `);
    val = val.join("");
  } else {
    val = '<p class="no-content">You are not a president of any clubs.</p>';
  }

  const managed_clubs_list = document.getElementById("manage-clubs-content");
  managed_clubs_list.innerHTML = val
}

// Manage club members (for presidents)
async function club_member_list(clubId) {
  // Get all members for this club
  const club_members = await get_data({
    sql: `SELECT m.*, u.name, u.email, u.phone, m.joining_sem
          FROM members m JOIN user u ON m.student_uid = u.uid 
          WHERE m.cid = ?
          ORDER BY m.student_uid `,
    params: [clubId],
  });

  // Creating the modal to add to page html karon we donot have the dynamic content er jayga as before
  const modalHTML = `
    <div id="club_member_list_panel" class="announcements-overlay show">
      <div class="announcements-modal">
        <button class="announcements-close-btn" onclick="close_club_member_list()" title="Close">&times;</button>
        <h3>${clubId} Club Members</h3>
        <div class="member-list" id="member-list" style="max-height: 900px; overflow-y: auto; padding-right: 10px;">
        </div>
      </div>
    </div>
  `;

  // Send to modal to html and make it visible
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  if (club_members.length > 0) {
    // Iterate through the members to make the list
    val = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Name</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">ID</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Email</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Phone</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Position</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Joining Semester</th>
            <th style="border: 1px solid; padding: 10px; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${club_members.map((i) => `
            <tr>
              <td style="border: 1px solid; padding: 8px;">${i.name}</td>
              <td style="border: 1px solid; padding: 8px;">${i.student_uid}</td>
              <td style="border: 1px solid; padding: 8px;">${i.email}</td>
              <td style="border: 1px solid; padding: 8px;">${i.phone}</td>
              <td style="border: 1px solid; padding: 8px;">${i.position}</td>
              <td style="border: 1px solid; padding: 8px;">${i.joining_sem}</td>
              <td style="border: 1px solid; padding: 8px; text-align: center;">
                ${(i.position === 'President' || i.position === 'Vice President') 
                  ? '<button class="approve-btn" disabled style="background-color: #ccc; cursor: not-allowed;">Edit</button>'
                  : `<button class="approve-btn" onclick="edit_member('${i.student_uid}')">Edit</button>`
                }
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
    
  } else {
    val = '<p class="no-content">No members found for this club.</p>';
  }

  const member_list = document.getElementById("member-list");
  member_list.innerHTML = val

  // Add event listener for closing
  document.getElementById("club_member_list_panel").addEventListener("click", function (e){
      if (e.target === this) {close_club_member_list()}
  });
}

// Club member approval (for presidents)
async function club_member_approval(clubId) {
  // Get pending applications for this club
  const pending_applications = await get_data({
    sql: `SELECT a.*, u.name, u.email, u.phone 
          FROM applied a JOIN user u ON a.uid = u.uid 
          WHERE a.cid = ? AND a.status = 'pending'`,
    params: [clubId],
  });

  // Creating the modal to add to page html karon we donot have the dynamic content er jayga as before
  const modalHTML = `
    <div id="club_member_approval_panel" class="announcements-overlay show">
      <div class="announcements-modal">
        <button class="announcements-close-btn" onclick="close_club_member_approval()" title="Close">&times;</button>
        <h3>Pending Member Applications</h3>
        <div class="member-approval-list" id="member-approval-list" style="max-height: 900px; overflow-y: auto; padding-right: 10px;">
        </div>
      </div>
    </div>
  `;

  // Send to modal to html and make it visible
  document.body.insertAdjacentHTML("beforeend", modalHTML);


  if (pending_applications.length > 0) {
    // Iterate through the clubs he has joined to make the list
    val = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Name</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">ID</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Email</th>
            <th style="border: 1px solid; padding: 10px; text-align: left;">Phone</th>
            <th style="border: 1px solid; padding: 10px; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${pending_applications.map((i) => `
            <tr>
              <td style="border: 1px solid; padding: 8px;">${i.name}</td>
              <td style="border: 1px solid; padding: 8px;">${i.uid}</td>
              <td style="border: 1px solid; padding: 8px;">${i.email}</td>
              <td style="border: 1px solid; padding: 8px;">${i.phone}</td>
              <td style="border: 1px solid; padding: 8px; text-align: center;">
                <button class="approve-btn" onclick="approve_application('${i.uid}', '${clubId}')">Approve</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
    
  } else {
    val = '<p class="no-content">No pending applications for this club.</p>';
  }

  const application_list = document.getElementById("member-approval-list");
  application_list.innerHTML = val

  // Add event listener for closing
  document.getElementById("club_member_approval_panel").addEventListener("click", function (e){
      if (e.target === this) {close_club_member_approval()}
  });
}


// Approve member application
async function approve_application(userId, clubId) {
  // Update application status to approved
  await get_data({
    sql: `UPDATE applied SET status = 'approved' WHERE uid = ? AND cid = ?`,
    params: [userId, clubId],
  });

  // Add member to the club
  await get_data({
    sql: `INSERT INTO members (student_uid, cid, position, joining_sem) VALUES (?, ?, ?, ?)`,
    params: [userId, clubId, 'Member', current_semester],
  });

  // Refresh the panels
  close_club_member_approval();
  club_member_approval(clubId);
}

// Edit member function
async function edit_member(member_uid) {
  // Get member details first
  const member_details = await get_data({
    sql: `SELECT m.*, u.name FROM members m JOIN user u ON m.student_uid = u.uid WHERE m.student_uid = ?`,
    params: [member_uid],
  });

  const member = member_details[0];

  // Creating the modal to add to page html karon we donot have the dynamic content er jayga as before
  const modalHTML = `
    <div id="edit_member_panel" class="announcements-overlay show">
      <div class="announcements-modal" style="width: 400px; max-width: 90vw;">
        <button class="announcements-close-btn" onclick="close_edit_member()" title="Close">&times;</button>
        <h3>Edit Member - ${member.name}</h3>
        <div class="edit-member-content" id="edit-member-content">
          <label style="display: block; margin-bottom: 8px;">Position:</label>
          <select id="member-position-dropdown" style="width: 100%; padding: 8px; margin-bottom: 20px;">
            ${club_positions.map(position => `
              <option value="${position}" ${position == member.position ? 'selected' : ''}>${position}</option>
            `).join('')}
          </select>
          <p style="text-align: center; margin-top: 20px;">
            <button class="approve-btn" onclick="confirm_edit_member('${member_uid}', '${member.cid}')">Confirm</button>
          </p>
        </div>
      </div>
    </div>
  `;

  // Send to modal to html and make it visible
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Add event listener for closing
  document.getElementById("edit_member_panel").addEventListener("click", function (e){
      if (e.target === this) {close_edit_member()}
  });
}

// Confirm edit member
async function confirm_edit_member(member_uid, club_id) {
  const new_position = document.getElementById("member-position-dropdown").value;
  
  // Update member position in database
  await get_data({
    sql: `UPDATE members SET position = ? WHERE student_uid = ? AND cid = ?`,
    params: [new_position, member_uid, club_id],
  });

  // Close the edit modal and refresh member list
  close_edit_member();
  close_club_member_list();
  club_member_list(club_id);
}

// Close member approval modal
function close_club_member_approval() {
  document.getElementById("club_member_approval_panel").remove()
}

// Close member list modal
function close_club_member_list() {
  document.getElementById("club_member_list_panel").remove()
}

// Close edit member modal
function close_edit_member() {
  document.getElementById("edit_member_panel").remove()
}

// Manage club requisition (for presidents)
function club_requisition(clubId) {
  alert(`Manage requisition for club ${clubId} - Feature coming soon!`);
}
//==============================================================================================================================

//==============================================================================================================================

// // Load recent announcements dynamically from backend
// async function loadAnnouncements() {
//   const announcementsList = document.getElementById("announcements-list");
//   if (!announcementsList) return;

//   try {
//     // Pull only top 3 via POST /query
//     const rows = await get_data({
//       sql: `
//         SELECT a.aid, a.\`type\`, a.subject, a.body, a.date_time, u.name AS author
//         FROM \`announcement\` a
//         JOIN \`user\` u ON a.uid = u.uid
//         ORDER BY a.date_time DESC
//         LIMIT 3
//       `,
//       params: [],
//     });

//     if (!rows || rows.length === 0) {
//       announcementsList.innerHTML = `
//         <div class="announcement-item">
//           <div class="announcement-content"><h4>No announcements yet</h4></div>
//         </div>`;
//     } else {
//       announcementsList.innerHTML = rows.map(renderAnnouncementItem).join("");
//     }

//     // Add/refresh the footer with the Show All button (using the existing .view-all-btn style)
//     // Avoid duplicates if the function runs again
//     const panel =
//       announcementsList.closest(".announcement-panel") ||
//       announcementsList.parentElement;
//     let footer = panel.querySelector(".announcements-footer");
//     if (!footer) {
//       footer = document.createElement("div");
//       footer.className = "announcements-footer";
//       panel.appendChild(footer);
//     }
//     footer.innerHTML = `<button class="view-all-btn" id="showAllAnnouncementsBtn">Show all</button>`;
//     document
//       .getElementById("showAllAnnouncementsBtn")
//       .addEventListener("click", openAnnouncementsModal);
//   } catch (err) {
//     console.error("Failed to load announcements:", err);
//   }
// }

// Helper to render one announcement card (used by both list & modal)
// function renderAnnouncementItem(a) {
//   const when = new Date(a.date_time);
//   return `
//     <div class="announcement-item">
//       <div class="announcement-icon">📢</div>
//       <div class="announcement-content">
//         <h4>${a.subject}</h4>
//         <p>${a.body}</p>
//         <span class="announcement-time">${when.toLocaleString()} &nbsp;•&nbsp; ${
//     a.author
//   }</span>
//       </div>
//     </div>`;
// }

// // Modal: fetch all announcements and show in overlay
// async function openAnnouncementsModal() {
//   // Create overlay container once if missing
//   let overlay = document.getElementById("announcementsOverlay");
//   if (!overlay) {
//     overlay = document.createElement("div");
//     overlay.id = "announcementsOverlay";
//     overlay.className = "announcements-overlay";
//     overlay.innerHTML = `
//       <div class="announcements-modal" role="dialog" aria-modal="true" aria-label="All announcements">
//         <button class="announcements-close-btn" title="Close">&times;</button>
//         <h3>All Announcements</h3>
//         <div id="announcementsModalList" class="announcements-list-modal"></div>
//       </div>`;
//     document.body.appendChild(overlay);

//     // Close interactions
//     overlay.addEventListener("click", (e) => {
//       if (e.target === overlay) overlay.classList.remove("show");
//     });
//     overlay
//       .querySelector(".announcements-close-btn")
//       .addEventListener("click", () => overlay.classList.remove("show"));
//     document.addEventListener("keydown", (e) => {
//       if (e.key === "Escape") overlay.classList.remove("show");
//     });
//   }

//   // Load every announcement (you can add LIMIT 100 if needed)
//   try {
//     const rows = await get_data({
//       sql: `
//         SELECT a.aid, a.\`type\`, a.subject, a.body, a.date_time, u.name AS author
//         FROM \`announcement\` a
//         JOIN \`user\` u ON a.uid = u.uid
//         ORDER BY a.date_time DESC
//       `,
//       params: [],
//     });

//     const container = document.getElementById("announcementsModalList");
//     container.innerHTML =
//       rows && rows.length
//         ? rows.map(renderAnnouncementItem).join("")
//         : `<div class="announcement-item"><div class="announcement-content"><h4>No announcements found</h4></div></div>`;

//     document.getElementById("announcementsOverlay").classList.add("show");
//   } catch (err) {
//     console.error("Failed to load all announcements:", err);
//   }
// }

// View all notifications
function viewAllNotifications() {
  alert("All notifications - Feature coming soon!");
}
