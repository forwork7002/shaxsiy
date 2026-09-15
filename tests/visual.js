/* Ko'rinish tekshiruvi — kesilish, kontrast va eng kichik yozuv, O'LCHAB.
   Boshqa sinovlardan farqi: Chrome talab qiladi, shuning uchun `node tests/*.js`
   bilan birga yurmaydi va alohida chaqiriladi:

       node tests/visual.js                 # hammasi
       node tests/visual.js --w=320         # bitta kenglik
       CHROME="C:/.../chrome.exe" node tests/visual.js

   ============================================================================
   NEGA BU FAYL BOR: --window-size YOLG'ON GAPIRADI
   ============================================================================
   2026-09-15 da daraja bo'limi `chrome --headless --window-size=320,2600
   --screenshot` bilan tekshirildi va suratda o'nlab «kesilish» ko'rindi —
   medal panjarasi, raqamlar, matn, hammasi chetdan chiqqanday. Bittasi ham
   haqiqiy emas edi.

   Sabab: `--window-size` brauzer OYNASINI kichraytiradi, sahifa esa o'z
   kengligida joylashaveradi va surat shunchaki KESILADI. Ya'ni CSS media
   so'rovlari ham ishlamaydi: 320px oynada `@media (max-width: 380px)` bloki
   umuman qo'llanmaydi.

   To'g'ri yo'l — CDP: `Emulation.setDeviceMetricsOverride` ko'rinish oynasining
   O'ZINI o'zgartiradi. Node 24 da `WebSocket` o'rnatilgan, ya'ni tashqi
   kutubxona kerak emas; `Runtime.evaluate` esa natijani to'g'ridan-to'g'ri
   qaytaradi va sahifaga skript joylash muammosi ham yo'qoladi (inline
   `<script>` headless'da ishlamagan edi).

   ============================================================================
   O'LCHAGICH O'ZINI TEKSHIRADI
   ============================================================================
   Har yurishda BIRINCHI ish — marker: `@media (max-width: 380px)` ichida bir
   elementning `::after` matni almashadi va biz shuni o'qiymiz. Marker kutilgan
   qiymatni ko'rsatmasa, qolgan hamma raqam yolg'on va tekshiruv to'xtaydi.
   Vosita nimani ko'ra olmasligini bilish ham natijaning bir qismi.

   ============================================================================
   VOSITANING MA'LUM CHEGARASI: GRADIENT FON
   ============================================================================
   `getComputedStyle(el).backgroundColor` GRADIENTNI KO'RMAYDI — `transparent`
   qaytaradi va o'lchagich yuqoriga yurib butunlay boshqa fonni topadi. Shu
   sababli medalning oltin yuzasidagi qora belgi sahifa foniga solishtirilib,
   soxta 1,05:1 beradi. Ikki sessiya bir kunda aynan shu tuzoqqa tushdi.
   Shuning uchun: element yoki ota-onasida `background-image` bo'lsa, natija
   «ishonchsiz» deb belgilanadi va yiqilish sifatida sanalmaydi.             */

'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-visual-'));
const PORT = 9411 + (process.pid % 300);
const ARG = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const WIDTHS = ARG('w', '320,360,412').split(',').map(Number);
const THEMES = ARG('theme', 'dark,light').split(',');

/* 380px — css/levels.css dagi tor ekran chegarasi; marker shunga bog'langan. */
const NARROW = 380;

function findChrome() {
  const env = process.env.CHROME;
  const guesses = [env,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const g of guesses) if (g && fs.existsSync(g)) return g;
  return null;
}

