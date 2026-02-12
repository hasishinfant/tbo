import React from 'react';
import { Button } from '@/components/shared';

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
    <div className="action-buttons space-x-4">
      <Button 
        variant="primary"
        icon="chat"
        onClick={onChatWithAssistant}
        className="chat-button"
        size="lg"
      >
        Chat with Travel Assistant
      </Button>
      <Button 
        variant="secondary"
        icon="heart"
        onClick={onSaveTrip}
        disabled={isSaving}
        loading={isSaving}
        className="save-button"
        size="lg"
      >
        {isSaving ? 'Saving Trip...' : 'Save Trip'}
      </Button>
    </div>
  );
};

export default ActionButtons;