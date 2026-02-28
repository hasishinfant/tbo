/**
 * Mock Hotel Data for Testing
 * 
 * Provides sample hotel data for unit tests and development.
 * Includes diverse scenarios: various star ratings, prices, locations,
 * room types, meal plans, and booking confirmations.
 */

import type {
  Hotel,
  HotelDetail,
  BookingDetail,
  BookingSummary,
  PreBookResponse,
  HotelBookingResponse,
  CancelResponse,
} from '../../types/tboHotelApi';

/**
 * Sample 5-star luxury hotel
 */
export const mockLuxuryHotel: Hotel = {
  BookingCode: 'LUX5STAR001',
  HotelCode: 'TAJ001',
  HotelName: 'The Grand Palace Hotel',
  StarRating: 5,
  HotelAddress: '123 Marine Drive, Colaba',
  HotelContactNo: '+91-22-6665-3366',
  CityName: 'Mumbai',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 280,
    Tax: 50,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 10,
    Discount: 0,
    PublishedPrice: 340,
    OfferedPrice: 340,
    AgentCommission: 34,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'Breakfast Included',
  RoomType: 'Deluxe King Room with Sea View',
  AvailableRooms: 5,
  Amenities: [
    'Free WiFi',
    'Swimming Pool',
    'Spa',
    'Fitness Center',
    'Restaurant',
    'Bar',
    'Room Service',
    'Concierge',
    'Valet Parking',
    'Business Center',
  ],
  HotelPicture: 'https://example.com/hotels/taj001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/taj001/room1.jpg',
    'https://example.com/hotels/taj001/pool.jpg',
    'https://example.com/hotels/taj001/restaurant.jpg',
  ],
};

/**
 * Sample 4-star business hotel
 */
export const mockBusinessHotel: Hotel = {
  BookingCode: 'BUS4STAR001',
  HotelCode: 'HYATT001',
  HotelName: 'City Center Business Hotel',
  StarRating: 4,
  HotelAddress: '456 MG Road, Connaught Place',
  HotelContactNo: '+91-11-4567-8900',
  CityName: 'New Delhi',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 150,
    Tax: 27,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 5,
    Discount: 10,
    PublishedPrice: 192,
    OfferedPrice: 182,
    AgentCommission: 18,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'Breakfast Included',
  RoomType: 'Executive Double Room',
  AvailableRooms: 12,
  Amenities: [
    'Free WiFi',
    'Business Center',
    'Meeting Rooms',
    'Fitness Center',
    'Restaurant',
    'Airport Shuttle',
    'Laundry Service',
    'Room Service',
  ],
  HotelPicture: 'https://example.com/hotels/hyatt001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/hyatt001/room1.jpg',
    'https://example.com/hotels/hyatt001/business.jpg',
  ],
};

/**
 * Sample 3-star budget hotel
 */
export const mockBudgetHotel: Hotel = {
  BookingCode: 'BUD3STAR001',
  HotelCode: 'IBIS001',
  HotelName: 'Comfort Inn Express',
  StarRating: 3,
  HotelAddress: '789 Brigade Road',
  HotelContactNo: '+91-80-2345-6789',
  CityName: 'Bangalore',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 65,
    Tax: 12,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 3,
    Discount: 5,
    PublishedPrice: 85,
    OfferedPrice: 80,
    AgentCommission: 8,
    AgentMarkUp: 0,
  },
  Refundable: false,
  MealType: 'Room Only',
  RoomType: 'Standard Twin Room',
  AvailableRooms: 20,
  Amenities: [
    'Free WiFi',
    'Air Conditioning',
    'TV',
    'Parking',
    'Reception 24h',
  ],
  HotelPicture: 'https://example.com/hotels/ibis001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/ibis001/room1.jpg',
  ],
};

/**
 * Sample boutique hotel with unique features
 */
