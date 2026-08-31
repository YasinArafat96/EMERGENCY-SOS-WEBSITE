const mongoose = require('mongoose');

const DisasterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  icon: { type: String },
  startsAt: Date,
  endsAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Disaster', DisasterSchema);
