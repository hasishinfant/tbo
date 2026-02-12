/**
 * Preference Learning Types
 * 
 * Types for tracking user behavior, collecting feedback,
 * and learning preference weights.
 */

export type EventType = 'click' | 'view' | 'hover' | 'bookmark';

export interface ImplicitSignal {
  userId: string;
  eventType: EventType;
  destinationId: string;
  duration?: number; // milliseconds
  timestamp: string;
}

export interface ExplicitFeedback {
  userId: string;
  tripId: string;
  destinationId: string;
  ratings: {
    overall: number; // 1-5
    safety: number;
    value: number;
    accessibility: number;
    experience: number;
  };
  comments?: string;
  timestamp: string;
}

export interface PreferenceWeights {
  userId: string;
  weights: {
    safetyIndex: number;
    weatherStability: number;
    transportAccessibility: number;
    languageCompatibility: number;
    healthEmergency: number;
    budgetMatch: number;
    crowdDensity: number;
  };
  confidence: number; // 0-1, based on data volume
  lastUpdated: string;
}

export interface PreferenceLearningData {
  userId: string;
  implicitSignals: ImplicitSignal[];
  explicitFeedback: ExplicitFeedback[];
  derivedWeights: PreferenceWeights;
  lastProcessedAt: string;
}
