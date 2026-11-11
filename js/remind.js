/* =====================================================================
   Eslatmalar (D.remind) — ilova YOPIQ bo'lsa ham telefonga keladigan push.

   Bu fayl ikki ish qiladi:
     1. Jadval: holatdan «nima, qachon» ro'yxatini tuzadi va /api/push/schedule ga
        beradi. Namoz vaqtlari (prayer.js), vaqtli vazifalar, odat soatlari, kun
        yakuni. Ro'yxat shu yerda tuziladi, chunki namoz hisobi, odat jadvali va
        tarjimalar shu yerda — serverda ikkinchi nusxasi bo'lsa ajralib ketadi.
        Holat o'zgarsa (vazifa bajarildi, odat belgilandi) ro'yxat qayta yuboriladi,
        ya'ni bajarilgan narsa eslatilmaydi.
     2. Qurilma: brauzerni push xizmatiga obuna qiladi (Sozlash › Eslatmalar).

   Sozlama S.settings.remind da (hisobniki, qurilmalar orasida sinxron):
     { on, prayer:{on,before,off:{asr:true}}, tasks:{on,before}, habits:{on}, evening:{on,time} }
   Odat soati — odatning o'zida: h.remind = 'HH:MM'.
   Obuna esa qurilmaniki: brauzerning PushManager'ida, bu yerda faqat o'qiladi.

   Server: push.py (shifrlash, VAPID, fon oqimi). Service worker: sw.js «push».
   iPhone: faqat Bosh ekranga qo'shilgan ilovada (iOS 16.4+) — Safari oynasida
   PushManager umuman yo'q, shuning uchun alohida ko'rsatma chiqadi.
   ===================================================================== */
