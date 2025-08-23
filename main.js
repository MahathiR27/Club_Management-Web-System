const db = require("./database.js"); // Require the database in the main file for use

db.query("select * from developers", (error, res)=>{ // db queries
  if (error){console.log("Query Error:",error);}
  else{console.log(res)};
  return;
})