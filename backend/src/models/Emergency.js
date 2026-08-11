const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['ambulance', 'fire', 'police', 'detail', 'voice'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active',
  },
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  helpers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['en-route', 'arrived', 'completed'],
    },
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
});

module.exports = mongoose.model('Emergency', EmergencySchema);