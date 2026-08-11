const User = require('../models/User');

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      balance: user.walletBalance || 0,
      currency: 'BDT',
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mock bKash/Nagad integration for demo
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, method = 'bkash' } = req.body;

    // Mock payment processing
    // In production, you would integrate with actual payment APIs
    const paymentResult = {
      success: true,
      transactionId: `TXN${Date.now()}`,
      amount,
      method,
      status: 'completed',
      timestamp: new Date(),
    };

    // Update user wallet balance
    const user = await User.findById(req.user._id);
    user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
    await user.save();

    res.json({
      message: 'Payment successful',
      payment: paymentResult,
      newBalance: user.walletBalance,
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment failed' });
  }
};