export const mockBoutiqueHotel: Hotel = {
  BookingCode: 'BTQ4STAR001',
  HotelCode: 'BOUTIQUE001',
  HotelName: 'Heritage Boutique Suites',
  StarRating: 4,
  HotelAddress: '321 Old City, Fort Area',
  HotelContactNo: '+91-22-9876-5432',
  CityName: 'Mumbai',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 180,
    Tax: 32,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 8,
    Discount: 0,
    PublishedPrice: 220,
    OfferedPrice: 220,
    AgentCommission: 22,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'Breakfast and Dinner',
  RoomType: 'Heritage Suite',
  AvailableRooms: 8,
  Amenities: [
    'Free WiFi',
    'Rooftop Restaurant',
    'Heritage Architecture',
    'Art Gallery',
    'Library',
    'Yoga Classes',
    'Spa',
    'Room Service',
  ],
  HotelPicture: 'https://example.com/hotels/boutique001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/boutique001/suite.jpg',
    'https://example.com/hotels/boutique001/rooftop.jpg',
    'https://example.com/hotels/boutique001/heritage.jpg',
  ],
};

/**
 * Sample resort hotel with all-inclusive package
 */
export const mockResortHotel: Hotel = {
  BookingCode: 'RESORT5STAR001',
  HotelCode: 'RESORT001',
  HotelName: 'Tropical Paradise Resort & Spa',
  StarRating: 5,
  HotelAddress: 'Calangute Beach Road',
  HotelContactNo: '+91-832-123-4567',
  CityName: 'Goa',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 320,
    Tax: 58,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 12,
    Discount: 30,
    PublishedPrice: 420,
    OfferedPrice: 390,
    AgentCommission: 39,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'All Inclusive',
  RoomType: 'Beach Villa with Private Pool',
  AvailableRooms: 3,
  Amenities: [
    'Free WiFi',
    'Private Beach',
    'Multiple Swimming Pools',
    'Water Sports',
    'Spa',
    'Multiple Restaurants',
    'Bars',
    'Kids Club',
    'Fitness Center',
    'Tennis Court',
    'Golf Course',
    'Room Service',
  ],
  HotelPicture: 'https://example.com/hotels/resort001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/resort001/villa.jpg',
    'https://example.com/hotels/resort001/beach.jpg',
    'https://example.com/hotels/resort001/pool.jpg',
    'https://example.com/hotels/resort001/restaurant.jpg',
  ],
};

/**
 * Sample airport hotel
 */
export const mockAirportHotel: Hotel = {
  BookingCode: 'AIRPORT3STAR001',
  HotelCode: 'AIRPORT001',
  HotelName: 'Airport Transit Hotel',
  StarRating: 3,
  HotelAddress: 'Terminal 3, IGI Airport',
  HotelContactNo: '+91-11-2567-8901',
  CityName: 'New Delhi',
  CountryName: 'India',
  Price: {
    CurrencyCode: 'USD',
    RoomPrice: 95,
    Tax: 17,
    ExtraGuestCharge: 0,
    ChildCharge: 0,
    OtherCharges: 3,
    Discount: 0,
    PublishedPrice: 115,
    OfferedPrice: 115,
    AgentCommission: 11,
    AgentMarkUp: 0,
  },
  Refundable: true,
  MealType: 'Breakfast Included',
  RoomType: 'Standard Room',
  AvailableRooms: 25,
  Amenities: [
    'Free WiFi',
    'Airport Shuttle',
    'Restaurant',
    'Reception 24h',
    'Luggage Storage',
    'Express Check-in/out',
  ],
  HotelPicture: 'https://example.com/hotels/airport001/main.jpg',
  HotelImages: [
    'https://example.com/hotels/airport001/room1.jpg',
  ],
};

/**
 * Collection of all mock hotels for easy access
 */
export const mockHotelCollection = [
  mockLuxuryHotel,
  mockBusinessHotel,
  mockBudgetHotel,
  mockBoutiqueHotel,
  mockResortHotel,
  mockAirportHotel,
];

/**
 * Sample detailed hotel information for luxury hotel
 */
