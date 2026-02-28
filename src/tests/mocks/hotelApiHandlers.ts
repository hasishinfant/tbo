/**
 * Mock Service Worker Handlers for TBO Hotel API
 * 
 * Provides MSW handlers for mocking hotel API endpoints during testing.
 * Covers the complete booking flow: Search → Details → PreBook → Book → Manage
 */

import { http, HttpResponse } from 'msw';
import type {
  HotelSearchRequest,
  HotelSearchResponse,
  HotelDetailsRequest,
  HotelDetailsResponse,
  PreBookRequest,
  PreBookResponse,
  HotelBookingRequest,
  HotelBookingResponse,
  BookingDetailRequest,
  BookingDetailResponse,
  BookingListRequest,
  BookingListResponse,
  CancelRequest,
  CancelResponse,
  CountryListResponse,
  CityListRequest,
  CityListResponse,
  HotelCodeListRequest,
  HotelCodeListResponse,
} from '../../types/tboHotelApi';
import {
  mockHotelCollection,
  mockLuxuryHotelDetails,
  mockBudgetHotelDetails,
  mockPreBookSuccess,
  mockPreBookPriceIncrease,
  mockBookingConfirmation,
  mockBookingDetailConfirmed,
  mockBookingSummaries,
  mockCancellationSuccess,
  generateMockBookingCode,
  generateMockConfirmationNumber,
  getMockHotelsByCriteria,
} from './mockHotelData';

const BASE_URL = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI';

/**
 * Hotel Search Handler
 * POST /TBOHolidays_HotelAPI/search
 */
export const hotelSearchHandler = http.post(`${BASE_URL}/search`, async ({ request }) => {
  const body = await request.json() as HotelSearchRequest;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter hotels based on search criteria
  const filters = body.Filters || {};
  const hotels = getMockHotelsByCriteria({
    starRating: filters.StarRating,
    refundable: filters.Refundable,
  });

  const response: HotelSearchResponse = {
    Hotels: hotels,
    Status: 1,
    Message: 'Search successful',
  };

  return HttpResponse.json(response);
});

/**
 * Hotel Details Handler
 * POST /TBOHolidays_HotelAPI/Hoteldetails
 */
