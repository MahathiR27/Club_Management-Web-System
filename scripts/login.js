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
  const current_user = localStorage.getItem('current_user');
  if (current_user) {
    window.location.href = 'dashboard.html';
  }
});

async function handle_login() {
  // Get values from the input boxes
  const userid = document.getElementById('userid').value;
  const password = document.getElementById('password').value;

  const table = await get_data({ sql: `select * from user where uid = ?`, params: [userid]}); // To prevent SQL injections

  if (table.length == 0) { 
    alert("User ID not found!");
  } else {
    if (password == table[0].pass) {
      // userid local storage e rakhbo 
      localStorage.setItem('current_user', userid);
      alert("Logged In!");
      window.location.href = "dashboard.html"; // Dashboard e pathao
    } else {
      alert("User ID or Password incorrect!");
    }
  }
  
  return false;
}

function registerNow() {
  alert("Klk korbo!");
}
