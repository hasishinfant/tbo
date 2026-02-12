// Enhanced Button component with icon support
import React from 'react';
import Icon, { IconName } from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  fullWidth = false,
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md', 
    lg: 'btn-lg'
  };

  const buttonClasses = [
    'btn',
    variant,
    sizeClasses[size],
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading ? (
        <>
          <Icon name="loading" size={iconSize} className="btn-loading-icon" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon name={icon} size={iconSize} className="btn-icon btn-icon-left" />
          )}
          <span className="btn-text">{children}</span>
          {icon && iconPosition === 'right' && (
            <Icon name={icon} size={iconSize} className="btn-icon btn-icon-right" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;