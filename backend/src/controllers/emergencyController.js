const Emergency = require('../models/Emergency');
const User = require('../models/User');
const { getIO } = require('../config/socket');

exports.createEmergency = async (req, res) => {
  try {
    const { type, description, location } = req.body;
    
    const emergency = new Emergency({
      userId: req.user._id,
      type: type || 'detail',
      description,
      location,
    });

    await emergency.save();

    // Notify via socket (safe if socket not initialized)
    try {
      const io = getIO();
      io.to('emergency-channel').emit('new-emergency', {
        emergency,
        user: {
          id: req.user._id,
          name: req.user.name,
          userId: req.user.userId,
        },
      });

      // Notify each primary helper individually
      const user = await User.findById(req.user._id).select('primaryHelpers');
      if (user && user.primaryHelpers && user.primaryHelpers.length > 0) {
        user.primaryHelpers.forEach(helperId => {
          io.to(`user-${helperId}`).emit('emergency-alert', {
            emergency,
            user: {
              id: req.user._id,
              name: req.user.name,
              userId: req.user.userId,
            },
          });
        });
      }
    } catch (socketError) {
      // Socket errors shouldn't block the emergency from being created
      console.warn('Socket notification skipped:', socketError.message);
    }

    res.status(201).json({
      message: 'Emergency alert sent successfully',
      emergency,
    });
  } catch (error) {
    console.error('Emergency creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActiveEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'active' })
      .populate('userId', 'name userId phone location')
      .populate('helpers.userId', 'name userId')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(emergencies);
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.helpEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    // Check if already helping
    const alreadyHelping = emergency.helpers.some(
      h => h.userId.toString() === req.user._id.toString()
    );

    if (alreadyHelping) {
      return res.status(400).json({ message: 'Already helping this emergency' });
    }

    emergency.helpers.push({
      userId: req.user._id,
      status: 'en-route',
    });

    await emergency.save();

    const io = getIO();
    io.to(`user-${emergency.userId}`).emit('helper-confirmed', {
      emergencyId,
      helper: {
        id: req.user._id,
        name: req.user.name,
        userId: req.user.userId,
      },
    });

    res.json({ message: 'You are now helping with this emergency' });
  } catch (error) {
    console.error('Help emergency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    if (emergency.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    await emergency.save();

    const io = getIO();
    io.to('emergency-channel').emit('emergency-resolved', { emergencyId });

    res.json({ message: 'Emergency resolved successfully' });
  } catch (error) {
    console.error('Resolve emergency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json(emergencies);
  } catch (error) {
    console.error('Get user emergencies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};