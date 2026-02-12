import React, { useState, useEffect, useRef } from 'react';
import { queryAssistant, isTripModeActive, type AssistantResponse } from '../services/assistantService';
import './AIAssistantWidget.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  data?: AssistantResponse;
}

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsActive(isTripModeActive());
  }, []);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  if (!isActive) {
    return null;
  }
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await queryAssistant({ message: inputValue });
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        text: response.message,
        sender: 'assistant',
        timestamp: new Date(),
        data: response,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className={`ai-assistant-widget ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button
          className="assistant-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Travel Assistant"
        >
          <span className="assistant-icon">🤖</span>
          <span className="assistant-badge">AI Assistant</span>
        </button>
      )}
      
      {isOpen && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <div className="header-content">
              <span className="assistant-icon">🤖</span>
              <div>
                <h3>AI Travel Assistant</h3>
                <p className="status-text">Trip Mode Active</p>
              </div>
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>
          </div>
          
          <div className="assistant-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! I'm your AI travel assistant. I can help you with:</p>
                <ul>
                  <li>🚨 Emergency contacts</li>
                  <li>🗣️ Translations</li>
                  <li>🌤️ Weather alerts</li>
                  <li>🛡️ Safe zones</li>
                  <li>🗺️ Directions</li>
                </ul>
                <p>How can I assist you today?</p>
              </div>
            )}
            
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  
                  {message.data?.emergencyContacts && (
                    <div className="emergency-contacts">
                      {message.data.emergencyContacts.map((contact, idx) => (
                        <div key={idx} className="contact-card">
                          <strong>{contact.type}</strong>
                          <a href={`tel:${contact.number}`}>{contact.number}</a>
                          <span>{contact.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.data?.translation && (
                    <div className="translation-card">
                      <div className="translation-row">
                        <span className="label">Original:</span>
                        <span>{message.data.translation.original}</span>
                      </div>
                      <div className="translation-row">
                        <span className="label">{message.data.translation.language}:</span>
                        <strong>{message.data.translation.translated}</strong>
                      </div>
                    </div>
                  )}
                  
                  {message.data?.weatherAlert && (
                    <div className={`weather-alert severity-${message.data.weatherAlert.severity}`}>
                      <span className="alert-icon">🌤️</span>
                      <p>{message.data.weatherAlert.message}</p>
                    </div>
                  )}
                  
                  {message.data?.safeZones && (
                    <div className="safe-zones">
                      {message.data.safeZones.map((zone, idx) => (
                        <div key={idx} className="zone-card">
                          <strong>{zone.name}</strong>
                          <span>{zone.type} • {zone.distance}</span>
                          <span className="address">{zone.address}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.data?.suggestions && (
                    <div className="suggestions">
                      {message.data.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="assistant-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
