/* Ibodat bosh kartasi: aniq sanoq, joriy namozni shu yerda belgilash,
   bomdod quyosh chiqishida tugashi. node tests/test_ibodat_hero.js */
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
global.setInterval = () => 0; global.clearInterval = noop;
/* eval — brauzer skriptini node'da yuklash: loyihaning boshqa sinovlari ham shunday (faqat o'z fayllarimiz) */
eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'prayer.js'), 'utf8'));
const DAY = '2026-09-15';
D.today = () => DAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.saveUi = noop; D.current = () => 'prayer';
D.modal = noop; D.sheet = noop; D.toast = noop; D.patch = noop;
D.S = D.normalize(D.defaultState());
D.whoop = null; D.food = null; D.levels = null;
eval(fs.readFileSync(path.join(ROOT, 'js', 'ibodat.js'), 'utf8'));

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
// soatni sun'iy qo'yish: kun 15.09, berilgan daqiqa
const realNowTz = D.nowTz;
const at = (mins) => { const fixed = new Date(Date.UTC(2026, 8, 15, 0, mins) - 5 * 3600e3); D.nowTz = (d) => realNowTz(d || fixed); };   // Toshkent = UTC+5
at(600);
const tm = D.prayer.list(DAY).reduce((o, x) => (o[x.id] = x.mins, o), {});
const hero = () => { const h = D.views.prayer.render(); const i = h.indexOf('ib-hero'); return h.slice(i, h.indexOf('id="ibDayLine"', i)); };
const txt = (h) => h.replace(/&#39;/g, "'").replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

console.log('\n1. Sanoq «X soat Y daqiqa», «2:49 soat» emas');
at(tm.peshin + 10); D.S.prayers = { [DAY]: { peshin: 'jamaat' } };
let h = hero();
ok('«soat» va «daqiqa» alohida', /soat/.test(txt(h)) && /daqiqa/.test(txt(h)), txt(h));
ok('«H:MM soat» ko\'rinishi yo\'q', !/\d:\d\d\s*soat/.test(txt(h)), txt(h));
at(tm.asr - 30); h = hero();
ok('bir soatdan kam — faqat daqiqa', /\b30 daqiqa/.test(txt(h)) && !/soat/.test(txt(h).split('kiradi')[0].replace('namozigacha', '')), txt(h));

console.log('\n2. Joriy namoz belgilanmagan — bosh kartada so\'raladi');
D.S.prayers = {}; at(tm.peshin + 10); h = hero();
ok('«Peshin namozini o\'qidingizmi?»', /Peshin namozini o'qidingizmi\?/.test(txt(h)), txt(h));
ok('Jamoat va Yakka tugmalari', /data-act="ibSet" data-id="peshin" data-v="jamaat"/.test(h) && /data-id="peshin" data-v="alone"/.test(h));
ok('sarlavha — «vaqti tugashiga»', /Peshin vaqti tugashiga/.test(txt(h)), txt(h));
ok('pill — keyingi namoz nomi bilan', /Asr \d\d:\d\d da kiradi/.test(txt(h)), txt(h));
D.act.ibSet({ dataset: { id: 'peshin', v: 'jamaat' } });
ok('tugma bugungi peshinni yozadi', D.prayerLog.get(DAY, 'peshin') === 'jamaat', D.S.prayers);
h = hero();
ok('belgilangach savol yo\'q', !/o'qidingizmi/.test(h));
ok('«Peshin o\'qildi · Jamoat bilan»', /Peshin o'qildi · Jamoat bilan/.test(txt(h)), txt(h));
ok('sarlavha yana «Asr namozigacha»', /Asr namozigacha/.test(txt(h)), txt(h));

console.log('\n3. Bomdod quyosh chiqishida tugaydi');
D.S.prayers = {}; at(tm.quyosh - 40); h = hero();
ok('bomdod so\'raladi', /Bomdod namozini o'qidingizmi\?/.test(txt(h)), txt(h));
ok('qolgan vaqt — quyoshgacha (40 daqiqa)', /\b40 daqiqa/.test(txt(h)), txt(h));
ok('pill — «Quyosh … da chiqadi»', /Quyosh \d\d:\d\d da chiqadi/.test(txt(h)), txt(h));

console.log('\n4. Quyosh va tun — savol yo\'q');
at(tm.quyosh + 60); h = hero();
ok('«Hozir: quyosh chiqqan»', /Hozir: quyosh chiqqan/.test(txt(h)), txt(h));
ok('quyosh paytida savol yo\'q', !/o'qidingizmi/.test(h));
at(60); h = hero();
ok('yarim tundan keyin kechagi xufton so\'ralmaydi', !/o'qidingizmi/.test(h), txt(h));

console.log('\n5. Uch tilda kalitlar');
const keys = ['ib.h.ends', 'ib.h.ask', 'ib.h.done', 'ib.h.sun', 'ib.h.nextAt', 'ib.h.sunAt'];
for (const lang of ['uz', 'uzk', 'ru']) { D.S.settings.lang = lang; ok(lang + ': hamma kalit tarjima qilingan', keys.every((k) => D.t(k) !== k), keys.filter((k) => D.t(k) === k)); }
D.S.settings.lang = 'uz';

console.log(`\n${n - fail}/${n} o'tdi`);
process.exit(fail ? 1 : 0);
