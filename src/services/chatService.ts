// Chat assistant service with enhanced error handling
import { apiClient, apiCall } from './api';
import { fallbackService } from './fallbackService';
import type { ChatResponse, ApiResponse } from '@/types/api';

export interface ChatRequest {
  message: string;
  tripId?: string;
  sessionId?: string;
}

export const chatService = {
  // Send message with automatic fallback
  async sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    // Check if we should use fallback immediately
    const useFallback = await fallbackService.shouldUseFallback();
    if (useFallback) {
      console.info('Using fallback chat response due to API unavailability:', fallbackService.getStatusMessage());
      return this.getMockChatResponse(request.message);
    }

    // Try API call with retry logic
    const result = await apiCall(
      () => apiClient.post<ChatResponse>('/chat-assistant', request).then(res => res.data),
      'sendChatMessage'
    );

    // If API call failed, use fallback
    if (!result.success) {
      console.warn('Chat API call failed, falling back to mock response:', result.error);
      return this.getMockChatResponse(request.message);
    }

    return result;
  },

  // Mock fallback response for when API is unavailable
  getMockChatResponse(message: string): ApiResponse<ChatResponse> {
    // Use the comprehensive mock data service
    const { generateMockChatResponse } = require('./mockDataService');
    return generateMockChatResponse(message);
  },

  // Get quick suggestion responses
  getQuickSuggestions(): string[] {
    return [
      "What should I eat here?",
      "How do I get around?",
      "Any hidden gems nearby?",
    ];
  },
};