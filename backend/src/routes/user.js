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
  sendFriendRequest,
  getFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  uploadAvatar,
} = require('../controllers/userController');

const { uploadSingle, handleUploadError } = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/primary-helper', protect, addPrimaryHelper);
router.get('/primary-helpers', protect, getPrimaryHelpers);
router.put('/location', protect, updateLocation);
router.get('/nearby-helpers', protect, getNearbyHelpers);

router.post('/friend-request', protect, sendFriendRequest);
router.get('/friend-requests', protect, getFriendRequests);
router.get('/sent-friend-requests', protect, getSentFriendRequests);
router.put('/friend-request/:requestId/accept', protect, acceptFriendRequest);
router.put('/friend-request/:requestId/reject', protect, rejectFriendRequest);
router.get('/friends', protect, getFriends);
router.delete('/friends/:friendId', protect, removeFriend);

router.get('/:userId', protect, getUserById);

// Upload avatar
router.post('/profile/avatar', protect, uploadSingle, handleUploadError, uploadAvatar);

module.exports = router;
