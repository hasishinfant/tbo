# Mock Service Worker (MSW) Handlers

This directory contains MSW handlers for mocking API endpoints during testing.

## Overview

Mock Service Worker (MSW) intercepts HTTP requests at the network level and returns mock responses. This allows us to test API integration without making actual network calls.

## Files

- **`hotelApiHandlers.ts`**: MSW handlers for TBO Hotel API endpoints
- **`mockHotelData.ts`**: Mock data for hotel API responses
- **`mockFlightData.ts`**: Mock data for flight API responses
- **`hotelApiHandlers.test.ts`**: Tests demonstrating MSW handler usage

## Setup

MSW is configured in `src/tests/setup.ts` and runs automatically for all tests:

```typescript
import { setupServer } from 'msw/node';
import { hotelApiHandlers } from './mocks/hotelApiHandlers';

export const server = setupServer(...hotelApiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Hotel API Handlers

### Available Endpoints

1. **Search**: `POST /TBOHolidays_HotelAPI/search`
2. **Hotel Details**: `POST /TBOHolidays_HotelAPI/Hoteldetails`
3. **PreBook**: `POST /TBOHolidays_HotelAPI/PreBook`
4. **Book**: `POST /TBOHolidays_HotelAPI/Book`
5. **Booking Detail**: `POST /TBOHolidays_HotelAPI/BookingDetail`
6. **Booking List**: `POST /TBOHolidays_HotelAPI/BookingDetailsBasedOnDate`
7. **Cancel**: `POST /TBOHolidays_HotelAPI/Cancel`
8. **Country List**: `GET /TBOHolidays_HotelAPI/CountryList`
9. **City List**: `POST /TBOHolidays_HotelAPI/CityList`
10. **Hotel Code List**: `POST /TBOHolidays_HotelAPI/TBOHotelCodeList`

### Success Scenarios

By default, all handlers return successful responses with mock data:

```typescript
import { hotelSearchService } from '../../services/hotelSearchService';

it('should search hotels successfully', async () => {
  const result = await hotelSearchService.search({
    checkIn: new Date('2024-03-15'),
    checkOut: new Date('2024-03-18'),
    cityCode: 'BOM',
    guestNationality: 'IN',
    paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
  });

  expect(result.hotels).toBeDefined();
  expect(result.hotels.length).toBeGreaterThan(0);
});
```

### Testing Specific Scenarios

Use special booking codes to trigger specific behaviors:

#### Price Change During PreBook
```typescript
const preBookRequest = {
  BookingCode: 'PRICECHANGE001',
  PaymentMode: 'Limit',
};
// Returns IsPriceChanged: true
```

#### Room Unavailable
```typescript
const preBookRequest = {
  BookingCode: 'UNAVAILABLE001',
  PaymentMode: 'Limit',
};
// Returns 400 error with "Room no longer available"
```

#### Booking Failure
```typescript
const bookingRequest = {
  BookingCode: 'FAIL001',
  // ... other fields
};
// Returns 400 error with "Booking failed"
```

#### Non-Cancellable Booking
```typescript
const cancelRequest = {
  ConfirmationNo: 'NONCANCELLABLE-001',
};
// Returns 400 error with "This booking cannot be cancelled"
```

#### Booking Not Found
```typescript
const detailRequest = {
  ConfirmationNo: 'NOTFOUND-123',
};
// Returns 404 error with "Booking not found"
```

### Error Scenarios

Override default handlers to test error conditions:

```typescript
import { server } from '../setup';
import { hotelApiErrorHandlers } from './hotelApiHandlers';

it('should handle network errors', async () => {
  server.use(hotelApiErrorHandlers.networkError);
  
  await expect(
    hotelSearchService.search(criteria)
  ).rejects.toThrow();
});

it('should handle server errors', async () => {
  server.use(hotelApiErrorHandlers.serverError);
  
  await expect(
    hotelSearchService.search(criteria)
  ).rejects.toThrow();
});

it('should handle unauthorized errors', async () => {
  server.use(hotelApiErrorHandlers.unauthorized);
  
  await expect(
    hotelSearchService.search(criteria)
  ).rejects.toThrow();
});
```

### Custom Handlers

Override handlers for specific test cases:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../setup';

it('should handle custom scenario', async () => {
  server.use(
    http.post('http://api.tbotechnology.in/TBOHolidays_HotelAPI/search', () => {
      return HttpResponse.json({
        Hotels: [/* custom data */],
        Status: 1,
      });
    })
  );

  // Your test code
});
```

## Filtering and Search

The search handler supports filtering by:

- **Star Rating**: `Filters.StarRating`
- **Refundable**: `Filters.Refundable`

```typescript
const searchRequest = {
  CheckIn: '2024-03-15',
  CheckOut: '2024-03-18',
  CityCode: 'BOM',
  GuestNationality: 'IN',
  PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
  Filters: {
    StarRating: 5,
    Refundable: true,
  },
};
```

## Mock Data

All mock data is defined in `mockHotelData.ts`:

- **`mockLuxuryHotel`**: 5-star luxury hotel
- **`mockBusinessHotel`**: 4-star business hotel
- **`mockBudgetHotel`**: 3-star budget hotel
- **`mockBoutiqueHotel`**: 4-star boutique hotel
- **`mockResortHotel`**: 5-star resort
- **`mockAirportHotel`**: 3-star airport hotel

Helper functions:
- **`getMockHotelsByCriteria()`**: Filter hotels by criteria
- **`generateMockBookingCode()`**: Generate unique booking codes
- **`generateMockConfirmationNumber()`**: Generate confirmation numbers

## Best Practices

1. **Reset handlers after each test**: Done automatically in `setup.ts`
2. **Use specific booking codes**: Trigger specific scenarios for testing
3. **Test both success and error paths**: Use error handlers
4. **Keep mock data realistic**: Maintain data quality in `mockHotelData.ts`
5. **Document custom scenarios**: Add comments for special test cases

## Adding New Handlers

To add a new endpoint handler:

1. Define the handler in `hotelApiHandlers.ts`:
```typescript
export const newEndpointHandler = http.post(`${BASE_URL}/NewEndpoint`, async ({ request }) => {
  const body = await request.json();
  // Handler logic
  return HttpResponse.json(response);
});
```

2. Add to the handlers array:
```typescript
export const hotelApiHandlers = [
  // ... existing handlers
  newEndpointHandler,
];
```

3. Create tests in `hotelApiHandlers.test.ts`

## Troubleshooting

### Handlers not working
- Ensure MSW server is started in `setup.ts`
- Check that the URL matches exactly (including protocol and path)
- Verify the HTTP method (GET, POST, etc.)

### Tests timing out
- Check for infinite loops in handler logic
- Reduce simulated delays in handlers
- Increase test timeout if needed

### Unexpected responses
- Use `server.resetHandlers()` between tests
- Check for handler override conflicts
- Verify request body format matches expected type

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Node Integration](https://mswjs.io/docs/integrations/node)
- [Vitest with MSW](https://vitest.dev/guide/mocking.html)
