import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaHospital, FaShieldAlt, FaPhoneAlt, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const LiveTracking = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [nearbyHospitals, setNearbyHospitals] = useState([
    { name: 'Dhaka Medical College', distance: '1.2 km' },
    { name: 'Square Hospital', distance: '2.5 km' },
    { name: 'Apollo Hospital', distance: '3.8 km' }
  ]);
  const [nearbyPolice, setNearbyPolice] = useState([
    { name: 'Tejgaon Police Station', distance: '0.8 km' },
    { name: 'Gulshan Police Station', distance: '1.5 km' },
    { name: 'Banani Police Station', distance: '2.1 km' }
  ]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (BRAC University)
          setLocation({ lat: 23.8103, lng: 90.4125 });
        }
      );
    }

    // Fetch emergency contacts
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`);
      setEmergencyContacts(data.emergencyContacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const addEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relation) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const updatedContacts = [...emergencyContacts, newContact];
      await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, {
        emergencyContacts: updatedContacts
      });
      setEmergencyContacts(updatedContacts);
      setNewContact({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
      toast.success('Emergency contact added!');
    } catch (error) {
      toast.error('Failed to add contact');
    }
  };

  const callContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-green-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Live Location Tracking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Map */}
            <div className="lg:col-span-2">
              <div className="rounded-xl overflow-hidden h-96 md:h-[500px] border border-white/10 relative">
                {location ? (
                  <iframe
                    title="Live Location Map"
                    className="w-full h-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${location.lat},${location.lng}&hl=en&z=15&output=embed&markers=color:red%7Clabel:S%7C${location.lat},${location.lng}`}
                  />
                ) : (
                  <div className="bg-sos-dark flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 text-6xl mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-400">Fetching your location...</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg text-sm text-gray-200 flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>GPS Enabled</span>
                </div>
              </div>

              <div className="mt-4 bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-400">Current Location</p>
                  </div>
                  <button className="bg-sos-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Update Location
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Proximity */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Emergency Proximity</h2>

                {/* Hospitals */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <FaHospital className="text-red-500 mr-2" /> Nearby Hospitals
                  </h3>
                  {nearbyHospitals.map((hospital, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg mb-2">
                      <span className="text-sm text-gray-300">{hospital.name}</span>
                      <span className="text-xs text-gray-500">{hospital.distance}</span>
                    </div>
                  ))}
                </div>

                {/* Police Stations */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
<FaShieldAlt className="text-blue-500 mr-2" /> Nearby Police Stations
                  </h3>
                  {nearbyPolice.map((station, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg mb-2">
                      <span className="text-sm text-gray-300">{station.name}</span>
                      <span className="text-xs text-gray-500">{station.distance}</span>
                    </div>
                  ))}
                </div>

                {/* Emergency Contact */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-300">Emergency Contact</h3>
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors flex items-center space-x-1"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </div>
                  
                  {emergencyContacts.length > 0 ? (
                    emergencyContacts.map((contact, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 mb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-400">{contact.relation}</p>
                          </div>
                          <button
                            onClick={() => callContact(contact.phone)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                          >
                            <FaPhoneAlt />
                            <span>Call</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No emergency contacts added</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Emergency Contact</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Contact Name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
              />
              
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
              />
              
              <input
                type="text"
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                placeholder="Relation (e.g., Father, Brother)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addEmergencyContact}
                className="flex-1 bg-sos-red hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowAddContact(false)}
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

export default LiveTracking;