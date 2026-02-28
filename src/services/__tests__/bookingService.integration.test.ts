/**
 * Integration Tests for Complete Booking Flow
 * 
 * Tests the end-to-end booking workflow from session start to confirmation.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingService } from '../bookingService';
import type { PassengerDetails, PaymentInfo } from '../bookingService';
import type { FlightResult, BookingResponse } from '../../types/tekTravelsApi';
import * as apiClientModule from '../api/tekTravelsApiClient';

vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: vi.fn(),
}));

describe('Booking Service - Integration Tests', () => {
  let mockApiClient: any;
  let mockFlight: FlightResult;

  beforeEach(() => {
    bookingService.cancelSession();
    localStorage.clear();

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

    const mockBookingResponse: BookingResponse = {
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
            PassportNo: 'A1234567',
            PassportExpiry: '2030-12-31',
            Nationality: 'India',
            Email: 'john.doe@example.com',
            ContactNo: '+919876543210',
          }],
          Segments: mockFlight.Segments,
          FareRules: [],
          Fare: {
            Currency: 'INR',
            BaseFare: 3000,
            Tax: 500,
            PublishedFare: 3700,
            OfferedFare: 3700,
          },
        },
      },
    };

    mockApiClient = {
      createBooking: vi.fn().mockResolvedValue(mockBookingResponse),
    };

    vi.mocked(apiClientModule.getTekTravelsApiClient).mockReturnValue(mockApiClient);
  });

  it('should complete full booking workflow successfully', async () => {
    // Step 1: Start booking session
    const session = bookingService.startBooking(mockFlight, 'TRACE123');
    expect(session.status).toBe('repricing');
    expect(session.traceId).toBe('TRACE123');

    // Step 2: Update with repricing (simulated)
    bookingService.updateSession({ 
      status: 'seats',
      repricedFlight: mockFlight,
    });

    // Step 3: Update with seat selection (simulated)
    bookingService.updateSession({
      status: 'ancillary',
      selectedSeats: [
        { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' },
      ],
    });

    // Step 4: Update with ancillary services (simulated)
    bookingService.updateSession({
      status: 'passenger',
      ancillaryServices: [
        { passengerIndex: 0, type: 'baggage', code: 'BAG15' },
      ],
    });

    // Step 5: Complete booking with passenger details
    const passengers: PassengerDetails[] = [{
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
    }];

    const payment: PaymentInfo = { method: 'credit_card' };

    const confirmation = await bookingService.completeBooking(passengers, payment);

    // Verify confirmation
    expect(confirmation).toMatchObject({
      bookingReference: '987654',
      pnr: 'ABC123',
      ticketNumbers: ['TKT001'],
      totalPrice: 3700,
      currency: 'INR',
    });

    // Verify ancillary services included
    expect(confirmation.ancillaryServices).toEqual([
      { passengerIndex: 0, type: 'baggage', code: 'BAG15' },
    ]);

    // Verify itinerary integration
    const itinerary = JSON.parse(localStorage.getItem('travelsphere_itinerary') || '{}');
    expect(itinerary.flights).toHaveLength(1);
    expect(itinerary.flights[0].pnr).toBe('ABC123');

    // Verify session cleaned up
    expect(bookingService.getCurrentSession()).toBeNull();
  });

  it('should handle booking retry after failure', async () => {
    // Start booking
    bookingService.startBooking(mockFlight, 'TRACE123');

    const passengers: PassengerDetails[] = [{
      type: 'Adult',
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-15'),
      nationality: 'India',
      email: 'john.doe@example.com',
    }];

    const payment: PaymentInfo = { method: 'credit_card' };

    // First attempt fails
    mockApiClient.createBooking.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      bookingService.completeBooking(passengers, payment)
    ).rejects.toThrow('Network error');

    // Session should be preserved
    const session = bookingService.getCurrentSession();
    expect(session).not.toBeNull();
    expect(session?.traceId).toBe('TRACE123');

    // Second attempt succeeds
    const confirmation = await bookingService.completeBooking(passengers, payment);
    expect(confirmation.pnr).toBe('ABC123');
  });
});
