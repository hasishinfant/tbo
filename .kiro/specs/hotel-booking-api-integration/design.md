# Design Document: Hotel Booking API Integration

## Overview

This design integrates the TBO Hotel API into TravelSphere's existing React-based architecture. The integration follows the same service-oriented approach as the flight booking integration, with clear separation between API communication, business logic, and UI components.

The integration implements a sequential booking workflow: Search → Hotel Details → Pre-Book → Guest Details → Book → Confirmation. The system includes intelligent fallback to mock data when the API is unavailable.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Hotel Search │  │ Hotel Details│  │ Booking Flow │     │
│  │  Component   │  │  Component   │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Hotel Search │  │ Hotel        │  │ PreBook      │     │
│  │  Service     │  │ Details Svc  │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Hotel        │  │ Location     │  │ Booking Mgmt │     │
│  │ Booking Svc  │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                 API Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ TBO Hotel    │  │ Error        │  │ Mock Fallback│     │
│  │ API Client   │  │ Handler      │  │  Handler     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────▼────────┐  ┌────▼──────────┐
          │  TBO Hotel API  │  │  Mock Data    │
          └─────────────────┘  └───────────────┘
```

## API Endpoints

Based on the Postman collection:

1. **Search**: `POST /TBOHolidays_HotelAPI/search`
2. **PreBook**: `POST /TBOHolidays_HotelAPI/PreBook`
3. **Book**: `POST /TBOHolidays_HotelAPI/Book`
4. **BookingDetail**: `POST /TBOHolidays_HotelAPI/BookingDetail`
5. **BookingDetailsBasedOnDate**: `POST /TBOHolidays_HotelAPI/BookingDetailsBasedOnDate`
6. **Cancel**: `POST /TBOHolidays_HotelAPI/Cancel`
7. **CountryList**: `GET /TBOHolidays_HotelAPI/CountryList`
8. **CityList**: `POST /TBOHolidays_HotelAPI/CityList`
9. **TBOHotelCodeList**: `POST /TBOHolidays_HotelAPI/TBOHotelCodeList`
10. **HotelDetails**: `POST /TBOHolidays_HotelAPI/Hoteldetails`

## Components and Interfaces

### 1. TBO Hotel API Client (`tboHotelApiClient.ts`)

```typescript
interface TBOHotelApiClient {
  // Search for hotels
  searchHotels(request: HotelSearchRequest): Promise<HotelSearchResponse>;
  
  // Get hotel details
  getHotelDetails(hotelCodes: string[], language?: string): Promise<HotelDetailsResponse>;
  
  // Pre-book validation
  preBook(bookingCode: string, paymentMode: string): Promise<PreBookResponse>;
  
  // Create booking
  createBooking(request: HotelBookingRequest): Promise<HotelBookingResponse>;
  
  // Get booking details
  getBookingDetails(confirmationNumber?: string, bookingReferenceId?: string): Promise<BookingDetailResponse>;
  
  // Get bookings by date range
  getBookingsByDateRange(fromDate: string, toDate: string): Promise<BookingListResponse>;
  
  // Cancel booking
  cancelBooking(confirmationNumber: string): Promise<CancelResponse>;
  
  // Get country list
  getCountryList(): Promise<CountryListResponse>;
  
  // Get city list
  getCityList(countryCode: string): Promise<CityListResponse>;
  
  // Get hotel codes for a city
  getHotelCodeList(cityCode: string, isDetailed?: boolean): Promise<HotelCodeListResponse>;
}

interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout: number;
  retryAttempts: number;
}
```

### 2. Hotel Search Service (`hotelSearchService.ts`)

```typescript
interface HotelSearchService {
  // Search for hotels
  search(criteria: HotelSearchCriteria): Promise<HotelSearchResult>;
  
  // Filter results client-side
  filterResults(results: HotelResult[], filters: HotelSearchFilters): HotelResult[];
  
  // Get current search session
  getCurrentSearchSession(): HotelSearchSession | null;
}

interface HotelSearchCriteria {
  checkIn: Date;
  checkOut: Date;
  hotelCodes?: string; // Comma-separated hotel codes
  cityCode?: string;
  guestNationality: string;
  paxRooms: PaxRoom[];
  responseTime?: number;
  isDetailedResponse?: boolean;
  filters?: HotelSearchFilters;
}

interface PaxRoom {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface HotelSearchFilters {
  refundable?: boolean;
  noOfRooms?: number;
  mealType?: number;
  orderBy?: number;
  starRating?: number;
  hotelName?: string;
}

interface HotelResult {
  bookingCode: string;
  hotelCode: string;
  hotelName: string;
  starRating: number;
  address: string;
  cityName: string;
  countryName: string;
  price: number;
  currency: string;
  refundable: boolean;
  mealType: string;
  roomType: string;
  availableRooms: number;
  amenities: string[];
  images: string[];
}

interface HotelSearchResult {
  hotels: HotelResult[];
  searchCriteria: HotelSearchCriteria;
  totalResults: number;
}
```

### 3. Hotel Booking Service (`hotelBookingService.ts`)

```typescript
interface HotelBookingService {
  // Initialize booking session
  startBooking(hotel: HotelResult, searchCriteria: HotelSearchCriteria): HotelBookingSession;
  
  // Pre-book validation
  preBook(bookingCode: string): Promise<PreBookResult>;
  
