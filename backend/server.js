const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const userStatsRoutes = require('./routes/Userstate');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(cookieParser());

// Security audit logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - User: ${req.user ? req.user.id : 'Unauthenticated'}`);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const rentPaymentRoutes = require('./routes/rentPaymentRoutes');
// const rentReceiptRoutes = require('./routes/rentReceipts');

// Secure route mounting
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/rent-payments', rentPaymentRoutes);
// app.use('/api/rent-receipts', rentReceiptRoutes);
app.use('/api/userstate', userStatsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  // Log error details securely
  console.error({
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    errorName: err.name,
    errorMessage: err.message,
    errorCode: err.statusCode || 500,
    stackTrace: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    userId: req.user ? req.user.id : 'anonymous'
  });

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token'
    });
  }

  // Handle token expiration
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token expired'
    });
  }

  // Production vs Development error response
  const errorResponse = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred'
      : err.message || 'An internal server error occurred',
    timestamp: new Date().toISOString()
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err;
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(err.statusCode || 500).json(errorResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Security measures: Active');
  console.log('Audit logging: Enabled');
});