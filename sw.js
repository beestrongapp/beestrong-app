const CACHE = 'beestrong-v12';
const ASSETS = ['./', './index.html', './manifest.json', './logo.jpg', './light_logo.png', './icons/icon-192.png', './icons/icon-512.png', './icons/light-icon-192.png', './icons/light-icon-512.png', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request))); });
