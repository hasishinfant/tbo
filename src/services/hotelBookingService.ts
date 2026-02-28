/**
 * Hotel Booking Service
 * 
 * Manages the sequential hotel booking workflow and session state.
 * Maintains BookingCode consistency across all booking steps and handles session lifecycle.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import type { 
  Hotel, 
  PreBookResponse, 
  HotelBookingResponse,
  HotelBookingRequest,
  GuestDetail as ApiGuestDetail,
  CustomerName as ApiCustomerName
} from '../types/tboHotelApi';
import { getTboHotelApiClient } from './api/tboHotelApiClient';

// ============================================================================
// Types
// ============================================================================

export type HotelBookingStatus = 
  | 'search' 
  | 'details' 
  | 'prebook' 
  | 'guest_details' 
  | 'payment' 
  | 'confirmed';

export interface HotelBookingSession {
  sessionId: string;
  hotel: Hotel;
  searchCriteria: HotelSearchCriteria;
  bookingCode: string;
  preBookResult?: PreBookResult;
  status: HotelBookingStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface HotelSearchCriteria {
  checkIn: Date;
  checkOut: Date;
  hotelCodes?: string;
  cityCode?: string;
  guestNationality: string;
  paxRooms: PaxRoom[];
}

export interface PaxRoom {
  adults: number;
  children: number;
  childrenAges: number[];
}

export interface PreBookResult {
  bookingCode: string;
  originalPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  available: boolean;
}

export interface GuestDetails {
  roomIndex: number;
  customerNames: CustomerName[];
}

export interface CustomerName {
  title: string;
  firstName: string;
  lastName: string;
  type: 'Adult' | 'Child';
}

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  emailId?: string;
  phoneNumber?: string;
  // Additional payment fields would be added here
}

export interface HotelBookingConfirmation {
  confirmationNumber: string;
  bookingReferenceId: string;
  hotel: Hotel;
  guestDetails: GuestDetails[];
  totalFare: number;
  currency: string;
  checkIn: Date;
  checkOut: Date;
  bookedAt: Date;
  status: string;
  voucherUrl?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_STORAGE_KEY = 'hotel_booking_session';

// ============================================================================
// Service Implementation
// ============================================================================

class HotelBookingService {
  private currentSession: HotelBookingSession | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Initialize a new hotel booking session
   * 
   * @param hotel - The selected hotel to book
   * @param searchCriteria - The search criteria used to find the hotel
   * @returns The initialized booking session
   * 
   * Requirements: 7.1, 7.4
   */
  startBooking(hotel: Hotel, searchCriteria: HotelSearchCriteria): HotelBookingSession {
    // Cancel any existing session
    this.cancelSession();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

    const session: HotelBookingSession = {
      sessionId: this.generateSessionId(),
      hotel,
      searchCriteria,
      bookingCode: hotel.BookingCode,
      status: 'details',
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
   * 
   * Requirements: 7.2
   */
  getCurrentSession(): HotelBookingSession | null {
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
   * Requirements: 7.2, 7.4
   */
  updateSession(stepData: Partial<HotelBookingSession>): void {
    if (!this.currentSession) {
      throw new Error('No active hotel booking session');
    }

    // Check if session has expired
    if (new Date() > this.currentSession.expiresAt) {
      this.cancelSession();
      throw new Error('Hotel booking session has expired');
    }

    // Update session with new data
    this.currentSession = {
      ...this.currentSession,
      ...stepData,
    };

    this.persistSession(this.currentSession);
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
   * Complete the hotel booking with guest details and payment information
   * 
   * @param guestDetails - Guest information for each room
   * @param paymentInfo - Payment information
   * @returns Hotel booking confirmation
   * 
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
   */
  async completeBooking(
    guestDetails: GuestDetails[], 
    paymentInfo: PaymentInfo
  ): Promise<HotelBookingConfirmation> {
    const session = this.getCurrentSession();
    
    if (!session) {
      throw new Error('No active hotel booking session');
    }

    if (!session.preBookResult) {
      throw new Error('Pre-booking validation required before completing booking');
    }

    // Use the BookingCode from pre-book result (most recent)
    const bookingCode = session.preBookResult.bookingCode;

    // Transform guest details to API format
    const apiGuestDetails = this.transformGuestDetailsToApiFormat(guestDetails);

    // Generate unique reference IDs
    const clientReferenceId = this.generateClientReferenceId();
    const bookingReferenceId = this.generateBookingReferenceId();

    // Build the booking request
    const bookingRequest: HotelBookingRequest = {
      BookingCode: bookingCode,
      CustomerDetails: apiGuestDetails,
      ClientReferenceId: clientReferenceId,
      BookingReferenceId: bookingReferenceId,
      TotalFare: session.preBookResult.currentPrice,
      EmailId: paymentInfo.emailId || '',
      PhoneNumber: paymentInfo.phoneNumber || '',
      BookingType: 'API',
      PaymentMode: this.mapPaymentMethodToApiFormat(paymentInfo.method),
    };

    try {
      // Call the booking API
      const apiClient = getTboHotelApiClient();
      const response = await apiClient.createBooking(bookingRequest);

      // Generate booking confirmation from API response
      const confirmation = this.generateBookingConfirmation(
        response,
        session,
        guestDetails
      );

      // Update session status to confirmed
      this.updateSession({
        status: 'confirmed',
      });

      // Integrate with TravelSphere itinerary system
      await this.integrateWithItinerary(confirmation);

      return confirmation;
    } catch (error) {
      // Preserve session for retry on failure (Requirement 4.4)
      console.error('Hotel booking failed:', error);
      throw error;
    }
  }

  /**
   * Transform guest details from internal format to API format
   * 
   * Requirements: 4.1
   */
  private transformGuestDetailsToApiFormat(guestDetails: GuestDetails[]): ApiGuestDetail[] {
    return guestDetails.map(room => ({
      CustomerNames: room.customerNames.map(customer => ({
        Title: customer.title,
        FirstName: customer.firstName,
        LastName: customer.lastName,
        Type: customer.type,
      })),
    }));
  }

  /**
   * Generate booking confirmation from API response
   * 
   * Requirements: 4.2, 4.6
   */
  private generateBookingConfirmation(
    response: HotelBookingResponse,
    session: HotelBookingSession,
    guestDetails: GuestDetails[]
  ): HotelBookingConfirmation {
    return {
      confirmationNumber: response.ConfirmationNo,
      bookingReferenceId: response.BookingRefNo,
      hotel: session.hotel,
      guestDetails,
      totalFare: response.HotelDetails.TotalFare,
      currency: response.HotelDetails.CurrencyCode,
      checkIn: session.searchCriteria.checkIn,
      checkOut: session.searchCriteria.checkOut,
      bookedAt: new Date(),
      status: 'Confirmed',
      voucherUrl: response.VoucherUrl,
    };
  }

  /**
   * Integrate hotel booking with TravelSphere itinerary system
   * 
   * Requirements: 4.5
   */
  private async integrateWithItinerary(confirmation: HotelBookingConfirmation): Promise<void> {
    try {
      // Import itinerary service dynamically to avoid circular dependencies
      const { itineraryService } = await import('./itineraryService');
      
      // Transform confirmation to HotelBooking format for itinerary
      const hotelBooking = {
        confirmationNumber: confirmation.confirmationNumber,
        bookingReferenceId: confirmation.bookingReferenceId,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        hotelName: confirmation.hotel.hotelName,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        address: confirmation.hotel.address,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        cityName: confirmation.hotel.cityName,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        countryName: confirmation.hotel.countryName,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        starRating: confirmation.hotel.starRating,
        checkIn: confirmation.checkIn,
        checkOut: confirmation.checkOut,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        roomType: confirmation.hotel.roomType,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        mealType: confirmation.hotel.mealType,
        guests: confirmation.guestDetails.flatMap(room => 
          room.customerNames.map(guest => `${guest.title} ${guest.firstName} ${guest.lastName}`)
        ),
        totalFare: confirmation.totalFare,
        currency: confirmation.currency,
        status: confirmation.status,
        bookedAt: confirmation.bookedAt,
        // @ts-expect-error - API uses PascalCase, code uses camelCase
        refundable: confirmation.hotel.refundable,
      };
      
      // Add to itinerary service
      itineraryService.addHotelBooking(hotelBooking);
      
      // Also store in separate hotel bookings storage for backward compatibility
      const existingBookings = this.getStoredHotelBookings();
      existingBookings.push(confirmation);
      localStorage.setItem('hotel_bookings', JSON.stringify(existingBookings));
      
      console.log('Hotel booking integrated with itinerary:', confirmation.confirmationNumber);
    } catch (error) {
      console.error('Failed to integrate hotel booking with itinerary:', error);
      // Don't throw - booking is still successful even if itinerary integration fails
    }
  }

  /**
   * Get stored hotel bookings from local storage
   */
  private getStoredHotelBookings(): HotelBookingConfirmation[] {
    try {
      const stored = localStorage.getItem('hotel_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve stored hotel bookings:', error);
      return [];
    }
  }

  /**
   * Map payment method to API format
   */
  private mapPaymentMethodToApiFormat(method: string): string {
    // TBO API uses 'Limit' for credit limit payment mode
    // Map internal payment methods to API format
    const paymentModeMap: Record<string, string> = {
      'credit_card': 'Limit',
      'debit_card': 'Limit',
      'upi': 'Limit',
      'net_banking': 'Limit',
    };
    
    return paymentModeMap[method] || 'Limit';
  }

  /**
   * Generate unique client reference ID
   */
  private generateClientReferenceId(): string {
    return `TS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique booking reference ID
   */
  private generateBookingReferenceId(): string {
    return `BOOK_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Restore a session from storage (e.g., after page refresh)
   * 
   * @returns The restored session or null if no valid session exists
   * 
   * Requirements: 7.5
   */
  restoreSession(): HotelBookingSession | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const session: HotelBookingSession = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.expiresAt = new Date(session.expiresAt);
      session.searchCriteria.checkIn = new Date(session.searchCriteria.checkIn);
      session.searchCriteria.checkOut = new Date(session.searchCriteria.checkOut);

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        this.clearPersistedSession();
        return null;
      }

      this.currentSession = session;
      this.scheduleSessionTimeout();

      return session;
    } catch (error) {
      console.error('Failed to restore hotel booking session:', error);
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
    return `hotel_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Persist the session to localStorage
   */
  private persistSession(session: HotelBookingSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to persist hotel booking session:', error);
    }
  }

  /**
   * Clear the persisted session from localStorage
   */
  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persisted hotel booking session:', error);
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
        console.log('Hotel booking session expired');
        this.cancelSession();
      }, timeUntilExpiry);
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const hotelBookingService = new HotelBookingService();
export default hotelBookingService;
