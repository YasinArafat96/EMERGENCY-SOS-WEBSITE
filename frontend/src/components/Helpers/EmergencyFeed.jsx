import React from 'react';
import { FaExclamationTriangle, FaUserCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const EmergencyFeed = ({ emergencies, onConfirmHelp, userType = 'helper' }) => {
  if (!emergencies || emergencies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No active emergencies</p>
        <p className="text-sm text-gray-500 mt-1">Stay safe! You're all clear.</p>
      </div>
    );
  }

  const getEmergencyIcon = (type) => {
    switch(type) {
      case 'ambulance': return '🚑';
      case 'fire': return '🔥';
      case 'police': return '👮';
      case 'detail': return '📝';
      case 'voice': return '🎤';
      default: return '⚠️';
    }
  };

  const getEmergencyColor = (type) => {
    switch(type) {
      case 'ambulance': return 'border-red-500';
      case 'fire': return 'border-orange-500';
      case 'police': return 'border-blue-500';
      default: return 'border-yellow-500';
    }
  };

  const isVictim = userType === 'victim';

  return (
    <div className="space-y-4">
      {emergencies.map((emergency) => (
        <div
          key={emergency._id}
          className={`bg-white/5 rounded-lg p-4 border-l-4 ${getEmergencyColor(emergency.type)} hover:bg-white/10 transition-colors`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getEmergencyIcon(emergency.type)}</span>
                <p className="text-white font-medium">
                  {emergency.userId?.name || 'Unknown User'}
                </p>
                <span className="text-xs text-gray-500">
                  ID: {emergency.userId?.userId || 'Unknown'}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-2">
                {emergency.description || 'Emergency alert sent'}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <FaClock />
                  <span>{new Date(emergency.timestamp).toLocaleTimeString()}</span>
                </span>
                {emergency.location && (
                  <span className="flex items-center space-x-1">
                    📍 {emergency.location.lat?.toFixed(4)}, {emergency.location.lng?.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Helper count */}
              {emergency.helpers && emergency.helpers.length > 0 && (
                <div className="mt-2 flex items-center space-x-1">
                  <span className="text-xs text-gray-400">
                    👥 {emergency.helpers.length} helper{emergency.helpers.length > 1 ? 's' : ''} en route
                  </span>
                </div>
              )}
            </div>

            <div className="ml-4">
              {isVictim ? (
                // Show status for victim
                <div className="text-center">
                  <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                    {emergency.helpers?.length > 0 ? '🚑 Help Coming' : '⏳ Waiting for helpers'}
                  </span>
                </div>
              ) : (
                // Show confirm button for helpers
                <button
                  onClick={() => onConfirmHelp(emergency._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                >
                  <FaCheckCircle />
                  <span>Confirm Help</span>
                </button>
              )}
            </div>
          </div>

          {/* Additional info - show helpers if victim */}
          {isVictim && emergency.helpers && emergency.helpers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">Helpers Coming:</p>
              <div className="flex flex-wrap gap-2">
                {emergency.helpers.map((helper, index) => (
                  <span key={index} className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-300">
                    {helper.userId?.name || 'Helper'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmergencyFeed;