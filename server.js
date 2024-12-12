require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 12000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
const dbConfig = process.env.USE_RAILWAY_DB === 'true' 
  ? {
      uri: process.env.DATABASE_URL,
      connectionLimit: 10,
      connectTimeout: 60000,
    }
  : {
      host: process.env.LOCAL_DB_HOST || 'localhost',
      user: process.env.LOCAL_DB_USER || 'root',
      password: process.env.LOCAL_DB_PASSWORD,
      database: process.env.LOCAL_DB_NAME || 'food_order',
      port: process.env.LOCAL_DB_PORT || 3306,
      connectionLimit: 10,
      connectTimeout: 60000,
    };

const pool = mysql.createPool(dbConfig);

// Database Initialization Function
// async function initializeDatabase() {
//   try {
//     const connection = await pool.getConnection();
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS FoodItems (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         description TEXT,
//         price DECIMAL(10, 2) NOT NULL,
//         category VARCHAR(100),
//         image_url VARCHAR(255)
//       )
//     `);

//     const [countResult] = await connection.query('SELECT COUNT(*) as count FROM FoodItems');
//     if (countResult[0].count === 0) {
//       const sampleData = [
//         ['Pizza Margherita', 'Classic tomato and mozzarella pizza', 10.99, 'Pizza', 'https://example.com/pizza.jpg'],
//         ['Burger', 'Juicy beef burger with cheese', 8.50, 'Burger', 'https://example.com/burger.jpg'],
//         ['Salad', 'Fresh garden salad', 6.99, 'Salad', 'https://example.com/salad.jpg']
//       ];
//       await connection.query(`INSERT INTO FoodItems (name, description, price, category, image_url) VALUES ?`, [sampleData]);
//       console.log('Inserted sample food items');
//     }
//     connection.release();
//   } catch (error) {
//     console.error('Error initializing database:', error);
//   }
// }

// Database Connection and Initialization
pool.getConnection()
  .then(async (connection) => {
    console.log('Connected to database successfully');
    connection.release();
    await initializeDatabase();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// API Endpoint to Fetch Food Items
app.get('/api/fooditems', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM FoodItems');
    res.json(results);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch food items', 
      details: error.message 
    });
  }
});
// Save the Orders function

app.post('/api/place_order', (req, res) => {
  const { username, food_name, quantity, contact_number, total_price } = req.body;

  // Input validation
  if (!username || !food_name || !quantity || !contact_number || !total_price) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Insert query
  const query = `INSERT INTO orders (username, food_name, quantity, contact_number, total_price) VALUES (?, ?, ?, ?, ?)`;
  const values = [username, food_name, quantity, contact_number, total_price];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting order into database:', err);
      return res.status(500).json({ message: 'Failed to place the order.' });
    }

    res.status(200).json({ message: 'Order placed successfully!', orderId: result.insertId });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
