const db = require("./database.js"); // Require the database in the main file for use

db.query("select * from user", (error, res)=>{ // db
  if (error){console.log("Query Error:",error);}
  else{console.log(res)};
  return;
})