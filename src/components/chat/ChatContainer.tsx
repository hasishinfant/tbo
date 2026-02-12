import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/api';
import MessageBubble from './MessageBubble';
import './ChatContainer.css';

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date for better organization
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="chat-container" ref={containerRef}>
      <div className="messages-wrapper">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Ask me anything about your travel plans!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([dateString, groupMessages]) => (
            <div key={dateString} className="message-group">
              <div className="date-header">
                {formatDateHeader(dateString)}
              </div>
              <div className="messages-list">
                {groupMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="loading-message">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span className="loading-text">Assistant is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatContainer;