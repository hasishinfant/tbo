// Performance monitoring and optimization service
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'loading' | 'interaction' | 'navigation' | 'api' | 'render';
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  pageLoad: number;
  apiResponse: number;
  imageLoad: number;
  componentRender: number;
  interaction: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    pageLoad: 3000, // 3 seconds
    apiResponse: 2000, // 2 seconds
    imageLoad: 1500, // 1.5 seconds
    componentRender: 100, // 100ms
    interaction: 50, // 50ms
  };

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              name: 'page_load_complete',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              timestamp: Date.now(),
              category: 'loading',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint: navEntry.responseEnd - navEntry.fetchStart,
              },
            });
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric({
              name: 'resource_load',
              value: resourceEntry.responseEnd - resourceEntry.startTime,
              timestamp: Date.now(),
              category: 'loading',
              metadata: {
                name: resourceEntry.name,
                type: this.getResourceType(resourceEntry.name),
                size: resourceEntry.transferSize,
              },
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'largest_contentful_paint',
            value: entry.startTime,
            timestamp: Date.now(),
            category: 'render',
            metadata: {
              element: (entry as any).element?.tagName,
            },
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // Type assertion for first-input entries
          this.recordMetric({
            name: 'first_input_delay',
            value: fidEntry.processingStart - fidEntry.startTime,
            timestamp: Date.now(),
            category: 'interaction',
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

    } catch (error) {
      console.warn('Performance observers not supported:', error);
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(js|mjs)$/i)) return 'script';
    if (url.match(/\.css$/i)) return 'stylesheet';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Check thresholds and warn if exceeded
    this.checkThresholds(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`, metric.metadata);
    }
  }

  private checkThresholds(metric: PerformanceMetric) {
    let threshold: number | undefined;
    
    switch (metric.name) {
      case 'page_load_complete':
        threshold = this.thresholds.pageLoad;
        break;
      case 'api_response':
        threshold = this.thresholds.apiResponse;
        break;
      case 'image_load':
        threshold = this.thresholds.imageLoad;
        break;
      case 'component_render':
        threshold = this.thresholds.componentRender;
        break;
      case 'user_interaction':
        threshold = this.thresholds.interaction;
        break;
    }

    if (threshold && metric.value > threshold) {
      console.warn(`[Performance Warning] ${metric.name} exceeded threshold: ${metric.value}ms > ${threshold}ms`);
    }
  }

  // Public methods for recording custom metrics
  recordApiCall(name: string, duration: number, metadata?: Record<string, any>) {
    this.recordMetric({
      name: 'api_response',
      value: duration,
      timestamp: Date.now(),
      category: 'api',
      metadata: { endpoint: name, ...metadata },
    });
  }

  recordComponentRender(componentName: string, duration: number) {
    this.recordMetric({
      name: 'component_render',
      value: duration,
      timestamp: Date.now(),
      category: 'render',
      metadata: { component: componentName },
    });
  }

  recordImageLoad(src: string, duration: number) {
    this.recordMetric({
      name: 'image_load',
      value: duration,
      timestamp: Date.now(),
      category: 'loading',
      metadata: { src },
    });
  }

  recordUserInteraction(action: string, duration: number) {
    this.recordMetric({
      name: 'user_interaction',
      value: duration,
      timestamp: Date.now(),
      category: 'interaction',
      metadata: { action },
    });
  }

  recordNavigation(from: string, to: string, duration: number) {
    this.recordMetric({
      name: 'navigation',
      value: duration,
      timestamp: Date.now(),
      category: 'navigation',
      metadata: { from, to },
    });
  }

  // Get performance insights
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(m => m.category === category);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  getPerformanceReport(): {
    summary: Record<string, number>;
    slowestOperations: PerformanceMetric[];
    recommendations: string[];
  } {
    const summary = {
      avgPageLoad: this.getAverageMetric('page_load_complete'),
      avgApiResponse: this.getAverageMetric('api_response'),
      avgImageLoad: this.getAverageMetric('image_load'),
      avgComponentRender: this.getAverageMetric('component_render'),
      totalMetrics: this.metrics.length,
    };

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const recommendations: string[] = [];
    
    if (summary.avgPageLoad > this.thresholds.pageLoad) {
      recommendations.push('Consider implementing code splitting and lazy loading');
    }
    
    if (summary.avgApiResponse > this.thresholds.apiResponse) {
      recommendations.push('Optimize API responses and implement caching');
    }
    
    if (summary.avgImageLoad > this.thresholds.imageLoad) {
      recommendations.push('Implement image optimization and lazy loading');
    }

    return { summary, slowestOperations, recommendations };
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Singleton instance
export const performanceService = new PerformanceService();

// Hook for using performance service in components
export function usePerformanceTracking() {
  const trackApiCall = (name: string, duration: number, metadata?: Record<string, any>) => {
    performanceService.recordApiCall(name, duration, metadata);
  };

  const trackComponentRender = (componentName: string, duration: number) => {
    performanceService.recordComponentRender(componentName, duration);
  };

  const trackImageLoad = (src: string, duration: number) => {
    performanceService.recordImageLoad(src, duration);
  };

  const trackUserInteraction = (action: string, duration: number) => {
    performanceService.recordUserInteraction(action, duration);
  };

  const trackNavigation = (from: string, to: string, duration: number) => {
    performanceService.recordNavigation(from, to, duration);
  };

  return {
    trackApiCall,
    trackComponentRender,
    trackImageLoad,
    trackUserInteraction,
    trackNavigation,
    getReport: () => performanceService.getPerformanceReport(),
  };
}