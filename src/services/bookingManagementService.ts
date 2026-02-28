/**
 * Booking Management Service
 * 
 * Manages hotel booking retrieval, viewing, and cancellation operations.
 * Provides methods to:
 * - Retrieve booking details by confirmation number or booking reference
 * - List bookings within a date range
 * - Cancel existing bookings
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { getTboHotelApiClient } from './api/tboHotelApiClient';
import type {
  BookingDetailRequest,
  BookingDetailResponse,
  BookingListRequest,
  BookingListResponse,
  CancelRequest,
  CancelResponse,
  BookingDetail,
  BookingSummary,
} from '../types/tboHotelApi';

// ============================================================================
// Types
// ============================================================================

export interface BookingDetailsResult {
  confirmationNumber: string;
  bookingReferenceId: string;
  bookingId: number;
  bookingStatus: string;
  hotelName: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalFare: number;
  currency: string;
  guestDetails: GuestInfo[];
  bookedOn: Date;
  voucherUrl?: string;
}

export interface GuestInfo {
  customerNames: {
    title: string;
    firstName: string;
    lastName: string;
    type: 'Adult' | 'Child';
  }[];
}

export interface BookingListResult {
  bookings: BookingSummaryResult[];
  totalCount: number;
}

export interface BookingSummaryResult {
  confirmationNumber: string;
  bookingReferenceId: string;
  hotelName: string;
  checkInDate: Date;
  checkOutDate: Date;
  bookingStatus: string;
  totalFare: number;
  currency: string;
}

export interface CancellationResult {
  success: boolean;
  confirmationNumber: string;
  cancellationStatus: string;
  refundAmount: number;
  cancellationCharge: number;
  message: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

class BookingManagementService {
  /**
   * Get detailed booking information by confirmation number or booking reference
   * 
   * @param confirmationNumber - The confirmation number from booking
   * @param bookingReference - Alternative booking reference ID
   * @returns Promise resolving to booking details
   * 
   * Requirements: 5.1, 5.2
   */
  async getBookingDetails(
    confirmationNumber?: string,
    bookingReference?: string
  ): Promise<BookingDetailsResult> {
    // Validate that at least one identifier is provided
    if (!confirmationNumber && !bookingReference) {
      throw new Error('Either confirmation number or booking reference ID must be provided');
    }

    try {
      const apiClient = getTboHotelApiClient();
      
      // Prepare request
      const request: BookingDetailRequest = {
        ConfirmationNo: confirmationNumber,
        BookingRefNo: bookingReference,
      };

      // Call API
      const response: BookingDetailResponse = await apiClient.getBookingDetails(request);

      // Parse and transform response
      return this.transformBookingDetail(response.BookingDetails);
    } catch (error: any) {
      // Handle specific error codes
      if (error?.error?.code === 'BOOKING_NOT_FOUND') {
        throw new Error('Booking not found. Please check your confirmation number.');
      }
      if (error?.error?.code === 'INVALID_CONFIRMATION_NUMBER') {
        throw new Error('Invalid confirmation number provided.');
      }
      if (error?.error?.code === 'NETWORK_ERROR') {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
      
      // If error has a custom message, use it
      if (error?.error?.message) {
        console.error('Failed to retrieve booking details:', error);
        throw new Error(error.error.message);
      }
      
      console.error('Failed to retrieve booking details:', error);
      throw new Error('Failed to retrieve booking details. Please try again later.');
    }
  }

  /**
   * Get list of bookings within a date range
   * 
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @returns Promise resolving to list of bookings
   * 
   * Requirements: 5.5
   */
  async getBookingsByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<BookingListResult> {
    // Validate date format
    if (!this.isValidDateFormat(fromDate) || !this.isValidDateFormat(toDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Validate date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from > to) {
      throw new Error('From date must be before or equal to to date');
    }

    try {
      const apiClient = getTboHotelApiClient();
      
      // Prepare request
      const request: BookingListRequest = {
        FromDate: fromDate,
        ToDate: toDate,
      };

      // Call API
      const response: BookingListResponse = await apiClient.getBookingsByDateRange(request);

      // Transform response
      const bookings = response.Bookings.map(booking => 
        this.transformBookingSummary(booking)
      );

      return {
        bookings,
        totalCount: bookings.length,
      };
    } catch (error: any) {
      console.error('Failed to retrieve bookings by date range:', error);
      throw new Error('Failed to retrieve bookings. Please try again later.');
    }
  }

  /**
   * Cancel a hotel booking
   * 
   * @param confirmationNumber - The confirmation number of the booking to cancel
   * @returns Promise resolving to cancellation result
   * 
   * Requirements: 5.3, 5.4
   */
  async cancelBooking(confirmationNumber: string): Promise<CancellationResult> {
    if (!confirmationNumber || confirmationNumber.trim() === '') {
      throw new Error('Confirmation number is required for cancellation');
    }

    try {
      const apiClient = getTboHotelApiClient();
      
      // Prepare request
      const request: CancelRequest = {
        ConfirmationNo: confirmationNumber,
      };

      // Call API
      const response: CancelResponse = await apiClient.cancelBooking(request);

      // Parse cancellation status
      const success = response.Status === 1 && 
                     response.CancellationStatus.toLowerCase() === 'success';

      return {
        success,
        confirmationNumber: response.ConfirmationNo,
        cancellationStatus: response.CancellationStatus,
        refundAmount: response.RefundAmount || 0,
        cancellationCharge: response.CancellationCharge || 0,
        message: response.Message || (success ? 'Booking cancelled successfully' : 'Cancellation failed'),
      };
    } catch (error: any) {
      // Handle specific error codes
      if (error?.error?.code === 'CANCELLATION_NOT_ALLOWED') {
        throw new Error('This booking cannot be cancelled. Please contact support.');
      }
      if (error?.error?.code === 'BOOKING_ALREADY_CANCELLED') {
        throw new Error('This booking has already been cancelled.');
      }
      if (error?.error?.code === 'TIMEOUT') {
        throw new Error('Request timed out. Please try again.');
      }
      
      console.error('Failed to cancel booking:', error);
      throw new Error('Failed to cancel booking. Please try again later.');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Transform API booking detail to internal format
   * 
   * Requirements: 5.2
   */
  private transformBookingDetail(detail: BookingDetail): BookingDetailsResult {
    return {
      confirmationNumber: detail.ConfirmationNo,
      bookingReferenceId: detail.BookingRefNo,
      bookingId: detail.BookingId,
      bookingStatus: this.normalizeBookingStatus(detail.BookingStatus),
      hotelName: detail.HotelName,
      checkInDate: new Date(detail.CheckInDate),
      checkOutDate: new Date(detail.CheckOutDate),
      totalFare: detail.TotalFare,
      currency: detail.CurrencyCode,
      guestDetails: this.transformGuestDetails(detail.GuestDetails),
      bookedOn: new Date(detail.BookedOn),
      voucherUrl: detail.VoucherUrl,
    };
  }

  /**
   * Transform API booking summary to internal format
   */
  private transformBookingSummary(summary: BookingSummary): BookingSummaryResult {
    return {
      confirmationNumber: summary.ConfirmationNo,
      bookingReferenceId: summary.BookingRefNo,
      hotelName: summary.HotelName,
      checkInDate: new Date(summary.CheckInDate),
      checkOutDate: new Date(summary.CheckOutDate),
      bookingStatus: this.normalizeBookingStatus(summary.BookingStatus),
      totalFare: summary.TotalFare,
      currency: summary.CurrencyCode,
    };
  }

  /**
   * Transform guest details from API format to internal format
   */
  private transformGuestDetails(apiGuestDetails: any[]): GuestInfo[] {
    return apiGuestDetails.map((room) => ({
      customerNames: room.CustomerNames.map((customer: any) => ({
        title: customer.Title,
        firstName: customer.FirstName,
        lastName: customer.LastName,
        type: customer.Type as 'Adult' | 'Child',
      })),
    }));
  }

  /**
   * Normalize booking status to consistent format
   * 
   * Requirements: 5.2
   */
  private normalizeBookingStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'failed': 'Failed',
      'vouchered': 'Confirmed',
    };

    const lowerStatus = status.toLowerCase();
    return statusMap[lowerStatus] || status;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const bookingManagementService = new BookingManagementService();
export default bookingManagementService;
