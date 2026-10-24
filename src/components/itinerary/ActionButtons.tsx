import React from 'react';
import { MessageSquare, Heart, Bookmark } from 'lucide-react';

interface ActionButtonsProps {
  onChatWithAssistant: () => void;
  onSaveTrip: () => void;
  isSaving?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onChatWithAssistant, 
  onSaveTrip, 
  isSaving = false 
}) => {
  return (
    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <button 
        type="button"
        onClick={onChatWithAssistant}
        className="btn-pill-green"
      >
        <MessageSquare size={16} />
        <span>Chat with Travel Assistant</span>
      </button>
      <button 
        type="button"
        onClick={onSaveTrip}
        disabled={isSaving}
        className="btn-pill-outline"
      >
        <Bookmark size={16} />
        <span>{isSaving ? 'Saving Trip...' : 'Save Itinerary'}</span>
      </button>
    </div>
  );
};

export default ActionButtons;