/**
 * Hotel Search Service
 * 
 * Provides hotel search functionality with:
 * - Search by location, dates, and guest requirements
 * - BookingCode extraction and storage
 * - API response transformation to internal model
 * - Mock fallback for API failures
 * - Session management for search results
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.7
 */

import { getTboHotelApiClient } from './api/tboHotelApiClient';
import { mockFallbackHandler } from './mockFallbackHandler';
import type {
  HotelSearchRequest,
  HotelSearchResponse,
  Hotel,
  PaxRoom,
  HotelSearchFilters,
} from '../types/tboHotelApi';

// ============================================================================
// Types
// ============================================================================

export interface HotelSearchCriteria {
  checkIn: Date;
  checkOut: Date;
  hotelCodes?: string; // Comma-separated hotel codes
  cityCode?: string;
  guestNationality: string;
  paxRooms: PaxRoomInput[];
  responseTime?: number;
  isDetailedResponse?: boolean;
  filters?: HotelSearchFilters;
}

export interface PaxRoomInput {
  adults: number;
  children: number;
  childrenAges: number[];
}

export interface HotelResult {
  bookingCode: string;
  hotelCode: string;
  hotelName: string;
  starRating: number;
  address: string;
  contactNumber: string;
  cityName: string;
  countryName: string;
  price: {
    currency: string;
    roomPrice: number;
    tax: number;
    extraGuestCharge: number;
    childCharge: number;
    otherCharges: number;
    discount: number;
    publishedPrice: number;
    offeredPrice: number;
    agentCommission: number;
    agentMarkUp: number;
  };
  refundable: boolean;
  mealType: string;
  roomType: string;
  availableRooms: number;
  amenities: string[];
  hotelPicture: string;
  hotelImages: string[];
}

export interface HotelSearchResult {
  hotels: HotelResult[];
  searchCriteria: HotelSearchCriteria;
  totalResults: number;
  isMockData: boolean;
}

export interface HotelSearchSession {
  sessionId: string;
  searchCriteria: HotelSearchCriteria;
  results: HotelSearchResult;
  createdAt: Date;
}

// ============================================================================
// Hotel Search Service Class
// ============================================================================

export class HotelSearchService {
  private apiClient = getTboHotelApiClient();
  private currentSession: HotelSearchSession | null = null;

  /**
   * Search for hotels based on criteria
   * Requirement 1.1: Call TBO Hotel API search endpoint and return available hotels
   * Requirement 1.2: Parse hotel information including name, location, price, star rating, and amenities
   * Requirement 1.4: Include room details, pricing, and availability for each hotel
   * Requirement 1.7: Extract and store BookingCode for each hotel option
   */
  async search(criteria: HotelSearchCriteria): Promise<HotelSearchResult> {
    // Validate search criteria (throw validation errors immediately)
    this.validateSearchCriteria(criteria);

    try {
      // Transform criteria to API request format
      const request = this.transformToApiRequest(criteria);

      // Call the API
      const response: HotelSearchResponse = await this.apiClient.searchHotels(request);

      // Check if API returned success
      if (response.Status === 1 && response.Hotels) {
        // Transform API response to internal model
        const hotels = this.transformHotelsToInternalModel(response.Hotels);

        const result: HotelSearchResult = {
          hotels,
          searchCriteria: criteria,
          totalResults: hotels.length,
          isMockData: false,
        };

        // Store in session
        this.createSession(criteria, result);

        return result;
      }

      // API returned error status
      throw new Error(response.Message || 'Hotel search failed');

    } catch (error) {
      // Requirement 1.5: Mock fallback for API failures
      return this.handleSearchError(error, criteria);
    }
  }

