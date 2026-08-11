import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-sos-gray/95 backdrop-blur-lg border-r border-white/10 z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sos-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SOS</span>
              </div>
              <span className="text-white font-bold">Emergency</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-sos-red rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors hidden lg:block"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <FaUserCircle className="text-4xl text-gray-400" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.userId || 'ID'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onToggle}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-sos-red/20 text-white border-r-2 border-sos-red'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="text-xl flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className={`flex items-center space-x-3 w-full p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignOutAlt className="text-xl" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;