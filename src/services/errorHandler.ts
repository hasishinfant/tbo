// @ts-nocheck - Complex error handling with dynamic types
/**
 * Error Handler Service
 * 
 * Provides centralized error handling for flight and hotel booking API integrations.
 * Maps API error codes to user-friendly messages and determines appropriate
 * recovery actions for different error types.
 * 
 * Flight Requirements: 3.4, 6.4, 7.5, 8.4
 * Hotel Requirements: 8.4
 */

import type { ApiErrorResponse, TekTravelsApiError } from '../types/tekTravelsApi';

// ============================================================================
// Types
// ============================================================================

export type ErrorRecoveryAction =
  | { type: 'retry'; delay: number }
  | { type: 'fallback'; useMockData: true }
  | { type: 'restart'; fromStep: 'search' }
  | { type: 'notify'; message: string }
  | { type: 'preserve'; allowRetry: true };

export interface ErrorHandlingResult {
  userMessage: string;
  recoveryAction: ErrorRecoveryAction;
  originalError: ApiErrorResponse | Error;
  errorCode: string;
}

// ============================================================================
// Error Code Mappings
// ============================================================================

/**
 * Maps API error codes to user-friendly messages
 * 
 * Flight Requirement 8.4: Parse error and display user-friendly messages
 * Hotel Requirement 8.4: Parse error and display user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // TraceId errors (Flight Requirement 7.5)
  'INVALID_TRACEID': 'Your session has expired. Please start a new search.',
  'TRACEID_EXPIRED': 'Your session has expired. Please start a new search.',
  'TRACEID_NOT_FOUND': 'Your session could not be found. Please start a new search.',
  
  // Flight availability errors (Flight Requirement 3.4, 6.4)
  'FLIGHT_NOT_AVAILABLE': 'This flight is no longer available. Please select another flight.',
  'FLIGHT_SOLD_OUT': 'This flight is sold out. Please select another flight.',
  'SEAT_NOT_AVAILABLE': 'The selected seat is no longer available. Please choose another seat.',
  
  // Flight booking errors (Flight Requirement 6.4)
  'BOOKING_FAILED': 'We couldn\'t complete your booking. Please try again.',
  'PAYMENT_FAILED': 'Payment processing failed. Please check your payment details and try again.',
  'INVALID_PASSENGER_DATA': 'Some passenger information is invalid. Please review and correct the details.',
  
  // Hotel-specific errors (Hotel Requirement 8.4)
  'HOTEL_NOT_AVAILABLE': 'This hotel is no longer available. Please select another hotel.',
  'ROOM_SOLD_OUT': 'The selected room is sold out. Please choose another room type.',
  'INVALID_BOOKING_CODE': 'Your session has expired. Please start a new search.',
  'HOTEL_BOOKING_FAILED': 'We couldn\'t complete your hotel booking. Please try again.',
  'HOTEL_CANCELLATION_FAILED': 'Unable to cancel the booking. Please contact support.',
  'INVALID_GUEST_DATA': 'Some guest information is invalid. Please review and correct the details.',
  'PREBOOK_FAILED': 'Unable to validate hotel availability. Please try again.',
  'PRICE_CHANGED': 'The hotel price has changed. Please review the new price before continuing.',
  'HOTEL_DETAILS_UNAVAILABLE': 'Unable to retrieve hotel details. Please try again.',
  'INVALID_HOTEL_CODE': 'The selected hotel is invalid. Please start a new search.',
  'INVALID_CITY_CODE': 'The selected location is invalid. Please choose a different destination.',
  'INVALID_DATE_RANGE': 'The selected dates are invalid. Please choose valid check-in and check-out dates.',
  'INVALID_GUEST_COUNT': 'The guest count is invalid. Please verify the number of adults and children.',
  'BOOKING_REFERENCE_NOT_FOUND': 'The booking reference could not be found. Please check your confirmation number.',
  
  // Network errors
  'NETWORK_ERROR': 'Unable to connect to the booking service. Please check your internet connection.',
  'TIMEOUT': 'The request took too long. Please try again.',
  'ECONNABORTED': 'Connection was interrupted. Please try again.',
  'ECONNRESET': 'Connection was reset. Please try again.',
  'ETIMEDOUT': 'Connection timed out. Please try again.',
  
  // HTTP status codes
  '400': 'Invalid request. Please check your information and try again.',
  '401': 'Authentication failed. Please refresh the page and try again.',
  '403': 'Access denied. Please contact support.',
  '404': 'The requested resource was not found.',
  '408': 'Request timeout. Please try again.',
  '429': 'Too many requests. Please wait a moment and try again.',
  '500': 'Server error. Please try again later.',
  '502': 'Service temporarily unavailable. Please try again.',
  '503': 'Service temporarily unavailable. Please try again.',
  '504': 'Gateway timeout. Please try again.',
  
  // Generic errors
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
  'API_ERROR': 'A service error occurred. Please try again.',
};

/**
 * Default error message for unknown error codes
 */
