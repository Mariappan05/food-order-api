require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 12000;
app.use(cors());

// Determine which database to use based on environment variable
const useRailwayDb = process.env.USE_RAILWAY_DB === 'true'; // Set USE_RAILWAY_DB=true in your .env for Railway

let pool;
if (useRailwayDb) {
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
    connectTimeout: 60000,
  });
} else {
  pool = mysql.createPool({
    host: process.env.LOCAL_DB_HOST || 'localhost',
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || 'madan@2004', // Your local password
    database: process.env.LOCAL_DB_NAME || 'food_order',
    port: process.env.LOCAL_DB_PORT || 3306,
    connectionLimit: 10,
    connectTimeout: 60000,
  });
}


// Async function to handle database initialization
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS FoodItems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(255)
      )
    `);

    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM FoodItems');
    if (countResult[0].count === 0) {
      const sampleData = [
        ['Pizza Margherita', 'Classic tomato and mozzarella pizza', 10.99, 'Pizza', 'https://example.com/pizza.jpg'],
        ['Burger', 'Juicy beef burger with cheese', 8.50, 'Burger', 'https://example.com/burger.jpg'],
        ['Salad', 'Fresh garden salad', 6.99, 'Salad', 'https://example.com/salad.jpg']
      ];
      await connection.query(`INSERT INTO FoodItems (name, description, price, category, image_url) VALUES ?`, [sampleData]);
      console.log('Inserted sample food items');
    }
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Connect to MySQL and then initialize the database
pool.getConnection()
  .then(async (connection) => {
    console.log('Connected to database successfully');
    connection.release();
    await initializeDatabase();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });


app.get('/api/fooditems', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM FoodItems');
    res.json(results);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ error: 'Failed to fetch food items', details: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
