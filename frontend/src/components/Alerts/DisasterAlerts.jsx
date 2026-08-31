import React from 'react';
import DisasterWidget from './DisasterWidget';

const DisasterAlerts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-blue-900/5 p-4 md:p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="glass-effect rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Natural Disaster Alerts</h1>
          <p className="text-gray-300 mb-4">Real-time weather and seismic alerts around your current location.</p>

          <DisasterWidget />
        </div>
      </div>
    </div>
  );
};

export default DisasterAlerts;
