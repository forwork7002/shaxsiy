/* =====================================================================
   Dash — history.js · Tarix: arxivni ko'rish (server /api/history/* dan)
   view id 'history' · sub-tabs month | year | chats | cards
   class prefix hs- · faqat o'qiydi: ma'lumot D.S dan emas, arxivdan keladi
   (yillar davomidagi tarix localStorage'ni shishirmasin). Odat nomlari va
   tillar D.S dan; sanalar D.dayKey/D.keyOf; javoblar xotirada keshlanadi.
   ===================================================================== */
(function () {
  'use strict';

  const esc = D.esc;
  const t = (k, p) => D.t(k, p);
  const VIEW = 'history';
  const SUBS = ['month', 'year'];
  // Suhbatlar Nova bo'limida, AI kartalari esa o'z sahifasida turadi — Tarix faqat kunlar arxivi.
  // Server uchlari (/api/history/chats, /cards) joyida qoladi, faqat bu yerdagi ko'zgu olib tashlandi.
  const MOVED = { chats: 'month', cards: 'month' };
  const MOODS = ['😔', '😐', '🙂', '😄', '🤩'];
  const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Dushanbadan boshlanadi
  const FRESH_MS = 120000;                  // bugunga tegib turgan oraliq shuncha vaqtdan keyin qayta so'raladi

  /* ------------------------------------------------------------------ */
  /* i18n — [uz, uzk, ru]                                                */
  /* ------------------------------------------------------------------ */
  const T = {
    'nav.history': ['Tarix', 'Тарих', 'История'],
    'hs.sub.month': ['Oy', 'Ой', 'Месяц'],
    'hs.sub.year': ['Yil', 'Йил', 'Год'],
    'hs.loading': ['Arxiv yuklanmoqda…', 'Архив юкланмоқда…', 'Загружаю архив…'],
    'hs.offline': ["Server bilan aloqa yo'q", 'Сервер билан алоқа йўқ', 'Нет связи с сервером'],
    'hs.offlineSub': ["Tarix faqat serverdagi arxivdan o'qiladi. Internetni tekshirib, qayta urinib ko'ring.", 'Тарих фақат сервердаги архивдан ўқилади. Интернетни текшириб, қайта уриниб кўринг.', 'История читается только из архива на сервере. Проверьте интернет и попробуйте снова.'],
    'hs.noServer': ["Bu qurilmada server ulanmagan — arxiv mavjud emas", 'Бу қурилмада сервер уланмаган — архив мавжуд эмас', 'На этом устройстве нет сервера — архив недоступен'],
    'hs.retry': ['Qayta urinish', 'Қайта уриниш', 'Повторить'],
    'hs.err': ['Xato: {msg}', 'Хато: {msg}', 'Ошибка: {msg}'],

    'hs.m.summary': ['Oy xulosasi', 'Ой хулосаси', 'Итоги месяца'],
    'hs.m.logged': ['Yozilgan kun', 'Ёзилган кун', 'Дней с записями'],
    'hs.m.ticks': ['Odat belgisi', 'Одат белгиси', 'Отметок привычек'],
    'hs.m.sleep': ["O'rt. uyqu", 'Ўрт. уйқу', 'Ср. сон'],
    'hs.m.rec': ["O'rt. tiklanish", 'Ўрт. тикланиш', 'Ср. восстановление'],
    'hs.m.wo': ["Mashg'ulot", 'Машғулот', 'Тренировок'],
    'hs.m.weight': ['Vazn', 'Вазн', 'Вес'],
    'hs.m.empty': ["Bu oyda yozuv yo'q", 'Бу ойда ёзув йўқ', 'В этом месяце записей нет'],
    'hs.lg.habits': ['odatlar', 'одатлар', 'привычки'],
    'hs.lg.rec': ['tiklanish', 'тикланиш', 'восстановление'],
    'hs.lg.note': ['yozuv', 'ёзув', 'запись'],
    'hs.lg.wo': ["mashg'ulot", 'машғулот', 'тренировка'],
    'hs.less': ['Kam', 'Кам', 'Меньше'],
    'hs.more': ["Ko'p", 'Кўп', 'Больше'],

    'hs.d.habits': ['Odatlar', 'Одатлар', 'Привычки'],
    'hs.d.prayers': ['Namozlar', 'Намозлар', 'Намазы'],
    'hs.d.health': ["Sog'liq", 'Соғлиқ', 'Здоровье'],
    'hs.d.whoop': ['WHOOP', 'WHOOP', 'WHOOP'],
    'hs.d.gratitude': ['Shukr', 'Шукр', 'Благодарность'],
    'hs.d.tasks': ['Bajarilgan vazifalar', 'Бажарилган вазифалар', 'Выполненные задачи'],
    'hs.d.note': ['Yozuv', 'Ёзув', 'Запись'],
    'hs.d.stack': ["Qo'shimchalar", 'Қўшимчалар', 'Добавки'],
    'hs.d.caffeine': ['Kofein', 'Кофеин', 'Кофеин'],
    'hs.d.food': ['Ovqat', 'Овқат', 'Питание'],
    'hs.f.macros': ["oqsil / uglevod / yog'", 'оқсил / углевод / ёғ', 'белки / углеводы / жиры'],
    'hs.d.empty': ["Bu kunda yozuv yo'q", 'Бу кунда ёзув йўқ', 'В этот день записей нет'],
    'hs.d.open': ['Shu kunni ochish', 'Шу кунни очиш', 'Открыть этот день'],
    'hs.d.weight': ['Vazn', 'Вазн', 'Вес'],
    'hs.d.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hs.d.water': ['Suv', 'Сув', 'Вода'],
    'hs.d.mood': ['Kayfiyat', 'Кайфият', 'Настроение'],
    'hs.w.rec': ['Tiklanish', 'Тикланиш', 'Восстановление'],
    'hs.w.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hs.w.strain': ['Strain', 'Strain', 'Нагрузка'],
    'hs.w.kcal': ['kkal', 'ккал', 'ккал'],
    'hs.m.eaten': ['Yeyilgan kkal (kunlik o\'rtacha)', 'Ейилган ккал (кунлик ўртача)', 'Съедено ккал (в среднем за день)'],

    'hs.y.months': ['Oylar', 'Ойлар', 'Месяцы'],
    'hs.y.habits': ['Odatlar xaritasi', 'Одатлар харитаси', 'Карта привычек'],
    'hs.y.habitsSub': ['Kunlik belgilar soni', 'Кунлик белгилар сони', 'Отметок за день'],
    'hs.y.rec': ['Tiklanish xaritasi', 'Тикланиш харитаси', 'Карта восстановления'],
    'hs.y.recSub': ['WHOOP · qizil < 34 · sariq < 67 · yashil', 'WHOOP · қизил < 34 · сариқ < 67 · яшил', 'WHOOP · красный < 34 · жёлтый < 67 · зелёный'],
    'hs.y.ago': ['Bir yil oldin shu kun', 'Бир йил олдин шу кун', 'Год назад в этот день'],
    'hs.y.agoEmpty': ["O'sha kunda yozuv yo'q", 'Ўша кунда ёзув йўқ', 'В тот день записей нет'],
    'hs.y.open': ['Batafsil', 'Батафсил', 'Подробнее'],
    'hs.y.noMonths': ["Bu yil uchun ma'lumot yo'q", 'Бу йил учун маълумот йўқ', 'За этот год данных нет'],
    'hs.y.days': ['{n} kun', '{n} кун', '{n} дн.'],
    'hs.y.notes': ['{n} yozuv', '{n} ёзув', '{n} зап.'],
    'hs.y.habitPct': ['odatlar', 'одатлар', 'привычки'],



    'hs.search.ago': ['Bir yil oldin', 'Бир йил олдин', 'Год назад'],
    'hs.search.sub': ['Tarix', 'Тарих', 'История'],
  };
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  for (const k of Object.keys(T)) { TABLES.uz[k] = T[k][0]; TABLES.uzk[k] = T[k][1]; TABLES.ru[k] = T[k][2]; }
  D.i18n.add(TABLES);

  /* ------------------------------------------------------------------ */
  /* ma'lumot qatlami — /api/history/* keshi (uid + url bo'yicha)        */
  /* ------------------------------------------------------------------ */
  const cache = new Map(); // key → { state:'loading'|'ok'|'err', data, err, ts, to }
  const uidOf = () => (D.device && D.device.uid) || (D.S && D.S.meta && D.S.meta.owner) || 'me';
  const qs = (p) => Object.keys(p || {}).filter((k) => p[k] !== undefined && p[k] !== null && p[k] !== '').map((k) => k + '=' + encodeURIComponent(p[k])).join('&');
  const urlOf = (path, params) => { const q = qs(params); return '/api/history/' + path + (q ? '?' + q : ''); };
  const keyOf = (path, params) => uidOf() + '|' + urlOf(path, params);
  const stale = (e) => e.state === 'ok' && e.to && e.to >= D.today() && Date.now() - e.ts > FRESH_MS;

  /** Keshdan qaytaradi; bo'lmasa so'rovni boshlab 'loading' beradi. Javob kelgach onDone (yoki rerender). */
  function req(path, params, onDone) {
    const key = keyOf(path, params);
    let e = cache.get(key);
    if (e && !stale(e)) return e;
    e = { state: 'loading', data: e ? e.data : null, err: null, ts: Date.now(), to: params && params.to };
    cache.set(key, e);
    const finish = () => { if (D.current() !== VIEW) return; if (onDone) onDone(e); else D.rerender(); };
    if (!D.serverEnabled()) { e.state = 'err'; e.err = 'no_server'; return e; }
    D.api(urlOf(path, params))
      .then((j) => { e.state = 'ok'; e.data = j || {}; e.ts = Date.now(); finish(); })
      .catch((err) => { e.state = 'err'; e.err = (err && err.message) || 'error'; finish(); });
    return e;
  }
  /** So'rov yubormasdan keshga qaraydi. */
  const peek = (path, params) => cache.get(keyOf(path, params)) || null;
  const ok = (e) => !!(e && e.state === 'ok' && e.data);
  const isOffline = (e) => /offline|Failed to fetch|NetworkError|HTTP 50[23]/i.test(String(e && e.err || ''));

  const skeleton = () => `<div class="card skel-card hs-skel"><div class="skel skel-eyebrow"></div><div class="skel skel-kpi"></div>
      <div class="skel-rows">${'<div class="skel skel-row"></div>'.repeat(3)}</div></div><div class="skel-note">${esc(t('hs.loading'))}</div>`;
  function errCard(e) {
    if (e.err === 'no_server') return `<div class="card hs-off"><div class="title">${D.ic('alert')} ${esc(t('hs.noServer'))}</div></div>`;
    const off = isOffline(e);
    return `<div class="card hs-off"><div class="title">${D.ic(off ? 'globe' : 'alert')} ${esc(off ? t('hs.offline') : t('hs.err', { msg: e.err }))}</div>
      <div class="help mt-s">${esc(t('hs.offlineSub'))}</div>
      <button class="btn ghost sm mt" data-act="hsRetry">${D.ic('refresh', 14)} ${esc(t('hs.retry'))}</button></div>`;
  }
  /** Bir nechta so'rov: birortasi xato → xato kartasi; birortasi yuklanmoqda → skelet; hammasi tayyor → null. */
  function gate(entries) {
    const bad = entries.find((e) => e.state === 'err');
    if (bad) return errCard(bad);
    if (entries.some((e) => e.state !== 'ok')) return skeleton();
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* tanlov holati — D.ui.filters.hist = { y, m }                        */
  /* ------------------------------------------------------------------ */
  function F() {
    const f = D.ui.filters || (D.ui.filters = {});
    const p = D.parseKey(D.today());
    if (!f.hist || !f.hist.y) f.hist = { y: p.y, m: p.m };
    f.hist.y = D.clamp(+f.hist.y || p.y, 2000, p.y);
    f.hist.m = D.clamp(+f.hist.m || p.m, 1, 12);
    if (f.hist.y === p.y && f.hist.m > p.m) f.hist.m = p.m;
    return f.hist;
  }
  const mk = (y, m) => y + '-' + D.pad2(m);
  const monthRange = (y, m) => { const k = mk(y, m); return { from: k + '-01', to: k + '-' + D.pad2(D.daysInMonth(k)) }; };
  const yearRange = (y) => ({ from: y + '-01-01', to: y + '-12-31' });
  const rangeInfo = () => { const e = peek('range') || req('range'); return ok(e) ? e.data : null; };
  const firstYear = () => { const r = rangeInfo(); const y = r && r.first ? +String(r.first).slice(0, 4) : 0; return y || D.parseKey(D.today()).y; };
  const monthName = (m) => String(D.t('months')[m - 1] || m);
  const shortMonth = (m) => { const M = D.t('months'), s3 = monthName(m).slice(0, 3); return M.some((x, j) => j !== m - 1 && String(x).slice(0, 3) === s3) ? monthName(m).slice(0, 4) : s3; };
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const txt = (x) => (typeof x === 'string' ? x : x && typeof x === 'object' ? String(x.text || x.name || x.title || '') : String(x ?? ''));
  const habitName = (id) => { const h = (D.S.habits || []).find((x) => x.id === id); return h ? h.name : String(id); };
  const zoneOf = (r) => (r == null ? '' : r >= 67 ? 'good' : r >= 34 ? 'warn' : 'bad');
  // arxiv yillarni qamraydi — vaqt tamg'asi yil bilan: «22-aprel 2025 08:00»
  const fmtTsY = (ts) => { if (!ts) return '—'; const p = D.nowTz(new Date(+ts)); return D.fmtDate(D.keyOf(p.y, p.m, p.d)) + ' ' + p.y + ' ' + D.fmtTime(p.h, p.min); };

  /* ------------------------------------------------------------------ */
  /* WHOOP yozuvlarini kunlarga bog'lash — whoop.js applySnapshot bilan   */
  /* bir xil qoida: recovery→ts, sleep→end, cycle→start+12h, workout→start */
  /* ------------------------------------------------------------------ */
  function whoopDays(e) {
    if (!ok(e)) return {};
    if (e._days) return e._days;
    const w = e.data, out = {};
    const at = (k) => out[k] || (out[k] = {});
    const key = (iso, shiftH) => { if (!iso) return null; const d = new Date(iso); if (isNaN(d.getTime())) return null; if (shiftH) d.setTime(d.getTime() + shiftH * 3600e3); return D.dayKey(d); };
    for (const r of w.recovery || []) { const k = key(r.ts); if (k) Object.assign(at(k), { recovery: num(r.recovery), hrv: num(r.hrv), rhr: num(r.rhr) }); }
    for (const r of w.sleep || []) { if (r.nap) continue; const k = key(r.end || r.start); if (k) Object.assign(at(k), { sleepH: num(r.sleepH), sleepPerf: num(r.sleepPerf) }); }
    for (const c of w.cycle || []) { const k = key(c.start, 12); if (k) Object.assign(at(k), { strain: num(c.strain), kcal: num(c.kcal) }); }
    for (const x of w.workout || []) { const k = key(x.start); if (k) (at(k).workouts = at(k).workouts || []).push(x); }
    e._days = out;
    return out;
  }
  const dayFacts = (e) => (ok(e) && e.data.days && typeof e.data.days === 'object' ? e.data.days : {});
  const habitsOf = (d) => (d && Array.isArray(d.habits) ? d.habits : []);
  // arxiv 'food' fakti: ovqatlar ro'yxati (rasmsiz) — massiv yoki {meals|logs:[…]}
  const foodOf = (d) => { const f = d && d.food; if (Array.isArray(f)) return f; if (f && typeof f === 'object') { if (Array.isArray(f.meals)) return f.meals; if (Array.isArray(f.logs)) return f.logs; } return []; };
  const hasAny = (d) => !!d && (habitsOf(d).length > 0 || !!d.health || !!d.prayers || !!d.note || (Array.isArray(d.gratitude) && d.gratitude.length > 0) || (Array.isArray(d.tasks) && d.tasks.length > 0) || foodOf(d).length > 0);

  /* ------------------------------------------------------------------ */
  /* tanlagichlar                                                        */
  /* ------------------------------------------------------------------ */
  function yearChips(f) {
    const y0 = firstYear(), y1 = D.parseKey(D.today()).y, out = [];
    for (let y = y1; y >= Math.min(y0, f.y); y--) out.push(`<button type="button" class="${y === f.y ? 'on' : ''}" data-act="hsYear" data-y="${y}">${y}</button>`);
    return `<div class="tabs hs-years" data-k="years">${out.join('')}</div>`;
  }
  function monthStrip(f) {
    const td = D.parseKey(D.today()), r = rangeInfo(), first = r && r.first ? String(r.first).slice(0, 7) : '';
    const out = [];
    for (let m = 1; m <= 12; m++) {
      const k = mk(f.y, m), future = f.y === td.y && m > td.m, before = first && k < first;
      out.push(`<button type="button" class="${m === f.m ? 'on' : ''} ${before ? 'dim' : ''}" data-act="hsMonth" data-m="${m}" ${future ? 'disabled' : ''}>${esc(shortMonth(m))}</button>`);
    }
    return `<div class="tabs hs-months" data-k="months">${out.join('')}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* OY                                                                  */
  /* ------------------------------------------------------------------ */
  function monthSummary(days, wd, f) {
    const keys = Object.keys(days).filter((k) => hasAny(days[k]));
    const ticks = D.sum(keys, (k) => habitsOf(days[k]).length);
    // odat % — serverdagi months.habitPct bilan bir xil formula: belgilar / (oyda kamida bir marta belgilangan odatlar × odat yozilgan kunlar)
    const hk = keys.filter((k) => habitsOf(days[k]).length), ids = new Set();
    for (const k of hk) for (const id of habitsOf(days[k])) ids.add(String(id));
    const pct = hk.length ? Math.round((100 * ticks) / (Math.max(1, ids.size) * hk.length)) : null;
    const mkey = mk(f.y, f.m);
    const wkeys = Object.keys(wd).filter((k) => k.slice(0, 7) === mkey);
    const sleeps = wkeys.map((k) => wd[k].sleepH).filter((v) => v != null);
    const recs = wkeys.map((k) => wd[k].recovery).filter((v) => v != null);
    const wos = D.sum(wkeys, (k) => (wd[k].workouts || []).length);
    // uyqu WHOOP'da bo'lmasa qo'lda yozilgan soatdan
    if (!sleeps.length) for (const k of keys) { const s = days[k].health && num(days[k].health.sleep); if (s) sleeps.push(s); }
    const ws = Object.keys(days).sort().map((k) => (days[k].health ? num(days[k].health.weight) : null)).filter((v) => v);
    const w0 = ws[0], w1 = ws[ws.length - 1];
    const tile = (n, l, cls = '') => `<div class="stat"><div class="stat-num num ${cls}">${n}</div><div class="stat-label">${esc(l)}</div></div>`;
    if (!keys.length && !wkeys.length) return `<div class="card"><div class="eyebrow">${esc(t('hs.m.summary'))}</div><div class="empty">${esc(t('hs.m.empty'))}</div></div>`;
    return `<div class="card hs-sum" data-k="sum">
      <div class="card-head"><div class="eyebrow">${esc(t('hs.m.summary'))}</div><span class="pill num">${esc(monthName(f.m))} ${f.y}</span></div>
      <div class="stat-grid hs-tiles">
        ${tile(pct != null ? pct + '<small>%</small>' : '—', t('hs.y.habitPct'), pct != null ? (pct >= 70 ? 'hs-z-good' : pct >= 40 ? '' : 'hs-z-bad') : '')}
        ${tile(ticks, t('hs.m.ticks'))}
        ${tile(keys.length, t('hs.m.logged'))}
        ${tile(sleeps.length ? D.round(D.avg(sleeps), 1) + '<small>' + esc(t('unit.h')) + '</small>' : '—', t('hs.m.sleep'))}
        ${tile(recs.length ? Math.round(D.avg(recs)) + '<small>%</small>' : '—', t('hs.m.rec'), 'hs-z-' + zoneOf(recs.length ? D.avg(recs) : null))}
        ${tile(wos, t('hs.m.wo'))}
        ${tile(w0 ? (ws.length > 1 && w1 !== w0 ? `${D.round(w0, 1)}<small>→</small>${D.round(w1, 1)}` : D.round(w0, 1)) + '<small>' + esc(t('unit.kg')) + '</small>' : '—', t('hs.m.weight'), ws.length > 1 ? 'hs-wt' : '')}
      </div></div>`;
  }
  function calendar(days, wd, f) {
    const mkey = mk(f.y, f.m), n = D.daysInMonth(mkey), today = D.today();
    const W = D.t('weekdays');
    let max = 0;
    for (let d = 1; d <= n; d++) max = Math.max(max, habitsOf(days[D.keyOf(f.y, f.m, d)]).length);
    const head = DOW_ORDER.map((i) => `<span>${esc(String(W[i] || '').slice(0, 2))}</span>`).join('');
    let cells = '';
    const pad = (D.dowOf(mkey + '-01') + 6) % 7;
    for (let i = 0; i < pad; i++) cells += '<i class="hs-pad"></i>';
    for (let d = 1; d <= n; d++) {
      const k = D.keyOf(f.y, f.m, d), x = days[k], w = wd[k] || {};
      const future = k > today, nh = habitsOf(x).length;
      const lvl = nh && max ? Math.max(1, Math.ceil((nh / max) * 4)) : 0;
      const marks = future ? '' :
        (w.recovery != null ? `<i class="hs-dot hs-d-rec ${zoneOf(w.recovery)}" title="${w.recovery}%"></i>` : '') +
        (x && (x.note || (Array.isArray(x.gratitude) && x.gratitude.length)) ? '<i class="hs-dot hs-d-note"></i>' : '') +
        ((w.workouts || []).length ? '<i class="hs-dot hs-d-wo"></i>' : '');
      cells += `<button type="button" class="hs-cell l${lvl} ${future ? 'future' : ''} ${k === today ? 'today' : ''} ${x || w.recovery != null ? 'has' : ''}" data-k="d-${k}" data-act="hsDay" data-day="${k}" ${future ? 'disabled' : ''} aria-label="${k}">
        <span class="hs-dn num">${d}</span><span class="hs-marks">${marks}</span></button>`;
    }
    return `<div class="card hs-cal" data-k="cal">
      <div class="hs-dow">${head}</div>
      <div class="hs-grid">${cells}</div>
      <div class="legend hs-legend">
        <span>${esc(t('hs.less'))} <span class="hs-lg"><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i></span> ${esc(t('hs.more'))} · ${esc(t('hs.lg.habits'))}</span>
        <span><i class="hs-dot hs-d-rec good"></i>${esc(t('hs.lg.rec'))}</span>
        <span><i class="hs-dot hs-d-note"></i>${esc(t('hs.lg.note'))}</span>
        <span><i class="hs-dot hs-d-wo"></i>${esc(t('hs.lg.wo'))}</span>
      </div></div>`;
  }
  function renderMonth() {
    const f = F(), r = monthRange(f.y, f.m);
    const range = req('range'), de = req('days', r), we = req('whoop', r);
    const g = gate([range, de, we]);
    return yearChips(f) + monthStrip(f) + (g || monthSummary(dayFacts(de), whoopDays(we), f) + calendar(dayFacts(de), whoopDays(we), f));
  }

  /* ------------------------------------------------------------------ */
  /* kun varag'i (faqat o'qish)                                          */
  /* ------------------------------------------------------------------ */
  let pendingDay = null;
  // faqat o'qiladigan varaq: noFocus — aks holda modal pastdagi tugmaga fokus berib, oxiriga aylantirib qo'yadi
  const sheet = (k, body) => D.sheet(body, { title: D.fmtDate(k, 'long'), noFocus: true });
  function dayEntries(k) {
    const mm = D.parseKey(k), r = monthRange(mm.y, mm.m);
    const de = peek('days', r), we = peek('whoop', r);
    if (ok(de) && ok(we)) return [de, we];
    return [req('days', { from: k, to: k }, afterDay), req('whoop', { from: k, to: k }, afterDay)];
  }
  function afterDay() { if (pendingDay) { const k = pendingDay; pendingDay = null; openDay(k); } }
  function openDay(k) {
    const [de, we] = dayEntries(k);
    if (de.state === 'err' || we.state === 'err') { pendingDay = null; sheet(k, errCard(de.state === 'err' ? de : we)); return; }
    if (!ok(de) || !ok(we)) { pendingDay = k; sheet(k, skeleton()); return; }
    sheet(k, dayHtml(k, dayFacts(de)[k], whoopDays(we)[k]));
  }
  function dayHtml(k, x, w) {
    x = x || {}; w = w || {};
    const sec = (title, body) => (body ? `<div class="hs-sec"><div class="eyebrow">${esc(title)}</div>${body}</div>` : '');
    const kv = (l, v) => (v == null || v === '' ? '' : `<div class="hs-kv"><span class="muted">${esc(l)}</span><span class="num">${v}</span></div>`);
    const hab = habitsOf(x);
    const counts = x.counts && typeof x.counts === 'object' ? x.counts : {};
    const habits = hab.length ? `<div class="hs-chips">${hab.map((id) => `<span class="pill good">${esc(habitName(id))}${counts[id] != null ? ` <b class="num">${esc(String(counts[id]))}</b>` : ''}</span>`).join('')}</div>` : '';
    const pr = x.prayers && typeof x.prayers === 'object' ? D.PRAYERS.filter((p) => x.prayers[p]) : [];
    const prayers = pr.length ? `<div class="hs-chips">${pr.map((p) => { const s = x.prayers[p]; return `<span class="pill ${s === 'jamaat' || s === 'alone' ? 'good' : s === 'missed' ? 'bad' : ''}">${esc(t('prayer.' + p))} · ${esc(t('ib.st.' + s) === 'ib.st.' + s ? s : t('ib.st.' + s))}</span>`; }).join('')}</div>` : '';
    const h = x.health && typeof x.health === 'object' ? x.health : null;
    const tags = h && Array.isArray(h.tags) && h.tags.length ? h.tags.map((g) => `<span class="tag">${esc(t('hl.tag.' + g) === 'hl.tag.' + g ? g : t('hl.tag.' + g))}</span>`).join(' ') : '';
    const health = h ? kv(t('hs.d.weight'), num(h.weight) ? D.round(num(h.weight), 1) + ' ' + esc(t('unit.kg')) : null) + kv(t('hs.d.sleep'), num(h.sleep) ? D.round(num(h.sleep), 1) + ' ' + esc(t('unit.h')) : null)
      + kv(t('hs.d.water'), num(h.water) ? D.round(num(h.water), 1) + ' ' + esc(t('unit.glass')) : null) + kv(t('hs.d.mood'), num(h.mood) != null && MOODS[num(h.mood)] ? MOODS[num(h.mood)] : null)
      + (tags ? `<div class="hs-kv"><span></span><span>${tags}</span></div>` : '') + (h.note ? `<div class="hs-note">${esc(h.note)}</div>` : '') : '';
    const wos = (w.workouts || []).map((o) => `<div class="li hs-wo-row"><span class="li-text">${esc(o.sport || '—')}</span><span class="li-meta num">${o.mins != null ? esc(String(o.mins)) + ' ' + esc(t('unit.m')) : ''}${o.strain != null ? ' · ' + esc(String(o.strain)) : ''}${o.kcal != null ? ' · ' + esc(String(o.kcal)) + ' ' + esc(t('hs.w.kcal')) : ''}</span></div>`).join('');
    const whoop = (w.recovery != null || w.sleepH != null || w.strain != null || wos) ? `<div class="hs-wgrid">
        ${w.recovery != null ? `<div class="stat"><div class="stat-num num hs-z-${zoneOf(w.recovery)}">${w.recovery}<small>%</small></div><div class="stat-label">${esc(t('hs.w.rec'))}</div></div>` : ''}
        ${w.hrv != null ? `<div class="stat"><div class="stat-num num">${w.hrv}</div><div class="stat-label">HRV</div></div>` : ''}
        ${w.rhr != null ? `<div class="stat"><div class="stat-num num">${w.rhr}</div><div class="stat-label">RHR</div></div>` : ''}
        ${w.sleepH != null ? `<div class="stat"><div class="stat-num num">${D.round(w.sleepH, 1)}<small>${esc(t('unit.h'))}</small></div><div class="stat-label">${esc(t('hs.w.sleep'))}${w.sleepPerf != null ? ' · ' + w.sleepPerf + '%' : ''}</div></div>` : ''}
        ${w.strain != null ? `<div class="stat"><div class="stat-num num">${D.round(w.strain, 1)}</div><div class="stat-label">${esc(t('hs.w.strain'))}</div></div>` : ''}
        ${w.kcal != null ? `<div class="stat"><div class="stat-num num">${Math.round(w.kcal)}</div><div class="stat-label">${esc(t('hs.w.kcal'))}</div></div>` : ''}
      </div>${wos ? `<div class="list mt-s">${wos}</div>` : ''}` : '';
    const grat = Array.isArray(x.gratitude) && x.gratitude.length ? `<ul class="hs-ul">${x.gratitude.map((g) => `<li>${esc(txt(g))}</li>`).join('')}</ul>` : '';
    const tasks = Array.isArray(x.tasks) && x.tasks.length ? `<ul class="hs-ul hs-done">${x.tasks.map((g) => `<li>${esc(txt(g))}</li>`).join('')}</ul>` : '';
    const note = x.note ? `<div class="hs-note">${esc(String(x.note))}</div>` : '';
    const stack = x.stack && typeof x.stack === 'object' && Object.keys(x.stack).length ? `<div class="hs-chips">${Object.keys(x.stack).map((id) => { const it = ((D.S.stack || {}).items || []).find((s) => s.id === id); return `<span class="pill">${esc(it ? it.name : id)}</span>`; }).join('')}</div>` : '';
    const caf = Array.isArray(x.caffeine) && x.caffeine.length ? `<div class="hs-chips">${x.caffeine.map((c) => `<span class="pill">${esc(txt(c) || '☕')}${num(c && c.mg) ? ` <b class="num">${num(c.mg)} mg</b>` : ''}</span>`).join('')}</div>` : '';
    const meals = foodOf(x);
    const g0 = (v) => Math.round(num(v) || 0);
    const macros = (m) => `${g0(m.kcal)} ${esc(t('hs.w.kcal'))} · ${g0(m.p)}/${g0(m.c)}/${g0(m.f)} g`;
    const food = meals.length ? `<div class="list">${meals.map((m) => `<div class="li hs-wo-row"><span class="li-text">${esc(txt(m) || '—')}${num(m && m.grams) ? ` <span class="muted num">${g0(m.grams)} g</span>` : ''}</span><span class="li-meta num">${macros(m || {})}</span></div>`).join('')}</div>
      ${kv(t('common.total'), macros({ kcal: D.sum(meals, (m) => num(m && m.kcal) || 0), p: D.sum(meals, (m) => num(m && m.p) || 0), c: D.sum(meals, (m) => num(m && m.c) || 0), f: D.sum(meals, (m) => num(m && m.f) || 0) }))}
      <div class="help">${esc(t('hs.f.macros'))}</div>` : '';
    const body = sec(t('hs.d.habits'), habits) + sec(t('hs.d.prayers'), prayers) + sec(t('hs.d.health'), health) + sec(t('hs.d.whoop'), whoop) + sec(t('hs.d.food'), food)
      + sec(t('hs.d.gratitude'), grat) + sec(t('hs.d.tasks'), tasks) + sec(t('hs.d.note'), note) + sec(t('hs.d.stack'), stack) + sec(t('hs.d.caffeine'), caf);
    return `<div class="hs-day">${body || `<div class="empty">${esc(t('hs.d.empty'))}</div>`}
      <div class="row mt"><button class="btn" data-act="hsOpenDay" data-day="${k}">${D.ic('calendar', 16)} ${esc(t('hs.d.open'))}</button></div></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* YIL                                                                 */
  /* ------------------------------------------------------------------ */
  function yearHeat(y, valueFn, cls = '') {
    const end = y + '-12-31', endDow = D.dowOf(end), total = 52 * 7 + endDow + 1;
    const days = D.lastDays(total, end), cols = Math.ceil(total / 7);
    const marks = []; let prev = '';
    for (let c = 0; c < cols; c++) { const k = days[c * 7]; if (!k) break; const m = k.slice(0, 7); if (m !== prev) { marks.push({ c, m: +k.slice(5, 7), y: +k.slice(0, 4) }); prev = m; } }
    const labels = marks.map((mkk, i) => {
      const span = i === marks.length - 1 ? 2 : Math.min(4, marks[i + 1].c - mkk.c);
      return span < 2 || mkk.y !== y ? '' : `<span style="grid-column:${mkk.c + 1} / span ${span}">${esc(shortMonth(mkk.m))}</span>`;
    }).join('');
    const fn = (k) => (k.slice(0, 4) !== String(y) || k > D.today() ? null : valueFn(k));
    return `<div class="hs-year ${cls}"><div class="hs-hmonths">${labels}</div>${D.chart.heatYear({ end, valueFn: fn })}</div>`;
  }
  function monthCards(y, months) {
    const keys = Object.keys(months || {}).filter((k) => k <= D.monthKey()).sort(); // kelajak oylar ko'rsatilmaydi
    if (!keys.length) return `<div class="card"><div class="empty">${esc(t('hs.y.noMonths'))}</div></div>`;
    const cards = keys.map((k) => {
      const m = months[k] || {}, mo = +k.slice(5, 7);
      const wd = num(m.weightStart) && num(m.weightEnd) ? D.round(num(m.weightEnd) - num(m.weightStart), 1) : null;
      const pct = num(m.habitPct);
      return `<button type="button" class="hs-mcard" data-k="m-${k}" data-act="hsGoMonth" data-y="${y}" data-m="${mo}">
        <div class="hs-mc-head"><span class="hs-mc-name">${esc(monthName(mo))}</span><span class="pill num ${pct != null ? (pct >= 70 ? 'good' : pct >= 40 ? '' : 'bad') : ''}">${pct != null ? pct + '%' : '—'}</span></div>
        <div class="bar"><i class="bar-fill" style="width:${D.clamp(pct || 0, 0, 100)}%"></i></div>
        <div class="hs-mc-rows num">
          <span title="${esc(t('hs.m.sleep'))}">${D.ic('moon', 12)} ${num(m.sleepH) != null ? D.round(num(m.sleepH), 1) + esc(t('unit.h')) : '—'}</span>
          <span title="${esc(t('hs.m.rec'))}" class="hs-z-${zoneOf(num(m.recovery))}">${D.ic('heart', 12)} ${num(m.recovery) != null ? Math.round(num(m.recovery)) + '%' : '—'}</span>
          <span title="${esc(t('hs.w.strain'))}">${D.ic('bolt', 12)} ${num(m.strain) != null ? D.round(num(m.strain), 1) : '—'}</span>
          <span title="${esc(t('hs.w.kcal'))}">${D.ic('fire', 12)} ${num(m.kcal) != null ? Math.round(num(m.kcal)) : '—'}</span>
          <span title="${esc(t('hs.m.eaten'))}">${D.ic('apple', 12)} ${num(m.kcalEaten) != null ? Math.round(num(m.kcalEaten)) : '—'}</span>
          <span title="${esc(t('hs.m.wo'))}">${D.ic('dumbbell', 12)} ${num(m.workouts) != null ? num(m.workouts) : 0}</span>
          <span title="${esc(t('hs.m.weight'))}">${D.ic('scale', 12)} ${wd != null ? (wd > 0 ? '+' : '') + wd + esc(t('unit.kg')) : num(m.weightEnd) != null ? D.round(num(m.weightEnd), 1) + esc(t('unit.kg')) : '—'}</span>
        </div>
        <div class="hs-mc-foot small muted">${esc(t('hs.y.days', { n: num(m.days) || 0 }))} · ${esc(t('hs.y.notes', { n: num(m.notes) || 0 }))}</div>
      </button>`;
    }).join('');
    return `<div class="hs-mgrid" data-k="mgrid">${cards}</div>`;
  }
  function yearAgoKey() {
    const p = D.parseKey(D.today()), y = p.y - 1, d = Math.min(p.d, D.daysInMonth(mk(y, p.m)));
    return D.keyOf(y, p.m, d);
  }
  function agoCard() {
    const k = yearAgoKey(), r = { from: k, to: k };
    const de = req('days', r), we = req('whoop', r);
    const head = `<div class="card-head"><div class="title">${D.ic('clock')} ${esc(t('hs.y.ago'))}</div><span class="pill num">${esc(D.fmtDate(k, 'weekday'))}</span></div>`;
    const g = gate([de, we]);
    if (g) return `<div class="card hs-ago" data-k="ago">${head}${de.state === 'err' || we.state === 'err' ? g : '<div class="skel skel-row"></div>'}</div>`;
    const x = dayFacts(de)[k], w = whoopDays(we)[k] || {};
    if (!hasAny(x) && w.recovery == null) return `<div class="card hs-ago" data-k="ago">${head}<div class="empty">${esc(t('hs.y.agoEmpty'))}</div></div>`;
    const hab = habitsOf(x), h = x && x.health;
    const chips = [
      hab.length ? `<span class="pill good">${D.ic('check', 12)} ${hab.length} ${esc(t('hs.lg.habits'))}</span>` : '',
      w.recovery != null ? `<span class="pill ${zoneOf(w.recovery) === 'bad' ? 'bad' : zoneOf(w.recovery) === 'good' ? 'good' : ''}">${D.ic('heart', 12)} ${w.recovery}%</span>` : '',
      w.sleepH != null ? `<span class="pill">${D.ic('moon', 12)} ${D.round(w.sleepH, 1)}${esc(t('unit.h'))}</span>` : h && num(h.sleep) ? `<span class="pill">${D.ic('moon', 12)} ${D.round(num(h.sleep), 1)}${esc(t('unit.h'))}</span>` : '',
      h && num(h.weight) ? `<span class="pill">${D.ic('scale', 12)} ${D.round(num(h.weight), 1)}${esc(t('unit.kg'))}</span>` : '',
      h && num(h.mood) != null && MOODS[num(h.mood)] ? `<span class="pill">${MOODS[num(h.mood)]}</span>` : '',
      (w.workouts || []).length ? `<span class="pill">${D.ic('dumbbell', 12)} ${(w.workouts || []).map((o) => esc(o.sport || '')).join(', ')}</span>` : '',
    ].filter(Boolean).join('');
    const note = x && x.note ? `<div class="hs-note">${esc(String(x.note))}</div>` : '';
    return `<div class="card hs-ago" data-k="ago">${head}<div class="hs-chips">${chips}</div>${note}
      <button class="btn ghost sm mt-s" data-act="hsDay" data-day="${k}">${esc(t('hs.y.open'))}</button></div>`;
  }
  function renderYear() {
    const f = F(), yr = yearRange(f.y);
    const range = req('range'), me = req('months', { year: f.y }), de = req('days', yr), we = req('whoop', yr);
    let out = yearChips(f) + agoCard();
    const g1 = gate([range, me]);
    out += g1 || `<div class="section-title">${esc(t('hs.y.months'))}</div>` + monthCards(f.y, me.data.months);
    const g2 = gate([de, we]);
    if (g2) return out + (g1 ? '' : g2);
    const days = dayFacts(de), wd = whoopDays(we);
    let max = 0;
    for (const k of Object.keys(days)) max = Math.max(max, habitsOf(days[k]).length);
    const habitLvl = (k) => { const n = habitsOf(days[k]).length; return n && max ? Math.max(1, Math.ceil((n / max) * 4)) : 0; };
    const recLvl = (k) => { const r = wd[k] && wd[k].recovery; return r == null ? null : r >= 67 ? 4 : r >= 50 ? 3 : r >= 34 ? 2 : 1; };
    out += `<div class="card" data-k="hab"><div class="card-head"><div><div class="title">${esc(t('hs.y.habits'))}</div><div class="small muted">${esc(t('hs.y.habitsSub'))} · ${f.y}</div></div></div>${yearHeat(f.y, habitLvl)}</div>`;
    out += `<div class="card" data-k="rec"><div class="card-head"><div><div class="title">${esc(t('hs.y.rec'))}</div><div class="small muted">${esc(t('hs.y.recSub'))}</div></div></div>${yearHeat(f.y, recLvl, 'hs-hm-rec')}</div>`;
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* harakatlar                                                          */
  /* ------------------------------------------------------------------ */
  D.act.hsRetry = () => { for (const [k, e] of cache) if (e.state === 'err') cache.delete(k); D.rerender(); };
  D.act.hsYear = (el) => { F().y = +el.dataset.y; F(); D.saveUi(); D.rerender(); };
  D.act.hsMonth = (el) => { F().m = +el.dataset.m; F(); D.saveUi(); D.rerender(); };
  D.act.hsGoMonth = (el) => { const f = F(); f.y = +el.dataset.y; f.m = +el.dataset.m; F(); D.saveUi(); D.go(VIEW, 'month'); };
  D.act.hsDay = (el) => openDay(el.dataset.day);
  D.act.hsOpenDay = (el) => { const k = el.dataset.day; D.closeModal(); D.ui.viewDate = k >= D.today() ? null : k; D.saveUi(); D.go('today'); };
  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('history', e); D.logError(e); return `<div class="card hs-off"><div class="title">${D.ic('alert')} ${esc(t('error.view'))}</div><pre class="small muted">${esc(e && e.message || e)}</pre></div>`; } };
  function render() {
    let sub = D.sub(VIEW, 'month');
    sub = MOVED[sub] || (SUBS.includes(sub) ? sub : 'month');
    const body = { month: renderMonth, year: renderYear }[sub];
    return `<div class="hs">
      <div class="seg hs-seg">${SUBS.map((x) => `<button type="button" class="${x === sub ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="${x}">${esc(t('hs.sub.' + x))}</button>`).join('')}</div>
      ${safe(body)}
    </div>`;
  }
  function mount(root) {
    // tanlangan chip ko'rinib tursin (faqat gorizontal — sahifani tebratmaymiz)
    for (const sel of ['.hs-years', '.hs-months', '.hs-secs']) {
      const strip = root.querySelector(sel), on = strip && strip.querySelector('.on');
      if (on) strip.scrollLeft = Math.max(0, on.offsetLeft - strip.clientWidth / 2 + on.offsetWidth / 2);
    }
    // joriy yil xaritasi: bugungi ustun o'ng chekkada tursin (kelajak bo'sh kataklar ko'rinmasin)
    for (const el of root.querySelectorAll('.hs-year')) {
      const cell = el.querySelector(`i[title="${D.today()}"]`);
      el.scrollLeft = cell ? Math.max(0, cell.offsetLeft - el.clientWidth + 36) : el.scrollWidth;
    }
  }
  function unmount() { pendingDay = null; }

  D.on('day:changed', () => { for (const [k, e] of cache) if (e.to && e.to >= D.today()) cache.delete(k); });

  D.search.register((q) => {
    if (!q || q.length < 2) return [];
    const out = [];
    for (const x of SUBS) out.push({ label: `${t('nav.history')} › ${t('hs.sub.' + x)}`, sub: t('search.view'), icon: 'clock', go: () => D.go(VIEW, x) });
    out.push({ label: t('hs.search.ago'), sub: t('hs.search.sub'), icon: 'clock', go: () => D.go(VIEW, 'year') });
    return out;
  });

  D.view({ id: VIEW, icon: 'clock', order: 62, nav: true, primary: false, render, mount, unmount });
})();
