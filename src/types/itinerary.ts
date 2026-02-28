// Itinerary-related type definitions
export interface Place {
  name: string;
  description: string;
  estimatedTime: string;
  category: string;
}

export interface FoodRecommendation {
  name: string;
  type: string;
  description: string;
  priceRange: string;
}

export interface FlightBooking {
  bookingReference: string;
  pnr: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: Date;
  };
  arrival: {
    airport: string;
    city: string;
    time: Date;
  };
  passengers: string[];
  totalFare: number;
  currency: string;
  status: string;
  bookedAt: Date;
}

export interface HotelBooking {
  confirmationNumber: string;
  bookingReferenceId: string;
  hotelName: string;
  address: string;
  cityName: string;
  countryName: string;
  starRating: number;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  mealType: string;
  guests: string[];
  totalFare: number;
  currency: string;
  status: string;
  bookedAt: Date;
  refundable: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: Date;
  places: Place[];
  foodRecommendations: FoodRecommendation[];
  travelTips: string[];
  flights?: FlightBooking[];
  hotels?: HotelBooking[];
}