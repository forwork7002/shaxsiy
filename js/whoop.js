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
      'wh.i.need': 'kerak {h} soat', 'wh.i.target': 'me’yor {m}', 'wh.i.base': 'odatda {b}',
      'wh.i.vsBase': '30 kunlik odatingiz **{b}%** edi — bugun **{n}**',
      'wh.i.sleepOk': 'Uyqu yetarli — kerakli **{need} soat**ni qopladingiz',
      'wh.i.sleepShort': 'Uyqu **{h} soat** kam — kerak edi {need} soat',
      'wh.i.hrvUp': 'HRV odatdagidan **{p}%** yuqori (odatda {b} ms) — tana tetik',
      'wh.i.hrvDown': 'HRV odatdagidan **{p}%** past (odatda {b} ms) — yuklamani kamaytiring',
      'wh.i.rhrUp': 'Tinch puls **{n} bpm** yuqori (odatda {b}) — charchoq yoki kasallik belgisi',
      'wh.i.rhrDown': 'Tinch puls **{n} bpm** past (odatda {b}) — yaxshi tiklanish',
      'wh.i.over': 'Zo‘riqish **{s}** — bugungi me’yor {m} edi, ortiqcha yuk',
      'wh.i.room': 'Yuk uchun joy bor — bugun **{m}** gacha ko‘tarsangiz bo‘ladi',
      'wh.i.kcal': 'Sarflandi **{k} kkal** (taxminiy me’yor {t})',
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
      'wh.i.need': 'керак {h} соат', 'wh.i.target': 'меъёр {m}', 'wh.i.base': 'одатда {b}',
      'wh.i.vsBase': '30 кунлик одатингиз **{b}%** эди — бугун **{n}**',
      'wh.i.sleepOk': 'Уйқу етарли — керакли **{need} соат**ни қопладингиз',
      'wh.i.sleepShort': 'Уйқу **{h} соат** кам — керак эди {need} соат',
      'wh.i.hrvUp': 'HRV одатдагидан **{p}%** юқори (одатда {b} мс) — тана тетик',
      'wh.i.hrvDown': 'HRV одатдагидан **{p}%** паст (одатда {b} мс) — юкламани камайтиринг',
      'wh.i.rhrUp': 'Тинч пулс **{n} bpm** юқори (одатда {b}) — чарчоқ ёки касаллик белгиси',
      'wh.i.rhrDown': 'Тинч пулс **{n} bpm** паст (одатда {b}) — яхши тикланиш',
      'wh.i.over': 'Зўриқиш **{s}** — бугунги меъёр {m} эди, ортиқча юк',
      'wh.i.room': 'Юк учун жой бор — бугун **{m}** гача кўтарсангиз бўлади',
      'wh.i.kcal': 'Сарфланди **{k} ккал** (тахминий меъёр {t})',
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
      'wh.i.need': 'нужно {h} ч', 'wh.i.target': 'норма {m}', 'wh.i.base': 'обычно {b}',
      'wh.i.vsBase': 'ваша норма за 30 дн. — **{b}%**, сегодня **{n}**',
      'wh.i.sleepOk': 'Сна достаточно — вы закрыли норму **{need} ч**',
      'wh.i.sleepShort': 'Сна меньше на **{h} ч** — нужно было {need} ч',
      'wh.i.hrvUp': 'HRV выше обычного на **{p}%** (обычно {b} мс) — тело свежее',
      'wh.i.hrvDown': 'HRV ниже обычного на **{p}%** (обычно {b} мс) — снизьте нагрузку',
      'wh.i.rhrUp': 'Пульс покоя выше на **{n} bpm** (обычно {b}) — усталость или болезнь',
      'wh.i.rhrDown': 'Пульс покоя ниже на **{n} bpm** (обычно {b}) — хорошее восстановление',
      'wh.i.over': 'Нагрузка **{s}** — норма на сегодня была {m}, это перебор',
      'wh.i.room': 'Есть запас — сегодня можно до **{m}**',
      'wh.i.kcal': 'Потрачено **{k} ккал** (примерная норма {t})',
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
    // WHOOP's own sleep-need model beats a flat 7.5h target: baseline + debt + strain + naps
    const need = s.sleep_needed || {};
    const needMs = (+need.baseline_milli || 0) + (+need.need_from_sleep_debt_milli || 0) + (+need.need_from_recent_strain_milli || 0) - (+need.need_from_recent_nap_milli || 0);
    if (needMs > 0) o.sleepNeedH = D.round(needMs / 3.6e6, 1);
    if (+need.need_from_sleep_debt_milli) o.debtH = D.round(+need.need_from_sleep_debt_milli / 3.6e6, 1);
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
  /* derived metrics — what the numbers mean, not just what they are     */
  /* ------------------------------------------------------------------ */
  /** Mean of a field over the n days BEFORE `key` (the personal baseline to compare today against). */
  D.whoop.baseline = (field, key, n) => {
    const days = W().days;
    const vs = [];
    let k = D.addDays(key || D.today(), -1);
    for (let i = 0; i < (n || 30); i++) { const v = num(days[k] && days[k][field]); if (v !== null) vs.push(v); k = D.addDays(k, -1); }
    return vs.length >= 3 ? D.avg(vs) : null;
  };
  /** Mifflin–St Jeor BMR × activity, used only when WHOOP has no calorie figure. */
  function tdeeEstimate() {
    const p = D.S.profile || {};
    const kg = num(p.weightKg) ?? num((W().body || {}).weightKg);
    const cm = num(p.heightCm) ?? num((W().body || {}).heightCm);
    const age = num(p.age);
    if (kg === null || cm === null || age === null) return null;
    const bmr = 10 * kg + 6.25 * cm - 5 * age + (p.sex === 'f' ? -161 : 5);
    const f = [1.2, 1.3, 1.375, 1.46, 1.55, 1.725][D.clamp(Math.round(+p.activity || 3), 0, 5)];
    return Math.round(bmr * f);
  }
  D.whoop.tdee = tdeeEstimate;

  D.whoop.dayInsight = (key) => {
    key = key || D.today();
    const d = W().days[key];
    if (!d) return null;
    const o = { key };
    const sleepH = num(d.sleepH), need = num(d.sleepNeedH);
    o.sleepH = sleepH; o.needH = need;
    if (sleepH !== null && need !== null) { o.gapH = D.round(sleepH - need, 1); o.metPct = Math.round((sleepH / need) * 100); }
    o.perf = num(d.sleepPerf); o.eff = num(d.sleepEff); o.cons = num(d.sleepCons); o.debtH = num(d.debtH);
    o.recovery = num(d.recovery); o.strain = num(d.strain); o.kcal = num(d.kcal);
    o.hrv = num(d.hrv); o.rhr = num(d.rhr); o.resp = num(d.resp); o.spo2 = num(d.spo2); o.skin = num(d.skin);
    // deviation from the user's own 30-day baseline — far more meaningful than a population range
    const bHrv = D.whoop.baseline('hrv', key, 30), bRhr = D.whoop.baseline('rhr', key, 30), bRec = D.whoop.baseline('recovery', key, 30);
    if (o.hrv !== null && bHrv) { o.hrvBase = Math.round(bHrv); o.hrvPct = Math.round(((o.hrv - bHrv) / bHrv) * 100); }
    if (o.rhr !== null && bRhr) { o.rhrBase = Math.round(bRhr); o.rhrDelta = Math.round(o.rhr - bRhr); }
    if (o.recovery !== null && bRec) { o.recBase = Math.round(bRec); o.recDelta = Math.round(o.recovery - bRec); }
    // strain the body was ready for: WHOOP's own rule of thumb is that recovery sets the ceiling
    if (o.recovery !== null) {
      o.strainTarget = D.round(4 + (o.recovery / 100) * 14, 1);   // 4 at 0% recovery → 18 at 100%
      if (o.strain !== null) {
        o.strainGap = D.round(o.strain - o.strainTarget, 1);
        o.load = o.strainGap > 3 ? 'over' : o.strainGap < -4 ? 'under' : 'ok';
      }
    }
    // energy: WHOOP burn vs an estimated maintenance
    const tdee = tdeeEstimate();
    if (o.kcal !== null) { o.tdee = tdee; if (tdee) o.kcalDelta = o.kcal - tdee; }
    return o;
  };

  /* 7-day rolled-up sleep debt straight from WHOOP's need model */
  D.whoop.sleepDebt = (n) => {
    const days = W().days;
    let debt = 0, seen = 0;
    for (const k of D.lastDays(n || 7)) {
      const d = days[k]; if (!d) continue;
      const sh = num(d.sleepH), need = num(d.sleepNeedH);
      if (sh === null || need === null) continue;
      seen++; debt += Math.max(0, need - sh);
    }
    return seen ? { h: D.round(debt, 1), days: seen } : null;
  };

  /* ------------------------------------------------------------------ */
  /* the WHOOP day card rendered inside Sog'liq                          */
  /* ------------------------------------------------------------------ */
  D.whoop.dayCard = (key) => {
    const w = W();
    if (!w.connected) return '';
    const i = D.whoop.dayInsight(key);
    if (!i) return '';
    const zRec = i.recovery >= 67 ? 'good' : i.recovery >= 34 ? 'warn' : 'bad';
    const ringColor = zRec === 'good' ? 'var(--success)' : zRec === 'warn' ? 'var(--warning)' : 'var(--danger-text)';
    const rows = [];
    if (i.gapH !== null && i.gapH !== undefined) {
      const good = i.gapH >= -0.5;
      rows.push({ good, txt: t(good ? 'wh.i.sleepOk' : 'wh.i.sleepShort', { h: Math.abs(i.gapH), need: i.needH }) });
    }
    if (i.hrvPct !== undefined && Math.abs(i.hrvPct) >= 8) rows.push({ good: i.hrvPct > 0, txt: t(i.hrvPct > 0 ? 'wh.i.hrvUp' : 'wh.i.hrvDown', { p: Math.abs(i.hrvPct), b: i.hrvBase }) });
    if (i.rhrDelta !== undefined && Math.abs(i.rhrDelta) >= 3) rows.push({ good: i.rhrDelta < 0, txt: t(i.rhrDelta > 0 ? 'wh.i.rhrUp' : 'wh.i.rhrDown', { n: Math.abs(i.rhrDelta), b: i.rhrBase }) });
    if (i.load === 'over') rows.push({ good: false, txt: t('wh.i.over', { s: i.strain, m: i.strainTarget }) });
    else if (i.load === 'under') rows.push({ good: true, txt: t('wh.i.room', { m: i.strainTarget }) });
    if (i.kcalDelta !== undefined && i.tdee) rows.push({ good: true, txt: t('wh.i.kcal', { k: D.fmtNum(i.kcal), t: D.fmtNum(i.tdee) }) });

    const strip = (h) => h.replace(/^<p>/, '').replace(/<\/p>$/, '');
    const tile = (v, l, zone, sub) => `<div class="bento-tile">${zone ? `<i class="zone z-${zone}"></i>` : ''}<div class="val">${v}</div><div class="lab">${esc(l)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
    return `<div class="hero wh-day">
        <div class="hero-eyebrow">${D.ic('bolt', 12)} WHOOP · ${esc(D.fmtDate(i.key))}</div>
        <div class="hero-main">
          ${D.chart.ring({ pct: i.recovery || 0, size: 104, stroke: 9, color: ringColor, label: i.recovery != null ? i.recovery + '%' : '—', sub: t('wh.recovery') })}
          <div class="hero-body">
            <div class="hero-title">${esc(i.recovery == null ? t('hl.wh.noData') : t(zRec === 'good' ? 'wh.ready.high' : zRec === 'warn' ? 'wh.ready.mid' : 'wh.ready.low'))}</div>
            ${i.recDelta !== undefined ? `<div class="hero-sub">${strip(D.ai ? D.ai.md(t('wh.i.vsBase', { n: (i.recDelta > 0 ? '+' : '') + i.recDelta, b: i.recBase })) : esc(t('wh.i.vsBase', { n: (i.recDelta > 0 ? '+' : '') + i.recDelta, b: i.recBase })))}</div>` : ''}
          </div>
        </div>
        <div class="bento wh-day-grid">
          ${tile(i.sleepH != null ? `${i.sleepH}<small>${t('unit.h')}</small>` : '—', t('wh.sleepH'), i.metPct == null ? '' : i.metPct >= 90 ? 'good' : i.metPct >= 75 ? 'warn' : 'bad', i.needH ? t('wh.i.need', { h: i.needH }) : '')}
          ${tile(i.strain != null ? i.strain : '—', t('wh.strain'), i.load === 'over' ? 'bad' : i.load === 'ok' ? 'good' : '', i.strainTarget ? t('wh.i.target', { m: i.strainTarget }) : '')}
          ${tile(i.hrv != null ? `${i.hrv}<small>ms</small>` : '—', t('wh.hrv'), i.hrvPct === undefined ? '' : i.hrvPct >= -5 ? 'good' : i.hrvPct >= -15 ? 'warn' : 'bad', i.hrvBase ? t('wh.i.base', { b: i.hrvBase }) : '')}
          ${tile(i.rhr != null ? `${i.rhr}<small>bpm</small>` : '—', t('wh.rhr'), i.rhrDelta === undefined ? '' : i.rhrDelta <= 1 ? 'good' : i.rhrDelta <= 4 ? 'warn' : 'bad', i.rhrBase ? t('wh.i.base', { b: i.rhrBase }) : '')}
        </div>
        ${rows.length ? `<div class="wh-notes">${rows.map((r) => `<div class="wh-note ${r.good ? 'good' : 'warn'}">${D.ic(r.good ? 'check' : 'alert', 14)}<span>${strip(D.ai ? D.ai.md(r.txt) : esc(r.txt))}</span></div>`).join('')}</div>` : ''}
      </div>`;
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
