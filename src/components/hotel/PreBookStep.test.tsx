/**
 * Pre-Book Step Component Tests
 * 
 * Tests price change handling, room unavailability, and user confirmation flow
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PreBookStep from './PreBookStep';
import { preBookService, PreBookResult } from '../../services/preBookService';
import { HotelBookingSession } from '../../services/hotelBookingService';
import type { Hotel } from '../../types/tboHotelApi';

// Mock the pre-book service
vi.mock('../../services/preBookService', () => ({
  preBookService: {
    preBook: vi.fn(),
  },
}));

describe('PreBookStep', () => {
  let mockSession: HotelBookingSession;
  let mockHotel: Hotel;
  let mockOnComplete: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHotel = {
      BookingCode: 'TEST123',
      HotelCode: 'HTL001',
      HotelName: 'Grand Plaza Hotel',
      StarRating: 5,
      HotelAddress: '456 Luxury Ave',
      HotelContactNo: '+1234567890',
      CityName: 'New York',
      CountryName: 'USA',
      Price: {
        CurrencyCode: 'USD',
        RoomPrice: 200,
        Tax: 20,
        ExtraGuestCharge: 0,
        ChildCharge: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedPrice: 220,
        OfferedPrice: 220,
        AgentCommission: 0,
        AgentMarkUp: 0,
      },
      Refundable: true,
      MealType: 'Breakfast Included',
      RoomType: 'Suite',
      AvailableRooms: 3,
      Amenities: ['WiFi', 'Pool', 'Gym'],
      HotelPicture: 'hotel.jpg',
      HotelImages: ['img1.jpg', 'img2.jpg'],
    };

    mockSession = {
      sessionId: 'session123',
      hotel: mockHotel,
      searchCriteria: {
        checkIn: new Date('2024-07-01'),
        checkOut: new Date('2024-07-05'),
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      },
      bookingCode: 'TEST123',
      status: 'prebook',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };

    mockOnComplete = vi.fn();
    mockOnCancel = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      vi.mocked(preBookService.preBook).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      expect(screen.getByText(/Verifying Availability and Pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/Please wait while we confirm your booking details/i)).toBeInTheDocument();
    });

    it('should show loading spinner', () => {
      vi.mocked(preBookService.preBook).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('No Price Change', () => {
    it('should auto-proceed when price has not changed', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 220,
        priceChanged: false,
        priceIncrease: 0,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(preBookResult);
      });
    });
  });

  describe('Price Increase', () => {
    it('should display price increase warning', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Price Has Increased/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/The room price has increased since your search/i)).toBeInTheDocument();
    });

    it('should show price comparison with increase', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Original Price:/i)).toBeInTheDocument();
        expect(screen.getByText(/USD 220.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Current Price:/i)).toBeInTheDocument();
        expect(screen.getByText(/USD 250.00/i)).toBeInTheDocument();
        expect(screen.getByText(/\+USD 30.00/i)).toBeInTheDocument();
      });
    });

    it('should require user confirmation for price increase', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept New Price/i })).toBeInTheDocument();
      });

      // Should not auto-proceed
      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should call onComplete when user accepts price increase', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept New Price/i })).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept New Price/i });
      fireEvent.click(acceptButton);

      expect(mockOnComplete).toHaveBeenCalledWith(preBookResult);
    });

    it('should show cancellation policy change notice', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: true,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/The cancellation policy has also been updated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Price Decrease', () => {
    it('should display price decrease message', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 200,
        priceChanged: true,
        priceIncrease: -20,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Price Has Decreased/i })).toBeInTheDocument();
        expect(screen.getByText(/Good news! The room price has decreased/i)).toBeInTheDocument();
      });
    });

    it('should show price comparison with decrease', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 200,
        priceChanged: true,
        priceIncrease: -20,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/USD -20.00/i)).toBeInTheDocument();
      });
    });
  });

  describe('Room Unavailable', () => {
    it('should display unavailable message when room is not available', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Room No Longer Available/i)).toBeInTheDocument();
        expect(screen.getByText(/Unfortunately, this room is no longer available/i)).toBeInTheDocument();
      });
    });

    it('should show return to search button when unavailable', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Return to Search Results/i })).toBeInTheDocument();
      });
    });

    it('should call onCancel when return to search is clicked', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 0,
        priceChanged: true,
        priceIncrease: 0,
        available: false,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Return to Search Results/i })).toBeInTheDocument();
      });

      const returnButton = screen.getByRole('button', { name: /Return to Search Results/i });
      fireEvent.click(returnButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      const errorMessage = 'Network connection failed';
      vi.mocked(preBookService.preBook).mockRejectedValue(new Error(errorMessage));

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(preBookService.preBook).mockRejectedValue(new Error('API Error'));

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });
    });

    it('should retry pre-book when Try Again is clicked', async () => {
      vi.mocked(preBookService.preBook)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          bookingCode: 'TEST123',
          originalPrice: 220,
          currentPrice: 220,
          priceChanged: false,
          priceIncrease: 0,
          available: true,
          currency: 'USD',
          cancellationPolicyChanged: false,
        });

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(preBookService.preBook).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Hotel Information Display', () => {
    it('should display hotel details in price change view', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
        expect(screen.getByText('456 Luxury Ave')).toBeInTheDocument();
      });
    });
  });

  describe('Cancellation', () => {
    it('should call onCancel when Cancel Booking is clicked', async () => {
      const preBookResult: PreBookResult = {
        bookingCode: 'TEST123',
        originalPrice: 220,
        currentPrice: 250,
        priceChanged: true,
        priceIncrease: 30,
        available: true,
        currency: 'USD',
        cancellationPolicyChanged: false,
      };

      vi.mocked(preBookService.preBook).mockResolvedValue(preBookResult);

      render(
        <PreBookStep 
          session={mockSession} 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel Booking/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
