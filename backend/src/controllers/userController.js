const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, emergencyContacts } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (emergencyContacts) user.emergencyContacts = emergencyContacts;
    
    await user.save();
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .select('name userId isOnline bloodGroup');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addPrimaryHelper = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const helper = await User.findOne({ userId });
    if (!helper) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.primaryHelpers.includes(helper._id)) {
      return res.status(400).json({ message: 'Already a primary helper' });
    }

    user.primaryHelpers.push(helper._id);
    await user.save();

    // Send notification to helper
    const io = require('../config/socket').getIO();
    io.to(`user-${helper._id}`).emit('helper-request', {
      userId: req.user._id,
      name: req.user.name,
    });

    res.json({ message: 'Primary helper added successfully' });
  } catch (error) {
    console.error('Add primary helper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPrimaryHelpers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('primaryHelpers', 'name userId isOnline phone');
    
    res.json(user.primaryHelpers);
  } catch (error) {
    console.error('Get primary helpers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: { lat, lng, updatedAt: new Date() },
      },
      { new: true }
    );

    res.json({ message: 'Location updated', location: user.location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNearbyHelpers = async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query; // radius in km
    
    // Convert radius to radians for MongoDB geospatial query
    const radiusInRadians = radius / 6371;
    
    const users = await User.find({
      _id: { $ne: req.user._id },
      isOnline: true,
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians],
        },
      },
    }).select('name userId location isOnline');

    res.json(users);
  } catch (error) {
    console.error('Get nearby helpers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};