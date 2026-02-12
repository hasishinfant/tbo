// Custom hook for API calls with enhanced error handling and performance tracking
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryService } from '@/services/itineraryService';
import { chatService } from '@/services/chatService';
import { emergencyService } from '@/services/emergencyService';
import { categorizeError, logError } from '@/utils/errorUtils';
import { usePerformanceTracking } from '@/services/performanceService';
import type { TripPlannerFormData } from '@/types/trip';
import type { EmergencyType } from '@/types/api';

// Query keys
export const QUERY_KEYS = {
  DESTINATIONS: 'destinations',
  TRIPS: 'trips',
  CHAT_SESSIONS: 'chatSessions',
  API_HEALTH: 'apiHealth',
} as const;

// Hook for generating itinerary with enhanced error handling and performance tracking
export function useGenerateItinerary() {
  const { trackApiCall } = usePerformanceTracking();

  return useMutation({
    mutationFn: async (formData: TripPlannerFormData) => {
      const startTime = performance.now();
      
      try {
        const response = await itineraryService.generateItinerary(formData);
        
        // Track performance
        const duration = performance.now() - startTime;
        trackApiCall('generate-itinerary', duration, {
          destination: formData.destination,
          budget: formData.budget,
          success: response.success,
        });
        
        // Log any errors for monitoring
        if (!response.success && response.error) {
          const categorizedError = categorizeError(response.error);
          logError(categorizedError, 'generateItinerary');
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        trackApiCall('generate-itinerary', duration, {
          destination: formData.destination,
          budget: formData.budget,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    onError: (error) => {
      const categorizedError = categorizeError(error);
      logError(categorizedError, 'generateItinerary');
      console.error('Failed to generate itinerary:', error);
    },
  });
}

// Hook for sending chat messages with enhanced error handling and performance tracking
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const { trackApiCall } = usePerformanceTracking();

  return useMutation({
    mutationFn: async ({ message, tripId }: { message: string; tripId?: string }) => {
      const startTime = performance.now();
      
      try {
        const response = await chatService.sendMessage({ message, tripId });
        
        // Track performance
        const duration = performance.now() - startTime;
        trackApiCall('chat-assistant', duration, {
          messageLength: message.length,
          tripId: tripId || 'none',
          success: response.success,
        });
        
        // Log any errors for monitoring
        if (!response.success && response.error) {
          const categorizedError = categorizeError(response.error);
          logError(categorizedError, 'sendChatMessage');
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        trackApiCall('chat-assistant', duration, {
          messageLength: message.length,
          tripId: tripId || 'none',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate chat sessions to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_SESSIONS] });
    },
    onError: (error) => {
      const categorizedError = categorizeError(error);
      logError(categorizedError, 'sendChatMessage');
      console.error('Failed to send chat message:', error);
    },
  });
}

// Hook for emergency requests with enhanced error handling
export function useEmergencyRequest() {
  return useMutation({
    mutationFn: async (type: EmergencyType) => {
      const response = await emergencyService.submitEmergencyRequest({ type });
      
      // Log any errors for monitoring
      if (!response.success && response.error) {
        const categorizedError = categorizeError(response.error);
        logError(categorizedError, 'submitEmergencyRequest');
      }
      
      return response;
    },
    onError: (error) => {
      const categorizedError = categorizeError(error);
      logError(categorizedError, 'submitEmergencyRequest');
      console.error('Failed to submit emergency request:', error);
    },
  });
}

// Hook for fetching destinations (with mock data)
export function useDestinations() {
  return useQuery({
    queryKey: [QUERY_KEYS.DESTINATIONS],
    queryFn: async () => {
      // For now, return sample destinations from constants
      const { SAMPLE_DESTINATIONS } = await import('@/utils/constants');
      return SAMPLE_DESTINATIONS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for managing saved trips
export function useSavedTrips() {
  const queryClient = useQueryClient();

  const { data: trips = [] } = useQuery({
    queryKey: [QUERY_KEYS.TRIPS],
    queryFn: () => {
      // Load from localStorage
      const saved = localStorage.getItem('travelsphere_saved_trips');
      return saved ? JSON.parse(saved) : [];
    },
  });

  const saveTrip = useMutation({
    mutationFn: async (trip: any) => {
      const currentTrips = trips;
      const updatedTrips = [...currentTrips, trip];
      localStorage.setItem('travelsphere_saved_trips', JSON.stringify(updatedTrips));
      return updatedTrips;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS] });
    },
  });

  const removeTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const currentTrips = trips;
      const updatedTrips = currentTrips.filter((trip: any) => trip.id !== tripId);
      localStorage.setItem('travelsphere_saved_trips', JSON.stringify(updatedTrips));
      return updatedTrips;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS] });
    },
  });

  return {
    trips,
    saveTrip,
    removeTrip,
  };
}