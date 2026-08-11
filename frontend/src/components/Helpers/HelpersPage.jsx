import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaNetworkWired, FaMapMarkerAlt, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const HelpersPage = () => {
  const { user } = useAuth();
  const [emergencyFeed, setEmergencyFeed] = useState([]);
  const [networkActivity, setNetworkActivity] = useState([]);
  const [helpersNearby, setHelpersNearby] = useState([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showHelpersModal, setShowHelpersModal] = useState(false);

  useEffect(() => {
    fetchEmergencyFeed();
    fetchNetworkActivity();
    fetchHelpersNearby();
  }, []);

  const fetchEmergencyFeed = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/emergency/active`);
      setEmergencyFeed(data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching emergency feed:', error);
    }
  };

  const fetchNetworkActivity = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/emergency/active`);
      setNetworkActivity(data);
    } catch (error) {
      console.error('Error fetching network activity:', error);
    }
  };

  const fetchHelpersNearby = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/users/nearby-helpers?lat=23.8103&lng=90.4125&radius=2`);
      setHelpersNearby(data);
    } catch (error) {
      console.error('Error fetching helpers nearby:', error);
    }
  };

  const confirmHelp = async (emergencyId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/emergency/${emergencyId}/help`);
      toast.success('You are now helping with this emergency!');
      fetchEmergencyFeed();
    } catch (error) {
      toast.error('Failed to confirm help. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-blue-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Helpers Network</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Emergency Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Emergency Feed</h2>
                  <span className="text-sm text-gray-400">{emergencyFeed.length} active</span>
                </div>

                <div className="space-y-4">
                  {emergencyFeed.map((emergency) => (
                    <div key={emergency._id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{emergency.userId?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-400">ID: {emergency.userId?.userId}</p>
                          <p className="text-sm text-gray-300 mt-2">{emergency.description || 'Emergency alert'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(emergency.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => confirmHelp(emergency._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <FaCheckCircle />
                          <span>Confirm Help</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {emergencyFeed.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No active emergencies</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Network Activity */}
              <div className="bg-white/5 rounded-xl p-6">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowNetworkModal(true)}
                >
                  <h2 className="text-xl font-bold text-white">Network Activity</h2>
                  <FaNetworkWired className="text-blue-500 text-xl" />
                </div>
                <p className="text-sm text-gray-400 mt-2">{networkActivity.length} total active requests</p>
                <button 
                  onClick={() => setShowNetworkModal(true)}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All Activities →
                </button>
              </div>

              {/* Your Vicinity */}
              <div className="bg-white/5 rounded-xl p-6">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowHelpersModal(true)}
                >
                  <h2 className="text-xl font-bold text-white">Your Vicinity</h2>
                  <FaUsers className="text-green-500 text-xl" />
                </div>
                <p className="text-sm text-gray-400 mt-2">{helpersNearby.length} helpers nearby</p>
                <p className="text-xs text-gray-500">Within 2km radius of your location</p>
                <button 
                  onClick={() => setShowHelpersModal(true)}
                  className="mt-3 text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  View All Helpers →
                </button>
              </div>

              {/* Mini Map */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FaMapMarkerAlt className="text-red-500" />
                  <h2 className="text-xl font-bold text-white">Active Location</h2>
                </div>
                <div className="bg-sos-dark rounded-lg h-48 flex items-center justify-center border border-white/10">
                  <p className="text-gray-400">Map view of active emergencies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Activity Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Network Activity</h3>
              <button
                onClick={() => setShowNetworkModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {networkActivity.map((emergency) => (
                <div key={emergency._id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{emergency.userId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{emergency.type} • {new Date(emergency.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        confirmHelp(emergency._id);
                        setShowNetworkModal(false);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Help
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helpers Nearby Modal */}
      {showHelpersModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Helpers Nearby</h3>
              <button
                onClick={() => setShowHelpersModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {helpersNearby.map((helper) => (
                <div key={helper._id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{helper.name}</p>
                      <p className="text-sm text-gray-400">ID: {helper.userId}</p>
                    </div>
                    <span className="text-xs text-green-500">● Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpersPage;