/**
 * Test Setup for Confidence Engine
 * 
 * Configuration and utilities for property-based testing with fast-check.
 */

import fc from 'fast-check';

/**
 * Default configuration for property-based tests
 * Minimum 100 iterations as per design requirements
 */
export const PBT_CONFIG = {
  numRuns: 100,
  verbose: false,
  seed: undefined, // Use random seed by default
};

/**
 * Custom arbitraries for confidence engine domain
 */

// Generate valid confidence scores (0-100)
export const confidenceScoreArbitrary = () => fc.float({ min: 0, max: 100 });

// Generate valid factor scores (0-100)
export const factorScoreArbitrary = () => fc.float({ min: 0, max: 100 });

// Generate valid weights (0-1)
export const weightArbitrary = () => fc.float({ min: 0, max: 1 });

// Generate valid destination IDs
export const destinationIdArbitrary = () => 
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

// Generate valid user IDs
export const userIdArbitrary = () => 
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

// Generate valid ISO 8601 date strings
export const isoDateArbitrary = () => 
  fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
    .map(d => d.toISOString());

// Generate valid travel date ranges
export const travelDatesArbitrary = () => 
  fc.tuple(isoDateArbitrary(), isoDateArbitrary())
    .map(([start, end]) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Ensure end date is after start date
      if (endDate <= startDate) {
        endDate.setDate(startDate.getDate() + 1);
      }
      
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    });

// Generate valid confidence badges
export const confidenceBadgeArbitrary = () => 
  fc.constantFrom('Low', 'Moderate', 'High', 'Excellent');

// Generate valid budget tiers
export const budgetTierArbitrary = () => 
  fc.constantFrom('budget', 'mid-range', 'luxury');

// Generate valid travel styles
export const travelStyleArbitrary = () => 
  fc.constantFrom('solo', 'couple', 'family', 'group');

// Generate valid experience levels
export const experienceLevelArbitrary = () => 
  fc.constantFrom('novice', 'intermediate', 'experienced');

/**
 * Helper function to run property tests with default configuration
 */
export const runPropertyTest = <T>(
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => boolean | void,
  config: Partial<typeof PBT_CONFIG> = {}
): void => {
  fc.assert(
    fc.property(arbitrary, predicate),
    { ...PBT_CONFIG, ...config }
  );
};

/**
 * Mock data generators for testing
 */

export const generateMockFactorScores = () => ({
  safety: Math.random() * 100,
  weather: Math.random() * 100,
  transport: Math.random() * 100,
  language: Math.random() * 100,
  health: Math.random() * 100,
  budget: Math.random() * 100,
  crowd: Math.random() * 100,
  preferences: Math.random() * 100,
});

export const generateMockWeights = () => ({
  safetyIndex: 0.20,
  weatherStability: 0.10,
  transportAccessibility: 0.15,
  languageCompatibility: 0.10,
  healthEmergency: 0.15,
  budgetMatch: 0.10,
  crowdDensity: 0.10,
  // Note: preferences weight is implicit (remaining weight)
});
