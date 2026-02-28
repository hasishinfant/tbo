/**
 * Unit Tests for Booking Management Service
 * 
 * Tests booking details retrieval, date range queries, cancellation flow,
 * and error handling for hotel booking management operations.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingManagementService } from '../bookingManagementService';
import type {
  BookingDetailResponse,
  BookingListResponse,
  CancelResponse,
} from '../../types/tboHotelApi';

// Mock the API client
const mockGetBookingDetails = vi.fn();
const mockGetBookingsByDateRange = vi.fn();
const mockCancelBooking = vi.fn();

vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: vi.fn(() => ({
    getBookingDetails: mockGetBookingDetails,
    getBookingsByDateRange: mockGetBookingsByDateRange,
    cancelBooking: mockCancelBooking,
  })),
}));

describe('BookingManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // getBookingDetails Tests
  // ============================================================================

  describe('getBookingDetails', () => {
    const mockBookingDetailResponse: BookingDetailResponse = {
      BookingDetails: {
        ConfirmationNo: 'CONF123456',
        BookingRefNo: 'REF789012',
        BookingId: 12345,
        BookingStatus: 'Confirmed',
        HotelName: 'Grand Plaza Hotel',
        CheckInDate: '2024-02-15',
        CheckOutDate: '2024-02-18',
        TotalFare: 6000,
        CurrencyCode: 'INR',
        GuestDetails: [
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
        BookedOn: '2024-01-15T10:30:00Z',
        VoucherUrl: 'https://example.com/voucher/123456',
      },
      Status: 1,
      Message: 'Success',
    };

    it('should retrieve booking details using confirmation number', async () => {
      mockGetBookingDetails.mockResolvedValue(mockBookingDetailResponse);

      const result = await bookingManagementService.getBookingDetails('CONF123456');

      expect(mockGetBookingDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          ConfirmationNo: 'CONF123456',
        })
      );

      expect(result).toEqual({
        confirmationNumber: 'CONF123456',
        bookingReferenceId: 'REF789012',
        bookingId: 12345,
        bookingStatus: 'Confirmed',
        hotelName: 'Grand Plaza Hotel',
        checkInDate: new Date('2024-02-15'),
        checkOutDate: new Date('2024-02-18'),
        totalFare: 6000,
        currency: 'INR',
        guestDetails: [
          {
            customerNames: [
              {
                title: 'Mr',
                firstName: 'John',
                lastName: 'Doe',
                type: 'Adult',
              },
              {
                title: 'Mrs',
                firstName: 'Jane',
                lastName: 'Doe',
                type: 'Adult',
              },
            ],
          },
        ],
        bookedOn: new Date('2024-01-15T10:30:00Z'),
        voucherUrl: 'https://example.com/voucher/123456',
      });
    });

    it('should retrieve booking details using booking reference ID', async () => {
      mockGetBookingDetails.mockResolvedValue(mockBookingDetailResponse);

      const result = await bookingManagementService.getBookingDetails(
        undefined,
        'REF789012'
      );

      expect(mockGetBookingDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          BookingRefNo: 'REF789012',
        })
      );

      expect(result.bookingReferenceId).toBe('REF789012');
    });

    it('should retrieve booking details using both identifiers', async () => {
      mockGetBookingDetails.mockResolvedValue(mockBookingDetailResponse);

      const result = await bookingManagementService.getBookingDetails(
        'CONF123456',
        'REF789012'
      );

      expect(mockGetBookingDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          ConfirmationNo: 'CONF123456',
          BookingRefNo: 'REF789012',
        })
      );

      expect(result.confirmationNumber).toBe('CONF123456');
      expect(result.bookingReferenceId).toBe('REF789012');
    });

    it('should throw error when no identifier is provided', async () => {
      await expect(
        bookingManagementService.getBookingDetails()
      ).rejects.toThrow('Either confirmation number or booking reference ID must be provided');

      expect(mockGetBookingDetails).not.toHaveBeenCalled();
    });

    it('should transform dates correctly', async () => {
      mockGetBookingDetails.mockResolvedValue(mockBookingDetailResponse);

      const result = await bookingManagementService.getBookingDetails('CONF123456');

      expect(result.checkInDate).toBeInstanceOf(Date);
      expect(result.checkOutDate).toBeInstanceOf(Date);
      expect(result.bookedOn).toBeInstanceOf(Date);
      expect(result.checkInDate.toISOString()).toContain('2024-02-15');
      expect(result.checkOutDate.toISOString()).toContain('2024-02-18');
    });

    it('should handle booking without voucher URL', async () => {
      const responseWithoutVoucher = {
        ...mockBookingDetailResponse,
        BookingDetails: {
          ...mockBookingDetailResponse.BookingDetails,
          VoucherUrl: undefined,
        },
      };

      mockGetBookingDetails.mockResolvedValue(responseWithoutVoucher);

      const result = await bookingManagementService.getBookingDetails('CONF123456');

      expect(result.voucherUrl).toBeUndefined();
    });

    it('should handle multiple guest details', async () => {
      const multiGuestResponse = {
        ...mockBookingDetailResponse,
        BookingDetails: {
          ...mockBookingDetailResponse.BookingDetails,
          GuestDetails: [
            {
              CustomerNames: [
                { Title: 'Mr', FirstName: 'John', LastName: 'Doe', Type: 'Adult' },
                { Title: 'Mrs', FirstName: 'Jane', LastName: 'Doe', Type: 'Adult' },
              ],
            },
            {
              CustomerNames: [
                { Title: 'Mr', FirstName: 'Bob', LastName: 'Smith', Type: 'Adult' },
              ],
            },
          ],
        },
      };

      mockGetBookingDetails.mockResolvedValue(multiGuestResponse);

      const result = await bookingManagementService.getBookingDetails('CONF123456');

      expect(result.guestDetails).toHaveLength(2);
      expect(result.guestDetails[0].customerNames).toHaveLength(2);
      expect(result.guestDetails[1].customerNames).toHaveLength(1);
    });

    it('should handle API error with BOOKING_NOT_FOUND code', async () => {
      const apiError = {
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      };

      mockGetBookingDetails.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.getBookingDetails('INVALID123')
      ).rejects.toThrow('Booking not found. Please check your confirmation number.');
    });

    it('should handle API error with INVALID_CONFIRMATION_NUMBER code', async () => {
      const apiError = {
        error: {
          code: 'INVALID_CONFIRMATION_NUMBER',
          message: 'Invalid confirmation number',
        },
      };

      mockGetBookingDetails.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.getBookingDetails('INVALID')
      ).rejects.toThrow('Invalid confirmation number provided.');
    });

    it('should handle network error', async () => {
      const networkError = {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error',
        },
      };

      mockGetBookingDetails.mockRejectedValue(networkError);

      await expect(
        bookingManagementService.getBookingDetails('CONF123456')
      ).rejects.toThrow('Network error occurred. Please check your connection and try again.');
    });

    it('should handle generic error', async () => {
      mockGetBookingDetails.mockRejectedValue(new Error('Unknown error'));

      await expect(
        bookingManagementService.getBookingDetails('CONF123456')
      ).rejects.toThrow('Failed to retrieve booking details. Please try again later.');
    });
  });

  // ============================================================================
  // getBookingsByDateRange Tests
  // ============================================================================

  describe('getBookingsByDateRange', () => {
    const mockBookingListResponse: BookingListResponse = {
      Bookings: [
        {
          ConfirmationNo: 'CONF123456',
          BookingRefNo: 'REF789012',
          HotelName: 'Grand Plaza Hotel',
          CheckInDate: '2024-02-15',
          CheckOutDate: '2024-02-18',
          BookingStatus: 'Confirmed',
          TotalFare: 6000,
          CurrencyCode: 'INR',
        },
        {
          ConfirmationNo: 'CONF789012',
          BookingRefNo: 'REF345678',
          HotelName: 'Seaside Resort',
          CheckInDate: '2024-03-10',
          CheckOutDate: '2024-03-15',
          BookingStatus: 'Confirmed',
          TotalFare: 8500,
          CurrencyCode: 'INR',
        },
      ],
      Status: 1,
      Message: 'Success',
    };

    it('should retrieve bookings within date range', async () => {
      mockGetBookingsByDateRange.mockResolvedValue(mockBookingListResponse);

      const result = await bookingManagementService.getBookingsByDateRange(
        '2024-02-01',
        '2024-03-31'
      );

      expect(mockGetBookingsByDateRange).toHaveBeenCalledWith({
        FromDate: '2024-02-01',
        ToDate: '2024-03-31',
      });

      expect(result.bookings).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it('should transform booking list correctly', async () => {
      mockGetBookingsByDateRange.mockResolvedValue(mockBookingListResponse);

      const result = await bookingManagementService.getBookingsByDateRange(
        '2024-02-01',
        '2024-03-31'
      );

      expect(result.bookings[0]).toEqual({
        confirmationNumber: 'CONF123456',
        bookingReferenceId: 'REF789012',
        hotelName: 'Grand Plaza Hotel',
        checkInDate: new Date('2024-02-15'),
        checkOutDate: new Date('2024-02-18'),
        bookingStatus: 'Confirmed',
        totalFare: 6000,
        currency: 'INR',
      });

      expect(result.bookings[1]).toEqual({
        confirmationNumber: 'CONF789012',
        bookingReferenceId: 'REF345678',
        hotelName: 'Seaside Resort',
        checkInDate: new Date('2024-03-10'),
        checkOutDate: new Date('2024-03-15'),
        bookingStatus: 'Confirmed',
        totalFare: 8500,
        currency: 'INR',
      });
    });

    it('should handle empty booking list', async () => {
      const emptyResponse: BookingListResponse = {
        Bookings: [],
        Status: 1,
        Message: 'No bookings found',
      };

      mockGetBookingsByDateRange.mockResolvedValue(emptyResponse);

      const result = await bookingManagementService.getBookingsByDateRange(
        '2024-01-01',
        '2024-01-31'
      );

      expect(result.bookings).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should validate date format - invalid from date', async () => {
      await expect(
        bookingManagementService.getBookingsByDateRange('2024/02/01', '2024-03-31')
      ).rejects.toThrow('Invalid date format. Expected YYYY-MM-DD');

      expect(mockGetBookingsByDateRange).not.toHaveBeenCalled();
    });

    it('should validate date format - invalid to date', async () => {
      await expect(
        bookingManagementService.getBookingsByDateRange('2024-02-01', '03-31-2024')
      ).rejects.toThrow('Invalid date format. Expected YYYY-MM-DD');

      expect(mockGetBookingsByDateRange).not.toHaveBeenCalled();
    });

    it('should validate date format - invalid date value', async () => {
      await expect(
        bookingManagementService.getBookingsByDateRange('2024-13-01', '2024-03-31')
      ).rejects.toThrow('Invalid date format. Expected YYYY-MM-DD');

      expect(mockGetBookingsByDateRange).not.toHaveBeenCalled();
    });

    it('should validate date range - from date after to date', async () => {
      await expect(
        bookingManagementService.getBookingsByDateRange('2024-03-31', '2024-02-01')
      ).rejects.toThrow('From date must be before or equal to to date');

      expect(mockGetBookingsByDateRange).not.toHaveBeenCalled();
    });

    it('should allow same from and to date', async () => {
      mockGetBookingsByDateRange.mockResolvedValue({
        Bookings: [],
        Status: 1,
      });

      await bookingManagementService.getBookingsByDateRange('2024-02-15', '2024-02-15');

      expect(mockGetBookingsByDateRange).toHaveBeenCalledWith({
        FromDate: '2024-02-15',
        ToDate: '2024-02-15',
      });
    });

    it('should transform dates to Date objects', async () => {
      mockGetBookingsByDateRange.mockResolvedValue(mockBookingListResponse);

      const result = await bookingManagementService.getBookingsByDateRange(
        '2024-02-01',
        '2024-03-31'
      );

      result.bookings.forEach(booking => {
        expect(booking.checkInDate).toBeInstanceOf(Date);
        expect(booking.checkOutDate).toBeInstanceOf(Date);
      });
    });

    it('should handle API error', async () => {
      mockGetBookingsByDateRange.mockRejectedValue(new Error('API Error'));

      await expect(
        bookingManagementService.getBookingsByDateRange('2024-02-01', '2024-03-31')
      ).rejects.toThrow('Failed to retrieve bookings. Please try again later.');
    });
  });

  // ============================================================================
  // cancelBooking Tests
  // ============================================================================

  describe('cancelBooking', () => {
    const mockSuccessfulCancelResponse: CancelResponse = {
      ConfirmationNo: 'CONF123456',
      CancellationStatus: 'Success',
      RefundAmount: 5400,
      CancellationCharge: 600,
      Status: 1,
      Message: 'Booking cancelled successfully',
    };

    it('should cancel booking successfully', async () => {
      mockCancelBooking.mockResolvedValue(mockSuccessfulCancelResponse);

      const result = await bookingManagementService.cancelBooking('CONF123456');

      expect(mockCancelBooking).toHaveBeenCalledWith({
        ConfirmationNo: 'CONF123456',
      });

      expect(result).toEqual({
        success: true,
        confirmationNumber: 'CONF123456',
        cancellationStatus: 'Success',
        refundAmount: 5400,
        cancellationCharge: 600,
        message: 'Booking cancelled successfully',
      });
    });

    it('should handle failed cancellation', async () => {
      const failedResponse: CancelResponse = {
        ConfirmationNo: 'CONF123456',
        CancellationStatus: 'Failed',
        RefundAmount: 0,
        CancellationCharge: 0,
        Status: 0,
        Message: 'Cancellation not allowed',
      };

      mockCancelBooking.mockResolvedValue(failedResponse);

      const result = await bookingManagementService.cancelBooking('CONF123456');

      expect(result.success).toBe(false);
      expect(result.cancellationStatus).toBe('Failed');
      expect(result.message).toBe('Cancellation not allowed');
    });

    it('should handle cancellation with no refund', async () => {
      const noRefundResponse: CancelResponse = {
        ConfirmationNo: 'CONF123456',
        CancellationStatus: 'Success',
        RefundAmount: 0,
        CancellationCharge: 6000,
        Status: 1,
        Message: 'Non-refundable booking cancelled',
      };

      mockCancelBooking.mockResolvedValue(noRefundResponse);

      const result = await bookingManagementService.cancelBooking('CONF123456');

      expect(result.success).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(result.cancellationCharge).toBe(6000);
    });

    it('should handle cancellation with missing amounts', async () => {
      const responseWithMissingAmounts: CancelResponse = {
        ConfirmationNo: 'CONF123456',
        CancellationStatus: 'Success',
        RefundAmount: undefined as any,
        CancellationCharge: undefined as any,
        Status: 1,
      };

      mockCancelBooking.mockResolvedValue(responseWithMissingAmounts);

      const result = await bookingManagementService.cancelBooking('CONF123456');

      expect(result.refundAmount).toBe(0);
      expect(result.cancellationCharge).toBe(0);
      expect(result.message).toBe('Booking cancelled successfully');
    });

    it('should throw error when confirmation number is empty', async () => {
      await expect(
        bookingManagementService.cancelBooking('')
      ).rejects.toThrow('Confirmation number is required for cancellation');

      expect(mockCancelBooking).not.toHaveBeenCalled();
    });

    it('should throw error when confirmation number is whitespace', async () => {
      await expect(
        bookingManagementService.cancelBooking('   ')
      ).rejects.toThrow('Confirmation number is required for cancellation');

      expect(mockCancelBooking).not.toHaveBeenCalled();
    });

    it('should handle CANCELLATION_NOT_ALLOWED error', async () => {
      const apiError = {
        error: {
          code: 'CANCELLATION_NOT_ALLOWED',
          message: 'Cancellation not allowed',
        },
      };

      mockCancelBooking.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.cancelBooking('CONF123456')
      ).rejects.toThrow('This booking cannot be cancelled. Please contact support.');
    });

    it('should handle BOOKING_ALREADY_CANCELLED error', async () => {
      const apiError = {
        error: {
          code: 'BOOKING_ALREADY_CANCELLED',
          message: 'Already cancelled',
        },
      };

      mockCancelBooking.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.cancelBooking('CONF123456')
      ).rejects.toThrow('This booking has already been cancelled.');
    });

    it('should handle timeout error', async () => {
      const timeoutError = {
        error: {
          code: 'TIMEOUT',
          message: 'Request timeout',
        },
      };

      mockCancelBooking.mockRejectedValue(timeoutError);

      await expect(
        bookingManagementService.cancelBooking('CONF123456')
      ).rejects.toThrow('Request timed out. Please try again.');
    });

    it('should handle generic cancellation error', async () => {
      mockCancelBooking.mockRejectedValue(new Error('Unknown error'));

      await expect(
        bookingManagementService.cancelBooking('CONF123456')
      ).rejects.toThrow('Failed to cancel booking. Please try again later.');
    });

    it('should handle case-insensitive cancellation status', async () => {
      const mixedCaseResponse: CancelResponse = {
        ConfirmationNo: 'CONF123456',
        CancellationStatus: 'SUCCESS',
        RefundAmount: 5400,
        CancellationCharge: 600,
        Status: 1,
      };

      mockCancelBooking.mockResolvedValue(mixedCaseResponse);

      const result = await bookingManagementService.cancelBooking('CONF123456');

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('error handling', () => {
    it('should handle API error with custom message', async () => {
      const apiError = {
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
        },
      };

      mockGetBookingDetails.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.getBookingDetails('CONF123456')
      ).rejects.toThrow('Custom error message');
    });

    it('should handle API error without message', async () => {
      const apiError = {
        error: {
          code: 'UNKNOWN_ERROR',
        },
      };

      mockGetBookingDetails.mockRejectedValue(apiError);

      await expect(
        bookingManagementService.getBookingDetails('CONF123456')
      ).rejects.toThrow('Failed to retrieve booking details');
    });

    it('should handle non-API errors', async () => {
      mockGetBookingsByDateRange.mockRejectedValue(
        new TypeError('Network failure')
      );

      await expect(
        bookingManagementService.getBookingsByDateRange('2024-02-01', '2024-03-31')
      ).rejects.toThrow('Failed to retrieve bookings. Please try again later.');
    });
  });
});
