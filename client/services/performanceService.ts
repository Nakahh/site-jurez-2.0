// Performance Analytics and Monitoring Service

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;
  private isMonitoring = false;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === "undefined" || this.isMonitoring) return;

    try {
      // Monitor Long Tasks
      if ("PerformanceObserver" in window) {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });

        // Observe different types of performance entries
        const observeTypes = [
          "navigation",
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
          "longtask",
          "resource",
        ];

        observeTypes.forEach((type) => {
          try {
            this.observer?.observe({ entryTypes: [type] });
          } catch (e) {
            // Some entry types might not be supported
            console.warn(`Performance observer type '${type}' not supported`);
          }
        });
      }

      // Monitor memory usage
      this.monitorMemoryUsage();

      // Monitor network conditions
      this.monitorNetworkConditions();

      // Monitor FPS
      this.monitorFPS();

      this.isMonitoring = true;
    } catch (error) {
      console.warn("Failed to initialize performance monitoring:", error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.duration || 0,
      timestamp: entry.startTime,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);

    // Process specific entry types
    switch (entry.entryType) {
      case "navigation":
        this.processNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case "paint":
        this.processPaintTiming(entry);
        break;
      case "largest-contentful-paint":
        this.processLCPTiming(entry);
        break;
      case "first-input":
        this.processFIDTiming(entry);
        break;
      case "layout-shift":
        this.processCLSTiming(entry as PerformanceEntry & { value: number });
        break;
      case "longtask":
        this.processLongTask(entry);
        break;
      case "resource":
        this.processResourceTiming(entry as PerformanceResourceTiming);
        break;
    }

    // Keep only recent metrics (last 100)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private processNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      DNS: entry.domainLookupEnd - entry.domainLookupStart,
      TCP: entry.connectEnd - entry.connectStart,
      SSL: entry.connectEnd - entry.secureConnectionStart,
      TTFB: entry.responseStart - entry.requestStart,
      Download: entry.responseEnd - entry.responseStart,
      DOMParsing: entry.domInteractive - entry.responseEnd,
      DOMReady:
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      LoadComplete: entry.loadEventEnd - entry.loadEventStart,
    };

    this.sendMetric("navigation_timing", metrics);
  }

  private processPaintTiming(entry: PerformanceEntry) {
    if (entry.name === "first-paint") {
      this.sendMetric("first_paint", { value: entry.startTime });
    } else if (entry.name === "first-contentful-paint") {
      this.sendMetric("first_contentful_paint", { value: entry.startTime });
    }
  }

  private processLCPTiming(entry: PerformanceEntry) {
    this.sendMetric("largest_contentful_paint", { value: entry.startTime });
  }

  private processFIDTiming(entry: PerformanceEntry) {
    this.sendMetric("first_input_delay", {
      value: entry.duration,
      startTime: entry.startTime,
    });
  }

  private processCLSTiming(entry: PerformanceEntry & { value: number }) {
    this.sendMetric("cumulative_layout_shift", { value: entry.value });
  }

  private processLongTask(entry: PerformanceEntry) {
    if (entry.duration > 50) {
      // Tasks longer than 50ms
      this.sendMetric("long_task", {
        duration: entry.duration,
        startTime: entry.startTime,
      });
    }
  }

  private processResourceTiming(entry: PerformanceResourceTiming) {
    const resourceData: ResourceTiming = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
    };

    // Track slow resources
    if (entry.duration > 1000) {
      this.sendMetric("slow_resource", resourceData);
    }

    // Track large resources
    if (entry.transferSize > 1024 * 1024) {
      // > 1MB
      this.sendMetric("large_resource", resourceData);
    }
  }

  private monitorMemoryUsage() {
    if (
      "memory" in performance &&
      typeof (performance as any).memory === "object"
    ) {
      const memory = (performance as any).memory;
      setInterval(() => {
        this.sendMetric("memory_usage", {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }, 30000); // Every 30 seconds
    }
  }

  private monitorNetworkConditions() {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      this.sendMetric("network_conditions", {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });

      connection.addEventListener("change", () => {
        this.sendMetric("network_change", {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      });
    }
  }

  private monitorFPS() {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let totalFrameTime = 0;

    const measureFPS = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      frameCount++;
      totalFrameTime += frameTime;

      // Report FPS every second
      if (frameCount >= 60) {
        const avgFrameTime = totalFrameTime / frameCount;
        const fps = 1000 / avgFrameTime;

        this.sendMetric("fps", { value: fps });

        frameCount = 0;
        totalFrameTime = 0;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private sendMetric(name: string, data: any) {
    const metric = {
      name,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Store locally for now (could be sent to analytics service)
    this.storeMetric(metric);

    // Optional: Send to analytics service
    if (process.env.NODE_ENV === "production") {
      this.sendToAnalytics(metric);
    }
  }

  private storeMetric(metric: any) {
    try {
      const metrics = JSON.parse(
        localStorage.getItem("performance_metrics") || "[]",
      );
      metrics.push(metric);

      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50);
      }

      localStorage.setItem("performance_metrics", JSON.stringify(metrics));
    } catch (error) {
      console.warn("Failed to store performance metric:", error);
    }
  }

  private async sendToAnalytics(metric: any) {
    try {
      // Replace with your analytics endpoint
      await fetch("/api/analytics/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      // Silently fail for analytics
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getStoredMetrics(): any[] {
    try {
      return JSON.parse(localStorage.getItem("performance_metrics") || "[]");
    } catch {
      return [];
    }
  }

  public clearMetrics() {
    this.metrics = [];
    localStorage.removeItem("performance_metrics");
  }

  public startCustomTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.sendMetric("custom_timer", {
        name,
        duration: endTime - startTime,
      });
    };
  }

  public markFeatureUsage(feature: string, metadata: any = {}) {
    this.sendMetric("feature_usage", {
      feature,
      metadata,
    });
  }

  public reportError(error: Error, context: string = "") {
    this.sendMetric("javascript_error", {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
  }
}

// Singleton instance
export const performanceService = new PerformanceService();

// Export for use in components
export default performanceService;
