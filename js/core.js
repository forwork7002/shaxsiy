/* =====================================================================
   Dash — core runtime. Everything else builds on `window.D`.
   store · dates · i18n runtime · router · UI kit · icons · charts · undo · sync
   ===================================================================== */
(function () {
  'use strict';

  const D = (window.D = {});
  D.VERSION = 2;
  /* The ?v= this very file was served with. Deferred sections must ask for exactly the URL
     the service worker precached (sw.js stores './js/tasks.js?v=vNN'), because its fetch
     handler matches on the full request URL. Without the suffix every deferred section
     missed the cache and cost a network round trip on the first open after each deploy —
     and the miss then wrote a second, unversioned copy of each file into the cache. */
  const VQ = (() => { const s = document.currentScript && document.currentScript.src || '';
    const i = s.indexOf('?'); return i < 0 ? '' : s.slice(i); })();
  /* Tezlik o'lchagichi. Manzilni SHU YERDA o'qish shart: D.go birinchi ish sifatida
     hash'ni bo'lim nomiga almashtirib yuboradi, ya'ni keyin tekshirsak kech bo'ladi.
     #tezlik — yoqadi va eslab qoladi; #tezlik-off — o'chiradi. */
  const PERF = (() => {
    try {
      const h = location.hash;
      if (h === '#tezlik-off') { localStorage.removeItem('dash.perf'); return false; }
      if (h === '#tezlik') { localStorage.setItem('dash.perf', '1'); return true; }
      return !!localStorage.getItem('dash.perf');
    } catch (e) { return location.hash === '#tezlik'; }
  })();
  /* Yoqilgan bo'lsa — uzun vazifalarni SHU YERDA kuzata boshlaymiz. Keyinroq ro'yxatdan
     o'tgan kuzatuvchi ochilishdagi vazifalarni ko'rmaydi, aynan ularni bilmoqchi edik. */
  if (PERF) {
    window.__perfLong = [];
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perfLong.push(e.duration)))
        .observe({ type: 'longtask', buffered: true });
    } catch (e) { /* Safari'da longtask yo'q */ }
  }
  const LS_KEY = 'dash.v2';
  const UI_KEY = 'dash.ui';
  const DEV_KEY = 'dash.device';
  // chiqishda serverga yetib bormagan nusxa shu yerda qoladi: dash.rescue.<uid>
  const RESCUE_KEY = 'dash.rescue.';

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
        // islom.uz'ning Toshkent koordinatasi va usuli — yaxlitlanmagan holda
        prayer: { lat: 41.300872, lng: 69.241813, fajr: 15.5, isha: 15.5, asr: 'hanafi',
                  offsets: { bomdod: 0, quyosh: 0, peshin: 0, asr: 0, shom: 0, xufton: 0 }, hijriOffset: 0, notify: false },
        caffeineLimit: 400, onboarded: false,
      },
      // birthYear → yosh hisoblanadi; goal ovqat me'yorlari uchun; whoopAge/paceOfAging WHOOP ilovasidan qo'lda kiritiladi
      profile: { name: '', heightCm: null, weightKg: null, age: null, birthYear: null, sex: 'm', activity: 3, goal: 'keep',
                 whoopAge: null, paceOfAging: null, whoopAgeAt: null },
      habits: [], logs: {}, counts: {}, notes: {}, gratitude: [],
      // Kitob va ko'rgan narsalar. Odatdan farqi: oxiri bor (jami bet/qism) va
      // holati bor. Odatga o'xshashi: har kun belgilanadi, shuning uchun
      // mediaLogs ham logs kabi kun kaliti bilan yuritiladi.
      // media: [{id,kind:'kitob'|'korgan',title,author,total,unit,status:'now'|'done'|'later',done,createdAt,order}]
      // mediaLogs: {'YYYY-MM-DD': {mediaId: nechta}}
      media: [], mediaLogs: {},
      tasks: [], goals: [],
      prayers: {}, dhikr: {}, fasting: {},
      health: {},
      caffeine: { logs: [], custom: [] },
      stack: { items: [], taken: {} },
      gym: { gyms: [], days: [], exercises: [], logs: {}, done: {}, split: { names: [], anchor: null } },
      finance: { tx: [], cats: [], budgets: {}, accounts: [], subs: [], snapshots: [], wishlist: [] },
      learn: [], reviews: [],
      // Hafta yakuni: {'YYYY-Www': {win, hard, next}} — Odat bo'limidagi «Hafta yakuni».
      // Eski `reviews` massivi tegilmaydi: uning ichidagi yozuvlar shakli noma'lum.
      weekly: {},
      yusa: { threads: [] },
      ai: { cards: {}, log: [] },
      whoop: { connected: false, lastSync: null, cache: {}, days: {}, workouts: [], body: {} },
      // food.logs: {'YYYY-MM-DD': [meal]}; targets: auto=true → profildan hisoblanadi, aks holda qo'lda kiritilgan qiymatlar
      food: { logs: {}, targets: { kcal: null, p: null, c: null, f: null, auto: true } },
      // Nishonlar (js/levels.js). Bu yerda FAQAT «qaysi nishon qachon berildi»
      // turadi — ochko ham, daraja sharti ham holatdan qayta hisoblanadi.
      // Hisoblagich saqlansa ikki qurilma birlashganda qo'shilib ketardi.
      // got: {nishonId: 'YYYY-MM-DD' | 0 (tizim yoqilgunga qadar olingan)}
      // level: oxirgi tabriklangan daraja · init: birinchi hisob bo'lib o'tganmi
      awards: { got: {}, level: 0, init: false },
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
    // 2026-09-10: murabbiyning nomi «Nova» edi, endi hamma joyda «Yusa». Eski
    // nusxalarda suhbatlar hali `nova` kalitida yotibdi — ularni bir marta
    // ko'chirib olamiz, aks holda odam suhbatlarini yo'qotadi.
    if (s && typeof s === 'object' && s.nova) {
      if (!s.yusa) s.yusa = s.nova;
      delete s.nova;
    }
    const n = fill(s || {}, defaultState());
    // habit defaults
    n.habits.forEach((h, i) => {
      if (!h.id) h.id = D.uid('h');
      if (h.active === undefined) h.active = true;
      if (!h.schedule) h.schedule = { type: 'daily' };
      if (!D.SPHERE_IDS.includes(h.sphere)) h.sphere = 'boshqa';
      if (h.order === undefined) h.order = i;
      // optional emoji (≤ 4 code points) and done-label (≤ 24 chars); sphere defaults are NOT written here (see D.habitEmoji)
      const em = typeof h.emoji === 'string' ? h.emoji.trim() : '';
      if (em && Array.from(em).length <= 4) h.emoji = em; else delete h.emoji;
      const dl = typeof h.doneLabel === 'string' ? Array.from(h.doneLabel.trim()).slice(0, 24).join('') : ''; // code points, never a split surrogate
      if (dl) h.doneLabel = dl; else delete h.doneLabel;
    });
    for (const k of Object.keys(n.logs)) if (!Array.isArray(n.logs[k]) || !n.logs[k].length) delete n.logs[k];
    // kitob / ko'rgan
    n.media.forEach((m, i) => {
      if (!m.id) m.id = D.uid('m');
      if (m.kind !== 'korgan') m.kind = 'kitob';
      if (!['now', 'done', 'later'].includes(m.status)) m.status = 'now';
      m.title = typeof m.title === 'string' ? m.title : '';
      m.total = Math.max(0, Math.floor(+m.total || 0));
      m.done = D.clamp(Math.floor(+m.done || 0), 0, m.total || 999999);
      if (m.order === undefined) m.order = i;
    });
    // hafta yakuni: faqat uchta matn maydoni, qolgani tashlanadi
    for (const k of Object.keys(n.weekly)) {
      const o = n.weekly[k];
      if (!o || typeof o !== 'object' || Array.isArray(o)) { delete n.weekly[k]; continue; }
      const clean = {};
      for (const f of ['win', 'hard', 'next']) if (typeof o[f] === 'string' && o[f].trim()) clean[f] = o[f].slice(0, 2000);
      if (Object.keys(clean).length) n.weekly[k] = clean; else delete n.weekly[k];
    }
    for (const k of Object.keys(n.mediaLogs)) {
      const o = n.mediaLogs[k];
      if (!o || typeof o !== 'object' || Array.isArray(o) || !Object.keys(o).length) { delete n.mediaLogs[k]; continue; }
      for (const id of Object.keys(o)) { const v = Math.floor(+o[id] || 0); if (v > 0) o[id] = v; else delete o[id]; }
      if (!Object.keys(o).length) delete n.mediaLogs[k];
    }
    n.tasks.forEach((t) => { if (!t.id) t.id = D.uid('t'); if (!t.priority) t.priority = 2; });
    n.goals.forEach((g) => { if (!g.id) g.id = D.uid('g'); if (!g.priority) g.priority = 2; if (!D.DIRS.includes(g.dir)) g.dir = 'shaxsiy'; });
    if (!n.finance.cats.length) n.finance.cats = defaultCats();
    /* ESKI EMOJI -> IKONKA NOMI. Kategoriya belgisi foydalanuvchi HOLATIDA
       saqlanadi, ya'ni defaultCats() ni o'zgartirish faqat yangi odamga
       tegardi — eskilarda emoji qolib ketardi. Bu yerda ular ko'chiriladi.
       Faqat AYNAN eski sukut emojisi almashtiriladi: odam Sozlashda o'zi
       boshqa belgi tanlagan bo'lsa, unga tegilmaydi. Takror ishlasa ham
       zararsiz, chunki ikkinchi safar mos keladigan emoji topilmaydi.
       Yozuvlar kategoriyaga ID orqali bog'langan, belgi orqali emas —
       shuning uchun bu ko'chirish hech qanday tranzaksiyani yo'qotmaydi. */
    for (const c of n.finance.cats) {
      const want = CAT_ICON_OLD[c && c.id];
      if (!want) continue;
      const cur = String(c.icon == null ? '' : c.icon).replace(/️/g, '').trim();
      if (cur === want[0]) c.icon = want[1];
    }
    if (!['lose', 'keep', 'gain'].includes(n.profile.goal)) n.profile.goal = 'keep';
    // ovqat yozuvlari: kun → massiv; har bir taomda id bo'lsin
    for (const k of Object.keys(n.food.logs)) {
      if (!Array.isArray(n.food.logs[k])) { delete n.food.logs[k]; continue; }
      n.food.logs[k].forEach((m) => { if (m && !m.id) m.id = D.uid('fd'); });
    }
    if (typeof n.food.targets.auto !== 'boolean') n.food.targets.auto = true;
    // nishonlar: qiymat kun kaliti yoki 0. Tanimagan nishon id'si ham qoladi —
    // kelajakda qo'shiladigan nishonni bu yerda o'chirib yuborish mumkin emas.
    for (const k of Object.keys(n.awards.got)) {
      const v = n.awards.got[k];
      if (v === 0 || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v))) continue;
      n.awards.got[k] = 0;
    }
    n.awards.level = Math.max(0, Math.floor(+n.awards.level || 0));
    n.awards.init = !!n.awards.init;
    n.meta.v = D.VERSION;
    return n;
  };
  /* id -> [eski sukut emoji (VS16 siz), yangi ikonka nomi]. normalize() ishlatadi. */
  const CAT_ICON_OLD = {
    oziq: ['🍽', 'apple'], transport: ['🚌', 'bus'], kommunal: ['💡', 'bolt'], kiyim: ['👕', 'shirt'],
    soglik: ['💊', 'pill'], talim: ['📚', 'book'], sadaqa: ['🤲', 'hands'], restoran: ['☕', 'coffee'],
    uy: ['🏠', 'home'], boshqa: ['📦', 'layers'], maosh: ['💼', 'wallet'],
  };
  function defaultCats() {
    return [
      ['oziq', 'Oziq-ovqat', 'apple'], ['transport', 'Transport', 'bus'], ['kommunal', 'Kommunal', 'bolt'], ['kiyim', 'Kiyim', 'shirt'],
      ['soglik', "Sog'liq", 'pill'], ['talim', "Ta'lim", 'book'], ['sadaqa', 'Hadya/Sadaqa', 'hands'], ['restoran', 'Restoran', 'coffee'],
      ['uy', 'Uy/Remont', 'home'], ['boshqa', 'Boshqa', 'layers'], ['maosh', 'Maosh', 'wallet'],
    ].map(([id, name, icon]) => ({ id, name, icon }));
  }

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
        cat = D.uid('c'); n.finance.cats.push({ id: cat, name: f.kategoriya, icon: 'layers' });
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
  /* Saqlash yiqilsa (kvota to'ldi, shaxsiy oyna, brauzer taqiqladi) — bu jim
     o'tmasligi kerak: odam yozgan narsasi saqlangan deb o'ylab yuraveradi. */
  let lsWarned = false;
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) {
      console.warn('ls', e);
      if (!lsWarned) { lsWarned = true; try { D.toast(D.t('err.storage'), { ms: 8000 }); } catch (e2) {} }
      return false;
    }
  }

  D.ui = fill(lsGet(UI_KEY), { view: 'today', sub: {}, viewDate: null, filters: {}, collapsed: {} });
  if (D.ui.view === 'nova') D.ui.view = 'yusa';                 // eski nom bilan yopilgan bo'lim
  if (D.ui.sub && D.ui.sub.nova !== undefined) { D.ui.sub.yusa = D.ui.sub.nova; delete D.ui.sub.nova; }
  D.saveUi = D.debounce(() => lsSet(UI_KEY, D.ui), 150);
  D.device = fill(lsGet(DEV_KEY), { yusaKey: '', whoop: null, lockHash: '', uid: '', name: '', lastUser: '' });
  if (!D.device.yusaKey && D.device.novaKey) D.device.yusaKey = D.device.novaKey;   // eski nomdagi API kalit
  delete D.device.novaKey;
  D.saveDevice = () => lsSet(DEV_KEY, D.device);

  /* Holatni diskka yozish — to'plamli.
     JSON.stringify(D.S) sinxron ishlaydi va holat o'sgani sayin qimmatlashadi.
     Har bosish (odat belgilash, suv qo'shish) alohida to'liq yozuv edi: ketma-ket
     o'nta belgi — o'nta to'liq serializatsiya, hammasi asosiy oqimda. Endi 400 ms
     oynadagi o'zgarishlar bitta yozuvga birlashadi; chiqishda darrov yoziladi. */
  let lsDirty = false, lsTimer = 0;
  function saveLocalNow() {
    if (lsTimer) { clearTimeout(lsTimer); lsTimer = 0; }
    if (!lsDirty) return;
    lsDirty = false;
    lsSet(LS_KEY, D.S);
  }
  function saveLocalSoon() {
    lsDirty = true;
    if (!lsTimer) lsTimer = setTimeout(() => { lsTimer = 0; saveLocalNow(); }, 400);
  }
  function saveLocalForce() { lsDirty = true; saveLocalNow(); }
  /** Chiqish nuqtalari uchun: bayroqqa qaramay bir marta yozadi. Modullarning
      o'z kechiktirishlari (today.js dagi kunlik eslatma — D.S ga darrov yoziladi,
      D.save() esa 300 ms kutiladi) shu bilan qutqariladi. */
  D.flushLocal = saveLocalForce;

  /** Ichida odamning yozuvlari bormi — import ogohlantirishi uchun.
      pull() dagi «bu qurilma bo'shmi» savoli boshqacha hal qilingan
      (meta.updatedAt), bu esa «almashtirishdan oldin ogohlantirish kerakmi». */
  D.hasContent = (st) => {
    if (!st || typeof st !== 'object') return false;
    for (const k of ['logs', 'habits', 'tasks', 'goals', 'notes', 'counts', 'gratitude',
                     'prayers', 'dhikr', 'fasting', 'health', 'learn', 'reviews', 'books', 'focus']) {
      const v = st[k];
      if (Array.isArray(v) ? v.length : v && typeof v === 'object' && Object.keys(v).length) return true;
    }
    for (const [k, sub] of [['finance', 'tx'], ['finance', 'accounts'], ['finance', 'subs'], ['finance', 'wishlist'],
                            ['food', 'logs'], ['nova', 'threads'], ['caffeine', 'logs'], ['stack', 'items'],
                            ['gym', 'logs'], ['gym', 'days'], ['gym', 'exercises'],
                            ['whoop', 'days'], ['whoop', 'workouts'], ['ai', 'log']]) {
      const box = st[k];
      if (!box || typeof box !== 'object') continue;
      const v = box[sub];
      if (Array.isArray(v) ? v.length : v && typeof v === 'object' && Object.keys(v).length) return true;
    }
    const pr = st.profile;
    if (pr && (pr.name || pr.weightKg || pr.heightCm)) return true;
    return false;
  };

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
  // Sarlavha satri olib tashlangach, sinxron chipi ham ketdi: ekran to'liq
  // sahifaniki. Holat Profil va Sozlash varaqlarida ko'rinadi, saqlanmay
  // qolgani esa bir marta xabar bo'lib chiqadi — jim qolib ketmasligi uchun.
  D.setSync = (s, msg) => {
    const was = syncState;
    syncState = s;
    D.emit('sync:changed', s);
    if (s === 'err' && was !== 'err') D.toast(msg || D.t('sync.failed'), { ms: 4000 });
  };
  D.syncState = () => syncState;

  // Merge a remote snapshot into local: union of date-keyed maps and id-arrays (local wins on conflict),
  // newer wins for settings/profile. Used when the server holds a newer copy than the one we branched from.
  const DATE_MAPS = ['logs', 'counts', 'notes', 'health', 'prayers', 'dhikr', 'fasting', 'mediaLogs', 'weekly'];
  const ID_LISTS = ['habits', 'gratitude', 'tasks', 'goals', 'learn', 'reviews', 'media'];
  function unionById(a, b) {
    const out = [], seen = new Set();
    for (const x of a || []) if (x && x.id && !seen.has(x.id)) { seen.add(x.id); out.push(x); }
    for (const x of b || []) if (x && x.id && !seen.has(x.id)) { seen.add(x.id); out.push(x); }
    return out;
  }
  D.merge = (remote, local) => {
    const r = D.normalize(D.deep(remote)), l = local;
    const newer = (+r.meta.updatedAt || 0) > (+l.meta.updatedAt || 0) ? r : l;
    // r allaqachon shu funksiyaga tegishli, normallashtirilgan nusxa — uni
    // ustidan yozaversak bo'ladi. Faqat lokal g'olib bo'lganda nusxa kerak.
    const out = newer === r ? r : D.normalize(D.deep(l));
    /* Kun xaritalari: kun kaliti butunligicha lokal nusxadan olinadi.
       Ikki qavat birlashtirish (har kalit alohida) ko'rinishidan to'g'riroq —
       ikki qurilmada bir kunda yozilgan narsalar saqlanib qolardi — lekin u
       O'CHIRISHNI buzadi: belgini olib tashlash «kalitni yo'q qilish» degani,
       birlashtirilsa esa olingan belgi serverdagi eski nusxadan qaytib
       kelaveradi. Kunlik belgini olib tashlash — har kuni bo'ladigan ish;
       bir kunda ikki qurilmadan yozish esa deyarli bo'lmaydi. Shuning uchun
       tanlov o'chirish foydasiga: 556 kunlik tarixda «o'chmaydigan belgi»
       «yo'qolgan belgi» dan ancha yomon. */
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
    out.yusa.threads = unionById(l.yusa.threads, r.yusa.threads);
    // ovqat: kun kaliti bo'yicha id-birlashma (lokal ustun), me'yorlar yangiroq tomondan (out allaqachon shunday)
    out.food.logs = Object.assign({}, r.food.logs);
    for (const k of Object.keys(l.food.logs || {})) out.food.logs[k] = unionById(l.food.logs[k], r.food.logs[k]);
    out.whoop.days = Object.assign({}, r.whoop.days, l.whoop.days);
    out.whoop.workouts = unionById(l.whoop.workouts, r.whoop.workouts);
    out.whoop.connected = !!(l.whoop.connected || r.whoop.connected);
    /* Nishonlar — birlashma, va sana ERTAROG'I yutadi. Berilgan nishon hech
       qachon qaytarib olinmaydi: bu yagona joy bo'lib, u yerda «lokal g'olib»
       qoidasi noto'g'ri bo'lardi — telefonda olingan nishon planshetdagi eski
       nusxa bilan qo'shilganda yo'qolib ketardi. 0 = «tizim yoqilgunga qadar»,
       ya'ni har qanday sanadan erta.
       Ikkala manba oldindan o'zgaruvchiga olinadi: `out` ba'zan `r` ning o'zi
       bo'ladi (server yangiroq bo'lsa), ya'ni `out.awards.got` ga yozish bilan
       `r.awards.got` ham almashadi. Keyin solishtirish uchun o'qilsa allaqachon
       birlashtirilgan jadval o'qilardi va natija qaysi tomon «remote» ekaniga
       bog'liq chiqardi — aynan shu xato sinovda tutilgan. */
    const rGot = r.awards.got, lGot = l.awards.got;
    const got = Object.assign({}, rGot, lGot);
    for (const k of Object.keys(got)) {
      const a = rGot[k], b = lGot[k];
      if (a === undefined || b === undefined) continue;
      got[k] = a === 0 || b === 0 ? 0 : (String(a) < String(b) ? a : b);
    }
    out.awards.got = got;
    out.awards.level = Math.max(+r.awards.level || 0, +l.awards.level || 0);
    out.awards.init = !!(r.awards.init || l.awards.init);
    out.meta.deviceId = l.meta.deviceId;
    out.meta.updatedAt = Math.max(+r.meta.updatedAt || 0, +l.meta.updatedAt || 0, Date.now());
    return out;
  };

  // Bitta yozuv. Server yangiroq (stale) yoki to'liqroq (empty_overwrite) nusxani qaytarsa —
  // uni birlashtirib qayta yuboramiz: shu sabab bo'sh holat to'liq nusxa ustidan yozilmaydi.
  let replaceOnce = false;
  let saveSeq = 0, pushedSeq = 0;
  /** Serverga yetkazilmagan o'zgarish bormi? (chiqishdan oldin tekshiriladi) */
  D.dirty = () => saveSeq !== pushedSeq;
  let pushMs = 60000;   // holat bir necha yuz kilobayt bo'lishi mumkin — sekin tarmoqqa vaqt beramiz
  async function pushNow(depth = 0) {
    if (!D.serverEnabled()) { D.setSync('local'); return false; }
    /* Serverdagi nusxa shu sessiyada hali O'QILMAGAN bo'lsa — yozmaymiz.
       Bu eng xavfli yo'l edi: yangi qurilmada localStorage bo'sh, D.pull()
       tarmoq sababli yiqiladi, ilova bo'sh holat bilan ochiladi, odam bitta
       odat belgilaydi — va o'sha bitta kunlik blob serverdagi 556 kunni
       butunlay almashtirib yuborardi. Serverdagi «bo'sh holat» qalqoni ham
       yordam bermasdi: blobda bitta odat bor, ya'ni u «bo'sh» emas.
       Endi o'zgarish faqat qurilmada saqlanadi va pull o'tishi bilan
       birlashtirilib yuboriladi. */
    if (!D.pulled) { D.setSync('wait'); return false; }
    try {
      const seq = saveSeq;                       // shu urinish qaysi holatni yubordi
      const r = await D.api('/api/data' + (replaceOnce ? '?replace=1' : ''), { method: 'POST', body: JSON.stringify(D.S), timeout: pushMs });
      if (r && r.updated) D.S.meta.serverUpdated = r.updated;
      replaceOnce = false;
      D.setSync('ok');
      D._pending = false;
      pushedSeq = seq;
      return true;
    } catch (e) {
      if (e && (e.message === 'stale' || e.message === 'empty_overwrite') && e.data && depth < 2) {
        D.S = D.merge(e.data, D.S);
        saveLocalForce();
        D.emit('state:changed');
        D.rerender();
        return pushNow(depth + 1);
      }
      console.warn('sync', e);
      // almashtirish niyati faqat qayta urinishlar zanjirida saqlanadi: aks holda bayroq
      // keyingi begona saqlashga o'tib, serverdagi to'liq nusxani himoya qiladigan
      // `empty_overwrite` qalqonini aylanib o'tardi.
      replaceOnce = false;
      D._pending = true;
      D.setSync('err');
      return false;
    }
  }
  const pushServer = D.debounce(() => pushNow(), 700);
  /** Kechiktirmay hoziroq yuborish — chiqishdan oldin. true = server qabul qildi.
      ms — shu urinishning muddati: chiqayotgan odam jim serverni uzoq kutib turmasin. */
  D.flush = async (ms) => {
    const prev = pushMs;
    if (ms) pushMs = ms;
    try { return await pushNow(); } finally { pushMs = prev; }
  };

  D.save = () => {
    D.S.meta.updatedAt = Date.now();
    saveSeq++;
    saveLocalSoon();
    D.setSync(D.serverEnabled() ? 'wait' : 'local');
    pushServer();
    D.emit('state:changed');
  };
  // Persist without touching updatedAt (UI-only mutations of state).
  D.saveQuiet = () => saveLocalSoon();
  // Butun holatni almashtirish (tozalash, import): serverdagi to'liq nusxa ustidan yozishga ataylab ruxsat.
  D.saveReplace = () => { replaceOnce = true; D.save(); };

  // Server availability: Telegram context or explicit dev flag / same-origin api.
  D.tg = (window.Telegram && window.Telegram.WebApp) || null;
  D.serverEnabled = () => !!(D.tg && D.tg.initData) || window.DASH_SERVER === true || /[?&]server=1/.test(location.search);

  // Har bir so'rovning muddati bor. Muddatsiz fetch tarmoq javob bermay qolganda abadiy kutadi:
  // tugma «yuklanmoqda» holatida qotib qoladi, kirish oynasi ochilmaydi — ilova muzlagandek ko'rinadi.
  const REQ_MS = 20000;
  D.fetchTimed = (url, opts = {}, ms = REQ_MS) => {
    if (typeof AbortController !== 'function') return fetch(url, opts);
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), ms);
    // Chaqiruvchining o'z signali ham saqlanadi. Ilgari u {...opts, signal: c.signal}
    // bilan jimgina ustiga yozilardi: ai.js o'ziga 90 soniya bergan deb o'ylardi,
    // amalda esa shu yerdagi 20 soniya ishlardi va har bir tahlil uzilardi.
    if (opts.signal) {
      if (opts.signal.aborted) c.abort();
      else opts.signal.addEventListener('abort', () => c.abort(), { once: true });
    }
    return fetch(url, { ...opts, signal: c.signal })
      .catch((e) => { throw e && e.name === 'AbortError' ? new Error('timeout') : e; })
      .finally(() => clearTimeout(timer));
  };

  D.api = async (path, opts = {}) => {
    const h = { 'Content-Type': 'application/json' };
    if (D.tg && D.tg.initData) h['X-Telegram-Init-Data'] = D.tg.initData;
    const { timeout, ...rest } = opts;
    // credentials: the passcode session lives in an HttpOnly cookie
    const r = await D.fetchTimed(path, { credentials: 'same-origin', ...rest, headers: { ...h, ...(rest.headers || {}) } }, timeout || REQ_MS);
    if (r.status === 401 && !rest._retry) {
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

  // Kim kirgan: /api/me → D.me {uid,name,email,provider,avatar,since}; null — noma'lum yoki chiqilgan.
  // Xom fetch, D.api emas: bu yerdagi 401 kirish oynasini ochmasligi kerak.
  D.me = null;
  D.meRefresh = async () => {
    if (!D.serverEnabled()) return null;
    try {
      const r = await D.fetchTimed('/api/me', { credentials: 'same-origin', cache: 'no-store' }, 10000);
      if (r.status === 401) { const had = !!D.me; D.me = null; if (had) D.emit('me:changed'); return null; }
      if (!r.ok) return D.me;
      const j = await r.json();
      if (!j || !j.uid) return D.me;
      D.me = j;
      D.device.uid = j.uid; D.device.name = j.name || ''; D.saveDevice();
      D.emit('me:changed');
    } catch (e) { console.warn('me', e); }
    return D.me;
  };

  /** Chiqishda serverga yetib bormagan nusxa (dash.rescue.<uid>) — o'sha hisobga qaytilganda qo'shiladi. */
  async function restoreRescue() {
    const uid = (D.me && D.me.uid) || (D.S.meta && D.S.meta.owner) || '';
    if (!uid) return;
    const saved = lsGet(RESCUE_KEY + uid);
    if (!saved || !saved.meta) return;
    try {
      D.S = D.merge(D.S, D.normalize(saved));   // yuborilmay qolgan yozuvlar ustun
      D.S.meta.updatedAt = Date.now();
      saveLocalForce();
    } catch (e) {
      // birlashtirish yiqilsa blob o'z joyida qoladi — bu yagona nusxa, o'chirmaymiz
      console.warn('rescue', e); if (D.logError) D.logError(e);
      return;
    }
    try { localStorage.removeItem(RESCUE_KEY + uid); } catch (e) {}
    D.emit('state:changed');
    D.rerender();
    if (await pushNow()) D.toast(D.t('auth.restored'), { ms: 4000 });
  }

  // Pull from server at boot; server wins if newer, else push local.
  // window.focus iOS'da juda tez-tez otiladi: klaviatura yopilganda, ilovalar
  // almashinuvidan qaytganda, Google oynasidan qaytganda. Har biri to'liq
  // /api/data + birlashtirish + to'liq yozuv + qayta chizish edi, ustiga ular
  // bir-birining ustiga chiqardi.
  let pullBusy = null, pullAt = 0;
  const PULL_GAP = 20000;
  D.pull = (opts) => {
    if (!D.serverEnabled()) return Promise.resolve(false);
    if (pullBusy) return pullBusy;
    const force = !!(opts && opts.force);
    if (!force && Date.now() - pullAt < PULL_GAP) return Promise.resolve(false);
    pullBusy = pullRun().finally(() => { pullBusy = null; pullAt = Date.now(); });
    return pullBusy;
  };
  async function pullRun() {
    try {
      D.setSync('wait');
      const remote = await D.api('/api/data', { timeout: 60000 });
      // Another person signed in on this device: their server copy replaces what is here,
      // and nothing local is ever pushed into their account.
      const owner = remote && remote.meta && remote.meta.owner;
      if (owner && D.S.meta.owner && D.S.meta.owner !== owner) {
        D.S = D.normalize(defaultState());
        D.S.meta.deviceId = D.uid('dev');
        try { localStorage.removeItem(UI_KEY); } catch (e) {}
        if (D.whoop && D.whoop.resetCache) D.whoop.resetCache();
        D.device.name = '';
        D.toast(D.t('auth.switched'), { ms: 3500 });
      }
      if (owner) {
        D.S.meta.owner = owner;
        if (D.device.uid !== owner) { D.device.uid = owner; D.device.name = ''; D.saveDevice(); }
      }
      await D.meRefresh();   // Profil varag'i, Sozlash «Hisob», onboarding ismi — 'pull:ok' dan oldin
      // «Bu qurilmada hali hech narsa yo'q» degani — «odat va vazifa yo'q» degani EMAS.
      // Avval shart !logs && !habits && !tasks edi. Odat yuritmaydigan, lekin ovqat,
      // namoz, moliya va WHOOP yozadigan odam uchun bu shart HAR DOIM rost bo'lib
      // qolardi, ya'ni har pull'da quyidagi tarmoq serverni normalize qilib D.S ni
      // butunlay almashtirardi — hali yuborilmagan kun shu yerda yo'q bo'lardi.
      // meta.updatedAt defaultState()da 0; D.save() uni har saqlashda yozadi.
      // Demak !updatedAt = «bu qurilma hech qachon saqlamagan», aynan kerakli ma'no.
      const localEmpty = !(+D.S.meta.updatedAt);
      if (remote && D.isOldFormat(remote)) {
        // server still holds the old Шахсий data.json → migrate once, keep local additions, push new format
        const migrated = D.migrateOld(remote);
        migrated.meta.deviceId = D.S.meta.deviceId;
        D.S = localEmpty ? migrated : D.merge(migrated, D.S);
        D.S.meta.updatedAt = Date.now();
        saveLocalForce();
        D.theme.apply(); D.renderNav();
        D.emit('state:changed');
        D.rerender();
        pushServer();
      } else if (remote && remote.meta) {
        const rU = +remote.meta.updatedAt || 0, lU = +D.S.meta.updatedAt || 0;
        if (localEmpty && rU) {
          D.S = D.normalize(remote);
          if (!D.S.meta.deviceId) D.S.meta.deviceId = D.uid('dev');
          saveLocalForce();
          D.emit('state:changed');
          D.rerender();
        } else if (rU > lU) {
          D.S = D.merge(remote, D.S);
          saveLocalForce();
          D.emit('state:changed');
          D.rerender();
          pushServer();
        } else if (lU > rU) pushServer();
        if (remote.whoop && typeof remote.whoop.connected === 'boolean') D.S.whoop.connected = remote.whoop.connected;
      } else if (remote && !Object.keys(remote).filter((k) => k !== 'meta').length && !localEmpty) {
        pushServer(); // fresh server, populated client
      }
      await restoreRescue();
      D.setSync('ok');
      D.pulled = true;          // server nusxasi shu sessiyada kamida bir marta o'qildi
      // Serverdagi nusxada mavzu ham, til ham boshqacha bo'lishi mumkin.
      // Ilgari faqat ro'yxat qayta chizilardi: yangi qurilmada odam qayta
      // yuklamaguncha noto'g'ri rangda o'tirardi.
      D.theme.apply();
      document.documentElement.lang = D.lang() === 'ru' ? 'ru' : 'uz';
      D.renderNav();
      D.emit('pull:ok');
      return true;
    } catch (e) {
      console.warn('pull', e);
      D.setSync('err');
      return false;
    }
  };
  window.addEventListener('online', () => { if (D._pending || D.dirty()) pushServer(); });

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

  /* Ilova qaysi vaqt bilan hisoblaydi — buni foydalanuvchi ko'rib turishi kerak.
     Kun chegarasi, namoz vaqtlari, uyqu va butun tarix kalitlari shu mintaqaga
     bog'liq: mintaqa almashsa, 556 kunlik tarixning kalitlari ham siljiydi.
     Shuning uchun u HECH QACHON o'zi almashmaydi — faqat farqni ko'rsatamiz. */
  D.tzInfo = () => {
    const tz = (D.S && D.S.settings.tz) || 'Asia/Tashkent';
    let device = '';
    try { device = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { device = ''; }
    const p = D.nowTz();
    // Siljish — o'sha mintaqadagi soatni UTC bilan solishtirib topiladi
    let offset = '';
    try {
      const now = new Date();
      const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s);
      const mins = Math.round((asUtc - now.getTime()) / 60000);
      const sign = mins < 0 ? '−' : '+';
      const a = Math.abs(mins);
      offset = 'UTC' + sign + Math.floor(a / 60) + (a % 60 ? ':' + D.pad2(a % 60) : '');
    } catch (e) { offset = ''; }
    return { tz, device, offset, clock: D.fmtTime(p.h, p.min), same: !device || device === tz,
             city: tz.split('/').pop().replace(/_/g, ' ') };
  };
  D.keyOf = (y, m, d) => y + '-' + D.pad2(m) + '-' + D.pad2(d);
  D.dayKey = (date) => {
    const p = D.nowTz(date);
    const k = D.keyOf(p.y, p.m, p.d);
    const start = (D.S && +D.S.settings.dayStart) || 0;
    return start && p.h < start ? D.addDays(k, -1) : k;
  };
  D.today = () => D.dayKey();
  // Profil yoshi — bitta joyda: tug'ilgan yildan (har yangi yilda o'zi yangilanadi),
  // bo'lmasa eski `age` maydonidan. food.js, whoop.js, ai.js, settings.js shuni ishlatadi.
  /* Faollik koeffitsienti — Mifflin-St Jeor ni TDEE ga aylantiradi.
     Ilgari ikki nusxa bor edi va ular bir xil emasdi:
       food.js  ACT = [1.2, 1.375, 1.55, 1.725, 1.9, 2.1]    -> faollik 3 da 1.725
       whoop.js     = [1.2, 1.3, 1.375, 1.46, 1.55, 1.725]   -> faollik 3 da 1.46
     Bitta odam, bitta sozlama, ikki ekranda ~450 kkal farq. food.js niki
     saqlandi: aynan u kunlik kaloriya MAQSADINI belgilaydi, ya'ni uni
     o'zgartirish foydalanuvchi yeydigan miqdorni o'zgartirardi. whoop.js dagi
     esa faqat WHOOP kaloriya bermagan kun uchun zaxira baho.
     Yorliqlar: 0 Harakatsiz · 1 Kam harakat · 2 Yengil · 3 O'rtacha · 4 Faol · 5 Juda faol. */
  D.ACT_FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9, 2.1];
  D.activityFactor = (a) => D.ACT_FACTORS[D.clamp(Math.round(+a || 3), 0, 5)];
  D.profileAge = () => {
    const p = (D.S && D.S.profile) || {};
    const by = +p.birthYear;
    if (Number.isFinite(by) && by > 1900) { const y = D.nowTz().y - Math.round(by); return y > 0 && y < 130 ? y : null; }
    const a = +p.age;
    return Number.isFinite(a) && a > 0 ? Math.round(a) : null;
  };
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

  /* Aniq davomiylik — hech qachon yaxlitlanmaydi, kasr soat ko'rsatilmaydi.
     Sog'liq bo'limi «7.5 soat» emas, «7 soat 32 daqiqa» yozadi. */
  D.fmtHm = (hours, opts = {}) => {
    if (hours === null || hours === undefined || hours === '' || isNaN(+hours)) return '—';
    const total = Math.round(Math.abs(+hours) * 60);          // daqiqagacha aniq
    const h = Math.floor(total / 60), m = total % 60;
    const body = h ? (m ? `${h} ${D.t('unit.h')} ${m} ${D.t('unit.m')}` : `${h} ${D.t('unit.h')}`) : `${m} ${D.t('unit.m')}`;
    if (!total) return body;                                  // nolga ishora qo'yilmaydi
    return (+hours < 0 ? '−' : opts.sign ? '+' : '') + body;
  };
  D.fmtMsH = (ms, opts) => (ms === null || ms === undefined || ms === '' || isNaN(+ms) ? '—' : D.fmtHm(+ms / 3.6e6, opts));
  /* Qisqa davomiylik soniyagacha — mashg'ulot puls zonalari uchun. */
  D.fmtMsS = (ms) => {
    if (ms === null || ms === undefined || ms === '' || isNaN(+ms)) return '—';
    const total = Math.round(+ms / 1000), h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    if (h) return `${h} ${D.t('unit.h')} ${m} ${D.t('unit.m')}${s ? ` ${s} ${D.t('unit.s')}` : ''}`;
    return m ? `${m} ${D.t('unit.m')}${s ? ` ${s} ${D.t('unit.s')}` : ''}` : `${s} ${D.t('unit.s')}`;
  };
  /* Ishorali aniq son: «+11.8», «−2». Nol «0» bo'lib qoladi. */
  D.fmtSigned = (v, d = 1) => (v === null || v === undefined || isNaN(+v) ? '—' : (+v > 0 ? '+' : +v < 0 ? '−' : '') + D.fmtNum(Math.abs(+v), d));
  D.fmtTs = (ts) => { if (!ts) return '—'; const p = D.nowTz(new Date(ts)); return D.fmtDate(D.keyOf(p.y, p.m, p.d)) + ' ' + D.fmtTime(p.h, p.min); };

  /* ------------------------------------------------------------------ */
  /* numbers                                                             */
  /* ------------------------------------------------------------------ */
  D.fmtNum = (n, d) => { n = +n || 0; return (d !== undefined ? +n.toFixed(d) : n).toLocaleString('ru-RU'); };
  D.fmtMoney = (n, opts = {}) => {
    const cur = opts.currency || (D.S ? D.S.settings.currency : 'UZS');
    const v = Math.round(+n || 0);
    const sign = v < 0 ? '−' : '';
    const s = Math.abs(v).toLocaleString('ru-RU');
    const sym = { UZS: "so'm", USD: '$', EUR: '€', RUB: '₽', KZT: '₸' }[cur] || cur;
    // non-breaking space so an amount never wraps away from its currency
    return sym.length === 1 ? `${sign}${sym}${s}` : `${sign}${s}\u00A0${sym}`;
  };
  D.fmtPct = (x, d = 0) => (Math.round((+x || 0) * 10 ** d) / 10 ** d) + '%';

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

  // emoji: the record's own, else the sphere default (never persisted — a later sphere change updates it)
  const SPHERE_EMOJI = { ruh: '🕌', aql: '📘', qalb: '💚', tana: '🏃', boshqa: '✅', aralash: '✨' };
  D.habitEmoji = (h) => (h && h.emoji) || SPHERE_EMOJI[h && h.sphere] || SPHERE_EMOJI.boshqa;

  /* SOHANING SUKUT BELGISI — EMOJI EMAS, CHIZIQLI IKONKA.
     Ilovaning qolgan hamma joyi D.icons dagi bir xil chiziqli to'plamni
     ishlatadi. Soha belgilari esa emoji edi va ular Vazifa, Kitob hamda
     Sozlash ekranlarida o'sha ikonkalar YONIDA turardi — rangli multfilm
     belgisi monoxrom chiziq yonida. Uyg'unlik shu yerda buzilardi.
     Rang yo'qolmaydi: plitka foni allaqachon soha rangida (.hb-emoji
     --c), endi ikonkaning o'zi ham o'sha rangda chiziladi.
     FOYDALANUVCHI TANLAGAN EMOJI SAQLANADI — h.emoji bo'lsa, o'sha
     chiqadi. O'zgargani faqat SUKUT qiymati. */
  const SPHERE_ICON = { ruh: 'mosque', aql: 'book', qalb: 'heart', tana: 'dumbbell', boshqa: 'check', aralash: 'sparkles' };
  D.SPHERE_ICON = SPHERE_ICON;
  D.sphereIcon = (sp) => SPHERE_ICON[sp] || SPHERE_ICON.boshqa;
  /** Odat belgisi HTML bo'lib qaytadi: foydalanuvchi emojisi yoki soha ikonkasi. */
  D.habitMark = (h, px) => {
    const em = h && h.emoji;
    if (em) return '<span class="mark-em">' + D.esc(em) + '</span>';
    return D.ic(SPHERE_ICON[h && h.sphere] || SPHERE_ICON.boshqa, px || 15);
  };

  /* Moliya kategoriyasining belgisi. Qiymat D.icons dagi nom bo'lsa —
     chiziqli ikonka; aks holda matn bo'lib chiziladi. Ikkinchisi kerak,
     chunki eski foydalanuvchilarning holatida emoji saqlanib qolgan va
     Sozlashda odam o'zi ham istalgan belgi yozishi mumkin. */
  D.catMark = (icon, px) => {
    const v = String(icon == null ? '' : icon).trim();
    if (v && D.hasIcon(v)) return D.ic(v, px || 16);
    return '<span class="mark-em">' + D.esc(v) + '</span>';
  };

  // tick/count mutators shared by Bugun and Vazifa. None of them save or rerender — callers do.
  const targetOf = (h) => (h && h.target && +h.target.n > 0 ? +h.target.n : 0);
  function setLog(k, id, on) {
    const arr = D.S.logs[k] || [];
    const i = arr.indexOf(id);
    if (on && i < 0) arr.push(id);
    if (!on && i >= 0) arr.splice(i, 1);
    if (arr.length) D.S.logs[k] = arr; else delete D.S.logs[k];
  }
  /* Kitob va ko'rgan narsalar — belgilashning YAGONA joyi.
     Uchta joydan chaqiriladi (Kitoblar sahifasi, Bugun ro'yxati, kun jadvali).
     Ilgari mantiq faqat books.js da edi: Bugun'dan belgilanganda bet soni
     o'zgarmay, Kitoblar'dan belgilanganda o'zgarardi — bir xil amal ikki xil
     natija berardi va betlar yo'qolardi. */
  D.media = {
    find: (id) => D.S.media.find((m) => m.id === id) || null,
    on: (id, day) => +((D.S.mediaLogs[day] || {})[id]) > 0,
    /** Belgini teskari qiladi. Bet hisobi va holat ham shu yerda yuritiladi.
        Saqlash va qayta chizishni chaqiruvchi qiladi. */
    toggle(id, day) {
      const m = D.media.find(id);
      if (!m || !day) return false;
      const o = D.S.mediaLogs[day] || (D.S.mediaLogs[day] = {});
      const was = +o[id] > 0;
      if (was) {
        delete o[id];
        if (m.perDay) m.done = D.clamp(m.done - m.perDay, 0, m.total || 999999);
        // Tugagan deb belgilangan kitob belgisi olinganda yana o'qilayotganga qaytadi
        if (m.status === 'done' && m.total && m.done < m.total) m.status = 'now';
      } else {
        o[id] = 1;
        if (m.perDay) m.done = D.clamp(m.done + m.perDay, 0, m.total || 999999);
        if (m.total && m.done >= m.total) m.status = 'done';
      }
      if (!Object.keys(o).length) delete D.S.mediaLogs[day];
      return !was;
    },
  };

  D.habits = {
    // plain habit: flip S.logs[day] membership; targeted habit: done = counts ≥ target. Returns the new done state.
    toggle(h, day) {
      const q = targetOf(h);
      const on = q ? ((D.S.counts[day] || {})[h.id] || 0) >= q : !(D.S.logs[day] || []).includes(h.id);
      setLog(day, h.id, on);
      return on;
    },
    // targeted habit: S.counts[day][h.id] += delta (clamped 0..9999), then S.logs mirrors counts ≥ target. Returns the new count.
    bump(h, day, delta = 1) {
      const q = targetOf(h);
      if (!q) return 0;
      const c = D.S.counts[day] || {};
      const n = D.clamp((+c[h.id] || 0) + (+delta || 0), 0, 9999);
      if (n) c[h.id] = n; else delete c[h.id];
      if (Object.keys(c).length) D.S.counts[day] = c; else delete D.S.counts[day];
      setLog(day, h.id, n >= q);
      return n;
    },
    done(h, day) {
      const q = targetOf(h);
      if (!q) return { done: (D.S.logs[day] || []).includes(h.id), n: null, target: null };
      const n = +((D.S.counts[day] || {})[h.id] || 0);
      return { done: n >= q, n, target: q };
    },
    doneLabel: (h) => (h && h.doneLabel) || (h && h.name) || '',
    // set a plain habit's tick to a value (used by the prayer → habit mirror in today.js)
    mark: (id, day, on) => setLog(day, id, !!on),
  };

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

  // Tugmalar qatori — oyna ham, pastki oyna ham shuni ishlatadi
  const actionsHtml = (list) => list.map((a) =>
    `<button class="btn ${a.primary ? '' : 'ghost'} ${a.danger ? 'danger' : ''}" data-act="${a.act}" ${a.data ? Object.entries(a.data).map(([k, v]) => `data-${k}="${D.esc(v)}"`).join(' ') : ''}>${D.esc(a.label)}</button>`).join('');

  // iOS: fon skrollini qulflash (o'rnini eslab qolgan holda)
  let lockY = 0, locked = 0;
  function scrollLock() {
    if (locked++) return;
    lockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -lockY + 'px';
    document.body.classList.add('modal-open');
  }
  function scrollUnlock() {
    if (!locked || --locked) return;
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, lockY);
  }

  D.modal = (o) => {
    const bg = D.$('#modalBg');
    const acts = actionsHtml(o.actions || [{ label: D.t('btn.close'), act: 'closeModal' }]);
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${D.esc(o.title || '')}">
      <div class="modal-head"><div class="modal-title">${D.esc(o.title || '')}</div><button class="modal-close" data-act="closeModal" aria-label="close">×</button></div>
      <div class="modal-body">${o.body || ''}</div>
      ${acts ? `<div class="modal-actions">${acts}</div>` : ''}</div>`;
    bg.classList.add('show');
    if (!bg._open) { bg._open = true; scrollLock(); }
    bg._onClose = o.onClose || null;
    if (o.onOpen) setTimeout(o.onOpen, 0);
    const f = bg.querySelector('input,textarea,select,button.btn');
    if (f && !o.noFocus) setTimeout(() => f.focus(), 30);
  };
  D.closeModal = () => {
    const bg = D.$('#modalBg');
    if (!bg || !bg.classList.contains('show')) return;
    bg.classList.remove('show');
    if (bg._open) { bg._open = false; scrollUnlock(); }
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
  /* Pastki oyna — telefonda ekran ostidan suriladi, kompyuterda odatdagi oyna.
     Modaldan farqi: markazga emas, barmoq yetadigan joyga chiqadi va fonni
     bosib yopiladi. Android'da tanlov shu usulda so'raladi. */
  D.closeSheet = () => {
    const bg = D.$('#sheetBg'), sh = D.$('#sheet');
    if (!sh || !sh.classList.contains('show')) return;
    sh.classList.remove('show');
    if (bg) bg.classList.remove('show');
    const fn = sh._onClose; sh._onClose = null;
    if (fn) try { fn(); } catch (e) { console.error(e); }
  };
  D.act.closeSheet = () => D.closeSheet();
  D.sheet = (html, opts = {}) => {
    const bg = D.$('#sheetBg'), sh = D.$('#sheet');
    if (!bg || !sh) return D.modal({ title: opts.title || '', body: html, actions: opts.actions || [], onOpen: opts.onOpen, onClose: opts.onClose, noFocus: opts.noFocus });
    sh.innerHTML = `<i class="sheet-grip"></i>${opts.title ? `<h3 class="sheet-title">${D.esc(opts.title)}</h3>` : ''}<div class="sheet-body">${html}</div>`
      + (opts.actions && opts.actions.length ? `<div class="sheet-actions">${actionsHtml(opts.actions)}</div>` : '');
    sh._onClose = opts.onClose || null;
    bg.classList.add('show');
    /* Brauzer boshlang'ich holatni (translateY(101%)) chizib olishi kerak,
       aks holda sirg'alish o'rniga sakrash bo'ladi. Buni majburiy layout
       bilan qilamiz, requestAnimationFrame bilan emas: rAF kechiksa yoki
       umuman chaqirilmasa (fonga tushgan ilova, ba'zi webview'lar) sinf
       qo'yilmay qolardi — natijada fon qorayadi, oyna esa ekran ostida
       ko'rinmay turaveradi. Bitta kichik element uchun bir marta o'lchov —
       arzon va ishonchli. */
    void sh.offsetHeight;
    sh.classList.add('show');
    if (opts.onOpen) setTimeout(() => { try { opts.onOpen(); } catch (e) { console.error(e); } }, 0);
  };

  /* Paneldagi kamera tugmasi olib tashlandi: o'rtadagi joy endi Ovqat
     bo'limining o'zi. Kamera yo'qolgani yo'q — Ovqat sahifasining birinchi
     kartasi aynan u (food.js › capture), ya'ni bitta bosish o'rniga ikkita. */

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
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    /* moliya kategoriyalari uchun qo'shildi — ilgari bu yerda emoji turardi */
    bus: '<path d="M8 6v6M15 6v6M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2s-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>',
    sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mosque: '<path d="M4 21h16M5 21v-7M19 21v-7M7 14h10M7 14a5 5 0 0 1 10 0M12 4v3M12 3l1-1M12 3l-1-1"/><path d="M8 21v-3a2 2 0 0 1 4 0M12 18a2 2 0 0 1 4 0v3"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m10.3 3.9-8.2 14.2A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
    flag: '<path d="M4 22V4a1 1 0 0 1 1-1h11l-1 4 1 4H5"/>',
    hands: '<path d="M11 14V6a2 2 0 1 0-4 0v8M7 14V8a2 2 0 1 0-4 0v7a7 7 0 0 0 14 0v-3a2 2 0 1 0-4 0M15 12V9a2 2 0 1 1 4 0v6"/>',
    beads: '<circle cx="12" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="15" cy="19" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="6" cy="8" r="2"/>',
    brain: '<path d="M12 4a3 3 0 0 0-3 3v10a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z"/><path d="M9 8a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3M15 8a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3"/>',
    apple: '<path d="M12 6c-2-2-6-1-7 3s2 9 4 10 3-1 3-1 1 2 3 1 5-6 4-10-5-5-7-3Z"/><path d="M12 6c0-2 1-3 2-4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.2 6.4-6.4 2.2 2.2-6.4Z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 9.1-9.1M17 5l3 3M14 8l3 3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  };
  /* D.ic() UCHUN EMAS — «bu nom to'plamda bormi?» degan savol uchun.
     Ishlatuvchilar: D.catMark (quyida) va settings.js dagi kategoriya
     tahriri — ular qiymat ikonka nomimi yoki odam yozgan emojimi, shuni
     ajratishi kerak.
     ILGARI BU YERDA `D.icons = P` turardi va u 2026-09-15 da «o'lik kod»
     deb olib tashlandi — o'sha kuni men unga tayanadigan kodni parallel
     yozgandim. Ikki o'zgarish toza birlashdi, chunki boshqa-boshqa
     qatorlarda edi; xato faqat ekran ochilganda chiqdi. Nomli funksiya
     shuning uchun: u o'lik bo'lib ko'rinmaydi. */
  D.hasIcon = (name) => !!(name && P[name]);
  D.ic = (name, size = 18, extra = '') => {
    const p = P[name] || P.info;
    return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
  };

  /* ------------------------------------------------------------------ */
  /* charts (return SVG/HTML strings)                                    */
  /* ------------------------------------------------------------------ */
  D.chart = {
    ring({ pct = 0, size = 120, stroke = 11, color = 'var(--success)', track = 'var(--line)', label = '', sub = '', glow = true, id = '' }) {
      const r = (size - stroke) / 2, C = 2 * Math.PI * r, p = D.clamp(pct, 0, 100);
      return `<div class="ring-wrap" style="width:${size}px;height:${size}px" ${id ? `id="${id}"` : ''}>
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
          <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
            stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - p / 100)).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})" ${glow ? 'style="filter:drop-shadow(0 0 14px ' + color + ')"' : ''}/>
        </svg>
        <div class="ring-val"><div class="ring-pct num">${label !== '' ? label : Math.round(p) + '%'}</div>${sub ? `<div class="ring-sub">${sub}</div>` : ''}</div></div>`;
    },
    /* Kun jadvali — Excel'dagi habit tracker'ning o'zi: har qator bitta ish,
       har ustun bitta kun, o'ng chekkada oylik hisob. Ikki joyda ishlatiladi
       (Bugun — odat va kitob, Ibodat — besh namoz), shuning uchun ko'rinish
       shu yerda bitta bo'lib turadi: ikki xil jadval ikki xil tilda gapirmasin.

       rows: [{ lab, cells: [{cls, title, attrs}], n, total }]
       days: kun kalitlari massivi (chapdan o'ngga) */
    tracker({ days = [], rows = [], head = true }) {
      const n = days.length || 1;
      let h = '';
      if (head) {
        h = '<div class="trk-corner l"></div>';
        for (const k of days) {
          const d = +k.slice(8);
          // Har beshinchi kun raqamlanadi: o'ttizta raqam sig'maydi, sig'sa ham o'qilmaydi
          h += `<div class="trk-h">${d === 1 || d % 5 === 0 ? d : ''}</div>`;
        }
        h += '<div class="trk-corner r"></div>';
      }
      const body = rows.map((r) => {
        const cells = r.cells.map((c) =>
          `<button class="trk-cell ${c.cls || ''}" ${c.attrs || ''} title="${D.esc(c.title || '')}"></button>`).join('');
        const pct = r.total ? D.clamp((r.n / r.total) * 100, 0, 100) : 0;
        return `<div class="trk-lab" title="${D.esc(r.lab)}">${D.esc(r.lab)}</div>${cells}
          <div class="trk-n num"><i style="width:${pct.toFixed(0)}%"></i><span>${D.fmtNum(r.n || 0)}</span></div>`;
      }).join('');
      return `<div class="trk-scroll"><div class="trk" style="--n:${n}">${h}${body}</div></div>`;
    },
    /* Bo'lakli yoy — bitta katta raqam uchun. Halqadan farqi: yarim doira,
       ya'ni raqam o'rtada emas, ostida turadi va uzoqdan o'qiladi; bo'laklar
       esa qancha qolganini sanab ko'rsatadi. Foizni og'zaki o'qish oson bo'lsin
       uchun bo'laklar soni 15 — har biri taxminan 6,7 %. */
    arc({ pct = 0, n = 15, color = 'var(--accent)', track = 'var(--line2)', label = '', sub = '', cap = '', id = '' }) {
      const p = D.clamp(pct, 0, 100), on = Math.round((n * p) / 100);
      let seg = '';
      for (let i = 0; i < n; i++) {
        const a = -84 + i * (168 / (n - 1));
        seg += `<rect x="93.5" y="8" width="13" height="27" rx="6.5" transform="rotate(${a.toFixed(2)} 100 100)" fill="${i < on ? color : track}"${i < on ? ` class="on" style="filter:drop-shadow(0 0 6px ${color})"` : ''}/>`;
      }
      return `<div class="arc-wrap"${id ? ` id="${id}"` : ''}>
        <svg class="arc" viewBox="0 0 200 112" role="img" aria-label="${D.esc(String(label || Math.round(p) + '%'))}">${seg}</svg>
        <div class="arc-val"><div class="arc-num num">${label !== '' ? label : Math.round(p) + '%'}</div>${sub ? `<div class="arc-sub">${sub}</div>` : ''}</div>
        ${cap ? `<div class="arc-cap">${cap}</div>` : ''}</div>`;
    },
    /* Ustunlar CSS bilan chiziladi, SVG bilan emas.
       SVG varianti viewBox="0 0 280 H" + preserveAspectRatio="none" edi:
       karta eni 280 px emas, telefonda ~340, desktopda ~800 px — ya'ni
       rasm eniga cho'ziladi. Chiziqni `vector-effect` qutqaradi, lekin
       rx ni hech narsa qutqarmaydi: rx=5 desktopda gorizontal ~14 px,
       vertikal 5 px bo'lib chiqardi va ustun boshi yassilanib ketardi.
       CSS da radius haqiqiy piksel va juda tor ustunda brauzerning o'zi
       uni mutanosib kichraytiradi. Ustun eni 0,68 ustun kengligi —
       SVG variantidagi nisbat saqlandi. */
    bars({ values = [], labels = [], color = 'var(--success)', height = 70, target = null, max = null, colors = null, miss = null }) {
      const vs = values.map((v) => +v || 0), n = vs.length || 1;
      const mx = max || Math.max(1, ...vs, target || 0);
      const pct = (v) => (v / mx) * 96;   // tepada 4 % nafas qoladi
      const fmt = (v) => D.fmtNum(v, Number.isInteger(v) ? 0 : 1);
      const cols = vs.map((v, i) => {
        const c = colors ? colors[i] : miss && miss[i] ? 'var(--danger)' : color;
        const lab = labels[i] ? D.esc(labels[i]) + ': ' : '';
        return `<i style="height:${Math.max(2, pct(v)).toFixed(2)}%;background:${c}${v ? '' : ';opacity:.25'}" title="${lab}${fmt(v)}"></i>`;
      }).join('');
      const tgt = target ? `<i class="barc-target" style="bottom:${D.clamp(pct(target), 0, 100).toFixed(2)}%"></i>` : '';
      return `<div class="barc" style="height:${height}px" role="img" aria-label="${D.esc(labels.map((l, i) => l + ' ' + fmt(vs[i])).join(', '))}">
        ${tgt}<div class="barc-cols" style="column-gap:${(32 / n).toFixed(2)}%">${cols}</div></div>`
        + (labels.length ? `<div class="spark-labels">${labels.map((l) => `<span>${D.esc(l)}</span>`).join('')}</div>` : '');
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
      const svg = `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px;color:${color}">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".45"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
        ${fill ? `<path d="${d} L${pts[n - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z" fill="url(#${gid})"/>` : ''}
        <path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      </svg>`;
      if (!dots) return svg;
      /* Nuqtalar SVG ichida bo'lsa preserveAspectRatio="none" ularni ham
         cho'zadi — doira o'rniga ellips chiqadi (chiziqni non-scaling-stroke
         qutqaradi, doirani esa hech narsa). Shuning uchun ular SVG ustiga
         qo'yilgan HTML: har qanday enda dumaloq qoladi. */
      return `<div class="sparkw" style="color:${color}">${svg}<div class="spark-dots">${pts.map((p) => `<i style="left:${((p[0] / W) * 100).toFixed(2)}%;top:${((p[1] / H) * 100).toFixed(2)}%"></i>`).join('')}</div></div>`;
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

  /* ------------------------------------------------------------------ */
  /* Kechiktirilgan bo'limlar                                            */
  /* Bu to'rttasi «Yana» panelida yashaydi va birinchi ekran ularning    */
  /* hech biriga murojaat qilmaydi — Bugun faqat food / ibodat / whoop / */
  /* ai ni chaqiradi. Shu sabab index.html ularni yuklamaydi: bu yerda   */
  /* nav uchun yetadigan stub turadi (yorliqlar i18n.js da, ya'ni nav    */
  /* birinchi kadrdan to'liq), haqiqiy fayl esa birinchi render'dan      */
  /* keyin bo'sh vaqtda fonda keladi va D.view() bilan stub ustiga       */
  /* yoziladi. Foydalanuvchi undan oldin bossa — skelet ko'rsatiladi va  */
  /* o'sha bitta fayl kutiladi.                                          */
  /* O'lchov (2026-09-09): 257 KB xom / 75 KB gzip sovuq startdan chiqdi. */
  /* ------------------------------------------------------------------ */
  const LAZY = [
    { id: 'finance',  icon: 'wallet',   order: 30, primary: false },
    { id: 'tasks',    icon: 'checkSq',  order: 50, nav: true, primary: false },
    // Odat va Kitob — Vazifa ichidagi sahifalar. Bo'lim sifatida ro'yxatda
    // qoladi (eski #habits havolasi ishlashi uchun), lekin nav: false —
    // ya'ni na pastki panelda, na yon panelda o'z yorlig'i bo'lmaydi.
    { id: 'books',    icon: 'book',     order: 60, nav: false, primary: false },
    { id: 'habits',   icon: 'fire',     order: 15, nav: false, primary: false },
    { id: 'yusa',     icon: 'sparkles', order: 70, nav: true, primary: false },
    { id: 'settings', icon: 'gear',     order: 90, nav: true, primary: false },
  ];
  /* Sog'liq / Ibodat / ai / profile / onboard / yusa-orb ni ham shu yerga ko'chirib
     ko'rildi (228 KB, birinchi ekran ularning bayti bilan ishlamaydi). Navbatma-navbat
     uch tur o'lchovda YUTUQ CHIQMADI — uch turdan ikkitasida eager variant tezroq bo'ldi,
     birinchi chizishgacha ketgan skript vaqti ham eager foydasiga (161 ms / 257 ms).
     Sababi: V8 chaqirilmagan funksiyani to'liq kompilyatsiya qilmaydi, ya'ni «o'qilmagan»
     228 KB bayt soni ko'rsatganchalik qimmat emas. Qayta urinmang — avval o'lchang. */
  const lazySrc = {}, lazyLoad = {};
  for (const m of LAZY) {
    lazySrc[m.id] = (m.src || ('js/' + m.id + '.js')) + VQ;
    D.views[m.id] = Object.assign({}, m, { stub: true, render: () => skeleton() });
  }
  /** Bitta faylni qo'shadi. Takroriy chaqiruv o'sha va'dani qaytaradi. */
  const scriptCache = {};
  D.loadScript = (src) => {
    if (!scriptCache[src]) {
      scriptCache[src] = new Promise((res) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = false;                    // kiritilish tartibida bajarilsin
        el.onload = () => res(true);
        el.onerror = () => { console.error('fayl yuklanmadi', src); res(false); };
        document.head.appendChild(el);
      });
    }
    return scriptCache[src];
  };
  /** Bo'lim emas, kutubxona: D.loadLib('profile'). Manzil preload bilan bir xil
      bo'lishi shart (?v= ham) — aks holda fayl ikki marta yuklanadi. */
  D.loadLib = (name) => D.loadScript('js/' + name + '.js' + VQ);
  /** Bitta kechiktirilgan bo'limni yuklaydi. Takroriy chaqiruv o'sha va'dani qaytaradi. */
  D.loadView = (id) => {
    if (!lazySrc[id]) return Promise.resolve(false);
    if (!lazyLoad[id]) {
      const src = lazySrc[id];
      lazyLoad[id] = D.loadScript(src).then((ok) => { if (ok) delete lazySrc[id]; return ok; });
    }
    return lazyLoad[id];
  };
  /** Qolganini fonda olib qo'yish — bosilganda kutish bo'lmasin.
      Bittalab: hammasini birdan qo'shsak, el.async=false ularni ketma-ket, bo'linmaydigan
      bitta bo'lakda bajaradi (225 KB tahlil) va o'sha paytda bosilgan tugma javob bermaydi.
      Har fayldan keyin bo'sh vaqtni kutamiz, shunda oradagi bosishlar o'tib ketadi. */
  /* Bo'lim emas, kutubxona, lekin birinchi ekranga ham kerak emas: u faqat
     Sozlashdagi profil kartasida chiziladi. Navbatning oxirida keladi va
     kelgach o'zi bir marta nishonlarni tekshiradi. */
  const LAZY_LIBS = ['levels'];
  D.preloadViews = () => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const queue = Object.keys(lazySrc).map((id) => () => D.loadView(id))
      .concat(LAZY_LIBS.map((name) => () => D.loadLib(name)));
    const next = () => {
      const job = queue.shift();
      if (!job) return;
      job().then(() => {
        if (queue.length) return idle(next, { timeout: 1500 });
        // Navbat tugadi. Bir marta qayta chizamiz: kelgan fayllardan biri joriy ekranga
        // qo'shadigan narsa bergan bo'lishi mumkin (masalan ibodat.js dagi qazo bloki).
        // Har fayldan keyin chizish — o'n bitta ortiqcha to'liq render, o'lchab ko'rildi.
        D.renderNav(); D.rerender();
      });
    };
    next();
  };

  // Ko'chgan bo'limlarning eski manzillari. Eski havolalar, #hash lar va
  // saqlangan D.ui.view baribir ishlashi kerak: yangilanishdan keyin odam
  // oxirgi ko'rgan ekranida qolsin, yorlig'i yonib turgan holda.
  //   Ovqat   — Ovqat bo'limining birinchi sahifasi (ilgari alohida bo'lim)
  //   Odat    — Vazifa bo'limining sahifasi
  //   Kitob   — Vazifa bo'limining sahifasi
  const ALIAS = { food: ['health', 'ovqat'], habits: ['tasks', 'habits'], books: ['tasks', 'books'] };
  /** '#food' yoki '#habits' ni mavjud bo'lim va bo'limchaga aylantiradi.
      null — bunday bo'lim yo'q. Eski manzilning bo'limchasi o'z uyasiga
      yoziladi: '#habits/tahlil' → Vazifa › Odat, Odatning ichida esa «Tahlil». */
  const resolveView = (h, sub) => {
    const al = ALIAS[h];
    if (!al) return D.views[h] ? [h, sub] : null;
    if (sub && D.views[h] && D.ui.sub[h] !== sub) { D.ui.sub[h] = sub; D.saveUi(); }
    return al.slice();
  };
  D.go = (id, sub, opts = {}) => {
    const al = ALIAS[id];
    if (al) {
      // Eski manzilning bo'limchasi o'z uyasida qoladi: '#habits/tahlil' →
      // Vazifa › Odat, va Odatning ichida ham o'sha «Tahlil» ochiladi.
      // D.ui.sub bo'lim kesimida saqlanadi, ya'ni ikkalasi bir-biriga tegmaydi.
      if (sub !== undefined && D.views[id] && D.ui.sub[id] !== sub) { D.ui.sub[id] = sub; D.saveUi(); }
      id = al[0]; sub = al[1];
    }
    if (!D.views[id]) id = 'today';
    if (sub !== undefined) D.ui.sub[id] = sub;
    if (TABS.indexOf(id) >= 0) D.ui.from = id;
    if (current && current !== id && D.views[current].unmount) { try { D.views[current].unmount(); } catch (e) { console.error(e); } }
    const changed = current !== id;
    current = id;
    D.ui.view = id;
    D.saveUi();
    // Manzilda bo'limcha ham turadi (#prayer/log) — havola aniq sahifani ochsin.
    // Bo'lim almashganda tarixga YANGI yozuv qo'shiladi: shundagina telefonning
    // orqaga ishorasi oldingi bo'limga qaytaradi. Ilgari har safar replaceState
    // edi, ya'ni butun sessiyada bitta yozuv bo'lib, orqaga ishorasi odamni
    // ilovadan chiqarib yuborardi. Tarixdan kelgan chaqiruvda (popstate) esa
    // yangi yozuv qo'shilmaydi — aks holda orqaga qaytish cheksiz aylanardi.
    const cur = D.ui.sub[id];
    const want = '#' + id + (cur ? '/' + cur : '');
    if (location.hash !== want) {
      if (changed && !opts.fromHistory) history.pushState({ dash: 1 }, '', want);
      else history.replaceState(history.state, '', want);
    }
    D.renderNav();
    D.renderTop();
    D.rerender();
    // Stub — skelet chiqdi; fayl kelgach haqiqiy bo'lim o'z o'rniga chiziladi.
    if (D.views[id].stub) D.loadView(id).then((ok) => { if (ok && current === id) { D.renderNav(); D.rerender(); } });
    if (changed) {
      window.scrollTo(0, 0);
      // Play the section-enter animation once per navigation — never on an ordinary
      // rerender, otherwise ticking a habit would re-animate the whole page.
      const root = D.$('#view');
      if (root) {
        // D.rerender() has just replaced #view's children, so the animation targets
        // (#view.view-enter > *) are brand-new nodes: they start animating the moment the
        // class matches and there is nothing to "restart". The old remove + read
        // offsetWidth + add dance forced a full synchronous layout of the just-built view
        // from inside the tap handler — measured at 4x CPU throttle, dropping it cut the
        // blocking part of a section switch from 26ms to 16ms.
        root.classList.add('view-enter');
        clearTimeout(D._enterT);
        D._enterT = setTimeout(() => root.classList.remove('view-enter'), 460);
      }
      D.emit('view:changed', id);
    }
  };
  D.current = () => current;
  D.sub = (id, fallback) => (D.ui.sub[id] !== undefined ? D.ui.sub[id] : fallback);
  D.setSub = (id, v) => {
    D.ui.sub[id] = v; D.saveUi();
    // Manzil ham ergashadi: sahifa qayta yuklansa yoki havola ulashilsa,
    // o'sha bo'limcha ochilishi kerak. Bu tarixga yozuv qo'shmaydi —
    // bo'limcha almashuvi «yangi sahifa» emas.
    if (id === current) { const w = '#' + id + '/' + v; if (location.hash !== w) history.replaceState(history.state, '', w); }
    D.rerender();
  };
  D.act.go = (el) => D.go(el.dataset.view, el.dataset.sub);
  D.act.sub = (el) => D.setSub(el.dataset.view || current, el.dataset.sub);

  // First load on a new device: local storage is empty and the server still owes us the data.
  // Show a skeleton instead of a briefly-empty app.
  D.loading = false;
  D.pulled = false;   // D.pull() birinchi marta muvaffaqiyatli tugaganda true — onboarding shunga qaraydi
  const skeleton = () => `<div class="card skel-card"><div class="skel skel-eyebrow"></div><div class="skel skel-kpi"></div>
      <div class="skel-rows">${'<div class="skel skel-row"></div>'.repeat(3)}</div></div>
    <div class="card skel-card">${'<div class="skel skel-row"></div>'.repeat(5)}</div>
    <div class="skel-note">${D.esc(D.t('loading'))}</div>`;
  /* Kechiktirilgan fayl kutilayotganda bo'lim o'rniga turadigan shakl. Endi
     uni bo'limlar ham chaqiradi: Vazifa ichidagi Odat va Kitob sahifalari
     boshqa fayldan keladi, ya'ni ular ham xuddi shu kutishni ko'rsatadi. */
  D.skeleton = skeleton;

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

  // Oxirgi chizilgan bo'lim — morph kerakmi yoki to'g'ridan-to'g'ri almashtirishmi, shu hal qiladi.
  let painted = null;

  D.rerender = () => {
    const v = D.views[current];
    const root = D.$('#view');
    if (!v || !root) return;
    if (D.loading) { painted = null; root.innerHTML = skeleton(); return; }
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
    // Boshqa bo'limga o'tilganda ikki daraxtda umumiy narsa yo'q, lekin morph baribir
    // har bir tugunni isEqualNode bilan solishtirib chiqadi — ya'ni butun shoxni qayta
    // aylanadi. O'lchov (telefon tezligida, Vazifa bo'limi): morph 391 ms, oddiy
    // almashtirish 20 ms. Saqlaydigan narsa ham yo'q: bo'lim almashsa sahifa boshiga
    // qaytadi. Morph faqat bir bo'lim ichidagi yangilanishda kerak — u yerda u
    // aylantirish o'rnini, fokusni va yozilayotgan matnni joyida qoldiradi.
    if (painted !== current) root.replaceChildren(...next.childNodes);
    else try { patchChildren(root, next); } catch (e) { console.error('morph', e); root.innerHTML = html; }
    painted = current;
    next.textContent = '';
    if (v.mount) { try { v.mount(root); } catch (e) { console.error('mount', current, e); D.logError(e); } }
    // Bu yerda scrollTo yo'q: bir bo'lim ichidagi yangilanishda o'rin joyida qolishi kerak,
    // bo'lim almashganda esa D.go o'zi sahifa boshiga qaytaradi.
    D.renderTop();
    D.renderNav();          // yorliqdagi belgi bugungi holatga ergashadi
    D.emit('view:rendered', current);
  };
  D.patch = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* ------------------------------------------------------------------ */
  /* CHROME — tepa panel · pastki panel                                  */
  /* Pastki panelda beshta joy va hammasi haqiqiy bo'lim: o'rtadagisi ham */
  /* tugma emas, yorliq. Qaysi beshtasi ekani shu ro'yxatda turadi —      */
  /* view.primary emas, chunki tartib ham, soni ham qat'iy.              */
  /* O'rtasi — TABS[2], ko'tarilgan doira. Eng ko'p ochiladigan bo'lim shu */
  /* joyga qo'yiladi: bosh barmoq ekranning markaziga eng oson yetadi.    */
  /* ------------------------------------------------------------------ */
  /* Yorliqqa kirmagan bo'limlar yo'qolgani yo'q, boshqa eshikdan kiriladi:
     Sozlash — tepa o'ngdagi profil surati (uning birinchi kartasi profil),
     Odat va Kitob — Vazifa ichidagi sahifalar, Yusa AI — suzuvchi to'garak. */
  const TABS = ['today', 'prayer', 'health', 'finance', 'tasks'];
  /* O'rtadagi ko'tarilgan joyning indeksi. Bitta son — panelning chizilishi
     ham, CSS dagi doira ham shundan kelib chiqadi. */
  const MID = 2;
  /* Yorliq belgisi — chiziqli ikonka, bo'limning o'z `icon` maydonidan
     (D.view() da beriladi). Yon panel allaqachon shuni chizardi, ya'ni endi
     ikkala panel bitta belgini ko'rsatadi.

     Bu yerda ilgari emoji turardi va sababi yozib qo'yilgandi: «beshta joyda
     chiziqli belgilar kichrayib bir-biriga o'xshab qoladi; emoji rangli,
     ya'ni yorliqni o'qimasdan ham tanib olasiz». E'tiroz o'rinli, lekin
     ikkita narsa uni yopadi. Birinchisi — yozuv har doim belgining ostida
     turadi, ya'ni tanish faqat shaklga tayanmaydi. Ikkinchisi va
     muhimrog'i — butun ilovada endi rang MA'LUMOTni bildiradi: yashil
     «yuqori zona», sariq «e'tibor ber». Beshta rangli emoji panelda
     doimiy yonib turganda bu qoida buziladi — ular hech qanday o'lchov
     bildirmasdan ko'zning rangga bo'lgan e'tiborini o'ziga tortadi.
     Shakllar o'zi ham yetarlicha farqli: kalendar, machit, yurak, hamyon,
     belgilangan katak.

     Qaytarish kerak bo'lsa: bu yerga TAB_EM jadvalini qaytaring va quyidagi
     renderNav dagi D.ic(...) o'rniga TAB_EM[id] ni qo'ying — boshqa joyga
     tegmaydi. */

  D.renderTop = () => {
    const el = D.$('#top');
    if (!el) return;
    const v = D.views[current] || {};
    const isTab = TABS.indexOf(current) >= 0;
    let title = '', sub = '';
    try { title = v.title ? v.title() : D.t('nav.' + current); } catch (e) { title = D.t('nav.' + current); }
    try { sub = v.subtitle ? v.subtitle() : ''; } catch (e) { sub = ''; }
    /* Sana — bo'lim nomining USTIDA, mayda katta harflarda (css/whoop-ui.css uni
       `order: -1` bilan tepaga chiqaradi). Avval «qachon», keyin «nima» — WHOOP
       bosh sahifasining tartibi shu. Bo'lim o'z izohini bersa, o'shanisi ustun:
       sana hamma sahifada bir xil, izoh esa sahifaga xos. Ichki sahifada umuman
       yozilmaydi — u yerda chap burchakda orqaga strelkasi turadi. */
    if (!sub && isTab) { try { sub = D.esc(D.fmtDate(D.today(), 'weekday')); } catch (e) { sub = ''; } }
    // Chap burchak — faqat ichki sahifada, orqaga qaytish uchun. Yorliqda u bo'sh:
    // yorliqdan qaytadigan joy yo'q, panel o'zi turibdi.
    const left = isTab ? ''
      : `<button class="top-btn" data-act="back" aria-label="${D.esc(D.t('btn.back'))}">${D.ic('chevL', 19)}</button>`;
    /* Hammasi bitta qatorda: chapda bo'lim nomi va uning ostida sana, o'ngda
       profil surati. Ilgari nom qatorning OSTIDA, alohida katta sarlavha
       bo'lib turardi — har sahifada qo'shimcha 44 px joy yeyardi va ekranning
       tepasi ikkiga bo'linardi. Endi panel bitta.
       Bo'lim boshqaruvi (sana strelkalari) bu yerdan olib tashlandi: kun
       tanlash har bo'limning o'z sahifasida — Asosiyda kun chizig'i,
       Ovqatda 7 kunlik chizma, Ibodatda sahifaning o'z strelkalari. */
    el.innerHTML = `<div class="top-row">${left}
        <div class="top-txt"><h1 class="top-title">${D.esc(title)}</h1>${sub ? `<p class="top-sub">${sub}</p>` : ''}</div>
        <button class="top-btn top-avatar" data-act="openProfile" aria-label="${D.esc(D.t('nav.settings'))}">${avatarMini()}</button></div>`;
  };
  // Profil surati hali kelmagan bo'lsa ham bir narsa turishi kerak — bosh harf.
  function avatarMini() {
    try { if (D.profile && D.profile.avatarHtml) return D.profile.avatarHtml(38, 'pf-av'); } catch (e) {}
    return '<i class="top-av"></i>';
  }
  D.act.openProfile = () => { if (D.profile && D.profile.open) D.profile.open(); else D.go('settings'); };
  /* Orqaga. Ilgari bu D.go chaqirardi, ya'ni tarixga OLDINGA yozuv qo'shardi:
     tugmani bosib qaytgan odam telefonning orqaga ishorasini bosganda yana
     o'sha sahifaga qaytib kirardi. Endi tarixning o'zidan chekinamiz — ikkala
     yo'l bir tomonga qaraydi. Tarixda o'z yozuvimiz bo'lmasa (to'g'ridan-to'g'ri
     havola bilan kirilgan) oxirgi yorliqqa qaytamiz. */
  D.act.back = () => {
    if (history.state && history.state.dash) { history.back(); return; }
    D.go(TABS.indexOf(D.ui.from) >= 0 ? D.ui.from : 'today', undefined, { fromHistory: true });
  };

  /* Panelning o'zida bugungi holat ko'rinib tursin: «Odat» yorlig'ida bugun
     nechta ish qolgani yoziladi. Hammasi bajarilganda raqam yo'qoladi — belgi
     ish qolganda kerak, bajarilgandan keyin esa faqat shovqin.
     Hisob core'da: modul kechiktirib yuklanadi, belgi esa birinchi kadrdan
     to'g'ri turishi kerak. */
  const BADGE = {
    tasks() {
      const td = D.today();
      let n = 0;
      try {
        const logs = new Set(D.S.logs[td] || []), counts = D.S.counts[td] || {};
        for (const h of D.activeHabits()) {
          if (!D.habitDue(h, td)) continue;
          const q = h.target && h.target.n ? +h.target.n : 0;
          if (!(q ? (+counts[h.id] || 0) >= q : logs.has(h.id))) n++;
        }
        const ml = D.S.mediaLogs[td] || {};
        for (const m of D.S.media) if (m.status === 'now' && !(+ml[m.id] > 0)) n++;
        // Vazifa yorlig'i endi uchta sahifani (vazifa · odat · kitob) qamrab
        // oladi, ya'ni belgi ham uchalasini sanaydi. Kechikkani ham qo'shiladi:
        // o'tgan kunning bajarilmagan ishi bugun ham qolgan ish.
        for (const x of D.S.tasks) if (!x.done && x.date && x.date <= td) n++;
      } catch (e) { return 0; }
      return n;
    },
  };

  D.renderNav = () => {
    const nav = D.$('#nav'), side = D.$('#side');
    const btn = (id, mid) => {
      const v = D.views[id];
      if (!v) return '';
      let b = 0;
      try { b = BADGE[id] ? BADGE[id]() : 0; } catch (e) { b = 0; }
      const lab = D.esc(D.t('nav.' + id));
      return `<button class="nav-tab${mid ? ' nav-mid' : ''}${current === id ? ' on' : ''}" data-act="go" data-view="${id}" aria-label="${lab}">
        <span class="nav-ic"><span class="nav-em">${D.ic(v.icon || 'grid', 22)}</span>${b ? `<i class="nav-badge num">${D.fmtNum(b)}</i>` : ''}</span>
        <span class="nav-lab">${lab}</span></button>`;
    };
    // Beshta yorliq bir xil yo'l bilan chiziladi — o'rtadagisining farqi
    // faqat ko'rinishda (CSS dagi .nav-mid), bosilishi boshqalarniki bilan bir xil.
    if (nav) nav.innerHTML = TABS.map((id, i) => btn(id, i === MID)).join('');
    // Kata ekranda yon panel qoladi va u yerda hamma bo'lim ko'rinadi —
    // u yerda joy siqilmaydi, yashirishning ma'nosi yo'q.
    if (side) side.innerHTML = D.viewList().filter((v) => v.nav !== false)
      .map((v) => `<button class="side-tab ${current === v.id ? 'on' : ''}" data-act="go" data-view="${v.id}">${D.ic(v.icon, 18)}<span>${D.esc(D.t('nav.' + v.id))}</span></button>`).join('');
  };

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
    const bg = D.$('#modalBg');
    if (bg && ev.target === bg) { D.closeModal(); return; }
    const sbg = D.$('#sheetBg');
    if (sbg && ev.target === sbg) { D.closeSheet(); return; }
    dispatch('data-act', ev);
  });
  document.addEventListener('change', (ev) => dispatch('data-change', ev));
  document.addEventListener('input', (ev) => dispatch('data-input', ev));
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey && ev.target.matches && ev.target.matches('input[data-enter]')) { ev.preventDefault(); const fn = D.act[ev.target.dataset.enter]; if (fn) fn(ev.target, ev); return; }
    if (ev.key === 'Escape') { D.closeModal(); D.closeSheet(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z' && !ev.target.matches('input,textarea,[contenteditable]')) { ev.preventDefault(); D.undo.pop(); }
  });

  // Cyrillic ↔ Latin transliteration (Uzbek) — ro'yxatlarni saralash uchun
  const CYR = [['ё', 'yo'], ['ю', 'yu'], ['я', 'ya'], ['ч', 'ch'], ['ш', 'sh'], ['ц', 'ts'], ['ғ', 'g'], ['қ', 'q'], ['ў', 'o'], ['ҳ', 'h'], ['х', 'x'], ['ж', 'j'],
    ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'], ['з', 'z'], ['и', 'i'], ['й', 'y'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'],
    ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['э', 'e'], ['ъ', ''], ['ь', '']];
  D.translit = {
    toLatin: (s) => { s = String(s || '').toLowerCase(); for (const [c, l] of CYR) s = s.split(c).join(l); return s; },
    norm: (s) => D.translit.toLatin(s).replace(/[ʼ’'`‘ʻ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(),
  };

  /* ------------------------------------------------------------------ */
  /* passcode gate (server bilan, Telegramdan tashqarida)                */
  /* ------------------------------------------------------------------ */
  let authPending = null;
  D.auth = {
    /** Bir vaqtda bitta oyna; hamma kutayotgan so'rovlar bitta javobni oladi. */
    ask() {
      if (authPending) return authPending;
      authPending = new Promise(async (resolve) => {
        // what the server offers: named accounts, the owner's passcode, Google, open registration
        let cfg = { named: false, passcode: true, google: false, register: false, invite: false, googleInvite: false, googleSeen: false };
        // muddatsiz kutilsa kirish oynasi umuman chizilmasdi — server jim qolsa ham oyna ochiladi
        try { const r = await D.fetchTimed('/api/auth/config', { credentials: 'same-origin', cache: 'no-store' }, 8000); if (r.ok) cfg = Object.assign(cfg, await r.json()); } catch (e) {}
        const tgId = D.tg && D.tg.initData && D.tg.initDataUnsafe && D.tg.initDataUnsafe.user && D.tg.initDataUnsafe.user.id;
        const askName = !!(cfg.named || cfg.register);
        const canLogin = !!(cfg.named || cfg.passcode || cfg.register);
        let mode = 'login';
        // maydon endi email so'raydi: eski ism (2026-09-10 gacha) tortib kelinmasin
        let name = /^[^\s@]+@[^\s@]+$/.test(D.device.lastUser || '') ? D.device.lastUser : '';
        const box = document.createElement('div');
        box.className = 'auth-gate';
        document.body.appendChild(box);
        const t = D.t, esc = D.esc;
        const errKey = (code, status) => ({
          name_taken: 'auth.e.taken', email_taken: 'auth.e.taken', weak_pass: 'auth.e.weak', bad_name: 'auth.e.name',
          bad_email: 'auth.e.email', mismatch: 'auth.e.mismatch', full: 'auth.e.full',
          bad_invite: 'auth.e.invite', closed: 'auth.e.closed', too_many: 'auth.e.many', bad_pass: 'auth.bad',
        })[code] || (status === 401 ? 'auth.bad' : 'auth.err');
        // Google oqimi boshqa tabda yoki iOS ichki brauzerida tugagan, sahifa bfcache'dan qaytgan
        // bo'lishi mumkin — oyna ochiq turganda sessiyani o'zi tekshirib turadi (5 s, 10 daqiqagacha)
        let finished = false, checking = false;
        const check = async () => {
          if (finished || checking) return;
          checking = true;
          try { const r = await D.fetchTimed('/api/me', { credentials: 'same-origin', cache: 'no-store' }, 8000); if (r.ok) done(await r.json()); } catch (e) {}
          checking = false;
        };
        const onVis = () => { if (!document.hidden) check(); };
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('focus', check);
        window.addEventListener('pageshow', check);
        const t0 = Date.now();
        const timer = setInterval(() => { if (Date.now() - t0 > 10 * 60e3) clearInterval(timer); else if (!document.hidden) check(); }, 5000);
        const done = (j) => {
          if (finished) return;
          finished = true;
          clearInterval(timer);
          document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', check); window.removeEventListener('pageshow', check);
          // lastUser = kirish ismi (users.json), ko'rsatiladigan ism emas — aks holda profilda
          // ism o'zgartirilgach kirish oynasi serverga notanish ismni taklif qiladi
          if (j && j.uid) { D.device.uid = j.uid; D.device.name = j.name || ''; if (name) D.device.lastUser = name; D.saveDevice(); }
          box.remove(); authPending = null; resolve(true);
          D.meRefresh();
        };
        const draw = () => {
          const reg = mode === 'register', goog = mode === 'google';
          const sub = goog ? 'auth.gInviteSub' : reg ? 'auth.regSub' : askName ? 'auth.sub2' : 'auth.sub';
          const gBtn = cfg.google ? `<button type="button" class="btn auth-btn auth-google">${D.ic('globe', 16)} ${esc(t('auth.google'))}</button>` : '';
          // novalidate: eski (ism bilan ochilgan) hisob type=email maydonida brauzer tekshiruviga
          // urilib qolmasin — xatoni o'zimiz, o'z tilimizda aytamiz
          box.innerHTML = `<form class="auth-card" autocomplete="on" novalidate>
            <div class="auth-ic">${D.ic(reg ? 'plus' : goog ? 'globe' : 'user', 26)}</div>
            <div class="auth-title">${esc(t(goog ? 'auth.google' : reg ? 'auth.regTitle' : 'auth.title'))}</div>
            <p class="auth-sub">${esc(t(sub))}</p>
            ${tgId ? `<p class="auth-sub auth-tg">${esc(t('auth.tgId'))}: <b class="num">${esc(String(tgId))}</b></p>` : ''}
            ${goog ? `<input class="inp auth-inp auth-name auth-invite" type="text" name="invite" autocomplete="off" autocapitalize="off"
                   placeholder="${esc(t('auth.invite'))}" aria-label="${esc(t('auth.invite'))}">
            <div class="auth-err" hidden></div>
            <button class="btn auth-btn" type="submit">${D.ic('globe', 16)} ${esc(t('auth.gGo'))}</button>
            <p class="auth-switch"><button type="button" class="auth-link">${esc(t('auth.back'))}</button></p>` : ''}
            ${!goog && !reg && gBtn ? `${gBtn}<p class="auth-hint">${esc(t('auth.gSub'))}</p>${canLogin ? `<div class="auth-or">${esc(t('auth.or'))}</div>` : ''}` : ''}
            ${!goog && (reg || askName) ? `<input class="inp auth-inp auth-name" type="email" name="email" autocomplete="email" autocapitalize="off"
                   autocorrect="off" spellcheck="false" inputmode="email" maxlength="190" value="${esc(name)}"
                   placeholder="${esc(t('auth.email'))}" aria-label="${esc(t('auth.email'))}">` : ''}
            ${!goog && (reg || canLogin) ? `<input class="inp auth-inp auth-pass" type="password" name="password" autocomplete="${reg ? 'new-password' : 'current-password'}"
                   placeholder="${esc(t('auth.ph'))}" aria-label="${esc(t('auth.ph'))}">` : ''}
            ${reg ? `<input class="inp auth-inp auth-pass2" type="password" name="password2" autocomplete="new-password"
                   placeholder="${esc(t('auth.pass2'))}" aria-label="${esc(t('auth.pass2'))}">` : ''}
            ${reg && cfg.invite ? `<input class="inp auth-inp auth-name auth-invite" type="text" name="invite" autocomplete="off" autocapitalize="off"
                   placeholder="${esc(t('auth.invite'))}" aria-label="${esc(t('auth.invite'))}">` : ''}
            ${goog ? '' : '<div class="auth-err" hidden></div>'}
            ${!goog && (reg || canLogin) ? `<button class="btn ${gBtn ? 'ghost ' : ''}auth-btn" type="submit">${esc(t(reg ? 'auth.create' : 'auth.go'))}</button>` : ''}
            ${!goog && !reg && cfg.passcode && askName ? `<p class="auth-hint">${esc(t('auth.ownerHint'))}</p>` : ''}
            ${!goog && cfg.register ? `<p class="auth-switch">${esc(t(reg ? 'auth.haveAcc' : 'auth.noAcc'))} <button type="button" class="auth-link">${esc(t(reg ? 'auth.go' : 'auth.regTitle'))}</button></p>` : ''}
            ${reg && gBtn ? `<div class="auth-or">${esc(t('auth.or'))}</div><button type="button" class="btn ghost auth-btn auth-google">${D.ic('globe', 16)} ${esc(t('auth.google'))}</button>` : ''}
          </form>`;
          const form = box.querySelector('form');
          const q = (c) => box.querySelector(c);
          const nameEl = q('.auth-name:not(.auth-invite)'), pass = q('.auth-pass'), pass2 = q('.auth-pass2'), inv = q('.auth-invite');
          const err = q('.auth-err'), btn = q('.auth-btn[type=submit]');
          const fail = (key) => { err.textContent = t(key); err.hidden = false; if (btn) btn.disabled = false; };
          const g = q('.auth-google');
          // a new Google profile needs the invite code when the server asks for one; a browser that
          // already signed in with Google (googleSeen) goes straight through
          if (g) g.addEventListener('click', () => { if (cfg.googleInvite && !cfg.googleSeen) { mode = 'google'; draw(); } else location.href = '/api/auth/google'; });
          const sw = q('.auth-link');
          if (sw) sw.addEventListener('click', () => { if (nameEl) name = nameEl.value; mode = (reg || goog) ? 'login' : 'register'; draw(); });
          const first = goog ? inv : (nameEl && !nameEl.value) ? nameEl : pass;
          if (first) setTimeout(() => first.focus(), 60);
          form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            if (goog) {
              const code = inv ? inv.value.trim() : '';
              if (!code) return fail('auth.e.inviteNeed');
              location.href = '/api/auth/google?invite=' + encodeURIComponent(code);
              return;
            }
            if (!pass) return;
            name = nameEl ? nameEl.value.trim() : '';
            const v = pass.value;
            if (!v) return;
            if (reg) {
              if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(name)) return fail('auth.e.email');
              if (v.length < 8) return fail('auth.e.weak');
              if (pass2 && pass2.value !== v) return fail('auth.e.mismatch');
            }
            btn.disabled = true; err.hidden = true;
            try {
              // kirishda ikkalasi ham ketadi: email bo'lsa server email bo'yicha, bo'lmasa ism bo'yicha
              // qidiradi (2026-09-10 dan oldin ism bilan ochilgan hisoblar kiraversin)
              const body = reg ? { email: name, pass: v, pass2: pass2 ? pass2.value : v, invite: inv ? inv.value.trim() : '' }
                : { pass: v, email: name, user: name };
              const r = await D.fetchTimed(reg ? '/api/register' : '/api/login', {
                method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
              });
              const j = await r.json().catch(() => ({}));
              if (r.ok) return done(j);
              fail(errKey(j && j.error, r.status));
            } catch (e) { fail('auth.err'); }
            (reg && err.textContent === t('auth.e.taken') && nameEl ? nameEl : pass).select();
          });
        };
        draw();
      });
      return authPending;
    },
    /** Sign out and leave nothing of this person on the device for the next one. */
    /** Chiqish: avval yuborilmagan o'zgarishni serverga yetkazamiz, keyin qurilmadagi nusxani o'chiramiz. */
    async logout() {
      const uid = (D.me && D.me.uid) || D.device.uid || '';
      let safe = true;
      if (D.serverEnabled() && (D._pending || D.dirty())) { try { safe = await D.flush(9000); } catch (e) { safe = false; } }
      if (!safe && uid) {
        // server javob bermadi — yozuvlar shu qurilmada qoladi va qaytib kirilganda o'z-o'zidan qo'shiladi
        lsSet(RESCUE_KEY + uid, D.S);
        D.toast(D.t('auth.unsent'), { ms: 4000 });
        await new Promise((r) => setTimeout(r, 1400));
      }
      try { await D.fetchTimed('/api/logout', { method: 'POST', credentials: 'same-origin' }, 8000); } catch (e) {}
      try { localStorage.removeItem(LS_KEY); localStorage.removeItem(UI_KEY); } catch (e) {}
      D.device.uid = ''; D.device.name = ''; D.saveDevice();
      D.me = null;
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
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dash_' + D.today() + '.json';
    a.rel = 'noopener';
    // iOS Safari hujjatda turmagan havolaning click() ini e'tiborsiz qoldiradi
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 2000);
  };
  /** Holatdagi yozuvlar sonini qisqacha sanaydi — import oynasida ko'rsatish uchun. */
  D.countRecords = (st) => {
    if (!st) return 0;
    let n = 0;
    for (const k of ['habits', 'tasks', 'goals', 'gratitude', 'learn', 'reviews', 'books']) n += (st[k] || []).length;
    for (const k of ['logs', 'counts', 'notes', 'prayers', 'dhikr', 'fasting', 'health']) n += Object.keys(st[k] || {}).length;
    n += ((st.finance || {}).tx || []).length;
    for (const day of Object.values((st.food || {}).logs || {})) n += (day || []).length;
    return n;
  };

  D.importJson = async (text) => {
    let j;
    try { j = JSON.parse(text); } catch (e) { throw new Error(D.t('data.badJson')); }
    if (!j || typeof j !== 'object') throw new Error(D.t('data.badJson'));
    const next = D.isOldFormat(j) ? D.migrateOld(j) : D.normalize(j);
    const prev = D.S;
    // Import — almashtirish, qo'shish emas: qurilmadagi ham, serverdagi ham
    // nusxa ustidan yoziladi. Shuning uchun so'raymiz.
    if (D.hasContent(prev)) {
      const ok = await D.confirm({
        title: D.t('data.importTitle'),
        text: D.t('data.importWarn', { now: D.countRecords(prev), next: D.countRecords(next) }),
        ok: D.t('data.importOk'), danger: true,
      });
      if (!ok) return false;
    }
    D.S = next;
    D.S.meta.deviceId = prev.meta.deviceId;
    D.undo.push({ label: D.t('data.imported'), undo: () => { D.S = prev; D.theme.apply(); D.renderNav(); } });
    D.saveReplace();
    D.theme.apply();
    D.renderNav();
    D.rerender();
    D.toast(D.t('data.imported'), { undo: () => D.undo.pop() });
    return true;
  };

  /* ------------------------------------------------------------------ */
  /* boot                                                                */
  /* ------------------------------------------------------------------ */
  D.boot = async () => {
    D.load();
    document.documentElement.lang = D.lang() === 'ru' ? 'ru' : 'uz';
    D.theme.apply();
    if (D.tg) { try { D.tg.ready(); D.tg.expand(); if (D.tg.disableVerticalSwipes) D.tg.disableVerticalSwipes(); } catch (e) {} }
    const [hash, hashSub] = location.hash.replace('#', '').split('/');
    const boot0 = resolveView(hash, hashSub);
    // pull() dagi bilan bir xil ma'no: «bu qurilma hech qachon saqlamagan»
    const empty = !(+D.S.meta.updatedAt);
    D.loading = empty && D.serverEnabled();
    // Birinchi manzil tarixga YANGI yozuv qo'shmaydi: qo'shsa, ilova ochilishi
    // bilan bitta «o'lik» orqaga bosish paydo bo'lardi (u hech qayerga olib
    // bormaydi, chunki ikkala yozuv ham bir xil sahifa).
    D.go(boot0 ? boot0[0] : D.ui.view, boot0 ? boot0[1] : undefined, { fromHistory: true });
    D.setSync(D.serverEnabled() ? 'wait' : 'local');
    if (D._corrupt) D.toast(D.t('data.corrupt'), { ms: 6000 });
    D.pull({ force: true }).finally(() => { if (D.loading) { D.loading = false; D.rerender(); } });
    // soat / kun almashuvi — faqat sahifa ko'rinib turganda. Fondagi ilovada
    // soatni yurgizishdan foyda yo'q: iOS baribir chizmaydi, batareya esa ketadi.
    let lastDay = D.today();
    let tickT = 0;
    const onTick = () => {
      const k = D.today();
      if (k !== lastDay) { lastDay = k; D.emit('day:changed', k); D.rerender(); }
      D.emit('tick');
    };
    const tickStart = () => { if (!tickT) tickT = setInterval(onTick, 30 * 1000); };
    const tickStop = () => { if (tickT) { clearInterval(tickT); tickT = 0; } };
    tickStart();
    window.addEventListener('focus', () => { if (D.serverEnabled()) D.pull(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        tickStop();
        D.flushLocal();          // ilovadan chiqilmoqda — holat shartsiz diskka
      } else {
        tickStart();
        onTick();
        if (D.serverEnabled()) D.pull();
      }
    });
    // iOS'da beforeunload ishonchsiz; pagehide — yagona kafolatlangan nuqta.
    window.addEventListener('pagehide', () => D.flushLocal());
    // Orqaga / oldinga — tarixdan kelgan chaqiruv, shuning uchun yangi yozuv qo'shilmaydi
    window.addEventListener('hashchange', () => {
      const [h, sb] = location.hash.replace('#', '').split('/');
      const r = resolveView(h, sb);
      if (!r) return;
      const sub = r[1];
      if (r[0] !== current || (sub && D.ui.sub[r[0]] !== sub)) D.go(r[0], sub, { fromHistory: true });
    });
    D.emit('boot');
    // Birinchi ekran chizilib bo'ldi — endi bo'sh vaqtda qolgan bo'limlarni olib qo'yamiz.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    // Ikki kadr kutamiz: requestIdleCallback bo'sh oqimda BIRINCHI CHIZISHDAN OLDIN ham
    // ishga tushishi mumkin, va o'shanda kechiktirilgan fayllar aynan chizishni kechiktiradi.
    // O'lchandi: shu qator qo'shilmasa, kechiktirish yutuq o'rniga ~300 ms zarar berardi.
    requestAnimationFrame(() => requestAnimationFrame(() => idle(() => D.preloadViews(), { timeout: 4000 })));
    // Tezlik o'lchagichi — faqat so'ralganda. Oddiy ochilishda bu fayl so'ralmaydi.
    if (PERF) D.loadScript('js/perf.js' + VQ);
  };
})();
