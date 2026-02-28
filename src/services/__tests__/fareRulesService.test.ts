/**
 * Unit Tests for Fare Rules Service
 * 
 * Tests the fare rules service functionality including:
 * - API integration
 * - Fare rules parsing
 * - Caching behavior
 * - Mock fallback integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFareRulesService,
  resetFareRulesService,
  setFareRulesServiceApiClient,
  type FareRules,
  type BaggageAllowance,
} from '../fareRulesService';
import { getTekTravelsApiClient } from '../api/tekTravelsApiClient';
import { mockFallbackHandler } from '../mockFallbackHandler';
import type { FareRulesResponse, FareRuleDetail } from '../../types/tekTravelsApi';

// Mock dependencies
vi.mock('../api/tekTravelsApiClient');
vi.mock('../mockFallbackHandler', () => ({
  mockFallbackHandler: {
    isMockMode: vi.fn(),
    isApiAvailable: vi.fn(),
    setMockMode: vi.fn(),
    getMockFareRules: vi.fn(),
  },
}));

describe('FareRulesService', () => {
  let fareRulesService: ReturnType<typeof getFareRulesService>;
  let mockApiClient: any;

  beforeEach(() => {
    // Reset service instance
    resetFareRulesService();
    
    // Setup mock API client
    mockApiClient = {
      getFareRules: vi.fn(),
    };
    vi.mocked(getTekTravelsApiClient).mockReturnValue(mockApiClient);
    
    // Get service instance and inject mock client
    fareRulesService = getFareRulesService();
    setFareRulesServiceApiClient(mockApiClient);

    // Reset mock fallback handler
    vi.mocked(mockFallbackHandler.isMockMode).mockReturnValue(false);
    vi.mocked(mockFallbackHandler.isApiAvailable).mockResolvedValue(true);
    vi.mocked(mockFallbackHandler.setMockMode).mockClear();
    vi.mocked(mockFallbackHandler.getMockFareRules).mockClear();
  });

  describe('getFareRules', () => {
    it('should retrieve fare rules from API successfully', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Cancellation charges: INR 3000 per passenger. Refundable fare.',
              FareRestriction: 'Non-transferable. Name change not allowed.',
            },
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Baggage allowance: 15 kg checked baggage, 7 kg cabin baggage.',
              FareRestriction: 'Advance booking required.',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(mockApiClient.getFareRules).toHaveBeenCalledWith({
        EndUserIp: '127.0.0.1',
        TraceId: traceId,
        ResultIndex: resultIndex,
      });
      
      expect(result).toBeDefined();
      expect(result.refundable).toBe(true);
      expect(result.baggageAllowance.checkedBagWeight).toBe(15);
      expect(result.baggageAllowance.carryOnWeight).toBe(7);
      expect(result.restrictions).toContain('Non-transferable. Name change not allowed.');
    });

    it('should parse cancellation policy correctly', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Cancellation allowed up to 24 hours before departure with INR 2500 fee.',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.cancellationPolicy).toContain('Cancellation');
      expect(result.cancellationPolicy).toContain('24 hours');
    });

    it('should extract change fee from fare rules', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Date change allowed with INR 3,500 change fee per passenger.',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.changeFee).toBe(3500);
    });

    it('should identify non-refundable fares', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'This is a non-refundable fare. No refund allowed.',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.refundable).toBe(false);
    });

    it('should parse baggage allowance with multiple pieces', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Baggage: 2 pieces of 23 kg each checked baggage, 1 piece of 7 kg cabin baggage.',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.baggageAllowance.checkedBags).toBe(2);
      expect(result.baggageAllowance.checkedBagWeight).toBe(23);
      expect(result.baggageAllowance.carryOnBags).toBe(1);
      expect(result.baggageAllowance.carryOnWeight).toBe(7);
    });

    it('should handle baggage allowance in pounds', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Baggage allowance: 50 lbs checked, 15 lbs carry-on.',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.baggageAllowance.unit).toBe('lbs');
      expect(result.baggageAllowance.checkedBagWeight).toBe(50);
      expect(result.baggageAllowance.carryOnWeight).toBe(15);
    });

    it('should cache fare rules for session duration', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test fare rules',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act - First call
      const result1 = await fareRulesService.getFareRules(traceId, resultIndex);
      
      // Act - Second call (should use cache)
      const result2 = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(mockApiClient.getFareRules).toHaveBeenCalledTimes(1); // Only called once
      expect(result1).toEqual(result2);
    });

    it('should return cached fare rules without API call', () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      // Act - Before caching
      const result1 = fareRulesService.getCachedFareRules(traceId, resultIndex);

      // Assert
      expect(result1).toBeNull();
    });

    it('should handle API errors and fallback to mock data', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockFareRulesResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Cancellation: INR 1000 fee applies. Date change: INR 1000 fee applies.',
              FareRestriction: 'Mock restriction',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockRejectedValue(new Error('API error'));
      vi.mocked(mockFallbackHandler.isApiAvailable).mockResolvedValue(false);
      vi.mocked(mockFallbackHandler.getMockFareRules).mockReturnValue(mockFareRulesResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(mockFallbackHandler.setMockMode).toHaveBeenCalledWith(true);
      expect(mockFallbackHandler.getMockFareRules).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.changeFee).toBe(1000);
      expect(result.restrictions).toContain('Mock restriction');
    });

    it('should use mock data when already in mock mode', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockFareRulesResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Cancellation: INR 1000 fee applies. Date change: INR 1000 fee applies.',
              FareRestriction: 'Mock restriction',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockRejectedValue(new Error('API error'));
      vi.mocked(mockFallbackHandler.isMockMode).mockReturnValue(true);
      vi.mocked(mockFallbackHandler.getMockFareRules).mockReturnValue(mockFareRulesResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(mockFallbackHandler.getMockFareRules).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.changeFee).toBe(1000);
    });

    it('should throw error when API fails and mock fallback unavailable', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      mockApiClient.getFareRules.mockRejectedValue(new Error('API error'));
      vi.mocked(mockFallbackHandler.isMockMode).mockReturnValue(false);
      vi.mocked(mockFallbackHandler.isApiAvailable).mockResolvedValue(true);
      mockFallbackHandler.isApiAvailable.mockResolvedValue(true);

      // Act & Assert
      await expect(
        fareRulesService.getFareRules(traceId, resultIndex)
      ).rejects.toThrow('API error');
    });

    it('should handle API response with error object', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [],
          Error: {
            ErrorCode: 'ERR_001',
            ErrorMessage: 'Invalid TraceId',
          },
        },
      };

      const mockFareRulesResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Mock policy',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);
      vi.mocked(mockFallbackHandler.isApiAvailable).mockResolvedValue(false);
      vi.mocked(mockFallbackHandler.getMockFareRules).mockReturnValue(mockFareRulesResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(mockFallbackHandler.setMockMode).toHaveBeenCalledWith(true);
      expect(result).toBeDefined();
    });
  });

  describe('clearCache', () => {
    it('should clear the fare rules cache', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test fare rules',
              FareRestriction: '',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act - Cache some data
      await fareRulesService.getFareRules(traceId, resultIndex);
      
      // Clear cache
      fareRulesService.clearCache();
      
      // Try to get cached data
      const cachedResult = fareRulesService.getCachedFareRules(traceId, resultIndex);

      // Assert
      expect(cachedResult).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty fare rules array', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result).toBeDefined();
      expect(result.cancellationPolicy).toBe('No cancellation policy available');
      expect(result.changeFee).toBe(0);
      expect(result.restrictions).toEqual([]);
    });

    it('should handle fare rules with HTML tags in restrictions', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test fare rules',
              FareRestriction: '<p>Non-transferable</p><br/>Name change not allowed',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.restrictions.length).toBeGreaterThan(0);
      const restriction = result.restrictions[0];
      expect(restriction).not.toContain('<p>');
      expect(restriction).not.toContain('</p>');
      expect(restriction).toContain('Non-transferable');
    });

    it('should handle multiple restrictions without duplicates', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      
      const mockResponse: FareRulesResponse = {
        Response: {
          TraceId: traceId,
          FareRules: [
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test 1',
              FareRestriction: 'Non-transferable',
            },
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test 2',
              FareRestriction: 'Non-transferable',
            },
            {
              Origin: 'DEL',
              Destination: 'BOM',
              Airline: '6E',
              FareBasisCode: 'SAVER',
              FareRuleDetail: 'Test 3',
              FareRestriction: 'Advance booking required',
            },
          ],
        },
      };

      mockApiClient.getFareRules.mockResolvedValue(mockResponse);

      // Act
      const result = await fareRulesService.getFareRules(traceId, resultIndex);

      // Assert
      expect(result.restrictions).toHaveLength(2);
      expect(result.restrictions).toContain('Non-transferable');
      expect(result.restrictions).toContain('Advance booking required');
    });
  });
});
