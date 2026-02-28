# Design Document: Flight Booking API Integration

## Overview

This design integrates the Tek Travels Universal Air API into TravelSphere's existing React-based architecture. The integration follows a service-oriented approach with clear separation between API communication, business logic, and UI components. The design preserves TravelSphere's existing features (confidence scoring, AI itinerary generation, chat assistant) while adding real-time flight booking capabilities.

The integration implements a sequential booking workflow: Search → Re-price → Seat Selection → Ancillary Services → Fare Rules → Final Booking. Each step maintains a TraceId for transaction consistency. The system includes intelligent fallback to mock data when the API is unavailable, ensuring continuous user experience.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Flight Search│  │ Booking Flow │  │ Confirmation │     │
│  │  Component   │  │  Components  │  │  Component   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Flight Search│  │ Booking      │  │ Ancillary    │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Re-Pricing   │  │ Seat         │  │ Fare Rules   │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                 API Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Tek Travels  │  │ Error        │  │ Mock Fallback│     │
│  │ API Client   │  │ Handler      │  │  Handler     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────▼────────┐  ┌────▼──────────┐
          │ Tek Travels API │  │  Mock Data    │
          └─────────────────┘  └───────────────┘
```

### Component Responsibilities

**UI Layer:**
- Render flight search forms and results
- Display booking workflow steps with progress indication
- Handle user input and validation
- Integrate with existing TravelSphere itinerary display

**Service Layer:**
- Encapsulate business logic for each booking step
- Manage booking session state and TraceId
- Transform API responses to application models
- Coordinate sequential workflow steps

**API Client Layer:**
- HTTP communication with Tek Travels API
- Request/response serialization
- Error detection and retry logic
- Automatic fallback to mock data

## Components and Interfaces

### 1. API Client (`tekTravelsApiClient.ts`)

The central HTTP client for all Tek Travels API communication.

```typescript
interface TekTravelsApiClient {
  // Search for flights
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>;
  
  // Re-price selected flight
  repriceFlight(traceId: string, resultIndex: string): Promise<RepricingResponse>;
  
  // Get seat map
  getSeatMap(traceId: string, resultIndex: string): Promise<SeatMapResponse>;
  
  // Reserve seats
  sellSeats(traceId: string, seatSelections: SeatSelection[]): Promise<SeatSellResponse>;
  
  // Get ancillary services
  getAncillaryServices(traceId: string): Promise<AncillaryResponse>;
  
  // Get fare rules
  getFareRules(traceId: string, resultIndex: string): Promise<FareRulesResponse>;
  
  // Create booking
  createBooking(request: BookingRequest): Promise<BookingResponse>;
}

interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}
```

**Implementation Notes:**
- Uses Axios with interceptors for authentication and error handling
- Includes TraceId in all requests after initial search
- Implements exponential backoff for retries
- Throws typed errors for different failure scenarios

### 2. Flight Search Service (`flightSearchService.ts`)

Handles flight search and result filtering.

```typescript
interface FlightSearchService {
  // Search for flights
  search(criteria: SearchCriteria): Promise<SearchResult>;
  
  // Filter results client-side
  filterResults(results: FlightResult[], filters: SearchFilters): FlightResult[];
  
  // Get TraceId from current search
  getCurrentTraceId(): string | null;
}

interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
}

interface SearchFilters {
  priceRange?: { min: number; max: number };
  maxDuration?: number;
  maxStops?: number;
  airlines?: string[];
  departureTimeRange?: { start: string; end: string };
}

interface SearchResult {
  traceId: string;
  flights: FlightResult[];
  searchCriteria: SearchCriteria;
}

interface FlightResult {
  resultIndex: string;
  airline: string;
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
  segments: FlightSegment[];
}

interface FlightSegment {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  aircraft: string;
}
```

### 3. Booking Service (`bookingService.ts`)

Manages the sequential booking workflow and session state.

```typescript
interface BookingService {
  // Initialize booking session
  startBooking(flight: FlightResult, traceId: string): BookingSession;
  
  // Get current booking session
  getCurrentSession(): BookingSession | null;
  
  // Update session with step completion
  updateSession(stepData: Partial<BookingSession>): void;
  
  // Complete booking
  completeBooking(passengerDetails: PassengerDetails[], payment: PaymentInfo): Promise<BookingConfirmation>;
  
  // Cancel booking session
  cancelSession(): void;
}

interface BookingSession {
  traceId: string;
  sessionId: string;
  flight: FlightResult;
  repricedFlight?: FlightResult;
  selectedSeats?: SeatSelection[];
  ancillaryServices?: AncillarySelection[];
  fareRules?: FareRules;
  status: 'search' | 'repricing' | 'seats' | 'ancillary' | 'passenger' | 'payment' | 'confirmed';
  createdAt: Date;
  expiresAt: Date;
}

interface PassengerDetails {
  type: 'Adult' | 'Child' | 'Infant';
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: Date;
  email?: string;
  phone?: string;
}

interface BookingConfirmation {
  bookingReference: string;
  pnr: string;
  ticketNumbers: string[];
  flight: FlightResult;
  passengers: PassengerDetails[];
  totalPrice: number;
  currency: string;
  bookedAt: Date;
  ancillaryServices?: AncillarySelection[];
}
```

### 4. Re-Pricing Service (`repricingService.ts`)

Validates current flight prices before booking.

```typescript
interface RepricingService {
  // Re-price selected flight
  repriceFlight(traceId: string, resultIndex: string): Promise<RepricingResult>;
}

interface RepricingResult {
  originalPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  priceIncrease: number;
  available: boolean;
  updatedFlight: FlightResult;
}
```

### 5. Seat Selection Service (`seatSelectionService.ts`)

Handles seat map retrieval and seat assignment.

```typescript
interface SeatSelectionService {
  // Get seat map for flight
  getSeatMap(traceId: string, resultIndex: string): Promise<SeatMap>;
  
  // Reserve selected seats
  reserveSeats(traceId: string, selections: SeatSelection[]): Promise<SeatReservationResult>;
}

interface SeatMap {
  segments: SegmentSeatMap[];
}

interface SegmentSeatMap {
  segmentIndex: number;
  rows: SeatRow[];
  aircraft: string;
}

interface SeatRow {
  rowNumber: number;
  seats: Seat[];
}

interface Seat {
  seatNumber: string;
  available: boolean;
  seatType: 'Window' | 'Middle' | 'Aisle';
  seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  price: number;
  features: string[];
}

interface SeatSelection {
  passengerIndex: number;
  segmentIndex: number;
  seatNumber: string;
}

interface SeatReservationResult {
  success: boolean;
  reservedSeats: SeatSelection[];
  totalCost: number;
}
```

### 6. Ancillary Service (`ancillaryService.ts`)

Manages add-on services (baggage, meals).

```typescript
interface AncillaryService {
  // Get available ancillary services
  getAncillaryServices(traceId: string): Promise<AncillaryOptions>;
  
  // Add ancillary services to booking
  addAncillaryServices(traceId: string, selections: AncillarySelection[]): Promise<AncillaryResult>;
}

interface AncillaryOptions {
  baggage: BaggageOption[];
  meals: MealOption[];
}

interface BaggageOption {
  code: string;
  weight: number;
  unit: 'kg' | 'lbs';
  price: number;
  currency: string;
}

interface MealOption {
  code: string;
  name: string;
  description: string;
  dietaryInfo: string[];
  price: number;
  currency: string;
}

interface AncillarySelection {
  passengerIndex: number;
  type: 'baggage' | 'meal';
  code: string;
}

interface AncillaryResult {
  success: boolean;
  addedServices: AncillarySelection[];
  totalCost: number;
}
```

### 7. Fare Rules Service (`fareRulesService.ts`)

Retrieves and displays fare conditions.

```typescript
interface FareRulesService {
  // Get fare rules for flight
  getFareRules(traceId: string, resultIndex: string): Promise<FareRules>;
}

