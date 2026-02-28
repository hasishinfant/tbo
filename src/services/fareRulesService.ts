/**
 * Fare Rules Service
 * 
 * Retrieves and caches fare rules for flights, including cancellation policies,
 * change fees, and baggage allowances. Integrates with mock fallback for API failures.
 * 
 * Requirements: 2.1, 2.2, 2.5
 */

import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import { mockFallbackHandler } from './mockFallbackHandler';
import type {
  FareRulesRequest,
  FareRulesResponse,
  FareRuleDetail,
} from '../types/tekTravelsApi';

// ============================================================================
// Types
// ============================================================================

export interface FareRules {
  cancellationPolicy: string;
  changeFee: number;
  refundable: boolean;
  baggageAllowance: BaggageAllowance;
  restrictions: string[];
  currency: string;
}

export interface BaggageAllowance {
  checkedBags: number;
  checkedBagWeight: number;
  carryOnBags: number;
  carryOnWeight: number;
  unit: 'kg' | 'lbs';
}

// ============================================================================
// Fare Rules Service Class
// ============================================================================

class FareRulesService {
  private _apiClient: ReturnType<typeof getTekTravelsApiClient> | null = null;
  private _mockFallbackHandler = mockFallbackHandler;
  
  // Cache for fare rules (session duration)
  private fareRulesCache: Map<string, FareRules> = new Map();

  private get apiClient() {
    if (!this._apiClient) {
      this._apiClient = getTekTravelsApiClient();
    }
    return this._apiClient;
  }

  /**
   * Get fare rules for a flight
   * 
   * Requirements:
   * - 2.1: Retrieve detailed fare rules using TraceId
   * - 2.2: Present cancellation policies, change fees, and baggage allowances
   * - 2.5: Cache results for session duration
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @returns Promise resolving to FareRules
   * @throws Error if API call fails and mock fallback is unavailable
   */
  async getFareRules(traceId: string, resultIndex: string): Promise<FareRules> {
    // Check cache first (Requirement 2.5)
    const cacheKey = `${traceId}-${resultIndex}`;
    const cachedRules = this.fareRulesCache.get(cacheKey);
    
    if (cachedRules) {
      return cachedRules;
    }

    try {
      // Build fare rules request (Requirement 2.1)
      const request: Omit<FareRulesRequest, 'TokenId'> = {
        EndUserIp: this.getEndUserIp(),
        TraceId: traceId,
        ResultIndex: resultIndex,
      };

      // Call fare rules API
      const response: FareRulesResponse = await this.apiClient.getFareRules(request);

      // Check for API errors
      if (response.Response.Error) {
        throw new Error(
          `Fare rules API error: ${response.Response.Error.ErrorMessage} (${response.Response.Error.ErrorCode})`
        );
      }

      // Parse and transform fare rules (Requirement 2.2)
      const fareRules = this.parseFareRules(response.Response.FareRules);

      // Cache the results (Requirement 2.5)
      this.fareRulesCache.set(cacheKey, fareRules);

      return fareRules;
    } catch (error) {
      console.error('Error fetching fare rules:', error);
      
      // Integrate mock fallback for API failures (Requirement 2.4)
      if (this._mockFallbackHandler.isMockMode() || await this.shouldUseMockFallback()) {
        const mockResponse = this._mockFallbackHandler.getMockFareRules();
        const mockRules = this.parseFareRules(mockResponse.Response.FareRules);
        
        // Cache mock rules as well
        this.fareRulesCache.set(cacheKey, mockRules);
        
        return mockRules;
      }

      // Re-throw error if mock fallback is not available
      throw error;
    }
  }

  /**
   * Clear the fare rules cache
   * Useful when starting a new booking session
   */
  clearCache(): void {
    this.fareRulesCache.clear();
  }

