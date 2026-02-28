/**
 * Seat Selection Service
 * 
 * This service handles seat map retrieval and seat reservation for flights.
 * It transforms API seat data to internal models and validates seat selections.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6
 */

import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import type {
  SeatMapRequest,
  SeatMapResponse,
  SeatSellRequest,
  SeatSellResponse,
  SegmentSeat,
  SeatInfo,
  SeatDynamic,
} from '../types/tekTravelsApi';

// ============================================================================
// Internal Types
// ============================================================================

export interface SeatMap {
  segments: SegmentSeatMap[];
}

export interface SegmentSeatMap {
  segmentIndex: number;
  rows: SeatRow[];
  aircraft: string;
}

export interface SeatRow {
  rowNumber: number;
  seats: Seat[];
}

export interface Seat {
  seatNumber: string;
  available: boolean;
  seatType: 'Window' | 'Middle' | 'Aisle';
  seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  price: number;
  currency: string;
  features: string[];
}

export interface SeatSelection {
  passengerIndex: number;
  segmentIndex: number;
  seatNumber: string;
}

export interface SeatReservationResult {
  success: boolean;
  reservedSeats: SeatSelection[];
  totalCost: number;
  priceChanged: boolean;
}

// ============================================================================
// Seat Selection Service
// ============================================================================

export class SeatSelectionService {
  private apiClient = getTekTravelsApiClient();

  /**
   * Get seat map for a flight
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @returns Seat map with categorized seats
   * 
   * Requirements: 4.1, 4.2
   */
  async getSeatMap(traceId: string, resultIndex: string): Promise<SeatMap> {
    try {
      const request: Omit<SeatMapRequest, 'TokenId'> = {
        EndUserIp: this.getEndUserIp(),
        TraceId: traceId,
        ResultIndex: resultIndex,
      };

      const response: SeatMapResponse = await this.apiClient.getSeatMap(request);

      // Check for API errors
      if (response.Response.Error) {
        throw new Error(
          `Seat map API error: ${response.Response.Error.ErrorMessage}`
        );
      }

      // Transform API response to internal model
      return this.transformSeatMapResponse(response);
    } catch (error) {
      console.error('Error fetching seat map:', error);
      throw error;
    }
  }

