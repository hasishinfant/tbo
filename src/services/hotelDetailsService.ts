/**
 * Hotel Details Service
 * 
 * Provides detailed hotel information with:
 * - Retrieve hotel details using hotel codes
 * - Parse hotel description, amenities, and facilities
 * - Session-based caching for performance
 * - Mock fallback for API failures
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { getTboHotelApiClient } from './api/tboHotelApiClient';
import type {
  HotelDetailsRequest,
  HotelDetailsResponse,
  HotelDetail,
} from '../types/tboHotelApi';

// ============================================================================
// Types
// ============================================================================

export interface HotelDetailsResult {
  hotelCode: string;
  hotelName: string;
  starRating: number;
  description: string;
  facilities: string[];
  attractions: Array<{ key: string; value: string }>;
  policy: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
  };
  images: string[];
  address: string;
  pinCode: string;
  cityName: string;
  countryName: string;
  phoneNumber: string;
  faxNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isMockData: boolean;
}

interface CacheEntry {
  data: HotelDetailsResult;
  timestamp: Date;
}

// ============================================================================
// Hotel Details Service Class
// ============================================================================

export class HotelDetailsService {
  private apiClient = getTboHotelApiClient();
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Get detailed hotel information
   * Requirement 2.1: Retrieve detailed hotel information using hotel code
   * Requirement 2.2: Present hotel description, amenities, facilities, and policies
   * Requirement 2.3: Cache results for session duration
   * Requirement 2.5: Show check-in/check-out times, cancellation policies, and important notices
   */
  async getHotelDetails(hotelCodes: string | string[], language: string = 'en'): Promise<HotelDetailsResult[]> {
    // Normalize input to array
    const codes = Array.isArray(hotelCodes) ? hotelCodes : [hotelCodes];

    // Validate input
    if (codes.length === 0) {
      throw new Error('At least one hotel code is required');
    }

    // Check cache first (Requirement 2.3)
    const cachedResults: HotelDetailsResult[] = [];
    const uncachedCodes: string[] = [];

    for (const code of codes) {
      const cached = this.getFromCache(code);
      if (cached) {
        cachedResults.push(cached);
      } else {
        uncachedCodes.push(code);
      }
    }

    // If all results are cached, return them
    if (uncachedCodes.length === 0) {
      return cachedResults;
    }

    try {
      // Prepare API request
      const request: HotelDetailsRequest = {
        HotelCodes: uncachedCodes.join(','),
        Language: language,
      };

      // Call the API
      const response: HotelDetailsResponse = await this.apiClient.getHotelDetails(request);

      // Check if API returned success
      if (response.Status === 1 && response.HotelDetails) {
        // Transform API response to internal model
        const hotelDetails = this.transformToInternalModel(response.HotelDetails);

        // Cache the results (Requirement 2.3)
        hotelDetails.forEach(detail => {
          this.addToCache(detail.hotelCode, detail);
        });

        // Combine cached and new results
        return [...cachedResults, ...hotelDetails];
      }

      // API returned error status
      throw new Error(response.Message || 'Failed to retrieve hotel details');

    } catch (error) {
      // Requirement 2.4: Mock fallback for API failures
      return this.handleDetailsError(error, uncachedCodes, cachedResults);
    }
  }

  /**
   * Clear the cache (useful for testing or session reset)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (useful for monitoring)
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get hotel details from cache if available and not expired
   * Requirement 2.3: Cache for session duration
   */
  private getFromCache(hotelCode: string): HotelDetailsResult | null {
    const entry = this.cache.get(hotelCode);
    
    if (!entry) {
      return null;
    }

    // Cache is valid for the entire session (no expiration during session)
    // In a real application, you might want to add session timeout logic here
    return entry.data;
  }

  /**
   * Add hotel details to cache
   */
  private addToCache(hotelCode: string, data: HotelDetailsResult): void {
    this.cache.set(hotelCode, {
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Transform API hotel details to internal model
   * Requirement 2.2: Parse hotel description, amenities, facilities, and policies
   */
  private transformToInternalModel(hotelDetails: HotelDetail[]): HotelDetailsResult[] {
    return hotelDetails.map(detail => ({
      hotelCode: detail.HotelCode,
      hotelName: detail.HotelName,
      starRating: detail.StarRating,
      description: detail.Description || '',
      facilities: detail.HotelFacilities || [],
      attractions: (detail.Attractions || []).map(attr => ({
        key: attr.Key,
        value: attr.Value,
      })),
      policy: {
        checkInTime: detail.HotelPolicy?.CheckInTime || 'Not specified',
        checkOutTime: detail.HotelPolicy?.CheckOutTime || 'Not specified',
        cancellationPolicy: detail.HotelPolicy?.CancellationPolicy || 'Please contact hotel for cancellation policy',
      },
      images: detail.Images || [],
      address: detail.Address || '',
      pinCode: detail.PinCode || '',
      cityName: detail.CityName || '',
      countryName: detail.CountryName || '',
      phoneNumber: detail.PhoneNumber || '',
      faxNumber: detail.FaxNumber || '',
      location: {
        latitude: detail.Map?.Latitude || 0,
        longitude: detail.Map?.Longitude || 0,
      },
      isMockData: false,
    }));
  }

  /**
   * Handle errors with mock fallback
   * Requirement 2.4: Display generic hotel information when API fails
   */
  private handleDetailsError(
    error: unknown,
    uncachedCodes: string[],
    cachedResults: HotelDetailsResult[]
  ): HotelDetailsResult[] {
    console.warn('Hotel details API failed, using mock data:', error);

    // Generate mock data for uncached codes
    const mockDetails = uncachedCodes.map(code => this.getMockHotelDetails(code));

    // Cache the mock data
    mockDetails.forEach(detail => {
      this.addToCache(detail.hotelCode, detail);
    });

    // Combine cached and mock results
    return [...cachedResults, ...mockDetails];
  }

  /**
   * Generate mock hotel details for fallback
   * Requirement 2.4: Display generic hotel information
   */
  private getMockHotelDetails(hotelCode: string): HotelDetailsResult {
    // Generate consistent mock data based on hotel code
    const codeNum = parseInt(hotelCode.replace(/\D/g, ''), 10) || 1;
    const starRating = 3 + (codeNum % 3); // 3-5 stars

    const hotelNames = [
      'Grand Plaza Hotel',
      'Sunset Beach Resort',
      'City Center Inn',
      'Royal Palace Hotel',
      'Ocean View Resort',
      'Mountain Lodge',
      'Downtown Suites',
      'Riverside Hotel',
    ];

    const facilities = [
      'Free WiFi',
      'Swimming Pool',
      'Fitness Center',
      'Restaurant',
      'Bar/Lounge',
      'Room Service',
      'Concierge',
      'Business Center',
      'Parking',
      'Airport Shuttle',
    ];

    const descriptions = [
      'Experience luxury and comfort at our premier hotel. Our elegant rooms and exceptional service ensure a memorable stay.',
      'Discover the perfect blend of modern amenities and classic hospitality. Ideal for both business and leisure travelers.',
      'Enjoy a relaxing stay with stunning views and world-class facilities. Our dedicated staff is here to make your visit unforgettable.',
      'Located in the heart of the city, our hotel offers convenient access to major attractions and business districts.',
    ];

    return {
      hotelCode,
      hotelName: hotelNames[codeNum % hotelNames.length],
      starRating,
      description: descriptions[codeNum % descriptions.length],
      facilities: facilities.slice(0, 5 + (codeNum % 5)),
      attractions: [
        { key: 'City Center', value: '2 km' },
        { key: 'Airport', value: '15 km' },
        { key: 'Beach', value: '5 km' },
      ],
      policy: {
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours of check-in will incur a one-night charge.',
      },
      images: [
        `https://via.placeholder.com/800x600?text=Hotel+Exterior`,
        `https://via.placeholder.com/800x600?text=Hotel+Room`,
        `https://via.placeholder.com/800x600?text=Hotel+Pool`,
        `https://via.placeholder.com/800x600?text=Hotel+Restaurant`,
      ],
      address: `${100 + codeNum} Main Street`,
      pinCode: `${10000 + codeNum}`,
      cityName: 'Mock City',
      countryName: 'Mock Country',
      phoneNumber: `+1-555-${String(1000 + codeNum).padStart(4, '0')}`,
      faxNumber: `+1-555-${String(2000 + codeNum).padStart(4, '0')}`,
      location: {
        latitude: 40.7128 + (codeNum % 10) * 0.01,
        longitude: -74.0060 + (codeNum % 10) * 0.01,
      },
      isMockData: true,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let hotelDetailsServiceInstance: HotelDetailsService | null = null;

/**
 * Get the singleton hotel details service instance
 */
export function getHotelDetailsService(): HotelDetailsService {
  if (!hotelDetailsServiceInstance) {
    hotelDetailsServiceInstance = new HotelDetailsService();
  }
  return hotelDetailsServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetHotelDetailsService(): void {
  hotelDetailsServiceInstance = null;
}

// Export default instance
export default getHotelDetailsService();