  /**
   * Get cached fare rules without making an API call
   * 
   * @param traceId - The TraceId from the flight search
   * @param resultIndex - The ResultIndex of the selected flight
   * @returns Cached FareRules or null if not cached
   */
  getCachedFareRules(traceId: string, resultIndex: string): FareRules | null {
    const cacheKey = `${traceId}-${resultIndex}`;
    return this.fareRulesCache.get(cacheKey) || null;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Parse fare rules from API response
   * 
   * Requirement 2.2: Parse cancellation policy, change fees, baggage allowance
   */
  private parseFareRules(fareRuleDetails: FareRuleDetail[]): FareRules {
    // Initialize default values
    let cancellationPolicy = 'No cancellation policy available';
    let changeFee = 0;
    let refundable = false;
    let baggageAllowance: BaggageAllowance = {
      checkedBags: 1,
      checkedBagWeight: 15,
      carryOnBags: 1,
      carryOnWeight: 7,
      unit: 'kg',
    };
    const restrictions: string[] = [];
    let currency = 'INR';

    // Parse each fare rule detail
    for (const rule of fareRuleDetails) {
      const ruleText = rule.FareRuleDetail.toLowerCase();
      const restrictionText = rule.FareRestriction.toLowerCase();

      // Parse cancellation policy
      if (ruleText.includes('cancellation') || ruleText.includes('refund')) {
        cancellationPolicy = this.extractCancellationPolicy(rule.FareRuleDetail);
        refundable = this.isRefundable(ruleText);
      }

      // Parse change fee
      if (ruleText.includes('change') || ruleText.includes('modification') || ruleText.includes('date change')) {
        const extractedFee = this.extractChangeFee(rule.FareRuleDetail);
        if (extractedFee > 0) {
          changeFee = extractedFee;
        }
      }

      // Parse baggage allowance
      if (ruleText.includes('baggage') || ruleText.includes('luggage')) {
        baggageAllowance = this.extractBaggageAllowance(rule.FareRuleDetail);
      }

      // Parse restrictions
      if (restrictionText && restrictionText.trim() !== '' && restrictionText !== 'null') {
        const restriction = this.cleanRestrictionText(rule.FareRestriction);
        if (restriction && restriction.length > 0 && !restrictions.includes(restriction)) {
          restrictions.push(restriction);
        }
      }
    }

    return {
      cancellationPolicy,
      changeFee,
      refundable,
      baggageAllowance,
      restrictions,
      currency,
    };
  }

  /**
   * Extract cancellation policy from fare rule text
   */
  private extractCancellationPolicy(ruleText: string): string {
    // Look for cancellation-related sentences
    const sentences = ruleText.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        lowerSentence.includes('cancellation') ||
        lowerSentence.includes('refund') ||
        lowerSentence.includes('cancel')
      ) {
        return sentence.trim();
      }
    }

