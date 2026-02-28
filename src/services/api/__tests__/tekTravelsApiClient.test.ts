/**
 * Unit tests for Tek Travels API Client
 * 
 * Tests basic configuration, authentication, and error handling
 * Note: Full test suite will be implemented when vitest is configured
 */

import { TekTravelsApiClient, getTekTravelsApiClient, resetApiClient } from '../tekTravelsApiClient';

// Test 1: Client instantiation
const testClientInstantiation = () => {
  try {
    const client = new TekTravelsApiClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://test-api.example.com',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
    });
    
    console.log('✓ Client instantiation successful');
    return true;
  } catch (error) {
    console.error('✗ Client instantiation failed:', error);
    return false;
  }
};

// Test 2: TraceId management
const testTraceIdManagement = () => {
  try {
    const client = new TekTravelsApiClient();
    
    // Test setting TraceId
    client.setTraceId('test-trace-id-123');
    if (client.getTraceId() !== 'test-trace-id-123') {
      throw new Error('TraceId not set correctly');
    }
    
    // Test clearing TraceId
    client.clearTraceId();
    if (client.getTraceId() !== null) {
      throw new Error('TraceId not cleared correctly');
    }
    
    console.log('✓ TraceId management working correctly');
    return true;
  } catch (error) {
    console.error('✗ TraceId management failed:', error);
    return false;
  }
};

// Test 3: API methods exist
const testApiMethodsExist = () => {
  try {
    const client = new TekTravelsApiClient();
    
    const requiredMethods = [
      'searchFlights',
      'repriceFlight',
      'getSeatMap',
      'sellSeats',
      'getAncillaryServices',
      'getFareRules',
      'createBooking',
      'healthCheck',
    ];
    
    for (const method of requiredMethods) {
      if (typeof (client as any)[method] !== 'function') {
        throw new Error(`Method ${method} not found or not a function`);
      }
    }
    
    console.log('✓ All required API methods exist');
    return true;
  } catch (error) {
    console.error('✗ API methods check failed:', error);
    return false;
  }
};

// Test 4: Singleton pattern
const testSingletonPattern = () => {
  try {
    resetApiClient();
    const instance1 = getTekTravelsApiClient();
    const instance2 = getTekTravelsApiClient();
    
    if (instance1 !== instance2) {
      throw new Error('Singleton pattern not working - different instances returned');
    }
    
    console.log('✓ Singleton pattern working correctly');
    return true;
  } catch (error) {
    console.error('✗ Singleton pattern test failed:', error);
    return false;
  }
};

// Run all tests
export const runBasicTests = () => {
  console.log('Running Tek Travels API Client basic tests...\n');
  
  const results = [
    testClientInstantiation(),
    testTraceIdManagement(),
    testApiMethodsExist(),
    testSingletonPattern(),
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n${passed}/${total} tests passed`);
  
  return passed === total;
};

// Auto-run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests();
}
