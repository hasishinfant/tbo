import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, X, Send, Bot, User, ArrowRight, 
  MapPin, Calendar, Hotel, ShieldCheck, Compass, 
  HelpCircle, ChevronDown, Minimize2, ExternalLink
} from 'lucide-react';
import { generateMockChatResponse } from '@/services/mockDataService';
import './FloatingAIAssistant.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  actionLink?: {
    label: string;
    path: string;
    icon?: React.ReactNode;
  };
}

export const FloatingAIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message with required text and suggested chips
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm your TravelSphere travel assistant. Where are you planning to go? I can help you explore destinations, plan itineraries, find relevant hotels, and understand travel safety information.",
      timestamp: new Date(),
      suggestions: [
        'Plan a trip',
        'Explore destinations',
        'Find hotels',
        'Get travel safety guidance',
      ],
    },
  ]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Context-sensitive routing analysis
    const lower = query.toLowerCase();
    let actionLink: ChatMessage['actionLink'] | undefined;

    if (lower.includes('plan') || lower.includes('itinerary')) {
      actionLink = {
        label: 'Open Plan Trip Generator',
        path: '/plan-trip',
        icon: <Calendar size={14} />,
      };
    } else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room')) {
      actionLink = {
        label: 'Search Book Hotels',
        path: '/book-hotels',
        icon: <Hotel size={14} />,
      };
    } else if (lower.includes('emergency') || lower.includes('safety') || lower.includes('complaint') || lower.includes('lost') || lower.includes('doctor')) {
      actionLink = {
        label: 'Open Emergency Support Hub',
        path: '/emergency-support',
        icon: <ShieldCheck size={14} />,
      };
    } else if (lower.includes('explore') || lower.includes('destination')) {
      actionLink = {
        label: 'View Featured Destinations',
        path: '/plan-trip',
        icon: <Compass size={14} />,
      };
    }

    // Call service with realistic delay
    setTimeout(() => {
      const apiResponse = generateMockChatResponse(query);
      const replyContent = apiResponse.data?.content || 
        "I'd love to help with that! Let's find you the best travel options.";
      const returnedSuggestions = apiResponse.data?.suggestions || [
        'Tell me about local food',
        'How do I get around?',
        'What are the top sights?',
      ];

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyContent,
        timestamp: new Date(),
        suggestions: returnedSuggestions.slice(0, 3),
        actionLink,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSuggestionClick = (chip: string) => {
    if (chip === 'Plan a trip') {
      navigate('/plan-trip');
      setIsOpen(false);
    } else if (chip === 'Find hotels') {
      navigate('/book-hotels');
      setIsOpen(false);
    } else if (chip === 'Get travel safety guidance') {
      handleSendMessage('What safety guidance and emergency support is available?');
    } else if (chip === 'Explore destinations') {
      handleSendMessage('What are the top trending destinations this season?');
    } else {
      handleSendMessage(chip);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          className="floating-assistant-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open TravelSphere AI Assistant"
        >
          <div className="launcher-icon-circle">
            <Sparkles size={18} />
            <span className="launcher-live-pulse" />
          </div>
          <div className="launcher-text-block">
            <span className="launcher-label">TravelSphere AI</span>
            <span className="launcher-sub">Trip Assistant</span>
          </div>
        </button>
      )}

      {/* Floating Assistant Drawer / Panel */}
      {isOpen && (
        <div className="floating-assistant-drawer" role="dialog" aria-label="TravelSphere Assistant">
          {/* Header */}
          <div className="assistant-drawer-header">
            <div className="assistant-header-branding">
              <div className="assistant-avatar-pill">
                <Bot size={20} />
              </div>
              <div className="assistant-title-text">
                <h3>
                  <span>TravelSphere Assistant</span>
                  <span className="assistant-online-badge" title="Online" />
                </h3>
                <p>Your personal travel guide</p>
              </div>
            </div>

            <div className="assistant-header-controls">
              <button
                type="button"
                className="btn-header-action"
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="assistant-messages-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`assistant-message-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                <div className="message-avatar">
                  {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>

                <div className="message-bubble-content">
                  <div className="message-bubble">
                    <p style={{ margin: 0 }}>{msg.text}</p>

                    {/* Action link connection to application tabs */}
                    {msg.actionLink && (
                      <button
                        type="button"
                        className="action-chip-btn mt-2"
                        onClick={() => {
                          navigate(msg.actionLink!.path);
                          setIsOpen(false);
                        }}
                      >
                        {msg.actionLink.icon}
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {/* Suggested follow-up prompt chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="suggested-actions-stack">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="action-chip-btn"
                            onClick={() => handleSuggestionClick(sug)}
                          >
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="assistant-message-row assistant-row">
                <div className="message-avatar">
                  <Sparkles size={14} />
                </div>
                <div className="typing-indicator-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="assistant-drawer-footer">
            <form
              className="assistant-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="assistant-text-input"
                placeholder="Ask about destinations, hotels, or trips..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="btn-send-message"
                disabled={isTyping || !inputMessage.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
