const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
