const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isUnsent: {
      type: Boolean,
      default: false,
    },
    unsentAt: Date,
  }],
  lastMessage: {
    content: String,
    timestamp: Date,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
