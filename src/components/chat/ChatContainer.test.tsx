import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatContainer from './ChatContainer';
import type { Message } from '../../types/api';

// Mock the MessageBubble component
jest.mock('./MessageBubble', () => {
  return function MockMessageBubble({ message }: { message: Message }) {
    return (
      <div data-testid={`message-${message.id}`} className={`mock-message ${message.sender}`}>
        {message.content}
      </div>
    );
  };
});

describe('ChatContainer', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      content: 'Hello, how can I help you?',
      sender: 'assistant',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      type: 'text'
    },
    {
      id: 'msg-2',
      content: 'I need help planning my trip',
      sender: 'user',
      timestamp: new Date('2024-01-15T10:01:00Z'),
      type: 'text'
    }
  ];

  it('renders chat container with correct class', () => {
    render(<ChatContainer messages={mockMessages} />);
    
    const container = document.querySelector('.chat-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('chat-container');
  });

  it('renders all messages', () => {
    render(<ChatContainer messages={mockMessages} />);
    
    expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-msg-2')).toBeInTheDocument();
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    expect(screen.getByText('I need help planning my trip')).toBeInTheDocument();
  });

  it('displays empty state when no messages', () => {
    render(<ChatContainer messages={[]} />);
    
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    expect(screen.getByText('Ask me anything about your travel plans!')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<ChatContainer messages={mockMessages} isLoading={true} />);
    
    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();
    expect(document.querySelector('.typing-indicator')).toBeInTheDocument();
  });

  it('does not show loading indicator when isLoading is false', () => {
    render(<ChatContainer messages={mockMessages} isLoading={false} />);
    
    expect(screen.queryByText('Assistant is typing...')).not.toBeInTheDocument();
  });

  it('groups messages by date', () => {
    const messagesWithDifferentDates: Message[] = [
      {
        id: 'msg-1',
        content: 'Message from today',
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      },
      {
        id: 'msg-2',
        content: 'Message from yesterday',
        sender: 'assistant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'text'
      }
    ];

    render(<ChatContainer messages={messagesWithDifferentDates} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('handles empty messages array gracefully', () => {
    render(<ChatContainer messages={[]} />);
    
    const container = document.querySelector('.chat-container');
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
  });
});