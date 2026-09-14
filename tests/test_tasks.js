/* Vazifalar (js/tasks.js) — aqlli qo'shish, takrorlanish va saralash.
   Haqiqiy core.js yuklanadi: sana arifmetikasi (D.addDays, D.dowOf, D.parseKey)
   taqlid emas, o'shaning o'zi bo'lsin — parser xatosi aynan shu chegarada
   tug'iladi.
   Ishga tushirish:  node tests/test_tasks.js                                  */
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
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));   // oy va hafta nomlari shu yerda

/* ---------- vaqtni qotiramiz ---------- */
const TODAY = '2026-09-14';
D.today = () => TODAY;
D.serverEnabled = () => false;
D.save = noop; D.rerender = noop; D.saveUi = noop; D.current = () => 'tasks';
D.modal = noop; D.sheet = noop; D.toast = noop; D.patch = noop;
D.S = D.normalize(D.defaultState());

eval(fs.readFileSync(path.join(ROOT, 'js', 'tasks.js'), 'utf8'));
const T = D.tasks;
const P = (s, o) => T.parse(s, Object.assign({ today: TODAY }, o || {}));

/* ---------- mayda yordamchilar ---------- */
let fail = 0, n = 0;
function ok(name, cond, extra) {
  n++;
  if (cond) { console.log('  ok   ' + name); return; }
  fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra)));
}
function eq(name, got, want) { ok(name + '  (' + JSON.stringify(got) + ')', got === want, { got, want }); }
const plus = (k) => D.addDays(TODAY, k);

/* ================================================================= */
console.log('\n1. Sana o‘qish');
eq('ertaga', P('ertaga non olish').date, plus(1));
eq('  matn tozalandi', P('ertaga non olish').text, 'non olish');
eq('bugun', P('bugun yugurish').date, TODAY);
eq('indin', P('indin uchrashuv').date, plus(2));
eq('завтра (rus)', P('завтра купить хлеб').date, plus(1));
eq('  rus matni tozalandi', P('завтра купить хлеб').text, 'купить хлеб');
eq('эртага (kirill)', P('эртага сув').date, plus(1));
eq('sanasiz → ataylab null', P('sanasiz o‘qish').date, null);
eq('+5', P('+5 hisobot').date, plus(5));
eq('3 kundan keyin', P('3 kundan keyin qo‘ng‘iroq').date, plus(3));
eq('через 3 дня', P('через 3 дня звонок').date, plus(3));
eq('keyingi hafta', P('keyingi hafta shifokor').date, plus(7));
eq('kelasi oy', P('kelasi oy to‘lov').date, T._addMonths(TODAY, 1));

console.log('\n2. Aniq sana');
eq('25.12', P('25.12 hisobot').date, '2026-12-25');
eq('25-dekabr', P('25-dekabr hisobot').date, '2026-12-25');
eq('  oy nomi matndan olindi', P('25-dekabr hisobot').text, 'hisobot');
eq('o‘tib ketgan oy → keyingi yil', P('5-yanvar reja').date, '2027-01-05');
eq('yil aniq aytilsa qaytarilmaydi', P('5-yanvar 2026 reja').date, '2026-01-05');
eq('mavjud bo‘lmagan sana o‘qilmaydi', P('31.02 ish').date, undefined);
eq('  va matn buzilmaydi', P('31.02 ish').text, '31.02 ish');
eq('45-dekabr ham o‘qilmaydi', P('45-dekabr ish').date, undefined);

console.log('\n3. Hafta kuni');
{
  const r = P('juma hisobot');
  ok('juma — kelasi juma', D.dowOf(r.date) === 5, { date: r.date, dow: D.dowOf(r.date) });
  ok('  bugundan keyin, bir hafta ichida', r.date > TODAY && r.date <= plus(7), r.date);
  eq('  matn tozalandi', r.text, 'hisobot');
  eq('2026-09-14 — dushanba', D.dowOf(TODAY), 1);
  eq('bugungi kun nomi → keyingi hafta', P('dushanba ish').date, plus(7));
  eq('понедельник (rus) ham', P('понедельник дело').date, plus(7));
}

console.log('\n4. So‘zni yeb qo‘ymaslik');
/* «marta» — «mart» bilan boshlanadi. Prefiks bo'yicha solishtirilganda
   «3 marta suv ichish» jimgina 3-martga aylanib qolardi. */
