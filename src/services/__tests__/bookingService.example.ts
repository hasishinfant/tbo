/**
 * Example Usage of Booking Service
 * 
 * This file demonstrates how to use the booking service in the application.
 * It shows the typical workflow from starting a booking to updating session state.
 */

import { bookingService } from '../bookingService';
import type { FlightResult } from '../../types/tekTravelsApi';

/**
 * Example: Complete booking workflow
 */
export function exampleBookingWorkflow() {
  // Step 1: User selects a flight from search results
  const selectedFlight: FlightResult = {
    // ... flight data from search results
  } as FlightResult;

  const traceId = 'trace-abc-123'; // From search API response

  // Step 2: Start booking session
  const session = bookingService.startBooking(selectedFlight, traceId);
  console.log('Booking session started:', session.sessionId);
  console.log('Session expires at:', session.expiresAt);

  // Step 3: After re-pricing, update session with repriced flight
  bookingService.updateSession({
    repricedFlight: selectedFlight, // Updated flight with current price
    status: 'seats',
  });

  // Step 4: After seat selection, update session with selected seats
  bookingService.updateSession({
    selectedSeats: [
      { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' },
      { passengerIndex: 1, segmentIndex: 0, seatNumber: '12B' },
    ],
    status: 'ancillary',
  });

  // Step 5: After ancillary selection, update session
  bookingService.updateSession({
    ancillaryServices: [
      { passengerIndex: 0, type: 'baggage', code: 'BAG-20KG' },
      { passengerIndex: 0, type: 'meal', code: 'MEAL-VEG' },
    ],
    status: 'passenger',
  });

  // Step 6: Get current session to display in UI
  const currentSession = bookingService.getCurrentSession();
  console.log('Current booking status:', currentSession?.status);

  // Step 7: User cancels booking
  bookingService.cancelSession();
}

/**
 * Example: Session restoration after page refresh
 */
export function exampleSessionRestoration() {
  // On page load, try to restore previous session
  const restoredSession = bookingService.restoreSession();

  if (restoredSession) {
    console.log('Restored booking session:', restoredSession.sessionId);
    console.log('Current step:', restoredSession.status);
    
    // Continue from where user left off
    return restoredSession;
  } else {
    console.log('No active booking session found');
    return null;
  }
}

/**
 * Example: Handling session expiration
 */
export function exampleSessionExpiration() {
  try {
    // Try to update session
    bookingService.updateSession({ status: 'seats' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      console.log('Session has expired, redirecting to search...');
      // Redirect user back to search page
      window.location.href = '/search';
    }
  }
}

/**
 * Example: React component integration
 */
export function exampleReactIntegration() {
  // In a React component:
  /*
  import { useEffect, useState } from 'react';
  import { bookingService } from '@/services/bookingService';
  
  function BookingWorkflow() {
    const [session, setSession] = useState(bookingService.getCurrentSession());
    
    useEffect(() => {
      // Restore session on mount
      const restored = bookingService.restoreSession();
      if (restored) {
        setSession(restored);
      }
    }, []);
    
    const handleStartBooking = (flight: FlightResult, traceId: string) => {
      const newSession = bookingService.startBooking(flight, traceId);
      setSession(newSession);
    };
    
    const handleUpdateSession = (data: Partial<BookingSession>) => {
      bookingService.updateSession(data);
      setSession(bookingService.getCurrentSession());
    };
    
    const handleCancelBooking = () => {
      bookingService.cancelSession();
      setSession(null);
    };
    
    return (
      <div>
        {session ? (
          <div>
            <h2>Booking in Progress</h2>
            <p>Status: {session.status}</p>
            <p>Expires: {session.expiresAt.toLocaleString()}</p>
          </div>
        ) : (
          <p>No active booking</p>
        )}
      </div>
    );
  }
  */
}
