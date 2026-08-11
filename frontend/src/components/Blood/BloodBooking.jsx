import React, { useState } from 'react';
import { FaDroplet, FaCalendarAlt, FaClock, FaHospital, FaCheckCircle } from 'react-icons/fa';
import { bloodAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const BloodBooking = ({ onBookingComplete }) => {
  const [booking, setBooking] = useState({
    bloodType: '',
    date: '',
    time: '',
    nearestCenter: '',
  });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const centers = [
    'Dhaka Medical College Blood Bank',
    'Square Hospital Blood Bank',
    'Apollo Hospital Blood Bank',
    'Bangladesh Red Crescent',
    'United Hospital Blood Bank',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!booking.bloodType || !booking.date || !booking.time || !booking.nearestCenter) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await bloodAPI.bookDonation(booking);
      setBooked(true);
      toast.success('Blood donation booked successfully! 🩸');
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error) {
      toast.error('Failed to book donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">Booking Confirmed!</h3>
        <p className="text-gray-400">
          Your blood donation has been booked for {booking.date} at {booking.time}
        </p>
        <p className="text-gray-400 mt-2">
          📍 {booking.nearestCenter}
        </p>
        <button
          onClick={() => setBooked(false)}
          className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Book Another Donation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Blood Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {bloodTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBooking({ ...booking, bloodType: type })}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                booking.bloodType === type
                  ? 'bg-sos-red text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaCalendarAlt className="inline mr-2" />
          Date
        </label>
        <input
          type="date"
          value={booking.date}
          onChange={(e) => setBooking({ ...booking, date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaClock className="inline mr-2" />
          Preferred Time
        </label>
        <input
          type="time"
          value={booking.time}
          onChange={(e) => setBooking({ ...booking, time: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaHospital className="inline mr-2" />
          Nearest Blood Bank
        </label>
        <select
          value={booking.nearestCenter}
          onChange={(e) => setBooking({ ...booking, nearestCenter: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
          required
        >
          <option value="">Select a blood bank</option>
          {centers.map((center) => (
            <option key={center} value={center}>
              {center}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sos-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <FaDroplet />
        <span>{loading ? 'Booking...' : 'Book Now'}</span>
      </button>

      <p className="text-xs text-gray-400 text-center">
        You can donate blood once every 56 days for your safety.
      </p>
    </form>
  );
};

export default BloodBooking;