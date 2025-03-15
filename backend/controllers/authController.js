const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const register = async (req, res) => {
  console.log('REGISTER CONTROLLER CALLED');
  console.log('Request Body:', req.body);

  try {
    const { username, email, password, userType } = req.body;

    // Validate input
    if (!username || !email || !password || !userType) {
      console.log('VALIDATION ERROR: Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        receivedData: req.body
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('USER ALREADY EXISTS');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      userType
    });

    await user.save();

    // Generate JWT token with longer expiry
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('USER REGISTERED SUCCESSFULLY');
    return res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        userType: user.userType 
      }
    });
  } catch (error) {
    console.error('REGISTRATION CONTROLLER ERROR:', error);
    return res.status(500).json({ 
      message: 'Server error during registration',
      error: error.toString(),
      details: error.stack
    });
  }
};

// Login User
const login = async (req, res) => {
  console.group('LOGIN CONTROLLER');
  console.log('Request received:', new Date().toISOString());
  console.log('Request Body:', req.body);

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('VALIDATION ERROR: Missing email or password');
      console.groupEnd();
      return res.status(400).json({ 
        message: 'Email and password are required',
        receivedData: req.body
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('USER NOT FOUND');
      console.groupEnd();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('PASSWORD MISMATCH');
      console.groupEnd();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token with longer expiry
    const token = jwt.sign(
      { 
        id: user._id, 
        userType: user.userType,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data
    const responseData = { 
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        userType: user.userType 
      }
    };

    console.log('LOGIN SUCCESSFUL');
    console.log('Response data:', {
      ...responseData,
      token: 'TOKEN_GENERATED'
    });

    console.groupEnd();
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('LOGIN CONTROLLER ERROR:', error);
    console.groupEnd();
    return res.status(500).json({ 
      message: 'Server error during login',
      error: error.toString(),
      details: error.stack
    });
  }
};

module.exports = {
  register,
  login
};