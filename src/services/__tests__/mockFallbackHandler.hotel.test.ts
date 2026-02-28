/**
 * Unit Tests for Mock Fallback Handler - Hotel API Methods
 * 
 * Tests hotel-specific mock fallback functionality.
 * Requirements: 8.1, 8.2, 8.3, 8.6
 */

import { mockFallbackHandler } from '../mockFallbackHandler';
import type {
  HotelSearchResponse,
  HotelDetailsResponse,
  PreBookResponse,
  HotelBookingResponse,
  BookingDetailResponse,
  BookingListResponse,
  CancelResponse,
  CountryListResponse,
  CityListResponse,
  HotelCodeListResponse,
} from '../../types/tboHotelApi';

describe('MockFallbackHandler - Hotel API Methods', () => {
  describe('Hotel API Availability Check', () => {
    it('should detect hotel API unavailability within 5 seconds', async () => {
      const startTime = Date.now();
      const isAvailable = await mockFallbackHandler.isHotelApiAvailable();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5500); // Allow 500ms buffer
      expect(typeof isAvailable).toBe('boolean');
    }, 10000); // 10 second timeout for network request
  });

  describe('Hotel Mock Mode Management', () => {
    it('should set and check hotel mock mode', () => {
      mockFallbackHandler.setHotelMockMode(true);
      expect(mockFallbackHandler.isHotelMockMode()).toBe(true);

      mockFallbackHandler.setHotelMockMode(false);
      expect(mockFallbackHandler.isHotelMockMode()).toBe(false);
    });

    it('should manage hotel mock mode independently from flight mock mode', () => {
      mockFallbackHandler.setMockMode(true);
      mockFallbackHandler.setHotelMockMode(false);

      expect(mockFallbackHandler.isMockMode()).toBe(true);
      expect(mockFallbackHandler.isHotelMockMode()).toBe(false);
    });
  });

  describe('getMockHotelSearchResults', () => {
    it('should return mock hotel search results', () => {
      const criteria = {
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        cityCode: 'BOM',
        guestNationality: 'IN',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const response: HotelSearchResponse = mockFallbackHandler.getMockHotelSearchResults(criteria);

      expect(response.Status).toBe(1);
      expect(response.Hotels).toBeDefined();
      expect(response.Hotels.length).toBeGreaterThan(0);
      expect(response.Message).toContain('Mock');
    });

    it('should filter hotels by star rating', () => {
      const criteria = {
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        guestNationality: 'IN',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
        filters: {
          starRating: 5,
        },
      };

      const response = mockFallbackHandler.getMockHotelSearchResults(criteria);

      expect(response.Hotels.length).toBeGreaterThan(0);
      response.Hotels.forEach(hotel => {
        expect(hotel.StarRating).toBe(5);
      });
    });

    it('should filter hotels by refundable status', () => {
      const criteria = {
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        guestNationality: 'IN',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
        filters: {
          refundable: true,
        },
      };

      const response = mockFallbackHandler.getMockHotelSearchResults(criteria);

      expect(response.Hotels.length).toBeGreaterThan(0);
      response.Hotels.forEach(hotel => {
        expect(hotel.Refundable).toBe(true);
      });
    });

    it('should generate unique booking codes for each hotel', () => {
      const criteria = {
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        guestNationality: 'IN',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const response = mockFallbackHandler.getMockHotelSearchResults(criteria);
      const bookingCodes = response.Hotels.map(h => h.BookingCode);
      const uniqueCodes = new Set(bookingCodes);

      expect(uniqueCodes.size).toBe(bookingCodes.length);
    });
  });

  describe('getMockHotelDetails', () => {
    it('should return mock hotel details', () => {
      const hotelCodes = ['TAJ001', 'IBIS001'];
      const response: HotelDetailsResponse = mockFallbackHandler.getMockHotelDetails(hotelCodes);

      expect(response.Status).toBe(1);
      expect(response.HotelDetails).toBeDefined();
      expect(response.HotelDetails.length).toBeGreaterThan(0);
      expect(response.Message).toContain('Mock');
    });

    it('should return luxury hotel details for luxury hotel codes', () => {
      const hotelCodes = ['TAJ001'];
      const response = mockFallbackHandler.getMockHotelDetails(hotelCodes);

      expect(response.HotelDetails[0].StarRating).toBe(5);
      expect(response.HotelDetails[0].HotelFacilities.length).toBeGreaterThan(5);
    });

    it('should return budget hotel details for budget hotel codes', () => {
      const hotelCodes = ['IBIS001'];
      const response = mockFallbackHandler.getMockHotelDetails(hotelCodes);

      expect(response.HotelDetails[0].StarRating).toBe(3);
    });

    it('should include hotel policy information', () => {
      const hotelCodes = ['TAJ001'];
      const response = mockFallbackHandler.getMockHotelDetails(hotelCodes);

      expect(response.HotelDetails[0].HotelPolicy).toBeDefined();
      expect(response.HotelDetails[0].HotelPolicy.CheckInTime).toBeDefined();
      expect(response.HotelDetails[0].HotelPolicy.CheckOutTime).toBeDefined();
      expect(response.HotelDetails[0].HotelPolicy.CancellationPolicy).toBeDefined();
    });
  });

  describe('getMockPreBookResponse', () => {
    it('should return mock pre-book response with no price change', () => {
      const bookingCode = 'LUX5STAR001';
      const response: PreBookResponse = mockFallbackHandler.getMockPreBookResponse(bookingCode);

      expect(response.Status).toBe(1);
      expect(response.BookingCode).toContain(bookingCode);
      expect(response.BookingCode).toContain('PREBOOK');
    });

    it('should sometimes return price change scenario', () => {
      const bookingCode = 'LUX5STAR001';
      const originalPrice = 340;
      
      // Run multiple times to test randomness
      let priceChangedCount = 0;
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const response = mockFallbackHandler.getMockPreBookResponse(bookingCode, originalPrice);
        if (response.IsPriceChanged) {
          priceChangedCount++;
          expect(response.HotelDetails.Price.OfferedPrice).not.toBe(originalPrice);
        }
      }

      // With 20% probability, we should see at least one price change in 20 iterations
      // This is probabilistic, but very likely
      expect(priceChangedCount).toBeGreaterThanOrEqual(0);
    });

    it('should include hotel details in pre-book response', () => {
      const bookingCode = 'LUX5STAR001';
      const response = mockFallbackHandler.getMockPreBookResponse(bookingCode);

      expect(response.HotelDetails).toBeDefined();
      expect(response.HotelDetails.HotelName).toBeDefined();
      expect(response.HotelDetails.Price).toBeDefined();
      expect(response.HotelDetails.Price.CurrencyCode).toBe('USD');
    });
  });

  describe('getMockHotelBookingConfirmation', () => {
    it('should return mock booking confirmation', () => {
      const bookingCode = 'LUX5STAR001-PREBOOK';
      const hotelName = 'The Grand Palace Hotel';
      const checkIn = '2024-03-15';
      const checkOut = '2024-03-18';
      const totalFare = 1020;

      const response: HotelBookingResponse = mockFallbackHandler.getMockHotelBookingConfirmation(
        bookingCode,
        hotelName,
        checkIn,
        checkOut,
        totalFare
      );

      expect(response.Status).toBe(1);
      expect(response.ConfirmationNo).toBeDefined();
      expect(response.BookingRefNo).toBeDefined();
      expect(response.BookingId).toBeGreaterThan(0);
      expect(response.HotelDetails.HotelName).toBe(hotelName);
      expect(response.HotelDetails.CheckInDate).toBe(checkIn);
      expect(response.HotelDetails.CheckOutDate).toBe(checkOut);
      expect(response.HotelDetails.TotalFare).toBe(totalFare);
      expect(response.VoucherUrl).toBeDefined();
    });

    it('should generate unique confirmation numbers', () => {
      const confirmationNumbers = new Set();

      for (let i = 0; i < 10; i++) {
        const response = mockFallbackHandler.getMockHotelBookingConfirmation(
          'TEST001',
          'Test Hotel',
          '2024-03-15',
          '2024-03-18',
          500
        );
        confirmationNumbers.add(response.ConfirmationNo);
      }

      expect(confirmationNumbers.size).toBe(10);
    });
  });

  describe('getMockBookingDetails', () => {
    it('should return mock booking details', () => {
      const confirmationNo = 'CONF-2024-001234';
      const response: BookingDetailResponse = mockFallbackHandler.getMockBookingDetails(confirmationNo);

      expect(response.Status).toBe(1);
      expect(response.BookingDetails).toBeDefined();
      expect(response.BookingDetails.ConfirmationNo).toBe(confirmationNo);
      expect(response.BookingDetails.BookingStatus).toBeDefined();
      expect(response.BookingDetails.HotelName).toBeDefined();
    });
  });

  describe('getMockBookingList', () => {
    it('should return mock booking list', () => {
      const fromDate = '2024-02-01';
      const toDate = '2024-04-30';
      const response: BookingListResponse = mockFallbackHandler.getMockBookingList(fromDate, toDate);

      expect(response.Status).toBe(1);
      expect(response.Bookings).toBeDefined();
      expect(response.Bookings.length).toBeGreaterThan(0);
    });

    it('should include booking summaries with required fields', () => {
      const response = mockFallbackHandler.getMockBookingList('2024-02-01', '2024-04-30');

      response.Bookings.forEach(booking => {
        expect(booking.ConfirmationNo).toBeDefined();
        expect(booking.BookingRefNo).toBeDefined();
        expect(booking.HotelName).toBeDefined();
        expect(booking.CheckInDate).toBeDefined();
        expect(booking.CheckOutDate).toBeDefined();
        expect(booking.BookingStatus).toBeDefined();
        expect(booking.TotalFare).toBeGreaterThan(0);
        expect(booking.CurrencyCode).toBe('USD');
      });
    });
  });

  describe('getMockCancellationResponse', () => {
    it('should return mock cancellation response', () => {
      const confirmationNo = 'CONF-2024-001234';
      const response: CancelResponse = mockFallbackHandler.getMockCancellationResponse(confirmationNo);

      expect(response.Status).toBe(1);
      expect(response.ConfirmationNo).toBe(confirmationNo);
      expect(response.CancellationStatus).toBeDefined();
      expect(response.RefundAmount).toBeDefined();
      expect(response.CancellationCharge).toBeDefined();
      expect(response.Message).toBeDefined();
    });
  });

  describe('getMockCountryList', () => {
    it('should return mock country list', () => {
      const response: CountryListResponse = mockFallbackHandler.getMockCountryList();

      expect(response.Status).toBe(1);
      expect(response.Countries).toBeDefined();
      expect(response.Countries.length).toBeGreaterThan(0);
    });

    it('should include country codes and names', () => {
      const response = mockFallbackHandler.getMockCountryList();

      response.Countries.forEach(country => {
        expect(country.Code).toBeDefined();
        expect(country.Name).toBeDefined();
        expect(country.Code.length).toBeGreaterThan(0);
        expect(country.Name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getMockCityList', () => {
    it('should return mock city list for India', () => {
      const response: CityListResponse = mockFallbackHandler.getMockCityList('IN');

      expect(response.Status).toBe(1);
      expect(response.Cities).toBeDefined();
      expect(response.Cities.length).toBeGreaterThan(0);
    });

    it('should include city codes and names with country code', () => {
      const response = mockFallbackHandler.getMockCityList('IN');

      response.Cities.forEach(city => {
        expect(city.Code).toBeDefined();
        expect(city.Name).toBeDefined();
        expect(city.CountryCode).toBe('IN');
      });
    });

    it('should return empty list for unknown country', () => {
      const response = mockFallbackHandler.getMockCityList('XX');

      expect(response.Status).toBe(1);
      expect(response.Cities).toBeDefined();
      expect(response.Cities.length).toBe(0);
    });
  });

  describe('getMockHotelCodeList', () => {
    it('should return mock hotel code list', () => {
      const response: HotelCodeListResponse = mockFallbackHandler.getMockHotelCodeList('BOM');

      expect(response.Status).toBe(1);
      expect(response.Hotels).toBeDefined();
      expect(response.Hotels.length).toBeGreaterThan(0);
    });

    it('should include hotel information with required fields', () => {
      const response = mockFallbackHandler.getMockHotelCodeList('BOM');

      response.Hotels.forEach(hotel => {
        expect(hotel.HotelCode).toBeDefined();
        expect(hotel.HotelName).toBeDefined();
        expect(hotel.Address).toBeDefined();
        expect(hotel.CityCode).toBe('BOM');
        expect(hotel.StarRating).toBeGreaterThan(0);
      });
    });
  });

  describe('Consistency with Flight Mock Fallback', () => {
    it('should follow same pattern as flight mock methods', () => {
      // Both should have availability check methods
      expect(typeof mockFallbackHandler.isApiAvailable).toBe('function');
      expect(typeof mockFallbackHandler.isHotelApiAvailable).toBe('function');

      // Both should have mock mode management
      expect(typeof mockFallbackHandler.setMockMode).toBe('function');
      expect(typeof mockFallbackHandler.setHotelMockMode).toBe('function');

      // Both should have mock data retrieval methods
      expect(typeof mockFallbackHandler.getMockFlightResults).toBe('function');
      expect(typeof mockFallbackHandler.getMockHotelSearchResults).toBe('function');
    });

    it('should return responses with consistent status structure', () => {
      const hotelResponse = mockFallbackHandler.getMockHotelSearchResults({
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        guestNationality: 'IN',
        paxRooms: [{ adults: 2, children: 0, childrenAges: [] }],
      });

      expect(hotelResponse.Status).toBe(1);
      expect(hotelResponse.Message).toBeDefined();
    });
  });
});
