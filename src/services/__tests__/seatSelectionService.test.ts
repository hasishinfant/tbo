/**
 * Unit tests for Seat Selection Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SeatSelectionService,
  getSeatSelectionService,
  resetSeatSelectionService,
} from '../seatSelectionService';
import type {
  SeatMapResponse,
  SeatSellResponse,
  SeatInfo,
} from '../../types/tekTravelsApi';

// Mock the API client
vi.mock('../api/tekTravelsApiClient', () => ({
  getTekTravelsApiClient: vi.fn(() => ({
    getSeatMap: vi.fn(),
    sellSeats: vi.fn(),
  })),
}));

describe('SeatSelectionService', () => {
  let service: SeatSelectionService;
  let mockApiClient: any;

  beforeEach(() => {
    resetSeatSelectionService();
    service = getSeatSelectionService();
    
    // Get the mocked API client
    const { getTekTravelsApiClient } = require('../api/tekTravelsApiClient');
    mockApiClient = getTekTravelsApiClient();
  });

  describe('getSeatMap', () => {
    it('should fetch and transform seat map successfully', async () => {
      // Arrange
      const mockResponse: SeatMapResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatLayout: {
            SegmentSeat: [
              {
                SegmentIndex: 0,
                Seats: [
                  {
                    RowNo: 1,
                    SeatNo: '1A',
                    SeatType: 1, // Window
                    SeatWayType: 1, // Available
                    Compartment: 1, // Economy
                    Deck: 1,
                    Currency: 'USD',
                    Price: 0,
                  },
                  {
                    RowNo: 1,
                    SeatNo: '1B',
                    SeatType: 2, // Middle
                    SeatWayType: 1, // Available
                    Compartment: 1, // Economy
                    Deck: 1,
                    Currency: 'USD',
                    Price: 10,
                  },
                  {
                    RowNo: 1,
                    SeatNo: '1C',
                    SeatType: 3, // Aisle
                    SeatWayType: 2, // Blocked
                    Compartment: 1, // Economy
                    Deck: 1,
                    Currency: 'USD',
                    Price: 0,
                  },
                ],
              },
            ],
          },
        },
      };

      mockApiClient.getSeatMap.mockResolvedValue(mockResponse);

      // Act
      const result = await service.getSeatMap('test-trace-id', 'test-result-index');

      // Assert
      expect(result).toBeDefined();
      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].segmentIndex).toBe(0);
      expect(result.segments[0].rows).toHaveLength(1);
      expect(result.segments[0].rows[0].rowNumber).toBe(1);
      expect(result.segments[0].rows[0].seats).toHaveLength(3);

      // Check seat transformations
      const seats = result.segments[0].rows[0].seats;
      expect(seats[0].seatNumber).toBe('1A');
      expect(seats[0].seatType).toBe('Window');
      expect(seats[0].available).toBe(true);
      expect(seats[0].seatClass).toBe('Economy');
      expect(seats[0].price).toBe(0);

      expect(seats[1].seatNumber).toBe('1B');
      expect(seats[1].seatType).toBe('Middle');
      expect(seats[1].available).toBe(true);
      expect(seats[1].price).toBe(10);

      expect(seats[2].seatNumber).toBe('1C');
      expect(seats[2].seatType).toBe('Aisle');
      expect(seats[2].available).toBe(false); // Blocked
    });

    it('should categorize premium seats correctly', async () => {
      // Arrange
      const mockResponse: SeatMapResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatLayout: {
            SegmentSeat: [
              {
                SegmentIndex: 0,
                Seats: [
                  {
                    RowNo: 1,
                    SeatNo: '1A',
                    SeatType: 1,
                    SeatWayType: 1,
                    Compartment: 3, // Business
                    Deck: 1,
                    Currency: 'USD',
                    Price: 100,
                  },
                  {
                    RowNo: 2,
                    SeatNo: '2A',
                    SeatType: 1,
                    SeatWayType: 1,
                    Compartment: 4, // First
                    Deck: 1,
                    Currency: 'USD',
                    Price: 200,
                  },
                ],
              },
            ],
          },
        },
      };

      mockApiClient.getSeatMap.mockResolvedValue(mockResponse);

      // Act
      const result = await service.getSeatMap('test-trace-id', 'test-result-index');

      // Assert
      const businessSeat = result.segments[0].rows[0].seats[0];
      expect(businessSeat.seatClass).toBe('Business');
      expect(businessSeat.features).toContain('Lie-flat Seat');

      const firstSeat = result.segments[0].rows[1].seats[0];
      expect(firstSeat.seatClass).toBe('First');
      expect(firstSeat.features).toContain('Fully Flat Bed');
    });

    it('should throw error when API returns error', async () => {
      // Arrange
      const mockResponse: SeatMapResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatLayout: {
            SegmentSeat: [],
          },
          Error: {
            ErrorCode: 'SEAT_MAP_ERROR',
            ErrorMessage: 'Seat map not available',
          },
        },
      };

      mockApiClient.getSeatMap.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        service.getSeatMap('test-trace-id', 'test-result-index')
      ).rejects.toThrow('Seat map not available');
    });
  });

  describe('reserveSeats', () => {
    it('should reserve seats successfully', async () => {
      // Arrange
      const mockResponse: SeatSellResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatDynamic: [
            {
              SegmentIndex: 0,
              PassengerIndex: 0,
              SeatNo: '1A',
            },
          ],
          IsPriceChanged: false,
        },
      };

      mockApiClient.sellSeats.mockResolvedValue(mockResponse);

      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: 0,
          seatNumber: '1A',
        },
      ];

      // Act
      const result = await service.reserveSeats(
        'test-trace-id',
        'test-result-index',
        selections
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.reservedSeats).toEqual(selections);
      expect(result.priceChanged).toBe(false);
    });

    it('should validate seat selections before reservation', async () => {
      // Act & Assert - Empty selections
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', [])
      ).rejects.toThrow('No seat selections provided');
    });

    it('should detect duplicate seat selections', async () => {
      // Arrange
      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: 0,
          seatNumber: '1A',
        },
        {
          passengerIndex: 1,
          segmentIndex: 0,
          seatNumber: '1A', // Duplicate
        },
      ];

      // Act & Assert
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Duplicate seat selection');
    });

    it('should validate passenger indices', async () => {
      // Arrange
      const selections = [
        {
          passengerIndex: -1, // Invalid
          segmentIndex: 0,
          seatNumber: '1A',
        },
      ];

      // Act & Assert
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid passenger index');
    });

    it('should validate segment indices', async () => {
      // Arrange
      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: -1, // Invalid
          seatNumber: '1A',
        },
      ];

      // Act & Assert
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid segment index');
    });

    it('should validate seat numbers', async () => {
      // Arrange
      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: 0,
          seatNumber: '', // Invalid
        },
      ];

      // Act & Assert
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Invalid seat number');
    });

    it('should handle multiple passenger seat selections', async () => {
      // Arrange
      const mockResponse: SeatSellResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatDynamic: [
            {
              SegmentIndex: 0,
              PassengerIndex: 0,
              SeatNo: '1A',
            },
            {
              SegmentIndex: 0,
              PassengerIndex: 1,
              SeatNo: '1B',
            },
          ],
          IsPriceChanged: false,
        },
      };

      mockApiClient.sellSeats.mockResolvedValue(mockResponse);

      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: 0,
          seatNumber: '1A',
        },
        {
          passengerIndex: 1,
          segmentIndex: 0,
          seatNumber: '1B',
        },
      ];

      // Act
      const result = await service.reserveSeats(
        'test-trace-id',
        'test-result-index',
        selections
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.reservedSeats).toHaveLength(2);
      expect(result.reservedSeats).toEqual(selections);
    });

    it('should throw error when API returns error', async () => {
      // Arrange
      const mockResponse: SeatSellResponse = {
        Response: {
          TraceId: 'test-trace-id',
          SeatDynamic: [],
          IsPriceChanged: false,
          Error: {
            ErrorCode: 'SEAT_SELL_ERROR',
            ErrorMessage: 'Seat reservation failed',
          },
        },
      };

      mockApiClient.sellSeats.mockResolvedValue(mockResponse);

      const selections = [
        {
          passengerIndex: 0,
          segmentIndex: 0,
          seatNumber: '1A',
        },
      ];

      // Act & Assert
      await expect(
        service.reserveSeats('test-trace-id', 'test-result-index', selections)
      ).rejects.toThrow('Seat reservation failed');
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getSeatSelectionService();
      const instance2 = getSeatSelectionService();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getSeatSelectionService();
      resetSeatSelectionService();
      const instance2 = getSeatSelectionService();
      expect(instance1).not.toBe(instance2);
    });
  });
});
