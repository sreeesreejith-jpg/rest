const CACHE_NAME = 'nithara-reset-final';
const CACHE_PREFIX = 'nithara-salary-';
const ASSETS = [
    './',
    './index.html',
    './style.css?v=1.0',
    './script.js?v=1.0',
    './manifest.json',
    '../icon-192.png',
    '../js/pdf-helper.js',
    '../js/jspdf.umd.min.js',
    '../js/jspdf.plugin.autotable.min.js'
];


self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
