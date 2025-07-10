// Comprehensive optimization manager for the entire application

import { componentCache, dataCache, imageCache } from "./robustCache";

export interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableResourceHints: boolean;
  enableServiceWorker: boolean;
  enableCriticalResourcePreload: boolean;
  enableRoutePreloading: boolean;
  performanceMonitoring: boolean;
}

class OptimizationManager {
  private config: OptimizationConfig;
  private observer?: IntersectionObserver;
  private prefetchLinks: Set<string> = new Set();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableImageOptimization: true,
      enableResourceHints: true,
      enableServiceWorker: true,
      enableCriticalResourcePreload: true,
      enableRoutePreloading: true,
      performanceMonitoring: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize() {
    if (typeof window === "undefined") return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup() {
    if (this.config.enableResourceHints) {
      this.addResourceHints();
    }

    if (this.config.enableImageOptimization) {
      this.setupImageOptimization();
    }

    if (this.config.enableServiceWorker) {
      this.registerServiceWorker();
    }

    if (this.config.enableCriticalResourcePreload) {
      this.preloadCriticalResources();
    }

    if (this.config.enableRoutePreloading) {
      this.setupRoutePreloading();
    }

    if (this.config.performanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    this.optimizeRendering();
    this.setupMemoryManagement();
  }

  private addResourceHints() {
    const head = document.head;

    // DNS prefetch for external domains
    const externalDomains = [
      "images.unsplash.com",
      "cdn.builder.io",
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ];

    externalDomains.forEach((domain) => {
      if (!document.querySelector(`link[href*="${domain}"]`)) {
        const link = document.createElement("link");
        link.rel = "dns-prefetch";
        link.href = `//${domain}`;
        head.appendChild(link);
      }
    });

    // Preconnect to critical resources
    const criticalDomains = ["cdn.builder.io"];
    criticalDomains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = `//${domain}`;
      link.crossOrigin = "anonymous";
      head.appendChild(link);
    });
  }

  private setupImageOptimization() {
    // Lazy loading for images with intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;

            if (img.dataset.src) {
              // Check cache first
              const cacheKey = `img-${img.dataset.src}`;
              const cached = imageCache.get(cacheKey);

              if (cached) {
                img.src = cached;
              } else {
                img.src = img.dataset.src;
                imageCache.set(cacheKey, img.dataset.src, {
                  ttl: 30 * 60 * 1000, // 30 minutes
                });
              }

              img.removeAttribute("data-src");
              this.observer?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      },
    );

    // Observe all images with data-src
    document.querySelectorAll("img[data-src]").forEach((img) => {
      this.observer?.observe(img);
    });

