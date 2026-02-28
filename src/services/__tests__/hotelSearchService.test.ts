/**
 * Unit Tests for Hotel Search Service
 * 
 * Tests hotel search functionality including:
 * - Search with various criteria
 * - BookingCode extraction
 * - API response transformation
 * - Mock fallback on API failures
 * - Session management
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 1.7
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type {
  HotelSearchResponse,
  Hotel,
} from '../../types/tboHotelApi';

// Create mock functions
const mockSearchHotels = vi.fn();

// Mock the API client module
vi.mock('../api/tboHotelApiClient', () => ({
  getTboHotelApiClient: () => ({
    searchHotels: (...args: any[]) => mockSearchHotels(...args),
  }),
}));

// Mock the fallback handler
vi.mock('../mockFallbackHandler', () => ({
  mockFallbackHandler: {
    isMockMode: () => false,
  },
}));

// Import after mocking
import {
  HotelSearchService,
  resetHotelSearchService,
  type HotelSearchCriteria,
} from '../hotelSearchService';

describe('HotelSearchService', () => {
  let hotelSearchService: HotelSearchService;

  beforeEach(() => {
    resetHotelSearchService();
    hotelSearchService = new HotelSearchService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('search', () => {
    // Use future dates for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const validCriteria: HotelSearchCriteria = {
      checkIn: tomorrow,
      checkOut: nextWeek,
      cityCode: 'NYC',
      guestNationality: 'US',
      paxRooms: [
        {
          adults: 2,
          children: 0,
          childrenAges: [],
        },
      ],
    };

    it('should search hotels successfully and extract BookingCode', async () => {
      // Requirement 1.1: Call TBO Hotel API search endpoint
      // Requirement 1.7: Extract and store BookingCode
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [
          {
            BookingCode: 'BC123456',
            HotelCode: 'H001',
            HotelName: 'Grand Plaza Hotel',
            StarRating: 5,
            HotelAddress: '123 Main St',
            HotelContactNo: '+1-555-1234',
            CityName: 'New York',
            CountryName: 'United States',
            Price: {
              CurrencyCode: 'USD',
              RoomPrice: 200,
              Tax: 30,
              ExtraGuestCharge: 0,
              ChildCharge: 0,
              OtherCharges: 0,
              Discount: 10,
              PublishedPrice: 230,
              OfferedPrice: 220,
              AgentCommission: 0,
              AgentMarkUp: 0,
            },
            Refundable: true,
            MealType: 'Breakfast Included',
            RoomType: 'Deluxe Room',
            AvailableRooms: 3,
            Amenities: ['WiFi', 'Pool', 'Gym'],
            HotelPicture: 'https://example.com/hotel.jpg',
            HotelImages: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
          },
        ],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      const result = await hotelSearchService.search(validCriteria);

      // Verify API was called
      expect(mockSearchHotels).toHaveBeenCalledTimes(1);
      const callArgs = mockSearchHotels.mock.calls[0][0];
      expect(callArgs.CityCode).toBe('NYC');
      expect(callArgs.GuestNationality).toBe('US');
      expect(callArgs.PaxRooms).toEqual([
        {
          Adults: 2,
          Children: 0,
          ChildrenAges: [],
        },
      ]);

      // Verify results
      expect(result.hotels).toHaveLength(1);
      expect(result.totalResults).toBe(1);
      expect(result.isMockData).toBe(false);

      // Requirement 1.7: Verify BookingCode is extracted
      expect(result.hotels[0].bookingCode).toBe('BC123456');
      
      // Requirement 1.2: Verify hotel information is parsed
      expect(result.hotels[0].hotelName).toBe('Grand Plaza Hotel');
      expect(result.hotels[0].starRating).toBe(5);
      expect(result.hotels[0].cityName).toBe('New York');
      expect(result.hotels[0].price.offeredPrice).toBe(220);
      expect(result.hotels[0].amenities).toEqual(['WiFi', 'Pool', 'Gym']);
    });

    it('should transform API response to internal model correctly', async () => {
      // Requirement 1.2: Parse hotel information
      // Requirement 1.4: Include room details, pricing, and availability
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [
          {
            BookingCode: 'BC789',
            HotelCode: 'H002',
            HotelName: 'Budget Inn',
            StarRating: 3,
            HotelAddress: '456 Side St',
            HotelContactNo: '+1-555-5678',
            CityName: 'Los Angeles',
            CountryName: 'United States',
            Price: {
              CurrencyCode: 'USD',
              RoomPrice: 100,
              Tax: 15,
              ExtraGuestCharge: 20,
              ChildCharge: 10,
              OtherCharges: 5,
              Discount: 0,
              PublishedPrice: 150,
              OfferedPrice: 150,
              AgentCommission: 5,
              AgentMarkUp: 2,
            },
            Refundable: false,
            MealType: 'Room Only',
            RoomType: 'Standard Room',
            AvailableRooms: 5,
            Amenities: ['WiFi', 'Parking'],
            HotelPicture: 'https://example.com/budget.jpg',
            HotelImages: [],
          },
        ],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      const result = await hotelSearchService.search(validCriteria);

      const hotel = result.hotels[0];
      
      // Verify all fields are transformed correctly
      expect(hotel.bookingCode).toBe('BC789');
      expect(hotel.hotelCode).toBe('H002');
      expect(hotel.hotelName).toBe('Budget Inn');
      expect(hotel.starRating).toBe(3);
      expect(hotel.address).toBe('456 Side St');
      expect(hotel.contactNumber).toBe('+1-555-5678');
      expect(hotel.refundable).toBe(false);
      expect(hotel.mealType).toBe('Room Only');
      expect(hotel.roomType).toBe('Standard Room');
      expect(hotel.availableRooms).toBe(5);
      
      // Verify price object transformation
      expect(hotel.price.currency).toBe('USD');
      expect(hotel.price.roomPrice).toBe(100);
      expect(hotel.price.tax).toBe(15);
      expect(hotel.price.extraGuestCharge).toBe(20);
      expect(hotel.price.childCharge).toBe(10);
      expect(hotel.price.otherCharges).toBe(5);
      expect(hotel.price.discount).toBe(0);
      expect(hotel.price.publishedPrice).toBe(150);
      expect(hotel.price.offeredPrice).toBe(150);
      expect(hotel.price.agentCommission).toBe(5);
      expect(hotel.price.agentMarkUp).toBe(2);
    });

    it('should handle multiple hotels in search results', async () => {
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [
          createMockHotel('BC001', 'H001', 'Hotel One', 5),
          createMockHotel('BC002', 'H002', 'Hotel Two', 4),
          createMockHotel('BC003', 'H003', 'Hotel Three', 3),
        ],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      const result = await hotelSearchService.search(validCriteria);

      expect(result.hotels).toHaveLength(3);
      expect(result.totalResults).toBe(3);
      expect(result.hotels[0].bookingCode).toBe('BC001');
      expect(result.hotels[1].bookingCode).toBe('BC002');
      expect(result.hotels[2].bookingCode).toBe('BC003');
    });

    it('should create and store search session', async () => {
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(validCriteria);

      const session = hotelSearchService.getCurrentSearchSession();
      
      expect(session).not.toBeNull();
      expect(session?.sessionId).toMatch(/^HOTEL-SEARCH-/);
      expect(session?.searchCriteria).toEqual(validCriteria);
      expect(session?.results.hotels).toHaveLength(1);
      expect(session?.createdAt).toBeInstanceOf(Date);
    });

    it('should support search by hotel codes', async () => {
      const criteriaWithHotelCodes: HotelSearchCriteria = {
        ...validCriteria,
        hotelCodes: 'H001,H002,H003',
        cityCode: undefined,
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(criteriaWithHotelCodes);

      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          HotelCodes: 'H001,H002,H003',
          CityCode: undefined,
        })
      );
    });

    it('should support multi-room search', async () => {
      const multiRoomCriteria: HotelSearchCriteria = {
        ...validCriteria,
        paxRooms: [
          { adults: 2, children: 1, childrenAges: [5] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(multiRoomCriteria);

      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          PaxRooms: [
            { Adults: 2, Children: 1, ChildrenAges: [5] },
            { Adults: 1, Children: 0, ChildrenAges: [] },
          ],
        })
      );
    });

    it('should support search filters', async () => {
      const criteriaWithFilters: HotelSearchCriteria = {
        ...validCriteria,
        filters: {
          Refundable: true,
          StarRating: 4,
          MealType: 1,
        },
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(criteriaWithFilters);

      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          Filters: {
            Refundable: true,
            StarRating: 4,
            MealType: 1,
          },
        })
      );
    });
  });

  describe('validation', () => {
    // Use future dates for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    it('should throw error when check-in date is missing', async () => {
      const invalidCriteria = {
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      } as any;

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Check-in and check-out dates are required'
      );
    });

    it('should throw error when check-out date is missing', async () => {
      const invalidCriteria = {
        checkIn: tomorrow,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      } as any;

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Check-in and check-out dates are required'
      );
    });

    it('should throw error when check-in date is in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidCriteria: HotelSearchCriteria = {
        checkIn: yesterday,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Check-in date cannot be in the past'
      );
    });

    it('should throw error when check-out is before check-in', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: nextWeek,
        checkOut: tomorrow,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Check-out date must be after check-in date'
      );
    });

    it('should throw error when check-out equals check-in', async () => {
      const sameDate = new Date(tomorrow);

      const invalidCriteria: HotelSearchCriteria = {
        checkIn: sameDate,
        checkOut: sameDate,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Check-out date must be after check-in date'
      );
    });

    it('should throw error when neither hotel codes nor city code provided', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Either hotel codes or city code is required'
      );
    });

    it('should throw error when guest nationality is missing', async () => {
      const invalidCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      } as any;

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Guest nationality is required'
      );
    });

    it('should throw error when no rooms provided', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'At least one room is required'
      );
    });

    it('should throw error when room has no adults', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 0, children: 2, childrenAges: [5, 8] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Each room must have at least one adult'
      );
    });

    it('should throw error when children ages not provided', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 2, childrenAges: [5] }], // Missing one age
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Children ages must be provided for all'
      );
    });

    it('should throw error when searching more than 9 rooms', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: Array(10).fill({ adults: 2, children: 0, childrenAges: [] }),
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Maximum 9 rooms can be searched at once'
      );
    });

    it('should throw error when room has more than 9 adults', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 10, children: 0, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Maximum 9 adults per room'
      );
    });

    it('should throw error when children count is negative', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: -1, childrenAges: [] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Children count cannot be negative'
      );
    });

    it('should throw error when room has more than 9 children', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 1, children: 10, childrenAges: Array(10).fill(5) }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Maximum 9 children per room'
      );
    });

    it('should throw error when child age is not an integer', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 1, childrenAges: [5.5] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Age must be a whole number'
      );
    });

    it('should throw error when child age is negative', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 1, childrenAges: [-1] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Age cannot be negative'
      );
    });

    it('should throw error when child age is 18 or over', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 1, childrenAges: [18] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Age must be 17 or under'
      );
    });

    it('should throw error when total occupancy exceeds 9 per room', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 5, children: 5, childrenAges: [1, 2, 3, 4, 5] }],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Maximum 9 guests per room'
      );
    });

    it('should accept valid multi-room configuration with children', async () => {
      const validMultiRoomCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [
          { adults: 2, children: 2, childrenAges: [5, 8] },
          { adults: 1, children: 1, childrenAges: [3] },
          { adults: 3, children: 0, childrenAges: [] },
        ],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      const result = await hotelSearchService.search(validMultiRoomCriteria);

      expect(result.hotels).toHaveLength(1);
      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          PaxRooms: [
            { Adults: 2, Children: 2, ChildrenAges: [5, 8] },
            { Adults: 1, Children: 1, ChildrenAges: [3] },
            { Adults: 3, Children: 0, ChildrenAges: [] },
          ],
        })
      );
    });

    it('should accept child age of 0 (infant)', async () => {
      const validCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 1, childrenAges: [0] }],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await expect(hotelSearchService.search(validCriteria)).resolves.toBeDefined();
    });

    it('should accept child age of 17', async () => {
      const validCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 1, childrenAges: [17] }],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await expect(hotelSearchService.search(validCriteria)).resolves.toBeDefined();
    });

    it('should accept maximum valid configuration (9 rooms)', async () => {
      const validCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: Array(9).fill({ adults: 2, children: 0, childrenAges: [] }),
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await expect(hotelSearchService.search(validCriteria)).resolves.toBeDefined();
    });

    it('should accept maximum valid occupancy per room (9 guests)', async () => {
      const validCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 5, children: 4, childrenAges: [1, 2, 3, 4] }],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await expect(hotelSearchService.search(validCriteria)).resolves.toBeDefined();
    });

    it('should provide clear error message with room number for multi-room validation', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [
          { adults: 2, children: 1, childrenAges: [5] }, // Valid
          { adults: 0, children: 2, childrenAges: [3, 7] }, // Invalid - no adults
        ],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Room 2: Each room must have at least one adult'
      );
    });

    it('should provide clear error message with child number for age validation', async () => {
      const invalidCriteria: HotelSearchCriteria = {
        checkIn: tomorrow,
        checkOut: nextWeek,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [
          { adults: 2, children: 3, childrenAges: [5, 20, 8] }, // Second child age invalid
        ],
      };

      await expect(hotelSearchService.search(invalidCriteria)).rejects.toThrow(
        'Room 1, Child 2: Age must be 17 or under'
      );
    });
  });

  describe('error handling and mock fallback', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const validCriteria: HotelSearchCriteria = {
      checkIn: tomorrow,
      checkOut: nextWeek,
      cityCode: 'NYC',
      guestNationality: 'US',
      paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
    };

    it('should return mock data when API fails', async () => {
      // Requirement 1.5: Mock fallback for API failures
      mockSearchHotels.mockRejectedValue(new Error('Network error'));

      const result = await hotelSearchService.search(validCriteria);

      expect(result.isMockData).toBe(true);
      expect(result.hotels.length).toBeGreaterThan(0);
      expect(result.hotels[0].bookingCode).toMatch(/^MOCK-HOTEL-/);
    });

    it('should return mock data when API returns error status', async () => {
      const mockResponse: HotelSearchResponse = {
        Status: 0,
        Message: 'API Error',
        Hotels: [],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      const result = await hotelSearchService.search(validCriteria);

      expect(result.isMockData).toBe(true);
      expect(result.hotels.length).toBeGreaterThan(0);
    });

    it('should generate diverse mock hotels', async () => {
      mockSearchHotels.mockRejectedValue(new Error('API unavailable'));

      const result = await hotelSearchService.search(validCriteria);

      // Verify diversity in mock data
      const starRatings = new Set(result.hotels.map(h => h.starRating));
      const mealTypes = new Set(result.hotels.map(h => h.mealType));
      
      expect(starRatings.size).toBeGreaterThan(1); // Multiple star ratings
      expect(mealTypes.size).toBeGreaterThan(1); // Multiple meal types
      
      // Verify all hotels have required fields
      result.hotels.forEach(hotel => {
        expect(hotel.bookingCode).toBeTruthy();
        expect(hotel.hotelName).toBeTruthy();
        expect(hotel.price.offeredPrice).toBeGreaterThan(0);
        expect(hotel.amenities.length).toBeGreaterThan(0);
      });
    });

    it('should create session even with mock data', async () => {
      mockSearchHotels.mockRejectedValue(new Error('API error'));

      await hotelSearchService.search(validCriteria);

      const session = hotelSearchService.getCurrentSearchSession();
      expect(session).not.toBeNull();
      expect(session?.results.isMockData).toBe(true);
    });
  });

  describe('session management', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const validCriteria: HotelSearchCriteria = {
      checkIn: tomorrow,
      checkOut: nextWeek,
      cityCode: 'NYC',
      guestNationality: 'US',
      paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
    };

    it('should return null when no session exists', () => {
      const session = hotelSearchService.getCurrentSearchSession();
      expect(session).toBeNull();
    });

    it('should update session on new search', async () => {
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Hotel One', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(validCriteria);
      const session1 = hotelSearchService.getCurrentSearchSession();

      // Perform another search
      await hotelSearchService.search({
        ...validCriteria,
        cityCode: 'LAX',
      });
      const session2 = hotelSearchService.getCurrentSearchSession();

      expect(session1?.sessionId).not.toBe(session2?.sessionId);
      expect(session2?.searchCriteria.cityCode).toBe('LAX');
    });

    it('should clear session', async () => {
      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(validCriteria);
      expect(hotelSearchService.getCurrentSearchSession()).not.toBeNull();

      hotelSearchService.clearSession();
      expect(hotelSearchService.getCurrentSearchSession()).toBeNull();
    });
  });

  describe('date formatting', () => {
    it('should format dates correctly for API', async () => {
      const checkIn = new Date('2026-12-25');
      const checkOut = new Date('2026-12-31');
      
      const criteria: HotelSearchCriteria = {
        checkIn,
        checkOut,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(criteria);

      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          CheckIn: '2026-12-25',
          CheckOut: '2026-12-31',
        })
      );
    });

    it('should handle single-digit months and days', async () => {
      const checkIn = new Date('2027-01-05');
      const checkOut = new Date('2027-02-09');
      
      const criteria: HotelSearchCriteria = {
        checkIn,
        checkOut,
        cityCode: 'NYC',
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const mockResponse: HotelSearchResponse = {
        Status: 1,
        Hotels: [createMockHotel('BC123', 'H001', 'Test Hotel', 4)],
      };

      mockSearchHotels.mockResolvedValue(mockResponse);

      await hotelSearchService.search(criteria);

      expect(mockSearchHotels).toHaveBeenCalledWith(
        expect.objectContaining({
          CheckIn: '2027-01-05',
          CheckOut: '2027-02-09',
        })
      );
    });
  });

  describe('filterResults', () => {
    // Requirement 1.3: Filter results client-side without additional API calls
    const mockHotels = [
      {
        bookingCode: 'BC001',
        hotelCode: 'H001',
        hotelName: 'Grand Plaza Hotel',
        starRating: 5,
        address: '123 Main St',
        contactNumber: '+1-555-1234',
        cityName: 'New York',
        countryName: 'United States',
        price: {
          currency: 'USD',
          roomPrice: 200,
          tax: 30,
          extraGuestCharge: 0,
          childCharge: 0,
          otherCharges: 0,
          discount: 10,
          publishedPrice: 230,
          offeredPrice: 220,
          agentCommission: 0,
          agentMarkUp: 0,
        },
        refundable: true,
        mealType: 'Breakfast Included',
        roomType: 'Deluxe Room',
        availableRooms: 3,
        amenities: ['WiFi', 'Pool', 'Gym'],
        hotelPicture: 'https://example.com/hotel1.jpg',
        hotelImages: [],
      },
      {
        bookingCode: 'BC002',
        hotelCode: 'H002',
        hotelName: 'Budget Inn',
        starRating: 3,
        address: '456 Side St',
        contactNumber: '+1-555-5678',
        cityName: 'Los Angeles',
        countryName: 'United States',
        price: {
          currency: 'USD',
          roomPrice: 80,
          tax: 12,
          extraGuestCharge: 0,
          childCharge: 0,
          otherCharges: 0,
          discount: 0,
          publishedPrice: 92,
          offeredPrice: 92,
          agentCommission: 0,
          agentMarkUp: 0,
        },
        refundable: false,
        mealType: 'Room Only',
        roomType: 'Standard Room',
        availableRooms: 5,
        amenities: ['WiFi', 'Parking'],
        hotelPicture: 'https://example.com/hotel2.jpg',
        hotelImages: [],
      },
      {
        bookingCode: 'BC003',
        hotelCode: 'H003',
        hotelName: 'Luxury Resort',
        starRating: 5,
        address: '789 Beach Rd',
        contactNumber: '+1-555-9999',
        cityName: 'Miami',
        countryName: 'United States',
        price: {
          currency: 'USD',
          roomPrice: 350,
          tax: 52.5,
          extraGuestCharge: 0,
          childCharge: 0,
          otherCharges: 0,
          discount: 20,
          publishedPrice: 402.5,
          offeredPrice: 382.5,
          agentCommission: 0,
          agentMarkUp: 0,
        },
        refundable: true,
        mealType: 'All Inclusive',
        roomType: 'Suite',
        availableRooms: 2,
        amenities: ['WiFi', 'Pool', 'Spa', 'Beach Access'],
        hotelPicture: 'https://example.com/hotel3.jpg',
        hotelImages: [],
      },
      {
        bookingCode: 'BC004',
        hotelCode: 'H004',
        hotelName: 'City Center Hotel',
        starRating: 4,
        address: '321 Downtown Ave',
        contactNumber: '+1-555-4321',
        cityName: 'Chicago',
        countryName: 'United States',
        price: {
          currency: 'USD',
          roomPrice: 150,
          tax: 22.5,
          extraGuestCharge: 0,
          childCharge: 0,
          otherCharges: 0,
          discount: 5,
          publishedPrice: 172.5,
          offeredPrice: 167.5,
          agentCommission: 0,
          agentMarkUp: 0,
        },
        refundable: true,
        mealType: 'Half Board',
        roomType: 'Deluxe Room',
        availableRooms: 4,
        amenities: ['WiFi', 'Gym', 'Restaurant'],
        hotelPicture: 'https://example.com/hotel4.jpg',
        hotelImages: [],
      },
    ];

    it('should return all results when no filters applied', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {});
      expect(filtered).toHaveLength(4);
      expect(filtered).toEqual(mockHotels);
    });

    it('should filter by refundable status', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        Refundable: true,
      });
      
      expect(filtered).toHaveLength(3);
      expect(filtered.every(h => h.refundable)).toBe(true);
      expect(filtered.map(h => h.hotelCode)).toEqual(['H001', 'H003', 'H004']);
    });

    it('should filter by non-refundable status', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        Refundable: false,
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H002');
      expect(filtered[0].refundable).toBe(false);
    });

    it('should filter by star rating', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        StarRating: 5,
      });
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(h => h.starRating === 5)).toBe(true);
      expect(filtered.map(h => h.hotelCode)).toEqual(['H001', 'H003']);
    });

    it('should filter by meal type - Room Only', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        MealType: 1, // Room Only
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H002');
      expect(filtered[0].mealType).toBe('Room Only');
    });

    it('should filter by meal type - Breakfast Included', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        MealType: 2, // Breakfast Included
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H001');
      expect(filtered[0].mealType).toBe('Breakfast Included');
    });

    it('should filter by meal type - Half Board', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        MealType: 3, // Half Board
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H004');
      expect(filtered[0].mealType).toBe('Half Board');
    });

    it('should filter by meal type - All Inclusive', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        MealType: 5, // All Inclusive
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H003');
      expect(filtered[0].mealType).toBe('All Inclusive');
    });

    it('should filter by hotel name (case-insensitive)', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        HotelName: 'hotel',
      });
      
      // Should match: Grand Plaza Hotel, City Center Hotel (not Budget Inn or Luxury Resort)
      expect(filtered).toHaveLength(2);
      expect(filtered.map(h => h.hotelCode)).toEqual(['H001', 'H004']);
    });

    it('should filter by hotel name (partial match)', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        HotelName: 'luxury',
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H003');
    });

    it('should filter by number of available rooms', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        NoOfRooms: 4,
      });
      
      // Should return hotels with >= 4 available rooms
      expect(filtered).toHaveLength(2);
      expect(filtered.map(h => h.hotelCode)).toEqual(['H002', 'H004']);
      expect(filtered.every(h => h.availableRooms >= 4)).toBe(true);
    });

    it('should combine multiple filters with AND logic', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        Refundable: true,
        StarRating: 5,
      });
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(h => h.refundable && h.starRating === 5)).toBe(true);
      expect(filtered.map(h => h.hotelCode)).toEqual(['H001', 'H003']);
    });

    it('should combine three filters with AND logic', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        Refundable: true,
        StarRating: 5,
        MealType: 5, // All Inclusive
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hotelCode).toBe('H003');
      expect(filtered[0].refundable).toBe(true);
      expect(filtered[0].starRating).toBe(5);
      expect(filtered[0].mealType).toBe('All Inclusive');
    });

    it('should return empty array when no hotels match filters', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        StarRating: 2, // No 2-star hotels in mock data
      });
      
      expect(filtered).toHaveLength(0);
    });

    it('should return empty array when combined filters match nothing', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        Refundable: false,
        StarRating: 5, // No non-refundable 5-star hotels
      });
      
      expect(filtered).toHaveLength(0);
    });

    it('should not make additional API calls during filtering', () => {
      // Clear any previous calls
      mockSearchHotels.mockClear();
      
      // Apply filters
      hotelSearchService.filterResults(mockHotels, {
        Refundable: true,
        StarRating: 5,
      });
      
      // Verify no API calls were made
      expect(mockSearchHotels).not.toHaveBeenCalled();
    });

    it('should handle empty hotel array', () => {
      const filtered = hotelSearchService.filterResults([], {
        Refundable: true,
      });
      
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty filter name gracefully', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        HotelName: '',
      });
      
      // Empty string should return all results
      expect(filtered).toHaveLength(4);
    });

    it('should handle whitespace-only filter name gracefully', () => {
      const filtered = hotelSearchService.filterResults(mockHotels, {
        HotelName: '   ',
      });
      
      // Whitespace-only should return all results
      expect(filtered).toHaveLength(4);
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function createMockHotel(
  bookingCode: string,
  hotelCode: string,
  hotelName: string,
  starRating: number
): Hotel {
  return {
    BookingCode: bookingCode,
    HotelCode: hotelCode,
    HotelName: hotelName,
    StarRating: starRating,
    HotelAddress: '123 Test St',
    HotelContactNo: '+1-555-0000',
    CityName: 'Test City',
    CountryName: 'Test Country',
    Price: {
      CurrencyCode: 'USD',
      RoomPrice: 150,
      Tax: 22.5,
      ExtraGuestCharge: 0,
      ChildCharge: 0,
      OtherCharges: 0,
      Discount: 0,
      PublishedPrice: 172.5,
      OfferedPrice: 172.5,
      AgentCommission: 0,
      AgentMarkUp: 0,
    },
    Refundable: true,
    MealType: 'Breakfast Included',
    RoomType: 'Standard Room',
    AvailableRooms: 2,
    Amenities: ['WiFi', 'Pool'],
    HotelPicture: 'https://example.com/hotel.jpg',
    HotelImages: [],
  };
}
