/**
 * Unit Tests for Flight Segment Display Component
 * 
 * Tests the display of flight segments with layover information.
 * 
 * Requirements: 2.3 - Add layover information to flight details display
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlightSegmentDisplay } from './FlightSegmentDisplay';
import type { FlightSegment } from '../../services/flightSearchService';

describe('FlightSegmentDisplay', () => {
  const mockSegments: FlightSegment[] = [
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
      layoverDuration: 150, // 2.5 hours
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
  ];

  it('should render flight segments', () => {
    render(<FlightSegmentDisplay segments={mockSegments} />);

    // Check that airline and flight numbers are displayed
    expect(screen.getByText(/IndiGo 6E-123/)).toBeInTheDocument();
    expect(screen.getByText(/IndiGo 6E-456/)).toBeInTheDocument();

    // Check that airport codes are displayed (use getAllByText for codes that appear multiple times)
    expect(screen.getByText('DEL')).toBeInTheDocument();
    expect(screen.getAllByText('BOM')).toHaveLength(2); // BOM appears twice (destination and origin)
    expect(screen.getByText('BLR')).toBeInTheDocument();
  });

  it('should display layover information for connecting flights', () => {
    render(<FlightSegmentDisplay segments={mockSegments} />);

    // Check that layover duration is displayed
    expect(screen.getByText(/Layover:/)).toBeInTheDocument();
    expect(screen.getByText(/2h 30m/)).toBeInTheDocument();

    // Check that layover location is displayed
    expect(screen.getByText(/at BOM/)).toBeInTheDocument();
  });

  it('should not display layover for the last segment', () => {
    render(<FlightSegmentDisplay segments={mockSegments} />);

    // There should only be one layover info (for the first segment)
    const layoverElements = screen.getAllByText(/Layover:/);
    expect(layoverElements).toHaveLength(1);
  });

  it('should display layover warnings when enabled', () => {
    const shortLayoverSegments: FlightSegment[] = [
      {
        ...mockSegments[0],
        layoverDuration: 30, // Short layover
      },
      mockSegments[1],
    ];

    render(<FlightSegmentDisplay segments={shortLayoverSegments} showLayoverWarnings={true} />);

    // Check for short layover warning
    expect(screen.getByText(/Short layover - may be tight for connections/)).toBeInTheDocument();
  });

  it('should display long layover warnings when enabled', () => {
    const longLayoverSegments: FlightSegment[] = [
      {
        ...mockSegments[0],
        layoverDuration: 400, // Long layover (6+ hours)
      },
      mockSegments[1],
    ];

    render(<FlightSegmentDisplay segments={longLayoverSegments} showLayoverWarnings={true} />);

    // Check for long layover warning
    expect(screen.getByText(/Long layover - consider airport amenities/)).toBeInTheDocument();
  });

  it('should not display warnings when showLayoverWarnings is false', () => {
    const shortLayoverSegments: FlightSegment[] = [
      {
        ...mockSegments[0],
        layoverDuration: 30, // Short layover
      },
      mockSegments[1],
    ];

    render(<FlightSegmentDisplay segments={shortLayoverSegments} showLayoverWarnings={false} />);

    // Warning should not be displayed
    expect(screen.queryByText(/Short layover/)).not.toBeInTheDocument();
  });

  it('should display baggage information', () => {
    render(<FlightSegmentDisplay segments={mockSegments} />);

    // Check that baggage info is displayed
    expect(screen.getAllByText(/Baggage:/)).toHaveLength(2);
    expect(screen.getAllByText(/15 Kg/)).toHaveLength(2);
    expect(screen.getAllByText(/Cabin:/)).toHaveLength(2);
    expect(screen.getAllByText(/7 Kg/)).toHaveLength(2);
  });

  it('should display aircraft information', () => {
    render(<FlightSegmentDisplay segments={mockSegments} />);

    // Check that aircraft type is displayed
    const aircraftElements = screen.getAllByText('A320');
    expect(aircraftElements).toHaveLength(2);
  });

  it('should handle single segment flights (no layovers)', () => {
    const singleSegment: FlightSegment[] = [mockSegments[0]];
    delete singleSegment[0].layoverDuration;

    render(<FlightSegmentDisplay segments={singleSegment} />);

    // Check that segment is displayed
    expect(screen.getByText(/IndiGo 6E-123/)).toBeInTheDocument();

    // Check that no layover info is displayed
    expect(screen.queryByText(/Layover:/)).not.toBeInTheDocument();
  });

  it('should handle empty segments array', () => {
    const { container } = render(<FlightSegmentDisplay segments={[]} />);

    // Component should render without errors
    expect(container.querySelector('.flight-segment-display')).toBeInTheDocument();
  });
});
