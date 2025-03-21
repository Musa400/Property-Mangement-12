const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Protect routes - Authentication middleware
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Not authorized to access this route'));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(ApiError.unauthorized('User not found'));
      }

      console.log('Authenticated User:', user);

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return next(ApiError.unauthorized('Not authorized to access this route'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Grant access to specific roles
 * @param {...string} roles - Roles that can access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(ApiError.forbidden(`User role ${req.user.userType} is not authorized to access this route`));
    }
    next();
  };
};

/**
 * Check if user is the owner of the resource
 * @param {string} model - The model to check
 * @param {string} paramName - The parameter name in the request
 */
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return next(ApiError.notFound('Resource not found'));
      }

      // Check if user is the owner or admin
      if (resource.user.toString() !== req.user.id && req.user.userType !== 'admin') {
        return next(ApiError.forbidden('Not authorized to access this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token data
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid token');
  }
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
}; 