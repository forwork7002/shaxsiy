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
ok('uchta bo\'limcha', count(h, /data-act="go" data-view="prayer" data-sub="/g) === 3, count(h, /data-sub="/g));
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

console.log('\n3. Namoz sahifaning o\'zida belgilanadi (2026-10-09)');
D.S.habits = [];
D.S.prayers = {};
D.ui.filters = { ibTimesDate: '2026-09-14' };   // o'tgan kun: hamma vaqt kirgan
let h2 = D.views.prayer.render();
ok('besh qator bosiladi', count(h2, /data-act="ibRow"/g) === 5, count(h2, /data-act="ibRow"/g));
ok('belgilanmagan qatorda «Belgilash»', count(h2, /ib-pr-mark/g) === 5);
ok('aylana yo\'q (egasi rad etgan)', !/ring-wrap|ibHeroRing/.test(h2));
D.act.ibRow({ dataset: { id: 'asr' } });
h2 = D.views.prayer.render();
ok('qator ochilganda uchta chip', count(h2, /data-act="ibSet" data-id="asr"/g) === 3, count(h2, /data-act="ibSet" data-id="asr"/g));
D.act.ibSet({ dataset: { id: 'asr', v: 'jamaat' } });
ok('tanlov S.prayers ga yozildi', (D.S.prayers['2026-09-14'] || {}).asr === 'jamaat', D.S.prayers['2026-09-14']);
h2 = D.views.prayer.render();
ok('holat pilli chiqdi', /ib-st-jamaat/.test(h2));
ok('haftalik jadvalda jamoat katagi', /ib-wk-c j/.test(h2));
D.act.ibRow({ dataset: { id: 'asr' } });
h2 = D.views.prayer.render();
ok('belgilangan qatorda «Olib tashlash» ham bor', /ib-chip-x/.test(h2));
D.act.ibSet({ dataset: { id: 'asr', v: '' } });
ok('olib tashlanganda kun o\'chadi', !D.S.prayers['2026-09-14']);
D.act.ibTahajjud();
ok('tahajjud kaliti yozadi', (D.S.prayers['2026-09-14'] || {}).tahajjud === 'alone');
D.act.ibTahajjud();
ok('tahajjud kaliti oladi', !D.S.prayers['2026-09-14']);
D.S.prayers['2026-09-14'] = { asr: '"><img src=x onerror=alert(1)>' };
h2 = D.views.prayer.render();
ok('buzuq holat HTML ga tushmaydi', !/onerror|<img/.test(h2));
delete D.S.prayers['2026-09-14'];
D.ui.filters = {};

console.log('\n4. Qazo va Ro\'za');
D.S.prayers._qaza = { base: { bomdod: 10, peshin: 10, asr: 10, shom: 10, xufton: 10 }, pay: {}, target: 5 };
D.S.meta.updatedAt = Date.now() + 5;
D.ui.sub.prayer = 'qaza';
h2 = D.views.prayer.render();
ok('qarz 50', /<b class="num">50<\/b>/.test(h2));
ok('besh juft − / + tugma', count(h2, /data-act="ibQzPay"/g) === 5 && count(h2, /data-act="ibQzUnpay"/g) === 5);
ok('bir kunlik tugma', /data-act="ibQzDay"/.test(h2));
D.act.ibQzPay({ dataset: { id: 'asr' } });
ok('«+» S.prayers._qaza.pay ga yozadi', D.S.prayers._qaza.pay['2026-09-15'].asr === 1);
D.ui.sub.prayer = 'fasting';
h2 = D.views.prayer.render();
ok('ro\'za kaliti', /data-act="ibFastToggle" data-key="2026-09-15" role="switch"/.test(h2));
ok('hijriy oy jadvali 29–30 katak', [29, 30].includes(count(h2, /class="ib-hcell [^"]*" data-act="ibFastToggle"/g)), count(h2, /class="ib-hcell [^"]*" data-act="ibFastToggle"/g));
D.act.ibFastQazaAdd();
ok('qazo ro\'za bugunga yozildi', JSON.stringify(D.S.fasting['2026-09-15']) === '{"type":"qaza","done":true}', D.S.fasting['2026-09-15']);
D.act.ibFastQazaUndo();
ok('«Bekor» yozuvni oladi', !D.S.fasting['2026-09-15']);
D.S.fasting['2026-09-15'] = { type: 'ramadan', done: true };
D.act.ibFastQazaAdd(); D.act.ibFastQazaUndo();
ok('boshqa turdagi ro\'za qazoga aylanmaydi va «Bekor» uni o\'chirmaydi', JSON.stringify(D.S.fasting['2026-09-15']) === '{"type":"ramadan","done":true}', D.S.fasting['2026-09-15']);
delete D.S.fasting['2026-09-15'];
D.ui.sub.prayer = 'times';
ok('yangi kalitlar uchala tilda', ['uz', 'uzk', 'ru'].every((l) => { D.S.settings.lang = l; return ['ib.day.title', 'ib.c.jamaat', 'ib.wk.title', 'ib.qzh.calc', 'ib.fs.not', 'ib.fq.add', 'ib.src.same'].every((k) => D.t(k) !== k); }));
D.S.settings.lang = 'uz';

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
