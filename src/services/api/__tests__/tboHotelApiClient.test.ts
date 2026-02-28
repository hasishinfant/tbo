/**
 * Unit tests for TBO Hotel API Client
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type {
  HotelSearchRequest,
  HotelSearchResponse,
  PreBookRequest,
  PreBookResponse,
  ApiConfig,
} from '../../../types/tboHotelApi';

// Mock axios before importing the client
vi.mock('axios', () => {
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

import axios from 'axios';
import { TboHotelApiClient, getTboHotelApiClient, resetApiClient } from '../tboHotelApiClient';

const mockedAxios = axios as any;

describe('TboHotelApiClient', () => {
  let client: TboHotelApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset the singleton
    resetApiClient();

    // Create mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    mockedAxios.create = vi.fn(() => mockAxiosInstance);

    // Create client with test config
    const testConfig: Partial<ApiConfig> = {
      baseUrl: 'http://test-api.example.com',
      username: 'test-user',
      password: 'test-pass',
      timeout: 10000,
      retryAttempts: 3,
    };

    client = new TboHotelApiClient(testConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://test-api.example.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        auth: {
          username: 'test-user',
          password: 'test-pass',
        },
      });
    });

    it('should use default configuration when no config provided', () => {
      resetApiClient();
      mockedAxios.create.mockClear();
      
      new TboHotelApiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('searchHotels', () => {
    it('should successfully search for hotels', async () => {
      const mockRequest: HotelSearchRequest = {
        CheckIn: '2024-06-01',
        CheckOut: '2024-06-05',
        CityCode: 'NYC',
        GuestNationality: 'US',
        PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
      };

      const mockResponse: HotelSearchResponse = {
        Hotels: [
          {
            BookingCode: 'ABC123',
            HotelCode: 'H001',
            HotelName: 'Test Hotel',
            StarRating: 4,
            HotelAddress: '123 Test St',
            HotelContactNo: '555-0100',
            CityName: 'New York',
            CountryName: 'USA',
            Price: {
              CurrencyCode: 'USD',
              RoomPrice: 200,
              Tax: 20,
              ExtraGuestCharge: 0,
              ChildCharge: 0,
              OtherCharges: 0,
              Discount: 0,
              PublishedPrice: 220,
              OfferedPrice: 220,
              AgentCommission: 0,
              AgentMarkUp: 0,
            },
            Refundable: true,
            MealType: 'Room Only',
            RoomType: 'Standard',
            AvailableRooms: 5,
            Amenities: ['WiFi', 'Pool'],
            HotelPicture: 'image.jpg',
            HotelImages: ['image1.jpg', 'image2.jpg'],
          },
        ],
        Status: 1,
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.searchHotels(mockRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search', mockRequest);
      expect(result).toEqual(mockResponse);
      expect(result.Hotels).toHaveLength(1);
      expect(result.Hotels[0].HotelName).toBe('Test Hotel');
    });

    it('should handle API errors', async () => {
      const mockRequest: HotelSearchRequest = {
        CheckIn: '2024-06-01',
        CheckOut: '2024-06-05',
        CityCode: 'NYC',
        GuestNationality: 'US',
        PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
      };

      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(client.searchHotels(mockRequest)).rejects.toThrow();
    });
  });

  describe('preBook', () => {
    it('should successfully validate pre-booking', async () => {
      const mockRequest: PreBookRequest = {
        BookingCode: 'ABC123',
        PaymentMode: 'Limit',
      };

      const mockResponse: PreBookResponse = {
        BookingCode: 'ABC123',
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'USD',
            PublishedPrice: 220,
            OfferedPrice: 220,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.preBook(mockRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/PreBook', mockRequest);
      expect(result).toEqual(mockResponse);
      expect(result.IsPriceChanged).toBe(false);
    });

    it('should detect price changes', async () => {
      const mockRequest: PreBookRequest = {
        BookingCode: 'ABC123',
        PaymentMode: 'Limit',
      };

      const mockResponse: PreBookResponse = {
        BookingCode: 'ABC123',
        IsPriceChanged: true,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'USD',
            PublishedPrice: 250,
            OfferedPrice: 250,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await client.preBook(mockRequest);

      expect(result.IsPriceChanged).toBe(true);
      expect(result.HotelDetails.Price.OfferedPrice).toBe(250);
    });
  });

  describe('getCountryList', () => {
    it('should retrieve country list', async () => {
      const mockResponse = {
        Countries: [
          { Code: 'US', Name: 'United States' },
          { Code: 'UK', Name: 'United Kingdom' },
        ],
        Status: 1,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await client.getCountryList();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/CountryList');
      expect(result.Countries).toHaveLength(2);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is available', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { Countries: [], Status: 1 },
      });

      const result = await client.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when API is unavailable', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await client.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      resetApiClient();
      const instance1 = getTboHotelApiClient();
      const instance2 = getTboHotelApiClient();

      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      resetApiClient();
      const instance1 = getTboHotelApiClient();
      
      resetApiClient();
      mockedAxios.create.mockClear();
      
      const instance2 = getTboHotelApiClient();

      expect(mockedAxios.create).toHaveBeenCalled();
    });
  });
});
