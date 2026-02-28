/**
 * Unit Tests for Location Service
 * 
 * Tests location service functionality including:
 * - Country list retrieval
 * - City list filtering
 * - Hotel code list retrieval
 * - Caching behavior
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  CountryListResponse,
  CityListResponse,
  HotelCodeListResponse,
} from '../../types/tboHotelApi';

// Create mock functions that will be used in the mock
const mockGetCountryList = vi.fn();
const mockGetCityList = vi.fn();
const mockGetHotelCodeList = vi.fn();

// Mock the API client module before importing LocationService
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: () => ({
    getCountryList: (...args: any[]) => mockGetCountryList(...args),
    getCityList: (...args: any[]) => mockGetCityList(...args),
    getHotelCodeList: (...args: any[]) => mockGetHotelCodeList(...args),
  }),
}));

// Import after mocking
import { LocationService, resetLocationService } from '../locationService';

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    resetLocationService();
    locationService = new LocationService();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCountries', () => {
    it('should retrieve country list successfully', async () => {
      // Requirement 6.1: Country lookup functionality
      const mockResponse: CountryListResponse = {
        Status: 1,
        Countries: [
          { Code: 'US', Name: 'United States' },
          { Code: 'IN', Name: 'India' },
          { Code: 'GB', Name: 'United Kingdom' },
        ],
      };

      mockGetCountryList.mockResolvedValue(mockResponse);

      const countries = await locationService.getCountries();

      expect(countries).toHaveLength(3);
      expect(countries[0]).toEqual({ Code: 'US', Name: 'United States' });
      expect(mockGetCountryList).toHaveBeenCalledTimes(1);
    });

    it('should cache country list for subsequent calls', async () => {
      // Requirement 6.4: Caching for performance
      const mockResponse: CountryListResponse = {
        Status: 1,
        Countries: [
          { Code: 'US', Name: 'United States' },
          { Code: 'IN', Name: 'India' },
        ],
      };

      mockGetCountryList.mockResolvedValue(mockResponse);

      // First call
      const countries1 = await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const countries2 = await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(1); // Still 1
      expect(countries2).toEqual(countries1);
    });

    it('should throw error when API returns failure status', async () => {
      const mockResponse: CountryListResponse = {
        Status: 0,
        Message: 'API Error',
        Countries: [],
      };

      mockGetCountryList.mockResolvedValue(mockResponse);

      await expect(locationService.getCountries()).rejects.toThrow('API Error');
    });

    it('should handle API client errors', async () => {
      mockGetCountryList.mockRejectedValue(new Error('Network error'));

      await expect(locationService.getCountries()).rejects.toThrow('Network error');
    });
  });

  describe('getCities', () => {
    it('should retrieve city list for a country successfully', async () => {
      // Requirement 6.2: City lookup with country information
      const mockResponse: CityListResponse = {
        Status: 1,
        Cities: [
          { Code: 'NYC', Name: 'New York', CountryCode: 'US' },
          { Code: 'LAX', Name: 'Los Angeles', CountryCode: 'US' },
        ],
      };

      mockGetCityList.mockResolvedValue(mockResponse);

      const cities = await locationService.getCities('US');

      expect(cities).toHaveLength(2);
      expect(cities[0]).toEqual({ Code: 'NYC', Name: 'New York', CountryCode: 'US' });
      expect(mockGetCityList).toHaveBeenCalledWith({ CountryCode: 'US' });
    });

    it('should cache city list per country', async () => {
      // Requirement 6.4: Caching for performance
      const mockResponse: CityListResponse = {
        Status: 1,
        Cities: [
          { Code: 'DEL', Name: 'Delhi', CountryCode: 'IN' },
          { Code: 'BOM', Name: 'Mumbai', CountryCode: 'IN' },
        ],
      };

      mockGetCityList.mockResolvedValue(mockResponse);

      // First call
      const cities1 = await locationService.getCities('IN');
      expect(mockGetCityList).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const cities2 = await locationService.getCities('IN');
      expect(mockGetCityList).toHaveBeenCalledTimes(1); // Still 1
      expect(cities2).toEqual(cities1);
    });

    it('should cache cities separately for different countries', async () => {
      const mockResponseUS: CityListResponse = {
        Status: 1,
        Cities: [{ Code: 'NYC', Name: 'New York', CountryCode: 'US' }],
      };

      const mockResponseIN: CityListResponse = {
        Status: 1,
        Cities: [{ Code: 'DEL', Name: 'Delhi', CountryCode: 'IN' }],
      };

      mockGetCityList
        .mockResolvedValueOnce(mockResponseUS)
        .mockResolvedValueOnce(mockResponseIN);

      const citiesUS = await locationService.getCities('US');
      const citiesIN = await locationService.getCities('IN');

      expect(mockGetCityList).toHaveBeenCalledTimes(2);
      expect(citiesUS[0].Code).toBe('NYC');
      expect(citiesIN[0].Code).toBe('DEL');
    });

    it('should handle case-insensitive country codes', async () => {
      const mockResponse: CityListResponse = {
        Status: 1,
        Cities: [{ Code: 'DEL', Name: 'Delhi', CountryCode: 'IN' }],
      };

      mockGetCityList.mockResolvedValue(mockResponse);

      // Call with lowercase
      await locationService.getCities('in');
      expect(mockGetCityList).toHaveBeenCalledWith({ CountryCode: 'in' });

      // Call with uppercase should use cache
      await locationService.getCities('IN');
      expect(mockGetCityList).toHaveBeenCalledTimes(1); // Cache hit
    });

    it('should throw error when country code is empty', async () => {
      await expect(locationService.getCities('')).rejects.toThrow('Country code is required');
    });

    it('should throw error when API returns failure status', async () => {
      const mockResponse: CityListResponse = {
        Status: 0,
        Message: 'Invalid country code',
        Cities: [],
      };

      mockGetCityList.mockResolvedValue(mockResponse);

      await expect(locationService.getCities('XX')).rejects.toThrow('Invalid country code');
    });
  });

  describe('getHotelsInCity', () => {
    it('should retrieve hotel list for a city successfully', async () => {
      // Requirement 6.3: Hotel code retrieval by city
      const mockResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'NYC',
            StarRating: 5,
          },
          {
            HotelCode: 'H002',
            HotelName: 'Budget Inn',
            Address: '456 Side St',
            CityCode: 'NYC',
            StarRating: 3,
          },
        ],
      };

      mockGetHotelCodeList.mockResolvedValue(mockResponse);

      const hotels = await locationService.getHotelsInCity('NYC');

      expect(hotels).toHaveLength(2);
      expect(hotels[0].HotelCode).toBe('H001');
      expect(hotels[0].HotelName).toBe('Grand Hotel');
      expect(mockGetHotelCodeList).toHaveBeenCalledWith({
        CityCode: 'NYC',
        IsDetailedResponse: false,
      });
    });

    it('should support detailed response option', async () => {
      const mockResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'NYC',
            StarRating: 5,
            Latitude: 40.7128,
            Longitude: -74.0060,
          },
        ],
      };

      mockGetHotelCodeList.mockResolvedValue(mockResponse);

      const hotels = await locationService.getHotelsInCity('NYC', true);

      expect(hotels[0].Latitude).toBe(40.7128);
      expect(hotels[0].Longitude).toBe(-74.0060);
      expect(mockGetHotelCodeList).toHaveBeenCalledWith({
        CityCode: 'NYC',
        IsDetailedResponse: true,
      });
    });

    it('should cache hotel list per city and detail level', async () => {
      // Requirement 6.4: Caching for performance
      const mockResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'DEL',
            StarRating: 5,
          },
        ],
      };

      mockGetHotelCodeList.mockResolvedValue(mockResponse);

      // First call
      const hotels1 = await locationService.getHotelsInCity('DEL', false);
      expect(mockGetHotelCodeList).toHaveBeenCalledTimes(1);

      // Second call with same parameters should use cache
      const hotels2 = await locationService.getHotelsInCity('DEL', false);
      expect(mockGetHotelCodeList).toHaveBeenCalledTimes(1); // Still 1
      expect(hotels2).toEqual(hotels1);
    });

    it('should cache detailed and simple responses separately', async () => {
      const mockSimpleResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'DEL',
            StarRating: 5,
          },
        ],
      };

      const mockDetailedResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'DEL',
            StarRating: 5,
            Latitude: 28.7041,
            Longitude: 77.1025,
          },
        ],
      };

      mockGetHotelCodeList
        .mockResolvedValueOnce(mockSimpleResponse)
        .mockResolvedValueOnce(mockDetailedResponse);

      const simpleHotels = await locationService.getHotelsInCity('DEL', false);
      const detailedHotels = await locationService.getHotelsInCity('DEL', true);

      expect(mockGetHotelCodeList).toHaveBeenCalledTimes(2);
      expect(simpleHotels[0].Latitude).toBeUndefined();
      expect(detailedHotels[0].Latitude).toBe(28.7041);
    });

    it('should throw error when city code is empty', async () => {
      await expect(locationService.getHotelsInCity('')).rejects.toThrow('City code is required');
    });

    it('should throw error when API returns failure status', async () => {
      const mockResponse: HotelCodeListResponse = {
        Status: 0,
        Message: 'Invalid city code',
        Hotels: [],
      };

      mockGetHotelCodeList.mockResolvedValue(mockResponse);

      await expect(locationService.getHotelsInCity('XXX')).rejects.toThrow('Invalid city code');
    });
  });

  describe('searchLocations', () => {
    it('should return empty array for queries shorter than 2 characters', async () => {
      const results = await locationService.searchLocations('a');
      expect(results).toEqual([]);
      expect(mockGetCountryList).not.toHaveBeenCalled();
    });

    it('should search across countries', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [
          { Code: 'US', Name: 'United States' },
          { Code: 'GB', Name: 'United Kingdom' },
        ],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);

      const results = await locationService.searchLocations('united');

      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('country');
      expect(results[0].name).toBe('United States');
      expect(results[1].name).toBe('United Kingdom');
    });

    it('should search cities in matching countries', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [{ Code: 'IN', Name: 'India' }],
      };

      const mockCityResponse: CityListResponse = {
        Status: 1,
        Cities: [
          { Code: 'DEL', Name: 'New Delhi', CountryCode: 'IN' },
          { Code: 'BOM', Name: 'Mumbai', CountryCode: 'IN' },
          { Code: 'IND', Name: 'Indore', CountryCode: 'IN' },
        ],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);
      mockGetCityList.mockResolvedValue(mockCityResponse);

      const results = await locationService.searchLocations('ind');

      // Should include country and matching cities
      const countryResults = results.filter(r => r.type === 'country');
      const cityResults = results.filter(r => r.type === 'city');

      expect(countryResults).toHaveLength(1); // India matches 'ind'
      expect(cityResults).toHaveLength(1); // Only Indore matches 'ind'
      expect(cityResults[0].name).toBe('Indore');
      expect(cityResults[0].displayName).toContain('India');
    });

    it('should limit city searches to first 5 matching countries', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: Array.from({ length: 10 }, (_, i) => ({
          Code: `C${i}`,
          Name: `Country ${i}`,
        })),
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);
      mockGetCityList.mockResolvedValue({
        Status: 1,
        Cities: [],
      });

      await locationService.searchLocations('country');

      // Should only call getCityList for first 5 countries
      expect(mockGetCityList).toHaveBeenCalledTimes(5);
    });

    it('should handle city lookup failures gracefully', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [
          { Code: 'US', Name: 'United States' },
          { Code: 'IN', Name: 'India' },
        ],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);
      mockGetCityList
        .mockRejectedValueOnce(new Error('City lookup failed'))
        .mockResolvedValueOnce({
          Status: 1,
          Cities: [{ Code: 'DEL', Name: 'Delhi', CountryCode: 'IN' }],
        });

      // Should not throw, but continue with other countries
      const results = await locationService.searchLocations('united');

      expect(results.length).toBeGreaterThan(0);
      // Should have country results at minimum
      expect(results.some(r => r.type === 'country')).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear all caches', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [{ Code: 'US', Name: 'United States' }],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);

      // Populate cache
      await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(1);

      // Clear cache
      locationService.clearCache();

      // Next call should hit API again
      await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(2);
    });

    it('should clear specific cache type - countries', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [{ Code: 'US', Name: 'United States' }],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);

      await locationService.getCountries();
      locationService.clearCacheByType('countries');

      await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(2);
    });

    it('should clear specific cache type - cities', async () => {
      const mockCityResponse: CityListResponse = {
        Status: 1,
        Cities: [{ Code: 'NYC', Name: 'New York', CountryCode: 'US' }],
      };

      mockGetCityList.mockResolvedValue(mockCityResponse);

      await locationService.getCities('US');
      locationService.clearCacheByType('cities');

      await locationService.getCities('US');
      expect(mockGetCityList).toHaveBeenCalledTimes(2);
    });

    it('should clear specific cache type - hotels', async () => {
      const mockHotelResponse: HotelCodeListResponse = {
        Status: 1,
        Hotels: [
          {
            HotelCode: 'H001',
            HotelName: 'Grand Hotel',
            Address: '123 Main St',
            CityCode: 'NYC',
            StarRating: 5,
          },
        ],
      };

      mockGetHotelCodeList.mockResolvedValue(mockHotelResponse);

      await locationService.getHotelsInCity('NYC');
      locationService.clearCacheByType('hotels');

      await locationService.getHotelsInCity('NYC');
      expect(mockGetHotelCodeList).toHaveBeenCalledTimes(2);
    });

    it('should provide cache statistics', async () => {
      const mockCountryResponse: CountryListResponse = {
        Status: 1,
        Countries: [{ Code: 'US', Name: 'United States' }],
      };

      const mockCityResponse: CityListResponse = {
        Status: 1,
        Cities: [{ Code: 'NYC', Name: 'New York', CountryCode: 'US' }],
      };

      mockGetCountryList.mockResolvedValue(mockCountryResponse);
      mockGetCityList.mockResolvedValue(mockCityResponse);

      // Initially empty
      let stats = locationService.getCacheStats();
      expect(stats.countries).toBe(false);
      expect(stats.cities).toBe(0);
      expect(stats.hotels).toBe(0);

      // Populate caches
      await locationService.getCountries();
      await locationService.getCities('US');
      await locationService.getCities('IN');

      stats = locationService.getCacheStats();
      expect(stats.countries).toBe(true);
      expect(stats.cities).toBe(2);
      expect(stats.hotels).toBe(0);
    });
  });

  describe('cache expiration', () => {
    it('should expire cache after 30 minutes', async () => {
      const mockResponse: CountryListResponse = {
        Status: 1,
        Countries: [{ Code: 'US', Name: 'United States' }],
      };

      mockGetCountryList.mockResolvedValue(mockResponse);

      // First call
      await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(1);

      // Mock time passing (31 minutes)
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + 31 * 60 * 1000);

      // Should fetch again due to cache expiration
      await locationService.getCountries();
      expect(mockGetCountryList).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });
});
