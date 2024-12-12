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

app.post('/api/orders', async (req, res) => {
  try {
    const { username, food_name, quantity, contact_number, total_price } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO orders 
      (username, food_name, quantity, contact_number, total_price) 
      VALUES (?, ?, ?, ?, ?)`,
      [username, food_name, quantity, contact_number, total_price]
    );
    
    res.status(201).json({
      message: 'Order placed successfully',
      orderId: result.insertId
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      error: 'Failed to place order', 
      details: error.message 
    });
  }
});

// Endpoint to fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM orders ORDER BY order_time DESC');
    res.json(results);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
});

// Endpoint to fetch orders by username
app.get('/api/orders/:username', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT * FROM orders WHERE username = ? ORDER BY order_time DESC', 
      [req.params.username]
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user orders', 
      details: error.message 
    });
  }
});

//Signup user function

app.post('/api/signup', async (req, res) => {
  try {
    const { username, mobile_number, password } = req.body;

    // Validate input
    if (!username || !mobile_number || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR mobile_number = ?',
      [username, mobile_number]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or mobile number already exists' });
    }

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, mobile_number, password) VALUES (?, ?, ?)',
      [username, mobile_number, password]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
     
    });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({
      error: 'Failed to register user',
      details: error.message
    });
  }
});

// Add login function
app.post('/api/login', async (req, res) => {
  try {
    const { user_name, password } = req.body;
    
    // Log the received data (for debugging)
    console.log('Received login attempt for user:', user_name);

    // Input validation
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check user credentials
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [user_name, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // User found - send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: users[0].id,
        username: users[0].username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});



// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
