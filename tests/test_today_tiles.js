/* Asosiy: bosh karta, odat va vazifani belgilash. Ishga tushirish: node tests/test_today_tiles.js */
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

console.log('\n1. WHOOP ulangan — bosh karta, uyqu, zo\'riqish');
D.S.whoop.connected = true;
D.whoop.day = () => ({ recovery: 72, stages: { deep: 5520000, rem: 6480000, light: 13860000, awake: 840000 }, bedTs: '2026-09-14T18:40:00.000Z', wakeTs: '2026-09-15T02:05:00.000Z' });
D.whoop.workoutsOn = () => [{ mins: 52 }];
D.S.habits = [{ id: 'h1', name: 'Kitob', sphere: 'aql', active: true, schedule: { type: 'daily' }, order: 0 },
  { id: 'h2', name: 'Zikr', sphere: 'ruh', active: true, schedule: { type: 'daily' }, target: { n: 99, unit: 'marta' }, order: 1 },
  { id: 'h3', name: 'Bomdod', sphere: 'ruh', active: true, schedule: { type: 'daily' }, order: 2 }];
D.prayer = { matchName: (n) => (n === 'Bomdod' ? 'bomdod' : null) };
D.S.tasks = [{ id: 't1', text: 'Hisobot', date: TODAY, done: false, priority: 3 }, { id: 't2', text: 'Eski ish', date: '2020-01-01', done: false, priority: 2 }];
D.S.goals = [{ id: 'g1', text: 'Maqsad', dir: 'shaxsiy', priority: 1, year: +TODAY.slice(0, 4), done: false }];
let h = render();
ok('bosh karta yashil', /hero--yashil/.test(h));
ok('uch halqa', count(h, /class="td-rg-f"/g) === 3, count(h, /class="td-rg-f"/g));
ok('o\'rtada 72 %', /<b class="num">72<small>%<\/small><\/b>/.test(h));
ok('bosh karta → Tana/ready', /data-view="health" data-sub="ready"/.test(h));
ok('Uyqu kartasi → Tana/sleep', /td-sleep" data-act="go" data-view="health" data-sub="sleep"/.test(h));
ok('Zo\'riqish kartasi → Tana/strain', /td-strain" data-act="go" data-view="health" data-sub="strain"/.test(h));
ok('zo\'riqish 12,4', /12,4/.test(h));
ok('uyqu bosqichlari to\'rtta', count(h, /class="dot" style="--c:#/g) === 4, count(h, /class="dot" style="--c:#/g));
ok('yotish/turish vaqti ISO satrdan o\'qiladi (23:40 · 07:05)', /23:40 da yotdingiz · 07:05 da turdingiz/.test(h), (h.match(/td-foot[^<]*<\/p>|td-foot num">[^<]*/) || [''])[0]);
ok('yetti kunlik ustunlar', count(h, /class="td-w7c/g) === 7, count(h, /class="td-w7c/g));
ok('ustun kunni ochadi (tdPickDay)', count(h, /data-act="tdPickDay"/g) === 7);
ok('eski plitka va hafta chizig\'i yo\'q', !/class="card tile|td-week|td-wd |td-pr-rows/.test(h));
ok('Ovqat plitkasi yo\'q (Tanada bor)', !/data-sub="ovqat"/.test(h));

console.log('\n2. Odat va vazifa shu sahifada belgilanadi');
ok('odat katagi: namoz nomli odat chiqarilgan', count(h, /data-act="tdHabit"/g) === 2, count(h, /data-act="tdHabit"/g));
ok('«Yangi odat» katagi', /data-act="tdHabitNew"/.test(h));
ok('vazifa katagi: bugungi + kechikkan', count(h, /data-act="tdTask"/g) === 2, count(h, /data-act="tdTask"/g));
ok('kechikkan vazifa «vaqti o\'tdi»', /td-tag late/.test(h));
ok('muhim vazifa «Muhim»', /td-tag imp/.test(h));
D.act.tdHabit({ dataset: { id: 'h1', kind: 'h' } });
ok('oddiy odat bosilsa S.logs ga yoziladi', (D.S.logs[TODAY] || []).includes('h1'));
D.act.tdHabit({ dataset: { id: 'h1', kind: 'h' } });
ok('yana bosilsa belgi olinadi va bo\'sh kun kaliti o\'chadi', !D.S.logs[TODAY]);
D.act.tdHabit({ dataset: { id: 'h2', kind: 'h' } });
ok('tasbeh odati bir bosishda 33', (D.S.counts[TODAY] || {}).h2 === 33, D.S.counts[TODAY]);
D.act.tdHabit({ dataset: { id: 'h2', kind: 'h' } }); D.act.tdHabit({ dataset: { id: 'h2', kind: 'h' } });
ok('me\'yorga yetganda bajarilgan (S.logs)', (D.S.counts[TODAY] || {}).h2 === 99 && (D.S.logs[TODAY] || []).includes('h2'));
h = render();
ok('bajarilgan odat yashil belgi bilan', /td-hb done/.test(h) && /td-hb-ok/.test(h));
let asked = '';
D.loadView = (v) => { asked = v; return { then: (f) => f() }; };
let toggled = null; D.act.tkToggle = (el) => { toggled = el.dataset.id; };
D.act.tdTask({ dataset: { id: 't1' } });
D.act.tdTask({ dataset: { id: 't1' } });   // modul yuklanayotganda ikkinchi bosish — e'tiborga olinmasligi kerak
let toggles = 0; const tk0 = D.act.tkToggle; D.act.tkToggle = (el) => { toggles++; tk0(el); };
const lateChecks = () => {
  ok('vazifa Vazifa bo\'limining o\'z amali bilan belgilanadi', asked === 'tasks' && toggled === 't1', { asked, toggled });
  ok('yuklanish paytidagi ikkinchi bosish takrorlanmaydi', toggles === 1, toggles);
};
ok('maqsad kartasi → Vazifa/goals', /td-gl[^>]*data-view="tasks" data-sub="goals"/.test(h));
ok('Kun yakuni qatori', /data-act="tdWrap"/.test(h));

console.log('\n2b. Tiklanish hali kelmagan kun — uyqu va zo\'riqish baribir ko\'rinadi');
{ const di = D.whoop.dayInsight;
  D.whoop.dayInsight = () => ({ recovery: null, sleepH: 6.5, needH: 8, gapH: -1.5, metPct: 81, perf: 80, strain: 5.2, kcal: 1800, hrv: null, rhr: null, resp: null });
  const hh = render();
  ok('bosh karta chiziladi, o\'rtada «—»', /td-rings-c wait"><b class="num">—<\/b>/.test(hh), (hh.match(/td-rings-c[^<]*<b[^<]*<\/b>/) || [''])[0]);
  ok('tushuntirish qutisi bor', /hali hisoblanmagan/i.test(hh));
  ok('uyqu va zo\'riqish kartalari bor', /td-sleep/.test(hh) && /td-strain/.test(hh));
  ok('NaN / undefined yo\'q', !/NaN|undefined/.test(hh));
  ok('«ma\'lumot yo\'q» kartasi chiqmaydi', !/td-nowh/.test(hh));
  D.whoop.dayInsight = () => ({ recovery: null, sleepH: null, strain: null });
  ok('umuman ma\'lumot bo\'lmasa — bitta karta', /td-nowh/.test(render()));
  D.whoop.dayInsight = di; }

console.log('\n3. Soat ulanmagan — bitta karta');
D.S.whoop.connected = false;
h = render();
ok('«WHOOP ulanmagan» kartasi', /td-nowh/.test(h) && /WHOOP ulanmagan/.test(h));
ok('halqa yo\'q', !/td-rings/.test(h));
ok('odatlar baribir bor', /td-habits/.test(h));

console.log('\n4. O\'tgan kun');
D.S.whoop.connected = true;
D.ui.viewDate = '2026-09-10';
h = render();
ok('daraja kartasi yo\'q', !/td-lv"/.test(h));
ok('«Yangi odat» katagi yo\'q', !/tdHabitNew/.test(h));
D.ui.viewDate = null;

console.log('\n5. Uch til');
ok('yangi kalitlar uchala tilda', ['uz', 'uzk', 'ru'].every((l) => { D.S.settings.lang = l; return ['today.now', 'today.hb.sub', 'today.tk.title', 'today.gl.left', 'today.strain.note', 'today.explain', 'today.hi.day'].every((k) => D.t(k) !== k); }));
D.S.settings.lang = 'uz';

setTimeout(() => {
lateChecks();
console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
}, 20);
