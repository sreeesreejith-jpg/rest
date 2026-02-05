const CACHE_NAME = 'nithara-rest-v2.6';
const CACHE_PREFIX = 'nithara-rest-';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    // Core JS Libraries
    './pdf-helper.js',
    './jspdf.umd.min.js',
    './jspdf.plugin.autotable.min.js',
    // Cache entry points for sub-apps
    './calculator/index.html',
    './calculator/style.css',
    './calculator/script.js',
    './dcrg/index.html',
    './dcrg/style.css',
    './dcrg/script.js',
    './emi/index.html',
    './emi/style.css',
    './emi/script.js',
    './salary/index.html',
    './salary/style.css',
    './salary/script.js',
    './pay-revision/index.html',
    './pay-revision/style.css',
    './pay-revision/script.js',
    './housing/index.html',
    './housing/style.css',
    './housing/script.js',
    './sip/index.html',
    './sip/style.css',
    './sip/script.js',
    // Library and Helper scripts
    './capacitor-handler.js'
];

// Install Event - immediately take over
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate Event - clean up old caches and notify clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete ALL old caches (both old naming and current naming)
                    if ((cacheName.startsWith(CACHE_PREFIX) || cacheName.startsWith('nithara-')) && cacheName !== CACHE_NAME) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Notify all clients to reload for the new version
            return self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
                });
            });
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First for logic, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
    const isLogic = event.request.url.includes('.js') || event.request.url.includes('.css');

    if (isLogic) {
        // Network-First for logic to avoid staleness
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Stale-While-Revalidate for images/other assets
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            })
        );
    }
});
