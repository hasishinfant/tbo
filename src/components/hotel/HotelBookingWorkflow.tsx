/**
 * Hotel Booking Workflow Component
 * 
 * Multi-step workflow container for hotel booking process.
 * Manages step navigation, progress indication, and validation.
 * 
 * Workflow: Search → Details → PreBook → Guest Details → Payment → Confirmation
 * 
 * Requirements: All workflow requirements
 */

import React, { useState, useEffect } from 'react';
import { hotelBookingService, HotelBookingSession } from '../../services/hotelBookingService';
import './HotelBookingWorkflow.css';

// ============================================================================
// Types
// ============================================================================

export type WorkflowStep = 'details' | 'prebook' | 'guest_details' | 'payment' | 'confirmed';

interface HotelBookingWorkflowProps {
  session: HotelBookingSession;
  onComplete?: (confirmationNumber: string) => void;
  onCancel?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const HotelBookingWorkflow: React.FC<HotelBookingWorkflowProps> = ({
  session: initialSession,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(() => {
    // Initialize from session status, ensuring it's a valid WorkflowStep
    const status = initialSession.status;
    if (status === 'search') return 'details';
    return status as WorkflowStep;
  });
  const [session, setSession] = useState<HotelBookingSession>(initialSession);

  // Restore session on mount
  useEffect(() => {
    const restoredSession = hotelBookingService.getCurrentSession();
    if (restoredSession) {
      setSession(restoredSession);
      const status = restoredSession.status;
      if (status === 'search') {
        setCurrentStep('details');
      } else {
        setCurrentStep(status as WorkflowStep);
      }
    }
  }, []);

  // Update session when step changes
  useEffect(() => {
    try {
      hotelBookingService.updateSession({ status: currentStep });
    } catch (error) {
      // Session might not exist or be expired
      console.error('Failed to update session:', error);
    }
  }, [currentStep]);

  const steps: { key: WorkflowStep; label: string }[] = [
    { key: 'details', label: 'Hotel Details' },
    { key: 'prebook', label: 'Verify Pricing' },
    { key: 'guest_details', label: 'Guest Details' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmed', label: 'Confirmation' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleCancel = () => {
    hotelBookingService.cancelSession();
    onCancel?.();
  };

  const handleStepComplete = (stepData?: any) => {
    if (stepData) {
      hotelBookingService.updateSession(stepData);
      const updatedSession = hotelBookingService.getCurrentSession();
      if (updatedSession) {
        setSession(updatedSession);
      }
    }
    handleNext();
  };

  return (
    <div className="hotel-booking-workflow">
      {/* Progress Indicator */}
      <div className="workflow-progress">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`progress-step ${
                index < currentStepIndex
                  ? 'completed'
                  : index === currentStepIndex
                  ? 'active'
                  : 'pending'
              }`}
            >
              <div className="step-indicator">
                {index < currentStepIndex ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <div className="step-label">{step.label}</div>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="workflow-content">
        {/* Placeholder for step components - will be replaced with actual components */}
        <div className="step-placeholder">
          <h3>Step: {steps[currentStepIndex].label}</h3>
          <p>Current step: {currentStep}</p>
          <p>Hotel: {session.hotel.HotelName}</p>
          <p>Check-in: {session.searchCriteria.checkIn.toLocaleDateString()}</p>
          <p>Check-out: {session.searchCriteria.checkOut.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="workflow-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="btn-cancel"
        >
          Cancel Booking
        </button>
        
        <div className="workflow-nav-buttons">
          {currentStepIndex > 0 && currentStep !== 'confirmed' && (
            <button
              type="button"
              onClick={handleBack}
              className="btn-back"
            >
              Back
            </button>
          )}
          
          {currentStep !== 'confirmed' && (
            <button
              type="button"
              onClick={handleNext}
              className="btn-next"
            >
              {currentStepIndex === steps.length - 2 ? 'Complete Booking' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelBookingWorkflow;
