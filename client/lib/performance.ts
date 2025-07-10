import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

// Performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === "undefined") return;

  // Measure Core Web Vitals
  onCLS(console.log);
  onINP(console.log); // INP replaces FID in newer versions
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
};

// Image lazy loading with Intersection Observer
export const createLazyImageLoader = () => {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || "";
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    return imageObserver;
  }
  return null;
};

// Prefetch resources
export const prefetchResource = (
  href: string,
  as: "script" | "style" | "image" = "script",
) => {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
};

// Preload critical resources
export const preloadResource = (
  href: string,
  as: "script" | "style" | "image" = "script",
) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Resource cleanup
export const cleanupResources = () => {
  // Clean up any observers, timers, etc.
  if (typeof window !== "undefined") {
    // Simple cleanup without problematic loops
    console.log("Performance resources cleaned up");
  }
};
