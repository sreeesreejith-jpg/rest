const CACHE_NAME = 'nithara-reset-final';
const CACHE_PREFIX = 'nithara-sip-calc-';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './icon-1024.jpg',
    './icon-512.png',
    './icon-192.png',
    './manifest.json',
    './screenshot.png',
    '../js/pdf-helper.js',
    '../js/jspdf.umd.min.js',
    '../js/jspdf.plugin.autotable.min.js'
];


self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
