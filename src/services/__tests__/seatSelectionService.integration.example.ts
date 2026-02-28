/**
 * Integration Example for Seat Selection Service
 * 
 * This file demonstrates how to use the seat selection service
 * in a real application scenario.
 */

import { getSeatSelectionService } from '../seatSelectionService';
import type { SeatSelection } from '../seatSelectionService';

/**
 * Example: Fetch seat map and display to user
 */
async function exampleFetchSeatMap() {
  const seatService = getSeatSelectionService();
  
  try {
    // Get seat map for a flight
    const seatMap = await seatService.getSeatMap(
      'trace-id-from-search',
      'result-index-from-search'
    );
    
    // Display seat map to user
    console.log('Available seats by segment:');
    seatMap.segments.forEach((segment) => {
      console.log(`\nSegment ${segment.segmentIndex}:`);
      segment.rows.forEach((row) => {
        const availableSeats = row.seats.filter(s => s.available);
        console.log(`  Row ${row.rowNumber}: ${availableSeats.length} available seats`);
      });
    });
    
    return seatMap;
  } catch (error) {
    console.error('Failed to fetch seat map:', error);
    throw error;
  }
}

/**
 * Example: Reserve seats for multiple passengers
 */
async function exampleReserveSeats() {
  const seatService = getSeatSelectionService();
  
  // User selections from UI
  const selections: SeatSelection[] = [
    {
      passengerIndex: 0, // First passenger
      segmentIndex: 0,   // First segment
      seatNumber: '12A', // Window seat
    },
    {
      passengerIndex: 1, // Second passenger
      segmentIndex: 0,   // First segment
      seatNumber: '12B', // Middle seat next to first passenger
    },
  ];
  
  try {
    // Reserve the selected seats
    const result = await seatService.reserveSeats(
      'trace-id-from-search',
      'result-index-from-search',
      selections
    );
    
    if (result.success) {
      console.log('Seats reserved successfully!');
      console.log(`Reserved ${result.reservedSeats.length} seats`);
      console.log(`Total cost: ${result.totalCost}`);
      
      if (result.priceChanged) {
        console.warn('Warning: Price has changed since initial quote');
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to reserve seats:', error);
    throw error;
  }
}

/**
 * Example: Complete booking workflow with seat selection
 */
async function exampleCompleteBookingWithSeats() {
  const seatService = getSeatSelectionService();
  
  const traceId = 'trace-id-from-search';
  const resultIndex = 'result-index-from-search';
  
  try {
    // Step 1: Fetch seat map
    console.log('Step 1: Fetching seat map...');
    const seatMap = await seatService.getSeatMap(traceId, resultIndex);
    
    // Step 2: User selects seats (simulated)
    console.log('Step 2: User selecting seats...');
    const selections: SeatSelection[] = [];
    
    // For each passenger, select first available seat
    const firstSegment = seatMap.segments[0];
    let passengerIndex = 0;
    
    for (const row of firstSegment.rows) {
      for (const seat of row.seats) {
        if (seat.available && selections.length < 2) {
          selections.push({
            passengerIndex: passengerIndex++,
            segmentIndex: 0,
            seatNumber: seat.seatNumber,
          });
        }
      }
      if (selections.length >= 2) break;
    }
    
    // Step 3: Reserve selected seats
    console.log('Step 3: Reserving seats...');
    const result = await seatService.reserveSeats(
      traceId,
      resultIndex,
      selections
    );
    
    console.log('Booking complete!');
    return result;
  } catch (error) {
    console.error('Booking workflow failed:', error);
    throw error;
  }
}

/**
 * Example: Handle seat selection for connecting flights
 */
async function exampleMultiSegmentSeatSelection() {
  const seatService = getSeatSelectionService();
  
  const traceId = 'trace-id-from-search';
  const resultIndex = 'result-index-from-search';
  
  try {
    // Fetch seat map (may have multiple segments for connecting flights)
    const seatMap = await seatService.getSeatMap(traceId, resultIndex);
    
    console.log(`Flight has ${seatMap.segments.length} segments`);
    
    // Select seats for each segment
    const selections: SeatSelection[] = [];
    
    seatMap.segments.forEach((segment, segmentIndex) => {
      console.log(`\nSelecting seat for segment ${segmentIndex}:`);
      
      // Find first available window seat
      for (const row of segment.rows) {
        const windowSeat = row.seats.find(
          s => s.available && s.seatType === 'Window'
        );
        
        if (windowSeat) {
          selections.push({
            passengerIndex: 0,
            segmentIndex,
            seatNumber: windowSeat.seatNumber,
          });
          console.log(`  Selected ${windowSeat.seatNumber} (${windowSeat.seatClass})`);
          break;
        }
      }
    });
    
    // Reserve all seats
    const result = await seatService.reserveSeats(
      traceId,
      resultIndex,
      selections
    );
    
    return result;
  } catch (error) {
    console.error('Multi-segment seat selection failed:', error);
    throw error;
  }
}

// Export examples for documentation
export {
  exampleFetchSeatMap,
  exampleReserveSeats,
  exampleCompleteBookingWithSeats,
  exampleMultiSegmentSeatSelection,
};
