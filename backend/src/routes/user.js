const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserById,
  addPrimaryHelper,
  getPrimaryHelpers,
  updateLocation,
  getNearbyHelpers,
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/:userId', protect, getUserById);
router.post('/primary-helper', protect, addPrimaryHelper);
router.get('/primary-helpers', protect, getPrimaryHelpers);
router.put('/location', protect, updateLocation);
router.get('/nearby-helpers', protect, getNearbyHelpers);

module.exports = router;