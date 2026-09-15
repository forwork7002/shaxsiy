/* =====================================================================
   yusa-orb.js — Yusa AI: ekran chetida suzib yuruvchi sahifa yordamchisi.

   Faqat to'rt sahifada ko'rinadi: Bugun · Sog'liq · Ovqat · Moliya.
   Orbni sudrab ekranning hohlagan joyiga qo'yish mumkin — u eng yaqin
   chetga yopishadi va joyi shu qurilmada saqlanadi (D.device.yusa).

   Chalkashmaslik uchun: Yusa doim AYNI OCHIQ sahifa bilan ishlaydi,
   va buni panel tepasidagi chiplar bilan ochiq ko'rsatadi. Sog'liqda
   kontekst ochiq bo'limchaga ergashadi (Tayyorlik → health, Uyqu →
   sleep, Zo'riqish → strain). Chipni bosib boshqa bo'limga o'tish ham
   mumkin — u holda qaysi bo'lim tahlil qilinayotgani yozib turadi.

   Tahlil keshi D.S.ai.cards — ya'ni bo'lim kartalari bilan bitta manba;
   savol-javob esa D.S.ai.chat[section] da bo'lim kesimida saqlanadi.
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc;
  const t = D.t;

  // Ovqat endi alohida bo'lim emas — Tananing birinchi sahifasi, shuning uchun
  // D.current() hech qachon 'food' bo'lmaydi. Chip esa 'food' ni ko'rsatadi:
  // uni bosish Tana › Ovqat kontekstini tanlaydi.
  const PAGES = ['today', 'health', 'food', 'finance'];
  // Tanadagi bo'limcha → AI konteksti (health.js dagi SUBS bilan bir xil)
  const HEALTH_SUB = { ovqat: 'food', ready: 'health', sleep: 'sleep', strain: 'strain' };
  const HEALTH_MOVED = { day: 'ready', weight: 'ready', water: 'ready', body: 'ready', food: 'ovqat' };
  const ORB = 58, EDGE = 12, MAX_CHAT = 24;

  D.i18n.add({
    uz: {
      'yusa.name': 'Yusa AI',
      'yusa.open': "Yusa AI ni ochish", 'yusa.close': 'Yopish',
      'yusa.drag': "Sudrab ko'chiring, bosib oching",
      'yusa.analysis': 'Sahifa tahlili',
      'yusa.ctx': 'Tahlil qilinmoqda: {s}',
      'yusa.ph': "Shu sahifa haqida so'rang…",
      'yusa.send': 'Yuborish', 'yusa.you': 'Siz', 'yusa.typing': 'yozmoqda…',
      'yusa.clear': 'Suhbatni tozalash', 'yusa.cleared': 'Suhbat tozalandi',
      'yusa.hi': "Men Yusa — shu sahifani tahlil qilaman. Meni ekranning hohlagan chetiga sudrang.",
      'yusa.hiGot': 'Tushundim',
    },
    uzk: {
      'yusa.name': 'Yusa AI',
      'yusa.open': 'Yusa AI ни очиш', 'yusa.close': 'Ёпиш',
      'yusa.drag': 'Судраб кўчиринг, босиб очинг',
      'yusa.analysis': 'Саҳифа таҳлили',
      'yusa.ctx': 'Таҳлил қилинмоқда: {s}',
      'yusa.ph': 'Шу саҳифа ҳақида сўранг…',
      'yusa.send': 'Юбориш', 'yusa.you': 'Сиз', 'yusa.typing': 'ёзмоқда…',
      'yusa.clear': 'Суҳбатни тозалаш', 'yusa.cleared': 'Суҳбат тозаланди',
      'yusa.hi': 'Мен Yusa — шу саҳифани таҳлил қиламан. Мени экраннинг ҳоҳлаган четига судранг.',
      'yusa.hiGot': 'Тушундим',
    },
    ru: {
      'yusa.name': 'Yusa AI',
      'yusa.open': 'Открыть Yusa AI', 'yusa.close': 'Закрыть',
      'yusa.drag': 'Перетащите, нажмите чтобы открыть',
      'yusa.analysis': 'Анализ страницы',
      'yusa.ctx': 'Анализирую: {s}',
      'yusa.ph': 'Спросите об этой странице…',
      'yusa.send': 'Отправить', 'yusa.you': 'Вы', 'yusa.typing': 'печатает…',
      'yusa.clear': 'Очистить переписку', 'yusa.cleared': 'Переписка очищена',
      'yusa.hi': 'Я Yusa — разбираю эту страницу. Перетащите меня к любому краю экрана.',
      'yusa.hiGot': 'Понятно',
    },
  });

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */
  let open = false;
  let pick = null;        // chip bilan qo'lda tanlangan sahifa (sahifa almashsa tozalanadi)
  let draft = '';
  let busy = false;       // savol-javob so'rovi (tahlilning o'z holati D.ai.isBusy da)
  let live = '';          // hozir oqib kelayotgan javob (hali suhbatga yozilmagan)
  let err = '';
  let dragMoved = false;
  let drag = null;
  let sig = '';
  let hi = !(D.device && D.device.yusaSeen);   // birinchi marta: orb yonida bir martalik tanishtiruv
  const pos = Object.assign({ side: 'r', y: 0.6 }, (D.device && D.device.yusa) || {});

  function A() {
    const a = D.S.ai || (D.S.ai = { cards: {}, log: [] });
    if (!a.cards || typeof a.cards !== 'object') a.cards = {};
    if (!a.chat || typeof a.chat !== 'object') a.chat = {};
    return a;
  }
  const chatOf = (sec) => { const a = A(); if (!Array.isArray(a.chat[sec])) a.chat[sec] = []; return a.chat[sec]; };
  const chatRead = (sec) => { const c = A().chat[sec]; return Array.isArray(c) ? c : []; };   // faqat o'qish — bo'sh yozuv qoldirmaydi
  const trim = (list) => { if (list.length > MAX_CHAT) list.splice(0, list.length - MAX_CHAT); };

  // Standart qiymat health.js bilan bir xil bo'lishi shart: aks holda sahifa
  // Ovqatda, to'garak esa Tayyorlikda turadi va boshqa narsani tahlil qiladi.
  // Soat ulanmagan bo'lsa health.js baribir Ovqatni ko'rsatadi — to'garak ham.
  function healthSub() {
    let s = D.sub('health', 'ovqat');
    s = HEALTH_MOVED[s] || s;
    if (!HEALTH_SUB[s]) s = 'ovqat';
    const whoopOn = !!(D.S.whoop && D.S.whoop.connected);
    return whoopOn || s === 'ovqat' ? s : 'ovqat';
  }
  // Ayni damdagi sahifa: chip bilan tanlangani ustun, aks holda ochiq bo'lim.
  function activePage() {
    if (pick && PAGES.includes(pick)) return pick;
    const c = D.current();
    // Tana ochiq va Ovqat yorlig'ida — kontekst 'food'
    if (c === 'health' && healthSub() === 'ovqat') return 'food';
    return PAGES.includes(c) ? c : null;
  }
  // Sahifa → AI konteksti. Sog'liq ochiq bo'limchaga ergashadi.
  function sectionOf(page) {
    if (page === 'health') return HEALTH_SUB[healthSub()] || 'health';
    return page;
  }
  // Bo'limning nomi endi \u00abOvqat\u00bb, birinchi sahifasining nomi ham \u00abOvqat\u00bb \u2014
  // shu sababli u yerda faqat bo'lim nomi yoziladi, \u00abOvqat \u00b7 Ovqat\u00bb emas.
  function ctxLabel(page) {
    if (page === 'food') return t('nav.health');
    const base = t('nav.' + page);
    return page === 'health' ? `${base} \u00b7 ${t('hl.sub.' + healthSub())}` : base;
  }

  /* ------------------------------------------------------------------ */
  /* position                                                            */
  /* ------------------------------------------------------------------ */
  /* Ekran o'lchami bir marta o'qilib saqlanadi. applyPos har navigatsiyada ikki marta
     ishlaydi (view:changed va view:rendered), ya'ni butun #view almashgandan keyin —
     o'sha yerda window.innerHeight/innerWidth ni o'qish brauzerni layoutni darhol
     hisoblashga majbur qilardi. O'lchandi: 10 ta bo'lim almashinuviga 24 ta majburiy
     o'qish. Endi bu qiymatlar faqat resize'da yangilanadi. */
  let vpW = window.innerWidth, vpH = window.innerHeight;
  const syncVp = () => { vpW = window.innerWidth; vpH = window.innerHeight; };
  const bottomGap = () => (vpW >= 960 ? 30 : 96);

  function applyPos() {
    const host = document.getElementById('yusa');
    if (!host) return;
    host.dataset.side = pos.side;
    const orb = host.querySelector('.yusa-orb');
    if (!orb) return;
    if (drag && drag.moved) {
      orb.style.left = Math.round(drag.x) + 'px';
      orb.style.top = Math.round(drag.y) + 'px';
      orb.style.right = 'auto';
      return;
    }
    const vh = vpH;
    const top = Math.round(D.clamp(pos.y * vh, 14, Math.max(14, vh - ORB - bottomGap())));
    orb.style.top = top + 'px';
    if (pos.side === 'l') { orb.style.left = EDGE + 'px'; orb.style.right = 'auto'; }
    else { orb.style.right = EDGE + 'px'; orb.style.left = 'auto'; }
    const bubble = host.querySelector('.yusa-hi');
    if (bubble) {
      // pufak orbning markaziga tenglashadi (CSS da translate: 0 -50%), lekin ekrandan chiqmaydi
      bubble.style.top = Math.round(D.clamp(top + ORB / 2, 70, Math.max(70, vh - 70))) + 'px';
      if (pos.side === 'l') { bubble.style.left = (EDGE + ORB + 10) + 'px'; bubble.style.right = 'auto'; }
      else { bubble.style.right = (EDGE + ORB + 10) + 'px'; bubble.style.left = 'auto'; }
    }
  }

  /* ------------------------------------------------------------------ */
  /* transport                                                           */
  /* ------------------------------------------------------------------ */
  async function send() {
    const text = String(draft || '').trim();
    if (!text || busy) return;
    const page = activePage();
    if (!page) return;
    const sec = sectionOf(page);
    if (!D.ai.available()) { D.toast(t('ai.none'), { ms: 4000 }); return; }

    const list = chatOf(sec);
    list.push({ role: 'user', content: text, ts: Date.now() });
    trim(list);
    draft = ''; err = ''; busy = true; live = '';
    D.save();
    draw(true, true);

    try {
      // Tahlil allaqachon bo'lsa — uni suhbatning birinchi almashinuvi qilib beramiz,
      // shunda "nega bunday?" degan savol nimaga tegishli ekanini model biladi.
      const card = A().cards[sec];
      const msgs = [];
      if (card && card.text) {
        msgs.push({ role: 'user', content: D.ai.question(sec) });
        msgs.push({ role: 'assistant', content: card.text });
      }
      for (const m of list) msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') });
      const out = await D.ai.stream(msgs, D.ai.systemFor(sec), { maxTokens: 1200, kind: 'yusa:' + sec }, paint);
      live = '';
      list.push({ role: 'assistant', content: out, ts: Date.now() });
      trim(list);
      D.save();
    } catch (e) {
      err = String((e && e.message) || e).slice(0, 140);
      D.logError(e);
    } finally {
      busy = false;
      live = '';
      draw(true, true);
    }
  }

  /* Yozilayotgan matnni to'g'ridan-to'g'ri pufakning ichiga yozamiz: butun lentani
     qayta qurish har bo'lakda ko'chishga (va aylantirish sakrashiga) olib kelardi. */
  function into(id, html, toBottom) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.innerHTML = html;
    el.classList.add('is-live');   // yozilayotgan chiziqcha shu sinfda
    if (toBottom) {
      const feed = document.getElementById('yusaFeed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    }
    return true;
  }
  // soniyada ~10 marta — token sayin emas
  const paint = paced((sofar) => {
    if (!busy) return;   // so'rov tugagan bo'lsa kechikkan bo'lak hech narsani o'zgartirmaydi
    live = sofar;
    if (!into('yusaLive', D.ai.md(live), true)) draw(true, true);
  }, 90);
  function paced(fn, ms) {
    let last = 0, timer = null, val = null;
    return (v) => {
      val = v;
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(val); return; }
      if (!timer) timer = setTimeout(() => { timer = null; last = Date.now(); fn(val); }, ms - (now - last));
    };
  }

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  const sphere = () => `<span class="yusa-sphere"><i></i><i></i></span>`;

  // Bugungi tahlil hali qilinmagan bo'lsa orbda kichik nuqta — "bu yerda ko'radigan narsa bor".
  function pending(sec) {
    try { return D.ai.available() && D.ai.enoughData(sec) && !D.ai.isFresh(sec); } catch (e) { return false; }
  }

  const orbHtml = () => `<button type="button" class="yusa-orb" id="yusaOrb"
      aria-label="${esc(t('yusa.open'))}" title="${esc(t('yusa.drag'))}" aria-expanded="false">
      <span class="yusa-ring" aria-hidden="true"></span>
      <span class="yusa-ring b" aria-hidden="true"></span>
      ${sphere()}
    </button>`;

  function hiHtml() {
    return `<div class="yusa-hi" role="note">
      <p>${esc(t('yusa.hi'))}</p>
      <button class="btn xs ghost" data-act="yusaHiGot">${esc(t('yusa.hiGot'))}</button>
    </div>`;
  }

  /* Chip yozuvi bo'lim nomidan emas, kontekstning o'z nomidan olinadi.
     Bo'lim endi «Ovqat» deb ataladi, ya'ni t('nav.health') bilan t('nav.food')
     bir xil so'z — ikkita bir xil yozuvli chip esa boshqa-boshqa narsani
     tahlil qilardi. Endi 'health' chipi ochiq WHOOP sahifasining nomi bilan
     ataladi (Tayyorlik · Uyqu · Zo'riqish), Ovqatda turganda esa umuman
     ko'rsatilmaydi: o'sha holatda u 'food' chipi bilan bir xil ish qiladi. */
  const chipLabel = (p) => (p === 'health' ? t('hl.sub.' + healthSub()) : t('nav.' + p));
  const chipsHtml = (page) => PAGES.filter((p) => p !== 'health' || healthSub() !== 'ovqat').map((p) =>
    `<button type="button" class="yusa-chip ${p === page ? 'on' : ''}" data-act="yusaPick" data-page="${p}">${esc(chipLabel(p))}</button>`).join('');

  function analysisHtml(sec) {
    const card = A().cards[sec];
    const running = D.ai.isBusy(sec);
    const aiErr = D.ai.errorOf(sec);
    const mode = D.ai.mode();
    const enough = D.ai.enoughData(sec);
    const age = card ? D.daysBetween(card.day, D.today()) : null;
    const ageTxt = card ? (age <= 0 ? t('ai.fresh') : t('ai.stale', { n: age })) : t('ai.never');

    let body;
    if (running) {
      // Birinchi bo'lak kelgunicha — nuqtalar; keyin javobning o'zi, yozilishi bilan.
      const sofar = D.ai.partialOf ? D.ai.partialOf(sec) : '';
      body = sofar
        ? `<div class="ai-body is-live" id="yusaStream">${D.ai.md(sofar)}</div>`
        : `<div class="ai-busy">${D.ic('sparkles', 16)}<span>${esc(t('ai.busy'))}</span><span class="ai-dots"><i></i><i></i><i></i></span></div>`;
    } else if (aiErr) {
      body = `<div class="banner bad yusa-err">${D.ic('alert', 16)}<span class="grow">${esc(t('ai.err', { m: aiErr }))}</span>
        <div class="yusa-err-acts">
          <button class="btn sm ghost" data-act="yusaRun">${D.ic('refresh', 14)} ${esc(t('ai.retry'))}</button>
          <button class="btn icon" data-act="yusaAiDismiss" aria-label="${esc(t('btn.close'))}">${D.ic('x', 15)}</button>
        </div></div>`;
    } else if (card) {
      body = `<div class="ai-body">${D.ai.md(card.text)}</div>`;
    } else if (mode === 'none') {
      body = `<p class="help">${esc(t('ai.hint.' + sec))}</p>
        <div class="banner">${D.ic('info', 16)}<span class="grow">${esc(t('ai.none'))}</span><button class="btn sm ghost" data-act="yusaSetup">${esc(t('ai.setup'))}</button></div>`;
    } else if (!enough) {
      body = `<p class="help">${esc(t('ai.hint.' + sec))}</p><div class="empty">${esc(t('ai.autoOff'))}</div>`;
    } else {
      body = `<p class="help">${esc(t('ai.hint.' + sec))}</p>`;
    }

    const canRun = mode !== 'none' && enough && !running;
    const foot = aiErr ? '' : `<div class="yusa-an-foot">
      <button class="btn sm ${card ? 'ghost' : ''}" data-act="yusaRun" ${canRun ? '' : 'disabled'}>
        ${D.ic(card ? 'refresh' : 'sparkles', 14)} ${esc(card ? t('ai.again') : t('ai.run'))}</button>
      ${card ? `<button class="btn icon" data-act="yusaCopy" aria-label="${esc(t('ai.copy'))}" title="${esc(t('ai.copy'))}">${D.ic('save', 15)}</button>` : ''}</div>`;

    return `<div class="yusa-an">
      <div class="yusa-an-head"><span class="eyebrow">${esc(t('yusa.analysis'))}</span>${aiErr ? '' : `<span class="tiny muted">${esc(ageTxt)}</span>`}</div>
      ${body}${foot}</div>`;
  }

  const clock = (ts) => { const p = D.nowTz(new Date(+ts || Date.now())); return D.fmtTime(p.h, p.min); };

  function bubble(m) {
    const ai = m.role === 'assistant';
    return `<div class="yusa-msg ${ai ? 'ai' : 'me'}">
      <div class="yusa-role"><span>${ai ? 'YUSA' : esc(t('yusa.you'))}</span><span class="num">${esc(clock(m.ts))}</span></div>
      <div class="yusa-bubble">${ai ? D.ai.md(m.content) : esc(m.content).replace(/\n/g, '<br>')}</div></div>`;
  }

  function headHtml(sec, hasChat) {
    return `<span class="yusa-mini">${sphere()}</span>
      <div class="yusa-id">
        <div class="yusa-title">${esc(t('yusa.name'))}</div>
        <div class="yusa-mode tiny muted">${esc(t('yusa.mode.' + D.ai.mode()))}</div>
      </div>
      ${hasChat ? `<button class="btn icon" data-act="yusaClear" aria-label="${esc(t('yusa.clear'))}" title="${esc(t('yusa.clear'))}">${D.ic('trash', 16)}</button>` : ''}
      <button class="btn icon" data-act="yusaClose" aria-label="${esc(t('yusa.close'))}">${D.ic('x', 18)}</button>`;
  }
  const ctxHtml = (page) => `${D.ic('layers', 13)}<span>${esc(t('yusa.ctx', { s: ctxLabel(page) }))}</span>`;

  function feedHtml(sec, list) {
    return analysisHtml(sec)
      + list.map(bubble).join('')
      + (busy ? `<div class="yusa-msg ai"><div class="yusa-role"><span>YUSA</span></div><div class="yusa-bubble ${live ? 'is-live' : ''}" id="yusaLive">${live
          ? D.ai.md(live)
          : `<span class="ai-dots"><i></i><i></i><i></i></span> <span class="muted small">${esc(t('yusa.typing'))}</span>`}</div></div>` : '')
      + (err ? `<div class="banner bad yusa-err">${D.ic('alert', 16)}<span class="grow">${esc(t('ai.err', { m: err }))}</span>
          <div class="yusa-err-acts"><button class="btn icon" data-act="yusaDismiss" aria-label="${esc(t('btn.close'))}">${D.ic('x', 15)}</button></div></div>` : '');
  }

  // Panel qobig'i bir marta quriladi — keyin faqat ichi yangilanadi. Shu sababli
  // ochilish animatsiyasi va yozayotgan matn har yangilanishda buzilmaydi.
  function panelShell() {
    return `<section class="yusa-panel" id="yusaPanel" role="dialog" aria-label="${esc(t('yusa.name'))}">
      <header class="yusa-head" id="yusaHead"></header>
      <div class="yusa-chips" id="yusaChips"></div>
      <div class="yusa-ctx" id="yusaCtx"></div>
      <div class="yusa-feed" id="yusaFeed" aria-live="polite"></div>
      <div class="yusa-composer">
        <textarea class="ta yusa-inp" id="yusaInp" rows="1" data-input="yusaDraft" placeholder="${esc(t('yusa.ph'))}" aria-label="${esc(t('yusa.send'))}"></textarea>
        <button class="btn sq yusa-send" id="yusaSend" data-act="yusaSend" aria-label="${esc(t('yusa.send'))}">${D.ic('chevR', 20)}</button>
      </div>
    </section>`;
  }

  function autoGrow() {
    const el = document.getElementById('yusaInp');
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(120, Math.max(42, el.scrollHeight)) + 'px';
  }

  function draw(force, toBottom) {
    const host = document.getElementById('yusa');
    if (!host || !D.S) return;
    const page = activePage();
    if (!page) { host.hidden = true; host.innerHTML = ''; open = false; sig = ''; return; }
    host.hidden = false;

    const sec = sectionOf(page);
    const card = A().cards[sec];
    const list = chatRead(sec);
    const dot = !open && pending(sec);
    const s = [page, sec, open, busy, err, D.ai.isBusy(sec), D.ai.errorOf(sec), D.ai.mode(),
      card ? card.ts : 0, list.length, pos.side, D.lang(), dot, hi].join('|');
    if (!force && s === sig) return;
    sig = s;

    /* orb — bir marta quriladi; qayta yaratilsa orbita va suzish noldan boshlanadi */
    let orb = host.querySelector('.yusa-orb');
    if (!orb) { host.insertAdjacentHTML('afterbegin', orbHtml()); orb = host.querySelector('.yusa-orb'); }
    orb.classList.toggle('is-busy', D.ai.isBusy(sec) || busy);
    orb.classList.toggle('is-open', open);
    orb.setAttribute('aria-expanded', String(open));
    const hasDot = !!orb.querySelector('.yusa-dot');
    if (dot && !hasDot) orb.insertAdjacentHTML('beforeend', '<span class="yusa-dot" aria-hidden="true"></span>');
    else if (!dot && hasDot) orb.querySelector('.yusa-dot').remove();

    /* tanishtiruv pufagi */
    const bubbleEl = host.querySelector('.yusa-hi');
    if (hi && !open && !bubbleEl) orb.insertAdjacentHTML('afterend', hiHtml());
    else if ((!hi || open) && bubbleEl) bubbleEl.remove();

    /* panel */
    let panel = document.getElementById('yusaPanel');
    if (!open) { if (panel) panel.remove(); applyPos(); return; }
    if (!panel) { host.insertAdjacentHTML('beforeend', panelShell()); panel = document.getElementById('yusaPanel'); }

    document.getElementById('yusaHead').innerHTML = headHtml(sec, list.length > 0);
    document.getElementById('yusaChips').innerHTML = chipsHtml(page);
    document.getElementById('yusaCtx').innerHTML = ctxHtml(page);

    const feed = document.getElementById('yusaFeed');
    const atBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 40;
    const keepTop = feed.scrollTop;
    feed.innerHTML = feedHtml(sec, list);
    feed.scrollTop = toBottom || atBottom ? feed.scrollHeight : keepTop;

    // matn maydoni hech qachon qayta yozilmaydi — fokus ham, kursor ham joyida qoladi
    const inp = document.getElementById('yusaInp');
    if (inp && inp.value !== draft) { inp.value = draft; autoGrow(); }
    document.getElementById('yusaSend').disabled = busy;
    applyPos();
  }

  function toggle(on) {
    open = on === undefined ? !open : !!on;
    if (open) dismissHi();
    err = '';
    draw(true, true);
    if (open) setTimeout(() => { const el = document.getElementById('yusaInp'); if (el && vpW >= 960) el.focus(); }, 40);
  }

  /* ------------------------------------------------------------------ */
  /* actions                                                             */
  /* ------------------------------------------------------------------ */
  function dismissHi() {
    if (!hi) return;
    hi = false;
    D.device.yusaSeen = true;
    D.saveDevice();
  }
  D.act.yusaHiGot = () => { dismissHi(); draw(true); };
  D.act.yusaClose = () => toggle(false);
  D.act.yusaPick = (el) => {
    const p = el.dataset.page;
    if (!PAGES.includes(p)) return;
    // Chip ochiq sahifaning o'zi bo'lsa — qo'lda tanlashni saqlamaymiz, avtomatik ergashsin.
    pick = p === D.current() ? null : p;
    err = '';
    draw(true, true);
  };
  D.act.yusaRun = () => {
    const page = activePage();
    if (page) D.ai.advise(sectionOf(page));
  };
  D.act.yusaDraft = (el) => { draft = el.value; autoGrow(); };
  D.act.yusaSend = () => { const el = document.getElementById('yusaInp'); if (el) draft = el.value; return send(); };
  D.act.yusaDismiss = () => { err = ''; draw(true); };
  D.act.yusaAiDismiss = () => { const p = activePage(); if (p) D.ai.clearError(sectionOf(p)); };
  D.act.yusaSetup = () => { toggle(false); D.go('yusa'); };
  D.act.yusaCopy = async () => {
    const page = activePage();
    const card = page && A().cards[sectionOf(page)];
    if (!card) return;
    try { await navigator.clipboard.writeText(card.text); D.toast(t('ai.copied')); } catch (e) { D.toast(t('error.action')); }
  };
  D.act.yusaClear = () => {
    const page = activePage();
    if (!page) return;
    A().chat[sectionOf(page)] = [];
    D.save();
    D.toast(t('yusa.cleared'));
    draw(true, true);
  };

  /* ------------------------------------------------------------------ */
  /* mount: orb sudralishi + hodisalar                                   */
  /* ------------------------------------------------------------------ */
  function mount() {
    if (document.getElementById('yusa')) return;
    const host = document.createElement('div');
    host.className = 'yusa';
    host.id = 'yusa';
    host.dataset.side = pos.side;
    host.hidden = true;
    document.body.appendChild(host);

    // Sudrash pointer hodisalari bilan: tugma qayta chizilgani uchun delegatsiya.
    host.addEventListener('pointerdown', (ev) => {
      const orb = ev.target.closest && ev.target.closest('.yusa-orb');
      if (!orb || open || ev.button > 0) return;
      const r = orb.getBoundingClientRect();
      drag = { id: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top, x: r.left, y: r.top, x0: r.left, y0: r.top, moved: false };
      try { orb.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    host.addEventListener('pointermove', (ev) => {
      if (!drag || ev.pointerId !== drag.id) return;
      const nx = ev.clientX - drag.dx, ny = ev.clientY - drag.dy;
      if (!drag.moved && Math.abs(nx - drag.x0) + Math.abs(ny - drag.y0) < 6) return;
      drag.moved = true;
      drag.x = D.clamp(nx, 6, vpW - ORB - 6);
      drag.y = D.clamp(ny, 6, vpH - ORB - 6);
      applyPos();
    });
    const endDrag = (ev) => {
      if (!drag || ev.pointerId !== drag.id) return;
      if (drag.moved) {
        // eng yaqin chetga yopishadi, balandlik esa ekran ulushi sifatida saqlanadi
        pos.side = drag.x + ORB / 2 < vpW / 2 ? 'l' : 'r';
        pos.y = D.clamp(drag.y / Math.max(1, vpH), 0, 1);
        D.device.yusa = { side: pos.side, y: pos.y };
        D.saveDevice();
        dragMoved = true;         // keyingi click ochilishga sabab bo'lmasin
      }
      drag = null;
      applyPos();
    };
    host.addEventListener('pointerup', endDrag);
    host.addEventListener('pointercancel', (ev) => { if (drag && ev.pointerId === drag.id) { drag = null; applyPos(); } });

    host.addEventListener('click', (ev) => {
      if (!ev.target.closest || !ev.target.closest('.yusa-orb')) return;
      if (dragMoved) { dragMoved = false; return; }
      toggle();
    });
    // textarea: Enter yuboradi, Shift+Enter yangi qator
    host.addEventListener('keydown', (ev) => {
      if (ev.target.id !== 'yusaInp') return;
      if (ev.key === 'Escape') { ev.preventDefault(); toggle(false); return; }
      if (ev.key !== 'Enter' || ev.shiftKey) return;
      ev.preventDefault();
      draft = ev.target.value;
      send();
    });

    // Escape panelning istalgan joyidan yopadi (core faqat modal/palitrani yopadi)
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && open) toggle(false);
    });
    window.addEventListener('resize', () => { syncVp(); applyPos(); });
    D.on('view:changed', () => { pick = null; err = ''; draw(true); });
    D.on('view:rendered', () => draw());       // Sog'liq bo'limchasi almashsa kontekst ergashadi
    D.on('ai:changed', () => draw(true));
    // tahlil oqib kelayapti: birinchi bo'lakda karta qayta quriladi, keyingilarida faqat ichi
    D.on('ai:stream', (sec) => {
      const page = activePage();
      if (!open || !page || sectionOf(page) !== sec) return;
      if (!into('yusaStream', D.ai.md(D.ai.partialOf(sec)), false)) draw(true);
    });
    D.on('state:changed', D.debounce(() => draw(), 250));
    D.on('day:changed', () => draw(true));
    D.on('me:changed', () => { open = false; pick = null; draw(true); });
    draw(true);
  }

  D.on('boot', mount);
  // Bo'limlar kechiktirilib yuklanadigan bo'lgani uchun (core.js D.loadView) yusa.js ham
  // bir kun kech yuklanishi mumkin — u holda 'boot' allaqachon o'tib ketgan bo'ladi.
  if (D.S && D.current && D.current()) mount();
})();