interface FareRules {
  cancellationPolicy: string;
  changeFee: number;
  refundable: boolean;
  baggageAllowance: BaggageAllowance;
  restrictions: string[];
}

interface BaggageAllowance {
  checkedBags: number;
  checkedBagWeight: number;
  carryOnBags: number;
  carryOnWeight: number;
  unit: 'kg' | 'lbs';
}
```

### 8. Mock Fallback Handler (`mockFallbackHandler.ts`)

Detects API failures and provides mock data.

```typescript
interface MockFallbackHandler {
  // Check if API is available
  isApiAvailable(): Promise<boolean>;
  
  // Get mock flight search results
  getMockFlightResults(criteria: SearchCriteria): SearchResult;
  
  // Get mock seat map
  getMockSeatMap(): SeatMap;
  
  // Get mock ancillary options
  getMockAncillaryOptions(): AncillaryOptions;
  
  // Get mock fare rules
  getMockFareRules(): FareRules;
  
  // Indicate mock mode to user
  setMockMode(enabled: boolean): void;
  
  // Check if currently in mock mode
  isMockMode(): boolean;
}
```

## Data Models

### Core Types (`types/flight.ts`)

```typescript
// Flight search request matching Tek Travels API format
interface FlightSearchRequest {
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

interface SearchSegment {
  Origin: string;
  Destination: string;
  FlightCabinClass: '1' | '2' | '3' | '4'; // 1=All, 2=Economy, 3=Premium Economy, 4=Business
  PreferredDepartureTime: string;
  PreferredArrivalTime: string;
}

// Booking request matching Tek Travels API format
interface BookingRequest {
  ResultIndex: string;
  Passengers: ApiPassenger[];
  TraceId: string;
  EndUserIp: string;
  TokenId: string;
}

interface ApiPassenger {
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
}
```

### Session Management (`types/session.ts`)

```typescript
interface SessionState {
  currentSession: BookingSession | null;
  mockMode: boolean;
  apiAvailable: boolean;
}
```

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Flight Search Returns Valid Results

*For any* valid search criteria (origin, destination, dates, passenger counts), when the Flight_Search_Service performs a search, the returned results should contain only flights matching the search criteria and each result should include all required fields (airline, flight number, times, price, duration, stops).

**Validates: Requirements 1.1, 1.4, 1.6**

### Property 2: TraceId Lifecycle Consistency

*For any* flight search that completes successfully, a unique TraceId should be generated or extracted, associated with the booking session, and included in all subsequent API calls until the session expires or a new search begins.

**Validates: Requirements 1.2, 7.1, 7.2, 7.4**

### Property 3: Client-Side Filter Correctness

*For any* set of flight results and any combination of filters (price range, duration, stops, airlines), applying the filters should return only results that satisfy all filter criteria without making additional API calls.

**Validates: Requirements 1.3**

### Property 4: Round-Trip Search Completeness

*For any* round-trip search criteria, the Flight_Search_Service should return results for both outbound and return flights, and each direction should have at least one valid flight option when flights are available.

**Validates: Requirements 1.7**

### Property 5: Mock Fallback Activation

*For any* API call that fails or times out, the Mock_Fallback_Handler should detect the failure within 5 seconds, switch to mock data mode, return appropriate mock data, and clearly indicate to the user that results are simulated.

**Validates: Requirements 1.5, 2.4, 8.1, 8.2, 8.3**

### Property 6: Fare Rules Completeness and Caching

*For any* flight selection with a valid TraceId, the Fare_Rules_Service should retrieve fare rules containing cancellation policy, change fees, refund status, and baggage allowance, and subsequent requests for the same flight within the session should return cached data without additional API calls.

**Validates: Requirements 2.1, 2.2, 2.5**

### Property 7: Layover Calculation Accuracy

*For any* connecting flight with multiple segments, the displayed itinerary should include calculated layover durations between segments, and each layover duration should equal the difference between the arrival time of one segment and the departure time of the next.

**Validates: Requirements 2.3**

### Property 8: Re-Pricing Price Change Detection

*For any* flight re-pricing operation, if the current price differs from the original price, the Re_Pricing_Service should calculate the price difference, display it prominently, and require explicit user confirmation before proceeding.

**Validates: Requirements 3.1, 3.2**

### Property 9: Re-Pricing Workflow Progression

*For any* re-pricing operation where the price remains unchanged and the flight is still available, the Booking_Engine should automatically proceed to the next workflow step without requiring user intervention.

**Validates: Requirements 3.3**

### Property 10: Booking Session State Consistency

*For any* booking workflow operation (re-pricing, seat selection, ancillary selection), when the operation completes successfully, the Booking_Session should be updated with the new data and the session status should reflect the current workflow step.

**Validates: Requirements 3.5, 4.3, 5.4**

### Property 11: Seat Map Categorization

*For any* seat map retrieved for a flight, each seat should be categorized as available, occupied, or premium, and the visual display should distinguish these categories clearly.

**Validates: Requirements 4.1, 4.2**

### Property 12: Multi-Passenger Seat Selection

*For any* booking with multiple passengers, the Seat_Selection_Service should allow independent seat selection for each passenger, and the total number of selected seats should equal the number of passengers before proceeding.

**Validates: Requirements 4.5**

### Property 13: Seat Reservation Completion

*For any* completed seat selection, the Seat_Selection_Service should call the seat sell API with all selected seats and update the booking session with the reservation result and total seat cost.

**Validates: Requirements 4.6**

### Property 14: Ancillary Options Completeness

*For any* ancillary services request, the returned baggage options should include weight, unit, and price, and meal options should include name, description, dietary information, and price.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 15: Ancillary Selection Price Update

*For any* ancillary service selection, the Booking_Session should be updated with the selected services, and the total booking price should increase by the sum of all selected ancillary service prices.

**Validates: Requirements 5.6**

### Property 16: Booking Confirmation Completeness

*For any* successful booking API response, the generated Booking_Confirmation should include a booking reference, PNR, ticket numbers for all passengers, complete flight details, passenger information, and all selected ancillary services.

**Validates: Requirements 6.1, 6.2, 6.6**

### Property 17: Booking Confirmation Actions

*For any* generated booking confirmation, the UI should provide both download and email options for the ticket, and the flight details should be integrated into the user's existing TravelSphere itinerary.

**Validates: Requirements 6.3, 6.5**

### Property 18: Session Timeout and Invalidation

*For any* booking session that remains inactive beyond the timeout period, the TraceId should be invalidated and the session should be cleared from memory.

**Validates: Requirements 7.3**

### Property 19: Error Recovery and Workflow Restart

*For any* API error indicating invalid TraceId or flight unavailability, the Booking_Engine should display a clear error message, and for invalid TraceId errors specifically, restart the workflow from the search step.

**Validates: Requirements 3.4, 6.4, 7.5**

### Property 20: API Error Handling and User Feedback

*For any* API error response, the API_Client should parse the error, map it to a user-friendly message, and display the message to the user without exposing technical details.

**Validates: Requirements 8.4**

### Property 21: Network Retry with Exponential Backoff

*For any* network connectivity failure, the API_Client should retry the failed request up to 3 times with exponentially increasing delays (e.g., 1s, 2s, 4s), and if all retries fail, trigger the mock fallback handler.

**Validates: Requirements 8.5**

### Property 22: API Restoration Detection

*For any* subsequent search operation after the API has been restored from an unavailable state, the Mock_Fallback_Handler should automatically switch back to live data mode and disable mock mode indication.

**Validates: Requirements 8.6**

## Error Handling

### Error Categories

**1. Network Errors:**
- Connection timeout (5 second threshold)
- Network unreachable
- DNS resolution failure

**Strategy:** Retry up to 3 times with exponential backoff (1s, 2s, 4s), then fallback to mock data.

**2. API Errors:**
- Invalid TraceId (restart workflow)
- Flight no longer available (return to search)
- Invalid passenger data (display validation errors)
- Payment failure (preserve session, allow retry)

**Strategy:** Parse error codes from API response, map to user-friendly messages, provide appropriate recovery actions.

**3. Session Errors:**
- Session timeout (30 minutes)
- Invalid session state
- Concurrent session conflicts

**Strategy:** Clear session, notify user, redirect to search page.

**4. Data Validation Errors:**
- Invalid date ranges
- Invalid passenger counts
- Missing required fields

**Strategy:** Client-side validation before API calls, display inline error messages.

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
}

interface ErrorHandler {
  handleError(error: ApiError): ErrorRecoveryAction;
}

type ErrorRecoveryAction = 
  | { type: 'retry'; delay: number }
  | { type: 'fallback'; useMockData: true }
  | { type: 'restart'; fromStep: 'search' }
  | { type: 'notify'; message: string }
  | { type: 'preserve'; allowRetry: true };
```

### Fallback Behavior

When API is unavailable:
1. Display prominent banner: "Using simulated data - actual booking unavailable"
2. Allow users to explore features with mock data
3. Disable final booking step
4. Periodically check API availability (every 30 seconds)
5. Auto-restore when API becomes available

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples of API request/response transformations
- Edge cases (empty results, single result, maximum passengers)
- Error conditions (specific error codes, timeout scenarios)
- Integration points (TravelSphere itinerary integration)
- Mock fallback transitions

**Property-Based Tests:**
- Universal properties across all inputs (see Correctness Properties section)
- Comprehensive input coverage through randomization
- Minimum 100 iterations per property test
- Each property test references its design document property

### Property-Based Testing Configuration

**Library:** fast-check (JavaScript/TypeScript property-based testing library)

**Configuration:**
```typescript
// Example property test configuration
fc.assert(
  fc.property(
    searchCriteriaGenerator(),
    (criteria) => {
      // Test implementation
    }
  ),
  { numRuns: 100 } // Minimum 100 iterations
);
```

**Test Tagging:**
Each property test must include a comment tag:
```typescript
// Feature: flight-booking-api-integration, Property 1: Flight Search Returns Valid Results
```

**Generator Requirements:**
- Create generators for: SearchCriteria, FlightResult, PassengerDetails, SeatSelection, AncillarySelection
- Ensure generators produce valid and edge-case data
- Use fast-check's built-in generators (fc.string(), fc.integer(), fc.date(), etc.)

### Test Organization

```
src/
└── tests/
    ├── unit/
    │   ├── flightSearchService.test.ts
    │   ├── bookingService.test.ts
    │   ├── repricingService.test.ts
    │   ├── seatSelectionService.test.ts
    │   ├── ancillaryService.test.ts
    │   ├── fareRulesService.test.ts
    │   └── mockFallbackHandler.test.ts
    ├── property/
    │   ├── flightSearch.property.test.ts
    │   ├── bookingWorkflow.property.test.ts
    │   ├── sessionManagement.property.test.ts
    │   └── errorHandling.property.test.ts
    ├── generators/
    │   ├── searchCriteriaGenerator.ts
    │   ├── flightResultGenerator.ts
    │   ├── passengerGenerator.ts
    │   └── bookingSessionGenerator.ts
    └── mocks/
        ├── mockApiResponses.ts
        └── mockFlightData.ts
```

### Integration Testing

**Mock Service Worker (MSW) Setup:**
- Mock all Tek Travels API endpoints
- Simulate success and error responses
- Test complete booking workflows end-to-end
- Verify TraceId propagation across requests

**Test Scenarios:**
1. Complete booking flow (search → book → confirm)
2. Price change during re-pricing
3. Flight unavailability during re-pricing
4. API failure and mock fallback
5. Session timeout and recovery
6. Multiple passenger booking with seats and ancillaries

### Coverage Requirements

- Minimum 80% code coverage for service layer
- 100% coverage of error handling paths
- All 22 correctness properties implemented as property tests
- All edge cases covered by unit tests
