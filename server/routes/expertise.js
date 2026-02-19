const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Expertise = require('../models/Expertise');

const router = express.Router();

// POST /api/expertise - only teachers can create
router.post('/', auth, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price == null) {
      return res.status(400).json({ message: 'Title, description, and price are required' });
    }

    await Expertise.create({
      teacher: req.user.id,
      title,
      description,
      price: Number(price),
    });

    res.status(201).json({ message: 'Expertise created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expertise/search?query=
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    const filter = query
      ? { title: { $regex: query, $options: 'i' } }
      : {};

    const results = await Expertise.find(filter)
      .populate('teacher', 'name email')
      .lean();

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
