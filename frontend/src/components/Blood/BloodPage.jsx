import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTint, FaHospital, FaClock, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const BloodPage = () => {
  const { user } = useAuth();
  const [booking, setBooking] = useState({
    bloodType: '',
    date: '',
    time: '',
    nearestCenter: ''
  });
  const [booked, setBooked] = useState(false);
  const [requests, setRequests] = useState([]);
  const [donatedRequests, setDonatedRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blood/requests`);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error); 
    }
  };

  const bookDonation = async () => {
    if (!booking.bloodType || !booking.date || !booking.time || !booking.nearestCenter) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/blood/book`, booking);
      setBooked(true);
      toast.success('Blood donation booked successfully!');
    } catch (error) {
      toast.error('Failed to book donation');
    }
  };

  const donateBlood = async (requestId) => {
    try {
      setDonatedRequests(prev => [...prev, requestId]);
      toast.success('Thank you for donating blood! ❤️');
    } catch (error) {
      toast.error('Failed to process donation'); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-red-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Blood Donation</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Book Donation */}
            <div>
              <div className="bg-white/5 rounded-xl p-6">
<h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FaTint className="text-red-500 mr-2" />
                  Book a Donation
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Blood Type
                    </label>
                    <select
                      value={booking.bloodType}
                      onChange={(e) => setBooking({ ...booking, bloodType: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
                      disabled={booked}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={booking.date}
                      onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
                      disabled={booked}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={booking.time}
                      onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
                      disabled={booked}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nearest Center
                    </label>
                    <select
                      value={booking.nearestCenter}
                      onChange={(e) => setBooking({ ...booking, nearestCenter: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
                      disabled={booked}
                    >
                      <option value="">Select Center</option>
                      <option value="Dhaka Medical College">Dhaka Medical College</option>
                      <option value="Square Hospital Blood Bank">Square Hospital Blood Bank</option>
                      <option value="Apollo Hospital Blood Bank">Apollo Hospital Blood Bank</option>
                      <option value="Bangladesh Red Crescent">Bangladesh Red Crescent</option>
                    </select>
                  </div>

                  <button
                    onClick={bookDonation}
                    disabled={booked}
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                      booked 
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-sos-red hover:bg-red-700 text-white transform hover:scale-105'
                    }`}
                  >
                    {booked ? '✓ Booked' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Requests */}
            <div>
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FaHospital className="text-blue-500 mr-2" />
                  Recent Requests
                </h2>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {requests.map((request, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-red-500">
                              {request.bloodGroup}
                            </span>
                            {request.isEmergency && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-white font-medium mt-1">{request.hospital.name}</p>
                          <p className="text-sm text-gray-400">{request.hospital.address}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>📍 {request.distance}</span>
                            <span>🕐 {request.timeAgo}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => donateBlood(index)}
                          disabled={donatedRequests.includes(index)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            donatedRequests.includes(index)
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {donatedRequests.includes(index) ? '✓ Donated' : 'Donate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Motivational Cards */}
                <div className="mt-6 grid grid-cols-2 gap-3">
<div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg p-4 border border-red-500/20">
                    <FaTint className="text-red-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-300">One donation can save up to 3 lives</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                    <FaCheckCircle className="text-blue-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-300">Be a hero. Donate blood today!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodPage;