export const hotelDetailsHandler = http.post(`${BASE_URL}/Hoteldetails`, async ({ request }) => {
  const body = await request.json() as HotelDetailsRequest;

  await new Promise(resolve => setTimeout(resolve, 300));

  const hotelCodes = body.HotelCodes.split(',');
  const hotelDetails = hotelCodes.map(code => {
    // Return appropriate mock based on hotel code
    if (code === 'TAJ001') return mockLuxuryHotelDetails;
    if (code === 'IBIS001') return mockBudgetHotelDetails;
    // Default to luxury hotel details
    return mockLuxuryHotelDetails;
  });

  const response: HotelDetailsResponse = {
    HotelDetails: hotelDetails,
    Status: 1,
    Message: 'Hotel details retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * PreBook Handler
 * POST /TBOHolidays_HotelAPI/PreBook
 */
export const preBookHandler = http.post(`${BASE_URL}/PreBook`, async ({ request }) => {
  const body = await request.json() as PreBookRequest;

  await new Promise(resolve => setTimeout(resolve, 400));

  // Simulate different scenarios based on booking code
  let response: PreBookResponse;
  
  if (body.BookingCode.includes('PRICECHANGE')) {
    // Simulate price increase
    response = mockPreBookPriceIncrease;
  } else if (body.BookingCode.includes('UNAVAILABLE')) {
    // Simulate room unavailability
    return HttpResponse.json({
      Status: 0,
      Message: 'Room no longer available',
    }, { status: 400 });
  } else {
    // Normal successful pre-book
    response = {
      ...mockPreBookSuccess,
      BookingCode: `${body.BookingCode}-PREBOOK`,
    };
  }

  return HttpResponse.json(response);
});

/**
 * Hotel Booking Handler
 * POST /TBOHolidays_HotelAPI/Book
 */
export const hotelBookingHandler = http.post(`${BASE_URL}/Book`, async ({ request }) => {
  const body = await request.json() as HotelBookingRequest;

  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate booking failure for testing
  if (body.BookingCode.includes('FAIL')) {
    return HttpResponse.json({
      Status: 0,
      Message: 'Booking failed. Please try again.',
    }, { status: 400 });
  }

  // Generate unique confirmation number
  const confirmationNo = generateMockConfirmationNumber();
  
  const response: HotelBookingResponse = {
    ...mockBookingConfirmation,
    ConfirmationNo: confirmationNo,
    BookingRefNo: `TBO-REF-${Date.now()}`,
    BookingId: Math.floor(Math.random() * 1000000),
  };

  return HttpResponse.json(response);
});

/**
 * Booking Detail Handler
 * POST /TBOHolidays_HotelAPI/BookingDetail
 */
export const bookingDetailHandler = http.post(`${BASE_URL}/BookingDetail`, async ({ request }) => {
  const body = await request.json() as BookingDetailRequest;

  await new Promise(resolve => setTimeout(resolve, 300));

  // Simulate not found scenario
  if (body.ConfirmationNo?.includes('NOTFOUND')) {
    return HttpResponse.json({
      Status: 0,
      Message: 'Booking not found',
    }, { status: 404 });
  }

  const response: BookingDetailResponse = {
    BookingDetails: mockBookingDetailConfirmed,
    Status: 1,
    Message: 'Booking details retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * Booking List by Date Range Handler
 * POST /TBOHolidays_HotelAPI/BookingDetailsBasedOnDate
 */
export const bookingListHandler = http.post(`${BASE_URL}/BookingDetailsBasedOnDate`, async ({ request }) => {
  const body = await request.json() as BookingListRequest;

  await new Promise(resolve => setTimeout(resolve, 400));

  const response: BookingListResponse = {
    Bookings: mockBookingSummaries,
    Status: 1,
    Message: 'Bookings retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * Cancel Booking Handler
 * POST /TBOHolidays_HotelAPI/Cancel
 */
export const cancelBookingHandler = http.post(`${BASE_URL}/Cancel`, async ({ request }) => {
  const body = await request.json() as CancelRequest;

  await new Promise(resolve => setTimeout(resolve, 600));

  // Simulate cancellation failure
  if (body.ConfirmationNo.includes('NONCANCELLABLE')) {
    return HttpResponse.json({
      Status: 0,
      Message: 'This booking cannot be cancelled',
    }, { status: 400 });
  }

  const response: CancelResponse = {
    ...mockCancellationSuccess,
    ConfirmationNo: body.ConfirmationNo,
  };

  return HttpResponse.json(response);
});

/**
 * Country List Handler
 * GET /TBOHolidays_HotelAPI/CountryList
 */
export const countryListHandler = http.get(`${BASE_URL}/CountryList`, async () => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const response: CountryListResponse = {
    Countries: [
      { Code: 'IN', Name: 'India' },
      { Code: 'US', Name: 'United States' },
      { Code: 'GB', Name: 'United Kingdom' },
      { Code: 'AE', Name: 'United Arab Emirates' },
      { Code: 'SG', Name: 'Singapore' },
      { Code: 'TH', Name: 'Thailand' },
      { Code: 'FR', Name: 'France' },
      { Code: 'IT', Name: 'Italy' },
    ],
    Status: 1,
    Message: 'Countries retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * City List Handler
 * POST /TBOHolidays_HotelAPI/CityList
 */
export const cityListHandler = http.post(`${BASE_URL}/CityList`, async ({ request }) => {
  const body = await request.json() as CityListRequest;

  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock cities based on country code
  const citiesByCountry: Record<string, { Code: string; Name: string }[]> = {
    IN: [
      { Code: 'DEL', Name: 'New Delhi' },
      { Code: 'BOM', Name: 'Mumbai' },
      { Code: 'BLR', Name: 'Bangalore' },
      { Code: 'GOI', Name: 'Goa' },
      { Code: 'HYD', Name: 'Hyderabad' },
    ],
    US: [
      { Code: 'NYC', Name: 'New York' },
      { Code: 'LAX', Name: 'Los Angeles' },
      { Code: 'SFO', Name: 'San Francisco' },
    ],
    GB: [
      { Code: 'LON', Name: 'London' },
      { Code: 'MAN', Name: 'Manchester' },
    ],
  };

  const cities = citiesByCountry[body.CountryCode] || [];

  const response: CityListResponse = {
    Cities: cities.map(city => ({
      ...city,
      CountryCode: body.CountryCode,
    })),
    Status: 1,
    Message: 'Cities retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * Hotel Code List Handler
 * POST /TBOHolidays_HotelAPI/TBOHotelCodeList
 */
export const hotelCodeListHandler = http.post(`${BASE_URL}/TBOHotelCodeList`, async ({ request }) => {
  const body = await request.json() as HotelCodeListRequest;

  await new Promise(resolve => setTimeout(resolve, 400));

  // Return hotels for the specified city
  const hotelsByCity = mockHotelCollection
    .filter(hotel => hotel.CityName.toLowerCase().includes(body.CityCode.toLowerCase()))
    .map(hotel => ({
      HotelCode: hotel.HotelCode,
      HotelName: hotel.HotelName,
      Address: hotel.HotelAddress,
      CityCode: body.CityCode,
      StarRating: hotel.StarRating,
    }));

  const response: HotelCodeListResponse = {
    Hotels: hotelsByCity,
    Status: 1,
    Message: 'Hotel codes retrieved successfully',
  };

  return HttpResponse.json(response);
});

/**
 * Error Handlers for Testing Error Scenarios
 */

// Network error handler
export const networkErrorHandler = http.post(`${BASE_URL}/search`, () => {
  return HttpResponse.error();
});

// Timeout handler
export const timeoutHandler = http.post(`${BASE_URL}/search`, async () => {
  await new Promise(resolve => setTimeout(resolve, 15000));
  return HttpResponse.json({ Status: 0, Message: 'Timeout' });
});

// Server error handler
export const serverErrorHandler = http.post(`${BASE_URL}/search`, () => {
  return HttpResponse.json(
    { Status: 0, Message: 'Internal server error' },
    { status: 500 }
  );
});

// Unauthorized handler
export const unauthorizedHandler = http.post(`${BASE_URL}/search`, () => {
  return HttpResponse.json(
    { Status: 0, Message: 'Unauthorized' },
    { status: 401 }
  );
});

/**
 * Default handlers for all hotel API endpoints
 */
export const hotelApiHandlers = [
  hotelSearchHandler,
  hotelDetailsHandler,
  preBookHandler,
  hotelBookingHandler,
  bookingDetailHandler,
  bookingListHandler,
  cancelBookingHandler,
  countryListHandler,
  cityListHandler,
  hotelCodeListHandler,
];

/**
 * Error scenario handlers (use these to override default handlers in specific tests)
 */
export const hotelApiErrorHandlers = {
  networkError: networkErrorHandler,
  timeout: timeoutHandler,
  serverError: serverErrorHandler,
  unauthorized: unauthorizedHandler,
};
