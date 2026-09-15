/* Energiya va kunlik me'yorlar (js/whoop.js + js/food.js) — TDEE qayerdan
   kelishi, maqsad ulushi, oqsil va suv me'yori. Haqiqiy core.js/whoop.js/
   food.js yuklanadi: xato taqlidda emas, aynan modullar chegarasida tug'iladi
   — faollik jadvali ikkiga bo'linib ketgani ham o'sha chegarada bo'lgan.
   Ishga tushirish:  node tests/test_energy.js                                 */
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

const TODAY = '2026-09-14';
D.today = () => TODAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.modal = noop; D.sheet = noop; D.toast = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'whoop.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'food.js'), 'utf8'));

/* ---------- mayda yordamchilar ---------- */
let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  -> ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }
function near(name, got, want, tol) { ok(name + '  (' + got + ')', Math.abs(got - want) <= tol, { got, want, tol }); }

/** Profil va WHOOP kunlarini qo'yib, holatni tiklaydi. */
function setState(o) {
  o = o || {};
  const s = D.defaultState();
  Object.assign(s.settings, o.settings || {});
  Object.assign(s.profile, { heightCm: 180, weightKg: 80, birthYear: 1995, sex: 'm', activity: 3, goal: 'keep' }, o.profile || {});
  if (o.whoopDays) { s.whoop.connected = true; s.whoop.days = o.whoopDays; s.whoop.workouts = o.workouts || []; }
  D.S = D.normalize(s);
  return D.S;
}
/** Ro'yxatdagi kaloriyalar kechagi kundan orqaga qarab yoziladi. */
function burnDays(list, includeToday) {
  const days = {};
  let k = D.addDays(TODAY, -1);
  for (const v of list) { days[k] = { kcal: v, strain: 12, recovery: 60 }; k = D.addDays(k, -1); }
  if (includeToday !== undefined) days[TODAY] = { kcal: includeToday };
  return days;
}
const STEADY = [3050, 2980, 3200, 3100, 2900, 3300, 3000, 3150, 2850, 3050, 3120, 2990, 3080, 3010, 2960, 3220, 3070, 2940, 3190, 3030];

/* ================================================================= */
console.log('\n1. Energiya manbai');
setState();
const est = D.whoop.energy();
eq('WHOOP yo‘q — taxminiy manba', est.source, 'estimated');
eq('TDEE = BMR x D.activityFactor(3)', est.tdee, Math.round(est.bmr * D.activityFactor(3)));
eq('yosh birthYear dan (profile.age null bo‘lsa ham)', est.age, D.nowTz().y - 1995);
eq('BMR Mifflin-St Jeor bo‘yicha', est.bmr, Math.round(10 * 80 + 6.25 * 180 - 5 * est.age + 5));

setState({ whoopDays: burnDays(STEADY) });
const meas = D.whoop.energy();
eq('20 kun sikl bor — o‘lchangan manba', meas.source, 'measured');
eq('yigirmatasi ham sanaldi', meas.days, 20);
near('TDEE o‘lchangan sarfning qirqilgan o‘rtachasi', meas.tdee, 3050, 60);
ok('o‘lchangan qiymat formuladan farq qiladi', meas.tdee !== est.tdee, { olchangan: meas.tdee, formula: est.tdee });

setState({ whoopDays: burnDays(STEADY, 400) });
eq('bugungi to‘lmagan sikl hisobga kirmaydi', D.whoop.energy().days, 20);
near('shuning uchun TDEE pasaymaydi', D.whoop.energy().tdee, meas.tdee, 1);

setState({ whoopDays: burnDays(STEADY.slice(0, 9)) });
eq('9 kun yetmaydi — formulaga qaytadi', D.whoop.energy().source, 'estimated');
setState({ whoopDays: burnDays(STEADY.slice(0, 10)) });
eq('10 kun yetarli', D.whoop.energy().source, 'measured');

setState({ whoopDays: burnDays([3000, 3100, 2900, 3050, 120, 3000, 2950, 3100, 3020, 2980, 3060, 2990]) });
eq('taqilmagan kun (120 kkal) tashlanadi', D.whoop.energy().days, 11);

setState({ whoopDays: burnDays([3000, 3050, 2950, 3100, 3000, 9800, 2980, 3020, 3060, 2900, 3040, 3010]) });
near('bitta marafon o‘rtachani buzmaydi', D.whoop.energy().tdee, 3010, 90);

setState({ profile: { weightKg: null, heightCm: null } });
eq('vazn yo‘q — energiya yo‘q', D.whoop.energy(), null);
setState({ profile: { heightCm: null, birthYear: null } });
const rough = D.whoop.energy();
ok('bo‘y/yosh yo‘q — baho o‘chmaydi, taxminiy deb belgilanadi', rough.approx === true && rough.tdee > 0, rough);

console.log('\n2. Ovqat va Sog‘liq bitta raqamni ko‘rsatadi');
setState({ whoopDays: burnDays(STEADY) });
eq('D.food.targets() TDEE si = D.whoop.energy() TDEE si', D.food.targets().tdee, D.whoop.energy().tdee);
eq('D.whoop.tdee() ham o‘sha', D.whoop.tdee(), D.whoop.energy().tdee);
eq('manba me‘yor bilan birga uzatiladi', D.food.targets().source, 'measured');

