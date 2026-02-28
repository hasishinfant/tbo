/**
 * Hotel Booking Confirmation Component Tests
 * 
 * Tests confirmation display, voucher actions, and itinerary integration
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotelBookingConfirmation from './HotelBookingConfirmation';
import { HotelBookingConfirmation as BookingConfirmation } from '../../services/hotelBookingService';
import type { Hotel } from '../../types/tboHotelApi';

describe('HotelBookingConfirmation', () => {
  let mockConfirmation: BookingConfirmation;
  let mockHotel: Hotel;
  let mockOnViewItinerary: ReturnType<typeof vi.fn>;
  let mockOnNewBooking: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHotel = {
      BookingCode: 'CONF123',
      HotelCode: 'HTL001',
      HotelName: 'Paradise Resort & Spa',
      StarRating: 5,
      HotelAddress: '100 Paradise Lane',
      HotelContactNo: '+1234567890',
      CityName: 'Honolulu',
      CountryName: 'USA',
      Price: {
        CurrencyCode: 'USD',
        RoomPrice: 500,
        Tax: 50,
        ExtraGuestCharge: 0,
        ChildCharge: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedPrice: 550,
        OfferedPrice: 550,
        AgentCommission: 0,
        AgentMarkUp: 0,
      },
      Refundable: true,
      MealType: 'All Inclusive',
      RoomType: 'Presidential Suite',
      AvailableRooms: 1,
      Amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
      HotelPicture: 'paradise.jpg',
      HotelImages: ['img1.jpg', 'img2.jpg'],
    };

    mockConfirmation = {
      confirmationNumber: 'CONF123456',
      bookingReferenceId: 'BOOK789012',
      hotel: mockHotel,
      guestDetails: [
        {
          roomIndex: 0,
          customerNames: [
            { title: 'Mr', firstName: 'John', lastName: 'Smith', type: 'Adult' },
            { title: 'Mrs', firstName: 'Jane', lastName: 'Smith', type: 'Adult' },
          ],
        },
      ],
      totalFare: 550,
      currency: 'USD',
      checkIn: new Date('2024-09-01'),
      checkOut: new Date('2024-09-05'),
      bookedAt: new Date('2024-06-15T10:30:00'),
      status: 'Confirmed',
      voucherUrl: 'https://example.com/voucher/123',
    };

    mockOnViewItinerary = vi.fn();
    mockOnNewBooking = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render success header', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/Booking Confirmed!/i)).toBeInTheDocument();
      expect(screen.getByText(/Your hotel reservation has been successfully completed/i)).toBeInTheDocument();
    });

    it('should display confirmation numbers', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText('CONF123456')).toBeInTheDocument();
      expect(screen.getByText('BOOK789012')).toBeInTheDocument();
    });

    it('should display hotel details', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText('Paradise Resort & Spa')).toBeInTheDocument();
      expect(screen.getByText('100 Paradise Lane')).toBeInTheDocument();
      expect(screen.getByText(/Honolulu, USA/i)).toBeInTheDocument();
    });

    it('should display hotel star rating', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      const ratingElement = screen.getByText(/★★★★★/);
      expect(ratingElement).toBeInTheDocument();
    });

    it('should display stay details', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/Check-in/i)).toBeInTheDocument();
      expect(screen.getByText(/Check-out/i)).toBeInTheDocument();
      expect(screen.getByText(/4 Nights/i)).toBeInTheDocument();
      expect(screen.getByText(/1 Room/i)).toBeInTheDocument();
    });

    it('should display guest information', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/Guest Information/i)).toBeInTheDocument();
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText(/Mr John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Mrs Jane Smith/i)).toBeInTheDocument();
    });

    it('should display payment summary', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/Payment Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/USD 550.00/i)).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('should display itinerary integration message', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/Added to Your Itinerary/i)).toBeInTheDocument();
      expect(screen.getByText(/This hotel booking has been automatically added/i)).toBeInTheDocument();
    });

    it('should display next steps', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/What's Next\?/i)).toBeInTheDocument();
      expect(screen.getByText(/You'll receive a confirmation email shortly/i)).toBeInTheDocument();
      expect(screen.getByText(/Present your confirmation number at hotel check-in/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Rooms', () => {
    it('should display multiple room sections', () => {
      const multiRoomConfirmation = {
        ...mockConfirmation,
        guestDetails: [
          {
            roomIndex: 0,
            customerNames: [
              { title: 'Mr', firstName: 'John', lastName: 'Smith', type: 'Adult' },
            ],
          },
          {
            roomIndex: 1,
            customerNames: [
              { title: 'Mrs', firstName: 'Jane', lastName: 'Doe', type: 'Adult' },
            ],
          },
        ],
      };

      render(<HotelBookingConfirmation confirmation={multiRoomConfirmation} />);

      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('Room 2')).toBeInTheDocument();
      expect(screen.getByText(/2 Rooms/i)).toBeInTheDocument();
    });
  });

  describe('Voucher Actions', () => {
    it('should render download and email buttons', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByRole('button', { name: /Download Voucher/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Email Voucher/i })).toBeInTheDocument();
    });

    it('should open voucher URL when download is clicked and URL exists', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      const downloadButton = screen.getByRole('button', { name: /Download Voucher/i });
      fireEvent.click(downloadButton);

      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/voucher/123', '_blank');

      windowOpenSpy.mockRestore();
    });

    it('should generate text voucher when download is clicked and no URL exists', () => {
      const confirmationWithoutUrl = { ...mockConfirmation, voucherUrl: undefined };
      
      // Mock document.createElement and related methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

      render(<HotelBookingConfirmation confirmation={confirmationWithoutUrl} />);

      const downloadButton = screen.getByRole('button', { name: /Download Voucher/i });
      fireEvent.click(downloadButton);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should show sending state when email button is clicked', async () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      const emailButton = screen.getByRole('button', { name: /Email Voucher/i });
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(screen.getByText(/Sending.../i)).toBeInTheDocument();
      });
    });

    it('should show success state after email is sent', async () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      const emailButton = screen.getByRole('button', { name: /Email Voucher/i });
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(screen.getByText(/Email Sent!/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should disable email button after sending', async () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      const emailButton = screen.getByRole('button', { name: /Email Voucher/i });
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(emailButton).toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  describe('Itinerary Integration', () => {
    it('should show View Itinerary button when callback is provided', () => {
      render(
        <HotelBookingConfirmation 
          confirmation={mockConfirmation} 
          onViewItinerary={mockOnViewItinerary}
        />
      );

      expect(screen.getByRole('button', { name: /View Itinerary/i })).toBeInTheDocument();
    });

    it('should not show View Itinerary button when callback is not provided', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.queryByRole('button', { name: /View Itinerary/i })).not.toBeInTheDocument();
    });

    it('should call onViewItinerary when button is clicked', () => {
      render(
        <HotelBookingConfirmation 
          confirmation={mockConfirmation} 
          onViewItinerary={mockOnViewItinerary}
        />
      );

      const viewButton = screen.getByRole('button', { name: /View Itinerary/i });
      fireEvent.click(viewButton);

      expect(mockOnViewItinerary).toHaveBeenCalled();
    });
  });

  describe('New Booking Action', () => {
    it('should show Book Another Hotel button when callback is provided', () => {
      render(
        <HotelBookingConfirmation 
          confirmation={mockConfirmation} 
          onNewBooking={mockOnNewBooking}
        />
      );

      expect(screen.getByRole('button', { name: /Book Another Hotel/i })).toBeInTheDocument();
    });

    it('should not show Book Another Hotel button when callback is not provided', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.queryByRole('button', { name: /Book Another Hotel/i })).not.toBeInTheDocument();
    });

    it('should call onNewBooking when button is clicked', () => {
      render(
        <HotelBookingConfirmation 
          confirmation={mockConfirmation} 
          onNewBooking={mockOnNewBooking}
        />
      );

      const newBookingButton = screen.getByRole('button', { name: /Book Another Hotel/i });
      fireEvent.click(newBookingButton);

      expect(mockOnNewBooking).toHaveBeenCalled();
    });
  });

  describe('Date Calculations', () => {
    it('should calculate correct number of nights', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByText(/4 Nights/i)).toBeInTheDocument();
    });

    it('should show singular "Night" for one night stay', () => {
      const oneNightConfirmation = {
        ...mockConfirmation,
        checkIn: new Date('2024-09-01'),
        checkOut: new Date('2024-09-02'),
      };

      render(<HotelBookingConfirmation confirmation={oneNightConfirmation} />);

      expect(screen.getByText(/1 Night/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(
        <HotelBookingConfirmation 
          confirmation={mockConfirmation}
          onViewItinerary={mockOnViewItinerary}
          onNewBooking={mockOnNewBooking}
        />
      );

      expect(screen.getByRole('button', { name: /Download Voucher/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Email Voucher/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Itinerary/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Book Another Hotel/i })).toBeInTheDocument();
    });

    it('should have descriptive headings', () => {
      render(<HotelBookingConfirmation confirmation={mockConfirmation} />);

      expect(screen.getByRole('heading', { name: /Booking Confirmed!/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Hotel Details/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Stay Details/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Guest Information/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Payment Summary/i })).toBeInTheDocument();
    });
  });
});
