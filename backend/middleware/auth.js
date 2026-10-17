const jwt = require('jsonwebtoken');
const config = require('../lib/config');
const User = require('../models/User');
const { userLimiter } = require('./rateLimiters');

const auth = async (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // A database failure is a 500, not a 401: the frontend signs users out on 401
  try {
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    userLimiter(req, res, next);
  } catch (error) {
    next(error);
  }
};

const isAdminEmail = (email) => config.adminEmails.includes(email);

// Use after auth. Content management is limited to the accounts in ADMIN_EMAILS.
const requireAdmin = (req, res, next) => {
  if (!isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = auth;
module.exports.requireAdmin = requireAdmin;
module.exports.isAdminEmail = isAdminEmail;