console.log('\n3. Maqsad — me‘yorning ulushi');
const T = {};
['lose', 'keep', 'gain'].forEach(function (g) {
  setState({ whoopDays: burnDays(STEADY), profile: { goal: g } });
  T[g] = D.food.targets();
});
ok('tashlash < saqlash < olish', T.lose.kcal < T.keep.kcal && T.keep.kcal < T.gain.kcal, T);
near('taqchillik TDEE ning 20 % i', T.keep.kcal - T.lose.kcal, Math.round(T.keep.tdee * 0.2), 5);
near('qo‘shimcha TDEE ning 12 % i', T.gain.kcal - T.keep.kcal, Math.round(T.keep.tdee * 0.12), 5);
['lose', 'keep', 'gain'].forEach(function (g) {
  near('makrolar yig‘indisi kkal ga teng: ' + g, T[g].p * 4 + T[g].c * 4 + T[g].f * 9, T[g].kcal, 12);
  ok('me‘yor BMR dan past emas: ' + g, T[g].kcal >= T[g].bmr, { kcal: T[g].kcal, bmr: T[g].bmr });
  near('yog‘ kkal ning 25 % i: ' + g, (T[g].f * 9) / T[g].kcal, 0.25, 0.01);
});
ok('taqchillikda oqsil ko‘proq', T.lose.p > T.keep.p, { lose: T.lose.p, keep: T.keep.p });
eq('tashlashda 2,0 g/kg', T.lose.p, Math.round(80 * 2.0));
eq('saqlashda 1,6 g/kg', T.keep.p, Math.round(80 * 1.6));
eq('olishda 1,8 g/kg', T.gain.p, Math.round(80 * 1.8));

console.log('\n4. Kichik odam — qat‘iy −400 xavfli edi');
setState({ profile: { weightKg: 48, heightCm: 158, sex: 'f', activity: 1, goal: 'lose' } });
const sm = D.food.targets(), se = D.whoop.energy();
ok('me‘yor BMR dan past emas', sm.kcal >= se.bmr, { kcal: sm.kcal, bmr: se.bmr, tdee: se.tdee });
const eski = Math.max(1200, Math.round(se.tdee - 400));
ok('eski qat‘iy −400 bu odam uchun 24 % dan oshiq taqchillik edi',
  (se.tdee - eski) / se.tdee > 0.23, { tdee: se.tdee, eskiKcal: eski, ulush: +((se.tdee - eski) / se.tdee).toFixed(3) });
near('yangi qoida 20 % da ushlab turadi', (se.tdee - sm.kcal) / se.tdee, 0.20, 0.01);
ok('ya‘ni yangi me‘yor eskisidan yuqori', sm.kcal > eski, { yangi: sm.kcal, eski: eski });

console.log('\n5. Oqsil qoidasi bitta joyda');
setState({ whoopDays: burnDays(STEADY), profile: { goal: 'lose' } });
eq('fillTargets ham o‘sha 2,0 g/kg ni beradi',
  D.food.fillTargets({ kcal: 2400, p: null, c: null, f: null }).p, Math.round(80 * 2.0));

console.log('\n6. Suv me‘yori');
setState({ profile: { birthYear: 1960 }, settings: { waterMl: 50 } });
const keksa = D.food.water(TODAY).goal;
setState({ profile: { birthYear: 1995 }, settings: { waterMl: 50 } });
const yosh = D.food.water(TODAY).goal;
ok('50 dan oshgan yosh qo‘shimcha beradi (birthYear dan o‘qiladi)', keksa > yosh, { keksa: keksa, yosh: yosh });

setState({ whoopDays: burnDays(STEADY), settings: { waterMl: 50 } });
const mashqsiz = D.food.water(TODAY).goal;
setState({ whoopDays: burnDays(STEADY), settings: { waterMl: 50 }, workouts: [{ id: 'w1', k: TODAY, mins: 60, sport: 'run' }] });
const mashqli = D.food.water(TODAY).goal;
ok('bir soatlik mashg‘ulot me‘yorni oshiradi', mashqli > mashqsiz, { mashqli: mashqli, mashqsiz: mashqsiz });

setState({ whoopDays: burnDays(STEADY), settings: { waterMl: 50 }, workouts: [{ id: 'w1', k: TODAY, mins: 600, sport: 'run' }] });
const cheksiz = D.food.water(TODAY).goal;
const ml = Math.max(50, +D.S.settings.waterMl || 250);
ok('qo‘shimcha +1 500 ml bilan chegaralangan', (cheksiz - mashqsiz) * ml <= 1500 + ml,
  { farqMl: (cheksiz - mashqsiz) * ml });

setState({ whoopDays: burnDays(STEADY), settings: { waterMl: 50 }, workouts: [{ id: 'w1', k: D.addDays(TODAY, -3), mins: 90, sport: 'run' }] });
eq('boshqa kundagi mashg‘ulot bugungi me‘yorga tegmaydi', D.food.water(TODAY).goal, mashqsiz);

/* ================================================================= */
console.log('');
if (fail) { console.log('  ' + fail + ' ta tekshiruv yiqildi (' + n + ' tadan)'); process.exit(1); }
console.log('hammasi joyida — ' + n + ' ta tekshiruv');
