/**
 * Combined Booking Service
 * 
 * Coordinates flight and hotel bookings together, managing both sessions
 * and providing a unified booking experience.
 * 
 * Requirements: All (from hotel-booking-api-integration spec)
 */

import { bookingService, type BookingSession, type PassengerDetails, type PaymentInfo as FlightPaymentInfo, type BookingConfirmation } from './bookingService';
import { hotelBookingService, type HotelBookingSession, type GuestDetails, type PaymentInfo as HotelPaymentInfo, type HotelBookingConfirmation } from './hotelBookingService';
import type { FlightResult } from '../types/tekTravelsApi';
import type { Hotel } from '../types/tboHotelApi';
import type { HotelSearchCriteria } from './hotelBookingService';

// ============================================================================
// Types
// ============================================================================

export type CombinedBookingStatus = 
  | 'flight_selection'
  | 'hotel_selection'
  | 'flight_repricing'
  | 'hotel_prebook'
  | 'passenger_details'
  | 'guest_details'
  | 'payment'
  | 'confirming'
  | 'completed';

export interface CombinedBookingSession {
  sessionId: string;
  flightSession?: BookingSession;
  hotelSession?: HotelBookingSession;
  status: CombinedBookingStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface CombinedPaymentInfo {
  method: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  emailId: string;
  phoneNumber: string;
}

export interface CombinedBookingConfirmation {
  sessionId: string;
  flightBooking?: BookingConfirmation;
  hotelBooking?: HotelBookingConfirmation;
  totalCost: number;
  currency: string;
  bookedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_TIMEOUT_MINUTES = 30;
const COMBINED_SESSION_STORAGE_KEY = 'combined_booking_session';

// ============================================================================
// Service Implementation
// ============================================================================

class CombinedBookingService {
  private currentSession: CombinedBookingSession | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Start a combined booking session with flight and hotel
   * 
   * @param flight - Selected flight to book
   * @param traceId - TraceId from flight search
   * @param hotel - Selected hotel to book
   * @param hotelSearchCriteria - Hotel search criteria
   * @returns Combined booking session
   */
  startCombinedBooking(
    flight: FlightResult,
    traceId: string,
    hotel: Hotel,
    hotelSearchCriteria: HotelSearchCriteria
  ): CombinedBookingSession {
    // Cancel any existing session
    this.cancelSession();

    // Start individual booking sessions
    const flightSession = bookingService.startBooking(flight, traceId);
    const hotelSession = hotelBookingService.startBooking(hotel, hotelSearchCriteria);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

    const session: CombinedBookingSession = {
      sessionId: this.generateSessionId(),
      flightSession,
      hotelSession,
      status: 'flight_repricing',
      createdAt: now,
      expiresAt,
    };

    this.currentSession = session;
    this.persistSession(session);
    this.scheduleSessionTimeout();

    return session;
  }