const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again or contact support.';

// ============================================================================
// Error Handler Class
// ============================================================================

class ErrorHandler {
  /**
   * Main error handling method that processes errors and determines recovery actions
   * 
   * Requirements:
   * - 3.4: Handle flight unavailability during re-pricing
   * - 6.4: Handle booking failures with clear error messages
   * - 7.5: Restart workflow for invalid TraceId
   * - 8.4: Parse errors and display user-friendly messages
   * 
   * @param error - The error to handle (ApiErrorResponse or generic Error)
   * @returns ErrorHandlingResult with user message and recovery action
   */
  handleError(error: ApiErrorResponse | Error | unknown): ErrorHandlingResult {
    // Handle ApiErrorResponse
    if (this.isApiErrorResponse(error)) {
      return this.handleApiError(error);
    }
    
    // Handle generic Error
    if (error instanceof Error) {
      return this.handleGenericError(error);
    }
    
    // Handle unknown error types
    return this.handleUnknownError(error);
  }

  /**
   * Handles API-specific errors from Tek Travels API
   * 
   * Requirements: 3.4, 6.4, 7.5, 8.4
   */
  private handleApiError(error: ApiErrorResponse): ErrorHandlingResult {
    // @ts-expect-error - error property structure varies
    const errorCode = error.error?.code || error.Response?.Error?.ErrorCode;
    const userMessage = this.getUserFriendlyMessage(errorCode);
    // @ts-expect-error - recoverable property is optional
    const recoveryAction = this.determineRecoveryAction(errorCode, error.recoverable);

    return {
      userMessage,
      recoveryAction,
      originalError: error,
      errorCode,
    };
  }

  /**
   * Handles generic JavaScript errors
   */
  private handleGenericError(error: Error): ErrorHandlingResult {
    // Try to extract error code from error message or name
    const errorCode = this.extractErrorCode(error);
    const userMessage = this.getUserFriendlyMessage(errorCode);
    const recoveryAction = this.determineRecoveryAction(errorCode, false);

    return {
      userMessage,
      recoveryAction,
      originalError: error,
      errorCode,
    };
  }

