const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = 8000;

// Use CORS to allow requests from different origins
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'https://food-order-api-sreh.onrender.com',
  user: 'root', // Your MySQL username
  password: 'madan@2004', // Your MySQL password
  database: 'FoodOrderDB'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Endpoint to fetch food items
app.get('/api/fooditems', (req, res) => {
  const query = 'SELECT * FROM FoodItems';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching food items:', err);
      return res.status(500).json({ error: 'Failed to fetch food items' });
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
