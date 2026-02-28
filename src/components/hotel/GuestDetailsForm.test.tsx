/**
 * Guest Details Form Component Tests
 * 
 * Tests form validation, multi-room support, and guest information collection
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuestDetailsForm from './GuestDetailsForm';
import { HotelBookingSession, GuestDetails, PaymentInfo } from '../../services/hotelBookingService';
import type { Hotel } from '../../types/tboHotelApi';

describe('GuestDetailsForm', () => {
  let mockSession: HotelBookingSession;
  let mockHotel: Hotel;
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHotel = {
      BookingCode: 'TEST123',
      HotelCode: 'HTL001',
      HotelName: 'Luxury Resort',
      StarRating: 5,
      HotelAddress: '789 Beach Rd',
      HotelContactNo: '+1234567890',
      CityName: 'Miami',
      CountryName: 'USA',
      Price: {
        CurrencyCode: 'USD',
        RoomPrice: 300,
        Tax: 30,
        ExtraGuestCharge: 0,
        ChildCharge: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedPrice: 330,
        OfferedPrice: 330,
        AgentCommission: 0,
        AgentMarkUp: 0,
      },
      Refundable: true,
      MealType: 'All Inclusive',
      RoomType: 'Ocean View Suite',
      AvailableRooms: 2,
      Amenities: ['WiFi', 'Pool', 'Spa'],
      HotelPicture: 'resort.jpg',
      HotelImages: ['img1.jpg'],
    };

    mockSession = {
      sessionId: 'session123',
      hotel: mockHotel,
      searchCriteria: {
        checkIn: new Date('2024-08-01'),
        checkOut: new Date('2024-08-05'),
        guestNationality: 'US',
        paxRooms: [
          { adults: 2, children: 1, childrenAges: [8] },
        ],
      },
      bookingCode: 'TEST123',
      status: 'guest_details',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };

    mockOnSubmit = vi.fn();
    mockOnBack = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form header', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByRole('heading', { name: /Guest Details/i })).toBeInTheDocument();
      expect(screen.getByText(/Please provide information for all guests/i)).toBeInTheDocument();
    });

    it('should render room sections based on search criteria', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText(/2 Adult\(s\), 1 Child\(ren\)/i)).toBeInTheDocument();
    });

    it('should render guest cards for adults and children', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByText('Adult 1')).toBeInTheDocument();
      expect(screen.getByText('Adult 2')).toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('should render contact information section', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByRole('heading', { name: /Contact Information/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument();
    });
  });

  describe('Multi-Room Support', () => {
    it('should render multiple room sections', () => {
      const multiRoomSession = {
        ...mockSession,
        searchCriteria: {
          ...mockSession.searchCriteria,
          paxRooms: [
            { adults: 2, children: 0, childrenAges: [] },
            { adults: 1, children: 1, childrenAges: [5] },
          ],
        },
      };

      render(
        <GuestDetailsForm 
          session={multiRoomSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('Room 2')).toBeInTheDocument();
      expect(screen.getByText(/2 Adult\(s\)/i)).toBeInTheDocument();
      expect(screen.getByText(/1 Adult\(s\), 1 Child\(ren\)/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is not selected', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText(/Title is required/i);
        expect(errors.length).toBeGreaterThan(0);
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when first name is empty', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText(/First name is required/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it('should show error when last name is empty', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText(/Last name is required/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it('should show error when email is empty', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error when phone is empty', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when phone format is invalid', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
      });
    });

    it('should clear error when field is corrected', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      // Submit to trigger errors
      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });

      // Fix the email
      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit with valid data', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      // Fill in guest details for Adult 1
      const titleSelects = screen.getAllByRole('combobox');
      fireEvent.change(titleSelects[0], { target: { value: 'Mr' } });

      const firstNameInputs = screen.getAllByPlaceholderText(/Enter first name/i);
      fireEvent.change(firstNameInputs[0], { target: { value: 'John' } });

      const lastNameInputs = screen.getAllByPlaceholderText(/Enter last name/i);
      fireEvent.change(lastNameInputs[0], { target: { value: 'Doe' } });

      // Fill in guest details for Adult 2
      fireEvent.change(titleSelects[1], { target: { value: 'Mrs' } });
      fireEvent.change(firstNameInputs[1], { target: { value: 'Jane' } });
      fireEvent.change(lastNameInputs[1], { target: { value: 'Doe' } });

      // Fill in guest details for Child 1
      fireEvent.change(titleSelects[2], { target: { value: 'Miss' } });
      fireEvent.change(firstNameInputs[2], { target: { value: 'Emily' } });
      fireEvent.change(lastNameInputs[2], { target: { value: 'Doe' } });

      // Fill in contact information
      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const [guestDetails, paymentInfo] = mockOnSubmit.mock.calls[0];
      
      expect(guestDetails).toHaveLength(1);
      expect(guestDetails[0].customerNames).toHaveLength(3);
      expect(guestDetails[0].customerNames[0]).toEqual({
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        type: 'Adult',
      });

      expect(paymentInfo.emailId).toBe('john.doe@example.com');
      expect(paymentInfo.phoneNumber).toBe('+1 (555) 123-4567');
    });

    it('should disable submit button during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      // Fill in minimal valid data
      const titleSelects = screen.getAllByRole('combobox');
      const firstNameInputs = screen.getAllByPlaceholderText(/Enter first name/i);
      const lastNameInputs = screen.getAllByPlaceholderText(/Enter last name/i);

      titleSelects.forEach(select => fireEvent.change(select, { target: { value: 'Mr' } }));
      firstNameInputs.forEach(input => fireEvent.change(input, { target: { value: 'Test' } }));
      lastNameInputs.forEach(input => fireEvent.change(input, { target: { value: 'User' } }));

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+1234567890' } });

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onBack when Back button is clicked', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should disable Back button during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      // Fill in minimal valid data
      const titleSelects = screen.getAllByRole('combobox');
      const firstNameInputs = screen.getAllByPlaceholderText(/Enter first name/i);
      const lastNameInputs = screen.getAllByPlaceholderText(/Enter last name/i);

      titleSelects.forEach(select => fireEvent.change(select, { target: { value: 'Mr' } }));
      firstNameInputs.forEach(input => fireEvent.change(input, { target: { value: 'Test' } }));
      lastNameInputs.forEach(input => fireEvent.change(input, { target: { value: 'User' } }));

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+1234567890' } });

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /Back/i });
        expect(backButton).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });

    it('should associate error messages with inputs', async () => {
      render(
        <GuestDetailsForm 
          session={mockSession} 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/Email Address/i);
        const errorMessage = screen.getByText(/Email is required/i);
        
        // Error should be near the input
        expect(errorMessage).toBeInTheDocument();
        expect(emailInput.className).toContain('error');
      });
    });
  });
});
