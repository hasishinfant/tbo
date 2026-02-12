// Error handling utilities
import type { ApiResponse } from '@/types/api';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

// Exponential backoff retry utility
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Don't retry on certain error types (4xx client errors)
      if (isNonRetryableError(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      console.warn(`Attempt ${attempt} failed, retrying in ${Math.round(jitteredDelay)}ms...`, error);
      await sleep(jitteredDelay);
    }
  }

  throw lastError!;
}

// Check if error should not be retried
function isNonRetryableError(error: any): boolean {
  if (error.response) {
    const status = error.response.status;
    // Don't retry client errors (4xx) except for 408, 429
    return status >= 400 && status < 500 && status !== 408 && status !== 429;
  }
  return false;
}

// Sleep utility for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Network connectivity checker
export function isOnline(): boolean {
  return navigator.onLine;
}

// Enhanced error categorization
export enum ErrorCategory {
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  originalError: any;
  isRetryable: boolean;
  userMessage: string;
}

export function categorizeError(error: any): CategorizedError {
  if (!error) {
    return {
      category: ErrorCategory.UNKNOWN,
      message: 'Unknown error occurred',
      originalError: error,
      isRetryable: false,
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || !isOnline()) {
    return {
      category: ErrorCategory.NETWORK,
      message: 'Network connection failed',
      originalError: error,
      isRetryable: true,
      userMessage: 'Please check your internet connection and try again.',
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      category: ErrorCategory.TIMEOUT,
      message: 'Request timed out',
      originalError: error,
      isRetryable: true,
      userMessage: 'The request is taking longer than expected. Please try again.',
    };
  }

  // HTTP response errors
  if (error.response) {
    const status = error.response.status;
    
    if (status >= 500) {
      return {
        category: ErrorCategory.SERVER,
        message: `Server error (${status})`,
        originalError: error,
        isRetryable: true,
        userMessage: 'Our servers are experiencing issues. Please try again in a moment.',
      };
    }
    
    if (status === 429) {
      return {
        category: ErrorCategory.SERVER,
        message: 'Rate limit exceeded',
        originalError: error,
        isRetryable: true,
        userMessage: 'Too many requests. Please wait a moment and try again.',
      };
    }
    
    if (status >= 400 && status < 500) {
      return {
        category: ErrorCategory.CLIENT,
        message: `Client error (${status})`,
        originalError: error,
        isRetryable: false,
        userMessage: error.response.data?.message || 'Invalid request. Please check your input.',
      };
    }
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return {
      category: ErrorCategory.VALIDATION,
      message: 'Validation failed',
      originalError: error,
      isRetryable: false,
      userMessage: error.message || 'Please check your input and try again.',
    };
  }

  // Default unknown error
  return {
    category: ErrorCategory.UNKNOWN,
    message: error.message || 'Unknown error occurred',
    originalError: error,
    isRetryable: false,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

// Error logging utility
export function logError(error: CategorizedError, context?: string): void {
  const logData = {
    category: error.category,
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    isOnline: isOnline(),
  };

  console.error('Application Error:', logData, error.originalError);

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(logData);
  }
}

// Create user-friendly error response
export function createErrorResponse<T>(error: any, context?: string): ApiResponse<T> {
  const categorizedError = categorizeError(error);
  logError(categorizedError, context);

  return {
    success: false,
    error: {
      code: categorizedError.category.toUpperCase(),
      message: categorizedError.userMessage,
      details: process.env.NODE_ENV === 'development' ? categorizedError.originalError : undefined,
    },
    timestamp: new Date(),
  };
}