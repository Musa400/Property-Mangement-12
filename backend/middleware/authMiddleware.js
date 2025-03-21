const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const authMiddleware = catchAsync(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie as fallback
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new ApiError('Access denied. Please log in to access this resource.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token with security clearance
    const user = await User.findById(decoded.id).select('+securityClearance');

    if (!user) {
      throw new ApiError('The user belonging to this token no longer exists.', 401);
    }

    // Check if user's security clearance is still valid
    if (user.securityClearance && user.securityClearance.status !== 'active') {
      throw new ApiError('Access denied. Security clearance is not active.', 403);
    }

    // Check if user's password was changed after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      throw new ApiError('User recently changed password. Please log in again.', 401);
    }

    console.log('Authenticated User:', user);

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError('Invalid token. Please log in again.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Your token has expired. Please log in again.', 401);
    }
    throw error;
  }
});

module.exports = authMiddleware;