  // Complete booking
  completeBooking(guestDetails: GuestDetails[], paymentInfo: PaymentInfo): Promise<HotelBookingConfirmation>;
  
  // Get booking details
  getBookingDetails(confirmationNumber: string): Promise<HotelBookingConfirmation>;
  
  // Cancel booking
  cancelBooking(confirmationNumber: string): Promise<CancelResult>;
  
  // Get current session
  getCurrentSession(): HotelBookingSession | null;
  
  // Cancel session
  cancelSession(): void;
}

interface HotelBookingSession {
  sessionId: string;
  hotel: HotelResult;
  searchCriteria: HotelSearchCriteria;
  bookingCode: string;
  preBookResult?: PreBookResult;
  status: 'search' | 'details' | 'prebook' | 'guest_details' | 'payment' | 'confirmed';
  createdAt: Date;
  expiresAt: Date;
}

interface GuestDetails {
  roomIndex: number;
  customerNames: CustomerName[];
}

interface CustomerName {
  title: string;
  firstName: string;
  lastName: string;
  type: 'Adult' | 'Child';
}

interface HotelBookingConfirmation {
  confirmationNumber: string;
  bookingReferenceId: string;
  hotel: HotelResult;
  guestDetails: GuestDetails[];
  totalFare: number;
  currency: string;
  checkIn: Date;
  checkOut: Date;
  bookedAt: Date;
  status: string;
  voucherUrl?: string;
}

interface PreBookResult {
  bookingCode: string;
  originalPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  available: boolean;
}

interface CancelResult {
  success: boolean;
  confirmationNumber: string;
  refundAmount?: number;
  cancellationFee?: number;
  message: string;
}
```

### 4. Location Service (`locationService.ts`)

```typescript
interface LocationService {
  // Get list of countries
  getCountries(): Promise<Country[]>;
  
  // Get cities in a country
  getCities(countryCode: string): Promise<City[]>;
  
  // Get hotels in a city
  getHotelsInCity(cityCode: string, detailed?: boolean): Promise<HotelInfo[]>;
  
  // Search locations
  searchLocations(query: string): Promise<Location[]>;
}

interface Country {
  code: string;
  name: string;
}

interface City {
  code: string;
  name: string;
  countryCode: string;
  countryName: string;
}

interface HotelInfo {
  hotelCode: string;
  hotelName: string;
  address: string;
  cityCode: string;
  starRating: number;
  latitude?: number;
  longitude?: number;
}

interface Location {
  type: 'country' | 'city' | 'hotel';
  code: string;
  name: string;
  displayName: string;
}
```

## Data Models

### Request/Response Types

```typescript
// Search Request
interface HotelSearchRequest {
  CheckIn: string; // YYYY-MM-DD
  CheckOut: string; // YYYY-MM-DD
  HotelCodes?: string; // Comma-separated
  CityCode?: string;
  GuestNationality: string;
  PaxRooms: {
    Adults: number;
    Children: number;
    ChildrenAges: number[];
  }[];
  ResponseTime?: number;
  IsDetailedResponse?: boolean;
  Filters?: {
    Refundable?: boolean;
    NoOfRooms?: number;
    MealType?: number;
    OrderBy?: number;
    StarRating?: number;
    HotelName?: string;
  };
}

// Booking Request
interface HotelBookingRequest {
  BookingCode: string;
  CustomerDetails: {
    CustomerNames: {
      Title: string;
      FirstName: string;
      LastName: string;
      Type: string;
    }[];
  }[];
  ClientReferenceId: string;
  BookingReferenceId: string;
  TotalFare: number;
  EmailId: string;
  PhoneNumber: string;
  BookingType: string;
  PaymentMode: string;
}
```

## Testing Strategy

### Unit Tests
- API client request/response transformations
- Service business logic
- Error handling scenarios
- Mock fallback transitions

### Integration Tests
- Complete booking flow (search → book → confirm)
- Price change during pre-book
- Room unavailability handling
- API failure and mock fallback
- Session timeout and recovery

### Property-Based Tests
- Search criteria validation
- Guest details validation
- Date range validation
- Price calculation accuracy

## Error Handling

Reuse the existing `errorHandler.ts` with hotel-specific error codes:

```typescript
const HOTEL_ERROR_MESSAGES = {
  'HOTEL_NOT_AVAILABLE': 'This hotel is no longer available. Please select another hotel.',
  'ROOM_SOLD_OUT': 'The selected room is sold out. Please choose another room type.',
  'INVALID_BOOKING_CODE': 'Your session has expired. Please start a new search.',
  'BOOKING_FAILED': 'We couldn\'t complete your hotel booking. Please try again.',
  'CANCELLATION_FAILED': 'Unable to cancel the booking. Please contact support.',
  // ... more error codes
};
```

## Integration with TravelSphere

1. **Itinerary Integration**: Add hotel bookings to the existing itinerary service
2. **Navigation**: Add "Book Hotels" option to trip planner
3. **Combined Bookings**: Allow users to book flights and hotels together
4. **Confidence Scoring**: Integrate hotel bookings with the confidence engine

## Implementation Notes

- Use Basic Authentication for TBO Hotel API (username/password in headers)
- Base URL: `http://api.tbotechnology.in/TBOHolidays_HotelAPI`
- Session timeout: 30 minutes (same as flight booking)
- Cache hotel details and location data for session duration
- Support multiple rooms with different guest configurations
- Handle date formatting (YYYY-MM-DD for API)
