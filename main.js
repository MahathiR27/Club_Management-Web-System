const express = require('express');
const db = require('./database.js');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serves everything from current directory

// Direct database query endpoint
app.post('/query', (req, res) => {
    const { sql, params } = req.body;
    db.query(sql, params || [], (error, results) => { // checks for parameters na thakle empty list
        res.json(results);
    });
});

// Start server
app.listen(3000, () => {
  console.log('Server Live: http://localhost:3000/scripts/login.html');
});

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