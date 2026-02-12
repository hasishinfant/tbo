import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';
import type { Message } from '../../types/api';

// Mock the formatters utility
jest.mock('../../utils/formatters', () => ({
  formatters: {
    formatTime: jest.fn((date: Date) => '2m ago')
  }
}));

describe('MessageBubble', () => {
  const mockUserMessage: Message = {
    id: 'user-1',
    content: 'Hello, I need help with my trip',
    sender: 'user',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    type: 'text'
  };

  const mockAssistantMessage: Message = {
    id: 'assistant-1',
    content: 'Hello! I\'d be happy to help you with your trip planning.',
    sender: 'assistant',
    timestamp: new Date('2024-01-15T10:01:00Z'),
    type: 'text'
  };

  it('renders user message with correct styling', () => {
    render(<MessageBubble message={mockUserMessage} />);
    
    const messageElement = screen.getByText('Hello, I need help with my trip');
    expect(messageElement).toBeInTheDocument();
    
    const messageBubble = messageElement.closest('.message-bubble');
    expect(messageBubble).toHaveClass('user-message');
    
    const timestamp = screen.getByText('2m ago');
    expect(timestamp).toBeInTheDocument();
  });

  it('renders assistant message with correct styling', () => {
    render(<MessageBubble message={mockAssistantMessage} />);
    
    const messageElement = screen.getByText('Hello! I\'d be happy to help you with your trip planning.');
    expect(messageElement).toBeInTheDocument();
    
    const messageBubble = messageElement.closest('.message-bubble');
    expect(messageBubble).toHaveClass('assistant-message');
    
    const timestamp = screen.getByText('2m ago');
    expect(timestamp).toBeInTheDocument();
  });

  it('displays message content correctly', () => {
    render(<MessageBubble message={mockUserMessage} />);
    
    expect(screen.getByText('Hello, I need help with my trip')).toBeInTheDocument();
  });

  it('calls formatTime with correct timestamp', () => {
    const { formatters } = require('../../utils/formatters');
    
    render(<MessageBubble message={mockUserMessage} />);
    
    expect(formatters.formatTime).toHaveBeenCalledWith(mockUserMessage.timestamp);
  });

  it('applies correct CSS classes for user messages', () => {
    render(<MessageBubble message={mockUserMessage} />);
    
    const messageBubble = screen.getByText('Hello, I need help with my trip').closest('.message-bubble');
    expect(messageBubble).toHaveClass('message-bubble', 'user-message');
  });

  it('applies correct CSS classes for assistant messages', () => {
    render(<MessageBubble message={mockAssistantMessage} />);
    
    const messageBubble = screen.getByText('Hello! I\'d be happy to help you with your trip planning.').closest('.message-bubble');
    expect(messageBubble).toHaveClass('message-bubble', 'assistant-message');
  });
});