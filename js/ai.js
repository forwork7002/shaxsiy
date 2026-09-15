/* =====================================================================
   AI tahlil dvigateli — barcha bo'limlar uchun umumiy. UI bermaydi:
   tahlilni Yusa sahifasi (yusa.js) va suzuvchi orb (yusa-orb.js) chizadi.
   D.ai.systemFor(section) → bo'limning to'liq raqamlaridan tuzilgan system
   D.ai.advise(section) → modelga so'rov, javob kunlik keshlanadi (S.ai.cards)
   Transport: server /api/ai (kalit serverda) yoki BYOK (faqat shu qurilmada).
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc;
  const t = D.t;
  const MAX_SYS = 6000;
  const SECTIONS = ['today', 'health', 'sleep', 'strain', 'food', 'finance', 'prayer'];

  D.i18n.add({
    uz: {
      'ai.run': 'Tahlil qil', 'ai.again': 'Yangilash', 'ai.busy': 'Tahlil qilinmoqda…',
      'ai.fresh': 'bugun', 'ai.stale': '{n} kun oldin', 'ai.never': 'hali tahlil qilinmagan',
      'ai.hint.today': "Kuningizni ko'rib chiqadi va nimadan boshlashni aytadi.",
      'ai.hint.health': "Tiklanish, HRV, tinch puls, uyqu va tana ko'rsatkichlarini birga tahlil qiladi.",
      'ai.hint.finance': "Xarajat odatlaringizni va oy oxirigacha prognozni tahlil qiladi.",
      'ai.hint.prayer': "Namoz barqarorligi, qazo va ro'zani tahlil qiladi.",
      'ai.hint.sleep': 'Kechagi uyquni bosqichma-bosqich tahlil qiladi va bugun kechqurun uchun bitta o‘zgarish beradi.',
      'ai.hint.strain': 'Bugungi yukni tiklanish va me‘yorga qarab baholaydi — mashq qilish yoki dam olishni aytadi.',
      'ai.hint.food': 'Bugungi taomlarni me‘yor, WHOOP sarfi va tiklanishga solishtiradi — bitta aniq o‘zgarish beradi.',
      'ai.none': "AI ulanmagan — AI murabbiy bo'limida kalit kiriting yoki serverni yoqing.",
      'ai.setup': 'Ulash', 'ai.timeout': 'Javob kelmadi — tarmoqni tekshirib, qayta urinib ko\'ring.', 'ai.err': 'Xato: {m}', 'ai.retry': 'Qayta urinish',
      'ai.autoOff': 'Ma\'lumot yetarli emas — kamida bir necha kunlik yozuv kerak.',
      'ai.langName': "o'zbek (lotin)",
      
      'ai.copy': 'Nusxa olish', 'ai.copied': 'Nusxa olindi',
    },
    uzk: {
      'ai.run': 'Таҳлил қил', 'ai.again': 'Янгилаш', 'ai.busy': 'Таҳлил қилинмоқда…',
      'ai.fresh': 'бугун', 'ai.stale': '{n} кун олдин', 'ai.never': 'ҳали таҳлил қилинмаган',
      'ai.hint.today': 'Кунингизни кўриб чиқади ва нимадан бошлашни айтади.',
      'ai.hint.health': 'Тикланиш, HRV, тинч пульс, уйқу ва тана кўрсаткичларини бирга таҳлил қилади.',
      'ai.hint.finance': 'Харажат одатларингизни ва ой охиригача прогнозни таҳлил қилади.',
      'ai.hint.prayer': 'Намоз барқарорлиги, қазо ва рўзани таҳлил қилади.',
      'ai.hint.sleep': 'Кечаги уйқуни босқичма-босқич таҳлил қилади ва бугун кечқурун учун битта ўзгариш беради.',
      'ai.hint.strain': 'Бугунги юкни тикланиш ва меъёрга қараб баҳолайди — машқ қилиш ёки дам олишни айтади.',
      'ai.hint.food': 'Бугунги таомларни меъёр, WHOOP сарфи ва тикланишга солиштиради — битта аниқ ўзгариш беради.',
      'ai.none': 'AI уланмаган — AI мураббий бўлимида калит киритинг ёки серверни ёқинг.',
      'ai.setup': 'Улаш', 'ai.timeout': 'Жавоб келмади — тармоқни текшириб, қайта уриниб кўринг.', 'ai.err': 'Хато: {m}', 'ai.retry': 'Қайта уриниш',
      'ai.autoOff': 'Маълумот етарли эмас — камида бир неча кунлик ёзув керак.',
      'ai.langName': 'ўзбек (кирилл)',
      
      'ai.copy': 'Нусха олиш', 'ai.copied': 'Нусха олинди',
    },
    ru: {
      'ai.run': 'Проанализировать', 'ai.again': 'Обновить', 'ai.busy': 'Анализирую…',
      'ai.fresh': 'сегодня', 'ai.stale': '{n} дн. назад', 'ai.never': 'анализа ещё не было',
      'ai.hint.today': 'Разберёт ваш день и подскажет, с чего начать.',
      'ai.hint.health': 'Разбирает восстановление, HRV, пульс покоя, сон и показатели тела вместе.',
      'ai.hint.finance': 'Разберёт траты и даст прогноз до конца месяца.',
      'ai.hint.prayer': 'Проанализирует регулярность намаза, долг каза и пост.',
      'ai.hint.sleep': 'Разбирает прошедшую ночь по фазам и даёт одно изменение на сегодняшний вечер.',
      'ai.hint.strain': 'Оценивает сегодняшнюю нагрузку относительно восстановления и нормы — тренироваться или отдыхать.',
      'ai.hint.food': 'Сравнивает сегодняшнюю еду с нормой, расходом WHOOP и восстановлением — даёт одно конкретное изменение.',
      'ai.none': 'AI не подключён — введите ключ в разделе «AI-наставник» или включите сервер.',
      'ai.setup': 'Подключить', 'ai.timeout': 'Ответ не пришёл — проверьте сеть и попробуйте снова.', 'ai.err': 'Ошибка: {m}', 'ai.retry': 'Повторить',
      'ai.autoOff': 'Мало данных — нужно хотя бы несколько дней записей.',
      'ai.langName': 'русский',
      
      'ai.copy': 'Копировать', 'ai.copied': 'Скопировано',
    },
  });

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */
  function A() {
    if (!D.S.ai || typeof D.S.ai !== 'object') D.S.ai = { cards: {}, log: [] };
    if (!D.S.ai.cards || typeof D.S.ai.cards !== 'object') D.S.ai.cards = {};
    if (!Array.isArray(D.S.ai.log)) D.S.ai.log = [];
    return D.S.ai;
  }
  const busy = {};      // section -> true while a request is in flight
  const errors = {};    // section -> last error message

  /* ------------------------------------------------------------------ */
  /* markdown-lite (escape first, then marks)                            */
  /* ------------------------------------------------------------------ */
  function inline(s) {
    let h = esc(s);
    const codes = [];
    h = h.replace(/`([^`\n]+?)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    h = h.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    h = h.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
    return h;
  }
  function md(text) {
    const lines = String(text || '').split(/\r?\n/);
    let out = '', list = null;
    const close = () => { if (list) { out += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      let m;
      if ((m = line.match(/^[-•*]\s+(.+)/))) { if (list !== 'ul') { close(); out += '<ul class="ai-ul">'; list = 'ul'; } out += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = line.match(/^\d{1,2}[.)]\s+(.+)/))) { if (list !== 'ol') { close(); out += '<ol class="ai-ol">'; list = 'ol'; } out += `<li>${inline(m[1])}</li>`; continue; }
      close();
      if (!line) continue;
      if ((m = line.match(/^#{1,4}\s+(.+)/))) { out += `<div class="ai-h">${inline(m[1])}</div>`; continue; }
      out += `<p>${inline(line)}</p>`;
    }
    close();
    return out || `<p>${esc(text || '')}</p>`;
  }
  D.ai = D.ai || {};
  D.ai.md = md;

  /* ------------------------------------------------------------------ */
  /* transport                                                           */
  /* ------------------------------------------------------------------ */
  const hasKey = () => !!(D.device && D.device.yusaKey);

  /* So'rovni vaqt bilan cheklash. Busiz tarmoq o'rtada uzilganda fetch abadiy
     osilib qoladi: busy bayrog'i tushmaydi va bo'lim "Tahlil qilinmoqda…" da
     qotib qoladi — undan chiqishning yagona yo'li ilovani qayta yuklash edi.
     Model o'ylashi uzoq bo'lishi mumkin, shuning uchun chegara saxiy. */
  const TIMEOUT_MS = 90000;
  function deadline(ms) {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), ms || TIMEOUT_MS);
    return { signal: c.signal, clear: () => clearTimeout(timer) };
  }
  // D.fetchTimed abortni 'timeout' xatosiga aylantiradi — uni ham shu yerda taniymiz,
  // aks holda foydalanuvchi tushunarli gap o'rniga quruq "Xato: timeout" ni ko'radi.
  const isAbort = (e) => !!e && (e.name === 'AbortError' || /aborted|abort|^timeout$/i.test(String(e.message || '')));
  D.ai.mode = () => (D.serverEnabled() ? 'server' : hasKey() ? 'key' : 'none');
  D.ai.available = () => D.ai.mode() !== 'none';

  async function byok(messages, system, maxTokens) {
    const d = deadline();
    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: d.signal,
        headers: { 'x-api-key': D.device.yusaKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-opus-5', max_tokens: maxTokens || 1600, system, messages }),
      });
    } catch (e) {
      throw isAbort(e) ? new Error(t('ai.timeout')) : e;
    } finally { d.clear(); }
    let j = null;
    try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error((j && j.error && j.error.message) || 'HTTP ' + r.status);
    const text = ((j && j.content) || []).filter((c) => c && c.type === 'text').map((c) => c.text).join('\n').trim();
    if (!text) throw new Error('empty');
    return text;
  }
  // Shared transport: server proxy first (key never leaves the server), BYOK as the fallback.
  D.ai.ask = async (messages, system, opts = {}) => {
    if (D.serverEnabled()) {
      const d = deadline();
      try {
        // timeout MAJBURIY: D.api ning o'z chegarasi 20 soniya, model esa 30-60 soniya
        // o'ylaydi. Busiz har bir tahlil yarim yo'lda uzilardi (server javobni yozib
        // bo'lardi, brauzer esa allaqachon ketgan bo'lardi — nginx 499).
        const r = await D.api('/api/ai', { method: 'POST', signal: d.signal, timeout: TIMEOUT_MS, body: JSON.stringify({ messages, system, max_tokens: opts.maxTokens || 1600, kind: opts.kind || 'chat' }) }); // kind — server ai_calls hisobi uchun
        const text = r && typeof r.text === 'string' ? r.text.trim() : '';
        if (text) return text;
        throw new Error('empty');
      } catch (e) {
        if (isAbort(e)) { if (!hasKey()) throw new Error(t('ai.timeout')); }
        else {
          const m = String((e && e.message) || e);
          const recoverable = /ai_not_configured|501|404|Failed to fetch|NetworkError|offline/i.test(m);
          if (!(recoverable && hasKey())) throw e;
        }
      } finally { d.clear(); }
    }
    if (!hasKey()) throw new Error(t('ai.none'));
    return byok(messages, system, opts.maxTokens);
  };

  /* Oqim (streaming): javob yozilishi bilan bo'lak-bo'lak keladi. Butun javobni
     kutish 10-30 soniya edi — endi birinchi so'zlar 2-3 soniyada ekranda.
     onDelta(hozirgacha kelgan matn) har bo'lakda chaqiriladi. Server oqimni
     bermasa (eski nusxa yoki Anthropic provayder) — jimgina D.ai.ask ga qaytamiz. */
  let noStream = false;   // 501/404 bir marta kelsa, boshqa urinib o'tirmaymiz
  const IDLE_MS = 45000;  // bo'lak kelmay qolsa uzamiz; har bo'lak muddatni yangilaydi

  // Har bir token uchun qayta chizish shart emas — soniyada o'ntacha yetadi.
  function paced(fn, ms) {
    let last = 0, timer = null, val = null;
    return (v) => {
      val = v;
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(val); return; }
      if (!timer) timer = setTimeout(() => { timer = null; last = Date.now(); fn(val); }, ms - (now - last));
    };
  }

  D.ai.stream = async (messages, system, opts = {}, onDelta) => {
    const plain = () => D.ai.ask(messages, system, opts);
    if (noStream || !D.serverEnabled() || typeof TextDecoder !== 'function' || typeof AbortController !== 'function') return plain();
    const c = new AbortController();
    let timer = null;
    const bump = (ms) => { clearTimeout(timer); timer = setTimeout(() => c.abort(), ms); };
    bump(TIMEOUT_MS);
    let r;
    try {
      const h = { 'Content-Type': 'application/json' };
      if (D.tg && D.tg.initData) h['X-Telegram-Init-Data'] = D.tg.initData;
      r = await fetch('/api/ai/stream', {
        method: 'POST', credentials: 'same-origin', signal: c.signal, headers: h,
        body: JSON.stringify({ messages, system, max_tokens: opts.maxTokens || 1600, kind: opts.kind || 'chat' }),
      });
    } catch (e) {
      clearTimeout(timer);
      if (isAbort(e)) throw new Error(t('ai.timeout'));
      return plain();
    }
    if (!r.ok || !r.body) {
      clearTimeout(timer);
      if (r.status === 501 || r.status === 404 || r.status === 405) { noStream = true; return plain(); }
      let msg = 'HTTP ' + r.status;
      try { const j = await r.json(); if (j && j.error) msg = j.error; } catch (e) {}
      const err = new Error(msg); err.status = r.status; throw err;
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '', full = '', failed = '';
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        bump(IDLE_MS);
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop();
        for (const part of parts) {
          const line = part.split('\n').find((x) => x.indexOf('data:') === 0);
          if (!line) continue;
          let j = null;
          try { j = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
          if (j.error) { failed = j.error; continue; }
          if (typeof j.d === 'string' && j.d) { full += j.d; if (onDelta) onDelta(full); }
        }
      }
    } catch (e) {
      if (!full) { clearTimeout(timer); if (isAbort(e)) throw new Error(t('ai.timeout')); return plain(); }
      // yarim kelgan javob ham bo'shdan yaxshi — kelganini qaytaramiz
    } finally {
      clearTimeout(timer);
      try { reader.cancel(); } catch (e) {}
    }
    full = full.trim();
    if (full) return full;
    if (failed) throw new Error(failed);
    return plain();
  };

  /* Oqib kelayotgan tahlil — bo'lim kesimida. Karta hali saqlanmagan, lekin
     ekranda ko'rinishi kerak. */
  const partial = {};
  D.ai.partialOf = (section) => partial[section] || '';

  /* ------------------------------------------------------------------ */
  /* snapshot — everything the model may need, computed once per render  */
  /* ------------------------------------------------------------------ */
  let snapCache = null;
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const money = (n) => D.fmtMoney(n, { force: true });

  D.ai.snapshot = () => {
    const today = D.today();
    if (snapCache && snapCache._k === today + '|' + D.S.meta.updatedAt + '|' + D.lang()) return snapCache;
    const S = D.S;
    const p = D.nowTz();
    const c = { _k: today + '|' + S.meta.updatedAt + '|' + D.lang(), today, clock: D.fmtTime(p.h, p.min), hijri: D.hijri ? D.hijri.fmt(today) : '' };

    /* habits + spheres */
    const due = D.dueHabits(today);
    c.habitDone = []; c.habitLeft = [];
    for (const h of due) (D.habitDone(h, today) ? c.habitDone : c.habitLeft).push(h.name);
    c.habitDue = due.length;
    const sph = {};
    let wDue = 0, wDone = 0;
    for (const k of D.lastDays(7, today)) for (const h of D.dueHabits(k)) {
      wDue++; const ok = D.habitDone(h, k);
      if (ok) wDone++;
      const s = (sph[h.sphere] = sph[h.sphere] || { d: 0, n: 0 });
      s.n++; if (ok) s.d++;
    }
    c.week = wDue ? Math.round((wDone / wDue) * 100) : null;
    c.spheres = Object.entries(sph).map(([k, v]) => ({ id: k, name: t('sphere.' + k), pct: v.n ? Math.round((v.d / v.n) * 100) : 0 }));
    c.streaks = D.activeHabits().map((h) => ({ n: h.name, s: D.habitStreak(h) })).filter((x) => x.s >= 3).sort((a, b) => b.s - a.s).slice(0, 6);

    /* tasks + goals */
    c.tasks = S.tasks.filter((x) => !x.done).sort((a, b) => ((a.date || '9') > (b.date || '9') ? 1 : (a.date || '9') < (b.date || '9') ? -1 : (b.priority || 0) - (a.priority || 0)));
    c.overdue = c.tasks.filter((x) => x.date && x.date < today).length;
    c.goals = S.goals.filter((g) => !g.done).sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 6);

    /* health */
    const sl = [], mo = [], wt = [], wa = [];
    for (const k of D.lastDays(14, today)) {
      const r = S.health[k]; if (!r) continue;
      if (num(r.sleep) !== null) sl.push(+r.sleep);
      if (num(r.mood) !== null) mo.push(+r.mood);
      if (num(r.weight) !== null) wt.push({ k, w: +r.weight });
      if (num(r.water) !== null) wa.push(+r.water);
    }
    c.sleep14 = sl.length ? D.round(D.avg(sl), 1) : null;
    c.sleepDebt = sl.length ? D.round(sl.reduce((a, x) => a + Math.max(0, 7.5 - x), 0), 1) : null;
    c.mood14 = mo.length ? D.round(D.avg(mo), 1) : null;
    c.water14 = wa.length ? D.round(D.avg(wa), 1) : null;
    c.waterToday = (S.health[today] && +S.health[today].water) || 0;
    c.weight = wt.length ? wt[wt.length - 1] : null;
    c.weightDelta = wt.length > 1 ? D.round(wt[wt.length - 1].w - wt[0].w, 1) : null;
    c.note = (S.notes[today] || '').slice(0, 400);
    c.moodTags = (S.health[today] && S.health[today].tags) || [];
    /* ovqat (food.js) */
    c.food = null;
    if (D.food && D.food.targets) {
      try {
        const tg = D.food.targets(), tot = D.food.dayTotals(today);
        const ms = ((S.food && S.food.logs && S.food.logs[today]) || []).slice().sort((a, b) => (+a.ts || 0) - (+b.ts || 0)).map((m) => {
          const d = m.ts ? D.nowTz(new Date(+m.ts)) : null;
          return { name: cut(m.name, 50), grams: Math.round(+m.grams || 0), kcal: Math.round(+m.kcal || 0), p: Math.round(+m.p || 0), c: Math.round(+m.c || 0), f: Math.round(+m.f || 0), time: d && D.dayKey(new Date(+m.ts)) === today ? D.fmtTime(d.h, d.min) : '' };
        });
        const wk = [];
        for (const k of D.lastDays(7, today)) { const x = D.food.dayTotals(k); if (x) wk.push(x); }
        c.food = {
          targets: { kcal: tg.kcal, p: tg.p, c: tg.c, f: tg.f, auto: !!tg.auto }, goal: S.profile.goal || 'keep',
          meals: ms, totals: tot, burned: D.food.burned ? D.food.burned(today) : null,
          avg7: wk.length ? { days: wk.length, kcal: Math.round(D.avg(wk.map((x) => x.kcal))), p: Math.round(D.avg(wk.map((x) => x.p))) } : null,
        };
      } catch (e) { c.food = null; }
    }

    /* whoop */
    const W = S.whoop || {};
    c.whoop = W.connected ? Object.assign({ connected: true, lastSync: W.lastSync }, W.cache || {}) : { connected: false };
    if (W.connected && D.whoop) {
      try {
        const live = D.whoop.live(); const fr = D.whoop.freshness();
        c.whoop.live = live ? { strain: live.strain, kcal: live.kcal, hrAvg: live.hrAvg, hrMax: live.hrMax } : null;
        c.whoop.freshMin = fr ? fr.min : null;
        c.whoop.workouts = D.whoop.workoutsOn(today).map((x) => ({ sport: x.sport, mins: x.mins, strain: x.strain, hrAvg: x.hrAvg, kcal: x.kcal, zones: D.whoop.zoneMins(x) }));
        const ins = D.whoop.dayInsight(today); if (ins) { c.whoop.strainTarget = ins.strainTarget; c.whoop.sleepNeedH = ins.needH; c.whoop.metPct = ins.metPct; }
        const dbt = D.whoop.sleepDebt(7); c.whoop.debt7 = dbt ? dbt.h : null;
      } catch (e) { /* the summary above still stands */ }
    }
    if (W.days) {
      const ds = Object.keys(W.days).sort().slice(-14);
      const pick = (f) => ds.map((k) => num(W.days[k] && W.days[k][f])).filter((x) => x !== null);
      const rec = pick('recovery'), hrv = pick('hrv'), rhr = pick('rhr'), st = pick('strain'), sh = pick('sleepH');
      c.whoopTrend = {
        days: ds.length,
        recovery: rec.length ? D.round(D.avg(rec), 0) : null,
        hrv: hrv.length ? D.round(D.avg(hrv), 0) : null,
        rhr: rhr.length ? D.round(D.avg(rhr), 0) : null,
        strain: st.length ? D.round(D.avg(st), 1) : null,
        sleepH: sh.length ? D.round(D.avg(sh), 1) : null,
      };
    }

    /* finance */
    const mk = D.monthKey(today), pk = D.monthKey(D.addDays(today.slice(0, 8) + '01', -1));
    const byCat = {}, byCatPrev = {};
    let inc = 0, out = 0, incP = 0, outP = 0;
    for (const x of S.finance.tx) {
      const a = +x.amount || 0;
      if (x.date && x.date.startsWith(mk)) {
        if (x.type === 'in') inc += a; else { out += a; byCat[x.cat] = (byCat[x.cat] || 0) + a; }
      } else if (x.date && x.date.startsWith(pk)) {
        if (x.type === 'in') incP += a; else { outP += a; byCatPrev[x.cat] = (byCatPrev[x.cat] || 0) + a; }
      }
    }
    const catName = (id) => { const k = S.finance.cats.find((x) => x.id === id); return k ? k.name : id; };
    const dim = D.daysInMonth(mk), dayN = +today.slice(8) || 1, left = Math.max(0, dim - dayN);
    c.fin = {
      month: mk, inc, out, net: inc - out, prevOut: outP, prevInc: incP,
      rate: inc > 0 ? Math.round(((inc - out) / inc) * 100) : null,
      perDay: dayN ? Math.round(out / dayN) : 0,
      forecast: dayN ? Math.round((out / dayN) * dim) : 0,
      daysLeft: left,
      top: Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => ({ n: catName(id), v, prev: byCatPrev[id] || 0 })),
      accounts: D.sum(S.finance.accounts, (a) => +a.balance || 0),
      subs: D.sum(S.finance.subs, (s) => (s.period === 'yearly' ? (+s.amount || 0) / 12 : s.period === 'weekly' ? (+s.amount || 0) * 4.33 : +s.amount || 0)),
      limit: (() => { const B = (S.finance.budgets || {})[mk]; if (!B) return 0; return B._total != null ? +B._total || 0 : D.sum(Object.keys(B), (k) => +B[k] || 0); })(),
      cur: S.settings.currency,
    };

    /* prayer / ibodat */
    const pr = S.prayers || {};
    let jam = 0, alone = 0, qaza = 0, missed = 0, logged = 0;
    const per = {};
    for (const k of D.lastDays(30, today)) {
      const d = pr[k]; if (!d) continue;
      for (const id of D.PRAYERS) {
        const v = d[id]; if (!v) continue;
        logged++;
        const s = (per[id] = per[id] || { j: 0, a: 0, q: 0, m: 0 });
        if (v === 'jamaat') { jam++; s.j++; } else if (v === 'alone') { alone++; s.a++; } else if (v === 'qaza') { qaza++; s.q++; } else if (v === 'missed') { missed++; s.m++; }
      }
    }
    // the real ledger lives in ibodat.js — read it rather than re-deriving a worse number
    let qz = null;
    try { if (D.qaza) qz = { o: D.qaza.owed(), today: D.qaza.paidToday(), target: D.qaza.target(), pace: D.qaza.pace(), streak: D.qaza.streak() }; } catch (e) { qz = null; }
    c.qaza = qz ? {
      debt: qz.o.total, per: qz.o.per, paidAll: qz.o.paid, everOwed: qz.o.all,
      today: qz.today, target: qz.target, p7: qz.pace.p7, p30: qz.pace.p30,
      rate: D.round(qz.pace.rate, 1), streak: qz.streak,
      etaDays: qz.o.total && qz.pace.rate > 0 ? Math.ceil(qz.o.total / qz.pace.rate) : null,
    } : null;
    c.prayer = {
      logged, jamaat: jam, alone, qaza, missed,
      jamaatPct: logged ? Math.round((jam / logged) * 100) : null,
      onTimePct: logged ? Math.round(((jam + alone) / logged) * 100) : null,
      debt: c.qaza ? c.qaza.debt : missed,
      per: D.PRAYERS.map((id) => ({ n: t('prayer.' + id), ...(per[id] || { j: 0, a: 0, q: 0, m: 0 }) })),
      today: D.PRAYERS.map((id) => ({ n: t('prayer.' + id), v: (pr[today] || {})[id] || null })),
    };
    const fa = S.fasting || {};
    c.fasting = { month: D.lastDays(30, today).filter((k) => fa[k] && fa[k].done).length, ramadan: D.hijri ? D.hijri.isRamadan(today) : false, suggest: D.hijri ? D.hijri.sunnahFast(today) : null };
    const nx = D.prayer ? D.prayer.next() : null;
    c.next = nx ? { n: t('prayer.' + nx.id), time: nx.time, left: D.fmtMins(nx.minsLeft) } : null;
    c.gratitude = (S.gratitude || []).filter((g) => g.date === today).length;

    snapCache = c;
    return c;
  };

  /* ------------------------------------------------------------------ */
  /* section prompts                                                     */
  /* ------------------------------------------------------------------ */
  const PERSONA = () => `Sen — foydalanuvchining shaxsiy murabbiysi. U o'zbek, musulmon, o'z hayotini kunlik kuzatib boradi.
Javob tili: ${t('ai.langName')}. Uslub: iliq, hurmatli, LEKIN aniq va to'g'ridan-to'g'ri. Umumiy nasihat berma.
Qoidalar:
- Faqat berilgan raqamlarga tayan. Ma'lumot yo'q bo'lsa "ma'lumot yetarli emas" deb ayt, o'ylab topma.
- 5-9 qator. Muhim raqamlarni **qalin** qil. Ro'yxat uchun "- " ishlat.
- Oxirgi qator doim: "**Bugun qil:**" — bitta aniq, kichik, bajarish mumkin bo'lgan amal.
- Sog'liq bo'yicha tibbiy tashxis qo'yma; shifokorga murojaat kerak bo'lsa shuni ayt.`;

  function sectionLines(section) {
    const c = D.ai.snapshot();
    const today = c.today;
    const L = [];
    const S = D.S;
    if (S.profile.name) L.push(`Ism: ${cut(S.profile.name, 30)}`);
    const pr = S.profile || {}, prof = [];
    if (num(pr.age) !== null) prof.push(`${pr.age} yosh`);
    if (pr.sex) prof.push(pr.sex === 'f' ? 'ayol' : 'erkak');
    if (num(pr.heightCm) !== null) prof.push(`bo'y ${pr.heightCm} sm`);
    if (num(pr.weightKg) !== null) prof.push(`vazn ${pr.weightKg} kg`);
    if (num(pr.activity) !== null) prof.push(`faollik ${pr.activity}/5`);
    if (prof.length) L.push(`Profil: ${prof.join(', ')}`);
    L.push(`Hozir: ${c.today} (${D.fmtDate(c.today, 'weekday')}), soat ${c.clock}${c.hijri ? `, hijriy ${c.hijri}` : ''}`);
    if (c.next) L.push(`Keyingi namoz: ${c.next.n} ${c.next.time} (${c.next.left} qoldi)`);

    if (section === 'today') {
      L.push(`ODATLAR bugun: ${c.habitDone.length}/${c.habitDue} bajarildi.`);
      if (c.habitLeft.length) L.push(`Qolgan odatlar: ${cut(c.habitLeft.join(', '), 400)}`);
      if (c.week !== null) L.push(`7 kunlik odat bajarilishi: ${c.week}%`);
      if (c.spheres.length) L.push(`Sohalar (7 kun): ${c.spheres.map((s) => `${s.name} ${s.pct}%`).join(', ')}`);
      if (c.streaks.length) L.push(`Uzun seriyalar: ${c.streaks.map((s) => `${s.n} ${s.s} kun`).join('; ')}`);
      L.push(`VAZIFALAR: ${c.tasks.length} ta ochiq${c.overdue ? `, shundan ${c.overdue} tasi kechikkan` : ''}.`);
      if (c.tasks.length) L.push(c.tasks.slice(0, 8).map((x) => `- ${cut(x.text, 70)}${x.date ? ` [${x.date}]` : ''}${x.priority === 3 ? ' (muhim)' : ''}`).join('\n'));
      L.push(`NAMOZ bugun: ${c.prayer.today.map((p) => `${p.n}=${p.v || '—'}`).join(', ')}`);
      if (c.whoop.connected && c.whoop.recovery != null) L.push(`WHOOP: tiklanish ${c.whoop.recovery}%, uyqu ${c.whoop.sleepH ?? '—'} soat, zo'riqish ${c.whoop.strain ?? '—'}`);
      const hb = [];
      if (c.sleep14 !== null) hb.push(`uyqu o'rt. ${c.sleep14} soat`);
      if (c.mood14 !== null) hb.push(`kayfiyat ${c.mood14}/4`);
      hb.push(`suv ${c.waterToday} stakan`);
      L.push(`SOG'LIQ: ${hb.join(', ')}`);
      if (c.food && c.food.totals) L.push(`OVQAT bugun: ${c.food.totals.kcal} kkal, oqsil ${c.food.totals.p} g${c.food.targets.kcal ? ` (me'yor ${c.food.targets.kcal} kkal / ${c.food.targets.p} g)` : ''}`);
      if (c.goals.length) L.push(`MAQSADLAR: ${c.goals.map((g) => cut(g.text, 60)).join('; ')}`);
      if (c.note) L.push(`Bugungi yozuv: "${c.note}"`);
      L.push(`\nVazifa: kunning shu soatini hisobga olib, nimaga e'tibor berishni ayt. Qolgan odatlar va kechikkan vazifalardan eng muhimini tanla.`);
    }

    if (section === 'health') {
      const w = c.whoop;
      if (w.connected) {
        L.push(`WHOOP bugun: tiklanish ${w.recovery ?? '—'}%, HRV ${w.hrv ?? '—'} ms, tinch puls ${w.rhr ?? '—'} bpm, uyqu ${w.sleepH ?? '—'} soat (samara ${w.sleepPerf ?? '—'}%), zo'riqish ${w.strain ?? '—'}`);
        if (w.spo2 != null || w.skin != null || w.resp != null) L.push(`WHOOP bio: SpO2 ${w.spo2 ?? '—'}%, teri harorati ${w.skin ?? '—'}°C, nafas ${w.resp ?? '—'}/daq`);
        if (w.live) L.push(`WHOOP JONLI (${w.freshMin ?? '?'} daq oldin): zo'riqish ${w.live.strain}${w.strainTarget ? ` (bugungi me'yor ${w.strainTarget})` : ''}, ${w.live.kcal ?? '—'} kkal, puls o'rt. ${w.live.hrAvg ?? '—'} / maks ${w.live.hrMax ?? '—'}`);
        if (w.cycles != null || w.disturbances != null) L.push(`Uyqu tafsiloti: ${w.cycles ?? '—'} sikl, ${w.disturbances ?? '—'} uyg'onish, yotoqda ${w.inBedH ?? '—'} soat, kerak edi ${w.sleepNeedH ?? '—'} soat${w.metPct != null ? ` (${w.metPct}% qoplandi)` : ''}, 7 kunlik uyqu qarzi ${w.debt7 ?? '—'} soat`);
        if (w.workouts && w.workouts.length) L.push(`Bugungi mashg'ulotlar: ` + w.workouts.map((x) => `${x.sport || 'mashq'} ${x.mins ?? '?'} daq, zo'riqish ${x.strain ?? '—'}, puls ${x.hrAvg ?? '—'}${x.zones ? `, zonalar(daq) ${x.zones.join('/')}` : ''}`).join('; '));
        if (c.whoopTrend) L.push(`WHOOP ${c.whoopTrend.days} kunlik o'rtacha: tiklanish ${c.whoopTrend.recovery ?? '—'}%, HRV ${c.whoopTrend.hrv ?? '—'}, RHR ${c.whoopTrend.rhr ?? '—'}, uyqu ${c.whoopTrend.sleepH ?? '—'} soat, zo'riqish ${c.whoopTrend.strain ?? '—'}`);
      } else L.push('WHOOP ulanmagan.');
      L.push(`UYQU 14 kun: o'rtacha ${c.sleep14 ?? '—'} soat, to'plangan qarz ${c.sleepDebt ?? '—'} soat (me'yor 7.5).`);
      // TANA — o'lchamlar WHOOP profilidan, vazn tarixi eski yozuvlardan
      const wb = (S.whoop && S.whoop.body) || {};
      const kgNow = num(wb.weightKg) ?? (c.weight ? c.weight.w : null);
      const cmNow = num(pr.heightCm) ?? num(wb.heightCm);
      if (kgNow !== null) L.push(`TANA: vazn ${kgNow} kg${cmNow ? `, bo'y ${cmNow} sm, BMI ${D.round(kgNow / Math.pow(cmNow / 100, 2), 1)}` : ''}${wb.maxHr ? `, maksimal puls ${wb.maxHr} bpm` : ''}${c.weightDelta !== null && c.weightDelta !== undefined ? `. Vazn 14 kunda ${c.weightDelta > 0 ? '+' : ''}${c.weightDelta} kg` : ''}`);
      // YOSH — WHOOP ilovasidan ko'chirilgan raqam va bizning oshkora taxminimiz
      const chrono = D.profileAge();
      if (chrono !== null) L.push(`YOSH: xronologik ${chrono}${num(pr.whoopAge) !== null ? `, WHOOP Age (ilovadan qo'lda kiritilgan) ${pr.whoopAge}${num(pr.paceOfAging) !== null ? `, Pace of Aging ${pr.paceOfAging}` : ''}` : ''}.`);
      let ba = null;
      try { ba = D.whoop && D.whoop.bioAge ? D.whoop.bioAge() : null; } catch (e) { ba = null; }
      if (ba && num(ba.est) !== null) {
        L.push(`BIOLOGIK YOSH (bizning taxmin, 30 kunlik WHOOP o'rtachalaridan): ${ba.est} (xronologik ${ba.chrono}, farq ${ba.delta > 0 ? '+' : ''}${ba.delta}). Omillar: ` + (ba.inputs || []).map((i) => `${i.k} ${i.v ?? '—'} → ${i.effect > 0 ? '+' : ''}${D.round(+i.effect || 0, 1)} yil`).join('; '));
      }
      L.push(`ODATLAR 7 kun: ${c.week ?? '—'}%${c.spheres.length ? `; Tana sohasi: ${(c.spheres.find((s) => s.id === 'tana') || {}).pct ?? '—'}%` : ''}`);
      L.push(`\nVazifa: bu ko'rsatkichlar orasidagi bog'liqlikni top (uyqu ↔ tiklanish ↔ HRV ↔ yuk ↔ vazn). Eng zaif bitta joyni raqam bilan ko'rsat va uni tuzatish uchun aniq amal ber. Biologik yosh taxmini bo'lsa, uni bir jumlada tushuntir va taxmin ekanini ayt.`);
    }

    const W = S.whoop || {}, WD = W.days || {};
    const wv = (k, f) => (WD[k] ? num(WD[k][f]) : null);
    const fmtMin = (ms) => (ms == null ? '—' : Math.round(ms / 60000) + ' daq');

    if (section === 'sleep') {
      const k = today, d = WD[k] || WD[D.addDays(today, -1)] || null;
      if (!W.connected || !d || d.sleepH == null) L.push('WHOOP uyqu yozuvi yo\'q.');
      else {
        const bed = d.bedTs ? D.nowTz(new Date(d.bedTs)) : null, wake = d.wakeTs ? D.nowTz(new Date(d.wakeTs)) : null;
        L.push(`KECHAGI UYQU: ${d.sleepH} soat uxlandi, kerak edi ${d.sleepNeedH ?? '—'} soat${d.sleepNeedH ? ` (${Math.round((d.sleepH / d.sleepNeedH) * 100)}% qoplandi)` : ''}. Yotoqda ${d.inBedH ?? '—'} soat, uyg'oq ${d.awakeH != null ? D.round(d.awakeH * 60) + ' daq' : '—'}.${bed && wake ? ` Yotish ${D.fmtTime(bed.h, bed.min)}, turish ${D.fmtTime(wake.h, wake.min)}.` : ''}`);
        if (d.stages) L.push(`Bosqichlar: chuqur ${fmtMin(d.stages.deep)}, REM ${fmtMin(d.stages.rem)}, yengil ${fmtMin(d.stages.light)}, uyg'oq ${fmtMin(d.stages.awake)}. Sikllar ${d.cycles ?? '—'}, uyg'onishlar ${d.disturbances ?? '—'}.`);
        L.push(`Sifat ${d.sleepPerf ?? '—'}%, samaradorlik ${d.sleepEff ?? '—'}%, izchillik ${d.sleepCons ?? '—'}%. Nafas ${d.resp ?? '—'}/daq.${d.needBaseH ? ` Ehtiyoj: asos ${d.needBaseH} soat + qarz ${d.debtH ?? 0} soat.` : ''}`);
        L.push(`Ertalabki tiklanish ${d.recovery ?? '—'}%, HRV ${d.hrv ?? '—'} ms, tinch puls ${d.rhr ?? '—'}.`);
        const naps = D.whoop && D.whoop.naps ? D.whoop.naps(k) : null; if (naps) L.push(`Kunduzgi uyqu: ${naps.n} marta, ${naps.h} soat.`);
        const debt = D.whoop && D.whoop.sleepDebt ? D.whoop.sleepDebt(7) : null; if (debt) L.push(`7 kunlik uyqu qarzi: ${debt.h} soat.`);
        const rows = D.lastDays(14, today).map((kk) => { const x = WD[kk]; return x && x.sleepH != null ? `${kk.slice(5)} ${x.sleepH}/${x.sleepNeedH ?? '—'}h sifat ${x.sleepPerf ?? '—'}% izch ${x.sleepCons ?? '—'}%${x.bedTs ? ' yotish ' + D.fmtTime(D.nowTz(new Date(x.bedTs)).h, D.nowTz(new Date(x.bedTs)).min) : ''}` : null; }).filter(Boolean);
        if (rows.length) L.push(`14 kecha: ` + rows.join('; '));
      }
      L.push(`\nVazifa: kechagi uyquni cheklagan asosiy sababni aniqla (yotish vaqti, uyg'onishlar, kech mashg'ulot, qarz). Bugun kechqurun uchun BITTA aniq o'zgarish ber (masalan yotish vaqti soat bilan).`);
    }

    if (section === 'strain') {
      const d = WD[today] || {}, live = D.whoop && D.whoop.live ? D.whoop.live() : null;
      const ins = D.whoop && D.whoop.dayInsight ? D.whoop.dayInsight(today) : null;
      if (!W.connected) L.push('WHOOP ulanmagan.');
      else {
        L.push(`BUGUN: zo'riqish ${live ? live.strain + ' (jonli)' : d.strain ?? '—'}${ins && ins.strainTarget ? `, tiklanishga ko'ra me'yor ${ins.strainTarget}` : ''}. Tiklanish ${d.recovery ?? '—'}%, HRV ${d.hrv ?? '—'} ms, tinch puls ${d.rhr ?? '—'}, uyqu ${d.sleepH ?? '—'}/${d.sleepNeedH ?? '—'} soat.`);
        L.push(`Sarf: ${(live && live.kcal) ?? d.kcal ?? '—'} kkal${ins && ins.tdee ? `, taxminiy kunlik me'yor ${ins.tdee}` : ''}. Puls o'rt. ${(live && live.hrAvg) ?? d.hrAvg ?? '—'}, maks ${(live && live.hrMax) ?? d.hrMax ?? '—'}${(W.body || {}).maxHr ? ` (maks. puls ${W.body.maxHr})` : ''}.`);
        const wos = D.whoop && D.whoop.workoutsOn ? D.whoop.workoutsOn(today) : [];
        if (wos.length) L.push(`Bugungi mashg'ulotlar: ` + wos.map((x) => `${x.sport || 'mashq'} ${x.mins ?? '?'} daq, zo'riqish ${x.strain ?? '—'}, puls ${x.hrAvg ?? '—'}/${x.hrMax ?? '—'}${x.kcal ? `, ${x.kcal} kkal` : ''}${D.whoop.zoneMins(x) ? `, zonalar(daq) 0-5: ${D.whoop.zoneMins(x).join('/')}` : ''}`).join('; '));
        const rows = D.lastDays(14, today).map((kk) => { const x = WD[kk]; return x && (x.strain != null || x.recovery != null) ? `${kk.slice(5)} zo'r ${x.strain ?? '—'} tikl ${x.recovery ?? '—'}%` : null; }).filter(Boolean);
        if (rows.length) L.push(`14 kun (zo'riqish ↔ ertasi tiklanish): ` + rows.join('; '));
      }
      L.push(`\nVazifa: bugun mashq qilish kerakmi yoki dam — tiklanish va me'yorga qarab qat'iy ayt. Agar mashq bo'lsa: qanday turi, qancha davom, qaysi puls zonasi. Oxirgi kunlarda ortiqcha yuk yoki kam yuk bo'lgan bo'lsa, ko'rsat.`);
    }

    if (section === 'food') {
      const fd = c.food;
      const goalName = { lose: 'vazn kamaytirish', keep: 'vaznni saqlash', gain: 'vazn yig\'ish' };
      if (!fd) L.push(`Ovqat jurnali yo'q.`);
      else {
        if (fd.targets.kcal) L.push(`ME'YOR (${fd.targets.auto ? 'profildan: Mifflin-St Jeor × faollik ± maqsad' : "qo'lda kiritilgan"}): ${fd.targets.kcal} kkal, oqsil ${fd.targets.p} g, uglevod ${fd.targets.c} g, yog' ${fd.targets.f} g. Maqsad: ${goalName[fd.goal] || fd.goal}.`);
        else L.push(`Me'yor yo'q — profilda vazn kiritilmagan.`);
        L.push(fd.meals.length ? `BUGUN YEYILGAN (${fd.meals.length} ta): ` + fd.meals.map((m) => `${m.time ? m.time + ' ' : ''}${m.name}${m.grams ? ` ${m.grams} g` : ''}: ${m.kcal} kkal (oqsil ${m.p} / uglevod ${m.c} / yog' ${m.f} g)`).join('; ') : `Bugun hali taom yozilmagan.`);
        if (fd.totals) L.push(`JAMI bugun: ${fd.totals.kcal} kkal, oqsil ${fd.totals.p} g, uglevod ${fd.totals.c} g, yog' ${fd.totals.f} g${fd.targets.kcal ? ` — me'yorning ${Math.round((fd.totals.kcal / fd.targets.kcal) * 100)}%, oqsil ${fd.targets.p ? Math.round((fd.totals.p / fd.targets.p) * 100) + '%' : '—'}` : ''}.`);
        if (fd.burned !== null) { const bal = (fd.totals ? fd.totals.kcal : 0) - fd.burned; L.push(`WHOOP sarfi bugun: ${fd.burned} kkal → balans ${bal > 0 ? '+' : ''}${bal} kkal (yeyilgan − sarflangan).`); }
        if (fd.avg7) L.push(`7 kun o'rtacha: ${fd.avg7.kcal} kkal, oqsil ${fd.avg7.p} g (${fd.avg7.days} kun yozilgan).`);
      }
      const w = c.whoop;
      if (w.connected) L.push(`WHOOP bugun: tiklanish ${w.recovery ?? '—'}%, uyqu ${w.sleepH ?? '—'} soat, zo'riqish ${(w.live && w.live.strain) ?? w.strain ?? '—'}${w.strainTarget ? ` (me'yor ${w.strainTarget})` : ''}${w.workouts && w.workouts.length ? `; mashg'ulotlar: ${w.workouts.map((x) => `${x.sport || 'mashq'} ${x.mins ?? '?'} daq${x.kcal ? `, ${x.kcal} kkal` : ''}`).join(', ')}` : ''}`);
      if (c.weight) L.push(`Vazn: ${c.weight.w} kg${c.weightDelta !== null ? ` (14 kunda ${c.weightDelta > 0 ? '+' : ''}${c.weightDelta} kg)` : ''}`);
      L.push(`\nVazifa: bugungi ovqatlanishni mashg'ulot va tiklanishga nisbatan bahola — kaloriya balansi, oqsil yetarliligi, taomlar vaqti. Vaqtga qarab qolgan kun uchun BITTA aniq o'zgarish ayt (nima, qancha gramm yoki kkal).`);
    }

    if (section === 'finance') {
      const f = c.fin;
      L.push(`OY: ${f.month}, ${f.daysLeft} kun qoldi.`);
      L.push(`Kirim ${money(f.inc)}, chiqim ${money(f.out)}, sof ${money(f.net)}${f.rate !== null ? `, jamg'arma darajasi ${f.rate}%` : ''}`);
      L.push(`Kunlik o'rtacha chiqim ${money(f.perDay)}; shu tezlikda oy oxirida ${money(f.forecast)} bo'ladi.`);
      if (f.prevOut) L.push(`O'tgan oy chiqim ${money(f.prevOut)}, kirim ${money(f.prevInc)}.`);
      if (f.top.length) L.push(`Kategoriyalar (shu oy → o'tgan oy):\n` + f.top.map((x) => `- ${x.n}: ${money(x.v)}${x.prev ? ` → o'tgan oy ${money(x.prev)}` : ''}`).join('\n'));
      if (f.limit > 0) L.push(`Oylik me'yor ${money(f.limit)}, sarflandi ${money(f.out)} (${Math.round((f.out / f.limit) * 100)}%), qolgan ${f.daysLeft} kunga ${money(Math.max(0, f.limit - f.out))} qoldi — kuniga ${money(Math.round(Math.max(0, f.limit - f.out) / Math.max(1, f.daysLeft)))}.`);
      if (f.accounts) L.push(`Hisoblardagi qoldiq: ${money(f.accounts)}`);
      if (f.subs) L.push(`Obunalar oyiga: ${money(f.subs)}`);
      L.push(`\nVazifa: pul asosan qayerga ketayotganini bitta jumlada ayt, oylik me'yordan chiqish xavfini bahola va shu oyda tejash uchun bitta aniq qadam ber (qaysi kategoriya, qancha).`);
    }

    if (section === 'prayer') {
      const p = c.prayer;
      L.push(`NAMOZ 30 kun: ${p.logged} ta qayd; jamoat ${p.jamaat}, yakka ${p.alone}, qazo ${p.qaza}, o'tkazilgan ${p.missed}.`);
      if (p.jamaatPct !== null) L.push(`Jamoat ulushi ${p.jamaatPct}%, o'z vaqtida ${p.onTimePct}%.`);
      const q = c.qaza;
      if (q) {
        L.push(`QAZO DAFTARI: jami qarz ${q.debt} ta (${D.PRAYERS.map((id) => `${t('prayer.' + id)} ${q.per[id]}`).join(', ')}).`);
        L.push(`Shu paytgacha o'qilgan qazo: ${q.paidAll} / ${q.everOwed}. Bugun ${q.today}/${q.target}. So'nggi 7 kun ${q.p7}, 30 kun ${q.p30} (kuniga ${q.rate}). Ketma-ket kunlar: ${q.streak}.`);
        if (q.etaDays) L.push(`Shu sur'atda qarz ~${q.etaDays} kunda tugaydi.`);
        else if (q.debt) L.push(`Hozircha qazo o'qish sur'ati yo'q.`);
      } else L.push(`Qazo qarzi: ${p.debt} ta.`);
      L.push(`Namozlar kesimida (30 kun): ` + p.per.map((x) => `${x.n} — jamoat ${x.j}, yakka ${x.a}, qazo ${x.q}, o'tkazilgan ${x.m}`).join('; '));
      L.push(`Bugun: ${p.today.map((x) => `${x.n}=${x.v || '—'}`).join(', ')}`);
      L.push(`RO'ZA: 30 kunda ${c.fasting.month} kun${c.fasting.ramadan ? '. Hozir Ramazon oyi.' : ''}${c.fasting.suggest ? `. Bugun tavsiya: ${c.fasting.suggest}` : ''}`);
      const ruh = (c.spheres.find((s) => s.id === 'ruh') || {}).pct;
      if (ruh != null) L.push(`Ruh sohasi odatlari (7 kun): ${ruh}%`);
      L.push(`Shukr yozuvlari bugun: ${c.gratitude}`);
      L.push(`\nVazifa: qaysi namoz eng ko'p qoldirilayotganini top va uning sababi bo'lishi mumkin bo'lgan vaqtni ayt. Qazo qarzini kamaytirish uchun aniq kunlik reja ber — nechta va qaysi vaqtlarda o'qish qulayligini ayt.`);
    }

    return L;
  }
  function lines(section) {
    let s = PERSONA() + '\n\n' + sectionLines(section).join('\n');
    if (s.length > MAX_SYS) s = s.slice(0, MAX_SYS - 1) + '…';
    return s;
  }
  D.ai.systemFor = lines;

  /* ------------------------------------------------------------------ */
  /* the chat's system prompt — everything at once                       */
  /* The user used to paste screenshots into a chat by hand. Here the    */
  /* model gets every section's numbers plus a 14-day WHOOP table, so it  */
  /* can analyse instead of guess.                                        */
  /* ------------------------------------------------------------------ */
  const CHAT_PERSONA = () => `Sen — foydalanuvchining shaxsiy murabbiysi va tahlilchisi. U o'zbek, musulmon, hayotini kunlik kuzatib boradi va WHOOP soati taqadi.
Javob tili: ${t('ai.langName')}. Uslub: iliq, hurmatli, LEKIN aniq va to'g'ridan-to'g'ri. Umumiy nasihat berma — quyidagi raqamlarga tayan.
Qoidalar:
- Faqat berilgan ma'lumotga tayan. Yo'q narsani o'ylab topma; yetishmasa "ma'lumot yetarli emas" deb ayt.
- Muhim raqamlarni **qalin** qil. Ro'yxat uchun "- " ishlat. Qisqa va aniq yoz.
- Tibbiy tashxis qo'yma; shifokorga murojaat kerak bo'lsa shuni ayt.`;
  function whoopTable(n) {
    if (!D.whoop || !D.S.whoop || !D.S.whoop.connected) return '';
    const rows = [];
    for (const k of D.lastDays(n || 14)) {
      const d = D.S.whoop.days[k]; if (!d) continue;
      rows.push(`${k.slice(5)} | ${d.recovery ?? '—'} | ${d.hrv ?? '—'} | ${d.rhr ?? '—'} | ${d.sleepH ?? '—'}/${d.sleepNeedH ?? '—'} | ${d.sleepPerf ?? '—'} | ${d.strain ?? '—'} | ${d.kcal ?? '—'}`);
    }
    if (!rows.length) return '';
    const wo = D.whoop.workoutDays ? D.S.whoop.workouts.filter((x) => x.k && x.k >= D.addDays(D.today(), -13)).map((x) => `${x.k.slice(5)} ${x.sport || 'mashq'} ${x.mins ?? '?'} daq, zo'riqish ${x.strain ?? '—'}${x.hrAvg ? `, puls ${x.hrAvg}` : ''}`) : [];
    return `WHOOP so'nggi ${rows.length} kun (sana | tiklanish % | HRV ms | tinch puls | uyqu/kerak soat | uyqu sifati % | zo'riqish | kkal):\n` + rows.join('\n')
      + (wo.length ? `\nMashg'ulotlar (14 kun): ` + wo.join('; ') : '');
  }
  D.ai.chatSystem = () => {
    const seen = new Set(), L = [];
    for (const sec of SECTIONS) {
      for (const ln of sectionLines(sec)) {
        if (!ln || /^\n?Vazifa:/.test(ln) || seen.has(ln)) continue;
        seen.add(ln); L.push(ln);
      }
    }
    const tbl = whoopTable(14);
    let s = CHAT_PERSONA() + '\n\n' + L.join('\n') + (tbl ? '\n\n' + tbl : '');
    if (s.length > 14000) s = s.slice(0, 13999) + '…';
    return s;
  };

  const QUESTION = {
    sleep: 'Kechagi uyqumni tahlil qil va bugun kechqurun nima qilishimni ayt.',
    strain: 'Bugun mashq qilaymi yoki dam olaymi? Yukimni baholab ayt.',
    food: 'Bugungi ovqatlanishimni tahlil qil — me\'yor, sarf va tiklanishga qarab nima o\'zgartiray?',
    today: 'Bugungi kunimni tahlil qil va nimadan boshlashim kerakligini ayt.',
    health: "Sog'lig'imni tahlil qil — tiklanish, HRV, tinch puls, uyqu, tana va biologik yosh bo'yicha.",
    finance: 'Moliyaviy holatimni tahlil qil va shu oy uchun maslahat ber.',
    prayer: 'Ibodatlarimni tahlil qil — namoz, qazo va ro\'za bo\'yicha.',
  };

  /* ------------------------------------------------------------------ */
  /* run                                                                 */
  /* ------------------------------------------------------------------ */
  D.ai.enoughData = (section) => {
    const S = D.S;
    if (section === 'finance') return S.finance.tx.length >= 3;
    if (section === 'prayer') {
      if (Object.keys(S.prayers || {}).some((k) => k[0] !== '_')) return true;
      try { return !!(D.qaza && (D.qaza.owed().total || D.qaza.owed().paid)); } catch (e) { return false; }
    }
    if (section === 'health') return Object.keys(S.health).length >= 1 || (S.whoop && S.whoop.connected);
    if (section === 'sleep' || section === 'strain') return !!(S.whoop && S.whoop.connected && D.whoop && D.whoop.has());
    if (section === 'food') { if (!D.food) return false; try { return !!(D.food.dayTotals(D.today()) || D.food.targets().kcal); } catch (e) { return false; } }
    return S.habits.length > 0 || S.tasks.length > 0;
  };

  D.ai.question = (section) => QUESTION[section] || QUESTION.today;
  D.ai.isBusy = (section) => !!busy[section];
  D.ai.errorOf = (section) => errors[section] || '';

  D.ai.advise = async (section) => {
    if (!SECTIONS.includes(section) || busy[section]) return;
    if (!D.ai.available()) { D.toast(t('ai.none'), { ms: 4000 }); return; }
    busy[section] = true;
    partial[section] = '';   // eski oqimning qoldig'i yangi tahlil o'rniga ko'rinib qolmasin
    errors[section] = '';
    D.emit('ai:changed', section);
    D.rerender();
    try {
      const show = paced((sofar) => { if (!busy[section]) return; partial[section] = sofar; D.emit('ai:stream', section); }, 90);
      const text = await D.ai.stream([{ role: 'user', content: QUESTION[section] || QUESTION.today }], lines(section),
        { maxTokens: 1400, kind: 'card:' + section }, show);
      const a = A();
      a.cards[section] = { day: D.today(), text, ts: Date.now() };
      // S.ai.log ga yozish to'xtatildi: Tarix qayta yozilganda uni o'qishni tashladi,
      // 40 ta to'liq tahlil esa har bir saqlashda serverga behuda ketardi. Eski
      // yozuvlar o'chirilmadi — Tarix qaytsa, shu yerga bitta qator yetadi.
      D.save();
    } catch (e) {
      errors[section] = String((e && e.message) || e).slice(0, 140);
      D.logError(e);
    } finally {
      busy[section] = false;
      partial[section] = '';
      D.emit('ai:changed', section);
      D.rerender();
    }
  };
  D.ai.clearError = (section) => { errors[section] = ''; D.emit('ai:changed', section); };

  D.ai.isFresh = (section) => { const c = A().cards[section]; return !!(c && c.day === D.today()); };

  /* invalidate the memoised snapshot whenever state changes */
  D.on('state:changed', () => { snapCache = null; });
  D.on('day:changed', () => { snapCache = null; });
})();
