// OCA Dashboard Functions

// Function to fetch data from table
async function get_data(query) {
  const response = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  return await response.json();
}

const table = await get_data({ sql: `select * from user where uid = ?`, params: [userid]}); // To prevent SQL injections


  // Update welcome message for OCA
  document.querySelector('.welcome-section p').textContent =
    'Oversee the entire club management system and university activities.';

  // Modal close function
  window.closeVerification = function() {
    document.getElementById('verificationOverlay').classList.remove('show');
  };

  // Account Verification Modal logic
  document.getElementById('accountVerificationBtn').addEventListener('click', async function() {
    document.getElementById('verificationOverlay').classList.add('show');
    const pending_users = await get_data({ sql: `SELECT * FROM user WHERE status = 'pending'` });
    const tbody = document.querySelector('#pendingUsersTable tbody');
    tbody.innerHTML = '';
    if (!pending_users || pending_users.length === 0) {
      tbody.innerHTML = `<tr><td colspan='6' style='text-align:center;color:#aaa;'>No pending users found.</td></tr>`;
    } else {
      pending_users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.uid}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td><button class="approve-btn" data-uid="${user.uid}">Approve</button></td>
        `;
        tbody.appendChild(row);
      });
      // Add event listeners for approve buttons
      tbody.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const uid = this.getAttribute('data-uid');
          // Update database
          await get_data({ sql: `UPDATE user SET status = 'active' WHERE uid = ?`, params: [uid] });
          // Change button to green 'Approved'
          this.outerHTML = '<span class="approved-label">Approved</span>';
        });
      });
    }
  });

  // Update table headers for filter icons
  const theadRow = document.querySelector('#pendingUsersTable thead tr');
  if (theadRow) {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Action'];
    theadRow.innerHTML = headers.map(h => `<th>${h} <span class='filter-icon' title='Filter'>&#9776;</span></th>`).join('');
  }

