# Implementation Plan: Hotel Booking API Integration

## Overview

This implementation plan integrates the TBO Hotel API into TravelSphere following a service-oriented architecture similar to the flight booking integration. The implementation proceeds in layers: API client foundation, core services, booking workflow, UI components, and testing.

## Tasks

- [x] 1. Set up TBO Hotel API client infrastructure
  - [x] 1.1 Create `src/services/api/tboHotelApiClient.ts` with Axios configuration
    - Implement Basic Authentication (username/password)
    - Configure base URL, timeout (10s), and retry logic (3 attempts)
    - Create request/response interfaces for all endpoints
    - Set up environment variables for API credentials in `.env`
    - _Requirements: 8.5_

  - [x] 1.2 Create type definitions in `src/types/tboHotelApi.ts`
    - Define request types for all API endpoints
    - Define response types for all API endpoints
    - Create internal model types (HotelResult, HotelBookingSession, etc.)
    - _Requirements: All_

- [x] 2. Implement location services
  - [x] 2.1 Create `src/services/locationService.ts`
    - Implement `getCountries()` calling CountryList endpoint
    - Implement `getCities()` calling CityList endpoint
    - Implement `getHotelsInCity()` calling TBOHotelCodeList endpoint
    - Implement caching for location data
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Write unit tests for location service
    - Test country list retrieval
    - Test city list filtering
    - Test hotel code list retrieval
    - Test caching behavior

- [x] 3. Implement hotel search service
  - [x] 3.1 Create `src/services/hotelSearchService.ts`
    - Implement `search()` method calling TBO Hotel API
    - Extract and store BookingCode from API response
    - Transform API response to internal HotelResult model
    - Integrate mock fallback for API failures
    - _Requirements: 1.1, 1.2, 1.4, 1.7_

  - [x] 3.2 Implement client-side filtering logic
    - Create `filterResults()` method for refundable, star rating, meal type
    - Implement filter combination logic (AND conditions)
    - Ensure no additional API calls during filtering
    - _Requirements: 1.3_

  - [x] 3.3 Implement multi-room search handling
    - Handle multiple room configurations
    - Support different guest counts per room
    - Validate children ages
    - _Requirements: 1.6_

  - [x] 3.4 Write unit tests for hotel search service
    - Test search with various criteria
    - Test filter application
    - Test multi-room scenarios
    - Test mock fallback

- [x] 4. Implement hotel details service
  - [x] 4.1 Create `src/services/hotelDetailsService.ts`
    - Implement `getHotelDetails()` calling Hoteldetails endpoint
    - Parse hotel description, amenities, and facilities
    - Implement caching for session duration
    - Integrate mock fallback for API failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Write unit tests for hotel details service
    - Test details retrieval
    - Test caching behavior
    - Test mock fallback
    - Test error handling

- [x] 5. Checkpoint - Ensure search and details functionality works
  - Verify all tests pass
  - Test search → details flow manually
  - Ask user if questions arise
  
- [x] 6. Implement pre-booking service
  - [x] 6.1 Create `src/services/preBookService.ts`
    - Implement `preBook()` calling PreBook API with BookingCode
    - Calculate price difference between original and current
    - Return PreBookResult with price change details
    - Handle room unavailability errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.2 Write unit tests for pre-booking service
    - Test successful pre-booking
    - Test price change detection
    - Test room unavailability
    - Test error handling

- [x] 7. Implement hotel booking service
  - [x] 7.1 Create `src/services/hotelBookingService.ts`
    - Implement `startBooking()` to initialize session
    - Create session state management with expiration (30 minutes)
    - Implement `updateSession()` for workflow progression
    - Add `cancelSession()` for cleanup
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.2 Extend booking service with final booking logic
    - Implement `completeBooking()` calling Book API with all data
    - Transform guest details to API format
    - Generate HotelBookingConfirmation from API response
    - Integrate with TravelSphere itinerary system
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.3 Write unit tests for booking service
    - Test session management
    - Test booking completion
    - Test guest details transformation
    - Test itinerary integration
    - Test error handling and session preservation

- [x] 8. Implement booking management service
  - [x] 8.1 Create `src/services/bookingManagementService.ts`
    - Implement `getBookingDetails()` calling BookingDetail endpoint
    - Implement `getBookingsByDateRange()` calling BookingDetailsBasedOnDate
    - Implement `cancelBooking()` calling Cancel endpoint
    - Parse booking status and details
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.2 Write unit tests for booking management service
    - Test booking details retrieval
    - Test date range queries
    - Test cancellation flow
    - Test error handling

- [x] 9. Checkpoint - Ensure all services are functional
  - Verify all tests pass
  - Test complete booking flow
  - Ask user if questions arise

- [x] 10. Extend error handler for hotel-specific errors
  - [x] 10.1 Update `src/services/errorHandler.ts`
    - Add hotel-specific error codes and messages
    - Add recovery actions for hotel errors
    - Ensure consistency with flight error handling
    - _Requirements: 8.4_

  - [x] 10.2 Write unit tests for hotel error handling
    - Test hotel error code mapping
    - Test recovery actions
    - Test integration with existing error handler

