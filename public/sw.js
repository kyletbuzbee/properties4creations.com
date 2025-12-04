// Basic Service Worker for Properties 4 Creations
const CACHE_NAME = 'properties4creations-v1.0.0';
const STATIC_CACHE = 'properties4creations-static-v1.0.0';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/js/accessibility-enhanced.js',
  '/public/images/logo/brand-logo.svg',
  '/public/images/logo/brand-logo-header.svg',
  '/404/',
  '/contact/',
  '/gallery/',
  '/about/',
  '/projects/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== STATIC_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - cache-first strategy for static assets, network-first for dynamic
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle GET requests from our domain
  if (event.request.method !== 'GET' || !url.hostname.includes('properties4creations.com')) {
    return;
  }

  // Cache-first for static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // Network-first for HTML pages and API calls
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache-first strategy for static assets
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        return response;
      }
      return fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    });
}

// Network-first strategy for dynamic content
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    })
    .catch(() => {
      // Offline fallback - serve cached version if available
      return caches.match(request)
        .then(response => response || Promise.reject('offline'));
    });
}

// Check if path is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = /\.(css|js|png|jpg|jpeg|webp|avif|svg|woff|woff2|ico)$/;
  return staticExtensions.test(pathname) ||
    pathname.includes('/images/') ||
    pathname.startsWith('/css/') ||
    pathname.startsWith('/js/');
}
