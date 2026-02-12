/**
 * Traveler Profile Types
 * 
 * Types for user profiles, preferences, and travel history.
 */

import { PreferenceWeights } from './preferences';

export type BudgetTier = 'budget' | 'mid-range' | 'luxury';
export type TravelStyle = 'solo' | 'couple' | 'family' | 'group';
export type ExperienceLevel = 'novice' | 'intermediate' | 'experienced';
export type PreferredClimate = 'tropical' | 'temperate' | 'cold' | 'any';
export type MobilityRequirements = 'none' | 'moderate' | 'high';

export interface TravelerProfile {
  userId: string;
  persona: {
    budgetTier: BudgetTier;
    travelStyle: TravelStyle;
    experienceLevel: ExperienceLevel;
  };
  preferences: {
    prioritySafety: boolean;
    preferredClimate: PreferredClimate;
    languagePreferences: string[]; // ISO 639-1 codes
    mobilityRequirements: MobilityRequirements;
    budgetRange: {
      min: number;
      max: number;
      currency: string;
    };
  };
  travelHistory: {
    tripCount: number;
    visitedDestinations: string[];
    averageRating: number;
  };
  preferenceWeights?: PreferenceWeights;
  createdAt: string;
  updatedAt: string;
}
