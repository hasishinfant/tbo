import React from 'react';
import type { ConfidenceBadge as BadgeType } from '../types/confidence';
import './ConfidenceBadge.css';

interface ConfidenceBadgeProps {
  score: number;
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showMeter?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  badge,
  size = 'md',
  showMeter = true,
  onClick,
  className = '',
}) => {
  const badgeColors = {
    Low: '#ef4444',
    Moderate: '#f59e0b',
    High: '#10b981',
    Excellent: '#3b82f6',
  };
  
  const color = badgeColors[badge];
  
  return (
    <div 
      className={`confidence-badge confidence-badge-${size} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
      aria-label={`Confidence score: ${score} out of 100, ${badge}`}
    >
      <div className="badge-header">
        <span 
          className="badge-label"
          style={{ backgroundColor: color }}
        >
          {badge}
        </span>
        <span className="badge-score">{Math.round(score)}</span>
      </div>
      
      {showMeter && (
        <div className="confidence-meter">
          <div 
            className="meter-fill"
            style={{ 
              width: `${score}%`,
              backgroundColor: color,
            }}
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      )}
    </div>
  );
};
