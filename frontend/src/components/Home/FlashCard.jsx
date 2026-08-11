import React from 'react';
import { useNavigate } from 'react-router-dom';

const FlashCard = ({ icon: Icon, title, description, path, color }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(path)}
      className="glass-effect rounded-xl p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white text-xl" />
      </div>
      <h3 className="text-white font-semibold text-sm md:text-base">{title}</h3>
      <p className="text-gray-400 text-xs md:text-sm mt-1">{description}</p>
    </div>
  );
};

export default FlashCard;