eq('«3 marta» oy emas', P('3 marta suv ichish').date, undefined);
eq('  matn butun qoladi', P('3 marta suv ichish').text, '3 marta suv ichish');
eq('«Yur! ketdik» — muhimlik emas', P('Yur! ketdik').priority, null);
eq('  matn butun qoladi', P('Yur! ketdik').text, 'Yur! ketdik');
eq('bo‘sh qator', P('').text, '');
ok('matn hech qachon uzaymaydi', ['ertaga soat 9 da shifokor !', 'oddiy vazifa', '3 marta']
  .every((s) => P(s).text.length <= s.length));

console.log('\n5. Vaqt');
eq('soat 9 da', P('soat 9 da shifokor').time, '09:00');
eq('  matn tozalandi', P('soat 9 da shifokor').text, 'shifokor');
eq('15:30', P('15:30 uchrashuv').time, '15:30');
eq('соат 7 да (kirill)', P('соат 7 да намоз').time, '07:00');
eq('в 9 (rus)', P('в 9 к врачу').time, '09:00');
eq('sana vaqt bo‘lib ketmaydi', P('25.12 hisobot').time, null);
eq('  va sanasi joyida', P('25.12 hisobot').date, '2026-12-25');

console.log('\n6. Muhimlik va maqsad');
eq('«!» → juda muhim', P('hisobot !').priority, 3);
eq('  matn tozalandi', P('hisobot !').text, 'hisobot');
eq('belgisiz — tegilmaydi', P('hisobot').priority, null);
{
  D.S.goals = [{ id: 'g1', text: 'Sport zali', dir: 'shaxsiy', priority: 2, year: 2026, done: false },
    { id: 'g2', text: 'Kitob o‘qish', dir: 'shaxsiy', priority: 2, year: 2026, done: false }];
  eq('#Sport → maqsadga bog‘landi', P('#Sport yugurish').goalId, 'g1');
  eq('  matn tozalandi', P('#Sport yugurish').text, 'yugurish');
  eq('topilmasa — bog‘lanmaydi', P('#Yo‘q ish').goalId, null);
  eq('  va matn buzilmaydi', P('#Yo‘q ish').text, '#Yo‘q ish');
  D.S.goals.push({ id: 'g3', text: 'Sport kiyimi', dir: 'shaxsiy', priority: 2, year: 2026, done: false });
  eq('ikki maqsad mos kelsa — bog‘lanmaydi', P('#Sport yugurish').goalId, null);
  D.S.goals = [];
}

console.log('\n7. Takrorlanish o‘qish');
eq('har kuni', JSON.stringify(P('har kuni suv ichish').repeat), '{"unit":"d","n":1}');
eq('  matn tozalandi', P('har kuni suv ichish').text, 'suv ichish');
eq('har 2 haftada', JSON.stringify(P('har 2 haftada sport').repeat), '{"unit":"w","n":2}');
eq('har oyda', JSON.stringify(P('har oyda ijara').repeat), '{"unit":"m","n":1}');
eq('har yili', JSON.stringify(P('har yili tekshiruv').repeat), '{"unit":"y","n":1}');
/* Kirill uchun \w yaramaydi (u faqat ASCII), shuning uchun harf sinfi
   qo'lda yozilgan — bu sinov aynan o'shani ushlab turadi. */
eq('ҳар куни (kirill)', JSON.stringify(P('ҳар куни сув').repeat), '{"unit":"d","n":1}');
eq('каждый день (rus)', JSON.stringify(P('каждый день зарядка').repeat), '{"unit":"d","n":1}');
eq('каждые 3 недели (rus)', JSON.stringify(P('каждые 3 недели уборка').repeat), '{"unit":"w","n":3}');
eq('«har holda» takror emas', P('har holda bor').repeat, null);

console.log('\n8. Hammasi birga');
{
  const r = P('ertaga soat 9 da #Sport shifokorga borish !', { });
  D.S.goals = [{ id: 'g1', text: 'Sport zali', dir: 'shaxsiy', priority: 2, year: 2026, done: false }];
  const r2 = P('ertaga soat 9 da #Sport shifokorga borish !');
  eq('sana', r2.date, plus(1));
  eq('vaqt', r2.time, '09:00');
  eq('muhimlik', r2.priority, 3);
  eq('maqsad', r2.goalId, 'g1');
  eq('qolgan matn', r2.text, 'shifokorga borish');
  ok('birinchi urinishda maqsadsiz edi', r.goalId === null);
  D.S.goals = [];
}

