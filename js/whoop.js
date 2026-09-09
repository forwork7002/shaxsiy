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


  D.i18n.add({
    uz: {
      'wh.justNow': 'hozirgina', 'wh.minAgo': '{n} daqiqa oldin', 'wh.live': 'jonli', 'wh.stale': 'eskirgan',
      'wh.connectedAs': 'WHOOP ulangan: {name}', 'wh.updated': 'yangilangan {t}', 'wh.refreshNow': 'Hozir yangilash',
      'wh.strainLive': 'Zo‘riqish', 'wh.sinceStart': '{t} dan beri', 'wh.hr': 'puls', 'wh.hrMaxShort': 'maks',
      'wh.calibrating': 'WHOOP hali kalibrlanmoqda — birinchi haftada raqamlar o‘zgaradi',
      'wh.err.rate_limited': 'WHOOP limiti — bir daqiqadan so‘ng yangilanadi', 'wh.err.http': 'WHOOP javob bermadi ({e})', 'wh.err.not_connected': 'WHOOP ulanmagan',
      'wh.sl.title': 'Uyqu', 'wh.sl.got': 'uxlandi', 'wh.sl.need': 'kerak edi', 'wh.sl.inBed': 'yotoqda', 'wh.sl.awake': 'uyg‘oq',
      'wh.sl.cycles': '{n} sikl', 'wh.sl.dist': '{n} marta uyg‘onish', 'wh.sl.perf': 'sifat', 'wh.sl.eff': 'samaradorlik', 'wh.sl.cons': 'izchillik',
      'wh.sl.debt7': '7 kunlik uyqu qarzi', 'wh.sl.naps': 'kunduzgi uyqu: {n} marta, {h} soat', 'wh.sl.14': 'So‘nggi 14 kecha', 'wh.sl.needLine': 'chiziq — o‘sha kecha kerak bo‘lgan uyqu',
      'wh.sl.none': 'Bu kecha uchun uyqu yozuvi yo‘q', 'wh.sl.stagesTitle': 'Uyqu bosqichlari', 'wh.sl.light': 'yengil', 'wh.sl.deep': 'chuqur', 'wh.sl.rem': 'REM',
      'wh.sl.consHint': 'Har kuni bir xil vaqtda yotish izchillikni ko‘taradi', 'wh.sl.effHint': 'Yotoqdagi vaqtning qanchasi uyquga ketgani',
      'wh.st.today': 'Bugungi yuk', 'wh.st.none': 'Bugun hali zo‘riqish o‘lchanmadi', 'wh.st.14': 'Zo‘riqish, 14 kun', 'wh.st.legend': 'ustun rangi — o‘sha kungi tiklanish',
      'wh.st.target': 'bugungi me‘yor {m}', 'wh.st.room': 'yana {n} gacha joy bor', 'wh.st.over': 'me‘yordan {n} yuqori', 'wh.st.kcal': '{k} kkal sarflandi', 'wh.st.tdee': 'taxminiy kunlik me‘yor {t}',
      'wh.zones': 'Puls zonalari', 'wh.z.0': 'tinch', 'wh.z.1': 'yengil', 'wh.z.2': 'o‘rtacha', 'wh.z.3': 'kuchli', 'wh.z.4': 'og‘ir', 'wh.z.5': 'maksimal',
      'wh.wo.today': 'Bugungi mashg‘ulotlar', 'wh.wo.none': 'Bugun WHOOP mashg‘ulot yozmagan', 'wh.wo.min': '{n} daqiqa',
      'wh.disconnect': 'Uzish', 'wh.connect': 'WHOOP’ni ulash', 'wh.intro': 'Soatingizdagi tiklanish, uyqu, zo‘riqish va mashg‘ulotlar shu yerga o‘zi keladi — har daqiqa.',
      'wh.needServer': 'Bu qurilmada server yo‘q — WHOOP faqat jonli saytda ishlaydi', 'wh.pending': 'WHOOP’dan birinchi ma’lumot olinmoqda…',
    },
    uzk: {
      'wh.justNow': 'ҳозиргина', 'wh.minAgo': '{n} дақиқа олдин', 'wh.live': 'жонли', 'wh.stale': 'эскирган',
      'wh.connectedAs': 'WHOOP уланган: {name}', 'wh.updated': 'янгиланган {t}', 'wh.refreshNow': 'Ҳозир янгилаш',
      'wh.strainLive': 'Зўриқиш', 'wh.sinceStart': '{t} дан бери', 'wh.hr': 'пульс', 'wh.hrMaxShort': 'макс',
      'wh.calibrating': 'WHOOP ҳали калибрланмоқда — биринчи ҳафтада рақамлар ўзгаради',
      'wh.err.rate_limited': 'WHOOP лимити — бир дақиқадан сўнг янгиланади', 'wh.err.http': 'WHOOP жавоб бермади ({e})', 'wh.err.not_connected': 'WHOOP уланмаган',
      'wh.sl.title': 'Уйқу', 'wh.sl.got': 'ухланди', 'wh.sl.need': 'керак эди', 'wh.sl.inBed': 'ётоқда', 'wh.sl.awake': 'уйғоқ',
      'wh.sl.cycles': '{n} цикл', 'wh.sl.dist': '{n} марта уйғониш', 'wh.sl.perf': 'сифат', 'wh.sl.eff': 'самарадорлик', 'wh.sl.cons': 'изчиллик',
      'wh.sl.debt7': '7 кунлик уйқу қарзи', 'wh.sl.naps': 'кундузги уйқу: {n} марта, {h} соат', 'wh.sl.14': 'Сўнгги 14 кеча', 'wh.sl.needLine': 'чизиқ — ўша кеча керак бўлган уйқу',
      'wh.sl.none': 'Бу кеча учун уйқу ёзуви йўқ', 'wh.sl.stagesTitle': 'Уйқу босқичлари', 'wh.sl.light': 'енгил', 'wh.sl.deep': 'чуқур', 'wh.sl.rem': 'REM',
      'wh.sl.consHint': 'Ҳар куни бир хил вақтда ётиш изчилликни кўтаради', 'wh.sl.effHint': 'Ётоқдаги вақтнинг қанчаси уйқуга кетгани',
      'wh.st.today': 'Бугунги юк', 'wh.st.none': 'Бугун ҳали зўриқиш ўлчанмади', 'wh.st.14': 'Зўриқиш, 14 кун', 'wh.st.legend': 'устун ранги — ўша кунги тикланиш',
      'wh.st.target': 'бугунги меъёр {m}', 'wh.st.room': 'яна {n} гача жой бор', 'wh.st.over': 'меъёрдан {n} юқори', 'wh.st.kcal': '{k} ккал сарфланди', 'wh.st.tdee': 'тахминий кунлик меъёр {t}',
      'wh.zones': 'Пульс зоналари', 'wh.z.0': 'тинч', 'wh.z.1': 'енгил', 'wh.z.2': 'ўртача', 'wh.z.3': 'кучли', 'wh.z.4': 'оғир', 'wh.z.5': 'максимал',
      'wh.wo.today': 'Бугунги машғулотлар', 'wh.wo.none': 'Бугун WHOOP машғулот ёзмаган', 'wh.wo.min': '{n} дақиқа',
      'wh.disconnect': 'Узиш', 'wh.connect': 'WHOOP’ни улаш', 'wh.intro': 'Соатингиздаги тикланиш, уйқу, зўриқиш ва машғулотлар шу ерга ўзи келади — ҳар дақиқа.',
      'wh.needServer': 'Бу қурилмада сервер йўқ — WHOOP фақат жонли сайтда ишлайди', 'wh.pending': 'WHOOP’дан биринчи маълумот олинмоқда…',
    },
    ru: {
      'wh.justNow': 'только что', 'wh.minAgo': '{n} мин назад', 'wh.live': 'live', 'wh.stale': 'устарело',
      'wh.connectedAs': 'WHOOP подключён: {name}', 'wh.updated': 'обновлено {t}', 'wh.refreshNow': 'Обновить сейчас',
      'wh.strainLive': 'Нагрузка', 'wh.sinceStart': 'с {t}', 'wh.hr': 'пульс', 'wh.hrMaxShort': 'макс',
      'wh.calibrating': 'WHOOP ещё калибруется — в первую неделю цифры будут меняться',
      'wh.err.rate_limited': 'Лимит WHOOP — обновится через минуту', 'wh.err.http': 'WHOOP не ответил ({e})', 'wh.err.not_connected': 'WHOOP не подключён',
      'wh.sl.title': 'Сон', 'wh.sl.got': 'проспали', 'wh.sl.need': 'нужно было', 'wh.sl.inBed': 'в постели', 'wh.sl.awake': 'бодрствование',
      'wh.sl.cycles': '{n} цикл.', 'wh.sl.dist': 'пробуждений: {n}', 'wh.sl.perf': 'качество', 'wh.sl.eff': 'эффективность', 'wh.sl.cons': 'регулярность',
      'wh.sl.debt7': 'Долг сна за 7 дней', 'wh.sl.naps': 'дневной сон: {n} раз, {h} ч', 'wh.sl.14': 'Последние 14 ночей', 'wh.sl.needLine': 'линия — сколько сна требовалось в ту ночь',
      'wh.sl.none': 'За эту ночь записи сна нет', 'wh.sl.stagesTitle': 'Фазы сна', 'wh.sl.light': 'лёгкий', 'wh.sl.deep': 'глубокий', 'wh.sl.rem': 'REM',
      'wh.sl.consHint': 'Ложиться в одно и то же время — главное для регулярности', 'wh.sl.effHint': 'Какая часть времени в постели ушла на сон',
      'wh.st.today': 'Нагрузка сегодня', 'wh.st.none': 'Сегодня нагрузка ещё не измерена', 'wh.st.14': 'Нагрузка, 14 дней', 'wh.st.legend': 'цвет столбца — восстановление в тот день',
      'wh.st.target': 'норма на сегодня {m}', 'wh.st.room': 'есть запас до {n}', 'wh.st.over': 'выше нормы на {n}', 'wh.st.kcal': 'потрачено {k} ккал', 'wh.st.tdee': 'примерная дневная норма {t}',
      'wh.zones': 'Пульсовые зоны', 'wh.z.0': 'покой', 'wh.z.1': 'лёгкая', 'wh.z.2': 'средняя', 'wh.z.3': 'высокая', 'wh.z.4': 'тяжёлая', 'wh.z.5': 'максимум',
      'wh.wo.today': 'Тренировки сегодня', 'wh.wo.none': 'WHOOP не записал тренировок сегодня', 'wh.wo.min': '{n} мин',
      'wh.disconnect': 'Отключить', 'wh.connect': 'Подключить WHOOP', 'wh.intro': 'Восстановление, сон, нагрузка и тренировки с часов приходят сюда сами — каждую минуту.',
      'wh.needServer': 'На этом устройстве нет сервера — WHOOP работает только на живом сайте', 'wh.pending': 'Получаем первые данные от WHOOP…',
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

  D.whoop = D.whoop || {};

  /* ------------------------------------------------------------------ */
  /* snapshot poller                                                     */
  /* The server pulls WHOOP on its own clock and keeps a normalised      */
  /* snapshot; we ask for it once a minute with an ETag, so a minute in  */
  /* which nothing changed costs one 304 and no work at all. Day keys    */
  /* are assigned here, where the user's timezone and day-start live.   */
  /* ------------------------------------------------------------------ */
  const POLL_MS = 60 * 1000;
  let etag = null, polling = false, pollTimer = null, lastPollAt = 0, pendingTries = 0;

  function merge(days, k, o) {
    if (!k || !o) return;
    const d = (days[k] = days[k] || {});
    Object.assign(d, o);
  }
  function prune(w) {
    const keys = Object.keys(w.days).sort();
    if (keys.length > KEEP_DAYS) for (const k of keys.slice(0, keys.length - KEEP_DAYS)) delete w.days[k];
    w.workouts.sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    if (w.workouts.length > KEEP_WORKOUTS) w.workouts.length = KEEP_WORKOUTS;
  }

  /** Fold a server snapshot into S.whoop. Returns true when anything changed. */
  function applySnapshot(snap) {
    const w = W();
    const before = JSON.stringify([w.days, w.workouts, w.live, w.body, w.profile, w.naps]);
    const days = w.days, naps = {};
    for (const r of snap.recovery || []) {
      const k = dayOfTs(r.ts); if (!k) continue;
      merge(days, k, { recovery: r.recovery, hrv: r.hrv, rhr: r.rhr, spo2: r.spo2, skin: r.skin, calibrating: !!r.calibrating });
    }
    for (const r of snap.sleep || []) {
      const k = dayOfTs(r.end || r.start); if (!k) continue;
      if (r.nap) { const n = (naps[k] = naps[k] || { n: 0, h: 0 }); n.n++; n.h = D.round(n.h + (+r.sleepH || 0), 1); continue; }
      const h1 = (v) => (v == null ? v : D.round(+v, 1));
      merge(days, k, {
        sleepH: h1(r.sleepH), inBedH: h1(r.inBedH), awakeH: h1(r.awakeH), stages: r.stages, cycles: r.cycles, disturbances: r.disturbances,
        sleepNeedH: h1(r.sleepNeedH), needBaseH: h1(r.needBaseH), debtH: h1(r.debtH), sleepPerf: r.sleepPerf, sleepEff: r.sleepEff,
        sleepCons: r.sleepCons, resp: r.resp, bedTs: r.start, wakeTs: r.end,
      });
    }
    let live = null;
    for (const c of snap.cycle || []) {
      const k = c.start ? dayOfTs(new Date(new Date(c.start).getTime() + 12 * 3600e3)) : null; if (!k) continue;
      merge(days, k, { strain: c.strain, kcal: c.kcal, hrAvg: c.hrAvg, hrMax: c.hrMax });
      if (!c.end) live = { k, strain: c.strain, kcal: c.kcal, hrAvg: c.hrAvg, hrMax: c.hrMax, since: c.start, updatedAt: c.updatedAt };
    }
    const byId = new Map();
    for (const x of snap.workout || []) { const k = dayOfTs(x.start); if (k) byId.set(x.id, Object.assign({}, x, { k })); }
    if (byId.size) w.workouts = Array.from(byId.values());
    w.naps = naps;
    w.live = live;
    if (snap.body && typeof snap.body === 'object') w.body = snap.body;
    if (snap.profile && typeof snap.profile === 'object') w.profile = snap.profile;
    w.rl = snap.rl || null;
    w.err = snap.err || null;
    w.fetchedAt = snap.fetchedAt || Date.now();
    w.snapAt = snap.updatedAt || 0;
    w.connected = true;
    w.lastSync = Date.now();
    prune(w);
    const today = D.today();
    w.cache = Object.assign({}, days[today] || days[D.addDays(today, -1)] || {});
    const changed = before !== JSON.stringify([w.days, w.workouts, w.live, w.body, w.profile, w.naps]);
    if (changed) D.whoop.fillSleep();
    return changed;
  }

  // Is it safe to redraw under the user's fingers right now?
  function quiet() {
    if (document.hidden) return false;
    const a = document.activeElement;
    if (a && a.matches && a.matches('input,textarea,select')) return false;
    const bg = D.$('#modalBg'); if (bg && bg.classList.contains('show')) return false;
    return true;
  }
  const LIVE_VIEWS = new Set(['today', 'health', 'gym', 'stats']);

  async function fetchSnapshot() {
    const h = {};
    if (D.tg && D.tg.initData) h['X-Telegram-Init-Data'] = D.tg.initData;
    if (etag) h['If-None-Match'] = etag;
    const r = await fetch('/api/whoop/snapshot', { credentials: 'same-origin', headers: h, cache: 'no-store' });
    if (r.status === 304) return { same: true };
    if (r.status === 401) { const j = await r.json().catch(() => null); if (j && j.passcode && D.auth) { if (await D.auth.ask()) return fetchSnapshot(); } return null; }
    if (!r.ok) return null;
    const j = await r.json();
    etag = r.headers.get('ETag') || etag;
    return j;
  }

  /** One poll. Cheap on purpose: a 304 does nothing, new data morphs only the views that show it. */
  D.whoop.poll = async (opts = {}) => {
    if (polling || !D.serverEnabled()) return false;
    polling = true; lastPollAt = Date.now();
    try {
      const snap = await fetchSnapshot();
      if (!snap) return false;
      if (snap.same) return false;
      const w = W();
      if (snap.connected === false) {
        if (w.connected) { w.connected = false; D.saveQuiet(); if (LIVE_VIEWS.has(D.current()) && quiet()) D.rerender(); }
        return false;
      }
      if (snap.pending) {
        // first pull still running on the server — look again shortly, a few times
        if (pendingTries++ < 6) setTimeout(() => D.whoop.poll(), 6000);
        return false;
      }
      pendingTries = 0;
      const changed = applySnapshot(snap);
      // the server owns this data; persist locally without bumping updatedAt (no push, no 409 churn)
      D.saveQuiet();
      D.emit('whoop:updated', { changed });
      if ((changed || opts.force) && LIVE_VIEWS.has(D.current()) && quiet()) D.rerender();
      return changed;
    } catch (e) {
      return false;
    } finally { polling = false; }
  };

  /** Manual «refresh now»: ask the server to pull immediately, then wait for the snapshot to move. */
  let syncing = false;
  D.whoop.syncing = () => syncing;
  D.whoop.sync = async () => {
    if (syncing) return null;
    if (!D.serverEnabled()) throw new Error('need_server');
    syncing = true;
    try {
      const w = W(), was = w.snapAt || 0, wasFetched = w.fetchedAt || 0;
      await D.api('/api/whoop/refresh', { method: 'POST', body: '{}' });
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        await D.whoop.poll({ force: i === 5 });
        if ((w.snapAt || 0) !== was || (w.fetchedAt || 0) !== wasFetched) break;
      }
      const days = Object.keys(w.days).length;
      return { days, workouts: w.workouts.length, filled: D.whoop.fillSleep() };
    } finally { syncing = false; }
  };
  // kept for older callers
  D.whoop.autoSync = () => { D.whoop.poll(); };

  function schedule() {
    clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (!document.hidden) D.whoop.poll(); }, POLL_MS);
  }

  /* ------------------------------------------------------------------ */
  /* reading                                                             */
  /* ------------------------------------------------------------------ */
  D.whoop.day = (k) => (W().days[k] || null);
  D.whoop.live = () => { const l = W().live; if (!l || !l.since) return null; return Date.now() - new Date(l.since).getTime() < 36 * 3600e3 ? l : null; };
  D.whoop.naps = (k) => ((W().naps || {})[k] || null);
  D.whoop.profile = () => W().profile || null;
  /** How old is what we are showing? {min, label, stale} — stale after 3 minutes. */
  D.whoop.freshness = () => {
    const at = +W().fetchedAt || 0;
    if (!at) return null;
    const min = Math.max(0, Math.round((Date.now() - at) / 60000));
    return { min, stale: min >= 3, label: min < 1 ? t('wh.justNow') : t('wh.minAgo', { n: min }) };
  };
  D.whoop.workoutsOn = (k) => W().workouts.filter((x) => x.k === k);
  D.whoop.workoutDays = (n) => { const set = new Set(); for (const x of W().workouts) if (x.k) set.add(x.k); return D.lastDays(n || 28).filter((k) => set.has(k)); };
  /** Minutes in each of WHOOP's six HR zones (0 = below 50% max) for one workout. */
  D.whoop.zoneMins = (x) => (x && Array.isArray(x.zones) ? x.zones.map((ms) => Math.round((+ms || 0) / 60000)) : null);
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
  /* Health surfaces                                                     */
  /* The hero is the one bold thing: a body state, read at a glance.     */
  /* Everything after it is quiet and proportional — bars that are the   */
  /* data, not decoration.                                               */
  /* ------------------------------------------------------------------ */
  const ZONE_C = ['var(--text4)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--accent)', 'var(--danger-text)'];
  const STAGE_C = { deep: 'var(--violet)', rem: 'var(--info)', light: 'var(--success)', awake: 'var(--line3)' };
  const zRec = (v) => (v >= 67 ? 'good' : v >= 34 ? 'warn' : 'bad');
  const recColor = (z) => (z === 'good' ? 'var(--success)' : z === 'warn' ? 'var(--warning)' : 'var(--danger-text)');
  const hm = (iso) => { if (!iso) return ''; const p = D.nowTz(new Date(iso)); return D.fmtTime(p.h, p.min); };
  const fmtH = (h) => (h == null ? '—' : `${D.round(h, 1)}<small>${esc(t('unit.h'))}</small>`);
  const fmtMs = (ms) => { const m = Math.round((+ms || 0) / 60000); return m >= 60 ? `${Math.floor(m / 60)}${t('unit.h')} ${D.pad2(m % 60)}${t('unit.m')}` : `${m}${t('unit.m')}`; };
  const strip = (h) => h.replace(/^<p>/, '').replace(/<\/p>$/, '');
  const md = (txt) => (D.ai ? strip(D.ai.md(txt)) : esc(txt));

  /** Freshness line: a breathing dot while the reading is under 3 minutes old. */
  function freshHtml() {
    const f = D.whoop.freshness();
    if (!f) return '';
    return `<span class="wh-fresh ${f.stale ? 'stale' : 'live'}"><i></i>${esc(f.label)}</span>`;
  }
  /** A horizontal gauge: value against a target marker, colour by load. */
  function gauge(val, target, max, color) {
    const p = D.clamp((val / max) * 100, 0, 100), tp = D.clamp((target / max) * 100, 0, 100);
    return `<div class="wh-gauge"><i class="wh-gauge-fill" style="width:${p.toFixed(1)}%;background:${color}"></i><b class="wh-gauge-target" style="left:${tp.toFixed(1)}%"></b></div>`;
  }

  D.whoop.hero = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const i = D.whoop.dayInsight(key) || { key };
    const live = key === D.today() ? D.whoop.live() : null;
    const strain = live ? live.strain : i.strain, kcal = live ? live.kcal : i.kcal;
    const hasRec = i.recovery != null;
    const z = hasRec ? zRec(i.recovery) : '';
    const ring = D.chart.ring({ pct: hasRec ? i.recovery : 0, size: 112, stroke: 10, color: hasRec ? recColor(z) : 'var(--line3)', label: hasRec ? i.recovery + '%' : '—', sub: t('wh.recovery') });
    const verdict = hasRec ? t(z === 'good' ? 'wh.ready.high' : z === 'warn' ? 'wh.ready.mid' : 'wh.ready.low') : t('hl.wh.noData');
    const sub = i.recDelta !== undefined ? md(t('wh.i.vsBase', { n: (i.recDelta > 0 ? '+' : '') + i.recDelta, b: i.recBase })) : (w.days[key] && w.days[key].calibrating ? esc(t('wh.calibrating')) : '');
    const target = i.strainTarget || null;
    const load = strain != null && target ? (strain - target > 3 ? 'over' : strain - target < -4 ? 'under' : 'ok') : '';
    const gColor = load === 'over' ? 'var(--danger-text)' : load === 'ok' ? 'var(--success)' : 'var(--sec, var(--success))';
    const strainRow = strain != null ? `<div class="wh-strain ${live ? 'live' : ''}">
        <div class="wh-strain-head"><span class="wh-strain-lab">${esc(t('wh.strainLive'))}${live ? `<em>${esc(t('wh.live'))}</em>` : ''}</span><span class="wh-strain-val num">${strain}</span></div>
        ${gauge(strain, target || 21, 21, gColor)}
        <div class="wh-strain-foot">${target ? `<span>${esc(t('wh.st.target', { m: target }))}</span>` : ''}${kcal != null ? `<span>${esc(t('wh.st.kcal', { k: D.fmtNum(kcal) }))}</span>` : ''}${live && live.hrAvg ? `<span>${esc(t('wh.hr'))} <b class="num">${live.hrAvg}</b>${live.hrMax ? `, ${esc(t('wh.hrMaxShort'))} <b class="num">${live.hrMax}</b>` : ''}</span>` : ''}</div>
      </div>` : `<div class="wh-strain"><div class="small muted">${esc(t('wh.st.none'))}</div></div>`;
    const tile = (v, l, zone, sub) => `<div class="bento-tile">${zone ? `<i class="zone z-${zone}"></i>` : ''}<div class="val">${v}</div><div class="lab">${esc(l)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
    const tiles = `<div class="bento wh-day-grid">
        ${tile(fmtH(i.sleepH), t('wh.sleepH'), i.metPct == null ? '' : i.metPct >= 90 ? 'good' : i.metPct >= 75 ? 'warn' : 'bad', i.needH ? t('wh.i.need', { h: i.needH }) : '')}
        ${tile(i.hrv != null ? `${i.hrv}<small>ms</small>` : '—', t('wh.hrv'), i.hrvPct === undefined ? '' : i.hrvPct >= -5 ? 'good' : i.hrvPct >= -15 ? 'warn' : 'bad', i.hrvBase ? t('wh.i.base', { b: i.hrvBase }) : '')}
        ${tile(i.rhr != null ? `${i.rhr}<small>bpm</small>` : '—', t('wh.rhr'), i.rhrDelta === undefined ? '' : i.rhrDelta <= 1 ? 'good' : i.rhrDelta <= 4 ? 'warn' : 'bad', i.rhrBase ? t('wh.i.base', { b: i.rhrBase }) : '')}
        ${tile(i.spo2 != null ? `${D.round(i.spo2, 1)}<small>%</small>` : i.resp != null ? `${D.round(i.resp, 1)}` : '—', i.spo2 != null ? 'SpO₂' : t('hl.wh.resp'), i.spo2 != null ? (i.spo2 >= 95 ? 'good' : i.spo2 >= 92 ? 'warn' : 'bad') : '', i.skin != null ? `${D.round(i.skin, 1)} °C` : '')}
      </div>`;
    const rows = [];
    if (i.gapH !== null && i.gapH !== undefined) { const good = i.gapH >= -0.5; rows.push({ good, txt: t(good ? 'wh.i.sleepOk' : 'wh.i.sleepShort', { h: Math.abs(i.gapH), need: i.needH }) }); }
    if (i.hrvPct !== undefined && Math.abs(i.hrvPct) >= 8) rows.push({ good: i.hrvPct > 0, txt: t(i.hrvPct > 0 ? 'wh.i.hrvUp' : 'wh.i.hrvDown', { p: Math.abs(i.hrvPct), b: i.hrvBase }) });
    if (i.rhrDelta !== undefined && Math.abs(i.rhrDelta) >= 3) rows.push({ good: i.rhrDelta < 0, txt: t(i.rhrDelta > 0 ? 'wh.i.rhrUp' : 'wh.i.rhrDown', { n: Math.abs(i.rhrDelta), b: i.rhrBase }) });
    if (load === 'over') rows.push({ good: false, txt: t('wh.i.over', { s: strain, m: target }) });
    else if (load === 'under' && target) rows.push({ good: true, txt: t('wh.i.room', { m: target }) });
    const notes = rows.length ? `<div class="wh-notes">${rows.map((r) => `<div class="wh-note ${r.good ? 'good' : 'warn'}">${D.ic(r.good ? 'check' : 'alert', 14)}<span>${md(r.txt)}</span></div>`).join('')}</div>` : '';
    const err = w.err ? `<div class="wh-err">${D.ic('alert', 13)} ${esc(t('wh.err.' + w.err, { e: w.err }) === 'wh.err.' + w.err ? t('wh.err.http', { e: w.err }) : t('wh.err.' + w.err, { e: w.err }))}</div>` : '';
    return `<div class="hero wh-hero">
      <div class="wh-hero-top"><span class="wh-brand">${D.ic('bolt', 12)} WHOOP${key !== D.today() ? ` <span class="num">${esc(D.fmtDate(key, 'dm'))}</span>` : ''}</span>${key === D.today() ? freshHtml() : ''}</div>
      <div class="hero-main wh-hero-main">${ring}<div class="hero-body"><div class="hero-title">${esc(verdict)}</div>${sub ? `<div class="hero-sub">${sub}</div>` : ''}</div></div>
      ${strainRow}${tiles}${notes}${err}
    </div>`;
  };
  D.whoop.dayCard = D.whoop.hero;   // older name

  /** Proportional stage bar with the minutes hanging under each segment. */
  function stagesHtml(st) {
    if (!st) return '';
    const tot = (+st.deep || 0) + (+st.rem || 0) + (+st.light || 0) + (+st.awake || 0);
    if (!tot) return '';
    const order = ['deep', 'rem', 'light', 'awake'];
    const bar = order.map((k) => `<i style="width:${(((+st[k] || 0) / tot) * 100).toFixed(1)}%;background:${STAGE_C[k]}"></i>`).join('');
    const legs = order.map((k) => `<span class="wh-stg"><i style="background:${STAGE_C[k]}"></i><b class="num">${fmtMs(st[k])}</b>${esc(t(k === 'awake' ? 'wh.sl.awake' : 'wh.sl.' + k))}</span>`).join('');
    return `<div class="wh-stages">${bar}</div><div class="wh-stg-row">${legs}</div>`;
  }

  D.whoop.sleepPage = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const d = w.days[key] || {};
    const i = D.whoop.dayInsight(key) || {};
    if (d.sleepH == null) return `<div class="card"><div class="empty">${esc(t('wh.sl.none'))}</div></div>` + D.whoop.trendCard();
    const metPct = i.metPct != null ? i.metPct : null;
    const z = metPct == null ? '' : metPct >= 90 ? 'good' : metPct >= 75 ? 'warn' : 'bad';
    const head = `<div class="card wh-sl">
      <div class="wh-sl-top">
        <div><div class="wh-sl-big num">${D.round(d.sleepH, 1)}<small>${esc(t('unit.h'))}</small></div><div class="small muted">${esc(t('wh.sl.got'))}${d.sleepNeedH ? `, ${esc(t('wh.sl.need'))} <b class="num">${D.round(d.sleepNeedH, 1)}</b>` : ''}</div></div>
        ${d.bedTs && d.wakeTs ? `<div class="wh-sl-when num">${hm(d.bedTs)} <span>→</span> ${hm(d.wakeTs)}</div>` : ''}
      </div>
      ${metPct != null ? `<span class="bar thick mt-s"><i class="bar-fill" style="width:${D.clamp(metPct, 0, 100)}%;background:${recColor(z)}"></i></span>` : ''}
      <div class="wh-sl-meta">${d.inBedH != null ? `<span>${esc(t('wh.sl.inBed'))} <b class="num">${D.round(d.inBedH, 1)}${esc(t('unit.h'))}</b></span>` : ''}${d.awakeH != null ? `<span>${esc(t('wh.sl.awake'))} <b class="num">${fmtMs(d.stages && d.stages.awake != null ? d.stages.awake : d.awakeH * 3.6e6)}</b></span>` : ''}${d.cycles != null ? `<span>${esc(t('wh.sl.cycles', { n: d.cycles }))}</span>` : ''}${d.disturbances != null ? `<span>${esc(t('wh.sl.dist', { n: d.disturbances }))}</span>` : ''}</div>
      ${d.stages ? `<div class="mt">${stagesHtml(d.stages)}</div>` : ''}
    </div>`;
    const ringRow = (d.sleepPerf != null || d.sleepEff != null || d.sleepCons != null) ? `<div class="card"><div class="wh-rings">
        ${d.sleepPerf != null ? `<div class="wh-ring">${D.chart.ring({ pct: d.sleepPerf, size: 84, stroke: 7, color: recColor(d.sleepPerf >= 85 ? 'good' : d.sleepPerf >= 70 ? 'warn' : 'bad'), glow: false })}<span>${esc(t('wh.sl.perf'))}</span></div>` : ''}
        ${d.sleepEff != null ? `<div class="wh-ring">${D.chart.ring({ pct: d.sleepEff, size: 84, stroke: 7, color: 'var(--info)', glow: false })}<span>${esc(t('wh.sl.eff'))}</span></div>` : ''}
        ${d.sleepCons != null ? `<div class="wh-ring">${D.chart.ring({ pct: d.sleepCons, size: 84, stroke: 7, color: 'var(--violet)', glow: false })}<span>${esc(t('wh.sl.cons'))}</span></div>` : ''}
      </div><div class="help mt-s">${esc(d.sleepCons != null && d.sleepCons < 60 ? t('wh.sl.consHint') : t('wh.sl.effHint'))}</div></div>` : '';
    // 14 nights: what you got, with what you needed as the target line
    const days = D.lastDays(14, key);
    const got = days.map((k) => num(w.days[k] && w.days[k].sleepH) || 0);
    const needs = days.map((k) => num(w.days[k] && w.days[k].sleepNeedH)).filter((v) => v !== null);
    const need = needs.length ? D.round(D.avg(needs), 1) : null;
    const colors = days.map((k) => { const x = w.days[k] || {}; if (x.sleepH == null) return 'var(--line)'; const p = x.sleepNeedH ? (x.sleepH / x.sleepNeedH) * 100 : null; return p == null ? 'var(--info)' : recColor(p >= 90 ? 'good' : p >= 75 ? 'warn' : 'bad'); });
    const axis = `<div class="ib-mx-axis wh-axis"><span>${esc(D.fmtDate(days[0], 'dm'))}</span><span>${esc(D.fmtDate(days[13], 'dm'))}</span></div>`;
    const debt = D.whoop.sleepDebt(7);
    const naps = D.whoop.naps(key);
    const hist = `<div class="card"><div class="card-head"><div class="title">${D.ic('moon', 16)} ${esc(t('wh.sl.14'))}</div>${debt ? `<span class="pill ${debt.h >= 3 ? 'bad' : debt.h >= 1 ? '' : 'good'}">${esc(t('wh.sl.debt7'))}: <b class="num">${debt.h}${esc(t('unit.h'))}</b></span>` : ''}</div>
      ${D.chart.bars({ values: got, colors, height: 72, target: need, max: Math.max(10, ...got, need || 0) })}${axis}
      <div class="help mt-s">${need ? esc(t('wh.sl.needLine')) : ''}${naps ? `${need ? ' · ' : ''}${esc(t('wh.sl.naps', { n: naps.n, h: naps.h }))}` : ''}</div>
    </div>`;
    return head + ringRow + hist;
  };

  /** Today's workouts with their HR-zone bars; used by Health (strain) and Sport. */
  D.whoop.workoutRows = (key, opts = {}) => {
    const list = D.whoop.workoutsOn(key || D.today());
    if (!list.length) return opts.empty === false ? '' : `<div class="empty">${esc(t('wh.wo.none'))}</div>`;
    return `<div class="wh-wos">${list.map((x) => {
      const zm = D.whoop.zoneMins(x);
      const tot = zm ? D.sum(zm) : 0;
      const zones = zm && tot ? `<div class="wh-zones">${zm.map((m, i) => (m ? `<i style="width:${((m / tot) * 100).toFixed(1)}%;background:${ZONE_C[i]}" title="${esc(t('wh.z.' + i))}: ${m} ${esc(t('unit.m'))}"></i>` : '')).join('')}</div>
        <div class="wh-zone-row">${zm.map((m, i) => (m ? `<span><i style="background:${ZONE_C[i]}"></i>${esc(t('wh.z.' + i))} <b class="num">${m}</b></span>` : '')).join('')}</div>` : '';
      const bits = [];
      if (x.mins) bits.push(t('wh.wo.min', { n: x.mins }));
      if (x.hrAvg) bits.push(`${t('wh.hr')} ${x.hrAvg}${x.hrMax ? `–${x.hrMax}` : ''}`);
      if (x.kcal) bits.push(`${D.fmtNum(x.kcal)} ${t('wh.kcal')}`);
      if (x.meters) bits.push(`${D.round(x.meters / 1000, 2)} km`);
      return `<div class="wh-wo"><div class="wh-wo-head"><span class="wh-wo-ic">${D.ic('dumbbell', 15)}</span><div class="grow"><div class="wh-wo-name">${esc(x.sport || t('wh.sport'))}<span class="num muted"> ${hm(x.start)}</span></div><div class="small muted">${esc(bits.join(', '))}</div></div>${x.strain != null ? `<span class="wh-wo-strain num">${x.strain}</span>` : ''}</div>${zones}</div>`;
    }).join('')}</div>`;
  };

  D.whoop.strainPage = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const i = D.whoop.dayInsight(key) || {};
    const live = key === D.today() ? D.whoop.live() : null;
    const strain = live ? live.strain : i.strain, kcal = live ? live.kcal : i.kcal;
    const target = i.strainTarget || null;
    const load = strain != null && target ? (strain - target > 3 ? 'over' : strain - target < -4 ? 'under' : 'ok') : '';
    const gColor = load === 'over' ? 'var(--danger-text)' : load === 'ok' ? 'var(--success)' : 'var(--sec, var(--success))';
    const tdee = D.whoop.tdee();
    const top = strain == null ? `<div class="card"><div class="empty">${esc(t('wh.st.none'))}</div></div>` : `<div class="card wh-st">
      <div class="wh-sl-top"><div><div class="wh-sl-big num">${strain}</div><div class="small muted">${esc(t('wh.st.today'))}${live ? ` · <span class="wh-live-tag">${esc(t('wh.live'))}</span>` : ''}</div></div>
        ${live && live.since ? `<div class="wh-sl-when num">${esc(t('wh.sinceStart', { t: hm(live.since) }))}</div>` : ''}</div>
      <div class="mt-s">${gauge(strain, target || 21, 21, gColor)}</div>
      <div class="wh-sl-meta">${target ? `<span>${esc(t('wh.st.target', { m: target }))}</span>` : ''}${target && load === 'under' ? `<span class="good">${esc(t('wh.st.room', { n: target }))}</span>` : ''}${target && load === 'over' ? `<span class="bad">${esc(t('wh.st.over', { n: D.round(strain - target, 1) }))}</span>` : ''}</div>
      <div class="wh-sl-meta">${kcal != null ? `<span>${esc(t('wh.st.kcal', { k: D.fmtNum(kcal) }))}</span>` : ''}${tdee ? `<span>${esc(t('wh.st.tdee', { t: D.fmtNum(tdee) }))}</span>` : ''}${(live || {}).hrAvg || i.hrAvg ? `<span>${esc(t('wh.hr'))} <b class="num">${(live || {}).hrAvg || i.hrAvg}</b>${(live || {}).hrMax || i.hrMax ? `, ${esc(t('wh.hrMaxShort'))} <b class="num">${(live || {}).hrMax || i.hrMax}</b>` : ''}</span>` : ''}</div>
    </div>`;
    const wos = `<div class="card"><div class="card-head"><div class="title">${D.ic('dumbbell', 16)} ${esc(t('wh.wo.today'))}</div></div>${D.whoop.workoutRows(key)}</div>`;
    // 14 days of strain, each bar coloured by that day's recovery
    const days = D.lastDays(14, key);
    const vals = days.map((k) => num(w.days[k] && w.days[k].strain) || 0);
    const colors = days.map((k) => { const r = num(w.days[k] && w.days[k].recovery); return r == null ? 'var(--info)' : recColor(zRec(r)); });
    const axis = `<div class="ib-mx-axis wh-axis"><span>${esc(D.fmtDate(days[0], 'dm'))}</span><span>${esc(D.fmtDate(days[13], 'dm'))}</span></div>`;
    const hist = `<div class="card"><div class="card-head"><div class="title">${D.ic('bolt', 16)} ${esc(t('wh.st.14'))}</div></div>
      ${D.chart.bars({ values: vals, colors, height: 72, target: target, max: 21 })}${axis}<div class="help mt-s">${esc(t('wh.st.legend'))}</div></div>`;
    return top + wos + hist + D.whoop.trendCard();
  };

  /** Connection card: who is connected, how fresh, refresh, disconnect — or the invitation to connect. */
  D.whoop.footer = () => {
    const w = W();
    if (!w.connected) {
      return `<div class="card wh-intro"><div class="wh-intro-logo">${D.ic('bolt', 26)}</div><div class="title">WHOOP</div><p class="help">${esc(t('wh.intro'))}</p>
        ${D.serverEnabled() ? '' : `<div class="banner">${D.ic('info', 16)}<span>${esc(t('wh.needServer'))}</span></div>`}
        <div class="row wrap"><button class="btn" data-act="hlWhoopConnect">${D.ic('link', 16)} ${esc(t('wh.connect'))}</button><button class="btn ghost" data-act="hlWhoopCheck">${D.ic('refresh', 16)} ${esc(t('hl.wh.check'))}</button></div></div>`;
    }
    const p = w.profile || {};
    const name = [p.first, p.last].filter(Boolean).join(' ') || 'WHOOP';
    const f = D.whoop.freshness();
    return `<div class="card flat wh-foot"><div class="row between wrap">
      <div class="grow"><div class="small"><b>${esc(t('wh.connectedAs', { name }))}</b></div><div class="tiny muted">${f ? esc(t('wh.updated', { t: f.label })) : esc(t('wh.pending'))}${w.rl && w.rl.remaining != null ? ` · ${w.rl.remaining}/${w.rl.limit}` : ''}</div></div>
      <div class="row"><button class="btn ghost sm" data-act="hlWhoopRefresh" id="hlWhRefresh" ${syncing ? 'disabled' : ''}>${D.ic('refresh', 14)} ${esc(t('wh.refreshNow'))}</button><button class="btn icon" data-act="hlWhoopDisconnect" aria-label="${esc(t('wh.disconnect'))}" title="${esc(t('wh.disconnect'))}">${D.ic('logout', 16)}</button></div>
    </div></div>`;
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

  /* boot · every minute · when the app comes back to the foreground · day rollover */
  D.on('boot', () => { setTimeout(() => D.whoop.poll(), 1500); schedule(); });
  D.on('day:changed', () => D.whoop.poll({ force: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastPollAt > 15000) D.whoop.poll(); });
  window.addEventListener('focus', () => { if (Date.now() - lastPollAt > 15000) D.whoop.poll(); });
})();
