/**
 * Unit Tests for Hotel Booking Service
 * 
 * Tests session management, lifecycle, and state updates for hotel bookings
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { hotelBookingService } from '../hotelBookingService';
import type { Hotel, HotelBookingResponse } from '../../types/tboHotelApi';
import type { HotelSearchCriteria } from '../hotelBookingService';

// Mock the API client module
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: vi.fn(),
}));

// Mock hotel result for testing
const mockHotel: Hotel = {
  BookingCode: 'test-booking-code-123',
  HotelCode: 'HTL001',
  HotelName: 'Grand Plaza Hotel',
  StarRating: 5,
  HotelAddress: '123 Main Street, Downtown',
  HotelContactNo: '+1-555-0100',
  CityName: 'Mumbai',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'INR',
    RoomPrice: 5000,
    Tax: 900,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 100,
    Discount: 0,
    PublishedPrice: 6000,
    OfferedPrice: 6000,
    AgentCommission: 300,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'Breakfast',
  RoomType: 'Deluxe Room',
  AvailableRooms: 5,
  Amenities: ['WiFi', 'Pool', 'Gym', 'Spa'],
  HotelPicture: 'https://example.com/hotel.jpg',
  HotelImages: ['https://example.com/hotel1.jpg', 'https://example.com/hotel2.jpg'],
};

const mockSearchCriteria: HotelSearchCriteria = {
  checkIn: new Date('2024-02-15'),
  checkOut: new Date('2024-02-18'),
  cityCode: 'MUM',
  guestNationality: 'IN',
  paxRooms: [
    {
      adults: 2,
      children: 0,
      childrenAges: [],
    },
  ],
};

describe('HotelBookingService', () => {
  beforeEach(() => {
    // Clear any existing session before each test
    hotelBookingService.cancelSession();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    hotelBookingService.cancelSession();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('startBooking', () => {
    it('should create a new hotel booking session', () => {
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      expect(session).toBeDefined();
      expect(session.hotel).toBe(mockHotel);
      expect(session.searchCriteria).toBe(mockSearchCriteria);
      expect(session.bookingCode).toBe(mockHotel.BookingCode);
      expect(session.status).toBe('details');
      expect(session.sessionId).toMatch(/^hotel_session_/);
    });

    it('should set session expiration to 30 minutes', () => {
      const beforeStart = Date.now();
      
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      const expectedExpiry = beforeStart + 30 * 60 * 1000;
      const actualExpiry = session.expiresAt.getTime();
      
      // Allow 1 second tolerance for test execution time
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should cancel existing session when starting a new one', () => {
      const session1 = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      expect(hotelBookingService.getCurrentSession()?.sessionId).toBe(session1.sessionId);

      const mockHotel2 = { ...mockHotel, BookingCode: 'different-booking-code' };
      const session2 = hotelBookingService.startBooking(mockHotel2, mockSearchCriteria);
      
      expect(hotelBookingService.getCurrentSession()?.sessionId).toBe(session2.sessionId);
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should persist session to localStorage', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      const stored = localStorage.getItem('hotel_booking_session');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.bookingCode).toBe(mockHotel.BookingCode);
      expect(parsed.hotel.HotelName).toBe(mockHotel.HotelName);
    });

    it('should extract BookingCode from hotel', () => {
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      expect(session.bookingCode).toBe('test-booking-code-123');
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current session', () => {
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      const current = hotelBookingService.getCurrentSession();
      expect(current).toBe(session);
    });

    it('should return null when no session exists', () => {
      const current = hotelBookingService.getCurrentSession();
      expect(current).toBeNull();
    });

    it('should return null and cancel session when expired', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Fast-forward time by 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      const current = hotelBookingService.getCurrentSession();
      expect(current).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update session with new data', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      hotelBookingService.updateSession({ status: 'prebook' });

      const session = hotelBookingService.getCurrentSession();
      expect(session?.status).toBe('prebook');
    });

    it('should update session with prebook result', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      const preBookResult = {
        bookingCode: 'new-booking-code',
        originalPrice: 6000,
        currentPrice: 6500,
        priceChanged: true,
        available: true,
      };

      hotelBookingService.updateSession({ 
        preBookResult,
        bookingCode: preBookResult.bookingCode,
        status: 'guest_details',
      });

      const session = hotelBookingService.getCurrentSession();
      expect(session?.preBookResult).toEqual(preBookResult);
      expect(session?.bookingCode).toBe('new-booking-code');
      expect(session?.status).toBe('guest_details');
    });

    it('should throw error when no active session', () => {
      expect(() => {
        hotelBookingService.updateSession({ status: 'prebook' });
      }).toThrow('No active hotel booking session');
    });

    it('should throw error when session has expired', () => {
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      expect(() => {
        hotelBookingService.updateSession({ status: 'prebook' });
      }).toThrow('Hotel booking session has expired');
    });

    it('should persist updated session to localStorage', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      hotelBookingService.updateSession({ status: 'guest_details' });

      const stored = localStorage.getItem('hotel_booking_session');
      const parsed = JSON.parse(stored!);
      expect(parsed.status).toBe('guest_details');
    });
  });

  describe('cancelSession', () => {
    it('should clear the current session', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      hotelBookingService.cancelSession();

      const session = hotelBookingService.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should clear persisted session from localStorage', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      hotelBookingService.cancelSession();

      const stored = localStorage.getItem('hotel_booking_session');
      expect(stored).toBeNull();
    });

    it('should not throw error when no session exists', () => {
      expect(() => {
        hotelBookingService.cancelSession();
      }).not.toThrow();
    });

    it('should clear timeout when canceling session', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      hotelBookingService.cancelSession();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('restoreSession', () => {
    it('should restore a valid session from localStorage', () => {
      const originalSession = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Simulate page refresh by clearing in-memory session
      (hotelBookingService as any).currentSession = null;

      const restored = hotelBookingService.restoreSession();

      expect(restored).toBeDefined();
      expect(restored?.sessionId).toBe(originalSession.sessionId);
      expect(restored?.bookingCode).toBe(mockHotel.BookingCode);
      expect(restored?.hotel.HotelName).toBe(mockHotel.HotelName);
    });

    it('should restore date objects correctly', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Simulate page refresh
      (hotelBookingService as any).currentSession = null;

      const restored = hotelBookingService.restoreSession();

      expect(restored?.createdAt).toBeInstanceOf(Date);
      expect(restored?.expiresAt).toBeInstanceOf(Date);
      expect(restored?.searchCriteria.checkIn).toBeInstanceOf(Date);
      expect(restored?.searchCriteria.checkOut).toBeInstanceOf(Date);
    });

    it('should return null when no session in localStorage', () => {
      const restored = hotelBookingService.restoreSession();
      expect(restored).toBeNull();
    });

    it('should return null and clear expired session', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Fast-forward time by 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      // Simulate page refresh
      (hotelBookingService as any).currentSession = null;

      const restored = hotelBookingService.restoreSession();
      expect(restored).toBeNull();

      const stored = localStorage.getItem('hotel_booking_session');
      expect(stored).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('hotel_booking_session', 'invalid-json');

      const restored = hotelBookingService.restoreSession();
      expect(restored).toBeNull();

      const stored = localStorage.getItem('hotel_booking_session');
      expect(stored).toBeNull();
    });

    it('should reschedule timeout after restoring session', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Simulate page refresh
      (hotelBookingService as any).currentSession = null;
      (hotelBookingService as any).timeoutId = null;

      const restored = hotelBookingService.restoreSession();
      expect(restored).toBeDefined();

      // Verify timeout is scheduled by advancing time
      vi.advanceTimersByTime(30 * 60 * 1000);
      expect(hotelBookingService.getCurrentSession()).toBeNull();
    });
  });

  describe('session timeout', () => {
    it('should automatically cancel session after 30 minutes', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      expect(hotelBookingService.getCurrentSession()).toBeDefined();

      // Fast-forward time by 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      expect(hotelBookingService.getCurrentSession()).toBeNull();
    });

    it('should clear localStorage when session times out', () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      // Fast-forward time by 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      const stored = localStorage.getItem('hotel_booking_session');
      expect(stored).toBeNull();
    });
  });

  describe('workflow progression', () => {
    it('should support complete booking workflow', () => {
      // Start booking
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      expect(session.status).toBe('details');

      // Move to prebook
      hotelBookingService.updateSession({ status: 'prebook' });
      expect(hotelBookingService.getCurrentSession()?.status).toBe('prebook');

      // Add prebook result and move to guest details
      const preBookResult = {
        bookingCode: 'updated-code',
        originalPrice: 6000,
        currentPrice: 6000,
        priceChanged: false,
        available: true,
      };
      hotelBookingService.updateSession({ 
        preBookResult,
        bookingCode: preBookResult.bookingCode,
        status: 'guest_details',
      });
      expect(hotelBookingService.getCurrentSession()?.status).toBe('guest_details');
      expect(hotelBookingService.getCurrentSession()?.bookingCode).toBe('updated-code');

      // Move to payment
      hotelBookingService.updateSession({ status: 'payment' });
      expect(hotelBookingService.getCurrentSession()?.status).toBe('payment');

      // Move to confirmed
      hotelBookingService.updateSession({ status: 'confirmed' });
      expect(hotelBookingService.getCurrentSession()?.status).toBe('confirmed');
    });
  });

  describe('multi-room support', () => {
    it('should handle multiple rooms in search criteria', () => {
      const multiRoomCriteria: HotelSearchCriteria = {
        ...mockSearchCriteria,
        paxRooms: [
          { adults: 2, children: 1, childrenAges: [8] },
          { adults: 2, children: 0, childrenAges: [] },
        ],
      };

      const session = hotelBookingService.startBooking(mockHotel, multiRoomCriteria);

      expect(session.searchCriteria.paxRooms).toHaveLength(2);
      expect(session.searchCriteria.paxRooms[0].children).toBe(1);
      expect(session.searchCriteria.paxRooms[0].childrenAges).toEqual([8]);
    });
  });

  describe('session persistence', () => {
    it('should maintain session across multiple updates', () => {
      const session = hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      const originalSessionId = session.sessionId;

      hotelBookingService.updateSession({ status: 'prebook' });
      hotelBookingService.updateSession({ status: 'guest_details' });
      hotelBookingService.updateSession({ status: 'payment' });

      const currentSession = hotelBookingService.getCurrentSession();
      expect(currentSession?.sessionId).toBe(originalSessionId);
      expect(currentSession?.status).toBe('payment');
    });
  });

  describe('completeBooking', () => {
    const mockGuestDetails = [
      {
        roomIndex: 0,
        customerNames: [
          {
            title: 'Mr',
            firstName: 'John',
            lastName: 'Doe',
            type: 'Adult' as const,
          },
          {
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Doe',
            type: 'Adult' as const,
          },
        ],
      },
    ];

    const mockPaymentInfo = {
      method: 'credit_card' as const,
      emailId: 'john.doe@example.com',
      phoneNumber: '+1-555-0123',
    };

    const mockPreBookResult = {
      bookingCode: 'prebook-code-456',
      originalPrice: 6000,
      currentPrice: 6000,
      priceChanged: false,
      available: true,
    };

    const mockBookingResponse: HotelBookingResponse = {
      ConfirmationNo: 'CONF123456',
      BookingRefNo: 'REF789012',
      BookingId: 12345,
      Status: 1,
      HotelDetails: {
        HotelName: 'Grand Plaza Hotel',
        CheckInDate: '2024-02-15',
        CheckOutDate: '2024-02-18',
        TotalFare: 6000,
        CurrencyCode: 'INR',
      },
      VoucherUrl: 'https://example.com/voucher/123456',
    };

    it('should throw error when no active session', async () => {
      await expect(
        hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo)
      ).rejects.toThrow('No active hotel booking session');
    });

    it('should throw error when pre-booking not completed', async () => {
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);

      await expect(
        hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo)
      ).rejects.toThrow('Pre-booking validation required before completing booking');
    });

    it('should successfully complete booking with valid session and prebook', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      // Start booking and add prebook result
      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      const confirmation = await hotelBookingService.completeBooking(
        mockGuestDetails,
        mockPaymentInfo
      );

      expect(confirmation).toBeDefined();
      expect(confirmation.confirmationNumber).toBe('CONF123456');
      expect(confirmation.bookingReferenceId).toBe('REF789012');
      expect(confirmation.hotel).toBe(mockHotel);
      expect(confirmation.guestDetails).toEqual(mockGuestDetails);
      expect(confirmation.totalFare).toBe(6000);
      expect(confirmation.currency).toBe('INR');
      expect(confirmation.status).toBe('Confirmed');
      expect(confirmation.voucherUrl).toBe('https://example.com/voucher/123456');
    });

    it('should transform guest details to API format correctly', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      await hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo);

      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          BookingCode: 'prebook-code-456',
          CustomerDetails: [
            {
              CustomerNames: [
                {
                  Title: 'Mr',
                  FirstName: 'John',
                  LastName: 'Doe',
                  Type: 'Adult',
                },
                {
                  Title: 'Mrs',
                  FirstName: 'Jane',
                  LastName: 'Doe',
                  Type: 'Adult',
                },
              ],
            },
          ],
          TotalFare: 6000,
          EmailId: 'john.doe@example.com',
          PhoneNumber: '+1-555-0123',
          BookingType: 'API',
          PaymentMode: 'Limit',
        })
      );
    });

    it('should update session status to confirmed after successful booking', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      await hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo);

      const session = hotelBookingService.getCurrentSession();
      expect(session?.status).toBe('confirmed');
    });

    it('should integrate booking with itinerary system', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      await hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo);

      const storedBookings = localStorage.getItem('hotel_bookings');
      expect(storedBookings).toBeDefined();
      
      const bookings = JSON.parse(storedBookings!);
      expect(bookings).toHaveLength(1);
      expect(bookings[0].confirmationNumber).toBe('CONF123456');
    });

    it('should preserve session on booking failure', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockRejectedValue(new Error('Booking failed'));
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      await expect(
        hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo)
      ).rejects.toThrow('Booking failed');

      // Session should still exist for retry
      const session = hotelBookingService.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.preBookResult).toEqual(mockPreBookResult);
    });

    it('should handle multiple rooms with different guests', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      const multiRoomGuestDetails = [
        {
          roomIndex: 0,
          customerNames: [
            { title: 'Mr', firstName: 'John', lastName: 'Doe', type: 'Adult' as const },
            { title: 'Mrs', firstName: 'Jane', lastName: 'Doe', type: 'Adult' as const },
            { title: 'Master', firstName: 'Jimmy', lastName: 'Doe', type: 'Child' as const },
          ],
        },
        {
          roomIndex: 1,
          customerNames: [
            { title: 'Mr', firstName: 'Bob', lastName: 'Smith', type: 'Adult' as const },
            { title: 'Mrs', firstName: 'Alice', lastName: 'Smith', type: 'Adult' as const },
          ],
        },
      ];

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      const confirmation = await hotelBookingService.completeBooking(
        multiRoomGuestDetails,
        mockPaymentInfo
      );

      expect(confirmation.guestDetails).toHaveLength(2);
      expect(confirmation.guestDetails[0].customerNames).toHaveLength(3);
      expect(confirmation.guestDetails[1].customerNames).toHaveLength(2);
    });

    it('should map payment methods to API format correctly', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      hotelBookingService.updateSession({
        preBookResult: mockPreBookResult,
        status: 'guest_details',
      });

      const paymentMethods = ['credit_card', 'debit_card', 'upi', 'net_banking'] as const;

      for (const method of paymentMethods) {
        mockCreateBooking.mockClear();
        
        await hotelBookingService.completeBooking(mockGuestDetails, {
          ...mockPaymentInfo,
          method,
        });

        expect(mockCreateBooking).toHaveBeenCalledWith(
          expect.objectContaining({
            PaymentMode: 'Limit',
          })
        );
      }
    });

    it('should use BookingCode from prebook result', async () => {
      const { getTboHotelApiClient } = await import('../api/tboHotelApiClient');
      const mockCreateBooking = vi.fn().mockResolvedValue(mockBookingResponse);
      
      vi.mocked(getTboHotelApiClient).mockReturnValue({
        createBooking: mockCreateBooking,
      } as any);

      hotelBookingService.startBooking(mockHotel, mockSearchCriteria);
      
      // Update with prebook result that has different booking code
      hotelBookingService.updateSession({
        preBookResult: {
          ...mockPreBookResult,
          bookingCode: 'updated-prebook-code',
        },
        status: 'guest_details',
      });

      await hotelBookingService.completeBooking(mockGuestDetails, mockPaymentInfo);

      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          BookingCode: 'updated-prebook-code',
        })
      );
    });
  });
});
