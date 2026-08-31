const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: String, enum: ['user','gemini','system'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GeminiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [MessageSchema],
  updatedAt: { type: Date, default: Date.now }
});

GeminiConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GeminiConversation', GeminiConversationSchema);
