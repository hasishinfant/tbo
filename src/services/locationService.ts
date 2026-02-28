/**
 * Location Service
 * 
 * Provides location-related functionality for hotel search:
 * - Country lookup
 * - City lookup by country
 * - Hotel code lookup by city
 * - Location search with caching
 * 
 * Implements caching to improve performance and reduce API calls.
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { getTboHotelApiClient } from './api/tboHotelApiClient';
import type {
  Country,
  City,
  HotelInfo,
  CountryListResponse,
  CityListResponse,
  HotelCodeListResponse,
} from '../types/tboHotelApi';

// ============================================================================
// Types
// ============================================================================

export interface Location {
  type: 'country' | 'city' | 'hotel';
  code: string;
  name: string;
  displayName: string;
  countryCode?: string;
  countryName?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (session duration)

// ============================================================================
// Location Service Class
// ============================================================================

export class LocationService {
  private apiClient = getTboHotelApiClient();
  
  // Cache storage
  private countryCache: CacheEntry<Country[]> | null = null;
  private cityCache: Map<string, CacheEntry<City[]>> = new Map();
  private hotelCache: Map<string, CacheEntry<HotelInfo[]>> = new Map();

  /**
   * Get list of all countries
   * Results are cached for the session duration
   * Requirement 6.1: Country lookup functionality
   */
  async getCountries(): Promise<Country[]> {
    // Check cache first
    if (this.countryCache && this.isCacheValid(this.countryCache.timestamp)) {
      return this.countryCache.data;
    }

    try {
      const response: CountryListResponse = await this.apiClient.getCountryList();
      
      if (response.Status === 1 && response.Countries) {
        // Cache the results
        this.countryCache = {
          data: response.Countries,
          timestamp: Date.now(),
        };
        
        return response.Countries;
      }
      
      throw new Error(response.Message || 'Failed to fetch countries');
    } catch (error) {
      throw this.handleError(error, 'Failed to retrieve country list');
    }
  }

  /**
   * Get list of cities in a country
   * Results are cached per country for the session duration
   * Requirement 6.2: City lookup with country information
   */
  async getCities(countryCode: string): Promise<City[]> {
    if (!countryCode) {
      throw new Error('Country code is required');
    }

    // Check cache first
    const cacheKey = countryCode.toUpperCase();
    const cachedEntry = this.cityCache.get(cacheKey);
    
    if (cachedEntry && this.isCacheValid(cachedEntry.timestamp)) {
      return cachedEntry.data;
    }

    try {
      const response: CityListResponse = await this.apiClient.getCityList({
        CountryCode: countryCode,
      });
      
      if (response.Status === 1 && response.Cities) {
        // Cache the results
        this.cityCache.set(cacheKey, {
          data: response.Cities,
          timestamp: Date.now(),
        });
        
        return response.Cities;
      }
      
      throw new Error(response.Message || 'Failed to fetch cities');
    } catch (error) {
      throw this.handleError(error, `Failed to retrieve cities for country: ${countryCode}`);
    }
  }

  /**
   * Get list of hotels in a city
   * Results are cached per city for the session duration
   * Requirement 6.3: Hotel code retrieval by city
   * Requirement 6.4: Caching for performance
   */
  async getHotelsInCity(cityCode: string, detailed: boolean = false): Promise<HotelInfo[]> {
    if (!cityCode) {
      throw new Error('City code is required');
    }

    // Check cache first (use separate cache keys for detailed vs non-detailed)
    const cacheKey = `${cityCode.toUpperCase()}_${detailed ? 'detailed' : 'simple'}`;
    const cachedEntry = this.hotelCache.get(cacheKey);
    
    if (cachedEntry && this.isCacheValid(cachedEntry.timestamp)) {
      return cachedEntry.data;
    }

    try {
      const response: HotelCodeListResponse = await this.apiClient.getHotelCodeList({
        CityCode: cityCode,
        IsDetailedResponse: detailed,
      });
      
      if (response.Status === 1 && response.Hotels) {
        // Cache the results
        this.hotelCache.set(cacheKey, {
          data: response.Hotels,
          timestamp: Date.now(),
        });
        
        return response.Hotels;
      }
      
      throw new Error(response.Message || 'Failed to fetch hotels');
    } catch (error) {
      throw this.handleError(error, `Failed to retrieve hotels for city: ${cityCode}`);
    }
  }

  /**
   * Search locations by query string
   * Searches across countries, cities, and hotels
   * Returns unified Location objects for easy display
   */
  async searchLocations(query: string): Promise<Location[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: Location[] = [];

    try {
      // Search countries
      const countries = await this.getCountries();
      const matchingCountries = countries.filter(country =>
        country.Name.toLowerCase().includes(searchTerm) ||
        country.Code.toLowerCase().includes(searchTerm)
      );

      results.push(...matchingCountries.map(country => ({
        type: 'country' as const,
        code: country.Code,
        name: country.Name,
        displayName: country.Name,
      })));

      // Search cities (limit to first 5 matching countries to avoid too many API calls)
      const countriesToSearch = matchingCountries.slice(0, 5);
      
      for (const country of countriesToSearch) {
        try {
          const cities = await this.getCities(country.Code);
          const matchingCities = cities.filter(city =>
            city.Name.toLowerCase().includes(searchTerm)
          );

          results.push(...matchingCities.map(city => ({
            type: 'city' as const,
            code: city.Code,
            name: city.Name,
            displayName: `${city.Name}, ${country.Name}`,
            countryCode: country.Code,
            countryName: country.Name,
          })));
        } catch (error) {
          // Continue with other countries if one fails
          console.warn(`Failed to fetch cities for ${country.Name}:`, error);
        }
      }

      return results;
    } catch (error) {
      throw this.handleError(error, 'Failed to search locations');
    }
  }

  /**
   * Clear all caches
   * Useful for testing or when user wants fresh data
   */
  clearCache(): void {
    this.countryCache = null;
    this.cityCache.clear();
    this.hotelCache.clear();
  }

  /**
   * Clear specific cache by type
   */
  clearCacheByType(type: 'countries' | 'cities' | 'hotels'): void {
    switch (type) {
      case 'countries':
        this.countryCache = null;
        break;
      case 'cities':
        this.cityCache.clear();
        break;
      case 'hotels':
        this.hotelCache.clear();
        break;
    }
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  getCacheStats(): {
    countries: boolean;
    cities: number;
    hotels: number;
  } {
    return {
      countries: this.countryCache !== null,
      cities: this.cityCache.size,
      hotels: this.hotelCache.size,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check if a cache entry is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error as { error: { message: string } };
      return new Error(apiError.error.message || defaultMessage);
    }
    
    return new Error(defaultMessage);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let locationServiceInstance: LocationService | null = null;

/**
 * Get the singleton location service instance
 */
export function getLocationService(): LocationService {
  if (!locationServiceInstance) {
    locationServiceInstance = new LocationService();
  }
  return locationServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetLocationService(): void {
  locationServiceInstance = null;
}

// Export default instance
export default getLocationService();
