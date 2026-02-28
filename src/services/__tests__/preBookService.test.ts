/**
 * Unit Tests for Pre-Booking Service
 * 
 * Tests the pre-booking service functionality including:
 * - Price change detection
 * - Room unavailability handling
 * - API error handling
 * - Cancellation policy changes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PreBookResponse } from '../../types/tboHotelApi';

// Mock the API client before importing the service
vi.mock('../api/tboHotelApiClient', () => {
  const mockPreBook = vi.fn();
  return {
    getTboHotelApiClient: vi.fn(() => ({
      preBook: mockPreBook,
    })),
    mockPreBook, // Export for test access
  };
});

// Import service after mocking
import { preBookService } from '../preBookService';
import { getTboHotelApiClient } from '../api/tboHotelApiClient';

// Get the mock function
const mockPreBook = (getTboHotelApiClient() as any).preBook;

describe('PreBookService', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('preBook', () => {
    it('should detect no price change when price remains the same', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: bookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result).toEqual({
        bookingCode: 'BOOK123456',
        originalPrice: 5000,
        currentPrice: 5000,
        priceChanged: false,
        priceIncrease: 0,
        available: true,
        currency: 'INR',
        cancellationPolicyChanged: false,
      });

      expect(mockPreBook).toHaveBeenCalledWith({
        BookingCode: bookingCode,
        PaymentMode: 'Limit',
      });
    });

    it('should detect price increase', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: 'BOOK123456-NEW',
        IsPriceChanged: true,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5500,
            OfferedPrice: 5500,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result).toEqual({
        bookingCode: 'BOOK123456-NEW',
        originalPrice: 5000,
        currentPrice: 5500,
        priceChanged: true,
        priceIncrease: 500,
        available: true,
        currency: 'INR',
        cancellationPolicyChanged: false,
      });
    });

    it('should detect price decrease', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: 'BOOK123456-NEW',
        IsPriceChanged: true,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 4500,
            OfferedPrice: 4500,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result).toEqual({
        bookingCode: 'BOOK123456-NEW',
        originalPrice: 5000,
        currentPrice: 4500,
        priceChanged: true,
        priceIncrease: -500,
        available: true,
        currency: 'INR',
        cancellationPolicyChanged: false,
      });
    });

    it('should detect cancellation policy changes', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: 'BOOK123456-NEW',
        IsPriceChanged: false,
        IsCancellationPolicyChanged: true,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result.cancellationPolicyChanged).toBe(true);
      expect(result.available).toBe(true);
    });

    it('should handle room unavailability with status 0', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: bookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 0,
        Message: 'Room is not available',
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result).toEqual({
        bookingCode: 'BOOK123456',
        originalPrice: 5000,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'INR',
        cancellationPolicyChanged: false,
      });
    });

    it('should handle room unavailability with status 2', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: bookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 2,
        Message: 'Room sold out',
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result.available).toBe(false);
    });

    it('should handle room unavailability error message', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      mockPreBook.mockRejectedValue(
        new Error('Room is not available')
      );

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result).toEqual({
        bookingCode: 'BOOK123456',
        originalPrice: 5000,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'INR',
        cancellationPolicyChanged: false,
      });
    });

    it('should handle "sold out" error message', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      mockPreBook.mockRejectedValue(
        new Error('Room sold out')
      );

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result.available).toBe(false);
    });

    it('should handle "unavailable" error message', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      mockPreBook.mockRejectedValue(
        new Error('Room unavailable')
      );

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result.available).toBe(false);
    });

    it('should use custom payment mode when provided', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;
      const paymentMode = 'CreditCard';

      const mockResponse: PreBookResponse = {
        BookingCode: bookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      await preBookService.preBook(bookingCode, originalPrice, paymentMode);

      // Assert
      expect(mockPreBook).toHaveBeenCalledWith({
        BookingCode: bookingCode,
        PaymentMode: 'CreditCard',
      });
    });

    it('should return new booking code from response', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;
      const newBookingCode = 'BOOK123456-UPDATED';

      const mockResponse: PreBookResponse = {
        BookingCode: newBookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 1,
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act
      const result = await preBookService.preBook(bookingCode, originalPrice);

      // Assert
      expect(result.bookingCode).toBe(newBookingCode);
    });

    it('should handle network errors', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      mockPreBook.mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(
        preBookService.preBook(bookingCode, originalPrice)
      ).rejects.toThrow('Network error');
    });

    it('should handle API error with generic message', async () => {
      // Arrange
      const bookingCode = 'BOOK123456';
      const originalPrice = 5000;

      const mockResponse: PreBookResponse = {
        BookingCode: bookingCode,
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        Status: 0,
        Message: 'Invalid booking code',
        HotelDetails: {
          HotelName: 'Test Hotel',
          Price: {
            CurrencyCode: 'INR',
            PublishedPrice: 5000,
            OfferedPrice: 5000,
          },
        },
      };

      mockPreBook.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        preBookService.preBook(bookingCode, originalPrice)
      ).rejects.toThrow('Pre-booking failed: Invalid booking code');
    });
  });
});
