/**
 * Booking Details View Component Tests
 * 
 * Tests for BookingDetailsView component:
 * - Booking details display
 * - Guest information display
 * - Cancellation flow
 * - Loading and error states
 * - Voucher download
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import BookingDetailsView from './BookingDetailsView';
import bookingManagementService from '../../services/bookingManagementService';
import type { BookingDetailsResult } from '../../services/bookingManagementService';

// Mock booking management service
vi.mock('../../services/bookingManagementService', () => ({
  default: {
    getBookingDetails: vi.fn(),
    cancelBooking: vi.fn(),
  },
}));

describe('BookingDetailsView', () => {
  const mockBookingDetails: BookingDetailsResult = {
    confirmationNumber: 'CONF-12345',
    bookingReferenceId: 'REF-67890',
    bookingId: 123,
    bookingStatus: 'Confirmed',
    hotelName: 'Grand Plaza Hotel',
    checkInDate: new Date('2024-06-15'),
    checkOutDate: new Date('2024-06-20'),
    totalFare: 500.00,
    currency: 'USD',
    guestDetails: [
      {
        customerNames: [
          {
            title: 'Mr',
            firstName: 'John',
            lastName: 'Doe',
            type: 'Adult' as const,
          },
          {
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Doe',
            type: 'Adult' as const,
          },
        ],
      },
    ],
    bookedOn: new Date('2024-05-01'),
    voucherUrl: 'https://example.com/voucher.pdf',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    expect(screen.getByText('Loading booking details...')).toBeInTheDocument();
  });

  it('displays booking details after loading', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.getByText('CONF-12345')).toBeInTheDocument();
    expect(screen.getByText('REF-67890')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('USD 500.00')).toBeInTheDocument();
  });

  it('displays error state when loading fails', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockRejectedValue(
      new Error('Booking not found')
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Booking')).toBeInTheDocument();
    });

    expect(screen.getByText('Booking not found')).toBeInTheDocument();
  });

  it('displays guest information correctly', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Guest Information')).toBeInTheDocument();
    });

    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    expect(screen.getByText('Mrs Jane Doe')).toBeInTheDocument();
  });

  it('displays multiple rooms with guests', async () => {
    const multiRoomBooking = {
      ...mockBookingDetails,
      guestDetails: [
        mockBookingDetails.guestDetails[0],
        {
          customerNames: [
            {
              title: 'Ms',
              firstName: 'Alice',
              lastName: 'Smith',
              type: 'Adult' as const,
            },
          ],
        },
      ],
    };

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      multiRoomBooking
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Room 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Room 2')).toBeInTheDocument();
    expect(screen.getByText('Ms Alice Smith')).toBeInTheDocument();
  });

  it('shows cancel button for confirmed bookings', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });
  });

  it('does not show cancel button for cancelled bookings', async () => {
    const cancelledBooking = {
      ...mockBookingDetails,
      bookingStatus: 'Cancelled',
    };

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      cancelledBooking
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('opens cancel confirmation modal when cancel button is clicked', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel Booking');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Cancel Booking?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel/i)).toBeInTheDocument();
  });

  it('closes cancel modal when Keep Booking is clicked', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Booking'));
    
    await waitFor(() => {
      expect(screen.getByText('Keep Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Keep Booking'));

    await waitFor(() => {
      expect(screen.queryByText('Cancel Booking?')).not.toBeInTheDocument();
    });
  });

  it('cancels booking when confirmed in modal', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    vi.mocked(bookingManagementService.cancelBooking).mockResolvedValue({
      success: true,
      confirmationNumber: 'CONF-12345',
      cancellationStatus: 'Success',
      refundAmount: 450.00,
      cancellationCharge: 50.00,
      message: 'Booking cancelled successfully',
    });

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Booking'));
    
    await waitFor(() => {
      expect(screen.getByText('Yes, Cancel Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Yes, Cancel Booking'));

    await waitFor(() => {
      expect(bookingManagementService.cancelBooking).toHaveBeenCalledWith('CONF-12345');
    });
  });

  it('displays error when cancellation fails', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    vi.mocked(bookingManagementService.cancelBooking).mockRejectedValue(
      new Error('Cancellation not allowed')
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Booking'));
    fireEvent.click(screen.getByText('Yes, Cancel Booking'));

    await waitFor(() => {
      expect(screen.getByText('Cancellation not allowed')).toBeInTheDocument();
    });
  });

  it('calls onCancellationComplete after successful cancellation', async () => {
    const onCancellationComplete = vi.fn();

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    vi.mocked(bookingManagementService.cancelBooking).mockResolvedValue({
      success: true,
      confirmationNumber: 'CONF-12345',
      cancellationStatus: 'Success',
      refundAmount: 450.00,
      cancellationCharge: 50.00,
      message: 'Booking cancelled successfully',
    });

    render(
      <BookingDetailsView
        confirmationNumber="CONF-12345"
        onCancellationComplete={onCancellationComplete}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Booking'));
    fireEvent.click(screen.getByText('Yes, Cancel Booking'));

    await waitFor(() => {
      expect(onCancellationComplete).toHaveBeenCalled();
    });
  });

  it('displays voucher download link when available', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('📄 Download Voucher')).toBeInTheDocument();
    });

    const voucherLink = screen.getByText('📄 Download Voucher') as HTMLAnchorElement;
    expect(voucherLink.href).toBe('https://example.com/voucher.pdf');
  });

  it('does not display voucher link when not available', async () => {
    const bookingWithoutVoucher = {
      ...mockBookingDetails,
      voucherUrl: undefined,
    };

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      bookingWithoutVoucher
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.queryByText('📄 Download Voucher')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(
      <BookingDetailsView
        confirmationNumber="CONF-12345"
        onClose={onClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('formats dates correctly', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    // Check that dates are formatted (e.g., "Saturday, June 15, 2024")
    expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/June 20, 2024/)).toBeInTheDocument();
  });

  it('applies correct status styling', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    const statusBadge = screen.getByText('Confirmed');
    expect(statusBadge).toHaveClass('status-confirmed');
  });

  it('displays cancellation policy information', async () => {
    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      mockBookingDetails
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
    });

    expect(screen.getByText(/Cancellation charges may apply/i)).toBeInTheDocument();
  });

  it('distinguishes between adult and child guests', async () => {
    const bookingWithChild = {
      ...mockBookingDetails,
      guestDetails: [
        {
          customerNames: [
            {
              title: 'Mr',
              firstName: 'John',
              lastName: 'Doe',
              type: 'Adult' as const,
            },
            {
              title: 'Master',
              firstName: 'Tommy',
              lastName: 'Doe',
              type: 'Child' as const,
            },
          ],
        },
      ],
    };

    vi.mocked(bookingManagementService.getBookingDetails).mockResolvedValue(
      bookingWithChild
    );

    render(<BookingDetailsView confirmationNumber="CONF-12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Master Tommy Doe')).toBeInTheDocument();
    });

    const adultLabel = screen.getAllByText('Adult')[0];
    const childLabel = screen.getByText('Child');
    
    expect(adultLabel).toBeInTheDocument();
    expect(childLabel).toBeInTheDocument();
  });
});
