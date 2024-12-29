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
    const [results] = await pool.query('SELECT * FROM fooditems');
    res.json(results);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch food items', 
      details: error.message 
    });
  }
});

// Add new food item
// Add food item
app.post('/api/fooditems', async (req, res) => {
  try {
    const { name, price, image_url, description, category } = req.body;

    const [result] = await pool.query(
      'INSERT INTO fooditems (name, price, image_url, description, category) VALUES (?, ?, ?, ?, ?)',
      [name, price, image_url, description, category]
    );

    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding food item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add food item',
      error: error.message
    });
  }
});

// Edit food item
app.put('/api/fooditems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image_url, description, category } = req.body;

    const [result] = await pool.query(
      'UPDATE fooditems SET name = ?, price = ?, image_url = ?, description = ?, category = ? WHERE id = ?',
      [name, price, image_url, description, category, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully'
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food item',
      error: error.message
    });
  }
});

// Delete food item
app.delete('/api/fooditems/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM fooditems WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food item',
      error: error.message
    });
  }
});


// Create a new food variety
app.post('/api/foodvarieties/create', async (req, res) => {
  try {
    const { category, name, price, image_url, description } = req.body;
    
    // First get category_id from fooditems table
    const [categoryResult] = await pool.query(
      'SELECT id FROM fooditems WHERE name = ?',
      [category]
    );

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category_id = categoryResult[0].id;

    // Then insert into food_varieties
    const [result] = await pool.query(
      'INSERT INTO food_varieties (category_id, name, price, image_url, description) VALUES (?, ?, ?, ?, ?)',
      [category_id, name, price, image_url, description]
    );
    
    res.status(201).json({ 
      message: 'Food variety created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating food variety:', error);
    res.status(500).json({ 
      error: 'Failed to create food variety', 
      details: error.message 
    });
  }
});

// Get all varieties by category
app.get('/api/foodvarieties/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const [varieties] = await pool.query(
      `SELECT fv.* FROM food_varieties fv 
       JOIN fooditems fi ON fv.category_id = fi.id 
       WHERE fi.name = ?`,
      [category]
    );
    res.status(200).json(varieties);
  } catch (error) {
    console.error('Error fetching varieties:', error);
    res.status(500).json({ error: 'Failed to fetch varieties', details: error.message });
  }
});

// Update a food variety
app.put('/api/foodvarieties/:id', async (req, res) => {
  try {
    const { name, price, image_url, description } = req.body;
    const [result] = await pool.query(
      'UPDATE food_varieties SET name = ?, price = ?, image_url = ?, description = ? WHERE id = ?',
      [name, price, image_url, description, req.params.id]
    );
    res.status(200).json({ message: 'Food variety updated successfully' });
  } catch (error) {
    console.error('Error updating food variety:', error);
    res.status(500).json({ error: 'Failed to update food variety', details: error.message });
  }
});

// Delete a food variety
app.delete('/api/foodvarieties/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM food_varieties WHERE id = ?',
      [req.params.id]
    );
    res.status(200).json({ message: 'Food variety deleted successfully' });
  } catch (error) {
    console.error('Error deleting food variety:', error);
    res.status(500).json({ error: 'Failed to delete food variety', details: error.message });
  }
});

// Get food variety details
app.get('/api/foodvarieties/details/:id', async (req, res) => {
  try {
    const [variety] = await pool.query(
      'SELECT * FROM food_varieties WHERE id = ?',
      [req.params.id]
    );
    res.status(200).json(variety[0]);
  } catch (error) {
    console.error('Error fetching variety details:', error);
    res.status(500).json({ error: 'Failed to fetch variety details', details: error.message });
  }
});



//Deals page functions

