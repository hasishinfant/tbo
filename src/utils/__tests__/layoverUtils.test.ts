/**
 * Unit Tests for Layover Utilities
 * 
 * Tests layover calculation, formatting, and validation functions.
 * 
 * Requirements: 2.3 - Calculate layover duration between segments
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLayoverDuration,
  calculateLayoversForSegments,
  formatLayoverDuration,
  validateLayoverDuration,
  getTotalLayoverTime,
} from '../layoverUtils';
import type { FlightSegment } from '../../services/flightSearchService';

describe('layoverUtils', () => {
  describe('calculateLayoverDuration', () => {
    it('should calculate layover duration between two segments', () => {
      const currentSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-123',
        origin: 'DEL',
        originAirport: 'Indira Gandhi International Airport',
        destination: 'BOM',
        destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        departureTime: new Date('2024-01-15T10:00:00Z'),
        arrivalTime: new Date('2024-01-15T12:00:00Z'),
        duration: 120,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const nextSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-456',
        origin: 'BOM',
        originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        destination: 'BLR',
        destinationAirport: 'Kempegowda International Airport',
        departureTime: new Date('2024-01-15T14:30:00Z'),
        arrivalTime: new Date('2024-01-15T16:00:00Z'),
        duration: 90,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const layover = calculateLayoverDuration(currentSegment, nextSegment);
      expect(layover).toBe(150); // 2.5 hours = 150 minutes
    });

    it('should return undefined when there is no next segment', () => {
      const currentSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-123',
        origin: 'DEL',
        originAirport: 'Indira Gandhi International Airport',
        destination: 'BOM',
        destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        departureTime: new Date('2024-01-15T10:00:00Z'),
        arrivalTime: new Date('2024-01-15T12:00:00Z'),
        duration: 120,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const layover = calculateLayoverDuration(currentSegment, undefined as any);
      expect(layover).toBeUndefined();
    });

    it('should handle short layovers (less than 1 hour)', () => {
      const currentSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-123',
        origin: 'DEL',
        originAirport: 'Indira Gandhi International Airport',
        destination: 'BOM',
        destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        departureTime: new Date('2024-01-15T10:00:00Z'),
        arrivalTime: new Date('2024-01-15T12:00:00Z'),
        duration: 120,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const nextSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-456',
        origin: 'BOM',
        originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        destination: 'BLR',
        destinationAirport: 'Kempegowda International Airport',
        departureTime: new Date('2024-01-15T12:45:00Z'),
        arrivalTime: new Date('2024-01-15T14:15:00Z'),
        duration: 90,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const layover = calculateLayoverDuration(currentSegment, nextSegment);
      expect(layover).toBe(45); // 45 minutes
    });

    it('should handle long layovers (multiple hours)', () => {
      const currentSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-123',
        origin: 'DEL',
        originAirport: 'Indira Gandhi International Airport',
        destination: 'BOM',
        destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        departureTime: new Date('2024-01-15T10:00:00Z'),
        arrivalTime: new Date('2024-01-15T12:00:00Z'),
        duration: 120,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const nextSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-456',
        origin: 'BOM',
        originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        destination: 'BLR',
        destinationAirport: 'Kempegowda International Airport',
        departureTime: new Date('2024-01-15T18:00:00Z'),
        arrivalTime: new Date('2024-01-15T19:30:00Z'),
        duration: 90,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const layover = calculateLayoverDuration(currentSegment, nextSegment);
      expect(layover).toBe(360); // 6 hours = 360 minutes
    });

    it('should return undefined for negative layovers (invalid data)', () => {
      const currentSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-123',
        origin: 'DEL',
        originAirport: 'Indira Gandhi International Airport',
        destination: 'BOM',
        destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        departureTime: new Date('2024-01-15T10:00:00Z'),
        arrivalTime: new Date('2024-01-15T14:00:00Z'),
        duration: 240,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const nextSegment: FlightSegment = {
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-456',
        origin: 'BOM',
        originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
        destination: 'BLR',
        destinationAirport: 'Kempegowda International Airport',
        departureTime: new Date('2024-01-15T12:00:00Z'), // Before arrival time
        arrivalTime: new Date('2024-01-15T13:30:00Z'),
        duration: 90,
        aircraft: 'A320',
        baggage: '15 Kg',
        cabinBaggage: '7 Kg',
      };

      const layover = calculateLayoverDuration(currentSegment, nextSegment);
      expect(layover).toBeUndefined();
    });
  });

  describe('calculateLayoversForSegments', () => {
    it('should calculate layovers for all segments in a flight', () => {
      const segments: FlightSegment[] = [
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-123',
          origin: 'DEL',
          originAirport: 'Indira Gandhi International Airport',
          destination: 'BOM',
          destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          departureTime: new Date('2024-01-15T10:00:00Z'),
          arrivalTime: new Date('2024-01-15T12:00:00Z'),
          duration: 120,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-456',
          origin: 'BOM',
          originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          destination: 'BLR',
          destinationAirport: 'Kempegowda International Airport',
          departureTime: new Date('2024-01-15T14:30:00Z'),
          arrivalTime: new Date('2024-01-15T16:00:00Z'),
          duration: 90,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-789',
          origin: 'BLR',
          originAirport: 'Kempegowda International Airport',
          destination: 'MAA',
          destinationAirport: 'Chennai International Airport',
          departureTime: new Date('2024-01-15T17:00:00Z'),
          arrivalTime: new Date('2024-01-15T18:00:00Z'),
          duration: 60,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
      ];

      const result = calculateLayoversForSegments(segments);

      expect(result).toHaveLength(3);
      expect(result[0].layoverDuration).toBe(150); // 2.5 hours
      expect(result[1].layoverDuration).toBe(60); // 1 hour
      expect(result[2].layoverDuration).toBeUndefined(); // Last segment
    });

    it('should handle single segment flights (no layovers)', () => {
      const segments: FlightSegment[] = [
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-123',
          origin: 'DEL',
          originAirport: 'Indira Gandhi International Airport',
          destination: 'BOM',
          destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          departureTime: new Date('2024-01-15T10:00:00Z'),
          arrivalTime: new Date('2024-01-15T12:00:00Z'),
          duration: 120,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
      ];

      const result = calculateLayoversForSegments(segments);

      expect(result).toHaveLength(1);
      expect(result[0].layoverDuration).toBeUndefined();
    });

    it('should handle empty segment array', () => {
      const segments: FlightSegment[] = [];
      const result = calculateLayoversForSegments(segments);
      expect(result).toHaveLength(0);
    });
  });

  describe('formatLayoverDuration', () => {
    it('should format minutes only for durations less than 1 hour', () => {
      expect(formatLayoverDuration(30)).toBe('30m');
      expect(formatLayoverDuration(45)).toBe('45m');
      expect(formatLayoverDuration(59)).toBe('59m');
    });

    it('should format hours only for exact hour durations', () => {
      expect(formatLayoverDuration(60)).toBe('1h');
      expect(formatLayoverDuration(120)).toBe('2h');
      expect(formatLayoverDuration(180)).toBe('3h');
    });

    it('should format hours and minutes for mixed durations', () => {
      expect(formatLayoverDuration(90)).toBe('1h 30m');
      expect(formatLayoverDuration(150)).toBe('2h 30m');
      expect(formatLayoverDuration(195)).toBe('3h 15m');
    });

    it('should handle edge cases', () => {
      expect(formatLayoverDuration(0)).toBe('0m');
      expect(formatLayoverDuration(1)).toBe('1m');
      expect(formatLayoverDuration(61)).toBe('1h 1m');
    });
  });

  describe('validateLayoverDuration', () => {
    it('should validate layovers within acceptable range', () => {
      const result = validateLayoverDuration(120); // 2 hours
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject layovers that are too short', () => {
      const result = validateLayoverDuration(30); // 30 minutes
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too short');
      expect(result.reason).toContain('30m');
    });

    it('should reject layovers that are too long', () => {
      const result = validateLayoverDuration(1500); // 25 hours
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too long');
      expect(result.reason).toContain('25h');
    });

    it('should accept layovers at minimum threshold', () => {
      const result = validateLayoverDuration(45); // Exactly 45 minutes
      expect(result.valid).toBe(true);
    });

    it('should accept layovers at maximum threshold', () => {
      const result = validateLayoverDuration(1440); // Exactly 24 hours
      expect(result.valid).toBe(true);
    });

    it('should allow custom minimum and maximum thresholds', () => {
      const result1 = validateLayoverDuration(30, 30, 120);
      expect(result1.valid).toBe(true);

      const result2 = validateLayoverDuration(150, 30, 120);
      expect(result2.valid).toBe(false);
      expect(result2.reason).toContain('too long');
    });
  });

  describe('getTotalLayoverTime', () => {
    it('should calculate total layover time for multiple segments', () => {
      const segments: FlightSegment[] = [
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-123',
          origin: 'DEL',
          originAirport: 'Indira Gandhi International Airport',
          destination: 'BOM',
          destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          departureTime: new Date('2024-01-15T10:00:00Z'),
          arrivalTime: new Date('2024-01-15T12:00:00Z'),
          duration: 120,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
          layoverDuration: 150,
        },
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-456',
          origin: 'BOM',
          originAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          destination: 'BLR',
          destinationAirport: 'Kempegowda International Airport',
          departureTime: new Date('2024-01-15T14:30:00Z'),
          arrivalTime: new Date('2024-01-15T16:00:00Z'),
          duration: 90,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
          layoverDuration: 60,
        },
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-789',
          origin: 'BLR',
          originAirport: 'Kempegowda International Airport',
          destination: 'MAA',
          destinationAirport: 'Chennai International Airport',
          departureTime: new Date('2024-01-15T17:00:00Z'),
          arrivalTime: new Date('2024-01-15T18:00:00Z'),
          duration: 60,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
      ];

      const total = getTotalLayoverTime(segments);
      expect(total).toBe(210); // 150 + 60 = 210 minutes (3.5 hours)
    });

    it('should return 0 for single segment flights', () => {
      const segments: FlightSegment[] = [
        {
          airline: 'IndiGo',
          airlineCode: '6E',
          flightNumber: '6E-123',
          origin: 'DEL',
          originAirport: 'Indira Gandhi International Airport',
          destination: 'BOM',
          destinationAirport: 'Chhatrapati Shivaji Maharaj International Airport',
          departureTime: new Date('2024-01-15T10:00:00Z'),
          arrivalTime: new Date('2024-01-15T12:00:00Z'),
          duration: 120,
          aircraft: 'A320',
          baggage: '15 Kg',
          cabinBaggage: '7 Kg',
        },
      ];

      const total = getTotalLayoverTime(segments);
      expect(total).toBe(0);
    });

    it('should return 0 for empty segment array', () => {
      const segments: FlightSegment[] = [];
      const total = getTotalLayoverTime(segments);
      expect(total).toBe(0);
    });
  });
});
