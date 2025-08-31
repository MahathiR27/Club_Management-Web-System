// ============================== API Call Functions ===========================================================================
async function get_data(query) { // Fetch database func
  const response = await fetch("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  return await response.json();
}
// =============================================================================================================================

// ================================== Variables ================================================================================
// Dashboard Access Roles
oca_access = ['oca']
student_access = ['student']
advisor_access = ['advisor']
manage_club_access = ['oca','student','advisor']
// =============================================================================================================================

// ============================== Main Dashboard loader ========================================================================
// Main page load howar sathe sathe, Dashboard er innitially sob load kora
window.addEventListener("DOMContentLoaded", async function () {
  const currentUser = localStorage.getItem("currentUser"); // Login korar time e local storage e UID store korsilam

  if (currentUser) {
    const userData = await get_data({sql: `SELECT name FROM user WHERE uid = ?`, params: [currentUser],});
    const username = userData[0].name;

    // Dashboard e sobar upore default "Welcome!" ke update kore
    document.getElementById("welcome-message").textContent = `Welcome ${username}!`; 

    // Top Right er user profile button load
    await loadUserProfile(currentUser);

    // Load all announcements
    await loadRecentAnnouncements();

    // UID theke or role ber kore then jayga moto dashboard e redirect
    await setupDashboardByRole(currentUser); 
  } 
  
  else { // localstorage e UID nai mane login kora nai, pathaye daw login page e
    window.location.href = "login.html";
  }
});

// Database er 3 ta table theke user er role ber korbo
async function setupDashboardByRole(userId) {
  const roleCheck = await get_data({sql: `SELECT 'student' as role, uid FROM student WHERE uid = ?
                                          UNION
                                          SELECT 'advisor' as role, uid FROM advisor WHERE uid = ?  
                                          UNION
                                          SELECT 'oca' as role, uid FROM oca WHERE uid = ?`,
                                    params: [userId, userId, userId],});

  const userRole = roleCheck[0].role;

  // Profile drop down e role dekhao
  document.getElementById("userRole").textContent = userRole.toUpperCase();

  // Setup sidebar and dashboard based on role
  setupSidebar(userRole, userId);

  if (oca_access.include(userId)){await setupOCADashboard(userId);}
  else if (student_access.include(userId)){await setupStudentDashboard(userId);}
  else if (advisor_access.include(userId)){await setupAdvisorDashboard(userId);};
}

// Load user profile information
async function loadUserProfile(userId) {
    // Get basic user data
    const userData = await get_data({sql: `SELECT name, uid, email FROM user WHERE uid = ?`, params: [userId]});

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

  if (oca_access.includes(userRole)){
    sidebarHTML = `
      <button class="sidebar-btn active" onclick="showHomePage()">
        <span class="icon">🏠</span>
        Home
      </button>
      <button class="sidebar-btn" onclick="showAllClubs()">
        <span class="icon">🏢</span>
        All Clubs
      </button>
      <button class="sidebar-btn" onclick="showClubApproval()">
        <span class="icon">📋</span>
        Club Approval
      </button>
      <button class="sidebar-btn" onclick="showAnnouncements()">
        <span class="icon">📢</span>
        Announcements
      </button>
      <button class="sidebar-btn" onclick="showAccountVerification()">
        <span class="icon">👤</span>
        Account Verification
      </button>
  `;}
  
  else if (student_access.includes(userRole)){
      sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon">🏠</span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showMyClubs('${userId}')">
          <span class="icon">🏛️</span>
          My Clubs
        </button>
        <button class="sidebar-btn" onclick="showJoinClubs('${userId}')">
          <span class="icon">➕</span>
          Join Clubs
        </button>
        <div id="manage-clubs-btn" style="display: none;">
          <button class="sidebar-btn" onclick="showManageClubs('${userId}')">
            <span class="icon">⚙️</span>
            Manage Clubs
          </button>
        </div>
        `;}

  else if (advisor_access.includes(userRole)){      
      sidebarHTML = `
        <button class="sidebar-btn active" onclick="showHomePage()">
          <span class="icon">🏠</span>
          Home
        </button>
        <button class="sidebar-btn" onclick="showManageClub('${userId}')">
          <span class="icon">🏛️</span>
          Manage Club
        </button>
        <button class="sidebar-btn" onclick="showApproveActivities('${userId}')">
          <span class="icon">✅</span>
          Approve Activities
        </button>
      `;};

  const sidebarContent = document.querySelector(".sidebar-content"); // class er vitore html insert korbe
  sidebarContent.innerHTML = sidebarHTML;

  show_manage_club(userRole,userId) // OCA, Advisor, Student(P and VP) ke dekhabe only
}

// Check if student is a president of any club
async function show_manage_club(userRole,userId) {
  if (userRole == "student"){ // Student hoile P and VP khali dkehte parbe
    const student_check = await get_data({
      sql: `SELECT cid FROM members WHERE student_uid = ? AND (position = 'President' or position = 'Vice President')`, 
      params: [userId]});

    if (student_check.length > 0) {
      document.getElementById("manage-clubs-btn").style.display = "block";
    }
  }
  else if (manage_club_access.includes(userRole)){ // OCA ar Advisor direct access
    document.getElementById("manage-clubs-btn").style.display = "block";
  };
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
// Load latest 3 announcements
async function loadRecentAnnouncements() {
  const announcements = await get_data({
    sql: `SELECT a.subject as subject, a.date_time as date, u.name as author 
          FROM announcement a LEFT JOIN user u ON a.uid = u.uid
          ORDER BY a.date_time DESC LIMIT 3`});

  if (announcements.length > 0) {
    val = announcements.map((i) => // Map er karone, db theke jei data gula list er moddhe ashce, sob gula iterate hobe ar ei html template e boshbe  
      `<div class="announcement-item">
        <div class="announcement-content">
          <h4>${i.subject}</h4>
          <small>Posted by ${i.author} on ${new Date(i.date).toLocaleDateString()}</small> <!-- Time dekhte ektu jater korar jonne -->
        </div>
      </div>`);

    val = val.join("") // As upore theke val ekta list hoye ashce, join kore puratake ekta tring banaisi html er

  } else {
    val = '<p class="no-announcements">No recent announcements</p>';
  }

  const announcementsList = document.getElementById("announcements-list");
  announcementsList.innerHTML = val // Announcement element er moddhe html insert korbe
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

    // Load all announcements
    const announcements = await get_data({
      sql: `SELECT a.subject as title, a.body as content, a.date_time as date, u.name as author 
            FROM announcement a LEFT JOIN user u ON a.uid = u.uid
            ORDER BY a.date_time DESC`,
    });

    const allAnnouncementsList = document.getElementById("all-announcements-list");

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
  const clickedBtn = document.querySelector(".sidebar-btn"); // Takes the 1st button available in the class
  setActiveButton(clickedBtn); // Basically always home button ke by default active kore dibe

  document.querySelector(".welcome-section").style.display = "block"; // Welcome er class load korbe

  const announcementSection = document.getElementById("announcement-section");
  announcementSection.style.display = "block"; // Announcement er block visible korbe 

  loadRecentAnnouncements();

  document.getElementById("dynamic-content").innerHTML = ""; // Side bar diye onno dynamic panel ase sob remove kore dibe
}
