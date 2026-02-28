/**
 * Unit Tests for Flight Search Service
 * 
 * Tests flight search functionality including layover calculation integration.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 2.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flightSearchService } from '../flightSearchService';
import type { SearchCriteria, FlightResult } from '../flightSearchService';

describe('flightSearchService - Layover Calculation', () => {
  describe('transformSegments with layover calculation', () => {
    it('should calculate layover durations for connecting flights', async () => {
      // This test verifies Requirement 2.3: Calculate layover duration between segments
      
      // Use mock data to test the transformation logic
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'MAA',
        departureDate: new Date('2024-01-15'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
      };

      // Search with mock data (API will fallback to mock)
      const result = await flightSearchService.search(criteria);

      // Find a connecting flight (with stops > 0)
      const connectingFlight = result.flights.find(flight => flight.stops > 0);

      if (connectingFlight) {
        // Verify that segments have layover information
        expect(connectingFlight.segments.length).toBeGreaterThan(1);

        // Check that all segments except the last have layover duration
        for (let i = 0; i < connectingFlight.segments.length - 1; i++) {
          const segment = connectingFlight.segments[i];
          expect(segment.layoverDuration).toBeDefined();
          expect(typeof segment.layoverDuration).toBe('number');
          expect(segment.layoverDuration).toBeGreaterThanOrEqual(0);
        }

        // Last segment should not have layover duration
        const lastSegment = connectingFlight.segments[connectingFlight.segments.length - 1];
        expect(lastSegment.layoverDuration).toBeUndefined();
      }
    });

    it('should calculate correct layover duration between consecutive segments', async () => {
      // Requirement 2.3: Layover duration should equal the difference between 
      // arrival time of one segment and departure time of the next
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'BLR',
        departureDate: new Date('2024-01-15'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
      };

      const result = await flightSearchService.search(criteria);
      const connectingFlight = result.flights.find(flight => flight.stops > 0);

      if (connectingFlight && connectingFlight.segments.length >= 2) {
        const firstSegment = connectingFlight.segments[0];
        const secondSegment = connectingFlight.segments[1];

        // Calculate expected layover manually
        const arrivalTime = new Date(firstSegment.arrivalTime);
        const nextDepartureTime = new Date(secondSegment.departureTime);
        const expectedLayover = Math.floor(
          (nextDepartureTime.getTime() - arrivalTime.getTime()) / 60000
        );

        // Verify the calculated layover matches
        expect(firstSegment.layoverDuration).toBe(expectedLayover);
      }
    });

    it('should not have layover duration for direct flights', async () => {
      // Direct flights (stops = 0) should have only one segment with no layover
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'BOM',
        departureDate: new Date('2024-01-15'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
        directFlight: true,
      };

      const result = await flightSearchService.search(criteria);
      const directFlight = result.flights.find(flight => flight.stops === 0);

      if (directFlight) {
        expect(directFlight.segments.length).toBe(1);
        expect(directFlight.segments[0].layoverDuration).toBeUndefined();
      }
    });

    it('should include layover information in flight details display', async () => {
      // Requirement 2.3: Add layover information to flight details display
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'MAA',
        departureDate: new Date('2024-01-15'),
        adults: 2,
        children: 1,
        infants: 0,
        cabinClass: 'Economy',
      };

      const result = await flightSearchService.search(criteria);

      // Verify that all flights have segments with proper structure
      result.flights.forEach(flight => {
        expect(flight.segments).toBeDefined();
        expect(Array.isArray(flight.segments)).toBe(true);

        flight.segments.forEach((segment, index) => {
          // All segments should have required fields
          expect(segment.airline).toBeDefined();
          expect(segment.origin).toBeDefined();
          expect(segment.destination).toBeDefined();
          expect(segment.departureTime).toBeInstanceOf(Date);
          expect(segment.arrivalTime).toBeInstanceOf(Date);

          // All segments except the last should have layover duration if multi-segment
          if (index < flight.segments.length - 1) {
            expect(segment).toHaveProperty('layoverDuration');
          }
        });
      });
    });

    it('should handle multiple layovers in multi-stop flights', async () => {
      // Test flights with 2+ stops (3+ segments)
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'MAA',
        departureDate: new Date('2024-01-15'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
      };

      const result = await flightSearchService.search(criteria);
      const multiStopFlight = result.flights.find(flight => flight.stops >= 2);

      if (multiStopFlight) {
        expect(multiStopFlight.segments.length).toBeGreaterThanOrEqual(3);

        // Each segment except the last should have a layover
        const segmentsWithLayover = multiStopFlight.segments.filter(
          (seg, idx) => idx < multiStopFlight.segments.length - 1
        );

        segmentsWithLayover.forEach(segment => {
          expect(segment.layoverDuration).toBeDefined();
          expect(segment.layoverDuration).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('client-side filtering with layover data', () => {
    it('should preserve layover information after filtering', async () => {
      // Requirement 1.3: Filter results without losing layover data
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'BLR',
        departureDate: new Date('2024-01-15'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
      };

      const result = await flightSearchService.search(criteria);

      // Apply filters
      const filtered = flightSearchService.filterResults(result.flights, {
        maxStops: 1,
        priceRange: { min: 0, max: 10000 },
      });

      // Verify layover data is preserved
      const connectingFlight = filtered.find(flight => flight.stops > 0);
      if (connectingFlight) {
        connectingFlight.segments.forEach((segment, index) => {
          if (index < connectingFlight.segments.length - 1) {
            expect(segment.layoverDuration).toBeDefined();
          }
        });
      }
    });
  });

  describe('round-trip flights with layovers', () => {
    it('should calculate layovers for both outbound and return flights', async () => {
      // Requirement 1.7: Handle round-trip searches with layover calculation
      
      const criteria: SearchCriteria = {
        origin: 'DEL',
        destination: 'BLR',
        departureDate: new Date('2024-01-15'),
        returnDate: new Date('2024-01-20'),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'Economy',
      };

      const result = await flightSearchService.search(criteria);

      expect(result.isRoundTrip).toBe(true);
      expect(result.flights.length).toBeGreaterThan(0);

      // All flights should have proper layover calculation
      result.flights.forEach(flight => {
        if (flight.stops > 0) {
          flight.segments.forEach((segment, index) => {
            if (index < flight.segments.length - 1) {
              expect(segment.layoverDuration).toBeDefined();
              expect(typeof segment.layoverDuration).toBe('number');
            }
          });
        }
      });
    });
  });
});
