/**
 * Context Adapter Types
 * 
 * Types for real-time context adjustments, alerts,
 * and external condition monitoring.
 */

export type AlertType = 'geopolitical' | 'weather' | 'health' | 'safety';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ContextAdjustmentRequest {
  destinationId: string;
  baseScore: number;
  travelDates: {
    startDate: string;
    endDate: string;
  };
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContextAdjustmentResponse {
  adjustedScore: number;
  adjustments: ContextAdjustment[];
  alerts: Alert[];
}

export interface ContextAdjustment {
  factor: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
}

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  source: string;
  issuedAt: string;
}
