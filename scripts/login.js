// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) 
  });
  return await response.json();
}

async function handle_login() {
  // Get values from the input boxes
  const userid = document.getElementById('userid').value;
  const password = document.getElementById('password').value;

  const table = await get_data({ sql: `select * from user where uid = '${userid}'` });

  if (table.length == 0) { 
    alert("User ID not found!");
  } else {
    if (password == table[0].pass) {
      alert("Logged In!");
      window.location.href = "dashboard.html";
    } else {
      alert("User ID or Password incorrect!");
    }
  }
  
  return false;
}

function registerNow() {
  alert("Klk korbo!");
}