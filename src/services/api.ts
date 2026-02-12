// API client configuration with enhanced error handling
import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import { retryWithBackoff, createErrorResponse, isOnline } from '@/utils/errorUtils';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    // Add any auth tokens or common headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      isOnline: isOnline(),
    });
    
    return Promise.reject(error);
  }
);

// Enhanced API call wrapper with retry logic
export async function apiCall<T>(
  requestFn: () => Promise<T>,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const data = await retryWithBackoff(requestFn, {
      maxAttempts: 3,
      baseDelay: 1000,
    });
    
    return {
      success: true,
      data,
      timestamp: new Date(),
    };
  } catch (error) {
    return createErrorResponse<T>(error, context);
  }
}

// Generic API error handler (legacy support)
export const handleApiError = <T>(error: any): ApiResponse<T> => {
  return createErrorResponse<T>(error);
};