import React, { useState } from 'react';
import { FaSearch, FaUserCircle, FaCircle, FaClock } from 'react-icons/fa';

const ChatList = ({ users, selectedUser, onSelectUser, searchTerm, onSearchChange }) => {
  const [sortBy, setSortBy] = useState('recent');

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'online') {
      return a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1;
    }
    // Default: recent activity (mock)
    return 0;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
        />
      </div>

      {/* Sort Options */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setSortBy('recent')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            sortBy === 'recent' ? 'bg-sos-red text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setSortBy('online')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            sortBy === 'online' ? 'bg-sos-red text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          Online
        </button>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No users found</p>
            <p className="text-sm text-gray-500">Try adding some primary helpers</p>
          </div>
        ) : (
          sortedUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedUser?._id === user._id
                  ? 'bg-sos-red/20 border border-sos-red'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <FaCircle 
                    className={`absolute bottom-0 right-0 text-xs ${
                      user.isOnline ? 'text-green-500' : 'text-gray-500'
                    }`} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${
                      user.isOnline ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {user.isOnline ? '● Online' : '○ Offline'}
                    </span>
                    <span className="text-xs text-gray-500">{user.userId}</span>
                  </div>
                </div>
                {user.lastMessage && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 truncate max-w-[100px]">
                      {user.lastMessage.content}
                    </p>
                    <p className="text-xs text-gray-600">
                      <FaClock className="inline mr-1 text-xs" />
                      {new Date(user.lastMessage.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;