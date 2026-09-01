const mongoose = require('mongoose');

const AlertItemSchema = new mongoose.Schema({
  id: String,
  type: String,
  icon: String,
  title: String,
  active: Boolean,
  message: String,
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { _id: false });

const DisasterCheckSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  locationName: { type: String, default: 'Unknown' },
  weather: {
    temp: Number,
    humidity: Number,
    description: String,
    windSpeed: Number,
  },
  alerts: [AlertItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DisasterCheck', DisasterCheckSchema);
