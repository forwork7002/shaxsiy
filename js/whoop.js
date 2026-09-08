/* =====================================================================
   WHOOP — tarixni olish, kunlar bo'yicha saqlash, tendensiya va tayyorlik.
   Tokenlar serverda; bu yerda faqat /api/whoop/data proksisi orqali o'qish.
   D.whoop.sync({deep})   — recovery / sleep / cycle / workout / body
   D.whoop.day(key)       — o'sha kunning ko'rsatkichlari
   D.whoop.trend(field,n) — [{k, v}] grafik uchun
   D.whoop.readiness()    — Bugun bo'limidagi tayyorlik chizig'i
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;
  const AUTO_MS = 30 * 60 * 1000;   // avtomatik yangilash oralig'i
  const KEEP_DAYS = 180;            // kunlik yozuvlar tarixi
  const KEEP_WORKOUTS = 60;

  D.i18n.add({
    uz: {
      'wh.trend': 'Tendensiya', 'wh.trend.sub': 'oxirgi {n} kun', 'wh.workouts': "Mashg'ulotlar", 'wh.noWorkouts': "Mashg'ulot yozuvi yo'q",
      'wh.recovery': 'Tiklanish', 'wh.hrv': 'HRV', 'wh.rhr': 'Tinch puls', 'wh.sleepH': 'Uyqu', 'wh.strain': "Zo'riqish",
      'wh.avg': "o'rtacha", 'wh.best': 'eng yaxshi', 'wh.worst': 'eng past', 'wh.days': '{n} kun',
      'wh.ready': 'Tayyorlik', 'wh.ready.high': "Bugun kuch bering — tanangiz tayyor.", 'wh.ready.mid': "O'rtacha yuk oling.", 'wh.ready.low': "Bugun dam oling — tiklanish past.",
      'wh.autoSleep': 'Uyqu WHOOP’dan olindi', 'wh.syncing': 'Yangilanmoqda…', 'wh.deep': "To'liq tarix",
      'wh.range': 'Davr', 'wh.kcal': 'kkal', 'wh.hrAvg': "o'rt. puls", 'wh.dur': 'davomiylik',
      'wh.body': 'Tana', 'wh.height': "Bo'y", 'wh.weight': 'Vazn', 'wh.maxHr': 'Maks. puls',
      'wh.pulled': '{n} kunlik ma’lumot olindi', 'wh.sport': 'Mashq',
    },
    uzk: {
      'wh.trend': 'Тенденция', 'wh.trend.sub': 'охирги {n} кун', 'wh.workouts': 'Машғулотлар', 'wh.noWorkouts': 'Машғулот ёзуви йўқ',
      'wh.recovery': 'Тикланиш', 'wh.hrv': 'HRV', 'wh.rhr': 'Тинч пулс', 'wh.sleepH': 'Уйқу', 'wh.strain': 'Зўриқиш',
      'wh.avg': 'ўртача', 'wh.best': 'энг яхши', 'wh.worst': 'энг паст', 'wh.days': '{n} кун',
      'wh.ready': 'Тайёрлик', 'wh.ready.high': 'Бугун куч беринг — танангиз тайёр.', 'wh.ready.mid': 'Ўртача юк олинг.', 'wh.ready.low': 'Бугун дам олинг — тикланиш паст.',
      'wh.autoSleep': 'Уйқу WHOOP’дан олинди', 'wh.syncing': 'Янгиланмоқда…', 'wh.deep': 'Тўлиқ тарих',
      'wh.range': 'Давр', 'wh.kcal': 'ккал', 'wh.hrAvg': 'ўрт. пулс', 'wh.dur': 'давомийлик',
      'wh.body': 'Тана', 'wh.height': 'Бўй', 'wh.weight': 'Вазн', 'wh.maxHr': 'Макс. пулс',
      'wh.pulled': '{n} кунлик маълумот олинди', 'wh.sport': 'Машқ',
    },
    ru: {
      'wh.trend': 'Динамика', 'wh.trend.sub': 'последние {n} дн.', 'wh.workouts': 'Тренировки', 'wh.noWorkouts': 'Нет записей о тренировках',
      'wh.recovery': 'Восстановление', 'wh.hrv': 'HRV', 'wh.rhr': 'Пульс покоя', 'wh.sleepH': 'Сон', 'wh.strain': 'Нагрузка',
      'wh.avg': 'среднее', 'wh.best': 'лучшее', 'wh.worst': 'худшее', 'wh.days': '{n} дн.',
      'wh.ready': 'Готовность', 'wh.ready.high': 'Сегодня можно нагрузку — тело готово.', 'wh.ready.mid': 'Средняя нагрузка.', 'wh.ready.low': 'Сегодня отдых — восстановление низкое.',
      'wh.autoSleep': 'Сон взят из WHOOP', 'wh.syncing': 'Обновление…', 'wh.deep': 'Полная история',
      'wh.range': 'Период', 'wh.kcal': 'ккал', 'wh.hrAvg': 'ср. пульс', 'wh.dur': 'длительность',
      'wh.body': 'Тело', 'wh.height': 'Рост', 'wh.weight': 'Вес', 'wh.maxHr': 'Макс. пульс',
      'wh.pulled': 'Получены данные за {n} дн.', 'wh.sport': 'Тренировка',
    },
  });

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */
  function W() {
    const S = D.S;
    if (!S.whoop || typeof S.whoop !== 'object') S.whoop = { connected: false, lastSync: null, cache: {} };
    if (!S.whoop.days || typeof S.whoop.days !== 'object') S.whoop.days = {};
    if (!Array.isArray(S.whoop.workouts)) S.whoop.workouts = [];
    if (!S.whoop.body || typeof S.whoop.body !== 'object') S.whoop.body = {};
    return S.whoop;
  }
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const dayOfTs = (ts) => { try { return D.dayKey(new Date(ts)); } catch (e) { return null; } };

  /* ------------------------------------------------------------------ */
  /* parsing — one record → { key, fields }                              */
  /* ------------------------------------------------------------------ */
  function recRecovery(r) {
    if (!r || !r.score) return null;
    const k = dayOfTs(r.created_at || r.updated_at);
    if (!k) return null;
    const s = r.score, o = {};
    if (num(s.recovery_score) !== null) o.recovery = Math.round(+s.recovery_score);
    if (num(s.hrv_rmssd_milli) !== null) o.hrv = Math.round(+s.hrv_rmssd_milli);
    if (num(s.resting_heart_rate) !== null) o.rhr = Math.round(+s.resting_heart_rate);
    if (num(s.spo2_percentage) !== null) o.spo2 = D.round(+s.spo2_percentage, 1);
    if (num(s.skin_temp_celsius) !== null) o.skin = D.round(+s.skin_temp_celsius, 1);
    return Object.keys(o).length ? { k, o } : null;
  }
  function recSleep(r) {
    if (!r || !r.score) return null;
    if (r.nap) return null;                       // naps do not define the night
    const k = dayOfTs(r.end || r.start);          // the day you woke up on
    if (!k) return null;
    const s = r.score, st = s.stage_summary || {}, o = {};
    const rem = +st.total_rem_sleep_time_milli || 0, deep = +st.total_slow_wave_sleep_time_milli || 0,
      light = +st.total_light_sleep_time_milli || 0, awake = +st.total_awake_time_milli || 0,
      inBed = +st.total_in_bed_time_milli || 0;
    if (rem || deep || light || inBed) {
      o.stages = { rem, deep, light, awake };
      o.sleepH = D.round((inBed ? inBed - awake : rem + deep + light) / 3.6e6, 1);
    }
    if (num(s.sleep_performance_percentage) !== null) o.sleepPerf = Math.round(+s.sleep_performance_percentage);
    if (num(s.sleep_efficiency_percentage) !== null) o.sleepEff = Math.round(+s.sleep_efficiency_percentage);
    if (num(s.sleep_consistency_percentage) !== null) o.sleepCons = Math.round(+s.sleep_consistency_percentage);
    if (num(s.respiratory_rate) !== null) o.resp = D.round(+s.respiratory_rate, 1);
    if (r.start) o.bedTs = r.start;
    if (r.end) o.wakeTs = r.end;
    return Object.keys(o).length ? { k, o } : null;
  }
  function recCycle(r) {
    if (!r || !r.score) return null;
    const k = dayOfTs(r.start);
    if (!k) return null;
    const s = r.score, o = {};
    if (num(s.strain) !== null) o.strain = D.round(+s.strain, 1);
    if (num(s.kilojoule) !== null) o.kcal = Math.round(+s.kilojoule / 4.184);
    if (num(s.average_heart_rate) !== null) o.hrAvg = Math.round(+s.average_heart_rate);
    if (num(s.max_heart_rate) !== null) o.hrMax = Math.round(+s.max_heart_rate);
    return Object.keys(o).length ? { k, o } : null;
  }
  function recWorkout(r) {
    if (!r) return null;
    const k = dayOfTs(r.start);
    if (!k) return null;
    const s = r.score || {};
    return {
      id: String(r.id || r.start), k, start: r.start, end: r.end,
      sport: r.sport_name || (r.sport_id != null ? 'ID ' + r.sport_id : ''),
      strain: num(s.strain) !== null ? D.round(+s.strain, 1) : null,
      kcal: num(s.kilojoule) !== null ? Math.round(+s.kilojoule / 4.184) : null,
      hrAvg: num(s.average_heart_rate) !== null ? Math.round(+s.average_heart_rate) : null,
      hrMax: num(s.max_heart_rate) !== null ? Math.round(+s.max_heart_rate) : null,
      meters: num(s.distance_meter) !== null ? Math.round(+s.distance_meter) : null,
      mins: r.start && r.end ? Math.round((new Date(r.end) - new Date(r.start)) / 60000) : null,
    };
  }
  D.whoop = D.whoop || {};

  /* ------------------------------------------------------------------ */
  /* fetch                                                               */
  /* ------------------------------------------------------------------ */
  async function page(path, params) {
    const q = new URLSearchParams(Object.assign({ path }, params || {}));
    const r = await D.api('/api/whoop/data?' + q.toString());
    return r && typeof r === 'object' ? r : {};
  }
  // Pull `pages` pages of a collection, following WHOOP's next_token.
  async function collect(path, pages, limit) {
    const out = [];
    let token = null;
    for (let i = 0; i < pages; i++) {
      const p = { limit: limit || 25 };
      if (token) p.nextToken = token;
      const r = await page(path, p);
      const recs = Array.isArray(r.records) ? r.records : [];
      out.push(...recs);
      token = r.next_token || null;
      if (!token || !recs.length) break;
    }
    return out;
  }

  function merge(days, hit) {
    if (!hit) return;
    const d = (days[hit.k] = days[hit.k] || {});
    Object.assign(d, hit.o);
  }
  function prune(w) {
    const keys = Object.keys(w.days).sort();
    if (keys.length > KEEP_DAYS) for (const k of keys.slice(0, keys.length - KEEP_DAYS)) delete w.days[k];
    w.workouts.sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    if (w.workouts.length > KEEP_WORKOUTS) w.workouts.length = KEEP_WORKOUTS;
  }

  let syncing = false;
  D.whoop.syncing = () => syncing;
  /**
   * Pull WHOOP data into S.whoop.days / .workouts / .body.
   * deep=true fetches more pages (manual refresh); the auto path stays cheap.
   */
  D.whoop.sync = async (opts = {}) => {
    if (syncing) return null;
    if (!D.serverEnabled()) throw new Error('need_server');
    syncing = true;
    const pages = opts.deep ? 3 : 1;
    try {
      const soft = (p) => collect(p, pages).catch((e) => ({ __err: e }));
      const [rec, slp, cyc, wko] = await Promise.all([
        soft('/recovery'), soft('/activity/sleep'), soft('/cycle'), soft('/activity/workout'),
      ]);
      const errs = [rec, slp, cyc, wko].filter((x) => x && x.__err);
      if (errs.length === 4) throw errs[0].__err;
      const w = W();
      const days = w.days;
      if (Array.isArray(rec)) for (const r of rec) merge(days, recRecovery(r));
      if (Array.isArray(slp)) for (const r of slp) merge(days, recSleep(r));
      if (Array.isArray(cyc)) for (const r of cyc) merge(days, recCycle(r));
      if (Array.isArray(wko)) {
        const byId = new Map(w.workouts.map((x) => [x.id, x]));
        for (const r of wko) { const x = recWorkout(r); if (x) byId.set(x.id, x); }
        w.workouts = Array.from(byId.values());
      }
      if (opts.deep) {
        try {
          const b = await page('/user/measurement/body');
          if (b && (b.height_meter || b.weight_kilogram)) {
            w.body = { heightCm: b.height_meter ? Math.round(+b.height_meter * 100) : null, weightKg: b.weight_kilogram ? D.round(+b.weight_kilogram, 1) : null, maxHr: b.max_heart_rate || null };
          }
        } catch (e) { /* optional */ }
      }
      // today's snapshot keeps feeding the existing hero card
      const today = D.today();
      const latest = days[today] || days[D.addDays(today, -1)] || {};
      w.cache = Object.assign({}, w.cache, latest);
      w.connected = true;
      w.lastSync = Date.now();
      prune(w);
      const filled = D.whoop.fillSleep();
      D.save();
      return { days: Object.keys(days).length, workouts: w.workouts.length, filled };
    } finally { syncing = false; }
  };

  /* auto-sync: on boot and when the health view opens, at most every AUTO_MS */
  D.whoop.autoSync = () => {
    const w = W();
    if (!w.connected || !D.serverEnabled() || syncing) return;
    if (w.lastSync && Date.now() - w.lastSync < AUTO_MS) return;
    D.whoop.sync().then((r) => { if (r) D.rerender(); }).catch(() => {});
  };

  /* ------------------------------------------------------------------ */
  /* reading                                                             */
  /* ------------------------------------------------------------------ */
  D.whoop.day = (k) => (W().days[k] || null);
  D.whoop.has = () => Object.keys(W().days).length > 0;
  D.whoop.trend = (field, n) => {
    const days = W().days;
    return D.lastDays(n || 30).map((k) => ({ k, v: num(days[k] && days[k][field]) }));
  };
  D.whoop.stats = (field, n) => {
    const vs = D.whoop.trend(field, n).map((x) => x.v).filter((x) => x !== null);
    if (!vs.length) return null;
    return { avg: D.round(D.avg(vs), field === 'strain' || field === 'sleepH' ? 1 : 0), min: Math.min(...vs), max: Math.max(...vs), n: vs.length };
  };
  /** Fill health[date].sleep from WHOOP when the user has not typed one. Returns how many days were filled. */
  D.whoop.fillSleep = () => {
    const days = W().days;
    let n = 0;
    for (const k of Object.keys(days)) {
      const sh = num(days[k].sleepH);
      if (sh === null) continue;
      const rec = (D.S.health[k] = D.S.health[k] || { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
      if (num(rec.sleep) === null) { rec.sleep = sh; rec.sleepFromWhoop = true; n++; }
      else if (rec.sleepFromWhoop && rec.sleep !== sh) { rec.sleep = sh; n++; }
      if (days[k].bedTs && !rec.bed) { const p = D.nowTz(new Date(days[k].bedTs)); rec.bed = D.fmtTime(p.h, p.min); }
      if (days[k].wakeTs && !rec.wake) { const p = D.nowTz(new Date(days[k].wakeTs)); rec.wake = D.fmtTime(p.h, p.min); }
    }
    return n;
  };
  D.whoop.readiness = () => {
    const w = W();
    if (!w.connected) return null;
    const today = D.today();
    const d = w.days[today] || w.days[D.addDays(today, -1)] || w.cache || {};
    const rec = num(d.recovery);
    if (rec === null) return null;
    const zone = rec >= 67 ? 'good' : rec >= 34 ? 'warn' : 'bad';
    return { pct: rec, zone, sleepH: num(d.sleepH), strain: num(d.strain), hrv: num(d.hrv), rhr: num(d.rhr),
      label: t(zone === 'good' ? 'wh.ready.high' : zone === 'warn' ? 'wh.ready.mid' : 'wh.ready.low') };
  };

  /* ------------------------------------------------------------------ */
  /* render helpers used by the Health view                              */
  /* ------------------------------------------------------------------ */
  const FIELDS = [
    { f: 'recovery', c: 'var(--success)', unit: '%' },
    { f: 'sleepH', c: 'var(--info)', unit: 'h' },
    { f: 'strain', c: 'var(--accent)', unit: '' },
    { f: 'hrv', c: 'var(--violet)', unit: 'ms' },
    { f: 'rhr', c: 'var(--warning)', unit: 'bpm' },
  ];
  const RANGES = [14, 30, 90];
  D.act.whRange = (el) => { D.ui.filters.whRange = +el.dataset.n; D.saveUi(); D.rerender(); };

  D.whoop.trendCard = () => {
    if (!D.whoop.has()) return '';
    const n = RANGES.includes(+D.ui.filters.whRange) ? +D.ui.filters.whRange : 30;
    const seg = `<div class="seg compact wh-range">${RANGES.map((r) => `<button class="${r === n ? 'on' : ''}" data-act="whRange" data-n="${r}">${esc(t('wh.days', { n: r }))}</button>`).join('')}</div>`;
    const rows = FIELDS.map(({ f, c, unit }) => {
      const st = D.whoop.stats(f, n);
      if (!st) return '';
      const series = D.whoop.trend(f, n);
      const vals = series.map((x) => x.v);
      const known = vals.filter((v) => v !== null);
      const lo = Math.min(...known), hi = Math.max(...known);
      // gaps are carried forward so the line stays continuous; the count below says how many real readings there are
      let last = known[0];
      const filled = vals.map((v) => (v === null ? last : (last = v)));
      return `<div class="wh-trend-row">
        <div class="wh-trend-head"><span class="wh-trend-name">${esc(t('wh.' + f))}</span>
          <span class="wh-trend-val num" style="color:${c}">${st.avg}${unit ? `<small>${unit}</small>` : ''}</span></div>
        <div class="wh-trend-chart">${D.chart.spark({ values: filled, color: c, height: 46, fill: true, min: lo, max: hi })}</div>
        <div class="wh-trend-foot"><span>${esc(t('wh.avg'))} <b class="num">${st.avg}</b></span><span>${esc(t('wh.worst'))} <b class="num">${st.min}</b></span><span>${esc(t('wh.best'))} <b class="num">${st.max}</b></span><span class="muted num">${st.n}/${n}</span></div>
      </div>`;
    }).filter(Boolean).join('');
    if (!rows) return '';
    return `<div class="card wh-trend"><div class="card-head"><div class="title">${D.ic('trend', 16)} ${esc(t('wh.trend'))}</div>${seg}</div>${rows}</div>`;
  };

  D.whoop.workoutsCard = () => {
    const w = W();
    if (!w.connected) return '';
    const list = w.workouts.slice(0, 10);
    const body = list.length ? `<ul class="list wh-wo">${list.map((x) => {
      const bits = [];
      if (x.mins) bits.push(`${x.mins} ${t('unit.m')}`);
      if (x.hrAvg) bits.push(`${x.hrAvg} ${t('wh.hrAvg')}`);
      if (x.kcal) bits.push(`${D.fmtNum(x.kcal)} ${t('wh.kcal')}`);
      if (x.meters) bits.push(`${D.round(x.meters / 1000, 2)} km`);
      return `<li class="li"><span class="wh-wo-ic">${D.ic('dumbbell', 16)}</span>
        <div class="li-body"><div class="li-text">${esc(x.sport || t('wh.sport'))}</div>
          <div class="li-meta"><span class="num">${esc(D.fmtDate(x.k))}</span>${bits.length ? `<span>${esc(bits.join(' · '))}</span>` : ''}</div></div>
        ${x.strain != null ? `<span class="li-right num wh-wo-strain">${x.strain}</span>` : ''}</li>`;
    }).join('')}</ul>` : `<div class="empty">${esc(t('wh.noWorkouts'))}</div>`;
    return `<div class="card"><div class="card-head"><div class="title">${D.ic('dumbbell', 16)} ${esc(t('wh.workouts'))}</div>${list.length ? `<span class="small muted num">${list.length}</span>` : ''}</div>${body}</div>`;
  };

  D.whoop.bodyCard = () => {
    const b = W().body || {};
    if (!b.heightCm && !b.weightKg && !b.maxHr) return '';
    const cell = (v, l) => `<div class="stat"><div class="stat-num num">${v}</div><div class="stat-label">${esc(l)}</div></div>`;
    return `<div class="card"><div class="card-head"><div class="title">${D.ic('user', 16)} ${esc(t('wh.body'))}</div></div>
      <div class="stat-grid">${b.heightCm ? cell(`${b.heightCm}<small>cm</small>`, t('wh.height')) : ''}${b.weightKg ? cell(`${b.weightKg}<small>kg</small>`, t('wh.weight')) : ''}${b.maxHr ? cell(`${b.maxHr}<small>bpm</small>`, t('wh.maxHr')) : ''}</div></div>`;
  };

  /* boot + day rollover */
  D.on('boot', () => { setTimeout(() => { try { D.whoop.autoSync(); } catch (e) {} }, 2500); });
  D.on('day:changed', () => { try { D.whoop.autoSync(); } catch (e) {} });
})();