export const mockLuxuryHotelDetails: HotelDetail = {
  HotelCode: 'TAJ001',
  HotelName: 'The Grand Palace Hotel',
  StarRating: 5,
  Description: 'Experience unparalleled luxury at The Grand Palace Hotel, an iconic landmark overlooking the Arabian Sea. Our hotel combines timeless elegance with modern amenities, offering guests an unforgettable stay in the heart of Mumbai. Each room features stunning sea views, marble bathrooms, and world-class service.',
  HotelFacilities: [
    'Swimming Pool',
    'Spa & Wellness Center',
    'Fitness Center',
    'Multiple Restaurants',
    'Bar & Lounge',
    'Business Center',
    'Meeting Rooms',
    'Banquet Facilities',
    'Concierge Service',
    'Valet Parking',
    'Room Service 24h',
    'Laundry Service',
    'Currency Exchange',
    'Tour Desk',
  ],
  Attractions: [
    { Key: 'Gateway of India', Value: '0.5 km' },
    { Key: 'Colaba Causeway', Value: '0.8 km' },
    { Key: 'Marine Drive', Value: '2.0 km' },
    { Key: 'Chhatrapati Shivaji Terminus', Value: '3.5 km' },
  ],
  HotelPolicy: {
    CheckInTime: '14:00',
    CheckOutTime: '12:00',
    CancellationPolicy: 'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours will incur a charge of one night stay. No-show will be charged the full booking amount.',
  },
  Images: [
    'https://example.com/hotels/taj001/exterior.jpg',
    'https://example.com/hotels/taj001/lobby.jpg',
    'https://example.com/hotels/taj001/deluxe-room.jpg',
    'https://example.com/hotels/taj001/suite.jpg',
    'https://example.com/hotels/taj001/pool.jpg',
    'https://example.com/hotels/taj001/spa.jpg',
    'https://example.com/hotels/taj001/restaurant.jpg',
    'https://example.com/hotels/taj001/bar.jpg',
  ],
  Address: '123 Marine Drive, Colaba, Mumbai',
  PinCode: '400001',
  CityName: 'Mumbai',
  CountryName: 'India',
  PhoneNumber: '+91-22-6665-3366',
  FaxNumber: '+91-22-6665-3367',
  Map: {
    Latitude: 18.9220,
    Longitude: 72.8347,
  },
};

/**
 * Sample detailed hotel information for budget hotel
 */
export const mockBudgetHotelDetails: HotelDetail = {
  HotelCode: 'IBIS001',
  HotelName: 'Comfort Inn Express',
  StarRating: 3,
  Description: 'Comfort Inn Express offers clean, comfortable accommodations at an affordable price. Located in the heart of Bangalore, our hotel is perfect for budget-conscious travelers who don\'t want to compromise on quality. All rooms feature modern amenities and our friendly staff is always ready to help.',
  HotelFacilities: [
    'Free WiFi',
    'Air Conditioning',
    'TV',
    'Parking',
    'Reception 24h',
    'Luggage Storage',
    'Daily Housekeeping',
  ],
  Attractions: [
    { Key: 'MG Road', Value: '1.0 km' },
    { Key: 'Cubbon Park', Value: '2.5 km' },
    { Key: 'Bangalore Palace', Value: '4.0 km' },
    { Key: 'Lalbagh Botanical Garden', Value: '5.0 km' },
  ],
  HotelPolicy: {
    CheckInTime: '14:00',
    CheckOutTime: '11:00',
    CancellationPolicy: 'Non-refundable booking. No cancellations or modifications allowed. Full payment will be charged at the time of booking.',
  },
  Images: [
    'https://example.com/hotels/ibis001/exterior.jpg',
    'https://example.com/hotels/ibis001/room.jpg',
    'https://example.com/hotels/ibis001/lobby.jpg',
  ],
  Address: '789 Brigade Road, Bangalore',
  PinCode: '560001',
  CityName: 'Bangalore',
  CountryName: 'India',
  PhoneNumber: '+91-80-2345-6789',
  FaxNumber: '+91-80-2345-6790',
  Map: {
    Latitude: 12.9716,
    Longitude: 77.5946,
  },
};

/**
 * Sample pre-book response with no price change
 */
export const mockPreBookSuccess: PreBookResponse = {
  BookingCode: 'LUX5STAR001-PREBOOK',
  IsPriceChanged: false,
  IsCancellationPolicyChanged: false,
  Status: 1,
  Message: 'Pre-booking successful',
  HotelDetails: {
    HotelName: 'The Grand Palace Hotel',
    Price: {
      CurrencyCode: 'USD',
      PublishedPrice: 340,
      OfferedPrice: 340,
    },
  },
};

