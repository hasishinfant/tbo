/**
 * Unit Tests for Re-Pricing Service
 * 
 * Tests the repricing service functionality including:
 * - Price change detection
 * - Flight unavailability handling
 * - API error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { repricingService } from '../repricingService';
import { getTekTravelsApiClient } from '../api/tekTravelsApiClient';
import type { RepricingResponse } from '../../types/tekTravelsApi';

// Mock the API client
vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: vi.fn(),
}));

describe('RepricingService', () => {
  let mockApiClient: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock API client
    mockApiClient = {
      repriceFlight: vi.fn(),
    };

    // Setup getTekTravelsApiClient to return mock
    (getTekTravelsApiClient as any).mockReturnValue(mockApiClient);
  });

  describe('repriceFlight', () => {
    it('should detect no price change when price remains the same', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: {
            IsLCC: false,
            ResultIndex: resultIndex,
            Source: 1,
            IsPriceChanged: false,
            IsTimeChanged: false,
            Fare: {
              Currency: 'INR',
              BaseFare: 4500,
              Tax: 500,
              PublishedFare: 5000,
              OfferedFare: 5000,
            },
          },
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result).toEqual({
        originalPrice: 5000,
        currentPrice: 5000,
        priceChanged: false,
        priceIncrease: 0,
        available: true,
        currency: 'INR',
        isTimeChanged: false,
      });

      expect(mockApiClient.repriceFlight).toHaveBeenCalledWith({
        EndUserIp: '127.0.0.1',
        TraceId: traceId,
        ResultIndex: resultIndex,
      });
    });

    it('should detect price increase', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: {
            IsLCC: false,
            ResultIndex: resultIndex,
            Source: 1,
            IsPriceChanged: true,
            IsTimeChanged: false,
            Fare: {
              Currency: 'INR',
              BaseFare: 5000,
              Tax: 500,
              PublishedFare: 5500,
              OfferedFare: 5500,
            },
          },
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result).toEqual({
        originalPrice: 5000,
        currentPrice: 5500,
        priceChanged: true,
        priceIncrease: 500,
        available: true,
        currency: 'INR',
        isTimeChanged: false,
      });
    });

    it('should detect price decrease', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: {
            IsLCC: false,
            ResultIndex: resultIndex,
            Source: 1,
            IsPriceChanged: true,
            IsTimeChanged: false,
            Fare: {
              Currency: 'INR',
              BaseFare: 4000,
              Tax: 500,
              PublishedFare: 4500,
              OfferedFare: 4500,
            },
          },
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result).toEqual({
        originalPrice: 5000,
        currentPrice: 4500,
        priceChanged: true,
        priceIncrease: -500,
        available: true,
        currency: 'INR',
        isTimeChanged: false,
      });
    });

    it('should handle flight unavailability when results are null', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: null as any,
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result).toEqual({
        originalPrice: 5000,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'INR',
        isTimeChanged: false,
      });
    });

    it('should handle API error response', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: null as any,
          Error: {
            ErrorCode: 'FLIGHT_NOT_AVAILABLE',
            ErrorMessage: 'Flight is no longer available',
          },
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        repricingService.repriceFlight(traceId, resultIndex, originalPrice)
      ).rejects.toThrow('Re-pricing failed: Flight is no longer available (FLIGHT_NOT_AVAILABLE)');
    });

    it('should handle flight unavailability error message', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      mockApiClient.repriceFlight.mockRejectedValue(
        new Error('Flight is not available')
      );

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result).toEqual({
        originalPrice: 5000,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'INR',
        isTimeChanged: false,
      });
    });

    it('should detect time changes', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      const mockResponse: RepricingResponse = {
        Response: {
          TraceId: traceId,
          Results: {
            IsLCC: false,
            ResultIndex: resultIndex,
            Source: 1,
            IsPriceChanged: false,
            IsTimeChanged: true,
            Fare: {
              Currency: 'INR',
              BaseFare: 4500,
              Tax: 500,
              PublishedFare: 5000,
              OfferedFare: 5000,
            },
          },
        },
      };

      mockApiClient.repriceFlight.mockResolvedValue(mockResponse);

      // Act
      const result = await repricingService.repriceFlight(traceId, resultIndex, originalPrice);

      // Assert
      expect(result.isTimeChanged).toBe(true);
      expect(result.available).toBe(true);
    });

    it('should handle network errors', async () => {
      // Arrange
      const traceId = 'test-trace-123';
      const resultIndex = 'result-456';
      const originalPrice = 5000;

      mockApiClient.repriceFlight.mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(
        repricingService.repriceFlight(traceId, resultIndex, originalPrice)
      ).rejects.toThrow('Network error');
    });
  });
});
