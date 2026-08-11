const mongoose = require('mongoose');

const HelperRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  emergencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  responseTime: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  location: {
    lat: Number,
    lng: Number,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
HelperRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
HelperRequestSchema.index({ requesterId: 1, status: 1 });
HelperRequestSchema.index({ helperId: 1, status: 1 });

module.exports = mongoose.model('HelperRequest', HelperRequestSchema);