const Chat = require('../models/Chat');
const User = require('../models/User');

const DEMO_FRIEND_EMAIL = 'friend@emergencysos.com';

const getOrCreateDemoFriend = async () => {
  let demoFriend = await User.findOne({ email: DEMO_FRIEND_EMAIL });
  if (!demoFriend) {
    demoFriend = await User.create({
      name: 'Light Yagami',
      email: DEMO_FRIEND_EMAIL,
      phone: '+8801711111111',
      password: 'demo123456',
      userId: 'DEMOFRND01',
      isVerified: true,
      isOnline: true,
      walletBalance: 100,
      bloodGroup: 'B+',
      location: { lat: 23.8103, lng: 90.4125, updatedAt: new Date() },
    });
    console.log('Created demo friend for chat:', demoFriend.email);
  } else {
    demoFriend.isOnline = true;
    await demoFriend.save();
  }
  return demoFriend;
};

const ensureWelcomeChat = async (userId, demoFriendId) => {
  let chat = await Chat.findOne({
    participants: { $all: [userId, demoFriendId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, demoFriendId],
      messages: [],
      lastMessage: null,
    });
    return chat;
  }

  return chat;
};

const attachDemoFriendToUser = async (user) => {
  if (!user || user.email === DEMO_FRIEND_EMAIL) return null;

  const demoFriend = await getOrCreateDemoFriend();
  const alreadyLinked = user.primaryHelpers.some(
    (id) => id.toString() === demoFriend._id.toString()
  );

  if (!alreadyLinked) {
    user.primaryHelpers.push(demoFriend._id);
    await user.save();
  }

  await ensureWelcomeChat(user._id, demoFriend._id);
  return demoFriend;
};

module.exports = {
  DEMO_FRIEND_EMAIL,
  getOrCreateDemoFriend,
  attachDemoFriendToUser,
  ensureWelcomeChat,
};