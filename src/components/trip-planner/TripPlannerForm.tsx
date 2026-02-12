import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationDropdown from './DestinationDropdown';
import BudgetSelector from './BudgetSelector';
import DateRangePicker from './DateRangePicker';
import InterestSelector from './InterestSelector';
import ComprehensiveLoader, { LOADING_STAGES as COMPREHENSIVE_LOADING_STAGES } from '../shared/ComprehensiveLoader';
import { useStageLoading } from '../../hooks/useLoadingStates';
import { useAsyncPerformance } from '../../hooks/usePerformance';
import type { TripPlannerFormData, BudgetLevel, Interest } from '../../types/trip';
import { VALIDATION_RULES } from '../../utils/constants';
import { itineraryService } from '../../services/itineraryService';
import './TripPlannerForm.css';

interface FormErrors {
  destination?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  interests?: string;
  submit?: string;
}

interface FormState {
  destination: string;
  budget: BudgetLevel | '';
  startDate: Date | null;
  endDate: Date | null;
  interests: Interest[];
}

const LOADING_STAGES = [
  'Validating your preferences...',
  'Connecting to our AI travel planner...',
  'Analyzing destinations and activities...',
  'Creating your personalized itinerary...',
  'Finalizing recommendations...'
];

const TripPlannerForm: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FormErrors>({});
  const { measureAsync } = useAsyncPerformance();
  
  const {
    isLoading,
    error: loadingError,
    progress,
    startLoading,
    nextStage,
    finishLoading,
    setError: setLoadingError,
  } = useStageLoading(LOADING_STAGES);
  
  const [formData, setFormData] = useState<FormState>({
    destination: '',
    budget: '',
    startDate: null,
    endDate: null,
    interests: []
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate destination
    if (!formData.destination) {
      newErrors.destination = 'Please select a destination';
    }

    // Validate budget
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget level';
    }

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = 'Please select a departure date';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.startDate < today) {
        newErrors.startDate = 'Departure date cannot be in the past';
      }
    }

    // Validate end date
    if (!formData.endDate) {
      newErrors.endDate = 'Please select a return date';
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'Return date must be after departure date';
    } else if (formData.startDate) {
      const tripDuration = Math.ceil(
        (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (tripDuration < VALIDATION_RULES.MIN_TRIP_DURATION) {
        newErrors.endDate = `Trip must be at least ${VALIDATION_RULES.MIN_TRIP_DURATION} day(s)`;
      } else if (tripDuration > VALIDATION_RULES.MAX_TRIP_DURATION) {
        newErrors.endDate = `Trip cannot exceed ${VALIDATION_RULES.MAX_TRIP_DURATION} days`;
      }
    }

    // Validate interests
    if (!formData.interests || formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    startLoading();
    setErrors({}); // Clear any previous errors
    
    try {
      // Create complete form data
      const completeFormData: TripPlannerFormData = {
        destination: formData.destination,
        budget: formData.budget as BudgetLevel,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        interests: formData.interests
      };

      // Stage 1: Validation complete
      await new Promise(resolve => setTimeout(resolve, 800));
      nextStage();

      // Stage 2: Connecting to API
      await new Promise(resolve => setTimeout(resolve, 600));
      nextStage();

      // Stage 3: Analyzing preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      nextStage();

      // Stage 4: Generate itinerary with performance monitoring
      const response = await measureAsync(
        () => itineraryService.generateItinerary(completeFormData),
        'generateItinerary'
      );
      nextStage();

      // Stage 5: Finalizing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (response.success && response.data) {
        // Store both form data and generated itinerary for the next page
        sessionStorage.setItem('tripPlannerData', JSON.stringify(completeFormData));
        sessionStorage.setItem('generatedItinerary', JSON.stringify(response.data));
        
        finishLoading();
        
        // Navigate to itinerary page with the trip ID
        navigate(`/itinerary/${response.data.tripId}`);
      } else {
        throw new Error('Failed to generate itinerary');
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoadingError('Failed to generate your itinerary. Please check your connection and try again.');
      setErrors({
        submit: 'Failed to generate your itinerary. Please check your connection and try again.'
      });
    }
  };

  const handleReset = () => {
    setFormData({
      destination: '',
      budget: '',
      startDate: null,
      endDate: null,
      interests: []
    });
    setErrors({});
  };

  const handleRetry = () => {
    setLoadingError(null);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="trip-planner-form">
      {isLoading && (
        <ComprehensiveLoader
          isLoading={isLoading}
          stages={[...COMPREHENSIVE_LOADING_STAGES.ITINERARY_GENERATION]}
          progress={progress}
          error={loadingError || undefined}
          onRetry={handleRetry}
          overlay={true}
          size="lg"
          showProgress={true}
          showStageIndicators={true}
          theme="travel"
        />
      )}
      
      <div className="form-header">
        <h1>Plan Your Perfect Trip</h1>
        <p>Tell us about your travel preferences and we'll create a personalized itinerary just for you.</p>
      </div>

      {errors.submit && (
        <div className="error-message submit-error">
          <span className="error-icon">⚠️</span>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <DestinationDropdown
          value={formData.destination}
          onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
          error={errors.destination}
        />

        <BudgetSelector
          value={formData.budget}
          onChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
          error={errors.budget}
        />

        <DateRangePicker
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
          onEndDateChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
          startDateError={errors.startDate}
          endDateError={errors.endDate}
        />

        <InterestSelector
          value={formData.interests}
          onChange={(interests) => setFormData(prev => ({ ...prev, interests }))}
          error={errors.interests}
        />

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn secondary"
            disabled={isLoading}
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner-small"></span>
                Generating Itinerary...
              </>
            ) : (
              <>
                <span>✈️</span>
                Create My Itinerary
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripPlannerForm;