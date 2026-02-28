/**
 * Unit Tests for Ancillary Service
 * 
 * Tests the ancillary service functionality including:
 * - Fetching ancillary services (baggage and meals)
 * - Parsing baggage options with weight limits and prices
 * - Parsing meal options with dietary information
 * - Adding ancillary services and calculating total cost
 * - Validation of ancillary selections
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AncillaryResponse } from '../../types/tekTravelsApi';

// Mock the API client module with a factory function
vi.mock('../../services/api/tekTravelsApiClient', () => {
  const mockGetAncillaryServices = vi.fn();
  return {
    getTekTravelsApiClient: () => ({
      getAncillaryServices: mockGetAncillaryServices,
    }),
    // Export the mock so we can access it in tests
    __mockGetAncillaryServices: mockGetAncillaryServices,
  };
});

// Import service and mock after setting up the mock
import { getAncillaryService, resetAncillaryService } from '../../services/ancillaryService';
import * as apiClientModule from '../../services/api/tekTravelsApiClient';

// Get the mock function
const mockGetAncillaryServices = (apiClientModule as any).__mockGetAncillaryServices;

describe('AncillaryService', () => {
  let ancillaryService: ReturnType<typeof getAncillaryService>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Reset service instance
    resetAncillaryService();
    // Get fresh instance
    ancillaryService = getAncillaryService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAncillaryServices', () => {
    it('should fetch and parse baggage and meal options successfully', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [
            {
              WayType: 1,
              Code: 'BAG-15KG',
              Description: '15 kg Extra Baggage',
              Weight: 15,
              Currency: 'INR',
              Price: 1500,
              Origin: 'DEL',
              Destination: 'BOM',
            },
            {
              WayType: 1,
              Code: 'BAG-20KG',
              Description: '20 kg Extra Baggage',
              Weight: 20,
              Currency: 'INR',
              Price: 2000,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-VEG',
              Description: 'VEG - Vegetarian Meal',
              AirlineDescription: 'Delicious vegetarian meal',
              Quantity: 1,
              Currency: 'INR',
              Price: 300,
              Origin: 'DEL',
              Destination: 'BOM',
            },
            {
              WayType: 1,
              Code: 'MEAL-NVEG',
              Description: 'NVEG - Non-Vegetarian Meal with Chicken',
              AirlineDescription: 'Chicken meal',
              Quantity: 1,
              Currency: 'INR',
              Price: 350,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(mockGetAncillaryServices).toHaveBeenCalledWith({
        EndUserIp: '127.0.0.1',
        TraceId: 'test-trace-id',
        ResultIndex: 'test-result-index',
      });

      expect(result.baggage).toHaveLength(2);
      expect(result.baggage[0]).toEqual({
        code: 'BAG-15KG',
        description: '15 kg Extra Baggage',
        weight: 15,
        unit: 'kg',
        price: 1500,
        currency: 'INR',
        origin: 'DEL',
        destination: 'BOM',
        wayType: 1,
      });

      expect(result.meals).toHaveLength(2);
      expect(result.meals[0]).toEqual({
        code: 'MEAL-VEG',
        name: 'Vegetarian Meal',
        description: 'VEG - Vegetarian Meal',
        dietaryInfo: ['Vegetarian'],
        price: 300,
        currency: 'INR',
        origin: 'DEL',
        destination: 'BOM',
        quantity: 1,
        wayType: 1,
      });
    });

    it('should handle empty baggage and meal arrays', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.baggage).toHaveLength(0);
      expect(result.meals).toHaveLength(0);
    });

    it('should extract weight unit correctly from baggage description', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [
            {
              WayType: 1,
              Code: 'BAG-LBS',
              Description: '30 lbs Extra Baggage',
              Weight: 30,
              Currency: 'USD',
              Price: 50,
              Origin: 'JFK',
              Destination: 'LAX',
            },
          ],
          MealDynamic: [],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.baggage[0].unit).toBe('lbs');
    });

    it('should extract dietary information from meal descriptions', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-VEGAN',
              Description: 'VEGAN - Vegan Meal',
              AirlineDescription: 'Gluten-free vegan meal',
              Quantity: 1,
              Currency: 'INR',
              Price: 400,
              Origin: 'DEL',
              Destination: 'BOM',
            },
            {
              WayType: 1,
              Code: 'MEAL-HALAL',
              Description: 'HALAL - Halal Meal',
              AirlineDescription: 'Halal certified',
              Quantity: 1,
              Currency: 'INR',
              Price: 350,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.meals[0].dietaryInfo).toContain('Vegan');
      expect(result.meals[0].dietaryInfo).toContain('Gluten-Free');
      expect(result.meals[1].dietaryInfo).toContain('Halal');
    });

    it('should throw error when API returns error', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [],
          Error: {
            ErrorCode: 'ERR_001',
            ErrorMessage: 'Invalid TraceId',
          },
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        ancillaryService.getAncillaryServices('invalid-trace-id', 'test-result-index')
      ).rejects.toThrow('Ancillary services API error: Invalid TraceId');
    });

    it('should handle API client errors', async () => {
      // Arrange
      mockGetAncillaryServices.mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(
        ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index')
      ).rejects.toThrow('Network error');
    });
  });

  describe('addAncillaryServices', () => {
    beforeEach(() => {
      // Mock getAncillaryServices for cost calculation
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [
            {
              WayType: 1,
              Code: 'BAG-15KG',
              Description: '15 kg Extra Baggage',
              Weight: 15,
              Currency: 'INR',
              Price: 1500,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-VEG',
              Description: 'VEG - Vegetarian Meal',
              AirlineDescription: 'Delicious vegetarian meal',
              Quantity: 1,
              Currency: 'INR',
              Price: 300,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);
    });

    it('should add ancillary services and calculate total cost', async () => {
      // Arrange
      const selections = [
        { passengerIndex: 0, type: 'baggage' as const, code: 'BAG-15KG' },
        { passengerIndex: 0, type: 'meal' as const, code: 'MEAL-VEG' },
      ];

      // Act
      const result = await ancillaryService.addAncillaryServices(
        'test-trace-id',
        'test-result-index',
        selections
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.addedServices).toEqual(selections);
      expect(result.totalCost).toBe(1800); // 1500 + 300
    });

    it('should calculate cost for multiple passengers', async () => {
      // Arrange
      const selections = [
        { passengerIndex: 0, type: 'baggage' as const, code: 'BAG-15KG' },
        { passengerIndex: 1, type: 'baggage' as const, code: 'BAG-15KG' },
        { passengerIndex: 0, type: 'meal' as const, code: 'MEAL-VEG' },
        { passengerIndex: 1, type: 'meal' as const, code: 'MEAL-VEG' },
      ];

      // Act
      const result = await ancillaryService.addAncillaryServices(
        'test-trace-id',
        'test-result-index',
        selections
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(3600); // (1500 + 300) * 2
    });

    it('should handle selections with unknown codes gracefully', async () => {
      // Arrange
      const selections = [
        { passengerIndex: 0, type: 'baggage' as const, code: 'BAG-UNKNOWN' },
      ];

      // Act
      const result = await ancillaryService.addAncillaryServices(
        'test-trace-id',
        'test-result-index',
        selections
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(0); // Unknown code, no cost added
    });

    it('should throw error for empty selections', async () => {
      // Arrange
      const selections: any[] = [];

      // Act & Assert
      await expect(
        ancillaryService.addAncillaryServices('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('No ancillary selections provided');
    });

    it('should throw error for invalid passenger index', async () => {
      // Arrange
      const selections = [
        { passengerIndex: -1, type: 'baggage' as const, code: 'BAG-15KG' },
      ];

      // Act & Assert
      await expect(
        ancillaryService.addAncillaryServices('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid passenger index: -1');
    });

    it('should throw error for invalid ancillary type', async () => {
      // Arrange
      const selections = [
        { passengerIndex: 0, type: 'invalid' as any, code: 'BAG-15KG' },
      ];

      // Act & Assert
      await expect(
        ancillaryService.addAncillaryServices('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid ancillary type: invalid');
    });

    it('should throw error for empty ancillary code', async () => {
      // Arrange
      const selections = [
        { passengerIndex: 0, type: 'baggage' as const, code: '' },
      ];

      // Act & Assert
      await expect(
        ancillaryService.addAncillaryServices('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid ancillary code: empty or undefined');
    });
  });

  describe('Edge Cases', () => {
    it('should handle baggage with pounds in description', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [
            {
              WayType: 1,
              Code: 'BAG-POUNDS',
              Description: '50 pounds Extra Baggage',
              Weight: 50,
              Currency: 'USD',
              Price: 75,
              Origin: 'JFK',
              Destination: 'LAX',
            },
          ],
          MealDynamic: [],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.baggage[0].unit).toBe('lbs');
    });

    it('should extract meal name from description with hyphen', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-001',
              Description: 'MEAL001 - Chicken Biryani',
              AirlineDescription: 'Spicy chicken biryani',
              Quantity: 1,
              Currency: 'INR',
              Price: 400,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.meals[0].name).toBe('Chicken Biryani');
    });

    it('should handle meal description without hyphen', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-002',
              Description: 'Vegetarian Pasta',
              AirlineDescription: 'Italian pasta',
              Quantity: 1,
              Currency: 'INR',
              Price: 350,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.meals[0].name).toBe('Vegetarian Pasta');
    });

    it('should detect multiple dietary tags in meal', async () => {
      // Arrange
      const mockResponse: AncillaryResponse = {
        Response: {
          TraceId: 'test-trace-id',
          Baggage: [],
          MealDynamic: [
            {
              WayType: 1,
              Code: 'MEAL-SPECIAL',
              Description: 'SPECIAL - Vegan Gluten-Free Meal',
              AirlineDescription: 'Dairy-free and nut-free',
              Quantity: 1,
              Currency: 'INR',
              Price: 500,
              Origin: 'DEL',
              Destination: 'BOM',
            },
          ],
        },
      };

      mockGetAncillaryServices.mockResolvedValue(mockResponse);

      // Act
      const result = await ancillaryService.getAncillaryServices('test-trace-id', 'test-result-index');

      // Assert
      expect(result.meals[0].dietaryInfo).toContain('Vegan');
      expect(result.meals[0].dietaryInfo).toContain('Gluten-Free');
      expect(result.meals[0].dietaryInfo).toContain('Dairy-Free');
      expect(result.meals[0].dietaryInfo).toContain('Nut-Free');
    });
  });
});
