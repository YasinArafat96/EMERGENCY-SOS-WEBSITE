const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  bookDonation,
  getUserDonations,
  getRequests,
  completeDonation,
} = require('../controllers/bloodController');

router.post('/book', protect, bookDonation);
router.get('/donations', protect, getUserDonations);
router.get('/requests', protect, getRequests);
router.put('/:donationId/complete', protect, completeDonation);

module.exports = router;