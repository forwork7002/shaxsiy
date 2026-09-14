/* Daraja va nishonlar (js/levels.js) — ochko hisobi, chegaralar va birlashtirish.
   Haqiqiy core.js yuklanadi, ya'ni D.normalize va D.merge ham shu yerda sinaladi:
   nishonni yo'qotadigan xato aynan o'sha ikkisida bo'lishi mumkin.
   Ishga tushirish:  node tests/test_levels.js                                   */
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
global.requestIdleCallback = () => 0;          // fon yuklashi testda kerak emas
global.fetch = () => Promise.reject(new Error('offline'));
global.crypto = { getRandomValues: (a) => a };
global.scrollTo = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));

/* ---------- vaqtni qotiramiz: test kalendarga bog'liq bo'lmasin ---------- */
const TODAY = '2026-09-14';
D.today = () => TODAY;
D.dayKey = (d) => {
  const t = d instanceof Date ? d : new Date(+d || Date.now());
  return t.getUTCFullYear() + '-' + D.pad2(t.getUTCMonth() + 1) + '-' + D.pad2(t.getUTCDate());
};
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.current = () => 'today';
D.modal = noop; D.sheet = noop; D.toast = noop;
D.food = null;                                  // suv manbasi ataylab o'chirilgan

eval(fs.readFileSync(path.join(ROOT, 'js', 'levels.js'), 'utf8'));
const L = D.levels;

/* ---------- mayda yordamchilar ---------- */
let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }
/** Holatni o'rnatib, keshni tozalab, hisobni qaytaradi. */
function setState(patch) {
  D.S = D.normalize(Object.assign(D.defaultState(), patch));
  D.emit('state:changed');                       // levels.js keshini bekor qiladi
  return L._collect();
}
const daysBack = (i) => D.addDays(TODAY, -i);

/* ================================================================= */
console.log('\n1. Daraja egri chizig‘i');
eq('birinchi daraja bepul', L.STEPS[0], 0);
eq('darajalar soni', L.STEPS.length, 50);
ok('narx o‘sib boradi', L.STEPS.every((v, i) => i === 0 || v > L.STEPS[i - 1]));
ok('50-daraja ~370 000 ochko', L.STEPS[49] > 300000 && L.STEPS[49] < 450000, L.STEPS[49]);
ok('2-daraja bir kunda olinadi', L.STEPS[1] <= 120, L.STEPS[1]);
ok('20-daraja bir kunda olinmaydi', L.STEPS[19] > 10000, L.STEPS[19]);
eq('bo‘sh ochko → 1-daraja', L._levelFor(0), 1);
eq('chegaradan bir past', L._levelFor(L.STEPS[1] - 1), 1);
eq('chegaraning o‘zi', L._levelFor(L.STEPS[1]), 2);
eq('chegaradan yuqorisi', L._levelFor(L.STEPS[9] + 1), 10);
eq('cheksiz ochko ham 50 da to‘xtaydi', L._levelFor(9e9), 50);

console.log('\n2. Nishonlar jadvali');
const ids = L.ALL.map((m) => m.id);
eq('nishonlar soni', ids.length, 49);
eq('id lar takrorlanmaydi', new Set(ids).size, ids.length);
ok('har nishonda bosqich rangi bor', L.ALL.every((m) => m.tier && m.tier.c));
ok('«Qirq kun» — oltin', L.ALL.find((m) => m.id === 'qirq40').tier.id === 'oltin');
ok('har oilaning bosqichlari o‘sib boradi', L.FAMS.every((f) => f.steps.every((v, i) => i === 0 || v > f.steps[i - 1])));

console.log('\n3. Bo‘sh holat');
let c = setState({});
eq('ochko yo‘q', c.xp, 0);
eq('daraja 1', L.info().level, 1);
eq('martaba — Niyat', L.info().rank.id, 'niyat');
eq('olingan nishon yo‘q', L.medals().filter((m) => m.on).length, 0);

console.log('\n4. Odat — kunlik chegara');
c = setState({ habits: [{ id: 'h1', name: 'a', sphere: 'tana', active: true, schedule: { type: 'daily' } }],
               logs: { [TODAY]: ['h1'] } });
eq('bitta belgi = 10 ochko', c.xp, 10);
const many = Array.from({ length: 12 }, (_, i) => 'h' + i);
c = setState({ logs: { [TODAY]: many } });
eq('12 ta belgi chegarada to‘xtaydi', c.xp, L.XP.habitCap);
eq('belgilar soni chegaradan qat’i nazar sanaladi', c.st.habitTicks, 12);

