# TravelSphere API Credentials Reference

## Tek Travels Flight API (UAT Environment)

### API Credentials
- **Environment:** UAT (User Acceptance Testing)
- **User ID:** Hackathon
- **Password:** Hackathon@1234
- **API Base URL:** http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest
- **Shared API URL:** http://Sharedapi.tektravels.com/SharedData.svc/rest
- **Documentation:** https://api.tektravels.com/FlightAPIDocument/APIGuide.aspx

### B2B Portal Access
- **Environment:** UAT
- **User ID:** Hackathon
- **Password:** Hackathon@123
- **Portal URL:** https://api.tektravels.com

## TBO Hotel API

### API Credentials
- **Username:** (To be provided)
- **Password:** (To be provided)
- **API Base URL:** http://api.tbotechnology.in/TBOHolidays_HotelAPI

## Environment Variables

All credentials are configured in `.env` file:

```env
# Tek Travels Flight API
VITE_TEK_TRAVELS_CLIENT_ID=ApiIntegrationNew
VITE_TEK_TRAVELS_USERNAME=Hackathon
VITE_TEK_TRAVELS_PASSWORD=Hackathon@1234
VITE_TEK_TRAVELS_API_URL=http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest
VITE_TEK_TRAVELS_SHARED_API_URL=http://Sharedapi.tektravels.com/SharedData.svc/rest

# TBO Hotel API (credentials needed)
VITE_TBO_HOTEL_USERNAME=your-username-here
VITE_TBO_HOTEL_PASSWORD=your-password-here
VITE_TBO_HOTEL_API_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
```

## Quick Start

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Access Application:**
   - Local: http://localhost:5173/
   - Login with any credentials (demo mode)

3. **Test Flight Booking:**
   - Navigate to "Plan Trip"
   - Search flights: DEL → BOM (Delhi to Mumbai)
   - Select dates and proceed with booking

4. **Access B2B Portal:**
   - Visit: https://api.tektravels.com
   - Login: Hackathon / Hackathon@123
   - View bookings, reports, and account details

## API Endpoints Available

### Flight Booking Flow
1. **Authentication** - Get access token
2. **Search** - Search for available flights
3. **Fare Rules** - Get cancellation/change policies
4. **Fare Quote** - Get updated pricing
5. **SSR** - Get seat/meal/baggage options
6. **Book** - Create booking
7. **Ticket** - Issue ticket
8. **Get Booking Details** - Retrieve booking info
9. **Cancel Request** - Cancel booking

### Hotel Booking Flow (Ready, needs credentials)
1. **Search** - Search for hotels
2. **Hotel Details** - Get detailed hotel info
3. **PreBook** - Validate availability and pricing
4. **Book** - Create hotel booking
5. **Booking Detail** - Retrieve booking info
6. **Cancel** - Cancel hotel booking

## Testing

Run the test suite:
```bash
npm test
```

Run specific test suites:
```bash
npm test -- bookingService.test.ts
npm test -- hotelBookingService.test.ts
```

## Notes

- **UAT Environment:** This is a testing environment, safe for development
- **Mock Fallback:** App automatically falls back to mock data if API is unavailable
- **Session Management:** Booking sessions expire after 30 minutes
- **Error Handling:** Comprehensive error handling with user-friendly messages

## Support

- **API Documentation:** https://api.tektravels.com/FlightAPIDocument/APIGuide.aspx
- **B2B Portal:** https://api.tektravels.com
- **Project Documentation:** See README.md and other docs in project root

---

**Last Updated:** February 28, 2026
