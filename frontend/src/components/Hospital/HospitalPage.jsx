import React, { useState } from 'react';
import { FaHospital, FaShieldAlt, FaPhoneAlt, FaAmbulance, FaStar } from 'react-icons/fa';

const HospitalPage = () => {
  const [activeTab, setActiveTab] = useState('hospitals');

  const hospitals = [
    { name: 'Dhaka Medical College', address: 'Dhaka', distance: '1.2 km', phone: '+8801712345678', rating: 4.5 },
    { name: 'Square Hospital', address: 'Dhaka', distance: '2.5 km', phone: '+8801812345678', rating: 4.7 },
    { name: 'Apollo Hospital', address: 'Dhaka', distance: '3.8 km', phone: '+8801912345678', rating: 4.3 },
    { name: 'United Hospital', address: 'Dhaka', distance: '4.1 km', phone: '+8801612345678', rating: 4.6 },
  ];

  const policeStations = [
    { name: 'Tejgaon Police Station', address: 'Tejgaon, Dhaka', distance: '0.8 km', phone: '+880213456789' },
    { name: 'Gulshan Police Station', address: 'Gulshan, Dhaka', distance: '1.5 km', phone: '+880223456789' },
    { name: 'Banani Police Station', address: 'Banani, Dhaka', distance: '2.1 km', phone: '+880233456789' },
  ];

  const callNumber = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-indigo-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Hospitals & Police</h1>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'hospitals'
                  ? 'bg-sos-red text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <FaHospital />
              <span>Hospitals</span>
            </button>
            <button
              onClick={() => setActiveTab('police')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'police'
                  ? 'bg-sos-red text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
<FaShieldAlt />
              <span>Police Stations</span>
            </button>
          </div>

          {/* Hospital List */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              {/* Ambulance Service Banner */}
              <div className="bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaAmbulance className="text-red-500 text-2xl animate-pulse" />
                  <div>
                    <p className="text-white font-medium">Emergency Ambulance Service</p>
                    <p className="text-sm text-gray-400">Available 24/7 for emergencies</p>
                  </div>
                </div>
                <button
                  onClick={() => callNumber('999')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <FaPhoneAlt />
                  <span>Call 999</span>
                </button>
              </div>

              {hospitals.map((hospital, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FaHospital className="text-red-500" />
                        <h3 className="text-white font-medium">{hospital.name}</h3>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <FaStar className="text-xs" />
                          <span className="text-sm">{hospital.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{hospital.address}</p>
                      <p className="text-sm text-gray-500">📍 {hospital.distance}</p>
                    </div>
                    <button
                      onClick={() => callNumber(hospital.phone)}
                      className="mt-3 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FaPhoneAlt className="text-sm" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Police Stations List */}
          {activeTab === 'police' && (
            <div className="space-y-4">
              {policeStations.map((station, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center space-x-2">
<FaShieldAlt className="text-blue-500" />
                        <h3 className="text-white font-medium">{station.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{station.address}</p>
                      <p className="text-sm text-gray-500">📍 {station.distance}</p>
                    </div>
                    <button
                      onClick={() => callNumber(station.phone)}
                      className="mt-3 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FaPhoneAlt className="text-sm" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalPage;