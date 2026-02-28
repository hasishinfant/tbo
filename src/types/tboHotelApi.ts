/**
 * TBO Hotel API Type Definitions
 * 
 * Type definitions for the TBO Hotel API integration.
 * Based on the TBO Hotel API documentation and Postman collection.
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  recoverable: boolean;
}

// ============================================================================
// Search Types
// ============================================================================

export interface HotelSearchRequest {
  CheckIn: string; // YYYY-MM-DD
  CheckOut: string; // YYYY-MM-DD
  HotelCodes?: string; // Comma-separated hotel codes
  CityCode?: string;
  GuestNationality: string;
  PaxRooms: PaxRoom[];
  ResponseTime?: number;
  IsDetailedResponse?: boolean;
  Filters?: HotelSearchFilters;
}

export interface PaxRoom {
  Adults: number;
  Children: number;
  ChildrenAges: number[];
}

export interface HotelSearchFilters {
  Refundable?: boolean;
  NoOfRooms?: number;
  MealType?: number;
  OrderBy?: number;
  StarRating?: number;
  HotelName?: string;
}

export interface HotelSearchResponse {
  Hotels: Hotel[];
  Status: number;
  Message?: string;
}

export interface Hotel {
  BookingCode: string;
  HotelCode: string;
  HotelName: string;
  StarRating: number;
  HotelAddress: string;
  HotelContactNo: string;
  CityName: string;
  CountryName: string;
  Price: {
    CurrencyCode: string;
    RoomPrice: number;
    Tax: number;
    ExtraGuestCharge: number;
    ChildCharge: number;
    OtherCharges: number;
    Discount: number;
    PublishedPrice: number;
    OfferedPrice: number;
    AgentCommission: number;
    AgentMarkUp: number;
  };
  Refundable: boolean;
  MealType: string;
  RoomType: string;
  AvailableRooms: number;
  Amenities: string[];
  HotelPicture: string;
  HotelImages: string[];
}

// ============================================================================
// Hotel Details Types
// ============================================================================

export interface HotelDetailsRequest {
  HotelCodes: string; // Comma-separated hotel codes
  Language?: string;
}

export interface HotelDetailsResponse {
  HotelDetails: HotelDetail[];
  Status: number;
  Message?: string;
}

export interface HotelDetail {
  HotelCode: string;
  HotelName: string;
  StarRating: number;
  Description: string;
  HotelFacilities: string[];
  Attractions: Attraction[];
  HotelPolicy: {
    CheckInTime: string;
    CheckOutTime: string;
    CancellationPolicy: string;
  };
  Images: string[];
  Address: string;
  PinCode: string;
  CityName: string;
  CountryName: string;
  PhoneNumber: string;
  FaxNumber: string;
  Map: {
    Latitude: number;
    Longitude: number;
  };
}

export interface Attraction {
  Key: string;
  Value: string;
}

// ============================================================================
// PreBook Types
// ============================================================================

export interface PreBookRequest {
  BookingCode: string;
  PaymentMode: string;
}

export interface PreBookResponse {
  BookingCode: string;
  IsPriceChanged: boolean;
  IsCancellationPolicyChanged: boolean;
  Status: number;
  Message?: string;
  HotelDetails: {
    HotelName: string;
    Price: {
      CurrencyCode: string;
      PublishedPrice: number;
      OfferedPrice: number;
    };
  };
}

// ============================================================================
// Booking Types
// ============================================================================

export interface HotelBookingRequest {
  BookingCode: string;
  CustomerDetails: GuestDetail[];
  ClientReferenceId: string;
  BookingReferenceId: string;
  TotalFare: number;
  EmailId: string;
  PhoneNumber: string;
  BookingType: string;
  PaymentMode: string;
}

export interface GuestDetail {
  CustomerNames: CustomerName[];
}

export interface CustomerName {
  Title: string;
  FirstName: string;
  LastName: string;
  Type: string; // 'Adult' or 'Child'
}

export interface HotelBookingResponse {
  ConfirmationNo: string;
  BookingRefNo: string;
  BookingId: number;
  Status: number;
  Message?: string;
  HotelDetails: {
    HotelName: string;
    CheckInDate: string;
    CheckOutDate: string;
    TotalFare: number;
    CurrencyCode: string;
  };
  VoucherUrl?: string;
}

// ============================================================================
// Booking Details Types
// ============================================================================

export interface BookingDetailRequest {
  ConfirmationNo?: string;
  BookingRefNo?: string;
}

export interface BookingDetailResponse {
  BookingDetails: BookingDetail;
  Status: number;
  Message?: string;
}

export interface BookingDetail {
  ConfirmationNo: string;
  BookingRefNo: string;
  BookingId: number;
  BookingStatus: string;
  HotelName: string;
  CheckInDate: string;
  CheckOutDate: string;
  TotalFare: number;
  CurrencyCode: string;
  GuestDetails: GuestDetail[];
  BookedOn: string;
  VoucherUrl?: string;
}

// ============================================================================
// Booking List Types
// ============================================================================

export interface BookingListRequest {
  FromDate: string; // YYYY-MM-DD
  ToDate: string; // YYYY-MM-DD
}

export interface BookingListResponse {
  Bookings: BookingSummary[];
  Status: number;
  Message?: string;
}

export interface BookingSummary {
  ConfirmationNo: string;
  BookingRefNo: string;
  HotelName: string;
  CheckInDate: string;
  CheckOutDate: string;
  BookingStatus: string;
  TotalFare: number;
  CurrencyCode: string;
}

// ============================================================================
// Cancellation Types
// ============================================================================

export interface CancelRequest {
  ConfirmationNo: string;
}

export interface CancelResponse {
  ConfirmationNo: string;
  CancellationStatus: string;
  RefundAmount: number;
  CancellationCharge: number;
  Status: number;
  Message?: string;
}

// ============================================================================
// Location Types
// ============================================================================

export interface CountryListResponse {
  Countries: Country[];
  Status: number;
  Message?: string;
}

export interface Country {
  Code: string;
  Name: string;
}

export interface CityListRequest {
  CountryCode: string;
}

export interface CityListResponse {
  Cities: City[];
  Status: number;
  Message?: string;
}

export interface City {
  Code: string;
  Name: string;
  CountryCode: string;
}

export interface HotelCodeListRequest {
  CityCode: string;
  IsDetailedResponse?: boolean;
}

export interface HotelCodeListResponse {
  Hotels: HotelInfo[];
  Status: number;
  Message?: string;
}

export interface HotelInfo {
  HotelCode: string;
  HotelName: string;
  Address: string;
  CityCode: string;
  StarRating: number;
  Latitude?: number;
  Longitude?: number;
}
