/**
 * Unit Tests for Confidence Score Service
 * 
 * Tests for the core confidence score calculation logic,
 * including normalization, badge mapping, and score calculation.
 */

import {
  normalizeToScale,
  mapScoreToBadge,
  calculateConfidenceScore,
  createFactorBreakdown,
  generateScoreExplanation,
  calculateConfidenceScoreResponse,
  DEFAULT_WEIGHTS,
  type FactorScores,
} from '../confidenceScoreService';
import type { ConfidenceScoreRequest } from '../../types/confidence';

describe('Confidence Score Service', () => {
  describe('normalizeToScale', () => {
    it('should normalize values to 0-100 scale', () => {
      expect(normalizeToScale(50, 0, 100)).toBe(50);
      expect(normalizeToScale(0, 0, 100)).toBe(0);
      expect(normalizeToScale(100, 0, 100)).toBe(100);
    });

    it('should handle different ranges', () => {
      expect(normalizeToScale(5, 0, 10)).toBe(50);
      expect(normalizeToScale(75, 50, 100)).toBe(50);
    });

    it('should clamp values outside range', () => {
      expect(normalizeToScale(-10, 0, 100)).toBe(0);
      expect(normalizeToScale(150, 0, 100)).toBe(100);
    });

    it('should return 50 when min equals max', () => {
      expect(normalizeToScale(5, 5, 5)).toBe(50);
    });
  });

  describe('mapScoreToBadge', () => {
    it('should map Low badge for scores 0-40', () => {
      expect(mapScoreToBadge(0)).toBe('Low');
      expect(mapScoreToBadge(20)).toBe('Low');
      expect(mapScoreToBadge(40)).toBe('Low');
    });

    it('should map Moderate badge for scores 41-65', () => {
      expect(mapScoreToBadge(41)).toBe('Moderate');
      expect(mapScoreToBadge(50)).toBe('Moderate');
      expect(mapScoreToBadge(65)).toBe('Moderate');
    });

    it('should map High badge for scores 66-85', () => {
      expect(mapScoreToBadge(66)).toBe('High');
      expect(mapScoreToBadge(75)).toBe('High');
      expect(mapScoreToBadge(85)).toBe('High');
    });

    it('should map Excellent badge for scores 86-100', () => {
      expect(mapScoreToBadge(86)).toBe('Excellent');
      expect(mapScoreToBadge(95)).toBe('Excellent');
      expect(mapScoreToBadge(100)).toBe('Excellent');
    });
  });

  describe('calculateConfidenceScore', () => {
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

    it('should calculate 100 for perfect scores', () => {
      const score = calculateConfidenceScore(perfectScores);
      expect(score).toBe(100);
    });

    it('should calculate 0 for zero scores', () => {
      const score = calculateConfidenceScore(zeroScores);
      expect(score).toBe(0);
    });

    it('should calculate weighted average correctly', () => {
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

      const expectedScore =
        80 * 0.20 +
        60 * 0.10 +
        70 * 0.15 +
        50 * 0.10 +
        90 * 0.15 +
        40 * 0.10 +
        55 * 0.10 +
        65 * 0.10;

      const score = calculateConfidenceScore(mixedScores);
      expect(score).toBeCloseTo(expectedScore, 2);
    });

    it('should use custom weights when provided', () => {
      const scores: FactorScores = {
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
        safetyIndex: 0.50, // Increased weight
      };

      const score = calculateConfidenceScore(scores, customWeights);
      expect(score).toBe(50); // 100 * 0.50
    });

    it('should clamp scores to 0-100 range', () => {
      const overScores: FactorScores = {
        safetyIndex: 150,
        weatherStability: 150,
        transportAccessibility: 150,
        languageCompatibility: 150,
        healthEmergency: 150,
        budgetMatch: 150,
        crowdDensity: 150,
        preferenceAlignment: 150,
      };

      const score = calculateConfidenceScore(overScores);
      expect(score).toBe(100);
    });
  });

  describe('createFactorBreakdown', () => {
    it('should create breakdown for all factors', () => {
      const scores: FactorScores = {
        safetyIndex: 80,
        weatherStability: 60,
        transportAccessibility: 70,
        languageCompatibility: 50,
        healthEmergency: 90,
        budgetMatch: 40,
        crowdDensity: 55,
        preferenceAlignment: 65,
      };

      const breakdown = createFactorBreakdown(scores, DEFAULT_WEIGHTS);

      expect(breakdown).toHaveLength(8);
      expect(breakdown[0]).toHaveProperty('factorName');
      expect(breakdown[0]).toHaveProperty('score');
      expect(breakdown[0]).toHaveProperty('weight');
      expect(breakdown[0]).toHaveProperty('contribution');
      expect(breakdown[0]).toHaveProperty('explanation');
    });

    it('should calculate contributions correctly', () => {
      const scores: FactorScores = {
        safetyIndex: 80,
        weatherStability: 60,
        transportAccessibility: 70,
        languageCompatibility: 50,
        healthEmergency: 90,
        budgetMatch: 40,
        crowdDensity: 55,
        preferenceAlignment: 65,
      };

      const breakdown = createFactorBreakdown(scores, DEFAULT_WEIGHTS);
      const safetyFactor = breakdown.find(f => f.factorName === 'Safety Index');

      expect(safetyFactor?.contribution).toBeCloseTo(80 * 0.20, 2);
    });
  });

  describe('generateScoreExplanation', () => {
    it('should generate explanation with badge description', () => {
      const breakdown = createFactorBreakdown(
        {
          safetyIndex: 80,
          weatherStability: 60,
          transportAccessibility: 70,
          languageCompatibility: 50,
          healthEmergency: 90,
          budgetMatch: 40,
          crowdDensity: 55,
          preferenceAlignment: 65,
        },
        DEFAULT_WEIGHTS
      );

      const explanation = generateScoreExplanation('High', breakdown);

      expect(explanation).toContain('well-suited');
      expect(explanation).toContain('Safety Index');
    });

    it('should include top contributing factors', () => {
      const breakdown = createFactorBreakdown(
        {
          safetyIndex: 100,
          weatherStability: 10,
          transportAccessibility: 10,
          languageCompatibility: 10,
          healthEmergency: 10,
          budgetMatch: 10,
          crowdDensity: 10,
          preferenceAlignment: 10,
        },
        DEFAULT_WEIGHTS
      );

      const explanation = generateScoreExplanation('Moderate', breakdown);

      expect(explanation).toContain('Safety Index');
    });
  });

  describe('calculateConfidenceScoreResponse', () => {
    it('should return complete response with all fields', () => {
      const request: ConfidenceScoreRequest = {
        destinationId: 'paris-france',
        userId: 'user123',
        travelDates: {
          startDate: '2024-06-01',
          endDate: '2024-06-10',
        },
      };

      const factorScores: FactorScores = {
        safetyIndex: 80,
        weatherStability: 70,
        transportAccessibility: 85,
        languageCompatibility: 60,
        healthEmergency: 90,
        budgetMatch: 50,
        crowdDensity: 45,
        preferenceAlignment: 70,
      };

      const response = calculateConfidenceScoreResponse(request, factorScores);

      expect(response.destinationId).toBe('paris-france');
      expect(response.score).toBeGreaterThanOrEqual(0);
      expect(response.score).toBeLessThanOrEqual(100);
      expect(response.badge).toBeDefined();
      expect(response.breakdown).toHaveLength(8);
      expect(response.explanation).toBeDefined();
      expect(response.calculatedAt).toBeDefined();
      expect(response.ttl).toBe(21600);
    });

    it('should use user preference weights when available', () => {
      const request: ConfidenceScoreRequest = {
        destinationId: 'paris-france',
        userId: 'user123',
        travelDates: {
          startDate: '2024-06-01',
          endDate: '2024-06-10',
        },
        userProfile: {
          userId: 'user123',
          persona: {
            budgetTier: 'mid-range',
            travelStyle: 'solo',
            experienceLevel: 'intermediate',
          },
          preferences: {
            prioritySafety: true,
            preferredClimate: 'temperate',
            languagePreferences: ['en'],
            mobilityRequirements: 'none',
            budgetRange: {
              min: 1000,
              max: 3000,
              currency: 'USD',
            },
          },
          travelHistory: {
            tripCount: 5,
            visitedDestinations: ['london', 'berlin'],
            averageRating: 4.5,
          },
          preferenceWeights: {
            userId: 'user123',
            weights: {
              safetyIndex: 0.30, // Higher than default
              weatherStability: 0.05,
              transportAccessibility: 0.15,
              languageCompatibility: 0.10,
              healthEmergency: 0.15,
              budgetMatch: 0.10,
              crowdDensity: 0.15,
            },
            confidence: 0.8,
            lastUpdated: '2024-01-01T00:00:00Z',
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      const factorScores: FactorScores = {
        safetyIndex: 100,
        weatherStability: 0,
        transportAccessibility: 0,
        languageCompatibility: 0,
        healthEmergency: 0,
        budgetMatch: 0,
        crowdDensity: 0,
        preferenceAlignment: 0,
      };

      const response = calculateConfidenceScoreResponse(request, factorScores);

      // With custom weight of 0.30 for safety, score should be 30
      expect(response.score).toBeCloseTo(30, 1);
    });
  });
});
