import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaBell, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaComment, 
  FaHeartbeat, 
  FaHospital, 
  FaBullhorn, 
  FaWallet, 
  FaPhoneAlt,
  FaUserCircle 
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: FaHome, label: 'Home', path: '/' },
    { icon: FaBell, label: 'Alerts', path: '/alerts' },
    { icon: FaUsers, label: 'Helpers', path: '/helpers' },
    { icon: FaMapMarkerAlt, label: 'Live', path: '/live' },
    { icon: FaComment, label: 'Chat', path: '/chat' },
    { icon: FaHeartbeat, label: 'Blood', path: '/blood' },
    { icon: FaHospital, label: 'Hospital', path: '/hospital' },
    { icon: FaBullhorn, label: 'Community', path: '/community' },
    { icon: FaWallet, label: 'Payment', path: '/payment' },
  ];

  return (
    <nav className="bg-sos-gray/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-sos-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SOS</span>
            </div>
            <span className="text-white font-bold text-lg hidden md:block">
              Emergency Alert
            </span>
          </Link>

          <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center px-3 py-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
              >
                <item.icon className="text-xl group-hover:scale-110 transition-transform" />
                <span className="text-xs hidden md:block">{item.label}</span>
              </Link>
            ))}
            
            <Link
              to="/profile"
              className="flex flex-col items-center px-3 py-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <FaUserCircle className="text-2xl" />
              <span className="text-xs hidden md:block">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;