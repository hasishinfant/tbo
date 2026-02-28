/**
 * Hotel Search Results Component Tests
 * 
 * Tests for HotelSearchResults component:
 * - Results display
 * - Filter application
 * - Mock mode indication
 * - Empty results handling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import HotelSearchResults from './HotelSearchResults';
import type { HotelSearchResult, HotelResult } from '../../services/hotelSearchService';

// Mock hotel search service
vi.mock('../../services/hotelSearchService', () => ({
  getHotelSearchService: () => ({
    filterResults: vi.fn((hotels, filters) => {
      let filtered = [...hotels];
      
      if (filters.StarRating !== undefined) {
        filtered = filtered.filter(h => h.starRating === filters.StarRating);
      }
      
      if (filters.Refundable !== undefined) {
        filtered = filtered.filter(h => h.refundable === filters.Refundable);
      }
      
      return filtered;
    }),
  }),
}));

describe('HotelSearchResults', () => {
  const mockHotel: HotelResult = {
    bookingCode: 'TEST-123',
    hotelCode: 'HTL001',
    hotelName: 'Test Hotel',
    starRating: 4,
    address: '123 Test St',
    contactNumber: '+1-555-1234',
    cityName: 'Test City',
    countryName: 'Test Country',
    price: {
      currency: 'USD',
      roomPrice: 100,
      tax: 15,
      extraGuestCharge: 0,
      childCharge: 0,
      otherCharges: 0,
      discount: 10,
      publishedPrice: 115,
      offeredPrice: 105,
      agentCommission: 0,
      agentMarkUp: 0,
    },
    refundable: true,
    mealType: 'Breakfast Included',
    roomType: 'Deluxe Room',
    availableRooms: 5,
    amenities: ['WiFi', 'Pool', 'Gym'],
    hotelPicture: 'https://example.com/hotel.jpg',
    hotelImages: [],
  };

  const mockSearchResult: HotelSearchResult = {
    hotels: [mockHotel],
    searchCriteria: {
      checkIn: new Date('2024-06-01'),
      checkOut: new Date('2024-06-05'),
      cityCode: 'NYC',
      guestNationality: 'US',
      paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
    },
    totalResults: 1,
    isMockData: false,
  };

  it('renders hotel search results', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    expect(screen.getByText('1 Hotel Found')).toBeInTheDocument();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });

  it('displays mock mode banner when using mock data', () => {
    const mockDataResult = { ...mockSearchResult, isMockData: true };
    
    render(<HotelSearchResults searchResult={mockDataResult} />);
    
    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing sample hotel data/i)).toBeInTheDocument();
  });

  it('does not display mock mode banner for real data', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    expect(screen.queryByText(/Demo Mode/i)).not.toBeInTheDocument();
  });

  it('displays hotel details correctly', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText(/123 Test St, Test City/)).toBeInTheDocument();
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('🍽️ Breakfast Included')).toBeInTheDocument();
    expect(screen.getByText('105.00')).toBeInTheDocument();
  });

  it('displays refundable badge for refundable hotels', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    expect(screen.getByText('Free Cancellation')).toBeInTheDocument();
  });

  it('applies star rating filter', () => {
    const multiHotelResult: HotelSearchResult = {
      ...mockSearchResult,
      hotels: [
        mockHotel,
        { ...mockHotel, bookingCode: 'TEST-456', hotelName: 'Five Star Hotel', starRating: 5 },
      ],
      totalResults: 2,
    };
    
    render(<HotelSearchResults searchResult={multiHotelResult} />);
    
    expect(screen.getByText('2 Hotels Found')).toBeInTheDocument();
    
    const starFilter = screen.getByLabelText('Star Rating');
    fireEvent.change(starFilter, { target: { value: '5' } });
    
    expect(screen.getByText('1 Hotel Found')).toBeInTheDocument();
    expect(screen.getByText('Five Star Hotel')).toBeInTheDocument();
  });

  it('applies refundable filter', () => {
    const multiHotelResult: HotelSearchResult = {
      ...mockSearchResult,
      hotels: [
        mockHotel,
        { ...mockHotel, bookingCode: 'TEST-789', hotelName: 'Non-Refundable Hotel', refundable: false },
      ],
      totalResults: 2,
    };
    
    render(<HotelSearchResults searchResult={multiHotelResult} />);
    
    const refundableFilter = screen.getByLabelText('Cancellation');
    fireEvent.change(refundableFilter, { target: { value: 'true' } });
    
    expect(screen.getByText('1 Hotel Found')).toBeInTheDocument();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });

  it('shows clear filters button when filters are active', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
    
    const starFilter = screen.getByLabelText('Star Rating');
    fireEvent.change(starFilter, { target: { value: '4' } });
    
    expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', () => {
    render(<HotelSearchResults searchResult={mockSearchResult} />);
    
    const starFilter = screen.getByLabelText('Star Rating') as HTMLSelectElement;
    fireEvent.change(starFilter, { target: { value: '4' } });
    
    expect(starFilter.value).toBe('4');
    
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    expect(starFilter.value).toBe('');
  });

  it('displays no results message when no hotels match filters', () => {
    render(<HotelSearchResults searchResult={{ ...mockSearchResult, hotels: [] }} />);
    
    expect(screen.getByText('No Hotels Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or search criteria')).toBeInTheDocument();
  });

  it('sorts hotels by price', () => {
    const multiHotelResult: HotelSearchResult = {
      ...mockSearchResult,
      hotels: [
        { ...mockHotel, bookingCode: 'TEST-1', hotelName: 'Expensive Hotel', price: { ...mockHotel.price, offeredPrice: 200 } },
        { ...mockHotel, bookingCode: 'TEST-2', hotelName: 'Cheap Hotel', price: { ...mockHotel.price, offeredPrice: 50 } },
      ],
      totalResults: 2,
    };
    
    render(<HotelSearchResults searchResult={multiHotelResult} />);
    
    const hotelNames = screen.getAllByRole('heading', { level: 3 });
    expect(hotelNames[0]).toHaveTextContent('Cheap Hotel');
    expect(hotelNames[1]).toHaveTextContent('Expensive Hotel');
  });

  it('calls onHotelSelect when View Details is clicked', () => {
    const onHotelSelect = vi.fn();
    
    render(<HotelSearchResults searchResult={mockSearchResult} onHotelSelect={onHotelSelect} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(onHotelSelect).toHaveBeenCalledWith(mockHotel);
  });

  it('displays availability warning for low room count', () => {
    const lowAvailabilityHotel = { ...mockHotel, availableRooms: 2 };
    const result = { ...mockSearchResult, hotels: [lowAvailabilityHotel] };
    
    render(<HotelSearchResults searchResult={result} />);
    
    expect(screen.getByText('Only 2 rooms left!')).toBeInTheDocument();
  });

  it('displays amenities with more indicator', () => {
    const manyAmenitiesHotel = {
      ...mockHotel,
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar'],
    };
    const result = { ...mockSearchResult, hotels: [manyAmenitiesHotel] };
    
    render(<HotelSearchResults searchResult={result} />);
    
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});
