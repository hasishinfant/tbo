/**
 * Mock Flight Data for Testing
 * 
 * Provides sample flight data for unit tests and development.
 * Includes diverse scenarios: direct flights, one-stop, multi-stop,
 * various airlines, prices, and times.
 */

import type {
  FlightResult,
  SeatMapResponse,
  AncillaryResponse,
  FareRulesResponse,
} from '../../types/tekTravelsApi';

/**
 * Sample direct flight (no stops)
 */
export const mockDirectFlight: FlightResult = {
  ResultIndex: 'DIRECT001',
  Source: 1,
  IsLCC: true,
  IsRefundable: false,
  AirlineCode: '6E',
  AirlineName: 'IndiGo',
  FlightNumber: '6E2045',
  FareClassification: {
    Type: 'Economy',
  },
  Segments: [[
    {
      Origin: {
        AirportCode: 'DEL',
        AirportName: 'Indira Gandhi International Airport',
        Terminal: '3',
        DepTime: '2024-03-15T08:00:00',
        ArrTime: '',
        CityCode: 'DEL',
        CityName: 'New Delhi',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BOM',
        AirportName: 'Chhatrapati Shivaji International Airport',
        Terminal: '2',
        DepTime: '',
        ArrTime: '2024-03-15T10:15:00',
        CityCode: 'BOM',
        CityName: 'Mumbai',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: '6E',
      AirlineName: 'IndiGo',
      FlightNumber: '6E2045',
      FareClass: 'Y',
      OperatingCarrier: '6E',
      Duration: 135,
      GroundTime: 0,
      Mile: 708,
      StopOver: false,
      FlightInfoIndex: '0',
      Baggage: '15 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 135,
      Craft: 'A320',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
  ]],
  LastTicketDate: '2024-03-14T23:59:59',
  TicketAdvisory: 'Web check-in available 48 hours before departure',
  FareRules: [],
  Fare: {
    Currency: 'USD',
    BaseFare: 120,
    Tax: 30,
    YQTax: 15,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 150,
    OfferedFare: 150,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  },
};

/**
 * Sample one-stop flight
 */
export const mockOneStopFlight: FlightResult = {
  ResultIndex: 'ONESTOP001',
  Source: 1,
  IsLCC: false,
  IsRefundable: true,
  AirlineCode: 'AI',
  AirlineName: 'Air India',
  FlightNumber: 'AI505',
  FareClassification: {
    Type: 'Economy',
  },
  Segments: [[
    {
      Origin: {
        AirportCode: 'DEL',
        AirportName: 'Indira Gandhi International Airport',
        Terminal: '3',
        DepTime: '2024-03-15T14:30:00',
        ArrTime: '',
        CityCode: 'DEL',
        CityName: 'New Delhi',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BLR',
        AirportName: 'Kempegowda International Airport',
        Terminal: '1',
        DepTime: '',
        ArrTime: '2024-03-15T17:00:00',
        CityCode: 'BLR',
        CityName: 'Bangalore',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'AI',
      AirlineName: 'Air India',
      FlightNumber: 'AI505',
      FareClass: 'Y',
      OperatingCarrier: 'AI',
      Duration: 150,
      GroundTime: 60,
      Mile: 1080,
      StopOver: true,
      FlightInfoIndex: '0',
      Baggage: '25 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 150,
      Craft: 'B787',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
    {
      Origin: {
        AirportCode: 'BLR',
        AirportName: 'Kempegowda International Airport',
        Terminal: '1',
        DepTime: '2024-03-15T18:00:00',
        ArrTime: '',
        CityCode: 'BLR',
        CityName: 'Bangalore',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BOM',
        AirportName: 'Chhatrapati Shivaji International Airport',
        Terminal: '2',
        DepTime: '',
        ArrTime: '2024-03-15T19:30:00',
        CityCode: 'BOM',
        CityName: 'Mumbai',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'AI',
      AirlineName: 'Air India',
      FlightNumber: 'AI506',
      FareClass: 'Y',
      OperatingCarrier: 'AI',
      Duration: 90,
      GroundTime: 0,
      Mile: 520,
      StopOver: false,
      FlightInfoIndex: '1',
      Baggage: '25 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 300,
      Craft: 'A320',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
  ]],
  LastTicketDate: '2024-03-14T23:59:59',
  TicketAdvisory: 'Complimentary meal service available',
  FareRules: [],
  Fare: {
    Currency: 'USD',
    BaseFare: 180,
    Tax: 40,
    YQTax: 20,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 220,
    OfferedFare: 220,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  },
};

/**
 * Sample multi-stop flight (2 stops)
 */
export const mockMultiStopFlight: FlightResult = {
  ResultIndex: 'MULTISTOP001',
  Source: 1,
  IsLCC: true,
  IsRefundable: false,
  AirlineCode: 'SG',
  AirlineName: 'SpiceJet',
  FlightNumber: 'SG8156',
  FareClassification: {
    Type: 'Economy',
  },
  Segments: [[
    {
      Origin: {
        AirportCode: 'DEL',
        AirportName: 'Indira Gandhi International Airport',
        Terminal: '3',
        DepTime: '2024-03-15T06:00:00',
        ArrTime: '',
        CityCode: 'DEL',
        CityName: 'New Delhi',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'HYD',
        AirportName: 'Rajiv Gandhi International Airport',
        Terminal: '1',
        DepTime: '',
        ArrTime: '2024-03-15T08:30:00',
        CityCode: 'HYD',
        CityName: 'Hyderabad',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'SG',
      AirlineName: 'SpiceJet',
      FlightNumber: 'SG8156',
      FareClass: 'Y',
      OperatingCarrier: 'SG',
      Duration: 150,
      GroundTime: 45,
      Mile: 1240,
      StopOver: true,
      FlightInfoIndex: '0',
      Baggage: '15 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 150,
      Craft: 'B737',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
    {
      Origin: {
        AirportCode: 'HYD',
        AirportName: 'Rajiv Gandhi International Airport',
        Terminal: '1',
        DepTime: '2024-03-15T09:15:00',
        ArrTime: '',
        CityCode: 'HYD',
        CityName: 'Hyderabad',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BLR',
        AirportName: 'Kempegowda International Airport',
        Terminal: '1',
        DepTime: '',
        ArrTime: '2024-03-15T10:15:00',
        CityCode: 'BLR',
        CityName: 'Bangalore',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'SG',
      AirlineName: 'SpiceJet',
      FlightNumber: 'SG8157',
      FareClass: 'Y',
      OperatingCarrier: 'SG',
      Duration: 60,
      GroundTime: 50,
      Mile: 360,
      StopOver: true,
      FlightInfoIndex: '1',
      Baggage: '15 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 255,
      Craft: 'B737',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
    {
      Origin: {
        AirportCode: 'BLR',
        AirportName: 'Kempegowda International Airport',
        Terminal: '1',
        DepTime: '2024-03-15T11:05:00',
        ArrTime: '',
        CityCode: 'BLR',
        CityName: 'Bangalore',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BOM',
        AirportName: 'Chhatrapati Shivaji International Airport',
        Terminal: '2',
        DepTime: '',
        ArrTime: '2024-03-15T12:35:00',
        CityCode: 'BOM',
        CityName: 'Mumbai',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'SG',
      AirlineName: 'SpiceJet',
      FlightNumber: 'SG8158',
      FareClass: 'Y',
      OperatingCarrier: 'SG',
      Duration: 90,
      GroundTime: 0,
      Mile: 520,
      StopOver: false,
      FlightInfoIndex: '2',
      Baggage: '15 Kg',
      CabinBaggage: '7 Kg',
      AccumulatedDuration: 395,
      Craft: 'B737',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
  ]],
  LastTicketDate: '2024-03-14T23:59:59',
  TicketAdvisory: 'Meals available for purchase',
  FareRules: [],
  Fare: {
    Currency: 'USD',
    BaseFare: 140,
    Tax: 35,
    YQTax: 18,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 175,
    OfferedFare: 175,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  },
};

/**
 * Sample premium/business class flight
 */
export const mockBusinessClassFlight: FlightResult = {
  ResultIndex: 'BUSINESS001',
  Source: 1,
  IsLCC: false,
  IsRefundable: true,
  AirlineCode: 'AI',
  AirlineName: 'Air India',
  FlightNumber: 'AI101',
  FareClassification: {
    Type: 'Business',
  },
  Segments: [[
    {
      Origin: {
        AirportCode: 'DEL',
        AirportName: 'Indira Gandhi International Airport',
        Terminal: '3',
        DepTime: '2024-03-15T18:00:00',
        ArrTime: '',
        CityCode: 'DEL',
        CityName: 'New Delhi',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      Destination: {
        AirportCode: 'BOM',
        AirportName: 'Chhatrapati Shivaji International Airport',
        Terminal: '2',
        DepTime: '',
        ArrTime: '2024-03-15T20:15:00',
        CityCode: 'BOM',
        CityName: 'Mumbai',
        CountryCode: 'IN',
        CountryName: 'India',
      },
      AirlineCode: 'AI',
      AirlineName: 'Air India',
      FlightNumber: 'AI101',
      FareClass: 'J',
      OperatingCarrier: 'AI',
      Duration: 135,
      GroundTime: 0,
      Mile: 708,
      StopOver: false,
      FlightInfoIndex: '0',
      Baggage: '40 Kg',
      CabinBaggage: '12 Kg',
      AccumulatedDuration: 135,
      Craft: 'B787',
      Remark: null,
      IsETicketEligible: true,
      FlightStatus: 'Confirmed',
      Status: 'Available',
    },
  ]],
  LastTicketDate: '2024-03-14T23:59:59',
  TicketAdvisory: 'Lounge access included. Priority boarding available.',
  FareRules: [],
  Fare: {
    Currency: 'USD',
    BaseFare: 450,
    Tax: 80,
    YQTax: 40,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 570,
    OfferedFare: 570,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  },
};

/**
 * Sample seat map with diverse seat types
 */
export const mockSeatMap: SeatMapResponse = {
  Response: {
    TraceId: 'MOCK-TRACE-123',
    SeatLayout: {
      SegmentSeat: [
        {
          SegmentIndex: 0,
          Seats: [
            // Premium Economy rows (1-3)
            { RowNo: 1, SeatNo: '1A', SeatType: 1, SeatWayType: 1, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            { RowNo: 1, SeatNo: '1B', SeatType: 2, SeatWayType: 1, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            { RowNo: 1, SeatNo: '1C', SeatType: 3, SeatWayType: 1, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            { RowNo: 1, SeatNo: '1D', SeatType: 3, SeatWayType: 3, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            { RowNo: 1, SeatNo: '1E', SeatType: 2, SeatWayType: 1, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            { RowNo: 1, SeatNo: '1F', SeatType: 1, SeatWayType: 1, Compartment: 2, Deck: 1, Currency: 'USD', Price: 50 },
            // Regular Economy rows (4-30)
            { RowNo: 10, SeatNo: '10A', SeatType: 1, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            { RowNo: 10, SeatNo: '10B', SeatType: 2, SeatWayType: 3, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            { RowNo: 10, SeatNo: '10C', SeatType: 3, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            { RowNo: 10, SeatNo: '10D', SeatType: 3, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            { RowNo: 10, SeatNo: '10E', SeatType: 2, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            { RowNo: 10, SeatNo: '10F', SeatType: 1, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 30 },
            // Back rows (cheaper)
            { RowNo: 25, SeatNo: '25A', SeatType: 1, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
            { RowNo: 25, SeatNo: '25B', SeatType: 2, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
            { RowNo: 25, SeatNo: '25C', SeatType: 3, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
            { RowNo: 25, SeatNo: '25D', SeatType: 3, SeatWayType: 2, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
            { RowNo: 25, SeatNo: '25E', SeatType: 2, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
            { RowNo: 25, SeatNo: '25F', SeatType: 1, SeatWayType: 1, Compartment: 1, Deck: 1, Currency: 'USD', Price: 15 },
          ],
        },
      ],
    },
  },
};

/**
 * Sample ancillary services (baggage and meals)
 */
export const mockAncillaryOptions: AncillaryResponse = {
  Response: {
    TraceId: 'MOCK-TRACE-123',
    Baggage: [
      {
        WayType: 1,
        Code: 'BAG5',
        Description: '5 kg Extra Baggage',
        Weight: 5,
        Currency: 'USD',
        Price: 15,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'BAG10',
        Description: '10 kg Extra Baggage',
        Weight: 10,
        Currency: 'USD',
        Price: 25,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'BAG15',
        Description: '15 kg Extra Baggage',
        Weight: 15,
        Currency: 'USD',
        Price: 35,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'BAG20',
        Description: '20 kg Extra Baggage',
        Weight: 20,
        Currency: 'USD',
        Price: 45,
        Origin: 'DEL',
        Destination: 'BOM',
      },
    ],
    MealDynamic: [
      {
        WayType: 1,
        Code: 'VEG',
        Description: 'Vegetarian Meal',
        AirlineDescription: 'Fresh vegetarian meal with seasonal vegetables and rice',
        Quantity: 1,
        Currency: 'USD',
        Price: 12,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'NVEG',
        Description: 'Non-Vegetarian Meal',
        AirlineDescription: 'Chicken or fish meal with sides and dessert',
        Quantity: 1,
        Currency: 'USD',
        Price: 15,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'VEGAN',
        Description: 'Vegan Meal',
        AirlineDescription: 'Plant-based meal with no animal products',
        Quantity: 1,
        Currency: 'USD',
        Price: 14,
        Origin: 'DEL',
        Destination: 'BOM',
      },
      {
        WayType: 1,
        Code: 'GFML',
        Description: 'Gluten-Free Meal',
        AirlineDescription: 'Gluten-free meal suitable for celiac passengers',
        Quantity: 1,
        Currency: 'USD',
        Price: 16,
        Origin: 'DEL',
        Destination: 'BOM',
      },
    ],
  },
};

/**
 * Sample fare rules
 */
export const mockFareRules: FareRulesResponse = {
  Response: {
    TraceId: 'MOCK-TRACE-123',
    FareRules: [
      {
        Origin: 'DEL',
        Destination: 'BOM',
        Airline: '6E',
        FareBasisCode: 'ECONOMY',
        FareRuleDetail: `
CANCELLATION:
- Before 72 hours: $50 cancellation fee
- 24-72 hours: $100 cancellation fee
- Less than 24 hours: Non-refundable

CHANGES:
- Before 72 hours: $30 change fee
- 24-72 hours: $60 change fee
- Less than 24 hours: $100 change fee

BAGGAGE:
- Checked: 15 kg included
- Cabin: 7 kg included
- Additional baggage available for purchase
        `,
        FareRestriction: 'Non-refundable fare. Changes allowed with fee. No-show will result in forfeiture of ticket value.',
      },
    ],
  },
};

/**
 * Collection of all mock flights for easy access
 */
export const mockFlightCollection = [
  mockDirectFlight,
  mockOneStopFlight,
  mockMultiStopFlight,
  mockBusinessClassFlight,
];

/**
 * Helper function to get mock flights by criteria
 */
export function getMockFlightsByCriteria(criteria: {
  maxStops?: number;
  cabinClass?: string;
  maxPrice?: number;
}): FlightResult[] {
  let flights = [...mockFlightCollection];

  if (criteria.maxStops !== undefined) {
    flights = flights.filter(flight => {
      const stops = flight.Segments[0].length - 1;
      return stops <= criteria.maxStops!;
    });
  }

  if (criteria.cabinClass) {
    flights = flights.filter(flight => 
      flight.FareClassification.Type.toLowerCase() === criteria.cabinClass!.toLowerCase()
    );
  }

  if (criteria.maxPrice !== undefined) {
    flights = flights.filter(flight => 
      flight.Fare.OfferedFare <= criteria.maxPrice!
    );
  }

  return flights;
}
