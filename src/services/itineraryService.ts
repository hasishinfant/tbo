// Itinerary generation service with Codex integration
import type { TripPlannerFormData } from '@/types/trip';
import type { ItineraryResponse, ApiResponse } from '@/types/api';
import type { FlightBooking, HotelBooking, ItineraryDay } from '@/types/itinerary';
import { generateMockItinerary } from './mockDataService';
import { generateItineraryWithCodex, isCodexAvailable } from './codexService';

const ITINERARY_STORAGE_KEY = 'travelsphere_itinerary';

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

  // Add hotel booking to itinerary
  addHotelBooking(hotelBooking: HotelBooking): void {
    try {
      const itinerary = this.getStoredItinerary();
      
      // Initialize hotels array if not exists
      if (!itinerary.hotels) {
        itinerary.hotels = [];
      }
      
      // Add hotel booking
      itinerary.hotels.push(hotelBooking);
      
      // Update itinerary days with hotel information
      this.updateItineraryDaysWithHotel(itinerary, hotelBooking);
      
      // Save updated itinerary
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
      
      console.info('Hotel booking added to itinerary:', hotelBooking.confirmationNumber);
    } catch (error) {
      console.error('Failed to add hotel booking to itinerary:', error);
      throw error;
    }
  },

  // Add flight booking to itinerary
  addFlightBooking(flightBooking: FlightBooking): void {
    try {
      const itinerary = this.getStoredItinerary();
      
      // Initialize flights array if not exists
      if (!itinerary.flights) {
        itinerary.flights = [];
      }
      
      // Add flight booking
      itinerary.flights.push(flightBooking);
      
      // Update itinerary days with flight information
      this.updateItineraryDaysWithFlight(itinerary, flightBooking);
      
      // Save updated itinerary
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
      
      console.info('Flight booking added to itinerary:', flightBooking.bookingReference);
    } catch (error) {
      console.error('Failed to add flight booking to itinerary:', error);
      throw error;
    }
  },

  // Get stored itinerary
  getStoredItinerary(): any {
    const stored = localStorage.getItem(ITINERARY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { flights: [], hotels: [], days: [] };
  },

  // Get all hotel bookings from itinerary
  getHotelBookings(): HotelBooking[] {
    const itinerary = this.getStoredItinerary();
    return itinerary.hotels || [];
  },

  // Get all flight bookings from itinerary
  getFlightBookings(): FlightBooking[] {
    const itinerary = this.getStoredItinerary();
    return itinerary.flights || [];
  },

  // Update itinerary days with hotel booking
  updateItineraryDaysWithHotel(itinerary: any, hotel: HotelBooking): void {
    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return;
    }

    const checkInDate = new Date(hotel.checkIn).toDateString();
    const checkOutDate = new Date(hotel.checkOut).toDateString();

    itinerary.days.forEach((day: ItineraryDay) => {
      const dayDate = new Date(day.date).toDateString();
      
      // Add hotel to check-in day
      if (dayDate === checkInDate) {
        if (!day.hotels) {
          day.hotels = [];
        }
        day.hotels.push({
          ...hotel,
          status: 'check-in',
        } as any);
      }
      
      // Add hotel to check-out day
      if (dayDate === checkOutDate) {
        if (!day.hotels) {
          day.hotels = [];
        }
        day.hotels.push({
          ...hotel,
          status: 'check-out',
        } as any);
      }
      
      // Add hotel to days in between (staying)
      const dayTime = new Date(day.date).getTime();
      const checkInTime = new Date(hotel.checkIn).getTime();
      const checkOutTime = new Date(hotel.checkOut).getTime();
      
      if (dayTime > checkInTime && dayTime < checkOutTime) {
        if (!day.hotels) {
          day.hotels = [];
        }
        day.hotels.push({
          ...hotel,
          status: 'staying',
        } as any);
      }
    });
  },

  // Update itinerary days with flight booking
  updateItineraryDaysWithFlight(itinerary: any, flight: FlightBooking): void {
    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return;
    }

    const departureDate = new Date(flight.departure.time).toDateString();
    const arrivalDate = new Date(flight.arrival.time).toDateString();

    itinerary.days.forEach((day: ItineraryDay) => {
      const dayDate = new Date(day.date).toDateString();
      
      // Add flight to departure day
      if (dayDate === departureDate) {
        if (!day.flights) {
          day.flights = [];
        }
        day.flights.push({
          ...flight,
          status: 'departure',
        } as any);
      }
      
      // Add flight to arrival day if different
      if (dayDate === arrivalDate && departureDate !== arrivalDate) {
        if (!day.flights) {
          day.flights = [];
        }
        day.flights.push({
          ...flight,
          status: 'arrival',
        } as any);
      }
    });
  },

  // Calculate confidence score for itinerary with bookings
  calculateItineraryConfidence(itinerary: any): number {
    let score = 50; // Base score
    
    // Increase score if flights are booked
    if (itinerary.flights && itinerary.flights.length > 0) {
      score += 20;
    }
    
    // Increase score if hotels are booked
    if (itinerary.hotels && itinerary.hotels.length > 0) {
      score += 20;
    }
    
    // Increase score if both flights and hotels are booked
    if (itinerary.flights?.length > 0 && itinerary.hotels?.length > 0) {
      score += 10;
    }
    
    return Math.min(score, 100);
  },
};