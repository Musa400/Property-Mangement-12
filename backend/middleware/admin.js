const admin = (req, res, next) => {
  if (req.user?.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = admin;