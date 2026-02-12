/**
 * API Client Configuration
 * 
 * Axios client configured for confidence engine API communication.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL - can be configured via environment variables
const API_BASE_URL = ((import.meta as any).env?.VITE_CONFIDENCE_API_BASE_URL as string | undefined) || '/api';

// Create axios instance with default configuration
export const confidenceApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authentication tokens
confidenceApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add correlation ID for request tracing
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (config.headers) {
      config.headers['X-Correlation-ID'] = correlationId;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
confidenceApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          console.error('Authentication failed');
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error - service may be unavailable');
          break;
        default:
          console.error(`API error: ${status}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response from server');
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Error response format for graceful degradation
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    fallbackUsed: boolean;
    retryable: boolean;
  };
  fallbackData?: any;
}

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const status = error.response.status;
  // Retry on server errors and rate limiting
  return status >= 500 || status === 429;
};

/**
 * Create error response for graceful degradation
 */
export const createErrorResponse = (
  error: AxiosError,
  fallbackData?: any
): ErrorResponse => {
  const status = error.response?.status;
  
  return {
    error: {
      code: error.code || `HTTP_${status}`,
      message: error.message || 'An error occurred',
      details: error.response?.data,
      fallbackUsed: !!fallbackData,
      retryable: isRetryableError(error),
    },
    fallbackData,
  };
};

export default confidenceApiClient;