(function () {
  'use strict';
  const t = (k, p) => D.t(k, p);
  const esc = (s) => D.esc(s);

  D.i18n.add({
    uz: {
      'rm.title': 'Eslatmalar', 'rm.sum.on': 'Yoqilgan', 'rm.sum.off': "O'chiq", 'rm.sum.next': 'keyingisi {time}',
      'rm.dev': 'Bu qurilma', 'rm.enable': 'Yoqish', 'rm.disable': "O'chirish", 'rm.test': 'Sinov xabari',
      'rm.dev.on': "Eslatmalar shu qurilmaga keladi — ilova yopiq bo'lsa ham.",
      'rm.dev.off': "Yoqing — namoz, vazifa va odat vaqtida telefonning o'zi eslatadi, ilova yopiq bo'lsa ham.",
      'rm.ios': "iPhone'da eslatma faqat Bosh ekranga qo'shilgan ilovada ishlaydi: Safari'da «Ulashish» → «Bosh ekranga qo'shish», so'ng ilovani o'sha belgidan ochib, shu yerda «Yoqish» ni bosing.",
      'rm.unsupported': "Bu brauzer push bildirishnomani qo'llamaydi. Chrome, Firefox yoki iPhone'da Bosh ekrandagi ilovadan oching.",
      'rm.denied': "Bildirishnomaga ruxsat berilmagan. Brauzer sozlamasida shu sayt uchun «Bildirishnomalar» ni yoqing va qaytadan urinib ko'ring.",
      'rm.devices': 'Ulangan qurilmalar: {n}',
      'rm.on': 'Eslatmalar yoqildi', 'rm.off': "Bu qurilmada eslatmalar o'chirildi", 'rm.err': 'Yoqilmadi: {e}',
      'rm.testTitle': 'Shaxsiy', 'rm.testBody': 'Eslatmalar ishlayapti ✓',
      'rm.testSent': 'Sinov xabari yuborildi — bir necha soniyada keladi', 'rm.testFail': 'Yuborilmadi: {e}',
      'rm.testGone': "Bu qurilmaning obunasi eskirgan — «Yoqish» ni qayta bosing",
      'rm.what': 'Nimani eslatsin',
      'rm.prayer': 'Namoz vaqtlari', 'rm.prayerHint': 'Har namozdan oldin',
      'rm.tasks': 'Vazifalar', 'rm.tasksHint': "Vaqti qo'yilgan vazifalar — masalan «ertaga 15:00 uchrashuv»",
      'rm.habits': 'Odatlar', 'rm.habitsHint': "Odatga soat qo'ying — o'sha kuni bajarilmagan bo'lsa eslatadi",
      'rm.habitsNone': "Faol odat yo'q", 'rm.clear': 'Soatsiz',
      'rm.eve': 'Kun yakuni', 'rm.eveHint': 'Har kuni kechqurun — kunni belgilab chiqish uchun',
      'rm.atTime': 'Vaqtida', 'rm.min': '{n} daq',
      'rm.n.prayerNow': '{name} vaqti kirdi', 'rm.n.prayerSoon': '{name} — {n} daqiqadan keyin', 'rm.n.prayerBody': '{name} vaqti: {time}',
      'rm.n.taskNow': 'Vazifa vaqti · {time}', 'rm.n.taskSoon': '{n} daqiqadan keyin · {time}',
      'rm.n.habit': "Odat vaqti · {time}. Bajarsangiz belgilab qo'ying",
      'rm.n.eveTitle': 'Kun yakuni', 'rm.n.eveBody': 'Bugungi odat va vazifalarni belgilab chiqing',
    },
    uzk: {
      'rm.title': 'Эслатмалар', 'rm.sum.on': 'Ёқилган', 'rm.sum.off': 'Ўчиқ', 'rm.sum.next': 'кейингиси {time}',
      'rm.dev': 'Бу қурилма', 'rm.enable': 'Ёқиш', 'rm.disable': 'Ўчириш', 'rm.test': 'Синов хабари',
      'rm.dev.on': 'Эслатмалар шу қурилмага келади — илова ёпиқ бўлса ҳам.',
      'rm.dev.off': 'Ёқинг — намоз, вазифа ва одат вақтида телефоннинг ўзи эслатади, илова ёпиқ бўлса ҳам.',
      'rm.ios': 'iPhone’да эслатма фақат Бош экранга қўшилган иловада ишлайди: Safari’да «Улашиш» → «Бош экранга қўшиш», сўнг иловани ўша белгидан очиб, шу ерда «Ёқиш» ни босинг.',
      'rm.unsupported': 'Бу браузер push билдиришномани қўлламайди. Chrome, Firefox ёки iPhone’да Бош экрандаги иловадан очинг.',
      'rm.denied': 'Билдиришномага рухсат берилмаган. Браузер созламасида шу сайт учун «Билдиришномалар» ни ёқинг ва қайтадан уриниб кўринг.',
      'rm.devices': 'Уланган қурилмалар: {n}',
      'rm.on': 'Эслатмалар ёқилди', 'rm.off': 'Бу қурилмада эслатмалар ўчирилди', 'rm.err': 'Ёқилмади: {e}',
      'rm.testTitle': 'Шахсий', 'rm.testBody': 'Эслатмалар ишлаяпти ✓',
      'rm.testSent': 'Синов хабари юборилди — бир неча сонияда келади', 'rm.testFail': 'Юборилмади: {e}',
      'rm.testGone': 'Бу қурилманинг обунаси эскирган — «Ёқиш» ни қайта босинг',
      'rm.what': 'Нимани эслатсин',
      'rm.prayer': 'Намоз вақтлари', 'rm.prayerHint': 'Ҳар намоздан олдин',
      'rm.tasks': 'Вазифалар', 'rm.tasksHint': 'Вақти қўйилган вазифалар — масалан «эртага 15:00 учрашув»',
      'rm.habits': 'Одатлар', 'rm.habitsHint': 'Одатга соат қўйинг — ўша куни бажарилмаган бўлса эслатади',
      'rm.habitsNone': 'Фаол одат йўқ', 'rm.clear': 'Соатсиз',
      'rm.eve': 'Кун якуни', 'rm.eveHint': 'Ҳар куни кечқурун — кунни белгилаб чиқиш учун',
      'rm.atTime': 'Вақтида', 'rm.min': '{n} дақ',
      'rm.n.prayerNow': '{name} вақти кирди', 'rm.n.prayerSoon': '{name} — {n} дақиқадан кейин', 'rm.n.prayerBody': '{name} вақти: {time}',
      'rm.n.taskNow': 'Вазифа вақти · {time}', 'rm.n.taskSoon': '{n} дақиқадан кейин · {time}',
      'rm.n.habit': 'Одат вақти · {time}. Бажарсангиз белгилаб қўйинг',
      'rm.n.eveTitle': 'Кун якуни', 'rm.n.eveBody': 'Бугунги одат ва вазифаларни белгилаб чиқинг',
    },
    ru: {
      'rm.title': 'Напоминания', 'rm.sum.on': 'Включены', 'rm.sum.off': 'Выключены', 'rm.sum.next': 'следующее {time}',
      'rm.dev': 'Это устройство', 'rm.enable': 'Включить', 'rm.disable': 'Выключить', 'rm.test': 'Тестовое',
      'rm.dev.on': 'Напоминания приходят на это устройство — даже когда приложение закрыто.',
      'rm.dev.off': 'Включите — телефон сам напомнит о намазе, задаче и привычке, даже когда приложение закрыто.',
      'rm.ios': 'На iPhone напоминания работают только в приложении на экране «Домой»: в Safari «Поделиться» → «На экран «Домой»», затем откройте приложение с этого значка и нажмите здесь «Включить».',
      'rm.unsupported': 'Этот браузер не поддерживает push-уведомления. Откройте в Chrome, Firefox или на iPhone — из приложения на экране «Домой».',
      'rm.denied': 'Уведомления запрещены. Разрешите «Уведомления» для этого сайта в настройках браузера и попробуйте снова.',
      'rm.devices': 'Подключено устройств: {n}',
      'rm.on': 'Напоминания включены', 'rm.off': 'Напоминания на этом устройстве выключены', 'rm.err': 'Не включилось: {e}',
      'rm.testTitle': 'Shaxsiy', 'rm.testBody': 'Напоминания работают ✓',
      'rm.testSent': 'Тестовое отправлено — придёт через несколько секунд', 'rm.testFail': 'Не отправлено: {e}',
      'rm.testGone': 'Подписка этого устройства устарела — нажмите «Включить» ещё раз',
      'rm.what': 'О чём напоминать',
      'rm.prayer': 'Время намаза', 'rm.prayerHint': 'Перед каждым намазом',
      'rm.tasks': 'Задачи', 'rm.tasksHint': 'Задачи со временем — например «завтра в 15:00 встреча»',
      'rm.habits': 'Привычки', 'rm.habitsHint': 'Поставьте привычке время — напомнит, если в этот день она не отмечена',
      'rm.habitsNone': 'Нет активных привычек', 'rm.clear': 'Без времени',
      'rm.eve': 'Итог дня', 'rm.eveHint': 'Каждый вечер — чтобы отметить день',
      'rm.atTime': 'Вовремя', 'rm.min': '{n} мин',
      'rm.n.prayerNow': 'Наступило время: {name}', 'rm.n.prayerSoon': '{name} — через {n} мин', 'rm.n.prayerBody': '{name}: {time}',
      'rm.n.taskNow': 'Время задачи · {time}', 'rm.n.taskSoon': 'Через {n} мин · {time}',
      'rm.n.habit': 'Время привычки · {time}. Сделали — отметьте',
      'rm.n.eveTitle': 'Итог дня', 'rm.n.eveBody': 'Отметьте сегодняшние привычки и задачи',
    },
  });

  /* ------------------------------------------------------------------ */
  /* sozlama                                                              */
  /* ------------------------------------------------------------------ */
  const PRAYERS = ['bomdod', 'peshin', 'asr', 'shom', 'xufton'];
  const BEFORE_P = [0, 5, 10, 15, 30], BEFORE_T = [0, 10, 30];
  const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
  // Necha kun oldinga: namoz — 30 kun (ilova bir oy ochilmasa ham kelaveradi), qolgani — 14 kun.
  const DAYS_PRAYER = 30, DAYS_DAILY = 14, DAYS_TASK = 44, MAX = 800;

  /** S.settings.remind — D.normalize (core.js) to'ldiradi; bu yerda faqat qiymatlarni chegaralaymiz. */
  const R = () => D.S.settings.remind;
  const hm = (s) => (typeof s === 'string' && HM.test(s) ? s : '');
  const minsOf = (s) => +s.slice(0, 2) * 60 + +s.slice(3, 5);
  const pick = (v, list, dflt) => (list.includes(+v) ? +v : dflt);

  /* ------------------------------------------------------------------ */
  /* vaqt: kun kaliti + daqiqa (settings.tz da) → UTC ms                   */
  /* ------------------------------------------------------------------ */
  /** «2026-11-12, 13:05 Toshkentda» qaysi lahza ekanini topadi. Mintaqa siljishi o'sha
      lahzaning o'zida o'lchanadi (ikki marta — yozgi vaqt chegarasida ham to'g'ri bo'lsin). */
  function epochOf(key, mins) {
    const [y, m, d] = key.split('-').map(Number);
    const naive = Date.UTC(y, m - 1, d) + mins * 60000;
    const off = (ms) => { const p = D.nowTz(new Date(ms)); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(ms / 1000) * 1000; };
    const first = naive - off(naive);
    return naive - off(first);
  }
  const todayKey = () => { const p = D.nowTz(); return D.keyOf(p.y, p.m, p.d); };

  /* ------------------------------------------------------------------ */
  /* jadval                                                               */
  /* ------------------------------------------------------------------ */
  /** Holatdan kelajakdagi eslatmalar ro'yxati: [{id, at (soniya), title, body, url, tag}].
      `now` — sinov uchun (ms). Bajarilgan vazifa va bugun belgilangan odat kirmaydi. */
  function build(now) {
    now = now || Date.now();
    const r = R(), out = [], k0 = todayKey();
    const add = (id, key, mins, title, body, url, tag) => {
      const ms = epochOf(key, mins);
      if (ms <= now + 5000 || ms > now + (DAYS_TASK + 1) * 86400000) return;
      out.push({ id, at: Math.floor(ms / 1000), title: String(title).slice(0, 120), body: String(body || '').slice(0, 240), url, tag });
    };
    const fmt = (mins) => D.fmtTime(Math.floor(((mins % 1440) + 1440) % 1440 / 60), ((mins % 60) + 60) % 60);

    // Namoz
    if (r.prayer.on && D.prayer) {
      const before = pick(r.prayer.before, BEFORE_P, 10), off = r.prayer.off || {};
      for (let i = 0; i < DAYS_PRAYER; i++) {
        const k = D.addDays(k0, i);
        let tm;
        try { tm = D.prayer.times(k); } catch (e) { break; }
        for (const id of PRAYERS) {
          if (off[id] || !Number.isFinite(tm[id])) continue;
          const name = t('prayer.' + id), time = fmt(tm[id]);
          add(`p:${id}:${k}`, k, tm[id] - before,
            '🕌 ' + (before ? t('rm.n.prayerSoon', { name, n: before }) : t('rm.n.prayerNow', { name })),
            t('rm.n.prayerBody', { name, time }), './#prayer', 'p-' + id);
        }
      }
    }
    // Vazifalar: sanasi va soati bor, bajarilmagan
    if (r.tasks.on) {
      const before = pick(r.tasks.before, BEFORE_T, 0), last = D.addDays(k0, DAYS_TASK);
      for (const x of D.S.tasks || []) {
        const tm = hm(x && x.time);
        if (!tm || x.done || !x.date || x.date < k0 || x.date > last) continue;
        add(`t:${x.id}:${x.date}`, x.date, minsOf(tm) - before, '✅ ' + String(x.text || '').slice(0, 110),
          before ? t('rm.n.taskSoon', { n: before, time: tm }) : t('rm.n.taskNow', { time: tm }), './#tasks', 't-' + x.id);
      }
    }
    // Odatlar: soati bor, o'sha kuni jadvalda, bugun hali bajarilmagan
    if (r.habits.on) {
      for (const h of D.activeHabits()) {
        const tm = hm(h.remind);
        if (!tm) continue;
        for (let i = 0; i < DAYS_DAILY; i++) {
          const k = D.addDays(k0, i);
          if (!D.habitDue(h, k)) continue;
          if (i === 0 && D.habitDone(h, k)) continue;
          add(`h:${h.id}:${k}`, k, minsOf(tm), (D.habitEmoji(h) + ' ' + h.name).trim(), t('rm.n.habit', { time: tm }), './#habits', 'h-' + h.id);
        }
      }
    }
    // Kun yakuni
    if (r.evening.on && hm(r.evening.time)) {
      for (let i = 0; i < DAYS_DAILY; i++) {
        const k = D.addDays(k0, i);
        add(`e:${k}`, k, minsOf(r.evening.time), '🌙 ' + t('rm.n.eveTitle'), t('rm.n.eveBody'), './#today', 'eve');
      }
    }
    out.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
    return out.slice(0, MAX);
  }

  /* ------------------------------------------------------------------ */
  /* serverga yuborish                                                    */
  /* ------------------------------------------------------------------ */
  // Xom fetch: D.api 401 da kirish oynasini ochadi, fondagi sinxron esa odamni bezovta qilmasligi kerak.
  const post = (path, body, ms) => D.fetchTimed(path, { method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ms || 15000);
  const online = () => D.serverEnabled() && !!D.me;

  let lastJson = '', lastAt = 0, inflight = null, again = false;
  /** Jadval o'zgargan bo'lsa (yoki 6 soat o'tgan bo'lsa) serverga beradi. */
  async function sync(force) {
    if (!online() || !R().on) return;
    if (inflight) { again = true; return inflight; }
    const items = build(), json = JSON.stringify(items);
    if (!force && json === lastJson && Date.now() - lastAt < 6 * 3600000) return;
    inflight = (async () => {
      try {
        const r = await post('/api/push/schedule', { items });
        if (r.ok) { lastJson = json; lastAt = Date.now(); }
      } catch (e) { /* tarmoq yo'q — keyingi o'zgarishda yoki ochilishda qayta */ }
    })();
    await inflight;
    inflight = null;
    if (again) { again = false; return sync(); }
  }
  const syncSoon = D.debounce(() => sync(), 3000);

  /* ------------------------------------------------------------------ */
  /* qurilma: obuna                                                       */
  /* ------------------------------------------------------------------ */
  const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
  const supported = () => typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof window.PushManager !== 'undefined' && typeof window.Notification !== 'undefined';
  const perm = () => (typeof Notification !== 'undefined' ? Notification.permission : 'default');

  // dev.state: local · ios · unsupported · denied · off · on — faqat xotirada, sahifa chizilishida o'qiladi
  const dev = { state: 'off', endpoint: null, busy: false, subs: null, next: null };

  function reg() {
    if (!supported() || window.DASH_NO_SW) return Promise.resolve(null);
    // ready SW ro'yxatdan o'tmagan bo'lsa hech qachon tugamaydi — 8 soniyadan keyin taslim
    return Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 8000))]);
  }
  function u8(b64) {
    const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }
  function sameKey(sub, key) {
    try {
      const k = sub.options && sub.options.applicationServerKey;
      if (!k) return true;            // eski brauzer kalitni bermaydi — almashtirmaymiz
      const a = new Uint8Array(k);
      return a.length === key.length && a.every((v, i) => v === key[i]);
    } catch (e) { return true; }
  }

  /** Qurilma holatini aniqlaydi (sahifa chizishdan oldin, fonda). */
  async function probe() {
    if (!online()) dev.state = 'local';
    else if (isIOS() && !standalone() && !supported()) dev.state = 'ios';
    else if (!supported()) dev.state = 'unsupported';
    else if (perm() === 'denied') dev.state = 'denied';
    else {
      const r = await reg();
      const sub = r && r.pushManager ? await r.pushManager.getSubscription().catch(() => null) : null;
      dev.endpoint = sub ? sub.endpoint : null;
      dev.state = sub && perm() === 'granted' ? 'on' : (r ? 'off' : 'unsupported');
    }
    return dev.state;
  }
  async function status() {
    if (!online()) return null;
    try {
      const r = await D.fetchTimed('/api/push', { credentials: 'same-origin', cache: 'no-store' }, 10000);
      if (!r.ok) return null;
      const j = await r.json();
      dev.subs = (j.subs || []).length; dev.next = j.next || null;
      return j;
    } catch (e) { return null; }
  }
  function redraw() { if (D.current() === 'settings') D.rerender(); }

  async function enable() {
    if (dev.busy) return;
    if (!supported()) { await probe(); redraw(); return; }
    dev.busy = true; redraw();
    try {
      // Ruxsat so'rovi bosishning o'zida bo'lishi shart (Safari) — undan oldin hech narsa kutilmaydi
      let p = perm();
      if (p !== 'granted') p = await Notification.requestPermission();
      if (p !== 'granted') { dev.state = 'denied'; D.toast(t('rm.denied'), { ms: 5000 }); return; }
      const r = await reg();
      if (!r || !r.pushManager) throw new Error('service worker');
      const st = await D.api('/api/push');
      const key = u8(st.key);
      let sub = await r.pushManager.getSubscription();
      if (sub && !sameKey(sub, key)) { try { await sub.unsubscribe(); } catch (e) {} sub = null; }
      if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      await D.api('/api/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription: sub.toJSON() }) });
      try { localStorage.setItem('dash.push.at', String(Date.now())); } catch (e) {}
      dev.state = 'on'; dev.endpoint = sub.endpoint;
      if (!R().on) { R().on = true; D.save(); }
      await sync(true);
      D.toast(t('rm.on'));
    } catch (e) {
      console.warn('push', e);
      D.toast(t('rm.err', { e: (e && e.message) || String(e) }), { ms: 5000 });
    } finally {
      dev.busy = false;
      await status();
      redraw();
    }
  }

  /** Shu qurilmani uzadi. Hisobda boshqa qurilma qolmasa jadval ham to'xtaydi. */
  async function disable(quiet) {
    const r = await reg();
    const sub = r && r.pushManager ? await r.pushManager.getSubscription().catch(() => null) : null;
    if (sub) {
      try { await post('/api/push/unsubscribe', { endpoint: sub.endpoint }, 8000); } catch (e) {}
      try { await sub.unsubscribe(); } catch (e) {}
    }
    dev.endpoint = null;
    if (quiet) return;
    dev.state = 'off';
    const st = await status();
    if (st && !(st.subs || []).length && R().on) { R().on = false; D.save(); }
    D.toast(t('rm.off'));
    redraw();
  }

  async function test() {
    if (dev.busy) return;
    dev.busy = true; redraw();
    try {
      const r = await post('/api/push/test', { endpoint: dev.endpoint, title: t('rm.testTitle'), body: t('rm.testBody') });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.sent) D.toast(t('rm.testSent'));
      else if (j.gone || r.status === 404) { dev.state = 'off'; D.toast(t('rm.testGone'), { ms: 5000 }); }
      else D.toast(t('rm.testFail', { e: j.error || (j.codes || []).join(', ') || r.status }), { ms: 5000 });
    } catch (e) {
      D.toast(t('rm.testFail', { e: (e && e.message) || String(e) }), { ms: 5000 });
    } finally { dev.busy = false; redraw(); }
  }

  /** Server obunani yo'qotgan bo'lishi mumkin (uzoq xato, boshqa hisobga o'tish) — kuniga bir marta qayta beramiz. */
  async function heal() {
    if (!online() || !R().on || perm() !== 'granted' || !supported()) return;
    let last = 0;
    try { last = +localStorage.getItem('dash.push.at') || 0; } catch (e) {}
    if (Date.now() - last < 86400000) return;
    const r = await reg();
    const sub = r && r.pushManager ? await r.pushManager.getSubscription().catch(() => null) : null;
    if (!sub) return;
    try {
      const res = await post('/api/push/subscribe', { subscription: sub.toJSON() }, 10000);
      if (res.ok) localStorage.setItem('dash.push.at', String(Date.now()));
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /* Sozlash › Eslatmalar                                                 */
  /* ------------------------------------------------------------------ */
  const toggle = (on, act, label, extra = '') => `<button type="button" class="toggle ${on ? 'on' : ''}" data-act="${act}" ${extra} role="switch" aria-checked="${!!on}" aria-label="${esc(label)}"></button>`;
  const row = (label, ctl, hint) => `<div class="set-row"><div class="set-row-body"><div class="set-lbl">${label}</div>${hint ? `<div class="set-hint">${hint}</div>` : ''}</div><div class="set-ctl">${ctl}</div></div>`;
  const seg = (opts, cur, act, cls = '') => `<div class="seg ${cls}">${opts.map((o) => `<button type="button" class="${String(o.v) === String(cur) ? 'on' : ''}" data-act="${act}" data-val="${esc(o.v)}">${esc(o.l)}</button>`).join('')}</div>`;
  const beforeOpts = (list) => list.map((n) => ({ v: n, l: n ? t('rm.min', { n }) : t('rm.atTime') }));

  function nextText() {
    if (!dev.next || !dev.next.at) return '';
    const p = D.nowTz(new Date(dev.next.at * 1000));
    const k = D.keyOf(p.y, p.m, p.d);
    const time = D.fmtTime(p.h, p.min);
    return t('rm.sum.next', { time: k === todayKey() ? time : `${D.fmtDate(k, 'short')} ${time}` });
  }
  function summary() {
    if (dev.state === 'on') return esc([t('rm.sum.on'), nextText()].filter(Boolean).join(' · '));
    if (dev.state === 'denied') return esc(t('rm.denied').split('.')[0]);
    return esc(t('rm.sum.off'));
  }
  const warn = () => dev.state === 'denied';

  function deviceCard() {
    const s = dev.state, busy = dev.busy ? 'disabled' : '';
    let ctl = '', hint = '';
    if (s === 'on') {
      ctl = `<button type="button" class="btn ghost sm" data-act="rmOff" ${busy}>${esc(t('rm.disable'))}</button>`;
      hint = esc(t('rm.dev.on')) + (dev.subs > 1 ? ' ' + esc(t('rm.devices', { n: dev.subs })) : '');
    } else if (s === 'ios') hint = esc(t('rm.ios'));
    else if (s === 'unsupported') hint = esc(t('rm.unsupported'));
    else {
      ctl = `<button type="button" class="btn sm" data-act="rmOn" ${busy}>${D.ic('bell', 15)} ${esc(t('rm.enable'))}</button>`;
      hint = esc(s === 'denied' ? t('rm.denied') : t('rm.dev.off'));
    }
    return `<div class="rm-dev">
      ${row(`${D.ic('bell', 14)} ${esc(t('rm.dev'))}`, ctl, hint)}
      ${s === 'on' ? `<button type="button" class="btn ghost sm block mt-s" data-act="rmTest" ${busy}>${esc(t('rm.test'))}</button>` : ''}
    </div>`;
  }

  function whatCard() {
    const r = R(), off = r.prayer.off || {};
    const habits = D.activeHabits();
    const habitRows = !habits.length ? `<div class="help">${esc(t('rm.habitsNone'))}</div>` : habits.map((h) => `
      <div class="rm-hab">
        <span class="rm-hab-n">${esc(D.habitEmoji(h))} ${esc(h.name)}</span>
        <input type="time" class="inp rm-time" value="${esc(hm(h.remind))}" data-change="rmHabitTime" data-id="${esc(h.id)}" aria-label="${esc(h.name)}">
        ${hm(h.remind) ? `<button type="button" class="btn icon rm-x" data-act="rmHabitClear" data-id="${esc(h.id)}" aria-label="${esc(t('rm.clear'))}" title="${esc(t('rm.clear'))}">${D.ic('x', 16)}</button>` : '<span class="rm-x" aria-hidden="true"></span>'}
      </div>`).join('');
    return `<div class="rm-what">
      <div class="eyebrow set-sub-eyebrow">${esc(t('rm.what'))}</div>
      ${row(`🕌 ${esc(t('rm.prayer'))}`, toggle(r.prayer.on, 'rmFlag', t('rm.prayer'), 'data-k="prayer"'), esc(t('rm.prayerHint')))}
      ${r.prayer.on ? `<div class="rm-sub">
        ${seg(beforeOpts(BEFORE_P), pick(r.prayer.before, BEFORE_P, 10), 'rmBefore', 'rm-seg')}
        <div class="rm-chips">${PRAYERS.map((id) => `<button type="button" class="rm-chip ${off[id] ? '' : 'on'}" data-act="rmPrayer" data-id="${id}" aria-pressed="${!off[id]}">${esc(t('prayer.' + id))}</button>`).join('')}</div>
      </div>` : ''}
      ${row(`✅ ${esc(t('rm.tasks'))}`, toggle(r.tasks.on, 'rmFlag', t('rm.tasks'), 'data-k="tasks"'), esc(t('rm.tasksHint')))}
      ${r.tasks.on ? `<div class="rm-sub">${seg(beforeOpts(BEFORE_T), pick(r.tasks.before, BEFORE_T, 0), 'rmTaskBefore', 'rm-seg')}</div>` : ''}
      ${row(`🔥 ${esc(t('rm.habits'))}`, toggle(r.habits.on, 'rmFlag', t('rm.habits'), 'data-k="habits"'), esc(t('rm.habitsHint')))}
      ${r.habits.on ? `<div class="rm-sub">${habitRows}</div>` : ''}
      ${row(`🌙 ${esc(t('rm.eve'))}`, toggle(r.evening.on, 'rmFlag', t('rm.eve'), 'data-k="evening"'), esc(t('rm.eveHint')))}
      ${r.evening.on ? `<div class="rm-sub"><input type="time" class="inp rm-time" value="${esc(hm(r.evening.time) || '21:30')}" data-change="rmEveTime" aria-label="${esc(t('rm.eve'))}"></div>` : ''}
    </div>`;
  }

  let probed = false;
  function body() {
    if (!probed) { probed = true; Promise.all([probe(), status()]).then(redraw); }
    return deviceCard() + whatCard();
  }

  const changed = () => { D.save(); D.rerender(); sync(); };
  D.act.rmOn = () => enable();
  D.act.rmOff = () => disable(false);
  D.act.rmTest = () => test();
  D.act.rmFlag = (el) => { const k = el.dataset.k; if (!R()[k]) return; R()[k].on = !R()[k].on; changed(); };
  D.act.rmBefore = (el) => { R().prayer.before = pick(el.dataset.val, BEFORE_P, 10); changed(); };
  D.act.rmTaskBefore = (el) => { R().tasks.before = pick(el.dataset.val, BEFORE_T, 0); changed(); };
  D.act.rmPrayer = (el) => {
    const id = el.dataset.id;
    if (!PRAYERS.includes(id)) return;
    const off = R().prayer.off || (R().prayer.off = {});
    if (off[id]) delete off[id]; else off[id] = true;
    changed();
  };
  D.act.rmHabitTime = (el) => {
    const h = D.S.habits.find((x) => x.id === el.dataset.id);
    if (!h) return;
    const v = hm(el.value);
    if (v) h.remind = v; else delete h.remind;
    changed();
  };
  D.act.rmHabitClear = (el) => { const h = D.S.habits.find((x) => x.id === el.dataset.id); if (h) { delete h.remind; changed(); } };
  D.act.rmEveTime = (el) => { const v = hm(el.value); if (v) { R().evening.time = v; changed(); } };
  // D.act.rmOpen — settings.js da (bu fayl kechiktirib yuklanadi)

  /* ------------------------------------------------------------------ */
  /* ulanish                                                              */
  /* ------------------------------------------------------------------ */
  D.remind = { build, sync, epochOf, summary, warn, body, title: () => t('rm.title'), probe, status,
    /** Hisobdan chiqishdan oldin: shu qurilmaga boshqa odamning eslatmasi kelmasin. */
    detach: () => disable(true) };

  D.on('state:changed', syncSoon);
  D.on('pull:ok', () => { sync(); heal(); });
  D.on('day:changed', () => sync(true));
  D.on('me:changed', () => { lastJson = ''; dev.subs = null; dev.next = null; probed = false; });
  // Fayl kechiktirib yuklanadi — boot va birinchi pull allaqachon o'tgan bo'lishi mumkin
  if (D.pulled) { sync(); heal(); }
  probe().then(() => { if (D.current() === 'settings') D.rerender(); });
})();
