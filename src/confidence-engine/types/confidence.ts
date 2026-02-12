/**
 * Confidence Score Engine Types
 * 
 * Core types for confidence score calculation, factor breakdown,
 * and score presentation.
 */

export type ConfidenceBadge = 'Low' | 'Moderate' | 'High' | 'Excellent';

export interface ConfidenceScoreRequest {
  destinationId: string;
  userId: string;
  travelDates: {
    startDate: string; // ISO 8601
    endDate: string;
  };
  userProfile?: import('./traveler').TravelerProfile;
}

export interface ConfidenceScoreResponse {
  destinationId: string;
  score: number; // 0-100
  badge: ConfidenceBadge;
  breakdown: FactorBreakdown[];
  explanation: string;
  calculatedAt: string; // ISO 8601
  ttl: number; // seconds
}

export interface FactorBreakdown {
  factorName: string;
  score: number; // 0-100
  weight: number; // 0-1
  contribution: number; // weighted score
  explanation: string;
}

export interface ConfidenceScoreCache {
  cacheKey: string; // hash of destinationId + userId + travelDates
  score: ConfidenceScoreResponse;
  createdAt: string;
  expiresAt: string;
  invalidated: boolean;
}

export interface ExternalDataCache {
  dataType: 'safety' | 'weather' | 'transport' | 'health';
  destinationId: string;
  data: any;
  source: string;
  fetchedAt: string;
  expiresAt: string;
}
