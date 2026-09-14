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
      'today.showLess': 'Yig‘ish',
      'today.dayList': 'Bugun qilinadi', 'today.streakN': '{n} kun ketma-ket', 'today.spentToday': 'Bugun sarflandi',
      'today.prevDay': 'Oldingi kun', 'today.nextDay': 'Keyingi kun',
      'today.moreN': 'Yana {n} ta',

      'today.wrap': 'Kun yakuni',
      'today.backToday': 'bugunga qaytish',

      'today.prayers': 'Namozlar',
      'today.phase.sleeping': 'Uyqu', 'today.phase.morning': 'Tong', 'today.phase.midday': 'Kunduz', 'today.phase.afternoon': 'Tushdan keyin',
      'today.phase.evening': 'Kechqurun', 'today.phase.bedtime': 'Uyqu vaqti', 'today.phase.pastBed': 'Uyqudan kech',
      'today.status.sleeping': '😴 Hali uyqu vaqti', 'today.status.morning': '☀️ Tong — yangi boshlanish', 'today.status.midday': '⚡ Kunduz — davom eting',
      'today.status.afternoon': "🔥 Tushdan keyin — zo'r bering", 'today.status.evening': '⏳ Kechqurun — yakunlang', 'today.status.bedtime': '🌙 Uyqu vaqti yaqin',
      'today.status.pastBed': "⚠️ Uyqu vaqti o'tdi",
      'today.untilWake': "uyg'onishgacha {t}", 'today.awakeLeft': 'faol kun: {t} qoldi', 'today.sleepNow': 'Uxlang!',

      'today.pr.jamaat': 'jamoat', 'today.pr.alone': "yolg'iz", 'today.pr.qaza': 'qazo', 'today.pr.missed': 'qoldirildi',
      'today.habits': 'Odatlar',



      'today.tasks': 'Vazifalar',

      'today.addTask': "Vazifa qo'shish…",
      'today.lateN': '{n} ta vazifa kechikkan', 'today.pullToday': 'Bugunga surish',
      'today.pulledN': '{n} ta vazifa bugunga surildi',
      'today.pushTomorrow': "Ertaga o'tkazish", 'today.pushAll': "Qolganini ertaga o'tkazish",
      'today.pushed': "Ertaga o'tkazildi", 'today.pushedN': "{n} ta vazifa ertaga o'tkazildi",
      'today.tomorrow': 'Ertaga rejalashtirish', 'today.tomorrowSub': 'Kechqurun yozing — ertaga faollashadi',
      'today.planned': '{n} ta reja', 'today.tomorrowEmpty': "Ertaga uchun hali reja yo'q", 'today.addTomorrow': 'Ertaga uchun vazifa…',
      'today.showLess': "Kamroq ko'rsatish",
      'today.lockedTitle': 'Ertaga faollashadi', 'today.taskDeleted': "Vazifa o'chirildi",
      'today.water': 'Suv', 'today.workouts': "WHOOP mashg'ulotlari",
      'today.notePh': 'Bugungi kun haqida qisqacha…', 'today.words': "{n} so'z",
      'today.gratitude': 'Shukr', 'today.gratPh': 'Bugun nimaga shukr qilasiz?', 'today.gratEmpty': 'Bugun hali shukr yozilmagan',
      'today.gratEarlier': 'Ilgari yozilgan', 'today.gratOnThisDay': 'Shu kuni', 'today.gratDeleted': "Shukr yozuvi o'chirildi",
      'today.marked': 'Belgilandi: {name}', 'today.unmarked': 'Bekor qilindi: {name}',
    },
    uzk: {
      'today.showLess': 'Йиғиш',
      'today.dayList': 'Бугун қилинади', 'today.streakN': '{n} кун кетма-кет', 'today.spentToday': 'Бугун сарфланди',
      'today.prevDay': 'Олдинги кун', 'today.nextDay': 'Кейинги кун',
      'today.moreN': 'Яна {n} та',

      'today.wrap': 'Кун якуни',
      'today.backToday': 'бугунга қайтиш',

      'today.prayers': 'Намозлар',
      'today.phase.sleeping': 'Уйқу', 'today.phase.morning': 'Тонг', 'today.phase.midday': 'Кундуз', 'today.phase.afternoon': 'Тушдан кейин',
      'today.phase.evening': 'Кечқурун', 'today.phase.bedtime': 'Уйқу вақти', 'today.phase.pastBed': 'Уйқудан кеч',
      'today.status.sleeping': '😴 Ҳали уйқу вақти', 'today.status.morning': '☀️ Тонг — янги бошланиш', 'today.status.midday': '⚡ Кундуз — давом этинг',
      'today.status.afternoon': '🔥 Тушдан кейин — зўр беринг', 'today.status.evening': '⏳ Кечқурун — якунланг', 'today.status.bedtime': '🌙 Уйқу вақти яқин',
      'today.status.pastBed': '⚠️ Уйқу вақти ўтди',
      'today.untilWake': 'уйғонишгача {t}', 'today.awakeLeft': 'фаол кун: {t} қолди', 'today.sleepNow': 'Ухланг!',

      'today.pr.jamaat': 'жамоат', 'today.pr.alone': 'ёлғиз', 'today.pr.qaza': 'қазо', 'today.pr.missed': 'қолдирилди',
      'today.habits': 'Одатлар',



      'today.tasks': 'Вазифалар',

      'today.addTask': 'Вазифа қўшиш…',
      'today.lateN': '{n} та вазифа кечиккан', 'today.pullToday': 'Бугунга суриш',
      'today.pulledN': '{n} та вазифа бугунга сурилди',
      'today.pushTomorrow': 'Эртага ўтказиш', 'today.pushAll': 'Қолганини эртага ўтказиш',
      'today.pushed': 'Эртага ўтказилди', 'today.pushedN': '{n} та вазифа эртага ўтказилди',
      'today.tomorrow': 'Эртага режалаштириш', 'today.tomorrowSub': 'Кечқурун ёзинг — эртага фаоллашади',
      'today.planned': '{n} та режа', 'today.tomorrowEmpty': 'Эртага учун ҳали режа йўқ', 'today.addTomorrow': 'Эртага учун вазифа…',
      'today.showLess': 'Камроқ кўрсатиш',
      'today.lockedTitle': 'Эртага фаоллашади', 'today.taskDeleted': 'Вазифа ўчирилди',
      'today.water': 'Сув', 'today.workouts': 'WHOOP машғулотлари',
      'today.notePh': 'Бугунги кун ҳақида қисқача…', 'today.words': '{n} сўз',
      'today.gratitude': 'Шукр', 'today.gratPh': 'Бугун нимага шукр қиласиз?', 'today.gratEmpty': 'Бугун ҳали шукр ёзилмаган',
      'today.gratEarlier': 'Илгари ёзилган', 'today.gratOnThisDay': 'Шу куни', 'today.gratDeleted': 'Шукр ёзуви ўчирилди',
      'today.marked': 'Белгиланди: {name}', 'today.unmarked': 'Бекор қилинди: {name}',
    },
    ru: {
      'today.showLess': 'Свернуть',

      'today.dayList': 'Сегодня нужно', 'today.streakN': '{n} дн. подряд', 'today.spentToday': 'Потрачено сегодня',
      'today.prevDay': 'Предыдущий день', 'today.nextDay': 'Следующий день',
      'today.moreN': 'Ещё {n}',
      'today.wrap': 'Итог дня',
      'today.backToday': 'вернуться к сегодня',

      'today.prayers': 'Намазы',
      'today.phase.sleeping': 'Сон', 'today.phase.morning': 'Утро', 'today.phase.midday': 'Полдень', 'today.phase.afternoon': 'После обеда',
      'today.phase.evening': 'Вечер', 'today.phase.bedtime': 'Ко сну', 'today.phase.pastBed': 'Пора спать',
      'today.status.sleeping': '😴 Ещё время сна', 'today.status.morning': '☀️ Утро — свежий старт', 'today.status.midday': '⚡ Полдень — продолжайте',
      'today.status.afternoon': '🔥 После обеда — поднажмите', 'today.status.evening': '⏳ Вечер — завершайте', 'today.status.bedtime': '🌙 Скоро спать',
      'today.status.pastBed': '⚠️ Время сна прошло',
      'today.untilWake': 'до подъёма {t}', 'today.awakeLeft': 'активный день: осталось {t}', 'today.sleepNow': 'Спать!',

      'today.pr.jamaat': 'джамаат', 'today.pr.alone': 'один', 'today.pr.qaza': 'каза', 'today.pr.missed': 'пропущен',
      'today.habits': 'Привычки',



      'today.tasks': 'Задачи',

      'today.addTask': 'Добавить задачу…',
      'today.lateN': 'Просрочено задач: {n}', 'today.pullToday': 'Перенести на сегодня',
      'today.pulledN': 'Перенесено на сегодня: {n}',
      'today.pushTomorrow': 'Перенести на завтра', 'today.pushAll': 'Остальное — на завтра',
      'today.pushed': 'Перенесено на завтра', 'today.pushedN': 'Перенесено на завтра: {n}',
      'today.tomorrow': 'План на завтра', 'today.tomorrowSub': 'Напишите вечером — активируется завтра',
      'today.planned': 'в плане: {n}', 'today.tomorrowEmpty': 'На завтра пока ничего не запланировано', 'today.addTomorrow': 'Задача на завтра…',
      'today.showLess': 'Свернуть',
      'today.lockedTitle': 'Активируется завтра', 'today.taskDeleted': 'Задача удалена',
      'today.water': 'Вода', 'today.workouts': 'Тренировки WHOOP',
      'today.notePh': 'Коротко о сегодняшнем дне…', 'today.words': 'слов: {n}',
      'today.gratitude': 'Благодарность', 'today.gratPh': 'За что вы благодарны сегодня?', 'today.gratEmpty': 'Сегодня записей ещё нет',
      'today.gratEarlier': 'Из прошлых записей', 'today.gratOnThisDay': 'В этот день', 'today.gratDeleted': 'Запись удалена',
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
      'today.d.short': '{h} kam', 'today.d.over': '{h} ortiq', 'today.d.target': 'chegara {n}',
      'today.d.base': "o'rtachadan {p}", 'today.d.noData': "ma'lumot yo'q",
      'today.debt': '7 kunda {h} uyqu qarzi',

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
      'today.d.short': '{h} кам', 'today.d.over': '{h} ортиқ', 'today.d.target': 'чегара {n}',
      'today.d.base': 'ўртачадан {p}', 'today.d.noData': 'маълумот йўқ',
      'today.debt': '7 кунда {h} уйқу қарзи',

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
      'today.d.short': 'меньше на {h}', 'today.d.over': 'больше на {h}', 'today.d.target': 'предел {n}',
      'today.d.base': '{p} от среднего', 'today.d.noData': 'нет данных',
      'today.debt': 'долг сна за 7 дней: {h}',

      'today.focus': 'Сегодня нужно сделать', 'today.focusDone': 'Список на сегодня закрыт',
      'today.focusEmpty': 'На сегодня нет ни задач, ни привычек',
      'today.leftN': 'Осталось {n}', 'today.doneN2': 'Выполнено {n}',
    },
  });

  const PRAYER_RX = {
    bomdod: /(bomdod|fajr|fadjr)/, peshin: /(peshin|zuhr|zuxr)/, asr: /\basr\b/,
    shom: /(shom|maghrib|magrib)/, xufton: /(xufton|isha)/,
  };
  const PRAYER_CYCLE = [null, 'jamaat', 'alone', 'qaza'];
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
  /* Sana — tepa panelning o'ng chekkasida ikkita strelka. Ilgari sahifa ustida
     alohida qator edi; sarlavha ostida sana allaqachon yozilib turgani uchun
     u qator sanani ikkinchi marta aytardi. */
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
  /* Soat ulanmagan kun uchun — o'sha yoy, lekin kunning o'zi haqida:
     uyg'onishdan uyquga qadar qancha qolgani. Sahifa bosh raqamsiz qolmaydi. */
  function dayArcHtml() {
    const st = dayState();
    return D.chart.arc({ pct: st.pct, color: st.color, label: st.clock, sub: esc(t('today.phase.' + st.phase)),
      cap: `<b class="td-ready-state">${esc(t('today.status.' + st.phase))}</b><br>${esc(st.remain)}` });
  }
  /* ---------------------------------------------------------------- */
  /* HERO — "tanam bugun qanday?" bitta katta raqam bilan               */
  /* Oura/WHOOP ikkalasi ham shu qoidaga quriladi: tepada bitta ball,    */
  /* ostida bitta oddiy jumla, keyin uchtadan ko'p bo'lmagan ko'rsatkich */
  /* va har birining yonida SHAXSIY o'rtachadan farqi — quruq raqam      */
  /* hech narsa aytmaydi, farq aytadi.                                   */
  /* ---------------------------------------------------------------- */
  const ZONE_COLOR = { good: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger-text)' };
  function kpiHtml(lab, val, delta, zone, dur) {
    return `<div class="td-kpi ${zone || ''}">
      <span class="td-kpi-lab">${esc(lab)}</span>
      <span class="td-kpi-val num ${dur ? 'dur' : ''}">${val}</span>
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
    if (!i) return k === D.today() ? `<div class="card td-ready td-day-arc" id="tdDayRing">${dayArcHtml()}</div>` : '';
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
    if (i.load === 'over' && tgt != null) adv = t('today.adv.over', { s: D.fmtNum(strain, 1), n: D.fmtNum(tgt, 1) });
    else if (tgt != null) adv = t('today.adv.' + r.zone, { n: D.fmtNum(tgt, 1) });
    else adv = r.label;

    // 1) uyqu — kerakli miqdordan farqi
    let sVal = '—', sD = '', sZ = '', sDur = false;
    if (i.sleepH != null || r.sleepH != null) {
      // Ilova qoidasi: davomiylik hech qachon kasr soatda emas — «7 soat 12 daq».
      sVal = D.fmtHm(i.sleepH != null ? i.sleepH : r.sleepH); sDur = true;
      if (i.gapH != null) {
        sD = t(i.gapH >= 0 ? 'today.d.over' : 'today.d.short', { h: D.fmtHm(Math.abs(i.gapH)) });
        sZ = i.gapH >= -0.5 ? 'z-good' : i.gapH >= -1.5 ? 'z-warn' : 'z-bad';
      } else if (i.perf != null) { sD = D.fmtNum(i.perf, 1) + '%'; sZ = i.perf >= 85 ? 'z-good' : i.perf >= 70 ? 'z-warn' : 'z-bad'; }
    }
    // 2) zo'riqish — tiklanish ruxsat bergan chegaraga nisbatan
    let tVal = '—', tD = '', tZ = '';
    if (strain != null) {
      tVal = `${D.fmtNum(strain, 1)}${live ? '<i class="wh-dot"></i>' : ''}`;
      if (tgt != null) {
        tD = t('today.d.target', { n: D.fmtNum(tgt, 1) });
        tZ = i.load === 'over' ? 'z-bad' : i.load === 'under' ? 'z-warn' : i.load === 'ok' ? 'z-good' : '';
      }
    }
    // 3) HRV — o'z 30 kunlik bazasidan og'ish; HRV yo'q bo'lsa tinch puls
    let hLab = t('wh.hrv'), hVal = '—', hD = '', hZ = '';
    if (i.hrv != null) {
      hVal = `${D.fmtNum(i.hrv, 1)}<small>ms</small>`;
      if (i.hrvPct !== undefined) { hD = t('today.d.base', { p: D.fmtSigned(i.hrvPct, 1) + '%' }); hZ = i.hrvPct >= -5 ? 'z-good' : i.hrvPct >= -15 ? 'z-warn' : 'z-bad'; }
    } else if (i.rhr != null || r.rhr != null) {
      hLab = t('wh.rhr'); hVal = `${D.fmtNum(i.rhr != null ? i.rhr : r.rhr, 1)}<small>bpm</small>`;
      if (i.rhrDelta !== undefined) { hD = t('today.d.base', { p: D.fmtSigned(i.rhrDelta, 1) }); hZ = i.rhrDelta <= 1 ? 'z-good' : i.rhrDelta <= 4 ? 'z-warn' : 'z-bad'; }
    }
    // uyqu qarzi ko'zga ko'rinmaydigan narsa — bugun va sezilarli bo'lgandagina bitta qator
    const dbt = today && D.whoop.sleepDebt ? safeVal(() => D.whoop.sleepDebt(7)) : null;
    const foot = dbt && dbt.h >= 2 ? `<div class="td-hero-foot">${D.ic('moon', 12)} ${esc(t('today.debt', { h: D.fmtHm(dbt.h) }))}</div>` : '';

    // Kunning bosh raqami — yoy o'lchagichda, ostida bitta jumla maslahat.
    // Ilgari halqa chapda, matn o'ngda edi; telefonda ikkalasi ham siqilardi.
    return `<div class="card td-ready z-${r.zone}" data-act="go" data-view="health" data-sub="ready" role="button" tabindex="0">
      <div class="eyebrow td-ready-eyebrow">WHOOP${f ? ` <span class="td-fresh ${f.stale ? 'stale' : ''}">${esc(f.label)}</span>` : ''}</div>
      ${D.chart.arc({ pct: r.pct, color: col, label: `${D.fmtNum(r.pct)}<small>%</small>`, sub: esc(t('wh.recovery')),
        cap: `<b class="td-ready-state">${esc(t('today.state.' + r.zone))}</b><br>${esc(adv)}` })}
      <div class="td-kpis">${kpiHtml(t('wh.sleepH'), sVal, sD, sZ, sDur)}${kpiHtml(t('wh.strain'), tVal, tD, tZ)}${kpiHtml(hLab, hVal, hD, hZ)}</div>
      ${foot}</div>`;
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
  D.act.tdTask = (el) => {
    const x = findTask(el.dataset.id);
    if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    haptic(); D.save(); D.rerender();
  };
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
  /* Suv — bitta bosish. Ilgari bu yerda faqat raqam almashtirilardi: qator
     me'yorga yetganda ham chizilmasdi, sarlavhadagi hisob va chiziq eski
     qolardi, sahifadan tashqarida bosilsa esa ekranda umuman hech narsa
     bo'lmasdi. Endi butun sahifa qayta chiziladi — u arzon va rost. */
  D.act.tdWater = (el) => {
    const k = el && el.dataset && el.dataset.today ? D.today() : key();
    const h = D.S.health[k] || (D.S.health[k] = { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
    h.water = (+h.water || 0) + 1;
    haptic(); D.save(); D.rerender();
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
  /* Kun yakuni — kunda bir marta, kechqurun ochiladigan narsa. Sahifada doim
     turgani uchun har kirganda ko'zga tashlanardi va sahifani cho'zardi; endi
     ro'yxat ostidagi bitta qatordan chiqadi. */
  function wrapBody(k) {
    const note = D.S.notes[k] || '';
    return `<textarea class="ta" data-input="tdNote" data-key="${k}" placeholder="${esc(t('today.notePh'))}" rows="4">${esc(note)}</textarea>
      <div class="small muted num td-wrap-count" id="tdNoteCount">${esc(t('today.words', { n: words(note) }))}</div>
      <div class="td-wrap-sep"></div>
      ${gratBody(k)}`;
  }
  D.act.tdWrap = () => {
    const k = key();
    D.sheet(wrapBody(k), { title: t('today.wrap') + ' · ' + D.fmtDate(k, 'weekday'), noFocus: true });
  };
  // Shukr qo'shilgach oyna o'z ichini yangilaydi — sahifa emas, oyna ochiq turibdi
  const wrapRefresh = () => { const b = D.$('#sheet .sheet-body'); if (b) b.innerHTML = wrapBody(key()); };
  D.act.tdAddGrat = (el) => {
    const inp = el.matches('input') ? el : el.closest('.input-row').querySelector('input');
    const text = (inp.value || '').trim();
    if (!text) return;
    D.S.gratitude.push({ id: D.uid('gr'), date: inp.dataset.date || key(), text });
    inp.value = '';
    haptic(); D.save(); wrapRefresh();
  };
  D.act.tdGratDel = (el) => { D.remove(D.S.gratitude, el.dataset.id, { label: t('today.gratDeleted') }); wrapRefresh(); };

  /* ------------------------------------------------------------------ */
  /* HAFTA CHIZIG'I                                                       */
  /*                                                                      */
  /* Yetti kun bir qatorda: qaysi kunni ko'rayotganingiz ko'rinib turadi   */
  /* va boshqasiga bir bosishda o'tasiz. Tepa paneldagi strelkalar joyida  */
  /* qoladi, lekin ular bir kundan bir kunga yuradi; bu yerda esa butun    */
  /* hafta ko'rinadi — o'tgan kunni to'ldirish uchun aynan shu kerak.      */
  /* Nuqta — o'sha kunda nimadir belgilangani.                            */
  /* ------------------------------------------------------------------ */
  function weekStrip(k) {
    const td = D.today();
    // Hafta dushanbadan boshlanadi: o'zbek taqvimi shunday
    const dow = (D.dowOf(k) + 6) % 7;
    const start = D.addDays(k, -dow);
    const W = t('weekdaysShort');
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const day = D.addDays(start, i);
      const future = day > td;
      const has = !!(D.S.logs[day] || D.S.prayers[day] || D.S.mediaLogs[day] || (D.S.counts[day] && Object.keys(D.S.counts[day]).length));
      cells += `<button class="td-wd ${day === k ? 'on' : ''} ${day === td ? 'today' : ''}" data-act="tdPickDay" data-key="${day}" ${future ? 'disabled' : ''}>
        <span class="td-wd-l">${esc(W[D.dowOf(day)])}</span>
        <span class="td-wd-n num">${+day.slice(8)}</span>
        <i class="td-wd-dot ${has && !future ? 'on' : ''}"></i>
      </button>`;
    }
    return `<div class="td-week">${cells}</div>`;
  }
  D.act.tdPickDay = (el) => {
    const day = el.dataset.key;
    if (!day || day > D.today()) return;
    D.ui.viewDate = day === D.today() ? null : day;
    D.saveUi(); haptic(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* KUN RO'YXATI — namoz, odat, suv va vazifa bitta ro'yxatda            */
  /*                                                                      */
  /* Ilgari bular to'rt joyda turardi: namoz kartasi, fokus kartasi,       */
  /* plitkalar va qazo banneri. To'rttasini ham bitta savol bog'lab        */
  /* turadi — «bugun nima qilishim kerak?» — shuning uchun ular bitta      */
  /* ro'yxat. Tartib vaqt bo'yicha: vaqti borlari soatiga qarab, vaqtsizi  */
  /* ostida. Bajarilgani o'z joyida qoladi, o'chib ketmaydi: kun qanday    */
  /* o'tayotgani ko'rinib tursin.                                          */
  /* ------------------------------------------------------------------ */
  const LIST_CAP = 9;
  const hhmm = (v) => { const m = /^(\d{1,2}):(\d{2})$/.exec(v || ''); return m ? +m[1] * 60 + +m[2] : null; };
  const stepHtml = (id, n, q) => `<span class="td-step">
      <button class="td-step-btn" data-act="tdCount" data-id="${esc(id)}" data-d="-1" aria-label="−">${D.ic('minus', 13)}</button>
      <span class="td-step-val num">${n}<small>/${q}</small></span>
      <button class="td-step-btn" data-act="tdCount" data-id="${esc(id)}" data-d="1" aria-label="+">${D.ic('plus', 13)}</button>
    </span>`;

  function dayRows(k) {
    const rows = [];

    // 1. Namoz — vaqti bilan
    const pr = D.S.prayers[k] || {};
    let times = null;
    try { times = D.prayer ? D.prayer.list(k) : null; } catch (e) { times = null; }
    const tmap = {};
    if (times) for (const x of times) tmap[x.id] = x;
    for (const id of D.PRAYERS) {
      const st = pr[id] || null, x = tmap[id];
      rows.push({ kind: 'namoz', name: esc(t('prayer.' + id)), done: !!(st && st !== 'missed'),
        mins: x ? x.mins : null,
        right: st ? esc(t('today.pr.' + st)) : x ? `<span class="num">${x.time}</span>` : '',
        attrs: `data-act="tdPrayer" data-id="${id}"` });
    }

    // 2. Odatlar — eslatma vaqti bo'lsa o'sha yerda, bo'lmasa ro'yxat oxirida
    // Namoz nomli odatlar (eski ma'lumotdan qolgan БОМДОД/ПЕШИН...) ro'yxatda
    // ikkinchi marta ko'rinmaydi: ularning qatori yuqorida, vaqti bilan turibdi.
    const rev = prayerHabits().rev;
    const due = D.dueHabits(k).filter((h) => !rev[h.id]), isDone = habitDoneOn(k), counts = D.S.counts[k] || {};
    for (const h of due) {
      const q = h.target && h.target.n ? +h.target.n : 0;
      const on = isDone(h), st = on ? streakOf(h) : 0;
      rows.push({ kind: 'odat', name: `<span class="td-hab-emoji" aria-hidden="true">${esc(D.habitEmoji(h))}</span>${esc(h.name)}`,
        done: on, mins: hhmm(h.remind),
        sub: st > 1 ? esc(t('today.streakN', { n: st })) : '',
        right: q ? stepHtml(h.id, +counts[h.id] || 0, q) : '',
        attrs: q ? '' : `data-act="tdHabit" data-id="${esc(h.id)}"` });
    }

    // 3. Suv — sanaladigan qator, o'ng tomonida bitta tugma
    const w = waterInfo(k);
    rows.push({ kind: 'suv', name: esc(t('today.water')), done: w.water >= w.serv, mins: null,
      right: `<span class="td-row-n num">${w.water}<small>/${w.serv}</small></span>
        <button class="td-row-plus" data-act="tdWater" aria-label="+1">${D.ic('plus', 15)}</button>` });

    // 4. Kitob va ko'rgan narsalar — o'qiyotganlari ro'yxatda odat kabi turadi
    for (const m of D.S.media) {
      if (m.status !== 'now') continue;
      const on = +((D.S.mediaLogs[k] || {})[m.id]) > 0;
      const sub = m.total ? `${D.fmtNum(m.done)} / ${D.fmtNum(m.total)} ${esc(m.unit || (m.kind === 'kitob' ? t('media.pages') : t('media.parts')))}` : '';
      rows.push({ kind: 'kitob', name: `<span class="td-hab-emoji" aria-hidden="true">${m.kind === 'kitob' ? '\u{1F4D8}' : '\u{1F3AC}'}</span>${esc(m.title)}`,
        done: on, mins: null, sub,
        attrs: `data-act="tdMedia" data-id="${esc(m.id)}"` });
    }

    // 5. Vazifalar — vaqti yo'q, eng oxirida; kechikkanining sanasi ko'rinadi
    for (const x of tasksFor(k)) {
      rows.push({ kind: 'ish', name: esc(x.text), done: !!x.done, mins: null,
        sub: !x.done && x.date < k ? esc(D.fmtDate(x.date, 'dm')) : '',
        attrs: `data-act="tdTask" data-id="${esc(x.id)}"` });
    }

    // Vaqti borlari soatiga qarab tepada, vaqtsizi ostida — o'z guruhi tartibida
    rows.sort((a, b) => (a.mins == null) - (b.mins == null) || (a.mins != null ? a.mins - b.mins : 0));
    return rows;
  }

  const TICK = `<i class="td-tick" aria-hidden="true">${D.ic('check', 13)}</i>`;
  function rowHtml(r) {
    const tag = r.attrs ? 'button' : 'div';
    return `<${tag} class="td-row k-${r.kind} ${r.done ? 'done' : ''}"${r.attrs ? ` ${r.attrs} aria-pressed="${r.done ? 'true' : 'false'}"` : ''}>
      <i class="td-kind"></i>${TICK}
      <span class="td-row-body"><span class="td-row-name">${r.name}</span>${r.sub ? `<span class="td-row-sub">${r.sub}</span>` : ''}</span>
      ${r.right ? `<span class="td-row-right">${r.right}</span>` : ''}
    </${tag}>`;
  }

  function listCard(k) {
    const rows = dayRows(k);
    const done = rows.filter((r) => r.done).length;
    const open = !!D.ui.collapsed.tdAll;
    const shown = open ? rows : rows.slice(0, LIST_CAP);
    // Kesilganlar ichida bajarilganlari ham bor; «Qolgan N ta» esa
    // bajarilmaganini anglatadi, shuning uchun faqat shular sanaladi.
    const hidden = rows.slice(shown.length).filter((r) => !r.done).length;
    const cut = rows.length - shown.length;
    const all = rows.length > 0 && done === rows.length;
    const pct = rows.length ? (done / rows.length) * 100 : 0;
    return `<div class="card td-day ${all ? 'all-done' : ''}">
      <div class="td-day-head">
        <span class="td-day-title">${esc(t('today.dayList'))}</span>
        <span class="td-day-prog"><span class="bar thin td-day-bar"><i class="bar-fill" style="width:${pct.toFixed(0)}%"></i></span>
          <span class="num">${done} / ${rows.length}</span></span>
      </div>
      <div class="td-rows">${shown.map(rowHtml).join('')}</div>
      ${cut > 0 ? `<button class="td-more" data-act="tdAll">${D.ic('chevD', 15)} ${esc(hidden ? t('today.leftN', { n: hidden }) : t('today.moreN', { n: cut }))}</button>` : ''}
      ${open && rows.length > LIST_CAP ? `<button class="td-more open" data-act="tdAll">${D.ic('chevD', 15)} ${esc(t('today.showLess'))}</button>` : ''}
      ${addRow(k, t('today.addTask'), 'tdAddTask')}
      <!-- Vazifa va Moliya endi pastki panelning o'z yorlig'i — bu yerdagi
           havolasi ikkinchi eshik bo'lib qolardi. Qolgani o'z yorlig'i
           bo'lmagan sahifalar: Odat va Kitob Vazifaning ichida turadi. -->
      <div class="td-links">
        <button class="td-link" data-act="go" data-view="tasks" data-sub="habits">${D.ic('fire', 15)}<span>${esc(t('nav.habits'))}</span>${D.ic('chevR', 15)}</button>
        <button class="td-link" data-act="go" data-view="tasks" data-sub="books">${D.ic('book', 15)}<span>${esc(t('nav.books'))}</span>${D.ic('chevR', 15)}</button>
        <button class="td-link" data-act="tdWrap">${D.ic('edit', 15)}<span>${esc(t('today.wrap'))}</span>${D.ic('chevR', 15)}</button>
      </div>
    </div>`;
  }
  D.act.tdAll = () => { D.ui.collapsed.tdAll = !D.ui.collapsed.tdAll; D.saveUi(); D.rerender(); };

  /* Ikkita raqam — kun oxirida qaraladigan narsalar; ikkalasi ham o'z bo'limiga eshik. */
  function numbersStrip(k) {
    let tot = null, tg = null;
    try { tot = D.food && D.food.dayTotals ? D.food.dayTotals(k) : null; tg = D.food && D.food.targets ? D.food.targets() : null; } catch (e) {}
    let spent = 0;
    try { for (const x of (D.S.finance && D.S.finance.tx) || []) if (x.date === k && x.type === 'out') spent += +x.amount || 0; } catch (e) {}
    return `<div class="td-strip2">
      <button class="td-strip2-item" data-act="go" data-view="health" data-sub="ovqat">
        <span class="td-strip2-val num">${D.fmtNum(tot ? tot.kcal : 0)}${tg && tg.kcal ? `<small> / ${D.fmtNum(tg.kcal)}</small>` : ''}</span>
        <span class="td-strip2-lab">${esc(t('food.kcal'))}</span></button>
      <button class="td-strip2-item" data-act="go" data-view="finance">
        <span class="td-strip2-val num">${D.fmtMoney(spent)}</span>
        <span class="td-strip2-lab">${esc(t('today.spentToday'))}</span></button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* live updates                                                        */
  /* ------------------------------------------------------------------ */
  D.on('tick', () => {
    if (D.current() !== 'today') return;
    try { D.patch('tdDayRing', dayArcHtml()); } catch (e) { console.error(e); }
  });
  D.on('day:changed', () => { D.ui.viewDate = null; D.saveUi(); if (D.current() === 'today') D.rerender(); });
  // a prayer habit ticked on the Vazifa board (or any other view) mirrors into S.prayers like a Bugun tick; the emitter saves afterwards
  D.on('habit:toggled', (e) => { if (e && e.habit && e.day) syncPrayerFromHabit(e.day, e.habit.id, !!e.on); });
  // keyboard: core delegates clicks only — make the custom habit rows / quick tiles reachable with Enter or Space
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.td-row[data-act], .td-ready[data-act]')) return;
    ev.preventDefault();
    el.click();
  });

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'today', icon: 'calendar', order: 10, nav: true, primary: true,
    subtitle() { const k = key(); return esc(D.fmtDate(k, 'long')) + (k === D.today() ? '' : ` · <button class="top-link" data-act="tdToday">${esc(t('btn.today'))}</button>`); },
    render() {
      const td = D.today();
      if (D.ui.viewDate && D.ui.viewDate >= td) { D.ui.viewDate = null; D.saveUi(); }
      const k = key(), today = k === td;
      // Tartib bitta savolga qarab qurilgan: "hozir nima qilaman?" → "tanam
      // qanday?" → "kun qayerda?" → namoz → raqamlar → tafsilot → kun yakuni.
      // Kunning ishi eng tepada: sarlavha satridagi asosiy vazifa chizig'i olib
      // tashlangach, uni shu karta almashtiradi.
      // Uchta blok, shu tartibda: tanam qanday → bugun nima qilaman → kun qayerda.
      // To'qqizta karta shu uchtaga yig'ildi; hech bir ma'lumot yo'qolmadi,
      // faqat joyi almashdi (qazo → Ibodat, mashg'ulot → Tana, kun yakuni → oyna).
      return safe(() => weekStrip(k)) + safe(() => heroCard(k)) + safe(() => listCard(k)) + safe(() => numbersStrip(k));
    },
  });
})();
