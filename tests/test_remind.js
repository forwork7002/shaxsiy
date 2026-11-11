/* Push eslatmalar jadvali (js/remind.js) — 2026-11-11.
   Qaysi eslatma qachon ketishini mijoz tuzadi, server faqat vaqti kelganda yuboradi.
   Shuning uchun xato shu yerda bo'lsa — eslatma noto'g'ri soatda keladi yoki umuman kelmaydi.
   Haqiqiy core.js va prayer.js yuklanadi (D.normalize, namoz vaqtlari).
   Ishga tushirish:  node tests/test_remind.js                                    */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- brauzer o'rniga eng kichik qobiq ---------- */
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
global.navigator = { language: 'uz', onLine: true, userAgent: 'node',
  serviceWorker: { register: () => Promise.reject(new Error('no')), addEventListener: noop } };
global.location = { hash: '', origin: 'http://x', href: 'http://x', search: '', pathname: '/', reload: noop };
global.history = { replaceState: noop, pushState: noop, state: null };
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.requestIdleCallback = () => 0;
let FETCHES = [];
global.fetch = (u, o) => { FETCHES.push([u, o]); return Promise.reject(new Error('offline')); };
global.crypto = { getRandomValues: (a) => a };
global.scrollTo = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));   // namoz nomlari (prayer.*) shu yerda

/* ---------- vaqtni qotiramiz: 2026-11-11 12:00 Toshkent (07:00 UTC) ---------- */
const NOW = Date.UTC(2026, 10, 11, 7, 0);
const realNowTz = D.nowTz;
D.nowTz = (d) => realNowTz(d || new Date(NOW));
D.today = () => '2026-11-11';
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.current = () => 'today';
D.modal = noop; D.sheet = noop; D.toast = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'prayer.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'remind.js'), 'utf8'));
const RM = D.remind;

let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }
function setState(patch) {
  const s = D.defaultState();
  D.S = D.normalize(Object.assign(s, patch));
  D.S.settings.tz = 'Asia/Tashkent';
  return D.S;
}
const R = () => D.S.settings.remind;
const ids = (items, p) => items.filter((x) => x.id.startsWith(p));
const sec = (key, mins) => Math.floor(RM.epochOf(key, mins) / 1000);

/* ================================================================= */
console.log('\n1. Vaqt: kun + daqiqa → lahza');
setState({});
eq('Toshkent 13:05 = 08:05 UTC', RM.epochOf('2026-11-12', 13 * 60 + 5), Date.UTC(2026, 10, 12, 8, 5));
eq('yarim tun', RM.epochOf('2026-11-12', 0), Date.UTC(2026, 10, 11, 19, 0));
eq('1440 daqiqa — ertangi yarim tun', RM.epochOf('2026-11-12', 1440), RM.epochOf('2026-11-13', 0));
eq('manfiy daqiqa — kechagi kun', RM.epochOf('2026-11-12', -10), Date.UTC(2026, 10, 11, 18, 50));
D.S.settings.tz = 'Europe/Berlin';
eq('Berlin, yozgi vaqtga o‘tgan kun 03:30 → 01:30 UTC', RM.epochOf('2026-03-29', 3 * 60 + 30), Date.UTC(2026, 2, 29, 1, 30));
eq('Berlin, o‘sha kun 01:30 → 00:30 UTC', RM.epochOf('2026-03-29', 90), Date.UTC(2026, 2, 29, 0, 30));
eq('Berlin, qishki vaqtga qaytgan kun 12:00 → 11:00 UTC', RM.epochOf('2026-10-25', 720), Date.UTC(2026, 9, 25, 11, 0));
eq('Berlin, yozda 12:00 → 10:00 UTC', RM.epochOf('2026-07-01', 720), Date.UTC(2026, 6, 1, 10, 0));
D.S.settings.tz = 'Asia/Tashkent';

console.log('\n2. Standart sozlama');
setState({});
ok('remind sozlamasi bor', R() && R().on === false && R().prayer.on === true && R().prayer.before === 10);
ok('prayer.off — obyekt (massiv emas)', R().prayer.off && !Array.isArray(R().prayer.off));
ok('kechki eslatma standartda o‘chiq', R().evening.on === false && R().evening.time === '21:30');
const def = RM.build(NOW);
ok('standartda faqat namozlar', def.length > 0 && def.every((x) => x.id.startsWith('p:')), def.length);
ok('hammasi kelajakda', def.every((x) => x.at * 1000 > NOW));
ok('45 kundan uzoq emas', def.every((x) => x.at * 1000 <= NOW + 45 * 86400000));
ok('vaqt bo‘yicha tartiblangan', def.every((x, i) => !i || def[i - 1].at <= x.at));
ok('id takrorlanmaydi', new Set(def.map((x) => x.id)).size === def.length);
ok('30 kunlik namoz (≤ 150 ta)', def.length <= 150 && def.length >= 145, def.length);

