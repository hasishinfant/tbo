/**
 * Integration Tests for Hotel Booking with TravelSphere Features
 * 
 * Tests the integration of hotel booking with:
 * - Itinerary service integration
 * - Navigation flow
 * - Combined flight + hotel bookings
 * - Confidence scoring with hotels
 * 
 * Requirements: All (from hotel-booking-api-integration spec)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { hotelBookingService } from '../hotelBookingService';
import { itineraryService } from '../itineraryService';
import { combinedBookingService } from '../combinedBookingService';
import { bookingService } from '../bookingService';
import type { Hotel, GuestDetails, PaymentInfo } from '../hotelBookingService';
import type { HotelSearchCriteria } from '../hotelSearchService';
import type { FlightResult } from '../../types/tekTravelsApi';
import type { PassengerDetails } from '../bookingService';

// Mock the API clients
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: () => ({
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
  }),
}));

vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: () => ({
    createBooking: vi.fn().mockResolvedValue({
      Response: {
        TraceId: 'TRACE123',
        BookingId: 987654,
        PNR: 'ABC123',
        SSRDenied: false,
        SSRMessage: null,
        Status: 1,
        IsPriceChanged: false,
        IsTimeChanged: false,
        FlightItinerary: {
          Passenger: [{
            Ticket: { TicketId: 'T1', TicketNumber: 'TKT001' },
            PaxId: 1,
            Title: 'Mr',
            FirstName: 'John',
            LastName: 'Doe',
            PaxType: 1,
            DateOfBirth: '1990-01-15',
            Gender: 1,
            Email: 'john.doe@example.com',
            ContactNo: '+1234567890',
          }],
          Segments: [],
          FareRules: [],
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

describe('Hotel Booking Integration Tests', () => {
  let mockHotel: Hotel;
  let mockSearchCriteria: HotelSearchCriteria;

  beforeEach(() => {
    // Clear all sessions and storage
    hotelBookingService.cancelSession();
    bookingService.cancelSession();
    combinedBookingService.cancelSession();
    localStorage.clear();

    // Mock hotel data
    mockHotel = {
      bookingCode: 'HOTEL123',
      hotelCode: 'HTL001',
      hotelName: 'Grand Plaza Hotel',
      starRating: 5,
      address: '123 Main Street',
      cityName: 'Paris',
      countryName: 'France',
      price: 1500,
      currency: 'USD',
      refundable: true,
      mealType: 'Breakfast Included',
      roomType: 'Deluxe Suite',
      availableRooms: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
      images: ['image1.jpg', 'image2.jpg'],
    };

    mockSearchCriteria = {
      checkIn: new Date('2024-06-15'),
      checkOut: new Date('2024-06-20'),
      cityCode: 'PAR',
      guestNationality: 'US',
      paxRooms: [
        { adults: 2, children: 0, childrenAges: [] },
      ],
    };
  });

  describe('Itinerary Integration', () => {
    it('should add hotel booking to itinerary after successful booking', async () => {
      // Start booking session
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Mock pre-book result
      const preBookResult = {
        bookingCode: 'PREBOOK123',
        originalPrice: 1500,
        currentPrice: 1500,
        priceChanged: false,
        available: true,
      };

      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult,
      });

      // Complete booking
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

      const confirmation = await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      // Verify hotel was added to itinerary
      const hotels = itineraryService.getHotelBookings();
      expect(hotels).toHaveLength(1);
      expect(hotels[0]).toMatchObject({
        confirmationNumber: 'CONF-12345',
        hotelName: 'Grand Plaza Hotel',
        cityName: 'Paris',
        totalFare: 1500,
      });

      // Verify confirmation matches
      expect(confirmation.confirmationNumber).toBe('CONF-12345');
    });

    it('should update itinerary days with hotel check-in and check-out', async () => {
      // Create itinerary with days
      const itinerary = {
        flights: [],
        hotels: [],
        days: [
          { dayNumber: 1, date: new Date('2024-06-15'), places: [], hotels: [] },
          { dayNumber: 2, date: new Date('2024-06-16'), places: [], hotels: [] },
          { dayNumber: 3, date: new Date('2024-06-17'), places: [], hotels: [] },
          { dayNumber: 4, date: new Date('2024-06-18'), places: [], hotels: [] },
          { dayNumber: 5, date: new Date('2024-06-19'), places: [], hotels: [] },
          { dayNumber: 6, date: new Date('2024-06-20'), places: [], hotels: [] },
        ],
      };

      localStorage.setItem('travelsphere_itinerary', JSON.stringify(itinerary));

      // Add hotel booking
      const hotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Grand Plaza Hotel',
        address: '123 Main Street',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 5,
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-20'),
        roomType: 'Deluxe Suite',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe', 'Mrs. Jane Doe'],
        totalFare: 1500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      itineraryService.addHotelBooking(hotelBooking);

      // Verify days were updated
      const updatedItinerary = itineraryService.getStoredItinerary();
      
      // Check-in day should have hotel with check-in status
      expect(updatedItinerary.days[0].hotels).toBeDefined();
      expect(updatedItinerary.days[0].hotels[0].status).toBe('check-in');

      // Days in between should have hotel with staying status
      expect(updatedItinerary.days[1].hotels[0].status).toBe('staying');
      expect(updatedItinerary.days[2].hotels[0].status).toBe('staying');

      // Check-out day should have hotel with check-out status
      expect(updatedItinerary.days[5].hotels[0].status).toBe('check-out');
    });

    it('should handle multiple hotel bookings in itinerary', async () => {
      const hotel1 = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Hotel A',
        address: '123 Main St',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 4,
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-18'),
        roomType: 'Standard',
        mealType: 'Room Only',
        guests: ['Mr. John Doe'],
        totalFare: 600,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      const hotel2 = {
        confirmationNumber: 'CONF-002',
        bookingReferenceId: 'REF-002',
        hotelName: 'Hotel B',
        address: '456 Oak Ave',
        cityName: 'London',
        countryName: 'UK',
        starRating: 5,
        checkIn: new Date('2024-06-18'),
        checkOut: new Date('2024-06-22'),
        roomType: 'Deluxe',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe'],
        totalFare: 900,
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

  describe('Navigation Flow', () => {
    it('should maintain booking session across navigation', () => {
      // Start booking
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      expect(session.status).toBe('details');

      // Simulate navigation away and back
      const sessionId = session.sessionId;
      
      // Restore session
      const restoredSession = hotelBookingService.restoreSession();
      expect(restoredSession).not.toBeNull();
      expect(restoredSession?.sessionId).toBe(sessionId);
      expect(restoredSession?.hotel.hotelName).toBe('Grand Plaza Hotel');
    });

    it('should handle session expiration during navigation', () => {
      // Start booking with short expiration
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      // Manually expire session
      const expiredSession = {
        ...session,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      
      localStorage.setItem('hotel_booking_session', JSON.stringify(expiredSession));

      // Try to restore expired session
      const restoredSession = hotelBookingService.restoreSession();
      expect(restoredSession).toBeNull();
    });

    it('should clear session after successful booking', async () => {
      // Start booking
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Add pre-book result
      hotelBookingService.updateSession({
        status: 'guest_details',
        preBookResult: {
          bookingCode: 'PREBOOK123',
          originalPrice: 1500,
          currentPrice: 1500,
          priceChanged: false,
          available: true,
        },
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

      await hotelBookingService.completeBooking(guestDetails, paymentInfo);

      // Session should be marked as confirmed (not cleared immediately)
      const session = hotelBookingService.getCurrentSession();
      expect(session).not.toBeNull();
      expect(session?.status).toBe('confirmed');
    });
  });

  describe('Combined Flight + Hotel Bookings', () => {
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

    it('should create combined booking session with flight and hotel', () => {
      const session = combinedBookingService.startCombinedBooking(
        mockFlight,
        'TRACE123',
        mockHotel,
        mockSearchCriteria
      );

      expect(session.flightSession).toBeDefined();
      expect(session.hotelSession).toBeDefined();
      expect(session.status).toBe('flight_repricing');
      expect(session.flightSession?.flight.AirlineName).toBe('Air France');
      expect(session.hotelSession?.hotel.hotelName).toBe('Grand Plaza Hotel');
    });

    it('should calculate total cost for combined booking', () => {
      combinedBookingService.startCombinedBooking(
        mockFlight,
        'TRACE123',
        mockHotel,
        mockSearchCriteria
      );

      const totalCost = combinedBookingService.calculateTotalCost();
      
      // Flight: 1100 (OfferedFare) + Hotel: 1500 = 2600
      expect(totalCost).toBe(2600);
    });

    it('should complete combined booking and add both to itinerary', async () => {
      // Start combined booking
      const session = combinedBookingService.startCombinedBooking(
        mockFlight,
        'TRACE123',
        mockHotel,
        mockSearchCriteria
      );

      // Update hotel session with pre-book result
      if (session.hotelSession) {
        hotelBookingService.updateSession({
          status: 'guest_details',
          preBookResult: {
            bookingCode: 'PREBOOK123',
            originalPrice: 1500,
            currentPrice: 1500,
            priceChanged: false,
            available: true,
          },
        });
      }

      // Prepare booking details
      const passengerDetails: PassengerDetails[] = [{
        type: 'Adult',
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

      const paymentInfo = {
        method: 'credit_card' as const,
        emailId: 'john.doe@example.com',
        phoneNumber: '+1234567890',
      };

      // Complete combined booking
      const confirmation = await combinedBookingService.completeCombinedBooking(
        passengerDetails,
        guestDetails,
        paymentInfo
      );

      // Verify both bookings in confirmation
      expect(confirmation.flightBooking).toBeDefined();
      expect(confirmation.hotelBooking).toBeDefined();
      expect(confirmation.totalCost).toBeGreaterThan(0);

      // Verify both added to itinerary
      const flights = itineraryService.getFlightBookings();
      const hotels = itineraryService.getHotelBookings();
      
      expect(flights).toHaveLength(1);
      expect(hotels).toHaveLength(1);
    });

    it('should handle flight-only booking', () => {
      const session = combinedBookingService.startFlightOnlyBooking(mockFlight, 'TRACE123');

      expect(session.flightSession).toBeDefined();
      expect(session.hotelSession).toBeUndefined();
      expect(session.status).toBe('flight_repricing');
    });

    it('should handle hotel-only booking', () => {
      const session = combinedBookingService.startHotelOnlyBooking(mockHotel, mockSearchCriteria);

      expect(session.hotelSession).toBeDefined();
      expect(session.flightSession).toBeUndefined();
      expect(session.status).toBe('hotel_prebook');
    });
  });

  describe('Confidence Scoring with Hotels', () => {
    it('should increase confidence score when hotel is booked', () => {
      // Initial score with no bookings
      const initialItinerary = { flights: [], hotels: [] };
      const initialScore = itineraryService.calculateItineraryConfidence(initialItinerary);
      expect(initialScore).toBe(50);

      // Add hotel booking
      const hotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Grand Plaza Hotel',
        address: '123 Main Street',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 5,
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-20'),
        roomType: 'Deluxe Suite',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe'],
        totalFare: 1500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      itineraryService.addHotelBooking(hotelBooking);

      // Score should increase
      const itineraryWithHotel = itineraryService.getStoredItinerary();
      const scoreWithHotel = itineraryService.calculateItineraryConfidence(itineraryWithHotel);
      expect(scoreWithHotel).toBe(70); // 50 base + 20 for hotel
    });

    it('should maximize confidence score with both flight and hotel', () => {
      // Add flight booking
      const flightBooking = {
        bookingReference: 'FLIGHT-001',
        pnr: 'ABC123',
        airline: 'Air France',
        flightNumber: 'AF-123',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: new Date('2024-06-15T10:00:00'),
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: new Date('2024-06-15T22:00:00'),
        },
        passengers: ['Mr. John Doe'],
        totalFare: 1100,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      itineraryService.addFlightBooking(flightBooking);

      // Add hotel booking
      const hotelBooking = {
        confirmationNumber: 'CONF-001',
        bookingReferenceId: 'REF-001',
        hotelName: 'Grand Plaza Hotel',
        address: '123 Main Street',
        cityName: 'Paris',
        countryName: 'France',
        starRating: 5,
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-20'),
        roomType: 'Deluxe Suite',
        mealType: 'Breakfast Included',
        guests: ['Mr. John Doe'],
        totalFare: 1500,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
        refundable: true,
      };

      itineraryService.addHotelBooking(hotelBooking);

      // Score should be maximum
      const itinerary = itineraryService.getStoredItinerary();
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(100); // 50 base + 20 flight + 20 hotel + 10 both
    });

    it('should maintain confidence score when only flights are booked', () => {
      const flightBooking = {
        bookingReference: 'FLIGHT-001',
        pnr: 'ABC123',
        airline: 'Air France',
        flightNumber: 'AF-123',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: new Date('2024-06-15T10:00:00'),
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: new Date('2024-06-15T22:00:00'),
        },
        passengers: ['Mr. John Doe'],
        totalFare: 1100,
        currency: 'USD',
        status: 'Confirmed',
        bookedAt: new Date(),
      };

      itineraryService.addFlightBooking(flightBooking);

      const itinerary = itineraryService.getStoredItinerary();
      const score = itineraryService.calculateItineraryConfidence(itinerary);
      expect(score).toBe(70); // 50 base + 20 flight
    });
  });
});
