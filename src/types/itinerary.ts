// Itinerary-related type definitions
export interface Place {
  name: string;
  description: string;
  estimatedTime: string;
  category: string;
}

export interface FoodRecommendation {
  name: string;
  type: string;
  description: string;
  priceRange: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: Date;
  places: Place[];
  foodRecommendations: FoodRecommendation[];
  travelTips: string[];
}