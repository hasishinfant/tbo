import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionButtons from './ActionButtons';

describe('ActionButtons', () => {
  const mockOnChatWithAssistant = jest.fn();
  const mockOnSaveTrip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both action buttons', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
      />
    );
    
    expect(screen.getByText('💬 Chat with Travel Assistant')).toBeInTheDocument();
    expect(screen.getByText('💾 Save Trip')).toBeInTheDocument();
  });

  it('calls onChatWithAssistant when chat button is clicked', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
      />
    );
    
    const chatButton = screen.getByText('💬 Chat with Travel Assistant');
    fireEvent.click(chatButton);
    
    expect(mockOnChatWithAssistant).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveTrip when save button is clicked', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
      />
    );
    
    const saveButton = screen.getByText('💾 Save Trip');
    fireEvent.click(saveButton);
    
    expect(mockOnSaveTrip).toHaveBeenCalledTimes(1);
  });

  it('shows saving state when isSaving is true', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
        isSaving={true}
      />
    );
    
    expect(screen.getByText('💾 Saving...')).toBeInTheDocument();
    expect(screen.queryByText('💾 Save Trip')).not.toBeInTheDocument();
  });

  it('disables save button when isSaving is true', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
        isSaving={true}
      />
    );
    
    const saveButton = screen.getByText('💾 Saving...');
    expect(saveButton).toBeDisabled();
  });

  it('does not call onSaveTrip when save button is disabled', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
        isSaving={true}
      />
    );
    
    const saveButton = screen.getByText('💾 Saving...');
    fireEvent.click(saveButton);
    
    expect(mockOnSaveTrip).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
      />
    );
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('action-buttons');
    
    const chatButton = screen.getByText('💬 Chat with Travel Assistant');
    expect(chatButton).toHaveClass('chat-button', 'primary');
    
    const saveButton = screen.getByText('💾 Save Trip');
    expect(saveButton).toHaveClass('save-button', 'secondary');
  });

  it('handles default isSaving prop correctly', () => {
    render(
      <ActionButtons
        onChatWithAssistant={mockOnChatWithAssistant}
        onSaveTrip={mockOnSaveTrip}
      />
    );
    
    const saveButton = screen.getByText('💾 Save Trip');
    expect(saveButton).not.toBeDisabled();
    expect(saveButton).toBeEnabled();
  });
});