  /**
   * Filter hotel results client-side without additional API calls
   * Requirement 1.3: Filter results by refundable, star rating, meal type
   * 
   * @param results - Array of hotel results to filter
   * @param filters - Filter criteria to apply (AND conditions)
   * @returns Filtered array of hotel results
   */
  filterResults(results: HotelResult[], filters: HotelSearchFilters): HotelResult[] {
    if (!filters || Object.keys(filters).length === 0) {
      return results;
    }

    return results.filter(hotel => {
      // Filter by refundable status
      if (filters.Refundable !== undefined && hotel.refundable !== filters.Refundable) {
        return false;
      }

      // Filter by star rating
      if (filters.StarRating !== undefined && hotel.starRating !== filters.StarRating) {
        return false;
      }

      // Filter by meal type (match meal type string)
      if (filters.MealType !== undefined) {
        const mealTypeMatch = this.matchMealType(hotel.mealType, filters.MealType);
        if (!mealTypeMatch) {
          return false;
        }
      }

      // Filter by hotel name (case-insensitive partial match)
      if (filters.HotelName && filters.HotelName.trim() !== '') {
        const hotelNameLower = hotel.hotelName.toLowerCase();
        const filterNameLower = filters.HotelName.toLowerCase();
        if (!hotelNameLower.includes(filterNameLower)) {
          return false;
        }
      }

      // Filter by number of rooms (available rooms >= requested)
      if (filters.NoOfRooms !== undefined && hotel.availableRooms < filters.NoOfRooms) {
        return false;
      }

      // All filters passed
      return true;
    });
  }

  /**
   * Get the current search session
   */
  getCurrentSearchSession(): HotelSearchSession | null {
    return this.currentSession;
  }

