/* Service worker: cache-first app shell, network-first API. Bump CACHE on every release. */
const CACHE = 'dash-v92';
const V = '?v=' + CACHE.replace('dash-', '');
const ASSETS = [
  './app.css',
  './css/fonts.css',
  './css/sections.css',
  './css/ai.css',
  './css/whoop.css',
  './css/profile.css',
  './css/today.css',
  './css/tasks.css',
  './css/books.css',
  './css/habits.css',
  './css/health.css',
  './css/finance.css',
  './css/ibodat.css',
  './css/yusa.css',
  './css/food.css',
  './css/settings.css',
  './css/onboard.css',
  './css/yusa-orb.css',
  './css/levels.css',
  './css/whoop-ui.css',
  './js/core.js',
  './js/i18n.js',
  './js/prayer.js',
  './js/ai.js',
  './js/whoop.js',
  './js/profile.js',
  './js/today.js',
  './js/tasks.js',
  './js/books.js',
  './js/habits.js',
  './js/health.js',
  './js/finance.js',
  './js/ibodat.js',
  './js/yusa.js',
  './js/food.js',
  './js/settings.js',
  './js/onboard.js',
  './js/yusa-orb.js',
  './js/levels.js',
  './js/app.js',
];
// Shriftlar o'z faylimizda. Nomi o'zgarmagunicha mazmuni ham o'zgarmaydi, shuning
// uchun ular ?v= siz keshlanadi — CSS ham aynan shu manzilni so'raydi.
// Faqat Onest keshlanadi — ilova shu bilan yoziladi (app.css --font).
//
// Nega IBM Plex bu yerda yo'q, garchi u --font da zaxira bo'lib tursa ham:
// ilovaning o'z matnlarida ishlatiladigan ASCII dan tashqari 104 ta belgi
// sanab chiqildi va ikkala oila bilan solishtirildi (2026-09-14, fontTools).
// Natija: Plex Onest qoplamaydigan BIRORTA belgini ham qoplamaydi. Ikkalasida
// ham yo'q o'n bitta belgi bor (Δ λ φ ₂ → ↔ ≈ ≤ ≥ ⏳ ─) — ular baribir tizim
// shriftidan keladi. Ya'ni Plex keshda turib hech qachon ishlatilmasdi, lekin
// har versiyada 130 KB ni majburan tortib, har bir qurilmada joy egallardi.
// Bir kunda v74 dan v83 gacha chiqqan loyihada bu sezilarli narx.
// Plex --font stekida va serverda qoladi: internet bo'lsa, Onest yiqilgan
// taqdirda brauzer uni oladi. Internetsiz zaxira — system-ui, u har doim bor
// va hech narsa yuklamaydi.
const FONTS = ['./fonts/mulish-latin.woff2', './fonts/mulish-latin-ext.woff2',
  './fonts/mulish-cyrillic.woff2', './fonts/mulish-cyrillic-ext.woff2'];
const SHELL = [
  './', './index.html', './manifest.json', './icons/icon.svg',
  // css/js manzillari ?v= bilan — index.html dagi teglar bilan aynan bir xil bo'lishi shart,
  // aks holda SW keshi mos kelmaydi va offline ishlamaydi. push.sh ikkalasini sinxron tutadi.
  ...ASSETS.map((u) => u + V),
  ...FONTS,
];
self.addEventListener('install', (e) => {
  // `cache: 'reload'` majburiy: addAll brauzerning HTTP keshidan o'qiy oladi va
  // yangi CACHE eski fayllar bilan to'lib qolardi — deploydan keyin foydalanuvchi
  // bir soatgacha eskisini ko'rar edi (2026-09-09 da aynan shu yuz berdi).
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(
    SHELL.map((u) => fetch(new Request(u, { cache: 'reload' }))
      .then((r) => (r && r.ok ? c.put(u, r) : null)).catch(() => null))
  )).then(() => self.skipWaiting()));
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
      // Klon SINXRON olinishi shart. caches.open() — va'da, uning .then'i keyingi
      // mikrovazifada ishlaydi, o'sha paytga kelib `return r` javobni sahifaga berib
      // bo'lgan va tanasi o'qilgan bo'ladi: r.clone() «Response body is already used»
      // bilan yiqiladi. Oqibati ikkita edi — har so'rovda tutilmagan xato, va put()
      // umuman bajarilmagani uchun kesh hech qachon yangilanmasdi, ya'ni
      // stale-while-revalidate amalda «faqat keshdan» ga aylanib qolgandi.
      const net = fetch(e.request).then((r) => {
        if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
