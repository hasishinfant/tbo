/**
 * Unit tests for itinerary service booking integration
 * 
 * Tests hotel and flight booking integration with the itinerary service
 */

import { itineraryService } from '../itineraryService';
import type { HotelBooking, FlightBooking } from '@/types/itinerary';

describe('itineraryService - Booking Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('addHotelBooking', () => {
    it('should add hotel booking to itinerary', () => {
      const hotelBooking: HotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Grand Hotel',
        address: '123 Main St',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 5,
        checkIn: new Date('2024-06-01'),
        checkOut: new Date('2024-06-05'),
        roomType: 'Deluxe Suite',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe', 'Mrs. Jane Doe'],
        totalFare: 1200,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      itineraryService.addHotelBooking(hotelBooking);

      const storedItinerary = itineraryService.getStoredItinerary();
      expect(storedItinerary.hotels).toHaveLength(1);
      expect(storedItinerary.hotels[0]).toMatchObject({
        confirmationNumber: 'CONF-001',
        hotelName: 'Grand Hotel',
      });
    });

    it('should handle multiple hotel bookings', () => {
      const hotel1: HotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Hotel A',
        address: '123 Main St',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 4,
        checkIn: new Date('2024-06-01'),
        checkOut: new Date('2024-06-03'),
        roomType: 'Standard',
        mealType: 'Room Only',
        guests: ['Mr. John Doe'],
        totalFare: 500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      const hotel2: HotelBooking = {
        confirmationNumber: 'CONF-002',
        bookingReferenceId: 'REF-002',
        hotelName: 'Hotel B',
        address: '456 Oak Ave',
        cityName: 'London',
        countryName: 'UK',
        starRating: 5,
        checkIn: new Date('2024-06-03'),
        checkOut: new Date('2024-06-06'),
        roomType: 'Deluxe',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe'],
        totalFare: 800,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: false,
      };

      itineraryService.addHotelBooking(hotel1);
      itineraryService.addHotelBooking(hotel2);

      const hotels = itineraryService.getHotelBookings();
      expect(hotels).toHaveLength(2);
      expect(hotels[0].hotelName).toBe('Hotel A');
      expect(hotels[1].hotelName).toBe('Hotel B');
    });
  });

  describe('addFlightBooking', () => {
    it('should add flight booking to itinerary', () => {
      const flightBooking: FlightBooking = {
        bookingReference: 'BOOK-001',
        pnr: 'ABC123',
        airline: 'Air France',
        flightNumber: 'AF123',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: new Date('2024-06-01T10:00:00'),
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: new Date('2024-06-01T22:00:00'),
        },
        passengers: ['Mr. John Doe', 'Mrs. Jane Doe'],
        totalFare: 1500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      itineraryService.addFlightBooking(flightBooking);

      const storedItinerary = itineraryService.getStoredItinerary();
      expect(storedItinerary.flights).toHaveLength(1);
      expect(storedItinerary.flights[0]).toMatchObject({
        bookingReference: 'BOOK-001',
        pnr: 'ABC123',
        airline: 'Air France',
      });
    });

    it('should handle multiple flight bookings', () => {
      const flight1: FlightBooking = {
        bookingReference: 'BOOK-001',
        pnr: 'ABC123',
        airline: 'Air France',
        flightNumber: 'AF123',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: new Date('2024-06-01T10:00:00'),
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: new Date('2024-06-01T22:00:00'),
        },
        passengers: ['Mr. John Doe'],
        totalFare: 800,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      const flight2: FlightBooking = {
        bookingReference: 'BOOK-002',
        pnr: 'DEF456',
        airline: 'British Airways',
        flightNumber: 'BA456',
        departure: {
          airport: 'CDG',
          city: 'Paris',
          time: new Date('2024-06-10T14:00:00'),
        },
        arrival: {
          airport: 'JFK',
          city: 'New York',
          time: new Date('2024-06-10T18:00:00'),
        },
        passengers: ['Mr. John Doe'],
        totalFare: 900,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      itineraryService.addFlightBooking(flight1);
      itineraryService.addFlightBooking(flight2);

      const flights = itineraryService.getFlightBookings();
      expect(flights).toHaveLength(2);
      expect(flights[0].airline).toBe('Air France');
      expect(flights[1].airline).toBe('British Airways');
    });
  });

  describe('getHotelBookings', () => {
    it('should return empty array when no hotels booked', () => {
      const hotels = itineraryService.getHotelBookings();
      expect(hotels).toEqual([]);
    });

    it('should return all hotel bookings', () => {
      const hotel: HotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Test Hotel',
        address: '123 Test St',
        cityName: 'Test City',
        countryName: 'Test Country',
        starRating: 4,
        checkIn: new Date('2024-06-01'),
        checkOut: new Date('2024-06-03'),
        roomType: 'Standard',
        mealType: 'Room Only',
        guests: ['Mr. Test User'],
        totalFare: 300,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      itineraryService.addHotelBooking(hotel);
      const hotels = itineraryService.getHotelBookings();
      
      expect(hotels).toHaveLength(1);
      expect(hotels[0].confirmationNumber).toBe('CONF-001');
    });
  });

  describe('getFlightBookings', () => {
    it('should return empty array when no flights booked', () => {
      const flights = itineraryService.getFlightBookings();
      expect(flights).toEqual([]);
    });

    it('should return all flight bookings', () => {
      const flight: FlightBooking = {
        bookingReference: 'BOOK-001',
        pnr: 'ABC123',
        airline: 'Test Airlines',
        flightNumber: 'TA123',
        departure: {
          airport: 'TST',
          city: 'Test City',
          time: new Date('2024-06-01T10:00:00'),
        },
        arrival: {
          airport: 'DST',
          city: 'Destination City',
          time: new Date('2024-06-01T14:00:00'),
        },
        passengers: ['Mr. Test User'],
        totalFare: 500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      itineraryService.addFlightBooking(flight);
      const flights = itineraryService.getFlightBookings();
      
      expect(flights).toHaveLength(1);
      expect(flights[0].bookingReference).toBe('BOOK-001');
    });
  });

  describe('calculateItineraryConfidence', () => {
    it('should return base score of 50 with no bookings', () => {
      const itinerary = { flights: [], hotels: [] };
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(50);
    });

    it('should increase score by 20 with flight bookings', () => {
      const itinerary = { 
        flights: [{ bookingReference: 'BOOK-001' }], 
        hotels: [] 
      };
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(70);
    });

    it('should increase score by 20 with hotel bookings', () => {
      const itinerary = { 
        flights: [], 
        hotels: [{ confirmationNumber: 'CONF-001' }] 
      };
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(70);
    });

    it('should increase score by 50 with both flight and hotel bookings', () => {
      const itinerary = { 
        flights: [{ bookingReference: 'BOOK-001' }], 
        hotels: [{ confirmationNumber: 'CONF-001' }] 
      };
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(100);
    });

    it('should cap score at 100', () => {
      const itinerary = { 
        flights: [
          { bookingReference: 'BOOK-001' },
          { bookingReference: 'BOOK-002' }
        ], 
        hotels: [
          { confirmationNumber: 'CONF-001' },
          { confirmationNumber: 'CONF-002' }
        ] 
      };
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(100);
    });
  });

  describe('getStoredItinerary', () => {
    it('should return default structure when no itinerary exists', () => {
      const itinerary = itineraryService.getStoredItinerary();
      expect(itinerary).toEqual({ flights: [], hotels: [], days: [] });
    });

    it('should return stored itinerary', () => {
      const testItinerary = {
        flights: [{ bookingReference: 'BOOK-001' }],
        hotels: [{ confirmationNumber: 'CONF-001' }],
        days: []
      };
      
      localStorage.setItem('travelsphere_itinerary', JSON.stringify(testItinerary));
      
      const itinerary = itineraryService.getStoredItinerary();
      expect(itinerary).toEqual(testItinerary);
    });
  });
});
