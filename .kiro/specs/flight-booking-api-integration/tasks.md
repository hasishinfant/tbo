# Implementation Plan: Flight Booking API Integration

## Overview

This implementation plan integrates the Tek Travels Universal Air API into TravelSphere following a service-oriented architecture. The implementation proceeds in layers: API client foundation, core services, booking workflow, UI components, and testing. Each task builds incrementally, with property-based tests placed close to implementation to catch errors early.

## Tasks

- [x] 1. Set up API client infrastructure and configuration
  - Create `src/services/api/tekTravelsApiClient.ts` with Axios configuration
  - Implement authentication interceptor for API key injection
  - Configure base URL, timeout (5s), and retry logic (3 attempts with exponential backoff)
  - Create `src/types/api.ts` with Tek Travels API request/response interfaces
  - Set up environment variables for API credentials in `.env`
  - _Requirements: 8.5_

- [ ]* 1.1 Write property test for API client retry logic
  - **Property 21: Network Retry with Exponential Backoff**
  - **Validates: Requirements 8.5**

- [x] 2. Implement mock fallback handler
  - [x] 2.1 Create `src/services/mockFallbackHandler.ts` with mock data generation
    - Implement `isApiAvailable()` with health check
    - Create mock flight data generator with realistic data
    - Implement mock mode state management
    - _Requirements: 1.5, 8.1, 8.2, 8.3_

  - [ ]* 2.2 Write property test for mock fallback activation
    - **Property 5: Mock Fallback Activation**
    - **Validates: Requirements 1.5, 8.1, 8.2, 8.3**

  - [x] 2.3 Create `src/tests/mocks/mockFlightData.ts` with sample data
    - Generate diverse flight results (direct, one-stop, multi-stop)
    - Include various airlines, prices, and times
    - Create mock seat maps, ancillary options, and fare rules
    - _Requirements: 1.5, 2.4_

- [x] 3. Implement flight search service
  - [x] 3.1 Create `src/services/flightSearchService.ts`
    - Implement `search()` method calling Tek Travels API
    - Extract and store TraceId from API response
    - Transform API response to internal FlightResult model
    - Integrate mock fallback for API failures
    - _Requirements: 1.1, 1.2, 1.4, 1.7_

  - [ ]* 3.2 Write property test for flight search results validity
    - **Property 1: Flight Search Returns Valid Results**
    - **Validates: Requirements 1.1, 1.4, 1.6**

  - [ ]* 3.3 Write property test for TraceId lifecycle
    - **Property 2: TraceId Lifecycle Consistency**
    - **Validates: Requirements 1.2, 7.1, 7.2, 7.4**

  - [x] 3.4 Implement client-side filtering logic
    - Create `filterResults()` method for price, duration, stops, airlines
    - Implement filter combination logic (AND conditions)
    - Ensure no additional API calls during filtering
    - _Requirements: 1.3_

  - [ ]* 3.5 Write property test for filter correctness
    - **Property 3: Client-Side Filter Correctness**
    - **Validates: Requirements 1.3**

  - [x] 3.6 Implement round-trip search handling
    - Handle both outbound and return segments
    - Coordinate two search API calls for round-trip
    - Combine results appropriately
    - _Requirements: 1.7_

  - [ ]* 3.7 Write property test for round-trip completeness
    - **Property 4: Round-Trip Search Completeness**
    - **Validates: Requirements 1.7**

- [x] 4. Checkpoint - Ensure search functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement booking session management
  - [x] 5.1 Create `src/services/bookingService.ts`
    - Implement `startBooking()` to initialize session
    - Create session state management with expiration (30 minutes)
    - Implement `updateSession()` for workflow progression
    - Add `cancelSession()` for cleanup
    - _Requirements: 7.3, 7.4_

  - [ ]* 5.2 Write property test for session state consistency
    - **Property 10: Booking Session State Consistency**
    - **Validates: Requirements 3.5, 4.3, 5.4**

  - [ ]* 5.3 Write property test for session timeout
    - **Property 18: Session Timeout and Invalidation**
    - **Validates: Requirements 7.3**

- [x] 6. Implement re-pricing service
  - [x] 6.1 Create `src/services/repricingService.ts`
    - Implement `repriceFlight()` calling re-price API with TraceId
    - Calculate price difference between original and current
    - Return RepricingResult with price change details
    - Handle flight unavailability errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Write property test for price change detection
    - **Property 8: Re-Pricing Price Change Detection**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 6.3 Write property test for workflow progression
    - **Property 9: Re-Pricing Workflow Progression**
    - **Validates: Requirements 3.3**

- [x] 7. Implement seat selection service
  - [x] 7.1 Create `src/services/seatSelectionService.ts`
    - Implement `getSeatMap()` calling seat map API with TraceId
    - Transform API seat map to internal model
    - Implement `reserveSeats()` calling seat sell API
    - Validate seat selections before reservation
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [ ]* 7.2 Write property test for seat map categorization
    - **Property 11: Seat Map Categorization**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 7.3 Write property test for multi-passenger seat selection
    - **Property 12: Multi-Passenger Seat Selection**
    - **Validates: Requirements 4.5**

  - [ ]* 7.4 Write property test for seat reservation completion
    - **Property 13: Seat Reservation Completion**
    - **Validates: Requirements 4.6**

- [~] 8. Implement ancillary services
  - [x] 8.1 Create `src/services/ancillaryService.ts`
    - Implement `getAncillaryServices()` calling ancillary API with TraceId
    - Parse baggage and meal options from API response
    - Implement `addAncillaryServices()` to reserve selections
    - Calculate total ancillary cost
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [ ]* 8.2 Write property test for ancillary options completeness
    - **Property 14: Ancillary Options Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 8.3 Write property test for ancillary price update
    - **Property 15: Ancillary Selection Price Update**
    - **Validates: Requirements 5.6**

- [~] 9. Implement fare rules service
  - [x] 9.1 Create `src/services/fareRulesService.ts`
    - Implement `getFareRules()` calling fare rules API with TraceId
    - Parse cancellation policy, change fees, baggage allowance
    - Implement caching for session duration
    - Integrate mock fallback for API failures
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 9.2 Write property test for fare rules completeness and caching
    - **Property 6: Fare Rules Completeness and Caching**
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [x] 9.3 Implement layover calculation for connecting flights
    - Calculate layover duration between segments
    - Add layover information to flight details display
    - _Requirements: 2.3_

  - [ ]* 9.4 Write property test for layover calculation accuracy
    - **Property 7: Layover Calculation Accuracy**
    - **Validates: Requirements 2.3**

- [~] 10. Checkpoint - Ensure all services are functional
  - Ensure all tests pass, ask the user if questions arise.

- [~] 11. Implement booking completion
  - [x] 11.1 Extend `bookingService.ts` with final booking logic
    - Implement `completeBooking()` calling booking API with all data
    - Transform passenger details to API format
    - Generate BookingConfirmation from API response
    - Integrate with TravelSphere itinerary system
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [ ]* 11.2 Write property test for booking confirmation completeness
    - **Property 16: Booking Confirmation Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.6**

  - [ ]* 11.3 Write property test for booking confirmation actions
    - **Property 17: Booking Confirmation Actions**
    - **Validates: Requirements 6.3, 6.5**

- [~] 12. Implement error handling and recovery
  - [x] 12.1 Create `src/services/errorHandler.ts`
    - Implement error code mapping to user-friendly messages
    - Create recovery action logic for different error types
    - Implement workflow restart for invalid TraceId
    - Add session preservation for recoverable errors
    - _Requirements: 3.4, 6.4, 7.5, 8.4_

  - [ ]* 12.2 Write property test for error recovery
    - **Property 19: Error Recovery and Workflow Restart**
    - **Validates: Requirements 3.4, 6.4, 7.5**

  - [ ]* 12.3 Write property test for API error handling
    - **Property 20: API Error Handling and User Feedback**
    - **Validates: Requirements 8.4**

  - [ ]* 12.4 Write property test for API restoration detection
    - **Property 22: API Restoration Detection**
    - **Validates: Requirements 8.6**

- [~] 13. Create TypeScript type definitions
  - Create `src/types/flight.ts` with FlightResult, SearchCriteria, FlightSegment
  - Create `src/types/booking.ts` with BookingSession, PassengerDetails, BookingConfirmation
  - Create `src/types/seat.ts` with SeatMap, Seat, SeatSelection
  - Create `src/types/ancillary.ts` with AncillaryOptions, BaggageOption, MealOption
  - Create `src/types/fareRules.ts` with FareRules, BaggageAllowance
  - _Requirements: All_

- [~] 14. Build flight search UI components
  - [~] 14.1 Create `src/components/flight/FlightSearchForm.tsx`
    - Build form with origin, destination, dates, passengers, cabin class
    - Implement form validation
    - Connect to flightSearchService
    - Display loading state during search
    - _Requirements: 1.1_

  - [~] 14.2 Create `src/components/flight/FlightSearchResults.tsx`
    - Display flight results in card layout
    - Implement filter controls (price, duration, stops, airlines)
    - Show flight details (times, duration, price, airline)
    - Handle empty results and mock mode indication
    - _Requirements: 1.3, 1.6, 8.3_

  - [ ]* 14.3 Write unit tests for search UI components
    - Test form validation
    - Test filter application
    - Test mock mode display

- [~] 15. Build booking workflow UI components
  - [~] 15.1 Create `src/components/booking/BookingWorkflow.tsx`
    - Implement multi-step workflow container
    - Show progress indicator (search → repricing → seats → ancillary → passenger → payment → confirmation)
    - Handle step navigation and validation
    - _Requirements: All workflow requirements_

  - [~] 15.2 Create `src/components/booking/RepricingStep.tsx`
    - Display original vs current price
    - Show price change warning if applicable
    - Require confirmation for price increases
    - Handle flight unavailability
    - _Requirements: 3.2, 3.3, 3.4_

  - [~] 15.3 Create `src/components/booking/SeatSelectionStep.tsx`
    - Display seat map with visual seat categorization
    - Implement seat selection for multiple passengers
    - Show selected seats and total cost
    - Allow skipping if seat selection unavailable
    - _Requirements: 4.2, 4.3, 4.5_

  - [~] 15.4 Create `src/components/booking/AncillaryStep.tsx`
    - Display baggage options with weight and price
    - Display meal options with descriptions and dietary info
    - Allow selection for each passenger
    - Update total price dynamically
    - _Requirements: 5.2, 5.3, 5.4_

  - [~] 15.5 Create `src/components/booking/PassengerDetailsForm.tsx`
    - Build form for passenger information (name, DOB, passport, contact)
    - Implement validation for required fields
    - Support multiple passengers
    - _Requirements: 6.1_

  - [~] 15.6 Create `src/components/booking/BookingConfirmation.tsx`
    - Display booking reference, PNR, ticket numbers
    - Show complete flight details and passenger info
    - Provide download and email options
    - Show integration with TravelSphere itinerary
    - _Requirements: 6.2, 6.3, 6.5, 6.6_

  - [ ]* 15.7 Write unit tests for booking workflow components
    - Test step navigation
    - Test price change handling
    - Test seat selection logic
    - Test form validation

- [~] 16. Build fare rules display component
  - Create `src/components/flight/FareRulesDisplay.tsx`
  - Display cancellation policy, change fees, refund status
  - Show baggage allowance details
  - Display restrictions clearly
  - _Requirements: 2.2_

- [~] 17. Integrate with existing TravelSphere features
  - [~] 17.1 Update itinerary service to include flight bookings
    - Extend itinerary data model to include flights
    - Add flights to timeline display
    - Integrate with confidence scoring system
    - _Requirements: 6.5_

  - [~] 17.2 Update navigation to include flight booking flow
    - Add "Book Flights" option to trip planner
    - Update routing configuration
    - Ensure mobile-responsive navigation
    - _Requirements: All_

  - [ ]* 17.3 Write integration tests for TravelSphere features
    - Test itinerary integration
    - Test navigation flow
    - Test confidence scoring with flights

- [~] 18. Set up property-based test generators
  - Create `src/tests/generators/searchCriteriaGenerator.ts` using fast-check
  - Create `src/tests/generators/flightResultGenerator.ts` with realistic data
  - Create `src/tests/generators/passengerGenerator.ts` with valid passenger data
  - Create `src/tests/generators/seatSelectionGenerator.ts`
  - Create `src/tests/generators/bookingSessionGenerator.ts`
  - _Requirements: All (for testing)_

- [~] 19. Set up Mock Service Worker for API mocking
  - Create `src/tests/mocks/handlers.ts` with MSW handlers for all Tek Travels endpoints
  - Mock success responses for complete booking flow
  - Mock error responses for testing error handling
  - Configure MSW in test setup
  - _Requirements: All (for testing)_

- [~] 20. Final checkpoint - End-to-end testing
  - Test complete booking flow from search to confirmation
  - Test price change scenario during re-pricing
  - Test flight unavailability handling
  - Test API failure and mock fallback
  - Test session timeout and recovery
  - Test multi-passenger booking with all add-ons
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Services are implemented before UI components to enable independent testing
- Mock fallback is implemented early to ensure continuous development even without API access
