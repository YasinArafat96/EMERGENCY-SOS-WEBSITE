const mongoose = require('mongoose');

const SafeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  radius: { type: Number, default: 100 }, // meters
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SafeZone', SafeZoneSchema);