console.log('\n9. Bekor qilish (chipni o‘chirish)');
eq('skip.date → sana o‘qilmaydi', P('ertaga non', { skip: { date: true } }).date, undefined);
eq('  so‘z matnda qoladi', P('ertaga non', { skip: { date: true } }).text, 'ertaga non');
eq('skip.time', P('soat 9 da ish', { skip: { time: true } }).time, null);
eq('skip.prio', P('ish !', { skip: { prio: true } }).priority, null);
eq('skip.rep', P('har kuni suv', { skip: { rep: true } }).repeat, null);

console.log('\n10. Keyingi takror sanasi');
const R = (u, k) => ({ unit: u, n: k || 1 });
eq('har kuni', T.nextDate('2026-09-14', R('d')), '2026-09-15');
eq('har hafta', T.nextDate('2026-09-14', R('w')), '2026-09-21');
eq('har 3 kunda', T.nextDate('2026-09-14', R('d', 3)), '2026-09-17');
eq('har oy', T.nextDate('2026-09-14', R('m')), '2026-10-14');
eq('har yil', T.nextDate('2026-09-14', R('y')), '2027-09-14');
/* Oyning oxiriga sig'maydigan kun qirqiladi va QAYTMAYDI: «har oyning
   31-kuni» degan narsa taqvimda yo'q, shuning uchun asos surilgan sanadan
   olinadi. Buni sinov yozib qo'yadi, keyin «xato» deb tuzatilmasin. */
eq('31-yanvar + oy → 28-fevral', T.nextDate('2026-01-31', R('m')), '2026-02-28');
eq('  keyingisi 28-mart (31 qaytmaydi)', T.nextDate('2026-02-28', R('m')), '2026-03-28');
eq('29-fevral + yil → 28-fevral', T.nextDate('2024-02-29', R('y')), '2025-02-28');

console.log('\n11. Kechikkan takror o‘tmishga tushmaydi');
eq('har kuni, 13 kun kechikkan', T.nextDate('2026-09-01', R('d'), TODAY), '2026-09-15');
eq('har 3 kunda, qadam saqlanadi', T.nextDate('2026-09-01', R('d', 3), TODAY), '2026-09-16');
eq('har hafta', T.nextDate('2026-08-03', R('w'), TODAY), '2026-09-21');
eq('har oy — 15-kun hali kelmagan', T.nextDate('2026-01-15', R('m'), TODAY), '2026-09-15');
eq('har oy — 10-kun o‘tib ketgan', T.nextDate('2026-01-10', R('m'), TODAY), '2026-10-10');
eq('har yil', T.nextDate('2020-03-01', R('y'), TODAY), '2027-03-01');
ok('kelajakdagi sana surilmaydi', T.nextDate('2026-09-20', R('d'), TODAY) === '2026-09-21');
eq('takrorsiz → null', T.nextDate('2026-09-14', null), null);
eq('noma’lum birlik → null', T.nextDate('2026-09-14', { unit: 'x', n: 1 }), null);

console.log('\n12. Saralash');
/* Ilgari hamma guruh «muhimlik, keyin sana KAMAYISH» bilan saralanardi.
   Oqibati: «Keyinroq» da uch oydan keyingi ish uch kundan keyingisining
   ustida turardi, «Kechikkan» da eng ko'p kechikkani eng pastda qolardi. */
{
  const mk2 = (o) => Object.assign({ id: D.uid('t'), text: 'x', done: false, priority: 2, createdAt: 1 }, o);
  const later = [mk2({ date: '2026-12-01' }), mk2({ date: '2026-09-20' }), mk2({ date: '2026-10-05' })];
  later.sort(T._sort.later);
  eq('Keyinroq — eng yaqini birinchi', later[0].date, '2026-09-20');
  eq('  eng uzog‘i oxirgi', later[2].date, '2026-12-01');

  const over = [mk2({ date: '2026-09-13' }), mk2({ date: '2026-09-01' }), mk2({ date: '2026-09-10' })];
  over.sort(T._sort.overdue);
  eq('Kechikkan — eng ko‘p kechikkani birinchi', over[0].date, '2026-09-01');

  const day = [mk2({ date: TODAY }), mk2({ date: TODAY, time: '09:00' }), mk2({ date: TODAY, time: '15:00' })];
  day.sort(T._sort.today);
  eq('Bugun — vaqti borlar kun tartibida', day[0].time, '09:00');
  eq('  keyin kechroq vaqt', day[1].time, '15:00');
  ok('  vaqtsizlar oxirida', day[2].time === undefined, day[2]);

  const free = [mk2({ priority: 1 }), mk2({ priority: 3 }), mk2({ priority: 2 })];
  free.sort(T._sort.nodate);
  eq('Sanasiz — muhimlik bo‘yicha', free[0].priority, 3);

  const dayPrio = [mk2({ date: TODAY, priority: 1 }), mk2({ date: TODAY, priority: 3 })];
  dayPrio.sort(T._sort.today);
  eq('Bugun — vaqt teng bo‘lsa muhimlik hal qiladi', dayPrio[0].priority, 3);
}

