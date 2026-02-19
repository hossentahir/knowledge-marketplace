const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const TopicRequest = require('../models/TopicRequest');
const Expertise = require('../models/Expertise');

const router = express.Router();

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
    const requests = await TopicRequest.find({ teacher: req.user.id })
      .populate('student', 'name email')
      .populate('expertise', 'title price')
      .lean();

    res.json(requests);
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

    res.json({
      message: 'Topic request updated successfully',
      topicRequest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