// Add new deal
app.post('/api/deals/create', async (req, res) => {
  try {
    const { name, image_url, original_price, discounted_price, size } = req.body;
    const discount = `${Math.round(((original_price - discounted_price) / original_price) * 100)}% OFF`;
    
    const [result] = await pool.query(
      'INSERT INTO deals (name, image_url, original_price, discounted_price, size, discount) VALUES (?, ?, ?, ?, ?, ?)',
      [name, image_url, original_price, discounted_price, size, discount]
    );
    
    res.status(201).json({ message: 'Deal created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal', details: error.message });
  }
});



app.get('/api/deals', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        id,
        name,
        image_url,
        original_price,
        discounted_price,
        size,
        discount,
        created_at 
      FROM deals 
      ORDER BY created_at DESC
    `);
    res.json(results);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      error: 'Failed to fetch deals',
      details: error.message
    });
  }
});

app.put('/api/deals/update', async (req, res) => {
  try {
    const { id, original_price, discounted_price, size } = req.body;
    
    const [result] = await pool.query(`
      UPDATE deals 
      SET 
        original_price = ?,
        discounted_price = ?,
        size = ?,
        discount = CONCAT('₹', ROUND(original_price - discounted_price), ' OFF')
      WHERE id = ?
    `, [original_price, discounted_price, size, id]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Deal updated successfully' });
    } else {
      res.status(404).json({ error: 'Deal not found' });
    }
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      error: 'Failed to update deal',
      details: error.message
    });
  }
});

// Delete deal
app.delete('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM deals WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal',
      error: error.message
    });
  }
});


// Save the Orders function

app.post('/api/orders', async (req, res) => {
  try {
    const { 
      username, 
      food_name, 
      quantity, 
      contact_number, 
      address, 
      total_price,
      image_url 
    } = req.body;
   
    const [result] = await pool.query(
      `INSERT INTO orders
      (username, food_name, quantity, contact_number, address, total_price, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, food_name, quantity, contact_number, address, total_price, image_url]
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

// API endpoint to delete an order
app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    const [result] = await pool.query(
      'DELETE FROM orders WHERE id = ?',
      [orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
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

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});


// Add item to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { username, food_name, price, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO cart (username, food_name, price, image_url) VALUES (?, ?, ?, ?)',
      [username, food_name, price, image_url]
    );
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cartItemId: result.insertId
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

app.delete('/api/cart/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM cart WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
});

// Clear Cart
app.delete('/api/cart/clear/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM cart WHERE username = ?',
      [username]
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

// Get cart items for a user
app.get('/api/cart/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    const [cartItems] = await pool.query(
      'SELECT * FROM cart WHERE username = ? ORDER BY created_at DESC',
      [username]
    );
    
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message
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
    const { username, password } = req.body;  // Changed from user_name to username

    console.log('Received login attempt for user:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

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

// Add reset password function
app.post('/api/reset-password', async (req, res) => {
  try {
    const { username, mobileNumber, password } = req.body;

    console.log('Received password reset attempt for user:', username);

    if (!username || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, mobile number and new password are required'
      });
    }

    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ? AND mobile_number = ?',
      [password, username, mobileNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with provided username and mobile number'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message
    });
  }
});

//profile page
// Get user details
app.get('/api/users/:username', async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT username, mobile_number FROM users WHERE username = ?',
      [req.params.username]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user[0]
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false, 
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Update user details
app.put('/api/users/:username', async (req, res) => {
  try {
    const { username, mobile_number } = req.body;
    
    const [result] = await pool.query(
      'UPDATE users SET mobile_number = ? WHERE username = ?',
      [mobile_number, username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details updated successfully'
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user details',
      error: error.message
    });
  }
});

//Email Function 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  
  try {
    const mailOptions = {
      from: '"FastFood" <foodshop674@gmail.com>',
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email'
    });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired or not found'
    });
  }

  if (Date.now() - storedData.timestamp > 600000) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired'
    });
  }

  if (storedData.otp === otp) {
    otpStore.delete(email);
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  }

  storedData.attempts += 1;
  if (storedData.attempts >= 3) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts. Please request a new OTP'
    });
  }

  res.status(400).json({
    success: false,
    message: 'Invalid OTP'
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