console.log('\n13. Bajarilgan kun (db.py bilan bir xil qoida)');
{
  const ms = Date.UTC(2026, 8, 12, 10, 0, 0);
  eq('doneAt bor → o‘sha kun', T._doneDay({ doneAt: ms, date: '2026-09-01' }), D.dayKey(ms));
  eq('doneAt yo‘q → vazifa sanasi', T._doneDay({ doneAt: null, date: '2026-09-01' }), '2026-09-01');
  eq('ikkalasi ham yo‘q', T._doneDay({}), '');
}

console.log('\n14. Eski vazifa buzilmaydi');
/* Ixtiyoriy maydonlarsiz yozuv — 2026-09-14 dan oldin yaratilganlarning
   hammasi shunday. Har o'quvchi joy ularsiz ham to'g'ri ishlashi shart. */
{
  const old = { id: 't1', text: 'eski', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: 1 };
  ok('saralash yiqilmaydi', [old, old].sort(T._sort.today).length === 2);
  ok('doneDay yiqilmaydi', T._doneDay(old) === TODAY);
  ok('sub/time/note/repeat yo‘q', old.sub === undefined && old.time === undefined && old.repeat === undefined);
}

console.log('\n15. Sahifa chizilishi');
/* Eng arzon va eng foydali tekshiruv: render() HTML matnini qaytaradi va
   undagi xato butun bo'limni o'ldiradi. Shu sababli har bir holat bir
   marta chizib ko'riladi — bo'sh ro'yxat, to'liq ro'yxat, ochilgan quyi
   vazifalar, bajarilganlar. */
{
  const view = D.views.tasks;
  const draw = () => { D.ui.sub.tasks = 'tasks'; return view.render(); };
  D.ui.collapsed = D.ui.collapsed || {};

  D.S.tasks = [];
  let h = draw();
  ok('bo‘sh ro‘yxat chiziladi', typeof h === 'string' && h.length > 100);
  ok('  bo‘shlik xabari bor', h.includes('tk-list'));

  const now = Date.now();
  D.S.tasks = [
    { id: 't1', text: 'Bugungi ish', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: now },
    { id: 't2', text: 'Vaqtli ish', date: TODAY, done: false, doneAt: null, priority: 3, createdAt: now, time: '09:00' },
    { id: 't3', text: 'Kechikkan', date: '2026-09-01', done: false, doneAt: null, priority: 2, createdAt: now },
    { id: 't4', text: 'Keyinroq', date: '2026-12-01', done: false, doneAt: null, priority: 1, createdAt: now },
    { id: 't5', text: 'Sanasiz', date: null, done: false, doneAt: null, priority: 2, createdAt: now },
    { id: 't6', text: 'Takrorli', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: now, repeat: { unit: 'w', n: 2 } },
    { id: 't7', text: 'Izohli', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: now, note: 'qisqa izoh' },
    { id: 't8', text: 'Quyi vazifali', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: now,
      sub: [{ id: 's1', text: 'birinchi', done: true }, { id: 's2', text: 'ikkinchi', done: false }] },
    { id: 't9', text: 'Bajarilgan', date: '2026-09-13', done: true, doneAt: Date.UTC(2026, 8, 13, 9), priority: 2, createdAt: now },
    { id: 't10', text: 'Kecha bajarilgan', date: '2026-09-13', done: true, doneAt: Date.UTC(2026, 8, 13, 8), priority: 2, createdAt: now },
  ];
  h = draw();
  ok('to‘liq ro‘yxat chiziladi', h.length > 2000, h.length);
  ok('  vaqt ko‘rinadi', h.includes('09:00'));
  ok('  takror belgisi bor', h.includes('tk-r-mi'));
  ok('  quyi vazifa hisobi 1/2', h.includes('1/2'));
  ok('  tez chiplar bor', h.includes('tk-qk'));
  ok('  ko‘rsatkich uyasi bor', h.includes('id="tkPv"'));
  ok('hech qayerda undefined chiqmadi', !h.includes('undefined'), h.slice(h.indexOf('undefined') - 60, h.indexOf('undefined') + 20));
  ok('hech qayerda [object Object] yo‘q', !h.includes('[object Object]'));

  D.ui.collapsed.tkDone = false;
  h = draw();
  ok('bajarilganlar ochilganda kun sarlavhasi bor', h.includes('tk-dd'));

  D.act.tkSub({ dataset: { id: 't8' } });
  h = draw();
  ok('quyi vazifalar ochiladi', h.includes('tk-subs') && h.includes('birinchi'));
  D.act.tkSub({ dataset: { id: 't8' } });

  D.ui.sub.tasks = 'goals';
  D.S.goals = [{ id: 'g1', text: 'Maqsad', dir: 'shaxsiy', priority: 2, year: 2026, done: false, doneAt: null, createdAt: now }];
  h = view.render();
  ok('Maqsad sahifasi chiziladi', h.includes('Maqsad') && h.length > 500);
  D.S.goals = [];
}

