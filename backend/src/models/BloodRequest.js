const mongoose = require('mongoose');

// Tracks hospital blood requests that have been donated to (fulfilled)
// so they no longer appear in the active requests list.
const BloodRequestSchema = new mongoose.Schema({
  // Unique identifier of the mock request (e.g. 'req-1', 'req-2')
  requestId: {
    type: String,
    required: true,
    unique: true,
  },
  // User who donated
  donatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
