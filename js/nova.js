/* =====================================================================
   nova.js — Nova AI mentor.
   orb avatar · compact context from state · chat threads · markdown-lite ·
   transport: server proxy (/api/ai) → BYOK fallback (device-only key)
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'nova.eyebrow': 'AI murabbiy',
      'nova.tagline': "Do'stona, qisqa, aniq — sizning ma'lumotlaringizni ko'radi",
      'nova.mode.server': 'Server orqali', 'nova.mode.key': "O'z kalitingiz", 'nova.mode.none': 'Ulanmagan',
      'nova.status.idle': 'Tayyor', 'nova.status.think': "O'ylamoqda…", 'nova.status.happy': 'Javob berdi',
      'nova.setupHint': "Nova ishlashi uchun server proksi (Telegram ichida) yoki o'z Anthropic API kalitingiz kerak.",
      'nova.setupBtn': 'Kalit kiritish',
      'nova.key.title': 'API kalit', 'nova.key.toggle': 'Kalit sozlamalari',
      'nova.key.note': "Server proksi afzal — u kalitni sizdan so'ramaydi. O'z kalitingiz faqat shu qurilmada saqlanadi va to'g'ridan-to'g'ri Anthropic'ga yuboriladi (serverga emas, sinxronlanmaydi).",
      'nova.key.ph': 'sk-ant-…', 'nova.key.save': 'Saqlash', 'nova.key.forget': 'Kalitni unutish',
      'nova.key.saved': 'Kalit saqlandi', 'nova.key.forgot': "Kalit o'chirildi", 'nova.key.empty': "Kalit bo'sh",
      'nova.key.set': 'Kalit saqlangan: {k}', 'nova.key.none': 'Kalit kiritilmagan',
      'nova.threads': 'Suhbatlar', 'nova.threads.empty': "Hali suhbat yo'q", 'nova.thread.new': 'Yangi suhbat',
      'nova.thread.untitled': 'Yangi suhbat', 'nova.thread.deleted': "Suhbat o'chirildi", 'nova.thread.msgs': '{n} xabar',
      'nova.welcome': "Assalomu alaykum! Men Nova — shaxsiy murabbiyingiz. Bugungi odatlar, vazifalar va sog'liq ko'rsatkichlaringizni ko'rib turibman. Nimadan boshlaymiz?",
      'nova.quick.day': 'Bugungi kunimni tahlil qil', 'nova.quick.tomorrow': 'Ertaga uchun 3 ta vazifa taklif qil',
      'nova.quick.week': 'Haftalik xulosa', 'nova.quick.motivation': 'Motivatsiya',
      'nova.inputPh': "Nova'ga yozing… (Enter — yuborish, Shift+Enter — yangi qator)",
      'nova.send': 'Yuborish', 'nova.you': 'Siz', 'nova.typing': 'Nova yozmoqda…',
      'nova.err.noTransport': "Server javob bermadi va API kalit kiritilmagan", 'nova.err.empty': "Bo'sh javob keldi",
      'nova.err.http': 'Xato: {m}', 'nova.retry': 'Qayta urinish', 'nova.dismiss': 'Yopish', 'nova.key.badFormat': "Kalit odatda sk-ant- bilan boshlanadi — baribir saqlandi",
      'nova.ctx.title': "Nova nimani ko'radi", 'nova.ctx.habits': 'Odatlar bugun', 'nova.ctx.week': '7 kun', 'nova.ctx.tasks': 'Vazifalar',
      'nova.ctx.sleep': 'Uyqu 7k', 'nova.ctx.mood': 'Kayfiyat', 'nova.ctx.net': 'Oylik sof', 'nova.ctx.note': "Faqat shu qisqa xulosa yuboriladi — butun ma'lumot emas.",
      'nova.search.ask': "Nova'dan so'rash", 'nova.search.thread': 'Suhbat',
      'nova.langName': "o'zbek (lotin)",
    },
    uzk: {
      'nova.eyebrow': 'AI мураббий',
      'nova.tagline': 'Дўстона, қисқа, аниқ — сизнинг маълумотларингизни кўради',
      'nova.mode.server': 'Сервер орқали', 'nova.mode.key': 'Ўз калитингиз', 'nova.mode.none': 'Уланмаган',
      'nova.status.idle': 'Тайёр', 'nova.status.think': 'Ўйламоқда…', 'nova.status.happy': 'Жавоб берди',
      'nova.setupHint': 'Nova ишлаши учун сервер прокси (Telegram ичида) ёки ўз Anthropic API калитингиз керак.',
      'nova.setupBtn': 'Калит киритиш',
      'nova.key.title': 'API калит', 'nova.key.toggle': 'Калит созламалари',
      'nova.key.note': 'Сервер прокси афзал — у калитни сиздан сўрамайди. Ўз калитингиз фақат шу қурилмада сақланади ва тўғридан-тўғри Anthropic’га юборилади (серверга эмас, синхронланмайди).',
      'nova.key.ph': 'sk-ant-…', 'nova.key.save': 'Сақлаш', 'nova.key.forget': 'Калитни унутиш',
      'nova.key.saved': 'Калит сақланди', 'nova.key.forgot': 'Калит ўчирилди', 'nova.key.empty': 'Калит бўш',
      'nova.key.set': 'Калит сақланган: {k}', 'nova.key.none': 'Калит киритилмаган',
      'nova.threads': 'Суҳбатлар', 'nova.threads.empty': 'Ҳали суҳбат йўқ', 'nova.thread.new': 'Янги суҳбат',
      'nova.thread.untitled': 'Янги суҳбат', 'nova.thread.deleted': 'Суҳбат ўчирилди', 'nova.thread.msgs': '{n} хабар',
      'nova.welcome': 'Ассалому алайкум! Мен Nova — шахсий мураббийингиз. Бугунги одатлар, вазифалар ва соғлиқ кўрсаткичларингизни кўриб турибман. Нимадан бошлаймиз?',
      'nova.quick.day': 'Бугунги кунимни таҳлил қил', 'nova.quick.tomorrow': 'Эртага учун 3 та вазифа таклиф қил',
      'nova.quick.week': 'Ҳафталик хулоса', 'nova.quick.motivation': 'Мотивация',
      'nova.inputPh': 'Nova’га ёзинг… (Enter — юбориш, Shift+Enter — янги қатор)',
      'nova.send': 'Юбориш', 'nova.you': 'Сиз', 'nova.typing': 'Nova ёзмоқда…',
      'nova.err.noTransport': 'Сервер жавоб бермади ва API калит киритилмаган', 'nova.err.empty': 'Бўш жавоб келди',
      'nova.err.http': 'Хато: {m}', 'nova.retry': 'Қайта уриниш', 'nova.dismiss': 'Ёпиш', 'nova.key.badFormat': 'Калит одатда sk-ant- билан бошланади — барибир сақланди',
      'nova.ctx.title': 'Nova нимани кўради', 'nova.ctx.habits': 'Одатлар бугун', 'nova.ctx.week': '7 кун', 'nova.ctx.tasks': 'Вазифалар',
      'nova.ctx.sleep': 'Уйқу 7к', 'nova.ctx.mood': 'Кайфият', 'nova.ctx.net': 'Ойлик соф', 'nova.ctx.note': 'Фақат шу қисқа хулоса юборилади — бутун маълумот эмас.',
      'nova.search.ask': 'Nova’дан сўраш', 'nova.search.thread': 'Суҳбат',
      'nova.langName': 'ўзбек (кирилл)',
    },
    ru: {
      'nova.eyebrow': 'AI-наставник',
      'nova.tagline': 'Дружелюбный, краткий, точный — видит ваши данные',
      'nova.mode.server': 'Через сервер', 'nova.mode.key': 'Свой ключ', 'nova.mode.none': 'Не подключено',
      'nova.status.idle': 'Готов', 'nova.status.think': 'Думает…', 'nova.status.happy': 'Ответил',
      'nova.setupHint': 'Для работы Nova нужен серверный прокси (внутри Telegram) или ваш собственный ключ Anthropic API.',
      'nova.setupBtn': 'Ввести ключ',
      'nova.key.title': 'API-ключ', 'nova.key.toggle': 'Настройки ключа',
      'nova.key.note': 'Серверный прокси предпочтительнее — он не требует ключа. Свой ключ хранится только на этом устройстве и отправляется напрямую в Anthropic (не на сервер, не синхронизируется).',
      'nova.key.ph': 'sk-ant-…', 'nova.key.save': 'Сохранить', 'nova.key.forget': 'Забыть ключ',
      'nova.key.saved': 'Ключ сохранён', 'nova.key.forgot': 'Ключ удалён', 'nova.key.empty': 'Ключ не указан',
      'nova.key.set': 'Ключ сохранён: {k}', 'nova.key.none': 'Ключ не введён',
      'nova.threads': 'Беседы', 'nova.threads.empty': 'Бесед пока нет', 'nova.thread.new': 'Новая беседа',
      'nova.thread.untitled': 'Новая беседа', 'nova.thread.deleted': 'Беседа удалена', 'nova.thread.msgs': '{n} сообщ.',
      'nova.welcome': 'Ассаламу алейкум! Я Nova — ваш личный наставник. Я вижу ваши привычки, задачи и показатели здоровья за сегодня. С чего начнём?',
      'nova.quick.day': 'Разбери мой сегодняшний день', 'nova.quick.tomorrow': 'Предложи 3 задачи на завтра',
      'nova.quick.week': 'Итоги недели', 'nova.quick.motivation': 'Мотивация',
      'nova.inputPh': 'Напишите Nova… (Enter — отправить, Shift+Enter — новая строка)',
      'nova.send': 'Отправить', 'nova.you': 'Вы', 'nova.typing': 'Nova печатает…',
      'nova.err.noTransport': 'Сервер не ответил, а API-ключ не введён', 'nova.err.empty': 'Пришёл пустой ответ',
      'nova.err.http': 'Ошибка: {m}', 'nova.retry': 'Повторить', 'nova.dismiss': 'Закрыть', 'nova.key.badFormat': 'Ключ обычно начинается с sk-ant- — всё равно сохранён',
      'nova.ctx.title': 'Что видит Nova', 'nova.ctx.habits': 'Привычки сегодня', 'nova.ctx.week': '7 дней', 'nova.ctx.tasks': 'Задачи',
      'nova.ctx.sleep': 'Сон 7д', 'nova.ctx.mood': 'Настроение', 'nova.ctx.net': 'Итог месяца', 'nova.ctx.note': 'Отправляется только эта короткая сводка — не все данные.',
      'nova.search.ask': 'Спросить Nova', 'nova.search.thread': 'Беседа',
      'nova.langName': 'русский',
    },
  });

  const VIEW = 'nova';
  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const MAX_MSGS = 20;        // messages sent per request
  const MAX_SYS = 11000;      // system prompt cap (chars) — the chat sees every section plus 14 days of WHOOP
  const QUICK = ['day', 'tomorrow', 'week', 'motivation'];

  /* transient (per page load) */
  let busy = false;
  let error = '';
  let errorFor = null;     // thread id the error belongs to (null = no thread yet)
  let draft = '';
  let happyUntil = 0;
  let happyTimer = null;
  let stickBottom = true;

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const nova = () => { if (!D.S.nova) D.S.nova = { threads: [] }; if (!Array.isArray(D.S.nova.threads)) D.S.nova.threads = []; return D.S.nova; };
  const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const threads = () => nova().threads.slice().sort((a, b) => (+b.ts || 0) - (+a.ts || 0));
  const threadById = (id) => nova().threads.find((x) => x.id === id) || null;
  const activeId = () => D.ui.sub[VIEW] || null;
  const active = () => { const id = activeId(); return id ? threadById(id) : null; };
  const titleOf = (th) => { const m = (th.messages || []).find((x) => x.role === 'user'); return m ? cut(m.content, 40) : t('nova.thread.untitled'); };
  const keyMask = (k) => (k && k.length > 10 ? k.slice(0, 7) + '…' + k.slice(-4) : '••••');
  const hasKey = () => !!(D.device && D.device.novaKey);
  const modeKey = () => (D.serverEnabled() ? 'server' : hasKey() ? 'key' : 'none');
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const safe = (fn, fb = '') => { try { return fn(); } catch (e) { console.error('nova', e); D.logError(e); return fb; } };
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
      if ((m = line.match(/^[-•*]\s+(.+)/))) { if (list !== 'ul') { close(); out += '<ul class="nv-ul">'; list = 'ul'; } out += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = line.match(/^\d{1,2}[.)]\s+(.+)/))) { if (list !== 'ol') { close(); out += '<ol class="nv-ol">'; list = 'ol'; } out += `<li>${inline(m[1])}</li>`; continue; }
      close();
      if (!line) continue;
      if ((m = line.match(/^#{1,4}\s+(.+)/))) { out += `<div class="nv-h">${inline(m[1])}</div>`; continue; }
      out += `<p>${inline(line)}</p>`;
    }
    close();
    return out || '<p class="muted">…</p>';
  }
  D.novaMd = md; // exposed for reuse (e.g. insights)

  /* ------------------------------------------------------------------ */
  /* context snapshot (cheap: 7 days × habits, pending tasks, month tx)  */
  /* ------------------------------------------------------------------ */
  let ctxCache = null;
  D.on('state:changed', () => { ctxCache = null; });
  D.on('day:changed', () => { ctxCache = null; });
  function snapshot() {
    const today = D.today();
    if (ctxCache && ctxCache.today === today && ctxCache.lang === D.lang()) return ctxCache;
    const S = D.S;
    const due = D.dueHabits(today);
    const doneH = [], leftH = [];
    for (const h of due) (D.habitDone(h, today) ? doneH : leftH).push(h.name);
    let wDue = 0, wDone = 0;
    for (const k of D.lastDays(7, today)) {
      for (const h of D.dueHabits(k)) { wDue++; if (D.habitDone(h, k)) wDone++; }
    }
    const weekPct = wDue ? Math.round((wDone / wDue) * 100) : null;
    const pending = S.tasks.filter((x) => !x.done).sort((a, b) => ((a.date || '9') > (b.date || '9') ? 1 : (a.date || '9') < (b.date || '9') ? -1 : (b.priority || 0) - (a.priority || 0)));
    const sl = [], md7 = [];
    for (const k of D.lastDays(7, today)) { const r = S.health[k]; if (r) { if (num(r.sleep) !== null) sl.push(+r.sleep); if (num(r.mood) !== null) md7.push(+r.mood); } }
    let lastW = null;
    for (const k of Object.keys(S.health).sort().reverse()) { const w = num(S.health[k] && S.health[k].weight); if (w) { lastW = { k, w }; break; } }
    const water = (S.health[today] && +S.health[today].water) || 0;
    const mk = D.monthKey(today);
    let inc = 0, out = 0;
    for (const x of S.finance.tx) if (x.date && x.date.startsWith(mk)) { if (x.type === 'in') inc += +x.amount || 0; else out += +x.amount || 0; }
    const goals = S.goals.filter((g) => !g.done).sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 5);
    ctxCache = {
      today, lang: D.lang(), due: due.length, doneH, leftH, weekPct, pending, pendingN: pending.length,
      sleepAvg: sl.length ? D.round(D.avg(sl), 1) : null, moodAvg: md7.length ? D.round(D.avg(md7), 1) : null,
      lastW, water, inc, out, net: inc - out, goals,
    };
    return ctxCache;
  }

  function buildSystem() {
    // the shared coach context knows everything the section cards know, and the watch's last two weeks
    if (D.ai && D.ai.chatSystem) { try { return D.ai.chatSystem(); } catch (e) { console.warn('chatSystem', e); } }
    const c = snapshot();
    const S = D.S;
    const L = [];
    L.push(`Sen Nova — do'stona, qisqa, aniq shaxsiy murabbiy. Foydalanuvchining shaxsiy dashboard ma'lumotlarini ko'rasan. Javob tili: ${t('nova.langName')}. Qisqa javob ber (3-8 qator), kerak bo'lsa "- " bilan ro'yxat, muhim so'z va raqamlarni **qalin** qil. Oxirida bitta "Bugun qil:" amalini ayt. Aniq raqamlarga tayan, umumiy gaplardan qoch.`);
    if (S.profile.name) L.push(`Ism: ${cut(S.profile.name, 30)}`);
    const hj = D.hijri ? D.hijri.fmt(c.today) : '';
    L.push(`Sana: ${c.today} (${D.fmtDate(c.today, 'weekday')})${hj ? `, hijriy: ${hj}` : ''}`);
    const nx = D.prayer ? D.prayer.next() : null;
    if (nx) L.push(`Keyingi namoz: ${t('prayer.' + nx.id)} ${nx.time} (${D.fmtMins(nx.minsLeft)})`);
    L.push(`Bugun odatlar: ${c.doneH.length}/${c.due} bajarildi.` + (c.doneH.length ? ` Bajarilgan: ${cut(c.doneH.join(', '), 300)}.` : '') + (c.leftH.length ? ` Qolgan: ${cut(c.leftH.join(', '), 300)}.` : ''));
    if (c.weekPct !== null) L.push(`7 kunlik odat bajarilishi: ${c.weekPct}%`);
    if (c.pending.length) L.push(`Kutilayotgan vazifalar (${c.pendingN}):\n` + c.pending.slice(0, 8).map((x) => `- ${cut(x.text, 70)}${x.date ? ` [${x.date}]` : ''}${x.priority === 3 ? ' !' : ''}`).join('\n'));
    const hl = [];
    if (c.sleepAvg !== null) hl.push(`uyqu o'rt. 7k: ${c.sleepAvg} soat`);
    if (c.moodAvg !== null) hl.push(`kayfiyat o'rt. 7k: ${c.moodAvg}/4`);
    if (c.lastW) hl.push(`vazn: ${D.round(c.lastW.w, 1)} kg (${c.lastW.k})`);
    hl.push(`suv bugun: ${c.water} stakan`);
    L.push(`Sog'liq: ${hl.join('; ')}`);
    if (c.inc || c.out) L.push(`Oy moliya: kirim ${D.fmtMoney(c.inc, { force: true })}, chiqim ${D.fmtMoney(c.out, { force: true })}, sof ${D.fmtMoney(c.net, { force: true })}`);
    if (c.goals.length) L.push(`Maqsadlar: ` + c.goals.map((g) => cut(g.text, 60)).join('; '));
    let s = L.join('\n');
    if (s.length > MAX_SYS) s = s.slice(0, MAX_SYS - 1) + '…';
    return s;
  }

  /* ------------------------------------------------------------------ */
  /* transport                                                           */
  /* ------------------------------------------------------------------ */
  async function byok(messages, system) {
    const key = D.device.novaKey;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 2048, system, messages }),
    });
    let j = null;
    try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error((j && j.error && j.error.message) || 'HTTP ' + r.status);
    const text = ((j && j.content) || []).filter((c) => c && c.type === 'text').map((c) => c.text).join('\n').trim();
    if (!text) throw new Error(t('nova.err.empty'));
    return text;
  }
  async function ask(messages, system) {
    // One transport for the whole app (see js/ai.js): server proxy first, BYOK fallback.
    if (D.ai && D.ai.ask) return D.ai.ask(messages, system, { maxTokens: 2048, kind: 'chat' });
    try {
      const r = await D.api('/api/ai', { method: 'POST', body: JSON.stringify({ messages, system, kind: 'chat' }) });
      const text = r && typeof r.text === 'string' ? r.text.trim() : '';
      if (!text) throw new Error(t('nova.err.empty'));
      return text;
    } catch (e) {
      const st = e && e.status;
      const fallbackable = !st || st === 404 || st === 501 || st === 405 || st === 502 || st === 503;
      if (fallbackable && hasKey()) return byok(messages, system);
      if (fallbackable && !D.serverEnabled()) throw new Error(t('nova.err.noTransport'));
      throw e;
    }
  }

  /* ------------------------------------------------------------------ */
  /* send                                                                */
  /* ------------------------------------------------------------------ */
  async function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    let th = active();
    if (!th) {
      th = { id: D.uid('nv'), ts: Date.now(), messages: [] };
      nova().threads.push(th);
      D.ui.sub[VIEW] = th.id; D.saveUi();
    }
    th.messages.push({ role: 'user', content: text, ts: Date.now() });
    th.ts = Date.now();
    draft = '';
    error = ''; errorFor = null;
    D.save();
    await reply(th);
  }
  const inputFocused = () => { const a = document.activeElement; return !!(a && a.id === 'nvInput'); };
  const rerenderKeepFocus = () => {
    const had = inputFocused();
    D.rerender();
    if (had) { const el = document.getElementById('nvInput'); if (el) el.focus(); }
  };
  async function reply(th) {
    if (busy) return;
    busy = true; error = ''; errorFor = null; stickBottom = true;
    rerenderKeepFocus();
    const messages = th.messages.slice(-MAX_MSGS).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }));
    // API requires the conversation to start with a user turn
    while (messages.length && messages[0].role !== 'user') messages.shift();
    try {
      const text = await ask(messages, buildSystem());
      th.messages.push({ role: 'assistant', content: text, ts: Date.now() });
      th.ts = Date.now();
      happyUntil = Date.now() + 2500;
      if (threadById(th.id)) D.save(); // thread may have been deleted meanwhile — nothing to persist then
    } catch (e) {
      error = (e && e.message) || String(e);
      errorFor = th.id;
    }
    busy = false;
    if (D.current() === VIEW) rerenderKeepFocus();
  }

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  function orb() {
    const st = busy ? 'think' : Date.now() < happyUntil ? 'happy' : 'idle';
    return `<div class="nv-orb ${st}" id="nvOrb" aria-hidden="true"><i></i><i></i></div>`;
  }
  function header() {
    const mode = modeKey();
    const st = busy ? 'think' : Date.now() < happyUntil ? 'happy' : 'idle';
    return `<div class="card nv-head">
      <div class="nv-head-row">
        ${orb()}
        <div class="nv-head-body">
          <div class="eyebrow">${esc(t('nova.eyebrow'))}</div>
          <div class="nv-name">Nova</div>
          <div class="nv-tag">${esc(t('nova.tagline'))}</div>
        </div>
        <div class="nv-head-acts">
          <button class="btn icon" data-act="nvKeyToggle" aria-label="${esc(t('nova.key.toggle'))}" title="${esc(t('nova.key.toggle'))}">${D.ic('key', 18)}</button>
          <button class="btn icon" data-act="nvNew" aria-label="${esc(t('nova.thread.new'))}" title="${esc(t('nova.thread.new'))}">${D.ic('plus', 18)}</button>
        </div>
      </div>
      <div class="nv-status">
        <span class="pill ${mode === 'none' ? '' : 'good'}">${D.ic(mode === 'server' ? 'link' : mode === 'key' ? 'key' : 'alert', 12)} ${esc(t('nova.mode.' + mode))}</span>
        <span class="pill nv-state ${st}" id="nvState">${esc(t('nova.status.' + st))}</span>
      </div>
    </div>`;
  }
  function setupBanner() {
    if (modeKey() !== 'none') return '';
    return `<div class="banner nv-setup">${D.ic('info', 16)}<span class="grow">${esc(t('nova.setupHint'))}</span><button class="btn sm ghost" data-act="nvKeyToggle" data-open="1">${esc(t('nova.setupBtn'))}</button></div>`;
  }
  function keyPanel() {
    if (!D.ui.collapsed.nvKey) return '';
    const has = hasKey();
    return `<div class="card nv-keypanel">
      <div class="card-head"><div class="title">${D.ic('key', 16)} ${esc(t('nova.key.title'))}</div>
        <span class="pill ${has ? 'good' : ''}">${esc(has ? t('nova.key.set', { k: keyMask(D.device.novaKey) }) : t('nova.key.none'))}</span></div>
      <p class="help">${esc(t('nova.key.note'))}</p>
      <div class="input-row">
        <input class="inp" type="password" id="nvKeyInp" placeholder="${esc(t('nova.key.ph'))}" autocomplete="new-password" spellcheck="false" data-enter="nvKeySave">
        <button class="btn" data-act="nvKeySave">${esc(t('nova.key.save'))}</button>
      </div>
      ${has ? `<div class="form-foot"><button class="btn sm danger" data-act="nvKeyForget">${D.ic('trash', 14)} ${esc(t('nova.key.forget'))}</button></div>` : ''}
    </div>`;
  }
  function ctxStrip() {
    const c = snapshot();
    const open = !!D.ui.collapsed.nvCtx;
    const tile = (v, label, cls = '') => `<div class="stat nv-stat"><div class="stat-num num ${cls}">${v}</div><div class="stat-label">${esc(label)}</div></div>`;
    return `<button type="button" class="section-title nv-toggle ${open ? 'open' : ''}" data-act="nvCtxToggle" aria-expanded="${open}">${esc(t('nova.ctx.title'))}${D.ic('chevD', 14)}</button>
    ${open ? `<div class="stat-grid nv-ctx">
      ${tile(`${c.doneH.length}<small>/${c.due}</small>`, t('nova.ctx.habits'), c.due && c.doneH.length === c.due ? 'good' : '')}
      ${tile(c.weekPct === null ? '—' : D.fmtPct(c.weekPct), t('nova.ctx.week'), c.weekPct === null ? '' : c.weekPct >= 70 ? 'good' : c.weekPct >= 40 ? 'warn' : 'bad')}
      ${tile(D.fmtNum(c.pendingN), t('nova.ctx.tasks'))}
      ${tile(c.sleepAvg === null ? '—' : `${c.sleepAvg}<small>${esc(t('unit.h'))}</small>`, t('nova.ctx.sleep'), c.sleepAvg === null ? '' : c.sleepAvg >= 7 ? 'good' : c.sleepAvg >= 6 ? 'warn' : 'bad')}
      ${tile(c.moodAvg === null ? '—' : `${c.moodAvg}<small>/4</small>`, t('nova.ctx.mood'))}
      ${tile(esc(D.fmtMoney(c.net)), t('nova.ctx.net'), c.net > 0 ? 'good' : c.net < 0 ? 'bad' : '')}
    </div><p class="help nv-ctx-note">${esc(t('nova.ctx.note'))}</p>` : ''}`;
  }
  function threadList() {
    const list = threads();
    const open = !!D.ui.collapsed.nvThreads;
    const cur = activeId();
    let body = '';
    if (open) {
      body = list.length
        ? `<div class="list">${list.map((th) => `<div class="li tap nv-th ${th.id === cur ? 'nv-on' : ''}" data-act="nvOpen" data-id="${esc(th.id)}">
            <div class="li-body"><div class="li-text ellipsis">${esc(titleOf(th))}</div>
            <div class="li-meta"><span>${esc(D.fmtDate(D.dayKey(new Date(+th.ts || Date.now()))))}</span><span class="num">${esc(t('nova.thread.msgs', { n: (th.messages || []).length }))}</span></div></div>
            <button class="li-del" data-act="nvDel" data-id="${esc(th.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button></div>`).join('')}</div>`
        : `<div class="empty">${esc(t('nova.threads.empty'))}</div>`;
      body += `<button class="dashed nv-newbtn" data-act="nvNew">${D.ic('plus', 14)} ${esc(t('nova.thread.new'))}</button>`;
    }
    return `<button type="button" class="section-title nv-toggle ${open ? 'open' : ''}" data-act="nvThreadsToggle" aria-expanded="${open}">${esc(t('nova.threads'))}<span class="right num">${list.length}</span>${D.ic('chevD', 14)}</button>${body}`;
  }
  function bubble(m) {
    const ai = m.role === 'assistant';
    return `<div class="nv-msg ${ai ? 'ai' : 'user'}">
      <div class="nv-role"><span>${ai ? 'NOVA' : esc(t('nova.you'))}</span><span class="num">${esc(fmtClock(m.ts))}</span></div>
      <div class="nv-bubble">${ai ? md(m.content) : esc(m.content).replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  function chips() {
    return `<div class="nv-chips">${QUICK.map((q) => `<button class="pill nv-chip" data-act="nvQuick" data-q="${q}" ${busy ? 'disabled' : ''}>${D.ic('sparkles', 12)} ${esc(t('nova.quick.' + q))}</button>`).join('')}</div>`;
  }
  function chat() {
    const th = active();
    const msgs = th ? th.messages || [] : [];
    const lastUser = msgs.length && msgs[msgs.length - 1].role === 'user' && !busy;
    let feed = '';
    if (!msgs.length) feed = `<div class="nv-msg ai"><div class="nv-role"><span>NOVA</span></div><div class="nv-bubble">${esc(t('nova.welcome'))}</div></div>`;
    else feed = msgs.map(bubble).join('');
    if (busy) feed += `<div class="nv-msg ai nv-typing"><div class="nv-role"><span>NOVA</span></div><div class="nv-bubble"><span class="nv-dots"><i></i><i></i><i></i></span><span class="muted small">${esc(t('nova.typing'))}</span></div></div>`;
    const showErr = error && (!th ? errorFor === null : errorFor === th.id || errorFor === null);
    const err = showErr ? `<div class="banner bad nv-err">${D.ic('alert', 16)}<span class="grow">${esc(t('nova.err.http', { m: error }))}</span>
      ${lastUser ? `<button class="btn sm ghost" data-act="nvRetry">${D.ic('refresh', 14)} ${esc(t('nova.retry'))}</button>` : ''}
      <button class="btn icon" data-act="nvDismiss" aria-label="${esc(t('nova.dismiss'))}">${D.ic('x', 16)}</button></div>` : '';
    return `<div class="card nv-chat">
      <div class="nv-feed" id="nvFeed" aria-live="polite" aria-relevant="additions">${feed}</div>
      ${err}
      ${chips()}
      <div class="nv-composer">
        <textarea class="ta nv-input" id="nvInput" rows="1" placeholder="${esc(t('nova.inputPh'))}" data-input="nvDraft" aria-label="${esc(t('nova.send'))}">${esc(draft)}</textarea>
        <button class="btn sq nv-send" data-act="nvSend" aria-label="${esc(t('nova.send'))}" title="${esc(t('nova.send'))}" ${busy ? 'disabled' : ''}>${D.ic('chevR', 20)}</button>
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
    const f = document.getElementById('nvFeed');
    if (f && stickBottom) f.scrollTop = f.scrollHeight;
  }
  function mount() {
    autoGrow(document.getElementById('nvInput'));
    scrollFeed();
    const f = document.getElementById('nvFeed');
    if (f) f.addEventListener('scroll', () => { stickBottom = f.scrollHeight - f.scrollTop - f.clientHeight < 40; }, { passive: true });
    clearTimeout(happyTimer);
    if (Date.now() < happyUntil) {
      happyTimer = setTimeout(() => {
        const o = document.getElementById('nvOrb'), s = document.getElementById('nvState');
        if (o) { o.classList.remove('happy'); o.classList.add('idle'); }
        if (s) { s.classList.remove('happy'); s.classList.add('idle'); s.textContent = t('nova.status.idle'); }
      }, Math.max(0, happyUntil - Date.now()));
    }
  }
  function unmount() { clearTimeout(happyTimer); }

  // Enter sends, Shift+Enter newline (core only handles input[data-enter])
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || ev.shiftKey || ev.isComposing) return;
    const el = ev.target;
    if (!el || !el.classList || !el.classList.contains('nv-input')) return;
    ev.preventDefault();
    D.act.nvSend();
  });

  /* ------------------------------------------------------------------ */
  /* actions                                                             */
  /* ------------------------------------------------------------------ */
  D.act.nvDraft = (el) => { draft = el.value; autoGrow(el); };
  D.act.nvSend = () => { const el = document.getElementById('nvInput'); if (el) draft = el.value; return send(draft); };
  D.act.nvQuick = (el) => send(t('nova.quick.' + (el.dataset.q || 'day')));
  D.act.nvRetry = () => { const th = active(); if (!th || !th.messages.length || th.messages[th.messages.length - 1].role !== 'user') return; return reply(th); };
  D.act.nvDismiss = () => { error = ''; errorFor = null; D.rerender(); };
  D.act.nvNew = () => { D.ui.sub[VIEW] = null; error = ''; errorFor = null; stickBottom = true; D.saveUi(); D.rerender(); setTimeout(() => { const el = document.getElementById('nvInput'); if (el) el.focus(); }, 30); };
  D.act.nvOpen = (el) => { const id = el.dataset.id; if (!threadById(id)) return; D.ui.sub[VIEW] = id; error = ''; errorFor = null; stickBottom = true; D.saveUi(); D.rerender(); };
  D.act.nvDel = (el, ev) => {
    if (ev) ev.stopPropagation();
    const id = el.dataset.id;
    if (activeId() === id) { D.ui.sub[VIEW] = null; D.saveUi(); }
    D.remove(nova().threads, id, { label: t('nova.thread.deleted') });
  };
  D.act.nvThreadsToggle = () => { D.ui.collapsed.nvThreads = !D.ui.collapsed.nvThreads; D.saveUi(); D.rerender(); };
  D.act.nvCtxToggle = () => { D.ui.collapsed.nvCtx = !D.ui.collapsed.nvCtx; D.saveUi(); D.rerender(); };
  D.act.nvKeyToggle = (el) => {
    D.ui.collapsed.nvKey = el && el.dataset.open ? true : !D.ui.collapsed.nvKey;
    D.saveUi(); D.rerender();
    if (D.ui.collapsed.nvKey) setTimeout(() => { const i = document.getElementById('nvKeyInp'); if (i) i.focus(); }, 30);
  };
  D.act.nvKeySave = () => {
    const i = document.getElementById('nvKeyInp');
    const k = i ? i.value.trim() : '';
    if (!k) { D.toast(t('nova.key.empty')); return; }
    D.device.novaKey = k;
    D.saveDevice();
    D.ui.collapsed.nvKey = false; D.saveUi();
    error = ''; errorFor = null;
    D.toast(/^sk-ant-/.test(k) ? t('nova.key.saved') : t('nova.key.badFormat'), { ms: /^sk-ant-/.test(k) ? 1800 : 4000 });
    D.rerender();
  };
  D.act.nvKeyForget = () => {
    D.device.novaKey = '';
    D.saveDevice();
    error = ''; errorFor = null;
    D.toast(t('nova.key.forgot'));
    D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* search                                                              */
  /* ------------------------------------------------------------------ */
  D.search.register((q) => {
    const out = [{ label: t('nova.search.ask'), sub: 'Nova', icon: 'sparkles', go: () => { D.go(VIEW); } }];
    for (const th of threads().slice(0, 20)) out.push({ label: titleOf(th), sub: t('nova.search.thread'), icon: 'sparkles', go: () => { D.ui.sub[VIEW] = th.id; D.saveUi(); D.go(VIEW); } });
    return out;
  });

  D.view({ id: VIEW, icon: 'sparkles', order: 70, nav: true, primary: false, render, mount, unmount });
})();
