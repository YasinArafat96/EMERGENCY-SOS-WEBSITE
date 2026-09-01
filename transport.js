const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const transport = require('../controllers/transportController');

// Demo vehicles (public)
router.get('/vehicles', transport.getDemoVehicles);

// Book ambulance (protected)
router.post('/book', protect, transport.bookAmbulance);

module.exports = router;