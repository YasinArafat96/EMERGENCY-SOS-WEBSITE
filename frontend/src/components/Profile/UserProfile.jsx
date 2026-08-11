import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaTint, FaEdit, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`);
      setProfile(data);
      setEditData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, editData);
      setProfile(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-purple-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-sos-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaEdit />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-20 h-20 bg-sos-red rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-gray-400">User ID: {profile.userId}</p>
                <p className="text-sm text-gray-500">
                  {profile.isOnline ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <FaUser />
                  <span className="text-sm">Full Name</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.name}</p>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <FaEnvelope />
                  <span className="text-sm">Email</span>
                </div>
                <p className="text-white font-medium">{profile.email}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <FaPhone />
                  <span className="text-sm">Phone</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.phone}</p>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <FaIdCard />
                  <span className="text-sm">User ID</span>
                </div>
                <p className="text-white font-medium">{profile.userId}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
<FaTint />
                  <span className="text-sm">Blood Group</span>
                </div>
                {isEditing ? (
                  <select
                    value={editData.bloodGroup || ''}
                    onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-white font-medium">{profile.bloodGroup || 'Not set'}</p>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-gray-400 mb-2">
                  <FaWallet />
                  <span className="text-sm">Emergency Balance</span>
                </div>
                <p className="text-white font-medium">৳{profile.walletBalance || 0}</p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">Emergency Contacts</h3>
              {profile.emergencyContacts?.length > 0 ? (
                <div className="space-y-2">
                  {profile.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white">{contact.name}</p>
                        <p className="text-sm text-gray-400">{contact.relation}</p>
                        <p className="text-sm text-gray-400">{contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No emergency contacts added</p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <button
                onClick={updateProfile}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            )}

            <button
              onClick={logout}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-red-500/30"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;