const CACHE_NAME = 'nithara-pay-rev-v1.7';
const CACHE_PREFIX = 'nithara-pay-rev-';
const ASSETS = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    '../icon-192.png',
    '../pdf-helper.js',
    '../jspdf.umd.min.js',
    '../jspdf.plugin.autotable.min.js'
];


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
                        console.log('Pay-Rev SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
