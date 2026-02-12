// Intelligent fallback detection and management service
import { isOnline } from '@/utils/errorUtils';
import { apiClient } from './api';

interface FallbackStatus {
  shouldUseFallback: boolean;
  reason: 'offline' | 'api_down' | 'timeout' | 'error' | 'none';
  lastChecked: Date;
  nextCheckIn: number; // milliseconds
}

class FallbackService {
  private status: FallbackStatus = {
    shouldUseFallback: false,
    reason: 'none',
    lastChecked: new Date(),
    nextCheckIn: 0,
  };

  private healthCheckInterval = 30000; // 30 seconds
  private timeoutDuration = 5000; // 5 seconds
  private maxRetries = 2;

  // Check if we should use fallback data
  async shouldUseFallback(): Promise<boolean> {
    // If we recently checked and determined we should use fallback, return cached result
    if (this.status.shouldUseFallback && Date.now() < this.status.nextCheckIn) {
      return true;
    }

    // If we're offline, definitely use fallback
    if (!isOnline()) {
      this.updateStatus(true, 'offline');
      return true;
    }

    // Check API health
    const isHealthy = await this.checkApiHealth();
    this.updateStatus(!isHealthy, isHealthy ? 'none' : 'api_down');
    
    return !isHealthy;
  }

  // Perform API health check
  private async checkApiHealth(): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

        await apiClient.get('/health', { 
          signal: controller.signal,
          timeout: this.timeoutDuration 
        });
        
        clearTimeout(timeoutId);
        return true;
      } catch (error: any) {
        attempts++;
        
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          this.updateStatus(true, 'timeout');
        } else if (error.response?.status >= 500) {
          this.updateStatus(true, 'api_down');
        } else if (!isOnline()) {
          this.updateStatus(true, 'offline');
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempts < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
      }
    }
    
    return false;
  }

  // Update fallback status
  private updateStatus(shouldUseFallback: boolean, reason: FallbackStatus['reason']) {
    this.status = {
      shouldUseFallback,
      reason,
      lastChecked: new Date(),
      nextCheckIn: Date.now() + this.healthCheckInterval,
    };
  }

  // Get current fallback status
  getStatus(): FallbackStatus {
    return { ...this.status };
  }

  // Force a health check
  async forceHealthCheck(): Promise<boolean> {
    this.status.nextCheckIn = 0; // Reset cache
    return this.shouldUseFallback();
  }

  // Reset fallback status (useful for testing or manual override)
  reset() {
    this.status = {
      shouldUseFallback: false,
      reason: 'none',
      lastChecked: new Date(),
      nextCheckIn: 0,
    };
  }

  // Get user-friendly status message
  getStatusMessage(): string {
    if (!this.status.shouldUseFallback) {
      return 'All services are operational';
    }

    switch (this.status.reason) {
      case 'offline':
        return 'You appear to be offline. Using cached data.';
      case 'api_down':
        return 'Our servers are temporarily unavailable. Using backup data.';
      case 'timeout':
        return 'Services are responding slowly. Using cached data for better performance.';
      case 'error':
        return 'Experiencing technical difficulties. Using backup data.';
      default:
        return 'Using backup data to ensure continued functionality.';
    }
  }

  // Check if we should show a status message to the user
  shouldShowStatusMessage(): boolean {
    return this.status.shouldUseFallback && 
           ['offline', 'api_down', 'timeout'].includes(this.status.reason);
  }
}

// Export singleton instance
export const fallbackService = new FallbackService();

// Export the class for testing
export { FallbackService };