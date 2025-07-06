import { useEffect, useRef, useState } from "react";
import React from "react";

export interface PerformanceMetrics {
  pageLoadTime: number;
  componentMountTime: number;
  renderCount: number;
  memoryUsage?: number;
  connectionType?: string;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
}

export interface PerformanceOptions {
  trackMemory?: boolean;
  trackNetwork?: boolean;
  trackVitals?: boolean;
  reportInterval?: number;
}

export const useAdvancedPerformance = (
  componentName: string,
  options: PerformanceOptions = {}
) => {
  const {
    trackMemory = false,
    trackNetwork = false,
    trackVitals = true,
    reportInterval = 30000, // 30 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    componentMountTime: 0,
    renderCount: 0,
    timeToInteractive: 0,
    cumulativeLayoutShift: 0,
  });

  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const reportIntervalRef = useRef<NodeJS.Timeout>();

  // Track component mount time
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    setMetrics((prev) => ({
      ...prev,
      componentMountTime: mountTime,
    }));
  }, []);

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
    setMetrics((prev) => ({
      ...prev,
      renderCount: renderCountRef.current,
    }));
  });

  // Track page load performance
  useEffect(() => {
    const getPageLoadMetrics = () => {
      if (typeof window !== "undefined" && window.performance) {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          setMetrics((prev) => ({
            ...prev,
            pageLoadTime,
          }));
        }
      }
    };

    // Wait for page to fully load
    if (document.readyState === "complete") {
      getPageLoadMetrics();
    } else {
      window.addEventListener("load", getPageLoadMetrics);
      return () => window.removeEventListener("load", getPageLoadMetrics);
    }
  }, []);

  // Track Web Vitals if requested
  useEffect(() => {
    if (!trackVitals || typeof window === "undefined") return;

    let clsValue = 0;
    let ttiValue = 0;

    // Cumulative Layout Shift tracking
    if ("PerformanceObserver" in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setMetrics((prev) => ({
            ...prev,
            cumulativeLayoutShift: clsValue,
          }));
        });

        clsObserver.observe({ entryTypes: ["layout-shift"] });

        // Time to Interactive approximation
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length === 0 && ttiValue === 0) {
            ttiValue = performance.now();
            setMetrics((prev) => ({
              ...prev,
              timeToInteractive: ttiValue,
            }));
          }
        });

        longTaskObserver.observe({ entryTypes: ["longtask"] });

        return () => {
          clsObserver.disconnect();
          longTaskObserver.disconnect();
        };
      } catch (error) {
        console.warn("Performance Observer not supported:", error);
      }
    }
  }, [trackVitals]);

  // Track memory usage if requested
  useEffect(() => {
    if (!trackMemory || typeof window === "undefined") return;

    const updateMemoryUsage = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };

        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memoryUsage.used / 1024 / 1024, // MB
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, [trackMemory]);

  // Track network information if requested
  useEffect(() => {
    if (!trackNetwork || typeof window === "undefined") return;

    const updateNetworkInfo = () => {
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        setMetrics((prev) => ({
          ...prev,
          connectionType: connection.effectiveType || "unknown",
        }));
      }
    };

    updateNetworkInfo();
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", updateNetworkInfo);

      return () =>
        connection.removeEventListener("change", updateNetworkInfo);
    }
  }, [trackNetwork]);

  // Periodic reporting
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      reportIntervalRef.current = setInterval(() => {
        console.group(`🔍 Performance Report - ${componentName}`);
        console.log("📊 Metrics:", metrics);
        console.log("⏱️ Component Mount Time:", `${metrics.componentMountTime}ms`);
        console.log("🔄 Render Count:", metrics.renderCount);
        console.log("📄 Page Load Time:", `${metrics.pageLoadTime}ms`);
        if (metrics.memoryUsage) {
          console.log("💾 Memory Usage:", `${metrics.memoryUsage.toFixed(2)} MB`);
        }
        if (metrics.connectionType) {
          console.log("🌐 Connection Type:", metrics.connectionType);
        }
        console.log("⚡ Time to Interactive:", `${metrics.timeToInteractive}ms`);
        console.log("📏 Cumulative Layout Shift:", metrics.cumulativeLayoutShift.toFixed(4));
        console.groupEnd();
      }, reportInterval);

      return () => {
        if (reportIntervalRef.current) {
          clearInterval(reportIntervalRef.current);
        }
      };
    }
  }, [componentName, metrics, reportInterval]);

  // Performance warnings
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (metrics.componentMountTime > 1000) {
        console.warn(
          `⚠️ Slow component mount detected in ${componentName}: ${metrics.componentMountTime}ms`
        );
      }

      if (metrics.renderCount > 10) {
        console.warn(
          `⚠️ High render count detected in ${componentName}: ${metrics.renderCount} renders`
        );
      }

      if (metrics.memoryUsage && metrics.memoryUsage > 50) {
        console.warn(
          `⚠️ High memory usage detected in ${componentName}: ${metrics.memoryUsage.toFixed(2)} MB`
        );
      }

      if (metrics.cumulativeLayoutShift > 0.1) {
        console.warn(
          `⚠️ High Cumulative Layout Shift detected in ${componentName}: ${metrics.cumulativeLayoutShift.toFixed(4)}`
        );
      }
    }
  }, [componentName, metrics]);

  return {
    metrics,
    reportMetrics: () => {
      if (process.env.NODE_ENV === "production") {
        // In production, send to analytics service
        // Example: analytics.track('performance_metrics', { componentName, ...metrics });
      }
      return metrics;
    },
    resetMetrics: () => {
      renderCountRef.current = 0;
      mountTimeRef.current = Date.now();
      setMetrics({
        pageLoadTime: 0,
        componentMountTime: 0,
        renderCount: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0,
      });
    },
  };
};

// Higher-order component for automatic performance tracking
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  options?: PerformanceOptions
) => {
  return function PerformanceTrackedComponent(props: P) {
    useAdvancedPerformance(componentName, options);
    return <Component {...props} />;
  };
};

// Hook for tracking specific actions/events
export const useActionTracking = () => {
  const trackAction = (actionName: string, metadata?: Record<string, any>) => {
    const timestamp = Date.now();
    const performanceEntry = {
      name: actionName,
      timestamp,
      metadata,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (process.env.NODE_ENV === "development") {
      console.log(`🎯 Action tracked: ${actionName}`, performanceEntry);
    }

    // In production, send to analytics
    // analytics.track('user_action', performanceEntry);
  };

  return { trackAction };
};

export default useAdvancedPerformance;