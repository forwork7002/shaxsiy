/* =====================================================================
   Dash — core runtime. Everything else builds on `window.D`.
   store · dates · i18n runtime · router · UI kit · icons · charts · undo · sync
   ===================================================================== */
(function () {
  'use strict';

  const D = (window.D = {});
  D.VERSION = 2;
  const LS_KEY = 'dash.v2';
  const UI_KEY = 'dash.ui';
  const DEV_KEY = 'dash.device';

  /* ------------------------------------------------------------------ */
  /* tiny helpers                                                        */
  /* ------------------------------------------------------------------ */
  D.$ = (sel, root) => (root || document).querySelector(sel);
  D.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  D.esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  D.uid = (p) => (p || 'x') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
  D.clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  D.sum = (arr, fn) => (arr || []).reduce((s, x) => s + (fn ? +fn(x) || 0 : +x || 0), 0);
  D.avg = (arr) => (arr && arr.length ? D.sum(arr) / arr.length : 0);
  D.round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
  D.debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  D.by = (key, dir = 1) => (a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0);
  D.deep = (o) => JSON.parse(JSON.stringify(o));
  D.pad2 = (n) => String(n).padStart(2, '0');

  /* ------------------------------------------------------------------ */
  /* events                                                              */
  /* ------------------------------------------------------------------ */
  const bus = {};
  D.on = (name, fn) => ((bus[name] = bus[name] || []).push(fn), fn);
  D.off = (name, fn) => (bus[name] = (bus[name] || []).filter((f) => f !== fn));
  D.emit = (name, data) => (bus[name] || []).forEach((f) => { try { f(data); } catch (e) { console.error(e); } });

  /* ------------------------------------------------------------------ */
  /* default state + normalisation                                       */
  /* ------------------------------------------------------------------ */
  D.SPHERE_IDS = ['ruh', 'aql', 'qalb', 'tana', 'boshqa', 'aralash'];
  D.DIRS = ['shaxsiy', 'oilaviy', 'ish', 'moliyaviy'];
  D.PRAYERS = ['bomdod', 'peshin', 'asr', 'shom', 'xufton'];

  function defaultState() {
    return {
      meta: { v: D.VERSION, updatedAt: 0, deviceId: '', migratedFrom: null },
      settings: {
        lang: 'uz', theme: 'dark', tz: 'Asia/Tashkent', dayStart: 0, wakeHour: 6, sleepHour: 23,
        currency: 'UZS', weightUnit: 'kg', waterMl: 250, waterTargetMl: null,
        prayer: { lat: 41.2995, lng: 69.2401, fajr: 18, isha: 18, asr: 'hanafi',
                  offsets: { bomdod: 0, quyosh: 0, peshin: 0, asr: 0, shom: 0, xufton: 0 }, hijriOffset: 0, notify: false },
        caffeineLimit: 400, showAmounts: true, onboarded: false,
      },
      profile: { name: '', heightCm: null, weightKg: null, age: null, sex: 'm', activity: 3 },
      habits: [], logs: {}, counts: {}, notes: {}, gratitude: [],
      tasks: [], goals: [],
      prayers: {}, dhikr: {}, fasting: {},
      health: {},
      caffeine: { logs: [], custom: [] },
      stack: { items: [], taken: {} },
      gym: { gyms: [], days: [], exercises: [], logs: {}, done: {}, split: { names: [], anchor: null } },
      finance: { tx: [], cats: [], budgets: {}, accounts: [], subs: [], snapshots: [], wishlist: [] },
      learn: [], reviews: [],
      nova: { threads: [] },
      ai: { cards: {}, log: [] },
      whoop: { connected: false, lastSync: null, cache: {}, days: {}, workouts: [], body: {} },
    };
  }
  D.defaultState = defaultState;

  // Deep-merge missing keys from defaults (never overwrite existing values).
  function fill(target, def) {
    if (Array.isArray(def)) return Array.isArray(target) ? target : [];
    if (def && typeof def === 'object') {
      const out = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
      for (const k of Object.keys(def)) out[k] = fill(out[k], def[k]);
      return out;
    }
    return target === undefined || target === null ? def : target;
  }
  D.normalize = (s) => {
    const n = fill(s || {}, defaultState());
    // habit defaults
    n.habits.forEach((h, i) => {
      if (!h.id) h.id = D.uid('h');
      if (h.active === undefined) h.active = true;
      if (!h.schedule) h.schedule = { type: 'daily' };
      if (!D.SPHERE_IDS.includes(h.sphere)) h.sphere = 'boshqa';
      if (h.order === undefined) h.order = i;
    });
    for (const k of Object.keys(n.logs)) if (!Array.isArray(n.logs[k]) || !n.logs[k].length) delete n.logs[k];
    n.tasks.forEach((t) => { if (!t.id) t.id = D.uid('t'); if (!t.priority) t.priority = 2; });
    n.goals.forEach((g) => { if (!g.id) g.id = D.uid('g'); if (!g.priority) g.priority = 2; if (!D.DIRS.includes(g.dir)) g.dir = 'shaxsiy'; });
    if (!n.finance.cats.length) n.finance.cats = defaultCats();
    n.meta.v = D.VERSION;
    return n;
  };
  function defaultCats() {
    return [
      ['oziq', 'Oziq-ovqat', '🍽️'], ['transport', 'Transport', '🚌'], ['kommunal', 'Kommunal', '💡'], ['kiyim', 'Kiyim', '👕'],
      ['soglik', "Sog'liq", '💊'], ['talim', "Ta'lim", '📚'], ['sadaqa', 'Hadya/Sadaqa', '🤲'], ['restoran', 'Restoran', '☕'],
      ['uy', 'Uy/Remont', '🏠'], ['boshqa', 'Boshqa', '📦'], ['maosh', 'Maosh', '💼'],
    ].map(([id, name, icon]) => ({ id, name, icon }));
  }
  D.defaultCats = defaultCats;

  /* ------------------------------------------------------------------ */
  /* migration from the old Шахсий mini-app export                       */
  /* ------------------------------------------------------------------ */
  const OLD_DIR = { 'Шахсий': 'shaxsiy', 'Оилавий': 'oilaviy', 'Иш/Бизнес': 'ish', 'Молиявий': 'moliyaviy' };
  const OLD_CAT = { 'Озиқ-овқат': 'oziq', 'Транспорт': 'transport', 'Коммуналка': 'kommunal', 'Кийим': 'kiyim', 'Соғлиқ': 'soglik',
                    'Таълим': 'talim', 'Ҳадя/Садақа': 'sadaqa', 'Ресторан': 'restoran', 'Уй/Ремонт': 'uy', 'Бошқа': 'boshqa' };
  D.isOldFormat = (j) => j && Array.isArray(j.habits) && (j.habits.length === 0 || 'nom' in (j.habits[0] || {})) && !j.settings;
  D.migrateOld = (o) => {
    const n = defaultState();
    n.meta.migratedFrom = 'shaxsiy';
    n.settings.lang = 'uzk';
    n.habits = (o.habits || []).map((h, i) => ({
      id: h.id || D.uid('h'), name: h.nom || '', sphere: D.SPHERE_IDS.includes(h.soha) ? h.soha : 'boshqa',
      active: h.faol !== false, schedule: { type: 'daily' }, target: null, remind: null, createdAt: 0, order: i,
    }));
    n.logs = o.logs || {};
    n.notes = o.notes || {};
    n.gratitude = (o.gratitude || []).map((g) => ({ id: g.id || D.uid('gr'), date: g.sana || null, text: g.matn || '' }));
    n.tasks = (o.tasks || []).map((t) => ({ id: t.id || D.uid('t'), text: t.matn || '', date: t.sana || null, done: !!t.bajarildi,
      doneAt: null, priority: +t.muhimlik || 2, createdAt: 0, goalId: null }));
    n.goals = (o.goals || []).map((g) => ({ id: g.id || D.uid('g'), text: g.matn || '', dir: OLD_DIR[g.yonalish] || 'shaxsiy',
      priority: +g.muhimlik || 2, year: g.yil ? +g.yil : null, done: !!g.bajarildi, doneAt: null }));
    n.finance.cats = defaultCats();
    n.finance.tx = (o.finance || []).map((f) => {
      let cat = OLD_CAT[f.kategoriya];
      if (!cat && f.kategoriya) {
        cat = D.uid('c'); n.finance.cats.push({ id: cat, name: f.kategoriya, icon: '📦' });
      }
      return { id: f.id || D.uid('f'), date: f.sana || D.today(), type: f.tur === 'kirim' ? 'in' : 'out', amount: +f.summa || 0,
        cat: cat || 'boshqa', note: f.izoh || '', accountId: null };
    });
    n.learn = (o.learn || []).map((l) => ({ id: l.id || D.uid('l'), type: l.tur || 'kitob', name: l.nom || '', author: l.muallif || '',
      status: l.holat === 'tugadi' ? 'tugadi' : 'jarayonda', progress: null, total: null, createdAt: 0 }));
    for (const [k, v] of Object.entries(o.health || {})) {
      n.health[k] = { weight: v.weight ? +v.weight : null, sleep: v.sleep ? +v.sleep : null, bed: null, wake: null,
        water: +v.water || 0, mood: typeof v.mood === 'number' ? v.mood : null, tags: [], note: v.note || '' };
    }
    return D.normalize(n);
  };

  /* ------------------------------------------------------------------ */
  /* storage                                                             */
  /* ------------------------------------------------------------------ */
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { console.warn('ls', e); return false; } }
  D.lsGet = lsGet; D.lsSet = lsSet;

  D.ui = fill(lsGet(UI_KEY), { view: 'today', sub: {}, viewDate: null, filters: {}, collapsed: {} });
  D.saveUi = D.debounce(() => lsSet(UI_KEY, D.ui), 150);
  D.device = fill(lsGet(DEV_KEY), { novaKey: '', whoop: null, lockHash: '' });
  D.saveDevice = () => lsSet(DEV_KEY, D.device);

  D.S = null;
  D.load = () => {
    let s = lsGet(LS_KEY);
    if (!s) {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { // corrupt — keep a copy, never overwrite
        try { localStorage.setItem('dash.corrupt.' + Date.now(), raw); } catch (e) {}
        D._corrupt = true;
      }
    }
    D.S = D.normalize(s || defaultState());
    if (!D.S.meta.deviceId) D.S.meta.deviceId = D.uid('dev');
    return D.S;
  };

  let syncState = 'ok';
  D.setSync = (s, msg) => {
    syncState = s;
    const dot = D.$('#syncDot'), txt = D.$('#syncTxt');
    if (dot) dot.className = 'sync-dot ' + s;
    if (txt) txt.textContent = msg || D.t('sync.' + s);
  };
  D.syncState = () => syncState;

  // Merge a remote snapshot into local: union of date-keyed maps and id-arrays (local wins on conflict),
  // newer wins for settings/profile. Used when the server holds a newer copy than the one we branched from.
  const DATE_MAPS = ['logs', 'counts', 'notes', 'health', 'prayers', 'dhikr', 'fasting'];
  const ID_LISTS = ['habits', 'gratitude', 'tasks', 'goals', 'learn', 'reviews'];
  function unionById(a, b) {
    const out = [], seen = new Set();
    for (const x of a || []) if (x && x.id && !seen.has(x.id)) { seen.add(x.id); out.push(x); }
    for (const x of b || []) if (x && x.id && !seen.has(x.id)) { seen.add(x.id); out.push(x); }
    return out;
  }
  D.merge = (remote, local) => {
    const r = D.normalize(D.deep(remote)), l = local;
    const newer = (+r.meta.updatedAt || 0) > (+l.meta.updatedAt || 0) ? r : l;
    const out = D.normalize(D.deep(newer));
    for (const k of DATE_MAPS) out[k] = Object.assign({}, r[k], l[k]);
    for (const k of ID_LISTS) out[k] = unionById(l[k], r[k]);
    out.finance.tx = unionById(l.finance.tx, r.finance.tx);
    out.finance.accounts = unionById(l.finance.accounts, r.finance.accounts);
    out.finance.subs = unionById(l.finance.subs, r.finance.subs);
    out.finance.wishlist = unionById(l.finance.wishlist, r.finance.wishlist);
    out.finance.cats = unionById(l.finance.cats, r.finance.cats);
    out.finance.budgets = Object.assign({}, r.finance.budgets, l.finance.budgets);
    out.caffeine.logs = unionById(l.caffeine.logs, r.caffeine.logs);
    out.caffeine.custom = unionById(l.caffeine.custom, r.caffeine.custom);
    out.stack.items = unionById(l.stack.items, r.stack.items);
    out.stack.taken = Object.assign({}, r.stack.taken, l.stack.taken);
    out.gym.exercises = unionById(l.gym.exercises, r.gym.exercises);
    out.gym.gyms = unionById(l.gym.gyms, r.gym.gyms);
    out.gym.days = unionById(l.gym.days, r.gym.days);
    out.gym.done = Object.assign({}, r.gym.done, l.gym.done);
    out.gym.logs = Object.assign({}, r.gym.logs);
    for (const k of Object.keys(l.gym.logs || {})) out.gym.logs[k] = unionById(l.gym.logs[k], r.gym.logs[k]);
    out.nova.threads = unionById(l.nova.threads, r.nova.threads);
    out.meta.deviceId = l.meta.deviceId;
    out.meta.updatedAt = Math.max(+r.meta.updatedAt || 0, +l.meta.updatedAt || 0, Date.now());
    return out;
  };

  const pushServer = D.debounce(async () => {
    if (!D.serverEnabled()) { D.setSync('local'); return; }
    try {
      const r = await D.api('/api/data', { method: 'POST', body: JSON.stringify(D.S) });
      if (r && r.updated) D.S.meta.serverUpdated = r.updated;
      D.setSync('ok');
      D._pending = false;
    } catch (e) {
      if (e && e.message === 'stale' && e.data) {
        // server has a newer copy — merge it in, then push the merged state
        D.S = D.merge(e.data, D.S);
        lsSet(LS_KEY, D.S);
        D.emit('state:changed');
        D.rerender();
        pushServer();
        return;
      }
      console.warn('sync', e);
      D._pending = true;
      D.setSync('err');
    }
  }, 700);

  D.save = () => {
    D.S.meta.updatedAt = Date.now();
    lsSet(LS_KEY, D.S);
    D.setSync(D.serverEnabled() ? 'wait' : 'local');
    pushServer();
    D.emit('state:changed');
  };
  // Persist without touching updatedAt (UI-only mutations of state).
  D.saveQuiet = () => lsSet(LS_KEY, D.S);

  // Server availability: Telegram context or explicit dev flag / same-origin api.
  D.tg = (window.Telegram && window.Telegram.WebApp) || null;
  D.serverEnabled = () => !!(D.tg && D.tg.initData) || window.DASH_SERVER === true || /[?&]server=1/.test(location.search);

  D.api = async (path, opts = {}) => {
    const h = { 'Content-Type': 'application/json' };
    if (D.tg && D.tg.initData) h['X-Telegram-Init-Data'] = D.tg.initData;
    // credentials: the passcode session lives in an HttpOnly cookie
    const r = await fetch(path, { credentials: 'same-origin', ...opts, headers: { ...h, ...(opts.headers || {}) } });
    if (r.status === 401 && !opts._retry) {
      let j = null;
      try { j = await r.clone().json(); } catch (e) {}
      if (j && j.passcode) {
        const ok = await D.auth.ask();
        if (ok) return D.api(path, { ...opts, _retry: true });
      }
    }
    if (!r.ok) {
      let msg = 'HTTP ' + r.status, data = null;
      try { const j = await r.json(); if (j && j.error) msg = j.error; if (j && j.data) data = j.data; } catch (e) {}
      const err = new Error(msg); err.status = r.status; err.data = data;
      throw err;
    }
    return r.json();
  };

  // Pull from server at boot; server wins if newer, else push local.
  D.pull = async () => {
    if (!D.serverEnabled()) return false;
    try {
      D.setSync('wait');
      const remote = await D.api('/api/data');
      const localEmpty = !Object.keys(D.S.logs).length && !D.S.habits.length && !D.S.tasks.length;
      if (remote && D.isOldFormat(remote)) {
        // server still holds the old Шахсий data.json → migrate once, keep local additions, push new format
        const migrated = D.migrateOld(remote);
        migrated.meta.deviceId = D.S.meta.deviceId;
        D.S = localEmpty ? migrated : D.merge(migrated, D.S);
        D.S.meta.updatedAt = Date.now();
        lsSet(LS_KEY, D.S);
        D.theme.apply(); D.renderNav();
        D.emit('state:changed');
        D.rerender();
        pushServer();
      } else if (remote && remote.meta) {
        const rU = +remote.meta.updatedAt || 0, lU = +D.S.meta.updatedAt || 0;
        if (localEmpty && rU) {
          D.S = D.normalize(remote);
          if (!D.S.meta.deviceId) D.S.meta.deviceId = D.uid('dev');
          lsSet(LS_KEY, D.S);
          D.emit('state:changed');
          D.rerender();
        } else if (rU > lU) {
          D.S = D.merge(remote, D.S);
          lsSet(LS_KEY, D.S);
          D.emit('state:changed');
          D.rerender();
          pushServer();
        } else if (lU > rU) pushServer();
        if (remote.whoop && typeof remote.whoop.connected === 'boolean') D.S.whoop.connected = remote.whoop.connected;
      } else if (remote && !Object.keys(remote).length && !localEmpty) {
        pushServer(); // fresh server, populated client
      }
      D.setSync('ok');
      return true;
    } catch (e) {
      console.warn('pull', e);
      D.setSync('err');
      return false;
    }
  };
  window.addEventListener('online', () => { if (D._pending) pushServer(); });

  /* ------------------------------------------------------------------ */
  /* dates (all in settings.tz)                                          */
  /* ------------------------------------------------------------------ */
  const fmtCache = {};
  function partsIn(tz, date) {
    let f = fmtCache[tz];
    if (!f) {
      try {
        f = fmtCache[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' });
      } catch (e) {
        f = fmtCache[tz] = new Intl.DateTimeFormat('en-GB', { hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' });
      }
    }
    const o = {};
    for (const p of f.formatToParts(date)) o[p.type] = p.value;
    const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] ?? 0;
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute, s: +o.second, dow };
  }
  D.nowTz = (date) => partsIn((D.S && D.S.settings.tz) || 'Asia/Tashkent', date || new Date());
  D.keyOf = (y, m, d) => y + '-' + D.pad2(m) + '-' + D.pad2(d);
  D.dayKey = (date) => {
    const p = D.nowTz(date);
    const k = D.keyOf(p.y, p.m, p.d);
    const start = (D.S && +D.S.settings.dayStart) || 0;
    return start && p.h < start ? D.addDays(k, -1) : k;
  };
  D.today = () => D.dayKey();
  D.parseKey = (k) => { const [y, m, d] = String(k).split('-').map(Number); return { y, m, d }; };
  D.addDays = (key, n) => {
    const { y, m, d } = D.parseKey(key);
    const dt = new Date(Date.UTC(y, m - 1, d + n));
    return D.keyOf(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  };
  D.daysBetween = (a, b) => {
    const A = D.parseKey(a), B = D.parseKey(b);
    return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 86400000);
  };
  D.dowOf = (key) => { const { y, m, d } = D.parseKey(key); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  D.monthKey = (key) => String(key || D.today()).slice(0, 7);
  D.weekKey = (key) => { // ISO week
    const { y, m, d } = D.parseKey(key || D.today());
    const t = new Date(Date.UTC(y, m - 1, d));
    const dow = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dow);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() + '-W' + D.pad2(Math.ceil(((t - y0) / 86400000 + 1) / 7));
  };
  D.lastDays = (n, end) => { const out = []; let k = end || D.today(); for (let i = 0; i < n; i++) { out.unshift(k); k = D.addDays(k, -1); } return out; };
  D.daysInMonth = (mk) => { const [y, m] = mk.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
  D.fmtDate = (key, style = 'short') => {
    if (!key) return '';
    const { y, m, d } = D.parseKey(key);
    const M = D.t('months'), W = D.t('weekdays'), sep = D.t('date.sep') === 'date.sep' ? '-' : D.t('date.sep');
    const dow = D.dowOf(key);
    if (style === 'long') return `${d}${sep}${M[m - 1]} ${y}, ${W[dow]}`;
    if (style === 'weekday') return `${d}${sep}${M[m - 1]}, ${W[dow]}`;
    if (style === 'month') return `${M[m - 1]} ${y}`;
    if (style === 'dm') return `${d} ${M[m - 1].slice(0, 3)}`;
    if (style === 'iso') return key;
    return `${d}${sep}${M[m - 1]}`;
  };
  D.fmtTime = (h, m) => D.pad2(Math.floor(h)) + ':' + D.pad2(Math.floor(m));
  D.fmtMins = (mins) => { const h = Math.floor(mins / 60), m = Math.floor(mins % 60); return h ? `${h} ${D.t('unit.h')} ${m} ${D.t('unit.m')}` : `${m} ${D.t('unit.m')}`; };
  D.fmtTs = (ts) => { if (!ts) return '—'; const p = D.nowTz(new Date(ts)); return D.fmtDate(D.keyOf(p.y, p.m, p.d)) + ' ' + D.fmtTime(p.h, p.min); };

  /* ------------------------------------------------------------------ */
  /* numbers                                                             */
  /* ------------------------------------------------------------------ */
  D.fmtNum = (n, d) => { n = +n || 0; return (d !== undefined ? +n.toFixed(d) : n).toLocaleString('ru-RU'); };
  D.fmtMoney = (n, opts = {}) => {
    if (D.S && D.S.settings.showAmounts === false && !opts.force) return '•••';
    const cur = opts.currency || (D.S ? D.S.settings.currency : 'UZS');
    const v = Math.round(+n || 0);
    const sign = v < 0 ? '−' : '';
    const s = Math.abs(v).toLocaleString('ru-RU');
    const sym = { UZS: "so'm", USD: '$', EUR: '€', RUB: '₽', KZT: '₸' }[cur] || cur;
    // non-breaking space so an amount never wraps away from its currency
    return sym.length === 1 ? `${sign}${sym}${s}` : `${sign}${s}\u00A0${sym}`;
  };
  D.fmtPct = (x, d = 0) => (Math.round((+x || 0) * 10 ** d) / 10 ** d) + '%';
  D.fmtKg = (kg) => { if (kg == null || kg === '') return '—'; const u = D.S.settings.weightUnit; return u === 'lb' ? D.round(kg * 2.20462, 1) + ' lb' : D.round(+kg, 1) + ' kg'; };

  /* ------------------------------------------------------------------ */
  /* i18n runtime                                                        */
  /* ------------------------------------------------------------------ */
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  D.i18n = {
    add(t) { for (const l of Object.keys(t)) Object.assign(TABLES[l] = TABLES[l] || {}, t[l]); },
    tables: TABLES,
  };
  D.lang = () => (D.S && D.S.settings.lang) || 'uz';
  D.t = (key, params) => {
    const l = D.lang();
    let s = TABLES[l][key];
    if (s === undefined) s = TABLES.uz[key];
    if (s === undefined) return key;
    if (Array.isArray(s)) return s;
    if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : '{' + k + '}'));
    return s;
  };
  D.setLang = (l) => { D.S.settings.lang = l; document.documentElement.lang = l === 'ru' ? 'ru' : 'uz'; D.save(); D.renderNav(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* theme                                                               */
  /* ------------------------------------------------------------------ */
  D.theme = {
    apply() {
      const t = (D.S && D.S.settings.theme) || 'dark';
      const dark = t === 'dark' || (t === 'auto' && !(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches));
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      const meta = D.$('meta[name=theme-color]');
      if (meta) meta.content = dark ? '#050506' : '#faf7f2';
      if (D.tg && D.tg.setHeaderColor) { try { D.tg.setHeaderColor(dark ? '#0a0a0b' : '#faf7f2'); D.tg.setBackgroundColor(dark ? '#050506' : '#faf7f2'); } catch (e) {} }
    },
    set(t) { D.S.settings.theme = t; D.save(); D.theme.apply(); D.rerender(); },
  };

  /* ------------------------------------------------------------------ */
  /* spheres                                                             */
  /* ------------------------------------------------------------------ */
  D.spheres = D.SPHERE_IDS.map((id) => ({ id, color: `var(--${id})`, name: () => D.t('sphere.' + id) }));
  D.sphere = (id) => D.spheres.find((s) => s.id === id) || D.spheres[4];

  /* ------------------------------------------------------------------ */
  /* habit helpers                                                       */
  /* ------------------------------------------------------------------ */
  D.habitDue = (h, key) => {
    const sc = h.schedule || { type: 'daily' };
    if (sc.type === 'days') return (sc.days || []).includes(D.dowOf(key));
    if (sc.type === 'week') return true; // counted weekly; shown daily
    return true;
  };
  D.habitDone = (h, key) => {
    if (h.target && h.target.n) return ((D.S.counts[key] || {})[h.id] || 0) >= h.target.n;
    return (D.S.logs[key] || []).includes(h.id);
  };
  // grace-day streak: if today not done, start from yesterday. Unscheduled days are skipped (neutral).
  D.habitStreak = (h) => {
    let k = D.today(), n = 0, guard = 0;
    if (!D.habitDone(h, k)) k = D.addDays(k, -1);
    while (guard++ < 4000) {
      if (!D.habitDue(h, k)) { k = D.addDays(k, -1); continue; }
      if (D.habitDone(h, k)) { n++; k = D.addDays(k, -1); } else break;
    }
    return n;
  };
  D.streak = (set) => { // generic from Set of keys
    let k = D.today(), n = 0;
    if (!set.has(k)) k = D.addDays(k, -1);
    while (set.has(k)) { n++; k = D.addDays(k, -1); }
    return n;
  };
  D.activeHabits = () => D.S.habits.filter((h) => h.active).sort((a, b) => (a.order || 0) - (b.order || 0));
  D.dueHabits = (key) => D.activeHabits().filter((h) => D.habitDue(h, key));

  /* ------------------------------------------------------------------ */
  /* undo                                                                */
  /* ------------------------------------------------------------------ */
  const undoStack = [];
  D.undo = {
    push(e) { undoStack.push(e); if (undoStack.length > 30) undoStack.shift(); },
    pop() { const e = undoStack.pop(); if (e) { try { e.undo(); } catch (x) { console.error(x); } D.save(); D.rerender(); D.toast(D.t('undo.done')); } },
    size: () => undoStack.length,
  };
  D.remove = (arr, id, opts = {}) => {
    const i = arr.findIndex((x) => x.id === id);
    if (i < 0) return false;
    const [item] = arr.splice(i, 1);
    D.undo.push({ label: opts.label, undo: () => arr.splice(Math.min(i, arr.length), 0, item) });
    D.save(); D.rerender();
    D.toast(opts.label || D.t('undo.deleted'), { undo: () => D.undo.pop() });
    return true;
  };

  /* ------------------------------------------------------------------ */
  /* UI kit: toast, modal, confirm, sheet                                */
  /* ------------------------------------------------------------------ */
  let toastTimer;
  D.toast = (msg, opts = {}) => {
    const el = D.$('#toast');
    if (!el) return;
    el.innerHTML = `<span>${D.esc(msg)}</span>` + (opts.undo ? `<button class="toast-undo" data-act="toastUndo">${D.t('undo.btn')}</button>` : '');
    el._undo = opts.undo || null;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), opts.ms || (opts.undo ? 5000 : 1800));
  };
  D.act = {};
  D.act.toastUndo = () => { const el = D.$('#toast'); if (el && el._undo) { const f = el._undo; el._undo = null; el.classList.remove('show'); f(); } };

  D.modal = (o) => {
    const bg = D.$('#modalBg');
    const acts = (o.actions || [{ label: D.t('btn.close'), act: 'closeModal' }]).map((a) =>
      `<button class="btn ${a.primary ? '' : 'ghost'} ${a.danger ? 'danger' : ''}" data-act="${a.act}" ${a.data ? Object.entries(a.data).map(([k, v]) => `data-${k}="${D.esc(v)}"`).join(' ') : ''}>${D.esc(a.label)}</button>`).join('');
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${D.esc(o.title || '')}">
      <div class="modal-head"><div class="modal-title">${D.esc(o.title || '')}</div><button class="modal-close" data-act="closeModal" aria-label="close">×</button></div>
      <div class="modal-body">${o.body || ''}</div>
      ${acts ? `<div class="modal-actions">${acts}</div>` : ''}</div>`;
    bg.classList.add('show');
    document.body.classList.add('modal-open');
    bg._onClose = o.onClose || null;
    if (o.onOpen) setTimeout(o.onOpen, 0);
    const f = bg.querySelector('input,textarea,select,button.btn');
    if (f && !o.noFocus) setTimeout(() => f.focus(), 30);
  };
  D.closeModal = () => {
    const bg = D.$('#modalBg');
    if (!bg || !bg.classList.contains('show')) return;
    bg.classList.remove('show');
    document.body.classList.remove('modal-open');
    const f = bg._onClose; bg._onClose = null; bg.innerHTML = '';
    if (f) f();
  };
  D.act.closeModal = () => D.closeModal();
  D.confirm = (o = {}) => new Promise((res) => {
    D.modal({
      title: o.title || D.t('confirm.title'),
      body: `<p class="confirm-text">${D.esc(o.text || '')}</p>`,
      actions: [{ label: o.cancel || D.t('btn.cancel'), act: 'confirmNo' }, { label: o.ok || D.t('btn.ok'), act: 'confirmYes', primary: !o.danger, danger: !!o.danger }],
      onClose: () => res(false),
    });
    D._confirmRes = res;
  });
  D.act.confirmYes = () => { const r = D._confirmRes; D._confirmRes = null; const bg = D.$('#modalBg'); bg._onClose = null; D.closeModal(); r && r(true); };
  D.act.confirmNo = () => { D.closeModal(); };
  D.sheet = (html, opts = {}) => D.modal({ title: opts.title || '', body: html, actions: opts.actions || [], onOpen: opts.onOpen, onClose: opts.onClose });
  D.prompt = (o = {}) => new Promise((res) => {
    D.modal({
      title: o.title || '', body: `<input class="inp" id="promptInp" value="${D.esc(o.value || '')}" placeholder="${D.esc(o.placeholder || '')}" data-enter="promptOk">`,
      actions: [{ label: D.t('btn.cancel'), act: 'closeModal' }, { label: o.ok || D.t('btn.ok'), act: 'promptOk', primary: true }],
      onClose: () => res(null),
    });
    D._promptRes = res;
  });
  D.act.promptOk = () => { const v = (D.$('#promptInp') || {}).value; const r = D._promptRes; D._promptRes = null; D.$('#modalBg')._onClose = null; D.closeModal(); r && r(v); };

  /* ------------------------------------------------------------------ */
  /* icons (Lucide-style stroke SVG, currentColor)                       */
  /* ------------------------------------------------------------------ */
  const P = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkSq: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
    wallet: '<path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"/><path d="M16 3H6a2 2 0 0 0-2 2v2"/><path d="M18 14h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
    fire: '<path fill="currentColor" stroke="none" d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-.5-2 2 1 3.5 3 3.5 5.5A6 6 0 0 1 6 14.5C6 9 12 6 12 2Z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22M6.53 6.53A18.6 18.6 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.47-1.53"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevL: '<path d="M15 18l-6-6 6-6"/>',
    chevR: '<path d="M9 18l6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    droplet: '<path d="M12 2.69s6 6.16 6 10.31a6 6 0 0 1-12 0c0-4.15 6-10.31 6-10.31Z"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/>',
    scale: '<path d="M16 16.5c0 1.5-2 2.5-4 2.5s-4-1-4-2.5M12 3v3M3 8l3 8h6l-3-8M21 8l-3 8h-6l3-8"/><path d="M3 8h18"/>',
    dumbbell: '<path d="M6.5 6.5h11M6.5 17.5h11M3 10v4M21 10v4M6 8v8M18 8v8"/><path d="M6 12h12"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    home: '<path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mosque: '<path d="M4 21h16M5 21v-7M19 21v-7M7 14h10M7 14a5 5 0 0 1 10 0M12 4v3M12 3l1-1M12 3l-1-1"/><path d="M8 21v-3a2 2 0 0 1 4 0M12 18a2 2 0 0 1 4 0v3"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    trendDown: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m10.3 3.9-8.2 14.2A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
    flag: '<path d="M4 22V4a1 1 0 0 1 1-1h11l-1 4 1 4H5"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    hands: '<path d="M11 14V6a2 2 0 1 0-4 0v8M7 14V8a2 2 0 1 0-4 0v7a7 7 0 0 0 14 0v-3a2 2 0 1 0-4 0M15 12V9a2 2 0 1 1 4 0v6"/>',
    beads: '<circle cx="12" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="15" cy="19" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="6" cy="8" r="2"/>',
    brain: '<path d="M12 4a3 3 0 0 0-3 3v10a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z"/><path d="M9 8a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3M15 8a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3"/>',
    apple: '<path d="M12 6c-2-2-6-1-7 3s2 9 4 10 3-1 3-1 1 2 3 1 5-6 4-10-5-5-7-3Z"/><path d="M12 6c0-2 1-3 2-4"/>',
    timer: '<path d="M10 2h4M12 14v-4"/><circle cx="12" cy="14" r="8"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.2 6.4-6.4 2.2 2.2-6.4Z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 9.1-9.1M17 5l3 3M14 8l3 3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  };
  D.ic = (name, size = 18, extra = '') => {
    const p = P[name] || P.info;
    return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
  };
  D.icons = P;

  /* ------------------------------------------------------------------ */
  /* charts (return SVG/HTML strings)                                    */
  /* ------------------------------------------------------------------ */
  D.chart = {
    ring({ pct = 0, size = 120, stroke = 8, color = 'var(--success)', track = 'var(--line)', label = '', sub = '', glow = true, id = '' }) {
      const r = (size - stroke) / 2, C = 2 * Math.PI * r, p = D.clamp(pct, 0, 100);
      return `<div class="ring-wrap" style="width:${size}px;height:${size}px" ${id ? `id="${id}"` : ''}>
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
          <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
            stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - p / 100)).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})" ${glow ? 'style="filter:drop-shadow(0 0 6px ' + color + ')"' : ''}/>
        </svg>
        <div class="ring-val"><div class="ring-pct num">${label !== '' ? label : Math.round(p) + '%'}</div>${sub ? `<div class="ring-sub">${sub}</div>` : ''}</div></div>`;
    },
    bars({ values = [], labels = [], color = 'var(--success)', height = 70, target = null, max = null, colors = null, miss = null }) {
      const n = values.length || 1, W = 280, H = height, pad = 4, colW = (W - 2 * pad) / n, bw = colW * 0.68;
      const mx = max || Math.max(1, ...values.map((v) => +v || 0), target || 0);
      let s = `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">`;
      if (target) { const y = H - pad - (target / mx) * (H - 2 * pad); s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" class="spark-target"/>`; }
      values.forEach((v, i) => {
        const h = Math.max(2, ((+v || 0) / mx) * (H - 2 * pad));
        const x = pad + i * colW + (colW - bw) / 2;
        const c = colors ? colors[i] : miss && miss[i] ? 'var(--danger)' : color;
        s += `<rect x="${x.toFixed(1)}" y="${(H - pad - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${c}" opacity="${v ? 1 : 0.25}"><title>${D.esc(labels[i] || '')}: ${v}</title></rect>`;
      });
      s += '</svg>';
      if (labels.length) s += `<div class="spark-labels">${labels.map((l) => `<span>${D.esc(l)}</span>`).join('')}</div>`;
      return s;
    },
    spark({ values = [], color = 'var(--success)', height = 60, fill = true, min = null, max = null, dots = false }) {
      const n = values.length;
      if (n < 2) return `<div class="empty small">—</div>`;
      const W = 280, H = height, pad = 6;
      const vs = values.map((v) => +v || 0);
      const lo = min !== null ? min : Math.min(...vs), hi = max !== null ? max : Math.max(...vs);
      const rng = Math.max(hi - lo, 0.0001);
      const pts = vs.map((v, i) => [pad + (i / (n - 1)) * (W - 2 * pad), H - pad - ((v - lo) / rng) * (H - 2 * pad)]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const gid = 'g' + Math.random().toString(36).slice(2, 7);
      return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px;color:${color}">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".45"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
        ${fill ? `<path d="${d} L${pts[n - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z" fill="url(#${gid})"/>` : ''}
        <path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        ${dots ? pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="currentColor"/>`).join('') : ''}
      </svg>`;
    },
    heat({ days = [], valueFn, title }) {
      // valueFn(key) → 0..4 level (or null for future)
      return `<div class="hm" ${title ? `title="${D.esc(title)}"` : ''}>${days.map((k) => {
        const l = valueFn(k);
        return `<i data-l="${l == null ? '' : l}" title="${k}"></i>`;
      }).join('')}</div>`;
    },
    heatYear({ end, valueFn }) {
      // 53 columns × 7 rows, weeks as columns (GitHub style)
      end = end || D.today();
      const endDow = D.dowOf(end);
      const total = 52 * 7 + endDow + 1;
      const days = D.lastDays(total, end);
      const startDow = D.dowOf(days[0]);
      let cells = '';
      for (let i = 0; i < startDow; i++) cells += '<i class="pad"></i>';
      for (const k of days) { const l = valueFn(k); cells += `<i data-l="${l == null ? '' : l}" title="${k}"></i>`; }
      return `<div class="hm-year"><div class="hm-year-grid">${cells}</div></div>`;
    },
    donut({ parts = [], size = 120, stroke = 14, center = '' }) {
      const r = (size - stroke) / 2, C = 2 * Math.PI * r, total = D.sum(parts, (p) => p.v) || 1;
      let off = 0, s = `<div class="ring-wrap" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}">`;
      s += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>`;
      for (const p of parts) {
        const len = (p.v / total) * C;
        s += `<circle class="donut-seg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${stroke}" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"><title>${D.esc(p.label || '')}</title></circle>`;
        off += len;
      }
      s += `</svg><div class="ring-val"><div class="ring-pct num">${center}</div></div></div>`;
      return s;
    },
    hbar({ label, value, max, color = 'var(--success)', right = '' }) {
      const p = max ? D.clamp((value / max) * 100, 0, 100) : 0;
      return `<div class="hbar"><span class="hbar-label">${D.esc(label)}</span><span class="bar"><i class="bar-fill" style="width:${p.toFixed(1)}%;background:${color}"></i></span><span class="hbar-val num">${right}</span></div>`;
    },
  };

  /* ------------------------------------------------------------------ */
  /* router + views                                                      */
  /* ------------------------------------------------------------------ */
  D.views = {};
  D.view = (def) => { D.views[def.id] = def; };
  D.viewList = () => Object.values(D.views).sort((a, b) => (a.order || 0) - (b.order || 0));
  let current = null;

  D.go = (id, sub) => {
    if (!D.views[id]) id = 'today';
    if (sub !== undefined) D.ui.sub[id] = sub;
    if (current && current !== id && D.views[current].unmount) { try { D.views[current].unmount(); } catch (e) { console.error(e); } }
    const changed = current !== id;
    current = id;
    D.ui.view = id;
    D.saveUi();
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    D.renderNav();
    D.rerender();
    if (changed) {
      window.scrollTo(0, 0);
      // Play the section-enter animation once per navigation — never on an ordinary
      // rerender, otherwise ticking a habit would re-animate the whole page.
      const root = D.$('#view');
      if (root) {
        root.classList.remove('view-enter');
        void root.offsetWidth;            // restart the animation
        root.classList.add('view-enter');
        clearTimeout(D._enterT);
        D._enterT = setTimeout(() => root.classList.remove('view-enter'), 460);
      }
      D.emit('view:changed', id);
    }
    D.closeMore();
  };
  D.current = () => current;
  D.sub = (id, fallback) => (D.ui.sub[id] !== undefined ? D.ui.sub[id] : fallback);
  D.setSub = (id, v) => { D.ui.sub[id] = v; D.saveUi(); D.rerender(); };
  D.act.go = (el) => D.go(el.dataset.view, el.dataset.sub);
  D.act.sub = (el) => D.setSub(el.dataset.view || current, el.dataset.sub);

  // First load on a new device: local storage is empty and the server still owes us the data.
  // Show a skeleton instead of a briefly-empty app.
  D.loading = false;
  const skeleton = () => `<div class="card skel-card"><div class="skel skel-eyebrow"></div><div class="skel skel-kpi"></div>
      <div class="skel-rows">${'<div class="skel skel-row"></div>'.repeat(3)}</div></div>
    <div class="card skel-card">${'<div class="skel skel-row"></div>'.repeat(5)}</div>
    <div class="skel-note">${D.esc(D.t('loading'))}</div>`;

  /* ------------------------------------------------------------------ */
  /* DOM morphing                                                        */
  /* Views re-render as a whole HTML string on every tap. Assigning that  */
  /* to innerHTML throws away the live tree, which costs far more than    */
  /* building the string: every CSS transition restarts, focus is lost,   */
  /* and every blurred card re-composites. Morphing keeps the nodes that  */
  /* did not change, so a tap only touches the numbers it actually moved  */
  /* — and bars animate to their new width instead of jumping.           */
  /* ------------------------------------------------------------------ */
  const keyOf = (el) => el.getAttribute('data-k') || el.id || null;
  const sameNode = (a, b) =>
    a.nodeType === b.nodeType && (a.nodeType !== 1 || (a.tagName === b.tagName && keyOf(a) === keyOf(b)));

  function patchAttrs(a, b) {
    const an = a.attributes;
    for (let i = an.length - 1; i >= 0; i--) { const n = an[i].name; if (!b.hasAttribute(n)) a.removeAttribute(n); }
    const bn = b.attributes;
    for (let i = 0; i < bn.length; i++) { const at = bn[i]; if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); }
  }

  function patchNode(a, b) {
    if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    const tag = a.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      patchAttrs(a, b);
      // never overwrite the field the user is typing into
      if (a !== document.activeElement) {
        const v = tag === 'TEXTAREA' ? b.textContent : b.getAttribute('value');
        if (v !== null && a.value !== v) a.value = v;
        if (tag === 'SELECT') a.value = b.value;
      }
      if (tag === 'INPUT') a.checked = b.hasAttribute('checked') ? true : a.type === 'checkbox' || a.type === 'radio' ? b.checked : a.checked;
      return;
    }
    if (a.isEqualNode(b)) return;      // identical subtree — nothing to do
    patchAttrs(a, b);
    patchChildren(a, b);
  }

  function patchChildren(a, b) {
    let ac = a.firstChild, bc = b.firstChild;
    while (bc) {
      const bNext = bc.nextSibling;
      if (!ac) { a.appendChild(bc); bc = bNext; continue; }
      const aNext = ac.nextSibling;
      if (sameNode(ac, bc)) patchNode(ac, bc);
      else a.replaceChild(bc, ac);
      ac = aNext; bc = bNext;
    }
    while (ac) { const n = ac.nextSibling; a.removeChild(ac); ac = n; }
  }

  const scratch = () => (D._scratch || (D._scratch = document.createElement('div')));

  D.rerender = () => {
    const v = D.views[current];
    const root = D.$('#view');
    if (!v || !root) return;
    if (D.loading) { root.innerHTML = skeleton(); return; }
    let html;
    try { html = v.render(); } catch (e) {
      console.error('render', current, e);
      D.logError(e);
      html = `<div class="card error-card"><div class="title">${D.ic('alert')} ${D.t('error.view')}</div><pre class="small muted">${D.esc(e && e.stack || e)}</pre></div>`;
    }
    // Stamp the section on the page and on <html> so CSS can swap the accent per view.
    root.setAttribute('data-view', current);
    document.documentElement.setAttribute('data-section', current);
    const next = scratch();
    next.innerHTML = html;
    try { patchChildren(root, next); } catch (e) { console.error('morph', e); root.innerHTML = html; }
    next.textContent = '';
    if (v.mount) { try { v.mount(root); } catch (e) { console.error('mount', current, e); D.logError(e); } }
    // No scrollTo here: morphing leaves the tree standing, so the position never
    // moved, and calling scrollTo mid-momentum is itself a source of jank.
    D.emit('view:rendered', current);
  };
  D.patch = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  D.renderNav = () => {
    const nav = D.$('#nav'), side = D.$('#side');
    const list = D.viewList().filter((v) => v.nav !== false);
    const primary = list.filter((v) => v.primary !== false).slice(0, 4);
    const more = list.filter((v) => !primary.includes(v));
    const btn = (v) => `<button class="nav-tab ${current === v.id ? 'on' : ''}" data-act="go" data-view="${v.id}" aria-label="${D.esc(D.t('nav.' + v.id))}">${D.ic(v.icon, 22)}<span>${D.esc(D.t('nav.' + v.id))}</span></button>`;
    if (nav) nav.innerHTML = primary.map(btn).join('') + `<button class="nav-tab ${more.some((v) => v.id === current) ? 'on' : ''}" data-act="toggleMore" aria-label="${D.t('nav.more')}">${D.ic('grid', 22)}<span>${D.t('nav.more')}</span></button>`;
    const moreEl = D.$('#more');
    if (moreEl) moreEl.innerHTML = `<div class="more-grid">${more.map((v) => `<button class="more-tile ${current === v.id ? 'on' : ''}" data-act="go" data-view="${v.id}">${D.ic(v.icon, 24)}<span>${D.esc(D.t('nav.' + v.id))}</span></button>`).join('')}</div>`;
    if (side) side.innerHTML = list.map((v) => `<button class="side-tab ${current === v.id ? 'on' : ''}" data-act="go" data-view="${v.id}">${D.ic(v.icon, 18)}<span>${D.esc(D.t('nav.' + v.id))}</span></button>`).join('');
  };
  D.act.toggleMore = () => { const m = D.$('#more'); if (m) m.classList.toggle('show'); };
  D.closeMore = () => { const m = D.$('#more'); if (m) m.classList.remove('show'); };

  /* ------------------------------------------------------------------ */
  /* event delegation                                                    */
  /* ------------------------------------------------------------------ */
  function dispatch(attr, ev) {
    const el = ev.target.closest && ev.target.closest(`[${attr}]`);
    if (!el) return false;
    const name = el.getAttribute(attr);
    const fn = D.act[name];
    if (!fn) { console.warn('no action', name); return false; }
    try { const r = fn(el, ev); if (r && r.catch) r.catch((e) => { console.error(e); D.logError(e); }); }
    catch (e) { console.error('act', name, e); D.logError(e); D.toast(D.t('error.action')); }
    return true;
  }
  document.addEventListener('click', (ev) => {
    const more = D.$('#more');
    if (more && more.classList.contains('show') && !ev.target.closest('#more') && !ev.target.closest('[data-act=toggleMore]')) D.closeMore();
    const bg = D.$('#modalBg');
    if (bg && ev.target === bg) { D.closeModal(); return; }
    dispatch('data-act', ev);
  });
  document.addEventListener('change', (ev) => dispatch('data-change', ev));
  document.addEventListener('input', (ev) => dispatch('data-input', ev));
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey && ev.target.matches && ev.target.matches('input[data-enter]')) { ev.preventDefault(); const fn = D.act[ev.target.dataset.enter]; if (fn) fn(ev.target, ev); return; }
    if (ev.key === 'Escape') { D.closeModal(); D.closeMore(); const p = D.$('#palette'); if (p) p.classList.remove('show'); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); D.search.open(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z' && !ev.target.matches('input,textarea,[contenteditable]')) { ev.preventDefault(); D.undo.pop(); }
  });

  /* ------------------------------------------------------------------ */
  /* search / command palette                                            */
  /* ------------------------------------------------------------------ */
  const providers = [];
  D.search = {
    register: (fn) => providers.push(fn),
    open() {
      const p = D.$('#palette'); if (!p) return;
      p.classList.add('show');
      const inp = D.$('#paletteInp'); if (inp) { inp.value = ''; inp.focus(); }
      D.search.run('');
    },
    run(q) {
      const res = D.$('#paletteRes'); if (!res) return;
      q = (q || '').trim();
      let items = [];
      for (const v of D.viewList()) if (v.nav !== false) items.push({ label: D.t('nav.' + v.id), sub: D.t('search.view'), icon: v.icon, score: 1, go: () => D.go(v.id) });
      for (const f of providers) { try { items = items.concat(f(q) || []); } catch (e) { console.error(e); } }
      const nq = D.translit.norm(q);
      if (nq) items = items.map((it) => ({ ...it, score: D.translit.score(it.label, nq) + (it.sub ? D.translit.score(it.sub, nq) * 0.3 : 0) })).filter((it) => it.score > 0);
      items.sort((a, b) => b.score - a.score);
      items = items.slice(0, 30);
      D._paletteItems = items;
      res.innerHTML = items.length ? items.map((it, i) => `<button class="pal-item ${i === 0 ? 'on' : ''}" data-act="palGo" data-i="${i}">${it.icon ? D.ic(it.icon, 16) : ''}<span class="pal-label">${D.esc(it.label)}</span>${it.sub ? `<span class="pal-sub">${D.esc(it.sub)}</span>` : ''}</button>`).join('') : `<div class="empty">${D.t('search.empty')}</div>`;
    },
  };
  D.act.palGo = (el) => { const it = D._paletteItems[+el.dataset.i]; D.$('#palette').classList.remove('show'); if (it && it.go) it.go(); };
  D.act.palInput = (el) => D.search.run(el.value);
  D.act.palClose = () => D.$('#palette').classList.remove('show');
  D.act.openSearch = () => D.search.open();

  // Cyrillic ↔ Latin transliteration for search (Uzbek)
  const CYR = [['ё', 'yo'], ['ю', 'yu'], ['я', 'ya'], ['ч', 'ch'], ['ш', 'sh'], ['ц', 'ts'], ['ғ', 'g'], ['қ', 'q'], ['ў', 'o'], ['ҳ', 'h'], ['х', 'x'], ['ж', 'j'],
    ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'], ['з', 'z'], ['и', 'i'], ['й', 'y'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'],
    ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['э', 'e'], ['ъ', ''], ['ь', '']];
  D.translit = {
    toLatin: (s) => { s = String(s || '').toLowerCase(); for (const [c, l] of CYR) s = s.split(c).join(l); return s; },
    norm: (s) => D.translit.toLatin(s).replace(/[ʼ’'`‘]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(),
    score(label, nq) {
      const nl = D.translit.norm(label);
      if (!nl) return 0;
      if (nl === nq) return 100;
      if (nl.startsWith(nq)) return 80;
      if (nl.includes(nq)) return 60;
      // all query words present
      const words = nq.split(' ');
      if (words.every((w) => nl.includes(w))) return 40;
      // subsequence
      let i = 0; for (const c of nl) if (c === nq[i]) i++;
      return i === nq.length ? 15 : 0;
    },
  };

  /* ------------------------------------------------------------------ */
  /* passcode gate (server bilan, Telegramdan tashqarida)                */
  /* ------------------------------------------------------------------ */
  let authPending = null;
  D.auth = {
    /** Bir vaqtda bitta oyna; hamma kutayotgan so'rovlar bitta javobni oladi. */
    ask() {
      if (authPending) return authPending;
      authPending = new Promise((resolve) => {
        const box = document.createElement('div');
        box.className = 'auth-gate';
        box.innerHTML = `<form class="auth-card" autocomplete="on">
            <div class="auth-ic">${D.ic('key', 26)}</div>
            <div class="auth-title">${D.esc(D.t('auth.title'))}</div>
            <p class="auth-sub">${D.esc(D.t('auth.sub'))}</p>
            <input class="inp auth-inp" type="password" name="password" autocomplete="current-password"
                   placeholder="${D.esc(D.t('auth.ph'))}" aria-label="${D.esc(D.t('auth.title'))}">
            <div class="auth-err" hidden></div>
            <button class="btn auth-btn" type="submit">${D.esc(D.t('auth.go'))}</button>
          </form>`;
        document.body.appendChild(box);
        const form = box.querySelector('form');
        const inp = box.querySelector('.auth-inp');
        const err = box.querySelector('.auth-err');
        const btn = box.querySelector('.auth-btn');
        setTimeout(() => inp.focus(), 60);
        form.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const v = inp.value;
          if (!v) return;
          btn.disabled = true; err.hidden = true;
          try {
            const r = await fetch('/api/login', {
              method: 'POST', credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass: v }),
            });
            if (r.ok) { box.remove(); authPending = null; resolve(true); return; }
            err.textContent = D.t(r.status === 401 ? 'auth.bad' : 'auth.err');
          } catch (e) { err.textContent = D.t('auth.err'); }
          err.hidden = false; btn.disabled = false; inp.select();
        });
      });
      return authPending;
    },
    async logout() {
      try { await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
      location.reload();
    },
  };

  /* ------------------------------------------------------------------ */
  /* error boundary                                                      */
  /* ------------------------------------------------------------------ */
  D.errors = [];
  D.logError = (e) => { D.errors.push({ ts: Date.now(), msg: String((e && e.message) || e), stack: e && e.stack }); if (D.errors.length > 20) D.errors.shift(); };
  window.addEventListener('error', (ev) => D.logError(ev.error || ev.message));
  window.addEventListener('unhandledrejection', (ev) => D.logError(ev.reason));

  /* ------------------------------------------------------------------ */
  /* export / import                                                     */
  /* ------------------------------------------------------------------ */
  D.exportJson = () => {
    const b = new Blob([JSON.stringify(D.S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'dash_' + D.today() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  D.importJson = (text) => {
    let j;
    try { j = JSON.parse(text); } catch (e) { throw new Error(D.t('data.badJson')); }
    if (!j || typeof j !== 'object') throw new Error(D.t('data.badJson'));
    const next = D.isOldFormat(j) ? D.migrateOld(j) : D.normalize(j);
    const prev = D.S;
    D.S = next;
    D.S.meta.deviceId = prev.meta.deviceId;
    D.undo.push({ label: D.t('data.imported'), undo: () => { D.S = prev; D.theme.apply(); D.renderNav(); } });
    D.save();
    D.theme.apply();
    D.renderNav();
    D.rerender();
    D.toast(D.t('data.imported'), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* boot                                                                */
  /* ------------------------------------------------------------------ */
  D.boot = async () => {
    D.load();
    document.documentElement.lang = D.lang() === 'ru' ? 'ru' : 'uz';
    D.theme.apply();
    if (D.tg) { try { D.tg.ready(); D.tg.expand(); if (D.tg.disableVerticalSwipes) D.tg.disableVerticalSwipes(); } catch (e) {} }
    const hash = location.hash.replace('#', '');
    const empty = !Object.keys(D.S.logs).length && !D.S.habits.length && !D.S.tasks.length && !D.S.finance.tx.length;
    D.loading = empty && D.serverEnabled();
    D.go(D.views[hash] ? hash : D.ui.view);
    D.setSync(D.serverEnabled() ? 'wait' : 'local');
    if (D._corrupt) D.toast(D.t('data.corrupt'), { ms: 6000 });
    D.pull().finally(() => { if (D.loading) { D.loading = false; D.rerender(); } });
    // header clock / day rollover
    let lastDay = D.today();
    setInterval(() => {
      const k = D.today();
      if (k !== lastDay) { lastDay = k; D.emit('day:changed', k); D.rerender(); }
      D.emit('tick');
    }, 30 * 1000);
    window.addEventListener('focus', () => { if (D.serverEnabled()) D.pull(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) D.emit('tick'); });
    window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (D.views[h] && h !== current) D.go(h); });
    D.emit('boot');
  };
})();
