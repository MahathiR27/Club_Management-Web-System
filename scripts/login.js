// Function to fetch data from table
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) // this is the body of req in main 
  });
  return await response.json();
}

async function send_email(email){
  const response = await fetch('/email', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email) // this is the body of req in main 
  });
  return await response.json();
};

async function verify(otp){
  const response = await fetch('/otp', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(otp) // this is the body of req in main 
  });
  return await response.json();
};

/////////////////////////// SESSION CHECK //////////////////////
// Page load howar pore check if he is already logged in if he is then go to dashboard
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    window.location.href = 'dashboard.html';
  }
});
//////////////////////////////////////////////////////////////

/////////////////////////// LOGIN ////////////////////////////
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
      return ;
    }
    else if (password == table[0].pass) {
      // userid local storage e rakhbo 
      localStorage.setItem('currentUser', userid);
      window.location.href = "dashboard.html"; // Dashboard e pathao
      return ;
    }
  }

  document.getElementById('loginErrorText').style.display = 'block';
  return ;
}

/////////////////////////// Register - 1 ////////////////////////////
async function handle_register() {
  show_registration()
  clear_form()

  //await send_email({ receiver: email, subject: `OTP`,body:`123`});
}

async function sendOTP() {
  // Button instantly disabled jate mail spam na hoye jay
  document.querySelector('.get-otp-btn').disabled = true;
  
  const email = document.getElementById('regEmail').value;

  const email_exist_check = await get_data({ sql: `select * from user where email = ?`, params: [email]});
  if (!email || !email.endsWith("@g.bracu.ac.bd")) {
    // wrong email hoile button abar ferot aishe porbe
    document.querySelector('.get-otp-btn').disabled = false;
    document.getElementById('emailErrorText').style.display = 'block';
    return;
  }
  else if( email_exist_check.length > 0){
    // existing member hole can't register
    document.querySelector('.get-otp-btn').disabled = false;
    document.getElementById('ExistingMemberText').style.display = 'block';
    return;
  }
  // Send OTP ----------------------------------------------------------------
  await send_email({ receiver: email, subject: `OTP`,body:`replace`});
  
  // Hide error text if email is valid
  document.getElementById('emailErrorText').style.display = 'none';

  // Get otp use kore felle email change korte parbe na get otp o na
  document.getElementById('regEmail').disabled = true;
  document.querySelector('.get-otp-btn').disabled = true;
  
  // Show sent, otp box and verify button
  document.getElementById('otpStatusText').style.display = 'block';
  document.getElementById('otpGroup').style.display = 'block';
  document.getElementById('verifyBtn').style.display = 'block';
}

async function verify_otp() {
  const otp = document.getElementById('otpCode').value;
  const email = document.getElementById('regEmail').value
  
  if (!otp) { // Khali enter marle
    document.getElementById('otpErrorText').innerText = 'Please enter the OTP';
    document.getElementById('otpErrorText').style.display = 'block';
    return;
  }

  const result = await verify({ email: email, otp: otp });
  if (result){
    // OTP verified next step e jai
    close_registration();
    register_2();
  } else {
    document.getElementById('otpErrorText').innerText = 'Incorrect OTP. Please try again.';
    document.getElementById('otpErrorText').style.display = 'block';
  }
}

// Pending windows popup/close
function show_pending() {
  document.getElementById('pendingOverlay').classList.add('show');}
function close_pending() {
  document.getElementById('pendingOverlay').classList.remove('show');}

// Registration popup functions
function show_registration() {
  document.getElementById('registrationOverlay').classList.add('show');}
function close_registration() {
  document.getElementById('registrationOverlay').classList.remove('show');}

// Reset everything in the form.
function clear_form() { 
  document.getElementById('regEmail').value = '';
  document.getElementById('regEmail').disabled = false;
  document.querySelector('.get-otp-btn').disabled = false;
  document.getElementById('otpCode').value = '';
  document.getElementById('otpGroup').style.display = 'none';
  document.getElementById('verifyBtn').style.display = 'none';
  document.getElementById('otpStatusText').style.display = 'none';
  document.getElementById('emailErrorText').style.display = 'none';
  document.getElementById('otpErrorText').style.display = 'none';};

/////////////////////////////////////////////////////////////////////

/////////////////////////// Register - 2 ////////////////////////////
function register_2(){
  show_register2();
  clear_register2_form();

  // Register theke verified email ta niye ashbe
  const email = document.getElementById('regEmail').value;
  document.getElementById('reg2Email').value = email;
}

async function handle_final_registration() {
  const name = document.getElementById('reg2Name').value;
  const studentId = document.getElementById('reg2StudentId').value;
  const phone = document.getElementById('reg2Phone').value;
  const department = document.getElementById('reg2Department').value;
  const admissionSem = document.getElementById('reg2AdmissionSem').value;
  const password = document.getElementById('reg2Password').value;
  const confirmPassword = document.getElementById('reg2ConfirmPassword').value;
  const email = document.getElementById('reg2Email').value; // Get the email from hidden field

  // Sbb kisu fill up korese naki
  if (!name || !studentId || !phone || !department || !admissionSem || !password || !confirmPassword) {
    document.getElementById('register2ErrorText').innerText = 'Please fill in all fields';
    document.getElementById('register2ErrorText').style.display = 'block';
    return;}

  // ID check
  if (studentId.length != 8) {
    document.getElementById('register2ErrorText').innerText = 'Incorrect Student ID';
    document.getElementById('register2ErrorText').style.display = 'block';
    return;}
  
  // Confirm Password
  if (password !== confirmPassword) {
    document.getElementById('register2ErrorText').innerText = 'Passwords do not match';
    document.getElementById('register2ErrorText').style.display = 'block';
    return;}
  
  // Phone number validate
  if (phone.length != 11) {
    document.getElementById('register2ErrorText').innerText = 'Phone number must be 11 digits';
    document.getElementById('register2ErrorText').style.display = 'block';
    return;}
  
    // User table
    await get_data({ sql: `INSERT INTO user (uid, email, pass, name, phone) VALUES (?, ?, ?, ?, ?)`, 
      params: [studentId, email, password, name, phone]});
    // Student table
    await get_data({ sql: `INSERT INTO student (uid, department, admission_sem) VALUES (?, ?, ?)`, 
      params: [studentId, department, admissionSem]});

  close_register2();
  show_confirmation_popup();
}

// Register 2 
function show_register2() {
  document.getElementById('register2Overlay').classList.add('show');}
function close_register2() {
  document.getElementById('register2Overlay').classList.remove('show');}

// Successfully registered
function show_confirmation_popup() {
  document.getElementById('confirmationOverlay').classList.add('show');}
function close_confirmation_popup() {
  document.getElementById('confirmationOverlay').classList.remove('show');}

// Clear register 2 form
function clear_register2_form() { 
  document.getElementById('reg2Name').value = '';
  document.getElementById('reg2StudentId').value = '';
  document.getElementById('reg2Phone').value = '';
  document.getElementById('reg2Department').value = '';
  document.getElementById('reg2AdmissionSem').value = '';
  document.getElementById('reg2Password').value = '';
  document.getElementById('reg2ConfirmPassword').value = '';
  document.getElementById('register2ErrorText').style.display = 'none';
}