// ================================== Variables ================================================================================
const club_positions = ['Member', 'Apprentice','Executive', 'Secretary','Director'];
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
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
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
          <div class="club-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
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
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div>
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
        <div class="club-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
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
          <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg></div>
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
          <div class="club-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></div>
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

// View all notifications
function viewAllNotifications() {
  alert("All notifications - Feature coming soon!");
}
