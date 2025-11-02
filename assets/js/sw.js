const CACHE_NAME = 'ims-v1';
const urlsToCache = [
  '/',
  '/pages/index.html',
  '/pages/admin-dashboard.html',
  '/pages/staff-dashboard.html',
  '/assets/css/style.css',
  '/assets/js/api.js',
  '/assets/js/login.js',
  '/assets/js/admin.js',
  '/assets/js/staff.js',
  '/manifest.json'
];

// Install event: Cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
