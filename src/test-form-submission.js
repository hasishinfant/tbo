// Simple test script to validate form submission logic
// This can be run in the browser console to test the API integration

console.log('Testing TravelSphere Form Submission...');

// Mock form data
const testFormData = {
  destination: 'Paris',
  budget: 'medium',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-05'),
  interests: ['culture', 'food']
};

// Test the itinerary service
import('./services/itineraryService.js').then(({ itineraryService }) => {
  console.log('Testing API call...');
  
  // Test the generateItinerary function (will fail to real API, should fallback to mock)
  itineraryService.generateItinerary(testFormData)
    .then(response => {
      console.log('API Response:', response);
      if (response.success) {
        console.log('✅ API call successful');
        console.log('Trip ID:', response.data.tripId);
        console.log('Days in itinerary:', response.data.itinerary.length);
      } else {
        console.log('❌ API call failed:', response.error);
      }
    })
    .catch(error => {
      console.log('❌ API call error:', error);
      
      // Test fallback mock data
      console.log('Testing mock fallback...');
      const mockResponse = itineraryService.getMockItinerary(testFormData);
      console.log('Mock Response:', mockResponse);
      
      if (mockResponse.success) {
        console.log('✅ Mock fallback successful');
        console.log('Trip ID:', mockResponse.data.tripId);
        console.log('Days in itinerary:', mockResponse.data.itinerary.length);
        console.log('Estimated cost:', mockResponse.data.estimatedCost);
      } else {
        console.log('❌ Mock fallback failed');
      }
    });
});

// Test session storage functionality
console.log('Testing session storage...');
sessionStorage.setItem('tripPlannerData', JSON.stringify(testFormData));
sessionStorage.setItem('generatedItinerary', JSON.stringify({
  tripId: 'test-trip-123',
  itinerary: [
    {
      dayNumber: 1,
      date: testFormData.startDate,
      places: [{ name: 'Test Place', description: 'Test Description', estimatedTime: '2 hours', category: 'culture' }],
      foodRecommendations: [{ name: 'Test Restaurant', type: 'Traditional', description: 'Test Food', priceRange: '$$' }],
      travelTips: ['Test tip 1', 'Test tip 2']
    }
  ],
  estimatedCost: { min: 800, max: 1500, currency: 'USD' },
  generatedAt: new Date()
}));

const storedFormData = sessionStorage.getItem('tripPlannerData');
const storedItinerary = sessionStorage.getItem('generatedItinerary');

if (storedFormData && storedItinerary) {
  console.log('✅ Session storage working correctly');
  console.log('Stored form data:', JSON.parse(storedFormData));
  console.log('Stored itinerary:', JSON.parse(storedItinerary));
} else {
  console.log('❌ Session storage failed');
}

console.log('Test completed. Check the results above.');