  /**
   * Start a flight-only booking session
   */
  startFlightOnlyBooking(flight: FlightResult, traceId: string): CombinedBookingSession {
    this.cancelSession();

    const flightSession = bookingService.startBooking(flight, traceId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

    const session: CombinedBookingSession = {
      sessionId: this.generateSessionId(),
      flightSession,
      status: 'flight_repricing',
      createdAt: now,
      expiresAt,
    };

    this.currentSession = session;
    this.persistSession(session);
    this.scheduleSessionTimeout();

    return session;
  }

  /**
   * Start a hotel-only booking session
   */
  startHotelOnlyBooking(hotel: Hotel, hotelSearchCriteria: HotelSearchCriteria): CombinedBookingSession {
    this.cancelSession();

    const hotelSession = hotelBookingService.startBooking(hotel, hotelSearchCriteria);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

    const session: CombinedBookingSession = {
      sessionId: this.generateSessionId(),
      hotelSession,
      status: 'hotel_prebook',
      createdAt: now,
      expiresAt,
    };

    this.currentSession = session;
    this.persistSession(session);
    this.scheduleSessionTimeout();

    return session;
  }

  /**
   * Get the current active combined booking session
   */
  getCurrentSession(): CombinedBookingSession | null {
    if (this.currentSession && new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      return null;
    }

    return this.currentSession;
  }

  /**
   * Update the combined session status
   */
  updateSessionStatus(status: CombinedBookingStatus): void {
    if (!this.currentSession) {
      throw new Error('No active combined booking session');
    }

    if (new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      throw new Error('Combined booking session has expired');
    }

    this.currentSession.status = status;
    this.persistSession(this.currentSession);
  }

  /**
   * Complete the combined booking with all details
   * 
   * @param passengerDetails - Flight passenger details (if flight booking exists)
   * @param guestDetails - Hotel guest details (if hotel booking exists)
   * @param paymentInfo - Combined payment information
   * @returns Combined booking confirmation
   */
  async completeCombinedBooking(
    passengerDetails: PassengerDetails[] | null,
    guestDetails: GuestDetails[] | null,
    paymentInfo: CombinedPaymentInfo
  ): Promise<CombinedBookingConfirmation> {
    const session = this.getCurrentSession();
    
    if (!session) {
      throw new Error('No active combined booking session');
    }

    this.updateSessionStatus('confirming');

    let flightBooking: BookingConfirmation | undefined;
    let hotelBooking: HotelBookingConfirmation | undefined;
    let totalCost = 0;
    let currency = 'USD';

    try {
      // Book flight if session exists
      if (session.flightSession && passengerDetails) {
        const flightPayment: FlightPaymentInfo = {
          method: paymentInfo.method,
        };
        
        flightBooking = await bookingService.completeBooking(passengerDetails, flightPayment);
        totalCost += flightBooking.totalPrice;
        currency = flightBooking.currency;
      }

      // Book hotel if session exists
      if (session.hotelSession && guestDetails) {
        const hotelPayment: HotelPaymentInfo = {
          method: paymentInfo.method,
          emailId: paymentInfo.emailId,
          phoneNumber: paymentInfo.phoneNumber,
        };
        
        hotelBooking = await hotelBookingService.completeBooking(guestDetails, hotelPayment);
        totalCost += hotelBooking.totalFare;
        
        // Use hotel currency if no flight booking
        if (!flightBooking) {
          currency = hotelBooking.currency;
        }
      }

      // Create combined confirmation
      const confirmation: CombinedBookingConfirmation = {
        sessionId: session.sessionId,
        flightBooking,
        hotelBooking,
        totalCost,
        currency,
        bookedAt: new Date(),
      };

      // Update session status
      this.updateSessionStatus('completed');

      // Clean up session
      this.cancelSession();

      return confirmation;
    } catch (error) {
      console.error('Combined booking failed:', error);
      throw error;
    }
  }

  /**
   * Cancel the combined booking session
   */
  cancelSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Cancel individual sessions
    if (this.currentSession?.flightSession) {
      bookingService.cancelSession();
    }
    
    if (this.currentSession?.hotelSession) {
      hotelBookingService.cancelSession();
    }

    this.currentSession = null;
    this.clearPersistedSession();
  }

  /**
   * Restore a combined session from storage
   */
  restoreSession(): CombinedBookingSession | null {
    try {
      const stored = localStorage.getItem(COMBINED_SESSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const session: CombinedBookingSession = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.expiresAt = new Date(session.expiresAt);

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        this.clearPersistedSession();
        return null;
      }

      // Restore individual sessions
      if (session.flightSession) {
        bookingService.restoreSession();
      }
      
      if (session.hotelSession) {
        hotelBookingService.restoreSession();
      }

      this.currentSession = session;
      this.scheduleSessionTimeout();

      return session;
    } catch (error) {
      console.error('Failed to restore combined booking session:', error);
      this.clearPersistedSession();
      return null;
    }
  }

  /**
   * Calculate total estimated cost for the combined booking
   */
  calculateTotalCost(): number {
    const session = this.getCurrentSession();
    if (!session) {
      return 0;
    }

    let total = 0;

    // Add flight cost
    if (session.flightSession) {
      const flight = session.flightSession.repricedFlight || session.flightSession.flight;
      total += flight.Fare.OfferedFare;
    }

    // Add hotel cost
    if (session.hotelSession?.preBookResult) {
      total += session.hotelSession.preBookResult.currentPrice;
    } else if (session.hotelSession?.hotel) {
      // @ts-expect-error - API uses PascalCase, code uses camelCase
      total += session.hotelSession.hotel.price;
    }

    return total;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateSessionId(): string {
    return `combined_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private persistSession(session: CombinedBookingSession): void {
    try {
      localStorage.setItem(COMBINED_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to persist combined booking session:', error);
    }
  }

  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(COMBINED_SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persisted combined session:', error);
    }
  }

  private scheduleSessionTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (!this.currentSession) {
      return;
    }

    const timeUntilExpiry = this.currentSession.expiresAt.getTime() - Date.now();

    if (timeUntilExpiry > 0) {
      this.timeoutId = setTimeout(() => {
        console.log('Combined booking session expired');
        this.cancelSession();
      }, timeUntilExpiry);
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const combinedBookingService = new CombinedBookingService();
export default combinedBookingService;
