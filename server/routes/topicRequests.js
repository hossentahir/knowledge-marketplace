const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const TopicRequest = require('../models/TopicRequest');
const Expertise = require('../models/Expertise');
const Conversation = require('../models/Conversation');

const router = express.Router();

const attachConversationIds = async (requests) => {
  const topicRequestIds = requests.map((request) => request._id);
  const conversations = await Conversation.find({ topicRequest: { $in: topicRequestIds } })
    .select('_id topicRequest')
    .lean();

  const conversationMap = new Map(
    conversations.map((conversation) => [String(conversation.topicRequest), String(conversation._id)])
  );

  return requests.map((request) => ({
    ...request,
    conversationId: conversationMap.get(String(request._id)) || null,
  }));
};

// POST /api/topic-requests
// Body: { expertiseId }
// Only students can create topic requests
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { expertiseId } = req.body;

    if (!expertiseId) {
      return res.status(400).json({ message: 'expertiseId is required' });
    }

    const expertise = await Expertise.findById(expertiseId);
    if (!expertise) {
      return res.status(404).json({ message: 'Expertise not found' });
    }

    const topicRequest = await TopicRequest.create({
      student: req.user.id,
      teacher: expertise.teacher,
      expertise: expertise._id,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Topic request created successfully',
      id: topicRequest._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/topic-request/teacher
// Only teachers can view their topic requests
router.get('/teacher', auth, authorize('teacher'), async (req, res) => {
  try {
    const requests = await TopicRequest.find({ teacher: req.user.id, status: 'pending' })
      .populate('student', 'name email')
      .populate('expertise', 'title price')
      .sort({ _id: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/topic-request/teacher/history
// Only teachers can view processed request history
router.get('/teacher/history', auth, authorize('teacher'), async (req, res) => {
  try {
    const requests = await TopicRequest.find({
      teacher: req.user.id,
      status: { $in: ['accepted', 'rejected'] },
    })
      .populate('student', 'name email')
      .populate('expertise', 'title price')
      .sort({ _id: -1 })
      .lean();

    const requestsWithConversation = await attachConversationIds(requests);
    res.json(requestsWithConversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/topic-request/student/history
// Only students can view their request history
router.get('/student/history', auth, authorize('student'), async (req, res) => {
  try {
    const requests = await TopicRequest.find({ student: req.user.id })
      .populate('teacher', 'name email')
      .populate('expertise', 'title price')
      .sort({ _id: -1 })
      .lean();

    const requestsWithConversation = await attachConversationIds(requests);
    res.json(requestsWithConversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/topic-request/:id
// Only the owning teacher can update status (accepted | rejected)
router.patch('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['accepted', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be either \"accepted\" or \"rejected\"' });
    }

    const topicRequest = await TopicRequest.findOneAndUpdate(
      { _id: id, teacher: req.user.id },
      { status },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('expertise', 'title price');

    if (!topicRequest) {
      return res
        .status(404)
        .json({ message: 'Topic request not found or not owned by this teacher' });
    }

    let conversationId = null;

    // Create conversation only when the request is accepted.
    if (status === 'accepted') {
      const conversation = await Conversation.findOneAndUpdate(
        { topicRequest: topicRequest._id },
        {
          topicRequest: topicRequest._id,
          student: topicRequest.student?._id || topicRequest.student,
          teacher: topicRequest.teacher,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      conversationId = conversation._id;
    }

    res.json({
      message: 'Topic request updated successfully',
      topicRequest,
      conversationId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