- [x] 11. Create mock data for hotel services
  - [x] 11.1 Create `src/tests/mocks/mockHotelData.ts`
    - Generate diverse hotel results (various star ratings, prices, locations)
    - Include various room types and meal plans
    - Create mock booking confirmations
    - _Requirements: 1.5, 2.4, 8.1, 8.2, 8.3_

  - [x] 11.2 Extend `src/services/mockFallbackHandler.ts`
    - Add hotel-specific mock methods
    - Implement mock mode detection for hotel APIs
    - Ensure consistency with flight mock fallback
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

- [x] 12. Build hotel search UI components
  - [x] 12.1 Create `src/components/hotel/HotelSearchForm.tsx`
    - Build form with location, dates, rooms, guests
    - Implement form validation
    - Connect to hotelSearchService
    - Display loading state during search
    - _Requirements: 1.1_

  - [x] 12.2 Create `src/components/hotel/HotelSearchResults.tsx`
    - Display hotel results in card layout
    - Implement filter controls (refundable, star rating, meal type)
    - Show hotel details (name, location, price, amenities)
    - Handle empty results and mock mode indication
    - _Requirements: 1.3, 1.4, 8.3_

  - [x] 12.3 Write unit tests for search UI components
    - Test form validation
    - Test filter application
    - Test mock mode display

- [x] 13. Build hotel details UI component
  - [x] 13.1 Create `src/components/hotel/HotelDetailsModal.tsx`
    - Display detailed hotel information
    - Show amenities, facilities, and policies
    - Display hotel images in gallery
    - Show check-in/check-out times
    - _Requirements: 2.2, 2.5_

  - [x] 13.2 Write unit tests for hotel details component
    - Test details display
    - Test image gallery
    - Test policy display

- [x] 14. Build hotel booking workflow UI components
  - [x] 14.1 Create `src/components/hotel/HotelBookingWorkflow.tsx`
    - Implement multi-step workflow container
    - Show progress indicator (search → details → prebook → guests → payment → confirmation)
    - Handle step navigation and validation
    - _Requirements: All workflow requirements_

  - [x] 14.2 Create `src/components/hotel/PreBookStep.tsx`
    - Display original vs current price
    - Show price change warning if applicable
    - Require confirmation for price increases
    - Handle room unavailability
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 14.3 Create `src/components/hotel/GuestDetailsForm.tsx`
    - Build form for guest information per room
    - Implement validation for required fields
    - Support multiple rooms with different guests
    - _Requirements: 4.1_

  - [x] 14.4 Create `src/components/hotel/HotelBookingConfirmation.tsx`
    - Display confirmation number and booking reference
    - Show complete hotel details and guest info
    - Provide download and email options for voucher
    - Show integration with TravelSphere itinerary
    - _Requirements: 4.2, 4.3, 4.5, 4.6_

  - [x] 14.5 Write unit tests for booking workflow components
    - Test step navigation
    - Test price change handling
    - Test form validation
    - Test confirmation display

- [ ] 15. Build booking management UI components
  - [x] 15.1 Create `src/components/hotel/BookingList.tsx`
    - Display list of hotel bookings
    - Show booking status and details
    - Provide actions (view details, cancel)
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 15.2 Create `src/components/hotel/BookingDetailsView.tsx`
    - Display complete booking information
    - Show cancellation policy
    - Provide cancellation option
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 15.3 Write unit tests for booking management components
    - Test booking list display
    - Test booking details view
    - Test cancellation flow

- [ ] 16. Integrate with existing TravelSphere features
  - [x] 16.1 Update itinerary service to include hotel bookings
    - Extend itinerary data model to include hotels
    - Add hotels to timeline display
    - Integrate with confidence scoring system
    - _Requirements: 4.5_

  - [x] 16.2 Update navigation to include hotel booking flow
    - Add "Book Hotels" option to trip planner
    - Update routing configuration
    - Ensure mobile-responsive navigation
    - _Requirements: All_

  - [x] 16.3 Create combined flight + hotel booking flow
    - Allow users to book flights and hotels together
    - Coordinate booking sessions
    - Display combined itinerary
    - _Requirements: All_

  - [x] 16.4 Write integration tests for TravelSphere features
    - Test itinerary integration
    - Test navigation flow
    - Test combined bookings
    - Test confidence scoring with hotels

- [x] 17. Set up Mock Service Worker for hotel API mocking
  - Create `src/tests/mocks/hotelApiHandlers.ts` with MSW handlers
  - Mock success responses for complete booking flow
  - Mock error responses for testing error handling
  - Configure MSW in test setup
  - _Requirements: All (for testing)_

- [x] 18. Final checkpoint - End-to-end testing
  - Test complete hotel booking flow from search to confirmation
  - Test price change scenario during pre-book
  - Test room unavailability handling
  - Test API failure and mock fallback
  - Test session timeout and recovery
  - Test multi-room booking with multiple guests
  - Test booking management (view, cancel)
  - Test combined flight + hotel booking
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks build incrementally on the flight booking integration patterns
- Reuse existing error handler, mock fallback handler, and testing infrastructure
- Hotel booking follows similar session management as flight booking
- API uses Basic Authentication (different from flight API)
- Support for multiple rooms and guests per room is a key differentiator
- Integration with existing itinerary and confidence engine is essential
