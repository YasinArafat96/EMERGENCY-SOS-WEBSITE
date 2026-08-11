const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateChat,
  sendMessage,
  getUserChats,
  markMessagesRead,
} = require('../controllers/chatController');

router.get('/', protect, getUserChats);
router.get('/:otherUserId', protect, getOrCreateChat);
router.post('/:chatId/messages', protect, sendMessage);
router.put('/:chatId/read', protect, markMessagesRead);

module.exports = router;