console.log('\n3. Namoz');
const k = '2026-11-12', tm = D.prayer.times(k);
const asr = def.find((x) => x.id === 'p:asr:' + k);
ok('ertangi asr bor', !!asr);
eq('asr 10 daqiqa oldin', asr && asr.at, sec(k, tm.asr - 10));
ok('sarlavhada nomi va «10»', asr && /Asr/.test(asr.title) && /10/.test(asr.title), asr && asr.title);
ok('kalit nomi chiqib qolmaydi', def.every((x) => !/(^|\s)(prayer|rm)\.[a-z]/.test(x.title + ' ' + x.body)), def.find((x) => /prayer\.|rm\./.test(x.title + x.body)));
ok('matnda namoz vaqti', asr && asr.body.includes(D.prayer.fmt(tm.asr)), asr && asr.body);
eq('bosilganda — namoz sahifasi', asr && asr.url, './#prayer');
eq('tag namoz bo‘yicha (bir xili ustiga yoziladi)', asr && asr.tag, 'p-asr');
ok('bugungi o‘tgan bomdod yo‘q', !def.some((x) => x.id === 'p:bomdod:2026-11-11'));
ok('bugungi shom bor', def.some((x) => x.id === 'p:shom:2026-11-11'));
R().prayer.before = 0;
const now0 = RM.build(NOW).find((x) => x.id === 'p:asr:' + k);
eq('«vaqtida» — aynan namoz vaqti', now0 && now0.at, sec(k, tm.asr));
R().prayer.before = 7;                 // ro'yxatda yo'q qiymat → 10
eq('noto‘g‘ri «oldin» → 10', RM.build(NOW).find((x) => x.id === 'p:asr:' + k).at, sec(k, tm.asr - 10));
R().prayer.before = 10;
R().prayer.off = { bomdod: true, xufton: true };
const offd = RM.build(NOW);
ok('o‘chirilgan namozlar yo‘q', !offd.some((x) => /^p:(bomdod|xufton):/.test(x.id)));
ok('qolganlari bor', offd.some((x) => x.id.startsWith('p:peshin:')));
R().prayer.off = {};
R().prayer.on = false;
eq('namoz o‘chiq — hech narsa', ids(RM.build(NOW), 'p:').length, 0);
R().prayer.on = true;

for (const lang of ['uzk', 'ru']) {
  D.S.settings.lang = lang;
  const x = RM.build(NOW).find((y) => y.id === 'p:asr:' + k);
  ok(lang + ': sarlavha tarjima qilingan', x && !/prayer\.|rm\./.test(x.title + x.body) && /\p{Script=Cyrillic}/u.test(x.title), x && x.title);
}
D.S.settings.lang = 'uz';

console.log('\n4. Vazifalar');
setState({ tasks: [
  { id: 'a', text: 'Hisobot topshirish', date: '2026-11-12', time: '09:30', done: false },
  { id: 'b', text: 'Bajarilgan', date: '2026-11-12', time: '10:00', done: true },
  { id: 'c', text: 'Soatsiz', date: '2026-11-12', done: false },
  { id: 'd', text: 'O‘tgan', date: '2026-11-10', time: '10:00', done: false },
  { id: 'e', text: 'Bugun ertalab o‘tgan', date: '2026-11-11', time: '08:00', done: false },
  { id: 'f', text: 'Bugun kechqurun', date: '2026-11-11', time: '18:00', done: false },
  { id: 'g', text: 'Noto‘g‘ri soat', date: '2026-11-13', time: '25:00', done: false },
  { id: 'h', text: 'Juda uzoq', date: '2027-02-01', time: '10:00', done: false },
  { id: 'i', text: 'x'.repeat(300), date: '2026-11-14', time: '07:00', done: false },
] });
R().prayer.on = false;
let it = RM.build(NOW);
const tids = ids(it, 't:').map((x) => x.id).sort();
ok('faqat yaroqli vazifalar', JSON.stringify(tids) === JSON.stringify(['t:a:2026-11-12', 't:f:2026-11-11', 't:i:2026-11-14']), tids);
const ta = it.find((x) => x.id === 't:a:2026-11-12');
eq('vazifa soatida', ta.at, sec('2026-11-12', 9 * 60 + 30));
ok('sarlavhada vazifa matni', ta.title.includes('Hisobot topshirish'));
eq('bosilganda — vazifalar', ta.url, './#tasks');
ok('sarlavha 120 belgidan oshmaydi', it.every((x) => x.title.length <= 120));
R().tasks.before = 30;
eq('30 daqiqa oldin', RM.build(NOW).find((x) => x.id === 't:a:2026-11-12').at, sec('2026-11-12', 9 * 60));
R().tasks.on = false;
eq('vazifalar o‘chiq — hech narsa', ids(RM.build(NOW), 't:').length, 0);

