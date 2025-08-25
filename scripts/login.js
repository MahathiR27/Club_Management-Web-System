// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) // this is the body of req in main 
  });
  return await response.json();
}

// Page load howar pore check if he is already logged in if he is then go to dashboard
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    window.location.href = 'dashboard.html';
  }
});

async function handle_login() {
  // Get values from the input boxes
  const userid = document.getElementById('userid').value;
  const password = document.getElementById('password').value;
  // Clear out the box er values
  document.getElementById('userid').value = '';
  document.getElementById('password').value = '';

  const table = await get_data({ sql: `select * from user where uid = ?`, params: [userid]}); // To prevent SQL injections

  if (table.length != 0){
    if (table[0].status != 'active'){
      show_pending();
    }
    else if (password == table[0].pass) {
      // userid local storage e rakhbo 
      localStorage.setItem('currentUser', userid);
      window.location.href = "dashboard.html"; // Dashboard e pathao
      return ;
    }
    return;
  }
  alert('Invalid User ID or Password.');
  return ;
}

// Pending windows popup/close
function show_pending() {
  document.getElementById('pendingOverlay').classList.add('show');
}
function close_pending() {
  document.getElementById('pendingOverlay').classList.remove('show');
}

function registerNow() {
  alert("Klk korbo!");
}
