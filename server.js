require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = process.env.PORT || 12000;

// Use CORS to allow requests from different origins
app.use(cors());

// Create a MySQL connection pool using the public URL
const pool = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  connectionLimit: 10,
  connectTimeout: 60000,
});

// Connect to MySQL
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database successfully');
  connection.release();
});

// Endpoint to fetch food items
app.get('/api/fooditems', (req, res) => {
  const query = 'SELECT * FROM FoodItems';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching food items:', err);
      return res.status(500).json({ error: 'Failed to fetch food items' });
    }
    res.json(results);
  });
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS FoodItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(255)
  )
`, (createErr) => {
  if (createErr) {
    console.error('Error creating table:', createErr);
    return;
  }
  
  // Check if table is empty and insert sample data
  pool.query('SELECT COUNT(*) as count FROM FoodItems', (checkErr, countResult) => {
    if (checkErr) {
      console.error('Error checking table data:', checkErr);
      return;
    }

    if (countResult[0].count === 0) {
      const sampleData = [
        ['Pizza Margherita', 'Classic tomato and mozzarella pizza', 10.99, 'Pizza', 'https://example.com/pizza.jpg'],
        ['Burger', 'Juicy beef burger with cheese', 8.50, 'Burger', 'https://example.com/burger.jpg'],
        ['Salad', 'Fresh garden salad', 6.99, 'Salad', 'https://example.com/salad.jpg']
      ];

      const insertQuery = `
        INSERT INTO FoodItems (name, description, price, category, image_url) 
        VALUES ?
      `;

      pool.query(insertQuery, [sampleData], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting sample data:', insertErr);
          return;
        }
        console.log('Inserted sample food items');
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
