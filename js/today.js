/* =====================================================================
   today.js — Asosiy: kunning ko'zgusi. Bu sahifada hech narsa
   belgilanmaydi; har bir raqam o'z bo'limiga eshik.
   hafta chizig'i · 2×2 plitka (tiklanish · uyqu · zo'riqish · ovqat) ·
   kun kartasi (namoz qatorlari + odat/vazifa/maqsad guruhlari) ·
   kun yakuni (izoh + shukr). Ko'mir qobiq, 2026-09-15.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'today.dayList': 'Bugun qilinadi', 'today.spentToday': 'Sarflandi',
      'today.lvl': '{n}-daraja', 'today.lvDone': 'Bajarildi',

      'today.wrap': 'Kun yakuni',

      'today.prayers': 'Namozlar',
      'today.phase.sleeping': 'Uyqu', 'today.phase.morning': 'Tong', 'today.phase.midday': 'Kunduz', 'today.phase.afternoon': 'Tushdan keyin',
      'today.phase.evening': 'Kechqurun', 'today.phase.bedtime': 'Uyqu vaqti', 'today.phase.pastBed': 'Uyqudan kech',
      'today.status.sleeping': '😴 Hali uyqu vaqti', 'today.status.morning': '☀️ Tong — yangi boshlanish', 'today.status.midday': '⚡ Kunduz — davom eting',
      'today.status.afternoon': "🔥 Tushdan keyin — zo'r bering", 'today.status.evening': '⏳ Kechqurun — yakunlang', 'today.status.bedtime': '🌙 Uyqu vaqti yaqin',
      'today.status.pastBed': "⚠️ Uyqu vaqti o'tdi",
      'today.untilWake': "uyg'onishgacha {t}", 'today.awakeLeft': 'faol kun: {t} qoldi', 'today.sleepNow': 'Uxlang!',

      'today.pr.jamaat': 'jamoat', 'today.pr.alone': 'yakka', 'today.pr.qaza': 'qazo', 'today.pr.missed': "o'tkazib",
      'today.habits': 'Odatlar', 'today.tasks': 'Vazifalar', 'today.goals': 'Maqsadlar',

      'today.water': 'Suv',
      'today.notePh': 'Bugungi kun haqida qisqacha…', 'today.words': "{n} so'z",
      'today.gratitude': 'Shukr', 'today.gratPh': 'Bugun nimaga shukr qilasiz?', 'today.gratEmpty': 'Bugun hali shukr yozilmagan',
      'today.gratEarlier': 'Ilgari yozilgan', 'today.gratOnThisDay': 'Shu kuni', 'today.gratDeleted': "Shukr yozuvi o'chirildi",
    },
    uzk: {
      'today.dayList': 'Бугун қилинади', 'today.spentToday': 'Сарфланди',
      'today.lvl': '{n}-даража', 'today.lvDone': 'Бажарилди',

      'today.wrap': 'Кун якуни',

      'today.prayers': 'Намозлар',
      'today.phase.sleeping': 'Уйқу', 'today.phase.morning': 'Тонг', 'today.phase.midday': 'Кундуз', 'today.phase.afternoon': 'Тушдан кейин',
      'today.phase.evening': 'Кечқурун', 'today.phase.bedtime': 'Уйқу вақти', 'today.phase.pastBed': 'Уйқудан кеч',
      'today.status.sleeping': '😴 Ҳали уйқу вақти', 'today.status.morning': '☀️ Тонг — янги бошланиш', 'today.status.midday': '⚡ Кундуз — давом этинг',
      'today.status.afternoon': '🔥 Тушдан кейин — зўр беринг', 'today.status.evening': '⏳ Кечқурун — якунланг', 'today.status.bedtime': '🌙 Уйқу вақти яқин',
      'today.status.pastBed': '⚠️ Уйқу вақти ўтди',
      'today.untilWake': 'уйғонишгача {t}', 'today.awakeLeft': 'фаол кун: {t} қолди', 'today.sleepNow': 'Ухланг!',

      'today.pr.jamaat': 'жамоат', 'today.pr.alone': 'якка', 'today.pr.qaza': 'қазо', 'today.pr.missed': 'ўтказиб',
      'today.habits': 'Одатлар', 'today.tasks': 'Вазифалар', 'today.goals': 'Мақсадлар',

      'today.water': 'Сув',
      'today.notePh': 'Бугунги кун ҳақида қисқача…', 'today.words': '{n} сўз',
      'today.gratitude': 'Шукр', 'today.gratPh': 'Бугун нимага шукр қиласиз?', 'today.gratEmpty': 'Бугун ҳали шукр ёзилмаган',
      'today.gratEarlier': 'Илгари ёзилган', 'today.gratOnThisDay': 'Шу куни', 'today.gratDeleted': 'Шукр ёзуви ўчирилди',
    },
    ru: {
      'today.dayList': 'Сегодня нужно', 'today.spentToday': 'Потрачено',
      'today.lvl': '{n} уровень', 'today.lvDone': 'Выполнено',

      'today.wrap': 'Итог дня',

      'today.prayers': 'Намазы',
      'today.phase.sleeping': 'Сон', 'today.phase.morning': 'Утро', 'today.phase.midday': 'Полдень', 'today.phase.afternoon': 'После обеда',
      'today.phase.evening': 'Вечер', 'today.phase.bedtime': 'Ко сну', 'today.phase.pastBed': 'Пора спать',
      'today.status.sleeping': '😴 Ещё время сна', 'today.status.morning': '☀️ Утро — свежий старт', 'today.status.midday': '⚡ Полдень — продолжайте',
      'today.status.afternoon': '🔥 После обеда — поднажмите', 'today.status.evening': '⏳ Вечер — завершайте', 'today.status.bedtime': '🌙 Скоро спать',
      'today.status.pastBed': '⚠️ Время сна прошло',
      'today.untilWake': 'до подъёма {t}', 'today.awakeLeft': 'активный день: осталось {t}', 'today.sleepNow': 'Спать!',

      'today.pr.jamaat': 'джамаат', 'today.pr.alone': 'один', 'today.pr.qaza': 'каза', 'today.pr.missed': 'пропущен',
      'today.habits': 'Привычки', 'today.tasks': 'Задачи', 'today.goals': 'Цели',

      'today.water': 'Вода',
      'today.notePh': 'Коротко о сегодняшнем дне…', 'today.words': 'слов: {n}',
      'today.gratitude': 'Благодарность', 'today.gratPh': 'За что вы благодарны сегодня?', 'today.gratEmpty': 'Сегодня записей ещё нет',
      'today.gratEarlier': 'Из прошлых записей', 'today.gratOnThisDay': 'В этот день', 'today.gratDeleted': 'Запись удалена',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants                                                           */
  /* ------------------------------------------------------------------ */
  // "contains" match on the normalised (translit) habit name; asr keeps a word boundary (nasr, kasr, asrlar…)
  /* Bugun 2.0 — WHOOP tahlili birinchi o'ringa chiqqach kerak bo'lgan qatorlar */
  D.i18n.add({
    uz: {
      'today.state.good': 'Yuqori', 'today.state.warn': "O'rtacha", 'today.state.bad': 'Past',
      'today.tile.sleep.good': 'Yetarli', 'today.tile.sleep.warn': 'Kamroq', 'today.tile.sleep.bad': 'Kam',
      'today.tile.strain.over': 'Chegaradan oshdi', 'today.tile.strain.ok': "Me'yorida", 'today.tile.strain.under': 'Hali kam',
      'today.tile.food': "Me'yor {n} kkal", 'today.tile.h': 's', 'today.tile.m': 'd', 'lv.xpUnit': 'ochko',
      'today.adv.good': "Bugun {n} gacha zo'riqish ko'tarasiz",
      'today.adv.warn': "{n} atrofida zo'riqish yetarli",
      'today.adv.bad': "Dam oling — {n} dan oshirmang",
      'today.adv.over': "Chegara oshdi ({s}/{n}) — qolgan kun dam",
      'today.adv.past': "Chegaraga yetdingiz — {n} edi, hozir {s}",
      'today.d.short': '{h} kam', 'today.d.over': '{h} ortiq', 'today.d.target': 'chegara {n}',
      'today.d.base': "o'rtachadan {p}", 'today.d.noData': "ma'lumot yo'q",
      'today.debt': '7 kunda {h} uyqu qarzi',
      'today.r.sleep': 'Uyqu', 'today.r.rec': 'Tiklanish', 'today.r.strain': "Zo'riqish",
    },
    uzk: {
      'today.state.good': 'Юқори', 'today.state.warn': 'Ўртача', 'today.state.bad': 'Паст',
      'today.tile.sleep.good': 'Етарли', 'today.tile.sleep.warn': 'Камроқ', 'today.tile.sleep.bad': 'Кам',
      'today.tile.strain.over': 'Чегарадан ошди', 'today.tile.strain.ok': 'Меъёрида', 'today.tile.strain.under': 'Ҳали кам',
      'today.tile.food': 'Меъёр {n} ккал', 'today.tile.h': 'с', 'today.tile.m': 'д', 'lv.xpUnit': 'очко',
      'today.adv.good': 'Бугун {n} гача зўриқиш кўтарасиз',
      'today.adv.warn': '{n} атрофида зўриқиш етарли',
      'today.adv.bad': 'Дам олинг — {n} дан оширманг',
      'today.adv.over': 'Чегара ошди ({s}/{n}) — қолган кун дам',
      'today.adv.past': 'Чегарага етдингиз — {n} эди, ҳозир {s}',
      'today.d.short': '{h} кам', 'today.d.over': '{h} ортиқ', 'today.d.target': 'чегара {n}',
      'today.d.base': 'ўртачадан {p}', 'today.d.noData': 'маълумот йўқ',
      'today.debt': '7 кунда {h} уйқу қарзи',
      'today.r.sleep': 'Уйқу', 'today.r.rec': 'Тикланиш', 'today.r.strain': 'Зўриқиш',
    },
    ru: {
      'today.state.good': 'Высокое', 'today.state.warn': 'Среднее', 'today.state.bad': 'Низкое',
      'today.tile.sleep.good': 'Достаточно', 'today.tile.sleep.warn': 'Маловато', 'today.tile.sleep.bad': 'Мало',
      'today.tile.strain.over': 'Выше нормы', 'today.tile.strain.ok': 'В норме', 'today.tile.strain.under': 'Пока мало',
      'today.tile.food': 'Норма {n} ккал', 'today.tile.h': 'ч', 'today.tile.m': 'м', 'lv.xpUnit': 'очков',
      'today.adv.good': 'Сегодня выдержите нагрузку до {n}',
      'today.adv.warn': 'Достаточно нагрузки около {n}',
      'today.adv.bad': 'Отдыхайте — не выше {n}',
      'today.adv.over': 'Предел превышен ({s}/{n}) — дальше отдых',
      'today.adv.past': 'Предел достигнут — было {n}, сейчас {s}',
      'today.d.short': 'меньше на {h}', 'today.d.over': 'больше на {h}', 'today.d.target': 'предел {n}',
      'today.d.base': '{p} от среднего', 'today.d.noData': 'нет данных',
      'today.debt': 'долг сна за 7 дней: {h}',
      'today.r.sleep': 'Сон', 'today.r.rec': 'Восстановление', 'today.r.strain': 'Нагрузка',
    },
  });

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
        const p = D.prayer.matchName(h.name);
        if (p && !map[p]) { map[p] = h.id; rev[h.id] = p; }
      }
      phCache = { sig, map, rev };
    }
    return phCache;
  }
  /* Namoz holatini yozadi. Bugun sahifasi endi hech narsani belgilamaydi,
     shuning uchun bu yerga bitta yo'l qoldi: odat trekkerida namoz nomli
     odat belgilanganda. Teskari yo'nalish — namoz belgilansa odat ham
     belgilanishi — Ibodat bo'limining o'z setPrayer'ida turadi. */
  function setPrayer(k, id, v) {
    const o = D.S.prayers[k] || { bomdod: null, peshin: null, asr: null, shom: null, xufton: null };
    o[id] = v || null;
    // tahajjud ham kun yozuvida turadi — faqat hammasi bo'sh bo'lsa kun o'chadi
    if (D.PRAYERS.concat(['tahajjud']).every((p) => !o[p])) delete D.S.prayers[k]; else D.S.prayers[k] = o;
  }
  function syncPrayerFromHabit(k, hid, on) {
    const p = prayerHabits().rev[hid];
    if (!p) return;
    const cur = (D.S.prayers[k] || {})[p] || null;
    if (on && !cur) setPrayer(k, p, 'alone');
    else if (!on && cur && cur !== 'missed') setPrayer(k, p, null);
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
  /* ---------------------------------------------------------------- */
  /* HERO — "tanam bugun qanday?" bitta katta raqam bilan               */
  /* Oura/WHOOP ikkalasi ham shu qoidaga quriladi: tepada bitta ball,    */
  /* ostida bitta oddiy jumla, keyin uchtadan ko'p bo'lmagan ko'rsatkich */
  /* va har birining yonida SHAXSIY o'rtachadan farqi — quruq raqam      */
  /* hech narsa aytmaydi, farq aytadi.                                   */
  /* ---------------------------------------------------------------- */
  const ZONE_COLOR = { good: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger-text)' };
  /** Shu kunning WHOOP kesimi — bugun uchun ham, orqaga qaralgan kun uchun ham. */
  function dayRec(k) {
    if (!(D.S.whoop && D.S.whoop.connected && D.whoop && D.whoop.dayInsight)) return null;
    const i = safeVal(() => D.whoop.dayInsight(k));
    if (!i || i.recovery == null) return null;
    i.zone = i.recovery >= 67 ? 'good' : i.recovery >= 34 ? 'warn' : 'bad';
    return i;
  }
  /* ------------------------------------------------------------------ */
  /* PLITKALAR — 2×2: Tiklanish · Uyqu · Zo'riqish · Ovqat.               */
  /* Har biri o'z bo'limiga eshik: yorliq + «›», ostida holat so'zi,       */
  /* pastda katta raqam. Uch halqali karta va pastdagi uch raqam qatori    */
  /* shu to'rttaga birlashdi (2026-09-15, ko'mir qobiq). Soat ulanmagan    */
  /* kunda ikkitasi: Kun (soat) va Ovqat. Hisob-kitob (uyqu zonasi,        */
  /* yuklama) eski heroCard'dan ko'chdi; maslahat jumlasi Tana › Tayyorlik */
  /* da qoladi — plitkada faqat so'z.                                      */
  /* ------------------------------------------------------------------ */
  // Yarim doira yoyi: markaz (100,118), radius 90; pct 0..100 → 0..180°
  function arcPath(pct) {
    const a = Math.PI * (1 - D.clamp(pct, 0, 100) / 100);
    return `M10 118 A90 90 0 0 1 ${(100 + 90 * Math.cos(a)).toFixed(1)} ${(118 - 90 * Math.sin(a)).toFixed(1)}`;
  }
  function tileInner({ lab, state, stateCls, big, small, glow, arc }) {
    const deco = arc
      ? `<svg class="tile-arc" viewBox="0 0 200 120" fill="none" aria-hidden="true"><path d="M10 118 A90 90 0 0 1 190 118" stroke="var(--track)" stroke-width="10" stroke-linecap="round"/>${arc.pct > 0 ? `<path d="${arcPath(arc.pct)}" stroke="${arc.color}" stroke-width="10" stroke-linecap="round" opacity=".85"/>` : ''}</svg>`
      : glow ? `<i class="tile-glow" style="--g:${glow}"></i>` : '';
    return `<span class="tile-head"><span class="tile-lab">${esc(lab)}</span>${D.ic('chevR', 18)}</span>
      <span class="tile-state ${stateCls || ''}">${state ? esc(state) : ''}</span>
      ${deco}
      <span class="tile-big num">${big}${small ? `<small>${esc(small)}</small>` : ''}</span>`;
  }
  function tile(o) {
    return `<button type="button" class="card tile" data-act="go" data-view="${o.view}"${o.sub ? ` data-sub="${o.sub}"` : ''}${o.id ? ` id="${o.id}"` : ''}>${tileInner(o)}</button>`;
  }
  const hm = (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return `${H}<small>${esc(t('today.tile.h'))}</small> ${M}<small>${esc(t('today.tile.m'))}</small>`; };

  function recTile(i) {
    return tile({ lab: t('today.r.rec'), state: t('today.state.' + i.zone), stateCls: i.zone,
      big: `${D.fmtNum(i.recovery)}`, small: '%', arc: { pct: i.recovery, color: ZONE_COLOR[i.zone] }, view: 'health', sub: 'ready' });
  }
  function sleepTile(i) {
    const sh = i.sleepH;
    let z = '';
    if (i.gapH != null) z = i.gapH >= -0.5 ? 'good' : i.gapH >= -1.5 ? 'warn' : 'bad';
    else if (i.perf != null) z = i.perf >= 85 ? 'good' : i.perf >= 70 ? 'warn' : 'bad';
    return tile({ lab: t('today.r.sleep'), state: z ? t('today.tile.sleep.' + z) : (i.perf != null ? `${D.fmtNum(i.perf)}%` : ''), stateCls: z || 'dim',
      big: sh != null ? hm(sh) : '—', glow: 'var(--sleep)', view: 'health', sub: 'sleep' });
  }
  function strainTile(i, k) {
    const live = k === D.today() ? safeVal(() => (D.whoop.live ? D.whoop.live() : null)) : null;
    const strain = live && live.strain != null ? live.strain : i.strain;
    const tgt = i.strainTarget != null ? i.strainTarget : null;
    const gap = (tgt != null && strain != null) ? strain - tgt : null;
    const load = gap === null ? '' : gap > 3 ? 'over' : gap < -4 ? 'under' : 'ok';
    const cls = load === 'over' ? 'warn' : load === 'ok' ? 'good' : 'dim';
    return tile({ lab: t('today.r.strain'), state: load ? t('today.tile.strain.' + load) : (tgt != null ? t('today.d.target', { n: D.fmtNum(tgt, 1) }) : ''), stateCls: cls,
      big: strain != null ? D.fmtNum(strain, 1) : '—', glow: 'var(--accent)', view: 'health', sub: 'strain' });
  }
  function foodTile(k) {
    let tot = null, tg = null;
    try { tot = D.food && D.food.dayTotals ? D.food.dayTotals(k) : null; tg = D.food && D.food.targets ? D.food.targets() : null; } catch (e) {}
    return tile({ lab: t('nav.food'), state: tg && tg.kcal ? t('today.tile.food', { n: D.fmtNum(tg.kcal) }) : '', stateCls: 'dim',
      big: D.fmtNum(tot ? tot.kcal : 0), small: t('food.kcal'), view: 'health', sub: 'ovqat' });
  }
  // Soat ulanmagan kun uchun: soat va kun fazasi — `tick` har soniyada yangilaydi.
  const kunOpts = () => { const st = dayState(); return { lab: t('today.phase.' + st.phase), state: st.remain, stateCls: 'dim', big: `<span>${esc(st.clock)}</span>`, glow: 'var(--accent)', view: 'health', sub: 'ovqat', id: 'tdKun' }; };
  function kunTile() { return tile(kunOpts()); }

  function tileGrid(k) {
    const i = dayRec(k);
    const tiles = [];
    if (i) { tiles.push(recTile(i)); tiles.push(sleepTile(i)); tiles.push(strainTile(i, k)); }
    else if (k === D.today()) tiles.push(kunTile());
    tiles.push(foodTile(k));
    return `<div class="tiles">${tiles.join('')}</div>`;
  }

  function addRow(date, ph, act) {
    return `<div class="input-row td-add"><input class="inp" data-enter="${act}" data-date="${date}" placeholder="${esc(ph)}" autocomplete="off" enterkeyhint="done">
      <button class="btn sq" data-act="${act}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button></div>`;
  }
  // odat bajarilganmi: sanaladigani me'yorga yetsa, oddiysi belgilangan bo'lsa
  function habitDoneOn(k) {
    const logs = new Set(D.S.logs[k] || []), counts = D.S.counts[k] || {};
    return (h) => (h.target && h.target.n ? (+counts[h.id] || 0) >= +h.target.n : logs.has(h.id));
  }

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
  /* Sana ostidagi ustuncha — o'sha kunning ochkosi, kunlik maqsadga        */
  /* nisbatan. Ilgari u 4px li nuqta edi va faqat «nimadir bor» derdi;      */
  /* ustuncha shuni ham aytadi, qanchaligini ham. Ya'ni hafta bir qarashda  */
  /* o'z shaklini ko'rsatadi — qaysi kun bo'sh o'tgani ko'rinib turadi, va  */
  /* buning uchun sahifaga bitta ham yangi element qo'shilmadi.             */
  /* ------------------------------------------------------------------ */
  function weekStrip(k) {
    const td = D.today();
    // Hafta dushanbadan boshlanadi: o'zbek taqvimi shunday
    const dow = (D.dowOf(k) + 6) % 7;
    const start = D.addDays(k, -dow);
    const W = t('weekdaysShort');
    const keys = [];
    for (let i = 0; i < 7; i++) keys.push(D.addDays(start, i));
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const day = keys[i];
      const future = day > td;
      cells += `<button class="td-wd ${day === k ? 'on' : ''} ${day === td ? 'today' : ''}" data-act="tdPickDay" data-key="${day}" ${future ? 'disabled' : ''}>
        <span class="td-wd-l">${esc(W[D.dowOf(day)])}</span>
        <span class="td-wd-n num">${+day.slice(8)}</span>
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
  /* KUN KARTASI — bugun qanday ketyapti, faqat ko'rsatkich               */
  /*                                                                      */
  /* Ilgari bu karta ish maydoni edi: namozni ham, odatni ham, vazifani   */
  /* ham shu yerdan belgilash mumkin edi. Natijada bitta ro'yxatda besh   */
  /* xil narsa aralashib turardi, har biri o'z bo'limida ikkinchi marta   */
  /* ham bor edi va uzun kunda ro'yxat kesilib «Yana N ta» ga aylanardi.  */
  /* Endi Asosiy sahifa bitta savolga javob beradi — «kun qanday          */
  /* ketyapti?» — belgilash esa har narsaning o'z bo'limida.              */
  /*                                                                      */
  /* Namoz o'z qatorlari bilan ochiq turadi: kunning vaqtga bog'langan    */
  /* yagona ustuni shu, va uni bir qarashda ko'rish kerak. Odat, vazifa   */
  /* va maqsad — bittadan qator: nomi va hisobi, bosilsa o'z bo'limi.     */
  /* ------------------------------------------------------------------ */

  /* Beshta namoz qatori. Belgilangani yashil nuqta va holat so'zi bilan
     ko'rinadi, belgilanmagani esa vaqtini ko'rsatadi — so'z va raqam bir
     qarashda ajraladi. Qator bosilmaydi: belgilash Vazifa › Trekkerda. */
  function prayerRows(k) {
    const pr = D.S.prayers[k] || {};
    let times = null;
    try { times = D.prayer ? D.prayer.list(k) : null; } catch (e) { times = null; }
    const tmap = {};
    if (times) for (const x of times) tmap[x.id] = x;
    let done = 0, html = '';
    for (const id of D.PRAYERS) {          // D.PRAYERS allaqachon vaqt tartibida
      const st = pr[id] || null, x = tmap[id], on = !!(st && st !== 'missed');
      if (on) done++;
      const right = st ? esc(t('today.pr.' + st)) : x ? `<span class="num">${esc(x.time)}</span>` : '';
      html += `<div class="td-row k-namoz ${on ? 'done' : ''}">
        <i class="td-kind"></i>
        <span class="td-row-body"><span class="td-row-name">${esc(t('prayer.' + id))}</span></span>
        ${right ? `<span class="td-row-right">${right}</span>` : ''}
      </div>`;
    }
    return { html, done, total: D.PRAYERS.length };
  }

  // Odat hisobi. Namoz nomli odatlar (eski ma'lumotdan qolgan БОМДОД/ПЕШИН…)
  // bu yerda sanalmaydi — ular yuqorida namoz qatori bo'lib turibdi.
  // O'qilayotgan kitob ham kunlik belgi, shuning uchun shu hisobda.
  function habitCount(k) {
    const rev = prayerHabits().rev, isDone = habitDoneOn(k);
    const due = D.dueHabits(k).filter((h) => !rev[h.id]);
    let total = due.length, done = due.filter(isDone).length;
    for (const m of D.S.media) {
      if (m.status !== 'now') continue;
      total++;
      if (+((D.S.mediaLogs[k] || {})[m.id]) > 0) done++;
    }
    return { done, total };
  }
  function taskCount(k) {
    const list = tasksFor(k);
    return { done: list.filter((x) => x.done).length, total: list.length };
  }
  /* Maqsad kunlik narsa emas — shuning uchun bu yerdagi raqam shu yilgi
     maqsadlarning nechtasi yopilgani. Yili yozilmagani ham shu yilga
     qo'shiladi: yilsiz maqsad hech qaysi yilda ko'rinmay qolmasin. */
  function goalCount(k) {
    const y = k.slice(0, 4);
    const list = (D.S.goals || []).filter((g) => !g.year || String(g.year) === y);
    return { done: list.filter((g) => g.done).length, total: list.length };
  }

  /* Guruh qatori: rangli nuqta · nom · ingichka chiziq · hisob · o'q. */
  function grpHtml(kind, label, c, view, sub) {
    const all = c.total > 0 && c.done === c.total;
    const pct = c.total ? (c.done / c.total) * 100 : 0;
    return `<button class="td-grp k-${kind} ${all ? 'all' : ''}" data-act="go" data-view="${view}"${sub ? ` data-sub="${sub}"` : ''}>
      <i class="td-kind"></i>
      <span class="td-grp-name">${esc(label)}</span>
      <span class="bar thin td-grp-bar"><i class="bar-fill" style="width:${pct.toFixed(0)}%"></i></span>
      <span class="td-grp-n num">${c.total ? `${c.done} / ${c.total}` : '—'}</span>
      ${D.ic('chevR', 15)}
    </button>`;
  }

  function listCard(k) {
    const pr = prayerRows(k), hb = habitCount(k), ts = taskCount(k), gl = goalCount(k);
    // Kun hisobiga kunlik narsalargina kiradi — maqsad yillik, u tashqarida
    const done = pr.done + hb.done + ts.done;
    const total = pr.total + hb.total + ts.total;
    const all = total > 0 && done === total;
    const pct = total ? (done / total) * 100 : 0;
    return `<div class="card td-day ${all ? 'all-done' : ''}">
      <div class="td-day-head">
        <span class="td-day-title">${esc(t('today.dayList'))}</span>
        <span class="td-day-prog"><span class="bar thin td-day-bar"><i class="bar-fill" style="width:${pct.toFixed(0)}%"></i></span>
          <span class="num">${done} / ${total}</span></span>
      </div>
      ${grpHtml('namoz', t('today.prayers'), pr, 'tasks', 'habits')}
      <div class="td-rows td-pr-rows">${pr.html}</div>
      ${grpHtml('odat', t('today.habits'), hb, 'tasks', 'habits')}
      ${grpHtml('ish', t('today.tasks'), ts, 'tasks', 'tasks')}
      ${grpHtml('maqsad', t('today.goals'), gl, 'tasks', 'goals')}
      <div class="td-links">
        <button class="td-link" data-act="tdWrap">${D.ic('edit', 15)}<span>${esc(t('today.wrap'))}</span>${D.ic('chevR', 15)}</button>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* BUGUNGI MAQSAD                                                       */
  /*                                                                      */
  /* Bu blok ikki marta qayta yozildi. Birinchisi o'yin nishoni edi:       */
  /* doiradagi katta raqam, butun kenglikdagi dumaloq chiziq, sariq pill.  */
  /* Ikkinchisi «asbob shkalasi» — o'ttizta mayda kvadrat, har biri bir    */
  /* hovuch ochko. Fikri to'g'ri edi (chiziqni sanasa bo'lardi), lekin     */
  /* ko'rinishi noto'g'ri: takrorlanuvchi kvadratlar batareya va yuklanish */
  /* tilida gapiradi, va ular kartada IKKI marta, ikki o'lchamda turardi.  */
  /* Hech kim ularni sanamasdi. Egasi «umuman yoqmadi» dedi.               */
  /*                                                                      */
  /* Uchinchisi — hozirgisi: bo'linma yo'q, bitta uzluksiz rels va uning   */
  /* uchida yagona nur («hozir shu yerdasiz»). O'lchov birligi chiziqdan   */
  /* raqamga ko'chdi: 119 endi 13px emas, 34px. Kartada uch qavat qoldi —  */
  /* YORLIQ (nima o'lchanyapti) → RAQAM → JUMLA (keyin nima qilish kerak). */
  /* Rang bu yerda umuman yo'q: yashil faqat maqsad bajarilganda chiqadi.  */
  /* ------------------------------------------------------------------ */
  /** Bitta chiziq, uchida nur. `empty` — nol: nur yo'qoladi, aks holda u
      chapda osilib, «boshlandi» degan yolg'on signal berardi. */
  function rail(pct) {
    const p = D.clamp(pct, 0, 100);
    return `<span class="td-lv-rail${p <= 0 ? ' empty' : ''}" aria-hidden="true"><i style="width:${p.toFixed(1)}%"></i></span>`;
  }

  function levelRow() {
    const d = D.levels.day(), i = D.levels.info(), w = D.levels.week();
    // Bajarilganda «Bugungi maqsad bajarildi» deyilmaydi: «Bugungi maqsad»
    // yuqorida yorliq bo'lib turibdi, ya'ni gap ikki marta aytilardi.
    const note = d.done ? esc(t('today.lvDone')) : esc(t('lv.day.left', { n: D.fmtNum(d.left) }));
    const streak = d.cur ? esc(t('lv.day.streak', { n: D.fmtNum(d.cur) })) : '';
    const wTxt = esc(t('lv.w.' + w.id, { n: D.fmtNum(w.need) }));
    // Martaba nomi («Qadam») bu yerdan olib tashlandi: u darajadan kelib
    // chiqadi, ya'ni bitta narsa ikki xil aytilardi. To'liq nomi Daraja
    // oynasida — bu karta o'shani ochadi.
    return `<button type="button" class="card td-lv${d.done ? ' done' : ''}" data-act="lvOpen">
      <span class="td-lv-head"><span>${esc(t('lv.day.title'))}</span>${D.ic('chevR', 18)}</span>
      <span class="c-state${d.done ? ' good' : ''}">${d.done ? esc(t('today.lvDone')) : (streak || '&nbsp;')}</span>
      <span class="td-lv-hero">
        <b class="num">${D.fmtNum(d.xp)}</b><i class="num">/ ${D.fmtNum(d.goal)} ${esc(t('lv.xpUnit'))}</i>
      </span>
      ${rail(d.pct)}
      <span class="td-lv-sub">
        <span>${note}</span>
        <span class="td-lv-rank num" style="--c:${i.rank.c};--p:${i.pct.toFixed(1)}"><i aria-hidden="true"></i>${esc(t('today.lvl', { n: D.fmtNum(i.level) }))}</span>
      </span>
      <span class="td-lv-w${w.done ? ' done' : ''}">
        <span class="td-lv-wrow">
          <span class="td-lv-wt">${wTxt}</span>
          <span class="td-lv-wn num">${D.fmtNum(Math.min(w.cur, w.need))}<i>/${D.fmtNum(w.need)}</i></span>
        </span>
        ${rail(w.pct)}
      </span>
    </button>`;
  }

  /* ------------------------------------------------------------------ */
  /* live updates                                                        */
  /* ------------------------------------------------------------------ */
  D.on('tick', () => {
    if (D.current() !== 'today') return;
    try { D.patch('tdKun', tileInner(kunOpts())); } catch (e) { console.error(e); }
  });
  D.on('day:changed', () => { D.ui.viewDate = null; D.saveUi(); if (D.current() === 'today') D.rerender(); });
  // a prayer habit ticked on the Vazifa board (or any other view) mirrors into S.prayers like a Bugun tick; the emitter saves afterwards
  D.on('habit:toggled', (e) => { if (e && e.habit && e.day) syncPrayerFromHabit(e.day, e.habit.id, !!e.on); });
  // keyboard: core delegates clicks only — tayyorlik kartasi <div>, uni Enter/Space bilan ham ochish kerak
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.tile[data-act]')) return;
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
      const k = key();
      // Tartib uchta savolga qarab: "qaysi kun?" → "qayerdaman?" → "tanam
      // qanday?" → "kun qanday ketyapti?" → "kunning raqamlari". Belgilash
      // hech qaysi bosqichda yo'q: odat Trekkerda, vazifa Ro'yxatda, namoz
      // Ibodatda, suv esa Ovqat sahifasida yoziladi.
      // Daraja kartasi — kunning bosh raqami, plitkalardan oldin. Faqat bugungi
      // kunda ko'rinadi: o'tgan kunni ochganda "bugun +N ochko" yolg'on bo'lardi.
      const lv = k === td && D.levels ? safe(() => levelRow()) : '';
      return safe(() => weekStrip(k)) + lv + safe(() => tileGrid(k)) + safe(() => listCard(k));
    },
  });
})();
