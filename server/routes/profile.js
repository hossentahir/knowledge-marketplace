const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Expertise = require('../models/Expertise');

const router = express.Router();

// GET /api/profile/:id
// Returns user profile. If teacher, includes their expertise listings.
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let expertise = [];
    if (user.role === 'teacher') {
      expertise = await Expertise.find({ teacher: user._id }).lean();
    }

    res.json({ ...user, expertise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
