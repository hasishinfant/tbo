/**
 * Preference Learning Service
 * 
 * Tracks user preferences and learns from behavior
 */

const PREFERENCES_KEY = 'traveler_preferences';
const INTERACTIONS_KEY = 'traveler_interactions';

export interface TravelerPreferences {
  budgetRange: { min: number; max: number; currency: string };
  travelStyle: 'budget' | 'balanced' | 'luxury' | 'adventurous' | 'relaxed';
  interests: string[];
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  languagePreferences: string[];
  previousDestinations: string[];
  preferredActivities: string[];
  avoidances: string[];
}

export interface ImplicitSignal {
  destinationId: string;
  action: 'view' | 'click' | 'bookmark' | 'share';
  duration?: number;
  timestamp: Date;
}

export interface ExplicitFeedback {
  destinationId: string;
  rating: number;
  categories: string[];
  comments?: string;
  timestamp: Date;
}

export interface PreferenceWeights {
  budgetSensitivity: number;
  safetyPriority: number;
  adventureLevel: number;
  crowdTolerance: number;
  culturalInterest: number;
  naturePreference: number;
  foodImportance: number;
  luxuryPreference: number;
}

/**
 * Get stored preferences or return defaults
 */
export function getPreferences(): TravelerPreferences {
  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultPreferences();
    }
  }
  return getDefaultPreferences();
}

/**
 * Get default preferences
 */
function getDefaultPreferences(): TravelerPreferences {
  return {
    budgetRange: { min: 50, max: 200, currency: 'USD' },
    travelStyle: 'balanced',
    interests: ['culture', 'food', 'nature'],
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    languagePreferences: ['en'],
    previousDestinations: [],
    preferredActivities: [],
    avoidances: [],
  };
}

/**
 * Save preferences
 */
export function savePreferences(preferences: TravelerPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

/**
 * Track implicit signal (view, click, etc.)
 */
export function trackImplicitSignal(signal: ImplicitSignal): void {
  const interactions = getInteractions();
  interactions.push({
    ...signal,
    timestamp: new Date(),
  });
  
  // Keep only last 100 interactions
  if (interactions.length > 100) {
    interactions.shift();
  }
  
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
  
  // Update preferences based on signal
  updatePreferencesFromSignal(signal);
}

/**
 * Submit explicit feedback
 */
export function submitFeedback(feedback: ExplicitFeedback): void {
  const preferences = getPreferences();
  
  // Add to previous destinations if rated highly
  if (feedback.rating >= 4 && !preferences.previousDestinations.includes(feedback.destinationId)) {
    preferences.previousDestinations.push(feedback.destinationId);
  }
  
  // Update interests based on categories
  feedback.categories.forEach(category => {
    if (!preferences.interests.includes(category)) {
      preferences.interests.push(category);
    }
  });
  
  savePreferences(preferences);
}

/**
 * Get preference weights for confidence scoring
 */
export function getPreferenceWeights(): PreferenceWeights {
  const preferences = getPreferences();
  const interactions = getInteractions();
  
  // Calculate weights based on preferences and behavior
  const weights: PreferenceWeights = {
    budgetSensitivity: calculateBudgetSensitivity(preferences),
    safetyPriority: calculateSafetyPriority(preferences),
    adventureLevel: calculateAdventureLevel(preferences, interactions),
    crowdTolerance: calculateCrowdTolerance(preferences, interactions),
    culturalInterest: calculateCulturalInterest(preferences, interactions),
    naturePreference: calculateNaturePreference(preferences, interactions),
    foodImportance: calculateFoodImportance(preferences, interactions),
    luxuryPreference: calculateLuxuryPreference(preferences),
  };
  
  return weights;
}

/**
 * Get stored interactions
 */
function getInteractions(): ImplicitSignal[] {
  const stored = localStorage.getItem(INTERACTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Update preferences based on implicit signal
 */
function updatePreferencesFromSignal(_signal: ImplicitSignal): void {
  // For now, just track the signal
  // In a real implementation, this would use ML to update preferences
}

/**
 * Calculate budget sensitivity (0-1)
 */
function calculateBudgetSensitivity(preferences: TravelerPreferences): number {
  const range = preferences.budgetRange.max - preferences.budgetRange.min;
  if (range < 50) return 0.9; // Very budget conscious
  if (range < 150) return 0.6; // Moderate
  return 0.3; // Flexible budget
}

/**
 * Calculate safety priority (0-1)
 */
function calculateSafetyPriority(preferences: TravelerPreferences): number {
  // Higher priority for families, accessibility needs, etc.
  if (preferences.accessibilityNeeds.length > 0) return 0.9;
  return 0.7; // Default high priority
}

/**
 * Calculate adventure level (0-1)
 */
function calculateAdventureLevel(preferences: TravelerPreferences, _interactions: ImplicitSignal[]): number {
  const adventureInterests = ['adventure', 'hiking', 'sports', 'extreme'];
  const hasAdventureInterest = preferences.interests.some((i: string) => adventureInterests.includes(i));
  
  if (hasAdventureInterest) return 0.8;
  if (preferences.travelStyle === 'adventurous') return 0.9;
  if (preferences.travelStyle === 'relaxed') return 0.3;
  return 0.5;
}

/**
 * Calculate crowd tolerance (0-1)
 */
function calculateCrowdTolerance(preferences: TravelerPreferences, _interactions: ImplicitSignal[]): number {
  if (preferences.avoidances.includes('crowds')) return 0.2;
  if (preferences.travelStyle === 'relaxed') return 0.4;
  return 0.6;
}

/**
 * Calculate cultural interest (0-1)
 */
function calculateCulturalInterest(preferences: TravelerPreferences, _interactions: ImplicitSignal[]): number {
  const culturalInterests = ['culture', 'history', 'art', 'museums'];
  const count = preferences.interests.filter((i: string) => culturalInterests.includes(i)).length;
  return Math.min(count * 0.3, 1);
}

/**
 * Calculate nature preference (0-1)
 */
function calculateNaturePreference(preferences: TravelerPreferences, _interactions: ImplicitSignal[]): number {
  const natureInterests = ['nature', 'hiking', 'wildlife', 'outdoors'];
  const count = preferences.interests.filter((i: string) => natureInterests.includes(i)).length;
  return Math.min(count * 0.3, 1);
}

/**
 * Calculate food importance (0-1)
 */
function calculateFoodImportance(preferences: TravelerPreferences, _interactions: ImplicitSignal[]): number {
  if (preferences.interests.includes('food')) return 0.9;
  if (preferences.dietaryRestrictions.length > 0) return 0.8;
  return 0.6;
}

/**
 * Calculate luxury preference (0-1)
 */
function calculateLuxuryPreference(preferences: TravelerPreferences): number {
  if (preferences.travelStyle === 'luxury') return 0.9;
  if (preferences.budgetRange.min > 150) return 0.7;
  if (preferences.budgetRange.max < 100) return 0.2;
  return 0.5;
}

/**
 * Clear all stored preferences and interactions
 */
export function clearPreferences(): void {
  localStorage.removeItem(PREFERENCES_KEY);
  localStorage.removeItem(INTERACTIONS_KEY);
}
