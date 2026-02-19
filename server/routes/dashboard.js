const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/student', auth, authorize('student'), (req, res) => {
  res.json({ message: 'Welcome to the Student Dashboard' });
});

router.get('/teacher', auth, authorize('teacher'), (req, res) => {
  res.json({ message: 'Welcome to the Teacher Dashboard' });
});

module.exports = router;
