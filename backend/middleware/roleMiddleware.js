const ApiError = require('../utils/ApiError');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
  
  next();
};

const isAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.userType !== 'administrator') {
    return res.status(403).json({ message: 'Access denied. Administrator rights required.' });
  }
  
  next();
};

const hasSecurityClearance = (level) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const clearanceLevels = {
    'top_secret': 4,
    'secret': 3,
    'confidential': 2,
    'restricted': 1
  };

  const userLevel = req.user.securityClearance?.level;
  if (!userLevel || !clearanceLevels[userLevel] || clearanceLevels[userLevel] < clearanceLevels[level]) {
    return res.status(403).json({ 
      message: `Access denied. This operation requires ${level} clearance.`
    });
  }

  next();
};

module.exports = {
  isAdmin,
  isAdministrator,
  hasSecurityClearance
};