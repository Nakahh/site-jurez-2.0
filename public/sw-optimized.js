// Optimized Service Worker for Performance
const CACHE_NAME = "siqueira-imoveis-v2";
const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v2";
const IMAGE_CACHE = "images-v2";

// Resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/global.css",
  "/animations.css",
  "/manifest.json",
  // Critical chunks will be added dynamically
];

// Image optimization patterns
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const API_ENDPOINTS = /^https?:\/\/.*\/api\//;

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log("Service Worker: Critical assets cached");
      } catch (error) {
        console.warn("Service Worker: Failed to cache some assets", error);
      }
      await self.skipWaiting();
    })(),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        (name) =>
          !name.includes("v2") &&
          (name.includes("siqueira") ||
            name.includes("static") ||
            name.includes("dynamic") ||
            name.includes("images")),
      );

      await Promise.all(oldCaches.map((name) => caches.delete(name)));
      await self.clients.claim();
      console.log("Service Worker: Old caches cleaned");
    })(),
  );
});

// Fetch event - optimized caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    // Strategy 2: Stale While Revalidate for images
    if (IMAGE_EXTENSIONS.test(url.pathname)) {
      return await staleWhileRevalidate(request, IMAGE_CACHE);
    }

    // Strategy 3: Network First for API calls
    if (API_ENDPOINTS.test(url.href)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }

    // Strategy 4: Stale While Revalidate for pages
    return await staleWhileRevalidate(request, DYNAMIC_CACHE);
  } catch (error) {
    console.warn("Service Worker: Request failed", error);
    return await getFallbackResponse(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request, {
      timeout: 3000, // 3 second timeout
    });

    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Return cached version immediately if available
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// Fallback responses for offline scenarios
async function getFallbackResponse(request) {
  const url = new URL(request.url);

  // Fallback for HTML pages
  if (request.headers.get("accept")?.includes("text/html")) {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match("/")) || new Response("Offline", { status: 503 });
  }

  // Fallback for images
  if (IMAGE_EXTENSIONS.test(url.pathname)) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="14" fill="#6b7280">Imagem não disponível</text></svg>',
      {
        headers: { "Content-Type": "image/svg+xml" },
      },
    );
  }

  // Generic fallback
  return new Response("Resource not available offline", { status: 503 });
}

// Helper functions
function isStaticAsset(url) {
  return (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.includes("/static/")
  );
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Retry failed requests when back online
  console.log("Service Worker: Handling background sync");
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Handle main notification click
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || "/"),
    );
  }
});

function handleNotificationAction(action, data) {
  switch (action) {
    case "view":
      self.clients.openWindow(data?.url || "/");
      break;
    case "dismiss":
      // Just close the notification
      break;
    default:
      self.clients.openWindow("/");
  }
}

// Performance monitoring
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Preload critical resources on idle
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRELOAD_ROUTES") {
    const routes = event.data.routes || [];
    preloadRoutes(routes);
  }
});

async function preloadRoutes(routes) {
  const cache = await caches.open(DYNAMIC_CACHE);

  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.status === 200) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.warn(`Failed to preload route: ${route}`, error);
    }
  }
}
