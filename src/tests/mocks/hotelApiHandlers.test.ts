/**
 * Tests for Hotel API MSW Handlers
 * 
 * Demonstrates how to use MSW handlers for testing hotel API integration.
 */

import { describe, it, expect } from 'vitest';
import { server } from '../setup';
import { hotelApiErrorHandlers } from './hotelApiHandlers';
import type {
  HotelSearchRequest,
  HotelSearchResponse,
  PreBookRequest,
  PreBookResponse,
  HotelBookingRequest,
  HotelBookingResponse,
  CancelRequest,
  CancelResponse,
} from '../../types/tboHotelApi';

const BASE_URL = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI';

describe('Hotel API MSW Handlers', () => {
  describe('Search Handler', () => {
    it('should return hotel search results', async () => {
      const searchRequest: HotelSearchRequest = {
        CheckIn: '2024-03-15',
        CheckOut: '2024-03-18',
        CityCode: 'BOM',
        GuestNationality: 'IN',
        PaxRooms: [
          {
            Adults: 2,
            Children: 0,
            ChildrenAges: [],
          },
        ],
      };

      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });

      const data: HotelSearchResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.Hotels).toBeDefined();
      expect(Array.isArray(data.Hotels)).toBe(true);
      expect(data.Hotels.length).toBeGreaterThan(0);
      expect(data.Hotels[0]).toHaveProperty('BookingCode');
      expect(data.Hotels[0]).toHaveProperty('HotelName');
      expect(data.Hotels[0]).toHaveProperty('Price');
    });

    it('should filter hotels by star rating', async () => {
      const searchRequest: HotelSearchRequest = {
        CheckIn: '2024-03-15',
        CheckOut: '2024-03-18',
        CityCode: 'BOM',
        GuestNationality: 'IN',
        PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
        Filters: {
          StarRating: 5,
        },
      };

      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });

      const data: HotelSearchResponse = await response.json();

      expect(data.Hotels.every(hotel => hotel.StarRating === 5)).toBe(true);
    });

    it('should filter hotels by refundable status', async () => {
      const searchRequest: HotelSearchRequest = {
        CheckIn: '2024-03-15',
        CheckOut: '2024-03-18',
        CityCode: 'BOM',
        GuestNationality: 'IN',
        PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
        Filters: {
          Refundable: true,
        },
      };

      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });

      const data: HotelSearchResponse = await response.json();

      expect(data.Hotels.every(hotel => hotel.Refundable === true)).toBe(true);
    });
  });

  describe('PreBook Handler', () => {
    it('should return successful pre-book with no price change', async () => {
      const preBookRequest: PreBookRequest = {
        BookingCode: 'LUX5STAR001',
        PaymentMode: 'Limit',
      };

      const response = await fetch(`${BASE_URL}/PreBook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preBookRequest),
      });

      const data: PreBookResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.IsPriceChanged).toBe(false);
      expect(data.BookingCode).toContain('PREBOOK');
    });

    it('should return pre-book with price change', async () => {
      const preBookRequest: PreBookRequest = {
        BookingCode: 'PRICECHANGE001',
        PaymentMode: 'Limit',
      };

      const response = await fetch(`${BASE_URL}/PreBook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preBookRequest),
      });

      const data: PreBookResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.IsPriceChanged).toBe(true);
    });

    it('should return error for unavailable room', async () => {
      const preBookRequest: PreBookRequest = {
        BookingCode: 'UNAVAILABLE001',
        PaymentMode: 'Limit',
      };

      const response = await fetch(`${BASE_URL}/PreBook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preBookRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Status).toBe(0);
      expect(data.Message).toContain('no longer available');
    });
  });

  describe('Booking Handler', () => {
    it('should create successful booking', async () => {
      const bookingRequest: HotelBookingRequest = {
        BookingCode: 'LUX5STAR001-PREBOOK',
        CustomerDetails: [
          {
            CustomerNames: [
              {
                Title: 'Mr',
                FirstName: 'John',
                LastName: 'Doe',
                Type: 'Adult',
              },
            ],
          },
        ],
        ClientReferenceId: 'CLIENT-123',
        BookingReferenceId: 'BOOKING-456',
        TotalFare: 340,
        EmailId: 'john.doe@example.com',
        PhoneNumber: '+1234567890',
        BookingType: 'Hotel',
        PaymentMode: 'Limit',
      };

      const response = await fetch(`${BASE_URL}/Book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest),
      });

      const data: HotelBookingResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.ConfirmationNo).toBeDefined();
      expect(data.BookingRefNo).toBeDefined();
      expect(data.BookingId).toBeDefined();
      expect(data.HotelDetails).toBeDefined();
    });

    it('should handle booking failure', async () => {
      const bookingRequest: HotelBookingRequest = {
        BookingCode: 'FAIL001',
        CustomerDetails: [
          {
            CustomerNames: [
              {
                Title: 'Mr',
                FirstName: 'John',
                LastName: 'Doe',
                Type: 'Adult',
              },
            ],
          },
        ],
        ClientReferenceId: 'CLIENT-123',
        BookingReferenceId: 'BOOKING-456',
        TotalFare: 340,
        EmailId: 'john.doe@example.com',
        PhoneNumber: '+1234567890',
        BookingType: 'Hotel',
        PaymentMode: 'Limit',
      };

      const response = await fetch(`${BASE_URL}/Book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Status).toBe(0);
    });
  });

  describe('Cancellation Handler', () => {
    it('should cancel booking successfully', async () => {
      const cancelRequest: CancelRequest = {
        ConfirmationNo: 'CONF-2024-001234',
      };

      const response = await fetch(`${BASE_URL}/Cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelRequest),
      });

      const data: CancelResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.CancellationStatus).toBe('Cancelled');
      expect(data.RefundAmount).toBeDefined();
      expect(data.CancellationCharge).toBeDefined();
    });

    it('should handle non-cancellable booking', async () => {
      const cancelRequest: CancelRequest = {
        ConfirmationNo: 'NONCANCELLABLE-001',
      };

      const response = await fetch(`${BASE_URL}/Cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Status).toBe(0);
    });
  });

  describe('Location Services', () => {
    it('should return country list', async () => {
      const response = await fetch(`${BASE_URL}/CountryList`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.Countries).toBeDefined();
      expect(Array.isArray(data.Countries)).toBe(true);
      expect(data.Countries.length).toBeGreaterThan(0);
      expect(data.Countries[0]).toHaveProperty('Code');
      expect(data.Countries[0]).toHaveProperty('Name');
    });

    it('should return city list for country', async () => {
      const response = await fetch(`${BASE_URL}/CityList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CountryCode: 'IN' }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Status).toBe(1);
      expect(data.Cities).toBeDefined();
      expect(Array.isArray(data.Cities)).toBe(true);
      expect(data.Cities.length).toBeGreaterThan(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      // Override handler with network error
      server.use(hotelApiErrorHandlers.networkError);

      try {
        await fetch(`${BASE_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CheckIn: '2024-03-15',
            CheckOut: '2024-03-18',
            CityCode: 'BOM',
            GuestNationality: 'IN',
            PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
          }),
        });
        expect.fail('Should have thrown network error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      server.use(hotelApiErrorHandlers.serverError);

      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CheckIn: '2024-03-15',
          CheckOut: '2024-03-18',
          CityCode: 'BOM',
          GuestNationality: 'IN',
          PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
        }),
      });

      expect(response.status).toBe(500);
    });

    it('should handle unauthorized errors', async () => {
      server.use(hotelApiErrorHandlers.unauthorized);

      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CheckIn: '2024-03-15',
          CheckOut: '2024-03-18',
          CityCode: 'BOM',
          GuestNationality: 'IN',
          PaxRooms: [{ Adults: 2, Children: 0, ChildrenAges: [] }],
        }),
      });

      expect(response.status).toBe(401);
    });
  });
});
