import React from 'react';
import { AlertTriangle, Package, TrendingDown, X } from 'lucide-react';

const AlertCard = ({ title, message, type = 'warning', onClose, className = '' }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
        
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${styles.text}`}>{title}</h4>
          {message && (
            <p className={`text-sm ${styles.text} mt-1`}>{message}</p>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`${styles.text} hover:opacity-75 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
