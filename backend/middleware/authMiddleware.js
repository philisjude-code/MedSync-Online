const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect Routes - Check if token exists
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get User Data
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ✅ New Middleware for Role-based Authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'User role not allowed to access this route' });
    }
    next();
  };
};
