/**
 * Tek Travels Flight API Type Definitions
 * 
 * Complete TypeScript interfaces for the Tek Travels Universal Air API
 * Based on API documentation and integration requirements
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  EndUserIp: string;
}

export interface AuthResponse {
  Status: number;
  TokenId: string;
  Member: {
    MemberId: number;
    FirstName: string;
    LastName: string;
    Email: string;
  };
}

// ============================================================================
// Flight Search Types
// ============================================================================

export interface FlightSearchRequest {
  EndUserIp: string;
  TokenId?: string;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  DirectFlight: boolean;
  OneStopFlight: boolean;
  JourneyType: 1 | 2; // 1 = OneWay, 2 = RoundTrip
  PreferredAirlines: string | null;
  Segments: FlightSegmentRequest[];
  Sources: string | null;
}

export interface FlightSegmentRequest {
  Origin: string;
  Destination: string;
  FlightCabinClass: number; // 1=All, 2=Economy, 3=PremiumEconomy, 4=Business, 5=PremiumBusiness, 6=First
  PreferredDepartureTime: string;
  PreferredArrivalTime: string;
}

export interface FlightSearchResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    Results: FlightResult[][];
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
  Fare: Fare;
  FareBreakdown: FareBreakdown[];
}

export interface FlightSegment {
  Airline: {
    AirlineCode: string;
    AirlineName: string;
    FlightNumber: string;
    FareClass: string;
  };
  Origin: Airport;
  Destination: Airport;
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  FlightStatus: string;
  SegmentIndicator: number;
  Baggage: string;
  CabinBaggage: string;
  CabinClass: number;
  SupplierFareKey: string | null;
  TripIndicator: number;
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

export interface Fare {
  Currency: string;
  BaseFare: number;
  Tax: number;
  TaxBreakup: TaxBreakup[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  OtherCharges: number;
  ChargeBU: ChargeBU[];
  Discount: number;
  PublishedFare: number;
  CommissionEarned: number;
  PLBEarned: number;
  IncentiveEarned: number;
  OfferedFare: number;
  TdsOnCommission: number;
  TdsOnPLB: number;
  TdsOnIncentive: number;
  ServiceFee: number;
}

export interface TaxBreakup {
  key: string;
  value: number;
}

export interface ChargeBU {
  key: string;
  value: number;
}

export interface FareBreakdown {
  Currency: string;
  PassengerType: number; // 1=Adult, 2=Child, 3=Infant
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  TaxBreakUp: TaxBreakup[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
}

// ============================================================================
// Repricing Types
// ============================================================================

export interface RepricingRequest {
  EndUserIp: string;
  TokenId?: string;
  TraceId: string;
  ResultIndex: string;
}

export interface RepricingResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    Results: FlightResult;
    IsPriceChanged: boolean;
    IsTimeChanged: boolean;
  };
}

// ============================================================================
// Fare Rules Types
// ============================================================================

export interface FareRulesRequest {
  EndUserIp: string;
  TokenId?: string;
  TraceId: string;
  ResultIndex: string;
}

export interface FareRulesResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    FareRules: FareRuleDetail[];
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
// Seat Selection Types
// ============================================================================

export interface SeatMapRequest {
  EndUserIp: string;
  TokenId?: string;
  TraceId: string;
  ResultIndex: string;
  SegmentIndex: number;
}

export interface SeatMapResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    SegmentSeat: SegmentSeat[];
  };
}

export interface SegmentSeat {
  SegmentIndex: number;
  Seats: SeatInfo[][];
}

export interface SeatInfo {
  RowNo: string;
  SeatNo: string;
  SeatType: number; // 1=Window, 2=Middle, 3=Aisle
  SeatWayType: number; // 1=Forward, 2=Backward
  Compartment: number; // 1=Economy, 2=Business, 3=First
  Deck: number; // 1=Upper, 2=Lower
  Currency: string;
  Price: number;
  Code: string;
  Description: string;
  AvailablityType: number; // 0=Available, 1=Blocked, 2=Booked
  SeatDynamic: SeatDynamic;
}

export interface SeatDynamic {
  SeatNo: string;
  RowNo: string;
  SeatType: number;
  SeatWayType: number;
  Compartment: number;
  Deck: number;
  Currency: string;
  Price: number;
  Code: string;
  Description: string;
  AvailablityType: number;
}

export interface SeatSellRequest {
  EndUserIp: string;
  TokenId?: string;
  TraceId: string;
  ResultIndex: string;
  SeatDynamic: SeatDynamic[];
}

export interface SeatSellResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    ResultIndex: string;
    IsSeatSelected: boolean;
  };
}

// ============================================================================
// Ancillary Services Types
// ============================================================================

export interface AncillaryRequest {
  EndUserIp: string;
  TokenId?: string;
  TraceId: string;
  ResultIndex: string;
}

export interface AncillaryResponse {
  Response: {
    ResponseStatus: number;
    TraceId: string;
    Baggage: BaggageInfo[];
    MealDynamic: MealInfo[];
  };
}

export interface BaggageInfo {
  AirlineCode: string;
  FlightNumber: string;
  WayType: number; // 1=Departure, 2=Return
  Code: string;
  Description: string;
  Weight: number;
  Currency: string;
  Price: number;
  Origin: string;
  Destination: string;
}

export interface MealInfo {
  AirlineCode: string;
  FlightNumber: string;
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
// Booking Types
// ============================================================================

export interface BookingRequest {
  EndUserIp: string;
  TokenId?: string;
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
  DateOfBirth: string; // YYYY-MM-DD
  Gender: number; // 1=Male, 2=Female
  PassportNo: string;
  PassportExpiry: string; // YYYY-MM-DD
  AddressLine1: string;
  AddressLine2?: string;
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
    ResponseStatus: number;
    TraceId: string;
    BookingId: number;
    PNR: string;
    Status: number;
    IsPriceChanged: boolean;
    IsTimeChanged: boolean;
    FlightItinerary: FlightItinerary;
  };
}

export interface FlightItinerary {
  BookingId: number;
  PNR: string;
  IsPriceChanged: boolean;
  IsTimeChanged: boolean;
  Origin: string;
  Destination: string;
  AirlineCode: string;
  LastTicketDate: string;
  ValidatingAirlineCode: string;
  AirlineRemark: string;
  IsLCC: boolean;
  NonRefundable: boolean;
  FareType: string;
  Fare: Fare;
  Passenger: PassengerInfo[];
  Segments: FlightSegment[][];
  InvoiceCreatedOn: string;
  InvoiceAmount: number;
  TripIndicator: number;
}

export interface PassengerInfo {
  PassengerId: number;
  Title: string;
  FirstName: string;
  LastName: string;
  PaxType: number;
  DateOfBirth: string;
  Gender: number;
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
  FFAirlineCode: string | null;
  FFNumber: string | null;
  Baggage: PassengerBaggage[];
  MealDynamic: PassengerMeal[];
  SeatDynamic: PassengerSeat[];
  Ticket: TicketInfo;
}

export interface PassengerBaggage {
  Code: string;
  Description: string;
  Weight: number;
  Currency: string;
  Price: number;
  Origin: string;
  Destination: string;
}

export interface PassengerMeal {
  Code: string;
  Description: string;
  AirlineDescription: string;
  Quantity: number;
  Currency: string;
  Price: number;
  Origin: string;
  Destination: string;
}

export interface PassengerSeat {
  SegmentIndex: number;
  Code: string;
  RowNo: string;
  SeatNo: string;
  SeatType: number;
  SeatWayType: number;
  Compartment: number;
  Deck: number;
  Currency: string;
  Price: number;
}

export interface TicketInfo {
  TicketId: number;
  TicketNumber: string;
  IssueDate: string;
  ValidatingAirlineCode: string;
  Remarks: string;
  ServiceFeeAmount: number;
  Status: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiErrorResponse {
  Response: {
    ResponseStatus: number;
    Error: {
      ErrorCode: string;
      ErrorMessage: string;
    };
  };
}

export interface TekTravelsApiError extends Error {
  code?: string;
  response?: ApiErrorResponse;
  status?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type JourneyType = 1 | 2; // 1 = OneWay, 2 = RoundTrip
export type PassengerType = 1 | 2 | 3; // 1 = Adult, 2 = Child, 3 = Infant
export type CabinClass = 1 | 2 | 3 | 4 | 5 | 6; // 1=All, 2=Economy, 3=PremiumEconomy, 4=Business, 5=PremiumBusiness, 6=First
export type Gender = 1 | 2; // 1 = Male, 2 = Female
