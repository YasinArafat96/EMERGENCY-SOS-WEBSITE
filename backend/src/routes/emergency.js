const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createEmergency,
  getActiveEmergencies,
  helpEmergency,
  resolveEmergency,
  getUserEmergencies,
} = require('../controllers/emergencyController');

router.post('/', protect, createEmergency);
router.get('/active', protect, getActiveEmergencies);
router.post('/:emergencyId/help', protect, helpEmergency);
router.put('/:emergencyId/resolve', protect, resolveEmergency);
router.get('/user', protect, getUserEmergencies);

module.exports = router;