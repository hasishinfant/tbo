/**
 * Layover Utilities
 * 
 * Utilities for calculating and formatting layover durations between flight segments.
 * 
 * Requirements: 2.3 - Calculate layover duration between segments
 */

import type { FlightSegment } from '../services/flightSearchService';

/**
 * Calculate layover duration between two consecutive flight segments
 * 
 * @param currentSegment - The current flight segment
 * @param nextSegment - The next flight segment
 * @returns Layover duration in minutes, or undefined if no layover
 * 
 * Requirement 2.3: Calculate layover duration between segments
 */
export function calculateLayoverDuration(
  currentSegment: FlightSegment,
  nextSegment: FlightSegment
): number | undefined {
  if (!nextSegment) {
    return undefined;
  }

  const arrivalTime = new Date(currentSegment.arrivalTime);
  const nextDepartureTime = new Date(nextSegment.departureTime);

  // Calculate difference in milliseconds and convert to minutes
  const layoverMs = nextDepartureTime.getTime() - arrivalTime.getTime();
  const layoverMinutes = Math.floor(layoverMs / 60000);

  // Return undefined for negative layovers (shouldn't happen in valid data)
  return layoverMinutes >= 0 ? layoverMinutes : undefined;
}

/**
 * Calculate layover durations for all segments in a flight
 * 
 * @param segments - Array of flight segments
 * @returns Array of segments with layoverDuration populated
 * 
 * Requirement 2.3: Add layover information to flight details display
 */
export function calculateLayoversForSegments(
  segments: FlightSegment[]
): FlightSegment[] {
  return segments.map((segment, index) => {
    const nextSegment = segments[index + 1];
    const layoverDuration = nextSegment
      ? calculateLayoverDuration(segment, nextSegment)
      : undefined;

    return {
      ...segment,
      layoverDuration,
    };
  });
}

/**
 * Format layover duration for display
 * 
 * @param minutes - Layover duration in minutes
 * @returns Formatted string (e.g., "2h 30m", "45m", "1h")
 */
export function formatLayoverDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Check if layover duration is within acceptable range
 * 
 * @param minutes - Layover duration in minutes
 * @param minLayover - Minimum acceptable layover (default: 45 minutes)
 * @param maxLayover - Maximum acceptable layover (default: 24 hours)
 * @returns Object with validity status and reason
 */
export function validateLayoverDuration(
  minutes: number,
  minLayover: number = 45,
  maxLayover: number = 1440
): { valid: boolean; reason?: string } {
  if (minutes < minLayover) {
    return {
      valid: false,
      reason: `Layover too short (${formatLayoverDuration(minutes)}). Minimum recommended: ${formatLayoverDuration(minLayover)}.`,
    };
  }

  if (minutes > maxLayover) {
    return {
      valid: false,
      reason: `Layover too long (${formatLayoverDuration(minutes)}). Maximum recommended: ${formatLayoverDuration(maxLayover)}.`,
    };
  }

  return { valid: true };
}

/**
 * Get total layover time for a flight with multiple segments
 * 
 * @param segments - Array of flight segments
 * @returns Total layover time in minutes
 */
export function getTotalLayoverTime(segments: FlightSegment[]): number {
  return segments.reduce((total, segment) => {
    return total + (segment.layoverDuration || 0);
  }, 0);
}