/**
 * Sample pre-book response with price increase
 */
export const mockPreBookPriceIncrease: PreBookResponse = {
  BookingCode: 'BUS4STAR001-PREBOOK',
  IsPriceChanged: true,
  IsCancellationPolicyChanged: false,
  Status: 1,
  Message: 'Price has changed',
  HotelDetails: {
    HotelName: 'City Center Business Hotel',
    Price: {
      CurrencyCode: 'USD',
      PublishedPrice: 210,
      OfferedPrice: 200,
    },
  },
};

/**
 * Sample pre-book response with price decrease
 */
export const mockPreBookPriceDecrease: PreBookResponse = {
  BookingCode: 'RESORT5STAR001-PREBOOK',
  IsPriceChanged: true,
  IsCancellationPolicyChanged: false,
  Status: 1,
  Message: 'Price has changed',
  HotelDetails: {
    HotelName: 'Tropical Paradise Resort & Spa',
    Price: {
      CurrencyCode: 'USD',
      PublishedPrice: 380,
      OfferedPrice: 360,
    },
  },
};

/**
 * Sample successful booking confirmation
 */
export const mockBookingConfirmation: HotelBookingResponse = {
  ConfirmationNo: 'CONF-2024-001234',
  BookingRefNo: 'TBO-REF-567890',
  BookingId: 123456,
  Status: 1,
  Message: 'Booking confirmed successfully',
  HotelDetails: {
    HotelName: 'The Grand Palace Hotel',
    CheckInDate: '2024-03-15',
    CheckOutDate: '2024-03-18',
    TotalFare: 1020,
    CurrencyCode: 'USD',
  },
  VoucherUrl: 'https://example.com/vouchers/CONF-2024-001234.pdf',
};

/**
 * Sample booking confirmation for multi-room booking
 */
export const mockMultiRoomBookingConfirmation: HotelBookingResponse = {
  ConfirmationNo: 'CONF-2024-001235',
  BookingRefNo: 'TBO-REF-567891',
  BookingId: 123457,
  Status: 1,
  Message: 'Booking confirmed successfully',
  HotelDetails: {
    HotelName: 'Tropical Paradise Resort & Spa',
    CheckInDate: '2024-04-10',
    CheckOutDate: '2024-04-15',
    TotalFare: 1950,
    CurrencyCode: 'USD',
  },
  VoucherUrl: 'https://example.com/vouchers/CONF-2024-001235.pdf',
};

/**
 * Sample booking detail (confirmed)
 */
export const mockBookingDetailConfirmed: BookingDetail = {
  ConfirmationNo: 'CONF-2024-001234',
  BookingRefNo: 'TBO-REF-567890',
  BookingId: 123456,
  BookingStatus: 'Confirmed',
  HotelName: 'The Grand Palace Hotel',
  CheckInDate: '2024-03-15',
  CheckOutDate: '2024-03-18',
  TotalFare: 1020,
  CurrencyCode: 'USD',
  GuestDetails: [
    {
      CustomerNames: [
        {
          Title: 'Mr',
          FirstName: 'John',
          LastName: 'Doe',
          Type: 'Adult',
        },
        {
          Title: 'Mrs',
          FirstName: 'Jane',
          LastName: 'Doe',
          Type: 'Adult',
        },
      ],
    },
  ],
  BookedOn: '2024-03-01T10:30:00',
  VoucherUrl: 'https://example.com/vouchers/CONF-2024-001234.pdf',
};

/**
 * Sample booking detail (cancelled)
 */
export const mockBookingDetailCancelled: BookingDetail = {
  ConfirmationNo: 'CONF-2024-001200',
  BookingRefNo: 'TBO-REF-567850',
  BookingId: 123400,
  BookingStatus: 'Cancelled',
  HotelName: 'City Center Business Hotel',
  CheckInDate: '2024-02-20',
  CheckOutDate: '2024-02-22',
  TotalFare: 364,
  CurrencyCode: 'USD',
  GuestDetails: [
    {
      CustomerNames: [
        {
          Title: 'Ms',
          FirstName: 'Sarah',
          LastName: 'Smith',
          Type: 'Adult',
        },
      ],
    },
  ],
  BookedOn: '2024-02-10T14:20:00',
};

