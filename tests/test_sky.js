/* Osmon — kun fazasi (js/prayer.js sky(), css/whoop-ui.css 18-bo'lim).

   Bu sinov bitta jimgina xato turini ovlaydi: JS qaytargan faza nomiga CSS'da
   qoida bo'lmasligi. Unda hech narsa yiqilmaydi, xato ham chiqmaydi — shunchaki
   fon o'sha faza davomida bo'sh qoladi va buni faqat o'sha soatlarda ilovaga
   qaragan odam payqaydi. Shuning uchun nomlar ikkala fayldan o'qib solishtiriladi.

   Qolgan tekshiruvlar: faza kun bo'yi uzluksizmi, chegaralar namoz vaqtlariga
   to'g'ri kelganmi, har faslda hammasi uchraydimi, va joylashuv buzuq bo'lganda
   sky() ilovani yiqitmaydimi.

   Ishga tushirish:  node tests/test_sky.js  */

const fs = require('fs');
const path = require('path');

global.window = global;
const D = global.D = { S: { settings: { tz: 'Asia/Tashkent', dayStart: 0,
  prayer: { lat: 41.2995, lng: 69.2401, fajr: 15.5, isha: 15.5, asr: 'hanafi', offsets: {}, hijriOffset: 0 } } } };
D.pad2 = (n) => String(n).padStart(2, '0');
D.parseKey = (k) => { const [y, m, d] = String(k).split('-').map(Number); return { y, m, d }; };
D.keyOf = (y, m, d) => y + '-' + D.pad2(m) + '-' + D.pad2(d);
D.addDays = (key, n) => { const { y, m, d } = D.parseKey(key); const dt = new Date(Date.UTC(y, m - 1, d + n)); return D.keyOf(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); };
D.dowOf = (k) => { const { y, m, d } = D.parseKey(k); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
D.today = () => '2026-09-14';
D.fmtTime = (h, m) => D.pad2(h) + ':' + D.pad2(m);
D.t = (k) => k;
D.save = () => {};

// core.js dagi AYNAN partsIn
const fmtCache = {};
function partsIn(tz, date) {
  let f = fmtCache[tz];
  if (!f) f = fmtCache[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' });
  const o = {}; for (const p of f.formatToParts(date)) o[p.type] = p.value;
  const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] ?? 0;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute, s: +o.second, dow };
}
let TZ = 'Asia/Tashkent';
D.nowTz = (date) => partsIn(TZ, date || new Date());

eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'prayer.js'), 'utf8'));

let pass = 0, fail = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  XATO ' + name + (extra ? '  — ' + extra : '')); }
};
// Toshkent = UTC+5, ya'ni mahalliy soatdan beshni ayiramiz
const at = (y, m, d, h, min) => new Date(Date.UTC(y, m - 1, d, h - 5, min || 0, 0));

/* ---- 1. JS nomlari va CSS qoidalari bir xilmi -------------------------- */
console.log('\n1. JS qaytaradigan nomlar CSS da bormi');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'whoop-ui.css'), 'utf8');
const cssPhases = new Set();
for (const m of css.matchAll(/\[data-phase="([a-z]+)"\]/g)) cssPhases.add(m[1]);

const KEY = '2026-09-14';
const seen = new Set();
for (let mins = 0; mins < 24 * 60; mins += 1) {
  const ph = D.prayer.sky(at(2026, 9, 14, 0, mins));
  if (ph) seen.add(ph);
}
console.log('     JS:  ' + [...seen].sort().join(', '));
console.log('     CSS: ' + [...cssPhases].sort().join(', '));
for (const ph of seen) ok(cssPhases.has(ph), 'JS "' + ph + '" uchun CSS qoidasi bor');
for (const ph of cssPhases) ok(seen.has(ph) || ph === 'tun', 'CSS "' + ph + '" ni JS ham qaytaradi');

/* ---- 2. Kun bo'yi uzluksiz: har daqiqada bitta faza bor ---------------- */
console.log('\n2. Kun bo\'yi uzluksizlik');
let bosh = 0;
for (let mins = 0; mins < 24 * 60; mins += 1) {
  if (!D.prayer.sky(at(2026, 9, 14, 0, mins))) bosh++;
}
ok(bosh === 0, 'kunning hech bir daqiqasi fazasiz qolmaydi', bosh + ' ta daqiqa bo\'sh');

/* ---- 3. Chegaralar namoz vaqtlariga to'g'ri keladimi ------------------- */
console.log('\n3. Chegaralar namoz vaqtlariga to\'g\'ri keladimi');
const list = D.prayer.list(KEY);
const tm = {}; for (const x of list) tm[x.id] = x.mins;
console.log('     ' + list.map((x) => x.id + ' ' + x.time).join(' · '));
for (const id of ['bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton']) {
  const oldin = D.prayer.sky(at(2026, 9, 14, 0, tm[id] - 1));
  const keyin = D.prayer.sky(at(2026, 9, 14, 0, tm[id] + 1));
  ok(keyin === id && oldin !== id, id + ' aynan o\'z vaqtida boshlanadi',
    'oldin=' + oldin + ' keyin=' + keyin);
}
ok(D.prayer.sky(at(2026, 9, 14, 0, tm.bomdod - 1)) === 'tun', 'bomdoddan oldin — tun');
ok(D.prayer.sky(at(2026, 9, 14, 23, 59)) === 'xufton', 'yarim tunda — xufton');

