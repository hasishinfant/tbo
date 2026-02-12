// Emergency support service with enhanced error handling
import { apiClient, apiCall } from './api';
import type { EmergencyResponse, ApiResponse, EmergencyType } from '@/types/api';

export interface EmergencyRequest {
  type: EmergencyType;
  location?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
}

export const emergencyService = {
  // Submit emergency request with automatic fallback
  async submitEmergencyRequest(request: EmergencyRequest): Promise<ApiResponse<EmergencyResponse>> {
    // For emergency requests, we still try the API first even if health check fails
    // as emergency services might have different availability
    const result = await apiCall(
      () => apiClient.post<EmergencyResponse>('/emergency-support', request).then(res => res.data),
      'submitEmergencyRequest'
    );

    // If API call failed, use fallback
    if (!result.success) {
      console.warn('Emergency API call failed, falling back to mock response:', result.error);
      return this.getMockEmergencyResponse(request.type);
    }

    return result;
  },

  // Mock fallback response for when API is unavailable
  getMockEmergencyResponse(type: EmergencyType): ApiResponse<EmergencyResponse> {
    // Use the comprehensive mock data service
    const { generateMockEmergencyResponse } = require('./mockDataService');
    return generateMockEmergencyResponse(type);
  },

  // Get emergency types with descriptions
  getEmergencyTypes(): Array<{ type: EmergencyType; label: string; description: string }> {
    return [
      {
        type: 'medical',
        label: 'Medical Emergency',
        description: 'Immediate medical assistance needed',
      },
      {
        type: 'passport',
        label: 'Lost Passport',
        description: 'Lost or stolen travel documents',
      },
      {
        type: 'hotel',
        label: 'Hotel Issue',
        description: 'Problems with accommodation',
      },
      {
        type: 'local-help',
        label: 'Need Local Help',
        description: 'General assistance and local support',
      },
    ];
  },
};