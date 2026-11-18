/* Qadamlar (js/whoop.js + js/today.js) — WHOOP cycle.step_count snapshotdan
   kunlarga tushishi, bugun jonli sikldan o'qilishi, maqsad, km, 7 kunlik karta
   va Bugun sahifasida kartaning joyi. Haqiqiy core.js/whoop.js/today.js yuklanadi.
   Ishga tushirish:  node tests/test_steps.js                                  */
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

const TODAY = '2026-11-18';
D.today = () => TODAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.modal = noop; D.sheet = noop; D.toast = noop;

eval(fs.readFileSync(path.join(ROOT, 'js', 'whoop.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));


let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  -> ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }

function fresh(profile) {
  const s = D.defaultState();
  Object.assign(s.profile, { heightCm: 180, sex: 'm' }, profile || {});
  s.whoop.connected = true;
  D.S = D.normalize(s);
}
/** Sikl: uyg'onish ~07:00 (Toshkent) = 02:00Z; kun kaliti start+12h dan. */
function cyc(day, steps, end) {
  return { id: 'c' + day, start: day + 'T02:00:00.000Z', end: end === false ? null : day + 'T19:00:00.000Z', strain: 8.1, kcal: 2100, steps };
}
const back = (j) => D.addDays(TODAY, -j);

console.log('— snapshot → kunlar');
fresh();
const snap = { recovery: [], sleep: [], workout: [], body: {}, profile: {}, cycle: [
  cyc(back(0), 3098, false), cyc(back(1), 3203), cyc(back(2), 3370), cyc(back(3), 4028), cyc(back(4), 5590), cyc(back(5), 2680), cyc(back(6), 4203), cyc(back(7), null) ] };
D.whoop._applySnapshot(snap);
eq('bugun — jonli sikldan', D.whoop.steps(TODAY), 3098);
eq('kecha', D.whoop.steps(back(1)), 3203);
eq('qadamsiz sikl — null (0 emas)', D.whoop.steps(back(7)), null);
eq('yozuvi yo\'q kun — null', D.whoop.steps(back(30)), null);
ok('hasSteps', D.whoop.hasSteps());

console.log('— maqsad');
eq('standart maqsad 10 000', D.whoop.stepGoal(), 10000);
D.S.profile.stepGoal = 8000; eq('profildagi maqsad', D.whoop.stepGoal(), 8000);
D.S.profile.stepGoal = 12; eq('mantiqsiz maqsad → standart', D.whoop.stepGoal(), 10000);
D.S.profile.stepGoal = null;

console.log('— masofa (taxminiy, bo\'ydan)');
const km = D.whoop.stepsKm(10000);
ok('180 sm, erkak: 10 000 qadam ≈ 7,47 km', Math.abs(km - 7.47) < 0.01, km);
D.S.profile.sex = 'f'; D.S.profile.heightCm = 160;
ok('160 sm, ayol: 10 000 qadam ≈ 6,61 km', Math.abs(D.whoop.stepsKm(10000) - 6.608) < 0.01, D.whoop.stepsKm(10000));
D.S.profile.sex = 'm'; D.S.profile.heightCm = 180;

console.log('— o\'rtacha');
eq('30 kunlik o\'rtacha bugunni qo\'shmaydi', D.whoop.stepsAvg(30), Math.round((3203 + 3370 + 4028 + 5590 + 2680 + 4203) / 6));

console.log('— karta');
const sp = (x) => x.replace(/[\u00a0\u202f]/g, ' ');   // ru-RU ming ajratgichi — bo'linmas bo'shliq
const html = sp(D.whoop.stepsCard(TODAY));
ok('karta chiziladi', html.includes('class="card hero hero--qadam stp'));
ok('katta raqam 3 098', html.includes('3 098'), html.slice(0, 300));
ok('7 ta ustun', (html.match(/class="stp-c/g) || []).length === 7);
ok('ustunlar kun ochadi (tdPickDay)', html.includes('data-act="tdPickDay"'));
ok('haftalik jami 26 172', html.includes('26 172'));
ok('me\'yor foizi 37% (26 172 / 70 000)', html.includes('37%'));
ok('maqsadgacha qoldiq', html.includes('6 902'));
ok('o\'rtachadan past → ▼', html.includes('stp-avg down'));
const hp = D.whoop.stepsCard(TODAY, { pick: false, note: false });
ok('Sog\'liq sahifasida ustun tugma emas', !hp.includes('tdPickDay') && !hp.includes('wh-fine'));
D.S.profile.stepGoal = 3000;
ok('maqsad bajarilgan kunlar yashil (hit): 6 ta, 2 680 — yo\'q', (D.whoop.stepsCard(TODAY).match(/stp-c[^"]*hit/g) || []).length === 6);
D.S.profile.stepGoal = null;
const past = sp(D.whoop.stepsCard(back(4)));
ok('o\'tgan kun: o\'sha kunning qadami', past.includes('5 590') && past.includes('cur hit') === false);
ok('ustun balandligi ≥3% (kichik qiymat ham ko\'rinadi)', !/height:[0-2]\.\d%/.test(html));

console.log('— qadamsiz');
fresh();
D.whoop._applySnapshot({ recovery: [], sleep: [], workout: [], cycle: [cyc(back(0), null, false)] });
eq('WHOOP qadam bermasa karta yo\'q', D.whoop.stepsCard(TODAY), '');
D.S.whoop.connected = false;
eq('WHOOP ulanmagan — karta yo\'q', D.whoop.stepsCard(TODAY), '');

console.log('— Bugun sahifasi: karta bosh kartadan keyin');
fresh();
D.whoop._applySnapshot(snap);
D.saveUi = noop; D.current = () => 'today'; D.levels = null; D.prayer = null; D.patch = noop;
D.food = { dayTotals: () => ({ kcal: 0, p: 0, c: 0, f: 0 }), targets: () => ({ kcal: 2500 }), water: () => ({ n: 0, goal: 8 }) };
eval(fs.readFileSync(path.join(ROOT, 'js', 'today.js'), 'utf8'));
const page = D.views.today.render();
const iHero = page.indexOf('td-hero'), iSteps = page.indexOf('hero--qadam'), iSleep = page.indexOf('td-sleep');
ok('Bugun sahifasida qadamlar bor', iSteps > 0);
ok('tartib: bosh karta → qadamlar → uyqu', iHero >= 0 && iHero < iSteps && (iSleep < 0 || iSteps < iSleep), { iHero, iSteps, iSleep });

console.log('— tarjima');
for (const lang of ['uz', 'uzk', 'ru']) {
  const miss = ['wh.sp.title', 'wh.sp.steps', 'wh.sp.goal', 'wh.sp.left', 'wh.sp.done', 'wh.sp.vsAvg', 'wh.sp.week', 'wh.sp.14', 'wh.sp.sum', 'wh.sp.none', 'wh.sp.note', 'wh.sp.legend', 'wh.sp.setGoal', 'wh.sp.dToday']
    .filter((k) => !(D.i18n.dict && D.i18n.dict[lang] ? D.i18n.dict[lang][k] : true));
  ok(lang + ': hamma kalit bor', !miss.length, miss);
}

console.log(fail ? `\n${fail} ta XATO (${n} dan)` : `\nhammasi joyida — ${n} ta tekshiruv`);
process.exit(fail ? 1 : 0);
