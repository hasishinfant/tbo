/**
 * Pre-Booking Service
 * 
 * Validates hotel availability and pricing before final booking by calling
 * the TBO Hotel API PreBook endpoint. Detects price changes and room
 * availability issues.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { getTboHotelApiClient } from './api/tboHotelApiClient';
import type { PreBookRequest, PreBookResponse } from '../types/tboHotelApi';

// ============================================================================
// Types
// ============================================================================

export interface PreBookResult {
  bookingCode: string;
  originalPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  priceIncrease: number;
  available: boolean;
  currency: string;
  cancellationPolicyChanged: boolean;
}

// ============================================================================
// Pre-Booking Service Class
// ============================================================================

class PreBookService {
  private apiClient = getTboHotelApiClient();

  /**
   * Pre-book a selected hotel room to validate current pricing and availability
   * 
   * Requirements:
   * - 3.1: Call pre-book API with BookingCode
   * - 3.2: Calculate price difference between original and current
   * - 3.3: Return PreBookResult with price change details
   * - 3.4: Handle room unavailability errors
   * - 3.5: Update booking session with validated pricing and new BookingCode
   * 
   * @param bookingCode - The BookingCode from the hotel search results
   * @param originalPrice - The original price from search results
   * @param paymentMode - Payment method (default: 'Limit' for credit limit)
   * @returns Promise resolving to PreBookResult
   * @throws Error if room is no longer available or API call fails
   */
  async preBook(
    bookingCode: string,
    originalPrice: number,
    paymentMode: string = 'Limit'
  ): Promise<PreBookResult> {
    try {
      // Build pre-book request (Requirement 3.1)
      const request: PreBookRequest = {
        BookingCode: bookingCode,
        PaymentMode: paymentMode,
      };

      // Call pre-book API
      const response: PreBookResponse = await this.apiClient.preBook(request);

      // Check for API errors or unsuccessful status
      if (response.Status === 0 || response.Status === 2) {
        const errorMessage = response.Message || 'Pre-booking failed';
        
        // Check if error indicates room unavailability (Requirement 3.4)
        if (
          errorMessage.toLowerCase().includes('not available') ||
          errorMessage.toLowerCase().includes('sold out') ||
          errorMessage.toLowerCase().includes('no longer available') ||
          errorMessage.toLowerCase().includes('unavailable')
        ) {
          return {
            bookingCode,
            originalPrice,
            currentPrice: 0,
            priceChanged: true,
            priceIncrease: 0,
            available: false,
            currency: 'INR',
            cancellationPolicyChanged: false,
          };
        }

        throw new Error(`Pre-booking failed: ${errorMessage}`);
      }

      // Extract current price from response
      const currentPrice = response.HotelDetails.Price.OfferedPrice;
      const currency = response.HotelDetails.Price.CurrencyCode;
      const priceChanged = response.IsPriceChanged;
      const cancellationPolicyChanged = response.IsCancellationPolicyChanged;
      
      // Calculate price difference (Requirement 3.2)
      const priceIncrease = currentPrice - originalPrice;

      // Return PreBookResult with price change details (Requirement 3.3)
      // The new BookingCode from response should be used for final booking (Requirement 3.5)
      return {
        bookingCode: response.BookingCode,
        originalPrice,
        currentPrice,
        priceChanged,
        priceIncrease,
        available: true,
        currency,
        cancellationPolicyChanged,
      };
    } catch (error) {
      // Handle room unavailability and other errors (Requirement 3.4)
      if (error instanceof Error) {
        // Check if error indicates room unavailability
        if (
          error.message.toLowerCase().includes('not available') ||
          error.message.toLowerCase().includes('sold out') ||
          error.message.toLowerCase().includes('no longer available') ||
          error.message.toLowerCase().includes('unavailable')
        ) {
          return {
            bookingCode,
            originalPrice,
            currentPrice: 0,
            priceChanged: true,
            priceIncrease: 0,
            available: false,
            currency: 'INR',
            cancellationPolicyChanged: false,
          };
        }
      }

      // Re-throw other errors
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const preBookService = new PreBookService();
export default preBookService;
