/**
 * Example Usage of Re-Pricing Service
 * 
 * This file demonstrates how to use the repricing service in the booking workflow.
 */

import { repricingService } from '../repricingService';
import { bookingService } from '../bookingService';
import type { FlightResult } from '../../types/tekTravelsApi';

/**
 * Example: Complete repricing workflow
 * 
 * This shows how repricing integrates with the booking flow:
 * 1. User selects a flight from search results
 * 2. System starts booking session
 * 3. System calls repricing to validate current price
 * 4. System handles price changes or unavailability
 * 5. System proceeds to next step or notifies user
 */
export async function exampleRepricingWorkflow(
  selectedFlight: FlightResult,
  traceId: string
): Promise<void> {
  try {
    // Step 1: Start booking session (Requirement 7.4)
    const session = bookingService.startBooking(selectedFlight, traceId);
    console.log('Booking session started:', session.sessionId);

    // Step 2: Re-price the flight (Requirement 3.1)
    const originalPrice = selectedFlight.Fare.OfferedFare;
    const repricingResult = await repricingService.repriceFlight(
      traceId,
      selectedFlight.ResultIndex,
      originalPrice
    );

    // Step 3: Handle repricing result
    if (!repricingResult.available) {
      // Flight is no longer available (Requirement 3.4)
      console.error('Flight is no longer available');
      bookingService.cancelSession();
      throw new Error('Flight is no longer available. Please search again.');
    }

    if (repricingResult.priceChanged) {
      // Price has changed (Requirement 3.2)
      if (repricingResult.priceIncrease > 0) {
        console.warn(
          `Price increased by ${repricingResult.currency} ${repricingResult.priceIncrease}`
        );
        // In a real UI, this would show a confirmation dialog
        // For now, we'll just log and proceed
      } else {
        console.log(
          `Good news! Price decreased by ${repricingResult.currency} ${Math.abs(repricingResult.priceIncrease)}`
        );
      }

      // Update session with repriced flight (Requirement 3.5)
      bookingService.updateSession({
        repricedFlight: {
          ...selectedFlight,
          Fare: {
            ...selectedFlight.Fare,
            OfferedFare: repricingResult.currentPrice,
          },
        },
        status: 'seats',
      });
    } else {
      // Price unchanged, proceed automatically (Requirement 3.3)
      console.log('Price confirmed, proceeding to seat selection');
      bookingService.updateSession({
        status: 'seats',
      });
    }

    console.log('Repricing complete, ready for next step');
  } catch (error) {
    console.error('Repricing workflow failed:', error);
    bookingService.cancelSession();
    throw error;
  }
}

/**
 * Example: Handling price increase with user confirmation
 */
export async function examplePriceIncreaseHandling(
  selectedFlight: FlightResult,
  traceId: string,
  userConfirmsIncrease: (increase: number) => Promise<boolean>
): Promise<boolean> {
  const originalPrice = selectedFlight.Fare.OfferedFare;
  
  const repricingResult = await repricingService.repriceFlight(
    traceId,
    selectedFlight.ResultIndex,
    originalPrice
  );

  if (!repricingResult.available) {
    return false;
  }

  if (repricingResult.priceChanged && repricingResult.priceIncrease > 0) {
    // Ask user to confirm price increase (Requirement 3.2)
    const confirmed = await userConfirmsIncrease(repricingResult.priceIncrease);
    
    if (!confirmed) {
      console.log('User declined price increase');
      return false;
    }
  }

  // Update session with repriced flight
  bookingService.updateSession({
    repricedFlight: {
      ...selectedFlight,
      Fare: {
        ...selectedFlight.Fare,
        OfferedFare: repricingResult.currentPrice,
      },
    },
    status: 'seats',
  });

  return true;
}

/**
 * Example: Handling time changes
 */
export async function exampleTimeChangeHandling(
  selectedFlight: FlightResult,
  traceId: string
): Promise<void> {
  const originalPrice = selectedFlight.Fare.OfferedFare;
  
  const repricingResult = await repricingService.repriceFlight(
    traceId,
    selectedFlight.ResultIndex,
    originalPrice
  );

  if (repricingResult.isTimeChanged) {
    console.warn('Flight times have changed. Please review the updated schedule.');
    // In a real UI, this would show the updated flight times
  }

  if (repricingResult.available) {
    bookingService.updateSession({
      status: 'seats',
    });
  }
}
