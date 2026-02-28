/**
 * Ancillary Service
 * 
 * Manages add-on services (baggage and meals) for flight bookings.
 * Retrieves available ancillary options and reserves selected services.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.6
 */

import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import type {
  AncillaryRequest,
  AncillaryResponse,
  BaggageInfo,
  MealInfo,
} from '../types/tekTravelsApi';

// ============================================================================
// Internal Types
// ============================================================================

export interface AncillaryOptions {
  baggage: BaggageOption[];
  meals: MealOption[];
}

export interface BaggageOption {
  code: string;
  description: string;
  weight: number;
  unit: 'kg' | 'lbs';
  price: number;
  currency: string;
  origin: string;
  destination: string;
  wayType: number;
}

export interface MealOption {
  code: string;
  name: string;
  description: string;
  dietaryInfo: string[];
  price: number;
  currency: string;
  origin: string;
  destination: string;
  quantity: number;
  wayType: number;
}

export interface AncillarySelection {
  passengerIndex: number;
  type: 'baggage' | 'meal';
  code: string;
  segmentIndex?: number;
}

export interface AncillaryResult {
  success: boolean;
  addedServices: AncillarySelection[];
  totalCost: number;
}

// ============================================================================
// Ancillary Service Class
// ============================================================================

class AncillaryService {
  private apiClient = getTekTravelsApiClient();

  /**
   * Get available ancillary services (baggage and meals)
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @returns Available baggage and meal options
   * 
   * Requirements:
   * - 5.1: Retrieve available baggage and meal options using TraceId
   * - 5.2: Show weight limits, prices, and availability for baggage
   * - 5.3: Show meal descriptions, dietary information, and prices
   */
  async getAncillaryServices(
    traceId: string,
    resultIndex: string
  ): Promise<AncillaryOptions> {
    try {
      // Build ancillary request (Requirement 5.1)
      const request: Omit<AncillaryRequest, 'TokenId'> = {
        EndUserIp: this.getEndUserIp(),
        TraceId: traceId,
        ResultIndex: resultIndex,
      };

      // Call ancillary API
      const response: AncillaryResponse = await this.apiClient.getAncillaryServices(request);

      // Check for API errors
      if (response.Response.Error) {
        throw new Error(
          `Ancillary services API error: ${response.Response.Error.ErrorMessage}`
        );
      }

      // Parse and transform baggage options (Requirement 5.2)
      const baggage = this.parseBaggageOptions(response.Response.Baggage || []);

      // Parse and transform meal options (Requirement 5.3)
      const meals = this.parseMealOptions(response.Response.MealDynamic || []);

      return {
        baggage,
        meals,
      };
    } catch (error) {
      console.error('Error fetching ancillary services:', error);
      throw error;
    }
  }

