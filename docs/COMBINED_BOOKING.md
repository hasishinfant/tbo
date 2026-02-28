# Combined Flight + Hotel Booking

This document describes the combined booking feature that allows users to book flights and hotels together in a unified experience.

## Overview

The combined booking feature coordinates both flight and hotel bookings through a single workflow, managing both sessions simultaneously and providing a unified confirmation and itinerary view.

## Architecture

### Services

#### `combinedBookingService.ts`
The main service that coordinates flight and hotel bookings:

- **`startCombinedBooking()`**: Initiates a combined booking session with both flight and hotel
- **`startFlightOnlyBooking()`**: Initiates a flight-only booking session
- **`startHotelOnlyBooking()`**: Initiates a hotel-only booking session
- **`completeCombinedBooking()`**: Completes the booking for both flight and hotel
- **`calculateTotalCost()`**: Calculates the total cost across both bookings
- **`cancelSession()`**: Cancels the combined booking session

The service manages:
- Session lifecycle (30-minute timeout)
- Coordination between flight and hotel booking services
- Combined payment processing
- Unified confirmation generation

### Components

#### `CombinedBookingWorkflow.tsx`
Multi-step workflow component that guides users through the combined booking process:

**Features:**
- Progress indicator showing current step
- Booking summary sidebar with real-time cost calculation
- Passenger and guest details forms
- Payment information collection
- Error handling and validation

**Steps:**
1. Flight selection
2. Hotel selection
3. Flight repricing
4. Hotel pre-booking
5. Passenger details
6. Guest details
7. Payment
8. Confirmation

#### `CombinedItineraryView.tsx`
Displays the confirmed booking in a timeline format:

**Features:**
- Success confirmation with booking details
- Timeline view showing flight and hotel information
- Download and email options for itinerary
- Important travel information
- Booking reference numbers for both services

### Pages

#### `CombinedBookingPage.tsx`
Page component that orchestrates the booking workflow and confirmation display.

## Usage

### Starting a Combined Booking

```typescript
import { combinedBookingService } from '@/services/combinedBookingService';

// Start combined booking
const session = combinedBookingService.startCombinedBooking(
  selectedFlight,
  traceId,
  selectedHotel,
  hotelSearchCriteria
);
```

### Flight-Only Booking

```typescript
// Start flight-only booking
const session = combinedBookingService.startFlightOnlyBooking(
  selectedFlight,
  traceId
);
```

### Hotel-Only Booking

```typescript
// Start hotel-only booking
const session = combinedBookingService.startHotelOnlyBooking(
  selectedHotel,
  hotelSearchCriteria
);
```

### Completing the Booking

```typescript
const confirmation = await combinedBookingService.completeCombinedBooking(
  passengerDetails,  // null if hotel-only
  guestDetails,      // null if flight-only
  paymentInfo
);
```

## Data Flow

```
User Selection
     ↓
Combined Booking Service
     ↓
  ┌──────────────────┐
  │                  │
  ↓                  ↓
Flight Booking    Hotel Booking
Service           Service
  ↓                  ↓
  │                  │
  └──────────────────┘
     ↓
Combined Confirmation
     ↓
Itinerary Integration
```

## Session Management

### Session Storage
- Combined sessions are stored in localStorage with key `combined_booking_session`
- Individual flight and hotel sessions maintain their own storage
- Sessions expire after 30 minutes of inactivity

### Session Restoration
Sessions can be restored after page refresh:

```typescript
const session = combinedBookingService.restoreSession();
if (session) {
  // Continue with existing session
}
```

## Integration with Itinerary Service

Both flight and hotel bookings are automatically integrated into the TravelSphere itinerary:

```typescript
// Automatically called during booking completion
itineraryService.addFlightBooking(flightBooking);
itineraryService.addHotelBooking(hotelBooking);
```

## Cost Calculation

The service calculates total cost by combining:
- Flight fare (from repriced flight if available)
- Hotel price (from pre-book result if available)

```typescript
const totalCost = combinedBookingService.calculateTotalCost();
```

## Error Handling

The service preserves sessions on booking failures, allowing users to retry:

```typescript
try {
  await combinedBookingService.completeCombinedBooking(...);
} catch (error) {
  // Session is preserved for retry
  console.error('Booking failed:', error);
}
```

## Testing

Unit tests are provided in `src/services/__tests__/combinedBookingService.test.ts`:

- Session initialization tests
- Cost calculation tests
- Session management tests
- Error handling tests

Run tests:
```bash
npm test -- combinedBookingService.test.ts
```

## UI/UX Considerations

### Design Principles
- **Unified Experience**: Single workflow for both bookings
- **Clear Progress**: Visual progress indicator
- **Cost Transparency**: Real-time total cost display
- **Mobile-First**: Responsive design for all screen sizes
- **Error Recovery**: Preserve session state on failures

### Styling
- Travel-themed colors (blue, teal, soft orange)
- Rounded cards with soft shadows
- Gradient backgrounds
- Touch-friendly buttons (minimum 44px)

## Future Enhancements

Potential improvements for the combined booking feature:

1. **Package Deals**: Offer discounts for combined bookings
2. **Flexible Dates**: Allow date flexibility for better pricing
3. **Multi-City**: Support multi-city itineraries
4. **Car Rentals**: Add car rental to the combined booking
5. **Travel Insurance**: Integrate travel insurance options
6. **Split Payments**: Allow different payment methods for flight and hotel
7. **Group Bookings**: Support booking for multiple travelers
8. **Loyalty Programs**: Integrate airline and hotel loyalty programs

## API Requirements

### Flight Booking API (Tek Travels)
- Search endpoint
- Fare quote endpoint
- Booking endpoint

### Hotel Booking API (TBO)
- Search endpoint
- Pre-book endpoint
- Booking endpoint

Both APIs must be configured with valid credentials in `.env`:
```
VITE_TEK_TRAVELS_API_KEY=your_key
VITE_TBO_API_USERNAME=your_username
VITE_TBO_API_PASSWORD=your_password
```

## Troubleshooting

### Session Expired
If users see "session expired" errors:
- Sessions timeout after 30 minutes
- Users should start a new booking
- Consider implementing session extension

### Booking Failures
If bookings fail:
- Check API credentials
- Verify network connectivity
- Review error logs
- Session is preserved for retry

### Cost Discrepancies
If costs don't match:
- Verify repricing was completed
- Check pre-book results
- Ensure currency consistency

## Support

For issues or questions about the combined booking feature:
1. Check the error logs in browser console
2. Review the session state in localStorage
3. Verify API configurations
4. Contact the development team
