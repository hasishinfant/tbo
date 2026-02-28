/**
 * Booking Service
 * 
 * Manages the sequential booking workflow and session state for flight bookings.
 * Maintains TraceId consistency across all booking steps and handles session lifecycle.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 7.3, 7.4
 */

import type { FlightResult, BookingRequest, ApiPassenger } from '../types/tekTravelsApi';
import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import type { BookingResponse } from '../types/tekTravelsApi';

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = 
  | 'search' 
  | 'repricing' 
  | 'seats' 
  | 'ancillary' 
  | 'passenger' 
  | 'payment' 
  | 'confirmed';

export interface BookingSession {
  traceId: string;
  sessionId: string;
  flight: FlightResult;
  repricedFlight?: FlightResult;
  selectedSeats?: SeatSelection[];
  ancillaryServices?: AncillarySelection[];
  fareRules?: FareRules;
  status: BookingStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface SeatSelection {
  passengerIndex: number;
  segmentIndex: number;
  seatNumber: string;
}

export interface AncillarySelection {
  passengerIndex: number;
  type: 'baggage' | 'meal';
  code: string;
}

export interface FareRules {
  cancellationPolicy: string;
  changeFee: number;
  refundable: boolean;
  baggageAllowance: BaggageAllowance;
  restrictions: string[];
}

export interface BaggageAllowance {
  checkedBags: number;
  checkedBagWeight: number;
  carryOnBags: number;
  carryOnWeight: number;
  unit: 'kg' | 'lbs';
}

export interface PassengerDetails {
  type: 'Adult' | 'Child' | 'Infant';
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: Date;
  email?: string;
  phone?: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  // Additional payment fields would be added here
}

export interface BookingConfirmation {
  bookingReference: string;
  pnr: string;
  ticketNumbers: string[];
  flight: FlightResult;
  passengers: PassengerDetails[];
  totalPrice: number;
  currency: string;
  bookedAt: Date;
  ancillaryServices?: AncillarySelection[];
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_STORAGE_KEY = 'booking_session';

// ============================================================================
// Service Implementation
// ============================================================================

class BookingService {
  private currentSession: BookingSession | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Initialize a new booking session
   * 
   * @param flight - The selected flight to book
   * @param traceId - The TraceId from the flight search
   * @returns The initialized booking session
   * 
   * Requirements: 7.3, 7.4
   */
  startBooking(flight: FlightResult, traceId: string): BookingSession {
    // Cancel any existing session
    this.cancelSession();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

    const session: BookingSession = {
      traceId,
      sessionId: this.generateSessionId(),
      flight,
      status: 'repricing',
      createdAt: now,
      expiresAt,
    };

    this.currentSession = session;
    this.persistSession(session);
    this.scheduleSessionTimeout();

    return session;
  }

  /**
   * Get the current active booking session
   * 
   * @returns The current session or null if no active session
   */
  getCurrentSession(): BookingSession | null {
    // Check if session has expired
    if (this.currentSession && new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      return null;
    }

    return this.currentSession;
  }

  /**
   * Update the current session with new data
   * 
   * @param stepData - Partial session data to update
   * 
   * Requirements: 7.3, 7.4
   */
  updateSession(stepData: Partial<BookingSession>): void {
    if (!this.currentSession) {
      throw new Error('No active booking session');
    }

    // Check if session has expired
    if (new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      throw new Error('Booking session has expired');
    }

    // Update session with new data
    this.currentSession = {
      ...this.currentSession,
      ...stepData,
    };

    this.persistSession(this.currentSession);
  }

  /**
   * Complete the booking and finalize the session
   * 
   * @param passengerDetails - Details of all passengers
   * @param payment - Payment information
   * @returns Promise resolving to booking confirmation
   * 
   * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
   */
  async completeBooking(
    passengerDetails: PassengerDetails[],
    payment: PaymentInfo
  ): Promise<BookingConfirmation> {
    if (!this.currentSession) {
      throw new Error('No active booking session');
    }

    // Check if session has expired
    if (new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      throw new Error('Booking session has expired');
    }

    // Update session status to payment
    this.updateSession({ status: 'payment' });

    try {
      // Transform passenger details to API format
      const apiPassengers = this.transformPassengersToApiFormat(passengerDetails);

      // Get the flight to book (use repriced flight if available)
      const flightToBook = this.currentSession.repricedFlight || this.currentSession.flight;

      // Prepare booking request
      const bookingRequest: Omit<BookingRequest, 'TokenId'> = {
        EndUserIp: this.getEndUserIp(),
        TraceId: this.currentSession.traceId,
        ResultIndex: flightToBook.ResultIndex,
        Passengers: apiPassengers,
      };

      // Call booking API
      const apiClient = getTekTravelsApiClient();
      const bookingResponse = await apiClient.createBooking(bookingRequest);

      // Generate booking confirmation from API response
      const confirmation = this.generateBookingConfirmation(
        bookingResponse,
        passengerDetails,
        flightToBook
      );

      // Update session status to confirmed
      this.updateSession({ status: 'confirmed' });

      // Integrate with TravelSphere itinerary system
      await this.integrateWithItinerary(confirmation);

      // Clean up session after successful booking
      this.cancelSession();

      return confirmation;
    } catch (error) {
      // Preserve session for retry on booking failure
      console.error('Booking failed:', error);
      throw error;
    }
  }

