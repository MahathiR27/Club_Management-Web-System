// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) 
  });
  return await response.json();
}

// Page load howa complete hoile run func
window.addEventListener('DOMContentLoaded', async () => {
  const current_user = localStorage.getItem('current_user');
  if (current_user) {
    const userData = await get_data({ sql: `SELECT name FROM user WHERE uid = ?`, params: [current_user]});
    document.getElementById('welcome-message').textContent = `Welcome ${userData[0].name}!`;} 

  else {
    // user logged in na thakle login page e pathabe
    window.location.href = 'login.html';}
});

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('current_user');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  }
}