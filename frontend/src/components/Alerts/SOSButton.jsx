import React from 'react';

const SOSButton = ({ isActive, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-4 text-2xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
        isActive 
          ? 'bg-gray-500 hover:bg-gray-600 shadow-lg shadow-gray-500/30' 
          : 'bg-sos-red hover:bg-red-700 shadow-lg shadow-red-500/50 animate-pulse'
      } text-white`}
    >
      {isActive ? 'SOS ACTIVE ✓' : 'SEND SOS'}
    </button>
  );
};

export default SOSButton;