const mysql = require('mysql2'); // Import the SQL module from npm install mysql
const config = require('./config_files/config.json'); // Imports config files

const sql = mysql.createConnection({
  host: config.db_host,
  user: config.db_user, 
  password: config.db_pass,
  database: config.db_name
});

sql.connect((error) => { // Tries to connect to sql using the credentials
  if (error) {
    console.log('--- Failed to Connect Database:', error); // If there is any error returns that
  }
  else{
  console.log(`+++ Connected to Database: ${config.db_name}`);
  }
  return;
});

module.exports = sql; // Export the connected database as a module to require in main files
