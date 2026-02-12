// Comprehensive loading component with multiple states and animations
import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStage {
  name: string;
  message: string;
  duration?: number; // Optional duration in ms
}

interface ComprehensiveLoaderProps {
  isLoading: boolean;
  stages?: LoadingStage[];
  currentStage?: string;
  progress?: number;
  error?: string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showStageIndicators?: boolean;
  overlay?: boolean;
  theme?: 'light' | 'dark' | 'travel';
}

const ComprehensiveLoader: React.FC<ComprehensiveLoaderProps> = ({
  isLoading,
  stages = [],
  currentStage,
  progress,
  error,
  onRetry,
  className = '',
  size = 'md',
  showProgress = false,
  showStageIndicators = false,
  overlay = false,
  theme = 'travel',
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'active' | 'exit'>('enter');

  // Auto-advance stages if durations are provided
  useEffect(() => {
    if (!isLoading || stages.length === 0) return;

    const currentStageData = stages[currentStageIndex];
    if (currentStageData?.duration && currentStageIndex < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStageIndex(prev => Math.min(prev + 1, stages.length - 1));
      }, currentStageData.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStageIndex, stages, isLoading]);

  // Handle animation phases
  useEffect(() => {
    if (isLoading) {
      setAnimationPhase('enter');
      const timer = setTimeout(() => setAnimationPhase('active'), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('exit');
    }
  }, [isLoading]);

  // Reset stage when loading starts
  useEffect(() => {
    if (isLoading) {
      setCurrentStageIndex(0);
    }
  }, [isLoading]);

  if (!isLoading && !error) return null;

  const getCurrentMessage = () => {
    if (currentStage) return currentStage;
    if (stages.length > 0) return stages[currentStageIndex]?.message || stages[0].message;
    return 'Loading...';
  };

  const getProgressValue = () => {
    if (typeof progress === 'number') return progress;
    if (stages.length > 0) {
      return ((currentStageIndex + 1) / stages.length) * 100;
    }
    return undefined;
  };

  const containerClasses = [
    'comprehensive-loader',
    `size-${size}`,
    `theme-${theme}`,
    `phase-${animationPhase}`,
    overlay ? 'overlay' : '',
    className,
  ].filter(Boolean).join(' ');

  if (error) {
    return (
      <div className={`${containerClasses} error-state`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p className="error-message">{error}</p>
          {onRetry && (
            <button 
              className="retry-button btn primary"
              onClick={onRetry}
              type="button"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="loader-content">
        {/* Main loading spinner */}
        <div className="spinner-container">
          <LoadingSpinner
            size={size}
            message=""
            className="main-spinner"
          />
          
          {/* Travel-themed icon overlay */}
          {theme === 'travel' && (
            <div className="travel-icon-overlay">
              <span className="travel-icon">✈️</span>
            </div>
          )}
        </div>

        {/* Loading message */}
        <div className="loading-message">
          <p className="primary-message">{getCurrentMessage()}</p>
          
          {/* Stage indicators */}
          {showStageIndicators && stages.length > 0 && (
            <div className="stage-indicators">
              {stages.map((stage, index) => (
                <div
                  key={index}
                  className={`stage-indicator ${
                    index < currentStageIndex ? 'completed' :
                    index === currentStageIndex ? 'active' : 'pending'
                  }`}
                  title={stage.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${getProgressValue() || 0}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {typeof getProgressValue() === 'number' && (
              <span className="progress-text">
                {Math.round(getProgressValue() || 0)}%
              </span>
            )}
          </div>
        )}

        {/* Estimated time remaining */}
        {stages.length > 0 && currentStageIndex < stages.length && (
          <div className="time-estimate">
            <small>
              Step {currentStageIndex + 1} of {stages.length}
            </small>
          </div>
        )}
      </div>

      {/* Background animation */}
      {theme === 'travel' && (
        <div className="background-animation">
          <div className="floating-icon">🌍</div>
          <div className="floating-icon">🗺️</div>
          <div className="floating-icon">🧳</div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveLoader;

// Predefined stage configurations for common operations
export const LOADING_STAGES = {
  ITINERARY_GENERATION: [
    { name: 'validation', message: 'Validating your preferences...', duration: 800 },
    { name: 'connection', message: 'Connecting to AI travel planner...', duration: 600 },
    { name: 'analysis', message: 'Analyzing destinations and activities...', duration: 1000 },
    { name: 'generation', message: 'Creating your personalized itinerary...', duration: 1200 },
    { name: 'finalization', message: 'Finalizing recommendations...', duration: 500 },
  ],
  CHAT_RESPONSE: [
    { name: 'processing', message: 'Processing your question...', duration: 400 },
    { name: 'thinking', message: 'Thinking about the best response...', duration: 800 },
    { name: 'responding', message: 'Preparing your answer...', duration: 300 },
  ],
  EMERGENCY_REQUEST: [
    { name: 'submission', message: 'Submitting your request...', duration: 500 },
    { name: 'routing', message: 'Routing to appropriate support team...', duration: 700 },
    { name: 'confirmation', message: 'Confirming request received...', duration: 300 },
  ],
  VR_LOADING: [
    { name: 'connection', message: 'Connecting to VR service...', duration: 600 },
    { name: 'loading', message: 'Loading 360° experience...', duration: 1500 },
    { name: 'rendering', message: 'Rendering virtual tour...', duration: 800 },
  ],
} as const;