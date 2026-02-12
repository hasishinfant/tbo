import React from 'react';
import { BUDGET_LEVELS } from '../../utils/constants';
import type { BudgetLevel } from '../../types/trip';
import './BudgetSelector.css';

interface BudgetSelectorProps {
  value: BudgetLevel | '';
  onChange: (value: BudgetLevel) => void;
  error?: string;
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="budget-selector">
      <label className="form-label">
        Budget Level *
      </label>
      <div className="budget-options">
        {BUDGET_LEVELS.map((budget) => (
          <label
            key={budget.value}
            className={`budget-option ${value === budget.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="budget"
              value={budget.value}
              checked={value === budget.value}
              onChange={(e) => onChange(e.target.value as BudgetLevel)}
              className="budget-radio"
            />
            <div className="budget-content">
              <div className="budget-header">
                <span className="budget-icon">
                  {budget.value === 'low' && '💰'}
                  {budget.value === 'medium' && '💳'}
                  {budget.value === 'luxury' && '💎'}
                </span>
                <span className="budget-label">{budget.label}</span>
              </div>
              <div className="budget-description">{budget.description}</div>
            </div>
          </label>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default BudgetSelector;