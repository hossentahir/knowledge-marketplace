const express = require('express');
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

// POST /api/messages
// Body: { conversationId, text }
// Protected: sender is inferred from JWT
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ message: 'conversationId and text are required' });
    }

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const senderId = String(req.user.id);
    const isParticipant =
      String(conversation.student) === senderId || String(conversation.teacher) === senderId;

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
