/* Tana (js/health.js + js/whoop.js + js/food.js) — «Yorug' qog'oz» ko'rinishi.
   Haqiqiy core.js / i18n.js / whoop.js / health.js / food.js yuklanadi: sahifa
   aynan shu modullar chegarasida yig'iladi. Tekshiriladi: to'rt sahifaning
   tarkibi, raqamlar o'zgarmagani (ko'rinish D.whoop.dayInsight va
   D.food.dayTotals bergan qiymatni chiqaradi), yozish avvalgi amallar orqali
   ketishi, bo'sh holatlar va uch til.
   Ishga tushirish:  node tests/test_tana.js                                   */
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
const TODAY = '2026-10-09';
D.today = () => TODAY;
D.serverEnabled = () => false;
let saves = 0, modalArg = null, toasts = [];
D.save = () => { saves++; }; D.rerender = noop; D.saveUi = noop; D.saveQuiet = noop; D.current = () => 'health';
D.modal = (o) => { modalArg = o; }; D.sheet = noop; D.toast = (m) => { toasts.push(m); }; D.closeModal = noop;
for (const f of ['whoop.js', 'health.js', 'food.js']) eval(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'));

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
const count = (s, re) => (s.match(re) || []).length;
const view = D.views.health;
const page = (sub) => { D.ui.sub.health = sub; return view.render(); };
const back = (i) => D.addDays(TODAY, -i);
const at = (k, hhmm) => Date.parse(`${k}T${hhmm}:00+05:00`);

/** Soat ulangan, 40 kunlik tarix, bugun uchun dizayn rasmlaridagi qiymatlar. */
function seed() {
  const S = D.defaultState();
  Object.assign(S.profile, { heightCm: 180, weightKg: 80.2, birthYear: 1996, sex: 'm', activity: 3, goal: 'keep', whoopAge: 26.8, paceOfAging: 0.84 });
  S.settings.lang = 'uz';
  S.whoop.connected = true; S.whoop.lastSync = at(TODAY, '07:12');
  S.whoop.body = { heightCm: 180, weightKg: 80.2, maxHr: 189 };
  for (let i = 0; i < 40; i++) {
    const k = back(i);
    S.whoop.days[k] = { recovery: i ? [49, 77, 31, 64, 81, 58, 70][i % 7] : 72, hrv: i ? 62 : 68, rhr: i ? 56 : 54, spo2: 96.4, skin: 33.6, resp: 15.1,
      sleepH: i ? 6.5 + (i % 4) * 0.4 : 7 + 25 / 60, sleepNeedH: 8, sleepPerf: 93, sleepEff: 96, sleepCons: 74, inBedH: 7.65, awakeH: 14 / 60,
      stages: { deep: 92 * 60000, rem: 108 * 60000, light: 231 * 60000, awake: 14 * 60000 }, cycles: 5, disturbances: 9,
      bedTs: at(back(i + 1), '23:40'), wakeTs: at(k, '07:05'), strain: i ? 8 + (i % 6) : 9.4, kcal: i ? 2600 + (i % 5) * 20 : 2140, hrAvg: 78, hrMax: 164 };
  }
  S.health[back(89)] = { weight: 84.1 }; S.health[back(40)] = { weight: 82.0 }; S.health[TODAY] = { weight: 80.2, water: 5 };
  const zs = (a) => a.map((m) => m * 60000);
  S.whoop.workouts = [
    { id: 'w1', k: TODAY, start: at(TODAY, '07:10'), end: at(TODAY, '08:02'), sport: 'weightlifting', strain: 8.1, kcal: 412, hrAvg: 121, hrMax: 164, mins: 52, zones: zs([3, 11, 16, 12, 7, 3]) },
    { id: 'w2', k: TODAY, start: at(TODAY, '12:40'), end: at(TODAY, '13:05'), sport: 'walking', strain: 3.2, kcal: 140, hrAvg: 102, hrMax: 121, meters: 1900, mins: 25, zones: zs([4, 15, 6, 0, 0, 0]) }];
  S.food.targets = { kcal: 2200, p: 170, c: 243, f: 61, auto: false };
  const meal = (id, hhmm, name, kcal, p, c, f) => ({ id, ts: at(TODAY, hhmm), name, grams: 300, kcal, p, c, f, src: 'text', items: [] });
  S.food.logs[TODAY] = [meal('m2', '13:20', 'Osh, 350 g', 680, 22, 78, 26), meal('m1', '08:10', 'Tuxum (3 ta), non, choy', 420, 24, 38, 18), meal('m3', '15:10', "Olma va yong'oq", 240, 6, 26, 14)];
  S.food.logs[back(1)] = [meal('y1', '13:00', 'Kechagi osh', 2500, 80, 300, 90)];
  S.food.logs[back(1)][0].ts = at(back(1), '13:00');
  D.S = D.normalize(S);
  D.ui.viewDate = null; D.ui.filters = {}; D.ui.sub = {};
}

/* ================================================================= */
console.log('\n1. Qobiq: sarlavha, pill, to\'rt yorliq');
seed();
ok('sarlavha doim «Tana»', ['ovqat', 'ready', 'sleep', 'strain'].every((s) => { D.ui.sub.health = s; return view.title() === 'Tana'; }));
ok('izoh qatori — sana', view.subtitle() === D.esc(D.fmtDate(TODAY, 'weekday')), view.subtitle());
const pill = view.topRight();
ok('o\'ngda head-pill → hlWhoopRefresh', /class="head-pill hl-pill" data-act="hlWhoopRefresh"/.test(pill), pill);
ok('pillda «WHOOP · 07:12» va yashil nuqta', /WHOOP · 07:12/.test(pill) && /class="dot"/.test(pill) && /aria-label="/.test(pill), pill);
let h = page('ovqat');
ok('segment `seg four`, to\'rtta yorliq', /class="seg four hl-seg"/.test(h) && count(h, /data-act="sub" data-view="health" data-sub="/g) === 4);
ok('tartib: ovqat · ready · sleep · strain', [...h.matchAll(/data-act="sub" data-view="health" data-sub="([a-z]+)"/g)].map((m) => m[1]).join(',') === 'ovqat,ready,sleep,strain');
ok('yorliq nomlari', ['Ovqat', 'Tayyorlik', 'Uyqu', "Zo'riqish"].every((x) => h.includes('>' + D.esc(x) + '</button>')));

/* ================================================================= */
console.log('\n2. Ovqat');
ok('bosh karta hero--ovqat, bosilsa fdTargets', /class="card hero hero--ovqat fd-hero" data-act="fdTargets" role="button" tabindex="0"/.test(h));
const tot = D.food.dayTotals(TODAY), tg = D.food.targets();
ok('«860 kkal qoldi» = me\'yor − yeyilgan', tg.kcal - tot.kcal === 860 && /<b class="num">860<\/b><span>kkal qoldi<\/span>/.test(h));
ok('«Me\'yor 2 200 kkal» pilli', h.includes(`<span class="hero-pill num">${D.esc("Me'yor " + D.fmtNum(2200) + ' kkal')}</span>`));
ok('yeyilgan va WHOOP sarfi', h.includes(`Yedingiz <b>${D.fmtNum(1340)}</b>`) && h.includes(`sarf <b>${D.fmtNum(2140)}</b>`));
ok('makro chizig\'i uch bo\'lak + izoh', count(h, /<i class="[pcf]" style="width:/g) === 3 && count(h, /<i class="dot [pcf]"><\/i>/g) === 3);
const shares = [...h.matchAll(/<i class="dot [pcf]"><\/i>[^<]+<b class="num">(\d+)%<\/b>/g)].map((m) => +m[1]);
ok('ulushlar: oqsil 16 · uglevod 44 · yog\' 40', shares.join(',') === '16,44,40', shares);
ok('uch makro chizig\'i «52 / 170 g»', count(h, /class="fd-m [pcf]/g) === 3 && /<b>52<\/b> \/ 170 g/.test(h) && /118 g qoldi/.test(h));
ok('90 % dan o\'tgan makro «deyarli to\'ldi»', /class="fd-m f near"/.test(h) && h.includes(D.esc("deyarli to'ldi · 3 g qoldi")));
ok('maslahat qutisi (oqsil kam)', /class="advice tint fd-adv"/.test(h) && /Oqsil kam: yana 118 g kerak/.test(h));
const w = D.food.water(TODAY);
ok('suv: stakanlar soni = me\'yor, to\'lgani = ichilgan', count(h, /class="fd-gl[ "]/g) === w.goal && count(h, /class="fd-gl on"/g) === 5, { goal: w.goal });
const ds = [...h.matchAll(/data-act="fdWater" data-n="(\d+)"/g)].map((m) => +m[1]);
ok('stakan mutlaq sonni yuboradi (1…me\'yor)', ds[0] === 1 && ds[4] === 5 && ds[w.goal - 1] === w.goal, ds);
{ const wk = D.S.health[TODAY]; const before = wk.water;
  D.act.fdWater({ dataset: { n: '7' } }); ok('stakan bosilsa shu songacha to\'ladi', D.S.health[TODAY].water === 7, D.S.health[TODAY].water);
  D.act.fdWater({ dataset: { n: '7' } }); ok('oxirgi to\'lgan stakan bosilsa bittaga kamayadi', D.S.health[TODAY].water === 6, D.S.health[TODAY].water);
  D.S.health[TODAY].water = before; }
ok('har stakanda aria-label', count(h, /class="fd-gl[^>]*aria-label="\d+-stakan"/g) === w.goal);
ok('kiritish: matn + kamera + yuborish (bo\'sh — o\'chiq)', /<textarea class="ta fd-text" id="fdText" rows="1" maxlength="600"[^>]*data-input="fdDraft"/.test(h) && /data-change="fdPhoto"/.test(h) && /class="fd-send ghost" data-act="fdSend"[^>]*disabled/.test(h));
ok('kamera `capture`siz (galereya ham ochiladi)', !/capture=/.test(h));
ok('qo\'lda kiritish saqlangan', /data-act="fdAddManual"/.test(h));
const order = [...h.matchAll(/data-act="fdView" data-id="(m\d)"/g)].map((m) => m[1]);
ok('ovqatlar kun tartibida, bosilsa fdView', order.join(',') === 'm1,m2,m3', order);
ok('qator: vaqt, makro qatori, kkal', /<span class="fd-meal-t num">08:10<\/span>/.test(h) && h.includes(D.esc("Oqsil 24 · Uglevod 38 · Yog' 18 g")) && /<b>420<\/b> kkal/.test(h));
ok('sarlavhada «3 ta · 1 340 kkal»', h.includes(`3 ta · ${D.fmtNum(1340)} kkal`));
ok('bahosiz taomda baho pilli yo\'q', !/fd-meal-sc/.test(h));
{ const L = D.S.food.logs[TODAY]; L[0].score = 5; L[1].score = 9; L[2].score = 3;   // m2, m1, m3
  const hs = page('ovqat');
  ok('baho pilli: ≥8 yashil, 5–7 sariq, <5 qizil', /class="pill good fd-meal-sc"[^>]*>9\/10</.test(hs) && /class="pill warn fd-meal-sc"[^>]*>5\/10</.test(hs) && /class="pill bad fd-meal-sc"[^>]*>3\/10</.test(hs));
  for (const m of L) delete m.score; }
ok('kunlik hisobot kartasi taomli kunda bor, AI tugmasi AI ulanmaganda yo\'q', /class="card fd-rep"/.test(h) && !/data-act="fdDayAi"/.test(h));
ok('7 kun: yettita ustun-tugma (fdGo)', count(h, /class="fd-wk-c [^"]*" data-act="fdGo" data-day="/g) === 7);
ok('kecha me\'yordan oshgan, bugun davom etmoqda', new RegExp(`class="fd-wk-c over" data-act="fdGo" data-day="${back(1)}"`).test(h) && new RegExp(`class="fd-wk-c now on today" data-act="fdGo" data-day="${TODAY}"`).test(h));
ok('me\'yor chizig\'i va izohi', /class="fd-wk-line"/.test(h) && h.includes(D.esc("me'yor " + D.fmtNum(2200))));
ok('eski halqalar va kartalar yo\'q', !/fd-strip|fd-dc|fd-mcs|fd-shot|ring-wrap/.test(h));

console.log('\n   yozish avvalgi amallar orqali');
saves = 0;
D.act.fdWater({ dataset: { d: '2' } });
ok('fdWater +2 → S.health[bugun].water = 7, saqlandi', D.S.health[TODAY].water === 7 && saves === 1);
D.act.fdWater({ dataset: { d: '-1' } });
ok('fdWater −1 → 6', D.S.health[TODAY].water === 6);
modalArg = null; D.act.fdTargets();
ok('fdTargets me\'yor oynasini ochadi', modalArg && /fdTg_kcal/.test(modalArg.body));
modalArg = null; D.act.fdView({ dataset: { day: TODAY, id: 'm1' } });
ok('fdView taomni ochadi (tahrir shu yerdan)', modalArg && modalArg.title === 'Tuxum (3 ta), non, choy' && modalArg.actions.some((a) => a.act === 'fdToEdit'));
D.act.fdGo({ dataset: { day: back(1) } });
ok('fdGo kunni tanlaydi (D.ui.viewDate)', D.ui.viewDate === back(1));
h = page('ovqat');
ok('o\'tgan kun: «Bugun» havolasi va o\'sha kunning taomi', /data-act="hlDateToday"/.test(view.subtitle()) && /Kechagi osh/.test(h) && /kkal oshdi/.test(h));
ok('o\'tgan kunda maslahat qutisi yo\'q', !/fd-adv/.test(h));
D.act.hlDateToday();
ok('hlDateToday bugunga qaytaradi', D.ui.viewDate === null);

/* ================================================================= */
console.log('\n3. Tayyorlik');
seed();
h = page('ready');
const i = D.whoop.dayInsight(TODAY);
ok('tartib: xarita → tiklanish → jadval → tendensiya → tana', ['wh-map', 'wh-rec', 'wh-vt', 'wh-trend', 'wh-bd'].map((c) => h.indexOf('class="card ' + (c === 'wh-map' ? 'hero hero--tana wh-map' : c === 'wh-rec' ? 'hero hero--yashil wh-rec' : c))).every((x, j, a) => x > 0 && (!j || x > a[j - 1])));
ok('xarita: A.10 siluyeti (viewBox, bosh, tana)', /viewBox="0 0 318 320"/.test(h) && /<circle cx="70" cy="25" r="21" fill="url\(#tbFill\)"/.test(h) && /<path d="M70 47 L77 47 C77\.5 52/.test(h) && /L70 47 Z"/.test(h));
ok('olti yozuv, olti chiziq, olti nuqta', count(h, /class="wh-map-l [lr] /g) === 6 && count(h, /<path d="M(86|234) \d+ L/g) === 6 && count(h, /<circle cx="\d+" cy="\d+" r="5" fill="#/g) === 6);
ok('xarita pilli «Tiklanish 72%»', />Tiklanish 72%<\/span>/.test(h));
ok('miya: «7 s 25 d», «93% · yetarli»', /wh-map-l l brain"><span>Miya · uyqu<\/span><b class="num">7 s 25 d<\/b><em class="num">93% · yetarli<\/em>/.test(h));
ok('o\'pka: nafas va SpO₂', /wh-map-l l lung">.*?<b class="num">15,1<small> \/daq<\/small><\/b><em class="num">SpO₂ 96,4%<\/em>/.test(h));
ok('yurak: tinch puls va HRV', /wh-map-l r heart">.*?<b class="num">54<small> zarba<\/small><\/b><em class="num">HRV 68 ms<\/em>/.test(h));
ok('teri: harorat, me\'yorda', /wh-map-l l skin">.*?<b class="num">33,6°<\/b><em class="num">me&#39;yorda<\/em>/.test(h));
ok('vazn: 80,2 kg, 3 oyda −3,9', /wh-map-l r weight">.*?<b class="num">80,2<small> kg<\/small><\/b><em class="num">3 oyda −3,9<\/em>/.test(h));
ok('mushaklar: zo\'riqish 9,4', /wh-map-l r mus">.*?<b class="num">9,4<\/b><em class="num">zo&#39;riqish<\/em>/.test(h));
ok('halqa 132px, r=56, markazda 72 %', /viewBox="0 0 132 132"/.test(h) && /r="56"/.test(h) && /<b class="num">72<small>%<\/small><\/b>/.test(h));
ok('holat pilli va maslahat (tavsiya dayInsight dan)', /class="pill good">Yaxshi tiklangan/.test(h) && h.includes(`<b>${Math.round(i.strainTarget)} gacha</b>`));
ok('«30 kunlik o\'rtacha» pilli recBase dan', h.includes(D.esc(`30 kunlik o'rtacha ${D.fmtNum(i.recBase, 1)}%`)));
ok('uch izoh qatori: uyqu qizil, HRV yashil, tinch puls yashil', count(h, /<ul class="wh-rec-rows">.*?<\/ul>/s) === 1 && /<li class="bad"><i class="dot"><\/i><span><b>Uyqu:<\/b> kerakdan 35 daq kam/.test(h) && /<li class="good"><i class="dot"><\/i><span><b>HRV:<\/b>/.test(h) && /<li class="good"><i class="dot"><\/i><span><b>Tinch puls:<\/b> o&#39;rtachadan 2 zarba past \(54\)/.test(h));
ok('jadval: Bugun · Me\'yor · Farq, yetti qator', /<th scope="col">Bugun<\/th><th scope="col">Me&#39;yor<\/th><th scope="col">Farq<\/th>/.test(h) && count(h, /<tr><th scope="row">/g) === 7);
ok('jadval: uyqu 7:25 / 8:00 / −35 d (qizil)', /<th scope="row">Uyqu<\/th><td class="num v">7:25<\/td><td class="num r">8:00<\/td><td class="num d bad">−35 d<\/td>/.test(h));
ok('jadval: tinch puls −2 yashil, HRV foizda yashil', /<th scope="row">Tinch puls<\/th><td class="num v">54<\/td><td class="num r">56<\/td><td class="num d good">−2<\/td>/.test(h) && /<td class="num v">68 ms<\/td><td class="num r">62<\/td><td class="num d good">\+9,7%<\/td>/.test(h));
ok('tendensiya: ichki yorliq, 30 ustun, uch plitka', count(h, /data-act="whTrend" data-f="(recovery|hrv|rhr)"/g) === 3 && count(h, /<div class="wh-b30".*?<\/div>/s) === 1 && count((h.match(/<div class="wh-b30".*?<\/div>/s) || [''])[0], /<i class="/g) === 30 && count(h, /wh-tr-tiles/g) === 1);
const st = D.whoop.stats('recovery', 30);
ok('plitkalar D.whoop.stats dan', h.includes(`<span class="ptile-v num">${D.fmtNum(st.avg, 1)}%</span>`) && h.includes(`<span class="ptile-v num">${D.fmtNum(st.max, 1)}%</span>`) && h.includes(`<span class="ptile-v num">${D.fmtNum(st.min, 1)}%</span>`));
D.act.whTrend({ dataset: { f: 'rhr' } });
h = page('ready');
const sr = D.whoop.stats('rhr', 30);
ok('whTrend yorliqni almashtiradi; tinch pulsda «eng yaxshi» — eng pasti', D.ui.filters.whTrend === 'rhr' && /data-f="rhr" role="tab" aria-selected="true"/.test(h) && h.indexOf(`<span class="ptile-l">Eng yaxshi</span><span class="ptile-v num">${D.fmtNum(sr.min, 1)}</span>`) > 0);
ok('tana: to\'rt plitka, vazn chizig\'i, WHOOP yoshi', count((h.match(/class="ptiles two wh-bd-tiles">.*?<\/div>\s*<div class="wh-bd-trend"/s) || [''])[0], /class="ptile flat"/g) === 4 && /Vazn · 90 kun/.test(h) && /−3,9 kg/.test(h) && /26,8 yosh/.test(h) && /0,84× <em class="good">sekin<\/em>/.test(h));
ok('BMI 24,8 va maks. puls 189', /24,8 <em class="good">/.test(h) && />189 <small>zarba<\/small>/.test(h));

console.log('\n   yetishmagan qiymat yashiriladi');
delete D.S.whoop.days[TODAY].skin; delete D.S.whoop.days[TODAY].resp; delete D.S.whoop.days[TODAY].spo2;
h = page('ready');
ok('teri va o\'pka yozuvi, chizig\'i, nuqtasi yo\'q', !/wh-map-l l skin|wh-map-l l lung/.test(h) && count(h, /class="wh-map-l [lr] /g) === 4 && count(h, /<circle cx="\d+" cy="\d+" r="5" fill="#/g) === 4 && !/M86 178|M86 110/.test(h) && !/fill="url\(#tbSkin\)"|fill="url\(#tbLung\)"/.test(h));
ok('jadvalda ham o\'sha qatorlar yo\'q', count(h, /<tr><th scope="row">/g) === 4);
D.ui.viewDate = back(2);
h = page('ready');
ok('o\'tgan kun: vazn yozuvi, tendensiya va tana kartasi yo\'q', !/wh-map-l r weight/.test(h) && !/wh-trend|wh-bd"/.test(h) && /wh-map/.test(h) && /Kun o&#39;lchovlari/.test(h));
D.ui.viewDate = back(60);
h = page('ready');
ok('ma\'lumotsiz kun: bitta bo\'sh holat kartasi', /class="card wh-empty"/.test(h) && !/wh-map|wh-rec/.test(h));
D.ui.viewDate = null;

/* ================================================================= */
console.log('\n4. Uyqu');
seed();
h = page('sleep');
ok('bosh karta hero--uyqu, «7 soat 25 daqiqa»', /class="card hero hero--uyqu wh-sl"/.test(h) && /<b>7<\/b><span>soat<\/span><b>25<\/b><span>daqiqa<\/span>/.test(h));
ok('pill «93% · Yetarli», izoh «Kerak edi 8 soat · 35 daq kam»', /93% · Yetarli<\/span>/.test(h) && /Kerak edi 8 soat · 35 daq kam/.test(h));
ok('yotdingiz 23:40, turdingiz 07:05', /Yotdingiz<\/span><span class="ptile-v num">23:40/.test(h) && /Turdingiz<\/span><span class="ptile-v num">07:05/.test(h));
ok('bosqichlar: to\'rt bo\'lak (A.9 ranglari) va to\'rt qator', ['#4B32B8', '#8B7CF6', '#C9C0FB', '#F4B4C0'].every((c) => h.includes(`background:${c}"`) && h.includes(`style="--c:${c}"`)) && count(h, /<ul class="wh-stg-rows">.*?<\/ul>/s) === 1);
ok('chuqur 1 s 32 d · 20,7 %', /<b>Chuqur<\/b><span>tanani tiklaydi<\/span><\/div>\s*<div class="r num"><b>1 s 32 d<\/b><span>20,7%<\/span>/.test(h));
ok('sifat: uch chiziq, izchillik 74 % sariq', count(h, /class="wh-q /g) === 3 && /class="wh-q warn"><div class="wh-q-h"><b>Izchillik<\/b><span class="num">74%/.test(h));
ok('to\'rt plitka: to\'shakda, sikllar, uyg\'onishlar, kunduzgi uyqu', /To&#39;shakda<\/span><span class="ptile-v num">7 s 39 d/.test(h) && />5 ta</.test(h) && />9 marta</.test(h) && /Kunduzgi uyqu<\/span><span class="ptile-v num">yo&#39;q/.test(h));
const b14 = (h.match(/<div class="wh-b14-cols">.*?<\/div>/s) || [''])[0];
ok('14 kecha: 14 ustun, bugungisi ramkada, «kerak 8 s» chizig\'i', count(b14, /<i class="/g) === 14 && count(b14, / now"/g) === 1 && /class="wh-b14-line"[^>]*><b class="num">kerak 8 s<\/b>/.test(h));
const debt = D.whoop.sleepDebt(7);
ok('uyqu qarzi qutisi D.whoop.sleepDebt dan', h.includes(`7 kunda <b>${D.esc(D.fmtHm(debt.h))}</b> uyqu qarzi`), debt);
delete D.S.whoop.days[TODAY].sleepH;
h = page('sleep');
ok('uyqu yozuvi yo\'q — bo\'sh holat, tarix qoladi', /class="card wh-empty"/.test(h) && !/hero--uyqu/.test(h) && /wh-b14/.test(h));

/* ================================================================= */
console.log('\n5. Zo\'riqish');
seed();
h = page('strain');
ok('bosh karta hero--kok, «9,4 · 21 dan · Hali kam»', /class="card hero hero--kok wh-st"/.test(h) && /<b>9,4<\/b><span>21 dan<\/span><em class="under">Hali kam<\/em>/.test(h));
ok('chiziq 9,4/21, belgi va «tavsiya» yorlig\'i strainTarget dan', h.includes(`<i style="width:${((9.4 / 21) * 100).toFixed(1)}%"></i>`) && h.includes(`<u style="left:${((i.strainTarget / 21) * 100).toFixed(1)}%"></u>`) && h.includes(`>tavsiya ${D.fmtNum(i.strainTarget, 1)}</b>`));
ok('shkala 0 · 7 · 14 · 21 va maslahat', /<i>0<\/i><i>7<\/i><i>14<\/i><i>21<\/i>/.test(h) && h.includes(`yana <b>${D.fmtNum(D.round(i.strainTarget - 9.4, 1), 1)}</b> qoldi`));
const en = D.whoop.energy();
ok('uch plitka: kaloriya (kunlik me\'yordan), o\'rt. va maks. puls', count((h.match(/<div class="ptiles wh-st-tiles">.*?<\/div><\/div>/s) || [''])[0], /class="ptile"/g) === 3 && h.includes(`>${D.fmtNum(2140)}</span><span class="ptile-n num">kunlik ${D.fmtNum(en.tdee)} dan`) && />78<\/span><span class="ptile-n num">zarba\/daq/.test(h) && />164<\/span>/.test(h));
ok('mashg\'ulotlar: ikkita, «2 ta · 77 daq»', count(h, /<li class="wh-wo">/g) === 2 && /2 ta · 77 daq/.test(h));
ok('sport nomi tarjima qilingan, vaqt va zo\'riqish', /<b>Kuch mashqi<\/b><span class="num">07:10 · 52 daq<\/span>/.test(h) && /<b class="num">8,1<\/b>/.test(h) && /<b>Yurish<\/b>/.test(h) && /1,9 km/.test(h));
ok('olti zonali chiziq va olti izoh (D.whoop.zoneMins)', count(h, /<div class="wh-zleg">/g) === 2 && count((h.match(/<div class="wh-zleg">.*?<\/div>/s) || [''])[0], /<span title=/g) === 6 && /Dam<b class="num">3 d<\/b>/.test(h) && /Kuchli<b class="num">12 d<\/b>/.test(h));
const s14 = (h.match(/<div class="wh-b14-cols">.*?<\/div>/s) || [''])[0];
ok('14 kun: ustunlar tiklanish zonasi rangida', count(s14, /<i class="z-(good|warn|bad)/g) === 14 && /class="z-good now"/.test(s14) && /class="z-bad"/.test(s14));
D.S.whoop.live = { k: TODAY, strain: 10.2, kcal: 2200, hrAvg: 80, hrMax: 166, since: new Date(Date.now() - 3 * 3600e3).toISOString() };
h = page('strain');
ok('jonli sikl: «jonli · … dan» pilli va jonli qiymat', /class="hero-pill wh-live num"><i class="dot"><\/i>jonli · \d\d:\d\d dan/.test(h) && /<b>10,2<\/b><span>21 dan/.test(h));
D.S.whoop.live = null;
delete D.S.whoop.days[TODAY].strain; D.S.whoop.workouts = [];
h = page('strain');
ok('zo\'riqish yo\'q — bo\'sh holat; mashg\'ulot yo\'q — izoh', /class="card wh-empty"/.test(h) && !/hero--kok/.test(h) && /class="wh-wo-none"/.test(h));

/* ================================================================= */
console.log('\n6. Soat ulanmagan');
seed();
D.S.whoop.connected = false;
D.ui.sub.health = 'sleep';
h = view.render();
ok('faqat Ovqat (yorliqlarsiz) + ulash kartasi', !/hl-seg/.test(h) && /fd-hero/.test(h) && /class="card wh-intro"/.test(h) && /data-act="hlWhoopConnect"/.test(h) && /data-act="hlWhoopCheck"/.test(h));
ok('saqlangan bo\'limcha Ovqatga qaytarildi', D.ui.sub.health === 'ovqat');
ok('pill yo\'q (profil surati qoladi)', view.topRight() === '');
ok('WHOOP sahifalari bo\'sh satr qaytaradi', D.whoop.bodyMap(TODAY) === '' && D.whoop.hero(TODAY) === '' && D.whoop.sleepPage(TODAY) === '' && D.whoop.strainPage(TODAY) === '' && D.whoop.vitals(TODAY) === '');
D.S.food.logs = {}; D.S.food.targets = { kcal: null, p: null, c: null, f: null, auto: false };
h = view.render();
ok('taomsiz kun: bo\'sh holat kartasi va «Me\'yoringizni yozing»', /class="fd-none"/.test(h) && /Hali taom yozilmagan/.test(h) && h.includes(D.esc("Me'yoringizni yozing")) && /<b class="num">0<\/b><span>kkal yeyildi/.test(h));
D.S.whoop.connected = true;
toasts = [];
D.act.hlWhoopRefresh();
ok('hlWhoopRefresh serversiz xabar beradi (amal joyida)', toasts.length === 1);

/* ================================================================= */
console.log('\n7. Ko\'rinish raqamni o\'zgartirmaydi; uch til');
seed();
const before = JSON.stringify(D.S);
for (const s of ['ovqat', 'ready', 'sleep', 'strain']) page(s);
ok('chizish holatni o\'zgartirmaydi', JSON.stringify(D.S) === before);
ok('eski nomlar joyida', ['hero', 'vitals', 'trendCard', 'bodyCard', 'bodyPanel', 'sleepPage', 'strainPage', 'footer', 'workoutRows', 'dayInsight', 'day', 'live', 'workoutsOn', 'zoneMins', 'baseline', 'trend', 'stats', 'naps', 'bioAge', 'energy'].every((f) => typeof D.whoop[f] === 'function')
  && ['page', 'dayTotals', 'targets', 'water', 'overBy', 'burned', 'recalcTargets', 'parseTargets', 'fillTargets'].every((f) => typeof D.food[f] === 'function')
  && ['fdWater', 'fdSend', 'fdPhoto', 'fdDraft', 'fdTargets', 'fdTgSave', 'fdTgAuto', 'fdView', 'fdToEdit', 'fdGo', 'fdAddManual', 'fdSaveRes', 'fdEdSave', 'hlWhoopConnect', 'hlWhoopRefresh', 'hlWhoopCheck', 'hlWhoopDisconnect', 'hlDateToday'].every((a) => typeof D.act[a] === 'function'));
/* Uchala modulda yozilgan har bir kalit uchala tilda bor va render ichida
   tarjimasiz kalit (xom «wh.…») ekranga chiqmaydi. */
const src = ['whoop.js', 'health.js', 'food.js'].map((f) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n');
const keys = [...new Set([...src.matchAll(/'((?:wh|hl|food)\.[A-Za-z0-9_.]+)':/g)].map((m) => m[1]))];
const missing = [];
for (const l of ['uz', 'uzk', 'ru']) { D.S.settings.lang = l; for (const k of keys) if (D.t(k) === k) missing.push(l + ':' + k); }
ok(`har bir kalit uchala tilda (${keys.length} ta)`, missing.length === 0, missing.slice(0, 8));
const raw = [];
for (const l of ['uz', 'uzk', 'ru']) {
  D.S.settings.lang = l;
  for (const s of ['ovqat', 'ready', 'sleep', 'strain']) { const m = page(s).match(/>[^<]*\b(?:wh|hl|food|unit|common)\.[a-z][A-Za-z0-9_.]*[^<]*</); if (m) raw.push(`${l}/${s}: ${m[0]}`); }
}
ok('ekranda tarjimasiz kalit yo\'q', raw.length === 0, raw.slice(0, 5));
D.S.settings.lang = 'ru';
h = page('sleep');
ok('ruscha: «Сон прошлой ночью»', /Сон прошлой ночью/.test(h));
D.S.settings.lang = 'uzk';
h = page('ready');
ok('kirillcha: «Тана харитаси»', /Тана харитаси/.test(h) && view.title() === 'Тана');
D.S.settings.lang = 'uz';

console.log('\nXavfsizlik: holatdan kelgan qiymat HTML ga xom tushmaydi');
D.S.whoop.connected = true;
D.S.whoop.rl = { remaining: '<img src=x onerror=alert(1)>', limit: 1 };
let hx = '';
try { hx = D.whoop.footer(); } catch (e) { hx = 'THROW ' + e.message; }
ok('WHOOP limiti maydoni raqam sifatida chiqadi', !/<img|onerror|THROW/.test(hx), hx.slice(0, 200));
delete D.S.whoop.rl;
const kx = D.today();
D.S.food.logs[kx] = (D.S.food.logs[kx] || []).concat([{ id: 'fx1', ts: Date.now(), name: 'Sinov', grams: 100, kcal: 100, p: 1, c: 1, f: 1, photo: '../../whoop/login', items: [] }]);
hx = D.food.page(kx);
ok('buzuq rasm id si URL ga qo\'shilmaydi', !/whoop\/login/.test(hx));
D.S.food.logs[kx] = D.S.food.logs[kx].filter((m) => m.id !== 'fx1');
if (!D.S.food.logs[kx].length) delete D.S.food.logs[kx];

/* ================================================================= */
/* Jonli modul imkoniyatlari: AI kun xulosasi, tahlilning xato / natija
   holatlari (qayta urinish, tuzatish, tahrir, qo'lda), qismli tahrir.
   Server va AI o'rnida soxta javoblar — so'rov ketmaydi. */
const tick = async () => { for (let j = 0; j < 4; j++) await new Promise((r) => setTimeout(r, 0)); };
(async () => {
  console.log('\n8. AI kun xulosasi');
  seed();
  delete D.S.food.notes;
  h = page('ovqat');
  ok('chizish S.food.notes ni yaratmaydi', !('notes' in D.S.food));
  const EVIL = '- **Oqsil** kam <img src=x onerror=alert(1)>\n- Kechga tvorog';
  D.S.food.notes = { [TODAY]: { text: EVIL, ts: 5 } };
  const notesBefore = JSON.stringify(D.S.food.notes);
  h = page('ovqat');
  ok('AI ulanmagan: saqlangan xulosa ko\'rinadi, xom teg yo\'q, tugma yo\'q', /class="advice tint fd-adv fd-ai"/.test(h) && !/<img src=x/.test(h) && /&lt;img src=x/.test(h) && !/data-act="fdDayAi"/.test(h));
  let asked = null, askFail = null;
  eval(fs.readFileSync(path.join(ROOT, 'js', 'ai.js'), 'utf8'));
  D.ai.available = () => true;
  D.ai.ask = async (msgs, sys, opts) => { asked = { msgs, sys, opts }; if (askFail) throw new Error(askFail); return '- Yangi xulosa'; };
  h = page('ovqat');
  ok('xulosa D.ai.md orqali: ro\'yxat va qalin, teg qochirilgan', /<ul class="ai-ul"><li><strong>Oqsil<\/strong> kam &lt;img src=x onerror=alert\(1\)&gt;<\/li><li>Kechga tvorog<\/li><\/ul>/.test(h));
  ok('xulosa bo\'lsa oddiy qoida maslahati chiqmaydi', !/Oqsil kam: yana/.test(h) && count(h, /class="advice [a-z]+ fd-adv/g) === 1);
  ok('tugma «Yangilash» → fdDayAi', /class="btn sm ghost fd-ai-btn" data-act="fdDayAi">.*?Yangilash<\/button>/s.test(h));
  ok('chizish S.food.notes ga tegmaydi', JSON.stringify(D.S.food.notes) === notesBefore);
  D.S.food.notes = {};
  h = page('ovqat');
  ok('xulosa yo\'q: oddiy qoida + «AI xulosasi» tugmasi', /Oqsil kam: yana 118 g kerak/.test(h) && /data-act="fdDayAi">.*?AI xulosasi<\/button>/s.test(h));
  saves = 0;
  const pr = D.act.fdDayAi();
  h = page('ovqat');
  ok('so\'rov paytida «AI o\'ylayapti…», tugma yashirin', /fd-ai-busy/.test(h) && /AI o&#39;ylayapti…/.test(h) && !/data-act="fdDayAi"/.test(h));
  await pr;
  ok('fdDayAi: S.food.notes[bugun] = { text, ts }, saqlandi', D.S.food.notes[TODAY] && D.S.food.notes[TODAY].text === '- Yangi xulosa' && typeof D.S.food.notes[TODAY].ts === 'number' && Object.keys(D.S.food.notes[TODAY]).length === 2 && saves === 1);
  ok('so\'rovda kun taomlari va me\'yor bor', asked && /Tuxum \(3 ta\), non, choy/.test(asked.msgs[0].content) && /2200 kcal/.test(asked.msgs[0].content) && asked.opts.kind === 'food:day');
  askFail = 'boom';
  await D.act.fdDayAi();
  h = page('ovqat');
  ok('AI xatosi: qizil quti, eski xulosa va tugma joyida', /class="advice bad fd-ai-err"/.test(h) && /AI javob bermadi: boom/.test(h) && /Yangi xulosa/.test(h) && /data-act="fdDayAi"/.test(h));
  askFail = null; await D.act.fdDayAi();
  D.S.food.notes[back(1)] = { text: 'Kechagi xulosa', ts: 1 };
  D.ui.viewDate = back(1);
  h = page('ovqat');
  ok('o\'tgan kun: o\'sha kunning xulosasi, qoida yo\'q', /Kechagi xulosa/.test(h) && !/Yangi xulosa/.test(h) && !/food\.adv|kerak\. /.test(h));
  D.ui.viewDate = null;

  console.log('\n9. Tahlil holatlari: xato → qayta urinish / qo\'lda; natija → tuzatish / tahrir / saqlash');
  seed();
  let calls = [], reply = null;
  D.serverEnabled = () => true;
  D.api = async (url, o) => { calls.push({ url, body: JSON.parse(o.body) }); if (reply instanceof Error) throw reply; return reply; };
  const send = async (text) => { D.act.fdDraft({ value: text }); D.act.fdSend(); await tick(); return page('ovqat'); };
  reply = new Error('rate_limited');
  h = await send('2 ta somsa va choy');
  ok('so\'rov /api/food/analyze ga matn bilan ketdi', calls.length === 1 && calls[0].url === '/api/food/analyze' && calls[0].body.text === '2 ta somsa va choy');
  ok('limit xatosi: qizil quti + Qayta urinish + Qo\'lda + yopish', /data-k="fd-err"><div class="advice bad">/.test(h) && /data-act="fdRetry"/.test(h) && /data-act="fdManual"/.test(h) && /data-act="fdDismiss"/.test(h) && !/data-view="settings"/.test(h));
  D.act.fdRetry(); await tick();
  ok('fdRetry o\'sha matnni qayta yuboradi', calls.length === 2 && calls[1].body.text === '2 ta somsa va choy');
  modalArg = null; D.act.fdManual();
  ok('fdManual yozilgan matn bilan qo\'lda kiritish oynasini ochadi', modalArg && /id="fdEdName"[^>]*value="2 ta somsa va choy"/.test(modalArg.body) && /id="fdEdK"/.test(modalArg.body));
  D.act.fdDismiss();
  ok('fdDismiss kartani yopadi', !/data-k="fd-err"/.test(page('ovqat')));
  reply = new Error('ai_not_configured');
  h = await send('osh');
  ok('AI ulanmagan: Sozlamalar tugmasi, qayta urinish yo\'q', /data-act="go" data-view="settings"/.test(h) && !/data-act="fdRetry"/.test(h) && /data-act="fdManual"/.test(h));
  D.act.fdDismiss();
  reply = new Error('api_500');
  modalArg = null;
  h = await send('norin');
  ok('AI yiqildi: qayta urinish + qo\'lda oynasi o\'zi ochiladi', /data-act="fdRetry"/.test(h) && modalArg && /value="norin"/.test(modalArg.body));
  D.act.fdDismiss();
  reply = { items: [], total: {}, advice: '' };
  h = await send('stol');
  ok('ovqat topilmadi: izoh + Qo\'lda', /data-k="fd-none"/.test(h) && /class="advice warn"/.test(h) && /data-act="fdManual"/.test(h) && !/data-act="fdSaveRes"/.test(h));
  D.act.fdDismiss();

  reply = { title: 'Somsa <b>va</b> choy', confidence: 0.3, score: 6, processing: 'mixed', assumptions: '2 ta o\'rtacha somsa', advice: 'Yog\' ko\'p <script>', tips: ['Salat qo\'shing'],
    items: [{ name: 'Somsa <i>', grams: 200, kcal: 560, p: 18, c: 52, f: 30, fib: 2, salt: 1.5, ca: 40 }, { name: 'Choy', grams: 250, kcal: 2, p: 0, c: 0, f: 0 }] };
  h = await send('2 ta somsa va choy');
  ok('natija: nom va qismlar qochirilgan', /Somsa &lt;b&gt;va&lt;\/b&gt; choy/.test(h) && /Somsa &lt;i&gt;/.test(h) && !/<script>|<i>|Somsa <b>/.test(h));
  ok('natija: past ishonch «taxminiy», baho 6 sariq, qayta ishlanganlik', /class="pill warn">Baho 6\/10</.test(h) && />Aralash</.test(h) && />taxminiy</.test(h));
  ok('natija: jami 562 kkal, tarkib, moddalar jadvali, tavsiya', /<b class="num">562<\/b>/.test(h) && count(h, /class="fd-part"/g) === 2 && /class="fd-det"/.test(h) && /Salat qo&#39;shing/.test(h) && /AI shunday tushundi/.test(h));
  ok('natija amallari: tuzatish qatori, Saqlash, Tahrirlash, Bekor', /id="fdFix"[^>]*data-enter="fdFix"/.test(h) && /data-act="fdFix"/.test(h) && /data-act="fdSaveRes"/.test(h) && /data-act="fdEditRes"/.test(h) && /data-act="fdDismiss"/.test(h));
  const $0 = D.$; D.$ = (q) => (q === '#fdFix' ? { value: 'somsa emas, manti' } : null);
  D.act.fdFix(); await tick();
  D.$ = $0;
  const fx = calls[calls.length - 1].body;
  ok('fdFix: tuzatish gapi va avvalgi qismlar AI\'ga qaytadi', fx.fix === 'somsa emas, manti' && Array.isArray(fx.prev) && fx.prev.length === 2 && fx.text === '2 ta somsa va choy');
  modalArg = null; D.act.fdEditRes();
  ok('fdEditRes: qismli tahrir — gramm (fdEdItemG), olib tashlash (fdEdItemDel), qism qo\'shish (fdEdPartAdd)', modalArg && count(modalArg.body, /data-input="fdEdItemG" data-i="\d"/g) === 2 && count(modalArg.body, /data-act="fdEdItemDel" data-i="\d"/g) === 2 && /data-act="fdEdPartAdd"/.test(modalArg.body) && /Somsa &lt;i&gt;/.test(modalArg.body) && modalArg.actions.some((a) => a.act === 'fdEdSave'));
  const logsBefore = D.S.food.logs[TODAY].length;
  D.act.fdSaveRes();
  const saved = D.S.food.logs[TODAY][logsBefore];
  ok('fdSaveRes: taom qismlari, bahosi va moddalari bilan saqlandi', D.S.food.logs[TODAY].length === logsBefore + 1 && saved.kcal === 562 && saved.items.length === 2 && saved.score === 6 && saved.proc === 'mixed' && saved.fib === 2 && saved.src === 'text');
  h = page('ovqat');
  ok('saqlangach: tahlil kartasi yo\'q, qatorda «6/10», hisobotda moddalar', !/data-k="fd-result"/.test(h) && /class="pill warn fd-meal-sc"[^>]*>6\/10</.test(h) && /class="fd-rep-row (good|warn|bad)"/.test(h) && /Hamma moddalar/.test(h));
  modalArg = null; D.act.fdView({ dataset: { day: TODAY, id: saved.id } });
  ok('fdView: baho, tarkib, moddalar, «Siz yozgan»; rasm faqat to\'g\'ri id bilan', modalArg && /Baho 6\/10/.test(modalArg.body) && /class="fd-det" open/.test(modalArg.body) && /Siz yozgan/.test(modalArg.body) && !/api\/food\/photo/.test(modalArg.body));
  saved.photo = 'fp_0123456789abcdef'; saved.tips = 'buzuq';
  modalArg = null; D.act.fdView({ dataset: { day: TODAY, id: saved.id } });
  ok('to\'g\'ri rasm id si chiqadi; buzuq `tips` oynani yiqitmaydi', modalArg && /src="\/api\/food\/photo\/fp_0123456789abcdef"/.test(modalArg.body) && /api\/food\/photo\/fp_0123456789abcdef/.test(page('ovqat')));
  D.serverEnabled = () => false;
  h = await send('qatiq');
  ok('serversiz: «Server yo\'q» + qo\'lda (so\'rov ketmaydi)', /Server yo&#39;q/.test(h) && /data-act="fdManual"/.test(h) && calls[calls.length - 1].body.text !== 'qatiq');
  D.act.fdDismiss();

  console.log('\n10. Suv: bir bosishda bir nechta stakan kamaysa — qaytarish');
  seed(); toasts = [];
  D.S.health[TODAY].water = 6;
  D.act.fdWater({ dataset: { n: '2' } }); await tick();
  ok('6 → 2: xabar chiqdi', D.S.health[TODAY].water === 2 && toasts.length === 1, toasts);
  toasts = [];
  D.act.fdWater({ dataset: { n: '3' } }); D.act.fdWater({ dataset: { n: '3' } }); await tick();
  ok('ko\'payish va bittaga kamayishda xabar yo\'q', D.S.health[TODAY].water === 2 && toasts.length === 0);

  ok('jonli modulning hamma amali va eksporti joyida', ['fdRetry', 'fdFix', 'fdEditRes', 'fdManual', 'fdDismiss', 'fdDayAi', 'fdEdItemG', 'fdEdItemDel', 'fdEdPartAdd', 'fdEdGrams', 'fdEdDel', 'fdViewDel'].every((a) => typeof D.act[a] === 'function')
    && typeof D.food.dailyRef === 'function' && D.food.NUTR && typeof D.food.NUTR.fib === 'object');

  console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
