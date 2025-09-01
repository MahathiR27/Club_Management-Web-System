// ============================== API Call Functions ===========================================================================
async function get_data(query) {
  // Fetch database func
  const response = await fetch("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  return await response.json();
}

async function upload(upload_pdf) {
  const response = await fetch('/upload_pdf', {
    method: 'POST',
    body: upload_pdf
  });
  return await response.json();
}
// =============================================================================================================================

// ================================== Variables ================================================================================
// Dashboard Access Roles
oca_access = ["oca"];
student_access = ["student"];
manage_club_access = ["oca", "student"];
current_semester = "Summer 2025";
let currentUserRole = null;
let currentUserId = null;
const club_positions = ['Member', 'Apprentice','Executive', 'Secretary','Director'];
const room_types = ['Classroom', 'Activity Room', 'Theatre', 'Auditorium'];
// =============================================================================================================================

// ============================== Main Dashboard loader ========================================================================
// Main page load howar sathe sathe, Dashboard er innitially sob load kora
window.addEventListener("DOMContentLoaded", async function () {
  const currentUser = localStorage.getItem("currentUser"); // Login korar time e local storage e UID store korsilam

  if (currentUser) {
    currentUserId = currentUser; // Store globally

    const userData = await get_data({
      sql: `SELECT name FROM user WHERE uid = ?`,
      params: [currentUser],
    });
    const username = userData[0].name;

    // Dashboard e sobar upore default "Welcome!" ke update kore
    document.getElementById(
      "welcome-message"
    ).textContent = `Welcome ${username}!`;

    // Top Right er user profile button load
    await loadUserProfile(currentUser);

    // Load all announcements
    await loadRecentAnnouncements();

    // UID theke or role ber kore then jayga moto dashboard e redirect
    await setupDashboardByRole(currentUser);
  } else {
    // localstorage e UID nai mane login kora nai, pathaye daw login page e
    window.location.href = "login.html";
  }
});

// Database er 3 ta table theke user er role ber korbo
async function setupDashboardByRole(userId) {
  const roleCheck = await get_data({
    sql: `SELECT 'student' as role, uid FROM student WHERE uid = ?
          UNION
          SELECT 'oca' as role, uid FROM oca WHERE uid = ?`,
    params: [userId, userId, userId],
  });

  const userRole = roleCheck[0].role;
  currentUserRole = userRole; // Store globally for reuse

  // Profile drop down e role dekhao
  document.getElementById("userRole").textContent = userRole.toUpperCase();

  // Setup sidebar and dashboard based on role
  setupSidebar(userRole, userId);

  if (oca_access.includes(userRole)) {
    await setupOCADashboard(userId);
  } else if (student_access.includes(userRole)) {
    await setupStudentDashboard(userId);
  }
}

// Load user profile information
async function loadUserProfile(userId) {
  // Get basic user data
  const userData = await get_data({
    sql: `SELECT name, uid, email FROM user WHERE uid = ?`,
    params: [userId],
  });

  const user = userData[0];
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userId").textContent = user.uid;
  document.getElementById("userEmail").textContent = user.email;
}
// =============================================================================================================================

// ============================= Buttons =======================================================================================
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const userMenu = document.querySelector(".user-menu");
  const dropdown = document.getElementById("userDropdown");

  if (!userMenu.contains(event.target)) {
    dropdown.classList.remove("show");
  }
});

