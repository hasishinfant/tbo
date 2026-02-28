/**
 * Hotel Booking Confirmation Component
 * 
 * Displays booking confirmation with all details.
 * Provides options to download or email voucher.
 * Shows integration with TravelSphere itinerary.
 * 
 * Requirements: 4.2, 4.3, 4.5, 4.6
 */

import React, { useState } from 'react';
import { HotelBookingConfirmation as BookingConfirmation } from '../../services/hotelBookingService';
import './HotelBookingConfirmation.css';

// ============================================================================
// Types
// ============================================================================

interface HotelBookingConfirmationProps {
  confirmation: BookingConfirmation;
  onViewItinerary?: () => void;
  onNewBooking?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const HotelBookingConfirmation: React.FC<HotelBookingConfirmationProps> = ({
  confirmation,
  onViewItinerary,
  onNewBooking,
}) => {
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleDownloadVoucher = () => {
    if (confirmation.voucherUrl) {
      window.open(confirmation.voucherUrl, '_blank');
    } else {
      // Generate a simple voucher download
      const voucherContent = generateVoucherText(confirmation);
      const blob = new Blob([voucherContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-voucher-${confirmation.confirmationNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleEmailVoucher = async () => {
    setSendingEmail(true);
    
    // Simulate email sending (in real app, would call API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEmailSent(true);
    setSendingEmail(false);
  };

  const calculateNights = () => {
    const checkIn = new Date(confirmation.checkIn);
    const checkOut = new Date(confirmation.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  return (
    <div className="hotel-booking-confirmation">
      {/* Success Header */}
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        <p>Your hotel reservation has been successfully completed</p>
      </div>

      {/* Confirmation Number */}
      <div className="confirmation-number-section">
        <div className="confirmation-number-card">
          <span className="label">Confirmation Number</span>
          <span className="number">{confirmation.confirmationNumber}</span>
        </div>
        <div className="confirmation-number-card">
          <span className="label">Booking Reference</span>
          <span className="number">{confirmation.bookingReferenceId}</span>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="confirmation-section">
        <h3>Hotel Details</h3>
        <div className="hotel-info-card">
          <div className="hotel-name">{confirmation.hotel.HotelName}</div>
          <div className="hotel-rating">
            {'★'.repeat(confirmation.hotel.StarRating)}
            {'☆'.repeat(5 - confirmation.hotel.StarRating)}
          </div>
          <div className="hotel-address">{confirmation.hotel.HotelAddress}</div>
          <div className="hotel-location">
            {confirmation.hotel.CityName}, {confirmation.hotel.CountryName}
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="confirmation-section">
        <h3>Stay Details</h3>
        <div className="stay-details-grid">
          <div className="detail-item">
            <span className="detail-label">Check-in</span>
            <span className="detail-value">
              {confirmation.checkIn.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Check-out</span>
            <span className="detail-value">
              {confirmation.checkOut.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Duration</span>
            <span className="detail-value">
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rooms</span>
            <span className="detail-value">
              {confirmation.guestDetails.length} {confirmation.guestDetails.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Details */}
      <div className="confirmation-section">
        <h3>Guest Information</h3>
        {confirmation.guestDetails.map((room, index) => (
          <div key={index} className="guest-room-card">
            <h4>Room {index + 1}</h4>
            <div className="guests-list">
              {room.customerNames.map((guest, guestIndex) => (
                <div key={guestIndex} className="guest-item">
                  <span className="guest-type">{guest.type}:</span>
                  <span className="guest-name">
                    {guest.title} {guest.firstName} {guest.lastName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="confirmation-section">
        <h3>Payment Summary</h3>
        <div className="payment-summary-card">
          <div className="payment-row">
            <span className="payment-label">Total Amount Paid</span>
            <span className="payment-value">
              {confirmation.currency} {confirmation.totalFare.toFixed(2)}
            </span>
          </div>
          <div className="payment-row">
            <span className="payment-label">Booking Status</span>
            <span className="status-badge confirmed">{confirmation.status}</span>
          </div>
          <div className="payment-row">
            <span className="payment-label">Booked On</span>
            <span className="payment-value">
              {confirmation.bookedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Voucher Actions */}
      <div className="voucher-actions">
        <h3>Booking Voucher</h3>
        <p className="voucher-description">
          Download or email your booking voucher for your records
        </p>
        <div className="voucher-buttons">
          <button onClick={handleDownloadVoucher} className="btn-download">
            <span className="btn-icon">⬇</span>
            Download Voucher
          </button>
          <button 
            onClick={handleEmailVoucher} 
            className="btn-email"
            disabled={sendingEmail || emailSent}
          >
            <span className="btn-icon">✉</span>
            {sendingEmail ? 'Sending...' : emailSent ? 'Email Sent!' : 'Email Voucher'}
          </button>
        </div>
      </div>

      {/* Itinerary Integration */}
      <div className="itinerary-integration">
        <div className="integration-icon">📅</div>
        <div className="integration-content">
          <h4>Added to Your Itinerary</h4>
          <p>
            This hotel booking has been automatically added to your TravelSphere itinerary.
            View your complete travel plans anytime.
          </p>
        </div>
        {onViewItinerary && (
          <button onClick={onViewItinerary} className="btn-view-itinerary">
            View Itinerary
          </button>
        )}
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h3>What's Next?</h3>
        <ul className="steps-list">
          <li>You'll receive a confirmation email shortly</li>
          <li>Present your confirmation number at hotel check-in</li>
          <li>Check-in time is typically 3:00 PM (verify with hotel)</li>
          <li>Check-out time is typically 11:00 AM (verify with hotel)</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="confirmation-actions">
        {onNewBooking && (
          <button onClick={onNewBooking} className="btn-new-booking">
            Book Another Hotel
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateVoucherText(confirmation: BookingConfirmation): string {
  return `
HOTEL BOOKING VOUCHER
=====================

Confirmation Number: ${confirmation.confirmationNumber}
Booking Reference: ${confirmation.bookingReferenceId}

HOTEL DETAILS
-------------
${confirmation.hotel.HotelName}
${confirmation.hotel.HotelAddress}
${confirmation.hotel.CityName}, ${confirmation.hotel.CountryName}
Rating: ${'★'.repeat(confirmation.hotel.StarRating)}

STAY DETAILS
------------
Check-in: ${confirmation.checkIn.toLocaleDateString()}
Check-out: ${confirmation.checkOut.toLocaleDateString()}
Rooms: ${confirmation.guestDetails.length}

GUEST INFORMATION
-----------------
${confirmation.guestDetails.map((room, index) => `
Room ${index + 1}:
${room.customerNames.map(guest => `  - ${guest.title} ${guest.firstName} ${guest.lastName} (${guest.type})`).join('\n')}
`).join('\n')}

PAYMENT SUMMARY
---------------
Total Amount: ${confirmation.currency} ${confirmation.totalFare.toFixed(2)}
Status: ${confirmation.status}
Booked On: ${confirmation.bookedAt.toLocaleString()}

Please present this voucher at check-in.
For any queries, contact the hotel directly or TravelSphere support.
  `.trim();
}

export default HotelBookingConfirmation;
