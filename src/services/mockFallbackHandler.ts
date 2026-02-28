// @ts-nocheck - Mock data has intentional type mismatches for testing
/**
 * Mock Fallback Handler
 * 
 * Detects API failures and provides mock data to ensure continuous user experience.
 * Implements Requirements 1.5, 8.1, 8.2, 8.3, 2.4 (Flight)
 * Implements Requirements 1.5, 2.4, 8.1, 8.2, 8.3, 8.6 (Hotel)
 */

import type {
  FlightSearchResponse,
  SeatMapResponse,
  AncillaryResponse,
  FareRulesResponse,
  RepricingResponse,
} from '../types/tekTravelsApi';

import type {
  HotelSearchResponse,
  HotelDetailsResponse,
  PreBookResponse,
  HotelBookingResponse,
  BookingDetailResponse,
  BookingListResponse,
  CancelResponse,
  CountryListResponse,
  CityListResponse,
  HotelCodeListResponse,
} from '../types/tboHotelApi';

import {
  mockHotelCollection,
  mockLuxuryHotelDetails,
  mockBudgetHotelDetails,
  mockPreBookSuccess,
  mockPreBookPriceIncrease,
  mockBookingConfirmation,
  mockBookingDetailConfirmed,
  mockBookingSummaries,
  mockCancellationSuccess,
  getMockHotelsByCriteria,
  generateMockBookingCode,
  generateMockConfirmationNumber,
} from '../tests/mocks/mockHotelData';

interface MockModeState {
  enabled: boolean;
  lastCheck: Date | null;
  checkInterval: number; // milliseconds
  hotelApiEnabled: boolean; // Track hotel API mock mode separately
}

class MockFallbackHandler {
  private mockMode: MockModeState = {
    enabled: false,
    lastCheck: null,
    checkInterval: 30000, // 30 seconds
    hotelApiEnabled: false,
  };

  private apiBaseUrl: string;
  private hotelApiBaseUrl: string;

  constructor(
    apiBaseUrl: string = import.meta.env.VITE_TEK_TRAVELS_API_URL || '',
    hotelApiBaseUrl: string = import.meta.env.VITE_TBO_HOTEL_API_URL || ''
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.hotelApiBaseUrl = hotelApiBaseUrl;
  }

