/* =====================================================================
   yusa.js — Yusa AI murabbiy: suhbat sahifasi.
   orb avatar · chat threads · markdown-lite. Kontekst ham, transport ham
   js/ai.js da: D.ai.chatSystem() va D.ai.ask() (server proksi → qurilma kaliti).

   Bo'lim id'si 'yusa', saqlash kalitlari S.yusa.threads va device.yusaKey.
   Eski 'nova' nomidagi suhbatlar core.js dagi ko'chirish bilan olib o'tiladi.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'yusa.eyebrow': 'AI murabbiy',
      'yusa.tagline': "Do'stona, qisqa, aniq — sizning ma'lumotlaringizni ko'radi",
      'yusa.mode.server': 'Server orqali', 'yusa.mode.key': "O'z kalitingiz", 'yusa.mode.none': 'Ulanmagan',
      'yusa.status.idle': 'Tayyor', 'yusa.status.think': "O'ylamoqda…", 'yusa.status.happy': 'Javob berdi',
      'yusa.setupHint': "Yusa ishlashi uchun serverda AI kaliti (OpenAI) yoki o'z API kalitingiz kerak.",
      'yusa.setupBtn': 'Kalit kiritish',
      'yusa.key.title': 'API kalit', 'yusa.key.toggle': 'Kalit sozlamalari',
      'yusa.key.note': "Server proksi afzal — u kalitni sizdan so'ramaydi. O'z kalitingiz faqat shu qurilmada saqlanadi va to'g'ridan-to'g'ri Anthropic'ga yuboriladi (serverga emas, sinxronlanmaydi).",
      'yusa.key.ph': 'sk-ant-…', 'yusa.key.save': 'Saqlash', 'yusa.key.forget': 'Kalitni unutish',
      'yusa.key.saved': 'Kalit saqlandi', 'yusa.key.forgot': "Kalit o'chirildi", 'yusa.key.empty': "Kalit bo'sh",
      'yusa.key.set': 'Kalit saqlangan: {k}', 'yusa.key.none': 'Kalit kiritilmagan',
      'yusa.threads': 'Suhbatlar', 'yusa.threads.empty': "Hali suhbat yo'q", 'yusa.thread.new': 'Yangi suhbat',
      'yusa.thread.untitled': 'Yangi suhbat', 'yusa.thread.deleted': "Suhbat o'chirildi", 'yusa.thread.msgs': '{n} xabar',
      'yusa.welcome': "Assalomu alaykum! Men Yusa — shaxsiy murabbiyingiz. Bugungi odatlar, vazifalar va sog'liq ko'rsatkichlaringizni ko'rib turibman. Nimadan boshlaymiz?",
      'yusa.quick.day': 'Bugungi kunimni tahlil qil', 'yusa.quick.tomorrow': 'Ertaga uchun 3 ta vazifa taklif qil',
      'yusa.quick.week': 'Haftalik xulosa', 'yusa.quick.motivation': 'Motivatsiya',
      'yusa.inputPh': "Yusaga yozing… (Enter — yuborish, Shift+Enter — yangi qator)",
      'yusa.p.send': 'Yuborish', 'yusa.p.you': 'Siz', 'yusa.p.typing': 'Yusa yozmoqda…',
      'yusa.err.noTransport': "Server javob bermadi va API kalit kiritilmagan", 'yusa.err.empty': "Bo'sh javob keldi",
      'yusa.err.http': 'Xato: {m}', 'yusa.retry': 'Qayta urinish', 'yusa.dismiss': 'Yopish', 'yusa.key.badFormat': "Kalit odatda sk-ant- bilan boshlanadi — baribir saqlandi",
      'yusa.ctx.title': "Yusa nimani ko'radi", 'yusa.ctx.habits': 'Odatlar bugun', 'yusa.ctx.week': '7 kun', 'yusa.ctx.tasks': 'Vazifalar',
      'yusa.ctx.sleep': 'Uyqu', 'yusa.ctx.rec': 'Tiklanish', 'yusa.ctx.net': 'Oylik sof',
      'yusa.ctx.note': "Yusa Bugun, Sog'liq, Ovqat, Moliya va Ibodat raqamlarini hamda WHOOP'ning so'nggi 14 kunini ko'radi.",
      'yusa.langName': "o'zbek (lotin)",
    },
    uzk: {
      'yusa.eyebrow': 'AI мураббий',
      'yusa.tagline': 'Дўстона, қисқа, аниқ — сизнинг маълумотларингизни кўради',
      'yusa.mode.server': 'Сервер орқали', 'yusa.mode.key': 'Ўз калитингиз', 'yusa.mode.none': 'Уланмаган',
      'yusa.status.idle': 'Тайёр', 'yusa.status.think': 'Ўйламоқда…', 'yusa.status.happy': 'Жавоб берди',
      'yusa.setupHint': 'Yusa ишлаши учун серверда AI калити (OpenAI) ёки ўз API калитингиз керак.',
      'yusa.setupBtn': 'Калит киритиш',
      'yusa.key.title': 'API калит', 'yusa.key.toggle': 'Калит созламалари',
      'yusa.key.note': 'Сервер прокси афзал — у калитни сиздан сўрамайди. Ўз калитингиз фақат шу қурилмада сақланади ва тўғридан-тўғри Anthropic’га юборилади (серверга эмас, синхронланмайди).',
      'yusa.key.ph': 'sk-ant-…', 'yusa.key.save': 'Сақлаш', 'yusa.key.forget': 'Калитни унутиш',
      'yusa.key.saved': 'Калит сақланди', 'yusa.key.forgot': 'Калит ўчирилди', 'yusa.key.empty': 'Калит бўш',
      'yusa.key.set': 'Калит сақланган: {k}', 'yusa.key.none': 'Калит киритилмаган',
      'yusa.threads': 'Суҳбатлар', 'yusa.threads.empty': 'Ҳали суҳбат йўқ', 'yusa.thread.new': 'Янги суҳбат',
      'yusa.thread.untitled': 'Янги суҳбат', 'yusa.thread.deleted': 'Суҳбат ўчирилди', 'yusa.thread.msgs': '{n} хабар',
      'yusa.welcome': 'Ассалому алайкум! Мен Yusa — шахсий мураббийингиз. Бугунги одатлар, вазифалар ва соғлиқ кўрсаткичларингизни кўриб турибман. Нимадан бошлаймиз?',
      'yusa.quick.day': 'Бугунги кунимни таҳлил қил', 'yusa.quick.tomorrow': 'Эртага учун 3 та вазифа таклиф қил',
      'yusa.quick.week': 'Ҳафталик хулоса', 'yusa.quick.motivation': 'Мотивация',
      'yusa.inputPh': 'Yusa’га ёзинг… (Enter — юбориш, Shift+Enter — янги қатор)',
      'yusa.p.send': 'Юбориш', 'yusa.p.you': 'Сиз', 'yusa.p.typing': 'Yusa ёзмоқда…',
      'yusa.err.noTransport': 'Сервер жавоб бермади ва API калит киритилмаган', 'yusa.err.empty': 'Бўш жавоб келди',
      'yusa.err.http': 'Хато: {m}', 'yusa.retry': 'Қайта уриниш', 'yusa.dismiss': 'Ёпиш', 'yusa.key.badFormat': 'Калит одатда sk-ant- билан бошланади — барибир сақланди',
      'yusa.ctx.title': 'Yusa нимани кўради', 'yusa.ctx.habits': 'Одатлар бугун', 'yusa.ctx.week': '7 кун', 'yusa.ctx.tasks': 'Вазифалар',
      'yusa.ctx.sleep': 'Уйқу', 'yusa.ctx.rec': 'Тикланиш', 'yusa.ctx.net': 'Ойлик соф',
      'yusa.ctx.note': "Yusa Бугун, Соғлиқ, Овқат, Молия ва Ибодат рақамларини ҳамда WHOOP'нинг сўнгги 14 кунини кўради.",
      'yusa.langName': 'ўзбек (кирилл)',
    },
    ru: {
      'yusa.eyebrow': 'AI-наставник',
      'yusa.tagline': 'Дружелюбный, краткий, точный — видит ваши данные',
      'yusa.mode.server': 'Через сервер', 'yusa.mode.key': 'Свой ключ', 'yusa.mode.none': 'Не подключено',
      'yusa.status.idle': 'Готов', 'yusa.status.think': 'Думает…', 'yusa.status.happy': 'Ответил',
      'yusa.setupHint': 'Для работы Yusa нужен ключ AI на сервере (OpenAI) или ваш собственный API-ключ.',
      'yusa.setupBtn': 'Ввести ключ',
      'yusa.key.title': 'API-ключ', 'yusa.key.toggle': 'Настройки ключа',
      'yusa.key.note': 'Серверный прокси предпочтительнее — он не требует ключа. Свой ключ хранится только на этом устройстве и отправляется напрямую в Anthropic (не на сервер, не синхронизируется).',
      'yusa.key.ph': 'sk-ant-…', 'yusa.key.save': 'Сохранить', 'yusa.key.forget': 'Забыть ключ',
      'yusa.key.saved': 'Ключ сохранён', 'yusa.key.forgot': 'Ключ удалён', 'yusa.key.empty': 'Ключ не указан',
      'yusa.key.set': 'Ключ сохранён: {k}', 'yusa.key.none': 'Ключ не введён',
      'yusa.threads': 'Беседы', 'yusa.threads.empty': 'Бесед пока нет', 'yusa.thread.new': 'Новая беседа',
      'yusa.thread.untitled': 'Новая беседа', 'yusa.thread.deleted': 'Беседа удалена', 'yusa.thread.msgs': '{n} сообщ.',
      'yusa.welcome': 'Ассаламу алейкум! Я Yusa — ваш личный наставник. Я вижу ваши привычки, задачи и показатели здоровья за сегодня. С чего начнём?',
      'yusa.quick.day': 'Разбери мой сегодняшний день', 'yusa.quick.tomorrow': 'Предложи 3 задачи на завтра',
      'yusa.quick.week': 'Итоги недели', 'yusa.quick.motivation': 'Мотивация',
      'yusa.inputPh': 'Напишите Yusa… (Enter — отправить, Shift+Enter — новая строка)',
      'yusa.p.send': 'Отправить', 'yusa.p.you': 'Вы', 'yusa.p.typing': 'Yusa печатает…',
      'yusa.err.noTransport': 'Сервер не ответил, а API-ключ не введён', 'yusa.err.empty': 'Пришёл пустой ответ',
      'yusa.err.http': 'Ошибка: {m}', 'yusa.retry': 'Повторить', 'yusa.dismiss': 'Закрыть', 'yusa.key.badFormat': 'Ключ обычно начинается с sk-ant- — всё равно сохранён',
      'yusa.ctx.title': 'Что видит Yusa', 'yusa.ctx.habits': 'Привычки сегодня', 'yusa.ctx.week': '7 дней', 'yusa.ctx.tasks': 'Задачи',
      'yusa.ctx.sleep': 'Сон', 'yusa.ctx.rec': 'Восстановление', 'yusa.ctx.net': 'Итог месяца',
      'yusa.ctx.note': 'Yusa видит цифры разделов Сегодня, Здоровье, Еда, Финансы и Ибадат, а также последние 14 дней WHOOP.',
      'yusa.langName': 'русский',
    },
  });

  const VIEW = 'yusa';
  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const MAX_MSGS = 20;        // messages sent per request
  const QUICK = ['day', 'tomorrow', 'week', 'motivation'];

  /* transient (per page load) */
  let busy = false;
  let live = '';           // oqib kelayotgan javob — hali suhbatga yozilmagan
  let error = '';
  let errorFor = null;     // thread id the error belongs to (null = no thread yet)
  let draft = '';
  let happyUntil = 0;
  let happyTimer = null;
  let stickBottom = true;

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const yusa = () => { if (!D.S.yusa) D.S.yusa = { threads: [] }; if (!Array.isArray(D.S.yusa.threads)) D.S.yusa.threads = []; return D.S.yusa; };
  const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const threads = () => yusa().threads.slice().sort((a, b) => (+b.ts || 0) - (+a.ts || 0));
  const threadById = (id) => yusa().threads.find((x) => x.id === id) || null;
  const activeId = () => D.ui.sub[VIEW] || null;
  const active = () => { const id = activeId(); return id ? threadById(id) : null; };
  const titleOf = (th) => { const m = (th.messages || []).find((x) => x.role === 'user'); return m ? cut(m.content, 40) : t('yusa.thread.untitled'); };
  const keyMask = (k) => (k && k.length > 10 ? k.slice(0, 7) + '…' + k.slice(-4) : '••••');
  const hasKey = () => !!(D.device && D.device.yusaKey);
  const modeKey = () => (D.serverEnabled() ? 'server' : hasKey() ? 'key' : 'none');
  const safe = (fn, fb = '') => { try { return fn(); } catch (e) { console.error('yusa', e); D.logError(e); return fb; } };
  const fmtClock = (ts) => { if (!ts) return ''; const p = D.nowTz(new Date(ts)); return D.fmtTime(p.h, p.min); };

  /* ------------------------------------------------------------------ */
  /* markdown-lite (escape first, then marks)                            */
  /* ------------------------------------------------------------------ */
  function inline(s) {
    let h = esc(s);
    const codes = [];
    h = h.replace(/`([^`\n]+?)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    h = h.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    h = h.replace(/(^|\s)_([^_\n]+?)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
    h = h.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
    return h;
  }
  function md(text) {
    const lines = String(text || '').split(/\r?\n/);
    let out = '', list = null; // 'ul' | 'ol'
    const close = () => { if (list) { out += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      let m;
      if ((m = line.match(/^[-•*]\s+(.+)/))) { if (list !== 'ul') { close(); out += '<ul class="yu-ul">'; list = 'ul'; } out += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = line.match(/^\d{1,2}[.)]\s+(.+)/))) { if (list !== 'ol') { close(); out += '<ol class="yu-ol">'; list = 'ol'; } out += `<li>${inline(m[1])}</li>`; continue; }
      close();
      if (!line) continue;
      if ((m = line.match(/^#{1,4}\s+(.+)/))) { out += `<div class="yu-h">${inline(m[1])}</div>`; continue; }
      out += `<p>${inline(line)}</p>`;
    }
    close();
    return out || '<p class="muted">…</p>';
  }
  D.yusaMd = md; // exposed for reuse (e.g. insights)

  // Suhbat konteksti bitta joyda tug'iladi — js/ai.js dagi chatSystem(): u har bir
  // bo'lim kartasi ko'radigan raqamlarni va WHOOP'ning so'nggi 14 kunini beradi.
  const buildSystem = () => D.ai.chatSystem();

  /* ------------------------------------------------------------------ */
  /* transport                                                           */
  /* ------------------------------------------------------------------ */
  // Butun ilova uchun bitta transport (js/ai.js): avval server proksi, so'ng
  // qurilmadagi kalit. Bu yerda nusxasi bo'lmasin — ikkitasi ikki xil gapirardi.
  // Oqim bilan javob yozilishi bilan pufakka tushadi, butun javob kutilmaydi.
  const OPTS = { maxTokens: 2048, kind: 'chat' };
  const ask = (messages, system) => (D.ai.stream
    ? D.ai.stream(messages, system, OPTS, paint)
    : D.ai.ask(messages, system, OPTS));

  /* ------------------------------------------------------------------ */
  /* send                                                                */
  /* ------------------------------------------------------------------ */
  async function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    let th = active();
    if (!th) {
      th = { id: D.uid('yu'), ts: Date.now(), messages: [] };
      yusa().threads.push(th);
      D.ui.sub[VIEW] = th.id; D.saveUi();
    }
    th.messages.push({ role: 'user', content: text, ts: Date.now() });
    th.ts = Date.now();
    draft = '';
    error = ''; errorFor = null;
    D.save();
    await reply(th);
  }
  /* Har bo'lakda butun sahifani qayta chizish qimmat va fokusni yo'qotadi —
     matnni pufakning o'ziga yozamiz, sahifa esa faqat birinchi bo'lakda quriladi. */
  function paced(fn, ms) {
    let last = 0, timer = null, val = null;
    return (v) => {
      val = v;
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(val); return; }
      if (!timer) timer = setTimeout(() => { timer = null; last = Date.now(); fn(val); }, ms - (now - last));
    };
  }
  const paint = paced((sofar) => {
    if (!busy) return;   // so'rov tugagan bo'lsa kechikkan bo'lak hech narsani o'zgartirmaydi
    live = sofar;
    const el = document.getElementById('yuLive');
    if (!el) { if (D.current() === VIEW) rerenderKeepFocus(); return; }
    el.innerHTML = md(live);
    el.classList.add('is-live');
    // kutish nuqtalarining uslubi (.yu-typing → inline-flex) matnni bir qatorga tizib qo'yardi
    if (el.parentElement) el.parentElement.classList.remove('yu-typing');
    const feed = document.getElementById('yuFeed');
    if (feed && stickBottom) feed.scrollTop = feed.scrollHeight;
  }, 90);

  const inputFocused = () => { const a = document.activeElement; return !!(a && a.id === 'yuInput'); };
  const rerenderKeepFocus = () => {
    const had = inputFocused();
    D.rerender();
    if (had) { const el = document.getElementById('yuInput'); if (el) el.focus(); }
  };
  async function reply(th) {
    if (busy) return;
    busy = true; live = ''; error = ''; errorFor = null; stickBottom = true;
    rerenderKeepFocus();
    const messages = th.messages.slice(-MAX_MSGS).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }));
    // API requires the conversation to start with a user turn
    while (messages.length && messages[0].role !== 'user') messages.shift();
    try {
      const text = await ask(messages, buildSystem());
      live = '';
      th.messages.push({ role: 'assistant', content: text, ts: Date.now() });
      th.ts = Date.now();
      happyUntil = Date.now() + 2500;
      if (threadById(th.id)) D.save(); // thread may have been deleted meanwhile — nothing to persist then
    } catch (e) {
      error = (e && e.message) || String(e);
      errorFor = th.id;
    }
    busy = false;
    live = '';
    if (D.current() === VIEW) rerenderKeepFocus();
  }

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  function orb() {
    const st = busy ? 'think' : Date.now() < happyUntil ? 'happy' : 'idle';
    return `<div class="yu-orb ${st}" id="yuOrb" aria-hidden="true"><i></i><i></i></div>`;
  }
  function header() {
    const mode = modeKey();
    const st = busy ? 'think' : Date.now() < happyUntil ? 'happy' : 'idle';
    return `<div class="card yu-head">
      <div class="yu-head-row">
        ${orb()}
        <div class="yu-head-body">
          <div class="eyebrow">${esc(t('yusa.eyebrow'))}</div>
          <div class="yu-name">Yusa</div>
          <div class="yu-tag">${esc(t('yusa.tagline'))}</div>
        </div>
        <div class="yu-head-acts">
          <button class="btn icon" data-act="yuKeyToggle" aria-label="${esc(t('yusa.key.toggle'))}" title="${esc(t('yusa.key.toggle'))}">${D.ic('key', 18)}</button>
          <button class="btn icon" data-act="yuNew" aria-label="${esc(t('yusa.thread.new'))}" title="${esc(t('yusa.thread.new'))}">${D.ic('plus', 18)}</button>
        </div>
      </div>
      <div class="yu-status">
        <span class="pill ${mode === 'none' ? '' : 'good'}">${D.ic(mode === 'server' ? 'link' : mode === 'key' ? 'key' : 'alert', 12)} ${esc(t('yusa.mode.' + mode))}</span>
        <span class="pill yu-state ${st}" id="yuState">${esc(t('yusa.status.' + st))}</span>
      </div>
    </div>`;
  }
  function setupBanner() {
    if (modeKey() !== 'none') return '';
    return `<div class="banner yu-setup">${D.ic('info', 16)}<span class="grow">${esc(t('yusa.setupHint'))}</span><button class="btn sm ghost" data-act="yuKeyToggle" data-open="1">${esc(t('yusa.setupBtn'))}</button></div>`;
  }
  function keyPanel() {
    if (!D.ui.collapsed.yuKey) return '';
    const has = hasKey();
    return `<div class="card yu-keypanel">
      <div class="card-head"><div class="title">${D.ic('key', 16)} ${esc(t('yusa.key.title'))}</div>
        <span class="pill ${has ? 'good' : ''}">${esc(has ? t('yusa.key.set', { k: keyMask(D.device.yusaKey) }) : t('yusa.key.none'))}</span></div>
      <p class="help">${esc(t('yusa.key.note'))}</p>
      <div class="input-row">
        <input class="inp" type="password" id="yuKeyInp" placeholder="${esc(t('yusa.key.ph'))}" autocomplete="new-password" spellcheck="false" data-enter="yuKeySave">
        <button class="btn" data-act="yuKeySave">${esc(t('yusa.key.save'))}</button>
      </div>
      ${has ? `<div class="form-foot"><button class="btn sm danger" data-act="yuKeyForget">${D.ic('trash', 14)} ${esc(t('yusa.key.forget'))}</button></div>` : ''}
    </div>`;
  }
  // Kataklar suhbat ko'radigan AYNI manbadan (D.ai.snapshot) o'qiydi. Ilgari bu
  // yerda ikkinchi, qo'lda kiritishga tayangan hisob turardi — Sog'liq WHOOP'ga
  // o'tgach uyqu va kayfiyat kataklari doim «—» ko'rsatib qolgandi.
  function ctxStrip() {
    const c = D.ai.snapshot();
    const open = !!D.ui.collapsed.yuCtx;
    const w = c.whoop || {};
    const sleep = w.sleepH == null ? null : +w.sleepH;
    const rec = w.recovery == null ? null : +w.recovery;
    const net = (c.fin && c.fin.net) || 0;
    const tile = (v, label, cls = '') => `<div class="stat yu-stat"><div class="stat-num num ${cls}">${v}</div><div class="stat-label">${esc(label)}</div></div>`;
    return `<button type="button" class="section-title yu-toggle ${open ? 'open' : ''}" data-act="yuCtxToggle" aria-expanded="${open}">${esc(t('yusa.ctx.title'))}${D.ic('chevD', 14)}</button>
    ${open ? `<div class="stat-grid yu-ctx">
      ${tile(`${c.habitDone.length}<small>/${c.habitDue}</small>`, t('yusa.ctx.habits'), c.habitDue && c.habitDone.length === c.habitDue ? 'good' : '')}
      ${tile(c.week === null ? '—' : D.fmtPct(c.week), t('yusa.ctx.week'), c.week === null ? '' : c.week >= 70 ? 'good' : c.week >= 40 ? 'warn' : 'bad')}
      ${tile(D.fmtNum(c.tasks.length), t('yusa.ctx.tasks'))}
      ${tile(sleep === null ? '—' : `${sleep}<small>${esc(t('unit.h'))}</small>`, t('yusa.ctx.sleep'), sleep === null ? '' : sleep >= 7 ? 'good' : sleep >= 6 ? 'warn' : 'bad')}
      ${tile(rec === null ? '—' : `${rec}<small>%</small>`, t('yusa.ctx.rec'), rec === null ? '' : rec >= 67 ? 'good' : rec >= 34 ? 'warn' : 'bad')}
      ${tile(esc(D.fmtMoney(net)), t('yusa.ctx.net'), net > 0 ? 'good' : net < 0 ? 'bad' : '')}
    </div><p class="help yu-ctx-note">${esc(t('yusa.ctx.note'))}</p>` : ''}`;
  }
  function threadList() {
    const list = threads();
    const open = !!D.ui.collapsed.yuThreads;
    const cur = activeId();
    let body = '';
    if (open) {
      body = list.length
        ? `<div class="list">${list.map((th) => `<div class="li tap yu-th ${th.id === cur ? 'yu-on' : ''}" data-act="yuOpen" data-id="${esc(th.id)}">
            <div class="li-body"><div class="li-text ellipsis">${esc(titleOf(th))}</div>
            <div class="li-meta"><span>${esc(D.fmtDate(D.dayKey(new Date(+th.ts || Date.now()))))}</span><span class="num">${esc(t('yusa.thread.msgs', { n: (th.messages || []).length }))}</span></div></div>
            <button class="li-del" data-act="yuDel" data-id="${esc(th.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button></div>`).join('')}</div>`
        : `<div class="empty">${esc(t('yusa.threads.empty'))}</div>`;
      body += `<button class="dashed yu-newbtn" data-act="yuNew">${D.ic('plus', 14)} ${esc(t('yusa.thread.new'))}</button>`;
    }
    return `<button type="button" class="section-title yu-toggle ${open ? 'open' : ''}" data-act="yuThreadsToggle" aria-expanded="${open}">${esc(t('yusa.threads'))}<span class="right num">${list.length}</span>${D.ic('chevD', 14)}</button>${body}`;
  }
  function bubble(m) {
    const ai = m.role === 'assistant';
    return `<div class="yu-msg ${ai ? 'ai' : 'user'}">
      <div class="yu-role"><span>${ai ? 'YUSA' : esc(t('yusa.p.you'))}</span><span class="num">${esc(fmtClock(m.ts))}</span></div>
      <div class="yu-bubble">${ai ? md(m.content) : esc(m.content).replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  function chips() {
    return `<div class="yu-chips">${QUICK.map((q) => `<button class="pill yu-chip" data-act="yuQuick" data-q="${q}" ${busy ? 'disabled' : ''}>${D.ic('sparkles', 12)} ${esc(t('yusa.quick.' + q))}</button>`).join('')}</div>`;
  }
  function chat() {
    const th = active();
    const msgs = th ? th.messages || [] : [];
    const lastUser = msgs.length && msgs[msgs.length - 1].role === 'user' && !busy;
    let feed = '';
    if (!msgs.length) feed = `<div class="yu-msg ai"><div class="yu-role"><span>YUSA</span></div><div class="yu-bubble">${esc(t('yusa.welcome'))}</div></div>`;
    else feed = msgs.map(bubble).join('');
    if (busy) feed += `<div class="yu-msg ai ${live ? '' : 'yu-typing'}"><div class="yu-role"><span>YUSA</span></div><div class="yu-bubble ${live ? 'is-live' : ''}" id="yuLive">${live
      ? md(live)
      : `<span class="yu-dots"><i></i><i></i><i></i></span><span class="muted small">${esc(t('yusa.p.typing'))}</span>`}</div></div>`;
    const showErr = !!error && errorFor === (th ? th.id : null);
    const err = showErr ? `<div class="banner bad yu-err">${D.ic('alert', 16)}<span class="grow">${esc(t('yusa.err.http', { m: error }))}</span>
      ${lastUser ? `<button class="btn sm ghost" data-act="yuRetry">${D.ic('refresh', 14)} ${esc(t('yusa.retry'))}</button>` : ''}
      <button class="btn icon" data-act="yuDismiss" aria-label="${esc(t('yusa.dismiss'))}">${D.ic('x', 16)}</button></div>` : '';
    return `<div class="card yu-chat">
      <div class="yu-feed" id="yuFeed" aria-live="polite" aria-relevant="additions">${feed}</div>
      ${err}
      ${chips()}
      <div class="yu-composer">
        <textarea class="ta yu-input" id="yuInput" rows="1" placeholder="${esc(t('yusa.inputPh'))}" data-input="yuDraft" aria-label="${esc(t('yusa.p.send'))}">${esc(draft)}</textarea>
        <button class="btn sq yu-send" data-act="yuSend" aria-label="${esc(t('yusa.p.send'))}" title="${esc(t('yusa.p.send'))}" ${busy ? 'disabled' : ''}>${D.ic('chevR', 20)}</button>
      </div>
    </div>`;
  }
  function render() {
    return safe(header) + safe(setupBanner) + safe(keyPanel) + safe(chat) + safe(threadList) + safe(ctxStrip);
  }

  /* ------------------------------------------------------------------ */
  /* mount                                                               */
  /* ------------------------------------------------------------------ */
  function autoGrow(el) { if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(180, Math.max(44, el.scrollHeight)) + 'px'; }
  function scrollFeed() {
    const f = document.getElementById('yuFeed');
    if (f && stickBottom) f.scrollTop = f.scrollHeight;
  }
  function mount() {
    autoGrow(document.getElementById('yuInput'));
    scrollFeed();
    // core morph qiladi: #yuFeed qayta chizishdan keyin ham O'SHA element bo'lib
    // qoladi. Bayroqsiz har bir yangilanish unga yana bitta tinglovchi qo'shardi.
    const f = document.getElementById('yuFeed');
    if (f && !f.dataset.bound) {
      f.dataset.bound = '1';
      f.addEventListener('scroll', () => { stickBottom = f.scrollHeight - f.scrollTop - f.clientHeight < 40; }, { passive: true });
    }
    clearTimeout(happyTimer);
    if (Date.now() < happyUntil) {
      happyTimer = setTimeout(() => {
        const o = document.getElementById('yuOrb'), s = document.getElementById('yuState');
        if (o) { o.classList.remove('happy'); o.classList.add('idle'); }
        if (s) { s.classList.remove('happy'); s.classList.add('idle'); s.textContent = t('yusa.status.idle'); }
      }, Math.max(0, happyUntil - Date.now()));
    }
  }
  function unmount() { clearTimeout(happyTimer); }

  // Enter sends, Shift+Enter newline (core only handles input[data-enter])
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || ev.shiftKey || ev.isComposing) return;
    const el = ev.target;
    if (!el || !el.classList || !el.classList.contains('yu-input')) return;
    ev.preventDefault();
    D.act.yuSend();
  });

  /* ------------------------------------------------------------------ */
  /* actions                                                             */
  /* ------------------------------------------------------------------ */
  D.act.yuDraft = (el) => { draft = el.value; autoGrow(el); };
  D.act.yuSend = () => { const el = document.getElementById('yuInput'); if (el) draft = el.value; return send(draft); };
  D.act.yuQuick = (el) => send(t('yusa.quick.' + (el.dataset.q || 'day')));
  D.act.yuRetry = () => { const th = active(); if (!th || !th.messages.length || th.messages[th.messages.length - 1].role !== 'user') return; return reply(th); };
  D.act.yuDismiss = () => { error = ''; errorFor = null; D.rerender(); };
  D.act.yuNew = () => { D.ui.sub[VIEW] = null; error = ''; errorFor = null; stickBottom = true; D.saveUi(); D.rerender(); setTimeout(() => { const el = document.getElementById('yuInput'); if (el) el.focus(); }, 30); };
  D.act.yuOpen = (el) => { const id = el.dataset.id; if (!threadById(id)) return; D.ui.sub[VIEW] = id; error = ''; errorFor = null; stickBottom = true; D.saveUi(); D.rerender(); };
  D.act.yuDel = (el, ev) => {
    if (ev) ev.stopPropagation();
    const id = el.dataset.id;
    if (activeId() === id) { D.ui.sub[VIEW] = null; D.saveUi(); }
    D.remove(yusa().threads, id, { label: t('yusa.thread.deleted') });
  };
  D.act.yuThreadsToggle = () => { D.ui.collapsed.yuThreads = !D.ui.collapsed.yuThreads; D.saveUi(); D.rerender(); };
  D.act.yuCtxToggle = () => { D.ui.collapsed.yuCtx = !D.ui.collapsed.yuCtx; D.saveUi(); D.rerender(); };
  D.act.yuKeyToggle = (el) => {
    D.ui.collapsed.yuKey = el && el.dataset.open ? true : !D.ui.collapsed.yuKey;
    D.saveUi(); D.rerender();
    if (D.ui.collapsed.yuKey) setTimeout(() => { const i = document.getElementById('yuKeyInp'); if (i) i.focus(); }, 30);
  };
  D.act.yuKeySave = () => {
    const i = document.getElementById('yuKeyInp');
    const k = i ? i.value.trim() : '';
    if (!k) { D.toast(t('yusa.key.empty')); return; }
    D.device.yusaKey = k;
    D.saveDevice();
    D.ui.collapsed.yuKey = false; D.saveUi();
    error = ''; errorFor = null;
    D.toast(/^sk-ant-/.test(k) ? t('yusa.key.saved') : t('yusa.key.badFormat'), { ms: /^sk-ant-/.test(k) ? 1800 : 4000 });
    D.rerender();
  };
  D.act.yuKeyForget = () => {
    D.device.yusaKey = '';
    D.saveDevice();
    error = ''; errorFor = null;
    D.toast(t('yusa.key.forgot'));
    D.rerender();
  };

  D.view({ id: VIEW, icon: 'sparkles', order: 70, nav: true, primary: false, render, mount, unmount });
})();
