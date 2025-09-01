const express = require('express');
const nodemailer = require('nodemailer');
const db = require('./database.js');
const config = require('./config_files/config.json');
const multer = require('multer');

const app = express();

app.use(express.json());
app.use(express.static('.')); // Serves everything from current directory

///////////////////////// Upload /////////////////////////
app.use('/uploads', express.static('uploads'));

// simple disk storage for PDFs
const pdf_storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {cb(null, `${Date.now()}_${file.originalname}`);},
});
const pdf_upload = multer({
  storage: pdf_storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    // cb(new Error('PDF files only'));
  }
});

app.post('/upload-pdf', pdf_upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No PDF file uploaded'
    });
  }
  
  const relPath = `uploads/${req.file.filename}`;
  res.json({
    success: true,
    name: req.file.originalname,
    path: relPath,
    url: `/${relPath}`,
  });
});
///////////////////////////////////////////////////////////

///////////////////////// Database ////////////////////////
app.post('/query', (req, res) => {
    const { sql, params } = req.body;
    console.log('Executing SQL:', sql, 'with params:', params);

    db.query(sql, params || [], (error, results) => { 
      console.log('Query successful:', results);
      res.json(results);
    });
});
///////////////////////////////////////////////////////////

/////////////////////////// OTP /////////////////////////// 
otp_storage = {}

function otp_generator(email){
  if (email in otp_storage) {
    return otp_storage[email];
  }
  else{
    const otp = Math.floor(Math.random() * 900000) + 100000;
    otp_storage[email] = otp;
    return otp;
  }
}

function otp_verify(email, otp){
  if (otp_storage[email] == otp){
    delete otp_storage[email];
    return true;
  }
  return false;
}

app.post('/otp', (req, res) => {
  const {email, otp} = req.body;
    console.log(otp_storage, email, otp)
    if (otp_verify(email, otp)){
      res.json(true);
    }
    else {res.json(false);}
});
///////////////////////////////////////////////////////////

////////////////////////// Email ////////////////////////// 
//const email = prompt("Enter your email:");
//await send_email({ receiver: email, subject: `OTP`,body:`123`});

// Comment out to run mail test
otp_generator['11111@g.bracu.ac.bd'] = 123456;
app.post('/email', (req, res) => {
res.json({success: true})
});

// Uncomment to send mail

// Transporter object
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // use false for STARTTLS; true for SSL on port 465
//   auth: {
//     user: config.gmail_address,
//     pass: config.gmail_app_pass,
//   }
// });

// app.post('/email', (req, res) => {
//   let { receiver, subject, body } = req.body;

//   if (subject.includes('OTP')){
//     const otp = otp_generator(receiver);
//     body = `Your OTP is: ${otp}`;
//   }

//   // Configure email er sender receiver
//   const mail_options = {
//     from: config.gmail_address,
//     to: receiver,
//     subject: subject,
//     text: body
//   };

//   // Send the email
//   transporter.sendMail(mail_options, function(error, info){
//     if (error) {
//       console.log(`Couldn't Send Email to ${receiver} \n ${error}`);
//       res.json({success: false});
//     } else {
//       console.log(`Email sent to: ${receiver}, Subject: ${subject}`);
//       res.json({success: true});
//     }
//   });
// });
///////////////////////////////////////////////////////////

///////////////////////// Server /////////////////////////
// Start server
app.listen(3000, () => {
  console.log('Server Live: http://localhost:3000/scripts/login.html');
});
///////////////////////// Server /////////////////////////
/* Sql Query function to fetch data, apparently browser side e require() kaj kore na 
async function get_data(query){
  const response = await fetch('/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query) 
  });
  return await response.json();
}
*/