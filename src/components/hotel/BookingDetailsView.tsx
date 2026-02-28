/**
 * Booking Details View Component
 * 
 * Displays complete booking information with:
 * - Hotel details and guest information
 * - Booking status and dates
 * - Cancellation policy
 * - Cancellation option
 * - Voucher download
 * 
 * Requirements: 5.2, 5.3, 5.4
 */

import React, { useState, useEffect } from 'react';
import bookingManagementService from '../../services/bookingManagementService';
import type { BookingDetailsResult } from '../../services/bookingManagementService';
import './BookingDetailsView.css';

interface BookingDetailsViewProps {
  confirmationNumber: string;
  onClose?: () => void;
  onCancellationComplete?: () => void;
}

const BookingDetailsView: React.FC<BookingDetailsViewProps> = ({
  confirmationNumber,
  onClose,
  onCancellationComplete,
}) => {
  const [booking, setBooking] = useState<BookingDetailsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    loadBookingDetails();
  }, [confirmationNumber]);

  const loadBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await bookingManagementService.getBookingDetails(
        confirmationNumber
      );
      setBooking(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError(null);

    try {
      const result = await bookingManagementService.cancelBooking(
        confirmationNumber
      );

      if (result.success) {
        // Reload booking details to show updated status
        await loadBookingDetails();
        setShowCancelModal(false);
        onCancellationComplete?.();
      } else {
        setCancelError(result.message || 'Cancellation failed');
      }
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  const canCancelBooking = (): boolean => {
    if (!booking) return false;
    const status = booking.bookingStatus.toLowerCase();
    return status === 'confirmed' || status === 'pending';
  };

  if (loading) {
    return (
      <div className="booking-details-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-view">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Booking</h3>
          <p>{error || 'Booking not found'}</p>
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-view">
      {/* Header */}
      <div className="details-header">
        <div className="header-content">
          <h2>Booking Details</h2>
          <span className={`booking-status ${getStatusClass(booking.bookingStatus)}`}>
            {booking.bookingStatus}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-close-icon" aria-label="Close">
            ✕
          </button>
        )}
      </div>

      {/* Confirmation Info */}
      <div className="confirmation-section">
        <div className="confirmation-item">
          <span className="label">Confirmation Number</span>
          <span className="value">{booking.confirmationNumber}</span>
        </div>
        <div className="confirmation-item">
          <span className="label">Booking Reference</span>
          <span className="value">{booking.bookingReferenceId}</span>
        </div>
        <div className="confirmation-item">
          <span className="label">Booked On</span>
          <span className="value">{formatDate(booking.bookedOn)}</span>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="section">
        <h3 className="section-title">Hotel Information</h3>
        <div className="hotel-info-card">
          <div className="hotel-icon">🏨</div>
          <div className="hotel-details">
            <h4>{booking.hotelName}</h4>
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="section">
        <h3 className="section-title">Stay Details</h3>
        <div className="stay-details-grid">
          <div className="stay-detail-card">
            <div className="detail-icon">📅</div>
            <div className="detail-info">
              <span className="detail-label">Check-in</span>
              <span className="detail-value">{formatDate(booking.checkInDate)}</span>
            </div>
          </div>
          <div className="stay-detail-card">
            <div className="detail-icon">📅</div>
            <div className="detail-info">
              <span className="detail-label">Check-out</span>
              <span className="detail-value">{formatDate(booking.checkOutDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Information */}
      <div className="section">
        <h3 className="section-title">Guest Information</h3>
        <div className="guests-list">
          {booking.guestDetails.map((room, roomIndex) => (
            <div key={roomIndex} className="room-guests">
              <h4 className="room-title">Room {roomIndex + 1}</h4>
              <div className="guests-grid">
                {room.customerNames.map((guest, guestIndex) => (
                  <div key={guestIndex} className="guest-card">
                    <div className="guest-icon">
                      {guest.type === 'Adult' ? '👤' : '👶'}
                    </div>
                    <div className="guest-info">
                      <span className="guest-name">
                        {guest.title} {guest.firstName} {guest.lastName}
                      </span>
                      <span className="guest-type">{guest.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="section">
        <h3 className="section-title">Payment Summary</h3>
        <div className="payment-card">
          <div className="payment-row">
            <span className="payment-label">Total Amount</span>
            <span className="payment-value total">
              {booking.currency} {booking.totalFare.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="section">
        <h3 className="section-title">Cancellation Policy</h3>
        <div className="policy-card">
          <p className="policy-text">
            Cancellation charges may apply based on the hotel's policy and the time of cancellation.
            Please review the terms carefully before proceeding with cancellation.
          </p>
          <p className="policy-warning">
            ⚠️ Cancellation fees and refund amounts will be calculated at the time of cancellation.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        {booking.voucherUrl && (
          <a
            href={booking.voucherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-action btn-download"
          >
            📄 Download Voucher
          </a>
        )}
        {canCancelBooking() && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn-action btn-cancel"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Booking?</h3>
            <p>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <p className="modal-warning">
              Cancellation charges may apply according to the hotel's policy.
            </p>

            {cancelError && (
              <div className="cancel-error">
                <span className="error-icon">⚠️</span>
                {cancelError}
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelError(null);
                }}
                className="btn-modal btn-secondary"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="btn-modal btn-danger"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsView;
