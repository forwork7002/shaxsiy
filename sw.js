/* Service worker: cache-first app shell, network-first API. Bump CACHE on every release. */
const CACHE = 'dash-v23';
const FONTS = CACHE + '-fonts';
const SHELL = [
  './', './index.html', './app.css', './css/sections.css', './css/ai.css', './css/whoop.css', './css/profile.css', './css/today.css', './css/tasks.css', './css/health.css', './css/finance.css', './css/ibodat.css', './css/nova.css', './css/food.css', './css/settings.css', './css/history.css', './css/onboard.css', './manifest.json', './icons/icon.svg',
  './js/core.js', './js/i18n.js', './js/prayer.js', './js/ai.js', './js/whoop.js', './js/profile.js', './js/today.js', './js/tasks.js', './js/health.js',
  './js/finance.js', './js/ibodat.js', './js/nova.js', './js/food.js', './js/settings.js', './js/history.js', './js/onboard.js', './js/app.js',
];

// cache.addAll() atomar: ro'yxatdagi bitta fayl 404 qaytarsa butun to'plam
// yozilmay qoladi va ilova umuman keshsiz ishlaydi — aynan shu bo'lgan edi
// (yo'q yusa.css/yusa.js tufayli). Endi har bir fayl alohida yoziladi:
// bittasi tushib qolsa qolgani baribir keshda bo'ladi.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then((rs) => {
        const bad = rs.filter((r) => r.status === 'rejected').length;
        if (bad) console.warn('sw: ' + bad + ' ta fayl keshlanmadi');
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Google Fonts: cache-first, so Nunito/Quicksand still render offline.
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then((c) =>
      c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
        if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone());
        return r;
      }).catch(() => hit))));
    return;
  }

  if (url.pathname.includes('/api/') || url.origin !== location.origin) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Sahifaning o'zi: tarmoq bo'lmasa keshdagi qobiq berilsin, aks holda
  // offline'da ilova umuman ochilmaydi (iOS'da bu "oq ekran" ko'rinadi).
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => { if (r && r.ok) caches.open(CACHE).then((c) => c.put('./index.html', r.clone())); return r; })
        .catch(() => caches.match('./index.html', { cacheName: CACHE })
          .then((hit) => hit || caches.match('./', { cacheName: CACHE }))
          .then((hit) => hit || new Response('<h1>Offline</h1>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })))
    );
    return;
  }

  // Qobiq fayllari: keshdan darrov, orqa fonda yangilanadi.
  e.respondWith(
    caches.match(e.request, { cacheName: CACHE }).then((hit) => {
      const net = fetch(e.request).then((r) => {
        if (r && r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
