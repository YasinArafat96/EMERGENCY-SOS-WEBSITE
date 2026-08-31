const ActivityLog = require('../models/ActivityLog');

// Return demo vehicles around provided lat/lng
exports.getDemoVehicles = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 23.8103;
    const lng = parseFloat(req.query.lng) || 90.4125;

    // create demo vehicles with offsets (meters)
    const demo = [];
    const mk = (id, type, dLat, dLng, speed) => ({ id, type, lat: lat + dLat, lng: lng + dLng, status: 'coming', speed });

    demo.push(mk('amb-1','ambulance', 0.02, 0.01, 12));
    demo.push(mk('amb-2','ambulance', -0.015, -0.012, 14));
    demo.push(mk('amb-3','ambulance', 0.01, -0.02, 10));
    demo.push(mk('fire-1','fire', -0.02, 0.02, 16));
    demo.push(mk('fire-2','fire', 0.025, -0.01, 13));

    res.json({ vehicles: demo });
  } catch (err) {
    console.error('getDemoVehicles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Book an ambulance (simple demo) - logs activity
exports.bookAmbulance = async (req, res) => {
  try {
    const { name, phone, pickup } = req.body || {};
    // create activity log if user is present
    try {
      if (req.user && req.user._id) {
        await ActivityLog.create({ user: req.user._id, action: 'Booked ambulance', details: { name, phone, pickup } });
      }
    } catch (logErr) { console.warn('Failed to log ambulance booking', logErr.message); }

    // return demo booking
    res.json({ message: 'Ambulance booked', booking: { id: 'bk-' + Date.now(), name, phone, pickup, eta_minutes: 8 } });
  } catch (err) {
    console.error('bookAmbulance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};