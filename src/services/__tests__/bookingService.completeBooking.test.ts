/**
 * Unit Tests for Booking Service - Complete Booking Functionality
 * 
 * Tests the final booking completion logic including:
 * - Passenger transformation to API format
 * - Booking API integration
 * - Booking confirmation generation
 * - TravelSphere itinerary integration
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bookingService } from '../bookingService';
import type { PassengerDetails, PaymentInfo } from '../bookingService';
import type { FlightResult, BookingResponse } from '../../types/tekTravelsApi';
import * as apiClientModule from '../api/tekTravelsApiClient';

// Mock the API client
vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: vi.fn(),
}));

describe('BookingService - Complete Booking', () => {
  let mockApiClient: any;
  let mockFlight: FlightResult;
  let mockPassengers: PassengerDetails[];
  let mockPayment: PaymentInfo;
  let mockBookingResponse: BookingResponse;

  beforeEach(() => {
    // Clear any existing session
    bookingService.cancelSession();

    // Clear localStorage
    localStorage.clear();

    // Setup mock flight
    mockFlight = {
      ResultIndex: 'FLIGHT123',
      Source: 1,
      IsLCC: false,
      IsRefundable: true,
      AirlineCode: '6E',
      AirlineName: 'IndiGo',
      FlightNumber: '6E-123',
      FareClassification: { Type: 'Economy' },
      Segments: [[{
        Origin: {
          AirportCode: 'DEL',
          AirportName: 'Indira Gandhi International',
          Terminal: 'T3',
          DepTime: '2024-06-15T10:00:00',
          ArrTime: '',
          CityCode: 'DEL',
          CityName: 'Delhi',
          CountryCode: 'IN',
          CountryName: 'India',
        },
        Destination: {
          AirportCode: 'BOM',
          AirportName: 'Chhatrapati Shivaji International',
          Terminal: 'T2',
          DepTime: '',
          ArrTime: '2024-06-15T12:30:00',
          CityCode: 'BOM',
          CityName: 'Mumbai',
          CountryCode: 'IN',
          CountryName: 'India',
        },
        AirlineCode: '6E',
        AirlineName: 'IndiGo',
        FlightNumber: '6E-123',
        FareClass: 'Y',
        OperatingCarrier: '6E',
        Duration: 150,
        GroundTime: 0,
        Mile: 700,
        StopOver: false,
        FlightInfoIndex: 'FI1',
        Baggage: '15 Kg',
        CabinBaggage: '7 Kg',
        AccumulatedDuration: 150,
        Craft: 'A320',
        Remark: null,
        IsETicketEligible: true,
        FlightStatus: 'Confirmed',
        Status: 'Active',
      }]],
      LastTicketDate: '2024-06-14T23:59:59',
      TicketAdvisory: 'Book now',
      FareRules: [],
      Fare: {
        Currency: 'INR',
        BaseFare: 3000,
        Tax: 500,
        YQTax: 200,
        AdditionalTxnFeeOfrd: 0,
        AdditionalTxnFeePub: 0,
        PGCharge: 0,
        OtherCharges: 0,
        ChargeBU: [],
        Discount: 0,
        PublishedFare: 3700,
        OfferedFare: 3700,
        TdsOnCommission: 0,
        TdsOnPLB: 0,
        TdsOnIncentive: 0,
        ServiceFee: 0,
      },
    };

    // Setup mock passengers
    mockPassengers = [
      {
        type: 'Adult',
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        nationality: 'India',
        passportNumber: 'A1234567',
        passportExpiry: new Date('2030-12-31'),
        email: 'john.doe@example.com',
        phone: '+919876543210',
      },
      {
        type: 'Adult',
        title: 'Mrs',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1992-05-20'),
        nationality: 'India',
        passportNumber: 'B7654321',
        passportExpiry: new Date('2030-12-31'),
        email: 'jane.doe@example.com',
        phone: '+919876543211',
      },
    ];

    // Setup mock payment
    mockPayment = {
      method: 'credit_card',
    };

    // Setup mock booking response
    mockBookingResponse = {
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
          Passenger: [
            {
              Ticket: {
                TicketId: 'T1',
                TicketNumber: 'TKT001',
              },
              PaxId: 1,
              Title: 'Mr',
              FirstName: 'John',
              LastName: 'Doe',
              PaxType: 1,
              DateOfBirth: '1990-01-15',
              Gender: 1,
              PassportNo: 'A1234567',
              PassportExpiry: '2030-12-31',
              Nationality: 'India',
              Email: 'john.doe@example.com',
              ContactNo: '+919876543210',
            },
            {
              Ticket: {
                TicketId: 'T2',
                TicketNumber: 'TKT002',
              },
              PaxId: 2,
              Title: 'Mrs',
              FirstName: 'Jane',
              LastName: 'Doe',
              PaxType: 1,
              DateOfBirth: '1992-05-20',
              Gender: 2,
              PassportNo: 'B7654321',
              PassportExpiry: '2030-12-31',
              Nationality: 'India',
              Email: 'jane.doe@example.com',
              ContactNo: '+919876543211',
            },
          ],
          Segments: mockFlight.Segments,
          FareRules: [],
          Fare: {
            Currency: 'INR',
            BaseFare: 6000,
            Tax: 1000,
            PublishedFare: 7000,
            OfferedFare: 7000,
          },
        },
      },
    };

    // Setup mock API client
    mockApiClient = {
      createBooking: vi.fn().mockResolvedValue(mockBookingResponse),
    };

    vi.mocked(apiClientModule.getTekTravelsApiClient).mockReturnValue(mockApiClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('completeBooking', () => {
    it('should throw error if no active session', async () => {
      await expect(
        bookingService.completeBooking(mockPassengers, mockPayment)
      ).rejects.toThrow('No active booking session');
    });

    it('should throw error if session has expired', async () => {
      // Start a session with past expiry
      const session = bookingService.startBooking(mockFlight, 'TRACE123');
      session.expiresAt = new Date(Date.now() - 1000); // Expired 1 second ago

      await expect(
        bookingService.completeBooking(mockPassengers, mockPayment)
      ).rejects.toThrow('Booking session has expired');
    });

    it('should call booking API with correct parameters', async () => {
      // Start a booking session
      bookingService.startBooking(mockFlight, 'TRACE123');

      // Complete booking
      await bookingService.completeBooking(mockPassengers, mockPayment);

      // Verify API was called
      expect(mockApiClient.createBooking).toHaveBeenCalledTimes(1);

      // Verify request structure
      const request = mockApiClient.createBooking.mock.calls[0][0];
      expect(request).toMatchObject({
        TraceId: 'TRACE123',
        ResultIndex: 'FLIGHT123',
        EndUserIp: expect.any(String),
      });
      expect(request.Passengers).toHaveLength(2);
    });

    it('should transform passenger details to API format correctly', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking(mockPassengers, mockPayment);

      const request = mockApiClient.createBooking.mock.calls[0][0];
      const apiPassengers = request.Passengers;

      // Check first passenger (Adult Male)
      expect(apiPassengers[0]).toMatchObject({
        Title: 'Mr',
        FirstName: 'John',
        LastName: 'Doe',
        PaxType: 1, // Adult
        DateOfBirth: '1990-01-15',
        Gender: 1, // Male
        PassportNo: 'A1234567',
        PassportExpiry: '2030-12-31',
        Nationality: 'India',
        ContactNo: '+919876543210',
        Email: 'john.doe@example.com',
        IsLeadPax: true, // First passenger is lead
      });

      // Check second passenger (Adult Female)
      expect(apiPassengers[1]).toMatchObject({
        Title: 'Mrs',
        FirstName: 'Jane',
        LastName: 'Doe',
        PaxType: 1, // Adult
        Gender: 2, // Female
        IsLeadPax: false,
      });
    });

    it('should handle child and infant passenger types', async () => {
      const mixedPassengers: PassengerDetails[] = [
        { ...mockPassengers[0], type: 'Adult' },
        { ...mockPassengers[1], type: 'Child', dateOfBirth: new Date('2015-03-10') },
        { ...mockPassengers[0], type: 'Infant', firstName: 'Baby', dateOfBirth: new Date('2023-01-01') },
      ];

      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking(mixedPassengers, mockPayment);

      const request = mockApiClient.createBooking.mock.calls[0][0];
      expect(request.Passengers[0].PaxType).toBe(1); // Adult
      expect(request.Passengers[1].PaxType).toBe(2); // Child
      expect(request.Passengers[2].PaxType).toBe(3); // Infant
    });

    it('should generate booking confirmation with all required fields', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');
      const confirmation = await bookingService.completeBooking(mockPassengers, mockPayment);

      // Verify confirmation structure (Requirement 6.2, 6.6)
      expect(confirmation).toMatchObject({
        bookingReference: '987654',
        pnr: 'ABC123',
        ticketNumbers: ['TKT001', 'TKT002'],
        totalPrice: 7000,
        currency: 'INR',
        bookedAt: expect.any(Date),
      });

      expect(confirmation.flight).toBe(mockFlight);
      expect(confirmation.passengers).toEqual(mockPassengers);
    });

    it('should include ancillary services in confirmation if selected', async () => {
      const ancillaryServices = [
        { passengerIndex: 0, type: 'baggage' as const, code: 'BAG15' },
        { passengerIndex: 0, type: 'meal' as const, code: 'MEAL01' },
      ];

      bookingService.startBooking(mockFlight, 'TRACE123');
      bookingService.updateSession({ ancillaryServices });

      const confirmation = await bookingService.completeBooking(mockPassengers, mockPayment);

      expect(confirmation.ancillaryServices).toEqual(ancillaryServices);
    });

    it('should use repriced flight if available', async () => {
      const repricedFlight = { ...mockFlight, ResultIndex: 'REPRICED456' };

      bookingService.startBooking(mockFlight, 'TRACE123');
      bookingService.updateSession({ repricedFlight });

      await bookingService.completeBooking(mockPassengers, mockPayment);

      const request = mockApiClient.createBooking.mock.calls[0][0];
      expect(request.ResultIndex).toBe('REPRICED456');
    });

    it('should integrate booking with TravelSphere itinerary', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');
      const confirmation = await bookingService.completeBooking(mockPassengers, mockPayment);

      // Verify itinerary was updated (Requirement 6.5)
      const itinerary = JSON.parse(localStorage.getItem('travelsphere_itinerary') || '{}');
      expect(itinerary.flights).toHaveLength(1);
      expect(itinerary.flights[0]).toMatchObject({
        bookingReference: confirmation.bookingReference,
        pnr: confirmation.pnr,
      });
    });

    it('should append to existing itinerary', async () => {
      // Setup existing itinerary
      const existingItinerary = {
        flights: [
          { bookingReference: 'OLD123', pnr: 'OLD456' },
        ],
      };
      localStorage.setItem('travelsphere_itinerary', JSON.stringify(existingItinerary));

      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking(mockPassengers, mockPayment);

      const itinerary = JSON.parse(localStorage.getItem('travelsphere_itinerary') || '{}');
      expect(itinerary.flights).toHaveLength(2);
      expect(itinerary.flights[0].bookingReference).toBe('OLD123');
    });

    it('should clean up session after successful booking', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking(mockPassengers, mockPayment);

      // Session should be cleared
      expect(bookingService.getCurrentSession()).toBeNull();
      expect(localStorage.getItem('booking_session')).toBeNull();
    });

    it('should preserve session on booking failure', async () => {
      mockApiClient.createBooking.mockRejectedValue(new Error('API Error'));

      bookingService.startBooking(mockFlight, 'TRACE123');

      await expect(
        bookingService.completeBooking(mockPassengers, mockPayment)
      ).rejects.toThrow('API Error');

      // Session should still exist for retry (Requirement 6.4)
      expect(bookingService.getCurrentSession()).not.toBeNull();
    });

    it('should handle missing optional passenger fields', async () => {
      const minimalPassenger: PassengerDetails = {
        type: 'Adult',
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        nationality: 'India',
        // No passport, email, or phone
      };

      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking([minimalPassenger], mockPayment);

      const request = mockApiClient.createBooking.mock.calls[0][0];
      expect(request.Passengers[0]).toMatchObject({
        PassportNo: '',
        PassportExpiry: '',
        Email: '',
        ContactNo: '',
      });
    });

    it('should update session status to payment before API call', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');

      // Mock API to check session status during call
      mockApiClient.createBooking.mockImplementation(() => {
        const session = bookingService.getCurrentSession();
        expect(session?.status).toBe('payment');
        return Promise.resolve(mockBookingResponse);
      });

      await bookingService.completeBooking(mockPassengers, mockPayment);
    });

    it('should handle itinerary integration failure gracefully', async () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      bookingService.startBooking(mockFlight, 'TRACE123');

      // Should not throw even if itinerary integration fails
      await expect(
        bookingService.completeBooking(mockPassengers, mockPayment)
      ).resolves.toBeDefined();

      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Edge Cases', () => {
    it('should handle single passenger booking', async () => {
      bookingService.startBooking(mockFlight, 'TRACE123');
      const confirmation = await bookingService.completeBooking([mockPassengers[0]], mockPayment);

      expect(confirmation.passengers).toHaveLength(1);
      expect(confirmation.ticketNumbers).toHaveLength(2); // From mock response
    });

    it('should handle multiple passengers (family booking)', async () => {
      const familyPassengers: PassengerDetails[] = [
        { ...mockPassengers[0], type: 'Adult' },
        { ...mockPassengers[1], type: 'Adult' },
        { ...mockPassengers[0], type: 'Child', firstName: 'Child1', dateOfBirth: new Date('2015-01-01') },
        { ...mockPassengers[0], type: 'Infant', firstName: 'Baby', dateOfBirth: new Date('2023-01-01') },
      ];

      bookingService.startBooking(mockFlight, 'TRACE123');
      const confirmation = await bookingService.completeBooking(familyPassengers, mockPayment);

      expect(confirmation.passengers).toHaveLength(4);
    });

    it('should format dates correctly for API', async () => {
      const passengerWithSpecificDate: PassengerDetails = {
        ...mockPassengers[0],
        dateOfBirth: new Date('1985-12-25T10:30:00Z'),
        passportExpiry: new Date('2028-06-15T14:45:00Z'),
      };

      bookingService.startBooking(mockFlight, 'TRACE123');
      await bookingService.completeBooking([passengerWithSpecificDate], mockPayment);

      const request = mockApiClient.createBooking.mock.calls[0][0];
      expect(request.Passengers[0].DateOfBirth).toBe('1985-12-25');
      expect(request.Passengers[0].PassportExpiry).toBe('2028-06-15');
    });
  });
});