/* ------------------------------------------------------------------ */
/* 1. Sinaladigan sahifa — haqiqiy CSS, haqiqiy modul, sun'iy hayot     */
/* ------------------------------------------------------------------ */
function buildPage() {
  const noop = () => {};
  const mk = () => ({ style: {}, classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
    addEventListener: noop, removeEventListener: noop, appendChild: noop, setAttribute: noop, removeAttribute: noop,
    getAttribute: () => null, querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
    dataset: {}, focus: noop, scrollTo: noop, offsetHeight: 0, insertBefore: noop, remove: noop, children: [] });
  /* Node 24 da `navigator`, `crypto`, `fetch` kabilar faqat-o'qish getter —
     oddiy tayinlash TypeError beradi. defineProperty hammasida ishlaydi. */
  const g = global;
  const set = (k, v) => Object.defineProperty(g, k, { value: v, writable: true, configurable: true });
  set('window', g); set('self', g);
  g.addEventListener = noop; g.removeEventListener = noop;
  const el = mk();
  set('document', { documentElement: el, body: el, head: el, addEventListener: noop, removeEventListener: noop,
    createElement: () => mk(), createDocumentFragment: () => mk(), getElementById: () => null,
    querySelector: () => null, querySelectorAll: () => [], readyState: 'complete', visibilityState: 'visible', title: '' });
  set('localStorage', { getItem: () => null, setItem: noop, removeItem: noop, clear: noop });
  set('navigator', { language: 'uz', onLine: true, userAgent: 'node',
    serviceWorker: { register: () => Promise.reject(new Error('no')), addEventListener: noop } });
  set('location', { hash: '', origin: 'http://x', href: 'http://x', search: '', pathname: '/', reload: noop });
  set('history', { replaceState: noop, pushState: noop, state: null });
  set('matchMedia', () => ({ matches: false, addEventListener: noop, addListener: noop }));
  set('requestAnimationFrame', (f) => setTimeout(f, 0));
  set('requestIdleCallback', () => 0);
  set('crypto', { getRandomValues: (a) => a });
  set('scrollTo', noop);

  eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
  const D = g.D;
  const TODAY = D.dayKey(new Date());
  D.today = () => TODAY;
  D.serverEnabled = () => false;
  D.save = noop; D.rerender = noop; D.current = () => 'today';
  D.modal = noop; D.toast = noop;
  D.food = null;
  eval(fs.readFileSync(path.join(ROOT, 'js', 'levels.js'), 'utf8'));
  const L = D.levels;

  /* 600 kunlik hayot — bo'sh holat hech narsani ko'rsatmaydi, chala holat esa
     eng yomon holatni (uzun matn, ko'p medal, to'la grafik) yashiradi. */
  const back = (i) => D.addDays(TODAY, -i);
  const S = D.defaultState();
  S.habits = ['Bomdod', 'Kitob', 'Mashq', 'Suv', 'Zikr'].map((name, i) =>
    ({ id: 'h' + i, name, sphere: ['ruh', 'aql', 'tana', 'tana', 'ruh'][i], active: true,
       schedule: { type: 'daily' }, order: i, createdAt: 1 }));
  for (let i = 0; i < 600; i++) {
    if (i % 37 === 0) continue;                       // zanjir ba'zan uzilsin
    const k = back(i);
    S.logs[k] = S.habits.slice(0, 3 + (i % 3)).map((h) => h.id);
    S.prayers[k] = { bomdod: i % 4 ? 'jamaat' : 'alone', peshin: 'jamaat', asr: 'jamaat',
                     shom: i % 5 ? 'jamaat' : 'alone', xufton: i % 6 ? 'jamaat' : 'qaza' };
    S.dhikr[k] = { total: 100 + (i % 7) * 66 };
    if (i % 3 === 0) S.notes[k] = 'Kun yozuvi.';
    if (i % 2 === 0) S.food.logs[k] = [{ id: 'm' + i, ts: 1, name: 'Tushlik', grams: 300, kcal: 600, p: 30, c: 60, f: 20 }];
    if (i % 9 === 0) S.fasting[k] = { type: 'sunnah', done: true };
    S.whoop.days[k] = { recovery: 40 + (i * 7) % 55, sleepH: 6 + (i % 4), strain: 8 + (i % 9) };
    if (i % 4 === 0) S.whoop.workouts.push({ id: 'w' + i, k, start: 1, sport: 'run', strain: 12, kcal: 500, mins: 45 });
    if (i % 5 === 0) S.gratitude.push({ id: 'g' + i, date: k, text: 'Shukr' });
    if (i % 6 === 0) S.finance.tx.push({ id: 'x' + i, date: k, type: 'out', amount: 50000, cat: 'c1', note: '' });
    if (i % 8 === 0) S.mediaLogs[k] = { m1: 20 };
  }
  for (let i = 0; i < 240; i++) S.tasks.push({ id: 't' + i, text: 'Vazifa', date: back(i % 300), done: true,
    doneAt: Date.parse(back(i % 300) + 'T12:00:00Z'), priority: 2, createdAt: 1 });
  for (let i = 0; i < 7; i++) S.goals.push({ id: 'gl' + i, text: 'Maqsad', dir: 'shaxsiy', priority: 1,
    year: 2026, done: true, doneAt: Date.parse(back(i * 20) + 'T12:00:00Z') });
  S.media = [{ id: 'm1', kind: 'kitob', title: 'Kitob', total: 300, unit: 'bet', status: 'done', createdAt: 1, order: 0 },
             { id: 'm2', kind: 'kitob', title: 'Ikkinchi', total: 200, unit: 'bet', status: 'done', createdAt: 1, order: 1 }];
  for (let i = 0; i < 40; i++) S.weekly['2026-W' + D.pad2((i % 52) + 1)] = { win: 'a', hard: 'b', next: 'c' };
  D.S = D.normalize(S);
  D.emit('state:changed');

  let sheet = '';
  D.sheet = (h) => { sheet = h; };
  L.open();

  const href = (f) => 'file:///' + path.join(ROOT, f).split(path.sep).join('/');
  const page = (theme) => `<!doctype html><html lang="uz" data-theme="${theme}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${href('css/fonts.css')}">
<link rel="stylesheet" href="${href('app.css')}">
<link rel="stylesheet" href="${href('css/sections.css')}">
<link rel="stylesheet" href="${href('css/levels.css')}">
<style>
 body{margin:0;padding:12px;background:var(--bg);color:var(--text)}
 .wrap{display:flex;flex-direction:column;gap:18px}
 /* O'LCHAGICHNING O'Z MARKERLARI — ikkalasi ham haqiqatan qo'llandimi?
    Biri ko'rinish kengligini, ikkinchisi yuqori kontrast emulyatsiyasini
    tekshiradi. Marker mos kelmasa qolgan raqamlar o'qilmaydi. */
 #mq::after{content:'KENG'}
 @media (max-width:${NARROW}px){ #mq::after{content:'TOR'} }
 #mq::before{content:'HC-OFF'}
 @media (prefers-contrast:more){ #mq::before{content:'HC-ON'} }
 #mq{position:absolute;left:-9999px}
</style></head>
<body><span id="mq"></span><div class="wrap">
  <div data-view="today">${L.tile()}</div>
  <div class="card">${L.cardHtml()}</div>
  ${sheet}
</div></body></html>`;

  const out = {};
  for (const t of THEMES) {
    const f = path.join(TMP, 'p-' + t + '.html');
    fs.writeFileSync(f, page(t), 'utf8');
    out[t] = 'file:///' + f.split(path.sep).join('/');
  }
  const d = L.day();
  return { urls: out, note: `daraja ${L.info().level} · ochko ${L.info().xp} · bugun ${d.xp}/${d.goal}`
    + ` · zanjir ${d.cur} · nishon ${L.medals().filter((m) => m.on).length}/${L.ALL.length}` };
}

