const Chat = require('../models/Chat');
const { getIO } = require('../config/socket');

const findChatForParticipant = async (chatOrUserId, userId) => {
  let chat = await Chat.findById(chatOrUserId);
  if (
    chat &&
    chat.participants.some((p) => p.toString() === userId.toString())
  ) {
    return chat;
  }

  chat = await Chat.findOne({
    participants: { $all: [userId, chatOrUserId] },
  });

  if (!chat) {
    chat = new Chat({
      participants: [userId, chatOrUserId],
      messages: [],
    });
    await chat.save();
  }

  return chat;
};

exports.getOrCreateChat = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, otherUserId],
        messages: [],
      });
      await chat.save();
    }

    await chat.populate('participants', 'name userId isOnline');
    await chat.populate('messages.senderId', 'name userId');

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;

    const chat = await findChatForParticipant(chatId, req.user._id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      senderId: req.user._id,
      content,
      type,
      timestamp: new Date(),
    });
    chat.lastMessage = {
      content,
      timestamp: new Date(),
    };
    await chat.save();

    // Populate directly on the saved chat document (not a plain object)
    await chat.populate('messages.senderId', 'name userId');
    const populatedMessage = chat.messages[chat.messages.length - 1];

    const io = getIO();
    chat.participants.forEach((participantId) => {
      const peerId = chat.participants.find(
        (p) => p.toString() !== participantId.toString()
      );
      io.to(`user-${participantId}`).emit('receive-message', {
        chatId: peerId.toString(),
        message: populatedMessage,
      });
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'name userId isOnline')
      .sort({ 'lastMessage.timestamp': -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.forEach(message => {
      if (message.senderId.toString() !== req.user._id.toString()) {
        message.isRead = true;
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};