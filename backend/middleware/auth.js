const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

// Verifies the Bearer token and attaches the authenticated user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized: no token provided');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(401);
      throw new Error('Not authorized: user no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized: invalid or expired token');
  }
});

// Restricts a route to specific roles, e.g. authorize('admin')
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: you do not have permission to perform this action');
    }
    next();
  };

module.exports = { protect, authorize };