console.log('\n5. Kelajak kuni sanalmaydi');
c = setState({ logs: { [D.addDays(TODAY, 3)]: ['h1'], [TODAY]: ['h1'] } });
eq('faqat bugungisi', c.xp, 10);

console.log('\n6. Namoz');
const five = { bomdod: 'jamaat', peshin: 'jamaat', asr: 'jamaat', shom: 'jamaat', xufton: 'jamaat' };
c = setState({ prayers: { [TODAY]: five } });
eq('besh vaqt jamoat + to‘liqlik ustamasi', c.xp, 5 * L.XP.jamaat + L.XP.fivePrayers);
eq('namozlar sanaldi', c.st.prayers, 5);
eq('jamoat alohida sanaldi', c.st.jamaat, 5);
c = setState({ prayers: { [TODAY]: { bomdod: 'qaza', peshin: 'missed', asr: null, shom: 'alone', xufton: 'alone' } } });
eq('qazo va yakka — to‘liqlik ustamasisiz', c.xp, L.XP.qaza + 2 * L.XP.alone);
eq('o‘qilmagani sanalmaydi', c.st.prayers, 3);

console.log('\n7. «Qirq kun» — ketma-ketlik uziladi');
let pr = {};
for (let i = 0; i < 45; i++) pr[daysBack(i)] = Object.assign({}, five);
delete pr[daysBack(10)];                          // o‘rtada bitta kun yo‘q
c = setState({ prayers: pr });
eq('eng uzun zanjir 34 kun (o‘rtada uzilgan)', c.st.qirq, 34);
ok('40 kunlik nishon berilmaydi', !L.medals().find((m) => m.id === 'qirq40').done);
pr = {};
for (let i = 0; i < 41; i++) pr[daysBack(i)] = Object.assign({}, five);
c = setState({ prayers: pr });
eq('uzilmagan zanjir', c.st.qirq, 41);
ok('40 kunlik nishon berildi', L.medals().find((m) => m.id === 'qirq40').done);

console.log('\n8. Zikr, ro‘za, vazifa');
c = setState({ dhikr: { [TODAY]: { total: 100 } } });
eq('100 zikr = 3 × 33', c.xp, 3 * L.XP.dhikrXp);
c = setState({ dhikr: { [TODAY]: { total: 100000 } } });
eq('zikr chegarasi', c.xp, L.XP.dhikrCap);
c = setState({ fasting: { [TODAY]: { type: 'sunnah', done: true }, [daysBack(1)]: { type: 'nafl', done: false } } });
eq('faqat tutilgan ro‘za', c.st.fast, 1);
const ts = Date.UTC(2026, 8, 14, 9, 0, 0);
c = setState({ tasks: Array.from({ length: 10 }, (_, i) => ({ id: 't' + i, text: 'x', date: TODAY, done: true, doneAt: ts, priority: 2 })) });
eq('o‘nta vazifa chegarada', c.xp, L.XP.taskCap);
eq('vazifalar soni to‘liq', c.st.tasks, 10);

console.log('\n9. Uzluksizlik — eng uzun zanjir, oxirgisi emas');
const logs = {};
for (let i = 0; i < 12; i++) logs[daysBack(40 + i)] = ['h1'];   // eski 12 kunlik zanjir
for (let i = 0; i < 3; i++) logs[daysBack(i)] = ['h1'];         // yaqindagi 3 kun
c = setState({ logs });
eq('eng uzun zanjir', c.st.streak, 12);
ok('7 kunlik nishon berildi', L.medals().find((m) => m.id === 'kun7').done);
ok('30 kunlik hali yo‘q', !L.medals().find((m) => m.id === 'kun30').done);
const m30 = L.medals().find((m) => m.id === 'kun30');
eq('olinmagan nishonda ilgarilash ko‘rinadi', Math.round(m30.pct), 40);

console.log('\n10. Mukammal kun');
const hs = ['a', 'b', 'c'].map((x) => ({ id: x, name: x, sphere: 'tana', active: true, schedule: { type: 'daily' } }));
c = setState({ habits: hs, logs: { [TODAY]: ['a', 'b', 'c'] }, prayers: { [TODAY]: five } });
eq('hamma odat + besh vaqt', c.st.perfect, 1);
c = setState({ habits: hs, logs: { [TODAY]: ['a', 'b'] }, prayers: { [TODAY]: five } });
eq('bitta odat qolsa — mukammal emas', c.st.perfect, 0);
c = setState({ habits: hs.slice(0, 2), logs: { [TODAY]: ['a', 'b'] }, prayers: { [TODAY]: five } });
eq('ikkita odat bilan mukammal kun bo‘lmaydi', c.st.perfect, 0);