/* ---- 4. Tartib buzilmaydimi (orqaga sakrash yo'q) ---------------------- */
console.log('\n4. Fazalar tartibi');
const TARTIB = ['tun', 'bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton'];
let prev = -1, buzildi = 0;
for (let mins = 0; mins < 24 * 60; mins += 1) {
  const i = TARTIB.indexOf(D.prayer.sky(at(2026, 9, 14, 0, mins)));
  if (i < prev) buzildi++;
  prev = i;
}
ok(buzildi === 0, 'faza kun davomida faqat oldinga yuradi', buzildi + ' ta orqaga sakrash');

/* ---- 5. Har faslda yettala faza uchraydimi ----------------------------- */
/* Astronomik da'voning o'zi: fazalar quyoshga bog'langani uchun ular yil
   davomida SILJIYDI, lekin hech qaysisi yo'qolmasligi kerak. */
console.log('\n5. Fasllar bo\'yicha (Toshkent)');
for (const [nom, mm, dd] of [['qish', 12, 21], ['bahor', 3, 21], ['yoz', 6, 21], ['kuz', 9, 23]]) {
  const s = new Set();
  for (let mins = 0; mins < 24 * 60; mins += 2) s.add(D.prayer.sky(at(2026, mm, dd, 0, mins)));
  const l = D.prayer.list(D.keyOf(2026, mm, dd));
  const b = l.find((x) => x.id === 'bomdod'), sh = l.find((x) => x.id === 'shom');
  console.log('     ' + nom.padEnd(6) + ' bomdod ' + b.time + ' · shom ' + sh.time);
  ok(s.size === 7, nom + ': yettala faza ham uchraydi', 'faqat ' + [...s].join(','));
}

/* ---- 6. Buzuq joylashuvda ilova yiqilmaydi ----------------------------- */
/* sky() bo'sh satr qaytarishi SHART: app.js shunda data-phase ni umuman
   qo'ymaydi va ilova o'zining oddiy foni bilan qoladi. Agar u yiqilsa,
   applySky() dagi try/catch tutadi — lekin unga tayanmaymiz. */
console.log('\n6. Buzuq holatda ham yiqilmaydi');
const saqla = D.S.settings.prayer;
for (const [nom, cfg] of [
  ['joylashuv yo\'q', null],
  ['lat/lng bo\'sh', { lat: null, lng: null, fajr: 15.5, isha: 15.5, asr: 'hanafi', offsets: {} }],
  ['lat matn', { lat: 'x', lng: 'y', fajr: 15.5, isha: 15.5, asr: 'hanafi', offsets: {} }],
]) {
  D.S.settings.prayer = cfg;
  let r, threw = false;
  try { r = D.prayer.sky(at(2026, 9, 14, 12, 0)); } catch (e) { threw = true; }
  ok(!threw && typeof r === 'string', nom + ': xato tashlamaydi, satr qaytaradi',
    threw ? 'xato tashladi' : 'qaytardi: ' + JSON.stringify(r));
}
D.S.settings.prayer = saqla;

/* ---- 7. Qutb kengligi: bomdod/xufton hisoblanmaydigan joy -------------- */
/* prayer.js da safeFajr/safeIsha zaxirasi bor. Murmansk yozda — quyosh
   botmaydi, ya'ni oddiy formula javob bermaydi. Faza baribir chiqishi kerak. */
console.log('\n7. Qutb kengligi (Murmansk, 21-iyun)');
TZ = 'Europe/Moscow';
D.S.settings.tz = 'Europe/Moscow';
D.S.settings.prayer = { lat: 68.97, lng: 33.08, fajr: 15.5, isha: 15.5, asr: 'hanafi', offsets: {}, hijriOffset: 0 };
const qutb = new Set();
let qutbXato = false;
for (let h = 0; h < 24; h++) {
  try { qutb.add(D.prayer.sky(new Date(Date.UTC(2026, 5, 21, (h - 3 + 24) % 24, 0)))); }
  catch (e) { qutbXato = true; }
}
ok(!qutbXato, 'qutbda ham xato tashlamaydi');
ok(!qutb.has('') && !qutb.has(undefined), 'qutbda ham har soatda faza bor', [...qutb].join(','));
console.log('     uchragan fazalar: ' + [...qutb].sort().join(', '));

/* ---- xulosa ----------------------------------------------------------- */
console.log('\n' + (fail === 0
  ? 'hammasi joyida — ' + pass + ' ta tekshiruv'
  : fail + ' TA XATO (' + pass + ' ta o\'tdi)'));
process.exit(fail === 0 ? 0 : 1);
