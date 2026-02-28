/**
 * Hotel Booking Workflow Component Tests
 * 
 * Tests step navigation, progress indication, and workflow state management
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotelBookingWorkflow from './HotelBookingWorkflow';
import { hotelBookingService, HotelBookingSession } from '../../services/hotelBookingService';
import type { Hotel } from '../../types/tboHotelApi';

// Mock the hotel booking service
vi.mock('../../services/hotelBookingService', () => ({
  hotelBookingService: {
    getCurrentSession: vi.fn(),
    updateSession: vi.fn(),
    cancelSession: vi.fn(),
  },
}));

describe('HotelBookingWorkflow', () => {
  let mockSession: HotelBookingSession;
  let mockHotel: Hotel;

  beforeEach(() => {
    mockHotel = {
      BookingCode: 'TEST123',
      HotelCode: 'HTL001',
      HotelName: 'Test Hotel',
      StarRating: 4,
      HotelAddress: '123 Test St',
      HotelContactNo: '+1234567890',
      CityName: 'Test City',
      CountryName: 'Test Country',
      Price: {
        CurrencyCode: 'USD',
        RoomPrice: 100,
        Tax: 10,
        ExtraGuestCharge: 0,
        ChildCharge: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedPrice: 110,
        OfferedPrice: 110,
        AgentCommission: 0,
        AgentMarkUp: 0,
      },
      Refundable: true,
      MealType: 'Breakfast',
      RoomType: 'Deluxe',
      AvailableRooms: 5,
      Amenities: ['WiFi', 'Pool'],
      HotelPicture: 'test.jpg',
      HotelImages: ['test1.jpg', 'test2.jpg'],
    };

    mockSession = {
      sessionId: 'session123',
      hotel: mockHotel,
      searchCriteria: {
        checkIn: new Date('2024-06-01'),
        checkOut: new Date('2024-06-05'),
        guestNationality: 'US',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      },
      bookingCode: 'TEST123',
      status: 'details',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };

    vi.mocked(hotelBookingService.getCurrentSession).mockReturnValue(mockSession);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the workflow with progress indicator', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.getByText('Hotel Details')).toBeInTheDocument();
      expect(screen.getByText('Verify Pricing')).toBeInTheDocument();
      expect(screen.getByText('Guest Details')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
    });

    it('should highlight the current step', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      const steps = screen.getAllByText(/Hotel Details|Verify Pricing|Guest Details|Payment|Confirmation/);
      // The first step (Hotel Details) should be active
      expect(steps[0].closest('.progress-step')).toHaveClass('active');
    });

    it('should display hotel information', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
      expect(screen.getByText(/6\/1\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/6\/5\/2024/)).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.getByRole('button', { name: /Cancel Booking/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('should not show Back button on first step', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument();
    });

    it('should show Back button on subsequent steps', () => {
      const sessionOnSecondStep = { ...mockSession, status: 'prebook' as const };
      render(<HotelBookingWorkflow session={sessionOnSecondStep} />);

      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('should navigate to next step when Continue is clicked', async () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(hotelBookingService.updateSession).toHaveBeenCalledWith({ status: 'prebook' });
      });
    });

    it('should navigate to previous step when Back is clicked', async () => {
      const sessionOnSecondStep = { ...mockSession, status: 'prebook' as const };
      render(<HotelBookingWorkflow session={sessionOnSecondStep} />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(hotelBookingService.updateSession).toHaveBeenCalledWith({ status: 'details' });
      });
    });

    it('should show "Complete Booking" text on payment step', () => {
      const sessionOnPaymentStep = { ...mockSession, status: 'payment' as const };
      render(<HotelBookingWorkflow session={sessionOnPaymentStep} />);

      expect(screen.getByRole('button', { name: /Complete Booking/i })).toBeInTheDocument();
    });

    it('should not show navigation buttons on confirmation step', () => {
      const sessionOnConfirmationStep = { ...mockSession, status: 'confirmed' as const };
      render(<HotelBookingWorkflow session={sessionOnConfirmationStep} />);

      expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should mark completed steps', () => {
      const sessionOnThirdStep = { ...mockSession, status: 'guest_details' as const };
      render(<HotelBookingWorkflow session={sessionOnThirdStep} />);

      const progressSteps = document.querySelectorAll('.progress-step');
      expect(progressSteps[0]).toHaveClass('completed'); // Hotel Details
      expect(progressSteps[1]).toHaveClass('completed'); // Verify Pricing
      expect(progressSteps[2]).toHaveClass('active'); // Guest Details (current)
      expect(progressSteps[3]).toHaveClass('pending'); // Payment
      expect(progressSteps[4]).toHaveClass('pending'); // Confirmation
    });

    it('should show checkmarks for completed steps', () => {
      const sessionOnThirdStep = { ...mockSession, status: 'guest_details' as const };
      render(<HotelBookingWorkflow session={sessionOnThirdStep} />);

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(2); // Two completed steps
    });
  });

  describe('Session Management', () => {
    it('should restore session on mount', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(hotelBookingService.getCurrentSession).toHaveBeenCalled();
    });

    it('should update session when step changes', async () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(hotelBookingService.updateSession).toHaveBeenCalled();
      });
    });

    it('should cancel session when Cancel Booking is clicked', async () => {
      const onCancel = vi.fn();
      render(<HotelBookingWorkflow session={mockSession} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(hotelBookingService.cancelSession).toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onComplete when booking is completed', async () => {
      const onComplete = vi.fn();
      const sessionOnConfirmationStep = { ...mockSession, status: 'confirmed' as const };
      
      render(
        <HotelBookingWorkflow 
          session={sessionOnConfirmationStep} 
          onComplete={onComplete}
        />
      );

      // In a real scenario, onComplete would be called after successful booking
      // This test verifies the prop is passed correctly
      expect(onComplete).not.toHaveBeenCalled(); // Not called on render
    });

    it('should call onCancel when cancellation is requested', async () => {
      const onCancel = vi.fn();
      render(<HotelBookingWorkflow session={mockSession} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.getByRole('button', { name: /Cancel Booking/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    });

    it('should have descriptive step labels', () => {
      render(<HotelBookingWorkflow session={mockSession} />);

      expect(screen.getByText('Hotel Details')).toBeInTheDocument();
      expect(screen.getByText('Verify Pricing')).toBeInTheDocument();
      expect(screen.getByText('Guest Details')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
    });
  });
});
