/**
 * Flight Search Service
 * 
 * Handles flight search operations including:
 * - Calling Tek Travels API for flight searches
 * - Extracting and storing TraceId
 * - Transforming API responses to internal models
 * - Client-side filtering of results
 * - Round-trip search handling
 * - Mock fallback integration
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.7
 */

import { getTekTravelsApiClient } from './api/tekTravelsApiClient';
import { mockFallbackHandler } from './mockFallbackHandler';
import type {
  FlightSearchRequest,
  FlightSearchResponse,
  FlightResult as ApiFlightResult,
  FlightSegment as ApiFlightSegment,
} from '../types/tekTravelsApi';

// ============================================================================
// Internal Data Models
// ============================================================================

export interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'All' | 'Economy' | 'Premium Economy' | 'Business' | 'First';
  directFlight?: boolean;
  oneStopFlight?: boolean;
  preferredAirlines?: string[];
}

export interface SearchFilters {
  priceRange?: { min: number; max: number };
  maxDuration?: number;
  maxStops?: number;
  airlines?: string[];
  departureTimeRange?: { start: string; end: string };
}

export interface SearchResult {
  traceId: string;
  flights: FlightResult[];
  searchCriteria: SearchCriteria;
  isRoundTrip: boolean;
}

export interface FlightResult {
  resultIndex: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  availableSeats: number;
  isRefundable: boolean;
  segments: FlightSegment[];
  fareType: string;
}

export interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  aircraft: string;
  baggage: string;
  cabinBaggage: string;
  layoverDuration?: number;
}

// ============================================================================
// Flight Search Service Class
// ============================================================================

class FlightSearchService {
  private apiClient = getTekTravelsApiClient();
  private currentTraceId: string | null = null;
  private lastSearchResult: SearchResult | null = null;

  /**
   * Search for flights based on criteria
   * Requirement 1.1: Call Tek Travels API and return available flights
   * Requirement 1.2: Extract and store TraceId
   * Requirement 1.4: Transform API response to FlightResult objects
   * Requirement 1.5: Integrate mock fallback for API failures
   * Requirement 1.7: Handle round-trip searches
   */
  async search(criteria: SearchCriteria): Promise<SearchResult> {
    try {
      const isRoundTrip = !!criteria.returnDate;
      
      // Check if API is available
      const apiAvailable = await mockFallbackHandler.isApiAvailable();
      
      if (!apiAvailable) {
        // Use mock fallback
        mockFallbackHandler.setMockMode(true);
        return this.searchWithMockData(criteria);
      }

      mockFallbackHandler.setMockMode(false);

      if (isRoundTrip) {
        // Handle round-trip search (Requirement 1.7)
        return await this.searchRoundTrip(criteria);
      } else {
        // Handle one-way search
        return await this.searchOneWay(criteria);
      }
    } catch (error) {
      console.error('Flight search failed, falling back to mock data:', error);
      mockFallbackHandler.setMockMode(true);
      return this.searchWithMockData(criteria);
    }
  }

  /**
   * Search for one-way flights
   */
  private async searchOneWay(criteria: SearchCriteria): Promise<SearchResult> {
    const request = this.buildSearchRequest(criteria, false);
    const response = await this.apiClient.searchFlights(request);

    // Extract TraceId (Requirement 1.2)
    const traceId = response.Response.TraceId;
    this.currentTraceId = traceId;

    // Transform API response to internal model (Requirement 1.4)
    const flights = this.transformApiResponse(response);

    const result: SearchResult = {
      traceId,
      flights,
      searchCriteria: criteria,
      isRoundTrip: false,
    };

    this.lastSearchResult = result;
    return result;
  }

  /**
   * Search for round-trip flights
   * Requirement 1.7: Handle both outbound and return flight searches
   */
  private async searchRoundTrip(criteria: SearchCriteria): Promise<SearchResult> {
    if (!criteria.returnDate) {
      throw new Error('Return date is required for round-trip search');
    }

    const request = this.buildSearchRequest(criteria, true);
    const response = await this.apiClient.searchFlights(request);

    // Extract TraceId (Requirement 1.2)
    const traceId = response.Response.TraceId;
    this.currentTraceId = traceId;

    // Transform API response to internal model (Requirement 1.4)
    // For round-trip, the API returns results for both directions
    const flights = this.transformApiResponse(response);

    const result: SearchResult = {
      traceId,
      flights,
      searchCriteria: criteria,
      isRoundTrip: true,
    };

    this.lastSearchResult = result;
    return result;
  }