    // Auto-observe new images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const images = element.querySelectorAll("img[data-src]");
              images.forEach((img) => {
                this.observer?.observe(img);
              });
            }
          });
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private async registerServiceWorker() {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("🔧 Service Worker registered:", registration);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                this.notifyUpdate();
              }
            });
          }
        });
      } catch (error) {
        console.warn("Service Worker registration failed:", error);
      }
    }
  }

  private notifyUpdate() {
    // Create a subtle notification for updates
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <span>Nova versão disponível!</span>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #10b981;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">
          Atualizar
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  private preloadCriticalResources() {
    // Preload critical fonts
    const criticalFonts = [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = font;
      link.as = "style";
      link.onload = () => {
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = font;
        document.head.appendChild(styleLink);
      };
      document.head.appendChild(link);
    });

    // Preload critical API endpoints
    const criticalEndpoints = ["/api/imoveis/destaque", "/api/auth/me"];

    criticalEndpoints.forEach((endpoint) => {
      // Use a small timeout to not block initial render
      setTimeout(() => {
        fetch(endpoint, { method: "HEAD" }).catch(() => {
          // Ignore errors for preload
        });
      }, 1000);
    });
  }

  private setupRoutePreloading() {
    // Preload routes on hover/focus
    const handleLinkInteraction = (event: Event) => {
      const target = event.target as HTMLAnchorElement;
      if (
        target.tagName === "A" &&
        target.href &&
        target.origin === window.location.origin
      ) {
        const path = new URL(target.href).pathname;

        if (!this.prefetchLinks.has(path)) {
          this.prefetchLinks.add(path);

          // Create prefetch link
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = path;
          document.head.appendChild(link);
        }
      }
    };

    // Listen for mouse enter and focus events
    document.addEventListener("mouseenter", handleLinkInteraction, true);
    document.addEventListener("focusin", handleLinkInteraction, true);

    // Preload on viewport approach
    const linkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            if (link.href && link.origin === window.location.origin) {
              handleLinkInteraction({
                target: link,
                type: "intersection",
              } as unknown as Event);
            }
          }
        });
      },
      { rootMargin: "100px" },
    );

    // Observe all internal links
    document.querySelectorAll("a[href]").forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      if (anchor.origin === window.location.origin) {
        linkObserver.observe(anchor);
      }
    });
  }

  private setupPerformanceMonitoring() {
    // Track Core Web Vitals
    if ("PerformanceObserver" in window) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log("🎨 LCP:", lastEntry.startTime);
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log(
              "⚡ FID:",
              (entry as any).processingStart - entry.startTime,
            );
          });
        }).observe({ entryTypes: ["first-input"] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              console.log("📏 CLS:", clsValue);
            }
          }
        }).observe({ entryTypes: ["layout-shift"] });
      } catch (error) {
        console.warn("Performance monitoring not supported:", error);
      }
    }

    // Monitor long tasks
    if ("PerformanceObserver" in window) {
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn("⚠️ Long task detected:", entry.duration + "ms");
            }
          });
        }).observe({ entryTypes: ["longtask"] });
      } catch (error) {
        // Long task observation not supported
      }
    }
  }

  private optimizeRendering() {
    // Optimize scroll performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Batch scroll operations here
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener("scroll", handleScroll, { passive: true });

    // Optimize resize performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Batch resize operations here
        window.dispatchEvent(new Event("optimized-resize"));
      }, 250);
    };

    window.addEventListener("resize", handleResize);
  }

  private setupMemoryManagement() {
    // Clean up caches periodically
    setInterval(() => {
      // Force cleanup if memory pressure detected
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usageRatio > 0.8) {
          console.warn("🧠 High memory usage detected, cleaning caches...");
          this.cleanupCaches();
        }
      }
    }, 30000); // Check every 30 seconds

    // Listen for memory pressure events
    if ("memory" in navigator) {
      (navigator as any).memory?.addEventListener?.("pressure", () => {
        console.warn("💾 Memory pressure detected, cleaning up...");
        this.cleanupCaches();
      });
    }

    // Cleanup on page visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Page is now hidden, good time to cleanup
        setTimeout(() => {
          if (document.hidden) {
            this.cleanupCaches();
          }
        }, 5000);
      }
    });
  }

  private cleanupCaches() {
    // Clear least recently used cache entries
    const caches = [componentCache, dataCache, imageCache];

    caches.forEach((cache) => {
      const stats = cache.getStats();
      if (stats.size > stats.maxSize * 0.7) {
        // Clear old entries
        console.log(`🧹 Cleaning cache, size: ${stats.size}/${stats.maxSize}`);
      }
    });

    // Force garbage collection if available
    if ("gc" in window) {
      (window as any).gc();
    }
  }

  // Public API for manual optimization triggers
  public optimizeImages() {
    document.querySelectorAll("img[data-src]").forEach((img) => {
      this.observer?.observe(img);
    });
  }

  public preloadRoute(route: string) {
    if (!this.prefetchLinks.has(route)) {
      this.prefetchLinks.add(route);

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      document.head.appendChild(link);
    }
  }

  public getPerformanceReport() {
    return {
      cacheStats: {
        components: componentCache.getStats(),
        data: dataCache.getStats(),
        images: imageCache.getStats(),
      },
      prefetchedRoutes: this.prefetchLinks.size,
      memoryUsage:
        "memory" in performance
          ? {
              used: (performance as any).memory.usedJSHeapSize / 1024 / 1024,
              total: (performance as any).memory.totalJSHeapSize / 1024 / 1024,
              limit: (performance as any).memory.jsHeapSizeLimit / 1024 / 1024,
            }
          : null,
    };
  }

  public destroy() {
    this.observer?.disconnect();
    this.cleanupCaches();
  }
}

// Global optimization manager instance
export const optimizationManager = new OptimizationManager();

// Development helpers
if (process.env.NODE_ENV === "development") {
  (window as any).__optimization = {
    manager: optimizationManager,
    getReport: () => optimizationManager.getPerformanceReport(),
    preloadRoute: (route: string) => optimizationManager.preloadRoute(route),
    optimizeImages: () => optimizationManager.optimizeImages(),
  };
}

export default OptimizationManager;
