/* =====================================================================
   Tezlik o'lchagichi — faqat #tezlik manzili bilan yuklanadi.
   Oddiy ochilishda bu fayl umuman so'ralmaydi, ya'ni hech kimga xarajat emas.
   Maqsadi bitta: taxmin qilish o'rniga HAQIQIY telefondagi sonni ko'rish.
   O'chirish: pastdagi «Yopish» yoki manzildan #tezlik ni olib tashlash.
   ===================================================================== */
(function () {
  'use strict';
  if (!window.D) return;

  const fmt = (n) => (n < 10 ? n.toFixed(1) : String(Math.round(n)));
  const rows = [];       // oxirgi almashinuvlar
  const MAX = 8;

  /* ---- qurilma qanchalik tez? ------------------------------------- */
  /* Bir xil ish bir xil kodda bajariladi, shuning uchun natijani mening
     mashinamdagi bilan solishtirsa bo'ladi. Kichik, ~10 ms lik sinov. */
  function cpuIndex() {
    const t0 = performance.now();
    let x = 0;
    for (let i = 0; i < 300000; i++) x += Math.sqrt(i % 97) * 1.0001;
    const ms = performance.now() - t0;
    return { ms, x };
  }

  /* ---- yuklanish raqamlari ---------------------------------------- */
  /* Bu fayl ochilish tugagandan keyin keladi, ya'ni o'tib ketgan hodisalarni
     `buffered: true` bilan qaytarib olishimiz kerak. Ba'zi brauzerlarda bufer
     bo'sh qaytadi — shuning uchun getEntriesByType ham qo'shildi. */
  const boot = { fcp: 0, longMs: 0, longMax: 0, longN: 0, dcl: 0, load: 0 };
  const seen = new Set();
  function addLong(e) {
    const k = e.startTime + ':' + e.duration;
    if (seen.has(k)) return;
    seen.add(k);
    boot.longMs += e.duration; boot.longN++;
    if (e.duration > boot.longMax) boot.longMax = e.duration;
  }
  function grab() {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) { boot.dcl = nav.domContentLoadedEventEnd; boot.load = nav.loadEventEnd; }
      performance.getEntriesByType('paint').forEach((e) => {
        if (e.name === 'first-contentful-paint' && e.startTime) boot.fcp = e.startTime;
      });
      performance.getEntriesByType('longtask').forEach(addLong);
      // core.js yoqilgan holatda eng boshidan yig'ib turadi — ochilishdagilar faqat shu yerda
      if (window.__perfLong && window.__perfLong.length && !boot.longN) {
        window.__perfLong.forEach((d) => { boot.longMs += d; boot.longN++; if (d > boot.longMax) boot.longMax = d; });
      }
    } catch (e) { /* mayli */ }
  }
  grab();
  try {
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => {
      if (e.entryType === 'paint') { if (e.name === 'first-contentful-paint') boot.fcp = e.startTime; }
      else addLong(e);
    }); draw(); }).observe({ type: 'longtask', buffered: true });
  } catch (e) { /* longtask yo'q (Safari) — qolgani baribir ko'rinadi */ }
  try {
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => {
      if (e.name === 'first-contentful-paint') boot.fcp = e.startTime; }); draw();
    }).observe({ type: 'paint', buffered: true });
  } catch (e) { /* mayli */ }

  /* ---- bo'lim almashinuvini o'lchash ------------------------------ */
  /* D.go ni o'raymiz: ichida ketgan vaqt = bosish paytida interfeys
     javob bermaydigan vaqt. Undan keyingi ikkita kadr = bo'lim ekranga
     chiqqan payt. Ikkalasi ham kerak, chunki ular boshqa narsa. */
  const realGo = D.go;
  D.go = function (id, sub) {
    const t0 = performance.now();
    const out = realGo.apply(this, arguments);
    const block = performance.now() - t0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      // id manzil hash'idan ham kelishi mumkin — pastda innerHTML ga tushadi,
      // shuning uchun faqat xavfsiz belgilarni qoldiramiz.
      rows.unshift({ id: String(id).replace(/[^a-z0-9_-]/gi, '').slice(0, 16) || '?', block, paint: performance.now() - t0 });
      if (rows.length > MAX) rows.pop();
      draw();
    }));
    return out;
  };

  /* ---- ekran ------------------------------------------------------ */
  let box = null;
  function el() {
    if (box) return box;
    box = document.createElement('div');
    box.id = 'perfBox';
    box.style.cssText = [
      'position:fixed', 'left:8px', 'right:8px', 'bottom:calc(8px + env(safe-area-inset-bottom))',
      'z-index:999', 'background:rgba(8,8,12,.94)', 'color:#e8e8ea', 'border:1px solid rgba(255,255,255,.14)',
      'border-radius:14px', 'padding:12px 13px', 'font:12px/1.45 ui-monospace,Menlo,Consolas,monospace',
      'max-height:62vh', 'overflow:auto', '-webkit-overflow-scrolling:touch',
    ].join(';');
    document.body.appendChild(box);
    return box;
  }

  let cpu = null;
  function draw() {
    if (!cpu) cpu = cpuIndex();
    const c = navigator.connection || {};
    const dev = [
      'ekran      ' + innerWidth + '×' + innerHeight + ' · dpr ' + (devicePixelRatio || 1),
      'yadro      ' + (navigator.hardwareConcurrency || '?') + (navigator.deviceMemory ? ' · ' + navigator.deviceMemory + ' GB' : ''),
      'tarmoq     ' + (c.effectiveType || '?') + (c.downlink ? ' · ' + c.downlink + ' Mbit/s' : '') + (c.rtt ? ' · ' + c.rtt + ' ms' : ''),
      'protsessor ' + fmt(cpu.ms) + ' ms  (kichikroq = tezroq)',
    ].join('\n');

    grab();
    const na = (v, txt) => (v ? fmt(v) + ' ms' : (txt || 'o\'lchanmadi'));
    const bt = [
      'birinchi chizish   ' + na(boot.fcp),
      'skriptlar tayyor   ' + na(boot.dcl),
      'to\'liq yuklandi    ' + na(boot.load),
      'uzun vazifalar     ' + (boot.longN
        ? fmt(boot.longMs) + ' ms  (' + boot.longN + ' ta, eng uzuni ' + fmt(boot.longMax) + ')'
        : 'brauzer bermadi'),
    ].join('\n');

    const sw = rows.length
      ? rows.map((r) => '  ' + String(r.id).padEnd(9) + 'muzlash ' + fmt(r.block).padStart(6)
          + ' ms   chiqdi ' + fmt(r.paint).padStart(6) + ' ms').join('\n')
      : '  (bo\'lim almashtiring)';

    el().innerHTML =
      '<div style="font-weight:700;margin-bottom:6px">TEZLIK</div>'
      + '<pre style="margin:0 0 9px;white-space:pre-wrap;color:#a8a8b0">' + dev + '</pre>'
      + '<div style="font-weight:700;margin-bottom:4px">Ochilish</div>'
      + '<pre style="margin:0 0 9px;white-space:pre-wrap">' + bt + '</pre>'
      + '<div style="font-weight:700;margin-bottom:4px">Bo\'lim almashinuvi</div>'
      + '<pre style="margin:0 0 10px;white-space:pre-wrap">' + sw + '</pre>'
      + '<button id="perfCopy" style="font:inherit;padding:7px 12px;margin-right:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:inherit">Nusxa olish</button>'
      + '<button id="perfClose" style="font:inherit;padding:7px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:transparent;color:inherit">Yopish</button>';

    el().querySelector('#perfClose').onclick = () => { box.remove(); box = null; };
    el().querySelector('#perfCopy').onclick = () => {
      const txt = 'TEZLIK\n' + dev + '\n\nOchilish\n' + bt + '\n\nBo\'lim almashinuvi\n' + sw;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
        () => D.toast && D.toast('nusxa olindi'),
        () => { const a = document.createElement('textarea'); a.value = txt; document.body.appendChild(a);
                a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove();
                D.toast && D.toast('nusxa olindi'); });
    };
  }

  draw();
})();
