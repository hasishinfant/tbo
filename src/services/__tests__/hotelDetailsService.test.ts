/**
 * Unit Tests for Hotel Details Service
 * 
 * Tests hotel details retrieval, caching, mock fallback, and error handling
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HotelDetailsService, resetHotelDetailsService } from '../hotelDetailsService';
import { getTboHotelApiClient, resetApiClient } from '../api/tboHotelApiClient';
import type { HotelDetailsResponse, HotelDetail } from '../../types/tboHotelApi';

// Mock the API client
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: vi.fn(),
  resetApiClient: vi.fn(),
}));

// Mock hotel detail data
const mockHotelDetail: HotelDetail = {
  HotelCode: 'HOTEL001',
  HotelName: 'Grand Plaza Hotel',
  StarRating: 5,
  Description: 'Luxury hotel in the heart of the city',
  HotelFacilities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Restaurant'],
  Attractions: [
    { Key: 'City Center', Value: '2 km' },
    { Key: 'Airport', Value: '15 km' },
  ],
  HotelPolicy: {
    CheckInTime: '14:00',
    CheckOutTime: '12:00',
    CancellationPolicy: 'Free cancellation up to 24 hours before check-in',
  },
  Images: [
    'https://example.com/hotel1.jpg',
    'https://example.com/hotel2.jpg',
  ],
  Address: '123 Main Street',
  PinCode: '10001',
  CityName: 'New York',
  CountryName: 'USA',
  PhoneNumber: '+1-555-1234',
  FaxNumber: '+1-555-5678',
  Map: {
    Latitude: 40.7128,
    Longitude: -74.0060,
  },
};

const mockApiResponse: HotelDetailsResponse = {
  Status: 1,
  Message: 'Success',
  HotelDetails: [mockHotelDetail],
};

describe('HotelDetailsService', () => {
  let service: HotelDetailsService;
  let mockApiClient: any;

  beforeEach(() => {
    // Reset service and API client before each test
    resetHotelDetailsService();
    resetApiClient();

    // Create mock API client
    mockApiClient = {
      getHotelDetails: vi.fn(),
    };

    // Mock the getTboHotelApiClient function
    vi.mocked(getTboHotelApiClient).mockReturnValue(mockApiClient);

    // Create new service instance
    service = new HotelDetailsService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getHotelDetails - Details Retrieval', () => {
    it('should retrieve hotel details for a single hotel code', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      const result = await service.getHotelDetails('HOTEL001');

      expect(result).toHaveLength(1);
      expect(result[0].hotelCode).toBe('HOTEL001');
      expect(result[0].hotelName).toBe('Grand Plaza Hotel');
      expect(result[0].starRating).toBe(5);
      expect(result[0].isMockData).toBe(false);
    });

    it('should retrieve hotel details for multiple hotel codes', async () => {
      const multiHotelResponse: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [
          mockHotelDetail,
          { ...mockHotelDetail, HotelCode: 'HOTEL002', HotelName: 'Ocean View Resort' },
        ],
      };

      mockApiClient.getHotelDetails.mockResolvedValue(multiHotelResponse);

      const result = await service.getHotelDetails(['HOTEL001', 'HOTEL002']);

      expect(result).toHaveLength(2);
      expect(result[0].hotelCode).toBe('HOTEL001');
      expect(result[1].hotelCode).toBe('HOTEL002');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledWith({
        HotelCodes: 'HOTEL001,HOTEL002',
        Language: 'en',
      });
    });

    it('should accept custom language parameter', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      await service.getHotelDetails('HOTEL001', 'es');

      expect(mockApiClient.getHotelDetails).toHaveBeenCalledWith({
        HotelCodes: 'HOTEL001',
        Language: 'es',
      });
    });

    it('should throw error when no hotel codes provided', async () => {
      await expect(service.getHotelDetails([])).rejects.toThrow(
        'At least one hotel code is required'
      );
    });

    it('should parse hotel description, amenities, and facilities', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      const result = await service.getHotelDetails('HOTEL001');

      expect(result[0].description).toBe('Luxury hotel in the heart of the city');
      expect(result[0].facilities).toEqual([
        'Free WiFi',
        'Swimming Pool',
        'Fitness Center',
        'Restaurant',
      ]);
      expect(result[0].attractions).toEqual([
        { key: 'City Center', value: '2 km' },
        { key: 'Airport', value: '15 km' },
      ]);
    });

    it('should parse hotel policy information', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      const result = await service.getHotelDetails('HOTEL001');

      expect(result[0].policy.checkInTime).toBe('14:00');
      expect(result[0].policy.checkOutTime).toBe('12:00');
      expect(result[0].policy.cancellationPolicy).toBe(
        'Free cancellation up to 24 hours before check-in'
      );
    });

    it('should handle missing optional fields with defaults', async () => {
      const minimalHotelDetail: HotelDetail = {
        HotelCode: 'HOTEL003',
        HotelName: 'Basic Hotel',
        StarRating: 3,
        Description: '',
        HotelFacilities: [],
        Attractions: [],
        HotelPolicy: undefined,
        Images: [],
        Address: '',
        PinCode: '',
        CityName: '',
        CountryName: '',
        PhoneNumber: '',
        FaxNumber: '',
        Map: undefined,
      };

      const minimalResponse: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [minimalHotelDetail],
      };

      mockApiClient.getHotelDetails.mockResolvedValue(minimalResponse);

      const result = await service.getHotelDetails('HOTEL003');

      expect(result[0].description).toBe('');
      expect(result[0].facilities).toEqual([]);
      expect(result[0].policy.checkInTime).toBe('Not specified');
      expect(result[0].policy.checkOutTime).toBe('Not specified');
      expect(result[0].policy.cancellationPolicy).toBe(
        'Please contact hotel for cancellation policy'
      );
      expect(result[0].location.latitude).toBe(0);
      expect(result[0].location.longitude).toBe(0);
    });
  });

  describe('getHotelDetails - Caching Behavior', () => {
    it('should cache hotel details after first retrieval', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      // First call - should hit API
      await service.getHotelDetails('HOTEL001');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await service.getHotelDetails('HOTEL001');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1);
    });

    it('should return cached results immediately', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      // First call
      const result1 = await service.getHotelDetails('HOTEL001');

      // Second call
      const result2 = await service.getHotelDetails('HOTEL001');

      expect(result1).toEqual(result2);
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1);
    });

    it('should cache multiple hotels independently', async () => {
      const hotel1Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [mockHotelDetail],
      };

      const hotel2Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [{ ...mockHotelDetail, HotelCode: 'HOTEL002' }],
      };

      mockApiClient.getHotelDetails
        .mockResolvedValueOnce(hotel1Response)
        .mockResolvedValueOnce(hotel2Response);

      // Cache both hotels
      await service.getHotelDetails('HOTEL001');
      await service.getHotelDetails('HOTEL002');

      // Retrieve from cache
      await service.getHotelDetails('HOTEL001');
      await service.getHotelDetails('HOTEL002');

      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(2);
    });

    it('should use cache for some hotels and fetch others', async () => {
      const hotel1Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [mockHotelDetail],
      };

      const hotel2Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [{ ...mockHotelDetail, HotelCode: 'HOTEL002' }],
      };

      mockApiClient.getHotelDetails
        .mockResolvedValueOnce(hotel1Response)
        .mockResolvedValueOnce(hotel2Response);

      // Cache HOTEL001
      await service.getHotelDetails('HOTEL001');

      // Request both hotels - should only fetch HOTEL002
      const result = await service.getHotelDetails(['HOTEL001', 'HOTEL002']);

      expect(result).toHaveLength(2);
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(2);
      expect(mockApiClient.getHotelDetails).toHaveBeenLastCalledWith({
        HotelCodes: 'HOTEL002',
        Language: 'en',
      });
    });

    it('should clear cache when clearCache is called', async () => {
      mockApiClient.getHotelDetails.mockResolvedValue(mockApiResponse);

      // Cache hotel
      await service.getHotelDetails('HOTEL001');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Should fetch again
      await service.getHotelDetails('HOTEL001');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(2);
    });

    it('should report correct cache size', async () => {
      const hotel1Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [mockHotelDetail],
      };

      const hotel23Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [
          { ...mockHotelDetail, HotelCode: 'HOTEL002' },
          { ...mockHotelDetail, HotelCode: 'HOTEL003' },
        ],
      };

      mockApiClient.getHotelDetails
        .mockResolvedValueOnce(hotel1Response)
        .mockResolvedValueOnce(hotel23Response);

      expect(service.getCacheSize()).toBe(0);

      await service.getHotelDetails('HOTEL001');
      expect(service.getCacheSize()).toBe(1);

      await service.getHotelDetails(['HOTEL002', 'HOTEL003']);
      expect(service.getCacheSize()).toBe(3);

      service.clearCache();
      expect(service.getCacheSize()).toBe(0);
    });
  });

  describe('getHotelDetails - Mock Fallback', () => {
    it('should return mock data when API fails', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('API Error'));

      const result = await service.getHotelDetails('HOTEL001');

      expect(result).toHaveLength(1);
      expect(result[0].hotelCode).toBe('HOTEL001');
      expect(result[0].isMockData).toBe(true);
    });

    it('should return mock data for multiple hotels when API fails', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('Network Error'));

      const result = await service.getHotelDetails(['HOTEL001', 'HOTEL002']);

      expect(result).toHaveLength(2);
      expect(result[0].isMockData).toBe(true);
      expect(result[1].isMockData).toBe(true);
    });

    it('should cache mock data', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('API Error'));

      // First call - generates mock data and caches it
      await service.getHotelDetails('HOTEL001');
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1);

      // Second call - should use cached mock data (no additional API call)
      const result = await service.getHotelDetails('HOTEL001');

      expect(result[0].isMockData).toBe(true);
      expect(mockApiClient.getHotelDetails).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should generate consistent mock data for same hotel code', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('API Error'));

      const result1 = await service.getHotelDetails('HOTEL001');
      service.clearCache();
      const result2 = await service.getHotelDetails('HOTEL001');

      expect(result1[0].hotelName).toBe(result2[0].hotelName);
      expect(result1[0].starRating).toBe(result2[0].starRating);
    });

    it('should include all required fields in mock data', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('API Error'));

      const result = await service.getHotelDetails('HOTEL001');
      const mockHotel = result[0];

      expect(mockHotel.hotelCode).toBeDefined();
      expect(mockHotel.hotelName).toBeDefined();
      expect(mockHotel.starRating).toBeGreaterThanOrEqual(3);
      expect(mockHotel.starRating).toBeLessThanOrEqual(5);
      expect(mockHotel.description).toBeDefined();
      expect(mockHotel.facilities).toBeInstanceOf(Array);
      expect(mockHotel.facilities.length).toBeGreaterThan(0);
      expect(mockHotel.policy.checkInTime).toBeDefined();
      expect(mockHotel.policy.checkOutTime).toBeDefined();
      expect(mockHotel.policy.cancellationPolicy).toBeDefined();
      expect(mockHotel.images).toBeInstanceOf(Array);
      expect(mockHotel.images.length).toBeGreaterThan(0);
    });

    it('should return cached data and mock data for mixed requests', async () => {
      const hotel1Response: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [mockHotelDetail],
      };

      mockApiClient.getHotelDetails
        .mockResolvedValueOnce(hotel1Response)
        .mockRejectedValueOnce(new Error('API Error'));

      // Cache HOTEL001 with real data
      await service.getHotelDetails('HOTEL001');

      // Request both hotels - HOTEL002 should fail and use mock
      const result = await service.getHotelDetails(['HOTEL001', 'HOTEL002']);

      expect(result).toHaveLength(2);
      expect(result[0].isMockData).toBe(false);
      expect(result[1].isMockData).toBe(true);
    });
  });

  describe('getHotelDetails - Error Handling', () => {
    it('should handle API returning error status', async () => {
      const errorResponse: HotelDetailsResponse = {
        Status: 0,
        Message: 'Hotel not found',
        HotelDetails: [],
      };

      mockApiClient.getHotelDetails.mockResolvedValue(errorResponse);

      const result = await service.getHotelDetails('INVALID_CODE');

      // Should fall back to mock data
      expect(result).toHaveLength(1);
      expect(result[0].isMockData).toBe(true);
    });

    it('should handle network timeout', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(
        new Error('timeout of 10000ms exceeded')
      );

      const result = await service.getHotelDetails('HOTEL001');

      expect(result).toHaveLength(1);
      expect(result[0].isMockData).toBe(true);
    });

    it('should handle network connection error', async () => {
      mockApiClient.getHotelDetails.mockRejectedValue(
        new Error('Network Error')
      );

      const result = await service.getHotelDetails('HOTEL001');

      expect(result).toHaveLength(1);
      expect(result[0].isMockData).toBe(true);
    });

    it('should log warning when falling back to mock data', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockApiClient.getHotelDetails.mockRejectedValue(new Error('API Error'));

      await service.getHotelDetails('HOTEL001');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Hotel details API failed, using mock data:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle empty response from API', async () => {
      const emptyResponse: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: [],
      };

      mockApiClient.getHotelDetails.mockResolvedValue(emptyResponse);

      const result = await service.getHotelDetails('HOTEL001');

      expect(result).toHaveLength(0);
    });

    it('should handle API returning null HotelDetails', async () => {
      const nullResponse: HotelDetailsResponse = {
        Status: 1,
        Message: 'Success',
        HotelDetails: null as any,
      };

      mockApiClient.getHotelDetails.mockResolvedValue(nullResponse);

      const result = await service.getHotelDetails('HOTEL001');

      // Should fall back to mock data
      expect(result).toHaveLength(1);
      expect(result[0].isMockData).toBe(true);
    });
  });
});