// ============================= Side Bar =======================================================================================
// Setup sidebar based on user role
function setupSidebar(userRole, userId) {
  let sidebarHTML = "";

  if (oca_access.includes(userRole)) {
    sidebarHTML = `
      <button class="sidebar-btn active" onclick="showHomePage()">
        <span class="icon">
        <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" viewBox="0 -960 960 960" 
        width="24px" 
        fill="#6BB4F1">
        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/></svg></span>
        Home
      </button>
      <button class="sidebar-btn" onclick="showClubApproval()">
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Z"/></svg></span>
        Club Approval
      </button>
      <button class="sidebar-btn" onclick="showAnnouncements()">
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/></svg></span>
        Announcements
      </button>
      <button class="sidebar-btn" onclick="showAccountVerification()">
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4f1"><path d="m438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/></svg></span>
        Account Verification
      </button>
  `;
  } else if (student_access.includes(userRole)) {
    sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon"><svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" viewBox="0 -960 960 960" 
        width="24px" 
        fill="#6BB4F1">
        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/></svg></span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showMyClubs('${userId}')">
          <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg></span>
          My Clubs
        </button>
        <button class="sidebar-btn" onclick="showJoinClubs('${userId}')">
          <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></span>
          Join Clubs
        </button>
        <div id="manage-clubs-btn" style="display: none;">
          <button class="sidebar-btn" onclick="showManageClubs('${userId}')">
            <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6BB4F1"><path d="m640-120-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-29 72-24 143t48 135H80Zm600-80q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg></span>
            Manage Clubs
          </button>
        </div>
        `;
  }

  const sidebarContent = document.querySelector(".sidebar-content"); // class er vitore html insert korbe
  sidebarContent.innerHTML = sidebarHTML;

  show_manage_club(userRole, userId); // OCA,Student(P and VP) ke dekhabe only
}

// Check if student is a president of any club
async function show_manage_club(userRole, userId) {
  if (userRole == "student") {
    // Student hoile P and VP khali dkehte parbe
    const student_check = await get_data({
      sql: `SELECT cid FROM members WHERE student_uid = ? AND (position = 'President' or position = 'Vice President')`,
      params: [userId],
    });

    if (student_check.length > 0) {
      document.getElementById("manage-clubs-btn").style.display = "block";
    }
  } else if (manage_club_access.includes(userRole)) {
    // OCA direct access
    document.getElementById("manage-clubs-btn").style.display = "block";
  }
}

// Sidebar Clicks
function setActiveButton(clickedBtn) {
  // Sob side button er jeita jeita diplay korte silo off kore
  document.querySelectorAll(".sidebar-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Jeita click korsi oita only show korbe
  clickedBtn.classList.add("active");
}
//==============================================================================================================================

// ============================= Announcement ==================================================================================
// Load latest 3 announcements based on user role
async function loadRecentAnnouncements() {
  // Use global variables instead of querying database again
  const userRole = currentUserRole;
  const currentUser = currentUserId;

  let announcements = [];

  if (userRole === "oca") {
    // OCA can see all announcements
    announcements = await get_data({
      sql: `SELECT a.subject as subject, a.date_time as date, u.name as author 
            FROM announcement a LEFT JOIN user u ON a.uid = u.uid
            ORDER BY a.date_time DESC LIMIT 3`,
    });
  } else if (userRole === "student") {
    // Student can see announcements from OCA users and clubs they are members of
    announcements = await get_data({
      sql: `SELECT DISTINCT a.subject, a.date_time as date, u.name as author 
            FROM announcement a 
            LEFT JOIN user u ON a.uid = u.uid
            LEFT JOIN oca o ON u.uid = o.uid
            LEFT JOIN members m ON a.cid = m.cid AND m.student_uid = ?
            WHERE o.uid IS NOT NULL OR m.student_uid IS NOT NULL OR a.cid IS NULL
            ORDER BY a.date_time DESC LIMIT 3`,
      params: [currentUser],
    });
  };
  }

  if (announcements.length > 0) {
    val = announcements.map(
      (
        i // Map er karone, db theke jei data gula list er moddhe ashce, sob gula iterate hobe ar ei html template e boshbe
      ) =>
        `<div class="announcement-item">
        <div class="announcement-content">
          <h4>${i.subject}</h4>
          <small>Posted by ${i.author} on ${new Date(
          i.date
        ).toLocaleDateString()}</small> <!-- Time dekhte ektu jater korar jonne -->
        </div>
      </div>`
    );

    val = val.join(""); // As upore theke val ekta list hoye ashce, join kore puratake ekta string banaisi html er
  } else {
    val = '<p class="no-announcements">No recent announcements</p>';
  }

  const announcementsList = document.getElementById("announcements-list");
  announcementsList.innerHTML = val; // Announcement element er moddhe html insert korbe
}

// Sob announcement dekhar jnno
async function viewAllAnnouncements() {
  try {
    // Create modal HTML
    const modalHTML = `
      <div id="announcementsOverlay" class="announcements-overlay show">
        <div class="announcements-modal">
          <button class="announcements-close-btn" onclick="closeAllAnnouncements()" title="Close">&times;</button>
          <h3>All Announcements</h3>
          <div class="announcements-list-modal" id="all-announcements-list">
            <p>Loading announcements...</p>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Use global variables instead of querying database again
    const userRole = currentUserRole;
    const currentUser = currentUserId;

    let announcements = [];

    if (userRole === "oca") {
      // OCA can see all announcements
      announcements = await get_data({
        sql: `SELECT a.subject as title, a.body as content, a.date_time as date, u.name as author 
              FROM announcement a LEFT JOIN user u ON a.uid = u.uid
              ORDER BY a.date_time DESC`,
      });
    } else if (userRole === "student") {
      // Student can see announcements from OCA users and clubs they are members of
      announcements = await get_data({
        sql: `SELECT DISTINCT a.subject as title, a.body as content, a.date_time as date, u.name as author 
              FROM announcement a 
              LEFT JOIN user u ON a.uid = u.uid
              LEFT JOIN oca o ON u.uid = o.uid
              LEFT JOIN members m ON a.cid = m.cid AND m.student_uid = ?
              WHERE o.uid IS NOT NULL OR m.student_uid IS NOT NULL OR a.cid IS NULL
              ORDER BY a.date_time DESC`,
        params: [currentUser],
      });
    }

    const allAnnouncementsList = document.getElementById(
      "all-announcements-list"
    );

    if (announcements.length > 0) {
      allAnnouncementsList.innerHTML = announcements
        .map(
          (announcement) => `
        <div class="announcement-item">
          <div class="announcement-content">
            <h4>${announcement.title}</h4>
            <p>${announcement.content}</p>
            <small>Posted by: ${announcement.author || "System"} on ${new Date(
            announcement.date
          ).toLocaleDateString()}</small>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      allAnnouncementsList.innerHTML =
        '<p class="no-announcements">No announcements found</p>';
    }

    // Add event listeners for closing
    document
      .getElementById("announcementsOverlay")
      .addEventListener("click", function (e) {
        if (e.target === this) {
          closeAllAnnouncements();
        }
      });
  } catch (error) {
    console.error("Error loading all announcements:", error);
    const allAnnouncementsList = document.getElementById(
      "all-announcements-list"
    );
    if (allAnnouncementsList) {
      allAnnouncementsList.innerHTML =
        '<p class="error">Error loading announcements</p>';
    }
  }
}

// Close announcements modal
function closeAllAnnouncements() {
  const overlay = document.getElementById("announcementsOverlay");
  if (overlay) {
    overlay.remove();
  }
}

// Show home page - shows welcome message and announcements
function showHomePage() {
  const clickedBtn = event?.target || document.querySelector(".sidebar-btn"); // Button pressed or Takes the 1st button available in the class
  setActiveButton(clickedBtn); // Basically always home button ke by default active kore dibe

  document.querySelector(".welcome-section").style.display = "block"; // Welcome er class load korbe

  const announcementSection = document.getElementById("announcement-section");
  announcementSection.style.display = "block"; // Announcement er block visible korbe

  loadRecentAnnouncements();

  document.getElementById("dynamic-content").innerHTML = ""; // Side bar diye onno dynamic panel ase sob remove kore dibe
}
