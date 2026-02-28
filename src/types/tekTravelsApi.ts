/**
 * Tek Travels Universal Air API Type Definitions
 * 
 * This file contains TypeScript interfaces for all Tek Travels API
 * request and response structures.
 */

// ============================================================================
// Authentication & Configuration
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================================================
// Flight Search
// ============================================================================

export interface FlightSearchRequest {
  EndUserIp: string;
  TokenId: string;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  DirectFlight: boolean;
  OneStopFlight: boolean;
  JourneyType: '1' | '2'; // 1=OneWay, 2=Return
  PreferredAirlines: string | null;
  Segments: SearchSegment[];
  Sources: string | null;
}

export interface SearchSegment {
  Origin: string;
  Destination: string;
  FlightCabinClass: '1' | '2' | '3' | '4'; // 1=All, 2=Economy, 3=Premium Economy, 4=Business
  PreferredDepartureTime: string;
  PreferredArrivalTime: string;
}

export interface FlightSearchResponse {
  Response: {
    TraceId: string;
    Results: FlightResult[][];
    Error?: TekTravelsApiError;
  };
}

export interface FlightResult {
  ResultIndex: string;
  Source: number;
  IsLCC: boolean;
  IsRefundable: boolean;
  AirlineCode: string;
  AirlineName: string;
  FlightNumber: string;
  FareClassification: {
    Type: string;
  };
  Segments: FlightSegment[][];
  LastTicketDate: string;
  TicketAdvisory: string;
  FareRules: FareRule[];
  Fare: {
    Currency: string;
    BaseFare: number;
    Tax: number;
    YQTax: number;
    AdditionalTxnFeeOfrd: number;
    AdditionalTxnFeePub: number;
    PGCharge: number;
    OtherCharges: number;
    ChargeBU: ChargeBU[];
    Discount: number;
    PublishedFare: number;
    OfferedFare: number;
    TdsOnCommission: number;
    TdsOnPLB: number;
    TdsOnIncentive: number;
    ServiceFee: number;
  };
}

export interface FlightSegment {
  Origin: Airport;
  Destination: Airport;
  AirlineCode: string;
  AirlineName: string;
  FlightNumber: string;
  FareClass: string;
  OperatingCarrier: string;
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  FlightInfoIndex: string;
  Baggage: string;
  CabinBaggage: string;
  AccumulatedDuration: number;
  Craft: string;
  Remark: string | null;
  IsETicketEligible: boolean;
  FlightStatus: string;
  Status: string;
}

export interface Airport {
  AirportCode: string;
  AirportName: string;
  Terminal: string;
  DepTime: string;
  ArrTime: string;
  CityCode: string;
  CityName: string;
  CountryCode: string;
  CountryName: string;
}

export interface FareRule {
  Origin: string;
  Destination: string;
  Airline: string;
  FareBasisCode: string;
  FareRuleDetail: string;
  FareRestriction: string;
}

export interface ChargeBU {
  Key: string;
  Value: number;
}

// ============================================================================
// Re-Pricing
// ============================================================================

export interface RepricingRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
}

export interface RepricingResponse {
  Response: {
    TraceId: string;
    Results: {
      IsLCC: boolean;
      ResultIndex: string;
      Source: number;
      IsPriceChanged: boolean;
      IsTimeChanged: boolean;
      Fare: {
        Currency: string;
        BaseFare: number;
        Tax: number;
        PublishedFare: number;
        OfferedFare: number;
      };
    };
    Error?: TekTravelsApiError;
  };
}

// ============================================================================
// Seat Map
// ============================================================================

export interface SeatMapRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
}

export interface SeatMapResponse {
  Response: {
    TraceId: string;
    SeatLayout: {
      SegmentSeat: SegmentSeat[];
    };
    Error?: TekTravelsApiError;
  };
}

export interface SegmentSeat {
  SegmentIndex: number;
  Seats: SeatInfo[];
}

export interface SeatInfo {
  RowNo: number;
  SeatNo: string;
  SeatType: number; // 1=Window, 2=Middle, 3=Aisle
  SeatWayType: number; // 1=Available, 2=Blocked, 3=Booked
  Compartment: number; // 1=Economy, 2=Premium Economy, 3=Business, 4=First
  Deck: number;
  Currency: string;
  Price: number;
}

