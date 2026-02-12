// Async operation wrapper with loading states and error handling
import React, { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useLoadingStates } from '@/hooks/useLoadingStates';

interface AsyncWrapperProps {
  children: ReactNode;
  loadingKey: string;
  fallback?: ReactNode;
  errorFallback?: (error: string, retry?: () => void) => ReactNode;
  className?: string;
  minHeight?: string;
  showProgress?: boolean;
}

const AsyncWrapper: React.FC<AsyncWrapperProps> = ({
  children,
  loadingKey,
  fallback,
  errorFallback,
  className = '',
  minHeight = '200px',
}) => {
  const { getState } = useLoadingStates();
  const loadingState = getState(loadingKey);

  const defaultErrorFallback = (error: string, retry?: () => void) => (
    <ErrorMessage
      message={error}
      onRetry={retry}
      className="async-error"
    />
  );

  const defaultLoadingFallback = (
    <LoadingSpinner
      size="md"
      message={loadingState.stage || 'Loading...'}
      className="async-loading"
    />
  );

  if (loadingState.error) {
    return (
      <div className={`async-wrapper error ${className}`} style={{ minHeight }}>
        {errorFallback ? errorFallback(loadingState.error) : defaultErrorFallback(loadingState.error)}
      </div>
    );
  }

  if (loadingState.isLoading) {
    return (
      <div className={`async-wrapper loading ${className}`} style={{ minHeight }}>
        {fallback || defaultLoadingFallback}
      </div>
    );
  }

  return (
    <div className={`async-wrapper loaded ${className}`}>
      {children}
    </div>
  );
};

export default AsyncWrapper;

// Higher-order component for async operations
export function withAsyncWrapper<P extends object>(
  Component: React.ComponentType<P>,
  loadingKey: string,
  options?: {
    fallback?: ReactNode;
    errorFallback?: (error: string, retry?: () => void) => ReactNode;
    minHeight?: string;
    showProgress?: boolean;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <AsyncWrapper
        loadingKey={loadingKey}
        fallback={options?.fallback}
        errorFallback={options?.errorFallback}
        minHeight={options?.minHeight}
        showProgress={options?.showProgress}
      >
        <Component {...props} />
      </AsyncWrapper>
    );
  };
}

// Hook for managing async operations with wrapper
export function useAsyncWrapper(key: string) {
  const { setLoading, setError, clearState, getState } = useLoadingStates();

  const executeAsync = async function<T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      stages?: string[];
      onProgress?: (progress: number, stage?: string) => void;
    }
  ): Promise<T> {
    try {
      setLoading(key, true, options?.loadingMessage);

      if (options?.stages && options.onProgress) {
        for (let i = 0; i < options.stages.length - 1; i++) {
          const progress = ((i + 1) / options.stages.length) * 100;
          options.onProgress(progress, options.stages[i]);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      const result = await operation();
      clearState(key);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(key, errorMessage);
      throw error;
    }
  };

  const retry = () => {
    clearState(key);
  };

  return {
    executeAsync,
    retry,
    state: getState(key),
  };
}