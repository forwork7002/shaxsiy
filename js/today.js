/* =====================================================================
   today.js — Bugun: kunlik tahlil sahifasi.
   sana · WHOOP tayyorlik hero (tiklanish + uyqu/zo'riqish/HRV) · kun chizig'i ·
   namoz · qazo · xulosa plitkalari (vazifa/odat/suv/ovqat) · fokus ro'yxati ·
   WHOOP mashg'ulotlari · AI · kun yakuni (izoh + shukr)
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'today.left.n': 'Qolgan {n} ta', 'today.showAll': 'Barchasini ko‘rsatish', 'today.showLess': 'Yig‘ish',
      'today.doneN': 'Bajarilgan {n}', 'today.allDoneShort': 'Bugungi odatlar tugadi',
      'today.wrap': 'Kun yakuni', 'today.nothingLeft': 'Hozircha hammasi joyida',
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
      'today.water': 'Suv', 'today.workouts': "WHOOP mashg'ulotlari",
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
      'today.water': 'Сув', 'today.workouts': 'WHOOP машғулотлари',
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
      'today.water': 'Вода', 'today.workouts': 'Тренировки WHOOP',
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
  /* Bugun 2.0 — WHOOP tahlili birinchi o'ringa chiqqach kerak bo'lgan qatorlar */
  D.i18n.add({
    uz: {
      'today.state.good': 'TAYYOR', 'today.state.warn': "O'RTACHA", 'today.state.bad': 'DAM OL',
      'today.adv.good': "Bugun {n} gacha zo'riqish ko'tarasiz",
      'today.adv.warn': "{n} atrofida zo'riqish yetarli",
      'today.adv.bad': "Dam oling — {n} dan oshirmang",
      'today.adv.over': "Chegara oshdi ({s}/{n}) — qolgan kun dam",
      'today.d.short': '{h} soat kam', 'today.d.over': '{h} soat ortiq', 'today.d.target': 'chegara {n}',
      'today.d.base': "o'rtachadan {p}", 'today.d.noData': "ma'lumot yo'q",
      'today.debt': '7 kunda {h} soat uyqu qarzi',
      'today.detail': 'Batafsil',
      'today.focus': 'Bugun bajarish kerak', 'today.focusDone': "Bugungi ro'yxat tugadi",
      'today.focusEmpty': "Bugunga vazifa ham, odat ham yo'q",
      'today.leftN': "Qolgan {n} ta", 'today.doneN2': 'Bajarilgan {n} ta',
    },
    uzk: {
      'today.state.good': 'ТАЙЁР', 'today.state.warn': 'ЎРТАЧА', 'today.state.bad': 'ДАМ ОЛ',
      'today.adv.good': 'Бугун {n} гача зўриқиш кўтарасиз',
      'today.adv.warn': '{n} атрофида зўриқиш етарли',
      'today.adv.bad': 'Дам олинг — {n} дан оширманг',
      'today.adv.over': 'Чегара ошди ({s}/{n}) — қолган кун дам',
      'today.d.short': '{h} соат кам', 'today.d.over': '{h} соат ортиқ', 'today.d.target': 'чегара {n}',
      'today.d.base': 'ўртачадан {p}', 'today.d.noData': 'маълумот йўқ',
      'today.debt': '7 кунда {h} соат уйқу қарзи',
      'today.detail': 'Батафсил',
      'today.focus': 'Бугун бажариш керак', 'today.focusDone': 'Бугунги рўйхат тугади',
      'today.focusEmpty': 'Бугунга вазифа ҳам, одат ҳам йўқ',
      'today.leftN': 'Қолган {n} та', 'today.doneN2': 'Бажарилган {n} та',
    },
    ru: {
      'today.state.good': 'ГОТОВ', 'today.state.warn': 'СРЕДНЕ', 'today.state.bad': 'ОТДЫХ',
      'today.adv.good': 'Сегодня выдержите нагрузку до {n}',
      'today.adv.warn': 'Достаточно нагрузки около {n}',
      'today.adv.bad': 'Отдыхайте — не выше {n}',
      'today.adv.over': 'Предел превышен ({s}/{n}) — дальше отдых',
      'today.d.short': 'меньше на {h} ч', 'today.d.over': 'больше на {h} ч', 'today.d.target': 'предел {n}',
      'today.d.base': '{p} от среднего', 'today.d.noData': 'нет данных',
      'today.debt': 'долг сна за 7 дней: {h} ч',
      'today.detail': 'Подробно',
      'today.focus': 'Сегодня нужно сделать', 'today.focusDone': 'Список на сегодня закрыт',
      'today.focusEmpty': 'На сегодня нет ни задач, ни привычек',
      'today.leftN': 'Осталось {n}', 'today.doneN2': 'Выполнено {n}',
    },
  });

  const PRAYER_RX = {
    bomdod: /(bomdod|fajr|fadjr)/, peshin: /(peshin|zuhr|zuxr)/, asr: /\basr\b/,
    shom: /(shom|maghrib|magrib)/, xufton: /(xufton|isha)/,
  };
  const PRAYER_CYCLE = [null, 'jamaat', 'alone', 'qaza', 'missed'];
  // sunrise → night palette for the day ring (pct → rgb), lerped per channel
  const RING_PALETTE = [[0, [255, 216, 158]], [12.5, [255, 205, 121]], [25, [255, 227, 143]], [37.5, [255, 183, 106]], [50, [255, 149, 89]],
    [62.5, [243, 111, 79]], [75, [226, 93, 122]], [87.5, [123, 91, 176]], [100, [47, 58, 102]]];
  const RING_R = 52, RING_C = 2 * Math.PI * RING_R;

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
  // safe() xato o'rniga karta qaytaradi; bu esa qiymat kutilgan joylar uchun
  const safeVal = (fn) => { try { return fn(); } catch (e) { console.error('today', e); return null; } };

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
    if (!opts.noHabit) { const hid = prayerHabits().map[id]; if (hid) { const h = findHabit(hid); if (h && !(h.target && h.target.n)) D.habits.mark(hid, k, !!v && v !== 'missed'); } }
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
    if (hours < wake) return { ...base, pct: 0, off: RING_C, color: 'var(--text4)', pctTxt: '—', phase: 'sleeping', remain: t('today.untilWake', { t: D.fmtMins((wake - hours) * 60) }) };
    if (hours >= sleep) return { ...base, pct: 100, off: 0, color: 'rgb(226,93,122)', pctTxt: '100%', phase: 'pastBed', remain: t('today.sleepNow') };
    const pct = D.clamp(((hours - wake) / (sleep - wake)) * 100, 0, 100);
    const phase = pct < 25 ? 'morning' : pct < 50 ? 'midday' : pct < 75 ? 'afternoon' : pct < 90 ? 'evening' : 'bedtime';
    return { ...base, pct, off: RING_C * (1 - pct / 100), color: lerpColor(pct), pctTxt: Math.floor(pct) + '%', phase, remain: t('today.awakeLeft', { t: D.fmtMins((sleep - hours) * 60) }) };
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
  // Qaza debt is invisible by nature — one line under the day hero keeps it in front of you.
  function qazaHtml(k) {
    if (k !== D.today() || !D.qaza) return '';
    let o, done, tg;
    try { o = D.qaza.owed(); done = D.qaza.paidToday(); tg = D.qaza.target(); } catch (e) { return ''; }
    if (!o.total) return '';
    const met = done >= tg, pct = D.clamp((done / tg) * 100, 0, 100);
    return `<button class="td-qz ${met ? 'met' : ''}" data-act="go" data-view="prayer" data-sub="qaza">
      <i class="td-qz-ic">${D.ic('mosque', 16)}</i>
      <span class="td-qz-body">
        <span class="td-qz-top"><span class="td-qz-label">${esc(t('qz.debtShort'))}</span><span class="td-qz-n num">${D.fmtNum(o.total)}</span></span>
        <span class="bar thin"><i class="bar-fill" style="width:${pct.toFixed(1)}%"></i></span>
      </span>
      <span class="td-qz-side num">${esc(t('qz.ofTarget', { n: done, t: tg }))}${D.ic('chevR', 13)}</span>
    </button>`;
  }
  /* ---------------------------------------------------------------- */
  /* HERO — "tanam bugun qanday?" bitta katta raqam bilan               */
  /* Oura/WHOOP ikkalasi ham shu qoidaga quriladi: tepada bitta ball,    */
  /* ostida bitta oddiy jumla, keyin uchtadan ko'p bo'lmagan ko'rsatkich */
  /* va har birining yonida SHAXSIY o'rtachadan farqi — quruq raqam      */
  /* hech narsa aytmaydi, farq aytadi.                                   */
  /* ---------------------------------------------------------------- */
  const ZONE_COLOR = { good: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger-text)' };
  function kpiHtml(lab, val, delta, zone) {
    return `<div class="td-kpi ${zone || ''}">
      <span class="td-kpi-lab">${esc(lab)}</span>
      <span class="td-kpi-val num">${val}</span>
      <span class="td-kpi-d">${delta ? esc(delta) : esc(t('today.d.noData'))}</span></div>`;
  }
  /** Shu kunning WHOOP kesimi — bugun uchun ham, orqaga qaralgan kun uchun ham. */
  function dayRec(k) {
    if (!(D.S.whoop && D.S.whoop.connected && D.whoop && D.whoop.dayInsight)) return null;
    const i = safeVal(() => D.whoop.dayInsight(k));
    if (!i || i.recovery == null) return null;
    i.zone = i.recovery >= 67 ? 'good' : i.recovery >= 34 ? 'warn' : 'bad';
    return i;
  }
  function heroCard(k) {
    // Tiklanish bali bor kun — WHOOP hero. Bugun bo'lsa-yu bal yo'q bo'lsa (soat
    // ulanmagan yoki hali yubormagan) eski kun halqasi qaytadi, sahifa bo'sh qolmaydi.
    const i = dayRec(k);
    if (!i) return k === D.today() ? `<div class="hero td-hero"><div class="td-dayring" id="tdDayRing">${ringHtml()}</div></div>` : '';
    const today = k === D.today();
    const r = { pct: i.recovery, zone: i.zone, sleepH: i.sleepH, rhr: i.rhr, strain: i.strain,
      label: t(i.zone === 'good' ? 'wh.ready.high' : i.zone === 'warn' ? 'wh.ready.mid' : 'wh.ready.low') };
    const live = today ? safeVal(() => (D.whoop.live ? D.whoop.live() : null)) : null;
    const f = today ? safeVal(() => (D.whoop.freshness ? D.whoop.freshness() : null)) : null;
    const col = ZONE_COLOR[r.zone] || 'var(--line3)';
    const tgt = i.strainTarget != null ? i.strainTarget : null;
    const strain = live && live.strain != null ? live.strain : i.strain != null ? i.strain : r.strain;

    // maslahat — bitta jumla: avval chegaradan oshgani, keyin zona bo'yicha
    let adv;
    if (i.load === 'over' && tgt != null) adv = t('today.adv.over', { s: strain, n: tgt });
    else if (tgt != null) adv = t('today.adv.' + r.zone, { n: tgt });
    else adv = r.label;

    // 1) uyqu — kerakli miqdordan farqi
    let sVal = '—', sD = '', sZ = '';
    if (i.sleepH != null || r.sleepH != null) {
      const h = i.sleepH != null ? i.sleepH : r.sleepH;
      sVal = `${h}<small>${esc(t('unit.h'))}</small>`;
      if (i.gapH != null) {
        sD = i.gapH >= 0 ? t('today.d.over', { h: D.round(i.gapH, 1) }) : t('today.d.short', { h: D.round(-i.gapH, 1) });
        sZ = i.gapH >= -0.5 ? 'z-good' : i.gapH >= -1.5 ? 'z-warn' : 'z-bad';
      } else if (i.perf != null) { sD = i.perf + '%'; sZ = i.perf >= 85 ? 'z-good' : i.perf >= 70 ? 'z-warn' : 'z-bad'; }
    }
    // 2) zo'riqish — tiklanish ruxsat bergan chegaraga nisbatan
    let tVal = '—', tD = '', tZ = '';
    if (strain != null) {
      tVal = `${strain}${live ? '<i class="wh-dot"></i>' : ''}`;
      if (tgt != null) {
        tD = t('today.d.target', { n: tgt });
        tZ = i.load === 'over' ? 'z-bad' : i.load === 'under' ? 'z-warn' : i.load === 'ok' ? 'z-good' : '';
      }
    }
    // 3) HRV — o'z 30 kunlik bazasidan og'ish; HRV yo'q bo'lsa tinch puls
    let hLab = t('wh.hrv'), hVal = '—', hD = '', hZ = '';
    if (i.hrv != null) {
      hVal = `${i.hrv}<small>ms</small>`;
      if (i.hrvPct !== undefined) { hD = t('today.d.base', { p: (i.hrvPct > 0 ? '+' : '') + i.hrvPct + '%' }); hZ = i.hrvPct >= -5 ? 'z-good' : i.hrvPct >= -15 ? 'z-warn' : 'z-bad'; }
    } else if (i.rhr != null || r.rhr != null) {
      hLab = t('wh.rhr'); hVal = `${i.rhr != null ? i.rhr : r.rhr}<small>bpm</small>`;
      if (i.rhrDelta !== undefined) { hD = t('today.d.base', { p: (i.rhrDelta > 0 ? '+' : '') + i.rhrDelta }); hZ = i.rhrDelta <= 1 ? 'z-good' : i.rhrDelta <= 4 ? 'z-warn' : 'z-bad'; }
    }
    // uyqu qarzi ko'zga ko'rinmaydigan narsa — bugun va sezilarli bo'lgandagina bitta qator
    const dbt = today && D.whoop.sleepDebt ? safeVal(() => D.whoop.sleepDebt(7)) : null;
    const foot = dbt && dbt.h >= 2 ? `<div class="td-hero-foot">${D.ic('moon', 12)} ${esc(t('today.debt', { h: dbt.h }))}</div>` : '';

    return `<div class="hero td-ready z-${r.zone}" data-act="go" data-view="health" data-sub="ready" role="button" tabindex="0">
      <div class="td-ready-top">
        ${D.chart.ring({ pct: r.pct, size: 104, stroke: 9, color: col, label: `${r.pct}<small>%</small>`, sub: esc(t('wh.recovery')) })}
        <div class="td-ready-id">
          <div class="eyebrow">WHOOP${f ? ` <span class="td-fresh ${f.stale ? 'stale' : ''}">${esc(f.label)}</span>` : ''}</div>
          <div class="td-ready-state">${esc(t('today.state.' + r.zone))}</div>
          <div class="td-ready-adv">${esc(adv)}</div>
        </div>
        <span class="td-ready-go">${D.ic('chevR', 16)}</span>
      </div>
      <div class="td-kpis">${kpiHtml(t('wh.sleepH'), sVal, sD, sZ)}${kpiHtml(t('wh.strain'), tVal, tD, tZ)}${kpiHtml(hLab, hVal, hD, hZ)}</div>
      ${foot}</div>`;
  }

  /* Kun chizig'i — uyg'onishdan uyquga qadar bitta ingichka qator.       */
  /* Katta halqa endi hero'da tiklanish uchun ishlaydi, vaqt uchun emas.  */
  function stripHtml() {
    const s = dayState();
    return `<div class="td-strip-top">
        <span class="td-strip-clock num">${esc(s.clock)}</span>
        <span class="td-strip-phase">${esc(t('today.phase.' + s.phase))}</span>
        <span class="td-strip-remain num">${esc(s.remain)}</span>
      </div>
      <div class="bar thin td-strip-bar"><i class="bar-fill" style="width:${(s.pct || 0).toFixed(1)}%;background:${s.color}"></i></div>
      <div class="td-strip-foot num"><span>${D.fmtTime(s.wake, 0)}</span><span>${D.fmtTime(s.sleep, 0)}</span></div>`;
  }
  function dayStrip(k) {
    // O'tgan kun uchun soat ma'nosiz; WHOOP yo'q kunda esa hero'ning o'zi kun halqasi —
    // ikkalasi bir xil narsani aytmasligi kerak.
    if (k !== D.today() || !dayRec(k)) return '';
    return `<div class="td-strip" id="tdStrip">${stripHtml()}</div>`;
  }

  function prayerCard(k) {
    return `<div class="card td-pray">${prayersHtml(k)}</div>`;
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
    const name = `<span class="td-hab-emoji" aria-hidden="true">${esc(D.habitEmoji(h))}</span>${esc(h.name)}`;
    if (q) {
      return `<div class="li td-hab ${on ? 'done' : ''}">
        <i class="chk ${on ? 'on' : ''}" aria-hidden="true"></i>
        <div class="li-body"><div class="li-text">${name}</div><div class="li-meta">${tag}${esc(h.target.unit || '')}</div></div>
        ${streak}
        <div class="td-step">
          <button class="td-step-btn" data-act="tdCount" data-id="${esc(h.id)}" data-d="-1" aria-label="−">${D.ic('minus', 14)}</button>
          <span class="td-step-val num">${n}<small>/${q}</small></span>
          <button class="td-step-btn" data-act="tdCount" data-id="${esc(h.id)}" data-d="1" aria-label="+">${D.ic('plus', 14)}</button>
        </div></div>`;
    }
    return `<div class="li tap td-hab ${on ? 'done' : ''}" data-act="tdHabit" data-id="${esc(h.id)}" role="checkbox" tabindex="0" aria-checked="${on ? 'true' : 'false'}">
      <i class="chk ${on ? 'on' : ''}" aria-hidden="true"></i>
      <div class="li-body"><div class="li-text">${name}</div></div>
      ${streak}${tag}</div>`;
  }
  D.act.tdFocusAll = () => { D.ui.collapsed.tdFocusAll = !D.ui.collapsed.tdFocusAll; D.saveUi(); D.rerender(); };
  D.act.tdFocusDone = () => { D.ui.collapsed.tdFocusDone = !D.ui.collapsed.tdFocusDone; D.saveUi(); D.rerender(); };
  D.act.tdHabit = (el) => {
    const k = key(), id = el.dataset.id, h = findHabit(id);
    if (!h) return;
    const on = D.habits.toggle(h, k);
    syncPrayerFromHabit(k, id, on);
    haptic(); D.save(); D.rerender();
  };
  D.act.tdCount = (el) => {
    const k = key(), id = el.dataset.id, h = findHabit(id);
    if (!h || !(h.target && h.target.n)) return;
    D.habits.bump(h, k, +el.dataset.d || 0);
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
  /* ---------------------------------------------------------------- */
  /* FOKUS — odatlar va vazifalar bitta ro'yxatda                       */
  /* Ilgari ikkita karta, ikkita halqa, soha barlari va muvozanat pili   */
  /* bor edi; ularning hammasi Vazifa bo'limida ham bor. Bugun'da esa    */
  /* bitta savolga javob kerak: hozir nima qilishim kerak. Shu sabab     */
  /* bu yerda faqat QOLGANLARI ko'rinadi, ustiga 4 tadan cheklov.        */
  /* ---------------------------------------------------------------- */
  const FOCUS_CAP = 4;
  function habitDoneOn(k) {
    const logs = new Set(D.S.logs[k] || []), counts = D.S.counts[k] || {};
    return (h) => (h.target && h.target.n ? (+counts[h.id] || 0) >= +h.target.n : logs.has(h.id));
  }
  function dayTally(k) {
    const due = D.dueHabits(k), isDone = habitDoneOn(k);
    const tasks = tasksFor(k);
    const hDone = due.filter(isDone).length, tDone = tasks.filter((x) => x.done).length;
    return { due, isDone, tasks, hTotal: due.length, hDone, tTotal: tasks.length, tDone,
      total: due.length + tasks.length, done: hDone + tDone };
  }
  function focusCard(k) {
    const g = dayTally(k), counts = D.S.counts[k] || {};
    const openT = g.tasks.filter((x) => !x.done), doneT = g.tasks.filter((x) => x.done);
    const openH = g.due.filter((h) => !g.isDone(h)), doneH = g.due.filter(g.isDone);
    // vazifalar tepada: ular kunga bog'langan va kechikishi mumkin, odat esa takrorlanadi
    const open = openT.map((x) => taskRow(x, k, false)).concat(openH.map((h) => habitRow(h, false, counts)));
    const closed = doneT.map((x) => taskRow(x, k, false)).concat(doneH.map((h) => habitRow(h, true, counts)));

    const all = g.total > 0 && g.done === g.total;
    const showAll = !!D.ui.collapsed.tdFocusAll, showDone = !!D.ui.collapsed.tdFocusDone;
    const shown = showAll ? open : open.slice(0, FOCUS_CAP);
    const hidden = open.length - shown.length;

    let rows;
    if (!g.total) rows = `<div class="empty">${esc(t('today.focusEmpty'))}</div>`;
    else if (!open.length) rows = `<div class="td-alldone">${D.ic('check', 18)}<span>${esc(t('today.focusDone'))}</span></div>`;
    else rows = shown.join('');
    if (hidden > 0) rows += `<button class="td-more" data-act="tdFocusAll">${D.ic('chevD', 15)} ${esc(t('today.leftN', { n: hidden }))}</button>`;
    else if (showAll && open.length > FOCUS_CAP) rows += `<button class="td-more open" data-act="tdFocusAll">${D.ic('chevD', 15)} ${esc(t('today.showLess'))}</button>`;
    if (closed.length) {
      rows += `<button class="td-more done ${showDone ? 'open' : ''}" data-act="tdFocusDone">${D.ic('chevD', 15)} ${esc(t('today.doneN2', { n: closed.length }))}</button>`;
      if (showDone) rows += closed.join('');
    }

    // bitta bo'g'in bitta ish — o'n ikkitadan oshsa oddiy bar
    const SEG_MAX = 12;
    const bar = g.total
      ? `<div class="segbar">${g.total <= SEG_MAX
          ? Array.from({ length: g.total }, (_, n) => `<i class="${n < g.done ? 'on' : ''}"></i>`).join('')
          : `<i class="on" style="flex:${g.done || 0.001}"></i><i style="flex:${Math.max(g.total - g.done, 0.001)}"></i>`}</div>`
      : '';

    const tk = D.addDays(k, 1);
    const tm = D.S.tasks.filter((x) => x.date === tk);
    const tmState = D.ui.collapsed.tdTomorrow;
    const tmOpen = tmState === undefined ? tm.length > 0 : !tmState;
    const pending = g.tTotal - g.tDone;

    return `<div class="card td-focus ${all ? 'all-done' : ''}">
      <div class="card-head">
        <div><div class="eyebrow">${esc(t('today.focus'))}</div>
          <div class="kpi"><span class="kpi-num num">${g.done}</span><span class="kpi-total">/ ${g.total}</span><span class="kpi-label">${esc(all ? t('today.focusDone') : t('common.done'))}</span></div></div>
        ${pending > 0 ? `<button class="btn ghost sm" data-act="tdPushAll">${D.ic('chevR', 14)} ${esc(t('today.pushAll'))}</button>` : ''}
      </div>
      ${bar}
      <div class="list td-focus-list">${rows}</div>
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
  // water + the food tile (food.js owns the tile; without it the row is water only)
  /* ---------------------------------------------------------------- */
  /* Xulosa plitkalari — to'rtta raqam, hammasi bosiladi                */
  /* Vazifa va Odat ro'yxati Vazifa bo'limida to'liq turadi; bu yerda    */
  /* faqat "qayerdaman" degan raqam va bitta bar qoladi.                 */
  /* ---------------------------------------------------------------- */
  function statTile(o) {
    // `view` berilmasa plitka tugma bo'lmaydi — suv shunday: uni faqat shu yerda yuritamiz
    const nav = o.view ? ` data-act="go" data-view="${o.view}"${o.sub ? ` data-sub="${o.sub}"` : ''} role="button" tabindex="0"` : '';
    return `<div class="bento-tile td-tile ${o.cls || ''}"${nav}>
      ${o.zone ? `<i class="zone ${o.zone}"></i>` : ''}
      <div class="val"${o.valId ? ` id="${o.valId}"` : ''}>${o.val}</div>
      <div class="lab">${o.ic} ${esc(o.lab)}</div>
      <span class="bar thin td-tile-bar"${o.barId ? ` id="${o.barId}"` : ''}><i class="bar-fill" style="width:${D.clamp(o.pct, 0, 100).toFixed(0)}%;background:${o.color}"></i></span>
      ${o.extra || ''}</div>`;
  }
  function statTiles(k) {
    const g = dayTally(k), w = waterInfo(k);
    let food = '';
    try { food = D.food && D.food.tile ? D.food.tile(k) || '' : ''; } catch (e) { console.error('food tile', e); D.logError(e); food = ''; }
    const of = (a, b) => `${a}<span class="td-tile-of">/${b}</span>`;
    return `<div class="bento td-quick">
      ${statTile({ view: 'tasks', lab: t('today.tasks'), ic: D.ic('checkSq', 12), val: of(g.tDone, g.tTotal),
        pct: g.tTotal ? (g.tDone / g.tTotal) * 100 : 0, color: 'var(--success)', zone: g.tTotal && g.tDone === g.tTotal ? 'z-good' : '' })}
      ${statTile({ view: 'tasks', sub: 'week', lab: t('today.habits'), ic: D.ic('fire', 12), val: of(g.hDone, g.hTotal),
        pct: g.hTotal ? (g.hDone / g.hTotal) * 100 : 0, color: 'var(--ruh)', zone: g.hTotal && g.hDone === g.hTotal ? 'z-good' : '' })}
      ${statTile({ cls: 'td-tile-water', lab: t('today.water'), ic: D.ic('droplet', 12), val: of(w.water, w.serv),
        valId: 'tdWaterNum', barId: 'tdWaterBar', pct: w.pct, color: 'var(--info)', zone: w.zone,
        extra: `<button class="td-plus" data-act="tdWater" aria-label="+1 ${esc(t('unit.glass'))}">${D.ic('plus', 16)}</button>` })}
      ${food}
    </div>`;
  }
  // WHOOP workouts of the day — only when the strap is connected and actually recorded something
  function workoutsCard(k) {
    if (!D.whoop || !D.whoop.workoutRows || !D.whoop.workoutsOn) return '';
    if (!(D.S.whoop && D.S.whoop.connected)) return '';
    if (!D.whoop.workoutsOn(k).length) return '';
    const rows = D.whoop.workoutRows(k, { empty: false });
    if (!rows) return '';
    return `<div class="card td-workouts"><div class="card-head"><div class="title">${D.ic('dumbbell', 16)} ${esc(t('today.workouts'))}</div>
      <button class="btn ghost sm" data-act="go" data-view="health" data-sub="strain">${D.ic('chevR', 14)} ${esc(t('nav.health'))}</button></div>${rows}</div>`;
  }
  D.act.tdWater = () => {
    const k = key();
    const h = D.S.health[k] || (D.S.health[k] = { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
    h.water = (+h.water || 0) + 1;
    haptic(); D.save();
    const w = waterInfo(k);
    D.patch('tdWaterNum', `${w.water}<span class="td-tile-of">/${w.serv}</span>`);
    D.patch('tdWaterBar', waterBar(w));
  };

  /* ------------------------------------------------------------------ */
  /* 7. daily note                                                       */
  /* ------------------------------------------------------------------ */
  const saveNote = D.debounce(() => D.save(), 300);
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
  /* ---------------------------------------------------------------- */
  /* KUN YAKUNI — kunlik izoh va shukr bitta kartada                     */
  /* ---------------------------------------------------------------- */
  function gratBody(k) {
    const all = D.S.gratitude || [];
    const today = [];
    for (let i = all.length - 1; i >= 0; i--) if (all[i].date === k) today.push(all[i]);
    let insp = '';
    if (!today.length) {
      // avval "shu kuni" (boshqa yildagi o'sha oy-kun), bo'lmasa kunga bog'langan barqaror tanlov
      const md = k.slice(5);
      const older = [], same = [];
      for (const g of all) { if (!g.text || g.date === k) continue; older.push(g); if (g.date && g.date.slice(5) === md) same.push(g); }
      const pool = same.length ? same : older;
      if (pool.length) {
        const g = pool[hashStr(k) % pool.length];
        insp = `<div class="td-insp"><div class="eyebrow">${D.ic('sparkles', 11)} ${esc(t(same.length ? 'today.gratOnThisDay' : 'today.gratEarlier'))}${g.date ? ` · ${esc(D.fmtDate(g.date, 'long'))}` : ''}</div><div class="td-insp-text">${esc(g.text)}</div></div>`;
      }
    }
    return `<div class="td-wrap-head"><div class="title">${D.ic('hands', 16)} ${esc(t('today.gratitude'))}</div><span class="small muted num">${today.length}</span></div>
      ${insp}
      <div class="list">${today.length ? today.map((g) => `<div class="li"><span class="td-grat-ic">${D.ic('heart', 14)}</span><div class="li-body"><div class="li-text">${esc(g.text)}</div></div>
        <button class="li-del" data-act="tdGratDel" data-id="${esc(g.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>`).join('') : insp ? '' : `<div class="empty">${esc(t('today.gratEmpty'))}</div>`}</div>
      ${addRow(k, t('today.gratPh'), 'tdAddGrat')}`;
  }
  function wrapCard(k) {
    const note = D.S.notes[k] || '';
    return `<div class="card td-wrap">
      <div class="card-head"><div class="title">${D.ic('edit', 16)} ${esc(t('today.wrap'))}</div><span class="small muted num" id="tdNoteCount">${esc(t('today.words', { n: words(note) }))}</span></div>
      <textarea class="ta" data-input="tdNote" data-key="${k}" placeholder="${esc(t('today.notePh'))}" rows="4">${esc(note)}</textarea>
      <div class="td-wrap-sep"></div>
      ${gratBody(k)}
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
        if (h.target && h.target.n) { D.habits.bump(h, k, 1); on = true; }
        else { on = D.habits.toggle(h, k); syncPrayerFromHabit(k, h.id, on); }
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
    try { D.patch('tdStrip', stripHtml()); D.patch('tdDayRing', ringHtml()); } catch (e) { console.error(e); }
  });
  D.on('day:changed', () => { D.ui.viewDate = null; D.saveUi(); if (D.current() === 'today') D.rerender(); });
  // a prayer habit ticked on the Vazifa board (or any other view) mirrors into S.prayers like a Bugun tick; the emitter saves afterwards
  D.on('habit:toggled', (e) => { if (e && e.habit && e.day) syncPrayerFromHabit(e.day, e.habit.id, !!e.on); });
  // keyboard: core delegates clicks only — make the custom habit rows / quick tiles reachable with Enter or Space
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.td-hab[data-act], .td-tile[data-act], .td-ready[data-act]')) return;
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
      const ai = today && D.ai ? safe(() => D.ai.card('today')) : '';
      // Tartib bitta savolga qarab qurilgan: "tanam qanday?" → "kun qayerda?" →
      // namoz → raqamlar → "hozir nima qilaman?" → tafsilot → kun yakuni.
      return safe(() => dateNav(k, today)) + safe(() => heroCard(k)) + safe(() => dayStrip(k)) +
        safe(() => prayerCard(k)) + safe(() => qazaHtml(k)) + safe(() => statTiles(k)) +
        safe(() => focusCard(k)) + safe(() => workoutsCard(k)) + ai + safe(() => wrapCard(k));
    },
  });
})();