  /**
   * Add ancillary services to booking
   * 
   * @param traceId - The TraceId from the flight search
   * @param selections - Array of ancillary selections
   * @returns Result with success status and total cost
   * 
   * Requirements:
   * - 5.4: Update total price and booking session
   * - 5.6: Call appropriate API endpoints to reserve services
   * 
   * Note: The Tek Travels API doesn't have a separate endpoint for adding
   * ancillary services. They are included in the final booking request.
   * This method validates selections and calculates total cost.
   */
  async addAncillaryServices(
    traceId: string,
    resultIndex: string,
    selections: AncillarySelection[]
  ): Promise<AncillaryResult> {
    try {
      // Validate selections
      this.validateAncillarySelections(selections);

      // Get available ancillary options to calculate cost
      const options = await this.getAncillaryServices(traceId, resultIndex);

      // Calculate total cost (Requirement 5.4)
      const totalCost = this.calculateTotalCost(selections, options);

      // Return result (Requirement 5.6)
      // Note: Actual reservation happens during final booking
      return {
        success: true,
        addedServices: selections,
        totalCost,
      };
    } catch (error) {
      console.error('Error adding ancillary services:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Parse baggage options from API response
   * 
   * Requirement 5.2: Show weight limits, prices, and availability
   */
  private parseBaggageOptions(baggageInfo: BaggageInfo[]): BaggageOption[] {
    return baggageInfo.map((info) => ({
      code: info.Code,
      description: info.Description,
      weight: info.Weight,
      unit: this.extractWeightUnit(info.Description),
      price: info.Price,
      currency: info.Currency,
      origin: info.Origin,
      destination: info.Destination,
      wayType: info.WayType,
    }));
  }

  /**
   * Parse meal options from API response
   * 
   * Requirement 5.3: Show meal descriptions, dietary information, and prices
   */
  private parseMealOptions(mealInfo: MealInfo[]): MealOption[] {
    return mealInfo.map((info) => ({
      code: info.Code,
      name: this.extractMealName(info.Description),
      description: info.Description,
      dietaryInfo: this.extractDietaryInfo(info.Description, info.AirlineDescription),
      price: info.Price,
      currency: info.Currency,
      origin: info.Origin,
      destination: info.Destination,
      quantity: info.Quantity,
      wayType: info.WayType,
    }));
  }

  /**
   * Extract weight unit from baggage description
   */
  private extractWeightUnit(description: string): 'kg' | 'lbs' {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('lbs') || lowerDesc.includes('pounds')) {
      return 'lbs';
    }
    return 'kg'; // Default to kg
  }

  /**
   * Extract meal name from description
   */
  private extractMealName(description: string): string {
    // Try to extract meal name from description
    // Format is typically "MEAL_CODE - Meal Name"
    const parts = description.split('-');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return description;
  }

  /**
   * Extract dietary information from meal description
   */
  private extractDietaryInfo(description: string, airlineDescription: string): string[] {
    const dietaryInfo: string[] = [];
    const combinedText = `${description} ${airlineDescription}`.toLowerCase();

    // Check for common dietary tags
    if (combinedText.includes('vegetarian') || combinedText.includes('veg')) {
      dietaryInfo.push('Vegetarian');
    }
    if (combinedText.includes('vegan')) {
      dietaryInfo.push('Vegan');
    }
    if (combinedText.includes('halal')) {
      dietaryInfo.push('Halal');
    }
    if (combinedText.includes('kosher')) {
      dietaryInfo.push('Kosher');
    }
    if (combinedText.includes('gluten-free') || combinedText.includes('gluten free')) {
      dietaryInfo.push('Gluten-Free');
    }
    if (combinedText.includes('dairy-free') || combinedText.includes('dairy free')) {
      dietaryInfo.push('Dairy-Free');
    }
    if (combinedText.includes('nut-free') || combinedText.includes('nut free')) {
      dietaryInfo.push('Nut-Free');
    }
    if (combinedText.includes('non-veg') || combinedText.includes('non veg') || combinedText.includes('chicken') || combinedText.includes('meat')) {
      dietaryInfo.push('Non-Vegetarian');
    }

    return dietaryInfo;
  }

  /**
   * Validate ancillary selections
   */
  private validateAncillarySelections(selections: AncillarySelection[]): void {
    if (!selections || selections.length === 0) {
      throw new Error('No ancillary selections provided');
    }

    for (const selection of selections) {
      // Validate passenger index
      if (selection.passengerIndex < 0) {
        throw new Error(`Invalid passenger index: ${selection.passengerIndex}`);
      }

      // Validate type
      if (selection.type !== 'baggage' && selection.type !== 'meal') {
        throw new Error(`Invalid ancillary type: ${selection.type}`);
      }

      // Validate code
      if (!selection.code || selection.code.trim() === '') {
        throw new Error('Invalid ancillary code: empty or undefined');
      }
    }
  }

  /**
   * Calculate total cost of selected ancillary services
   * 
   * Requirement 5.4: Calculate total ancillary cost
   */
  private calculateTotalCost(
    selections: AncillarySelection[],
    options: AncillaryOptions
  ): number {
    let totalCost = 0;

    for (const selection of selections) {
      if (selection.type === 'baggage') {
        const baggageOption = options.baggage.find(
          (option) => option.code === selection.code
        );
        if (baggageOption) {
          totalCost += baggageOption.price;
        }
      } else if (selection.type === 'meal') {
        const mealOption = options.meals.find(
          (option) => option.code === selection.code
        );
        if (mealOption) {
          totalCost += mealOption.price;
        }
      }
    }

    return totalCost;
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

let ancillaryServiceInstance: AncillaryService | null = null;

/**
 * Gets the singleton ancillary service instance
 */
export function getAncillaryService(): AncillaryService {
  if (!ancillaryServiceInstance) {
    ancillaryServiceInstance = new AncillaryService();
  }
  return ancillaryServiceInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetAncillaryService(): void {
  ancillaryServiceInstance = null;
}

// Export default instance
export const ancillaryService = getAncillaryService();
export default ancillaryService;
