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

// Mock localStorage for Node 22+ environments
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value ? value.toString() : '';
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const storageMock = createStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
  configurable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: storageMock,
    writable: true,
    configurable: true,
  });
}

