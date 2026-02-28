/**
 * Hotel Details Modal Component Tests
 * 
 * Tests for HotelDetailsModal component:
 * - Modal display and closing
 * - Hotel details loading
 * - Image gallery navigation
 * - Policy display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import HotelDetailsModal from './HotelDetailsModal';
import type { HotelResult } from '../../services/hotelSearchService';
import type { HotelDetail } from '../../types/tboHotelApi';

// Mock hotel details service
const mockGetHotelDetails = vi.fn();

vi.mock('../../services/hotelDetailsService', () => ({
  getHotelDetailsService: () => ({
    getHotelDetails: mockGetHotelDetails,
  }),
}));

describe('HotelDetailsModal', () => {
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
    hotelImages: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  };

  const mockHotelDetails: HotelDetail = {
    HotelCode: 'HTL001',
    HotelName: 'Test Hotel',
    StarRating: 4,
    Description: 'A wonderful hotel in the heart of the city.',
    HotelFacilities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant'],
    Attractions: [
      { Key: 'Central Park', Value: '0.5 km' },
      { Key: 'Museum', Value: '1 km' },
    ],
    HotelPolicy: {
      CheckInTime: '3:00 PM',
      CheckOutTime: '11:00 AM',
      CancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    },
    Images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg', 'https://example.com/img3.jpg'],
    Address: '123 Test St',
    PinCode: '12345',
    CityName: 'Test City',
    CountryName: 'Test Country',
    PhoneNumber: '+1-555-1234',
    FaxNumber: '+1-555-5678',
    Map: {
      Latitude: 40.7128,
      Longitude: -74.0060,
    },
  };

  beforeEach(() => {
    mockGetHotelDetails.mockReset();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <HotelDetailsModal hotel={mockHotel} isOpen={false} onClose={() => {}} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    const onClose = vi.fn();
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    const onClose = vi.fn();
    
    const { container } = render(
      <HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={onClose} />
    );
    
    const overlay = container.querySelector('.hotel-details-modal-overlay');
    fireEvent.click(overlay!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('loads hotel details when modal opens', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(mockGetHotelDetails).toHaveBeenCalledWith('HTL001');
    });
  });

  it('displays loading state while fetching details', () => {
    mockGetHotelDetails.mockImplementation(() => new Promise(() => {}));
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();
  });

  it('displays hotel details after loading', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('A wonderful hotel in the heart of the city.')).toBeInTheDocument();
    });
  });

  it('displays error message when loading fails', async () => {
    mockGetHotelDetails.mockRejectedValue(new Error('API Error'));
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load hotel details. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays hotel amenities', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Spa')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
    });
  });

  it('displays hotel policies', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('3:00 PM')).toBeInTheDocument();
      expect(screen.getByText('11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Free cancellation up to 24 hours before check-in.')).toBeInTheDocument();
    });
  });

  it('displays nearby attractions', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Central Park')).toBeInTheDocument();
      expect(screen.getByText('0.5 km')).toBeInTheDocument();
    });
  });

  it('navigates through image gallery', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByAltText('Test Hotel')).toHaveAttribute('src', 'https://example.com/img1.jpg');
    });
    
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByAltText('Test Hotel')).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });
    
    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(screen.getByAltText('Test Hotel')).toHaveAttribute('src', 'https://example.com/img1.jpg');
    });
  });

  it('displays room details', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Room Details')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('Breakfast Included')).toBeInTheDocument();
    expect(screen.getByText('Free Cancellation')).toBeInTheDocument();
  });

  it('displays pricing information', () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText(/USD 115\.00/)).toBeInTheDocument(); // Original price
    expect(screen.getByText('105.00')).toBeInTheDocument(); // Offered price
  });

  it('calls onBookNow when Book Now button is clicked', () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    const onBookNow = vi.fn();
    
    render(
      <HotelDetailsModal
        hotel={mockHotel}
        isOpen={true}
        onClose={() => {}}
        onBookNow={onBookNow}
      />
    );
    
    const bookButton = screen.getByText('Book Now');
    fireEvent.click(bookButton);
    
    expect(onBookNow).toHaveBeenCalledWith(mockHotel);
  });

  it('displays location coordinates', async () => {
    mockGetHotelDetails.mockResolvedValue(mockHotelDetails);
    
    render(<HotelDetailsModal hotel={mockHotel} isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument();
    });
    
    const mapInfo = screen.getByText(/Coordinates:/);
    expect(mapInfo).toBeInTheDocument();
  });
});
