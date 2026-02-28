# Seat Selection Service

## Overview

The Seat Selection Service handles seat map retrieval and seat reservation for flights in the TravelSphere application. It integrates with the Tek Travels Universal Air API to provide real-time seat availability and booking capabilities.

## Features

- **Seat Map Retrieval**: Fetch detailed seat maps with availability status
- **Seat Categorization**: Distinguish between available, occupied, and premium seats
- **Multi-Passenger Support**: Handle seat selection for multiple passengers
- **Multi-Segment Support**: Support seat selection for connecting flights
- **Validation**: Comprehensive validation of seat selections before reservation
- **Error Handling**: Robust error handling with clear error messages

## Requirements Fulfilled

- **4.1**: Retrieve seat map using TraceId
- **4.2**: Visually distinguish available, occupied, and premium seats
- **4.3**: Validate seat selections and update booking session
- **4.5**: Allow seat selection for each passenger individually
- **4.6**: Call seat sell API to reserve selected seats

## API Reference

### `getSeatMap(traceId: string, resultIndex: string): Promise<SeatMap>`

Retrieves the seat map for a specific flight.

**Parameters:**
- `traceId`: The TraceId from the flight search
- `resultIndex`: The ResultIndex of the selected flight

**Returns:** Promise resolving to a `SeatMap` object

**Example:**
```typescript
const seatService = getSeatSelectionService();
const seatMap = await seatService.getSeatMap('trace-123', 'result-456');

// Access seat information
seatMap.segments.forEach(segment => {
  segment.rows.forEach(row => {
    row.seats.forEach(seat => {
      console.log(`${seat.seatNumber}: ${seat.available ? 'Available' : 'Occupied'}`);
    });
  });
});
```

### `reserveSeats(traceId: string, resultIndex: string, selections: SeatSelection[]): Promise<SeatReservationResult>`

Reserves selected seats for passengers.

**Parameters:**
- `traceId`: The TraceId from the flight search
- `resultIndex`: The ResultIndex of the selected flight
- `selections`: Array of seat selections

**Returns:** Promise resolving to a `SeatReservationResult` object

**Example:**
```typescript
const selections = [
  { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' },
  { passengerIndex: 1, segmentIndex: 0, seatNumber: '12B' },
];

const result = await seatService.reserveSeats('trace-123', 'result-456', selections);

if (result.success) {
  console.log(`Reserved ${result.reservedSeats.length} seats`);
  console.log(`Total cost: ${result.totalCost}`);
}
```

## Data Models

### SeatMap

```typescript
interface SeatMap {
  segments: SegmentSeatMap[];
}
```

### SegmentSeatMap

```typescript
interface SegmentSeatMap {
  segmentIndex: number;
  rows: SeatRow[];
  aircraft: string;
}
```

### SeatRow

```typescript
interface SeatRow {
  rowNumber: number;
  seats: Seat[];
}
```

### Seat

```typescript
interface Seat {
  seatNumber: string;
  available: boolean;
  seatType: 'Window' | 'Middle' | 'Aisle';
  seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  price: number;
  currency: string;
  features: string[];
}
```

### SeatSelection

```typescript
interface SeatSelection {
  passengerIndex: number;
  segmentIndex: number;
  seatNumber: string;
}
```

### SeatReservationResult

```typescript
interface SeatReservationResult {
  success: boolean;
  reservedSeats: SeatSelection[];
  totalCost: number;
  priceChanged: boolean;
}
```

## Seat Categorization

The service automatically categorizes seats based on API data:

### Seat Types
- **Window**: Seats with window view (SeatType = 1)
- **Middle**: Seats in the middle (SeatType = 2)
- **Aisle**: Seats with aisle access (SeatType = 3)

### Seat Classes
- **Economy**: Standard economy seats (Compartment = 1)
- **Premium Economy**: Extra legroom seats (Compartment = 2)
- **Business**: Business class with lie-flat seats (Compartment = 3)
- **First**: First class with fully flat beds (Compartment = 4)

### Availability Status
- **Available**: Seat can be selected (SeatWayType = 1)
- **Blocked**: Seat is blocked by airline (SeatWayType = 2)
- **Booked**: Seat is already booked (SeatWayType = 3)

### Seat Features

The service automatically assigns features based on seat characteristics:

- **Window View**: Window seats
- **Easy Access**: Aisle seats
- **Extra Legroom**: Premium economy seats
- **Lie-flat Seat**: Business class seats
- **Priority Boarding**: Business class seats
- **Fully Flat Bed**: First class seats
- **Premium Service**: First class seats
- **Priority Everything**: First class seats
- **Free**: Seats with no additional charge
- **Paid Seat**: Seats with additional charge

## Validation

The service performs comprehensive validation before reserving seats:

1. **Non-empty selections**: At least one seat must be selected
2. **No duplicates**: Same seat cannot be selected twice for the same segment
3. **Valid passenger indices**: Passenger index must be >= 0
4. **Valid segment indices**: Segment index must be >= 0
5. **Valid seat numbers**: Seat number must not be empty

## Error Handling

The service throws descriptive errors for various failure scenarios:

- **API Errors**: When the Tek Travels API returns an error
- **Validation Errors**: When seat selections fail validation
- **Network Errors**: When network requests fail

**Example Error Handling:**
```typescript
try {
  const result = await seatService.reserveSeats(traceId, resultIndex, selections);
} catch (error) {
  if (error.message.includes('Duplicate seat selection')) {
    // Handle duplicate selection
  } else if (error.message.includes('API error')) {
    // Handle API error
  } else {
    // Handle other errors
  }
}
```

## Usage Examples

### Basic Seat Selection

```typescript
import { getSeatSelectionService } from './services/seatSelectionService';

const seatService = getSeatSelectionService();

// 1. Fetch seat map
const seatMap = await seatService.getSeatMap(traceId, resultIndex);

// 2. Display seats to user (in your UI component)
// ... UI code ...

// 3. Reserve selected seats
const selections = [
  { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' }
];

const result = await seatService.reserveSeats(traceId, resultIndex, selections);
```

### Multi-Passenger Booking

```typescript
// Select seats for 3 passengers
const selections = [
  { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' },
  { passengerIndex: 1, segmentIndex: 0, seatNumber: '12B' },
  { passengerIndex: 2, segmentIndex: 0, seatNumber: '12C' },
];

const result = await seatService.reserveSeats(traceId, resultIndex, selections);
```

### Connecting Flights

```typescript
// Select seats for each segment of a connecting flight
const selections = [
  { passengerIndex: 0, segmentIndex: 0, seatNumber: '12A' }, // First flight
  { passengerIndex: 0, segmentIndex: 1, seatNumber: '8F' },  // Second flight
];

const result = await seatService.reserveSeats(traceId, resultIndex, selections);
```

### Filter Available Seats

```typescript
const seatMap = await seatService.getSeatMap(traceId, resultIndex);

// Find all available window seats in economy
const availableWindowSeats = seatMap.segments[0].rows
  .flatMap(row => row.seats)
  .filter(seat => 
    seat.available && 
    seat.seatType === 'Window' && 
    seat.seatClass === 'Economy'
  );

console.log(`Found ${availableWindowSeats.length} available window seats`);
```

## Integration with Booking Flow

The seat selection service integrates into the booking workflow:

1. **Search**: User searches for flights
2. **Select Flight**: User selects a flight (gets TraceId and ResultIndex)
3. **Re-pricing**: Flight is re-priced
4. **Seat Selection**: User selects seats (this service)
5. **Ancillary Services**: User adds baggage/meals
6. **Passenger Details**: User enters passenger information
7. **Payment**: User completes payment
8. **Confirmation**: Booking is confirmed

## Testing

The service includes comprehensive unit tests covering:

- Seat map retrieval and transformation
- Seat categorization (types, classes, features)
- Seat reservation
- Validation logic
- Error handling
- Multi-passenger scenarios
- API error responses

Run tests with:
```bash
npm test -- seatSelectionService.test.ts
```

## Dependencies

- **Axios**: HTTP client for API communication
- **Tek Travels API Client**: Configured API client with retry logic

## Notes

- The service uses a singleton pattern for consistent state management
- TraceId must be obtained from a prior flight search
- Seat prices are returned in the seat map but total cost calculation requires additional logic
- The service automatically handles TraceId injection via the API client
- End user IP is currently hardcoded but should be obtained from the request in production

## Future Enhancements

- [ ] Calculate accurate total cost from seat prices
- [ ] Add seat preference recommendations based on user history
- [ ] Support seat change/cancellation
- [ ] Add seat map visualization helpers
- [ ] Cache seat maps to reduce API calls
- [ ] Add seat availability notifications