/* ------------------------------------------------------------------ */
/* 2. Sahifa ichida ishlaydigan o'lchagich                             */
/* ------------------------------------------------------------------ */
const AUDIT = `(function () {
  var W = window.innerWidth;
  var out = { w: W, scrollW: document.documentElement.scrollWidth, over: [], contrast: [], tiny: [], shaky: 0 };

  var mq = document.getElementById('mq');
  var saw = mq ? (getComputedStyle(mq, '::after').content || '') : '';
  out.marker = saw;
  out.markerOk = (W <= ${NARROW}) === (saw.indexOf('TOR') >= 0);
  out.hcMarker = mq ? (getComputedStyle(mq, '::before').content || '') : '';
  out.hcOn = out.hcMarker.indexOf('HC-ON') >= 0;

  function nm(e) {
    var c = (e.className && typeof e.className === 'string') ? e.className.trim().split(/\\s+/).slice(0, 3).join('.') : '';
    return e.tagName.toLowerCase() + (c ? '.' + c : '');
  }
  function isScroller(e) { var s = getComputedStyle(e).overflowX; return s === 'auto' || s === 'scroll'; }

  var all = document.querySelectorAll('*');
  for (var i = 0; i < all.length; i++) {
    var e = all[i], r = e.getBoundingClientRect();
    if (!r.width || e.id === 'mq') continue;     // marker ataylab ekrandan tashqarida
    var inScroll = false;
    for (var p = e.parentElement; p; p = p.parentElement) if (isScroller(p)) { inScroll = true; break; }
    if (inScroll) continue;                      // o'z sirg'aluvchisi bor — kesilish emas
    if (r.right > W + 0.5 || r.left < -0.5) out.over.push({ el: nm(e), left: +r.left.toFixed(1), right: +r.right.toFixed(1) });
  }

  function toRgb(s) { var m = String(s).match(/[\\d.]+/g); if (!m) return null;
    var a = m.slice(0, 3).map(Number); a.push(m[3] === undefined ? 1 : +m[3]); return a; }
  function lum(c) { function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
  function over(fg, bg) { return [0, 1, 2].map(function (i) { return fg[i] * fg[3] + bg[i] * (1 - fg[3]); }); }
  /* Fonni ota elementlar bo'ylab yurib yig'amiz. Gradient uchrasa — ishonchsiz. */
  function bgOf(e) {
    var acc = null, grad = false;
    for (var p = e; p; p = p.parentElement) {
      var cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') grad = true;
      var c = toRgb(cs.backgroundColor);
      if (!c || c[3] === 0) continue;
      acc = (acc === null) ? c : over(acc.concat(1), c).concat(1);
      if (c[3] === 1) return { bg: acc.slice(0, 3), grad: grad };
    }
    return { bg: acc ? acc.slice(0, 3) : [0, 0, 0], grad: grad };
  }
  function ratio(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }

  var WATCH = __WATCH__;
  for (var s = 0; s < WATCH.length; s++) {
    var sel = WATCH[s], node = document.querySelector(sel);
    if (!node) { out.contrast.push({ sel: sel, missing: true }); continue; }
    var cs2 = getComputedStyle(node), fg = toRgb(cs2.color);
    var b = bgOf(node.parentElement || node);
    var px = parseFloat(cs2.fontSize), bold = +cs2.fontWeight >= 700;
    var big = px >= 24 || (px >= 18.66 && bold);
    var r2 = ratio(over(fg, b.bg), b.bg);
    var rec = { sel: sel, px: px, r: +r2.toFixed(2), need: big ? 3 : 4.5, shaky: b.grad };
    rec.ok = rec.r >= rec.need;
    if (b.grad) out.shaky++;
    out.contrast.push(rec);
  }

  /* 11px — ilova bo'ylab eng kichik qadam */
  var txt = document.querySelectorAll('.lv-sheet *, .lv-td *, .lv *');
  for (var j = 0; j < txt.length; j++) {
    var t = txt[j];
    if (!t.textContent || !t.textContent.trim() || t.children.length) continue;
    var fpx = parseFloat(getComputedStyle(t).fontSize);
    if (fpx && fpx < 11) out.tiny.push({ el: nm(t), px: fpx });
  }
  return JSON.stringify(out);
})()`;

