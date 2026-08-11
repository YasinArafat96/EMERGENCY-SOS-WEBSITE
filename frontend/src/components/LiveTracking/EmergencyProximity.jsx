import React, { useState, useEffect } from 'react';
import { FaHospital, FaShieldAlt, FaPhoneAlt, FaEdit, FaAmbulance, FaFireExtinguisher, FaShieldAlt as FaShield } from 'react-icons/fa';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const EmergencyProximity = ({ location, emergencyContacts, onAddContact, onCall }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [nearbyServices, setNearbyServices] = useState({
    hospitals: [
      { name: 'Dhaka Medical College', distance: '1.2 km', phone: '+8801712345678' },
      { name: 'Square Hospital', distance: '2.5 km', phone: '+8801812345678' },
      { name: 'Apollo Hospital', distance: '3.8 km', phone: '+8801912345678' }
    ],
    police: [
      { name: 'Tejgaon Police Station', distance: '0.8 km', phone: '+880213456789' },
      { name: 'Gulshan Police Station', distance: '1.5 km', phone: '+880223456789' }
    ],
    fire: [
      { name: 'Dhaka Fire Station', distance: '2.0 km', phone: '+880243456789' }
    ]
  });

  useEffect(() => {
    // In production, fetch nearby services based on location
    if (location) {
      // Would call Google Places API here
      console.log('Fetching services near:', location);
    }
  }, [location]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone || !newContact.relation) {
      toast.error('Please fill in all fields');
      return;
    }

    onAddContact(newContact);
    setNewContact({ name: '', phone: '', relation: '' });
    setShowEdit(false);
    toast.success('Emergency contact added!');
  };

  const EmergencyButton = ({ icon: Icon, label, phone, color }) => (
    <button
      onClick={() => onCall(phone)}
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${color} hover:opacity-80 w-full`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="text-xl" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <FaPhoneAlt className="text-sm" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Nearby Hospitals */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
          <FaHospital className="text-red-500" />
          <span>Nearby Hospitals</span>
          <span className="text-xs text-gray-500 ml-auto">{nearbyServices.hospitals.length} found</span>
        </h4>
        <div className="space-y-2">
          {nearbyServices.hospitals.map((hospital, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm text-white">{hospital.name}</p>
                <p className="text-xs text-gray-500">📍 {hospital.distance}</p>
              </div>
              <button
                onClick={() => onCall(hospital.phone)}
                className="text-green-500 hover:text-green-400 transition-colors text-sm flex items-center space-x-1"
              >
                <FaPhoneAlt />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Police Stations */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
<FaShieldAlt className="text-blue-500" />
          <span>Nearby Police Stations</span>
          <span className="text-xs text-gray-500 ml-auto">{nearbyServices.police.length} found</span>
        </h4>
        <div className="space-y-2">
          {nearbyServices.police.map((station, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm text-white">{station.name}</p>
                <p className="text-xs text-gray-500">📍 {station.distance}</p>
              </div>
              <button
                onClick={() => onCall(station.phone)}
                className="text-green-500 hover:text-green-400 transition-colors text-sm flex items-center space-x-1"
              >
                <FaPhoneAlt />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fire Services */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
          <FaFireExtinguisher className="text-orange-500" />
          <span>Fire Services</span>
          <span className="text-xs text-gray-500 ml-auto">{nearbyServices.fire.length} found</span>
        </h4>
        <div className="space-y-2">
          {nearbyServices.fire.map((service, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm text-white">{service.name}</p>
                <p className="text-xs text-gray-500">📍 {service.distance}</p>
              </div>
              <button
                onClick={() => onCall(service.phone)}
                className="text-green-500 hover:text-green-400 transition-colors text-sm flex items-center space-x-1"
              >
                <FaPhoneAlt />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
            <FaShieldAlt className="text-yellow-500" />
            <span>Emergency Contacts</span>
          </h4>
          <button
            onClick={() => setShowEdit(true)}
            className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors flex items-center space-x-1"
          >
            <FaEdit />
            <span>Edit</span>
          </button>
        </div>

        {emergencyContacts && emergencyContacts.length > 0 ? (
          <div className="space-y-2">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-white">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.relation} • {contact.phone}</p>
                </div>
                <button
                  onClick={() => onCall(contact.phone)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                >
                  <FaPhoneAlt />
                  <span>Call</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">
            No emergency contacts added
          </p>
        )}
      </div>

      {/* Add Contact Modal */}
      {showEdit && (
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
                placeholder="Relation (e.g., Father, Mother, Brother)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddContact}
                className="flex-1 bg-sos-red hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowEdit(false)}
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

export default EmergencyProximity;