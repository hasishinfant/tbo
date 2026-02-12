import React, { useEffect } from 'react';
import type { ConfidenceScoreResponse } from '../types/confidence';
import './ConfidenceBreakdownModal.css';

interface ConfidenceBreakdownModalProps {
  score: ConfidenceScoreResponse;
  onClose: () => void;
}

export const ConfidenceBreakdownModal: React.FC<ConfidenceBreakdownModalProps> = ({
  score,
  onClose,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const badgeColors = {
    Low: '#ef4444',
    Moderate: '#f59e0b',
    High: '#10b981',
    Excellent: '#3b82f6',
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content confidence-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 id="modal-title">Confidence Score Breakdown</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* Overall Score */}
          <div className="overall-score">
            <div 
              className="score-circle"
              style={{ borderColor: badgeColors[score.badge] }}
            >
              <span className="score-value">{Math.round(score.score)}</span>
              <span 
                className="score-label"
                style={{ color: badgeColors[score.badge] }}
              >
                {score.badge}
              </span>
            </div>
            <p className="score-explanation">{score.explanation}</p>
          </div>
          
          {/* Factor Breakdown Table */}
          <div className="factor-breakdown">
            <h3>Factor Analysis</h3>
            <div className="breakdown-table-container">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>Score</th>
                    <th>Weight</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {score.breakdown.map((factor, index) => (
                    <tr key={index}>
                      <td>
                        <div className="factor-cell">
                          <div className="factor-name">{factor.factorName}</div>
                          <div className="factor-explanation">{factor.explanation}</div>
                        </div>
                      </td>
                      <td>
                        <div className="factor-score">
                          <div className="score-bar-container">
                            <div 
                              className="score-bar"
                              style={{ 
                                width: `${factor.score}%`,
                                backgroundColor: factor.score >= 70 ? '#10b981' : factor.score >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="score-number">{Math.round(factor.score)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="factor-weight">
                          {(factor.weight * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td>
                        <div className="factor-contribution">
                          {factor.contribution.toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Info Footer */}
          <div className="modal-footer">
            <p className="info-text">
              <strong>How it works:</strong> The confidence score is calculated using 8 weighted factors. 
              Each factor is scored 0-100, then multiplied by its weight to determine its impact on the overall score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