/* Kuzatiladigan yozuvlar. Selektor MATNNI tutishi shart: `.lv-cell span`
   medal o'ramini tutib olib soxta natija bergan edi, shuning uchun `span.tiny`. */
const WATCH = [
  '.lv-streak b', '.lv-streak i', '.lv-day-st', '.lv-day-how', '.lv-day-none',
  '.lv-src-n', '.lv-src b', '.lv-td-xp b', '.lv-td-xp i', '.lv-sec-h',
  '.arc-num', '.arc-sub', '.lv-ch-h', '.lv-ch-x', '.lv-step-l',
  '.lv-cell b', '.lv-cell > span.tiny', '.lv-rank', '.lv-motto', '.lv-sub',
  '.lv-near-t b', '.lv-near-p', '.lv-fam-n', '.lv-total', '.lv-how',
];

/* ------------------------------------------------------------------ */
/* 3. CDP — eng kichik mijoz (Node 24 da WebSocket o'rnatilgan)         */
/* ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocket() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const j = await r.json();
      const p = j.find((t) => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (e) { /* hali ko'tarilmagan */ }
    await sleep(250);
  }
  throw new Error('CDP ochilmadi (port ' + PORT + ')');
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const waiting = new Map(), once = new Map();
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) {
      const w = waiting.get(d.id); waiting.delete(d.id);
      d.error ? w.bad(new Error(d.error.message)) : w.ok(d.result);
    } else if (d.method && once.has(d.method)) { once.get(d.method)(); once.delete(d.method); }
  });
  return {
    ready: new Promise((r) => ws.addEventListener('open', r)),
    send: (method, params) => new Promise((ok, bad) => {
      waiting.set(++id, { ok, bad });
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    }),
    once: (m) => new Promise((r) => once.set(m, r)),
    close: () => ws.close(),
  };
}