  /**
   * Cancel the current booking session and clean up resources
   * 
   * Requirements: 7.3
   */
  cancelSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.currentSession = null;
    this.clearPersistedSession();
  }

  /**
   * Restore a session from storage (e.g., after page refresh)
   * 
   * @returns The restored session or null if no valid session exists
   */
  restoreSession(): BookingSession | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const session: BookingSession = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.expiresAt = new Date(session.expiresAt);

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        this.clearPersistedSession();
        return null;
      }

      this.currentSession = session;
      this.scheduleSessionTimeout();

      return session;
    } catch (error) {
      console.error('Failed to restore booking session:', error);
      this.clearPersistedSession();
      return null;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Persist the session to localStorage
   */
  private persistSession(session: BookingSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to persist booking session:', error);
    }
  }

  /**
   * Clear the persisted session from localStorage
   */
  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persisted session:', error);
    }
  }

  /**
   * Schedule automatic session timeout
   * 
   * Requirements: 7.3
   */
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
        console.log('Booking session expired');
        this.cancelSession();
      }, timeUntilExpiry);
    }
  }

  /**
   * Transform passenger details to Tek Travels API format
   * 
   * Requirements: 6.1
   */
  private transformPassengersToApiFormat(passengers: PassengerDetails[]): ApiPassenger[] {
    return passengers.map((passenger, index) => {
      // Map passenger type to API format
      const paxTypeMap: Record<string, number> = {
        'Adult': 1,
        'Child': 2,
        'Infant': 3,
      };

      // Map gender from title (simplified approach)
      const gender = ['Mr'].includes(passenger.title) ? 1 : 2; // 1=Male, 2=Female

      // Format date of birth to YYYY-MM-DD
      const dateOfBirth = passenger.dateOfBirth.toISOString().split('T')[0];

      // Format passport expiry if available
      const passportExpiry = passenger.passportExpiry 
        ? passenger.passportExpiry.toISOString().split('T')[0]
        : '';

      return {
        Title: passenger.title,
        FirstName: passenger.firstName,
        LastName: passenger.lastName,
        PaxType: paxTypeMap[passenger.type] || 1,
        DateOfBirth: dateOfBirth,
        Gender: gender,
        PassportNo: passenger.passportNumber || '',
        PassportExpiry: passportExpiry,
        AddressLine1: 'N/A', // Would be collected in a real implementation
        City: 'N/A',
        CountryCode: passenger.nationality.substring(0, 2).toUpperCase(),
        CountryName: passenger.nationality,
        Nationality: passenger.nationality,
        ContactNo: passenger.phone || '',
        Email: passenger.email || '',
        IsLeadPax: index === 0, // First passenger is lead
      };
    });
  }

  /**
   * Generate booking confirmation from API response
   * 
   * Requirements: 6.2, 6.6
   */
  private generateBookingConfirmation(
    response: BookingResponse,
    passengers: PassengerDetails[],
    flight: FlightResult
  ): BookingConfirmation {
    const { Response } = response;

    // Extract ticket numbers from passenger info
    const ticketNumbers = Response.FlightItinerary.Passenger.map(
      (p) => p.Ticket.TicketNumber
    );

    return {
      bookingReference: Response.BookingId.toString(),
      pnr: Response.PNR,
      ticketNumbers,
      flight,
      passengers,
      totalPrice: Response.FlightItinerary.Fare.OfferedFare,
      currency: Response.FlightItinerary.Fare.Currency,
      bookedAt: new Date(),
      ancillaryServices: this.currentSession?.ancillaryServices,
    };
  }

  /**
   * Get end user IP address
   * 
   * In a real implementation, this would get the actual user's IP.
   * For now, we use a placeholder.
   */
  private getEndUserIp(): string {
    // In a browser environment, you'd typically get this from the server
    // or use a service to detect the user's IP
    return '127.0.0.1';
  }

  /**
   * Integrate booking with TravelSphere itinerary system
   * 
   * Requirements: 6.5
   */
  private async integrateWithItinerary(confirmation: BookingConfirmation): Promise<void> {
    try {
      // Import itinerary service dynamically to avoid circular dependencies
      const { itineraryService } = await import('./itineraryService');
      
      // Transform confirmation to FlightBooking format for itinerary
      const flightBooking = {
        bookingReference: confirmation.bookingReference,
        pnr: confirmation.pnr,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        airline: confirmation.flight.airline,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        flightNumber: confirmation.flight.flightNumber,
        departure: {
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          airport: confirmation.flight.origin,
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          city: confirmation.flight.origin,
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          time: confirmation.flight.departureTime,
        },
        arrival: {
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          airport: confirmation.flight.destination,
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          city: confirmation.flight.destination,
          // @ts-expect-error - API uses PascalCase, code uses camelCase
          time: confirmation.flight.arrivalTime,
        },
        passengers: confirmation.passengers.map(p => `${p.title} ${p.firstName} ${p.lastName}`),
        totalFare: confirmation.totalPrice,
        currency: confirmation.currency,
        status: 'Confirmed',
        bookedAt: confirmation.bookedAt,
      };
      
      // Add to itinerary service
      itineraryService.addFlightBooking(flightBooking);
      
      console.log('Flight booking integrated with itinerary:', confirmation.bookingReference);
    } catch (error) {
      console.error('Failed to integrate with itinerary:', error);
      // Don't throw - booking is still successful even if itinerary integration fails
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const bookingService = new BookingService();
export default bookingService;
