const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  uploadSingle,
  handleUploadError,
} = require('../middleware/upload');

const {
  getOrCreateChat,
  sendMessage,
  uploadMessageFile,
  getUserChats,
  markMessagesRead,
  unsendMessage,
} = require('../controllers/chatController');

router.get('/', protect, getUserChats);

router.get(
  '/:otherUserId',
  protect,
  getOrCreateChat
);

router.post(
  '/:chatId/messages',
  protect,
  sendMessage
);

router.post(
  '/:chatId/messages/file',
  protect,
  uploadSingle,
  handleUploadError,
  uploadMessageFile
);

router.put(
  '/:chatId/read',
  protect,
  markMessagesRead
);

router.put(
  '/:chatId/messages/:messageId/unsend',
  protect,
  unsendMessage
);

module.exports = router;
