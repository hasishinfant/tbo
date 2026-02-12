// Chat page
import React, { useState } from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import ChatInput from '../components/chat/ChatInput';
import QuickSuggestions from '../components/chat/QuickSuggestions';
import { generateMockChatResponse } from '../services/mockDataService';
import type { Message } from '@/types/api';
import './ChatPage.css';

const QUICK_SUGGESTIONS = [
  'What should I eat here?',
  'How do I get around?',
  'Any hidden gems nearby?',
  'What are the must-see attractions?',
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI travel assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call with mock response
    setTimeout(() => {
      const response = generateMockChatResponse(content);
      if (response.data) {
        const assistantMessage: Message = {
          id: response.data.messageId,
          content: response.data.content,
          sender: 'assistant',
          timestamp: new Date(response.data.timestamp),
          type: 'text',
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1>Travel Assistant</h1>
        <p>Ask me anything about your trip or travel in general</p>
      </div>
      
      <ChatContainer messages={messages} isLoading={isLoading} />
      
      <div className="chat-controls">
        <QuickSuggestions 
          suggestions={QUICK_SUGGESTIONS}
          onSuggestionClick={handleSuggestionClick}
          disabled={isLoading}
        />
        <ChatInput 
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;