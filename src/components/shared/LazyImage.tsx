// Enhanced lazy loading image component with performance optimizations
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformance';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // For above-the-fold images
  sizes?: string; // Responsive image sizes
  srcSet?: string; // Responsive image sources
  blurDataURL?: string; // Base64 blur placeholder
  quality?: number; // Image quality (1-100)
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  className = '',
  onLoad,
  onError,
  priority = false,
  sizes,
  srcSet,
  blurDataURL,
  quality = 75,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const { logCustomMetric } = usePerformanceMonitor('LazyImage');

  // Preload critical images
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (srcSet) link.setAttribute('imagesrcset', srcSet);
      if (sizes) link.setAttribute('imagesizes', sizes);
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [src, srcSet, sizes, priority]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setLoadStartTime(performance.now());
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    
    // Performance monitoring
    if (loadStartTime > 0) {
      const loadTime = performance.now() - loadStartTime;
      logCustomMetric('imageLoadTime', loadTime);
    }
    
    onLoad?.();
  }, [loadStartTime, logCustomMetric, onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    logCustomMetric('imageLoadError', 1);
    onError?.();
  }, [logCustomMetric, onError]);

  // Generate optimized src with quality parameter
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.includes('?')) {
      return `${originalSrc}&q=${quality}`;
    }
    return `${originalSrc}?q=${quality}`;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div className={`lazy-image-container ${className}`} ref={imgRef}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="lazy-image blur-placeholder"
          aria-hidden="true"
          style={{
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Regular placeholder */}
      {!blurDataURL && !isInView && (
        <div className="lazy-image skeleton skeleton-image" aria-hidden="true" />
      )}
      
      {/* Main image */}
      {isInView && (
        <>
          {!isLoaded && !blurDataURL && (
            <div className="lazy-image skeleton skeleton-image" aria-hidden="true" />
          )}
          <img
            src={hasError ? placeholder : optimizedSrc}
            srcSet={hasError ? undefined : srcSet}
            sizes={sizes}
            alt={alt}
            className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
              willChange: isLoaded ? 'auto' : 'opacity',
            }}
          />
        </>
      )}
      
      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="lazy-image-loading">
          <div className="loading-spinner-small" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="lazy-image-error">
          <span>⚠️</span>
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;