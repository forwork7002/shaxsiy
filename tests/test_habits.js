/* Odat trekkeri (js/habits.js) — davr katagi va hisob-kitob.
   Haqiqiy core.js yuklanadi: sana arifmetikasi va S.logs mutatorlari
   taqlid emas, o'shaning o'zi bo'lsin — xato aynan shu chegarada tug'iladi.

   Nimani qo'riqlaydi:
     1. Haftalik ko'rinish: hafta o'qi, katak holati (bo'sh kun qachon
        «qoldirilgan», qachon shunchaki shart emas), har qatorning o'z kun
        harflari va bosish faqat o'tgan/bugungi kunga tushishi.
     2. Sahifadagi foizlar BITTA qoidadan chiqadi. Ilgari yuqoridagi
        katta raqam davr bo'yicha, kun chizig'i va oylik ustunlar esa
        kun bo'yicha sanardi: oyiga bir marta qilinadigan ish qolgan
        30 kun «bajarilmagan» bo'lib turardi (17% ↔ 10%).

   Ishga tushirish:  node tests/test_habits.js                              */
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
global.fetch = () => Promise.reject(new Error('offline'));
global.crypto = { getRandomValues: (a) => a };
global.scrollTo = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));

/* ---------- vaqtni qotiramiz: 2026-yil 16-sentabr, chorshanba ---------- */
const TODAY = '2026-09-16';
D.today = () => TODAY;
D.dayKey = () => TODAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.saveUi = noop; D.current = () => 'tasks';
D.modal = noop; D.sheet = noop; D.toast = noop; D.patch = noop; D.closeSheet = noop;
D.S = D.normalize(D.defaultState());

eval(fs.readFileSync(path.join(ROOT, 'js', 'habits.js'), 'utf8'));
const H = D.habitsCalc;

/* ---------- mayda yordamchilar ---------- */
let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }

const SEP = []; for (let d = '2026-09-01'; d.slice(0, 7) === '2026-09'; d = D.addDays(d, 1)) SEP.push(d);

/** Sahna: odatlar + belgilangan kunlar. Har sinov o'z sahnasidan boshlanadi. */
function scene(habits, logs) {
  D.S.habits = habits.map((h, i) => Object.assign({ id: 'h' + (i + 1), active: true, sphere: 'boshqa', order: i, schedule: { type: 'daily' } }, h));
  D.S.logs = JSON.parse(JSON.stringify(logs || {}));
  D.S.counts = {}; D.S.media = []; D.S.mediaLogs = {};
}
const item = (id) => H.items().find((x) => x.id === id);
const marked = (id) => Object.keys(D.S.logs).filter((k) => (D.S.logs[k] || []).includes(id)).sort();

/* ================================================================= */
console.log('\n1. Hafta o‘qi — dushanbadan yakshanbagacha, kelajakka o‘tmaydi');
eq('shu hafta boshi', H.weekDays(0)[0], '2026-09-14');
eq('shu hafta oxiri', H.weekDays(0)[6], '2026-09-20');
eq('o‘tgan hafta', H.weekDays(-1)[0], '2026-09-07');
eq('kelajak hafta so‘ralsa ham shu hafta', H.weekDays(2)[0], '2026-09-14');
eq('oy — bugungi oy', H.monthDays(H.weekDays(0))[0], '2026-09-01');
eq('ikki oyga bo‘lingan hafta — keyingi oy', H.monthDays(H.weekDays(-2))[0], '2026-09-01');
eq('avgust haftasi — avgust', H.monthDays(H.weekDays(-3)).length, 31);

console.log('\n2. Katak holati');
scene([
  { name: 'Har kuni', schedule: { type: 'daily' } },
  { name: 'Du-Ch', schedule: { type: 'days', days: [1, 3] } },
  { name: 'Haftada 3', schedule: { type: 'week', n: 3 } },
], { '2026-09-14': ['h1'] });
eq('bajarilgan', H.cellState(item('h1'), '2026-09-14'), 'on');
eq('kecha qoldirilgan', H.cellState(item('h1'), '2026-09-15'), 'miss');
eq('bugun hali ochiq', H.cellState(item('h1'), TODAY), 'open');
eq('ertaga — kelajak', H.cellState(item('h1'), '2026-09-17'), 'fut');
eq('kerak bo‘lmagan kun «qoldi» emas', H.cellState(item('h2'), '2026-09-15'), 'rest');
eq('kerakli kun qoldirilgan', H.cellState(item('h2'), '2026-09-14'), 'miss');
eq('haftalik ishning bo‘sh kuni «qoldi» emas', H.cellState(item('h3'), '2026-09-15'), 'rest');

