const Chat = require('../models/Chat');
const { getIO } = require('../config/socket');

exports.getOrCreateChat = async (req, res) => {
  try {
    const { otherUserId } = req.params;

    let chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, otherUserId],
      },
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, otherUserId],
        messages: [],
      });

      await chat.save();
    }

    await chat.populate(
      'participants',
      'name userId isOnline'
    );

    await chat.populate(
      'messages.senderId',
      'name userId'
    );

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: 'Chat not found',
      });
    }

    // Check that current user belongs to this chat
    const isParticipant = chat.participants.some(
      (participantId) =>
        participantId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not a participant of this chat',
      });
    }

    if (!content) {
      return res.status(400).json({
        message: 'Message content is required',
      });
    }

    const message = {
      senderId: req.user._id,
      content,
      type,
      timestamp: new Date(),
    };

    chat.messages.push(message);

    chat.lastMessage = {
      content:
        type === 'image'
          ? '📷 Image'
          : type === 'file'
          ? '📎 File'
          : content,
      timestamp: new Date(),
    };

    await chat.save();

    const populatedMessage = await Chat.populate(message, {
      path: 'senderId',
      select: 'name userId',
    });

    const io = getIO();

    // Send realtime message ONLY to other participants.
    // Sender already gets the HTTP response.
    chat.participants.forEach((participantId) => {
      if (
        participantId.toString() !==
        req.user._id.toString()
      ) {
        io.to(`user-${participantId}`).emit(
          'receive-message',
          {
            chatId: chat._id.toString(),
            message: populatedMessage,
          }
        );
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

exports.uploadMessageFile = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: 'Chat not found',
      });
    }

    // Check participant
    const isParticipant = chat.participants.some(
      (participantId) =>
        participantId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not a participant of this chat',
      });
    }

    const isImage = req.file.mimetype.startsWith('image/');

    const messageType = isImage
      ? 'image'
      : 'file';

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const message = {
      senderId: req.user._id,
      content: fileUrl,
      type: messageType,
      timestamp: new Date(),
    };

    chat.messages.push(message);

    chat.lastMessage = {
      content: isImage ? '📷 Image' : '📎 File',
      timestamp: new Date(),
    };

    await chat.save();

    const populatedMessage = await Chat.populate(message, {
      path: 'senderId',
      select: 'name userId',
    });

    const io = getIO();

    // Send to receiver only
    chat.participants.forEach((participantId) => {
      if (
        participantId.toString() !==
        req.user._id.toString()
      ) {
        io.to(`user-${participantId}`).emit(
          'receive-message',
          {
            chatId: chat._id.toString(),
            message: populatedMessage,
          }
        );
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Upload message error:', error);

    res.status(500).json({
      message: 'Failed to upload file',
    });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate(
        'participants',
        'name userId isOnline'
      )
      .sort({
        'lastMessage.timestamp': -1,
      });

    res.json(chats);
  } catch (error) {
    console.error('Get user chats error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: 'Chat not found',
      });
    }

    chat.messages.forEach((message) => {
      if (
        message.senderId.toString() !==
        req.user._id.toString()
      ) {
        message.isRead = true;
      }
    });

    await chat.save();

    res.json({
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark messages read error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};