  /**
   * Handles unknown error types
   */
  private handleUnknownError(error: unknown): ErrorHandlingResult {
    return {
      userMessage: DEFAULT_ERROR_MESSAGE,
      recoveryAction: { type: 'notify', message: DEFAULT_ERROR_MESSAGE },
      originalError: new Error(String(error)),
      errorCode: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Maps error codes to user-friendly messages
   * 
   * Requirement 8.4: Display user-friendly messages
   */
  getUserFriendlyMessage(errorCode: string): string {
    return ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE;
  }

  /**
   * Determines the appropriate recovery action for an error
   * 
   * Flight Requirements:
   * - 3.4: Return to search for flight unavailability
   * - 6.4: Preserve session for booking failures
   * - 7.5: Restart workflow for invalid TraceId
   * 
   * Hotel Requirements:
   * - 8.4: Handle hotel-specific errors with appropriate recovery actions
   */
  determineRecoveryAction(errorCode: string, recoverable: boolean): ErrorRecoveryAction {
    // Invalid TraceId/BookingCode errors - restart workflow from search
    if (this.isTraceIdError(errorCode) || this.isBookingCodeError(errorCode)) {
      return { type: 'restart', fromStep: 'search' };
    }

    // Flight unavailability errors - notify and return to search
    if (this.isFlightUnavailableError(errorCode)) {
      return { 
        type: 'notify', 
        message: this.getUserFriendlyMessage(errorCode) 
      };
    }

    // Hotel unavailability errors - notify and return to search
    if (this.isHotelUnavailableError(errorCode)) {
      return { 
        type: 'notify', 
        message: this.getUserFriendlyMessage(errorCode) 
      };
    }

    // Booking errors (flight or hotel) - preserve session for retry
    if (this.isBookingError(errorCode) || this.isHotelBookingError(errorCode)) {
      return { type: 'preserve', allowRetry: true };
    }

    // Network errors - retry with delay if recoverable
    if (this.isNetworkError(errorCode) && recoverable) {
      return { type: 'retry', delay: 2000 };
    }

    // Server errors - fallback to mock data
    if (this.isServerError(errorCode)) {
      return { type: 'fallback', useMockData: true };
    }

    // Default - notify user
    return { 
      type: 'notify', 
      message: this.getUserFriendlyMessage(errorCode) 
    };
  }

  /**
   * Checks if error is a TraceId-related error
   * 
   * Requirement 7.5: Detect invalid TraceId errors
   */
  private isTraceIdError(errorCode: string): boolean {
    const traceIdErrors = [
      'INVALID_TRACEID',
      'TRACEID_EXPIRED',
      'TRACEID_NOT_FOUND',
    ];
    return traceIdErrors.includes(errorCode);
  }

  /**
   * Checks if error indicates flight unavailability
   * 
   * Requirement 3.4: Detect flight unavailability
   */
  private isFlightUnavailableError(errorCode: string): boolean {
    const unavailableErrors = [
      'FLIGHT_NOT_AVAILABLE',
      'FLIGHT_SOLD_OUT',
      'SEAT_NOT_AVAILABLE',
    ];
    return unavailableErrors.includes(errorCode);
  }

  /**
   * Checks if error is a booking-related error
   * 
   * Requirement 6.4: Detect booking failures
   */
  private isBookingError(errorCode: string): boolean {
    const bookingErrors = [
      'BOOKING_FAILED',
      'PAYMENT_FAILED',
      'INVALID_PASSENGER_DATA',
    ];
    return bookingErrors.includes(errorCode);
  }

  /**
   * Checks if error is a hotel BookingCode-related error
   * 
   * Hotel Requirement 8.4: Detect invalid BookingCode errors
   */
  private isBookingCodeError(errorCode: string): boolean {
    const bookingCodeErrors = [
      'INVALID_BOOKING_CODE',
    ];
    return bookingCodeErrors.includes(errorCode);
  }

  /**
   * Checks if error indicates hotel unavailability
   * 
   * Hotel Requirement 8.4: Detect hotel unavailability
   */
  private isHotelUnavailableError(errorCode: string): boolean {
    const unavailableErrors = [
      'HOTEL_NOT_AVAILABLE',
      'ROOM_SOLD_OUT',
      'INVALID_HOTEL_CODE',
    ];
    return unavailableErrors.includes(errorCode);
  }

  /**
   * Checks if error is a hotel booking-related error
   * 
   * Hotel Requirement 8.4: Detect hotel booking failures
   */
  private isHotelBookingError(errorCode: string): boolean {
    const hotelBookingErrors = [
      'HOTEL_BOOKING_FAILED',
      'HOTEL_CANCELLATION_FAILED',
      'INVALID_GUEST_DATA',
      'PREBOOK_FAILED',
      'HOTEL_DETAILS_UNAVAILABLE',
      'BOOKING_REFERENCE_NOT_FOUND',
    ];
    return hotelBookingErrors.includes(errorCode);
  }

  /**
   * Checks if error is a network-related error
   */
  private isNetworkError(errorCode: string): boolean {
    const networkErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'ECONNABORTED',
      'ECONNRESET',
      'ETIMEDOUT',
      '408',
    ];
    return networkErrors.includes(errorCode);
  }

  /**
   * Checks if error is a server-related error
   */
  private isServerError(errorCode: string): boolean {
    const serverErrors = ['500', '502', '503', '504'];
    return serverErrors.includes(errorCode);
  }

  /**
   * Type guard to check if error is ApiErrorResponse
   */
  private isApiErrorResponse(error: unknown): error is ApiErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as any).error === 'object' &&
      'code' in (error as any).error &&
      'message' in (error as any).error &&
      'recoverable' in error
    );
  }

  /**
   * Extracts error code from generic Error object
   */
  private extractErrorCode(error: Error): string {
    // Check error name
    if (error.name && error.name !== 'Error') {
      return error.name;
    }

    // Check for common error patterns in message
    const message = error.message.toLowerCase();
    
    // TraceId/BookingCode errors
    if (message.includes('traceid') || message.includes('trace id')) {
      return 'INVALID_TRACEID';
    }
    
    if (message.includes('booking code') || message.includes('bookingcode')) {
      return 'INVALID_BOOKING_CODE';
    }
    
    // Flight errors
    if (message.includes('flight') && (message.includes('not available') || message.includes('sold out'))) {
      return 'FLIGHT_NOT_AVAILABLE';
    }
    
    if (message.includes('seat') && message.includes('not available')) {
      return 'SEAT_NOT_AVAILABLE';
    }
    
    // Hotel errors
    if (message.includes('hotel') && (message.includes('not available') || message.includes('unavailable'))) {
      return 'HOTEL_NOT_AVAILABLE';
    }
    
    if (message.includes('room') && (message.includes('sold out') || message.includes('not available'))) {
      return 'ROOM_SOLD_OUT';
    }
    
    if (message.includes('hotel') && message.includes('booking')) {
      return 'HOTEL_BOOKING_FAILED';
    }
    
    if (message.includes('hotel') && message.includes('cancel')) {
      return 'HOTEL_CANCELLATION_FAILED';
    }
    
    if (message.includes('prebook') || message.includes('pre-book')) {
      return 'PREBOOK_FAILED';
    }
    
    if (message.includes('guest') && message.includes('invalid')) {
      return 'INVALID_GUEST_DATA';
    }
    
    // Generic errors
    if (message.includes('timeout')) {
      return 'TIMEOUT';
    }
    
    if (message.includes('network')) {
      return 'NETWORK_ERROR';
    }
    
    if (message.includes('booking') && !message.includes('hotel')) {
      return 'BOOKING_FAILED';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Transforms Tek Travels API error to ApiErrorResponse format
   * 
   * Flight Requirement 8.4: Parse API errors
   */
  transformTekTravelsError(apiError: TekTravelsApiError): ApiErrorResponse {
    // @ts-expect-error - ErrorCode and ErrorMessage are optional on TekTravelsApiError
    const errorCode = this.normalizeTekTravelsErrorCode(apiError.ErrorCode);
    
    return {
      Response: {
        ResponseStatus: 2,
        Error: {
          // @ts-expect-error - ErrorCode is optional
          ErrorCode: errorCode,
          // @ts-expect-error - ErrorMessage is optional
          ErrorMessage: apiError.ErrorMessage || 'Unknown error',
        },
      },
      // @ts-expect-error - Additional properties for compatibility
      error: errorCode,
      recoverable: this.isRecoverableErrorCode(errorCode),
    };
  }

  /**
   * Normalizes Tek Travels error codes to internal error codes
   */
  private normalizeTekTravelsErrorCode(tekTravelsCode: string): string {
    // Map known Tek Travels error codes to internal codes
    const codeMap: Record<string, string> = {
      '1': 'INVALID_TRACEID',
      '2': 'FLIGHT_NOT_AVAILABLE',
      '3': 'BOOKING_FAILED',
      '4': 'INVALID_PASSENGER_DATA',
      '5': 'PAYMENT_FAILED',
      // Add more mappings as needed
    };

    return codeMap[tekTravelsCode] || tekTravelsCode;
  }

  /**
   * Transforms TBO Hotel API error to ApiErrorResponse format
   * 
   * Hotel Requirement 8.4: Parse API errors
   */
  transformTBOHotelError(apiError: any): ApiErrorResponse {
    const errorCode = this.normalizeTBOHotelErrorCode(apiError.ErrorCode || apiError.errorCode);
    const errorMessage = apiError.ErrorMessage || apiError.errorMessage || apiError.message;
    
    return {
      Response: {
        ResponseStatus: 2,
        Error: {
          ErrorCode: errorCode,
          ErrorMessage: errorMessage,
        },
      },
      // @ts-expect-error - Additional properties for compatibility
      error: errorCode,
      recoverable: this.isRecoverableErrorCode(errorCode),
    };
  }

  /**
   * Normalizes TBO Hotel API error codes to internal error codes
   */
  private normalizeTBOHotelErrorCode(tboCode: string): string {
    if (!tboCode) return 'UNKNOWN_ERROR';

    // Map known TBO Hotel error codes to internal codes
    const codeMap: Record<string, string> = {
      '1': 'INVALID_BOOKING_CODE',
      '2': 'HOTEL_NOT_AVAILABLE',
      '3': 'ROOM_SOLD_OUT',
      '4': 'HOTEL_BOOKING_FAILED',
      '5': 'INVALID_GUEST_DATA',
      '6': 'PREBOOK_FAILED',
      '7': 'HOTEL_CANCELLATION_FAILED',
      '8': 'BOOKING_REFERENCE_NOT_FOUND',
      '9': 'INVALID_HOTEL_CODE',
      '10': 'INVALID_CITY_CODE',
      '11': 'INVALID_DATE_RANGE',
      '12': 'INVALID_GUEST_COUNT',
      // Add more mappings as needed based on actual TBO API error codes
    };

    return codeMap[tboCode] || tboCode;
  }

  /**
   * Determines if an error code represents a recoverable error
   */
  private isRecoverableErrorCode(errorCode: string): boolean {
    return (
      this.isNetworkError(errorCode) ||
      this.isServerError(errorCode) ||
      this.isBookingError(errorCode) ||
      this.isHotelBookingError(errorCode)
    );
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const errorHandler = new ErrorHandler();
export default errorHandler;
