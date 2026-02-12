import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItineraryTimeline from './ItineraryTimeline';
import type { ItineraryDay } from '@/types/itinerary';

// Mock the DayCard component since we're testing the timeline structure
jest.mock('./DayCard', () => {
  return function MockDayCard({ day }: { day: ItineraryDay }) {
    return (
      <div data-testid={`day-card-${day.dayNumber}`}>
        Day {day.dayNumber} - {day.date.toDateString()}
      </div>
    );
  };
});

describe('ItineraryTimeline', () => {
  const mockItinerary: ItineraryDay[] = [
    {
      dayNumber: 1,
      date: new Date('2024-01-15'),
      places: [
        {
          name: 'Test Place 1',
          description: 'A test place',
          estimatedTime: '2 hours',
          category: 'attraction'
        }
      ],
      foodRecommendations: [
        {
          name: 'Test Restaurant',
          type: 'Italian',
          description: 'Great pasta',
          priceRange: '$$'
        }
      ],
      travelTips: ['Bring comfortable shoes']
    },
    {
      dayNumber: 2,
      date: new Date('2024-01-16'),
      places: [
        {
          name: 'Test Place 2',
          description: 'Another test place',
          estimatedTime: '3 hours',
          category: 'museum'
        }
      ],
      foodRecommendations: [],
      travelTips: ['Check opening hours']
    }
  ];

  it('renders timeline container with correct class', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);
    
    const timeline = screen.getByRole('generic');
    expect(timeline).toHaveClass('itinerary-timeline');
  });

  it('renders all day cards in the itinerary', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);
    
    expect(screen.getByTestId('day-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('day-card-2')).toBeInTheDocument();
  });

  it('renders day cards in correct order', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);
    
    const dayCards = screen.getAllByTestId(/day-card-/);
    expect(dayCards).toHaveLength(2);
    expect(dayCards[0]).toHaveTextContent('Day 1');
    expect(dayCards[1]).toHaveTextContent('Day 2');
  });

  it('handles empty itinerary gracefully', () => {
    render(<ItineraryTimeline itinerary={[]} />);
    
    const timeline = screen.getByRole('generic');
    expect(timeline).toHaveClass('itinerary-timeline');
    expect(timeline).toBeEmptyDOMElement();
  });

  it('passes correct day data to each DayCard', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);
    
    expect(screen.getByTestId('day-card-1')).toHaveTextContent('Mon Jan 15 2024');
    expect(screen.getByTestId('day-card-2')).toHaveTextContent('Tue Jan 16 2024');
  });
});