  /**
   * Clear the current search session
   */
  clearSession(): void {
    this.currentSession = null;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate search criteria
   */
  private validateSearchCriteria(criteria: HotelSearchCriteria): void {
    // Validate dates
    if (!criteria.checkIn || !criteria.checkOut) {
      throw new Error('Check-in and check-out dates are required');
    }

    const checkIn = new Date(criteria.checkIn);
    const checkOut = new Date(criteria.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Validate location
    if (!criteria.hotelCodes && !criteria.cityCode) {
      throw new Error('Either hotel codes or city code is required');
    }

    // Validate guest nationality
    if (!criteria.guestNationality) {
      throw new Error('Guest nationality is required');
    }

    // Validate rooms and guests
    if (!criteria.paxRooms || criteria.paxRooms.length === 0) {
      throw new Error('At least one room is required');
    }

    // Validate maximum number of rooms (reasonable limit)
    if (criteria.paxRooms.length > 9) {
      throw new Error('Maximum 9 rooms can be searched at once');
    }

    // Validate each room configuration
    for (let i = 0; i < criteria.paxRooms.length; i++) {
      const room = criteria.paxRooms[i];
      const roomNumber = i + 1;

      // Validate adults count
      if (room.adults < 1) {
        throw new Error(`Room ${roomNumber}: Each room must have at least one adult`);
      }

      if (room.adults > 9) {
        throw new Error(`Room ${roomNumber}: Maximum 9 adults per room`);
      }

      // Validate children count
      if (room.children < 0) {
        throw new Error(`Room ${roomNumber}: Children count cannot be negative`);
      }

      if (room.children > 9) {
        throw new Error(`Room ${roomNumber}: Maximum 9 children per room`);
      }

      // Validate children ages array
      if (room.children > 0 && room.childrenAges.length !== room.children) {
        throw new Error(
          `Room ${roomNumber}: Children ages must be provided for all ${room.children} children (received ${room.childrenAges.length} ages)`
        );
      }

      // Validate each child's age
      if (room.children > 0) {
        for (let j = 0; j < room.childrenAges.length; j++) {
          const age = room.childrenAges[j];
          
          if (!Number.isInteger(age)) {
            throw new Error(`Room ${roomNumber}, Child ${j + 1}: Age must be a whole number`);
          }

          if (age < 0) {
            throw new Error(`Room ${roomNumber}, Child ${j + 1}: Age cannot be negative`);
          }

          if (age > 17) {
            throw new Error(`Room ${roomNumber}, Child ${j + 1}: Age must be 17 or under (use adult for 18+)`);
          }
        }
      }

      // Validate total occupancy per room
      const totalOccupancy = room.adults + room.children;
      if (totalOccupancy > 9) {
        throw new Error(`Room ${roomNumber}: Maximum 9 guests per room (${room.adults} adults + ${room.children} children = ${totalOccupancy})`);
      }
    }
  }

  /**
   * Transform search criteria to API request format
   */
  private transformToApiRequest(criteria: HotelSearchCriteria): HotelSearchRequest {
    return {
      CheckIn: this.formatDate(criteria.checkIn),
      CheckOut: this.formatDate(criteria.checkOut),
      HotelCodes: criteria.hotelCodes,
      CityCode: criteria.cityCode,
      GuestNationality: criteria.guestNationality,
      PaxRooms: criteria.paxRooms.map(room => ({
        Adults: room.adults,
        Children: room.children,
        ChildrenAges: room.childrenAges,
      })),
      ResponseTime: criteria.responseTime,
      IsDetailedResponse: criteria.isDetailedResponse,
      Filters: criteria.filters,
    };
  }

  /**
   * Transform API hotels to internal model
   * Requirement 1.7: Extract and store BookingCode from API response
   */
  private transformHotelsToInternalModel(hotels: Hotel[]): HotelResult[] {
    return hotels.map(hotel => ({
      bookingCode: hotel.BookingCode, // Extract BookingCode
      hotelCode: hotel.HotelCode,
      hotelName: hotel.HotelName,
      starRating: hotel.StarRating,
      address: hotel.HotelAddress,
      contactNumber: hotel.HotelContactNo,
      cityName: hotel.CityName,
      countryName: hotel.CountryName,
      price: {
        currency: hotel.Price.CurrencyCode,
        roomPrice: hotel.Price.RoomPrice,
        tax: hotel.Price.Tax,
        extraGuestCharge: hotel.Price.ExtraGuestCharge,
        childCharge: hotel.Price.ChildCharge,
        otherCharges: hotel.Price.OtherCharges,
        discount: hotel.Price.Discount,
        publishedPrice: hotel.Price.PublishedPrice,
        offeredPrice: hotel.Price.OfferedPrice,
        agentCommission: hotel.Price.AgentCommission,
        agentMarkUp: hotel.Price.AgentMarkUp,
      },
      refundable: hotel.Refundable,
      mealType: hotel.MealType,
      roomType: hotel.RoomType,
      availableRooms: hotel.AvailableRooms,
      amenities: hotel.Amenities || [],
      hotelPicture: hotel.HotelPicture,
      hotelImages: hotel.HotelImages || [],
    }));
  }

  /**
   * Format date to YYYY-MM-DD format required by API
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Match meal type filter to hotel meal type string
   * Meal type codes (based on common hotel API patterns):
   * 1 = Room Only
   * 2 = Breakfast Included
   * 3 = Half Board (Breakfast + Dinner)
   * 4 = Full Board (Breakfast + Lunch + Dinner)
   * 5 = All Inclusive
   */
  private matchMealType(hotelMealType: string, filterMealType: number): boolean {
    const mealTypeLower = hotelMealType.toLowerCase();

    switch (filterMealType) {
      case 1:
        return mealTypeLower.includes('room only') || mealTypeLower === 'ro';
      case 2:
        return mealTypeLower.includes('breakfast') && !mealTypeLower.includes('board');
      case 3:
        return mealTypeLower.includes('half board') || mealTypeLower === 'hb';
      case 4:
        return mealTypeLower.includes('full board') || mealTypeLower === 'fb';
      case 5:
        return mealTypeLower.includes('all inclusive') || mealTypeLower === 'ai';
      default:
        return true; // Unknown meal type, don't filter
    }
  }

  /**
   * Create a new search session
   */
  private createSession(criteria: HotelSearchCriteria, result: HotelSearchResult): void {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      searchCriteria: criteria,
      results: result,
      createdAt: new Date(),
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `HOTEL-SEARCH-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Handle search errors with mock fallback
   * Requirement 1.5: Return mock hotel data when API fails
   */
  private handleSearchError(error: unknown, criteria: HotelSearchCriteria): HotelSearchResult {
    // Re-throw validation errors (don't use mock data for validation failures)
    if (error instanceof Error) {
      const validationErrors = [
        'Check-in and check-out dates are required',
        'Check-in date cannot be in the past',
        'Check-out date must be after check-in date',
        'Either hotel codes or city code is required',
        'Guest nationality is required',
        'At least one room is required',
        'Maximum 9 rooms can be searched at once',
        'Each room must have at least one adult',
        'Maximum 9 adults per room',
        'Children count cannot be negative',
        'Maximum 9 children per room',
        'Children ages must be provided for all',
        'Age must be a whole number',
        'Age cannot be negative',
        'Age must be 17 or under',
        'Maximum 9 guests per room',
        'Room ',
      ];
      
      if (validationErrors.some(msg => error.message.includes(msg))) {
        throw error;
      }
    }

    console.warn('Hotel search API failed, using mock data:', error);

    // Get mock hotel data
    const mockHotels = this.getMockHotelData(criteria);

    const result: HotelSearchResult = {
      hotels: mockHotels,
      searchCriteria: criteria,
      totalResults: mockHotels.length,
      isMockData: true,
    };

    // Store in session
    this.createSession(criteria, result);

    return result;
  }

  /**
   * Generate mock hotel data for fallback
   */
  private getMockHotelData(criteria: HotelSearchCriteria): HotelResult[] {
    const mockHotels: HotelResult[] = [];
    const hotelCount = 8 + Math.floor(Math.random() * 5); // 8-12 hotels

    const hotelNames = [
      'Grand Plaza Hotel',
      'Sunset Beach Resort',
      'City Center Inn',
      'Royal Palace Hotel',
      'Ocean View Resort',
      'Mountain Lodge',
      'Downtown Suites',
      'Riverside Hotel',
      'Garden Paradise Resort',
      'Metropolitan Hotel',
      'Lakeside Inn',
      'Heritage Hotel',
    ];

    const mealTypes = ['Room Only', 'Breakfast Included', 'Half Board', 'Full Board', 'All Inclusive'];
    const roomTypes = ['Standard Room', 'Deluxe Room', 'Suite', 'Executive Room', 'Family Room'];
    const amenities = [
      ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar'],
      ['WiFi', 'Spa', 'Restaurant', 'Room Service'],
      ['WiFi', 'Parking', 'Business Center', 'Airport Shuttle'],
      ['WiFi', 'Pool', 'Beach Access', 'Water Sports'],
      ['WiFi', 'Gym', 'Restaurant', 'Conference Room'],
    ];

    for (let i = 0; i < hotelCount; i++) {
      const starRating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
      const basePrice = 80 + (starRating - 3) * 50 + Math.floor(Math.random() * 100);
      const tax = Math.floor(basePrice * 0.15);
      const publishedPrice = basePrice + tax;
      const discount = Math.floor(Math.random() * 20);
      const offeredPrice = publishedPrice - discount;

      mockHotels.push({
        bookingCode: `MOCK-HOTEL-${Date.now()}-${i}`,
        hotelCode: `HTL${String(i + 1).padStart(4, '0')}`,
        hotelName: hotelNames[i % hotelNames.length],
        starRating,
        address: `${100 + i} Main Street, ${criteria.cityCode || 'City'}`,
        contactNumber: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        cityName: criteria.cityCode || 'Mock City',
        countryName: 'Mock Country',
        price: {
          currency: 'USD',
          roomPrice: basePrice,
          tax,
          extraGuestCharge: 0,
          childCharge: 0,
          otherCharges: 0,
          discount,
          publishedPrice,
          offeredPrice,
          agentCommission: 0,
          agentMarkUp: 0,
        },
        refundable: Math.random() > 0.3, // 70% refundable
        mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
        roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
        availableRooms: 1 + Math.floor(Math.random() * 5),
        amenities: amenities[Math.floor(Math.random() * amenities.length)],
        hotelPicture: `https://via.placeholder.com/400x300?text=${encodeURIComponent(hotelNames[i % hotelNames.length])}`,
        hotelImages: [
          `https://via.placeholder.com/800x600?text=Image1`,
          `https://via.placeholder.com/800x600?text=Image2`,
          `https://via.placeholder.com/800x600?text=Image3`,
        ],
      });
    }

    return mockHotels;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let hotelSearchServiceInstance: HotelSearchService | null = null;

/**
 * Get the singleton hotel search service instance
 */
export function getHotelSearchService(): HotelSearchService {
  if (!hotelSearchServiceInstance) {
    hotelSearchServiceInstance = new HotelSearchService();
  }
  return hotelSearchServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetHotelSearchService(): void {
  hotelSearchServiceInstance = null;
}

// Export default instance
export default getHotelSearchService();
