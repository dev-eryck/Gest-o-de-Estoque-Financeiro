import React from 'react';

const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'primary', className = '' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary/90';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl shadow-sm border transition-all duration-200 
        hover:shadow-md hover:scale-105 transform
        ${getColorClasses()}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-left">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-sm opacity-90 mt-1">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;
