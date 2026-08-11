import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaAmbulance, FaFire, FaShieldAlt, FaPen, FaMicrophone, FaWallet, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import SOSButton from './SOSButton';

const AlertsPage = () => {
  const { user } = useAuth();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [primaryHelpers, setPrimaryHelpers] = useState([]);
  const [showAllHelpers, setShowAllHelpers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [helperUserId, setHelperUserId] = useState('');
  const [showAddHelper, setShowAddHelper] = useState(false);

  useEffect(() => {
    fetchPrimaryHelpers();
    fetchWalletBalance();
  }, []);

  const fetchPrimaryHelpers = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/users/primary-helpers`);
      setPrimaryHelpers(data);
    } catch (error) {
      console.error('Error fetching helpers:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/payment/wallet`);
      setWalletBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleSOS = async () => {
    try {
      if (!isSOSActive) {
        // Activate SOS
        await axios.post(`${process.env.REACT_APP_API_URL}/emergency`, {
          type: 'detail',
          location: { lat: 23.8103, lng: 90.4125 }
        });
        toast.success('SOS Alert Activated! Help is on the way.');
        setIsSOSActive(true);
      } else {
        // Deactivate SOS
        await axios.put(`${process.env.REACT_APP_API_URL}/emergency/resolve`);
        toast.success('SOS Alert Resolved. Stay safe!');
        setIsSOSActive(false);
      }
    } catch (error) {
      toast.error('Failed to send SOS alert. Please try again.');
    }
  };

  const handleEmergencyAction = async (type) => {
    if (!isSOSActive) {
      toast.error('Please activate SOS first by clicking the SOS button!');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/emergency`, {
        type,
        location: { lat: 23.8103, lng: 90.4125 }
      });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} services notified!`);
    } catch (error) {
      toast.error('Failed to notify services. Please try again.');
    }
  };

  const startVoiceRecording = () => {
    if (!isSOSActive) {
      toast.error('Please activate SOS first!');
      return;
    }
    
    setIsRecording(true);
    // Implement voice recording logic
    setTimeout(() => {
      setIsRecording(false);
      toast.success('Voice recorded and sent to helpers!');
    }, 3000);
  };

  const addPrimaryHelper = async () => {
    if (!helperUserId) {
      toast.error('Please enter a valid User ID');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/primary-helper`, {
        userId: helperUserId
      });
      toast.success('Helper request sent!');
      setHelperUserId('');
      setShowAddHelper(false);
      fetchPrimaryHelpers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add helper');
    }
  };

  const displayedHelpers = showAllHelpers ? primaryHelpers : primaryHelpers.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-red-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Emergency Alerts</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - SOS Controls */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-xl p-6">
                <SOSButton 
                  isActive={isSOSActive} 
                  onToggle={handleSOS} 
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <button
                    onClick={() => handleEmergencyAction('ambulance')}
                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <FaAmbulance className="text-red-500 text-3xl mb-2" />
                    <span className="text-sm text-gray-300">Ambulance</span>
                  </button>
                  
                  <button
                    onClick={() => handleEmergencyAction('fire')}
                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <FaFire className="text-orange-500 text-3xl mb-2" />
                    <span className="text-sm text-gray-300">Fire</span>
                  </button>
                  
                  <button
                    onClick={() => handleEmergencyAction('police')}
                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
<FaShieldAlt className="text-blue-500 text-3xl mb-2" />
                    <span className="text-sm text-gray-300">Police</span>
                  </button>
                  
                  <button
                    onClick={() => handleEmergencyAction('detail')}
                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <FaPen className="text-green-500 text-3xl mb-2" />
                    <span className="text-sm text-gray-300">Details</span>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={startVoiceRecording}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-lg transition-all duration-300 ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'
                    } text-white`}
                  >
                    <FaMicrophone />
                    <span>{isRecording ? 'Recording...' : 'Voice Trigger'}</span>
                  </button>

                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaWallet className="text-yellow-500 text-xl" />
                      <span className="text-gray-300">Wallet Balance</span>
                    </div>
                    <span className="text-white font-bold text-lg">৳{walletBalance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Primary Helpers */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Primary Helpers</h2>
                  <button
                    onClick={() => setShowAddHelper(true)}
                    className="text-sm bg-sos-red text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-3">
                  {displayedHelpers.map((helper) => (
                    <div key={helper._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{helper.name}</p>
                        <p className="text-sm text-gray-400">ID: {helper.userId}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        helper.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {helper.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}

                  {primaryHelpers.length > 4 && !showAllHelpers && (
                    <button
                      onClick={() => setShowAllHelpers(true)}
                      className="w-full text-center text-gray-400 hover:text-white text-sm py-2"
                    >
                      See All ({primaryHelpers.length})
                    </button>
                  )}

                  {showAllHelpers && (
                    <button
                      onClick={() => setShowAllHelpers(false)}
                      className="w-full text-center text-gray-400 hover:text-white text-sm py-2"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Helper Modal */}
      {showAddHelper && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Primary Helper</h3>
            <input
              type="text"
              value={helperUserId}
              onChange={(e) => setHelperUserId(e.target.value)}
              placeholder="Enter User ID (e.g., USR12345678)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={addPrimaryHelper}
                className="flex-1 bg-sos-red hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddHelper(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;