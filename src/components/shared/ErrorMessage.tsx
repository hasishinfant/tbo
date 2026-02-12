// Reusable error message component
import React from 'react';
import { ErrorCategory } from '@/utils/errorUtils';

interface ErrorMessageProps {
  message: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  category = ErrorCategory.UNKNOWN,
  onRetry,
  onDismiss,
  className = '',
  showIcon = true,
}) => {
  const getErrorIcon = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return '📡';
      case ErrorCategory.SERVER:
        return '🔧';
      case ErrorCategory.TIMEOUT:
        return '⏱️';
      case ErrorCategory.VALIDATION:
        return '⚠️';
      default:
        return '❌';
    }
  };

  const getErrorClass = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'error-network';
      case ErrorCategory.SERVER:
        return 'error-server';
      case ErrorCategory.TIMEOUT:
        return 'error-timeout';
      case ErrorCategory.VALIDATION:
        return 'error-validation';
      default:
        return 'error-general';
    }
  };

  return (
    <div className={`error-message ${getErrorClass()} ${className}`}>
      <div className="error-content">
        {showIcon && (
          <span className="error-icon" role="img" aria-label="Error">
            {getErrorIcon()}
          </span>
        )}
        <span className="error-text">{message}</span>
      </div>
      
      {(onRetry || onDismiss) && (
        <div className="error-actions">
          {onRetry && (
            <button 
              className="error-button retry-button"
              onClick={onRetry}
              type="button"
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button 
              className="error-button dismiss-button"
              onClick={onDismiss}
              type="button"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;