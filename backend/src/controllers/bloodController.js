const BloodDonation = require('../models/BloodDonation');
const User = require('../models/User');

exports.bookDonation = async (req, res) => {
  try {
    const { bloodType, date, time, hospital } = req.body;

    const donation = new BloodDonation({
      userId: req.user._id,
      bloodType,
      date,
      time,
      hospital,
    });

    await donation.save();

    res.status(201).json({
      message: 'Blood donation booked successfully',
      donation,
    });
  } catch (error) {
    console.error('Book donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDonations = async (req, res) => {
  try {
    const donations = await BloodDonation.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    // Mock emergency blood requests from hospitals
    // In production, these would come from hospital database
    const mockRequests = [
      {
        bloodGroup: 'A+',
        hospital: { name: 'Dhaka Medical College', address: 'Dhaka' },
        distance: '1.2 km',
        timeAgo: '10 mins',
        isEmergency: true,
      },
      {
        bloodGroup: 'O-',
        hospital: { name: 'Square Hospital', address: 'Dhaka' },
        distance: '2.5 km',
        timeAgo: '30 mins',
        isEmergency: true,
      },
      {
        bloodGroup: 'B+',
        hospital: { name: 'Apollo Hospital', address: 'Dhaka' },
        distance: '3.8 km',
        timeAgo: '1 hour',
        isEmergency: false,
      },
    ];

    res.json(mockRequests);
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeDonation = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await BloodDonation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    donation.status = 'completed';
    await donation.save();

    res.json({ message: 'Donation completed successfully' });
  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};