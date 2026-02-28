/**
 * Combined Booking Service Tests
 * 
 * Tests the coordination of flight and hotel bookings together.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { combinedBookingService } from '../combinedBookingService';
import { bookingService } from '../bookingService';
import { hotelBookingService } from '../hotelBookingService';
import type { FlightResult } from '../../types/tekTravelsApi';
import type { Hotel } from '../../types/tboHotelApi';

// Mock the individual booking services
vi.mock('../bookingService');
vi.mock('../hotelBookingService');

describe('CombinedBookingService', () => {
  // Mock data
  const mockFlight: FlightResult = {
    ResultIndex: '123',
    Source: 1,
    IsLCC: false,
    IsRefundable: true,
    AirlineCode: 'TA',
    AirlineName: 'Test Airlines',
    FlightNumber: 'TA123',
    FareClassification: { Type: 'Economy' },
    Segments: [[{
      Origin: {
        AirportCode: 'JFK',
        AirportName: 'John F Kennedy',
        Terminal: '1',
        DepTime: '2024-06-01T10:00:00Z',
        ArrTime: '',
        CityCode: 'NYC',
        CityName: 'New York',
        CountryCode: 'US',
        CountryName: 'USA',
      },
      Destination: {
        AirportCode: 'LAX',
        AirportName: 'Los Angeles International',
        Terminal: '2',
        DepTime: '',
        ArrTime: '2024-06-01T13:00:00Z',
        CityCode: 'LAX',
        CityName: 'Los Angeles',
        CountryCode: 'US',
        CountryName: 'USA',
      },
      AirlineCode: 'TA',
      AirlineName: 'Test Airlines',
      FlightNumber: 'TA123',
      FareClass: 'Y',
      OperatingCarrier: 'TA',
      Duration: 180,
      GroundTime: 0,
      Mile: 2475,
      StopOver: false,
      FlightInfoIndex: 'FI1',
      Baggage: '23 Kg',
      CabinBaggage: '8 Kg',
      AccumulatedDuration: 180,
      Craft: 'B737',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Active',
    }]],
    LastTicketDate: '2024-05-31T23:59:59',
    TicketAdvisory: 'Book now',
    FareRules: [],
    Fare: {
      Currency: 'USD',
      BaseFare: 450,
      Tax: 50,
      YQTax: 25,
      AdditionalTxnFeeOfrd: 0,
      AdditionalTxnFeePub: 0,
      PGCharge: 0,
      OtherCharges: 0,
      ChargeBU: [],
      Discount: 0,
      PublishedFare: 500,
      OfferedFare: 500,
      TdsOnCommission: 0,
      TdsOnPLB: 0,
      TdsOnIncentive: 0,
      ServiceFee: 0,
    },
  };

  const mockHotel: Hotel = {
    bookingCode: 'HOTEL123',
    hotelName: 'Test Hotel',
    hotelCode: 'TH001',
    starRating: 4,
    address: '123 Test St',
    cityName: 'Los Angeles',
    countryName: 'USA',
    price: 200,
    currency: 'USD',
    refundable: true,
    mealType: 'Breakfast',
    roomType: 'Deluxe',
    availableRooms: 5,
    amenities: ['WiFi', 'Pool'],
    images: ['image1.jpg'],
  };

  const mockHotelSearchCriteria = {
    checkIn: new Date('2024-06-01'),
    checkOut: new Date('2024-06-03'),
    guestNationality: 'US',
    paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
  };

  const traceId = 'TRACE123';

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
    
    // Cancel any existing sessions
    combinedBookingService.cancelSession();
  });

  describe('startCombinedBooking', () => {
    it('should start a combined booking session with flight and hotel', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      const mockHotelSession = {
        sessionId: 'hotel_session_123',
        hotel: mockHotel,
        searchCriteria: mockHotelSearchCriteria,
        bookingCode: 'HOTEL123',
        status: 'details' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);
      vi.mocked(hotelBookingService.startBooking).mockReturnValue(mockHotelSession);

      const session = combinedBookingService.startCombinedBooking(
        mockFlight,
        traceId,
        mockHotel,
        mockHotelSearchCriteria
      );

      expect(session).toBeDefined();
      expect(session.flightSession).toEqual(mockFlightSession);
      expect(session.hotelSession).toEqual(mockHotelSession);
      expect(session.status).toBe('flight_repricing');
      expect(bookingService.startBooking).toHaveBeenCalledWith(mockFlight, traceId);
      expect(hotelBookingService.startBooking).toHaveBeenCalledWith(mockHotel, mockHotelSearchCriteria);
    });

    it('should cancel any existing session before starting a new one', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      const mockHotelSession = {
        sessionId: 'hotel_session_123',
        hotel: mockHotel,
        searchCriteria: mockHotelSearchCriteria,
        bookingCode: 'HOTEL123',
        status: 'details' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);
      vi.mocked(hotelBookingService.startBooking).mockReturnValue(mockHotelSession);

      // Start first session
      combinedBookingService.startCombinedBooking(
        mockFlight,
        traceId,
        mockHotel,
        mockHotelSearchCriteria
      );

      // Start second session
      combinedBookingService.startCombinedBooking(
        mockFlight,
        traceId,
        mockHotel,
        mockHotelSearchCriteria
      );

      // Should have called startBooking twice for each service
      expect(bookingService.startBooking).toHaveBeenCalledTimes(2);
      expect(hotelBookingService.startBooking).toHaveBeenCalledTimes(2);
    });
  });

  describe('startFlightOnlyBooking', () => {
    it('should start a flight-only booking session', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);

      const session = combinedBookingService.startFlightOnlyBooking(mockFlight, traceId);

      expect(session).toBeDefined();
      expect(session.flightSession).toEqual(mockFlightSession);
      expect(session.hotelSession).toBeUndefined();
      expect(session.status).toBe('flight_repricing');
      expect(bookingService.startBooking).toHaveBeenCalledWith(mockFlight, traceId);
      expect(hotelBookingService.startBooking).not.toHaveBeenCalled();
    });
  });

  describe('startHotelOnlyBooking', () => {
    it('should start a hotel-only booking session', () => {
      const mockHotelSession = {
        sessionId: 'hotel_session_123',
        hotel: mockHotel,
        searchCriteria: mockHotelSearchCriteria,
        bookingCode: 'HOTEL123',
        status: 'details' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(hotelBookingService.startBooking).mockReturnValue(mockHotelSession);

      const session = combinedBookingService.startHotelOnlyBooking(
        mockHotel,
        mockHotelSearchCriteria
      );

      expect(session).toBeDefined();
      expect(session.hotelSession).toEqual(mockHotelSession);
      expect(session.flightSession).toBeUndefined();
      expect(session.status).toBe('hotel_prebook');
      expect(hotelBookingService.startBooking).toHaveBeenCalledWith(mockHotel, mockHotelSearchCriteria);
      expect(bookingService.startBooking).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current active session', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);

      combinedBookingService.startFlightOnlyBooking(mockFlight, traceId);
      const session = combinedBookingService.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.flightSession).toEqual(mockFlightSession);
    });

    it('should return null if no active session', () => {
      const session = combinedBookingService.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should return null and cancel session if expired', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(Date.now() - 31 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);

      // Start the booking
      const session = combinedBookingService.startFlightOnlyBooking(mockFlight, traceId);
      
      // Manually set the session to be expired
      const expiredSession = {
        ...session,
        expiresAt: new Date(Date.now() - 1000),
      };
      
      // Access private method through any cast to set expired session
      (combinedBookingService as any).currentSession = expiredSession;
      
      // Now getCurrentSession should return null
      const retrievedSession = combinedBookingService.getCurrentSession();

      expect(retrievedSession).toBeNull();
    });
  });

  describe('updateSessionStatus', () => {
    it('should update the session status', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);

      combinedBookingService.startFlightOnlyBooking(mockFlight, traceId);
      combinedBookingService.updateSessionStatus('passenger_details');

      const session = combinedBookingService.getCurrentSession();
      expect(session?.status).toBe('passenger_details');
    });

    it('should throw error if no active session', () => {
      expect(() => {
        combinedBookingService.updateSessionStatus('passenger_details');
      }).toThrow('No active combined booking session');
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total cost for combined booking', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      const mockHotelSession = {
        sessionId: 'hotel_session_123',
        hotel: mockHotel,
        searchCriteria: mockHotelSearchCriteria,
        bookingCode: 'HOTEL123',
        status: 'details' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);
      vi.mocked(hotelBookingService.startBooking).mockReturnValue(mockHotelSession);

      combinedBookingService.startCombinedBooking(
        mockFlight,
        traceId,
        mockHotel,
        mockHotelSearchCriteria
      );

      const totalCost = combinedBookingService.calculateTotalCost();
      expect(totalCost).toBe(700); // 500 (flight) + 200 (hotel)
    });

    it('should return 0 if no active session', () => {
      const totalCost = combinedBookingService.calculateTotalCost();
      expect(totalCost).toBe(0);
    });

    it('should calculate cost for flight-only booking', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);

      combinedBookingService.startFlightOnlyBooking(mockFlight, traceId);

      const totalCost = combinedBookingService.calculateTotalCost();
      expect(totalCost).toBe(500); // Flight only
    });
  });

  describe('cancelSession', () => {
    it('should cancel both flight and hotel sessions', () => {
      const mockFlightSession = {
        traceId,
        sessionId: 'flight_session_123',
        flight: mockFlight,
        status: 'repricing' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      const mockHotelSession = {
        sessionId: 'hotel_session_123',
        hotel: mockHotel,
        searchCriteria: mockHotelSearchCriteria,
        bookingCode: 'HOTEL123',
        status: 'details' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      vi.mocked(bookingService.startBooking).mockReturnValue(mockFlightSession);
      vi.mocked(hotelBookingService.startBooking).mockReturnValue(mockHotelSession);

      combinedBookingService.startCombinedBooking(
        mockFlight,
        traceId,
        mockHotel,
        mockHotelSearchCriteria
      );

      combinedBookingService.cancelSession();

      expect(bookingService.cancelSession).toHaveBeenCalled();
      expect(hotelBookingService.cancelSession).toHaveBeenCalled();
      expect(combinedBookingService.getCurrentSession()).toBeNull();
    });
  });
});
