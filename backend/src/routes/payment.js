const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWalletBalance,
  initiatePayment,
} = require('../controllers/paymentController');

router.get('/wallet', protect, getWalletBalance);
router.post('/pay', protect, initiatePayment);

module.exports = router;