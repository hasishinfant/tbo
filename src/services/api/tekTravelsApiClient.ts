/**
 * Tek Travels Universal Air API Client
 * 
 * This module provides a configured Axios client for communicating with the
 * Tek Travels API. It includes:
 * - Authentication via API key injection
 * - Automatic retry logic with exponential backoff
 * - Request/response interceptors for error handling
 * - Timeout configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiConfig,
  FlightSearchRequest,
  FlightSearchResponse,
  RepricingRequest,
  RepricingResponse,
  SeatMapRequest,
  SeatMapResponse,
  SeatSellRequest,
  SeatSellResponse,
  AncillaryRequest,
  AncillaryResponse,
  FareRulesRequest,
  FareRulesResponse,
  BookingRequest,
  BookingResponse,
  ApiErrorResponse,
} from '../../types/tekTravelsApi';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_TEK_TRAVELS_API_URL || 'https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest',
  apiKey: import.meta.env.VITE_TEK_TRAVELS_API_KEY || '',
  timeout: 5000, // 5 seconds as per requirements
  retryAttempts: 3,
  retryDelay: 1000, // Initial delay of 1 second
};

// ============================================================================
// API Client Class
// ============================================================================

export class TekTravelsApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;
  private currentTraceId: string | null = null;

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
    });
  }

  /**
   * Sets up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - inject API key
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Inject API key into request body for Tek Travels API
        if (config.data && typeof config.data === 'object') {
          config.data = {
            ...config.data,
            TokenId: this.config.apiKey,
          };
        }
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
        if (response.data?.Response?.Error) {
          const apiError = response.data.Response.Error;
          throw this.createApiError(apiError.ErrorCode, apiError.ErrorMessage);
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
      Response: {
        ResponseStatus: 2,
        Error: {
          ErrorCode: code,
          ErrorMessage: message,
        },
      },
      error: code,
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

  /**
   * Sets the current TraceId for subsequent requests
   */
  public setTraceId(traceId: string): void {
    this.currentTraceId = traceId;
  }

  /**
   * Gets the current TraceId
   */
  public getTraceId(): string | null {
    return this.currentTraceId;
  }

  /**
   * Clears the current TraceId
   */
  public clearTraceId(): void {
    this.currentTraceId = null;
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Search for flights
   */
  async searchFlights(request: Omit<FlightSearchRequest, 'TokenId'>): Promise<FlightSearchResponse> {
    const response = await this.client.post<FlightSearchResponse>('/Search', request);
    
    // Store TraceId from response
    if (response.data.Response?.TraceId) {
      this.setTraceId(response.data.Response.TraceId);
    }
    
    return response.data;
  }

  /**
   * Re-price a selected flight
   */
  async repriceFlight(request: Omit<RepricingRequest, 'TokenId'>): Promise<RepricingResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<RepricingResponse>('/Reprice', request);
    return response.data;
  }

  /**
   * Get seat map for a flight
   */
  async getSeatMap(request: Omit<SeatMapRequest, 'TokenId'>): Promise<SeatMapResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<SeatMapResponse>('/GetSeatMap', request);
    return response.data;
  }

  /**
   * Reserve selected seats
   */
  async sellSeats(request: Omit<SeatSellRequest, 'TokenId'>): Promise<SeatSellResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<SeatSellResponse>('/SeatSell', request);
    return response.data;
  }

  /**
   * Get ancillary services (baggage and meals)
   */
  async getAncillaryServices(request: Omit<AncillaryRequest, 'TokenId'>): Promise<AncillaryResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<AncillaryResponse>('/SSR', request);
    return response.data;
  }

  /**
   * Get fare rules for a flight
   */
  async getFareRules(request: Omit<FareRulesRequest, 'TokenId'>): Promise<FareRulesResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<FareRulesResponse>('/FareRule', request);
    return response.data;
  }

  /**
   * Create a booking
   */
  async createBooking(request: Omit<BookingRequest, 'TokenId'>): Promise<BookingResponse> {
    if (!request.TraceId && this.currentTraceId) {
      request = { ...request, TraceId: this.currentTraceId };
    }
    
    const response = await this.client.post<BookingResponse>('/Book', request);
    return response.data;
  }

  /**
   * Health check to verify API availability
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple request to check if API is reachable
      await this.client.get('/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let apiClientInstance: TekTravelsApiClient | null = null;

/**
 * Gets the singleton API client instance
 */
export function getTekTravelsApiClient(config?: Partial<ApiConfig>): TekTravelsApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new TekTravelsApiClient(config);
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
export default getTekTravelsApiClient();
