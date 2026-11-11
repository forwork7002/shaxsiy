/* Asosiy: 2×2 plitka. Ishga tushirish: node tests/test_today_tiles.js */
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
D.i18n.add({ uz: { 'food.kcal': 'kkal' } });   // food.js yuklanmaydi — plitka shu kalitni o'qiydi
const TODAY = '2026-09-15';
D.today = () => TODAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.saveUi = noop; D.current = () => 'today';
D.modal = noop; D.sheet = noop; D.toast = noop; D.patch = noop;
D.S = D.normalize(D.defaultState());
/* WHOOP va Ovqat — sun'iy: plitka faqat shu ikki manbadan o'qiydi */
D.whoop = { dayInsight: () => ({ recovery: 72, sleepH: 7.5, strain: 12.4, strainTarget: 13, perf: 88, gapH: 0.2, hrv: 71 }), live: () => null, freshness: () => null, sleepDebt: () => null };
D.food = { dayTotals: () => ({ kcal: 640, p: 30, c: 60, f: 20 }), targets: () => ({ kcal: 2877 }), water: () => ({ n: 3, goal: 13 }) };
D.levels = null; D.prayer = null;
eval(fs.readFileSync(path.join(ROOT, 'js', 'today.js'), 'utf8'));

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
const count = (s, re) => (s.match(re) || []).length;
const render = () => D.views.today.render();

console.log('\n1. WHOOP ulangan — to\'rtta plitka');
D.S.whoop.connected = true;
let h = render();
ok('to\'rtta .tile', count(h, /class="card tile/g) === 4, count(h, /class="card tile/g));
ok('Tiklanish → Tana/ready', /data-view="health" data-sub="ready"/.test(h));
ok('Uyqu → Tana/sleep', /data-sub="sleep"/.test(h));
ok('Zo\'riqish → Tana/strain', /data-sub="strain"/.test(h));
ok('Ovqat → Tana/ovqat', /data-sub="ovqat"/.test(h));
ok('tiklanish raqami 72 %', /72<small>%<\/small>/.test(h));
ok('holat so\'zi oddiy registrda («Yuqori»)', /tile-state good">Yuqori</.test(h));
ok('uyqu «7s 30d»', /7<small>s<\/small> 30<small>d<\/small>/.test(h));
ok('zo\'riqish 12,4', /12,4/.test(h));
ok('ovqat 640 kkal, me\'yor 2 877', /640<small>kkal<\/small>/.test(h) && /2[\s\u00A0\u202F]877/.test(h), (h.match(/data-sub="ovqat"[^>]*>[\s\S]{0,260}/) || [''])[0]);
ok('yoy faqat tiklanishda', count(h, /tile-arc/g) === 1);
ok('eski hero yo\'q', !/td-rings|td-ready|td-strip2/.test(h));
ok('katta harfli holat yo\'q', !/TAYYOR|DAM OL/.test(h));

console.log('\n2. Soat ulanmagan — Kun + Ovqat');
D.S.whoop.connected = false;
h = render();
ok('ikkita .tile', count(h, /class="card tile/g) === 2, count(h, /class="card tile/g));
ok('soat plitkasi id=tdKun', /id="tdKun"/.test(h));
ok('soat plitkasida vaqt bor (HH:MM)', /\d{1,2}:\d{2}<\/span>/.test(h));

console.log('\n3. O\'tgan kun — faqat Ovqat');
D.ui.viewDate = '2026-09-10';
h = render();
ok('bitta .tile', count(h, /class="card tile/g) === 1, count(h, /class="card tile/g));
D.ui.viewDate = null;

console.log('\n4. Hafta chizig\'i');
h = render();
ok('tanlangan kun .on', /td-wd on/.test(h));
ok('chiziqcha (.td-wd-b) yo\'q', !/td-wd-b/.test(h));

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