  /**
   * Reserve selected seats
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @param selections - Array of seat selections
   * @returns Reservation result with success status and total cost
   * 
   * Requirements: 4.3, 4.6
   */
  async reserveSeats(
    traceId: string,
    resultIndex: string,
    selections: SeatSelection[]
  ): Promise<SeatReservationResult> {
    try {
      // Validate seat selections
      this.validateSeatSelections(selections);

      // Transform selections to API format
      const seatDynamic: SeatDynamic[] = selections.map((selection) => ({
        SegmentIndex: selection.segmentIndex,
        PassengerIndex: selection.passengerIndex,
        SeatNo: selection.seatNumber,
      }));

      const request: Omit<SeatSellRequest, 'TokenId'> = {
        EndUserIp: this.getEndUserIp(),
        TraceId: traceId,
        ResultIndex: resultIndex,
        SeatDynamic: seatDynamic,
      };

      const response: SeatSellResponse = await this.apiClient.sellSeats(request);

      // Check for API errors
      if (response.Response.Error) {
        throw new Error(
          `Seat reservation API error: ${response.Response.Error.ErrorMessage}`
        );
      }

      // Calculate total cost (would need seat map data for accurate pricing)
      // For now, we'll return 0 as the API doesn't provide total cost in response
      const totalCost = 0;

      return {
        success: true,
        reservedSeats: selections,
        totalCost,
        priceChanged: response.Response.IsPriceChanged,
      };
    } catch (error) {
      console.error('Error reserving seats:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Transform API seat map response to internal model
   */
  private transformSeatMapResponse(response: SeatMapResponse): SeatMap {
    const segments: SegmentSeatMap[] = response.Response.SeatLayout.SegmentSeat.map(
      (segmentSeat: SegmentSeat) => {
        // Group seats by row number
        const seatsByRow = this.groupSeatsByRow(segmentSeat.Seats);

        // Convert to SeatRow array
        const rows: SeatRow[] = Array.from(seatsByRow.entries())
          .sort(([rowA], [rowB]) => rowA - rowB)
          .map(([rowNumber, seats]) => ({
            rowNumber,
            seats: seats.map((seatInfo) => this.transformSeat(seatInfo)),
          }));

        return {
          segmentIndex: segmentSeat.SegmentIndex,
          rows,
          aircraft: 'Unknown', // API doesn't provide aircraft type in seat map
        };
      }
    );

    return { segments };
  }

  /**
   * Group seats by row number
   */
  private groupSeatsByRow(seats: SeatInfo[]): Map<number, SeatInfo[]> {
    const seatsByRow = new Map<number, SeatInfo[]>();

    for (const seat of seats) {
      const rowSeats = seatsByRow.get(seat.RowNo) || [];
      rowSeats.push(seat);
      seatsByRow.set(seat.RowNo, rowSeats);
    }

    return seatsByRow;
  }

  /**
   * Transform API seat info to internal Seat model
   */
  private transformSeat(seatInfo: SeatInfo): Seat {
    return {
      seatNumber: seatInfo.SeatNo,
      available: seatInfo.SeatWayType === 1, // 1=Available
      seatType: this.mapSeatType(seatInfo.SeatType),
      seatClass: this.mapSeatClass(seatInfo.Compartment),
      price: seatInfo.Price,
      currency: seatInfo.Currency,
      features: this.extractSeatFeatures(seatInfo),
    };
  }

  /**
   * Map API seat type to internal type
   */
  private mapSeatType(seatType: number): 'Window' | 'Middle' | 'Aisle' {
    switch (seatType) {
      case 1:
        return 'Window';
      case 2:
        return 'Middle';
      case 3:
        return 'Aisle';
      default:
        return 'Middle';
    }
  }

  /**
   * Map API compartment to internal seat class
   */
  private mapSeatClass(
    compartment: number
  ): 'Economy' | 'Premium Economy' | 'Business' | 'First' {
    switch (compartment) {
      case 1:
        return 'Economy';
      case 2:
        return 'Premium Economy';
      case 3:
        return 'Business';
      case 4:
        return 'First';
      default:
        return 'Economy';
    }
  }

  /**
   * Extract seat features based on seat info
   */
  private extractSeatFeatures(seatInfo: SeatInfo): string[] {
    const features: string[] = [];

    // Add features based on seat type
    if (seatInfo.SeatType === 1) {
      features.push('Window View');
    } else if (seatInfo.SeatType === 3) {
      features.push('Easy Access');
    }

    // Add features based on compartment
    if (seatInfo.Compartment === 2) {
      features.push('Extra Legroom');
    } else if (seatInfo.Compartment === 3) {
      features.push('Lie-flat Seat', 'Priority Boarding');
    } else if (seatInfo.Compartment === 4) {
      features.push('Fully Flat Bed', 'Premium Service', 'Priority Everything');
    }

    // Add pricing feature
    if (seatInfo.Price === 0) {
      features.push('Free');
    } else {
      features.push('Paid Seat');
    }

    return features;
  }

  /**
   * Validate seat selections before reservation
   * 
   * Requirements: 4.3
   */
  private validateSeatSelections(selections: SeatSelection[]): void {
    if (!selections || selections.length === 0) {
      throw new Error('No seat selections provided');
    }

    // Check for duplicate seat selections
    const seatKeys = new Set<string>();
    for (const selection of selections) {
      const key = `${selection.segmentIndex}-${selection.seatNumber}`;
      if (seatKeys.has(key)) {
        throw new Error(
          `Duplicate seat selection: ${selection.seatNumber} for segment ${selection.segmentIndex}`
        );
      }
      seatKeys.add(key);
    }

    // Validate passenger indices
    for (const selection of selections) {
      if (selection.passengerIndex < 0) {
        throw new Error(
          `Invalid passenger index: ${selection.passengerIndex}`
        );
      }
    }

    // Validate segment indices
    for (const selection of selections) {
      if (selection.segmentIndex < 0) {
        throw new Error(
          `Invalid segment index: ${selection.segmentIndex}`
        );
      }
    }

    // Validate seat numbers
    for (const selection of selections) {
      if (!selection.seatNumber || selection.seatNumber.trim() === '') {
        throw new Error('Invalid seat number: empty or undefined');
      }
    }
  }

  /**
   * Get end user IP address
   * In a real application, this would be obtained from the request
   */
  private getEndUserIp(): string {
    // For now, return a placeholder IP
    // In production, this should be obtained from the actual user's request
    return '127.0.0.1';
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let seatSelectionServiceInstance: SeatSelectionService | null = null;

/**
 * Gets the singleton seat selection service instance
 */
export function getSeatSelectionService(): SeatSelectionService {
  if (!seatSelectionServiceInstance) {
    seatSelectionServiceInstance = new SeatSelectionService();
  }
  return seatSelectionServiceInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetSeatSelectionService(): void {
  seatSelectionServiceInstance = null;
}

// Export default instance
export default getSeatSelectionService();
