const express = require('express');
const router = express.Router();
const features = require('../controllers/featuresController');

// Activity logs
router.post('/log', features.createLog);
router.get('/logs', features.getLogs);

// Disaster notifications
router.post('/disasters', features.createDisaster);
router.get('/disasters', features.getDisasters);

// Safe zones
router.post('/safezones', features.createSafeZone);
router.get('/safezones', features.getSafeZones);
router.delete('/safezones/:id', features.deleteSafeZone);

module.exports = router;