  /**
   * Build flight search request for Tek Travels API
   */
  private buildSearchRequest(criteria: SearchCriteria, isRoundTrip: boolean): Omit<FlightSearchRequest, 'TokenId'> {
    const segments = [
      {
        Origin: criteria.origin,
        Destination: criteria.destination,
        FlightCabinClass: this.mapCabinClass(criteria.cabinClass),
        PreferredDepartureTime: criteria.departureDate.toISOString(),
        PreferredArrivalTime: '',
      },
    ];

    // Add return segment for round-trip
    if (isRoundTrip && criteria.returnDate) {
      segments.push({
        Origin: criteria.destination,
        Destination: criteria.origin,
        FlightCabinClass: this.mapCabinClass(criteria.cabinClass),
        PreferredDepartureTime: criteria.returnDate.toISOString(),
        PreferredArrivalTime: '',
      });
    }

    return {
      EndUserIp: '127.0.0.1',
      AdultCount: criteria.adults,
      ChildCount: criteria.children,
      InfantCount: criteria.infants,
      DirectFlight: criteria.directFlight || false,
      OneStopFlight: criteria.oneStopFlight || false,
      JourneyType: isRoundTrip ? '2' : '1',
      PreferredAirlines: criteria.preferredAirlines?.join(',') || null,
      Segments: segments,
      Sources: null,
    };
  }

  /**
   * Map cabin class to API format
   */
  private mapCabinClass(cabinClass: string): '1' | '2' | '3' | '4' {
    const mapping: Record<string, '1' | '2' | '3' | '4'> = {
      'All': '1',
      'Economy': '2',
      'Premium Economy': '3',
      'Business': '4',
      'First': '4',
    };
    return mapping[cabinClass] || '1';
  }

  /**
   * Transform API response to internal FlightResult model
   * Requirement 1.4: Parse and transform response into FlightResult objects
   */
  private transformApiResponse(response: FlightSearchResponse): FlightResult[] {
    const flights: FlightResult[] = [];

    if (!response.Response.Results || response.Response.Results.length === 0) {
      return flights;
    }

    // Results are grouped by journey (outbound/return)
    for (const resultGroup of response.Response.Results) {
      for (const apiResult of resultGroup) {
        const flight = this.transformFlightResult(apiResult);
        flights.push(flight);
      }
    }

    return flights;
  }

  /**
   * Transform a single API flight result to internal model
   */
  private transformFlightResult(apiResult: ApiFlightResult): FlightResult {
    // Get first segment group (typically there's only one for direct/connecting flights)
    const segmentGroup = apiResult.Segments[0] || [];
    
    // Calculate total stops
    const stops = segmentGroup.length - 1;

    // Get first and last segment for overall journey times
    const firstSegment = segmentGroup[0];
    const lastSegment = segmentGroup[segmentGroup.length - 1];

    // Calculate total duration
    const totalDuration = lastSegment?.AccumulatedDuration || 0;

    // Transform segments
    const segments = this.transformSegments(segmentGroup);

    return {
      resultIndex: apiResult.ResultIndex,
      airline: apiResult.AirlineName,
      airlineCode: apiResult.AirlineCode,
      flightNumber: apiResult.FlightNumber,
      origin: firstSegment.Origin.AirportCode,
      destination: lastSegment.Destination.AirportCode,
      departureTime: new Date(firstSegment.Origin.DepTime),
      arrivalTime: new Date(lastSegment.Destination.ArrTime),
      duration: totalDuration,
      stops,
      price: apiResult.Fare.OfferedFare,
      currency: apiResult.Fare.Currency,
      cabinClass: apiResult.FareClassification.Type,
      availableSeats: 9, // API doesn't provide this, default to 9
      isRefundable: apiResult.IsRefundable,
      segments,
      fareType: apiResult.IsLCC ? 'Low Cost Carrier' : 'Full Service',
    };
  }