  /**
   * Check if the Tek Travels API is available
   * Requirement 8.1: Detect API failure within 5 seconds
   */
  async isApiAvailable(): Promise<boolean> {
    if (!this.apiBaseUrl) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.mockMode.lastCheck = new Date();

      return response.ok;
    } catch (error) {
      this.mockMode.lastCheck = new Date();
      return false;
    }
  }

  /**
   * Check if the TBO Hotel API is available
   * Requirement 8.1: Detect API failure within 5 seconds
   */
  async isHotelApiAvailable(): Promise<boolean> {
    if (!this.hotelApiBaseUrl) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // Try to fetch country list as a health check
      const response = await fetch(`${this.hotelApiBaseUrl}/CountryList`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.mockMode.lastCheck = new Date();

      return response.ok;
    } catch (error) {
      this.mockMode.lastCheck = new Date();
      return false;
    }
  }

  /**
   * Set mock mode state for flight API
   * Requirement 8.2: Switch to mock data mode when API unavailable
   */
  setMockMode(enabled: boolean): void {
    this.mockMode.enabled = enabled;
  }

  /**
   * Set mock mode state for hotel API
   * Requirement 8.2: Switch to mock data mode when API unavailable
   */
  setHotelMockMode(enabled: boolean): void {
    this.mockMode.hotelApiEnabled = enabled;
  }

  /**
   * Check if currently in flight mock mode
   */
  isMockMode(): boolean {
    return this.mockMode.enabled;
  }

  /**
   * Check if currently in hotel mock mode
   */
  isHotelMockMode(): boolean {
    return this.mockMode.hotelApiEnabled;
  }

  /**
   * Get mock flight search results
   * Requirement 1.5: Return mock flight data when API fails
   */
  getMockFlightResults(criteria: {
    origin: string;
    destination: string;
    departureDate: Date;
    returnDate?: Date;
    adults: number;
    children: number;
    infants: number;
  }): FlightSearchResponse {
    const traceId = this.generateMockTraceId();
    const results = this.generateMockFlights(criteria);

    return {
      Response: {
        TraceId: traceId,
        Results: [results],
      },
    };
  }

  /**
   * Get mock seat map
   */
  getMockSeatMap(segmentCount: number = 1): SeatMapResponse {
    const traceId = this.generateMockTraceId();
    const segments = [];

    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        SegmentIndex: i,
        Seats: this.generateMockSeats(),
      });
    }

    return {
      Response: {
        TraceId: traceId,
        SeatLayout: {
          SegmentSeat: segments,
        },
      },
    };
  }

  /**
   * Get mock ancillary options
   */
  getMockAncillaryOptions(): AncillaryResponse {
    const traceId = this.generateMockTraceId();

    return {
      Response: {
        TraceId: traceId,
        Baggage: [
          {
            WayType: 1,
            Code: 'BAG15',
            Description: '15 kg Extra Baggage',
            Weight: 15,
            Currency: 'USD',
            Price: 25,
            Origin: 'DEL',
            Destination: 'BOM',
          },
          {
            WayType: 1,
            Code: 'BAG20',
            Description: '20 kg Extra Baggage',
            Weight: 20,
            Currency: 'USD',
            Price: 35,
            Origin: 'DEL',
            Destination: 'BOM',
          },
        ],
        MealDynamic: [
          {
            WayType: 1,
            Code: 'VEG',
            Description: 'Vegetarian Meal',
            AirlineDescription: 'Fresh vegetarian meal with seasonal vegetables',
            Quantity: 1,
            Currency: 'USD',
            Price: 12,
            Origin: 'DEL',
            Destination: 'BOM',
          },
          {
            WayType: 1,
            Code: 'NVEG',
            Description: 'Non-Vegetarian Meal',
            AirlineDescription: 'Chicken or fish meal with sides',
            Quantity: 1,
            Currency: 'USD',
            Price: 15,
            Origin: 'DEL',
            Destination: 'BOM',
          },
        ],
      },
    };
  }

  /**
   * Get mock fare rules
   */
  getMockFareRules(): FareRulesResponse {
    const traceId = this.generateMockTraceId();

    return {
      Response: {
        TraceId: traceId,
        FareRules: [
          {
            Origin: 'DEL',
            Destination: 'BOM',
            Airline: '6E',
            FareBasisCode: 'ECONOMY',
            FareRuleDetail: 'Cancellation: $50 fee applies. Changes: $30 fee applies.',
            FareRestriction: 'Non-refundable. Changes allowed with fee.',
          },
        ],
      },
    };
  }

  /**
   * Get mock re-pricing response
   */
  getMockRepricingResponse(originalPrice: number): RepricingResponse {
    const traceId = this.generateMockTraceId();
    // Randomly decide if price changed (20% chance)
    const priceChanged = Math.random() < 0.2;
    const newPrice = priceChanged ? originalPrice + Math.floor(Math.random() * 50) : originalPrice;

    return {
      Response: {
        TraceId: traceId,
        Results: {
          IsLCC: true,
          ResultIndex: 'MOCK001',
          Source: 1,
          IsPriceChanged: priceChanged,
          IsTimeChanged: false,
          Fare: {
            Currency: 'USD',
            BaseFare: newPrice - 50,
            Tax: 50,
            PublishedFare: newPrice,
            OfferedFare: newPrice,
          },
        },
      },
    };
  }

  /**
   * Generate a mock TraceId
   */
  private generateMockTraceId(): string {
    return `MOCK-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate mock flight results
   */
  private generateMockFlights(criteria: {
    origin: string;
    destination: string;
    departureDate: Date;
    adults: number;
  }) {
    const airlines = [
      { code: '6E', name: 'IndiGo' },
      { code: 'SG', name: 'SpiceJet' },
      { code: 'G8', name: 'Go Air' },
      { code: 'AI', name: 'Air India' },
    ];

    const flights = [];
    const basePrice = 150 + Math.floor(Math.random() * 200);

    // Generate 5-8 mock flights
    const flightCount = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < flightCount; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const stops = Math.floor(Math.random() * 3); // 0, 1, or 2 stops
      const departureHour = 6 + Math.floor(Math.random() * 16); // 6 AM to 10 PM
      const duration = 120 + stops * 60 + Math.floor(Math.random() * 60); // Base 2 hours + stops
      
      const price = basePrice + (i * 20) + (stops * 30);
      const segments = this.generateMockSegments(
        criteria.origin,
        criteria.destination,
        criteria.departureDate,
        departureHour,
        duration,
        stops,
        airline
      );

      flights.push({
        ResultIndex: `MOCK${String(i + 1).padStart(3, '0')}`,
        Source: 1,
        IsLCC: airline.code !== 'AI',
        IsRefundable: Math.random() > 0.5,
        AirlineCode: airline.code,
        AirlineName: airline.name,
        FlightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 9000)}`,
        FareClassification: {
          Type: 'Economy',
        },
        Segments: [segments],
        LastTicketDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        TicketAdvisory: 'Mock flight data - actual booking unavailable',
        FareRules: [],
        Fare: {
          Currency: 'USD',
          BaseFare: price - 50,
          Tax: 50,
          YQTax: 20,
          AdditionalTxnFeeOfrd: 0,
          AdditionalTxnFeePub: 0,
          PGCharge: 0,
          OtherCharges: 0,
          ChargeBU: [],
          Discount: 0,
          PublishedFare: price,
          OfferedFare: price,
          TdsOnCommission: 0,
          TdsOnPLB: 0,
          TdsOnIncentive: 0,
          ServiceFee: 0,
        },
      });
    }

    return flights;
  }

  /**
   * Generate mock flight segments
   */
  private generateMockSegments(
    origin: string,
    destination: string,
    departureDate: Date,
    departureHour: number,
    totalDuration: number,
    stops: number,
    airline: { code: string; name: string }
  ) {
    const segments = [];
    const layoverCities = ['BLR', 'HYD', 'CCU', 'MAA'];
    
    const departureTime = new Date(departureDate);
    departureTime.setHours(departureHour, Math.floor(Math.random() * 60), 0);

    let currentOrigin = origin;
    let currentTime = new Date(departureTime);
    let remainingDuration = totalDuration;

    for (let i = 0; i <= stops; i++) {
      const isLastSegment = i === stops;
      const segmentDestination = isLastSegment 
        ? destination 
        : layoverCities[Math.floor(Math.random() * layoverCities.length)];
      
      const segmentDuration = isLastSegment 
        ? remainingDuration 
        : Math.floor(remainingDuration / (stops - i + 1));
      
      const arrivalTime = new Date(currentTime.getTime() + segmentDuration * 60000);
      const groundTime = isLastSegment ? 0 : 45 + Math.floor(Math.random() * 45);

      segments.push({
        Origin: {
          AirportCode: currentOrigin,
          AirportName: `${currentOrigin} Airport`,
          Terminal: String(Math.floor(Math.random() * 3) + 1),
          DepTime: currentTime.toISOString(),
          ArrTime: '',
          CityCode: currentOrigin,
          CityName: currentOrigin,
          CountryCode: 'IN',
          CountryName: 'India',
        },
        Destination: {
          AirportCode: segmentDestination,
          AirportName: `${segmentDestination} Airport`,
          Terminal: String(Math.floor(Math.random() * 3) + 1),
          DepTime: '',
          ArrTime: arrivalTime.toISOString(),
          CityCode: segmentDestination,
          CityName: segmentDestination,
          CountryCode: 'IN',
          CountryName: 'India',
        },
        AirlineCode: airline.code,
        AirlineName: airline.name,
        FlightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 9000)}`,
        FareClass: 'Y',
        OperatingCarrier: airline.code,
        Duration: segmentDuration,
        GroundTime: groundTime,
        Mile: Math.floor(segmentDuration * 8),
        StopOver: !isLastSegment,
        FlightInfoIndex: `${i}`,
        Baggage: '15 Kg',
        CabinBaggage: '7 Kg',
        AccumulatedDuration: totalDuration - remainingDuration + segmentDuration,
        Craft: 'A320',
        Remark: null,
        IsETicketEligible: true,
        FlightStatus: 'Confirmed',
        Status: 'Available',
      });

      currentOrigin = segmentDestination;
      currentTime = new Date(arrivalTime.getTime() + groundTime * 60000);
      remainingDuration -= segmentDuration;
    }

    return segments;
  }

  /**
   * Generate mock seat map
   */
  private generateMockSeats() {
    const seats = [];
    const rows = 30;
    const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let row = 1; row <= rows; row++) {
      for (let seatIndex = 0; seatIndex < seatsPerRow.length; seatIndex++) {
        const seatLetter = seatsPerRow[seatIndex];
        const seatType = seatIndex === 0 || seatIndex === 5 ? 1 : seatIndex === 2 || seatIndex === 3 ? 3 : 2;
        const isAvailable = Math.random() > 0.3; // 70% available
        const isPremium = row <= 3;
        const price = isPremium ? 50 : row <= 10 ? 30 : 15;

        seats.push({
          RowNo: row,
          SeatNo: `${row}${seatLetter}`,
          SeatType: seatType,
          SeatWayType: isAvailable ? 1 : 3,
          Compartment: isPremium ? 2 : 1,
          Deck: 1,
          Currency: 'USD',
          Price: price,
        });
      }
    }

    return seats;
  }

  // ============================================================================
  // Hotel API Mock Methods
  // ============================================================================

  /**
   * Get mock hotel search results
   * Requirement 1.5, 8.1, 8.2, 8.3: Return mock hotel data when API fails
   */
  getMockHotelSearchResults(criteria: {
    checkIn: string;
    checkOut: string;
    cityCode?: string;
    guestNationality: string;
    paxRooms: Array<{ adults: number; children: number; childrenAges: number[] }>;
    filters?: {
      refundable?: boolean;
      starRating?: number;
      mealType?: string;
    };
  }): HotelSearchResponse {
    // Apply filters to get relevant mock hotels
    const filterCriteria: any = {};
    
    if (criteria.filters?.starRating) {
      filterCriteria.starRating = criteria.filters.starRating;
    }
    
    if (criteria.filters?.refundable !== undefined) {
      filterCriteria.refundable = criteria.filters.refundable;
    }
    
    if (criteria.filters?.mealType) {
      filterCriteria.mealType = criteria.filters.mealType;
    }

    let hotels = getMockHotelsByCriteria(filterCriteria);

    // If no filters applied or no results, return all mock hotels
    if (hotels.length === 0) {
      hotels = [...mockHotelCollection];
    }

    // Generate new booking codes for each hotel
    hotels = hotels.map(hotel => ({
      ...hotel,
      BookingCode: generateMockBookingCode(hotel.HotelCode),
    }));

    return {
      Hotels: hotels,
      Status: 1,
      Message: 'Mock hotel search results - API unavailable',
    };
  }

  /**
   * Get mock hotel details
   * Requirement 2.4, 8.1, 8.2, 8.3: Return mock hotel details when API fails
   */
  getMockHotelDetails(hotelCodes: string[]): HotelDetailsResponse {
    const hotelDetails = [];

    for (const code of hotelCodes) {
      // Return appropriate mock details based on hotel code
      if (code.includes('TAJ') || code.includes('LUX') || code.includes('RESORT')) {
        hotelDetails.push(mockLuxuryHotelDetails);
      } else {
        hotelDetails.push(mockBudgetHotelDetails);
      }
    }

    // If no specific details found, return luxury hotel details as default
    if (hotelDetails.length === 0) {
      hotelDetails.push(mockLuxuryHotelDetails);
    }

    return {
      HotelDetails: hotelDetails,
      Status: 1,
      Message: 'Mock hotel details - API unavailable',
    };
  }

  /**
   * Get mock pre-book response
   * Requirement 8.1, 8.2, 8.3: Return mock pre-book data when API fails
   */
  getMockPreBookResponse(bookingCode: string, originalPrice?: number): PreBookResponse {
    // Randomly decide if price changed (20% chance)
    const priceChanged = Math.random() < 0.2;

    if (priceChanged && originalPrice) {
      // Return price increase scenario
      const priceIncrease = Math.floor(Math.random() * 50) + 10;
      return {
        ...mockPreBookPriceIncrease,
        BookingCode: `${bookingCode}-PREBOOK`,
        HotelDetails: {
          ...mockPreBookPriceIncrease.HotelDetails,
          Price: {
            CurrencyCode: 'USD',
            PublishedPrice: originalPrice + priceIncrease,
            OfferedPrice: originalPrice + priceIncrease,
          },
        },
      };
    }

    // Return no price change scenario
    return {
      ...mockPreBookSuccess,
      BookingCode: `${bookingCode}-PREBOOK`,
    };
  }

  /**
   * Get mock hotel booking confirmation
   * Requirement 8.1, 8.2, 8.3: Return mock booking confirmation when API fails
   */
  getMockHotelBookingConfirmation(
    bookingCode: string,
    hotelName: string,
    checkIn: string,
    checkOut: string,
    totalFare: number
  ): HotelBookingResponse {
    const confirmationNo = generateMockConfirmationNumber();
    const bookingRefNo = `TBO-REF-${Date.now()}`;

    return {
      ConfirmationNo: confirmationNo,
      BookingRefNo: bookingRefNo,
      BookingId: Math.floor(Math.random() * 900000) + 100000,
      Status: 1,
      Message: 'Mock booking confirmation - API unavailable',
      HotelDetails: {
        HotelName: hotelName,
        CheckInDate: checkIn,
        CheckOutDate: checkOut,
        TotalFare: totalFare,
        CurrencyCode: 'USD',
      },
      VoucherUrl: `https://example.com/vouchers/${confirmationNo}.pdf`,
    };
  }

  /**
   * Get mock booking details
   * Requirement 8.1, 8.2, 8.3: Return mock booking details when API fails
   */
  getMockBookingDetails(confirmationNo: string): BookingDetailResponse {
    return {
      BookingDetails: {
        ...mockBookingDetailConfirmed,
        ConfirmationNo: confirmationNo,
      },
      Status: 1,
      Message: 'Mock booking details - API unavailable',
    };
  }

  /**
   * Get mock booking list by date range
   * Requirement 8.1, 8.2, 8.3: Return mock booking list when API fails
   */
  getMockBookingList(fromDate: string, toDate: string): BookingListResponse {
    return {
      Bookings: mockBookingSummaries,
      Status: 1,
      Message: 'Mock booking list - API unavailable',
    };
  }

  /**
   * Get mock cancellation response
   * Requirement 8.1, 8.2, 8.3: Return mock cancellation response when API fails
   */
  getMockCancellationResponse(confirmationNo: string): CancelResponse {
    return {
      ...mockCancellationSuccess,
      ConfirmationNo: confirmationNo,
    };
  }

  /**
   * Get mock country list
   * Requirement 8.1, 8.2, 8.3: Return mock country list when API fails
   */
  getMockCountryList(): CountryListResponse {
    return {
      Countries: [
        { Code: 'IN', Name: 'India' },
        { Code: 'US', Name: 'United States' },
        { Code: 'GB', Name: 'United Kingdom' },
        { Code: 'AE', Name: 'United Arab Emirates' },
        { Code: 'SG', Name: 'Singapore' },
        { Code: 'TH', Name: 'Thailand' },
        { Code: 'MY', Name: 'Malaysia' },
        { Code: 'FR', Name: 'France' },
        { Code: 'IT', Name: 'Italy' },
        { Code: 'ES', Name: 'Spain' },
      ],
      Status: 1,
      Message: 'Mock country list - API unavailable',
    };
  }

  /**
   * Get mock city list
   * Requirement 8.1, 8.2, 8.3: Return mock city list when API fails
   */
  getMockCityList(countryCode: string): CityListResponse {
    const citiesByCountry: Record<string, Array<{ Code: string; Name: string }>> = {
      IN: [
        { Code: 'DEL', Name: 'New Delhi' },
        { Code: 'BOM', Name: 'Mumbai' },
        { Code: 'BLR', Name: 'Bangalore' },
        { Code: 'GOI', Name: 'Goa' },
        { Code: 'HYD', Name: 'Hyderabad' },
        { Code: 'CCU', Name: 'Kolkata' },
      ],
      US: [
        { Code: 'NYC', Name: 'New York' },
        { Code: 'LAX', Name: 'Los Angeles' },
        { Code: 'SFO', Name: 'San Francisco' },
        { Code: 'MIA', Name: 'Miami' },
      ],
      GB: [
        { Code: 'LON', Name: 'London' },
        { Code: 'MAN', Name: 'Manchester' },
        { Code: 'EDI', Name: 'Edinburgh' },
      ],
      AE: [
        { Code: 'DXB', Name: 'Dubai' },
        { Code: 'AUH', Name: 'Abu Dhabi' },
      ],
    };

    const cities = citiesByCountry[countryCode] || [];

    return {
      Cities: cities.map(city => ({
        ...city,
        CountryCode: countryCode,
      })),
      Status: 1,
      Message: 'Mock city list - API unavailable',
    };
  }

  /**
   * Get mock hotel code list
   * Requirement 8.1, 8.2, 8.3: Return mock hotel code list when API fails
   */
  getMockHotelCodeList(cityCode: string): HotelCodeListResponse {
    // Return mock hotels based on city
    const cityHotels = getMockHotelsByCriteria({ cityName: this.getCityNameFromCode(cityCode) });

    const hotelInfoList = cityHotels.map(hotel => ({
      HotelCode: hotel.HotelCode,
      HotelName: hotel.HotelName,
      Address: hotel.HotelAddress,
      CityCode: cityCode,
      StarRating: hotel.StarRating,
      Latitude: 0,
      Longitude: 0,
    }));

    // If no hotels found for city, return all mock hotels
    if (hotelInfoList.length === 0) {
      return {
        Hotels: mockHotelCollection.map(hotel => ({
          HotelCode: hotel.HotelCode,
          HotelName: hotel.HotelName,
          Address: hotel.HotelAddress,
          CityCode: cityCode,
          StarRating: hotel.StarRating,
          Latitude: 0,
          Longitude: 0,
        })),
        Status: 1,
        Message: 'Mock hotel code list - API unavailable',
      };
    }

    return {
      Hotels: hotelInfoList,
      Status: 1,
      Message: 'Mock hotel code list - API unavailable',
    };
  }

  /**
   * Helper method to get city name from city code
   */
  private getCityNameFromCode(cityCode: string): string {
    const cityMap: Record<string, string> = {
      DEL: 'New Delhi',
      BOM: 'Mumbai',
      BLR: 'Bangalore',
      GOI: 'Goa',
      HYD: 'Hyderabad',
      CCU: 'Kolkata',
      NYC: 'New York',
      LAX: 'Los Angeles',
      SFO: 'San Francisco',
      MIA: 'Miami',
      LON: 'London',
      MAN: 'Manchester',
      EDI: 'Edinburgh',
      DXB: 'Dubai',
      AUH: 'Abu Dhabi',
    };

    return cityMap[cityCode] || 'Unknown City';
  }
}

// Export singleton instance
export const mockFallbackHandler = new MockFallbackHandler();
export default mockFallbackHandler;
