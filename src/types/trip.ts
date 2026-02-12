// Trip-related type definitions
import type { Destination } from './destination';
import type { ItineraryDay } from './itinerary';

export type BudgetLevel = 'low' | 'medium' | 'luxury';
export type Interest = 'food' | 'adventure' | 'culture' | 'nature' | 'shopping';

export interface TripPreferences {
  budget: BudgetLevel;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  interests: Interest[];
  groupSize?: number;
}

export interface TripPlannerFormData {
  destination: string;
  budget: BudgetLevel;
  startDate: Date;
  endDate: Date;
  interests: Interest[];
}

export interface Trip {
  id: string;
  destination: Destination;
  preferences: TripPreferences;
  itinerary: ItineraryDay[];
  createdAt: Date;
  status: 'planning' | 'active' | 'completed';
}