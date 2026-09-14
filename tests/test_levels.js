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
eq('nishonlar soni', ids.length, 84);
eq('id lar takrorlanmaydi', new Set(ids).size, ids.length);
ok('har nishonda bosqich bor', L.ALL.every((m) => L.TIERS.includes(m.tier)));
ok('«Qirq kun» — oltin', L.ALL.find((m) => m.id === 'qirq40').tier === 'oltin');
ok('sirli nishonlar olmos', L.ALL.filter((m) => m.secret).every((m) => m.tier === 'olmos'));
eq('sirli nishonlar soni', L.ALL.filter((m) => m.secret).length, 3);
ok('har oilada o‘lchov manbasi bor', L.FAMS.every((f) => L.ALL.some((m) => m.fam === f.id)));
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

console.log('\n14. Haftalik sinov — hafta kalitidan, saqlanmasdan');
const wkNow = D.weekKey(TODAY);
ok('bir xil hafta — bir xil sinov', L._weekPick(wkNow).id === L._weekPick(wkNow).id);
ok('sinov jadvaldan olinadi', L.WEEKLY.some((w) => w.id === L._weekPick(wkNow).id));
const picks = new Set();
for (let i = 0; i < 40; i++) picks.add(L._weekPick(D.weekKey(D.addDays(TODAY, -7 * i))).id);
ok('qirq haftada kamida uch xil sinov chiqadi', picks.size >= 3, Array.from(picks));
/* Sinovni bajarib ko'ramiz. TUGAGAN hafta olinadi: TODAY dushanbaga to'g'ri
   kelsa joriy haftada atigi bitta kun bo'ladi va 15 ta jamoat namozini
   joylashtirib bo'lmaydi. Test kalendarga bog'liq bo'lmasligi kerak. */
const prevWk = D.weekKey(daysBack(7));
const prevDays = [];
for (let i = 1; i <= 21 && prevDays.length < 7; i++) { const k = daysBack(i); if (D.weekKey(k) === prevWk) prevDays.push(k); }
eq('tugagan haftada yetti kun bor', prevDays.length, 7);
const wSpec = L._weekPick(prevWk);
// bir kunda ko'pi bilan nechta bo'lishi mumkin — o'lchov turiga qarab
const PER = { habits: 9, jamaat: 5, zikr: 400, sleep7: 1, note: 1, workouts: 3, food: 1, tasks: 4, fast: 1, perfect: 1 };
function fillWeek(days, field, total) {
  const s = { habits: [], logs: {}, prayers: {}, dhikr: {}, fasting: {}, notes: {}, tasks: [],
              whoop: { connected: false, lastSync: null, cache: {}, days: {}, workouts: [], body: {} },
              food: { logs: {}, targets: { kcal: null, p: null, c: null, f: null, auto: true } } };
  const per = PER[field];
  let left = total;
  for (const k of days) {
    if (left <= 0) break;
    const take = Math.min(per, left);
    if (field === 'habits') s.logs[k] = Array.from({ length: take }, (_, i) => 'h' + i);
    if (field === 'jamaat') { s.prayers[k] = {}; D.PRAYERS.slice(0, take).forEach((x) => { s.prayers[k][x] = 'jamaat'; }); }
    if (field === 'zikr') s.dhikr[k] = { total: take, sessions: [] };
    if (field === 'sleep7') s.whoop.days[k] = { sleepH: 8 };
    if (field === 'note') s.notes[k] = 'x';
    if (field === 'workouts') for (let i = 0; i < take; i++) s.whoop.workouts.push({ id: 'w' + k + i, k, start: 0 });
    if (field === 'food') s.food.logs[k] = [{ id: 'f' + k, ts: 0, name: 'x', kcal: 1, p: 0, c: 0, f: 0 }];
    if (field === 'tasks') for (let i = 0; i < take; i++) s.tasks.push({ id: 't' + k + i, text: 'x', date: k, done: true, doneAt: null, priority: 2 });
    if (field === 'fast') s.fasting[k] = { type: 'nafl', done: true };
    if (field === 'perfect') {
      s.habits = ['a', 'b', 'c'].map((x, i) => ({ id: x, name: x, sphere: 'tana', active: true, schedule: { type: 'daily' }, order: i }));
      s.logs[k] = ['a', 'b', 'c'];
      s.prayers[k] = { bomdod: 'jamaat', peshin: 'jamaat', asr: 'jamaat', shom: 'jamaat', xufton: 'jamaat' };
    }
    left -= take;
  }
  return s;
}
c = setState(fillWeek(prevDays, wSpec.f, wSpec.n));
eq('o‘tgan haftaning sinovi bajarildi (' + wSpec.id + ')', c.st.challenges, 1);
eq('sinov nishon o‘lchoviga tushdi', L.medals().find((m) => m.id === 'sinov5').cur, 1);
c = setState(fillWeek(prevDays, wSpec.f, wSpec.n - 1));
eq('bir dona kam — bajarilmagan', c.st.challenges, 0);
setState({});
const w = L.week();
eq('bo‘sh holatda sinov bajarilmagan', w.done, false);
eq('bo‘sh holatda ilgarilash nol', w.cur, 0);
eq('joriy hafta maqsadi jadvaldagidek', w.need, L._weekPick(D.weekKey(TODAY)).n);
ok('kun sanog‘i 0..6', w.daysLeft >= 0 && w.daysLeft <= 6, w.daysLeft);

