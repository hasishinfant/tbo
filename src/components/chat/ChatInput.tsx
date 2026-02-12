import React from 'react';
import { Button, Icon } from '@/components/shared';
import './ChatInput.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 500
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <form onSubmit={onSubmit} className="chat-input-form">
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <Icon name="chat" size="sm" className="chat-input-icon" />
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="chat-input-field"
          />
        </div>
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          variant="primary"
          icon="send"
          className="chat-send-button"
          size="md"
        >
          Send
        </Button>
      </div>
      {maxLength && (
        <div className="character-count">
          <Icon name="info" size="xs" />
          {value.length}/{maxLength}
        </div>
      )}
    </form>
  );
};

export default ChatInput;