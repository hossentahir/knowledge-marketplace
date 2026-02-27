const express = require('express');
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');

const router = express.Router();

// GET /api/conversations/:id
// Returns conversation with populated student and teacher — participants only
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('student', 'name email role')
      .populate('teacher', 'name email role')
      .lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const requesterId = String(req.user.id);
    const isParticipant =
      String(conversation.student?._id) === requesterId ||
      String(conversation.teacher?._id) === requesterId;

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
