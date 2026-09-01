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

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatar = fileUrl;
    await user.save();
    res.json({ message: 'Avatar uploaded', avatar: fileUrl, user });
  } catch (error) {
    console.error('Upload avatar error:', error);
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

exports.sendFriendRequest = async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ message: 'Email or User ID is required' });
    }

    let targetUser;
    if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      targetUser = await User.findOne({ userId });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const currentUser = await User.findById(req.user._id);

    if (currentUser.friends.some((id) => id.toString() === targetUser._id.toString())) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    const alreadySent = targetUser.friendRequests.some(
      (req) =>
        req.from.toString() === currentUser._id.toString() &&
        req.status === 'pending'
    );

    if (alreadySent) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const incomingFromTarget = currentUser.friendRequests.find(
      (req) =>
        req.from.toString() === targetUser._id.toString() &&
        req.status === 'pending'
    );

    if (incomingFromTarget) {
      return res.status(400).json({
        message: 'This user has already sent you a friend request. Please accept it instead.',
      });
    }

    targetUser.friendRequests.push({
      from: currentUser._id,
      status: 'pending',
    });
    await targetUser.save();

    const io = require('../config/socket').getIO();
    io.to(`user-${targetUser._id}`).emit('friend-request', {
      from: {
        _id: currentUser._id,
        name: currentUser.name,
        userId: currentUser.userId,
      },
    });

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'name userId isOnline email');

    const pending = user.friendRequests.filter((req) => req.status === 'pending');
    res.json(pending);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSentFriendRequests = async (req, res) => {
  try {
    const users = await User.find({
      'friendRequests.from': req.user._id,
      'friendRequests.status': 'pending',
    }).select('name userId isOnline email friendRequests');

    const sent = users.map((u) => {
      const request = u.friendRequests.find(
        (r) =>
          r.from.toString() === req.user._id.toString() &&
          r.status === 'pending'
      );
      return {
        _id: u._id,
        name: u.name,
        userId: u.userId,
        isOnline: u.isOnline,
        email: u.email,
        requestId: request._id,
        sentAt: request.createdAt,
      };
    });

    res.json(sent);
  } catch (error) {
    console.error('Get sent friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const friendId = request.from;
    request.status = 'accepted';

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
    }
    await user.save();

    const friend = await User.findById(friendId);
    if (friend && !friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
      await friend.save();
    }

    const io = require('../config/socket').getIO();
    io.to(`user-${friendId}`).emit('friend-request-accepted', {
      user: {
        _id: user._id,
        name: user.name,
        userId: user.userId,
      },
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'rejected';
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name userId isOnline email phone');

    res.json(user.friends || []);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    const user = await User.findById(req.user._id);
    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId
    );
    await user.save();

    const friend = await User.findById(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await friend.save();
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
