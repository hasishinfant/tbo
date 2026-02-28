/**
 * Test Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { hotelApiHandlers } from './mocks/hotelApiHandlers';

// Setup MSW server with hotel API handlers
export const server = setupServer(...hotelApiHandlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock environment variables
process.env.VITE_TEK_TRAVELS_API_URL = 'https://api.test.com';
process.env.VITE_TEK_TRAVELS_API_KEY = 'test-api-key';
process.env.VITE_TBO_HOTEL_API_URL = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI';
process.env.VITE_TBO_HOTEL_USERNAME = 'test-username';
process.env.VITE_TBO_HOTEL_PASSWORD = 'test-password';