/* ------------------------------------------------------------------ */
/* 4. Yurish                                                           */
/* ------------------------------------------------------------------ */
(async () => {
  const chrome = findChrome();
  if (!chrome) {
    console.log('Chrome topilmadi. CHROME=<yo\u2018l> bilan ko\u2018rsating.');
    process.exit(2);
  }
  const built = buildPage();
  console.log('Sun\u2019iy holat: ' + built.note);

  const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(TMP, 'profile'), 'about:blank'], { stdio: 'ignore' });

  let fail = 0, checks = 0, seenMissing = false;
  const bad = (msg) => { fail++; console.log('  FAIL ' + msg); };

  try {
    const c = connect(await pageSocket());
    await c.ready;
    await c.send('Page.enable');
    await c.send('Runtime.enable');
    const expr = AUDIT.replace('__WATCH__', JSON.stringify(WATCH));

    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        for (const hc of [false, true]) {
          await c.send('Emulation.setDeviceMetricsOverride',
            { width: w, height: 915, deviceScaleFactor: 2, mobile: true });
          await c.send('Emulation.setEmulatedMedia', { features: hc
            ? [{ name: 'prefers-contrast', value: 'more' }] : [] });
          const loaded = c.once('Page.loadEventFired');
          await c.send('Page.navigate', { url: built.urls[theme] });
          await loaded;
          await sleep(250);
          const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true });
          const a = JSON.parse(r.result.value);
          const label = theme + ' ' + w + 'px' + (hc ? ' +kontrast' : '');

          /* O'lchagich o'zini tekshiradi — bu birinchi va eng muhim shart. */
          checks += 2;
          if (!a.markerOk || a.w !== w) {
            bad(label + ': O\u2018LCHAGICH ISHONCHSIZ — ko\u2018rinish=' + a.w
              + ' marker=' + a.marker + '. Qolgan raqamlar o\u2018qilmadi.');
            continue;
          }
          /* Yuqori kontrast emulyatsiyasi haqiqatan qo'llandimi? Qo'llanmasa
             «nuqson yo'q» degan natija yolg'on bo'lardi. */
          if (a.hcOn !== hc) {
            bad(label + ': YUQORI KONTRAST EMULYATSIYASI QO‘LLANMADI — marker='
              + a.hcMarker + '. Qolgan raqamlar o‘qilmadi.');
            continue;
          }
          if (!seenMissing && a.contrast.some((x) => x.missing)) {
            seenMissing = true;
            console.log('  eslatma: sahifada yo‘q selektorlar — '
              + a.contrast.filter((x) => x.missing).map((x) => x.sel).join(', '));
          }

          const missing = a.contrast.filter((x) => x.missing);
          const low = a.contrast.filter((x) => x.ok === false && !x.shaky);
          checks += 3;
          if (a.over.length) bad(label + ': kesilish ' + a.over.length + ' ta');
          if (low.length) bad(label + ': kontrast past ' + low.length + ' ta');
          if (a.tiny.length) bad(label + ': 11px dan mayda ' + a.tiny.length + ' ta');
          if (!a.over.length && !low.length && !a.tiny.length) {
            console.log('  ok   ' + label + '  (hujjat=' + a.scrollW
              + (a.shaky ? ', ' + a.shaky + ' ta gradient ustida o\u2018lchanmadi' : '')
              + (missing.length ? ', ' + missing.length + ' ta selektor topilmadi' : '') + ')');
          }
          a.over.slice(0, 6).forEach((o) => console.log('         chiqqan: ' + o.el + '  [' + o.left + ' .. ' + o.right + ']'));
          low.forEach((x) => console.log('         past: ' + x.sel + '  ' + x.r + ' / ' + x.need + '  (' + x.px + 'px)'));
          a.tiny.slice(0, 6).forEach((t) => console.log('         mayda: ' + t.el + '  ' + t.px + 'px'));
        }
      }
    }
    c.close();
  } finally {
    proc.kill();
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* mayli */ }
  }

  console.log('\n' + (fail ? fail + ' / ' + checks + ' tekshiruv YIQILDI'
    : 'hammasi joyida \u2014 ' + checks + ' ta tekshiruv') + '\n');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('XATO: ' + e.message); process.exit(1); });
