const CommunityPost = require('../models/CommunityPost');
const Emergency = require('../models/Emergency');
const User = require('../models/User');

const seedDemoData = async () => {
  // Ensure we have at least one demo user for foreign keys
  let demoUser = await User.findOne({ email: 'demo@emergencysos.com' });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@emergencysos.com',
      phone: '+8801700000000',
      password: 'demo123456',
      isVerified: true,
      isOnline: true,
      walletBalance: 500,
      bloodGroup: 'O+',
      location: { lat: 23.8103, lng: 90.4125, updatedAt: new Date() },
    }).catch(() => null);
  }

  // Seed demo community posts
  const postCount = await CommunityPost.countDocuments();
  if (postCount === 0) {
    const posts = [
      {
        content: 'Urgent: Blood needed for a patient at Dhaka Medical College. Blood group A+ required. Please help if you can!',
        tags: ['blood', 'emergency'],
        location: 'Dhaka Medical College',
        isEmergency: true,
      },
      {
        content: 'Heavy rain warning in the Dhaka area. Please stay safe and avoid low-lying areas.',
        tags: ['disaster', 'safety'],
        location: 'Dhaka',
        isEmergency: false,
      },
      {
        content: 'Looking for a lost child near Gulshan-2. Last seen wearing a red shirt. Please contact if you have any info.',
        tags: ['lost-child', 'disaster'],
        location: 'Gulshan, Dhaka',
        isEmergency: true,
      },
      {
        content: 'Community blood donation drive this Saturday at Apollo Hospital. All blood types welcome!',
        tags: ['blood', 'general'],
        location: 'Apollo Hospital',
        isEmergency: false,
      },
    ];

    for (const post of posts) {
      if (demoUser) {
        await CommunityPost.create({
          userId: demoUser._id,
          ...post,
          likes: [],
          comments: [],
        });
      }
    }
    console.log('Seeded demo community posts');
  }

  // Seed a demo active emergency if none exist
  const emergencyCount = await Emergency.countDocuments();
  if (emergencyCount === 0 && demoUser) {
    await Emergency.create({
      userId: demoUser._id,
      type: 'ambulance',
      status: 'active',
      description: 'Demo emergency alert - someone needs medical assistance at BRAC University',
      location: { lat: 23.8103, lng: 90.4125, address: 'BRAC University, Dhaka' },
      helpers: [],
    });
    console.log('Seeded demo emergency');
  }
};

module.exports = seedDemoData;
