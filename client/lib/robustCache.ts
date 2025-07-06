// Robust caching system for performance optimization

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number;
  persistToStorage: boolean;
  storageKey: string;
}

export class RobustCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private accessStats: Map<string, number> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      persistToStorage: true,
      storageKey: "robust-cache",
      ...config,
    };

    this.initializeCache();
    this.startCleanupTimer();
  }

  private initializeCache() {
    if (this.config.persistToStorage && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          const parsedCache = JSON.parse(stored);
          Object.entries(parsedCache).forEach(([key, entry]) => {
            const cacheEntry = entry as CacheEntry<T>;
            if (cacheEntry.expiry > Date.now()) {
              this.cache.set(key, cacheEntry);
            }
          });
        }
      } catch (error) {
        console.warn("Failed to load cache from storage:", error);
      }
    }
  }

  private persistCache() {
    if (this.config.persistToStorage && typeof window !== "undefined") {
      try {
        const cacheObject = Object.fromEntries(this.cache.entries());
        localStorage.setItem(
          this.config.storageKey,
          JSON.stringify(cacheObject),
        );
      } catch (error) {
        console.warn("Failed to persist cache to storage:", error);
      }
    }
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    // If still over max size, remove least recently used entries
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => {
          // Sort by priority first, then by last accessed time
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.lastAccessed - b.lastAccessed;
        },
      );

      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        const [key] = sortedEntries[i];
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.persistCache();
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} entries`);
    }
  }

  set(
    key: string,
    data: T,
    options: {
      ttl?: number;
      priority?: number;
    } = {},
  ): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + (options.ttl || this.config.defaultTTL),
      accessCount: 0,
      lastAccessed: now,
      priority: options.priority || 1,
    };

    this.cache.set(key, entry);
    this.persistCache();

    // Track access patterns
    this.accessStats.set(key, (this.accessStats.get(key) || 0) + 1);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (entry.expiry <= now) {
      this.cache.delete(key);
      this.persistCache();
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.accessStats.set(key, (this.accessStats.get(key) || 0) + 1);

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      this.persistCache();
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessStats.delete(key);
      this.persistCache();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessStats.clear();
    this.persistCache();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge:
        entries.reduce((acc, [, entry]) => acc + (now - entry.timestamp), 0) /
          entries.length || 0,
      mostAccessed: this.getMostAccessedKeys(5),
      oldestEntry: entries.reduce(
        (oldest, [key, entry]) =>
          !oldest || entry.timestamp < oldest.timestamp
            ? { key, timestamp: entry.timestamp }
            : oldest,
        null as { key: string; timestamp: number } | null,
      ),
    };
  }

  private calculateHitRate(): number {
    // This is a simplified hit rate calculation
    // In a real implementation, you'd track hits/misses
    const totalAccesses = Array.from(this.accessStats.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    return totalAccesses > 0 ? (this.cache.size / totalAccesses) * 100 : 0;
  }

  private getMostAccessedKeys(
    limit: number,
  ): Array<{ key: string; count: number }> {
    return Array.from(this.accessStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  }

  // Preload data with intelligent prioritization
  preload(
    requests: Array<{
      key: string;
      dataLoader: () => Promise<T>;
      priority?: number;
      ttl?: number;
    }>,
  ): Promise<void[]> {
    const sortedRequests = requests.sort(
      (a, b) => (b.priority || 1) - (a.priority || 1),
    );

    return Promise.all(
      sortedRequests.map(async ({ key, dataLoader, priority, ttl }) => {
        if (!this.has(key)) {
          try {
            const data = await dataLoader();
            this.set(key, data, { priority, ttl });
          } catch (error) {
            console.warn(`Failed to preload cache key "${key}":`, error);
          }
        }
      }),
    );
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: RegExp): number {
    let invalidatedCount = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  // Refresh expired entries in background
  async refreshExpired<K extends string>(
    refreshers: Record<K, () => Promise<T>>,
  ): Promise<void> {
    const now = Date.now();
    const refreshPromises: Promise<void>[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const timeUntilExpiry = entry.expiry - now;

      // Refresh if expired or will expire soon (25% of TTL remaining)
      const refreshThreshold = (entry.expiry - entry.timestamp) * 0.25;

      if (timeUntilExpiry <= refreshThreshold && refreshers[key as K]) {
        refreshPromises.push(
          refreshers[key as K]()
            .then((data) => {
              this.set(key, data, { priority: entry.priority });
            })
            .catch((error) => {
              console.warn(`Failed to refresh cache key "${key}":`, error);
            }),
        );
      }
    }

    await Promise.all(refreshPromises);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Global cache instances
export const componentCache = new RobustCache({
  maxSize: 30,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  storageKey: "component-cache",
});

export const dataCache = new RobustCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  storageKey: "data-cache",
});

export const imageCache = new RobustCache({
  maxSize: 200,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  storageKey: "image-cache",
});

// Cache-aware fetch function
export const cachedFetch = async <T>(
  url: string,
  options: RequestInit & {
    cacheKey?: string;
    cacheTTL?: number;
    bypassCache?: boolean;
  } = {},
): Promise<T> => {
  const {
    cacheKey = url,
    cacheTTL,
    bypassCache = false,
    ...fetchOptions
  } = options;

  // Check cache first
  if (!bypassCache) {
    const cached = dataCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from network
  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    dataCache.set(cacheKey, data, { ttl: cacheTTL });

    return data;
  } catch (error) {
    // Return stale cache data if available
    const staleData = dataCache.get(cacheKey);
    if (staleData) {
      console.warn("Using stale cache data due to fetch error:", error);
      return staleData;
    }

    throw error;
  }
};

// React hook for cached data
export const useCachedData = <T>(
  key: string,
  dataLoader: () => Promise<T>,
  options: {
    ttl?: number;
    refreshOnMount?: boolean;
    refreshInterval?: number;
  } = {},
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypassCache = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!bypassCache) {
        const cached = dataCache.get(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      const result = await dataLoader();
      dataCache.set(key, result, { ttl: options.ttl });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));

      // Try to use stale cache data
      const staleData = dataCache.get(key);
      if (staleData) {
        setData(staleData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.refreshOnMount !== false) {
      loadData();
    }
  }, [key]);

  useEffect(() => {
    if (options.refreshInterval) {
      const interval = setInterval(() => {
        loadData(true); // Bypass cache for refresh
      }, options.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [options.refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: () => loadData(true),
    cached: dataCache.has(key),
  };
};

export default RobustCache;
