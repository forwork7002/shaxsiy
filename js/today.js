/* =====================================================================
   today.js — Asosiy: kunning ko'zgusi. Bu sahifada hech narsa
   belgilanmaydi; har bir raqam o'z bo'limiga eshik.
   hafta chizig'i · WHOOP tayyorlik hero (tiklanish + uyqu/zo'riqish/HRV) ·
   kun kartasi (namoz qatorlari + odat/vazifa/maqsad guruhlari) ·
   uchta raqam (kkal · suv · sarflandi) · kun yakuni (izoh + shukr)
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'today.dayList': 'Bugun qilinadi', 'today.spentToday': 'Sarflandi',

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
      'today.state.good': 'TAYYOR', 'today.state.warn': "O'RTACHA", 'today.state.bad': 'DAM OL',
      'today.adv.good': "Bugun {n} gacha zo'riqish ko'tarasiz",
      'today.adv.warn': "{n} atrofida zo'riqish yetarli",
      'today.adv.bad': "Dam oling — {n} dan oshirmang",
      'today.adv.over': "Chegara oshdi ({s}/{n}) — qolgan kun dam",
      'today.d.short': '{h} kam', 'today.d.over': '{h} ortiq', 'today.d.target': 'chegara {n}',
      'today.d.base': "o'rtachadan {p}", 'today.d.noData': "ma'lumot yo'q",
      'today.debt': '7 kunda {h} uyqu qarzi',
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
    },
  });

  const PRAYER_RX = {
    bomdod: /(bomdod|fajr|fadjr)/, peshin: /(peshin|zuhr|zuxr)/, asr: /\basr\b/,
    shom: /(shom|maghrib|magrib)/, xufton: /(xufton|isha)/,
  };
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
        const n = D.translit.norm(h.name);
        for (const p of D.PRAYERS) if (!map[p] && PRAYER_RX[p].test(n)) { map[p] = h.id; rev[h.id] = p; break; }
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
    if (D.PRAYERS.every((p) => !o[p])) delete D.S.prayers[k]; else D.S.prayers[k] = o;
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
     qarashda ajraladi. Qator bosilmaydi: belgilash Ibodat bo'limida. */
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
      ${grpHtml('namoz', t('today.prayers'), pr, 'prayer', 'log')}
      <div class="td-rows td-pr-rows">${pr.html}</div>
      ${grpHtml('odat', t('today.habits'), hb, 'tasks', 'habits')}
      ${grpHtml('ish', t('today.tasks'), ts, 'tasks', 'tasks')}
      ${grpHtml('maqsad', t('today.goals'), gl, 'tasks', 'goals')}
      <div class="td-links">
        <button class="td-link" data-act="tdWrap">${D.ic('edit', 15)}<span>${esc(t('today.wrap'))}</span>${D.ic('chevR', 15)}</button>
      </div>
    </div>`;
  }

  /* Uchta raqam — kun oxirida qaraladigan narsalar; uchalasi ham o'z
     bo'limiga eshik. Suv sanagichi Ovqat sahifasida: u ham ichiladigan
     narsa va bu yerda faqat raqami turadi. */
  function numbersStrip(k) {
    let tot = null, tg = null, w = null;
    try { tot = D.food && D.food.dayTotals ? D.food.dayTotals(k) : null; tg = D.food && D.food.targets ? D.food.targets() : null; } catch (e) {}
    try { w = D.food && D.food.water ? D.food.water(k) : null; } catch (e) {}
    let spent = 0;
    try { for (const x of (D.S.finance && D.S.finance.tx) || []) if (x.date === k && x.type === 'out') spent += +x.amount || 0; } catch (e) {}
    // fmtMoney summani valyuta so'ziga uzilmas bo'shliq bilan bog'laydi — keng
    // joyda to'g'ri, uchdan bir plitkada esa butun ibora bir qatorga sig'maydi
    // va brauzer so'zning o'rtasidan qirqadi («so'» / «m»). Shu yerda oxirgi
    // bo'shliq oddiy bo'shliqqa aylanadi: qator «185 000» / «so'm» bo'lib
    // bo'linadi. Mingliklar orasidagi bo'shliqlar tegilmaydi.
    const money = D.fmtMoney(spent).replace(/\u00A0(?=\D*$)/, ' ');
    return `<div class="td-strip2">
      <button class="td-strip2-item" data-act="go" data-view="health" data-sub="ovqat">
        <span class="td-strip2-val num">${D.fmtNum(tot ? tot.kcal : 0)}${tg && tg.kcal ? `<small> / ${D.fmtNum(tg.kcal)}</small>` : ''}</span>
        <span class="td-strip2-lab">${esc(t('food.kcal'))}</span></button>
      <button class="td-strip2-item" data-act="go" data-view="health" data-sub="ovqat">
        <span class="td-strip2-val num">${D.fmtNum(w ? w.n : 0)}<small> / ${D.fmtNum(w ? w.goal : 0)}</small></span>
        <span class="td-strip2-lab">${esc(t('today.water'))}</span></button>
      <button class="td-strip2-item" data-act="go" data-view="finance">
        <span class="td-strip2-val num">${esc(money)}</span>
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
  // keyboard: core delegates clicks only — tayyorlik kartasi <div>, uni Enter/Space bilan ham ochish kerak
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.td-ready[data-act]')) return;
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
      // Tartib uchta savolga qarab: "qaysi kun?" → "tanam qanday?" →
      // "kun qanday ketyapti?" → "kunning raqamlari". Belgilash hech qaysi
      // bosqichda yo'q: odat Trekkerda, vazifa Ro'yxatda, namoz Ibodatda,
      // suv esa Ovqat sahifasida yoziladi.
      return safe(() => weekStrip(k)) + safe(() => heroCard(k)) + safe(() => listCard(k)) + safe(() => numbersStrip(k));
    },
  });
})();
