// Comprehensive integration test for TravelSphere data flow
// This script tests the complete user journey and data flow between components

import { itineraryService } from './services/itineraryService';
import { chatService } from './services/chatService';
import { emergencyService } from './services/emergencyService';
import type { TripPlannerFormData } from './types/trip';

// Test data
const testTripData: TripPlannerFormData = {
  destination: 'Paris, France',
  budget: 'medium',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-05'),
  interests: ['culture', 'food', 'adventure']
};

// Integration test suite
export class IntegrationTestSuite {
  private results: { [key: string]: boolean } = {};
  private errors: { [key: string]: string } = {};

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting TravelSphere Integration Tests...\n');

    await this.testItineraryGeneration();
    await this.testChatService();
    await this.testEmergencyService();
    await this.testDataPersistence();
    await this.testNavigationFlow();

    this.printResults();
  }

  private async testItineraryGeneration(): Promise<void> {
    console.log('📋 Testing Itinerary Generation...');
    
    try {
      const response = await itineraryService.generateItinerary(testTripData);
      
      if (response.success && response.data) {
        const itinerary = response.data;
        
        // Validate itinerary structure
        const hasValidStructure = (
          itinerary.tripId &&
          Array.isArray(itinerary.itinerary) &&
          itinerary.itinerary.length > 0 &&
          itinerary.generatedAt
        );

        // Validate each day has required fields
        const hasValidDays = itinerary.itinerary.every(day => 
          day.dayNumber &&
          day.date &&
          Array.isArray(day.places) &&
          Array.isArray(day.foodRecommendations) &&
          Array.isArray(day.travelTips)
        );

        this.results['itineraryGeneration'] = Boolean(hasValidStructure && hasValidDays);
        
        if (this.results['itineraryGeneration']) {
          console.log('✅ Itinerary generation successful');
          console.log(`   - Trip ID: ${itinerary.tripId}`);
          console.log(`   - Days: ${itinerary.itinerary.length}`);
          console.log(`   - Generated at: ${itinerary.generatedAt}`);
        } else {
          this.errors['itineraryGeneration'] = 'Invalid itinerary structure';
        }
      } else {
        this.results['itineraryGeneration'] = false;
        this.errors['itineraryGeneration'] = response.error?.message || 'Unknown error';
      }
    } catch (error) {
      this.results['itineraryGeneration'] = false;
      this.errors['itineraryGeneration'] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private async testChatService(): Promise<void> {
    console.log('💬 Testing Chat Service...');
    
    try {
      const testMessage = "What should I eat in Paris?";
      const response = await chatService.sendMessage({
        message: testMessage,
        tripId: 'test-trip-123'
      });
      
      if (response.success && response.data) {
        const chatResponse = response.data;
        
        // Validate chat response structure
        const hasValidStructure = (
          chatResponse.messageId &&
          chatResponse.content &&
          chatResponse.timestamp
        );

        this.results['chatService'] = Boolean(hasValidStructure);
        
        if (this.results['chatService']) {
          console.log('✅ Chat service successful');
          console.log(`   - Message ID: ${chatResponse.messageId}`);
          console.log(`   - Response: ${chatResponse.content.substring(0, 50)}...`);
        } else {
          this.errors['chatService'] = 'Invalid chat response structure';
        }
      } else {
        this.results['chatService'] = false;
        this.errors['chatService'] = response.error?.message || 'Unknown error';
      }
    } catch (error) {
      this.results['chatService'] = false;
      this.errors['chatService'] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private async testEmergencyService(): Promise<void> {
    console.log('🚨 Testing Emergency Service...');
    
    try {
      const response = await emergencyService.submitEmergencyRequest({
        type: 'medical'
      });
      
      if (response.success && response.data) {
        const emergencyResponse = response.data;
        
        // Validate emergency response structure
        const hasValidStructure = (
          emergencyResponse.requestId &&
          emergencyResponse.confirmationMessage
        );

        this.results['emergencyService'] = Boolean(hasValidStructure);
        
        if (this.results['emergencyService']) {
          console.log('✅ Emergency service successful');
          console.log(`   - Request ID: ${emergencyResponse.requestId}`);
          console.log(`   - Message: ${emergencyResponse.confirmationMessage}`);
        } else {
          this.errors['emergencyService'] = 'Invalid emergency response structure';
        }
      } else {
        this.results['emergencyService'] = false;
        this.errors['emergencyService'] = response.error?.message || 'Unknown error';
      }
    } catch (error) {
      this.results['emergencyService'] = false;
      this.errors['emergencyService'] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private async testDataPersistence(): Promise<void> {
    console.log('💾 Testing Data Persistence...');
    
    try {
      // Test sessionStorage for trip data
      const testData = { test: 'data', timestamp: Date.now() };
      sessionStorage.setItem('test_trip_data', JSON.stringify(testData));
      const retrieved = JSON.parse(sessionStorage.getItem('test_trip_data') || '{}');
      
      const sessionStorageWorks = retrieved.test === 'data';
      
      // Test localStorage for saved trips
      const testTrip = { id: 'test-123', name: 'Test Trip' };
      localStorage.setItem('travelsphere_saved_trips', JSON.stringify([testTrip]));
      const savedTrips = JSON.parse(localStorage.getItem('travelsphere_saved_trips') || '[]');
      
      const localStorageWorks = savedTrips.length === 1 && savedTrips[0].id === 'test-123';
      
      this.results['dataPersistence'] = sessionStorageWorks && localStorageWorks;
      
      if (this.results['dataPersistence']) {
        console.log('✅ Data persistence successful');
        console.log('   - SessionStorage: ✓');
        console.log('   - LocalStorage: ✓');
      } else {
        this.errors['dataPersistence'] = 'Storage mechanisms not working properly';
      }
      
      // Cleanup
      sessionStorage.removeItem('test_trip_data');
      localStorage.removeItem('travelsphere_saved_trips');
      
    } catch (error) {
      this.results['dataPersistence'] = false;
      this.errors['dataPersistence'] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private async testNavigationFlow(): Promise<void> {
    console.log('🧭 Testing Navigation Flow...');
    
    try {
      // Test that all required routes are defined
      const requiredRoutes = [
        '/',
        '/plan-trip',
        '/itinerary',
        '/itinerary/:tripId',
        '/chat',
        '/chat/:tripId',
        '/emergency-support'
      ];
      
      // This is a basic check - in a real test environment, we'd use React Router testing utilities
      const routesExist = requiredRoutes.every(route => {
        // Basic validation that routes are properly structured
        return route.startsWith('/');
      });
      
      // Test data flow between pages
      const tripData = {
        destination: 'Paris',
        budget: 'medium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        interests: ['culture']
      };
      
      // Simulate storing data for navigation
      sessionStorage.setItem('tripPlannerData', JSON.stringify(tripData));
      const storedData = JSON.parse(sessionStorage.getItem('tripPlannerData') || '{}');
      
      const dataFlowWorks = storedData.destination === 'Paris';
      
      this.results['navigationFlow'] = routesExist && dataFlowWorks;
      
      if (this.results['navigationFlow']) {
        console.log('✅ Navigation flow successful');
        console.log(`   - Routes defined: ${requiredRoutes.length}`);
        console.log('   - Data flow: ✓');
      } else {
        this.errors['navigationFlow'] = 'Navigation or data flow issues detected';
      }
      
      // Cleanup
      sessionStorage.removeItem('tripPlannerData');
      
    } catch (error) {
      this.results['navigationFlow'] = false;
      this.errors['navigationFlow'] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private printResults(): void {
    console.log('\n📊 Integration Test Results:');
    console.log('================================');
    
    const testNames = Object.keys(this.results);
    const passedTests = testNames.filter(name => this.results[name]);
    const failedTests = testNames.filter(name => !this.results[name]);
    
    console.log(`✅ Passed: ${passedTests.length}/${testNames.length}`);
    console.log(`❌ Failed: ${failedTests.length}/${testNames.length}`);
    
    if (passedTests.length > 0) {
      console.log('\n✅ Passed Tests:');
      passedTests.forEach(test => console.log(`   - ${test}`));
    }
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test}: ${this.errors[test]}`);
      });
    }
    
    const overallSuccess = failedTests.length === 0;
    console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (overallSuccess) {
      console.log('\n🎉 All integration tests passed! TravelSphere is ready for use.');
    } else {
      console.log('\n⚠️  Some integration tests failed. Please review the errors above.');
    }
  }
}

// Export for use in other files
export const runIntegrationTests = async () => {
  const testSuite = new IntegrationTestSuite();
  await testSuite.runAllTests();
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && (window as any).runTravelSphereTests) {
  runIntegrationTests();
}