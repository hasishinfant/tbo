/**
 * Combined Itinerary View Component
 * 
 * Displays a unified view of flight and hotel bookings together,
 * showing the complete travel itinerary in a timeline format.
 */

import React from 'react';
import type { CombinedBookingConfirmation } from '../../services/combinedBookingService';
import styles from './CombinedItineraryView.module.css';

// ============================================================================
// Types
// ============================================================================

interface CombinedItineraryViewProps {
  confirmation: CombinedBookingConfirmation;
  onDownload?: () => void;
  onEmail?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const CombinedItineraryView: React.FC<CombinedItineraryViewProps> = ({
  confirmation,
  onDownload,
  onEmail,
}) => {
  const { flightBooking, hotelBooking, totalCost, currency, bookedAt } = confirmation;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.successIcon}>✓</div>
        <h1>Booking Confirmed!</h1>
        <p className={styles.subtitle}>
          Your travel arrangements have been successfully booked
        </p>
      </div>

      <div className={styles.content}>
        {/* Booking Summary Card */}
        <div className={styles.summaryCard}>
          <h2>Booking Summary</h2>
          
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Booking Date:</span>
              <span>{bookedAt.toLocaleDateString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Cost:</span>
              <span className={styles.totalCost}>{currency} {totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button onClick={onDownload} className={styles.actionButton}>
              📥 Download Itinerary
            </button>
            <button onClick={onEmail} className={styles.actionButton}>
              📧 Email Itinerary
            </button>
          </div>
        </div>

        {/* Timeline View */}
        <div className={styles.timeline}>
          <h2>Your Travel Itinerary</h2>

          {/* Flight Details */}
          {flightBooking && (
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>✈️</div>
              <div className={styles.timelineContent}>
                <h3>Flight</h3>
                
                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Booking Reference:</span>
                    <span className={styles.value}>{flightBooking.bookingReference}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>PNR:</span>
                    <span className={styles.value}>{flightBooking.pnr}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Route:</span>
                    <span className={styles.value}>
                      {flightBooking.flight.origin} → {flightBooking.flight.destination}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Departure:</span>
                    <span className={styles.value}>
                      {new Date(flightBooking.flight.departureTime).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Arrival:</span>
                    <span className={styles.value}>
                      {new Date(flightBooking.flight.arrivalTime).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Airline:</span>
                    <span className={styles.value}>{flightBooking.flight.airline}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Flight Number:</span>
                    <span className={styles.value}>{flightBooking.flight.flightNumber}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Passengers:</span>
                    <span className={styles.value}>
                      {flightBooking.passengers.map(p => 
                        `${p.title} ${p.firstName} ${p.lastName}`
                      ).join(', ')}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Total Fare:</span>
                    <span className={styles.value}>
                      {flightBooking.currency} {flightBooking.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Details */}
          {hotelBooking && (
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>🏨</div>
              <div className={styles.timelineContent}>
                <h3>Hotel</h3>
                
                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Confirmation Number:</span>
                    <span className={styles.value}>{hotelBooking.confirmationNumber}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Booking Reference:</span>
                    <span className={styles.value}>{hotelBooking.bookingReferenceId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Hotel:</span>
                    <span className={styles.value}>{hotelBooking.hotel.hotelName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Location:</span>
                    <span className={styles.value}>
                      {hotelBooking.hotel.address}, {hotelBooking.hotel.cityName}, {hotelBooking.hotel.countryName}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Star Rating:</span>
                    <span className={styles.value}>{'⭐'.repeat(hotelBooking.hotel.starRating)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Check-in:</span>
                    <span className={styles.value}>
                      {hotelBooking.checkIn.toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Check-out:</span>
                    <span className={styles.value}>
                      {hotelBooking.checkOut.toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Room Type:</span>
                    <span className={styles.value}>{hotelBooking.hotel.roomType}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Meal Type:</span>
                    <span className={styles.value}>{hotelBooking.hotel.mealType}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Guests:</span>
                    <span className={styles.value}>
                      {hotelBooking.guestDetails.flatMap(room => 
                        room.customerNames.map(guest => 
                          `${guest.title} ${guest.firstName} ${guest.lastName}`
                        )
                      ).join(', ')}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Total Fare:</span>
                    <span className={styles.value}>
                      {hotelBooking.currency} {hotelBooking.totalFare}
                    </span>
                  </div>
                  {hotelBooking.voucherUrl && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Voucher:</span>
                      <a 
                        href={hotelBooking.voucherUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.voucherLink}
                      >
                        Download Voucher
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className={styles.infoCard}>
          <h3>Important Information</h3>
          <ul>
            <li>Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights.</li>
            <li>Carry a valid photo ID and your booking confirmation.</li>
            <li>Hotel check-in time is typically 2:00 PM and check-out is 11:00 AM.</li>
            <li>Contact details and vouchers have been sent to your registered email.</li>
            <li>For any changes or cancellations, please refer to the booking policies.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CombinedItineraryView;