console.log('\n16. Takrorlanuvchi vazifa bajarilganda');
{
  D.ui.sub.tasks = 'tasks';
  D.S.tasks = [{ id: 'r1', text: 'Ijara', date: '2026-09-14', done: false, doneAt: null, priority: 2,
    createdAt: 1, repeat: { unit: 'm', n: 1 }, time: '10:00', sub: [{ id: 's1', text: 'pul', done: true }] }];
  D.act.tkToggle({ dataset: { id: 'r1' } });
  const old = D.S.tasks.find((x) => x.id === 'r1');
  const born = D.S.tasks.find((x) => x.id !== 'r1');
  ok('joriysi bajarilgan bo‘lib qoladi', old.done === true);
  ok('  doneAt — ms belgisi (levels.js shuni o‘qiydi)', typeof old.doneAt === 'number' && old.doneAt > 1e12, old.doneAt);
  ok('yangisi tug‘ildi', !!born);
  eq('  sanasi keyingi oy', born && born.date, '2026-10-14');
  eq('  vaqti ko‘chdi', born && born.time, '10:00');
  ok('  takrori ko‘chdi', born && born.repeat && born.repeat.unit === 'm');
  ok('  quyi vazifasi belgisiz boshlandi', born && born.sub.length === 1 && born.sub[0].done === false);
  ok('  yangisi bajarilmagan', born && born.done === false && born.doneAt === null);
  eq('jami ikkita vazifa', D.S.tasks.length, 2);

  // takrorsiz vazifa hech narsa tug'dirmaydi
  D.S.tasks = [{ id: 'p1', text: 'Oddiy', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: 1 }];
  D.act.tkToggle({ dataset: { id: 'p1' } });
  eq('takrorsiz — nusxa yo‘q', D.S.tasks.length, 1);

  // quyi vazifa asosiy vazifani bajarilgan QILMAYDI (levels.js ochkosi buzilmasin)
  D.S.tasks = [{ id: 'q1', text: 'Katta ish', date: TODAY, done: false, doneAt: null, priority: 2, createdAt: 1,
    sub: [{ id: 's1', text: 'a', done: false }] }];
  D.act.tkSubToggle({ dataset: { id: 'q1', sid: 's1' } });
  ok('quyi vazifa belgilandi', D.S.tasks[0].sub[0].done === true);
  ok('asosiy vazifa hamon bajarilmagan', D.S.tasks[0].done === false && D.S.tasks[0].doneAt === null);
}

/* ================================================================= */
console.log('\n' + (fail ? '✗ ' + fail + ' ta xato / ' + n : '✓ hammasi o‘tdi — ' + n + ' ta tekshiruv'));
process.exit(fail ? 1 : 0);