console.log('\n3. Har qatorning ustida o‘z kun harflari');
scene([
  { name: 'Yugurish', schedule: { type: 'daily' } },
  { name: 'Kitob', schedule: { type: 'daily' } },
], { '2026-09-14': ['h1'], '2026-09-15': ['h1'], '2026-09-16': ['h1'] });
const r1 = H.habitRow(item('h1'), H.weekDays(0));
eq('qatorda yettita harf', (r1.match(/class="hb-wk-l"/g) || []).length, 7);
eq('birinchi harf — dushanba', (r1.match(/class="hb-wk-l"[^>]*>([^<]*)</) || [])[1], D.t('weekdaysShort')[1]);
eq('yettita katak', (r1.match(/data-act="hbTick"/g) || []).length, 7);
eq('uchta bajarilgan', (r1.match(/aria-pressed="true"/g) || []).length, 3);
eq('ketma-ket kunlar ulangan (2 ta chiziq)', (r1.match(/ lr"/g) || []).length, 2);
eq('kelajak kataklar bosilmaydi', (r1.match(/disabled/g) || []).length, 4);
eq('ketma-ketlik ko‘rinadi', /hb-wk-fire num "/.test(r1), true);
const r3 = (scene([{ name: 'Haftada 2', schedule: { type: 'week', n: 2 } }], { '2026-09-15': ['h1'] }), H.habitRow(item('h1'), H.weekDays(0)));
eq('haftalik ishda davr hisobi', (r3.match(/hb-wk-cnt[^>]*>([^<]*)</) || [])[1], '1/2');

console.log('\n4. Bosish — faqat o‘tgan va bugungi kun');
scene([{ name: 'Yugurish', schedule: { type: 'daily' } }], {});
const tap = (key) => D.act.hbTick({ dataset: { id: 'h1', key }, closest: () => null });
tap(TODAY);
eq('bugun belgilandi', marked('h1').join(), TODAY);
tap('2026-09-15');
eq('kecha ham', marked('h1').length, 2);
tap('2026-09-18');
eq('kelajak kun belgilanmaydi', marked('h1').length, 2);
tap(TODAY);
eq('ikkinchi bosish olib tashlaydi', marked('h1').join(), '2026-09-15');

/* ================================================================= */
console.log('\n5. Bitta oyning foizi — bitta qoida');
/* Uchta odat: har kunlik, haftada 2 marta, oyiga 1 marta.
   Bugun 16-sentabr, ya'ni oyning 16 kuni o'tgan, 3 ta hafta boshlangan. */
scene([
  { name: 'Har kuni', schedule: { type: 'daily' } },
  { name: 'Haftada 2', schedule: { type: 'week', n: 2 } },
  { name: 'Oyda 1', schedule: { type: 'month', n: 1 } },
], {});
eq('kunlik maqsad = o‘tgan kunlar', H.periodTotal(item('h1'), SEP), 16);
eq('haftalik maqsad = boshlangan haftalar × n', H.periodTotal(item('h2'), SEP), 6);
eq('oylik maqsad = n', H.periodTotal(item('h3'), SEP), 1);

/* Hammasi bajarilgan bo'lsa oylik ustun ham 100% bo'lishi shart.
   Ilgari oylik odat 30 kun «bajarilmagan» bo'lib sanalar va ustun
   hech qachon to'lmasdi. */
const all = {};
for (const d of SEP) { if (d > TODAY) break; all[d] = ['h1', 'h2', 'h3']; }
scene([
  { name: 'Har kuni', schedule: { type: 'daily' } },
  { name: 'Haftada 2', schedule: { type: 'week', n: 2 } },
  { name: 'Oyda 1', schedule: { type: 'month', n: 1 } },
], all);
const list = H.items();
eq('hammasi bajarilgan oy = 100%', Math.round(H.monthPct(list, SEP[0], SEP[29])), 100);
eq('  yuqoridagi katta raqam ham 100%', Math.round(H.stats(list, SEP).pct), 100);

/* Hech nima bajarilmagan oy — 0%, lekin «kerak» soni nolga tushmasin. */
scene([
  { name: 'Har kuni', schedule: { type: 'daily' } },
  { name: 'Oyda 1', schedule: { type: 'month', n: 1 } },
], {});
eq('bo‘sh oy = 0%', Math.round(H.monthPct(H.items(), SEP[0], SEP[29])), 0);

/* Faqat oylik ish bajarilgan: oylik odat yolg'iz bo'lsa ustun to'lishi kerak. */
scene([{ name: 'Oyda 1', schedule: { type: 'month', n: 1 } }], { '2026-09-03': ['h1'] });
eq('yolg‘iz oylik ish bajarilgan = 100%', Math.round(H.monthPct(H.items(), SEP[0], SEP[29])), 100);

console.log('\n6. Kun chizig‘i faqat kunlik odatlarni oladi');
scene([
  { name: 'Har kuni', schedule: { type: 'daily' } },
  { name: 'Oyda 1', schedule: { type: 'month', n: 1 } },
], {});
eq('kunlik ro‘yxat oylik odatni olmaydi', H.dailyOf(H.items()).map((x) => x.name).join(), 'Har kuni');

/* ================================================================= */
console.log(`\n${fail ? 'FAIL' : 'OK'} — ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
