/* Service worker: cache-first app shell, network-first API. Bump CACHE on every release. */
const CACHE = 'dash-v3';
const SHELL = [
  './', './index.html', './app.css', './css/sections.css', './css/ai.css', './css/whoop.css', './css/today.css', './css/tasks.css', './css/health.css', './css/gym.css', './css/finance.css', './css/learn.css', './css/stats.css', './css/ibodat.css', './css/nova.css', './css/settings.css', './manifest.json', './icons/icon.svg',
  './js/core.js', './js/i18n.js', './js/prayer.js', './js/ai.js', './js/whoop.js', './js/today.js', './js/tasks.js', './js/health.js', './js/gym.js',
  './js/finance.js', './js/learn.js', './js/stats.js', './js/ibodat.js', './js/nova.js', './js/settings.js', './js/app.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.pathname.includes('/api/') || url.origin !== location.origin) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((r) => { if (r && r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
