# Tek Travels API Client

This directory contains the API client infrastructure for integrating with the Tek Travels Universal Air API.

## Files

- `tekTravelsApiClient.ts` - Main API client with Axios configuration, authentication, and retry logic
- `__tests__/tekTravelsApiClient.test.ts` - Unit tests for the API client

## Configuration

The API client is configured via environment variables in `.env`:

```env
VITE_TEK_TRAVELS_API_KEY=your-api-key-here
VITE_TEK_TRAVELS_API_URL=https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest
```

## Features

### Authentication
- Automatic API key injection via request interceptor
- API key is added to all requests as `TokenId` parameter

### Retry Logic
- Automatic retry on network failures (3 attempts)
- Exponential backoff (1s, 2s, 4s delays)
- Retries on specific HTTP status codes: 408, 429, 500, 502, 503, 504

### Timeout
- 5-second timeout for all requests (as per requirements)

### TraceId Management
- Automatic TraceId storage from search response
- TraceId injection into subsequent API calls
- Methods to get, set, and clear TraceId

### Error Handling
- Standardized error responses
- Recoverable vs non-recoverable error classification
- User-friendly error messages

## Usage

### Basic Usage

```typescript
import { getTekTravelsApiClient } from '@/services/api/tekTravelsApiClient';

const client = getTekTravelsApiClient();

// Search for flights
const searchResponse = await client.searchFlights({
  EndUserIp: '192.168.1.1',
  AdultCount: 2,
  ChildCount: 0,
  InfantCount: 0,
  DirectFlight: false,
  OneStopFlight: false,
  JourneyType: '1',
  PreferredAirlines: null,
  Segments: [{
    Origin: 'DEL',
    Destination: 'BOM',
    FlightCabinClass: '2',
    PreferredDepartureTime: '2024-03-15T00:00:00',
    PreferredArrivalTime: '2024-03-15T23:59:59',
  }],
  Sources: null,
});

// TraceId is automatically stored
console.log(client.getTraceId()); // Returns the TraceId from search response

// Re-price a flight (TraceId is automatically included)
const repriceResponse = await client.repriceFlight({
  EndUserIp: '192.168.1.1',
  ResultIndex: 'SG:DEL:BOM:...',
});
```

### Custom Configuration

```typescript
import { TekTravelsApiClient } from '@/services/api/tekTravelsApiClient';

const client = new TekTravelsApiClient({
  apiKey: 'custom-api-key',
  baseUrl: 'https://custom-api-url.com',
  timeout: 10000, // 10 seconds
  retryAttempts: 5,
  retryDelay: 2000, // 2 seconds initial delay
});
```

### Error Handling

```typescript
try {
  const response = await client.searchFlights(request);
} catch (error) {
  if (error.recoverable) {
    // Handle recoverable errors (network issues, timeouts)
    console.log('Temporary error, can retry or fallback to mock data');
  } else {
    // Handle non-recoverable errors (invalid data, authentication)
    console.error('Permanent error:', error.error.message);
  }
}
```

## API Methods

- `searchFlights(request)` - Search for available flights
- `repriceFlight(request)` - Validate current flight prices
- `getSeatMap(request)` - Retrieve seat map for a flight
- `sellSeats(request)` - Reserve selected seats
- `getAncillaryServices(request)` - Get baggage and meal options
- `getFareRules(request)` - Retrieve fare rules and restrictions
- `createBooking(request)` - Complete flight booking
- `healthCheck()` - Check API availability

## Type Definitions

All type definitions are in `src/types/tekTravelsApi.ts`:

- Request/response interfaces for all API endpoints
- Error types
- Common types (CabinClass, JourneyType, etc.)

## Testing

Run tests with:

```bash
npm test src/services/api/__tests__/tekTravelsApiClient.test.ts
```

## Requirements Validation

This implementation satisfies:
- **Requirement 8.5**: Network retry with exponential backoff (3 attempts, 1s/2s/4s delays)
- **Requirement 7.1-7.5**: TraceId lifecycle management
- **Requirement 8.4**: Error handling and user-friendly messages
- 5-second timeout configuration
- Authentication via API key injection