console.log('\n15. Sirli nishonlar va yangi o‘lchovlar');
// Sahar: 30 kun ketma-ket bomdod jamoat bilan
pr = {};
for (let i = 0; i < 31; i++) pr[daysBack(i)] = { bomdod: 'jamaat', peshin: 'alone', asr: null, shom: null, xufton: null };
c = setState({ prayers: pr });
eq('sahar zanjiri', c.st.sahar, 31);
ok('«Sahar» nishoni berildi', L.medals().find((m) => m.id === 'sahar30').done);
// Qaytish: uzoq tanaffusdan keyin 30 kun
const lg = {};
for (let i = 0; i < 20; i++) lg[daysBack(120 + i)] = ['h1'];   // eski davr
for (let i = 0; i < 30; i++) lg[daysBack(i)] = ['h1'];         // 70 kunlik tanaffusdan keyin
c = setState({ logs: lg });
eq('tanaffusdan keyingi zanjir', c.st.comeback, 30);
ok('«Qaytish» nishoni berildi', L.medals().find((m) => m.id === 'qaytish30').done);
// tanaffussiz uzluksiz yozuvda «Qaytish» bo'lmaydi
const lg2 = {};
for (let i = 0; i < 90; i++) lg2[daysBack(i)] = ['h1'];
c = setState({ logs: lg2 });
eq('tanaffus bo‘lmasa — qaytish yo‘q', c.st.comeback, 0);
ok('«Qaytish» berilmaydi', !L.medals().find((m) => m.id === 'qaytish30').done);
// To'liq oy: tugagan oyning hamma kuni yozilgan bo'lsa
const lg3 = {};
for (let d = 1; d <= 31; d++) lg3['2026-08-' + D.pad2(d)] = ['h1'];
for (let d = 1; d <= 30; d++) lg3['2026-06-' + D.pad2(d)] = ['h1'];
for (let d = 1; d <= 14; d++) lg3['2026-09-' + D.pad2(d)] = ['h1'];   // joriy oy — sanalmaydi
c = setState({ logs: lg3 });
eq('to‘liq oylar', c.st.fullMonths, 2);
// sirli nishon olinmagunicha sharti ko'rsatilmaydi
const secret = L.medals().find((m) => m.id === 'toliqoy12');
ok('sirli nishon hali olinmagan', !secret.done);
ok('sirli nishon belgisi bor', secret.secret === true);

console.log('\n16. Kunlik ochko va bugungi hisob');
c = setState({ logs: { [TODAY]: ['a', 'b'], [daysBack(1)]: ['a'] } });
eq('bugungi ochko', L.info().todayXp, 20);
eq('kechagi ochko alohida', c.days.get(daysBack(1)), 10);
eq('jami — ikkalasining yig‘indisi', c.xp, 30);

console.log('\n17. Chizish — HTML quriladimi');
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
