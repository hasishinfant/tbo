/**
 * End-to-End Tests for Hotel Booking Flow
 * 
 * Comprehensive tests covering:
 * - Complete hotel booking flow from search to confirmation
 * - Price change scenario during pre-book
 * - Room unavailability handling
 * - API failure and mock fallback
 * - Session timeout and recovery
 * - Multi-room booking with multiple guests
 * - Booking management (view, cancel)
 * - Combined flight + hotel booking
 * 
 * Requirements: All (from hotel-booking-api-integration spec)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getHotelSearchService } from '../hotelSearchService';
import { hotelBookingService } from '../hotelBookingService';
import { preBookService } from '../preBookService';
import { bookingManagementService } from '../bookingManagementService';
import { combinedBookingService } from '../combinedBookingService';
import { itineraryService } from '../itineraryService';
import type { HotelSearchCriteria } from '../hotelSearchService';
import type { GuestDetails, PaymentInfo } from '../hotelBookingService';
import type { FlightResult } from '../../types/tekTravelsApi';

// Get service instance
const hotelSearchService = getHotelSearchService();

// Mock the API clients
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: () => ({
    searchHotels: vi.fn().mockResolvedValue({
      HotelSearchResult: {
        HotelResults: [{
          BookingCode: 'BOOK123',
          HotelCode: 'HTL001',
          HotelName: 'Grand Plaza Hotel',
          StarRating: 5,
          HotelAddress: '123 Main Street',
          HotelContactNo: '+1234567890',
          Price: { PublishedPrice: 1500, CurrencyCode: 'USD' },
          IsRefundable: true,
          RoomTypeName: 'Deluxe Suite',
          Inclusion: ['Breakfast'],
          HotelPicture: 'image1.jpg',
        }],
      },
    }),
    preBook: vi.fn().mockResolvedValue({
      BookingCode: 'PREBOOK123',
      HotelRoomsDetails: [{
        Price: { PublishedPrice: 1500, CurrencyCode: 'USD' },
      }],
      Status: 'Success',
    }),
    createBooking: vi.fn().mockResolvedValue({
      ConfirmationNo: 'CONF-12345',
      BookingRefNo: 'REF-12345',
      Status: 'Confirmed',
      HotelDetails: {
        HotelName: 'Grand Plaza Hotel',
        CheckInDate: '2024-06-15',
        CheckOutDate: '2024-06-20',
        TotalFare: 1500,
        CurrencyCode: 'USD',
      },
      VoucherUrl: 'https://example.com/voucher/12345',
    }),
    getBookingDetails: vi.fn().mockResolvedValue({
      ConfirmationNo: 'CONF-12345',
      BookingRefNo: 'REF-12345',
      Status: 'Confirmed',
      HotelDetails: {
        HotelName: 'Grand Plaza Hotel',
        CheckInDate: '2024-06-15',
        CheckOutDate: '2024-06-20',
        TotalFare: 1500,
        CurrencyCode: 'USD',
      },
    }),
    cancelBooking: vi.fn().mockResolvedValue({
      Status: 'Success',
      CancellationCharge: 0,
      RefundAmount: 1500,
    }),
  }),
}));

vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: () => ({
    createBooking: vi.fn().mockResolvedValue({
      Response: {
        TraceId: 'TRACE123',
        BookingId: 987654,
        PNR: 'ABC123',
        Status: 1,
        FlightItinerary: {
          Passenger: [{
            Ticket: { TicketId: 'T1', TicketNumber: 'TKT001' },
            PaxId: 1,
            Title: 'Mr',
            FirstName: 'John',
            LastName: 'Doe',
            PaxType: 1,
          }],
          Segments: [],
          Fare: {
            Currency: 'USD',
            BaseFare: 800,
            Tax: 200,
            PublishedFare: 1100,
            OfferedFare: 1100,
          },
        },
      },
    }),
  }),
}));

describe('Hotel Booking End-to-End Tests', () => {
  let mockSearchCriteria: HotelSearchCriteria;

  beforeEach(() => {
    // Clear all sessions and storage
    hotelBookingService.cancelSession();
    combinedBookingService.cancelSession();
    localStorage.clear();

    // Use future dates for testing
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 7); // 7 days from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 5); // 5 nights

    mockSearchCriteria = {
      checkIn,
      checkOut,
      cityCode: 'PAR',
      guestNationality: 'US',
      paxRooms: [
        { adults: 2, children: 0, childrenAges: [] },
      ],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Hotel Booking Flow', () => {
    it('should complete full booking flow from search to confirmation', async () => {
      // Step 1: Search for hotels
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      
      expect(searchResult.hotels).toHaveLength(1);
      expect(searchResult.hotels[0].hotelName).toBe('Grand Plaza Hotel');
      expect(searchResult.hotels[0].bookingCode).toBe('BOOK123');

      // Step 2: Start booking session
      const hotel = searchResult.hotels[0];
      const session = hotelBookingService.startBooking(hotel, mockSearchCriteria);
      
      expect(session.status).toBe('details');
      expect(session.hotel.hotelName).toBe('Grand Plaza Hotel');

      // Step 3: Pre-book validation
      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');
      
      expect(preBookResult.available).toBe(true);
      expect(preBookResult.priceChanged).toBe(false);
      expect(preBookResult.currentPrice).toBe(1500);

      // Update session with pre-book result
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      // Step 4: Submit guest details
      const guestDetails: GuestDetails[] = [{
        roomIndex: 0,
        customerNames: [
          { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' },
          { title: 'Mrs', firstName: 'Jane', lastName: 'Doe', type: 'Adult' },
        ],
      }];

      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      // Step 5: Complete booking
      const confirmation = await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      expect(confirmation.confirmationNumber).toBe('CONF-12345');
      expect(confirmation.status).toBe('Confirmed');
      expect(confirmation.hotelName).toBe('Grand Plaza Hotel');
      expect(confirmation.totalFare).toBe(1500);

      // Verify booking added to itinerary
      const hotels = itineraryService.getHotelBookings();
      expect(hotels).toHaveLength(1);
      expect(hotels[0].confirmationNumber).toBe('CONF-12345');
    });
  });

  describe('Price Change Scenario', () => {
    it('should handle price increase during pre-book', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockClient = getTboHotelApiClient();
      
      // Mock pre-book with price increase
      vi.mocked(mockClient.preBook).mockResolvedValueOnce({
        BookingCode: 'PREBOOK123',
        HotelRoomsDetails: [{
          Price: { PublishedPrice: 1650, CurrencyCode: 'USD' }, // Price increased
        }],
        Status: 'Success',
      });

      // Search and start booking
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      // Pre-book with price change
      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');

      expect(preBookResult.priceChanged).toBe(true);
      expect(preBookResult.originalPrice).toBe(1500);
      expect(preBookResult.currentPrice).toBe(1650);
      expect(preBookResult.available).toBe(true);

      // User should be notified and must confirm
      // In real UI, this would require user confirmation before proceeding
    });

    it('should handle price decrease during pre-book', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockClient = getTboHotelApiClient();
      
      // Mock pre-book with price decrease
      vi.mocked(mockClient.preBook).mockResolvedValueOnce({
        BookingCode: 'PREBOOK123',
        HotelRoomsDetails: [{
          Price: { PublishedPrice: 1350, CurrencyCode: 'USD' }, // Price decreased
        }],
        Status: 'Success',
      });

      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');

      expect(preBookResult.priceChanged).toBe(true);
      expect(preBookResult.originalPrice).toBe(1500);
      expect(preBookResult.currentPrice).toBe(1350);
      expect(preBookResult.available).toBe(true);
    });
  });

  describe('Room Unavailability Handling', () => {
    it('should handle room sold out during pre-book', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockClient = getTboHotelApiClient();
      
      // Mock pre-book with unavailable status
      vi.mocked(mockClient.preBook).mockRejectedValueOnce(
        new Error('Room no longer available')
      );

      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      await expect(
        preBookService.preBook(hotel.bookingCode, 'Limit')
      ).rejects.toThrow('Room no longer available');

      // Session should be preserved for user to select another hotel
      const session = hotelBookingService.getCurrentSession();
      expect(session).not.toBeNull();
      expect(session?.status).toBe('details');
    });
  });

  describe('API Failure and Mock Fallback', () => {
    it('should fallback to mock data when search API fails', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockClient = getTboHotelApiClient();
      
      // Mock API failure
      vi.mocked(mockClient.searchHotels).mockRejectedValueOnce(
        new Error('Network error')
      );

      const searchResult = await hotelSearchService.search(mockSearchCriteria);

      // Should return mock data
      expect(searchResult.hotels.length).toBeGreaterThan(0);
      expect(searchResult.hotels[0].hotelName).toBeDefined();
      
      // Mock data should be clearly indicated
      const session = hotelSearchService.getCurrentSearchSession();
      expect(session).toBeDefined();
    });

    it('should fallback to mock data when pre-book API fails', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockClient = getTboHotelApiClient();
      
      // Search succeeds
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      // Pre-book fails
      vi.mocked(mockClient.preBook).mockRejectedValueOnce(
        new Error('API timeout')
      );

      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');

      // Should return mock pre-book result
      expect(preBookResult.available).toBe(true);
      expect(preBookResult.bookingCode).toBeDefined();
    });
  });

  describe('Session Timeout and Recovery', () => {
    it('should handle session timeout gracefully', () => {
      // Start booking
      const hotel = {
        bookingCode: 'BOOK123',
        hotelCode: 'HTL001',
        hotelName: 'Test Hotel',
        starRating: 4,
        address: '123 Test St',
        cityName: 'Paris',
        countryName: 'France',
        price: 1000,
        currency: 'USD',
        refundable: true,
        mealType: 'Breakfast',
        roomType: 'Standard',
        availableRooms: 5,
        amenities: [],
        images: [],
      };
      
      const session = hotelBookingService.startBooking(hotel, mockSearchCriteria);

      // Manually expire session by setting expiresAt to past
      const expiredSession = {
        ...session,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      
      // Manually set expired session in storage
      localStorage.setItem('hotel_booking_session', JSON.stringify({
        ...expiredSession,
        createdAt: expiredSession.createdAt.toISOString(),
        expiresAt: expiredSession.expiresAt.toISOString(),
        searchCriteria: {
          ...expiredSession.searchCriteria,
          checkIn: expiredSession.searchCriteria.checkIn.toISOString(),
          checkOut: expiredSession.searchCriteria.checkOut.toISOString(),
        },
      }));

      // Try to get current session - should return null for expired session
      const currentSession = hotelBookingService.getCurrentSession();
      expect(currentSession).toBeNull();

      // Session should be cleared from storage
      expect(localStorage.getItem('hotel_booking_session')).toBeNull();
    });

    it('should allow session recovery before timeout', () => {
      const hotel = {
        bookingCode: 'BOOK123',
        hotelCode: 'HTL001',
        hotelName: 'Test Hotel',
        starRating: 4,
        address: '123 Test St',
        cityName: 'Paris',
        countryName: 'France',
        price: 1000,
        currency: 'USD',
        refundable: true,
        mealType: 'Breakfast',
        roomType: 'Standard',
        availableRooms: 5,
        amenities: [],
        images: [],
      };

      const session = hotelBookingService.startBooking(hotel, mockSearchCriteria);
      const sessionId = session.sessionId;

      // Simulate page refresh
      const restoredSession = hotelBookingService.restoreSession();

      expect(restoredSession).not.toBeNull();
      expect(restoredSession?.sessionId).toBe(sessionId);
      expect(restoredSession?.hotel.hotelName).toBe('Test Hotel');
    });
  });

  describe('Multi-Room Booking with Multiple Guests', () => {
    it('should handle booking with multiple rooms and different guest counts', async () => {
      // Search with multiple rooms
      const today = new Date();
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 7);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + 5);

      const multiRoomCriteria: HotelSearchCriteria = {
        checkIn,
        checkOut,
        cityCode: 'PAR',
        guestNationality: 'US',
        paxRooms: [
          { adults: 2, children: 1, childrenAges: [8] },
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const searchResult = await hotelSearchService.search(multiRoomCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, multiRoomCriteria);

      // Pre-book
      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      // Guest details for 3 rooms
      const guestDetails: GuestDetails[] = [
        {
          roomIndex: 0,
          customerNames: [
            { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' },
            { title: 'Mrs', firstName: 'Jane', lastName: 'Doe', type: 'Adult' },
            { title: 'Master', firstName: 'Jimmy', lastName: 'Doe', type: 'Child' },
          ],
        },
        {
          roomIndex: 1,
          customerNames: [
            { title: 'Mr', firstName: 'Bob', lastName: 'Smith', type: 'Adult' },
            { title: 'Mrs', firstName: 'Alice', lastName: 'Smith', type: 'Adult' },
          ],
        },
        {
          roomIndex: 2,
          customerNames: [
            { title: 'Ms', firstName: 'Sarah', lastName: 'Johnson', type: 'Adult' },
          ],
        },
      ];

      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      const confirmation = await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      expect(confirmation.confirmationNumber).toBeDefined();
      expect(confirmation.guestDetails).toHaveLength(3);
      expect(confirmation.guestDetails[0].customerNames).toHaveLength(3);
      expect(confirmation.guestDetails[1].customerNames).toHaveLength(2);
      expect(confirmation.guestDetails[2].customerNames).toHaveLength(1);
    });
  });

  describe('Booking Management', () => {
    it('should retrieve booking details by confirmation number', async () => {
      // Complete a booking first
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      const guestDetails: GuestDetails[] = [{
        roomIndex: 0,
        customerNames: [
          { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' },
        ],
      }];

      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      const confirmation = await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      // Retrieve booking details
      const bookingDetails = await bookingManagementService.getBookingDetails(
        confirmation.confirmationNumber
      );

      expect(bookingDetails.confirmationNumber).toBe('CONF-12345');
      expect(bookingDetails.status).toBe('Confirmed');
      expect(bookingDetails.hotelName).toBe('Grand Plaza Hotel');
    });

    it('should cancel booking successfully', async () => {
      // Complete a booking first
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];
      hotelBookingService.startBooking(hotel, mockSearchCriteria);

      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      const guestDetails: GuestDetails[] = [{
        roomIndex: 0,
        customerNames: [
          { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' },
        ],
      }];

      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      const confirmation = await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      // Cancel booking
      const cancelResult = await bookingManagementService.cancelBooking(
        confirmation.confirmationNumber
      );

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.confirmationNumber).toBe('CONF-12345');
      expect(cancelResult.refundAmount).toBe(1500);
    });
  });

  describe('Combined Flight + Hotel Booking', () => {
    let mockFlight: FlightResult;

    beforeEach(() => {
      mockFlight = {
        ResultIndex: 'FLIGHT123',
        Source: 1,
        IsLCC: false,
        IsRefundable: true,
        AirlineCode: 'AF',
        AirlineName: 'Air France',
        FlightNumber: 'AF-123',
        FareClassification: { Type: 'Economy' },
        Segments: [[{
          Origin: {
            AirportCode: 'JFK',
            AirportName: 'John F Kennedy International',
            Terminal: '1',
            DepTime: '2024-06-15T10:00:00',
            ArrTime: '',
            CityCode: 'NYC',
            CityName: 'New York',
            CountryCode: 'US',
            CountryName: 'United States',
          },
          Destination: {
            AirportCode: 'CDG',
            AirportName: 'Charles de Gaulle',
            Terminal: '2E',
            DepTime: '',
            ArrTime: '2024-06-15T22:00:00',
            CityCode: 'PAR',
            CityName: 'Paris',
            CountryCode: 'FR',
            CountryName: 'France',
          },
          AirlineCode: 'AF',
          AirlineName: 'Air France',
          FlightNumber: 'AF-123',
          FareClass: 'Y',
          OperatingCarrier: 'AF',
          Duration: 480,
          GroundTime: 0,
          Mile: 3625,
          StopOver: false,
          FlightInfoIndex: 'FI1',
          Baggage: '23 Kg',
          CabinBaggage: '8 Kg',
          AccumulatedDuration: 480,
          Craft: 'B777',
          Remark: null,
          IsETicketEligible: true,
          FlightStatus: 'Confirmed',
          Status: 'Active',
        }]],
        LastTicketDate: '2024-06-14T23:59:59',
        TicketAdvisory: 'Book now',
        FareRules: [],
        Fare: {
          Currency: 'USD',
          BaseFare: 800,
          Tax: 200,
          YQTax: 100,
          AdditionalTxnFeeOfrd: 0,
          AdditionalTxnFeePub: 0,
          PGCharge: 0,
          OtherCharges: 0,
          ChargeBU: [],
          Discount: 0,
          PublishedFare: 1100,
          OfferedFare: 1100,
          TdsOnCommission: 0,
          TdsOnPLB: 0,
          TdsOnIncentive: 0,
          ServiceFee: 0,
        },
      };
    });

    it('should complete combined flight and hotel booking', async () => {
      // Search for hotel
      const searchResult = await hotelSearchService.search(mockSearchCriteria);
      const hotel = searchResult.hotels[0];

      // Start combined booking
      const session = combinedBookingService.startCombinedBooking(
        mockFlight,
        'TRACE123',
        hotel,
        mockSearchCriteria
      );

      expect(session.flightSession).toBeDefined();
      expect(session.hotelSession).toBeDefined();
      expect(session.status).toBe('flight_repricing');

      // Calculate total cost
      const totalCost = combinedBookingService.calculateTotalCost();
      expect(totalCost).toBe(2600); // 1100 (flight) + 1500 (hotel)

      // Pre-book hotel
      const preBookResult = await preBookService.preBook(hotel.bookingCode, 'Limit');
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      // Complete combined booking
      const passengerDetails = [{
        type: 'Adult' as const,
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        nationality: 'US',
        email: 'john.doe@example.com',
      }];

      const guestDetails: GuestDetails[] = [{
        roomIndex: 0,
        customerNames: [
          { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' },
        ],
      }];

      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      const confirmation = await combinedBookingService.completeCombinedBooking(
        passengerDetails,
        guestDetails,
        paymentInfo
      );

      expect(confirmation.flightBooking).toBeDefined();
      expect(confirmation.hotelBooking).toBeDefined();
      expect(confirmation.totalCost).toBeGreaterThan(0);

      // Verify both bookings in itinerary
      const flights = itineraryService.getFlightBookings();
      const hotels = itineraryService.getHotelBookings();
      
      expect(flights).toHaveLength(1);
      expect(hotels).toHaveLength(1);
    });
  });
});
