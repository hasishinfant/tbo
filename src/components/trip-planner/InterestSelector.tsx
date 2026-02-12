import React from 'react';
import { TRAVEL_INTERESTS } from '../../utils/constants';
import { Icon } from '@/components/shared';
import type { Interest } from '../../types/trip';
import './InterestSelector.css';

interface InterestSelectorProps {
  value: Interest[];
  onChange: (interests: Interest[]) => void;
  error?: string;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const handleInterestToggle = (interest: Interest) => {
    if (value.includes(interest)) {
      // Remove interest
      onChange(value.filter(i => i !== interest));
    } else {
      // Add interest
      onChange([...value, interest]);
    }
  };

  return (
    <div className="interest-selector">
      <label className="form-label">
        <Icon name="heart" size="sm" />
        Travel Interests *
        <span className="interest-hint">Select all that apply</span>
      </label>
      <div className="interest-grid">
        {TRAVEL_INTERESTS.map((interest) => (
          <label
            key={interest.value}
            className={`interest-option ${value.includes(interest.value) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={value.includes(interest.value)}
              onChange={() => handleInterestToggle(interest.value)}
              className="interest-checkbox"
            />
            <div className="interest-content">
              <Icon 
                name={interest.iconName} 
                size="lg" 
                className="interest-icon"
              />
              <span className="interest-label">{interest.label}</span>
            </div>
          </label>
        ))}
      </div>
      {value.length > 0 && (
        <div className="selected-count">
          <Icon name="check" size="sm" />
          {value.length} interest{value.length !== 1 ? 's' : ''} selected
        </div>
      )}
      {error && (
        <div className="error-message">
          <Icon name="error" size="sm" />
          {error}
        </div>
      )}
    </div>
  );
};

export default InterestSelector;