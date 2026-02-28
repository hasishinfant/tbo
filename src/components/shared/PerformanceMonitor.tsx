/**
 * Performance Monitor Component
 * 
 * Monitors and displays real-time performance metrics in development mode.
 * Automatically disabled in production.
 */

import React, { useEffect, useState } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls?: number;
  fid?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (import.meta.env.PROD) return;

    // Collect Web Vitals
    onCLS((metric: Metric) => setMetrics(prev => ({ ...prev, cls: metric.value })));
    onFID((metric: Metric) => setMetrics(prev => ({ ...prev, fid: metric.value })));
    onFCP((metric: Metric) => setMetrics(prev => ({ ...prev, fcp: metric.value })));
    onLCP((metric: Metric) => setMetrics(prev => ({ ...prev, lcp: metric.value })));
    onTTFB((metric: Metric) => setMetrics(prev => ({ ...prev, ttfb: metric.value })));
  }, []);

  // Don't render in production
  if (import.meta.env.PROD) return null;

  const getMetricColor = (metric: string, value?: number): string => {
    if (!value) return '#999';
    
    switch (metric) {
      case 'cls':
        return value < 0.1 ? '#0f0' : value < 0.25 ? '#ff0' : '#f00';
      case 'fid':
        return value < 100 ? '#0f0' : value < 300 ? '#ff0' : '#f00';
      case 'fcp':
        return value < 1800 ? '#0f0' : value < 3000 ? '#ff0' : '#f00';
      case 'lcp':
        return value < 2500 ? '#0f0' : value < 4000 ? '#ff0' : '#f00';
      case 'ttfb':
        return value < 800 ? '#0f0' : value < 1800 ? '#ff0' : '#f00';
      default:
        return '#999';
    }
  };

  const formatValue = (value?: number): string => {
    if (!value) return '-';
    return value < 1 ? value.toFixed(3) : Math.round(value).toString();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Web Vitals</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CLS:</span>
          <span style={{ color: getMetricColor('cls', metrics.cls) }}>
            {formatValue(metrics.cls)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>FID:</span>
          <span style={{ color: getMetricColor('fid', metrics.fid) }}>
            {formatValue(metrics.fid)}ms
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>FCP:</span>
          <span style={{ color: getMetricColor('fcp', metrics.fcp) }}>
            {formatValue(metrics.fcp)}ms
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>LCP:</span>
          <span style={{ color: getMetricColor('lcp', metrics.lcp) }}>
            {formatValue(metrics.lcp)}ms
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>TTFB:</span>
          <span style={{ color: getMetricColor('ttfb', metrics.ttfb) }}>
            {formatValue(metrics.ttfb)}ms
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444', fontSize: '10px', color: '#999' }}>
        🟢 Good | 🟡 Needs Improvement | 🔴 Poor
      </div>
    </div>
  );
};

export default PerformanceMonitor;
