// API-related type definitions
import type { ItineraryDay } from './itinerary';
import type { Place } from './itinerary';

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Itinerary Generation Response
export interface ItineraryResponse {
  tripId: string;
  itinerary: ItineraryDay[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  generatedAt: Date;
}

// Chat Response
export interface ChatResponse {
  messageId: string;
  content: string;
  suggestions?: string[];
  relatedPlaces?: Place[];
  timestamp: Date;
}

// Emergency Response
export interface EmergencyResponse {
  requestId: string;
  confirmationMessage: string;
  contactInfo?: {
    phone: string;
    email: string;
  };
  estimatedResponseTime?: string;
}

// Chat Message
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'suggestion';
}

// Chat Session
export interface ChatSession {
  id: string;
  tripId: string;
  messages: Message[];
  isActive: boolean;
  lastActivity: Date;
}

// Emergency Request
export type EmergencyType = 'medical' | 'passport' | 'hotel' | 'local-help';

export interface EmergencyRequest {
  id: string;
  type: EmergencyType;
  timestamp: Date;
  status: 'submitted' | 'acknowledged' | 'resolved';
  location?: GeolocationCoordinates;
}