    // If no specific policy found, return a generic message
    return 'Cancellation charges apply as per airline policy';
  }

  /**
   * Determine if fare is refundable
   */
  private isRefundable(ruleText: string): boolean {
    const nonRefundableKeywords = [
      'non-refundable',
      'non refundable',
      'not refundable',
      'no refund',
    ];

    const refundableKeywords = [
      'refundable',
      'refund available',
      'refund allowed',
    ];

    // Check for non-refundable keywords first
    for (const keyword of nonRefundableKeywords) {
      if (ruleText.includes(keyword)) {
        return false;
      }
    }

    // Check for refundable keywords
    for (const keyword of refundableKeywords) {
      if (ruleText.includes(keyword)) {
        return true;
      }
    }

    // Default to non-refundable if unclear
    return false;
  }

  /**
   * Extract change fee from fare rule text
   */
  private extractChangeFee(ruleText: string): number {
    // Look for patterns like "INR 3000", "Rs. 2500", "$100", etc.
    const patterns = [
      /(?:inr|rs\.?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:inr|rs\.?|rupees)/i,
    ];

    for (const pattern of patterns) {
      const match = ruleText.match(pattern);
      if (match) {
        // Remove commas and parse as number
        const feeString = match[1].replace(/,/g, '');
        const fee = parseFloat(feeString);
        if (!isNaN(fee)) {
          return fee;
        }
      }
    }

    // If no fee found, return 0
    return 0;
  }

  /**
   * Extract baggage allowance from fare rule text
   */
  private extractBaggageAllowance(ruleText: string): BaggageAllowance {
    const defaultAllowance: BaggageAllowance = {
      checkedBags: 1,
      checkedBagWeight: 15,
      carryOnBags: 1,
      carryOnWeight: 7,
      unit: 'kg',
    };

    // Look for patterns like "15 kg", "20kg", "2 pieces", etc.
    const weightPattern = /(\d+)\s*(kg|kgs|kilograms?|lbs?|pounds?)/gi;
    const piecePattern = /(\d+)\s*(?:piece|pieces|bag|bags)/gi;

    const weights: number[] = [];
    const pieces: number[] = [];
    let unit: 'kg' | 'lbs' = 'kg';

    // Extract weights
    let match;
    const lowerText = ruleText.toLowerCase();
    while ((match = weightPattern.exec(ruleText)) !== null) {
      const weight = parseInt(match[1], 10);
      if (!isNaN(weight)) {
        weights.push(weight);
        
        // Determine unit
        const unitText = match[2].toLowerCase();
        if (unitText.includes('lb') || unitText.includes('pound')) {
          unit = 'lbs';
        }
      }
    }

    // Extract pieces
    while ((match = piecePattern.exec(ruleText)) !== null) {
      const piece = parseInt(match[1], 10);
      if (!isNaN(piece)) {
        pieces.push(piece);
      }
    }

    // Determine checked and carry-on allowances
    let checkedBags = defaultAllowance.checkedBags;
    let checkedBagWeight = defaultAllowance.checkedBagWeight;
    let carryOnBags = defaultAllowance.carryOnBags;
    let carryOnWeight = defaultAllowance.carryOnWeight;

    // If we found pieces, use them
    if (pieces.length > 0) {
      // Look for context to determine which is checked vs carry-on
      if (lowerText.includes('checked') || lowerText.includes('check-in')) {
        checkedBags = pieces[0];
        if (pieces.length > 1) {
          carryOnBags = pieces[1];
        }
      } else {
        // First piece is likely checked baggage
        checkedBags = pieces[0];
        if (pieces.length > 1) {
          carryOnBags = pieces[1];
        }
      }
    }

    // If we found weights, use them
    if (weights.length > 0) {
      // Sort weights to identify checked (larger) vs carry-on (smaller)
      if (weights.length === 1) {
        // Single weight - likely checked baggage
        if (lowerText.includes('cabin') || lowerText.includes('carry') || lowerText.includes('hand')) {
          carryOnWeight = weights[0];
        } else {
          checkedBagWeight = weights[0];
        }
      } else {
        // Multiple weights - sort and assign
        weights.sort((a, b) => b - a);
        checkedBagWeight = weights[0];
        carryOnWeight = weights[1];
      }
    }

    return {
      checkedBags,
      checkedBagWeight,
      carryOnBags,
      carryOnWeight,
      unit,
    };
  }

  /**
   * Clean restriction text for display
   */
  private cleanRestrictionText(restrictionText: string): string {
    // Remove excessive whitespace
    let cleaned = restrictionText.trim().replace(/\s+/g, ' ');
    
    // Remove HTML tags if present
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  }

  /**
   * Determine if mock fallback should be used
   */
  private async shouldUseMockFallback(): Promise<boolean> {
    // Check if API is available
    const isAvailable = await this._mockFallbackHandler.isApiAvailable();
    
    if (!isAvailable) {
      // Enable mock mode
      this._mockFallbackHandler.setMockMode(true);
      return true;
    }
    
    return false;
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

let fareRulesServiceInstance: FareRulesService | null = null;

/**
 * Gets the singleton fare rules service instance
 */
export function getFareRulesService(): FareRulesService {
  if (!fareRulesServiceInstance) {
    fareRulesServiceInstance = new FareRulesService();
  }
  return fareRulesServiceInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetFareRulesService(): void {
  fareRulesServiceInstance = null;
}

/**
 * Sets the API client for testing purposes
 */
export function setFareRulesServiceApiClient(client: any): void {
  if (fareRulesServiceInstance) {
    (fareRulesServiceInstance as any)._apiClient = client;
  }
}

// Export default instance
export const fareRulesService = getFareRulesService();
export default fareRulesService;
