/**
 * Mock Confidence Service
 * 
 * Frontend-only implementation using mock data for demonstration.
 * This can be replaced with real API calls later.
 */

import type { ConfidenceScoreResponse } from '../types/confidence';
import { calculateConfidenceScore, mapScoreToBadge, createFactorBreakdown, generateScoreExplanation, DEFAULT_WEIGHTS, type FactorScores } from './confidenceScoreService';

// Mock confidence scores for known destinations
const DESTINATION_CONFIDENCE_DATA: Record<string, FactorScores> = {
  'bengaluru': {
    safetyIndex: 80,
    weatherStability: 85,
    transportAccessibility: 75,
    languageCompatibility: 90,
    healthEmergency: 85,
    budgetMatch: 85,
    crowdDensity: 55,
    preferenceAlignment: 80,
  },
  'tokyo': {
    safetyIndex: 95,
    weatherStability: 80,
    transportAccessibility: 98,
    languageCompatibility: 50,
    healthEmergency: 92,
    budgetMatch: 60,
    crowdDensity: 40,
    preferenceAlignment: 85,
  },
  'bali': {
    safetyIndex: 75,
    weatherStability: 85,
    transportAccessibility: 65,
    languageCompatibility: 55,
    healthEmergency: 70,
    budgetMatch: 90,
    crowdDensity: 60,
    preferenceAlignment: 80,
  },
  'new-york': {
    safetyIndex: 80,
    weatherStability: 70,
    transportAccessibility: 90,
    languageCompatibility: 95,
    healthEmergency: 95,
    budgetMatch: 40,
    crowdDensity: 35,
    preferenceAlignment: 75,
  },
  'santorini': {
    safetyIndex: 90,
    weatherStability: 90,
    transportAccessibility: 60,
    languageCompatibility: 65,
    healthEmergency: 75,
    budgetMatch: 55,
    crowdDensity: 50,
    preferenceAlignment: 85,
  },
  'iceland': {
    safetyIndex: 98,
    weatherStability: 60,
    transportAccessibility: 70,
    languageCompatibility: 85,
    healthEmergency: 88,
    budgetMatch: 45,
    crowdDensity: 70,
    preferenceAlignment: 75,
  },
};

/**
 * Calculate confidence score for a destination (mock implementation)
 */
export async function getMockConfidenceScore(
  destinationId: string,
  _userId?: string
): Promise<ConfidenceScoreResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get destination-specific scores or generate random ones
  const factorScores = DESTINATION_CONFIDENCE_DATA[destinationId] || generateRandomFactorScores();
  
  // Calculate score using the real algorithm
  const score = calculateConfidenceScore(factorScores, DEFAULT_WEIGHTS);
  const badge = mapScoreToBadge(score);
  const breakdown = createFactorBreakdown(factorScores, DEFAULT_WEIGHTS);
  const explanation = generateScoreExplanation(score, badge, breakdown);
  
  return {
    destinationId,
    score,
    badge,
    breakdown,
    explanation,
    calculatedAt: new Date().toISOString(),
    ttl: 21600,
  };
}

/**
 * Generate random factor scores for unknown destinations
 */
function generateRandomFactorScores(): FactorScores {
  return {
    safetyIndex: 60 + Math.random() * 35,
    weatherStability: 60 + Math.random() * 35,
    transportAccessibility: 60 + Math.random() * 35,
    languageCompatibility: 50 + Math.random() * 40,
    healthEmergency: 65 + Math.random() * 30,
    budgetMatch: 50 + Math.random() * 40,
    crowdDensity: 40 + Math.random() * 50,
    preferenceAlignment: 60 + Math.random() * 35,
  };
}

/**
 * Get all confidence scores for multiple destinations
 */
export async function getMockConfidenceScores(
  destinationIds: string[]
): Promise<Record<string, ConfidenceScoreResponse>> {
  const scores: Record<string, ConfidenceScoreResponse> = {};
  
  for (const id of destinationIds) {
    scores[id] = await getMockConfidenceScore(id);
  }
  
  return scores;
}