/**
 * Sample booking summaries for date range query
 */
export const mockBookingSummaries: BookingSummary[] = [
  {
    ConfirmationNo: 'CONF-2024-001234',
    BookingRefNo: 'TBO-REF-567890',
    HotelName: 'The Grand Palace Hotel',
    CheckInDate: '2024-03-15',
    CheckOutDate: '2024-03-18',
    BookingStatus: 'Confirmed',
    TotalFare: 1020,
    CurrencyCode: 'USD',
  },
  {
    ConfirmationNo: 'CONF-2024-001235',
    BookingRefNo: 'TBO-REF-567891',
    HotelName: 'Tropical Paradise Resort & Spa',
    CheckInDate: '2024-04-10',
    CheckOutDate: '2024-04-15',
    BookingStatus: 'Confirmed',
    TotalFare: 1950,
    CurrencyCode: 'USD',
  },
  {
    ConfirmationNo: 'CONF-2024-001200',
    BookingRefNo: 'TBO-REF-567850',
    HotelName: 'City Center Business Hotel',
    CheckInDate: '2024-02-20',
    CheckOutDate: '2024-02-22',
    BookingStatus: 'Cancelled',
    TotalFare: 364,
    CurrencyCode: 'USD',
  },
];

/**
 * Sample successful cancellation response
 */
export const mockCancellationSuccess: CancelResponse = {
  ConfirmationNo: 'CONF-2024-001234',
  CancellationStatus: 'Cancelled',
  RefundAmount: 680,
  CancellationCharge: 340,
  Status: 1,
  Message: 'Booking cancelled successfully. Refund will be processed within 7-10 business days.',
};

/**
 * Sample cancellation with full refund
 */
export const mockCancellationFullRefund: CancelResponse = {
  ConfirmationNo: 'CONF-2024-001235',
  CancellationStatus: 'Cancelled',
  RefundAmount: 1950,
  CancellationCharge: 0,
  Status: 1,
  Message: 'Booking cancelled successfully. Full refund will be processed within 7-10 business days.',
};

/**
 * Sample cancellation with no refund
 */
export const mockCancellationNoRefund: CancelResponse = {
  ConfirmationNo: 'CONF-2024-001236',
  CancellationStatus: 'Cancelled',
  RefundAmount: 0,
  CancellationCharge: 240,
  Status: 1,
  Message: 'Booking cancelled. No refund available due to cancellation policy.',
};

/**
 * Helper function to get mock hotels by criteria
 */
export function getMockHotelsByCriteria(criteria: {
  starRating?: number;
  maxPrice?: number;
  refundable?: boolean;
  mealType?: string;
  cityName?: string;
}): Hotel[] {
  let hotels = [...mockHotelCollection];

  if (criteria.starRating !== undefined) {
    hotels = hotels.filter(hotel => hotel.StarRating === criteria.starRating);
  }

  if (criteria.maxPrice !== undefined) {
    hotels = hotels.filter(hotel => hotel.Price.OfferedPrice <= criteria.maxPrice);
  }

  if (criteria.refundable !== undefined) {
    hotels = hotels.filter(hotel => hotel.Refundable === criteria.refundable);
  }

  if (criteria.mealType) {
    hotels = hotels.filter(hotel => 
      hotel.MealType.toLowerCase().includes(criteria.mealType!.toLowerCase())
    );
  }

  if (criteria.cityName) {
    hotels = hotels.filter(hotel => 
      hotel.CityName.toLowerCase() === criteria.cityName!.toLowerCase()
    );
  }

  return hotels;
}

/**
 * Helper function to generate mock booking code
 */
export function generateMockBookingCode(hotelCode: string): string {
  const timestamp = Date.now();
  return `${hotelCode}-BOOK-${timestamp}`;
}

/**
 * Helper function to generate mock confirmation number
 */
export function generateMockConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `CONF-${year}-${random}`;
}
