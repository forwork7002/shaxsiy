/* Ibodat: bo'limchalar tepadagi segmentda, dial yo'q. node tests/test_ibodat_seg.js */
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
global.document = { documentElement: el, body: el, head: el, addEventListener: noop, removeEventListener: noop,
  createElement: () => mk(), createDocumentFragment: () => mk(), getElementById: () => null,
  querySelector: () => null, querySelectorAll: () => [], readyState: 'complete', visibilityState: 'visible', title: '' };
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
eval(fs.readFileSync(path.join(ROOT, 'js', 'prayer.js'), 'utf8'));
D.today = () => '2026-09-15';
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.saveUi = noop; D.current = () => 'prayer';
D.modal = noop; D.sheet = noop; D.toast = noop; D.patch = noop;
D.S = D.normalize(D.defaultState());
D.whoop = null; D.food = null; D.levels = null;
eval(fs.readFileSync(path.join(ROOT, 'js', 'ibodat.js'), 'utf8'));

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
const count = (s, re) => (s.match(re) || []).length;

console.log('\n1. Segment');
const h = D.views.prayer.render();
ok('segment bor', /class="seg ib-seg"/.test(h));
ok('uchta bo\'limcha (namoz Trekkerda belgilanadi)', count(h, /data-act="go" data-view="prayer" data-sub="/g) === 3, count(h, /data-sub="/g));
ok('Qayd bo\'limchasi yo\'q', !/data-sub="log"/.test(h));
ok('Vaqtlar faol', /class="on" data-act="go" data-view="prayer" data-sub="times"/.test(h));
ok('dial yo\'q', !/(^|[^q])ib-dial/.test(h));   // ib-qib-dial — Qibla kompasi, u qoladi
ok('segment sahifaning boshida', h.indexOf('ib-seg') < h.indexOf('ib-hero'));

console.log('\n2. D.prayerLog — Trekkerdagi namoz jadvali shu orqali yozadi');
D.S.habits.push({ id: 'hb1', name: 'Peshin', active: true, schedule: { type: 'daily' }, sphere: 'ruh' });
D.prayerLog.set('2026-09-15', 'peshin', 'alone');
ok('holat yozildi', D.prayerLog.get('2026-09-15', 'peshin') === 'alone');
ok('namoz nomli odat ham belgilandi', (D.S.logs['2026-09-15'] || []).includes('hb1'));
D.prayerLog.set('2026-09-15', 'peshin', 'qaza');
ok('qazo ham odatni belgilangan holda qoldiradi', (D.S.logs['2026-09-15'] || []).includes('hb1'));
D.prayerLog.set('2026-09-15', 'peshin', null);
ok('bo\'shatilganda kun o\'chadi', !D.S.prayers['2026-09-15'] && !D.S.logs['2026-09-15']);
D.prayerLog.set('2026-09-16', 'peshin', 'alone');
ok('kelajak kunga yozilmaydi', !D.S.prayers['2026-09-16']);
D.prayerLog.set('2026-09-15', 'peshin', 'nonsense');
ok('noma\'lum holat yozilmaydi', !D.S.prayers['2026-09-15']);
ok('namoz odatlari ro\'yxati', D.prayerLog.habitIds().join() === 'hb1');

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
