/* =====================================================================
   Ibodat — prayer times · prayer log + qaza ledger · tasbih · fasting · qibla
   view id 'prayer'. Reads D.prayer / D.hijri (prayer.js); mirrors prayer
   states into the ПЕШИН/АСР/ШОМ/БОМДОД/ХУФТОН habits (same rule as today.js).
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'ib.sub.times': 'Vaqtlar', 'ib.sub.log': 'Qayd', 'ib.sub.tasbih': 'Tasbeh', 'ib.sub.fasting': "Ro'za", 'ib.sub.qibla': 'Qibla',
      'ib.next': 'Keyingi namoz', 'ib.left': 'qoldi', 'ib.current': 'Joriy vaqt', 'ib.night': 'Tun', 'ib.duha': 'Quyosh — namoz vaqti emas',
      'ib.timesFor': 'Namoz vaqtlari', 'ib.backToday': 'Bugunga', 'ib.hijri': 'Hijriy',
      'ib.ramadan': 'Ramazon muborak!', 'ib.ramadanDay': 'Ramazon, {d}-kun',
      'ib.method': 'Hisoblash usuli', 'ib.methodNote': 'Bomdod {f}° · Xufton {i}° · Asr: {asr}', 'ib.asr.hanafi': 'Hanafiy', 'ib.asr.shafi': "Shofe'iy", 'ib.openSettings': 'Sozlash',
      'ib.logTitle': 'Namoz qaydi', 'ib.loggedN': '{n}/5 qayd', 'ib.allJamaat': 'Hammasi jamoat',
      'ib.st.jamaat': 'Jamoat', 'ib.st.alone': 'Yakka', 'ib.st.qaza': 'Qazo', 'ib.st.missed': "O'tkazib",
      'ib.qazaHint': 'qazo?',
      'ib.qazaLedger': 'Qazo daftari', 'ib.debt': 'qarz', 'ib.missed': "O'tkazilgan", 'ib.late': 'Kech (qazo)', 'ib.paid': "O'qilgan qazo",
      'ib.payQaza': "+1 qazo o'qidim", 'ib.noDebt': "Qazo qarzi yo'q — alhamdulillah", 'ib.paidToast': 'Qazo qayd etildi', 'ib.unpaidToast': 'Qazo qaydi olib tashlandi',
      'ib.last30': "So'nggi 30 kun", 'ib.heatJamaat': 'Jamoat ulushi (kunlik)', 'ib.streak5': '5 vaqt seriyasi', 'ib.jamaat': 'Jamoat', 'ib.ontime': "O'z vaqtida",
      'ib.tasbih': 'Tasbeh', 'ib.rounds': '{n} davra', 'ib.unpay': '−1 qazo', 'ib.prevDay': 'Oldingi kun', 'ib.nextDay': 'Keyingi kun', 'ib.tapHint': 'Sanash uchun bosing', 'ib.custom': 'Boshqa…', 'ib.customPh': 'Zikr nomi',
      'ib.saved': 'Saqlandi: {n}', 'ib.completed': '{name} — {n} tugallandi', 'ib.reset': 'Nol', 'ib.nothingToSave': 'Avval sanang',
      'ib.todayTotal': 'Bugun', 'ib.week7': '7 kun', 'ib.dhikrStreak': 'Seriya', 'ib.sessions': 'Bugungi seanslar', 'ib.noSessions': "Bugun hali saqlangan zikr yo'q", 'ib.sessionDeleted': "Seans o'chirildi",
      'ib.d.subhanallah': 'Subhanalloh', 'ib.d.alhamdulillah': 'Alhamdulillah', 'ib.d.allahuakbar': 'Allohu akbar', 'ib.d.istighfar': "Istig'for", 'ib.d.salavot': 'Salavot',
      'ib.fastToday': "Bugun ro'za", 'ib.fasted': "Ro'za tutdim", 'ib.suggest': 'Tavsiya', 'ib.noSuggest': "Bugun sunnat ro'za kuni emas", 'ib.fastType': "Ro'za turi",
      'ib.f.ramadan': 'Ramazon', 'ib.f.ayyam_bid': 'Ayyomi biyz', 'ib.f.arafa': 'Arafa', 'ib.f.ashura': 'Ashuro', 'ib.f.shawwal': 'Shavvol 6', 'ib.f.mon_thu': 'Dushanba-Payshanba',
      'ib.ft.ramadan': 'Ramazon', 'ib.ft.sunnah': 'Sunnat', 'ib.ft.qaza': 'Qazo', 'ib.ft.nafl': 'Nafl',
      'ib.hijriMonth': 'Hijriy oy', 'ib.fastedN': '{n} kun', 'ib.sugDot': 'tavsiya kuni',
      'ib.qazaFast': "Qazo ro'zalar", 'ib.owed': 'qarz (kun)', 'ib.qazaDone': 'Tutilgan', 'ib.remaining': 'Qolgan',
      'ib.ramadanMode': 'Ramazon', 'ib.ramadanProgress': "Tutilgan ro'za", 'ib.khatm': "Xatm sur'ati", 'ib.khatmHint': 'Kuniga ~{p} sahifa · bugungacha {page}-sahifa (juz {juz})',
      'ib.toRamadan': 'Ramazongacha {n} kun', 'ib.lastTen': 'Oxirgi 10 kecha — Laylatul qadrni izlang',
      'ib.qibla': 'Qibla', 'ib.bearing': "Ka'ba yo'nalishi", 'ib.fromNorth': 'shimoldan, soat mili bo\'ylab',
      'ib.live': 'Jonli kompas', 'ib.liveOff': "Kompasni o'chirish", 'ib.noCompass': "Bu qurilmada kompas yo'q", 'ib.compassDenied': 'Kompasga ruxsat berilmadi',
      'ib.turnLeft': 'Chapga {n}° buriling', 'ib.turnRight': "O'ngga {n}° buriling", 'ib.aligned': "Qibla to'g'ri!", 'ib.waiting': 'Kompas signali kutilmoqda…',
      'ib.coords': 'Koordinatalar', 'ib.qiblaHint': "Telefonni tekis tuting va metall buyumlardan uzoqlashtiring. Ko'rsatkich taxminiy.",
      'ib.staticHint': "Telefon shimolga qaratilganda igna qiblani ko'rsatadi",
    },
    uzk: {
      'ib.sub.times': 'Вақтлар', 'ib.sub.log': 'Қайд', 'ib.sub.tasbih': 'Тасбеҳ', 'ib.sub.fasting': 'Рўза', 'ib.sub.qibla': 'Қибла',
      'ib.next': 'Кейинги намоз', 'ib.left': 'қолди', 'ib.current': 'Жорий вақт', 'ib.night': 'Тун', 'ib.duha': 'Қуёш — намоз вақти эмас',
      'ib.timesFor': 'Намоз вақтлари', 'ib.backToday': 'Бугунга', 'ib.hijri': 'Ҳижрий',
      'ib.ramadan': 'Рамазон муборак!', 'ib.ramadanDay': 'Рамазон, {d}-кун',
      'ib.method': 'Ҳисоблаш усули', 'ib.methodNote': 'Бомдод {f}° · Хуфтон {i}° · Аср: {asr}', 'ib.asr.hanafi': 'Ҳанафий', 'ib.asr.shafi': 'Шофеъий', 'ib.openSettings': 'Созлаш',
      'ib.logTitle': 'Намоз қайди', 'ib.loggedN': '{n}/5 қайд', 'ib.allJamaat': 'Ҳаммаси жамоат',
      'ib.st.jamaat': 'Жамоат', 'ib.st.alone': 'Якка', 'ib.st.qaza': 'Қазо', 'ib.st.missed': 'Ўтказиб',
      'ib.qazaHint': 'қазо?',
      'ib.qazaLedger': 'Қазо дафтари', 'ib.debt': 'қарз', 'ib.missed': 'Ўтказилган', 'ib.late': 'Кеч (қазо)', 'ib.paid': 'Ўқилган қазо',
      'ib.payQaza': '+1 қазо ўқидим', 'ib.noDebt': 'Қазо қарзи йўқ — алҳамдулиллаҳ', 'ib.paidToast': 'Қазо қайд этилди', 'ib.unpaidToast': 'Қазо қайди олиб ташланди',
      'ib.last30': 'Сўнгги 30 кун', 'ib.heatJamaat': 'Жамоат улуши (кунлик)', 'ib.streak5': '5 вақт серияси', 'ib.jamaat': 'Жамоат', 'ib.ontime': 'Ўз вақтида',
      'ib.tasbih': 'Тасбеҳ', 'ib.rounds': '{n} давра', 'ib.unpay': '−1 қазо', 'ib.prevDay': 'Олдинги кун', 'ib.nextDay': 'Кейинги кун', 'ib.tapHint': 'Санаш учун босинг', 'ib.custom': 'Бошқа…', 'ib.customPh': 'Зикр номи',
      'ib.saved': 'Сақланди: {n}', 'ib.completed': '{name} — {n} тугалланди', 'ib.reset': 'Нол', 'ib.nothingToSave': 'Аввал сананг',
      'ib.todayTotal': 'Бугун', 'ib.week7': '7 кун', 'ib.dhikrStreak': 'Серия', 'ib.sessions': 'Бугунги сеанслар', 'ib.noSessions': 'Бугун ҳали сақланган зикр йўқ', 'ib.sessionDeleted': 'Сеанс ўчирилди',
      'ib.d.subhanallah': 'Субҳаналлоҳ', 'ib.d.alhamdulillah': 'Алҳамдулиллаҳ', 'ib.d.allahuakbar': 'Аллоҳу акбар', 'ib.d.istighfar': 'Истиғфор', 'ib.d.salavot': 'Салавот',
      'ib.fastToday': 'Бугун рўза', 'ib.fasted': 'Рўза тутдим', 'ib.suggest': 'Тавсия', 'ib.noSuggest': 'Бугун суннат рўза куни эмас', 'ib.fastType': 'Рўза тури',
      'ib.f.ramadan': 'Рамазон', 'ib.f.ayyam_bid': 'Айёми бийз', 'ib.f.arafa': 'Арафа', 'ib.f.ashura': 'Ашуро', 'ib.f.shawwal': 'Шаввол 6', 'ib.f.mon_thu': 'Душанба-Пайшанба',
      'ib.ft.ramadan': 'Рамазон', 'ib.ft.sunnah': 'Суннат', 'ib.ft.qaza': 'Қазо', 'ib.ft.nafl': 'Нафл',
      'ib.hijriMonth': 'Ҳижрий ой', 'ib.fastedN': '{n} кун', 'ib.sugDot': 'тавсия куни',
      'ib.qazaFast': 'Қазо рўзалар', 'ib.owed': 'қарз (кун)', 'ib.qazaDone': 'Тутилган', 'ib.remaining': 'Қолган',
      'ib.ramadanMode': 'Рамазон', 'ib.ramadanProgress': 'Тутилган рўза', 'ib.khatm': 'Хатм суръати', 'ib.khatmHint': 'Кунига ~{p} саҳифа · бугунгача {page}-саҳифа (жуз {juz})',
      'ib.toRamadan': 'Рамазонгача {n} кун', 'ib.lastTen': 'Охирги 10 кеча — Лайлатул қадрни изланг',
      'ib.qibla': 'Қибла', 'ib.bearing': 'Каъба йўналиши', 'ib.fromNorth': 'шимолдан, соат мили бўйлаб',
      'ib.live': 'Жонли компас', 'ib.liveOff': 'Компасни ўчириш', 'ib.noCompass': 'Бу қурилмада компас йўқ', 'ib.compassDenied': 'Компасга рухсат берилмади',
      'ib.turnLeft': 'Чапга {n}° бурилинг', 'ib.turnRight': 'Ўнгга {n}° бурилинг', 'ib.aligned': 'Қибла тўғри!', 'ib.waiting': 'Компас сигнали кутилмоқда…',
      'ib.coords': 'Координаталар', 'ib.qiblaHint': 'Телефонни текис тутинг ва металл буюмлардан узоқлаштиринг. Кўрсаткич тахминий.',
      'ib.staticHint': 'Телефон шимолга қаратилганда игна қиблани кўрсатади',
    },
    ru: {
      'ib.sub.times': 'Время', 'ib.sub.log': 'Журнал', 'ib.sub.tasbih': 'Тасбих', 'ib.sub.fasting': 'Пост', 'ib.sub.qibla': 'Кибла',
      'ib.next': 'Следующий намаз', 'ib.left': 'осталось', 'ib.current': 'Сейчас', 'ib.night': 'Ночь', 'ib.duha': 'Восход — не время намаза',
      'ib.timesFor': 'Время намазов', 'ib.backToday': 'Сегодня', 'ib.hijri': 'По хиджре',
      'ib.ramadan': 'Рамадан мубарак!', 'ib.ramadanDay': 'Рамадан, день {d}',
      'ib.method': 'Метод расчёта', 'ib.methodNote': 'Фаджр {f}° · Иша {i}° · Аср: {asr}', 'ib.asr.hanafi': 'Ханафи', 'ib.asr.shafi': 'Шафии', 'ib.openSettings': 'Настройки',
      'ib.logTitle': 'Журнал намазов', 'ib.loggedN': '{n}/5 отмечено', 'ib.allJamaat': 'Все в джамаате',
      'ib.st.jamaat': 'Джамаат', 'ib.st.alone': 'Один', 'ib.st.qaza': 'Каза', 'ib.st.missed': 'Пропущен',
      'ib.qazaHint': 'каза?',
      'ib.qazaLedger': 'Учёт каза', 'ib.debt': 'долг', 'ib.missed': 'Пропущено', 'ib.late': 'С опозданием', 'ib.paid': 'Восполнено',
      'ib.payQaza': '+1 каза восполнено', 'ib.noDebt': 'Долга нет — альхамдулиллях', 'ib.paidToast': 'Каза записана', 'ib.unpaidToast': 'Запись каза убрана',
      'ib.last30': 'Последние 30 дней', 'ib.heatJamaat': 'Доля джамаата (по дням)', 'ib.streak5': 'Серия 5/5', 'ib.jamaat': 'Джамаат', 'ib.ontime': 'Вовремя',
      'ib.tasbih': 'Тасбих', 'ib.rounds': 'круг ×{n}', 'ib.unpay': '−1 каза', 'ib.prevDay': 'Предыдущий день', 'ib.nextDay': 'Следующий день', 'ib.tapHint': 'Нажмите, чтобы считать', 'ib.custom': 'Другой…', 'ib.customPh': 'Название зикра',
      'ib.saved': 'Сохранено: {n}', 'ib.completed': '{name} — {n} выполнено', 'ib.reset': 'Сброс', 'ib.nothingToSave': 'Сначала посчитайте',
      'ib.todayTotal': 'Сегодня', 'ib.week7': '7 дней', 'ib.dhikrStreak': 'Серия', 'ib.sessions': 'Сегодняшние сеансы', 'ib.noSessions': 'Сегодня зикр ещё не сохранён', 'ib.sessionDeleted': 'Сеанс удалён',
      'ib.d.subhanallah': 'Субханаллах', 'ib.d.alhamdulillah': 'Альхамдулиллях', 'ib.d.allahuakbar': 'Аллаху акбар', 'ib.d.istighfar': 'Истигфар', 'ib.d.salavot': 'Салават',
      'ib.fastToday': 'Пост сегодня', 'ib.fasted': 'Пост соблюдён', 'ib.suggest': 'Рекомендация', 'ib.noSuggest': 'Сегодня не день сунна-поста', 'ib.fastType': 'Тип поста',
      'ib.f.ramadan': 'Рамадан', 'ib.f.ayyam_bid': 'Айям аль-бид', 'ib.f.arafa': 'Арафа', 'ib.f.ashura': 'Ашура', 'ib.f.shawwal': '6 дней Шавваля', 'ib.f.mon_thu': 'Понедельник и четверг',
      'ib.ft.ramadan': 'Рамадан', 'ib.ft.sunnah': 'Сунна', 'ib.ft.qaza': 'Каза', 'ib.ft.nafl': 'Нафль',
      'ib.hijriMonth': 'Месяц хиджры', 'ib.fastedN': '{n} дн.', 'ib.sugDot': 'рекомендуемый день',
      'ib.qazaFast': 'Каза-посты', 'ib.owed': 'долг (дней)', 'ib.qazaDone': 'Восполнено', 'ib.remaining': 'Осталось',
      'ib.ramadanMode': 'Рамадан', 'ib.ramadanProgress': 'Дней поста', 'ib.khatm': 'Темп хатма', 'ib.khatmHint': '~{p} стр. в день · сегодня стр. {page} (джуз {juz})',
      'ib.toRamadan': 'До Рамадана {n} дн.', 'ib.lastTen': 'Последние 10 ночей — ищите Ляйлятуль-кадр',
      'ib.qibla': 'Кибла', 'ib.bearing': 'Направление на Каабу', 'ib.fromNorth': 'от севера по часовой стрелке',
      'ib.live': 'Живой компас', 'ib.liveOff': 'Выключить компас', 'ib.noCompass': 'На этом устройстве нет компаса', 'ib.compassDenied': 'Нет доступа к компасу',
      'ib.turnLeft': 'Поверните влево на {n}°', 'ib.turnRight': 'Поверните вправо на {n}°', 'ib.aligned': 'Кибла найдена!', 'ib.waiting': 'Ожидание сигнала компаса…',
      'ib.coords': 'Координаты', 'ib.qiblaHint': 'Держите телефон горизонтально, подальше от металла. Показание приблизительное.',
      'ib.staticHint': 'Если телефон направлен на север, стрелка указывает на киблу',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const PR = D.PRAYERS;
  const STATES = ['jamaat', 'alone', 'qaza', 'missed'];
  const SUBS = ['times', 'log', 'tasbih', 'fasting', 'qibla'];
  const DHIKR = ['subhanallah', 'alhamdulillah', 'allahuakbar', 'istighfar', 'salavot'];
  const PRESETS = [33, 100, 1000, 0]; // 0 = ∞
  const FTYPES = ['ramadan', 'sunnah', 'qaza', 'nafl'];
  const NEXT_OF = { bomdod: 'quyosh', peshin: 'asr', asr: 'shom', shom: 'xufton' };
  const PRAYER_RX = {
    bomdod: /\b(bomdod|fajr|fadjr)\b/, peshin: /\b(peshin|zuhr|zuxr)\b/, asr: /\basr\b/,
    shom: /\b(shom|maghrib|magrib)\b/, xufton: /\b(xufton|isha)\b/,
  };
  const PAGES = 604, JUZ = 30;

  const isDay = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);
  const F = () => { if (!D.ui.filters || typeof D.ui.filters !== 'object') D.ui.filters = {}; return D.ui.filters; };
  const sub = () => { const s = D.sub('prayer', 'times'); return SUBS.includes(s) ? s : 'times'; };
  const haptic = (kind) => {
    try {
      const h = D.tg && D.tg.HapticFeedback; if (!h) return;
      if (kind === 'success') h.notificationOccurred('success'); else h.impactOccurred(kind || 'light');
    } catch (e) {}
  };
  const safe = (fn) => {
    try { return fn(); } catch (e) { console.error('ibodat', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; }
  };
  const nowMins = () => { const p = D.nowTz(); return p.h * 60 + p.min; };
  const timesOf = (k) => { try { return D.prayer.times(k); } catch (e) { return null; } };

  // memo on a signature (state updatedAt + today) — keeps 500+ day scans out of every render
  const memos = {};
  function memo(name, sig, fn) { const m = memos[name]; if (m && m.sig === sig) return m.v; const v = fn(); memos[name] = { sig, v }; return v; }
  const stateSig = () => (D.S.meta.updatedAt || 0) + '|' + D.today();

  /* prayer ↔ habit mirror (same rule as today.js) */
  let phCache = { sig: null, map: {} };
  function prayerHabits() {
    const sig = D.S.habits.map((h) => h.id + ':' + h.name + ':' + (h.active ? 1 : 0)).join('|');
    if (sig !== phCache.sig) {
      const map = {};
      for (const h of D.S.habits) {
        if (!h.active) continue;
        const n = D.translit.norm(h.name);
        for (const p of PR) if (!map[p] && PRAYER_RX[p].test(n)) { map[p] = h.id; break; }
      }
      phCache = { sig, map };
    }
    return phCache.map;
  }
  function setLog(k, id, on) {
    const arr = D.S.logs[k] || [];
    const i = arr.indexOf(id);
    if (on && i < 0) arr.push(id);
    if (!on && i >= 0) arr.splice(i, 1);
    if (arr.length) D.S.logs[k] = arr; else delete D.S.logs[k];
  }
  function setPrayer(k, id, v) {
    const o = D.S.prayers[k] || { bomdod: null, peshin: null, asr: null, shom: null, xufton: null };
    o[id] = v || null;
    if (PR.every((p) => !o[p])) delete D.S.prayers[k]; else D.S.prayers[k] = o;
    const hid = prayerHabits()[id];
    if (hid) { const h = D.S.habits.find((x) => x.id === hid); if (h && !(h.target && h.target.n)) setLog(k, hid, !!v && v !== 'missed'); }
  }
  const stateOf = (k, id) => { const o = D.S.prayers[k]; return o && typeof o === 'object' ? o[id] || null : null; };

  /* totals over all logged days (memoised) */
  function prayerTotals() {
    return memo('totals', stateSig(), () => {
      const out = { missed: 0, qaza: 0, jamaat: 0, alone: 0, full: new Set() };
      for (const k of Object.keys(D.S.prayers)) {
        if (!isDay(k)) continue;
        const o = D.S.prayers[k]; if (!o || typeof o !== 'object') continue;
        let ok = true;
        for (const p of PR) {
          const s = o[p];
          if (s === 'missed') out.missed++; else if (s === 'qaza') out.qaza++; else if (s === 'jamaat') out.jamaat++; else if (s === 'alone') out.alone++;
          if (!s || s === 'missed') ok = false;
        }
        if (ok) out.full.add(k);
      }
      return out;
    });
  }
  const qazaPaid = () => { const q = D.S.prayers._qaza; return q && typeof q === 'object' ? Math.max(0, +q.paid || 0) : 0; };
  const qazaDebt = () => Math.max(0, prayerTotals().missed - qazaPaid());

  /* date steppers (device-only) */
  function timesKey() { const k = F().ibTimesDate; return isDay(k) ? k : D.today(); }
  function logKey() { const td = D.today(), k = F().ibLogDate; return isDay(k) && k < td ? k : td; }
  function dateNav(k, which, opts = {}) {
    const td = D.today(), today = k === td;
    let hint = today ? t('common.today') : k === D.addDays(td, -1) ? t('common.yesterday') : '';
    const hij = D.hijri.fmt(k);
    const fwdOff = opts.backfill && today;
    return `<div class="date-nav ib-nav">
      <button class="btn ghost sq" data-act="ibShift" data-which="${which}" data-n="-1" aria-label="${esc(t('ib.prevDay'))}">${D.ic('chevL')}</button>
      <div class="label">${esc(D.fmtDate(k, 'weekday'))}
        <span class="sub">${esc(hij)}${hint ? ` · ${esc(hint)}` : ''}</span>
        ${today ? '' : `<button class="ib-return" data-act="ibToday" data-which="${which}">${D.ic('undo', 12)} ${esc(t('ib.backToday'))}</button>`}
      </div>
      <button class="btn ghost sq" data-act="ibShift" data-which="${which}" data-n="1" ${fwdOff ? 'disabled' : ''} aria-label="${esc(t('ib.nextDay'))}">${D.ic('chevR')}</button>
    </div>`;
  }
  D.act.ibShift = (el) => {
    const which = el.dataset.which, n = +el.dataset.n || 0;
    if (which === 'log') {
      const nk = D.addDays(logKey(), n);
      if (nk > D.today()) return;
      F().ibLogDate = nk === D.today() ? null : nk;
    } else {
      const nk = D.addDays(timesKey(), n);
      F().ibTimesDate = nk === D.today() ? null : nk;
    }
    D.saveUi(); D.rerender();
  };
  D.act.ibToday = (el) => { if (el.dataset.which === 'log') F().ibLogDate = null; else F().ibTimesDate = null; D.saveUi(); D.rerender(); };

  const segHtml = () => `<div class="seg ib-seg">${SUBS.map((x) => `<button class="${sub() === x ? 'on' : ''}" data-act="sub" data-view="prayer" data-sub="${x}">${esc(t('ib.sub.' + x))}</button>`).join('')}</div>`;

  /* ------------------------------------------------------------------ */
  /* 1. TIMES                                                            */
  /* ------------------------------------------------------------------ */
  function heroState() {
    const nx = D.prayer.next(); if (!nx) return null;
    const p = D.nowTz(); const nowM = p.h * 60 + p.min;
    const tm = timesOf(nx.key); if (!tm) return null;
    let start;
    if (nx.current) start = tm[nx.current];
    else { const y = timesOf(D.addDays(nx.key, -1)); start = (y ? y.xufton : tm.xufton) - 1440; }
    const end = nowM + nx.minsLeft;
    const total = Math.max(1, end - start);
    const pct = D.clamp(((nowM + p.s / 60 - start) / total) * 100, 0, 100);
    const secs = Math.max(0, nx.minsLeft * 60 - p.s);
    return { nx, secs, pct };
  }
  const fmtCountdown = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return (h ? h + ':' + D.pad2(m) : D.pad2(m)) + ':' + D.pad2(s);
  };
  const heroRing = (pct) => D.chart.ring({ pct, size: 84, stroke: 6, color: 'var(--success)', label: D.ic('mosque', 22), sub: D.fmtPct(pct) });
  function heroHtml() {
    const hs = heroState();
    if (!hs) return `<div class="card ib-hero"><div class="eyebrow">${esc(t('ib.next'))}</div><div class="ib-hero-count num">—</div></div>`;
    const { nx, secs, pct } = hs;
    const cur = nx.current ? esc(t('prayer.' + nx.current)) : esc(t('ib.night'));
    return `<div class="card ib-hero">
      <div class="ib-hero-row">
        <div class="ib-hero-main">
          <div class="eyebrow">${esc(t('ib.next'))}</div>
          <div class="ib-hero-name">${esc(t('prayer.' + nx.id))} <span class="num muted">${nx.time}</span></div>
          <div class="ib-hero-count num" id="ibCountdown">${fmtCountdown(secs)}</div>
          <div class="ib-hero-meta"><span>${esc(t('ib.left'))}</span><span>·</span><span>${esc(t('ib.current'))}: <b>${cur}</b></span></div>
        </div>
        <div id="ibHeroRing">${heroRing(pct)}</div>
      </div>
    </div>`;
  }
  function timesTable(k) {
    const td = D.today(), isToday = k === td;
    const list = D.prayer.list(k);
    const nowM = nowMins();
    let cur = null;
    if (isToday) for (const x of list) if (x.mins <= nowM) cur = x.id;
    const rows = list.map((x) => {
      const st = x.id !== 'quyosh' ? stateOf(k, x.id) : null;
      const past = isToday ? x.mins <= nowM && x.id !== cur : k < td;
      const cls = ['ib-time-row', x.id === cur ? 'now' : '', past ? 'past' : '', x.id === 'quyosh' ? 'quyosh' : ''].join(' ');
      const stHtml = st ? `<span class="ib-time-state ib-c-${st}"><i class="ib-st-dot"></i>${esc(t('ib.st.' + st))}</span>` : '';
      return `<div class="${cls}"><i class="ib-time-dot"></i><span class="ib-time-name">${esc(t('prayer.' + x.id))}</span>${stHtml}<span class="ib-time-val num">${x.time}</span></div>`;
    }).join('');
    const duha = isToday && cur === 'quyosh' ? `<div class="small muted center mt-s">${esc(t('ib.duha'))}</div>` : '';
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.timesFor'))}</div><div class="title">${esc(D.fmtDate(k, 'weekday'))}</div></div>
        <span class="pill">${D.ic('moon', 12)} ${esc(D.hijri.fmt(k))}</span></div>
      <div class="ib-times">${rows}</div>${duha}
    </div>`;
  }
  function methodCard() {
    const st = D.S.settings.prayer || {};
    const note = t('ib.methodNote', { f: +st.fajr || 18, i: +st.isha || 18, asr: t(st.asr === 'shafi' ? 'ib.asr.shafi' : 'ib.asr.hanafi') });
    return `<div class="card flat ib-method"><div class="row between wrap">
      <div class="grow"><div class="eyebrow">${esc(t('ib.method'))}</div><div class="small">${esc(note)}</div></div>
      <button class="btn ghost sm" data-act="go" data-view="settings" data-sub="prayer">${D.ic('gear', 14)} ${esc(t('ib.openSettings'))}</button>
    </div></div>`;
  }
  function ramadanBanner(k) {
    if (!D.hijri.isRamadan(k)) return '';
    const h = D.hijri.fromKey(k);
    return `<div class="banner good">${D.ic('moon', 16)} <b>${esc(t('ib.ramadan'))}</b> · ${esc(t('ib.ramadanDay', { d: h ? h.d : '' }))}</div>`;
  }
  function renderTimes() {
    const k = timesKey();
    return dateNav(k, 'times') + ramadanBanner(k) + heroHtml() + timesTable(k) + methodCard();
  }

  /* ------------------------------------------------------------------ */
  /* 2. LOG                                                              */
  /* ------------------------------------------------------------------ */
  function logCard(k) {
    const td = D.today();
    const tm = timesOf(k);
    const nowM = nowMins();
    const ended = (id) => k < td || (id !== 'xufton' && !!tm && nowM >= tm[NEXT_OF[id]]);
    let n = 0, bad = 0;
    const rows = PR.map((id) => {
      const cur = stateOf(k, id); if (cur) n++; if (cur === 'missed') bad++;
      const hint = !cur && ended(id) ? `<span class="ib-hint">${esc(t('ib.qazaHint'))}</span>` : '';
      return `<div class="ib-log-row">
        <div class="ib-log-head"><span class="ib-log-name">${esc(t('prayer.' + id))}</span>${hint}<span class="num small muted">${tm ? D.prayer.fmt(tm[id]) : '—'}</span></div>
        <div class="ib-states">${STATES.map((s) => `<button class="ib-st ib-c-${s} ${cur === s ? 'on' : ''}" data-act="ibSet" data-key="${k}" data-id="${id}" data-s="${s}" aria-pressed="${cur === s}">${esc(t('ib.st.' + s))}</button>`).join('')}</div>
      </div>`;
    }).join('');
    return `<div class="card ${n === 5 && !bad ? 'all-done' : ''}">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.logTitle'))}</div><div class="title">${esc(t('ib.loggedN', { n }))}</div></div>
        <button class="btn ghost sm" data-act="ibAllJamaat" data-key="${k}" ${n === 5 ? 'disabled' : ''}>${D.ic('check', 14)} ${esc(t('ib.allJamaat'))}</button></div>
      ${rows}
    </div>`;
  }
  function ledgerCard() {
    const tot = prayerTotals(), paid = qazaPaid(), debt = qazaDebt();
    return `<div class="card ib-ledger ${debt ? '' : 'zero'}">
      <div class="card-head"><div class="title">${D.ic('flag', 16)} ${esc(t('ib.qazaLedger'))}</div></div>
      <div class="kpi ib-debt"><span class="kpi-num">${D.fmtNum(debt)}</span><span class="kpi-label">${esc(t('ib.debt'))}</span></div>
      ${debt ? '' : `<div class="small good mt-s">${esc(t('ib.noDebt'))}</div>`}
      <div class="stat-grid mt">
        <div class="stat"><i class="zone ${tot.missed ? 'z-bad' : 'z-good'}"></i><div class="stat-num num">${D.fmtNum(tot.missed)}</div><div class="stat-label">${esc(t('ib.missed'))}</div></div>
        <div class="stat"><i class="zone ${tot.qaza ? 'z-warn' : ''}"></i><div class="stat-num num">${D.fmtNum(tot.qaza)}</div><div class="stat-label">${esc(t('ib.late'))}</div></div>
        <div class="stat"><i class="zone ${paid ? 'z-good' : ''}"></i><div class="stat-num num">${D.fmtNum(paid)}</div><div class="stat-label">${esc(t('ib.paid'))}</div></div>
      </div>
      <div class="row mt"><button class="btn grow" data-act="ibPay">${D.ic('plus', 14)} ${esc(t('ib.payQaza'))}</button><button class="btn ghost sq" data-act="ibUnpay" ${paid ? '' : 'disabled'} aria-label="${esc(t('ib.unpay'))}" title="${esc(t('ib.unpay'))}">${D.ic('minus', 16)}</button></div>
    </div>`;
  }
  function last30Card() {
    const days = D.lastDays(30);
    let jam = 0, ontime = 0, logged = 0;
    for (const k of days) { const o = D.S.prayers[k]; if (!o || typeof o !== 'object') continue; for (const p of PR) { const s = o[p]; if (!s) continue; logged++; if (s === 'jamaat') { jam++; ontime++; } else if (s === 'alone') ontime++; } }
    const streak = memo('streak5', stateSig(), () => D.streak(prayerTotals().full));
    const heat = D.chart.heat({ days, valueFn: (k) => { const o = D.S.prayers[k]; if (!o || typeof o !== 'object') return 0; let j = 0; for (const p of PR) if (o[p] === 'jamaat') j++; return j ? Math.max(1, Math.round((j / 5) * 4)) : 0; } });
    const pct = (x) => (logged ? D.fmtPct((x / logged) * 100) : '—');
    return `<div class="card">
      <div class="card-head"><div class="title">${esc(t('ib.last30'))}</div></div>
      <div class="stat-grid">
        <div class="stat"><div class="stat-num num">${pct(jam)}</div><div class="stat-label">${esc(t('ib.jamaat'))}</div></div>
        <div class="stat"><div class="stat-num num">${pct(ontime)}</div><div class="stat-label">${esc(t('ib.ontime'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.ic('fire', 16)} ${D.fmtNum(streak)}</div><div class="stat-label">${esc(t('ib.streak5'))}</div><div class="stat-sub">${esc(t('unit.days'))}</div></div>
      </div>
      <div class="eyebrow mt">${esc(t('ib.heatJamaat'))}</div>${heat}
    </div>`;
  }
  function renderLog() {
    const k = logKey();
    return dateNav(k, 'log', { backfill: true }) + logCard(k) + ledgerCard() + last30Card();
  }
  D.act.ibSet = (el) => {
    const k = el.dataset.key, id = el.dataset.id, s = el.dataset.s;
    if (!isDay(k) || k > D.today() || !PR.includes(id) || !STATES.includes(s)) return;
    const cur = stateOf(k, id);
    setPrayer(k, id, cur === s ? null : s);
    haptic(); D.save(); D.rerender();
  };
  D.act.ibAllJamaat = (el) => {
    const k = el.dataset.key; if (!isDay(k) || k > D.today()) return;
    for (const id of PR) if (!stateOf(k, id)) setPrayer(k, id, 'jamaat');
    haptic('success'); D.save(); D.rerender();
  };
  D.act.ibPay = () => {
    const q = D.S.prayers._qaza && typeof D.S.prayers._qaza === 'object' ? D.S.prayers._qaza : { paid: 0 };
    q.paid = Math.max(0, +q.paid || 0) + 1; D.S.prayers._qaza = q;
    haptic('success'); D.save(); D.rerender(); D.toast(t('ib.paidToast'));
  };
  D.act.ibUnpay = () => {
    const q = D.S.prayers._qaza; if (!q || !(+q.paid > 0)) return;
    q.paid = +q.paid - 1; haptic(); D.save(); D.rerender(); D.toast(t('ib.unpaidToast'));
  };

  /* ------------------------------------------------------------------ */
  /* 3. TASBIH                                                           */
  /* ------------------------------------------------------------------ */
  const TAP_R = 94, TAP_C = 2 * Math.PI * TAP_R;
  function T() {
    const f = F();
    let s = f.ibTasbih;
    if (!s || typeof s !== 'object') s = f.ibTasbih = { name: 'subhanallah', custom: '', preset: 33, n: 0 };
    if (!DHIKR.includes(s.name) && s.name !== 'custom') s.name = 'subhanallah';
    if (!PRESETS.includes(+s.preset)) s.preset = 33; else s.preset = +s.preset;
    s.n = Math.max(0, Math.floor(+s.n || 0));
    return s;
  }
  const dhikrLabel = (s) => (s.name === 'custom' ? s.custom || t('ib.custom') : t('ib.d.' + s.name));
  function tapProgress(s) { if (!s.preset) return 0; const r = s.n % s.preset; return s.n && r === 0 ? 1 : r / s.preset; }
  function tapInner(s) {
    const rounds = s.preset ? Math.floor(s.n / s.preset) : 0;
    const subTxt = s.preset ? `${s.n % s.preset || (s.n ? s.preset : 0)} / ${s.preset}${rounds ? ` · ${t('ib.rounds', { n: rounds })}` : ''}` : dhikrLabel(s);
    return `<div class="ib-tap-n num">${D.fmtNum(s.n)}</div><div class="ib-tap-sub">${esc(subTxt)}</div>`;
  }
  function tasbihCard() {
    const s = T();
    const names = DHIKR.map((d) => `<button class="${s.name === d ? 'on' : ''}" data-act="ibName" data-name="${d}">${esc(t('ib.d.' + d))}</button>`).join('') +
      `<button class="${s.name === 'custom' ? 'on' : ''}" data-act="ibCustomName">${D.ic('edit', 12)} ${esc(s.name === 'custom' && s.custom ? s.custom : t('ib.custom'))}</button>`;
    const presets = PRESETS.map((p) => `<button class="num ${s.preset === p ? 'on' : ''}" data-act="ibPreset" data-p="${p}">${p || '∞'}</button>`).join('');
    const off = (TAP_C * (1 - tapProgress(s))).toFixed(1);
    return `<div class="card ib-tasbih-card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.tasbih'))}</div><div class="title">${esc(dhikrLabel(s))}</div></div></div>
      <div class="tabs ib-names">${names}</div>
      <div class="ib-tap-wrap">
        <button class="ib-tap" data-act="ibTap" aria-label="${esc(t('ib.tapHint'))}">
          <svg class="ib-tap-ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="ib-tap-track" cx="100" cy="100" r="${TAP_R}"/><circle class="ib-tap-fill" id="ibTapFill" cx="100" cy="100" r="${TAP_R}" stroke-dasharray="${TAP_C.toFixed(1)}" stroke-dashoffset="${off}"/></svg>
          <div class="ib-tap-inner" id="ibTapInner">${tapInner(s)}</div>
        </button>
      </div>
      <div class="tabs ib-presets">${presets}</div>
      <div class="row"><button class="btn grow" data-act="ibTasbihSave">${D.ic('save', 14)} ${esc(t('btn.save'))}</button><button class="btn ghost" data-act="ibTasbihReset">${D.ic('refresh', 14)} ${esc(t('ib.reset'))}</button></div>
    </div>`;
  }
  function dhikrStats() {
    const td = D.today();
    const days = D.lastDays(7);
    const tot = (k) => { const d = D.S.dhikr[k]; return d && typeof d === 'object' ? +d.total || 0 : 0; };
    const values = days.map(tot);
    const labels = days.map((k) => D.t('weekdaysShort')[D.dowOf(k)]);
    const streak = memo('dhikrStreak', stateSig(), () => { const set = new Set(); for (const k of Object.keys(D.S.dhikr)) if (isDay(k) && tot(k) > 0) set.add(k); return D.streak(set); });
    const today = D.S.dhikr[td];
    const sessions = today && Array.isArray(today.sessions) ? today.sessions.slice().reverse() : [];
    const list = sessions.length ? `<div class="list">${sessions.map((x) => {
      const id = x.id || String(x.ts || '');
      const p = x.ts ? D.nowTz(new Date(x.ts)) : null;
      return `<div class="li"><div class="li-body"><div class="li-text">${esc(x.name || '')}</div><div class="li-meta num">${p ? D.fmtTime(p.h, p.min) : ''}</div></div>
        <span class="li-right num">${D.fmtNum(x.n)}</span><button class="li-del" data-act="ibSessDel" data-key="${td}" data-id="${esc(id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>`;
    }).join('')}</div>` : `<div class="empty">${esc(t('ib.noSessions'))}</div>`;
    return `<div class="card">
      <div class="stat-grid">
        <div class="stat"><div class="stat-num num">${D.fmtNum(tot(td))}</div><div class="stat-label">${esc(t('ib.todayTotal'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.fmtNum(D.sum(values))}</div><div class="stat-label">${esc(t('ib.week7'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.ic('fire', 16)} ${D.fmtNum(streak)}</div><div class="stat-label">${esc(t('ib.dhikrStreak'))}</div></div>
      </div>
      <div class="mt">${D.chart.bars({ values, labels, color: 'var(--violet)', height: 64 })}</div>
      <div class="section-title">${esc(t('ib.sessions'))}</div>${list}
    </div>`;
  }
  const renderTasbih = () => tasbihCard() + dhikrStats();

  function paintTap(s) {
    D.patch('ibTapInner', tapInner(s));
    const f = document.getElementById('ibTapFill');
    if (f) f.setAttribute('stroke-dashoffset', (TAP_C * (1 - tapProgress(s))).toFixed(1));
  }
  D.act.ibTap = () => {
    const s = T(); s.n++;
    D.saveUi(); paintTap(s);
    if (s.preset && s.n % s.preset === 0) { haptic('success'); D.toast(t('ib.completed', { name: dhikrLabel(s), n: s.preset })); }
    else haptic('light');
  };
  D.act.ibPreset = (el) => { const s = T(); const p = +el.dataset.p; if (!PRESETS.includes(p)) return; s.preset = p; D.saveUi(); D.rerender(); };
  D.act.ibName = (el) => { const s = T(); const n = el.dataset.name; if (!DHIKR.includes(n)) return; s.name = n; D.saveUi(); D.rerender(); };
  D.act.ibCustomName = async () => {
    const s = T();
    const v = await D.prompt({ title: t('ib.custom'), placeholder: t('ib.customPh'), value: s.custom || '' });
    if (v === null) return;
    const name = String(v).trim().slice(0, 40);
    if (!name) return;
    s.custom = name; s.name = 'custom'; D.saveUi(); D.rerender();
  };
  D.act.ibTasbihReset = () => { const s = T(); s.n = 0; D.saveUi(); paintTap(s); haptic(); };
  D.act.ibTasbihSave = () => {
    const s = T();
    if (!s.n) { D.toast(t('ib.nothingToSave')); return; }
    const k = D.today();
    const d = D.S.dhikr[k] && typeof D.S.dhikr[k] === 'object' ? D.S.dhikr[k] : { total: 0, sessions: [] };
    if (!Array.isArray(d.sessions)) d.sessions = [];
    d.sessions.push({ id: D.uid('dz'), name: dhikrLabel(s), n: s.n, ts: Date.now() });
    d.total = D.sum(d.sessions, (x) => x.n);
    D.S.dhikr[k] = d;
    const n = s.n; s.n = 0;
    D.saveUi(); haptic('success'); D.save(); D.rerender(); D.toast(t('ib.saved', { n: D.fmtNum(n) }));
  };
  D.act.ibSessDel = (el) => {
    const k = el.dataset.key, id = el.dataset.id;
    const d = D.S.dhikr[k]; if (!d || !Array.isArray(d.sessions)) return;
    const i = d.sessions.findIndex((x) => x.id === id || String(x.ts) === id);
    if (i < 0) return;
    const [item] = d.sessions.splice(i, 1);
    const recount = () => { d.total = D.sum(d.sessions, (x) => x.n); if (d.sessions.length) D.S.dhikr[k] = d; else delete D.S.dhikr[k]; };
    recount();
    D.undo.push({ label: t('ib.sessionDeleted'), undo: () => { d.sessions.splice(Math.min(i, d.sessions.length), 0, item); recount(); } });
    D.save(); D.rerender();
    D.toast(t('ib.sessionDeleted'), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* 4. FASTING                                                          */
  /* ------------------------------------------------------------------ */
  const fastRec = (k) => { const r = D.S.fasting[k]; return r && typeof r === 'object' ? r : null; };
  const fasted = (k) => { const r = fastRec(k); return !!(r && r.done); };
  function penType(k) { const p = F().ibFastType; if (FTYPES.includes(p)) return p; return D.hijri.sunnahFast(k) === 'ramadan' ? 'ramadan' : 'sunnah'; }
  function hijriMonth(k) {
    const h = D.hijri.fromKey(k); if (!h) return null;
    const start = D.addDays(k, -(h.d - 1));
    const h30 = D.hijri.fromKey(D.addDays(start, 29));
    const len = h30 && h30.m === h.m ? 30 : 29;
    return { h, start, len };
  }
  function fastTodayCard() {
    const td = D.today(), sug = D.hijri.sunnahFast(td), rec = fastRec(td), done = fasted(td);
    const type = rec && FTYPES.includes(rec.type) ? rec.type : penType(td);
    return `<div class="card ${done ? 'all-done' : ''}">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.fastToday'))}</div><div class="title">${esc(D.fmtDate(td, 'weekday'))}</div><div class="small muted">${esc(D.hijri.fmt(td))}</div></div>
        ${sug ? `<span class="pill on">${D.ic('star', 12)} ${esc(t('ib.f.' + sug))}</span>` : `<span class="pill">${esc(t('ib.noSuggest'))}</span>`}</div>
      <button class="ib-fast-toggle ${done ? 'on' : ''}" data-act="ibFastToggle" data-key="${td}" aria-pressed="${done}"><i class="chk big ${done ? 'on' : ''}" aria-hidden="true"></i>${esc(t('ib.fasted'))}</button>
      <div class="row wrap mt"><span class="eyebrow">${esc(t('ib.fastType'))}</span>
        <div class="seg compact">${FTYPES.map((f) => `<button class="${type === f ? 'on' : ''}" data-act="ibFastType" data-type="${f}">${esc(t('ib.ft.' + f))}</button>`).join('')}</div></div>
    </div>`;
  }
  function ramadanCard() {
    const td = D.today();
    if (!D.hijri.isRamadan(td)) {
      const n = memo('toRamadan', td, () => { let k = td; for (let i = 0; i < 400; i++) { if (D.hijri.isRamadan(k)) return i; k = D.addDays(k, 1); } return null; });
      return n === null ? '' : `<div class="card flat"><div class="row"><span class="pill info">${D.ic('moon', 12)} ${esc(t('ib.toRamadan', { n }))}</span></div></div>`;
    }
    const hm = hijriMonth(td); if (!hm) return '';
    let n = 0;
    for (let i = 0; i < hm.len; i++) if (fasted(D.addDays(hm.start, i))) n++;
    const d = hm.h.d, perDay = Math.round((PAGES / hm.len) * 10) / 10, page = Math.min(PAGES, Math.round((d * PAGES) / hm.len)), juz = Math.min(JUZ, Math.ceil((d * JUZ) / hm.len));
    return `<div class="card ib-ramadan">
      <div class="card-head"><div class="title">${D.ic('moon', 16)} ${esc(t('ib.ramadanMode'))}</div><span class="num small muted">${esc(t('ib.ramadanDay', { d }))}</span></div>
      <div class="kpi"><span class="kpi-num">${n}</span><span class="kpi-total">/ ${hm.len}</span><span class="kpi-label">${esc(t('ib.ramadanProgress'))}</span></div>
      <span class="bar thick mt-s"><i class="bar-fill" style="width:${((n / hm.len) * 100).toFixed(1)}%"></i></span>
      <div class="mt"><div class="eyebrow">${esc(t('ib.khatm'))}</div><div class="small">${esc(t('ib.khatmHint', { p: perDay, page, juz }))}</div></div>
      ${d > hm.len - 10 ? `<div class="banner good mt">${D.ic('sparkles', 14)} ${esc(t('ib.lastTen'))}</div>` : ''}
    </div>`;
  }
  function monthGrid() {
    const td = D.today(), hm = hijriMonth(td); if (!hm) return '';
    let n = 0, cells = '';
    for (let i = 0; i < 30; i++) {
      const k = D.addDays(hm.start, i);
      const inMonth = i < hm.len, future = k > td;
      const rec = fastRec(k), done = !!(rec && rec.done);
      if (done && inMonth) n++;
      const sug = inMonth && D.hijri.sunnahFast(k);
      const cls = ['ib-hcell', done ? 'done ib-f-' + (FTYPES.includes(rec.type) ? rec.type : 'sunnah') : '', k === td ? 'today' : '', sug ? 'sug' : ''].join(' ');
      cells += `<button class="${cls}" data-act="ibFastToggle" data-key="${k}" ${future || !inMonth ? 'disabled' : ''} title="${esc(D.fmtDate(k))}${sug ? ' · ' + esc(t('ib.f.' + sug)) : ''}"><span class="num">${inMonth ? i + 1 : ''}</span></button>`;
    }
    const legend = FTYPES.map((f) => `<span><i class="dot" style="--c:var(--${{ ramadan: 'success', sunnah: 'info', qaza: 'warning', nafl: 'violet' }[f]})"></i>${esc(t('ib.ft.' + f))}</span>`).join('') + `<span><i class="dot" style="--c:var(--warning);width:5px;height:5px"></i>${esc(t('ib.sugDot'))}</span>`;
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.hijriMonth'))}</div><div class="title">${esc(D.t('hijri.months')[hm.h.m - 1])} ${hm.h.y}</div></div><span class="pill good">${esc(t('ib.fastedN', { n }))}</span></div>
      <div class="ib-hgrid">${cells}</div>
      <div class="legend">${legend}</div>
    </div>`;
  }
  function fastLedger() {
    const owed = (() => { const d = D.S.fasting._debt; return d && typeof d === 'object' ? Math.max(0, Math.floor(+d.owed || 0)) : 0; })();
    const logged = memo('qazaFasts', stateSig(), () => { let n = 0; for (const k of Object.keys(D.S.fasting)) { if (!isDay(k)) continue; const r = D.S.fasting[k]; if (r && r.done && r.type === 'qaza') n++; } return n; });
    const rem = Math.max(0, owed - logged);
    return `<div class="card">
      <div class="card-head"><div class="title">${D.ic('flag', 16)} ${esc(t('ib.qazaFast'))}</div></div>
      <div class="stat-grid">
        <div class="stat"><input class="inp sm num ib-owed" type="number" min="0" max="9999" inputmode="numeric" value="${owed}" data-change="ibFastOwed" aria-label="${esc(t('ib.owed'))}"><div class="stat-label">${esc(t('ib.owed'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.fmtNum(logged)}</div><div class="stat-label">${esc(t('ib.qazaDone'))}</div></div>
        <div class="stat"><i class="zone ${rem ? 'z-warn' : 'z-good'}"></i><div class="stat-num num">${D.fmtNum(rem)}</div><div class="stat-label">${esc(t('ib.remaining'))}</div></div>
      </div>
    </div>`;
  }
  const renderFasting = () => fastTodayCard() + ramadanCard() + monthGrid() + fastLedger();

  D.act.ibFastToggle = (el) => {
    const k = el.dataset.key; if (!isDay(k) || k > D.today()) return;
    const r = fastRec(k);
    if (r && r.done) delete D.S.fasting[k];
    else D.S.fasting[k] = { type: r && FTYPES.includes(r.type) ? r.type : penType(k), done: true };
    haptic(); D.save(); D.rerender();
  };
  D.act.ibFastType = (el) => {
    const f = el.dataset.type; if (!FTYPES.includes(f)) return;
    F().ibFastType = f; D.saveUi();
    const r = fastRec(D.today());
    if (r && r.done) { r.type = f; D.save(); }
    D.rerender();
  };
  D.act.ibFastOwed = (el) => {
    const v = D.clamp(Math.floor(+el.value || 0), 0, 9999);
    const d = D.S.fasting._debt && typeof D.S.fasting._debt === 'object' ? D.S.fasting._debt : {};
    d.owed = v; D.S.fasting._debt = d;
    D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* 5. QIBLA                                                            */
  /* ------------------------------------------------------------------ */
  let orient = { on: false, handler: null, evName: null, heading: null };
  const hasOrientation = () => typeof window.DeviceOrientationEvent !== 'undefined';
  function compassSvg(b) {
    const cx = 120, cy = 120;
    let ticks = '';
    for (let i = 0; i < 72; i++) {
      const a = i * 5 * Math.PI / 180, major = i % 18 === 0, mid = i % 6 === 0;
      const r1 = 112, r0 = major ? 98 : mid ? 103 : 107;
      ticks += `<line class="ib-tick ${major ? 'major' : ''}" x1="${(cx + r0 * Math.sin(a)).toFixed(1)}" y1="${(cy - r0 * Math.cos(a)).toFixed(1)}" x2="${(cx + r1 * Math.sin(a)).toFixed(1)}" y2="${(cy - r1 * Math.cos(a)).toFixed(1)}"/>`;
    }
    const card = [['N', 0, 'n'], ['E', 90, ''], ['S', 180, ''], ['W', 270, '']].map(([l, deg, c]) => { const a = deg * Math.PI / 180; return `<text class="ib-cardinal ${c}" x="${(cx + 84 * Math.sin(a)).toFixed(1)}" y="${(cy - 84 * Math.cos(a)).toFixed(1)}">${l}</text>`; }).join('');
    return `<svg viewBox="0 0 240 240" aria-hidden="true">
      <circle class="ib-dial-ring" cx="${cx}" cy="${cy}" r="116"/>
      <g id="ibDial" class="ib-dial">${ticks}${card}
        <g transform="rotate(${b.toFixed(1)} ${cx} ${cy})">
          <path class="ib-needle-tail" d="M${cx} ${cy + 4} L${cx - 7} ${cy + 20} L${cx} ${cy + 66} L${cx + 7} ${cy + 20} Z"/>
          <path class="ib-needle" d="M${cx} ${cy - 62} L${cx + 8} ${cy - 4} L${cx} ${cy + 4} L${cx - 8} ${cy - 4} Z"/>
          <rect class="ib-kaaba" x="${cx - 6}" y="${cy - 80}" width="12" height="12" rx="2"/>
        </g>
      </g>
      <circle class="ib-hub" cx="${cx}" cy="${cy}" r="6"/>
      <path class="ib-idx" d="M${cx} 2 l7 12 h-14 z"/>
    </svg>`;
  }
  function renderQibla() {
    const b = D.prayer.qibla(); const st = D.S.settings.prayer || {};
    const live = orient.on;
    const hint = live ? (orient.heading == null ? esc(t('ib.waiting')) : hintFor(orient.heading)) : esc(t('ib.staticHint'));
    return `<div class="card ib-qibla-card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.qibla'))}</div><div class="title">${esc(t('ib.bearing'))}</div></div>${live ? `<span class="pill good">${D.ic('compass', 12)} ${esc(t('ib.live'))}</span>` : ''}</div>
      <div class="ib-compass-wrap"><div class="ib-compass" id="ibCompass">${compassSvg(b)}</div></div>
      <div class="ib-qibla-deg"><span class="num">${b.toFixed(1)}°</span><div class="small muted">${esc(t('ib.fromNorth'))}</div></div>
      <div class="small center mt-s" id="ibQiblaHint">${hint}</div>
      <div class="row mt ib-center">${hasOrientation()
        ? `<button class="btn ${live ? 'ghost' : ''}" data-act="ibLive">${D.ic('compass', 16)} ${esc(t(live ? 'ib.liveOff' : 'ib.live'))}</button>`
        : `<span class="pill">${D.ic('info', 12)} ${esc(t('ib.noCompass'))}</span>`}</div>
      <div class="help mt center">${esc(t('ib.qiblaHint'))}</div>
    </div>
    <div class="card flat"><div class="row between wrap">
      <div class="grow"><div class="eyebrow">${esc(t('ib.coords'))}</div><div class="num small">${(+st.lat || 41.2995).toFixed(4)}, ${(+st.lng || 69.2401).toFixed(4)}</div></div>
      <button class="btn ghost sm" data-act="go" data-view="settings" data-sub="prayer">${D.ic('gear', 14)} ${esc(t('ib.openSettings'))}</button>
    </div></div>`;
  }
  function hintFor(hd) {
    const b = D.prayer.qibla();
    const d = ((b - hd + 540) % 360) - 180;
    if (Math.abs(d) <= 5) return `<span class="good">${D.ic('check', 14)} ${esc(t('ib.aligned'))}</span>`;
    return esc(d > 0 ? t('ib.turnRight', { n: Math.round(d) }) : t('ib.turnLeft', { n: Math.round(-d) }));
  }
  function applyHeading(hd) {
    const prev = orient.heading;
    orient.heading = hd;
    if (prev != null && Math.abs(((hd - prev + 540) % 360) - 180) < 1) return;
    const dial = document.getElementById('ibDial');
    if (dial) dial.style.transform = `rotate(${(-hd).toFixed(1)}deg)`;
    D.patch('ibQiblaHint', hintFor(hd));
    if (Math.abs(((D.prayer.qibla() - hd + 540) % 360) - 180) <= 5 && !(prev != null && Math.abs(((D.prayer.qibla() - prev + 540) % 360) - 180) <= 5)) haptic('success');
  }
  function startOrient() {
    const h = (ev) => {
      let hd = null;
      if (typeof ev.webkitCompassHeading === 'number' && !isNaN(ev.webkitCompassHeading)) hd = ev.webkitCompassHeading;
      else if (typeof ev.alpha === 'number' && !isNaN(ev.alpha)) hd = (360 - ev.alpha) % 360;
      if (hd == null) return;
      applyHeading((hd + 360) % 360);
    };
    const evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evName, h, true);
    orient = { on: true, handler: h, evName, heading: null };
  }
  function stopOrient() {
    if (orient.handler) { try { window.removeEventListener(orient.evName, orient.handler, true); } catch (e) {} }
    orient = { on: false, handler: null, evName: null, heading: null };
  }
  D.act.ibLive = async () => {
    if (orient.on) { stopOrient(); D.rerender(); return; }
    if (!hasOrientation()) { D.toast(t('ib.noCompass')); return; }
    try {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === 'function') {
        const r = await DOE.requestPermission();
        if (r !== 'granted') { D.toast(t('ib.compassDenied')); return; }
      }
      startOrient(); D.rerender();
    } catch (e) { D.toast(t('ib.compassDenied')); }
  };

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  let timer = null, lastMin = null, lastId = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } lastMin = null; lastId = null; }
  function tick() {
    if (document.hidden) return;
    let hs;
    try { hs = heroState(); } catch (e) { return; }
    if (!hs) return;
    // waqt rolled over (next prayer changed) → hero name/time/table highlight are stale: full rerender
    if (lastId && hs.nx.id !== lastId) { stopTimer(); D.rerender(); return; }
    lastId = hs.nx.id;
    if (hs.secs <= 0) { stopTimer(); D.rerender(); return; }
    D.patch('ibCountdown', fmtCountdown(hs.secs));
    const m = hs.nx.minsLeft;
    if (m !== lastMin) { lastMin = m; D.patch('ibHeroRing', heroRing(hs.pct)); }
  }

  function render() {
    const s = sub();
    const body = s === 'log' ? safe(renderLog) : s === 'tasbih' ? safe(renderTasbih) : s === 'fasting' ? safe(renderFasting) : s === 'qibla' ? safe(renderQibla) : safe(renderTimes);
    const ai = D.ai && (s === 'times' || s === 'log' || s === 'fasting') ? safe(() => D.ai.card('prayer')) : '';
    return `<div class="ib">${segHtml()}${body}${ai}</div>`;
  }

  D.view({
    id: 'prayer', icon: 'mosque', order: 40, nav: true, primary: true,
    render,
    mount() {
      stopTimer();
      const s = sub();
      if (s === 'times') { tick(); timer = setInterval(tick, 1000); }
      if (s !== 'qibla' && orient.on) stopOrient();
      else if (s === 'qibla' && orient.on && orient.heading != null) { const hd = orient.heading; orient.heading = null; applyHeading(hd); }
    },
    unmount() { stopTimer(); stopOrient(); },
  });

  D.on('day:changed', () => { F().ibLogDate = null; F().ibTimesDate = null; D.saveUi(); if (D.current() === 'prayer') D.rerender(); });

  D.search.register(() => SUBS.map((s) => ({ label: t('ib.sub.' + s), sub: t('nav.prayer'), icon: 'mosque', go: () => D.go('prayer', s) })));
})();
