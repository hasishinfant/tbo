/**
 * TBO Hotel API Client
 * 
 * This module provides a configured Axios client for communicating with the
 * TBO Hotel API. It includes:
 * - Basic Authentication (username/password)
 * - Automatic retry logic with exponential backoff (3 attempts)
 * - Request/response interceptors for error handling
 * - Timeout configuration (10 seconds)
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiConfig,
  HotelSearchRequest,
  HotelSearchResponse,
  HotelDetailsRequest,
  HotelDetailsResponse,
  PreBookRequest,
  PreBookResponse,
  HotelBookingRequest,
  HotelBookingResponse,
  BookingDetailRequest,
  BookingDetailResponse,
  BookingListRequest,
  BookingListResponse,
  CancelRequest,
  CancelResponse,
  CountryListResponse,
  CityListRequest,
  CityListResponse,
  HotelCodeListRequest,
  HotelCodeListResponse,
  ApiErrorResponse,
} from '../../types/tboHotelApi';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_TBO_HOTEL_API_URL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI',
  username: import.meta.env.VITE_TBO_HOTEL_USERNAME || '',
  password: import.meta.env.VITE_TBO_HOTEL_PASSWORD || '',
  timeout: 10000, // 10 seconds as per requirements
  retryAttempts: 3,
  retryDelay: 1000, // Initial delay of 1 second
};

// ============================================================================
// API Client Class
// ============================================================================

export class TboHotelApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Creates the Axios instance with base configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Basic Authentication
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
    });
  }

  /**
   * Sets up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - log requests in development
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add any request modifications here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Check for API-level errors in response
        if (response.data?.Status === 0 || response.data?.Status === 2) {
          const message = response.data.Message || 'API request failed';
          throw this.createApiError('API_ERROR', message);
        }
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handles response errors with retry logic
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    
    if (!config) {
      throw this.createApiError('NETWORK_ERROR', 'Network request failed');
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0;

    // Check if we should retry
    const shouldRetry = this.shouldRetryRequest(error, config._retryCount);

    if (shouldRetry && config._retryCount < this.config.retryAttempts) {
      config._retryCount += 1;
      
      // Calculate exponential backoff delay
      const delay = this.config.retryDelay * Math.pow(2, config._retryCount - 1);
      
      // Wait before retrying
      await this.sleep(delay);
      
      // Retry the request
      return this.client.request(config);
    }

    // Max retries reached or non-retryable error
    throw this.createApiError(
      error.code || 'UNKNOWN_ERROR',
      error.message || 'An unknown error occurred',
      { originalError: error }
    );
  }

  /**
   * Determines if a request should be retried
   */
  private shouldRetryRequest(error: AxiosError, retryCount: number): boolean {
    // Don't retry if max attempts reached
    if (retryCount >= this.config.retryAttempts) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on specific HTTP status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.response.status);
  }

  /**
   * Creates a standardized API error
   */
  private createApiError(code: string, message: string, details?: Record<string, any>): ApiErrorResponse {
    return {
      error: {
        code,
        message,
        details,
      },
      recoverable: this.isRecoverableError(code),
    };
  }

  /**
   * Determines if an error is recoverable
   */
  private isRecoverableError(code: string): boolean {
    const recoverableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'ECONNABORTED',
      'ECONNRESET',
      'ETIMEDOUT',
      '408',
      '429',
      '500',
      '502',
      '503',
      '504',
    ];
    return recoverableErrors.includes(code);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Search for hotels
   */
  async searchHotels(request: HotelSearchRequest): Promise<HotelSearchResponse> {
    const response = await this.client.post<HotelSearchResponse>('/search', request);
    return response.data;
  }

  /**
   * Get detailed hotel information
   */
  async getHotelDetails(request: HotelDetailsRequest): Promise<HotelDetailsResponse> {
    const response = await this.client.post<HotelDetailsResponse>('/Hoteldetails', request);
    return response.data;
  }

  /**
   * Pre-book validation - validates availability and pricing before final booking
   */
  async preBook(request: PreBookRequest): Promise<PreBookResponse> {
    const response = await this.client.post<PreBookResponse>('/PreBook', request);
    return response.data;
  }

  /**
   * Create a hotel booking
   */
  async createBooking(request: HotelBookingRequest): Promise<HotelBookingResponse> {
    const response = await this.client.post<HotelBookingResponse>('/Book', request);
    return response.data;
  }

  /**
   * Get booking details by confirmation number or booking reference
   */
  async getBookingDetails(request: BookingDetailRequest): Promise<BookingDetailResponse> {
    const response = await this.client.post<BookingDetailResponse>('/BookingDetail', request);
    return response.data;
  }

  /**
   * Get bookings within a date range
   */
  async getBookingsByDateRange(request: BookingListRequest): Promise<BookingListResponse> {
    const response = await this.client.post<BookingListResponse>('/BookingDetailsBasedOnDate', request);
    return response.data;
  }

  /**
   * Cancel a hotel booking
   */
  async cancelBooking(request: CancelRequest): Promise<CancelResponse> {
    const response = await this.client.post<CancelResponse>('/Cancel', request);
    return response.data;
  }

  /**
   * Get list of countries
   */
  async getCountryList(): Promise<CountryListResponse> {
    const response = await this.client.get<CountryListResponse>('/CountryList');
    return response.data;
  }

  /**
   * Get list of cities in a country
   */
  async getCityList(request: CityListRequest): Promise<CityListResponse> {
    const response = await this.client.post<CityListResponse>('/CityList', request);
    return response.data;
  }

  /**
   * Get list of hotels in a city
   */
  async getHotelCodeList(request: HotelCodeListRequest): Promise<HotelCodeListResponse> {
    const response = await this.client.post<HotelCodeListResponse>('/TBOHotelCodeList', request);
    return response.data;
  }

  /**
   * Health check to verify API availability
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Use CountryList as a simple health check endpoint
      await this.getCountryList();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let apiClientInstance: TboHotelApiClient | null = null;

/**
 * Gets the singleton API client instance
 */
export function getTboHotelApiClient(config?: Partial<ApiConfig>): TboHotelApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new TboHotelApiClient(config);
  }
  return apiClientInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetApiClient(): void {
  apiClientInstance = null;
}

// Export default instance
export default getTboHotelApiClient();
