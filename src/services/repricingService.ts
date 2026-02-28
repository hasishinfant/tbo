/**
 * Re-Pricing Service
 * 
 * Validates current flight prices before booking by calling the Tek Travels
 * re-price API. Detects price changes and flight availability issues.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import type { RepricingRequest, RepricingResponse } from '../types/tekTravelsApi';

// ============================================================================
// Types
// ============================================================================

export interface RepricingResult {
  originalPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  priceIncrease: number;
  available: boolean;
  currency: string;
  isTimeChanged: boolean;
}

// ============================================================================
// Re-Pricing Service Class
// ============================================================================

class RepricingService {
  private apiClient = getTekTravelsApiClient();

  /**
   * Re-price a selected flight to validate current pricing
   * 
   * Requirements:
   * - 3.1: Call re-price API with TraceId
   * - 3.2: Calculate price difference between original and current
   * - 3.3: Return RepricingResult with price change details
   * - 3.4: Handle flight unavailability errors
   * - 3.5: Update booking session with validated pricing
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @param originalPrice - The original price from search results
   * @returns Promise resolving to RepricingResult
   * @throws Error if flight is no longer available or API call fails
   */
  async repriceFlight(
    traceId: string,
    resultIndex: string,
    originalPrice: number
  ): Promise<RepricingResult> {
    try {
      // Build re-pricing request (Requirement 3.1)
      const request: Omit<RepricingRequest, 'TokenId'> = {
        EndUserIp: '127.0.0.1',
        TraceId: traceId,
        ResultIndex: resultIndex,
      };

      // Call re-price API
      const response: RepricingResponse = await this.apiClient.repriceFlight(request);

      // Check for API errors
      if (response.Response.Error) {
        throw new Error(
          `Re-pricing failed: ${response.Response.Error.ErrorMessage} (${response.Response.Error.ErrorCode})`
        );
      }

      const result = response.Response.Results;

      // Check if flight is still available (Requirement 3.4)
      if (!result) {
        return {
          originalPrice,
          currentPrice: 0,
          priceChanged: true,
          priceIncrease: 0,
          available: false,
          currency: 'INR',
          isTimeChanged: false,
        };
      }

      const currentPrice = result.Fare.OfferedFare;
      const priceChanged = result.IsPriceChanged;
      
      // Calculate price difference (Requirement 3.2)
      const priceIncrease = currentPrice - originalPrice;

      // Return RepricingResult with price change details (Requirement 3.3)
      return {
        originalPrice,
        currentPrice,
        priceChanged,
        priceIncrease,
        available: true,
        currency: result.Fare.Currency,
        isTimeChanged: result.IsTimeChanged,
      };
    } catch (error) {
      // Handle flight unavailability and other errors (Requirement 3.4)
      if (error instanceof Error) {
        // Check if error indicates flight unavailability
        if (
          error.message.includes('not available') ||
          error.message.includes('sold out') ||
          error.message.includes('no longer available')
        ) {
          return {
            originalPrice,
            currentPrice: 0,
            priceChanged: true,
            priceIncrease: 0,
            available: false,
            currency: 'INR',
            isTimeChanged: false,
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

export const repricingService = new RepricingService();
export default repricingService;
