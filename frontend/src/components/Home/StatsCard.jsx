import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="glass-effect rounded-xl p-4 md:p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className={`text-3xl md:text-4xl ${color}`} />
      </div>
    </div>
  );
};

export default StatsCard;