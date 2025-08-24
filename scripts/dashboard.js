
// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) 
  });
  return await response.json();
}

// Load user information when page loads
window.addEventListener('DOMContentLoaded', async function() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const userData = await get_data({ 
        sql: `SELECT name FROM user WHERE uid = ?`, 
        params: [currentUser] 
      });
      
      if (userData.length > 0) {
        const username = userData[0].name;
        document.getElementById('welcome-message').textContent = `Welcome ${username}!`;
      } else {
        document.getElementById('welcome-message').textContent = 'Welcome!';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      document.getElementById('welcome-message').textContent = 'Welcome!';
    }
  } else {
    // user logged in na thakle login page e pathabe
    window.location.href = 'login.html';
  }
});

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  }
}