console.log('\n5. Odatlar');
setState({
  habits: [
    { id: 'h1', name: 'Kitob o‘qish', active: true, remind: '20:00' },
    { id: 'h2', name: 'Yugurish', active: true, remind: '07:00', schedule: { type: 'days', days: [1, 3, 5] } },
    { id: 'h3', name: 'Soatsiz', active: true },
    { id: 'h4', name: 'Arxivda', active: false, remind: '09:00' },
  ],
  logs: { '2026-11-11': ['h1'] },
});
R().prayer.on = false;
it = RM.build(NOW);
const h1 = ids(it, 'h:h1:');
ok('bugun bajarilgan odat bugun eslatilmaydi', !h1.some((x) => x.id === 'h:h1:2026-11-11'));
ok('ertadan boshlab bor', h1.some((x) => x.id === 'h:h1:2026-11-12'));
eq('14 kun ichida 13 ta (bugungisi bajarilgan)', h1.length, 13);
eq('odat soatida', h1[0].at, sec('2026-11-12', 20 * 60));
eq('bosilganda — odatlar', h1[0].url, './#habits');
const h2 = ids(it, 'h:h2:');
ok('faqat jadvaldagi kunlar (dush/chor/juma)', h2.length > 0 && h2.every((x) => [1, 3, 5].includes(D.dowOf(x.id.split(':')[2]))), h2.map((x) => x.id));
ok('soatsiz odat yo‘q', ids(it, 'h:h3:').length === 0);
ok('nofaol odat yo‘q', ids(it, 'h:h4:').length === 0);
D.S.logs = {};
ok('bajarilmagan bo‘lsa bugun kechqurun ham bor', RM.build(NOW).some((x) => x.id === 'h:h1:2026-11-11'));
R().habits.on = false;
eq('odatlar o‘chiq — hech narsa', ids(RM.build(NOW), 'h:').length, 0);

console.log('\n6. Kun yakuni');
setState({});
R().prayer.on = false;
eq('standartda yo‘q', ids(RM.build(NOW), 'e:').length, 0);
R().evening.on = true;
it = ids(RM.build(NOW), 'e:');
eq('14 kun', it.length, 14);
eq('bugun 21:30', it[0].at, sec('2026-11-11', 21 * 60 + 30));
eq('tag bitta (eskisi ustiga yoziladi)', it[0].tag, 'eve');
R().evening.time = '7:5';
eq('noto‘g‘ri soat — yuborilmaydi', ids(RM.build(NOW), 'e:').length, 0);

console.log('\n7. Hammasi birga');
setState({ habits: Array.from({ length: 60 }, (_, i) => ({ id: 'q' + i, name: 'Odat ' + i, active: true, remind: '06:' + String(i % 60).padStart(2, '0') })) });
R().evening.on = true;
it = RM.build(NOW);
ok('ko‘pi bilan 800 ta', it.length === 800, it.length);
ok('eng yaqinlari qoladi', it.every((x, i) => !i || it[i - 1].at <= x.at));

console.log('\n8. Serverga yuborish');
setState({});
FETCHES = [];
RM.sync(true);
eq('server yoqilmagan — so‘rov yo‘q', FETCHES.length, 0);
D.serverEnabled = () => true; D.me = { uid: 'me' };
RM.sync(true);
eq('eslatma o‘chiq (remind.on=false) — so‘rov yo‘q', FETCHES.length, 0);
R().on = true;
RM.sync(true).then(() => {
  eq('yoqilganda bitta so‘rov', FETCHES.length, 1);
  eq('manzil', FETCHES[0] && FETCHES[0][0], '/api/push/schedule');
  const body = FETCHES[0] && JSON.parse(FETCHES[0][1].body);
  ok('jadval jo‘natiladi', body && Array.isArray(body.items) && body.items.length > 0);
  ok('kuki bilan (same-origin)', FETCHES[0] && FETCHES[0][1].credentials === 'same-origin');

  console.log(`\n${n - fail}/${n} o'tdi`);
  if (fail) process.exit(1);
});