console.log('\n11. Nishon berilgandan keyin qaytarib olinmaydi');
c = setState({ logs: { [TODAY]: ['h1'] } });
D.S.awards.got.kun365 = '2026-01-01';
let med = L.medals().find((m) => m.id === 'kun365');
ok('sharti buzilgan bo‘lsa ham ko‘rinadi', med.on === true && med.done === false);

console.log('\n12. normalize — buzuq qiymatlar');
D.S = D.normalize(Object.assign(D.defaultState(), { awards: { got: { kun7: 'axlat', kun30: '2026-02-03', kun100: 0 }, level: -5, init: 1 } }));
eq('noto‘g‘ri sana → 0', D.S.awards.got.kun7, 0);
eq('to‘g‘ri sana qoladi', D.S.awards.got.kun30, '2026-02-03');
eq('nol qoladi', D.S.awards.got.kun100, 0);
eq('manfiy daraja → 0', D.S.awards.level, 0);
eq('init mantiqiy qiymat', D.S.awards.init, true);

console.log('\n13. merge — nishon yo‘qolmaydi, erta sana yutadi');
const A = D.normalize(D.defaultState()), B = D.normalize(D.defaultState());
A.meta.updatedAt = 1000; B.meta.updatedAt = 2000;
A.awards = { got: { kun7: '2026-03-01', kun30: '2026-05-05' }, level: 9, init: true };
B.awards = { got: { kun7: '2026-02-01', namoz100: 0 }, level: 12, init: false };
const M = D.merge(A, B);
eq('faqat serverda bor nishon saqlandi', M.awards.got.kun30, '2026-05-05');
eq('faqat lokalda bor nishon saqlandi', M.awards.got.namoz100, 0);
eq('ikkalasida bor — erta sana', M.awards.got.kun7, '2026-02-01');
eq('daraja — kattasi', M.awards.level, 12);
eq('init — bittasida bo‘lsa yetadi', M.awards.init, true);
const M2 = D.merge(B, A);                        // teskari tomondan ham bir xil
eq('tartibga bog‘liq emas (sana)', M2.awards.got.kun7, '2026-02-01');
eq('tartibga bog‘liq emas (daraja)', M2.awards.level, 12);
eq('tartibga bog‘liq emas (soni)', Object.keys(M2.awards.got).length, 3);

console.log('\n14. Chizish — HTML quriladimi');
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));   // haqiqiy matnlar
setState({ habits: hs, logs: { [TODAY]: ['a', 'b', 'c'] }, prayers: { [TODAY]: five },
           gratitude: [{ id: 'g1', date: TODAY, text: 'shukr' }] });
D.S.awards.got.kun7 = '2026-08-01';
D.S.awards.got.namoz100 = 0;
for (const lang of ['uz', 'uzk', 'ru']) {
  D.S.settings.lang = lang;
  const card = L.cardHtml(), sheet = D.levels.ALL.length && (() => { let h = ''; try { h = evalSheet(); } catch (e) { h = 'XATO ' + e.message; } return h; })();
  ok(lang + ': karta quriladi', card.length > 200 && card.indexOf('lv-hero') > 0);
  ok(lang + ': kartada tarjima qilinmagan kalit yo‘q', !/>lv\.[a-z.]+</.test(card), card.match(/lv\.[a-z.]+/g));
  ok(lang + ': kartada undefined yo‘q', card.indexOf('undefined') < 0);
  ok(lang + ': oyna quriladi', sheet.length > 1000 && sheet.indexOf('lv-fam') > 0);
  ok(lang + ': oynada tarjima qilinmagan kalit yo‘q', !/>lv\.[a-z.]+</.test(sheet), (sheet.match(/lv\.[a-z.]+/g) || []).slice(0, 4));
  ok(lang + ': oynada undefined yo‘q', sheet.indexOf('undefined') < 0);
}
/** Oyna HTML ini olish uchun D.sheet ni bir marta ushlab qolamiz. */
function evalSheet() {
  let html = '';
  const old = D.sheet;
  D.sheet = (h) => { html = h; };
  try { L.open(); } finally { D.sheet = old; }
  return html;
}

/* ================================================================= */
console.log('\n' + (fail ? `${fail} / ${n} tekshiruv YIQILDI` : `hammasi joyida — ${n} ta tekshiruv`) + '\n');
process.exit(fail ? 1 : 0);
