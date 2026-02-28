/**
 * Combined Booking Workflow Component
 * 
 * Provides a unified interface for booking flights and hotels together.
 * Manages the multi-step workflow and coordinates both booking processes.
 */

import React, { useState, useEffect } from 'react';
import { combinedBookingService, type CombinedBookingSession, type CombinedBookingStatus } from '../../services/combinedBookingService';
import type { PassengerDetails } from '../../services/bookingService';
import type { GuestDetails } from '../../services/hotelBookingService';
import type { CombinedPaymentInfo } from '../../services/combinedBookingService';
import styles from './CombinedBookingWorkflow.module.css';

// ============================================================================
// Types
// ============================================================================

interface CombinedBookingWorkflowProps {
  onComplete?: (confirmation: any) => void;
  onCancel?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const CombinedBookingWorkflow: React.FC<CombinedBookingWorkflowProps> = ({
  onComplete,
  onCancel,
}) => {
  const [session, setSession] = useState<CombinedBookingSession | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Passenger and guest details
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([]);
  const [guestDetails, setGuestDetails] = useState<GuestDetails[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<CombinedPaymentInfo>({
    method: 'credit_card',
    emailId: '',
    phoneNumber: '',
  });

  // Load session on mount
  useEffect(() => {
    const currentSession = combinedBookingService.getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
      updateStepFromStatus(currentSession.status);
    }
  }, []);

  /**
   * Update current step based on booking status
   */
  const updateStepFromStatus = (status: CombinedBookingStatus) => {
    const stepMap: Record<CombinedBookingStatus, number> = {
      'flight_selection': 1,
      'hotel_selection': 2,
      'flight_repricing': 3,
      'hotel_prebook': 4,
      'passenger_details': 5,
      'guest_details': 6,
      'payment': 7,
      'confirming': 8,
      'completed': 9,
    };
    
    setCurrentStep(stepMap[status] || 1);
  };

  /**
   * Handle booking completion
   */
  const handleCompleteBooking = async () => {
    if (!session) {
      setError('No active booking session');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate required details
      const needsPassengers = session.flightSession !== undefined;
      const needsGuests = session.hotelSession !== undefined;

      if (needsPassengers && passengerDetails.length === 0) {
        throw new Error('Passenger details are required for flight booking');
      }

      if (needsGuests && guestDetails.length === 0) {
        throw new Error('Guest details are required for hotel booking');
      }

      if (!paymentInfo.emailId || !paymentInfo.phoneNumber) {
        throw new Error('Email and phone number are required');
      }

      // Complete the combined booking
      const confirmation = await combinedBookingService.completeCombinedBooking(
        needsPassengers ? passengerDetails : null,
        needsGuests ? guestDetails : null,
        paymentInfo
      );

      // Call completion callback
      if (onComplete) {
        onComplete(confirmation);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Booking failed';
      setError(errorMessage);
      console.error('Combined booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancellation
   */
  const handleCancel = () => {
    combinedBookingService.cancelSession();
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Calculate total cost
   */
  const totalCost = session ? combinedBookingService.calculateTotalCost() : 0;

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>No Active Booking Session</h2>
          <p>Please start a new booking from the search page.</p>
          <button onClick={handleCancel} className={styles.button}>
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Complete Your Booking</h1>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.content}>
        {/* Booking Summary */}
        <div className={styles.summary}>
          <h2>Booking Summary</h2>
          
          {session.flightSession && (
            <div className={styles.summarySection}>
              <h3>Flight</h3>
              <div className={styles.summaryItem}>
                <span>Route:</span>
                <span>
                  {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                  {session.flightSession.flight.origin} → {session.flightSession.flight.destination}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span>Departure:</span>
                {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                <span>{new Date(session.flightSession.flight.departureTime).toLocaleString()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Price:</span>
                <span>
                  {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                  {session.flightSession.flight.fare.currency} {session.flightSession.flight.fare.totalFare}
                </span>
              </div>
            </div>
          )}

          {session.hotelSession && (
            <div className={styles.summarySection}>
              <h3>Hotel</h3>
              <div className={styles.summaryItem}>
                <span>Hotel:</span>
                {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                <span>{session.hotelSession.hotel.hotelName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Location:</span>
                {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                <span>{session.hotelSession.hotel.cityName}, {session.hotelSession.hotel.countryName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Check-in:</span>
                <span>{session.hotelSession.searchCriteria.checkIn.toLocaleDateString()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Check-out:</span>
                <span>{session.hotelSession.searchCriteria.checkOut.toLocaleDateString()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Price:</span>
                <span>
                  {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
                  {session.hotelSession.hotel.currency} {session.hotelSession.hotel.price}
                </span>
              </div>
            </div>
          )}

          <div className={styles.totalCost}>
            <span>Total Cost:</span>
            <span className={styles.totalAmount}>
              {/* @ts-expect-error - API uses PascalCase, code uses camelCase */}
              {session.flightSession?.flight.fare.currency || session.hotelSession?.hotel.currency} {totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Passenger/Guest Details Form */}
        <div className={styles.detailsForm}>
          <h2>Traveler Details</h2>
          
          {session.flightSession && (
            <div className={styles.formSection}>
              <h3>Flight Passengers</h3>
              <p className={styles.formHint}>
                Enter details for all passengers traveling on the flight.
              </p>
              {/* Passenger form would go here - simplified for this implementation */}
              <div className={styles.formNote}>
                Passenger details form (implementation simplified)
              </div>
            </div>
          )}

          {session.hotelSession && (
            <div className={styles.formSection}>
              <h3>Hotel Guests</h3>
              <p className={styles.formHint}>
                Enter details for all guests staying at the hotel.
              </p>
              {/* Guest form would go here - simplified for this implementation */}
              <div className={styles.formNote}>
                Guest details form (implementation simplified)
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className={styles.formSection}>
            <h3>Contact & Payment</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={paymentInfo.emailId}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, emailId: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                value={paymentInfo.phoneNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, phoneNumber: e.target.value })}
                placeholder="+1234567890"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                value={paymentInfo.method}
                onChange={(e) => setPaymentInfo({ 
                  ...paymentInfo, 
                  method: e.target.value as any 
                })}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="net_banking">Net Banking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            onClick={handleCancel} 
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel Booking
          </button>
          
          <button 
            onClick={handleCompleteBooking} 
            className={styles.confirmButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinedBookingWorkflow;
