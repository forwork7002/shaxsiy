/* Pastki panel: beshta yorliq kapsulada, #fab — «+» (tez qo'shish).
   Ishga tushirish: node tests/test_nav.js */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; global.self = global;
const noop = () => {};
global.addEventListener = noop; global.removeEventListener = noop;
const mk = () => ({ style: {}, classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
  addEventListener: noop, removeEventListener: noop, appendChild: noop, setAttribute: noop, removeAttribute: noop,
  getAttribute: () => null, querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
  dataset: {}, focus: noop, scrollTo: noop, offsetHeight: 0, insertBefore: noop, remove: noop, children: [] });
const el = mk();
/* panel va FAB — haqiqiy DOM o'rniga yozuvni ushlab qoladigan qutilar */
const navEl = mk(), fabEl = mk(), sideEl = mk(), viewEl = mk();
fabEl.cls = new Set(); fabEl.classList = { add: (c) => fabEl.cls.add(c), remove: (c) => fabEl.cls.delete(c), contains: (c) => fabEl.cls.has(c), toggle: (c, on) => { on ? fabEl.cls.add(c) : fabEl.cls.delete(c); } };
fabEl.attrs = {}; fabEl.setAttribute = (k, v) => { fabEl.attrs[k] = v; }; fabEl.removeAttribute = (k) => { delete fabEl.attrs[k]; };
const byId = { nav: navEl, fab: fabEl, side: sideEl, view: viewEl };
global.document = { documentElement: el, body: el, head: el, addEventListener: noop, removeEventListener: noop,
  createElement: () => mk(), createDocumentFragment: () => mk(),
  getElementById: (id) => byId[id] || null,
  querySelector: (s) => (s[0] === '#' ? byId[s.slice(1)] || null : null), querySelectorAll: () => [], readyState: 'complete', visibilityState: 'visible', title: '' };
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
global.navigator = { language: 'uz', onLine: true, userAgent: 'node', serviceWorker: { register: () => Promise.reject(new Error('no')), addEventListener: noop } };
global.location = { hash: '', origin: 'http://x', href: 'http://x', search: '', pathname: '/', reload: noop };
global.history = { replaceState: noop, pushState: noop, state: null };
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.requestIdleCallback = () => 0;
global.fetch = () => Promise.reject(new Error('offline'));
global.crypto = { getRandomValues: (a) => a };
global.scrollTo = noop;
/* eval — brauzer skriptini node'da yuklash: loyihaning boshqa sinovlari ham shunday (faqat o'z fayllarimiz) */
eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));
D.serverEnabled = () => false; D.save = noop; D.saveUi = noop; D.rerender = noop; D.renderTop = noop;
D.S = D.normalize(D.defaultState());
/* Beshta bo'lim — kechiktirilgan modullar bu yerda yuklanmaydi, ularni
   bo'sh ko'rinish sifatida ro'yxatga olamiz (panel faqat id va belgini o'qiydi). */
for (const [id, icon] of [['today', 'calendar'], ['prayer', 'mosque'], ['health', 'heart'], ['finance', 'wallet'], ['tasks', 'checkSq']]) D.view({ id, icon, nav: true, render: () => '' });

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
const count = (s, re) => (s.match(re) || []).length;

console.log('\n1. Kapsula');
D.renderNav();
const h = navEl.innerHTML;
ok('beshta yorliq', count(h, /class="nav-tab/g) === 5, count(h, /class="nav-tab/g));
ok('Tana kapsulada', /data-view="health"/.test(h));
ok('nav-mid sinfi yo\'q', !/nav-mid/.test(h));
ok('tartib: today · prayer · health · finance · tasks', [...h.matchAll(/data-view="([a-z]+)"/g)].map((m) => m[1]).join(',') === 'today,prayer,health,finance,tasks');
ok('Tana yorlig\'i «Tana» (Ovqat emas)', D.t('nav.health') === 'Tana', D.t('nav.health'));

console.log('\n2. FAB — «+», bo\'lim emas');
ok('belgi chizilgan', /<svg/.test(fabEl.innerHTML));
ok('data-act=fab', fabEl.attrs['data-act'] === 'fab');
ok('data-view yo\'q', fabEl.attrs['data-view'] === undefined);
ok('aria-label bor', !!fabEl.attrs['aria-label']);
ok('fab.* uchala tilda', ['uz', 'uzk', 'ru'].every((l) => { D.S.settings.lang = l; return ['add', 'title', 'task', 'money', 'food', 'habit'].every((k) => D.t('fab.' + k) !== 'fab.' + k); }));
D.S.settings.lang = 'uz';
try { D.go('health'); } catch (e) { console.log('  (D.go xato — stub yetishmaydi: ' + e.message + ')'); }
ok('joriy bo\'lim Tana', D.current() === 'health', D.current());
D.renderNav();
ok('Tanada kapsuladagi yorliq faol', /class="nav-tab on"[^>]*data-view="health"/.test(navEl.innerHTML));
let opened = '';
D.sheet = (html) => { opened = html; };
D.act.fab();
ok('«+» to\'rt qatorli ro\'yxat ochadi', count(opened, /data-act="fabPick"/g) === 4, count(opened, /data-act="fabPick"/g));
D.views.health.fab = () => { opened = 'own'; };
D.act.fab();
ok('bo\'lim o\'z amalini bersa, o\'sha ishlaydi', opened === 'own');

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
