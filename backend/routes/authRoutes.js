const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to log all incoming requests
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
};

// Apply request logging middleware to all routes
router.use(requestLogger);

// CORS and headers middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

module.exports = router;