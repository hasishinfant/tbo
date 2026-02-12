/**
 * AI Travel Assistant Types
 * 
 * Types for the real-time travel assistant, trip mode,
 * and assistant actions.
 */

export type AssistantActionType = 'emergency' | 'translation' | 'navigation' | 'weather' | 'safety';

export interface AssistantRequest {
  userId: string;
  tripId: string;
  query: string;
  context: {
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
    currentDestination: string;
    language: string;
  };
  conversationId?: string;
}

export interface AssistantResponse {
  response: string;
  actions?: AssistantAction[];
  conversationId: string;
  responseTime: number; // milliseconds
}

export interface AssistantAction {
  type: AssistantActionType;
  data: any;
  displayText: string;
}

export interface TripModeStatus {
  userId: string;
  tripId: string;
  isActive: boolean;
  startedAt?: string;
  currentDestination?: string;
}
