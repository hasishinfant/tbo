import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DayCard from './DayCard';
import type { ItineraryDay } from '@/types/itinerary';

// Mock the dateUtils
jest.mock('@/utils/dateUtils', () => ({
  dateUtils: {
    formatDate: (date: Date) => date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}));

describe('DayCard', () => {
  const mockDay: ItineraryDay = {
    dayNumber: 1,
    date: new Date('2024-01-15'),
    places: [
      {
        name: 'Central Park',
        description: 'Beautiful park in Manhattan',
        estimatedTime: '2 hours',
        category: 'Park'
      },
      {
        name: 'Metropolitan Museum',
        description: 'World-class art museum',
        estimatedTime: '3 hours',
        category: 'Museum'
      }
    ],
    foodRecommendations: [
      {
        name: 'Joe\'s Pizza',
        type: 'Italian',
        description: 'Best pizza in NYC',
        priceRange: '$'
      }
    ],
    travelTips: [
      'Wear comfortable walking shoes',
      'Bring a water bottle'
    ]
  };

  it('renders day header with correct information', () => {
    render(<DayCard day={mockDay} />);
    
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Mon, Jan 15')).toBeInTheDocument();
  });

  it('renders expand/collapse toggle', () => {
    render(<DayCard day={mockDay} />);
    
    const expandIcon = screen.getByText('▼');
    expect(expandIcon).toBeInTheDocument();
    expect(expandIcon).toHaveClass('expand-icon', 'expanded');
  });

  it('toggles content visibility when header is clicked', () => {
    render(<DayCard day={mockDay} />);
    
    // Content should be visible initially
    expect(screen.getByText('Places to Visit')).toBeInTheDocument();
    
    // Click header to collapse
    const header = screen.getByRole('generic', { name: /day-header/i });
    fireEvent.click(header);
    
    // Content should be hidden
    expect(screen.queryByText('Places to Visit')).not.toBeInTheDocument();
    
    // Icon should not have expanded class
    const expandIcon = screen.getByText('▼');
    expect(expandIcon).not.toHaveClass('expanded');
  });

  it('renders all places with correct information', () => {
    render(<DayCard day={mockDay} />);
    
    expect(screen.getByText('Central Park')).toBeInTheDocument();
    expect(screen.getByText('Beautiful park in Manhattan')).toBeInTheDocument();
    expect(screen.getByText('⏱️ 2 hours')).toBeInTheDocument();
    expect(screen.getByText('Park')).toBeInTheDocument();
    
    expect(screen.getByText('Metropolitan Museum')).toBeInTheDocument();
    expect(screen.getByText('World-class art museum')).toBeInTheDocument();
    expect(screen.getByText('⏱️ 3 hours')).toBeInTheDocument();
    expect(screen.getByText('Museum')).toBeInTheDocument();
  });

  it('renders food recommendations with correct information', () => {
    render(<DayCard day={mockDay} />);
    
    expect(screen.getByText('Food Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Joe\'s Pizza')).toBeInTheDocument();
    expect(screen.getByText('Best pizza in NYC')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders travel tips', () => {
    render(<DayCard day={mockDay} />);
    
    expect(screen.getByText('Travel Tips')).toBeInTheDocument();
    expect(screen.getByText('Wear comfortable walking shoes')).toBeInTheDocument();
    expect(screen.getByText('Bring a water bottle')).toBeInTheDocument();
  });

  it('handles day with no places gracefully', () => {
    const dayWithoutPlaces = { ...mockDay, places: [] };
    render(<DayCard day={dayWithoutPlaces} />);
    
    expect(screen.queryByText('Places to Visit')).not.toBeInTheDocument();
    expect(screen.getByText('Food Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Travel Tips')).toBeInTheDocument();
  });

  it('handles day with no food recommendations gracefully', () => {
    const dayWithoutFood = { ...mockDay, foodRecommendations: [] };
    render(<DayCard day={dayWithoutFood} />);
    
    expect(screen.getByText('Places to Visit')).toBeInTheDocument();
    expect(screen.queryByText('Food Recommendations')).not.toBeInTheDocument();
    expect(screen.getByText('Travel Tips')).toBeInTheDocument();
  });

  it('handles day with no travel tips gracefully', () => {
    const dayWithoutTips = { ...mockDay, travelTips: [] };
    render(<DayCard day={dayWithoutTips} />);
    
    expect(screen.getByText('Places to Visit')).toBeInTheDocument();
    expect(screen.getByText('Food Recommendations')).toBeInTheDocument();
    expect(screen.queryByText('Travel Tips')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<DayCard day={mockDay} />);
    
    const dayCard = screen.getByRole('generic').closest('.day-card');
    expect(dayCard).toHaveClass('day-card');
    
    const dayHeader = screen.getByText('Day 1').closest('.day-header');
    expect(dayHeader).toHaveClass('day-header');
    
    const dayContent = screen.getByText('Places to Visit').closest('.day-content');
    expect(dayContent).toHaveClass('day-content');
  });
});