  /**
   * Transform API segments to internal model
   */
  private transformSegments(apiSegments: ApiFlightSegment[]): FlightSegment[] {
    const segments: FlightSegment[] = [];

    for (let i = 0; i < apiSegments.length; i++) {
      const apiSegment = apiSegments[i];
      const nextSegment = apiSegments[i + 1];

      // Calculate layover duration if there's a next segment
      let layoverDuration: number | undefined;
      if (nextSegment) {
        const arrivalTime = new Date(apiSegment.Destination.ArrTime);
        const nextDepartureTime = new Date(nextSegment.Origin.DepTime);
        layoverDuration = Math.floor((nextDepartureTime.getTime() - arrivalTime.getTime()) / 60000);
      }

      segments.push({
        airline: apiSegment.AirlineName,
        airlineCode: apiSegment.AirlineCode,
        flightNumber: apiSegment.FlightNumber,
        origin: apiSegment.Origin.AirportCode,
        originAirport: apiSegment.Origin.AirportName,
        destination: apiSegment.Destination.AirportCode,
        destinationAirport: apiSegment.Destination.AirportName,
        departureTime: new Date(apiSegment.Origin.DepTime),
        arrivalTime: new Date(apiSegment.Destination.ArrTime),
        duration: apiSegment.Duration,
        aircraft: apiSegment.Craft,
        baggage: apiSegment.Baggage,
        cabinBaggage: apiSegment.CabinBaggage,
        layoverDuration,
      });
    }

    return segments;
  }

  /**
   * Search with mock data fallback
   * Requirement 1.5: Return mock flight data when API fails
   */
  private searchWithMockData(criteria: SearchCriteria): SearchResult {
    const mockResponse = mockFallbackHandler.getMockFlightResults({
      origin: criteria.origin,
      destination: criteria.destination,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      adults: criteria.adults,
      children: criteria.children,
      infants: criteria.infants,
    });

    const traceId = mockResponse.Response.TraceId;
    this.currentTraceId = traceId;

    const flights = this.transformApiResponse(mockResponse);

    const result: SearchResult = {
      traceId,
      flights,
      searchCriteria: criteria,
      isRoundTrip: !!criteria.returnDate,
    };

    this.lastSearchResult = result;
    return result;
  }

  /**
   * Filter flight results client-side
   * Requirement 1.3: Filter results without additional API calls
   */
  filterResults(results: FlightResult[], filters: SearchFilters): FlightResult[] {
    let filtered = [...results];

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(
        flight => flight.price >= filters.priceRange!.min && flight.price <= filters.priceRange!.max
      );
    }

    // Filter by maximum duration
    if (filters.maxDuration !== undefined) {
      filtered = filtered.filter(flight => flight.duration <= filters.maxDuration!);
    }

    // Filter by maximum stops
    if (filters.maxStops !== undefined) {
      filtered = filtered.filter(flight => flight.stops <= filters.maxStops!);
    }

    // Filter by airlines (AND condition - all selected airlines)
    if (filters.airlines && filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        filters.airlines!.includes(flight.airlineCode)
      );
    }

    // Filter by departure time range
    if (filters.departureTimeRange) {
      const { start, end } = filters.departureTimeRange;
      filtered = filtered.filter(flight => {
        const departureHour = flight.departureTime.getHours();
        const departureMinute = flight.departureTime.getMinutes();
        const departureTimeStr = `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;
        return departureTimeStr >= start && departureTimeStr <= end;
      });
    }

    return filtered;
  }

  /**
   * Get current TraceId
   * Requirement 1.2: Provide access to TraceId for subsequent API calls
   */
  getCurrentTraceId(): string | null {
    return this.currentTraceId;
  }

  /**
   * Get last search result
   */
  getLastSearchResult(): SearchResult | null {
    return this.lastSearchResult;
  }

  /**
   * Clear current search session
   */
  clearSession(): void {
    this.currentTraceId = null;
    this.lastSearchResult = null;
    this.apiClient.clearTraceId();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const flightSearchService = new FlightSearchService();
export default flightSearchService;
