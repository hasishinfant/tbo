/**
 * Confidence-Driven Travel Engine
 * 
 * Main entry point for the confidence engine module.
 * Exports all public types, services, and utilities.
 */

// Export all types
export * from './types';

// Export API client
export { confidenceApiClient, isRetryableError, createErrorResponse } from './services/apiClient';
export type { ErrorResponse } from './services/apiClient';

// Export services
export * from './services/confidenceScoreService';
export * from './services/mockConfidenceService';

// Export components
export { ConfidenceBadge } from './components/ConfidenceBadge';
export { ConfidenceBreakdownModal } from './components/ConfidenceBreakdownModal';

// Export hooks
export { useConfidenceScore } from './hooks/useConfidenceScore';
