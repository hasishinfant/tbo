// Comprehensive loading state management hook
import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
  stage?: string;
}

interface LoadingStates {
  [key: string]: LoadingState;
}

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const setLoading = useCallback((key: string, loading: boolean, stage?: string, progress?: number) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: loading,
        stage,
        progress,
        error: loading ? null : prev[key]?.error || null,
      },
    }));

    // Clear any existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    // Set a timeout to automatically clear loading state after 30 seconds
    if (loading) {
      timeoutRefs.current[key] = setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            isLoading: false,
            error: 'Operation timed out. Please try again.',
          },
        }));
        delete timeoutRefs.current[key];
      }, 30000);
    }
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error,
      },
    }));

    // Clear timeout if error is set
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  const clearState = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    // Clear timeout
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  const getState = useCallback((key: string): LoadingState => {
    return loadingStates[key] || {
      isLoading: false,
      error: null,
    };
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutRefs.current = {};
  }, []);

  return {
    setLoading,
    setError,
    clearState,
    getState,
    isAnyLoading,
    cleanup,
    loadingStates,
  };
}

// Hook for managing a single loading operation with stages
export function useStageLoading(stages: string[]) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setCurrentStage(0);
    setError(null);
  }, []);

  const nextStage = useCallback(() => {
    setCurrentStage(prev => Math.min(prev + 1, stages.length - 1));
  }, [stages.length]);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
    setCurrentStage(0);
  }, []);

  const setLoadingError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const progress = stages.length > 0 ? ((currentStage + 1) / stages.length) * 100 : 0;
  const currentStageName = stages[currentStage] || '';

  return {
    isLoading,
    error,
    progress,
    currentStage: currentStageName,
    startLoading,
    nextStage,
    finishLoading,
    setError: setLoadingError,
  };
}