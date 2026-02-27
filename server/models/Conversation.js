const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  topicRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TopicRequest',
    required: true,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
