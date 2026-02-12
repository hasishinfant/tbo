// Itinerary generation service with Codex integration
import type { TripPlannerFormData } from '@/types/trip';
import type { ItineraryResponse, ApiResponse } from '@/types/api';
import { generateMockItinerary } from './mockDataService';
import { generateItineraryWithCodex, isCodexAvailable } from './codexService';

export const itineraryService = {
  // Generate itinerary - uses Codex if available, otherwise mock data
  async generateItinerary(formData: TripPlannerFormData): Promise<ApiResponse<ItineraryResponse>> {
    // Check if Codex is available
    if (isCodexAvailable()) {
      try {
        console.info('Generating itinerary with Codex AI');
        
        const codexResponse = await generateItineraryWithCodex(
          formData.destination,
          formData.startDate,
          formData.endDate,
          formData.budget,
          formData.interests
        );
        
        // Parse the Codex response
        const parsedData = JSON.parse(codexResponse);
        
        // Transform to our format
        const itineraryResponse: ItineraryResponse = {
          tripId: `trip-${Date.now()}`,
          itinerary: parsedData.days.map((day: any) => ({
            dayNumber: day.dayNumber,
            date: new Date(day.date),
            places: day.places,
            foodRecommendations: day.foodRecommendations,
            travelTips: day.travelTips,
          })),
          estimatedCost: parsedData.estimatedCost,
          generatedAt: new Date(),
        };
        
        return {
          success: true,
          data: itineraryResponse,
          timestamp: new Date(),
        };
      } catch (error) {
        console.warn('Codex generation failed, falling back to mock data:', error);
        return this.getMockItinerary(formData);
      }
    } else {
      // Codex not configured, use mock data
      console.info('Generating itinerary with mock data (Codex not configured)');
      return this.getMockItinerary(formData);
    }
  },

  // Mock fallback data
  getMockItinerary(formData: TripPlannerFormData): ApiResponse<ItineraryResponse> {
    return generateMockItinerary(formData);
  },
};