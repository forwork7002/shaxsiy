/* =====================================================================
   today.js — Бугун: the daily hub.
   date stepper · task ticker · day ring + prayers · habits · tasks ·
   quick strip (water/caffeine/stack) · daily note · gratitude
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'today.left.n': 'Qolgan {n} ta', 'today.showAll': 'Barchasini ko‘rsatish', 'today.showLess': 'Yig‘ish',
      'today.doneN': 'Bajarilgan {n}', 'today.allDoneShort': 'Bugungi odatlar tugadi',
      'today.wrap': 'Kun yakuni', 'today.nothingLeft': 'Hozircha hammasi joyida',
      'today.ticker': 'VAZIFA',
      'today.ticker.empty': "Bugunga vazifa yo'q — pastda qo'shing",
      'today.ticker.allDone': "✓ Hammasi bajarildi — zo'r kun",
      'today.backToday': 'bugunga qaytish',
      'today.dayRing': 'Kun',
      'today.prayers': 'Namozlar',
      'today.phase.sleeping': 'Uyqu', 'today.phase.morning': 'Tong', 'today.phase.midday': 'Kunduz', 'today.phase.afternoon': 'Tushdan keyin',
      'today.phase.evening': 'Kechqurun', 'today.phase.bedtime': 'Uyqu vaqti', 'today.phase.pastBed': 'Uyqudan kech',
      'today.status.sleeping': '😴 Hali uyqu vaqti', 'today.status.morning': '☀️ Tong — yangi boshlanish', 'today.status.midday': '⚡ Kunduz — davom eting',
      'today.status.afternoon': "🔥 Tushdan keyin — zo'r bering", 'today.status.evening': '⏳ Kechqurun — yakunlang', 'today.status.bedtime': '🌙 Uyqu vaqti yaqin',
      'today.status.pastBed': "⚠️ Uyqu vaqti o'tdi",
      'today.untilWake': "uyg'onishgacha {t}", 'today.awakeLeft': 'faol kun: {t} qoldi', 'today.sleepNow': 'Uxlang!',
      'today.nextPrayer': 'Keyingi namoz', 'today.left': '{t} qoldi',
      'today.pr.jamaat': 'jamoat', 'today.pr.alone': "yolg'iz", 'today.pr.qaza': 'qazo', 'today.pr.missed': 'qoldirildi',
      'today.habits': 'Odatlar', 'today.balance': 'Muvozanat',
      'today.notDue': '{n} ta odat bugun rejalashtirilmagan',
      'today.noHabits': "Odat yo'q — Sozlash bo'limidan qo'shing",
      'today.habitsDone': 'hammasi bajarildi',
      'today.tasks': 'Vazifalar', 'today.tasksNone': "vazifa yo'q", 'today.tasksAllDone': "hammasi bajarildi — zo'r kun",
      'today.tasksEmpty': "Bugunga vazifa yo'q — pastda qo'shing",
      'today.addTask': "Vazifa qo'shish…", 'today.overdue': 'kechikkan',
      'today.pushTomorrow': "Ertaga o'tkazish", 'today.pushAll': "Qolganini ertaga o'tkazish",
      'today.pushed': "Ertaga o'tkazildi", 'today.pushedN': "{n} ta vazifa ertaga o'tkazildi",
      'today.tomorrow': 'Ertaga rejalashtirish', 'today.tomorrowSub': 'Kechqurun yozing — ertaga faollashadi',
      'today.planned': '{n} ta reja', 'today.tomorrowEmpty': "Ertaga uchun hali reja yo'q", 'today.addTomorrow': 'Ertaga uchun vazifa…',
      'today.showMore': "Yana {n} ta ko'rsatish", 'today.showLess': "Kamroq ko'rsatish",
      'today.lockedTitle': 'Ertaga faollashadi', 'today.taskDeleted': "Vazifa o'chirildi",
      'today.water': 'Suv', 'today.caffeine': 'Kofein', 'today.stack': "Qo'shimchalar",
      'today.note': 'Kunlik tahlil', 'today.notePh': 'Bugungi kun haqida qisqacha…', 'today.words': "{n} so'z",
      'today.gratitude': 'Shukr', 'today.gratPh': 'Bugun nimaga shukr qilasiz?', 'today.gratEmpty': 'Bugun hali shukr yozilmagan',
      'today.gratEarlier': 'Ilgari yozilgan', 'today.gratOnThisDay': 'Shu kuni', 'today.gratDeleted': "Shukr yozuvi o'chirildi",
      'today.searchHabit': 'Odat', 'today.searchTask': 'Vazifa',
      'today.marked': 'Belgilandi: {name}', 'today.unmarked': 'Bekor qilindi: {name}',
    },
    uzk: {
      'today.left.n': 'Қолган {n} та', 'today.showAll': 'Барчасини кўрсатиш', 'today.showLess': 'Йиғиш',
      'today.doneN': 'Бажарилган {n}', 'today.allDoneShort': 'Бугунги одатлар тугади',
      'today.wrap': 'Кун якуни', 'today.nothingLeft': 'Ҳозирча ҳаммаси жойида',
      'today.ticker': 'ВАЗИФА',
      'today.ticker.empty': 'Бугунга вазифа йўқ — пастда қўшинг',
      'today.ticker.allDone': '✓ Ҳаммаси бажарилди — зўр кун',
      'today.backToday': 'бугунга қайтиш',
      'today.dayRing': 'Кун',
      'today.prayers': 'Намозлар',
      'today.phase.sleeping': 'Уйқу', 'today.phase.morning': 'Тонг', 'today.phase.midday': 'Кундуз', 'today.phase.afternoon': 'Тушдан кейин',
      'today.phase.evening': 'Кечқурун', 'today.phase.bedtime': 'Уйқу вақти', 'today.phase.pastBed': 'Уйқудан кеч',
      'today.status.sleeping': '😴 Ҳали уйқу вақти', 'today.status.morning': '☀️ Тонг — янги бошланиш', 'today.status.midday': '⚡ Кундуз — давом этинг',
      'today.status.afternoon': '🔥 Тушдан кейин — зўр беринг', 'today.status.evening': '⏳ Кечқурун — якунланг', 'today.status.bedtime': '🌙 Уйқу вақти яқин',
      'today.status.pastBed': '⚠️ Уйқу вақти ўтди',
      'today.untilWake': 'уйғонишгача {t}', 'today.awakeLeft': 'фаол кун: {t} қолди', 'today.sleepNow': 'Ухланг!',
      'today.nextPrayer': 'Кейинги намоз', 'today.left': '{t} қолди',
      'today.pr.jamaat': 'жамоат', 'today.pr.alone': 'ёлғиз', 'today.pr.qaza': 'қазо', 'today.pr.missed': 'қолдирилди',
      'today.habits': 'Одатлар', 'today.balance': 'Мувозанат',
      'today.notDue': '{n} та одат бугун режалаштирилмаган',
      'today.noHabits': 'Одат йўқ — Созлаш бўлимидан қўшинг',
      'today.habitsDone': 'ҳаммаси бажарилди',
      'today.tasks': 'Вазифалар', 'today.tasksNone': 'вазифа йўқ', 'today.tasksAllDone': 'ҳаммаси бажарилди — зўр кун',
      'today.tasksEmpty': 'Бугунга вазифа йўқ — пастда қўшинг',
      'today.addTask': 'Вазифа қўшиш…', 'today.overdue': 'кечиккан',
      'today.pushTomorrow': 'Эртага ўтказиш', 'today.pushAll': 'Қолганини эртага ўтказиш',
      'today.pushed': 'Эртага ўтказилди', 'today.pushedN': '{n} та вазифа эртага ўтказилди',
      'today.tomorrow': 'Эртага режалаштириш', 'today.tomorrowSub': 'Кечқурун ёзинг — эртага фаоллашади',
      'today.planned': '{n} та режа', 'today.tomorrowEmpty': 'Эртага учун ҳали режа йўқ', 'today.addTomorrow': 'Эртага учун вазифа…',
      'today.showMore': 'Яна {n} та кўрсатиш', 'today.showLess': 'Камроқ кўрсатиш',
      'today.lockedTitle': 'Эртага фаоллашади', 'today.taskDeleted': 'Вазифа ўчирилди',
      'today.water': 'Сув', 'today.caffeine': 'Кофеин', 'today.stack': 'Қўшимчалар',
      'today.note': 'Кунлик таҳлил', 'today.notePh': 'Бугунги кун ҳақида қисқача…', 'today.words': '{n} сўз',
      'today.gratitude': 'Шукр', 'today.gratPh': 'Бугун нимага шукр қиласиз?', 'today.gratEmpty': 'Бугун ҳали шукр ёзилмаган',
      'today.gratEarlier': 'Илгари ёзилган', 'today.gratOnThisDay': 'Шу куни', 'today.gratDeleted': 'Шукр ёзуви ўчирилди',
      'today.searchHabit': 'Одат', 'today.searchTask': 'Вазифа',
      'today.marked': 'Белгиланди: {name}', 'today.unmarked': 'Бекор қилинди: {name}',
    },
    ru: {
      'today.left.n': 'Осталось {n}', 'today.showAll': 'Показать все', 'today.showLess': 'Свернуть',
      'today.doneN': 'Выполнено {n}', 'today.allDoneShort': 'Привычки на сегодня закрыты',
      'today.wrap': 'Итог дня', 'today.nothingLeft': 'Пока всё в порядке',
      'today.ticker': 'ЗАДАЧИ',
      'today.ticker.empty': 'На сегодня задач нет — добавьте ниже',
      'today.ticker.allDone': '✓ Всё выполнено — отличный день',
      'today.backToday': 'вернуться к сегодня',
      'today.dayRing': 'День',
      'today.prayers': 'Намазы',
      'today.phase.sleeping': 'Сон', 'today.phase.morning': 'Утро', 'today.phase.midday': 'Полдень', 'today.phase.afternoon': 'После обеда',
      'today.phase.evening': 'Вечер', 'today.phase.bedtime': 'Ко сну', 'today.phase.pastBed': 'Пора спать',
      'today.status.sleeping': '😴 Ещё время сна', 'today.status.morning': '☀️ Утро — свежий старт', 'today.status.midday': '⚡ Полдень — продолжайте',
      'today.status.afternoon': '🔥 После обеда — поднажмите', 'today.status.evening': '⏳ Вечер — завершайте', 'today.status.bedtime': '🌙 Скоро спать',
      'today.status.pastBed': '⚠️ Время сна прошло',
      'today.untilWake': 'до подъёма {t}', 'today.awakeLeft': 'активный день: осталось {t}', 'today.sleepNow': 'Спать!',
      'today.nextPrayer': 'Следующий намаз', 'today.left': 'осталось {t}',
      'today.pr.jamaat': 'джамаат', 'today.pr.alone': 'один', 'today.pr.qaza': 'каза', 'today.pr.missed': 'пропущен',
      'today.habits': 'Привычки', 'today.balance': 'Баланс',
      'today.notDue': 'Не по расписанию сегодня: {n}',
      'today.noHabits': 'Привычек нет — добавьте в Настройках',
      'today.habitsDone': 'всё выполнено',
      'today.tasks': 'Задачи', 'today.tasksNone': 'нет задач', 'today.tasksAllDone': 'всё выполнено — отличный день',
      'today.tasksEmpty': 'На сегодня задач нет — добавьте ниже',
      'today.addTask': 'Добавить задачу…', 'today.overdue': 'просрочено',
      'today.pushTomorrow': 'Перенести на завтра', 'today.pushAll': 'Остальное — на завтра',
      'today.pushed': 'Перенесено на завтра', 'today.pushedN': 'Перенесено на завтра: {n}',
      'today.tomorrow': 'План на завтра', 'today.tomorrowSub': 'Напишите вечером — активируется завтра',
      'today.planned': 'в плане: {n}', 'today.tomorrowEmpty': 'На завтра пока ничего не запланировано', 'today.addTomorrow': 'Задача на завтра…',
      'today.showMore': 'Показать ещё {n}', 'today.showLess': 'Свернуть',
      'today.lockedTitle': 'Активируется завтра', 'today.taskDeleted': 'Задача удалена',
      'today.water': 'Вода', 'today.caffeine': 'Кофеин', 'today.stack': 'Добавки',
      'today.note': 'Дневной анализ', 'today.notePh': 'Коротко о сегодняшнем дне…', 'today.words': 'слов: {n}',
      'today.gratitude': 'Благодарность', 'today.gratPh': 'За что вы благодарны сегодня?', 'today.gratEmpty': 'Сегодня записей ещё нет',
      'today.gratEarlier': 'Из прошлых записей', 'today.gratOnThisDay': 'В этот день', 'today.gratDeleted': 'Запись удалена',
      'today.searchHabit': 'Привычка', 'today.searchTask': 'Задача',
      'today.marked': 'Отмечено: {name}', 'today.unmarked': 'Снято: {name}',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants                                                           */
  /* ------------------------------------------------------------------ */
  // "contains" match on the normalised (translit) habit name; asr keeps a word boundary (nasr, kasr, asrlar…)
  const PRAYER_RX = {
    bomdod: /(bomdod|fajr|fadjr)/, peshin: /(peshin|zuhr|zuxr)/, asr: /\basr\b/,
    shom: /(shom|maghrib|magrib)/, xufton: /(xufton|isha)/,
  };
  const PRAYER_CYCLE = [null, 'jamaat', 'alone', 'qaza', 'missed'];
  // sunrise → night palette for the day ring (pct → rgb), lerped per channel
  const RING_PALETTE = [[0, [255, 216, 158]], [12.5, [255, 205, 121]], [25, [255, 227, 143]], [37.5, [255, 183, 106]], [50, [255, 149, 89]],
    [62.5, [243, 111, 79]], [75, [226, 93, 122]], [87.5, [123, 91, 176]], [100, [47, 58, 102]]];
  const RING_R = 52, RING_C = 2 * Math.PI * RING_R;
  const CORE_SPHERES = ['ruh', 'aql', 'qalb', 'tana'];
  const FOLD = 5; // tasks shown before "show more"

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const key = () => { const td = D.today(), v = D.ui.viewDate; return v && v < td ? v : td; };
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) {} };
  const findTask = (id) => D.S.tasks.find((x) => x.id === id);
  const findHabit = (id) => D.S.habits.find((x) => x.id === id);
  const sphereOf = (h) => (D.SPHERE_IDS.includes(h.sphere) ? h.sphere : 'boshqa'); // never trust the id inside a style attr
  const words = (s) => ((s || '').trim().match(/\S+/g) || []).length;
  const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('today', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };

  function logHas(k, id) { return (D.S.logs[k] || []).includes(id); }
  function setLog(k, id, on) {
    const arr = D.S.logs[k] || [];
    const i = arr.indexOf(id);
    if (on && i < 0) arr.push(id);
    if (!on && i >= 0) arr.splice(i, 1);
    if (arr.length) D.S.logs[k] = arr; else delete D.S.logs[k];
  }

  // prayer ↔ habit map, memoised on the habit list signature
  let phCache = { sig: null, map: {}, rev: {} };
  function prayerHabits() {
    const sig = D.S.habits.map((h) => h.id + ':' + h.name + ':' + (h.active ? 1 : 0)).join('|');
    if (sig !== phCache.sig) {
      const map = {}, rev = {};
      for (const h of D.S.habits) {
        if (!h.active) continue;
        const n = D.translit.norm(h.name);
        for (const p of D.PRAYERS) if (!map[p] && PRAYER_RX[p].test(n)) { map[p] = h.id; rev[h.id] = p; break; }
      }
      phCache = { sig, map, rev };
    }
    return phCache;
  }
  function setPrayer(k, id, v, opts = {}) {
    const o = D.S.prayers[k] || { bomdod: null, peshin: null, asr: null, shom: null, xufton: null };
    o[id] = v || null;
    if (D.PRAYERS.every((p) => !o[p])) delete D.S.prayers[k]; else D.S.prayers[k] = o;
    if (!opts.noHabit) { const hid = prayerHabits().map[id]; if (hid) { const h = findHabit(hid); if (h && !(h.target && h.target.n)) setLog(k, hid, !!v && v !== 'missed'); } }
  }
  // habit ticked in the checklist → mirror to prayer state
  function syncPrayerFromHabit(k, hid, on) {
    const p = prayerHabits().rev[hid];
    if (!p) return;
    const cur = (D.S.prayers[k] || {})[p] || null;
    if (on && !cur) setPrayer(k, p, 'alone', { noHabit: true });
    else if (!on && cur && cur !== 'missed') setPrayer(k, p, null, { noHabit: true });
  }

  // streak memo: recomputed only when state changed (updatedAt) or the day rolled
  let stCache = { sig: null, m: {} };
  function streakOf(h) {
    const sig = (D.S.meta.updatedAt || 0) + '|' + D.today();
    if (stCache.sig !== sig) stCache = { sig, m: {} };
    if (stCache.m[h.id] === undefined) stCache.m[h.id] = D.habitStreak(h);
    return stCache.m[h.id];
  }

  // tasks that belong to a day: dated that day, plus undone older ones (overdue)
  function tasksFor(k) {
    const out = [];
    for (const x of D.S.tasks) { if (!x.date) continue; if (x.date === k || (x.date < k && !x.done)) out.push(x); }
    // pending first; the day's own tasks above the overdue backlog; important first; newer overdue first
    const rank = (x) => (x.done ? 4 : x.date === k ? 0 : 2);
    out.sort((a, b) => rank(a) - rank(b) || (b.priority || 2) - (a.priority || 2) || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* 1. date stepper                                                     */
  /* ------------------------------------------------------------------ */
  function dateNav(k, today) {
    let hint = '';
    if (today) hint = t('common.today'); else if (k === D.addDays(D.today(), -1)) hint = t('common.yesterday');
    const hij = D.hijri ? D.hijri.fmt(k) : '';
    return `<div class="date-nav td-nav">
      <button class="btn ghost sq" data-act="tdShift" data-n="-1" aria-label="${esc(t('btn.back'))}">${D.ic('chevL')}</button>
      <div class="label">${esc(D.fmtDate(k, 'weekday'))}
        <span class="sub">${esc(hij)}${hint ? ` · ${esc(hint)}` : ''}</span>
        ${today ? '' : `<button class="td-return" data-act="tdToday">${D.ic('undo', 12)} ${esc(t('today.backToday'))}</button>`}
      </div>
      <button class="btn ghost sq" data-act="tdShift" data-n="1" ${today ? 'disabled' : ''} aria-label="${esc(t('btn.today'))}">${D.ic('chevR')}</button>
    </div>`;
  }
  D.act.tdShift = (el) => {
    const nk = D.addDays(key(), +el.dataset.n || 0);
    if (nk > D.today()) return;
    D.ui.viewDate = nk === D.today() ? null : nk;
    D.saveUi(); D.rerender();
  };
  D.act.tdToday = () => { D.ui.viewDate = null; D.saveUi(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* 2. ticker                                                           */
  /* ------------------------------------------------------------------ */
  let tickTimer = null, fadeTimer = null, cycle = 0;
  function tickerItems(k) {
    const list = tasksFor(k), total = list.length;
    let done = 0, overdue = 0;
    for (const x of list) { if (x.done) done++; else if (x.date < k) overdue++; }
    if (!total) return { items: [{ s: 'empty', text: t('today.ticker.empty') }], done, total, overdue };
    if (done === total) return { items: [{ s: 'done', text: t('today.ticker.allDone') }], done, total, overdue };
    return { items: list.filter((x) => !x.done).map((x) => ({ s: 'pending', text: x.text })), done, total, overdue };
  }
  const glyph = (s) => (s === 'done' ? '✓' : s === 'pending' ? '○' : '·');
  const rowHtml = (it) => `<span class="ticker-status" data-s="${it.s}">${glyph(it.s)}</span><span class="ticker-text">${esc(it.text)}</span>`;
  function ticker(k) {
    const { items, done, total, overdue } = tickerItems(k);
    return `<div class="ticker ${overdue ? 'urgent' : ''}" aria-live="polite" aria-atomic="true">
      <span class="ticker-led"></span><span class="ticker-label">${esc(t('today.ticker'))}</span>
      <div class="ticker-stage"><div class="ticker-row" id="tdTickRow">${rowHtml(items[0])}</div></div>
      <span class="ticker-meta" id="tdTickMeta">${done}/${total}</span></div>`;
  }
  function tickerTick(first) {
    const row = document.getElementById('tdTickRow');
    if (!row) return;
    const { items, done, total } = tickerItems(key());
    if (cycle >= items.length) cycle = 0;
    const it = items[cycle];
    const apply = () => {
      row.innerHTML = rowHtml(it);
      row.classList.remove('fade');
      const m = document.getElementById('tdTickMeta');
      if (m) m.textContent = done + '/' + total;
    };
    if (first || items.length === 1) apply();
    else { row.classList.add('fade'); clearTimeout(fadeTimer); fadeTimer = setTimeout(apply, 220); }
    cycle = (cycle + 1) % items.length;
  }
  function startTicker() { stopTicker(); cycle = 0; tickerTick(true); tickTimer = setInterval(() => tickerTick(false), 5000); }
  function stopTicker() { clearInterval(tickTimer); clearTimeout(fadeTimer); tickTimer = fadeTimer = null; }

  /* ------------------------------------------------------------------ */
  /* 3. day card: day ring + prayers                                     */
  /* ------------------------------------------------------------------ */
  function lerpColor(pct) {
    const P = RING_PALETTE;
    const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
    if (pct <= 0) return rgb(P[0][1]);
    if (pct >= 100) return rgb(P[P.length - 1][1]);
    for (let i = 1; i < P.length; i++) {
      if (pct <= P[i][0]) {
        const [a, ca] = P[i - 1], [b, cb] = P[i], f = (pct - a) / (b - a);
        return rgb(ca.map((v, j) => Math.round(v + (cb[j] - v) * f)));
      }
    }
    return rgb(P[P.length - 1][1]);
  }
  function dayState() {
    const st = D.S.settings;
    let wake = +st.wakeHour, sleep = +st.sleepHour;
    if (!(wake >= 0 && wake < 24)) wake = 6;
    if (!(sleep > 0 && sleep <= 24)) sleep = 23;
    if (sleep <= wake) sleep += 24; // bedtime after midnight
    const p = D.nowTz();
    let hours = p.h + p.min / 60 + p.s / 3600;
    if (sleep > 24 && hours < wake && hours + 24 < sleep) hours += 24; // still awake after midnight
    const clock = D.fmtTime(p.h, p.min);
    const base = { clock, wake, sleep: sleep % 24 };
    if (hours < wake) return { ...base, off: RING_C, color: 'var(--text4)', pctTxt: '—', phase: 'sleeping', remain: t('today.untilWake', { t: D.fmtMins((wake - hours) * 60) }) };
    if (hours >= sleep) return { ...base, off: 0, color: 'rgb(226,93,122)', pctTxt: '100%', phase: 'pastBed', remain: t('today.sleepNow') };
    const pct = D.clamp(((hours - wake) / (sleep - wake)) * 100, 0, 100);
    const phase = pct < 25 ? 'morning' : pct < 50 ? 'midday' : pct < 75 ? 'afternoon' : pct < 90 ? 'evening' : 'bedtime';
    return { ...base, off: RING_C * (1 - pct / 100), color: lerpColor(pct), pctTxt: Math.floor(pct) + '%', phase, remain: t('today.awakeLeft', { t: D.fmtMins((sleep - hours) * 60) }) };
  }
  function ringHtml() {
    const s = dayState();
    return `<div class="td-ring" style="--c:${s.color}">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="td-ring-track" cx="60" cy="60" r="${RING_R}"/>
          <circle class="td-ring-fill" cx="60" cy="60" r="${RING_R}" style="stroke-dasharray:${RING_C.toFixed(2)};stroke-dashoffset:${s.off.toFixed(2)}"/></svg>
        <div class="td-ring-val"><div class="td-ring-pct num">${s.pctTxt}</div><div class="td-ring-phase">${esc(t('today.phase.' + s.phase))}</div><div class="td-ring-clock num">${s.clock}</div></div>
      </div>
      <div class="td-ring-side">
        <div class="td-ring-status">${esc(t('today.status.' + s.phase))}</div>
        <div class="td-ring-remain num">${esc(s.remain)}</div>
        <div class="td-ring-hours num">${D.fmtTime(s.wake, 0)} – ${D.fmtTime(s.sleep, 0)}</div>
      </div>`;
  }
  function nextHtml() {
    let nx = null;
    try { nx = D.prayer ? D.prayer.next() : null; } catch (e) { nx = null; }
    if (!nx) return '';
    return `<div class="td-next">
      <span class="td-next-ic">${D.ic('mosque', 16)}</span>
      <div class="td-next-body"><div class="eyebrow">${esc(t('today.nextPrayer'))}</div>
        <div class="td-next-name">${esc(t('prayer.' + nx.id))} <span class="num muted">${nx.time}</span></div></div>
      <span class="pill good num">${esc(t('today.left', { t: D.fmtMins(nx.minsLeft) }))}</span></div>`;
  }
  function prayersHtml(k) {
    const pr = D.S.prayers[k] || {};
    let times = null;
    try { times = D.prayer ? D.prayer.times(k) : null; } catch (e) { times = null; }
    const n = D.PRAYERS.filter((id) => pr[id] && pr[id] !== 'missed').length;
    return `<div class="td-pr-head"><span class="eyebrow">${esc(t('today.prayers'))}</span><span class="num small muted">${n}/5</span></div>
      <div class="td-prayers">${D.PRAYERS.map((id) => {
        const s = pr[id] || null;
        return `<button class="td-pr ${s ? 'on s-' + s : ''}" data-act="tdPrayer" data-id="${id}" aria-pressed="${s ? 'true' : 'false'}">
          <span class="td-pr-name">${esc(t('prayer.' + id))}</span>
          <span class="td-pr-sub num">${s ? esc(t('today.pr.' + s)) : times ? D.prayer.fmt(times[id]) : '—'}</span></button>`;
      }).join('')}</div>`;
  }
  // WHOOP readiness — only for today, and only once the watch has actually reported a recovery score.
  function readyHtml(k) {
    if (k !== D.today() || !D.whoop || !D.whoop.readiness) return '';
    const r = D.whoop.readiness();
    if (!r) return '';
    const side = [];
    if (r.sleepH != null) side.push(`<span>${esc(t('wh.sleepH'))}<b>${r.sleepH}${esc(t('unit.h'))}</b></span>`);
    if (r.strain != null) side.push(`<span>${esc(t('wh.strain'))}<b>${r.strain}</b></span>`);
    return `<button class="wh-ready ${r.zone}" data-act="go" data-view="health" data-sub="whoop">
      <span class="wh-ready-num">${r.pct}<small>%</small></span>
      <span class="wh-ready-body"><span class="wh-ready-label">${esc(t('wh.ready'))} · WHOOP</span><span class="wh-ready-text">${esc(r.label)}</span></span>
      ${side.length ? `<span class="wh-ready-side">${side.join('')}</span>` : ''}</button>`;
  }
  function dayCard(k) {
    return `<div class="hero td-hero"><div class="td-day-grid">
      <div class="td-dayring" id="tdDayRing">${ringHtml()}</div>
      <div class="td-day-right"><div id="tdNext">${nextHtml()}</div>${prayersHtml(k)}</div>
    </div></div>${readyHtml(k)}`;
  }
  D.act.tdPrayer = (el) => {
    const k = key(), id = el.dataset.id;
    if (!D.PRAYERS.includes(id)) return;
    const cur = (D.S.prayers[k] || {})[id] || null;
    setPrayer(k, id, PRAYER_CYCLE[(PRAYER_CYCLE.indexOf(cur) + 1) % PRAYER_CYCLE.length]);
    haptic(); D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* 4. habits                                                           */
  /* ------------------------------------------------------------------ */
  function habitRow(h, on, counts) {
    const q = h.target && h.target.n ? +h.target.n : 0;
    const st = on ? streakOf(h) : 0;
    const n = q ? +counts[h.id] || 0 : 0;
    const sp = sphereOf(h);
    const streak = st > 1 ? `<span class="streak" title="${esc(t('common.streak'))}">${D.ic('fire', 12)}${st}</span>` : '';
    const tag = `<span class="tag" style="--c:var(--${sp})">${esc(t('sphere.' + sp))}</span>`;
    if (q) {
      return `<div class="li td-hab ${on ? 'done' : ''}">
        <i class="chk ${on ? 'on' : ''}" aria-hidden="true"></i>
        <div class="li-body"><div class="li-text">${esc(h.name)}</div><div class="li-meta">${tag}${esc(h.target.unit || '')}</div></div>
        ${streak}
        <div class="td-step">
          <button class="td-step-btn" data-act="tdCount" data-id="${esc(h.id)}" data-d="-1" aria-label="−">${D.ic('minus', 14)}</button>
          <span class="td-step-val num">${n}<small>/${q}</small></span>
          <button class="td-step-btn" data-act="tdCount" data-id="${esc(h.id)}" data-d="1" aria-label="+">${D.ic('plus', 14)}</button>
        </div></div>`;
    }
    return `<div class="li tap td-hab ${on ? 'done' : ''}" data-act="tdHabit" data-id="${esc(h.id)}" role="checkbox" tabindex="0" aria-checked="${on ? 'true' : 'false'}">
      <i class="chk ${on ? 'on' : ''}" aria-hidden="true"></i>
      <div class="li-body"><div class="li-text">${esc(h.name)}</div></div>
      ${streak}${tag}</div>`;
  }
  function habitsCard(k) {
    const due = D.dueHabits(k), active = D.activeHabits();
    const logs = new Set(D.S.logs[k] || []), counts = D.S.counts[k] || {};
    const isDone = (h) => (h.target && h.target.n ? (+counts[h.id] || 0) >= +h.target.n : logs.has(h.id));
    const sph = {};
    let done = 0;
    for (const h of due) {
      const d = isDone(h), sp = sphereOf(h);
      if (d) done++;
      const s = sph[sp] || (sph[sp] = { t: 0, d: 0 });
      s.t++; if (d) s.d++;
    }
    const total = due.length, pct = total ? Math.round((done / total) * 100) : 0;
    const all = total > 0 && done === total;

    const bars = D.SPHERE_IDS.filter((id) => sph[id]).map((id) => {
      const s = sph[id], p = Math.round((s.d / s.t) * 100);
      return `<div class="sph"><span class="nm">${esc(t('sphere.' + id))}</span><span class="bar"><i class="bar-fill" style="width:${p}%;background:var(--${id})"></i></span><span class="n">${s.d}/${s.t}</span></div>`;
    }).join('');

    let balance = null;
    const ratios = CORE_SPHERES.filter((id) => sph[id]).map((id) => sph[id].d / sph[id].t);
    if (ratios.length >= 2) {
      const mean = D.avg(ratios);
      if (mean > 0) { const sd = Math.sqrt(D.avg(ratios.map((r) => (r - mean) ** 2))); balance = Math.round(D.clamp(1 - sd / mean, 0, 1) * 100); }
      else balance = 0;
    }

    // Research on habit apps is blunt: a wall of 28 rows is why people stop opening the app.
    // Show what is still LEFT (capped), keep the finished ones and the overflow one tap away.
    const CAP = 6;
    const left = due.filter((h) => !isDone(h));
    const finished = due.filter((h) => isDone(h));
    const showAll = !!D.ui.collapsed.tdHabitsAll;
    const showDone = !!D.ui.collapsed.tdHabitsDone;
    const shown = showAll ? left : left.slice(0, CAP);
    const hidden = left.length - shown.length;

    let rows = '';
    if (!due.length) rows = `<div class="empty">${esc(t('today.noHabits'))}</div>`;
    else if (!left.length) rows = `<div class="td-alldone">${D.ic('check', 18)}<span>${esc(t('today.allDoneShort'))}</span></div>`;
    else rows = shown.map((h) => habitRow(h, false, counts)).join('');

    if (hidden > 0) rows += `<button class="td-more" data-act="tdHabitsAll">${D.ic('chevD', 15)} ${esc(t('today.left.n', { n: hidden }))}</button>`;
    else if (showAll && left.length > CAP) rows += `<button class="td-more" data-act="tdHabitsAll">${D.ic('chevD', 15)} ${esc(t('today.showLess'))}</button>`;
    if (finished.length) {
      rows += `<button class="td-more done ${showDone ? 'open' : ''}" data-act="tdHabitsDone">${D.ic('chevD', 15)} ${esc(t('today.doneN', { n: finished.length }))}</button>`;
      if (showDone) rows += finished.map((h) => habitRow(h, true, counts)).join('');
    }
    const notDue = active.length - due.length;

    return `<div class="card td-habits ${all ? 'all-done' : ''}">
      <div class="card-head">
        <div><div class="eyebrow">${esc(t('today.habits'))}</div>
          <div class="kpi"><span class="kpi-num num">${done}</span><span class="kpi-total">/ ${total}</span><span class="kpi-label">${esc(all ? t('today.habitsDone') : t('common.done'))}</span></div></div>
        ${balance !== null ? `<span class="pill td-balance ${balance >= 70 ? 'good' : balance >= 40 ? 'on' : ''}">${D.ic('compass', 12)} ${esc(t('today.balance'))} <b class="num">${balance}</b></span>` : ''}
      </div>
      <div class="ring-row td-ring-row">
        ${D.chart.ring({ pct, size: 96, stroke: 8, color: all ? 'var(--success)' : pct ? 'var(--success)' : 'var(--line3)', glow: pct > 0 })}
        <div class="spheres">${bars || `<div class="small muted">—</div>`}</div>
      </div>
      <div class="list td-hab-list">${rows}</div>
      ${notDue > 0 ? `<div class="td-notdue">${esc(t('today.notDue', { n: notDue }))}</div>` : ''}
    </div>`;
  }
  D.act.tdHabitsAll = () => { D.ui.collapsed.tdHabitsAll = !D.ui.collapsed.tdHabitsAll; D.saveUi(); D.rerender(); };
  D.act.tdHabitsDone = () => { D.ui.collapsed.tdHabitsDone = !D.ui.collapsed.tdHabitsDone; D.saveUi(); D.rerender(); };
  D.act.tdHabit = (el) => {
    const k = key(), id = el.dataset.id, h = findHabit(id);
    if (!h) return;
    const on = !logHas(k, id);
    setLog(k, id, on);
    syncPrayerFromHabit(k, id, on);
    haptic(); D.save(); D.rerender();
  };
  D.act.tdCount = (el) => {
    const k = key(), id = el.dataset.id, h = findHabit(id);
    if (!h || !(h.target && h.target.n)) return;
    const c = D.S.counts[k] || {};
    const n = D.clamp((+c[id] || 0) + (+el.dataset.d || 0), 0, 9999);
    if (n) c[id] = n; else delete c[id];
    if (Object.keys(c).length) D.S.counts[k] = c; else delete D.S.counts[k];
    setLog(k, id, n >= +h.target.n);
    haptic(); D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* 5. tasks                                                            */
  /* ------------------------------------------------------------------ */
  function taskRow(x, k, locked) {
    const overdue = !locked && x.date < k && !x.done;
    return `<div class="li td-task ${x.done ? 'done' : ''} ${x.priority === 3 && !x.done ? 'hl' : ''}">
      <input type="checkbox" class="chk" data-act="tdTask" data-id="${esc(x.id)}" ${x.done ? 'checked' : ''} ${locked ? `disabled title="${esc(t('today.lockedTitle'))}"` : ''} aria-label="${esc(x.text)}">
      <div class="li-body"><div class="li-text td-edit" data-act="tdEdit" data-id="${esc(x.id)}" title="${esc(t('btn.edit'))}">${esc(x.text)}</div>
        ${overdue ? `<div class="li-meta"><span class="pill bad">${esc(t('today.overdue'))} · ${esc(D.fmtDate(x.date, 'dm'))}</span></div>` : ''}</div>
      ${!x.done && !locked ? `<button class="li-del" data-act="tdPush" data-id="${esc(x.id)}" aria-label="${esc(t('today.pushTomorrow'))}" title="${esc(t('today.pushTomorrow'))}">${D.ic('chevR', 16)}</button>` : ''}
      <button class="li-del" data-act="tdTaskDel" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button>
    </div>`;
  }
  function addRow(date, ph, act) {
    return `<div class="input-row td-add"><input class="inp" data-enter="${act}" data-date="${date}" placeholder="${esc(ph)}" autocomplete="off" enterkeyhint="done">
      <button class="btn sq" data-act="${act}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button></div>`;
  }
  function tasksCard(k) {
    const list = tasksFor(k), total = list.length, done = list.filter((x) => x.done).length;
    const all = total > 0 && done === total;
    const expanded = !!D.ui.collapsed.tdTasksOpen;
    const visible = total > FOLD && !expanded ? list.slice(0, FOLD) : list;
    const label = !total ? t('today.tasksNone') : all ? t('today.tasksAllDone') : t('common.done');
    // One segment per task reads as noise past a dozen; beyond that show a plain bar.
    const SEG_MAX = 12;
    const segs = total && total <= SEG_MAX
      ? list.map((x) => `<i class="${x.done ? 'on' : ''}"></i>`).join('')
      : total ? `<i class="on" style="flex:${done || 0.001}"></i><i style="flex:${Math.max(total - done, 0.001)}"></i>` : '';
    const pending = total - done;

    const tk = D.addDays(k, 1);
    const tm = D.S.tasks.filter((x) => x.date === tk);
    const tmState = D.ui.collapsed.tdTomorrow;
    const tmOpen = tmState === undefined ? tm.length > 0 : !tmState;

    return `<div class="card td-tasks ${all ? 'all-done' : ''}">
      <div class="card-head">
        <div><div class="eyebrow">${esc(t('today.tasks'))}</div>
          <div class="kpi"><span class="kpi-num num">${done}</span><span class="kpi-total">/ ${total}</span><span class="kpi-label">${esc(label)}</span></div></div>
        ${pending > 0 ? `<button class="btn ghost sm" data-act="tdPushAll">${D.ic('chevR', 14)} ${esc(t('today.pushAll'))}</button>` : ''}
      </div>
      <div class="segbar">${segs}</div>
      <div class="list">${total ? visible.map((x) => taskRow(x, k, false)).join('') : `<div class="empty">${esc(t('today.tasksEmpty'))}</div>`}</div>
      ${total > FOLD ? `<button class="dashed" data-act="tdMore">${esc(expanded ? t('today.showLess') : t('today.showMore', { n: total - FOLD }))} ${D.ic(expanded ? 'chevD' : 'chevR', 12)}</button>` : ''}
      ${addRow(k, t('today.addTask'), 'tdAddTask')}
      <div class="td-tomorrow">
        <button class="td-tomorrow-head ${tmOpen ? 'open' : ''}" data-act="tdToggleTomorrow" aria-expanded="${tmOpen ? 'true' : 'false'}">
          <span class="td-tomorrow-title"><span class="eyebrow">${esc(t('today.tomorrow'))}</span><span class="td-tomorrow-date">${esc(D.fmtDate(tk, 'weekday'))}</span></span>
          <span class="num small muted">${esc(t('today.planned', { n: tm.length }))}</span>${D.ic('chevD', 16)}</button>
        ${tmOpen ? `<div class="td-tomorrow-sub">${esc(t('today.tomorrowSub'))}</div>
          <div class="list">${tm.length ? tm.map((x) => taskRow(x, k, true)).join('') : `<div class="empty">${esc(t('today.tomorrowEmpty'))}</div>`}</div>
          ${addRow(tk, t('today.addTomorrow'), 'tdAddTask')}` : ''}
      </div>
    </div>`;
  }
  D.act.tdTask = (el) => {
    const x = findTask(el.dataset.id);
    if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    haptic(); D.save(); D.rerender();
  };
  D.act.tdTaskDel = (el) => D.remove(D.S.tasks, el.dataset.id, { label: t('today.taskDeleted') });
  D.act.tdPush = (el) => {
    const x = findTask(el.dataset.id);
    if (!x) return;
    const prev = x.date;
    x.date = D.addDays(key(), 1);
    D.undo.push({ label: t('today.pushed'), undo: () => { x.date = prev; } });
    D.save(); D.rerender();
    D.toast(t('today.pushed'), { undo: () => D.undo.pop() });
  };
  D.act.tdPushAll = () => {
    const k = key(), nk = D.addDays(k, 1);
    const moved = tasksFor(k).filter((x) => !x.done).map((x) => ({ x, prev: x.date }));
    if (!moved.length) return;
    for (const m of moved) m.x.date = nk;
    D.undo.push({ label: t('today.pushedN', { n: moved.length }), undo: () => { for (const m of moved) m.x.date = m.prev; } });
    D.save(); D.rerender();
    D.toast(t('today.pushedN', { n: moved.length }), { undo: () => D.undo.pop() });
  };
  D.act.tdMore = () => { D.ui.collapsed.tdTasksOpen = !D.ui.collapsed.tdTasksOpen; D.saveUi(); D.rerender(); };
  D.act.tdToggleTomorrow = (el) => { D.ui.collapsed.tdTomorrow = el.classList.contains('open'); D.saveUi(); D.rerender(); };
  D.act.tdAddTask = (el) => {
    const inp = el.matches('input') ? el : el.closest('.input-row').querySelector('input');
    const text = (inp.value || '').trim();
    if (!text) return;
    const date = inp.dataset.date || key();
    D.S.tasks.push({ id: D.uid('t'), text, date, done: false, doneAt: null, priority: 2, createdAt: Date.now(), goalId: null });
    inp.value = '';
    D.save(); D.rerender();
    setTimeout(() => { const n = D.$(`input[data-enter="tdAddTask"][data-date="${date}"]`); if (n) n.focus(); }, 0);
  };
  D.act.tdEdit = (el) => {
    if (el.getAttribute('contenteditable') === 'true') return;
    const x = findTask(el.dataset.id);
    if (!x) return;
    const original = x.text;
    let finished = false;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('role', 'textbox');
    el.focus();
    try { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      el.removeEventListener('keydown', onKey); el.removeEventListener('blur', onBlur);
      el.removeAttribute('contenteditable'); el.removeAttribute('role');
      const next = (el.textContent || '').trim();
      if (commit && next && next !== original) { x.text = next; D.save(); D.rerender(); }
      else el.textContent = original;
    };
    const onKey = (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(false); }
    };
    const onBlur = () => finish(true);
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
  };

  /* ------------------------------------------------------------------ */
  /* 6. quick strip                                                      */
  /* ------------------------------------------------------------------ */
  // same target as the Health › Water tab (manual ml, else 35 ml/kg from profile or last logged weight + activity/sex/age bonuses)
  function waterTargetMl() {
    const st = D.S.settings, p = D.S.profile || {};
    const manual = +st.waterTargetMl || 0;
    if (manual > 0) return manual;
    let kg = +p.weightKg || 0;
    if (!kg) {
      let best = '';
      for (const [d, h] of Object.entries(D.S.health || {})) if (h && +h.weight > 0 && d > best) { best = d; kg = +h.weight; }
      if (!kg) kg = 70;
    }
    const act = D.clamp(p.activity === null || p.activity === undefined ? 3 : +p.activity || 0, 0, 5);
    return Math.round(kg * 35 + act * 100 + (p.sex === 'm' ? 200 : 0) + ((+p.age || 0) >= 50 ? 100 : 0));
  }
  function waterInfo(k) {
    const st = D.S.settings;
    const water = +((D.S.health[k] || {}).water) || 0;
    const ml = Math.max(50, +st.waterMl || 250);
    const serv = Math.max(1, Math.ceil(waterTargetMl() / ml));
    return { water, serv, pct: D.clamp((water / serv) * 100, 0, 100), zone: water >= serv ? 'z-good' : water >= serv / 2 ? 'z-warn' : '' };
  }
  const waterBar = (w) => `<i class="bar-fill" style="width:${w.pct.toFixed(0)}%;background:var(--info)"></i>`;
  function quickStrip(k) {
    const w = waterInfo(k);
    const limit = +D.S.settings.caffeineLimit || 400;
    let mg = 0;
    for (const l of (D.S.caffeine && D.S.caffeine.logs) || []) if (l && l.ts && D.dayKey(new Date(l.ts)) === k) mg += +l.mg || 0;
    const cz = mg > limit ? 'z-bad' : mg > limit * 0.75 ? 'z-warn' : mg ? 'z-good' : '';
    const items = (D.S.stack && D.S.stack.items) || [], taken = (D.S.stack && D.S.stack.taken && D.S.stack.taken[k]) || {};
    const tk = items.filter((i) => taken[i.id]).length;
    const sz = items.length ? (tk >= items.length ? 'z-good' : tk ? 'z-warn' : '') : '';
    return `<div class="bento td-quick">
      <div class="bento-tile td-tile td-tile-water b-wide" data-act="go" data-view="health" data-sub="water" role="button" tabindex="0">
        <div class="val"><span id="tdWaterNum">${w.water}</span><span class="td-tile-of">/${w.serv}</span></div>
        <div class="lab">${D.ic('droplet', 12)} ${esc(t('today.water'))}</div>
        <span class="bar thin td-tile-bar" id="tdWaterBar">${waterBar(w)}</span>
        <button class="td-plus" data-act="tdWater" aria-label="+1 ${esc(t('unit.glass'))}">${D.ic('plus', 16)}</button>
      </div>
      <div class="bento-tile td-tile" data-act="go" data-view="health" data-sub="caffeine" role="button" tabindex="0">
        <i class="zone ${cz}"></i>
        <div class="val ${mg > limit ? 'bad' : ''}">${D.fmtNum(mg)}<span class="td-tile-of"> mg</span></div>
        <div class="lab">${D.ic('coffee', 12)} ${esc(t('today.caffeine'))}</div>
        <div class="sub num">/ ${D.fmtNum(limit)}</div>
      </div>
      <div class="bento-tile td-tile" data-act="go" data-view="health" data-sub="stack" role="button" tabindex="0">
        <i class="zone ${sz}"></i>
        <div class="val">${tk}<span class="td-tile-of">/${items.length}</span></div>
        <div class="lab">${D.ic('pill', 12)} ${esc(t('today.stack'))}</div>
        <div class="sub">${esc(t('common.today'))}</div>
      </div>
    </div>`;
  }
  D.act.tdWater = () => {
    const k = key();
    const h = D.S.health[k] || (D.S.health[k] = { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
    h.water = (+h.water || 0) + 1;
    haptic(); D.save();
    const w = waterInfo(k);
    D.patch('tdWaterNum', String(w.water));
    D.patch('tdWaterBar', waterBar(w));
  };

  /* ------------------------------------------------------------------ */
  /* 7. daily note                                                       */
  /* ------------------------------------------------------------------ */
  const saveNote = D.debounce(() => D.save(), 300);
  function noteCard(k) {
    const note = D.S.notes[k] || '';
    return `<div class="card td-note">
      <div class="card-head"><div class="title">${D.ic('edit', 16)} ${esc(t('today.note'))}</div><span class="small muted num" id="tdNoteCount">${esc(t('today.words', { n: words(note) }))}</span></div>
      <textarea class="ta" data-input="tdNote" data-key="${k}" placeholder="${esc(t('today.notePh'))}" rows="4">${esc(note)}</textarea>
    </div>`;
  }
  D.act.tdNote = (el) => {
    const k = el.dataset.key || key();
    const v = el.value || '';
    if (v.trim()) D.S.notes[k] = v; else delete D.S.notes[k];
    saveNote();
    D.patch('tdNoteCount', esc(t('today.words', { n: words(v) })));
  };

  /* ------------------------------------------------------------------ */
  /* 8. gratitude                                                        */
  /* ------------------------------------------------------------------ */
  function gratCard(k) {
    const all = D.S.gratitude || [];
    const today = [];
    for (let i = all.length - 1; i >= 0; i--) if (all[i].date === k) today.push(all[i]);
    let insp = '';
    if (!today.length) {
      // prefer "on this day" (same month-day, another year); else a stable-per-day pick from the rest
      const md = k.slice(5);
      const older = [], same = [];
      for (const g of all) { if (!g.text || g.date === k) continue; older.push(g); if (g.date && g.date.slice(5) === md) same.push(g); }
      const pool = same.length ? same : older;
      if (pool.length) {
        const g = pool[hashStr(k) % pool.length];
        insp = `<div class="td-insp"><div class="eyebrow">${D.ic('sparkles', 11)} ${esc(t(same.length ? 'today.gratOnThisDay' : 'today.gratEarlier'))}${g.date ? ` · ${esc(D.fmtDate(g.date, 'long'))}` : ''}</div><div class="td-insp-text">${esc(g.text)}</div></div>`;
      }
    }
    return `<div class="card td-grat">
      <div class="card-head"><div class="title">${D.ic('hands', 16)} ${esc(t('today.gratitude'))}</div><span class="small muted num">${today.length}</span></div>
      ${insp}
      <div class="list">${today.length ? today.map((g) => `<div class="li"><span class="td-grat-ic">${D.ic('heart', 14)}</span><div class="li-body"><div class="li-text">${esc(g.text)}</div></div>
        <button class="li-del" data-act="tdGratDel" data-id="${esc(g.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>`).join('') : insp ? '' : `<div class="empty">${esc(t('today.gratEmpty'))}</div>`}</div>
      ${addRow(k, t('today.gratPh'), 'tdAddGrat')}
    </div>`;
  }
  D.act.tdAddGrat = (el) => {
    const inp = el.matches('input') ? el : el.closest('.input-row').querySelector('input');
    const text = (inp.value || '').trim();
    if (!text) return;
    D.S.gratitude.push({ id: D.uid('gr'), date: inp.dataset.date || key(), text });
    inp.value = '';
    haptic(); D.save(); D.rerender();
  };
  D.act.tdGratDel = (el) => D.remove(D.S.gratitude, el.dataset.id, { label: t('today.gratDeleted') });

  /* ------------------------------------------------------------------ */
  /* search provider                                                     */
  /* ------------------------------------------------------------------ */
  D.search.register(() => {
    const out = [];
    for (const h of D.activeHabits()) {
      out.push({ label: h.name, sub: t('today.searchHabit'), icon: 'checkSq', go: () => {
        const k = D.today();
        let on;
        if (h.target && h.target.n) {
          const c = D.S.counts[k] || (D.S.counts[k] = {});
          c[h.id] = (+c[h.id] || 0) + 1; on = true;
          setLog(k, h.id, c[h.id] >= +h.target.n);
        } else { on = !logHas(k, h.id); setLog(k, h.id, on); syncPrayerFromHabit(k, h.id, on); }
        D.ui.viewDate = null; D.saveUi(); D.save(); D.go('today');
        D.toast(t(on ? 'today.marked' : 'today.unmarked', { name: h.name }));
      } });
    }
    for (const x of D.S.tasks) {
      if (x.done) continue;
      out.push({ label: x.text, sub: t('today.searchTask') + (x.date ? ' · ' + D.fmtDate(x.date) : ''), icon: 'checkSq', go: () => { D.ui.viewDate = null; D.saveUi(); D.go('today'); } });
    }
    return out;
  });

  /* ------------------------------------------------------------------ */
  /* live updates                                                        */
  /* ------------------------------------------------------------------ */
  D.on('tick', () => {
    if (D.current() !== 'today') return;
    try { D.patch('tdDayRing', ringHtml()); D.patch('tdNext', nextHtml()); } catch (e) { console.error(e); }
  });
  D.on('day:changed', () => { D.ui.viewDate = null; D.saveUi(); if (D.current() === 'today') D.rerender(); });
  // keyboard: core delegates clicks only — make the custom habit rows / quick tiles reachable with Enter or Space
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.td-hab[data-act], .td-tile[data-act]')) return;
    ev.preventDefault();
    el.click();
  });

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'today', icon: 'calendar', order: 10, nav: true, primary: true,
    render() {
      const td = D.today();
      if (D.ui.viewDate && D.ui.viewDate >= td) { D.ui.viewDate = null; D.saveUi(); }
      const k = key(), today = k === td;
      // AI advice sits under the day/habits summary — high enough to be read, below the things you act on first.
      const ai = today && D.ai ? safe(() => D.ai.card('today')) : '';
      // Order follows the question "what do I do now?": time → what's left → today's tasks →
      // a compact body row → AI → the end-of-day wrap-up.
      return safe(() => dateNav(k, today)) + safe(() => ticker(k)) + safe(() => dayCard(k)) + safe(() => habitsCard(k)) +
        safe(() => tasksCard(k)) + safe(() => quickStrip(k)) + ai +
        `<div class="section-title">${esc(t('today.wrap'))}</div>` + safe(() => noteCard(k)) + safe(() => gratCard(k));
    },
    mount() { startTicker(); },
    unmount() { stopTicker(); },
  });
})();
