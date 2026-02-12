import React from 'react';
import type { Message } from '../../types/api';
import { formatters } from '../../utils/formatters';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, sender, timestamp } = message;
  
  return (
    <div className={`message-bubble ${sender === 'user' ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        {content}
      </div>
      <div className="message-timestamp">
        {formatters.formatTime(timestamp)}
      </div>
    </div>
  );
};

export default MessageBubble;