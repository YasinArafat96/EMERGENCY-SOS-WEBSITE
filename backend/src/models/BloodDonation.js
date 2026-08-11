const mongoose = require('mongoose');

const BloodDonationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
  },
  hospital: {
    name: String,
    address: String,
  },
  date: {
    type: Date,
    required: true,
  },
  time: String,
  status: {
    type: String,
    enum: ['booked', 'completed', 'cancelled'],
    default: 'booked',
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BloodDonation', BloodDonationSchema);