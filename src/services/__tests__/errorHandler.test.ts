/**
 * Error Handler Service Unit Tests
 * 
 * Tests error code mapping, recovery action logic, and workflow restart functionality.
 * 
 * Requirements: 3.4, 6.4, 7.5, 8.4
 */

import { describe, it, expect } from 'vitest';
import { errorHandler } from '../errorHandler';
import type { ApiErrorResponse, TekTravelsApiError } from '../../types/tekTravelsApi';

describe('ErrorHandler', () => {
  describe('handleError', () => {
    it('should handle ApiErrorResponse with invalid TraceId', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'INVALID_TRACEID',
          message: 'TraceId is invalid',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('Your session has expired. Please start a new search.');
      expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
      expect(result.errorCode).toBe('INVALID_TRACEID');
    });

    it('should handle flight unavailability error', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'FLIGHT_NOT_AVAILABLE',
          message: 'Flight is no longer available',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('This flight is no longer available. Please select another flight.');
      expect(result.recoveryAction.type).toBe('notify');
      expect(result.errorCode).toBe('FLIGHT_NOT_AVAILABLE');
    });

    it('should handle booking failure with session preservation', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'BOOKING_FAILED',
          message: 'Booking could not be completed',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('We couldn\'t complete your booking. Please try again.');
      expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      expect(result.errorCode).toBe('BOOKING_FAILED');
    });

    it('should handle network error with retry action', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('Unable to connect to the booking service. Please check your internet connection.');
      expect(result.recoveryAction).toEqual({ type: 'retry', delay: 2000 });
      expect(result.errorCode).toBe('NETWORK_ERROR');
    });

    it('should handle server error with fallback to mock data', () => {
      const error: ApiErrorResponse = {
        error: {
          code: '503',
          message: 'Service unavailable',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('Service temporarily unavailable. Please try again.');
      expect(result.recoveryAction).toEqual({ type: 'fallback', useMockData: true });
      expect(result.errorCode).toBe('503');
    });

    it('should handle generic Error with TraceId in message', () => {
      const error = new Error('Invalid TraceId provided');

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('Your session has expired. Please start a new search.');
      expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
      expect(result.errorCode).toBe('INVALID_TRACEID');
    });

    it('should handle generic Error with flight unavailability in message', () => {
      const error = new Error('Flight is not available');

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('This flight is no longer available. Please select another flight.');
      expect(result.recoveryAction.type).toBe('notify');
      expect(result.errorCode).toBe('FLIGHT_NOT_AVAILABLE');
    });

    it('should handle unknown error types', () => {
      const error = { someUnknownProperty: 'value' };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toBe('An unexpected error occurred. Please try again or contact support.');
      expect(result.recoveryAction.type).toBe('notify');
      expect(result.errorCode).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return correct message for TraceId errors', () => {
      expect(errorHandler.getUserFriendlyMessage('INVALID_TRACEID'))
        .toBe('Your session has expired. Please start a new search.');
      expect(errorHandler.getUserFriendlyMessage('TRACEID_EXPIRED'))
        .toBe('Your session has expired. Please start a new search.');
      expect(errorHandler.getUserFriendlyMessage('TRACEID_NOT_FOUND'))
        .toBe('Your session could not be found. Please start a new search.');
    });

    it('should return correct message for flight availability errors', () => {
      expect(errorHandler.getUserFriendlyMessage('FLIGHT_NOT_AVAILABLE'))
        .toBe('This flight is no longer available. Please select another flight.');
      expect(errorHandler.getUserFriendlyMessage('FLIGHT_SOLD_OUT'))
        .toBe('This flight is sold out. Please select another flight.');
      expect(errorHandler.getUserFriendlyMessage('SEAT_NOT_AVAILABLE'))
        .toBe('The selected seat is no longer available. Please choose another seat.');
    });

    it('should return correct message for booking errors', () => {
      expect(errorHandler.getUserFriendlyMessage('BOOKING_FAILED'))
        .toBe('We couldn\'t complete your booking. Please try again.');
      expect(errorHandler.getUserFriendlyMessage('PAYMENT_FAILED'))
        .toBe('Payment processing failed. Please check your payment details and try again.');
      expect(errorHandler.getUserFriendlyMessage('INVALID_PASSENGER_DATA'))
        .toBe('Some passenger information is invalid. Please review and correct the details.');
    });

    it('should return correct message for network errors', () => {
      expect(errorHandler.getUserFriendlyMessage('NETWORK_ERROR'))
        .toBe('Unable to connect to the booking service. Please check your internet connection.');
      expect(errorHandler.getUserFriendlyMessage('TIMEOUT'))
        .toBe('The request took too long. Please try again.');
      expect(errorHandler.getUserFriendlyMessage('ETIMEDOUT'))
        .toBe('Connection timed out. Please try again.');
    });

    it('should return correct message for HTTP status codes', () => {
      expect(errorHandler.getUserFriendlyMessage('400'))
        .toBe('Invalid request. Please check your information and try again.');
      expect(errorHandler.getUserFriendlyMessage('404'))
        .toBe('The requested resource was not found.');
      expect(errorHandler.getUserFriendlyMessage('500'))
        .toBe('Server error. Please try again later.');
      expect(errorHandler.getUserFriendlyMessage('503'))
        .toBe('Service temporarily unavailable. Please try again.');
    });

    it('should return default message for unknown error codes', () => {
      expect(errorHandler.getUserFriendlyMessage('SOME_UNKNOWN_CODE'))
        .toBe('An unexpected error occurred. Please try again or contact support.');
    });
  });

  describe('determineRecoveryAction', () => {
    it('should return restart action for TraceId errors', () => {
      const action = errorHandler.determineRecoveryAction('INVALID_TRACEID', false);
      expect(action).toEqual({ type: 'restart', fromStep: 'search' });
    });

    it('should return notify action for flight unavailability', () => {
      const action = errorHandler.determineRecoveryAction('FLIGHT_NOT_AVAILABLE', false);
      expect(action.type).toBe('notify');
      expect((action as any).message).toBe('This flight is no longer available. Please select another flight.');
    });

    it('should return preserve action for booking errors', () => {
      const action = errorHandler.determineRecoveryAction('BOOKING_FAILED', true);
      expect(action).toEqual({ type: 'preserve', allowRetry: true });
    });

    it('should return retry action for recoverable network errors', () => {
      const action = errorHandler.determineRecoveryAction('NETWORK_ERROR', true);
      expect(action).toEqual({ type: 'retry', delay: 2000 });
    });

    it('should return fallback action for server errors', () => {
      const action = errorHandler.determineRecoveryAction('500', true);
      expect(action).toEqual({ type: 'fallback', useMockData: true });
    });

    it('should return notify action for non-recoverable network errors', () => {
      const action = errorHandler.determineRecoveryAction('NETWORK_ERROR', false);
      expect(action.type).toBe('notify');
    });
  });

  describe('transformTekTravelsError', () => {
    it('should transform Tek Travels API error to ApiErrorResponse', () => {
      const tekTravelsError: TekTravelsApiError = {
        ErrorCode: '1',
        ErrorMessage: 'Invalid TraceId',
      };

      const result = errorHandler.transformTekTravelsError(tekTravelsError);

      expect(result.error.code).toBe('INVALID_TRACEID');
      expect(result.error.message).toBe('Invalid TraceId');
      expect(result.error.details?.originalCode).toBe('1');
      expect(result.recoverable).toBe(false);
    });

    it('should transform flight unavailability error', () => {
      const tekTravelsError: TekTravelsApiError = {
        ErrorCode: '2',
        ErrorMessage: 'Flight not available',
      };

      const result = errorHandler.transformTekTravelsError(tekTravelsError);

      expect(result.error.code).toBe('FLIGHT_NOT_AVAILABLE');
      expect(result.error.message).toBe('Flight not available');
      expect(result.recoverable).toBe(false);
    });

    it('should transform booking failure error', () => {
      const tekTravelsError: TekTravelsApiError = {
        ErrorCode: '3',
        ErrorMessage: 'Booking failed',
      };

      const result = errorHandler.transformTekTravelsError(tekTravelsError);

      expect(result.error.code).toBe('BOOKING_FAILED');
      expect(result.error.message).toBe('Booking failed');
      expect(result.recoverable).toBe(true);
    });

    it('should handle unknown Tek Travels error codes', () => {
      const tekTravelsError: TekTravelsApiError = {
        ErrorCode: '999',
        ErrorMessage: 'Unknown error',
      };

      const result = errorHandler.transformTekTravelsError(tekTravelsError);

      expect(result.error.code).toBe('999');
      expect(result.error.message).toBe('Unknown error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      const result = errorHandler.handleError(null);
      expect(result.errorCode).toBe('UNKNOWN_ERROR');
      expect(result.recoveryAction.type).toBe('notify');
    });

    it('should handle undefined error', () => {
      const result = errorHandler.handleError(undefined);
      expect(result.errorCode).toBe('UNKNOWN_ERROR');
      expect(result.recoveryAction.type).toBe('notify');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const result = errorHandler.handleError(error);
      expect(result.errorCode).toBe('UNKNOWN_ERROR');
    });

    it('should handle ApiErrorResponse with empty code', () => {
      const error: ApiErrorResponse = {
        error: {
          code: '',
          message: 'Some error',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again or contact support.');
    });

    it('should handle multiple error patterns in message', () => {
      const error = new Error('TraceId timeout during booking');
      const result = errorHandler.handleError(error);
      // Should prioritize TraceId error
      expect(result.errorCode).toBe('INVALID_TRACEID');
    });
  });

  describe('Recovery Action Scenarios', () => {
    it('should restart workflow for expired TraceId', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'TRACEID_EXPIRED',
          message: 'TraceId has expired',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);
      expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
    });

    it('should preserve session for payment failure', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'PAYMENT_FAILED',
          message: 'Payment processing failed',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);
      expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
    });

    it('should retry for timeout errors', () => {
      const error: ApiErrorResponse = {
        error: {
          code: '408',
          message: 'Request timeout',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);
      expect(result.recoveryAction).toEqual({ type: 'retry', delay: 2000 });
    });

    it('should fallback to mock for 502 error', () => {
      const error: ApiErrorResponse = {
        error: {
          code: '502',
          message: 'Bad gateway',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);
      expect(result.recoveryAction).toEqual({ type: 'fallback', useMockData: true });
    });
  });

  describe('Integration with Requirements', () => {
    // Requirement 3.4: Handle flight unavailability during re-pricing
    it('should handle re-pricing flight unavailability (Req 3.4)', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'FLIGHT_NOT_AVAILABLE',
          message: 'Flight no longer available',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);
      
      expect(result.userMessage).toContain('no longer available');
      expect(result.recoveryAction.type).toBe('notify');
    });

    // Requirement 6.4: Handle booking failures with session preservation
    it('should preserve session for booking failures (Req 6.4)', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'BOOKING_FAILED',
          message: 'Booking failed',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(error);
      
      expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
    });

    // Requirement 7.5: Restart workflow for invalid TraceId
    it('should restart workflow for invalid TraceId (Req 7.5)', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'INVALID_TRACEID',
          message: 'Invalid TraceId',
        },
        recoverable: false,
      };

      const result = errorHandler.handleError(error);
      
      expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
    });

    // Requirement 8.4: Display user-friendly messages
    it('should provide user-friendly messages (Req 8.4)', () => {
      const technicalError: ApiErrorResponse = {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ECONNREFUSED 127.0.0.1:8080',
        },
        recoverable: true,
      };

      const result = errorHandler.handleError(technicalError);
      
      // Should not expose technical details
      expect(result.userMessage).not.toContain('ECONNREFUSED');
      expect(result.userMessage).not.toContain('127.0.0.1');
      expect(result.userMessage).toBe('Unable to connect to the booking service. Please check your internet connection.');
    });
  });

  describe('Hotel Error Handling', () => {
    describe('Hotel Error Code Mapping', () => {
      it('should map HOTEL_NOT_AVAILABLE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_NOT_AVAILABLE',
            message: 'Hotel is no longer available',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('This hotel is no longer available. Please select another hotel.');
        expect(result.errorCode).toBe('HOTEL_NOT_AVAILABLE');
      });

      it('should map ROOM_SOLD_OUT error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'ROOM_SOLD_OUT',
            message: 'Room is sold out',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The selected room is sold out. Please choose another room type.');
        expect(result.errorCode).toBe('ROOM_SOLD_OUT');
      });

      it('should map INVALID_BOOKING_CODE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_BOOKING_CODE',
            message: 'BookingCode is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('Your session has expired. Please start a new search.');
        expect(result.errorCode).toBe('INVALID_BOOKING_CODE');
      });

      it('should map HOTEL_BOOKING_FAILED error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_BOOKING_FAILED',
            message: 'Hotel booking failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('We couldn\'t complete your hotel booking. Please try again.');
        expect(result.errorCode).toBe('HOTEL_BOOKING_FAILED');
      });

      it('should map HOTEL_CANCELLATION_FAILED error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_CANCELLATION_FAILED',
            message: 'Cancellation failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('Unable to cancel the booking. Please contact support.');
        expect(result.errorCode).toBe('HOTEL_CANCELLATION_FAILED');
      });

      it('should map INVALID_GUEST_DATA error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_GUEST_DATA',
            message: 'Guest data is invalid',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('Some guest information is invalid. Please review and correct the details.');
        expect(result.errorCode).toBe('INVALID_GUEST_DATA');
      });

      it('should map PREBOOK_FAILED error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'PREBOOK_FAILED',
            message: 'Pre-booking validation failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('Unable to validate hotel availability. Please try again.');
        expect(result.errorCode).toBe('PREBOOK_FAILED');
      });

      it('should map PRICE_CHANGED error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'PRICE_CHANGED',
            message: 'Price has changed',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The hotel price has changed. Please review the new price before continuing.');
        expect(result.errorCode).toBe('PRICE_CHANGED');
      });

      it('should map HOTEL_DETAILS_UNAVAILABLE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_DETAILS_UNAVAILABLE',
            message: 'Hotel details unavailable',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('Unable to retrieve hotel details. Please try again.');
        expect(result.errorCode).toBe('HOTEL_DETAILS_UNAVAILABLE');
      });

      it('should map INVALID_HOTEL_CODE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_HOTEL_CODE',
            message: 'Hotel code is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The selected hotel is invalid. Please start a new search.');
        expect(result.errorCode).toBe('INVALID_HOTEL_CODE');
      });

      it('should map INVALID_CITY_CODE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_CITY_CODE',
            message: 'City code is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The selected location is invalid. Please choose a different destination.');
        expect(result.errorCode).toBe('INVALID_CITY_CODE');
      });

      it('should map INVALID_DATE_RANGE error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_DATE_RANGE',
            message: 'Date range is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The selected dates are invalid. Please choose valid check-in and check-out dates.');
        expect(result.errorCode).toBe('INVALID_DATE_RANGE');
      });

      it('should map INVALID_GUEST_COUNT error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_GUEST_COUNT',
            message: 'Guest count is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The guest count is invalid. Please verify the number of adults and children.');
        expect(result.errorCode).toBe('INVALID_GUEST_COUNT');
      });

      it('should map BOOKING_REFERENCE_NOT_FOUND error code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'BOOKING_REFERENCE_NOT_FOUND',
            message: 'Booking reference not found',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.userMessage).toBe('The booking reference could not be found. Please check your confirmation number.');
        expect(result.errorCode).toBe('BOOKING_REFERENCE_NOT_FOUND');
      });
    });

    describe('Hotel Recovery Actions', () => {
      it('should restart workflow for invalid BookingCode', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_BOOKING_CODE',
            message: 'BookingCode is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
      });

      it('should notify user for hotel unavailability', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_NOT_AVAILABLE',
            message: 'Hotel is no longer available',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction.type).toBe('notify');
        expect((result.recoveryAction as any).message).toBe('This hotel is no longer available. Please select another hotel.');
      });

      it('should notify user for room sold out', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'ROOM_SOLD_OUT',
            message: 'Room is sold out',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction.type).toBe('notify');
        expect((result.recoveryAction as any).message).toBe('The selected room is sold out. Please choose another room type.');
      });

      it('should preserve session for hotel booking failure', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_BOOKING_FAILED',
            message: 'Hotel booking failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should preserve session for cancellation failure', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_CANCELLATION_FAILED',
            message: 'Cancellation failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should preserve session for invalid guest data', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_GUEST_DATA',
            message: 'Guest data is invalid',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should preserve session for prebook failure', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'PREBOOK_FAILED',
            message: 'Pre-booking validation failed',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should preserve session for hotel details unavailable', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'HOTEL_DETAILS_UNAVAILABLE',
            message: 'Hotel details unavailable',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should preserve session for booking reference not found', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'BOOKING_REFERENCE_NOT_FOUND',
            message: 'Booking reference not found',
          },
          recoverable: true,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should notify user for invalid hotel code', () => {
        const error: ApiErrorResponse = {
          error: {
            code: 'INVALID_HOTEL_CODE',
            message: 'Hotel code is invalid',
          },
          recoverable: false,
        };

        const result = errorHandler.handleError(error);

        expect(result.recoveryAction.type).toBe('notify');
      });
    });

    describe('Hotel Error Detection from Generic Errors', () => {
      it('should detect hotel unavailability from error message', () => {
        const error = new Error('Hotel is not available');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('HOTEL_NOT_AVAILABLE');
        expect(result.userMessage).toBe('This hotel is no longer available. Please select another hotel.');
      });

      it('should detect room sold out from error message', () => {
        const error = new Error('Room sold out');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('ROOM_SOLD_OUT');
        expect(result.userMessage).toBe('The selected room is sold out. Please choose another room type.');
      });

      it('should detect hotel booking failure from error message', () => {
        const error = new Error('Hotel booking failed');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('HOTEL_BOOKING_FAILED');
        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should detect hotel cancellation failure from error message', () => {
        const error = new Error('Hotel cancellation failed');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('HOTEL_CANCELLATION_FAILED');
        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should detect prebook failure from error message', () => {
        const error = new Error('Prebook validation failed');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('PREBOOK_FAILED');
        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should detect invalid guest data from error message', () => {
        const error = new Error('Guest information is invalid');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('INVALID_GUEST_DATA');
        expect(result.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should detect booking code error from error message', () => {
        const error = new Error('Invalid booking code provided');

        const result = errorHandler.handleError(error);

        expect(result.errorCode).toBe('INVALID_BOOKING_CODE');
        expect(result.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
      });
    });

    describe('TBO Hotel API Error Transformation', () => {
      it('should transform TBO Hotel API error with invalid booking code', () => {
        const tboError = {
          ErrorCode: '1',
          ErrorMessage: 'Invalid BookingCode',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_BOOKING_CODE');
        expect(result.error.message).toBe('Invalid BookingCode');
        expect(result.error.details?.originalCode).toBe('1');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with hotel not available', () => {
        const tboError = {
          ErrorCode: '2',
          ErrorMessage: 'Hotel not available',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('HOTEL_NOT_AVAILABLE');
        expect(result.error.message).toBe('Hotel not available');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with room sold out', () => {
        const tboError = {
          ErrorCode: '3',
          ErrorMessage: 'Room sold out',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('ROOM_SOLD_OUT');
        expect(result.error.message).toBe('Room sold out');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with booking failed', () => {
        const tboError = {
          ErrorCode: '4',
          ErrorMessage: 'Hotel booking failed',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('HOTEL_BOOKING_FAILED');
        expect(result.error.message).toBe('Hotel booking failed');
        expect(result.recoverable).toBe(true);
      });

      it('should transform TBO Hotel API error with invalid guest data', () => {
        const tboError = {
          ErrorCode: '5',
          ErrorMessage: 'Invalid guest information',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_GUEST_DATA');
        expect(result.error.message).toBe('Invalid guest information');
        expect(result.recoverable).toBe(true);
      });

      it('should transform TBO Hotel API error with prebook failed', () => {
        const tboError = {
          ErrorCode: '6',
          ErrorMessage: 'Pre-booking validation failed',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('PREBOOK_FAILED');
        expect(result.error.message).toBe('Pre-booking validation failed');
        expect(result.recoverable).toBe(true);
      });

      it('should transform TBO Hotel API error with cancellation failed', () => {
        const tboError = {
          ErrorCode: '7',
          ErrorMessage: 'Cancellation failed',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('HOTEL_CANCELLATION_FAILED');
        expect(result.error.message).toBe('Cancellation failed');
        expect(result.recoverable).toBe(true);
      });

      it('should transform TBO Hotel API error with booking reference not found', () => {
        const tboError = {
          ErrorCode: '8',
          ErrorMessage: 'Booking reference not found',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('BOOKING_REFERENCE_NOT_FOUND');
        expect(result.error.message).toBe('Booking reference not found');
        expect(result.recoverable).toBe(true);
      });

      it('should transform TBO Hotel API error with invalid hotel code', () => {
        const tboError = {
          ErrorCode: '9',
          ErrorMessage: 'Invalid hotel code',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_HOTEL_CODE');
        expect(result.error.message).toBe('Invalid hotel code');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with invalid city code', () => {
        const tboError = {
          ErrorCode: '10',
          ErrorMessage: 'Invalid city code',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_CITY_CODE');
        expect(result.error.message).toBe('Invalid city code');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with invalid date range', () => {
        const tboError = {
          ErrorCode: '11',
          ErrorMessage: 'Invalid date range',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_DATE_RANGE');
        expect(result.error.message).toBe('Invalid date range');
        expect(result.recoverable).toBe(false);
      });

      it('should transform TBO Hotel API error with invalid guest count', () => {
        const tboError = {
          ErrorCode: '12',
          ErrorMessage: 'Invalid guest count',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('INVALID_GUEST_COUNT');
        expect(result.error.message).toBe('Invalid guest count');
        expect(result.recoverable).toBe(false);
      });

      it('should handle TBO Hotel API error with lowercase field names', () => {
        const tboError = {
          errorCode: '4',
          errorMessage: 'Booking failed',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('HOTEL_BOOKING_FAILED');
        expect(result.error.message).toBe('Booking failed');
      });

      it('should handle TBO Hotel API error with generic message field', () => {
        const tboError = {
          ErrorCode: '4',
          message: 'Generic error message',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('HOTEL_BOOKING_FAILED');
        expect(result.error.message).toBe('Generic error message');
      });

      it('should handle TBO Hotel API error with missing error code', () => {
        const tboError = {
          ErrorMessage: 'Some error occurred',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('UNKNOWN_ERROR');
        expect(result.error.message).toBe('Some error occurred');
      });

      it('should handle unknown TBO Hotel API error codes', () => {
        const tboError = {
          ErrorCode: '999',
          ErrorMessage: 'Unknown error',
        };

        const result = errorHandler.transformTBOHotelError(tboError);

        expect(result.error.code).toBe('999');
        expect(result.error.message).toBe('Unknown error');
      });
    });

    describe('Integration with Existing Error Handler', () => {
      it('should handle both flight and hotel errors consistently', () => {
        const flightError: ApiErrorResponse = {
          error: {
            code: 'BOOKING_FAILED',
            message: 'Flight booking failed',
          },
          recoverable: true,
        };

        const hotelError: ApiErrorResponse = {
          error: {
            code: 'HOTEL_BOOKING_FAILED',
            message: 'Hotel booking failed',
          },
          recoverable: true,
        };

        const flightResult = errorHandler.handleError(flightError);
        const hotelResult = errorHandler.handleError(hotelError);

        // Both should preserve session for retry
        expect(flightResult.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
        expect(hotelResult.recoveryAction).toEqual({ type: 'preserve', allowRetry: true });
      });

      it('should handle session expiration for both flight and hotel', () => {
        const flightError: ApiErrorResponse = {
          error: {
            code: 'INVALID_TRACEID',
            message: 'TraceId expired',
          },
          recoverable: false,
        };

        const hotelError: ApiErrorResponse = {
          error: {
            code: 'INVALID_BOOKING_CODE',
            message: 'BookingCode expired',
          },
          recoverable: false,
        };

        const flightResult = errorHandler.handleError(flightError);
        const hotelResult = errorHandler.handleError(hotelError);

        // Both should restart workflow
        expect(flightResult.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
        expect(hotelResult.recoveryAction).toEqual({ type: 'restart', fromStep: 'search' });
      });

      it('should handle unavailability errors for both flight and hotel', () => {
        const flightError: ApiErrorResponse = {
          error: {
            code: 'FLIGHT_NOT_AVAILABLE',
            message: 'Flight unavailable',
          },
          recoverable: false,
        };

        const hotelError: ApiErrorResponse = {
          error: {
            code: 'HOTEL_NOT_AVAILABLE',
            message: 'Hotel unavailable',
          },
          recoverable: false,
        };

        const flightResult = errorHandler.handleError(flightError);
        const hotelResult = errorHandler.handleError(hotelError);

        // Both should notify user
        expect(flightResult.recoveryAction.type).toBe('notify');
        expect(hotelResult.recoveryAction.type).toBe('notify');
      });

      it('should provide user-friendly messages for all error types', () => {
        const errors = [
          'HOTEL_NOT_AVAILABLE',
          'ROOM_SOLD_OUT',
          'INVALID_BOOKING_CODE',
          'HOTEL_BOOKING_FAILED',
          'HOTEL_CANCELLATION_FAILED',
          'INVALID_GUEST_DATA',
          'PREBOOK_FAILED',
        ];

        errors.forEach(errorCode => {
          const message = errorHandler.getUserFriendlyMessage(errorCode);
          
          // Should not contain technical jargon
          expect(message).not.toContain('API');
          expect(message).not.toContain('code');
          expect(message).not.toContain('error');
          
          // Should be user-friendly
          expect(message.length).toBeGreaterThan(0);
          expect(message).toMatch(/^[A-Z]/); // Starts with capital letter
        });
      });
    });
  });
});
