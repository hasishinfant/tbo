/**
 * Booking List Component
 * 
 * Displays a list of hotel bookings with:
 * - Booking status and details
 * - Actions (view details, cancel)
 * - Date range filtering
 * - Empty state handling
 * 
 * Requirements: 5.1, 5.2, 5.5
 */

import React, { useState, useEffect } from 'react';
import bookingManagementService from '../../services/bookingManagementService';
import type { BookingSummaryResult } from '../../services/bookingManagementService';
import './BookingList.css';

interface BookingListProps {
  onViewDetails?: (confirmationNumber: string) => void;
  onCancelBooking?: (confirmationNumber: string) => void;
}

const BookingList: React.FC<BookingListProps> = ({
  onViewDetails,
  onCancelBooking,
}) => {
  const [bookings, setBookings] = useState<BookingSummaryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Set default date range (last 30 days to today)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setFromDate(formatDate(thirtyDaysAgo));
    setToDate(formatDate(today));
  }, []);

  // Load bookings when date range changes
  useEffect(() => {
    if (fromDate && toDate) {
      loadBookings();
    }
  }, [fromDate, toDate]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await bookingManagementService.getBookingsByDateRange(
        fromDate,
        toDate
      );
      setBookings(result.bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed') return 'status-confirmed';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'failed') return 'status-failed';
    return 'status-default';
  };

  const handleRefresh = () => {
    loadBookings();
  };

  if (loading) {
    return (
      <div className="booking-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-list">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Bookings</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-list">
      {/* Header */}
      <div className="booking-list-header">
        <h2>My Hotel Bookings</h2>
        <button onClick={handleRefresh} className="btn-refresh" aria-label="Refresh bookings">
          🔄
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="date-input-group">
          <label htmlFor="fromDate">From</label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={toDate}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="toDate">To</label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate}
          />
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="bookings-container">
          {bookings.map((booking) => (
            <div key={booking.confirmationNumber} className="booking-card">
              <div className="booking-header">
                <div className="booking-title">
                  <h3>{booking.hotelName}</h3>
                  <span className={`booking-status ${getStatusClass(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="confirmation-number">
                  Confirmation: <strong>{booking.confirmationNumber}</strong>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">Check-in</span>
                    <span className="detail-value">
                      {formatDisplayDate(booking.checkInDate)}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">Check-out</span>
                    <span className="detail-value">
                      {formatDisplayDate(booking.checkOutDate)}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <div className="detail-content">
                    <span className="detail-label">Total</span>
                    <span className="detail-value">
                      {booking.currency} {booking.totalFare.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-actions">
                <button
                  onClick={() => onViewDetails?.(booking.confirmationNumber)}
                  className="btn-action btn-view"
                >
                  View Details
                </button>
                {booking.bookingStatus.toLowerCase() === 'confirmed' && (
                  <button
                    onClick={() => onCancelBooking?.(booking.confirmationNumber)}
                    className="btn-action btn-cancel"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏨</div>
          <h3>No Bookings Found</h3>
          <p>You don't have any hotel bookings in the selected date range.</p>
          <p className="empty-hint">Try adjusting the date range or make a new booking.</p>
        </div>
      )}
    </div>
  );
};

export default BookingList;
