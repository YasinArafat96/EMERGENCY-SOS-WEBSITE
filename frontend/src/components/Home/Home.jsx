import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaUsers, 
  FaBullhorn, 
  FaMapMarkerAlt, 
  FaComment, 
  FaHeartbeat, 
  FaHospital, 
  FaWallet, 
  FaUserFriends,
  FaPhoneAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import StatsCard from './StatsCard';
import FlashCard from './FlashCard';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeRequests: 0,
    helpersNearby: 0,
    emergencyBalance: 0,
    unreadChats: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/emergency/active`);
      const helpers = await axios.get(`${process.env.REACT_APP_API_URL}/users/nearby-helpers?lat=23.8103&lng=90.4125&radius=2`);
      const wallet = await axios.get(`${process.env.REACT_APP_API_URL}/payment/wallet`);
      
      setStats({
        activeRequests: data.length,
        helpersNearby: helpers.data.length,
        emergencyBalance: wallet.data.balance || 0,
        unreadChats: 3 // Mock data - fetch from actual API
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity
    setRecentActivity([
      { id: 1, text: 'Samiya sent an SOS alert', time: '2 mins ago', type: 'emergency' },
      { id: 2, text: 'Rafi confirmed help', time: '10 mins ago', type: 'help' },
      { id: 3, text: 'New blood donation request', time: '25 mins ago', type: 'blood' },
    ]);
  };

  const flashCards = [
    {
      icon: FaBell,
      title: 'One Tap SOS',
      description: 'Send immediate emergency alerts',
      path: '/alerts',
      color: 'bg-red-500'
    },
    {
      icon: FaUsers,
      title: 'Incoming Help',
      description: 'See who is coming to help you',
      path: '/helpers',
      color: 'bg-blue-500'
    },
    {
      icon: FaBullhorn,
      title: 'Community Billboard',
      description: 'Share and view community updates',
      path: '/community',
      color: 'bg-purple-500'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Live Tracking',
      description: 'Real-time location sharing',
      path: '/live',
      color: 'bg-green-500'
    },
    {
      icon: FaComment,
      title: 'Emergency Chat',
      description: 'Communicate with helpers',
      path: '/chat',
      color: 'bg-yellow-500'
    },
    {
      icon: FaHeartbeat,
      title: 'Blood Donation',
      description: 'Donate or request blood',
      path: '/blood',
      color: 'bg-red-600'
    },
    {
      icon: FaHospital,
      title: 'Hospitals & Police',
      description: 'Find nearby emergency services',
      path: '/hospital',
      color: 'bg-indigo-500'
    },
    {
      icon: FaWallet,
      title: 'Emergency Payment',
      description: 'Quick payment for emergencies',
      path: '/payment',
      color: 'bg-emerald-500'
    },
    {
      icon: FaUserFriends,
      title: 'Trusted Helpers',
      description: 'Manage your emergency contacts',
      path: '/helpers',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-red-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-400 mt-1">Stay safe and alert</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button 
                onClick={() => navigate('/alerts')}
                className="sos-button flex items-center space-x-2"
              >
                <FaExclamationTriangle />
                <span>Quick SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Active Requests" 
            value={stats.activeRequests} 
            icon={FaExclamationTriangle}
            color="text-red-500"
          />
          <StatsCard 
            title="Helpers Nearby" 
            value={stats.helpersNearby} 
            icon={FaUsers}
            color="text-blue-500"
          />
          <StatsCard 
            title="Emergency Balance" 
            value={`৳${stats.emergencyBalance}`} 
            icon={FaWallet}
            color="text-emerald-500"
          />
          <StatsCard 
            title="Unread Chats" 
            value={stats.unreadChats} 
            icon={FaComment}
            color="text-yellow-500"
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">{activity.text}</span>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flash Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {flashCards.map((card, index) => (
            <FlashCard key={index} {...card} />
          ))}
        </div>

        {/* Quick Access Footer */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = 'tel:999'}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto space-x-3"
          >
            <FaPhoneAlt />
            <span>Emergency Number: 999</span>
          </button>
          <p className="text-gray-400 text-sm mt-3">Available 24/7 for emergencies</p>
        </div>
      </div>
    </div>
  );
};

export default Home;