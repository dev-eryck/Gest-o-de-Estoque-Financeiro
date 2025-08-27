import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, changeType, description, className = '' }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {change}
              </span>
              {description && (
                <span className="text-sm text-gray-500 ml-2">{description}</span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
