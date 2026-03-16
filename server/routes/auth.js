const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// Helper — hash a raw token the same way for both store and lookup
const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required' });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "student" or "teacher"' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({ message: 'If that email is registered, a reset link has been generated' });
    }

    // Generate a secure random raw token (sent to user)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store only the hash — never the raw token
    user.resetPasswordToken  = hashToken(rawToken);
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save({ validateModifiedOnly: true });

    const resetUrl = `http://localhost:5173/reset-password/${rawToken}`;

    // In production replace this with an actual email service
    console.log('─────────────────────────────────────────');
    console.log('[Password Reset] URL for', user.email);
    console.log(resetUrl);
    console.log('─────────────────────────────────────────');

    res.status(200).json({
      message: 'If that email is registered, a reset link has been generated',
      // Exposed only in development so the frontend can simulate the flow
      ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming raw token to compare against the stored hash
    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken:  hashed,
      resetPasswordExpire: { $gt: Date.now() }, // still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });
    }

    // Set new password — the pre-save hook will hash it
    user.password           = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
