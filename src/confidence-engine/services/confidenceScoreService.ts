/**
 * Confidence Score Calculation Service
 * 
 * Core service for calculating traveler confidence scores based on
 * eight weighted factors. Implements the confidence score algorithm
 * with configurable weights, factor normalization, badge mapping,
 * and explanation generation.
 * 
 * Algorithm:
 * ConfidenceScore = Σ(FactorScore_i × Weight_i) for i = 1 to 8
 */

import type {
  ConfidenceScoreRequest,
  ConfidenceScoreResponse,
  FactorBreakdown,
  ConfidenceBadge,
} from '../types/confidence';

/**
 * Default weights for the eight confidence factors
 * These can be overridden by user-specific preference weights
 */
export const DEFAULT_WEIGHTS = {
  safetyIndex: 0.20,
  weatherStability: 0.10,
  transportAccessibility: 0.15,
  languageCompatibility: 0.10,
  healthEmergency: 0.15,
  budgetMatch: 0.10,
  crowdDensity: 0.10,
  preferenceAlignment: 0.10,
};

/**
 * Factor scores input for calculation
 * All scores should be normalized to 0-100 scale
 */
export interface FactorScores {
  safetyIndex: number;
  weatherStability: number;
  transportAccessibility: number;
  languageCompatibility: number;
  healthEmergency: number;
  budgetMatch: number;
  crowdDensity: number;
  preferenceAlignment: number;
}

/**
 * Normalizes a raw value to 0-100 scale
 * @param value - Raw value to normalize
 * @param min - Minimum possible value
 * @param max - Maximum possible value
 * @returns Normalized score between 0 and 100
 */
export function normalizeToScale(value: number, min: number, max: number): number {
  if (max === min) return 50; // Default to middle if no range
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Maps a confidence score to its badge category
 * - Low: 0-40
 * - Moderate: 41-65
 * - High: 66-85
 * - Excellent: 86-100
 */
export function mapScoreToBadge(score: number): ConfidenceBadge {
  if (score <= 40) return 'Low';
  if (score <= 65) return 'Moderate';
  if (score <= 85) return 'High';
  return 'Excellent';
}

/**
 * Generates a human-readable explanation for a confidence score
 */
export function generateScoreExplanation(
  _score: number,
  badge: ConfidenceBadge,
  breakdown: FactorBreakdown[]
): string {
  const topFactors = breakdown
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map(f => f.factorName);

  const badgeDescriptions = {
    Low: 'This destination has some concerns that may affect your travel experience.',
    Moderate: 'This destination is suitable for travel with some considerations.',
    High: 'This destination is well-suited for your travel preferences.',
    Excellent: 'This destination is an excellent match for your travel profile.',
  };

  const topFactorsText = topFactors.length > 0
    ? ` Key factors include ${topFactors.join(', ')}.`
    : '';

  return `${badgeDescriptions[badge]}${topFactorsText}`;
}

/**
 * Calculates the confidence score using the weighted factor algorithm
 */
export function calculateConfidenceScore(
  factorScores: FactorScores,
  weights?: Partial<typeof DEFAULT_WEIGHTS>
): number {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };

  const score =
    factorScores.safetyIndex * finalWeights.safetyIndex +
    factorScores.weatherStability * finalWeights.weatherStability +
    factorScores.transportAccessibility * finalWeights.transportAccessibility +
    factorScores.languageCompatibility * finalWeights.languageCompatibility +
    factorScores.healthEmergency * finalWeights.healthEmergency +
    factorScores.budgetMatch * finalWeights.budgetMatch +
    factorScores.crowdDensity * finalWeights.crowdDensity +
    factorScores.preferenceAlignment * finalWeights.preferenceAlignment;

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Creates factor breakdown with explanations
 */
export function createFactorBreakdown(
  factorScores: FactorScores,
  weights: typeof DEFAULT_WEIGHTS
): FactorBreakdown[] {
  const factorExplanations: Record<keyof FactorScores, string> = {
    safetyIndex: 'Based on crime data and travel advisories',
    weatherStability: 'Forecast reliability and severe weather risk',
    transportAccessibility: 'Public transport and infrastructure quality',
    languageCompatibility: 'Language match and English prevalence',
    healthEmergency: 'Hospital quality and emergency response',
    budgetMatch: 'Cost alignment with your budget preferences',
    crowdDensity: 'Seasonal tourism volume and crowd levels',
    preferenceAlignment: 'Match with your travel history and preferences',
  };

  const factorNames: Record<keyof FactorScores, string> = {
    safetyIndex: 'Safety Index',
    weatherStability: 'Weather Stability',
    transportAccessibility: 'Transport Accessibility',
    languageCompatibility: 'Language Compatibility',
    healthEmergency: 'Health & Emergency',
    budgetMatch: 'Budget Match',
    crowdDensity: 'Crowd Density',
    preferenceAlignment: 'Preference Alignment',
  };

  return Object.entries(factorScores).map(([key, score]) => {
    const factorKey = key as keyof FactorScores;
    const weight = weights[factorKey];
    return {
      factorName: factorNames[factorKey],
      score,
      weight,
      contribution: score * weight,
      explanation: factorExplanations[factorKey],
    };
  });
}

/**
 * Main service function to calculate complete confidence score response
 */
export function calculateConfidenceScoreResponse(
  request: ConfidenceScoreRequest,
  factorScores: FactorScores
): ConfidenceScoreResponse {
  // Use user-specific weights if available, otherwise use defaults
  const weights = request.userProfile?.preferenceWeights?.weights
    ? {
        safetyIndex: request.userProfile.preferenceWeights.weights.safetyIndex,
        weatherStability: request.userProfile.preferenceWeights.weights.weatherStability,
        transportAccessibility: request.userProfile.preferenceWeights.weights.transportAccessibility,
        languageCompatibility: request.userProfile.preferenceWeights.weights.languageCompatibility,
        healthEmergency: request.userProfile.preferenceWeights.weights.healthEmergency,
        budgetMatch: request.userProfile.preferenceWeights.weights.budgetMatch,
        crowdDensity: request.userProfile.preferenceWeights.weights.crowdDensity,
        preferenceAlignment: DEFAULT_WEIGHTS.preferenceAlignment, // Not in PreferenceWeights
      }
    : DEFAULT_WEIGHTS;

  const score = calculateConfidenceScore(factorScores, weights);
  const badge = mapScoreToBadge(score);
  const breakdown = createFactorBreakdown(factorScores, weights);
  const explanation = generateScoreExplanation(score, badge, breakdown);

  return {
    destinationId: request.destinationId,
    score,
    badge,
    breakdown,
    explanation,
    calculatedAt: new Date().toISOString(),
    ttl: 21600, // 6 hours in seconds
  };
}
