// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const logCustomMetric = (metricName: string, value: number) => {
    console.log(`[Performance] ${componentName}.${metricName}:`, value);
  };

  return { logCustomMetric };
};

// Hook for measuring async operations
export function useAsyncPerformance() {
  const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  };

  return { measureAsync };
}