/**
 * Booking List Component Tests
 * 
 * Tests for BookingList component:
 * - Booking list display
 * - Date range filtering
 * - Loading and error states
 * - Empty state handling
 * - Action buttons
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import BookingList from './BookingList';
import bookingManagementService from '../../services/bookingManagementService';
import type { BookingSummaryResult } from '../../services/bookingManagementService';

// Mock booking management service
vi.mock('../../services/bookingManagementService', () => ({
  default: {
    getBookingsByDateRange: vi.fn(),
  },
}));

describe('BookingList', () => {
  const mockBooking: BookingSummaryResult = {
    confirmationNumber: 'CONF-12345',
    bookingReferenceId: 'REF-67890',
    hotelName: 'Grand Plaza Hotel',
    checkInDate: new Date('2024-06-15'),
    checkOutDate: new Date('2024-06-20'),
    bookingStatus: 'Confirmed',
    totalFare: 500.00,
    currency: 'USD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BookingList />);
    
    expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();
  });

  it('displays bookings after loading', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.getByText('CONF-12345')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('USD 500.00')).toBeInTheDocument();
  });

  it('displays multiple bookings', async () => {
    const bookings = [
      mockBooking,
      {
        ...mockBooking,
        confirmationNumber: 'CONF-54321',
        hotelName: 'Seaside Resort',
        bookingStatus: 'Pending',
      },
    ];

    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings,
      totalCount: 2,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.getByText('Seaside Resort')).toBeInTheDocument();
    expect(screen.getByText('CONF-12345')).toBeInTheDocument();
    expect(screen.getByText('CONF-54321')).toBeInTheDocument();
  });

  it('displays error state when loading fails', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockRejectedValue(
      new Error('Network error')
    );

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Bookings')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('retries loading when Try Again is clicked', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        bookings: [mockBooking],
        totalCount: 1,
      });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });
  });

  it('displays empty state when no bookings found', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [],
      totalCount: 0,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('No Bookings Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/You don't have any hotel bookings/i)).toBeInTheDocument();
  });

  it('calls onViewDetails when View Details button is clicked', async () => {
    const onViewDetails = vi.fn();

    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList onViewDetails={onViewDetails} />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);

    expect(onViewDetails).toHaveBeenCalledWith('CONF-12345');
  });

  it('calls onCancelBooking when Cancel Booking button is clicked', async () => {
    const onCancelBooking = vi.fn();

    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList onCancelBooking={onCancelBooking} />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel Booking');
    fireEvent.click(cancelButton);

    expect(onCancelBooking).toHaveBeenCalledWith('CONF-12345');
  });

  it('does not show cancel button for cancelled bookings', async () => {
    const cancelledBooking = {
      ...mockBooking,
      bookingStatus: 'Cancelled',
    };

    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [cancelledBooking],
      totalCount: 1,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('applies correct status styling', async () => {
    const bookings = [
      { ...mockBooking, bookingStatus: 'Confirmed' },
      { ...mockBooking, confirmationNumber: 'CONF-2', bookingStatus: 'Pending' },
      { ...mockBooking, confirmationNumber: 'CONF-3', bookingStatus: 'Cancelled' },
    ];

    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings,
      totalCount: 3,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    const confirmedStatus = screen.getByText('Confirmed');
    const pendingStatus = screen.getByText('Pending');
    const cancelledStatus = screen.getByText('Cancelled');

    expect(confirmedStatus).toHaveClass('status-confirmed');
    expect(pendingStatus).toHaveClass('status-pending');
    expect(cancelledStatus).toHaveClass('status-cancelled');
  });

  it('updates bookings when date range changes', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    const fromDateInput = screen.getByLabelText('From') as HTMLInputElement;
    fireEvent.change(fromDateInput, { target: { value: '2024-01-01' } });

    await waitFor(() => {
      expect(bookingManagementService.getBookingsByDateRange).toHaveBeenCalledWith(
        '2024-01-01',
        expect.any(String)
      );
    });
  });

  it('refreshes bookings when refresh button is clicked', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText('Refresh bookings');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(bookingManagementService.getBookingsByDateRange).toHaveBeenCalledTimes(2);
    });
  });

  it('formats dates correctly', async () => {
    vi.mocked(bookingManagementService.getBookingsByDateRange).mockResolvedValue({
      bookings: [mockBooking],
      totalCount: 1,
    });

    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    });

    // Check that dates are formatted (e.g., "Jun 15, 2024")
    expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jun 20, 2024/)).toBeInTheDocument();
  });
});
