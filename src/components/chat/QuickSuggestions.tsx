import React from 'react';
import { Icon } from '@/components/shared';
import './QuickSuggestions.css';

interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

// Map suggestions to appropriate icons
const getSuggestionIcon = (suggestion: string): 'food' | 'map' | 'star' | 'nature' | 'culture' | 'question' => {
  const lowerSuggestion = suggestion.toLowerCase();
  if (lowerSuggestion.includes('eat') || lowerSuggestion.includes('food')) return 'food';
  if (lowerSuggestion.includes('around') || lowerSuggestion.includes('transport')) return 'map';
  if (lowerSuggestion.includes('gem') || lowerSuggestion.includes('attraction')) return 'star';
  if (lowerSuggestion.includes('weather') || lowerSuggestion.includes('climate')) return 'nature';
  if (lowerSuggestion.includes('custom') || lowerSuggestion.includes('culture')) return 'culture';
  return 'question';
};

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  disabled = false
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="quick-suggestions">
      <div className="suggestions-header">
        <Icon name="assistant" size="sm" />
        <span className="suggestions-title">Quick questions:</span>
      </div>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-button"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
          >
            <Icon 
              name={getSuggestionIcon(suggestion)} 
              size="sm" 
              className="suggestion-icon"
            />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;