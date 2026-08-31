const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const alerts = require('../controllers/alertsController');

// Push SOS (uses socket and optional Gemini)
router.post('/sos-push', protect, alerts.pushSOS);

// Get disaster alerts by location
router.get('/disaster', alerts.getDisasterAlerts);

// Current weather for coordinates
router.get('/weather', alerts.getCurrentWeather);

// Gemini chat proxy (made public for local dev/testing)
router.post('/gemini-chat', alerts.chatGemini);

module.exports = router;
