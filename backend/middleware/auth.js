const crypto = require('crypto');

const sessions = new Map();

const createSession = (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { UserID: user.UserID, Role: user.Role });
  return token;
};

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = token ? sessions.get(token) : null;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Please log in again.' });
  }

  req.user = user;
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.Role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }
  next();
};

module.exports = { createSession, authenticate, requireRole };
