// Enhanced Emergency button component with icon system
import React from 'react';
import { Icon, type IconName } from '@/components/shared';
import type { EmergencyType } from '@/types/api';

export interface EmergencyButtonProps {
  type: EmergencyType;
  label: string;
  iconName: IconName;
  color: string;
  description: string;
  onPress: (type: EmergencyType) => void;
  disabled?: boolean;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  type,
  label,
  iconName,
  color,
  description,
  onPress,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onPress(type);
    }
  };

  return (
    <button
      className="emergency-button"
      style={{ borderColor: color }}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`${label} - ${description}`}
    >
      <Icon 
        name={iconName} 
        size="2xl" 
        className="emergency-icon" 
        color={color}
      />
      <h3 className="emergency-label">{label}</h3>
      <p className="emergency-description">{description}</p>
    </button>
  );
};

export default EmergencyButton;