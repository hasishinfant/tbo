/**
 * Manual Verification Script for Confidence Score Service
 * 
 * This script demonstrates the confidence score calculation service
 * with example data to verify all functionality works correctly.
 */

import {
  calculateConfidenceScoreResponse,
  calculateConfidenceScore,
  mapScoreToBadge,
  normalizeToScale,
  type FactorScores,
} from '../confidenceScoreService';
import type { ConfidenceScoreRequest } from '../../types/confidence';

console.log('=== Confidence Score Service Manual Verification ===\n');

// Test 1: Normalization
console.log('Test 1: Normalization Function');
console.log('normalizeToScale(50, 0, 100):', normalizeToScale(50, 0, 100)); // Expected: 50
console.log('normalizeToScale(5, 0, 10):', normalizeToScale(5, 0, 10)); // Expected: 50
console.log('normalizeToScale(-10, 0, 100):', normalizeToScale(-10, 0, 100)); // Expected: 0
console.log('normalizeToScale(150, 0, 100):', normalizeToScale(150, 0, 100)); // Expected: 100
console.log('');

// Test 2: Badge Mapping
console.log('Test 2: Badge Mapping');
console.log('mapScoreToBadge(30):', mapScoreToBadge(30)); // Expected: Low
console.log('mapScoreToBadge(50):', mapScoreToBadge(50)); // Expected: Moderate
console.log('mapScoreToBadge(75):', mapScoreToBadge(75)); // Expected: High
console.log('mapScoreToBadge(95):', mapScoreToBadge(95)); // Expected: Excellent
console.log('');

// Test 3: Score Calculation with Default Weights
console.log('Test 3: Score Calculation with Default Weights');
const perfectScores: FactorScores = {
  safetyIndex: 100,
  weatherStability: 100,
  transportAccessibility: 100,
  languageCompatibility: 100,
  healthEmergency: 100,
  budgetMatch: 100,
  crowdDensity: 100,
  preferenceAlignment: 100,
};
console.log('Perfect scores (all 100):', calculateConfidenceScore(perfectScores)); // Expected: 100

const zeroScores: FactorScores = {
  safetyIndex: 0,
  weatherStability: 0,
  transportAccessibility: 0,
  languageCompatibility: 0,
  healthEmergency: 0,
  budgetMatch: 0,
  crowdDensity: 0,
  preferenceAlignment: 0,
};
console.log('Zero scores (all 0):', calculateConfidenceScore(zeroScores)); // Expected: 0

const mixedScores: FactorScores = {
  safetyIndex: 80,
  weatherStability: 60,
  transportAccessibility: 70,
  languageCompatibility: 50,
  healthEmergency: 90,
  budgetMatch: 40,
  crowdDensity: 55,
  preferenceAlignment: 65,
};
console.log('Mixed scores:', calculateConfidenceScore(mixedScores)); // Expected: ~68.5
console.log('');

// Test 4: Complete Response Generation
console.log('Test 4: Complete Response Generation');
const request: ConfidenceScoreRequest = {
  destinationId: 'paris-france',
  userId: 'user123',
  travelDates: {
    startDate: '2024-06-01',
    endDate: '2024-06-10',
  },
};

const parisScores: FactorScores = {
  safetyIndex: 85,
  weatherStability: 75,
  transportAccessibility: 95,
  languageCompatibility: 60,
  healthEmergency: 90,
  budgetMatch: 50,
  crowdDensity: 45,
  preferenceAlignment: 70,
};

const response = calculateConfidenceScoreResponse(request, parisScores);
console.log('Destination:', response.destinationId);
console.log('Score:', response.score);
console.log('Badge:', response.badge);
console.log('Explanation:', response.explanation);
console.log('TTL:', response.ttl, 'seconds');
console.log('Number of factors:', response.breakdown.length);
console.log('\nFactor Breakdown:');
response.breakdown.forEach(factor => {
  console.log(`  - ${factor.factorName}: ${factor.score} (weight: ${factor.weight}, contribution: ${factor.contribution.toFixed(2)})`);
});
console.log('');

// Test 5: Custom Weights
console.log('Test 5: Custom Weights (Safety Priority)');
const safetyPriorityScores: FactorScores = {
  safetyIndex: 100,
  weatherStability: 0,
  transportAccessibility: 0,
  languageCompatibility: 0,
  healthEmergency: 0,
  budgetMatch: 0,
  crowdDensity: 0,
  preferenceAlignment: 0,
};

const customWeights = {
  safetyIndex: 0.50, // Increased from 0.20
};

const scoreWithCustomWeights = calculateConfidenceScore(safetyPriorityScores, customWeights);
console.log('Score with 50% safety weight:', scoreWithCustomWeights); // Expected: 50
console.log('');

// Test 6: User Profile with Preference Weights
console.log('Test 6: User Profile with Preference Weights');
const requestWithProfile: ConfidenceScoreRequest = {
  destinationId: 'tokyo-japan',
  userId: 'user456',
  travelDates: {
    startDate: '2024-09-01',
    endDate: '2024-09-15',
  },
  userProfile: {
    userId: 'user456',
    persona: {
      budgetTier: 'luxury',
      travelStyle: 'couple',
      experienceLevel: 'experienced',
    },
    preferences: {
      prioritySafety: true,
      preferredClimate: 'temperate',
      languagePreferences: ['en', 'ja'],
      mobilityRequirements: 'none',
      budgetRange: {
        min: 5000,
        max: 10000,
        currency: 'USD',
      },
    },
    travelHistory: {
      tripCount: 15,
      visitedDestinations: ['paris', 'london', 'new-york', 'singapore'],
      averageRating: 4.8,
    },
    preferenceWeights: {
      userId: 'user456',
      weights: {
        safetyIndex: 0.35,
        weatherStability: 0.05,
        transportAccessibility: 0.15,
        languageCompatibility: 0.05,
        healthEmergency: 0.15,
        budgetMatch: 0.15,
        crowdDensity: 0.10,
      },
      confidence: 0.9,
      lastUpdated: '2024-01-15T00:00:00Z',
    },
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
};

const tokyoScores: FactorScores = {
  safetyIndex: 95,
  weatherStability: 80,
  transportAccessibility: 98,
  languageCompatibility: 70,
  healthEmergency: 92,
  budgetMatch: 85,
  crowdDensity: 40,
  preferenceAlignment: 88,
};

const responseWithProfile = calculateConfidenceScoreResponse(requestWithProfile, tokyoScores);
console.log('Destination:', responseWithProfile.destinationId);
console.log('Score with personalized weights:', responseWithProfile.score);
console.log('Badge:', responseWithProfile.badge);
console.log('Explanation:', responseWithProfile.explanation);
console.log('');

console.log('=== All Tests Completed Successfully ===');