// ============================================================================
// Seat Sell
// ============================================================================

export interface SeatSellRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
  SeatDynamic: SeatDynamic[];
}

export interface SeatDynamic {
  SegmentIndex: number;
  PassengerIndex: number;
  SeatNo: string;
}

export interface SeatSellResponse {
  Response: {
    TraceId: string;
    SeatDynamic: SeatDynamic[];
    IsPriceChanged: boolean;
    Error?: TekTravelsApiError;
  };
}

// ============================================================================
// Ancillary Services
// ============================================================================

export interface AncillaryRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
}

export interface AncillaryResponse {
  Response: {
    TraceId: string;
    Baggage: BaggageInfo[];
    MealDynamic: MealInfo[];
    Error?: TekTravelsApiError;
  };
}

export interface BaggageInfo {
  WayType: number;
  Code: string;
  Description: string;
  Weight: number;
  Currency: string;
  Price: number;
  Origin: string;
  Destination: string;
}

export interface MealInfo {
  WayType: number;
  Code: string;
  Description: string;
  AirlineDescription: string;
  Quantity: number;
  Currency: string;
  Price: number;
  Origin: string;
  Destination: string;
}

// ============================================================================
// Fare Rules
// ============================================================================

export interface FareRulesRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
}

export interface FareRulesResponse {
  Response: {
    TraceId: string;
    FareRules: FareRuleDetail[];
    Error?: TekTravelsApiError;
  };
}

export interface FareRuleDetail {
  Origin: string;
  Destination: string;
  Airline: string;
  FareBasisCode: string;
  FareRuleDetail: string;
  FareRestriction: string;
}

// ============================================================================
// Booking
// ============================================================================

export interface BookingRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
  Passengers: ApiPassenger[];
  GST?: GSTDetails;
}

export interface ApiPassenger {
  Title: string;
  FirstName: string;
  LastName: string;
  PaxType: number; // 1=Adult, 2=Child, 3=Infant
  DateOfBirth: string;
  Gender: number; // 1=Male, 2=Female
  PassportNo: string;
  PassportExpiry: string;
  AddressLine1: string;
  City: string;
  CountryCode: string;
  CountryName: string;
  Nationality: string;
  ContactNo: string;
  Email: string;
  IsLeadPax: boolean;
  FFAirlineCode?: string;
  FFNumber?: string;
}

export interface GSTDetails {
  GSTCompanyAddress: string;
  GSTCompanyContactNumber: string;
  GSTCompanyName: string;
  GSTNumber: string;
  GSTCompanyEmail: string;
}

export interface BookingResponse {
  Response: {
    TraceId: string;
    BookingId: number;
    PNR: string;
    SSRDenied: boolean;
    SSRMessage: string | null;
    Status: number;
    IsPriceChanged: boolean;
    IsTimeChanged: boolean;
    FlightItinerary: {
      Passenger: PassengerInfo[];
      Segments: FlightSegment[][];
      FareRules: FareRule[];
      Fare: {
        Currency: string;
        BaseFare: number;
        Tax: number;
        PublishedFare: number;
        OfferedFare: number;
      };
    };
    Error?: TekTravelsApiError;
  };
}

export interface PassengerInfo {
  Ticket: {
    TicketId: string;
    TicketNumber: string;
  };
  PaxId: number;
  Title: string;
  FirstName: string;
  LastName: string;
  PaxType: number;
  DateOfBirth: string;
  Gender: number;
  PassportNo: string;
  PassportExpiry: string;
  Nationality: string;
  Email: string;
  ContactNo: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export interface TekTravelsApiError {
  ErrorCode: string;
  ErrorMessage: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  recoverable: boolean;
}

// ============================================================================
// Common Types
// ============================================================================

export type CabinClass = 'All' | 'Economy' | 'Premium Economy' | 'Business' | 'First';
export type JourneyType = 'OneWay' | 'Return';
export type PassengerType = 'Adult' | 'Child' | 'Infant';
export type Gender = 'Male' | 'Female';
