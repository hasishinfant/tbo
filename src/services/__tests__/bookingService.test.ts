// @ts-nocheck - Test file with mock data
/**
 * Unit Tests for Booking Service
 * 
 * Tests session management, lifecycle, and state updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bookingService } from '../bookingService';
import type { FlightResult } from '../../types/tekTravelsApi';

// Mock flight result for testing
const mockFlight: FlightResult = {
  ResultIndex: 'test-result-1',
  Source: 1,
  IsLCC: false,
  IsRefundable: true,
  AirlineCode: 'AI',
  AirlineName: 'Air India',
  FlightNumber: 'AI101',
  FareClassification: { Type: 'Economy' },
  Segments: [[{
    Origin: {
      AirportCode: 'DEL',
      AirportName: 'Indira Gandhi International',
      Terminal: 'T3',
      DepTime: '2024-01-15T10:00:00',
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
      ArrTime: '2024-01-15T12:30:00',
      CityCode: 'BOM',
      CityName: 'Mumbai',
      CountryCode: 'IN',
      CountryName: 'India',
    },
    AirlineCode: 'AI',
    AirlineName: 'Air India',
    FlightNumber: 'AI101',
    FareClass: 'Y',
    OperatingCarrier: 'AI',
    Duration: 150,
    GroundTime: 0,
    Mile: 700,
    StopOver: false,
    FlightInfoIndex: '1',
    Baggage: '15 Kg',
    CabinBaggage: '7 Kg',
    AccumulatedDuration: 150,
    Craft: 'Boeing 737',
    Remark: null,
    IsETicketEligible: true,
    FlightStatus: 'Confirmed',
    Status: 'Available',
  }]],
  LastTicketDate: '2024-01-14T23:59:59',
  TicketAdvisory: '',
  FareRules: [],
  Fare: {
    Currency: 'INR',
    BaseFare: 5000,
    Tax: 1000,
    YQTax: 500,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 6500,
    OfferedFare: 6500,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  },
};

describe('BookingService', () => {
  beforeEach(() => {
    // Clear any existing session before each test
    bookingService.cancelSession();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    bookingService.cancelSession();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('startBooking', () => {
    it('should create a new booking session', () => {
      const traceId = 'test-trace-123';
      const session = bookingService.startBooking(mockFlight, traceId);

      expect(session).toBeDefined();
      expect(session.traceId).toBe(traceId);
      expect(session.flight).toBe(mockFlight);
      expect(session.status).toBe('repricing');
      expect(session.sessionId).toMatch(/^session_/);
    });

    it('should set session expiration to 30 minutes', () => {
      const traceId = 'test-trace-123';
      const beforeStart = Date.now();
      
      const session = bookingService.startBooking(mockFlight, traceId);
      
      const expectedExpiry = beforeStart + 30 * 60 * 1000;
      const actualExpiry = session.expiresAt.getTime();
      
      // Allow 1 second tolerance for test execution time
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should cancel existing session when starting a new one', () => {
      const traceId1 = 'test-trace-1';
      const traceId2 = 'test-trace-2';

      const session1 = bookingService.startBooking(mockFlight, traceId1);
      expect(bookingService.getCurrentSession()?.traceId).toBe(traceId1);

      const session2 = bookingService.startBooking(mockFlight, traceId2);
      expect(bookingService.getCurrentSession()?.traceId).toBe(traceId2);
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should persist session to localStorage', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      const stored = localStorage.getItem('booking_session');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.traceId).toBe(traceId);
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current session', () => {
      const traceId = 'test-trace-123';
      const session = bookingService.startBooking(mockFlight, traceId);

      const current = bookingService.getCurrentSession();
      expect(current).toBe(session);
    });

    it('should return null when no session exists', () => {
      const current = bookingService.getCurrentSession();
      expect(current).toBeNull();
    });

    it('should return null and cancel session when expired', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      // Fast-forward time by 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      const current = bookingService.getCurrentSession();
      expect(current).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update session with new data', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      bookingService.updateSession({ status: 'seats' });

      const session = bookingService.getCurrentSession();
      expect(session?.status).toBe('seats');
    });

    it('should update session with seat selections', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      const seatSelections = [
        { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' },
      ];

      bookingService.updateSession({ 
        selectedSeats: seatSelections,
        status: 'ancillary',
      });

      const session = bookingService.getCurrentSession();
      expect(session?.selectedSeats).toEqual(seatSelections);
      expect(session?.status).toBe('ancillary');
    });

    it('should throw error when no active session', () => {
      expect(() => {
        bookingService.updateSession({ status: 'seats' });
      }).toThrow('No active booking session');
    });

    it('should throw error when session has expired', () => {
      const traceId = 'test-trace-123';
      const session = bookingService.startBooking(mockFlight, traceId);
      
      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      expect(() => {
        bookingService.updateSession({ status: 'seats' });
      }).toThrow('Booking session has expired');
    });

    it('should persist updated session to localStorage', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      bookingService.updateSession({ status: 'seats' });

      const stored = localStorage.getItem('booking_session');
      const parsed = JSON.parse(stored!);
      expect(parsed.status).toBe('seats');
    });
  });

  describe('cancelSession', () => {
    it('should clear the current session', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      bookingService.cancelSession();

      const session = bookingService.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should clear persisted session from localStorage', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      bookingService.cancelSession();

      const stored = localStorage.getItem('booking_session');
      expect(stored).toBeNull();
    });

    it('should not throw error when no session exists', () => {
      expect(() => {
        bookingService.cancelSession();
      }).not.toThrow();
    });
  });

  describe('restoreSession', () => {
    it('should restore a valid session from localStorage', () => {
      const traceId = 'test-trace-123';
      const originalSession = bookingService.startBooking(mockFlight, traceId);

      // Simulate page refresh by clearing in-memory session
      (bookingService as any).currentSession = null;

      const restored = bookingService.restoreSession();

      expect(restored).toBeDefined();
      expect(restored?.traceId).toBe(traceId);
      expect(restored?.sessionId).toBe(originalSession.sessionId);
    });

    it('should return null when no session in localStorage', () => {
      const restored = bookingService.restoreSession();
      expect(restored).toBeNull();
    });

    it('should return null and clear expired session', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      // Fast-forward time by 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      // Simulate page refresh
      (bookingService as any).currentSession = null;

      const restored = bookingService.restoreSession();
      expect(restored).toBeNull();

      const stored = localStorage.getItem('booking_session');
      expect(stored).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('booking_session', 'invalid-json');

      const restored = bookingService.restoreSession();
      expect(restored).toBeNull();

      const stored = localStorage.getItem('booking_session');
      expect(stored).toBeNull();
    });
  });

  describe('session timeout', () => {
    it('should automatically cancel session after 30 minutes', () => {
      const traceId = 'test-trace-123';
      bookingService.startBooking(mockFlight, traceId);

      expect(bookingService.getCurrentSession()).toBeDefined();

      // Fast-forward time by 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      expect(bookingService.getCurrentSession()).toBeNull();
    });
  });

  describe('completeBooking', () => {
    it('should throw error when no active session', async () => {
      const passengerDetails = [{
        type: 'Adult' as const,
        title: 'Mr' as const,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        nationality: 'IN',
      }];

      const payment = {
        method: 'credit_card' as const,
      };

      await expect(
        bookingService.completeBooking(passengerDetails, payment)
      ).rejects.toThrow('No active booking session');
    });
  });
});
