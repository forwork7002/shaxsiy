/* =====================================================================
   Dash — stats.js · Стат: long-view analytics over the whole history
   view id 'stats' · sub-tabs habits | spheres | notes | review | insights
   class prefix st- · one memoised index per (updatedAt, today)
   ===================================================================== */
(function () {
  'use strict';

  const esc = D.esc;
  const t = (k, p) => D.t(k, p);

  /* ------------------------------------------------------------------ */
  /* i18n — compact [uz, uzk, ru] table expanded into three tables       */
  /* ------------------------------------------------------------------ */
  const T = {
    'st.sub.habits': ['Odatlar', 'Одатлар', 'Привычки'],
    'st.sub.spheres': ['Sohalar', 'Соҳалар', 'Сферы'],
    'st.sub.notes': ['Yozuvlar', 'Ёзувлар', 'Записи'],
    'st.sub.review': ['Tahlil', 'Таҳлил', 'Обзор'],
    'st.sub.insights': ['Insayt', 'Инсайт', 'Инсайты'],

    'st.h.days': ['Kuzatilgan kun', 'Кузатилган кун', 'Дней отслежено'],
    'st.h.ticks': ['Jami belgi', 'Жами белги', 'Всего отметок'],
    'st.h.avg30': ["30 kun o'rtacha", '30 кун ўртача', 'Среднее за 30 дн.'],
    'st.h.active': ['Faol odat', 'Фаол одат', 'Активных привычек'],
    'st.h.best': ['Eng yaxshi kun', 'Энг яхши кун', 'Лучший день'],
    'st.h.bestSub': ['{n} belgi', '{n} белги', 'Отметок: {n}'],
    'st.h.year': ['Yil xaritasi', 'Йил харитаси', 'Карта года'],
    'st.h.yearSub': ['Oxirgi 53 hafta · kunlik bajarilish', 'Охирги 53 ҳафта · кунлик бажарилиш', 'Последние 53 недели · выполнение за день'],
    'st.h.less': ['Kam', 'Кам', 'Меньше'],
    'st.h.more': ["Ko'p", 'Кўп', 'Больше'],
    'st.h.strip30': ['Oxirgi 30 kun', 'Охирги 30 кун', 'Последние 30 дней'],
    'st.h.weekday': ['Hafta kunlari', 'Ҳафта кунлари', 'Дни недели'],
    'st.h.weekdaySub': ["90 kun · o'rtacha bajarilish", '90 кун · ўртача бажарилиш', '90 дней · среднее выполнение'],
    'st.h.rolling': ["7 kunlik o'rtacha", '7 кунлик ўртача', 'Среднее за 7 дн.'],
    'st.h.rollingSub': ['Oxirgi 90 kun', 'Охирги 90 кун', 'Последние 90 дней'],
    'st.h.rank': ['Odatlar reytingi', 'Одатлар рейтинги', 'Рейтинг привычек'],
    'st.h.rankSub': ["30 kunlik barqarorlik bo'yicha", '30 кунлик барқарорлик бўйича', 'По стабильности за 30 дней'],
    'st.h.all': ['jami', 'жами', 'всего'],
    'st.h.streak': ['seriya', 'серия', 'серия'],
    'st.h.record': ['rekord', 'рекорд', 'рекорд'],
    'st.h.c30': ['30 kun', '30 кун', '30 дн.'],
    'st.h.c90': ['90 kun', '90 кун', '90 дн.'],
    'st.h.empty': ["Faol odat yo'q — Bugun bo'limida qo'shing", 'Фаол одат йўқ — Бугун бўлимида қўшинг', 'Нет активных привычек — добавьте в разделе Сегодня'],
    'st.h.mAll': ['Jami', 'Жами', 'Всего'],
    'st.h.mStreak': ['Seriya', 'Серия', 'Серия'],
    'st.h.mBest': ['Rekord', 'Рекорд', 'Рекорд'],
    'st.h.since': ['{d}dan beri', '{d}дан бери', 'с {d}'],
    'st.h.lowDay': ['Eng past kun', 'Энг паст кун', 'Самый слабый день'],
    'st.h.total': ['jami {n} ta', 'жами {n} та', 'всего {n}'],

    'st.s.title': ['Sohalar · 12 hafta', 'Соҳалар · 12 ҳафта', 'Сферы · 12 недель'],
    'st.s.sub': ['Har hafta: bajarilgan / rejalashtirilgan', 'Ҳар ҳафта: бажарилган / режалаштирилган', 'Каждую неделю: выполнено / запланировано'],
    'st.s.thisWeek': ['bu hafta', 'бу ҳафта', 'эта неделя'],
    'st.s.balance': ['Muvozanat indeksi', 'Мувозанат индекси', 'Индекс баланса'],
    'st.s.balanceSub': ["4 asosiy soha bo'yicha", '4 асосий соҳа бўйича', 'По 4 основным сферам'],
    'st.s.history': ['12 haftalik tarix', '12 ҳафталик тарих', 'История за 12 недель'],
    'st.s.formula': ["μ — Ruh · Aql · Qalb · Tana haftalik ko'rsatkichlari o'rtachasi, σ — ularning standart og'ishi. Muvozanat = 1 − σ/μ (0–100). 100 = to'rt sohaga teng e'tibor.",
      'μ — Руҳ · Ақл · Қалб · Тана ҳафталик кўрсаткичлари ўртачаси, σ — уларнинг стандарт оғиши. Мувозанат = 1 − σ/μ (0–100). 100 = тўрт соҳага тенг эътибор.',
      'μ — среднее недельных показателей Дух · Разум · Сердце · Тело, σ — их стандартное отклонение. Баланс = 1 − σ/μ (0–100). 100 = равное внимание четырём сферам.'],
    'st.s.zoneGood': ['Muvozanatli', 'Мувозанатли', 'Сбалансировано'],
    'st.s.zoneWarn': ["O'rtacha", 'Ўртача', 'Средне'],
    'st.s.zoneBad': ['Nomutanosib', 'Номутаносиб', 'Дисбаланс'],
    'st.s.nudge': ["{s} {p} — bu hafta eng past soha. Unga bitta kichik odat qo'shing.", '{s} {p} — бу ҳафта энг паст соҳа. Унга битта кичик одат қўшинг.', '{s} {p} — самая слабая сфера на этой неделе. Добавьте в неё одну небольшую привычку.'],
    'st.s.nudgeOk': ['Sohalar muvozanatda — shu tarzda davom eting', 'Соҳалар мувозанатда — шу тарзда давом этинг', 'Сферы в балансе — продолжайте в том же духе'],
    'st.s.empty': ['Soha statistikasi uchun faol odatlar kerak', 'Соҳа статистикаси учун фаол одатлар керак', 'Для статистики сфер нужны активные привычки'],
    'st.s.week': ['H{n}', 'Ҳ{n}', 'Н{n}'],

    'st.n.search': ['Yozuvlardan qidirish…', 'Ёзувлардан қидириш…', 'Поиск по записям…'],
    'st.n.count': ['{n} ta yozuv', '{n} та ёзув', 'Записей: {n}'],
    'st.n.words': ["{n} so'z", '{n} сўз', 'Слов: {n}'],
    'st.n.more': ['Yana {n} ta', 'Яна {n} та', 'Ещё {n}'],
    'st.n.empty': ["Yozuvlar yo'q — Bugun bo'limida kun izohini yozing", 'Ёзувлар йўқ — Бугун бўлимида кун изоҳини ёзинг', 'Записей нет — пишите заметку дня в разделе Сегодня'],
    'st.n.noMatch': ['Topilmadi', 'Топилмади', 'Ничего не найдено'],
    'st.n.today': ['Bugungi yozuv', 'Бугунги ёзув', 'Запись за сегодня'],
    'st.n.ph': ["Bugun nima bo'ldi?…", 'Бугун нима бўлди?…', 'Что было сегодня?…'],
    'st.n.saved': ['Yozuv saqlandi', 'Ёзув сақланди', 'Запись сохранена'],
    'st.n.deleted': ["Yozuv o'chirildi", 'Ёзув ўчирилди', 'Запись удалена'],
    'st.n.otd': ['Shu kunda', 'Шу кунда', 'В этот день'],
    'st.n.otdSub': ["O'tgan yillar · 30 / 90 / 180 kun oldin", 'Ўтган йиллар · 30 / 90 / 180 кун олдин', 'Прошлые годы · 30 / 90 / 180 дней назад'],
    'st.n.otdEmpty': ["Bu sana uchun eski yozuv yo'q", 'Бу сана учун эски ёзув йўқ', 'Старых записей на эту дату нет'],
    'st.n.yearsAgo': ['{n} yil oldin', '{n} йил олдин', '{n} г. назад'],
    'st.n.daysAgo': ['{n} kun oldin', '{n} кун олдин', '{n} дн. назад'],
    'st.n.notes': ['Kun yozuvlari', 'Кун ёзувлари', 'Записей дня'],
    'st.n.grat': ['Shukr yozuvlari', 'Шукр ёзувлари', 'Благодарностей'],
    'st.n.gratStreak': ['Shukr seriyasi', 'Шукр серияси', 'Серия благодарности'],
    'st.n.gratTag': ['shukr', 'шукр', 'шукр'],

    'st.r.title': ['Haftalik tahlil', 'Ҳафталик таҳлил', 'Недельный обзор'],
    'st.r.banner': ['Hafta yakunlanmoqda — 3 ta savolga javob bering', 'Ҳафта якунланмоқда — 3 та саволга жавоб беринг', 'Неделя заканчивается — ответьте на 3 вопроса'],
    'st.r.auto': ['Avto-hisobot', 'Авто-ҳисобот', 'Авто-отчёт'],
    'st.r.habits': ['Odatlar', 'Одатлар', 'Привычки'],
    'st.r.tasks': ['Vazifalar', 'Вазифалар', 'Задачи'],
    'st.r.tasksSub': ['bajarildi / yangi', 'бажарилди / янги', 'сделано / новых'],
    'st.r.income': ['Kirim', 'Кирим', 'Доход'],
    'st.r.expense': ['Chiqim', 'Чиқим', 'Расход'],
    'st.r.net': ['Sof', 'Соф', 'Итого'],
    'st.r.weight': ['Vazn Δ', 'Вазн Δ', 'Вес Δ'],
    'st.r.sleep': ["Uyqu o'rt.", 'Уйқу ўрт.', 'Сон ср.'],
    'st.r.mood': ["Kayfiyat o'rt.", 'Кайфият ўрт.', 'Настроение ср.'],
    'st.r.spheres': ['Sohalar', 'Соҳалар', 'Сферы'],
    'st.r.wins': ['Yutuqlar', 'Ютуқлар', 'Победы'],
    'st.r.winsPh': ["Bu hafta nima yaxshi bo'ldi?", 'Бу ҳафта нима яхши бўлди?', 'Что получилось на этой неделе?'],
    'st.r.lessons': ['Saboqlar', 'Сабоқлар', 'Уроки'],
    'st.r.lessonsPh': ['Nimani boshqacha qilardim?', 'Нимани бошқача қилардим?', 'Что бы я сделал иначе?'],
    'st.r.focus': ['Keyingi hafta fokusi', 'Кейинги ҳафта фокуси', 'Фокус следующей недели'],
    'st.r.focusPh': ['Eng muhim 1–3 narsa', 'Энг муҳим 1–3 нарса', 'Самое важное: 1–3 пункта'],
    'st.r.past': ['Oldingi tahlillar', 'Олдинги таҳлиллар', 'Прошлые обзоры'],
    'st.r.pastEmpty': ["Hali tahlil yo'q — birinchisini shu hafta yozing", 'Ҳали таҳлил йўқ — биринчисини шу ҳафта ёзинг', 'Обзоров пока нет — напишите первый на этой неделе'],
    'st.r.filled': ['{n}/3 javob', '{n}/3 жавоб', '{n}/3 ответа'],
    'st.r.deleted': ["Tahlil o'chirildi", 'Таҳлил ўчирилди', 'Обзор удалён'],
    'st.r.hint': ['Yozganingiz avtomatik saqlanadi', 'Ёзганингиз автоматик сақланади', 'Текст сохраняется автоматически'],

    'st.i.title': ["Bog'liqliklar", 'Боғлиқликлар', 'Связи'],
    'st.i.sub': ['Oxirgi 90 kun · Pearson r · n ≥ 20 · |r| ≥ 0.3', 'Охирги 90 кун · Pearson r · n ≥ 20 · |r| ≥ 0.3', 'Последние 90 дней · Pearson r · n ≥ 20 · |r| ≥ 0.3'],
    'st.i.moodUp': ["{h} kunlaridan keyin kayfiyat o'rtacha +{d} yuqori", '{h} кунларидан кейин кайфият ўртача +{d} юқори', 'После дней с «{h}» настроение в среднем выше на {d}'],
    'st.i.moodDown': ["{h} kunlaridan keyin kayfiyat o'rtacha −{d} past", '{h} кунларидан кейин кайфият ўртача −{d} паст', 'После дней с «{h}» настроение в среднем ниже на {d}'],
    'st.i.sleepUp': ["{h} kunlari uyqu o'rtacha +{d} soat ko'proq", '{h} кунлари уйқу ўртача +{d} соат кўпроқ', 'В дни с «{h}» сон в среднем дольше на {d} ч'],
    'st.i.sleepDown': ["{h} kunlari uyqu o'rtacha −{d} soat kamroq", '{h} кунлари уйқу ўртача −{d} соат камроқ', 'В дни с «{h}» сон в среднем короче на {d} ч'],
    'st.i.stat': ['n={n}, r={r}', 'n={n}, r={r}', 'n={n}, r={r}'],
    'st.i.mood': ['kayfiyat', 'кайфият', 'настроение'],
    'st.i.sleep': ['uyqu', 'уйқу', 'сон'],
    'st.i.none': ["Kuchli bog'liqlik topilmadi (|r| < 0.3) — bu ham natija", 'Кучли боғлиқлик топилмади (|r| < 0.3) — бу ҳам натижа', 'Сильных связей не найдено (|r| < 0.3) — это тоже результат'],
    'st.i.need': ["Ma'lumot hali yetarli emas: kayfiyat va uyquni kamida 20 kun qayd eting (hozir {n}). Sog'liq → Kun bo'limida.", 'Маълумот ҳали етарли эмас: кайфият ва уйқуни камида 20 кун қайд этинг (ҳозир {n}). Соғлиқ → Кун бўлимида.', 'Данных пока мало: отмечайте настроение и сон минимум 20 дней (сейчас {n}). Раздел Здоровье → День.'],
    'st.i.assoc': ["Bu — bog'liqlik, sabab emas", 'Бу — боғлиқлик, сабаб эмас', 'Это связь, а не причина'],
    'st.i.mood30': ['Kayfiyat · 30 kun', 'Кайфият · 30 кун', 'Настроение · 30 дней'],
    'st.i.sleep30': ['Uyqu · 30 kun', 'Уйқу · 30 кун', 'Сон · 30 дней'],
    'st.i.avg': ["o'rtacha {v}", 'ўртача {v}', 'в среднем {v}'],
    'st.i.days': ['{n} kun', '{n} кун', '{n} дн.'],
    'st.i.ws': ['Vazn va uyqu', 'Вазн ва уйқу', 'Вес и сон'],
    'st.i.wsPos': ["90 kunda uyqu ko'proq bo'lgan kunlarda vazn yuqoriroq (r={r}, n={n})", '90 кунда уйқу кўпроқ бўлган кунларда вазн юқорироқ (r={r}, n={n})', 'За 90 дней в дни с более долгим сном вес выше (r={r}, n={n})'],
    'st.i.wsNeg': ["90 kunda uyqu ko'proq bo'lgan kunlarda vazn pastroq (r={r}, n={n})", '90 кунда уйқу кўпроқ бўлган кунларда вазн пастроқ (r={r}, n={n})', 'За 90 дней в дни с более долгим сном вес ниже (r={r}, n={n})'],
    'st.i.wsNone': ["90 kunda vazn va uyqu o'rtasida sezilarli bog'liqlik yo'q (r={r}, n={n})", '90 кунда вазн ва уйқу ўртасида сезиларли боғлиқлик йўқ (r={r}, n={n})', 'За 90 дней заметной связи между весом и сном нет (r={r}, n={n})'],
    'st.i.wsNeed': ['Vazn va uyquni bir kunda kamida 10 marta qayd eting (hozir {n})', 'Вазн ва уйқуни бир кунда камида 10 марта қайд этинг (ҳозир {n})', 'Отметьте вес и сон в один день минимум 10 раз (сейчас {n})'],
    'st.i.noSeries': ["Ma'lumot yo'q", 'Маълумот йўқ', 'Нет данных'],

    'st.pal.note': ['Yozuv', 'Ёзув', 'Запись'],
    'st.pal.habit': ['Odat → Stat', 'Одат → Стат', 'Привычка → Стат'],
  };
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  for (const k of Object.keys(T)) { TABLES.uz[k] = T[k][0]; TABLES.uzk[k] = T[k][1]; TABLES.ru[k] = T[k][2]; }
  D.i18n.add(TABLES);

  /* ------------------------------------------------------------------ */
  /* constants + small helpers                                           */
  /* ------------------------------------------------------------------ */
  const SUBS = ['habits', 'spheres', 'notes', 'review', 'insights'];
  const CORE = ['ruh', 'aql', 'qalb', 'tana'];
  const MOODS = ['😔', '😐', '🙂', '😄', '🤩'];
  const FIELDS = ['wins', 'lessons', 'focus'];
  const PAGE = 30;
  const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

  let noteQuery = '', notePage = 1, noteDraft = null;
  const openReviews = new Set();

  const isNum = (v) => typeof v === 'number' && !isNaN(v);
  const num = (v) => (v === null || v === undefined || v === '' ? null : isNum(+v) ? +v : null);
  const mean = (a) => (a.length ? D.sum(a) / a.length : null);
  const pct = (x) => D.fmtPct((+x || 0) * 100);
  const level = (r) => (r === null || r === undefined ? null : r <= 0 ? 0 : r < 0.4 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4);
  const zoneOf = (p) => (p >= 70 ? 'good' : p >= 40 ? 'warn' : 'bad');
  const pillZone = (p) => { const z = zoneOf(p); return z === 'warn' ? 'on' : z; }; // kit has .pill.on (amber), no .pill.warn
  const fmtDelta = (kg) => { const lb = D.S.settings.weightUnit === 'lb'; return signed(lb ? kg * 2.20462 : kg) + ' ' + (lb ? 'lb' : t('unit.kg')); };
  const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
  const sphereTag = (id) => { const s = D.sphere(id); return `<span class="tag" style="--c:var(--${s.id})">${esc(s.name())}</span>`; };
  const signed = (v, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + D.round(Math.abs(v), d);
  const tile = (n, label, sub, zone) =>
    `<div class="stat">${zone ? `<i class="zone z-${zone}"></i>` : ''}<div class="stat-num num">${n}</div><div class="stat-label">${esc(label)}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
  const cardHead = (title, sub, right) =>
    `<div class="card-head"><div><div class="eyebrow">${esc(title)}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${right || ''}</div>`;

  function pearson(xs, ys) {
    const n = xs.length; if (n < 2) return null;
    const mx = mean(xs), my = mean(ys);
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    if (!sxx || !syy) return null;
    return sxy / Math.sqrt(sxx * syy);
  }
  // ISO week key → Monday key
  function weekStart(wk) {
    const m = /^(\d{4})-W(\d{2})$/.exec(wk || ''); if (!m) return null;
    const jan4 = m[1] + '-01-04';
    const mon1 = D.addDays(jan4, -((D.dowOf(jan4) + 6) % 7));
    return D.addDays(mon1, 7 * (+m[2] - 1));
  }
  const weekRange = (start) => `${esc(D.fmtDate(start, 'dm'))} – ${esc(D.fmtDate(D.addDays(start, 6), 'dm'))}`;

  /* ------------------------------------------------------------------ */
  /* index — built once per (updatedAt, today), everything reads it     */
  /* ------------------------------------------------------------------ */
  let IDX = null, IDX_KEY = '';
  function balanceOf(scores) {
    const vals = CORE.map((s) => scores[s]).filter((v) => v !== null && v !== undefined);
    if (!vals.length) return null;
    const mu = mean(vals);
    if (!mu) return 0;
    const sd = Math.sqrt(mean(vals.map((v) => (v - mu) * (v - mu))));
    return D.clamp(1 - sd / mu, 0, 1) * 100;
  }
  function index() {
    const S = D.S, today = D.today();
    const key = (S.meta.updatedAt || 0) + '|' + today + '|' + S.habits.length;
    if (IDX && IDX_KEY === key) return IDX;
    const active = D.activeHabits();
    const byId = new Map(S.habits.map((h) => [h.id, h]));
    // day → Set(habit ids)
    const days = new Map();
    for (const k of Object.keys(S.logs)) { const a = S.logs[k]; if (Array.isArray(a) && a.length) days.set(k, new Set(a)); }
    const targeted = S.habits.filter((h) => h.target && h.target.n);
    if (targeted.length) for (const k of Object.keys(S.counts || {})) {
      const c = S.counts[k] || {};
      for (const h of targeted) if ((+c[h.id] || 0) >= h.target.n) { if (!days.has(k)) days.set(k, new Set()); days.get(k).add(h.id); }
    }
    const keys = [...days.keys()].sort();
    const first = keys.length ? keys[0] : today;
    // due habits by weekday (schedule depends on dow only)
    const dowKey = {}; for (const k of D.lastDays(7, today)) dowKey[D.dowOf(k)] = k;
    const dueByDow = [], dueIds = [];
    for (let d = 0; d < 7; d++) { dueByDow[d] = active.filter((h) => D.habitDue(h, dowKey[d])); dueIds[d] = new Set(dueByDow[d].map((h) => h.id)); }
    const ratioCache = new Map();
    const ratio = (k) => { // 0..1 · null = future, before tracking, or nothing scheduled that day
      if (k > today || k < first) return null;
      let r = ratioCache.get(k); if (r !== undefined) return r;
      const dow = D.dowOf(k), due = dueByDow[dow].length;
      if (!due) r = null;
      else { const set = days.get(k); let n = 0; if (set) for (const id of set) if (dueIds[dow].has(id)) n++; r = n / due; }
      ratioCache.set(k, r); return r;
    };
    // totals + best day
    let ticks = 0, best = { k: null, n: 0 };
    for (const k of keys) { const n = days.get(k).size; ticks += n; if (n > best.n) best = { k, n }; }
    // per-habit: all-time, best streak, current streak (grace day), 30/90-day consistency
    const hs = {};
    for (const h of active) hs[h.id] = { all: 0, best: 0, run: 0, d30: 0, due30: 0, d90: 0, due90: 0 };
    for (const k of keys) for (const id of days.get(k)) if (hs[id]) hs[id].all++;
    const k30 = D.addDays(today, -29), k90 = D.addDays(today, -89);
    const span = D.daysBetween(first, today) + 1;
    for (let i = 0, k = first; i < span; i++, k = D.addDays(k, 1)) {
      const set = days.get(k), dow = D.dowOf(k);
      for (const h of dueByDow[dow]) {
        const s = hs[h.id], done = !!(set && set.has(h.id));
        if (done) { s.run++; if (s.run > s.best) s.best = s.run; } else if (k !== today) s.run = 0;
        if (k >= k30) { s.due30++; if (done) s.d30++; }
        if (k >= k90) { s.due90++; if (done) s.d90++; }
      }
    }
    // 12 ISO weeks (oldest → current) · per-sphere scores + balance
    const monday = D.addDays(today, -((D.dowOf(today) + 6) % 7));
    const weeks = [];
    for (let w = 11; w >= 0; w--) {
      const start = D.addDays(monday, -7 * w);
      const sph = {}; for (const s of D.SPHERE_IDS) sph[s] = { due: 0, done: 0 };
      let due = 0, done = 0;
      for (let i = 0; i < 7; i++) {
        const dk = D.addDays(start, i); if (dk > today) break;
        const set = days.get(dk), dw = D.dowOf(dk);
        for (const h of dueByDow[dw]) { const o = sph[h.sphere] || sph.boshqa; o.due++; due++; if (set && set.has(h.id)) { o.done++; done++; } }
      }
      const scores = {}; for (const s of D.SPHERE_IDS) scores[s] = sph[s].due ? sph[s].done / sph[s].due : null;
      weeks.push({ key: D.weekKey(start), start, end: D.addDays(start, 6), due, done, ratio: due ? done / due : 0, scores, balance: balanceOf(scores) });
    }
    const sphereList = D.SPHERE_IDS.filter((s) => active.some((h) => h.sphere === s));
    IDX = { today, active, byId, days, keys, first, ticks, best, ratio, hs, weeks, dueByDow, dueIds, sphereList, monday };
    IDX_KEY = key;
    return IDX;
  }
  const isDone = (idx, id, k) => { const s = idx.days.get(k); return !!(s && s.has(id)); };

  /* ------------------------------------------------------------------ */
  /* shared chart pieces                                                 */
  /* ------------------------------------------------------------------ */
  function yearHeat(valueFn) {
    const end = D.today(), endDow = D.dowOf(end), total = 52 * 7 + endDow + 1;
    const days = D.lastDays(total, end), cols = Math.ceil(total / 7), M = D.t('months');
    const marks = []; let prev = '';
    for (let c = 0; c < cols; c++) { const k = days[c * 7]; if (!k) break; const m = k.slice(0, 7); if (m !== prev) { marks.push({ c, m: +k.slice(5, 7) }); prev = m; } }
    const short = (m) => { const s3 = String(M[m - 1] || '').slice(0, 3); return M.some((x, j) => j !== m - 1 && String(x).slice(0, 3) === s3) ? String(M[m - 1]).slice(0, 4) : s3; };
    const labels = marks.map((mk, i) => {
      const last = i === marks.length - 1;
      const span = last ? 2 : Math.min(4, marks[i + 1].c - mk.c);
      return span < 2 ? '' : `<span style="grid-column:${mk.c + 1} / span ${span}">${esc(short(mk.m))}</span>`;
    }).join('');
    return `<div class="st-year"><div class="st-months">${labels}</div>${D.chart.heatYear({ end, valueFn })}</div>`;
  }
  const heatLegend = () => `<div class="legend st-legend"><span>${esc(t('st.h.less'))}</span><span class="st-lg"><i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i></span><span>${esc(t('st.h.more'))}</span></div>`;
  const strip30 = (valueFn) => {
    const days = D.lastDays(30);
    return `<div class="st-strip">${D.chart.heat({ days, valueFn })}<div class="spark-labels"><span>${esc(D.fmtDate(days[0], 'dm'))}</span><span>${esc(D.fmtDate(days[29], 'dm'))}</span></div></div>`;
  };
  function weekdayBars(doneFn) { // doneFn(k) → ratio|null over last 90 days
    const sums = [0, 0, 0, 0, 0, 0, 0], cnt = [0, 0, 0, 0, 0, 0, 0];
    for (const k of D.lastDays(90)) { const r = doneFn(k); if (r === null) continue; const d = D.dowOf(k); sums[d] += r; cnt[d]++; }
    const vals = DOW_ORDER.map((d) => (cnt[d] ? Math.round((sums[d] / cnt[d]) * 100) : 0));
    const has = DOW_ORDER.map((d) => cnt[d] > 0);
    const W = D.t('weekdaysShort');
    // lowest among weekdays that actually had something scheduled
    let lo = -1; vals.forEach((v, i) => { if (has[i] && (lo < 0 || v < vals[lo])) lo = i; });
    const varied = vals.some((v, i) => has[i] && lo >= 0 && v !== vals[lo]);
    const colors = vals.map((v, i) => (i === lo && varied ? 'var(--warning)' : 'var(--success)'));
    return { html: D.chart.bars({ values: vals, labels: DOW_ORDER.map((d) => W[d]), colors, height: 64, max: 100 }), lowest: lo < 0 ? null : { dow: DOW_ORDER[lo], v: vals[lo] } };
  }
  const lowDayLine = (wd, W) => (wd.lowest ? `<div class="small muted mt-s">${esc(t('st.h.lowDay'))}: <b>${esc(W[wd.lowest.dow])}</b> <span class="num">${wd.lowest.v}%</span></div>` : '');
  function rollingSpark(doneFn) { // mean of the scheduled days inside each 7-day window
    const days = D.lastDays(96), rs = days.map(doneFn);
    const out = [];
    for (let i = 6; i < rs.length; i++) { let s = 0, n = 0; for (let j = i - 6; j <= i; j++) if (rs[j] !== null) { s += rs[j]; n++; } out.push(n ? Math.round((s / n) * 100) : 0); }
    return D.chart.spark({ values: out, min: 0, max: 100, color: 'var(--success)', height: 64 });
  }

  /* ------------------------------------------------------------------ */
  /* HABITS                                                              */
  /* ------------------------------------------------------------------ */
  function renderHabits() {
    const idx = index(), S = D.S;
    if (!idx.active.length) return `<div class="card"><div class="empty">${esc(t('st.h.empty'))}</div></div>`;
    const r30 = D.lastDays(30).map(idx.ratio).filter((v) => v !== null);
    const avg30 = Math.round((mean(r30) || 0) * 100);
    const tiles = `<div class="stat-grid st-tiles">
      ${tile(D.fmtNum(idx.keys.length), t('st.h.days'), idx.keys.length ? esc(t('st.h.since', { d: D.fmtDate(idx.first, 'short') })) : '')}
      ${tile(D.fmtNum(idx.ticks), t('st.h.ticks'), '')}
      ${tile(avg30 + '%', t('st.h.avg30'), '', zoneOf(avg30))}
      ${tile(D.fmtNum(idx.active.length), t('st.h.active'), esc(t('st.h.total', { n: D.fmtNum(S.habits.length) })))}
      ${tile(idx.best.k ? esc(D.fmtDate(idx.best.k, 'dm')) : '—', t('st.h.best'), idx.best.k ? esc(t('st.h.bestSub', { n: idx.best.n })) : '')}
    </div>`;
    const lvl = (k) => level(idx.ratio(k));
    const year = `<div class="card">${cardHead(t('st.h.year'), esc(t('st.h.yearSub')))}${yearHeat(lvl)}${heatLegend()}</div>`;
    const strip = `<div class="card">${cardHead(t('st.h.strip30'), '', `<span class="pill ${pillZone(avg30)}">${avg30}%</span>`)}${strip30(lvl)}</div>`;
    const wd = weekdayBars(idx.ratio);
    const W = D.t('weekdays');
    const profile = `<div class="grid2 st-charts">
      <div class="card">${cardHead(t('st.h.weekday'), esc(t('st.h.weekdaySub')))}${wd.html}${lowDayLine(wd, W)}</div>
      <div class="card">${cardHead(t('st.h.rolling'), esc(t('st.h.rollingSub')))}${rollingSpark(idx.ratio)}<div class="spark-labels"><span>${esc(D.fmtDate(D.addDays(idx.today, -89), 'dm'))}</span><span>${esc(D.fmtDate(idx.today, 'dm'))}</span></div></div>
    </div>`;
    const rows = idx.active.map((h) => {
      const s = idx.hs[h.id]; const c30 = s.due30 ? s.d30 / s.due30 : 0;
      return { h, s, c30 };
    }).sort((a, b) => b.c30 - a.c30 || b.s.all - a.s.all);
    const rank = `<div class="card st-rankcard">${cardHead(t('st.h.rank'), esc(t('st.h.rankSub')))}<div class="st-rank-list">${rows.map(({ h, s, c30 }) => {
      const p = Math.round(c30 * 100);
      return `<button class="st-rank" data-act="stHabit" data-id="${esc(h.id)}">
        <div class="st-rank-top"><span class="st-rank-name">${esc(h.name)}</span>${sphereTag(h.sphere)}<b class="st-rank-pct num ${zoneOf(p)}">${p}%</b></div>
        <div class="st-rank-bar bar thin"><i class="bar-fill" style="width:${p}%;background:var(--${D.sphere(h.sphere).id})"></i></div>
        <div class="st-rank-meta num"><span><b>${D.fmtNum(s.all)}</b> ${esc(t('st.h.all'))}</span><span class="streak">${D.ic('fire', 11)}${s.run} <em>${esc(t('st.h.streak'))}</em></span><span><b>${s.best}</b> ${esc(t('st.h.record'))}</span></div>
      </button>`;
    }).join('')}</div></div>`;
    return tiles + year + strip + profile + rank;
  }

  function openHabit(id) {
    const idx = index(), h = idx.byId.get(id);
    if (!h) return;
    const s = idx.hs[id] || { all: 0, best: 0, run: 0, d30: 0, due30: 0, d90: 0, due90: 0 };
    const c30 = s.due30 ? Math.round((s.d30 / s.due30) * 100) : 0, c90 = s.due90 ? Math.round((s.d90 / s.due90) * 100) : 0;
    const due = (k) => idx.dueIds[D.dowOf(k)].has(id);
    const lvl = (k) => (k > idx.today || k < idx.first ? null : isDone(idx, id, k) ? 4 : due(k) ? 0 : null);
    const ratioFn = (k) => (k > idx.today || k < idx.first || !due(k) ? null : isDone(idx, id, k) ? 1 : 0);
    const wd = weekdayBars(ratioFn), W = D.t('weekdays');
    const firstK = idx.keys.find((k) => isDone(idx, id, k));
    const body = `<div class="st-modal">
      <div class="row wrap mb">${sphereTag(h.sphere)}${firstK ? `<span class="small muted">${esc(t('st.h.since', { d: D.fmtDate(firstK, 'short') }))}</span>` : ''}</div>
      <div class="stat-grid st-tiles">
        ${tile(D.fmtNum(s.all), t('st.h.mAll'), '')}
        ${tile(`<span class="streak st-big">${D.ic('fire', 14)}${s.run}</span>`, t('st.h.mStreak'), '')}
        ${tile(D.fmtNum(s.best), t('st.h.mBest'), '')}
        ${tile(c30 + '%', t('st.h.c30'), `${s.d30}/${s.due30}`, zoneOf(c30))}
        ${tile(c90 + '%', t('st.h.c90'), `${s.d90}/${s.due90}`, zoneOf(c90))}
      </div>
      <div class="eyebrow mt">${esc(t('st.h.year'))}</div>${yearHeat(lvl)}
      <div class="eyebrow mt">${esc(t('st.h.strip30'))}</div>${strip30(lvl)}
      <div class="eyebrow mt">${esc(t('st.h.weekday'))}</div>${wd.html}${lowDayLine(wd, W)}
    </div>`;
    D.modal({ title: h.name, body, noFocus: true, onOpen: () => { for (const el of D.$$('#modalBg .st-year')) el.scrollLeft = el.scrollWidth; } });
  }
  D.act.stHabit = (el) => openHabit(el.dataset.id);

  /* ------------------------------------------------------------------ */
  /* SPHERES                                                             */
  /* ------------------------------------------------------------------ */
  function renderSpheres() {
    const idx = index();
    if (!idx.active.length) return `<div class="card"><div class="empty">${esc(t('st.s.empty'))}</div></div>`;
    const cur = idx.weeks[11];
    const bal = Math.round(cur.balance === null ? 0 : cur.balance);
    const zone = zoneOf(bal), color = zone === 'good' ? 'var(--success)' : zone === 'warn' ? 'var(--warning)' : 'var(--danger)';
    const hist = idx.weeks.map((w) => (w.balance === null ? 0 : Math.round(w.balance)));
    let low = null;
    for (const s of CORE) { const v = cur.scores[s]; if (v === null || v === undefined) continue; if (!low || v < low.v) low = { s, v }; }
    const nudge = low && low.v < 0.7
      ? `<div class="banner">${D.ic('compass')}<span>${esc(t('st.s.nudge', { s: D.sphere(low.s).name(), p: pct(low.v) }))}</span></div>`
      : `<div class="banner good">${D.ic('sparkles')}<span>${esc(t('st.s.nudgeOk'))}</span></div>`;
    const balance = `<div class="card st-bal">${cardHead(t('st.s.balance'), esc(t('st.s.balanceSub')), `<span class="pill ${zone}">${esc(t('st.s.zone' + zone[0].toUpperCase() + zone.slice(1)))}</span>`)}
      <div class="st-bal-body">${D.chart.ring({ pct: bal, size: 108, stroke: 9, color, label: String(bal), sub: esc(t('st.s.thisWeek')) })}
        <div class="grow"><div class="eyebrow mb-s">${esc(t('st.s.history'))}</div>${D.chart.spark({ values: hist, min: 0, max: 100, color, height: 58, dots: true })}
        <div class="spark-labels"><span>${esc(D.fmtDate(idx.weeks[0].start, 'dm'))}</span><span>${esc(D.fmtDate(cur.start, 'dm'))}</span></div></div></div>
      <p class="st-formula">${esc(t('st.s.formula'))}</p>${nudge}</div>`;
    const labels = idx.weeks.map((w) => t('st.s.week', { n: +w.key.slice(6) }));
    const blocks = idx.sphereList.map((s) => {
      const sp = D.sphere(s), v = cur.scores[s];
      const vals = idx.weeks.map((w) => Math.round((w.scores[s] || 0) * 100));
      return `<div class="st-sph"><div class="st-sph-head">${sphereTag(s)}<span class="small muted">${esc(t('st.s.thisWeek'))}</span><b class="num st-sph-pct">${v === null ? '—' : pct(v)}</b></div>
        ${D.chart.bars({ values: vals, labels, color: sp.color, height: 54, max: 100 })}</div>`;
    }).join('');
    return balance + `<div class="card">${cardHead(t('st.s.title'), esc(t('st.s.sub')))}<div class="st-sph-list">${blocks}</div></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* NOTES                                                               */
  /* ------------------------------------------------------------------ */
  const noteKeys = () => { const N = D.S.notes || {}; return Object.keys(N).filter((k) => N[k] && String(N[k]).trim()).sort().reverse(); };
  // normalised note text, memoised per state version (search runs on every keystroke)
  let normCache = new Map(), normKey = '';
  const noteNorm = (k) => {
    const v = String(D.S.meta.updatedAt || 0);
    if (v !== normKey) { normCache = new Map(); normKey = v; }
    let s = normCache.get(k);
    if (s === undefined) { s = D.translit.norm(D.S.notes[k]); normCache.set(k, s); }
    return s;
  };
  function noteRow(k, text) {
    return `<li class="li st-note"><button class="st-note-btn" data-act="stNoteOpen" data-key="${esc(k)}"><div class="li-body">
      <div class="li-meta"><b class="st-note-date">${esc(D.fmtDate(k, 'weekday'))}</b><span class="num">${esc(k.slice(0, 4))}</span><span>·</span><span>${esc(t('st.n.words', { n: words(text) }))}</span></div>
      <div class="li-text st-note-text">${esc(text)}</div></div>${D.ic('chevR', 16)}</button></li>`;
  }
  function notesList() {
    const N = D.S.notes || {};
    let keys = noteKeys();
    const q = noteQuery.trim(), nq = D.translit.norm(q);
    if (nq) keys = keys.filter((k) => k.includes(q) || noteNorm(k).includes(nq));
    if (!keys.length) return `<div class="empty">${esc(t(nq ? 'st.n.noMatch' : 'st.n.empty'))}</div>`;
    const shown = keys.slice(0, PAGE * notePage), left = keys.length - shown.length;
    return `<div class="small muted mb-s num">${esc(t('st.n.count', { n: keys.length }))}</div><ul class="list">${shown.map((k) => noteRow(k, N[k])).join('')}</ul>
      ${left > 0 ? `<button class="dashed" data-act="stNotesMore">${esc(t('st.n.more', { n: Math.min(PAGE, left) }))}</button>` : ''}`;
  }
  function onThisDay(today) {
    const S = D.S, N = S.notes || {}, G = S.gratitude || [], out = [];
    const y = +today.slice(0, 4), md = today.slice(5);
    const push = (k, label) => {
      const note = N[k] && String(N[k]).trim() ? N[k] : '';
      const grats = G.filter((g) => g && g.date === k && g.text);
      if (note || grats.length) out.push({ k, label, note, grats });
    };
    for (let i = 1; i <= 10; i++) push(y - i + '-' + md, t('st.n.yearsAgo', { n: i }));
    for (const n of [30, 90, 180]) push(D.addDays(today, -n), t('st.n.daysAgo', { n }));
    return out;
  }
  function renderNotes() {
    const S = D.S, today = D.today(), G = S.gratitude || [];
    const gStreak = D.streak(new Set(G.map((g) => g && g.date).filter(Boolean)));
    const tiles = `<div class="stat-grid st-tiles">
      ${tile(D.fmtNum(noteKeys().length), t('st.n.notes'), '')}
      ${tile(D.fmtNum(G.length), t('st.n.grat'), '')}
      ${tile(`<span class="streak st-big">${D.ic('fire', 14)}${gStreak}</span>`, t('st.n.gratStreak'), '')}
    </div>`;
    const otd = onThisDay(today);
    const otdCard = `<div class="card">${cardHead(t('st.n.otd'), esc(t('st.n.otdSub')))}${otd.length ? otd.map((o) =>
      `<div class="st-otd"><div class="st-otd-head"><span class="pill info">${esc(o.label)}</span><span class="small muted">${esc(D.fmtDate(o.k, 'long'))}</span></div>
        ${o.note ? `<button class="st-otd-note" data-act="stNoteOpen" data-key="${esc(o.k)}">${esc(o.note)}</button>` : ''}
        ${o.grats.map((g) => `<div class="st-otd-grat"><span class="tag" style="--c:var(--qalb)">${esc(t('st.n.gratTag'))}</span><span>${esc(g.text)}</span></div>`).join('')}</div>`).join('')
      : `<div class="empty">${esc(t('st.n.otdEmpty'))}</div>`}</div>`;
    const list = `<div class="card st-notes"><div class="card-head"><div class="title">${D.ic('edit')} ${esc(t('st.sub.notes'))}</div>
        <button class="btn ghost sm" data-act="stNoteOpen" data-key="${esc(today)}">${D.ic('plus', 14)} ${esc(t('st.n.today'))}</button></div>
      <div class="st-search">${D.ic('search', 16)}<input class="inp" value="${esc(noteQuery)}" placeholder="${esc(t('st.n.search'))}" data-input="stNoteSearch" autocomplete="off" aria-label="${esc(t('common.search'))}"></div>
      <div id="stNoteList">${notesList()}</div></div>`;
    return tiles + otdCard + list;
  }
  function openNote(k) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k || '')) return;
    const text = D.S.notes[k] || '';
    noteDraft = { key: k, orig: text, text };
    D.modal({
      title: D.fmtDate(k, 'long'),
      body: `<div class="st-modal"><textarea class="ta st-note-ta" rows="8" data-input="stNoteDraft" placeholder="${esc(t('st.n.ph'))}">${esc(text)}</textarea>
        <div class="row between mt-s st-note-foot"><span class="small muted" id="stNoteWords">${esc(t('st.n.words', { n: words(text) }))}</span>
        ${text ? `<button class="btn sm danger" data-act="stNoteDel" data-key="${esc(k)}">${D.ic('trash', 14)} ${esc(t('btn.delete'))}</button>` : ''}</div></div>`,
      actions: [{ label: t('btn.save'), act: 'closeModal', primary: true }],
      onClose: commitNote,
    });
  }
  function commitNote() {
    const d = noteDraft; noteDraft = null;
    if (!d || d.text === d.orig) return;
    if (d.text.trim()) D.S.notes[d.key] = d.text; else delete D.S.notes[d.key];
    D.save(); D.rerender(); D.toast(t('st.n.saved'));
  }
  D.act.stNoteOpen = (el) => openNote(el.dataset.key);
  D.act.stNoteDraft = (el) => { if (!noteDraft) return; noteDraft.text = el.value; D.patch('stNoteWords', esc(t('st.n.words', { n: words(el.value) }))); };
  D.act.stNoteSearch = (el) => { noteQuery = el.value || ''; notePage = 1; D.patch('stNoteList', notesList()); };
  D.act.stNotesMore = () => { notePage++; D.patch('stNoteList', notesList()); };
  D.act.stNoteDel = (el) => {
    const k = el.dataset.key, old = D.S.notes[k];
    noteDraft = null;
    const bg = D.$('#modalBg'); if (bg) bg._onClose = null;
    D.closeModal();
    if (old === undefined) return;
    delete D.S.notes[k];
    D.undo.push({ label: t('st.n.deleted'), undo: () => { D.S.notes[k] = old; } });
    D.save(); D.rerender();
    D.toast(t('st.n.deleted'), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* REVIEW                                                              */
  /* ------------------------------------------------------------------ */
  const reviewOf = (wk) => (D.S.reviews || []).find((r) => r && r.week === wk);
  const filledCount = (r) => (r ? FIELDS.filter((f) => String(r[f] || '').trim()).length : 0);
  function snapshot(week) {
    const S = D.S, start = week.start, end = week.end;
    const inWeek = (k) => k && k >= start && k <= end;
    const tsKey = (ts) => (ts ? D.dayKey(new Date(ts)) : null);
    const tasksDone = S.tasks.filter((x) => x.done && inWeek(x.doneAt ? tsKey(x.doneAt) : x.date)).length;
    const tasksNew = S.tasks.filter((x) => x.createdAt && inWeek(tsKey(x.createdAt))).length;
    let inc = 0, exp = 0;
    for (const tx of S.finance.tx || []) if (inWeek(tx.date)) { if (tx.type === 'in') inc += +tx.amount || 0; else exp += +tx.amount || 0; }
    const H = S.health || {}, hk = Object.keys(H).sort();
    const wIn = hk.filter((k) => inWeek(k) && num(H[k].weight) !== null);
    let weightD = null;
    if (wIn.length) {
      const last = num(H[wIn[wIn.length - 1]].weight);
      let base = wIn.length > 1 ? num(H[wIn[0]].weight) : null;
      if (base === null) { for (let i = hk.length - 1; i >= 0; i--) if (hk[i] < start && num(H[hk[i]].weight) !== null) { base = num(H[hk[i]].weight); break; } }
      if (base !== null) weightD = last - base;
    }
    const sleeps = [], moods = [];
    for (const k of hk) if (inWeek(k)) { const s = num(H[k].sleep); if (s !== null && s > 0) sleeps.push(s); const m = num(H[k].mood); if (m !== null) moods.push(m); }
    return { habits: Math.round(week.ratio * 100), due: week.due, done: week.done, tasksDone, tasksNew, inc, exp, net: inc - exp, weightD, sleep: mean(sleeps), mood: mean(moods) };
  }
  function snapTiles(sn) {
    const moodStr = sn.mood === null ? '—' : `${MOODS[D.clamp(Math.round(sn.mood), 0, 4)]} <span class="st-tile-small">${D.round(sn.mood, 1)}</span>`;
    return `<div class="stat-grid st-tiles st-snap">
      ${tile(sn.habits + '%', t('st.r.habits'), `${sn.done}/${sn.due}`, zoneOf(sn.habits))}
      ${tile(`${sn.tasksDone} <span class="st-tile-small">/ ${sn.tasksNew}</span>`, t('st.r.tasks'), esc(t('st.r.tasksSub')))}
      ${tile(`<span class="st-money good">${esc(D.fmtMoney(sn.inc))}</span>`, t('st.r.income'), '')}
      ${tile(`<span class="st-money bad">${esc(D.fmtMoney(sn.exp))}</span>`, t('st.r.expense'), '')}
      ${tile(`<span class="st-money ${sn.net >= 0 ? 'good' : 'bad'}">${esc(D.fmtMoney(sn.net))}</span>`, t('st.r.net'), '')}
      ${tile(sn.weightD === null ? '—' : esc(fmtDelta(sn.weightD)), t('st.r.weight'), '')}
      ${tile(sn.sleep === null ? '—' : esc(D.round(sn.sleep, 1) + ' ' + t('unit.h')), t('st.r.sleep'), '', sn.sleep === null ? '' : sn.sleep >= 7 ? 'good' : sn.sleep >= 6 ? 'warn' : 'bad')}
      ${tile(moodStr, t('st.r.mood'), '')}
    </div>`;
  }
  function sphereBars(week, idx) {
    return `<div class="st-sph-bars">${idx.sphereList.map((s) => { const v = week.scores[s]; return D.chart.hbar({ label: D.sphere(s).name(), value: v === null ? 0 : v * 100, max: 100, color: D.sphere(s).color, right: v === null ? '—' : pct(v) }); }).join('')}</div>`;
  }
  function renderReview() {
    const idx = index(), S = D.S, cur = idx.weeks[11], wk = cur.key;
    const rv = reviewOf(wk), filled = filledCount(rv);
    const dow = D.dowOf(idx.today);
    const banner = [5, 6, 0].includes(dow) && !filled ? `<div class="banner">${D.ic('flag')}<span>${esc(t('st.r.banner'))}</span></div>` : '';
    const sn = snapshot(cur);
    const auto = `<div class="card">${cardHead(t('st.r.auto'), `<span class="num">${esc(wk)}</span> · ${weekRange(cur.start)}`, `<span id="stRvFilled">${filledPill(filled)}</span>`)}
      ${snapTiles(sn)}${idx.sphereList.length ? `<div class="eyebrow mt">${esc(t('st.r.spheres'))}</div>${sphereBars(cur, idx)}` : ''}</div>`;
    const form = `<div class="card st-form"><div class="title mb">${D.ic('edit')} ${esc(t('st.r.title'))}</div>
      ${FIELDS.map((f) => `<div class="field"><label class="field-label">${esc(t('st.r.' + f))}</label>
        <textarea class="ta" rows="3" placeholder="${esc(t('st.r.' + f + 'Ph'))}" data-input="stReview" data-field="${f}" data-week="${esc(wk)}">${esc(rv ? rv[f] || '' : '')}</textarea></div>`).join('')}
      <div class="help">${esc(t('st.r.hint'))}</div></div>`;
    const past = (S.reviews || []).filter((r) => r && r.week && r.week !== wk).sort((a, b) => (a.week < b.week ? 1 : a.week > b.week ? -1 : 0));
    const pastHtml = `<div class="section-title">${esc(t('st.r.past'))}</div>${past.length ? `<ul class="list">${past.map((r) => {
      const open = openReviews.has(r.id), start = weekStart(r.week), n = filledCount(r), sp = r.snap;
      return `<li class="li st-rv ${open ? 'open' : ''}"><button class="st-rv-head" data-act="stReviewToggle" data-id="${esc(r.id)}" aria-expanded="${open}">
          <div class="li-body"><div class="li-text"><span class="num">${esc(r.week)}</span>${start ? ` <span class="small muted">${weekRange(start)}</span>` : ''}</div>
          <div class="li-meta"><span>${esc(t('st.r.filled', { n }))}</span>${sp && isNum(sp.habits) ? `<span class="num">· ${esc(t('st.r.habits'))} ${sp.habits}%</span>` : ''}</div></div>${D.ic(open ? 'chevD' : 'chevR', 16)}</button>
        ${open ? `<div class="st-rv-body">${FIELDS.map((f) => (String(r[f] || '').trim() ? `<div class="st-rv-blk"><div class="eyebrow">${esc(t('st.r.' + f))}</div><div class="st-rv-txt">${esc(r[f])}</div></div>` : '')).join('') || `<div class="empty">${esc(t('empty.generic'))}</div>`}
          ${sp ? `<div class="row wrap st-rv-snap">${isNum(sp.habits) ? `<span class="pill ${pillZone(sp.habits)}">${esc(t('st.r.habits'))} ${sp.habits}%</span>` : ''}${isNum(sp.tasksDone) ? `<span class="pill">${esc(t('st.r.tasks'))} ${sp.tasksDone}/${sp.tasksNew || 0}</span>` : ''}${isNum(sp.net) ? `<span class="pill">${esc(t('st.r.net'))} ${esc(D.fmtMoney(sp.net))}</span>` : ''}${isNum(sp.sleep) ? `<span class="pill">${esc(t('st.r.sleep'))} ${D.round(sp.sleep, 1)} ${esc(t('unit.h'))}</span>` : ''}${isNum(sp.weightD) ? `<span class="pill">${esc(t('st.r.weight'))} ${esc(fmtDelta(sp.weightD))}</span>` : ''}</div>` : ''}
          <div class="st-rv-foot"><button class="btn sm danger" data-act="stReviewDel" data-id="${esc(r.id)}">${D.ic('trash', 14)} ${esc(t('btn.delete'))}</button></div></div>` : ''}</li>`;
    }).join('')}</ul>` : `<div class="card"><div class="empty">${esc(t('st.r.pastEmpty'))}</div></div>`}`;
    return banner + auto + form + pastHtml;
  }
  const filledPill = (n) => `<span class="pill ${n === 3 ? 'good' : n ? 'on' : ''}">${esc(t('st.r.filled', { n }))}</span>`;
  // text is mutated on every keystroke; the snapshot + persist are debounced (same pattern as today.js notes)
  const saveReview = D.debounce((wk) => {
    const r = reviewOf(wk);
    if (r) {
      const w = index().weeks.find((x) => x.key === wk);
      if (w) { const sn = snapshot(w); r.snap = { habits: sn.habits, tasksDone: sn.tasksDone, tasksNew: sn.tasksNew, inc: sn.inc, exp: sn.exp, net: sn.net, weightD: sn.weightD, sleep: sn.sleep, mood: sn.mood }; }
    }
    D.save();
  }, 300);
  D.act.stReview = (el) => {
    const f = el.dataset.field, wk = el.dataset.week;
    if (!FIELDS.includes(f) || !wk) return;
    let r = reviewOf(wk);
    if (!r) { r = { id: D.uid('rv'), week: wk, wins: '', lessons: '', focus: '', createdAt: Date.now() }; D.S.reviews.push(r); }
    r[f] = el.value; r.updatedAt = Date.now();
    D.patch('stRvFilled', filledPill(filledCount(r)));
    saveReview(wk);
  };
  D.act.stReviewToggle = (el) => { const id = el.dataset.id; if (openReviews.has(id)) openReviews.delete(id); else openReviews.add(id); D.rerender(); };
  D.act.stReviewDel = (el) => D.remove(D.S.reviews, el.dataset.id, { label: t('st.r.deleted') });

  /* ------------------------------------------------------------------ */
  /* INSIGHTS                                                            */
  /* ------------------------------------------------------------------ */
  function correlations(idx) {
    const H = D.S.health || {}, days = D.lastDays(90);
    const rows = days.map((k) => {
      const nx = H[D.addDays(k, 1)], sd = H[k];
      return { k, dow: D.dowOf(k), set: idx.days.get(k), mood: nx ? num(nx.mood) : null, sleep: sd ? num(sd.sleep) : null };
    });
    const cards = [];
    for (const h of idx.active) {
      const xm = [], ym = [], xs = [], ys = [];
      for (const r of rows) {
        if (!idx.dueIds[r.dow].has(h.id)) continue;
        const x = r.set && r.set.has(h.id) ? 1 : 0;
        if (r.mood !== null) { xm.push(x); ym.push(r.mood); }
        if (r.sleep !== null && r.sleep > 0) { xs.push(x); ys.push(r.sleep); }
      }
      const test = (X, Y, kind) => {
        if (X.length < 20) return;
        const r = pearson(X, Y); if (r === null || Math.abs(r) < 0.3) return;
        const on = Y.filter((_, i) => X[i] === 1), off = Y.filter((_, i) => X[i] === 0);
        if (!on.length || !off.length) return;
        cards.push({ h, kind, r, n: X.length, diff: mean(on) - mean(off) });
      };
      test(xm, ym, 'mood'); test(xs, ys, 'sleep');
    }
    return cards.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 6);
  }
  function renderInsights() {
    const idx = index(), H = D.S.health || {};
    const d90 = D.lastDays(90);
    const moodDays = d90.filter((k) => H[k] && num(H[k].mood) !== null).length;
    const sleepDays = d90.filter((k) => H[k] && num(H[k].sleep) !== null && num(H[k].sleep) > 0).length;
    const enough = idx.active.length && (moodDays >= 20 || sleepDays >= 20);
    const cards = enough ? correlations(idx) : [];
    let body;
    if (!enough) body = `<div class="st-empty">${D.ic('sparkles', 28)}<p>${esc(t('st.i.need', { n: Math.max(moodDays, sleepDays) }))}</p></div>`;
    else if (!cards.length) body = `<div class="st-empty">${D.ic('info', 28)}<p>${esc(t('st.i.none'))}</p></div>`;
    else body = `<div class="st-ins-list">${cards.map((c) => {
      const up = c.diff >= 0, key = 'st.i.' + c.kind + (up ? 'Up' : 'Down');
      return `<div class="st-ins"><span class="st-ins-ic ${up ? 'good' : 'bad'}">${D.ic(up ? 'trend' : 'trendDown', 18)}</span><div class="grow">
        <div class="st-ins-txt">${esc(t(key, { h: c.h.name, d: D.round(Math.abs(c.diff), 1) }))}</div>
        <div class="li-meta">${sphereTag(c.h.sphere)}<span class="num">${esc(t('st.i.stat', { n: c.n, r: (c.r >= 0 ? '+' : '−') + Math.abs(c.r).toFixed(2) }))}</span><span>${esc(t('st.i.' + c.kind))}</span></div></div></div>`;
    }).join('')}</div><div class="help mt">${esc(t('st.i.assoc'))}</div>`;
    const corr = `<div class="card">${cardHead(t('st.i.title'), esc(t('st.i.sub')))}${body}</div>`;
    // mood spark + sleep bars (30 days)
    const d30 = D.lastDays(30);
    const moods = d30.map((k) => (H[k] ? num(H[k].mood) : null)).filter((v) => v !== null);
    const sleeps = d30.map((k) => (H[k] ? num(H[k].sleep) : null));
    const sleepVals = sleeps.filter((v) => v !== null && v > 0);
    const endLabels = `<div class="spark-labels"><span>${esc(D.fmtDate(d30[0], 'dm'))}</span><span>${esc(D.fmtDate(d30[29], 'dm'))}</span></div>`;
    const moodCard = `<div class="card">${cardHead(t('st.i.mood30'), moods.length ? `${esc(t('st.i.days', { n: moods.length }))} · ${esc(t('st.i.avg', { v: MOODS[D.clamp(Math.round(mean(moods)), 0, 4)] + ' ' + D.round(mean(moods), 1) }))}` : '')}
      ${moods.length >= 2 ? D.chart.spark({ values: moods, min: 0, max: 4, color: 'var(--qalb)', height: 60, dots: moods.length <= 30 }) + endLabels : `<div class="empty">${esc(t('st.i.noSeries'))}</div>`}</div>`;
    const sleepCard = `<div class="card">${cardHead(t('st.i.sleep30'), sleepVals.length ? `${esc(t('st.i.days', { n: sleepVals.length }))} · ${esc(t('st.i.avg', { v: D.round(mean(sleepVals), 1) + ' ' + t('unit.h') }))}` : '')}
      ${sleepVals.length ? D.chart.bars({ values: sleeps.map((v) => (v === null ? 0 : v)), labels: [], color: 'var(--info)', height: 60, target: 7, max: Math.max(9, ...sleepVals) }) + endLabels : `<div class="empty">${esc(t('st.i.noSeries'))}</div>`}</div>`;
    // weight vs sleep
    const wx = [], wy = [];
    for (const k of d90) { const h = H[k]; if (!h) continue; const w = num(h.weight), s = num(h.sleep); if (w !== null && s !== null && s > 0) { wx.push(s); wy.push(w); } }
    let wsText, wsIcon = 'scale';
    if (wx.length < 10) wsText = t('st.i.wsNeed', { n: wx.length });
    else { const r = pearson(wx, wy); const rs = r === null ? '0.00' : (r >= 0 ? '+' : '−') + Math.abs(r).toFixed(2); wsText = t(r !== null && Math.abs(r) >= 0.3 ? (r > 0 ? 'st.i.wsPos' : 'st.i.wsNeg') : 'st.i.wsNone', { r: rs, n: wx.length }); }
    const ws = `<div class="card"><div class="st-ins"><span class="st-ins-ic">${D.ic(wsIcon, 18)}</span><div class="grow"><div class="eyebrow mb-s">${esc(t('st.i.ws'))}</div><div class="st-ins-txt">${esc(wsText)}</div></div></div></div>`;
    return corr + `<div class="grid2 st-charts">${moodCard}${sleepCard}</div>` + ws;
  }

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  const RENDER = { habits: renderHabits, spheres: renderSpheres, notes: renderNotes, review: renderReview, insights: () => (D.ai ? D.ai.card('week') : '') + renderInsights() };
  function render() {
    let sub = D.sub('stats', 'habits'); if (!SUBS.includes(sub)) sub = 'habits';
    const seg = `<div class="seg st-seg">${SUBS.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="stats" data-sub="${s}">${esc(t('st.sub.' + s))}</button>`).join('')}</div>`;
    return `<div class="st">${seg}${RENDER[sub]()}</div>`;
  }
  function mount(root) { for (const el of D.$$('.st-year', root)) el.scrollLeft = el.scrollWidth; }

  D.search.register((q) => {
    const nq = D.translit.norm(q); if (!nq) return [];
    const out = [], N = D.S.notes || {};
    for (const k of noteKeys()) {
      const v = String(N[k]); const nv = D.translit.norm(v);
      const i = nv.indexOf(nq); if (i < 0) continue;
      out.push({ label: v.length > 70 ? v.slice(0, 70) + '…' : v, sub: t('st.pal.note') + ' · ' + D.fmtDate(k, 'short'), icon: 'edit', go: () => { noteQuery = q; notePage = 1; D.go('stats', 'notes'); } });
      if (out.length >= 8) break;
    }
    for (const h of D.activeHabits()) if (D.translit.score(h.name, nq) > 0) out.push({ label: h.name, sub: t('st.pal.habit'), icon: 'chart', go: () => { D.go('stats', 'habits'); openHabit(h.id); } });
    return out;
  });

  D.view({ id: 'stats', icon: 'chart', order: 65, nav: true, primary: false, render, mount });
})();
