/* =====================================================================
   Dash — Соғлиқ (health): daily log · WHOOP (day, sleep, strain, body) ·
   weight · water. Class prefix: hl-
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* i18n — one compact table [uz, uzk, ru] expanded into three tables    */
  /* ------------------------------------------------------------------ */
  const T = {
    'hl.sub.day': ['Kun', 'Кун', 'День'],
    'hl.sub.weight': ['Vazn', 'Вазн', 'Вес'],
    'hl.sub.water': ['Suv', 'Сув', 'Вода'],
    'hl.sub.body': ['Tana', 'Тана', 'Тело'],
    'hl.days': ['{n} kun', '{n} кун', '{n} дн.'],
    'hl.year1': ['1 yil', '1 йил', '1 год'],
    'hl.ago': ['{n} kun oldin', '{n} кун олдин', '{n} дн. назад'],
    'hl.tile.lastWeight': ['Oxirgi vazn', 'Охирги вазн', 'Последний вес'],
    'hl.tile.avgSleep': ['Uyqu, 7 kun', 'Уйқу, 7 кун', 'Сон, 7 дн.'],
    'hl.tile.avgMood': ['Kayfiyat, 7 kun', 'Кайфият, 7 кун', 'Настроение, 7 дн.'],
    'hl.tile.water': ['Suv bugun', 'Сув бугун', 'Вода сегодня'],
    'hl.day.log': ['Kunlik yozuv', 'Кунлик ёзув', 'Дневная запись'],
    'hl.day.weight': ['Vazn', 'Вазн', 'Вес'],
    'hl.day.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hl.day.bed': ['Yotdim', 'Ётдим', 'Лёг'],
    'hl.day.wake': ['Turdim', 'Турдим', 'Встал'],
    'hl.day.sleepCalc': ['Yotish–turish: {h} soat', 'Ётиш–туриш: {h} соат', 'Сон по времени: {h} ч'],
    'hl.day.water': ['Suv', 'Сув', 'Вода'],
    'hl.day.mood': ['Kayfiyat', 'Кайфият', 'Настроение'],
    'hl.day.tags': ['Teglar', 'Теглар', 'Теги'],
    'hl.day.notePh': ["Bugun qanday o'tdi?", 'Бугун қандай ўтди?', 'Как прошёл день?'],
    'hl.day.delta7': ['7 kunga', '7 кунга', 'за 7 дн.'],
    'hl.day.first': ['Birinchi yozuv', 'Биринчи ёзув', 'Первая запись'],
    'hl.day.prev': ['Oldingi kun', 'Олдинги кун', 'Предыдущий день'],
    'hl.day.next': ['Keyingi kun', 'Кейинги кун', 'Следующий день'],
    'hl.tag.uyqusiz': ['Uyqusiz', 'Уйқусиз', 'Недосып'],
    'hl.tag.ish': ['Ish', 'Иш', 'Работа'],
    'hl.tag.oila': ['Oila', 'Оила', 'Семья'],
    'hl.tag.ibodat': ['Ibodat', 'Ибодат', 'Ибадат'],
    'hl.tag.kasal': ['Kasal', 'Касал', 'Болезнь'],
    'hl.tag.safar': ['Safar', 'Сафар', 'Поездка'],
    'hl.mood.0': ['Yomon', 'Ёмон', 'Плохо'],
    'hl.mood.1': ["O'rtacha", 'Ўртача', 'Средне'],
    'hl.mood.2': ['Yaxshi', 'Яхши', 'Хорошо'],
    'hl.mood.3': ["Zo'r", 'Зўр', 'Отлично'],
    'hl.mood.4': ["A'lo", 'Аъло', 'Супер'],
    'hl.w.current': ['Hozir', 'Ҳозир', 'Сейчас'],
    'hl.w.d7': ['7 kun Δ', '7 кун Δ', '7 дн. Δ'],
    'hl.w.d30': ['30 kun Δ', '30 кун Δ', '30 дн. Δ'],
    'hl.w.streak': ['Seriya', 'Серия', 'Серия'],
    'hl.w.bmi.under': ['Kam vazn', 'Кам вазн', 'Дефицит веса'],
    'hl.w.bmi.normal': ['Normal', 'Нормал', 'Норма'],
    'hl.w.bmi.over': ['Ortiqcha vazn', 'Ортиқча вазн', 'Избыток веса'],
    'hl.w.bmi.obese': ['Semizlik', 'Семизлик', 'Ожирение'],
    'hl.w.noHeight': ["BMI uchun bo'yni Sozlashda kiriting", 'BMI учун бўйни Созлашда киритинг', 'Для BMI укажите рост в настройках'],
    'hl.w.chart': ['Grafik', 'График', 'График'],
    'hl.w.daily': ['Kunlik', 'Кунлик', 'Дневной'],
    'hl.w.trend': ['Trend', 'Тренд', 'Тренд'],
    'hl.w.rate': ['Haftalik tezlik', 'Ҳафталик тезлик', 'Темп в неделю'],
    'hl.w.rateFast': ["Tez o'zgarish — 1%/haftadan ko'p", 'Тез ўзгариш — 1%/ҳафтадан кўп', 'Быстрое изменение — более 1%/нед'],
    'hl.w.rateOk': ['Barqaror tezlik', 'Барқарор тезлик', 'Стабильный темп'],
    'hl.w.entries': ['Oxirgi yozuvlar', 'Охирги ёзувлар', 'Последние записи'],
    'hl.w.empty': ["Vazn yozuvlari yo'q — Kun bo'limida kiriting", 'Вазн ёзувлари йўқ — Кун бўлимида киритинг', 'Записей веса нет — добавьте во вкладке «День»'],
    'hl.w.few': ['Grafik uchun kamida 2 ta yozuv kerak', 'График учун камида 2 та ёзув керак', 'Для графика нужно минимум 2 записи'],
    'hl.w.deleted': ["Vazn o'chirildi", 'Вазн ўчирилди', 'Вес удалён'],
    'hl.wa.target': ['Maqsad', 'Мақсад', 'Цель'],
    'hl.wa.custom': ['Boshqa ml', 'Бошқа мл', 'Другой объём'],
    'hl.wa.customPrompt': ['Necha ml ichdingiz?', 'Неча мл ичдингиз?', 'Сколько мл выпили?'],
    'hl.wa.why': ['Nega shuncha?', 'Нега шунча?', 'Почему столько?'],
    'hl.wa.base': ['Asos: {kg} kg × 35 ml', 'Асос: {kg} кг × 35 мл', 'База: {kg} кг × 35 мл'],
    'hl.wa.activity': ['Faollik {n}/5 × 100 ml', 'Фаоллик {n}/5 × 100 мл', 'Активность {n}/5 × 100 мл'],
    'hl.wa.sex': ['Erkak', 'Эркак', 'Мужчина'],
    'hl.wa.age': ['Yosh 50+', 'Ёш 50+', 'Возраст 50+'],
    'hl.wa.manual': ["Sozlashda qo'lda belgilangan", 'Созлашда қўлда белгиланган', 'Задано вручную в настройках'],
    'hl.wa.total': ['Kunlik maqsad', 'Кунлик мақсад', 'Дневная цель'],
    'hl.wa.days14': ['Oxirgi 14 kun', 'Охирги 14 кун', 'Последние 14 дней'],
    'hl.wa.history': ['Tarix, 7 kun', 'Тарих, 7 кун', 'История, 7 дней'],
    'hl.wa.tip0': ['Boshlaymiz — birinchi stakan!', 'Бошлаймиз — биринчи стакан!', 'Начнём — первый стакан!'],
    'hl.wa.tipLow': ['Ortda qolyapsiz — bir stakan iching', 'Ортда қоляпсиз — бир стакан ичинг', 'Отстаёте — выпейте стакан'],
    'hl.wa.tipMid': ['{n} ta qoldi — yaxshi ketyapsiz', '{n} та қолди — яхши кетяпсиз', 'Осталось {n} — хороший темп'],
    'hl.wa.tipDone': ['Maqsad bajarildi!', 'Мақсад бажарилди!', 'Цель достигнута!'],
    'hl.wa.tipOver': ["Zo'r — maqsaddan oshdi", 'Зўр — мақсаддан ошди', 'Отлично — сверх цели'],
    'hl.wa.srcProfile': ['profil', 'профил', 'профиль'],
    'hl.wa.srcLast': ['oxirgi vazn', 'охирги вазн', 'последний вес'],
    'hl.wa.srcDefault': ['standart', 'стандарт', 'по умолчанию'],
    'hl.wa.serving': ['1 stakan = {ml} ml', '1 стакан = {ml} мл', '1 стакан = {ml} мл'],
    'hl.wh.intro': ["WHOOP bilan ulang — tiklanish, HRV, tinch pulsi, uyqu bosqichlari va strain shu yerda ko'rinadi.", 'WHOOP билан уланг — тикланиш, HRV, тинч пульси, уйқу босқичлари ва strain шу ерда кўринади.', 'Подключите WHOOP — восстановление, HRV, пульс покоя, фазы сна и нагрузка появятся здесь.'],
    'hl.wh.connect': ['Ulash', 'Улаш', 'Подключить'],
    'hl.wh.needServer': ['Server kerak — ilovani server bilan oching', 'Сервер керак — иловани сервер билан очинг', 'Нужен сервер — откройте приложение с сервера'],
    'hl.wh.refresh': ['Yangilash', 'Янгилаш', 'Обновить'],
    'hl.wh.check': ['Ulanganini tekshirish', 'Уланганини текшириш', 'Проверить подключение'],
    'hl.wh.disconnect': ['Uzish', 'Узиш', 'Отключить'],
    'hl.wh.lastSync': ['Oxirgi sinx', 'Охирги синх', 'Синхронизация'],
    'hl.wh.never': ["hali yo'q", 'ҳали йўқ', 'ещё нет'],
    'hl.wh.recovery': ['Tiklanish', 'Тикланиш', 'Восстановление'],
    'hl.wh.hrv': ['HRV', 'HRV', 'HRV'],
    'hl.wh.rhr': ['Tinch puls', 'Тинч пульс', 'Пульс покоя'],
    'hl.wh.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hl.wh.strain': ['Strain', 'Strain', 'Нагрузка'],
    'hl.wh.stages': ['Uyqu bosqichlari', 'Уйқу босқичлари', 'Фазы сна'],
    'hl.wh.deep': ['Chuqur', 'Чуқур', 'Глубокий'],
    'hl.wh.rem': ['REM', 'REM', 'REM'],
    'hl.wh.light': ['Yengil', 'Енгил', 'Лёгкий'],
    'hl.wh.awake': ["Uyg'oq", 'Уйғоқ', 'Бодрств.'],
    'hl.wh.green': ['Bugun bosim bering — tana tayyor', 'Бугун босим беринг — тана тайёр', 'Жмите сегодня — тело готово'],
    'hl.wh.yellow': ["O'rtacha kun — rejadagi hajm, maksimalsiz", 'Ўртача кун — режадаги ҳажм, максималсиз', 'Умеренный день — плановый объём без максимумов'],
    'hl.wh.red': ['Tiklaning — yengil harakat, erta uyqu', 'Тикланинг — енгил ҳаракат, эрта уйқу', 'Восстанавливайтесь — лёгкая активность, ранний сон'],
    'hl.wh.synced': ['WHOOP yangilandi', 'WHOOP янгиланди', 'WHOOP обновлён'],
    'hl.wh.err': ['WHOOP xatosi: {e}', 'WHOOP хатоси: {e}', 'Ошибка WHOOP: {e}'],
    'hl.wh.noData': ["Ma'lumot yo'q — Yangilash tugmasini bosing", 'Маълумот йўқ — Янгилаш тугмасини босинг', 'Нет данных — нажмите «Обновить»'],
    'hl.wh.connected': ['Ulandi', 'Уланди', 'Подключено'],
    'hl.wh.notConnected': ["WHOOP hali ulanmagan — avval «Ulash» tugmasini bosing", 'WHOOP ҳали уланмаган — аввал «Улаш» тугмасини босинг', 'WHOOP ещё не подключён — сначала нажмите «Подключить»'],
    'hl.wh.notConfigured': ['Serverda WHOOP kalitlari sozlanmagan', 'Серверда WHOOP калитлари созланмаган', 'На сервере не настроены ключи WHOOP'],
    'hl.wh.disconnectQ': ["WHOOP ulanishini uzasizmi? Keshdagi ma'lumotlar o'chadi.", 'WHOOP уланишини узасизми? Кешдаги маълумотлар ўчади.', 'Отключить WHOOP? Кэшированные данные будут удалены.'],
    'hl.wh.disconnected': ['WHOOP uzildi', 'WHOOP узилди', 'WHOOP отключён'],
    'hl.wh.kcal': ['kkal', 'ккал', 'ккал'],
    'hl.wh.skin': ['Teri harorati', 'Тери ҳарорати', 'Темп. кожи'],
    'hl.wh.spo2': ['SpO₂', 'SpO₂', 'SpO₂'],
    'hl.wh.resp': ['Nafas / daq', 'Нафас / дақ', 'Дыхание / мин'],
    'hl.wh.zoneGood': ['Yaxshi', 'Яхши', 'Хорошо'],
    'hl.wh.zoneWarn': ['Kuzating', 'Кузатинг', 'Внимание'],
    'hl.wh.zoneBad': ['Past / yuqori', 'Паст / юқори', 'Низко / высоко'],
    'hl.wh.trendLegend': ['EWMA, α=0.1', 'EWMA, α=0.1', 'EWMA, α=0.1'],
    'hl.ins': ['Uyqu va tiklanish', 'Уйқу ва тикланиш', 'Сон и восстановление'],
    'hl.ins.debt': ['Uyqu qarzi', 'Уйқу қарзи', 'Долг сна'],
    'hl.ins.debtSub': ['14 kunda, me’yor {n} soat', '14 кунда, меъёр {n} соат', 'за 14 дн., норма {n} ч'],
    'hl.ins.cons': ['Barqarorlik', 'Барқарорлик', 'Стабильность'],
    'hl.ins.consSub': ['yotish vaqti bir xilligi', 'ётиш вақти бир хиллиги', 'постоянство отхода ко сну'],
    'hl.ins.avg': ["O'rtacha uyqu", 'Ўртача уйқу', 'Средний сон'],
    'hl.ins.link': ["Bog'liqliklar", 'Боғлиқликлар', 'Связи'],
    'hl.ins.needMore': ["Bog'liqlik uchun kamida {n} kunlik yozuv kerak", 'Боғлиқлик учун камида {n} кунлик ёзув керак', 'Для анализа связей нужно минимум {n} дн. записей'],
    'hl.ins.sleepMoodUp': ['Yaxshi uxlagan kunlardan keyin kayfiyat **{d}** ball yuqori', 'Яхши ухлаган кунлардан кейин кайфият **{d}** балл юқори', 'После хорошего сна настроение выше на **{d}** балла'],
    'hl.ins.sleepMoodDown': ['Yaxshi uxlagan kunlardan keyin kayfiyat **{d}** ball past', 'Яхши ухлаган кунлардан кейин кайфият **{d}** балл паст', 'После хорошего сна настроение ниже на **{d}** балла'],
    'hl.ins.sleepHabitUp': ['Yaxshi uxlagan kunlarda odatlar **{d}%** ko‘p bajarilgan', 'Яхши ухлаган кунларда одатлар **{d}%** кўп бажарилган', 'В дни хорошего сна привычек выполнено на **{d}%** больше'],
    'hl.ins.sleepHabitDown': ['Yaxshi uxlagan kunlarda odatlar **{d}%** kam bajarilgan', 'Яхши ухлаган кунларда одатлар **{d}%** кам бажарилган', 'В дни хорошего сна привычек выполнено на **{d}%** меньше'],
    'hl.ins.ok': ['Sezilarli bog‘liqlik topilmadi', 'Сезиларли боғлиқлик топилмади', 'Заметных связей не найдено'],
    'hl.ins.assoc': ['bog‘liqlik, sabab emas · {n} kun', 'боғлиқлик, сабаб эмас · {n} кун', 'связь, не причина · {n} дн.'],
  };
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  for (const k of Object.keys(T)) { TABLES.uz[k] = T[k][0]; TABLES.uzk[k] = T[k][1]; TABLES.ru[k] = T[k][2]; }
  D.i18n.add(TABLES);

  /* ------------------------------------------------------------------ */
  /* static data                                                         */
  /* ------------------------------------------------------------------ */
  D.i18n.add({ uz: { 'hl.sub.sleep': 'Uyqu', 'hl.sub.strain': "Zo'riqish" }, uzk: { 'hl.sub.sleep': 'Уйқу', 'hl.sub.strain': 'Зўриқиш' }, ru: { 'hl.sub.sleep': 'Сон', 'hl.sub.strain': 'Нагрузка' } });
  const SUBS = ['day', 'sleep', 'strain', 'weight', 'water', 'body'];
  const TAGS = ['uyqusiz', 'ish', 'oila', 'ibodat', 'kasal', 'safar'];
  const MOODS = ['😔', '😐', '🙂', '😄', '🤩'];
  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const esc = D.esc;
  const viewKey = () => { const k = D.ui.viewDate; return k && k <= D.today() ? k : D.today(); };
  const hGet = (k) => D.S.health[k] || null;
  const hEnsure = (k) => (D.S.health[k] = D.S.health[k] || { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const fmtMl = (ml) => (ml >= 1000 ? D.round(ml / 1000, 1) + ' L' : Math.round(ml) + ' ml');
  const signed = (v, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + D.round(Math.abs(v), d);
  const stat = (n, label, o = {}) => `<div class="stat">${o.zone ? `<i class="zone z-${o.zone}"></i>` : ''}<div class="stat-num num ${o.cls || ''}">${n}</div><div class="stat-label">${label}</div>${o.sub ? `<div class="stat-sub">${o.sub}</div>` : ''}</div>`;
  const hmToMin = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '')); return m ? +m[1] * 60 + +m[2] : null; };
  // text / slider input: mutate now, persist a beat later (never rerender — focus must survive)
  const saveSoon = D.debounce(() => D.save(), 300);
  const weightTileHtml = () => { const lw = lastWeight(); return `<div class="stat-num num">${lw ? `${D.round(lw.w, 1)}<small>${D.t('unit.kg')}</small>` : '—'}</div><div class="stat-label">${esc(D.t('hl.tile.lastWeight'))}</div>${lw ? `<div class="stat-sub">${esc(D.fmtDate(lw.k))}</div>` : ''}`; };
  const waterTileHtml = () => { const serv = Math.max(1, Math.ceil(waterTarget().total / servingMl())), w = waterOf(D.today()); return `${w >= serv ? '<i class="zone z-good"></i>' : w >= serv * 0.5 ? '<i class="zone z-warn"></i>' : ''}<div class="stat-num num">${D.fmtNum(w)}<small>/${serv}</small></div><div class="stat-label">${esc(D.t('hl.tile.water'))}</div>`; };
  const deltaLine = (k, w) => { const d7 = deltaDays(7, k); return w === null ? '' : d7 === null ? esc(D.t('hl.day.first')) : deltaHtml(d7) + ` <span class="muted">${esc(D.t('hl.day.delta7'))}</span>`; };

  // memoised weight series (sorted asc) + EWMA trend; invalidated on every state change
  let memo = null;
  D.on('state:changed', () => { memo = null; });
  function weightSeries() {
    if (memo && memo.h === D.S.health) return memo;
    const keys = Object.keys(D.S.health).sort();
    const entries = [];
    for (const k of keys) { const w = num(D.S.health[k] && D.S.health[k].weight); if (w && w > 0) entries.push({ k, w }); }
    const trend = new Array(entries.length);
    for (let i = 0; i < entries.length; i++) trend[i] = i ? 0.1 * entries[i].w + 0.9 * trend[i - 1] : entries[i].w;
    memo = { h: D.S.health, entries, trend, keySet: new Set(entries.map((e) => e.k)) };
    return memo;
  }
  // last entry index with key <= k (binary search), -1 if none
  function idxAtOrBefore(entries, k) {
    let lo = 0, hi = entries.length - 1, r = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (entries[m].k <= k) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }
  function lastWeight() { const s = weightSeries(); return s.entries.length ? s.entries[s.entries.length - 1] : null; }
  function deltaDays(n, refKey) {
    const s = weightSeries();
    const i = refKey ? idxAtOrBefore(s.entries, refKey) : s.entries.length - 1;
    if (i < 0) return null;
    const j = idxAtOrBefore(s.entries, D.addDays(s.entries[i].k, -n));
    if (j < 0 || j === i) return null;
    return s.entries[i].w - s.entries[j].w;
  }
  const deltaHtml = (d, tile) => (d === null ? `<span class="muted">—</span>` : `<span class="hl-delta ${d > 0.05 ? 'warn' : d < -0.05 ? 'good' : 'muted'}">${d > 0.05 ? '↑' : d < -0.05 ? '↓' : '→'} ${signed(d)}${tile ? `<small>${D.t('unit.kg')}</small>` : ' ' + D.t('unit.kg')}</span>`);

  /* ---- water target ---- */
  function waterTarget() {
    const st = D.S.settings, p = D.S.profile;
    const manual = num(st.waterTargetMl);
    if (manual && manual > 0) return { total: manual, manual: true, parts: [] };
    let kg = num(p.weightKg), src = 'profile';
    if (!kg) { const lw = lastWeight(); if (lw) { kg = lw.w; src = 'last'; } else { kg = 70; src = 'default'; } }
    const act = D.clamp(num(p.activity) ?? 3, 0, 5);
    const parts = [
      { k: 'base', v: kg * 35, kg: D.round(kg, 1), src },
      { k: 'activity', v: act * 100, n: act },
      { k: 'sex', v: p.sex === 'm' ? 200 : 0 },
      { k: 'age', v: (num(p.age) || 0) >= 50 ? 100 : 0 },
    ];
    return { total: Math.round(D.sum(parts, (x) => x.v)), manual: false, parts };
  }
  const servingMl = () => Math.max(50, num(D.S.settings.waterMl) || 250);
  const waterOf = (k) => { const h = hGet(k); return h ? +h.water || 0 : 0; };

  /* ---- whoop ---- */
  const zRec = (v) => (v >= 67 ? 'good' : v >= 34 ? 'warn' : 'bad');
  const zSleep = (p) => (p >= 85 ? 'good' : p >= 70 ? '' : 'warn');
  const zStrain = (s) => (s < 6 ? '' : s < 14 ? 'good' : s < 18 ? 'warn' : 'bad');
  const zHrv = (h) => (h >= 60 ? 'good' : h >= 40 ? '' : 'warn');
  const zRhr = (r) => (r <= 55 ? 'good' : r <= 70 ? '' : 'warn');
  const zSpo2 = (s) => (s >= 95 ? 'good' : s >= 92 ? '' : s >= 88 ? 'warn' : 'bad');
  const zResp = (r) => (r >= 12 && r <= 18 ? 'good' : r >= 10 && r <= 22 ? '' : 'warn');
  const zTemp = (t) => (t >= 32.5 && t <= 34 ? 'good' : t >= 31 && t <= 35 ? '' : 'warn');
  const fmtMs = (ms) => D.fmtMins(Math.round(ms / 60000));

  /* ------------------------------------------------------------------ */
  /* render: shell                                                       */
  /* ------------------------------------------------------------------ */
  function render() {
    const sub = SUBS.includes(D.sub('health', 'day')) ? D.sub('health', 'day') : 'day';
    const seg = `<div class="seg hl-seg">${SUBS.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="health" data-sub="${s}">${esc(D.t('hl.sub.' + s))}</button>`).join('')}</div>`;
    const body = { day: renderDay, sleep: renderSleep, strain: renderStrain, weight: renderWeight, water: renderWater, body: renderBody }[sub]();
    // Tana bo'limi o'z AI kartasini (age) panel ichida ko'rsatadi
    const ai = D.ai && (sub === 'day' ? D.ai.card('health') : sub === 'sleep' ? D.ai.card('sleep') : sub === 'strain' ? D.ai.card('strain') : '') || '';
    return `<div class="hl">${seg}${body}${ai}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* DAY                                                                 */
  /* ------------------------------------------------------------------ */
  function dayNav(k) {
    const today = D.today(), ago = D.daysBetween(k, today);
    const subLabel = ago === 0 ? D.t('common.today') : ago === 1 ? D.t('common.yesterday') : D.t('hl.ago', { n: ago });
    return `<div class="date-nav">
      <button class="btn ghost sq" data-act="hlDate" data-n="-1" aria-label="${esc(D.t('hl.day.prev'))}">${D.ic('chevL', 20)}</button>
      <div class="label">${esc(D.fmtDate(k, 'weekday'))}<span class="sub">${esc(subLabel)}${ago ? ` · <button class="hl-link" data-act="hlDateToday">${esc(D.t('btn.today'))}</button>` : ''}</span></div>
      <button class="btn ghost sq" data-act="hlDate" data-n="1" ${ago === 0 ? 'disabled' : ''} aria-label="${esc(D.t('hl.day.next'))}">${D.ic('chevR', 20)}</button></div>`;
  }
  // The watch reads the night and the day better than a form can; when it is connected its
  // pages lead, and the manual fields sit under them for what the watch cannot know.
  const whoopOn = () => !!(D.whoop && D.S.whoop && D.S.whoop.connected);
  function renderSleep() {
    const k = viewKey();
    return dayNav(k) + (whoopOn() ? D.whoop.sleepPage(k) : sleepInsight()) + D.whoop.footer();
  }
  function renderStrain() {
    const k = viewKey();
    return dayNav(k) + (whoopOn() ? D.whoop.strainPage(k) : '') + D.whoop.footer();
  }
  // Tana: WHOOP profili, tana o'lchamlari, sinx va yosh paneli; ulanmagan bo'lsa — ulash kartasi
  function renderBody() {
    // yosh paneli soat ulanmagan bo'lsa ham ko'rinadi; footer ulanmaganda ulash kartasi
    return D.whoop.bodyPanel() + D.whoop.footer();
  }
  function renderDay() {
    const k = viewKey(), today = D.today(), h = hGet(k) || {};
    const nav = dayNav(k);

    // summary tiles
    const lw = lastWeight();
    const last7 = D.lastDays(7, today);
    const sl = [], md = [];
    for (const d of last7) { const r = hGet(d); if (r) { if (num(r.sleep) !== null) sl.push(+r.sleep); if (num(r.mood) !== null) md.push(+r.mood); } }
    const avgSleep = sl.length ? D.round(D.avg(sl), 1) : null, avgMood = md.length ? D.avg(md) : null;
    const wt = waterTarget(), serv = Math.max(1, Math.ceil(wt.total / servingMl()));
    // bento rather than four equal boxes: weight is the day's headline, the rest sit beside it
    const tiles = `<div class="bento hl-tiles">
      <div class="bento-tile b-wide" id="hlTileWeight">${weightTileHtml()}</div>
      <div class="bento-tile">${stat(avgSleep !== null ? `${avgSleep}<small>${D.t('unit.h')}</small>` : '—', D.t('hl.tile.avgSleep'), { zone: avgSleep === null ? '' : avgSleep >= 7 ? 'good' : avgSleep >= 6 ? 'warn' : 'bad' })}</div>
      <div class="bento-tile">${stat(avgMood !== null ? `${MOODS[D.clamp(Math.round(avgMood), 0, 4)]} <small>${D.round(avgMood, 1)}</small>` : '—', D.t('hl.tile.avgMood'))}</div>
      <div class="bento-tile b-wide" id="hlTileWater">${waterTileHtml()}</div>
    </div>`;

    // weight
    const w = num(h.weight);
    const weightBlock = `<div class="hl-field"><div class="hl-lab"><span class="eyebrow">${esc(D.t('hl.day.weight'))}</span><span class="small num" id="hlWDelta">${deltaLine(k, w)}</span></div>
      <div class="input-row"><input class="inp num" type="number" inputmode="decimal" step="0.1" min="20" max="300" value="${w === null ? '' : w}" placeholder="—" data-change="hlWeight" data-key="${esc(k)}" aria-label="${esc(D.t('hl.day.weight'))}"><span class="hl-unit">${D.t('unit.kg')}</span></div></div>`;

    // sleep
    const sleep = num(h.sleep), bedM = hmToMin(h.bed), wakeM = hmToMin(h.wake);
    const calc = bedM !== null && wakeM !== null ? Math.round((((wakeM - bedM + 1440) % 1440) / 60) * 2) / 2 : null;
    const fromWhoop = !!(h && h.sleepFromWhoop);
    const sleepBlock = `<div class="hl-field"><div class="hl-lab"><span class="eyebrow">${esc(D.t('hl.day.sleep'))}${fromWhoop ? ` <span class="wh-auto">${D.ic('bolt', 11)} ${esc(D.t('wh.autoSleep'))}</span>` : ''}</span><span class="num hl-val" id="hlSleepVal">${sleep === null ? '—' : sleep + ' ' + D.t('unit.h')}</span></div>
      <input class="slider" id="hlSleepRange" type="range" min="0" max="12" step="0.5" value="${sleep === null ? 0 : sleep}" data-input="hlSleep" data-key="${k}" aria-label="${esc(D.t('hl.day.sleep'))}">
      <div class="grid2 hl-times">
        <label class="hl-time"><span class="tiny muted">${esc(D.t('hl.day.bed'))}</span><input class="inp sm" type="time" value="${esc(h.bed || '')}" data-change="hlBed" data-key="${k}"></label>
        <label class="hl-time"><span class="tiny muted">${esc(D.t('hl.day.wake'))}</span><input class="inp sm" type="time" value="${esc(h.wake || '')}" data-change="hlWake" data-key="${k}"></label>
      </div><div class="tiny muted" id="hlSleepCalc">${calc !== null ? esc(D.t('hl.day.sleepCalc', { h: calc })) : ''}</div></div>`;

    // water
    const water = +h.water || 0;
    const waterBlock = `<div class="hl-field"><div class="hl-lab"><span class="eyebrow">${esc(D.t('hl.day.water'))}</span><span class="tiny muted">${esc(D.t('hl.wa.serving', { ml: servingMl() }))}</span></div>
      <div class="stepper"><button class="btn ghost sq" data-act="hlWater" data-n="-1" data-key="${k}" aria-label="−">${D.ic('minus')}</button><div class="val" id="hlWaterVal">${D.fmtNum(water)}<small class="muted"> / ${serv}</small></div><button class="btn ghost sq" data-act="hlWater" data-n="1" data-key="${k}" aria-label="+">${D.ic('plus')}</button></div></div>`;

    // mood + tags
    const mood = num(h.mood), tags = Array.isArray(h.tags) ? h.tags : [];
    const moodBlock = `<div class="hl-field"><div class="hl-lab"><span class="eyebrow">${esc(D.t('hl.day.mood'))}</span><span class="small muted">${mood === null ? '' : esc(D.t('hl.mood.' + mood))}</span></div>
      <div class="emoji-row">${MOODS.map((e, i) => `<button class="${mood === i ? 'on' : ''}" data-act="hlMood" data-v="${i}" data-key="${k}" aria-label="${esc(D.t('hl.mood.' + i))}">${e}</button>`).join('')}</div>
      <div class="row wrap hl-tags">${TAGS.map((t) => `<button class="pill ${tags.includes(t) ? 'on' : ''}" data-act="hlTag" data-tag="${t}" data-key="${k}">${esc(D.t('hl.tag.' + t))}</button>`).join('')}</div></div>`;

    const noteBlock = `<div class="hl-field"><div class="hl-lab"><span class="eyebrow">${esc(D.t('common.note'))}</span></div>
      <textarea class="ta" rows="3" maxlength="2000" placeholder="${esc(D.t('hl.day.notePh'))}" data-input="hlNote" data-key="${esc(k)}" aria-label="${esc(D.t('common.note'))}">${esc(h.note || '')}</textarea></div>`;

    const wh = whoopOn() ? D.whoop.hero(k) : '';
    return `${nav}${wh}${tiles}<div class="card hl-daycard"><div class="card-head"><div class="title">${D.ic('heart')} ${esc(D.t('hl.day.log'))}</div></div>
      <div class="hl-form">${weightBlock}${sleepBlock}${waterBlock}${moodBlock}${noteBlock}</div></div>${whoopOn() ? '' : sleepInsight()}${D.whoop.footer()}`;
  }

  D.act.hlDate = (el) => { const k = D.addDays(viewKey(), +el.dataset.n || 0); D.ui.viewDate = k >= D.today() ? null : k; D.saveUi(); D.rerender(); };
  D.act.hlDateToday = () => { D.ui.viewDate = null; D.saveUi(); D.rerender(); };
  D.act.hlWeight = (el) => {
    const k = el.dataset.key || viewKey(), rec = hEnsure(k), v = num(el.value);
    rec.weight = v && v >= 20 && v <= 400 ? D.round(v, 1) : null;
    if (rec.weight === null) el.value = '';
    D.save();
    D.patch('hlWDelta', deltaLine(k, rec.weight));
    D.patch('hlTileWeight', weightTileHtml());
  };
  D.act.hlSleep = (el) => { const rec = hEnsure(el.dataset.key || viewKey()); rec.sleep = D.clamp(+el.value || 0, 0, 12); delete rec.sleepFromWhoop; saveSoon(); D.patch('hlSleepVal', rec.sleep + ' ' + D.t('unit.h')); };
  function setBedWake(el, field) {
    const rec = hEnsure(el.dataset.key || viewKey());
    rec[field] = el.value || null;
    const b = hmToMin(rec.bed), w = hmToMin(rec.wake);
    if (b !== null && w !== null) {
      rec.sleep = Math.round((((w - b + 1440) % 1440) / 60) * 2) / 2;
      D.patch('hlSleepVal', rec.sleep + ' ' + D.t('unit.h'));
      D.patch('hlSleepCalc', esc(D.t('hl.day.sleepCalc', { h: rec.sleep })));
      const r = D.$('#hlSleepRange'); if (r) r.value = rec.sleep;
    }
    D.save();
  }
  D.act.hlBed = (el) => setBedWake(el, 'bed');
  D.act.hlWake = (el) => setBedWake(el, 'wake');
  D.act.hlWater = (el) => {
    const k = el.dataset.key || D.today(), rec = hEnsure(k);
    rec.water = Math.max(0, D.round((+rec.water || 0) + (+el.dataset.n || 0), 1));
    D.save();
    if (el.dataset.re === '1') { D.rerender(); return; }
    const serv = Math.max(1, Math.ceil(waterTarget().total / servingMl()));
    D.patch('hlWaterVal', `${D.fmtNum(rec.water)}<small class="muted"> / ${serv}</small>`);
    if (k === D.today()) D.patch('hlTileWater', waterTileHtml());
  };
  D.act.hlMood = (el) => { const rec = hEnsure(el.dataset.key || viewKey()); const v = D.clamp(+el.dataset.v || 0, 0, 4); rec.mood = rec.mood === v ? null : v; D.save(); D.rerender(); };
  D.act.hlTag = (el) => { const rec = hEnsure(el.dataset.key || viewKey()); rec.tags = Array.isArray(rec.tags) ? rec.tags : []; const t = el.dataset.tag; if (!TAGS.includes(t)) return; const i = rec.tags.indexOf(t); if (i < 0) rec.tags.push(t); else rec.tags.splice(i, 1); D.save(); D.rerender(); };
  D.act.hlNote = (el) => { const rec = hEnsure(el.dataset.key || viewKey()); rec.note = String(el.value || '').slice(0, 2000); saveSoon(); };

  /* ------------------------------------------------------------------ */
  /* WEIGHT                                                              */
  /* ------------------------------------------------------------------ */
  function renderWeight() {
    const s = weightSeries(), n = s.entries.length;
    if (!n) return `<div class="card"><div class="empty">${esc(D.t('hl.w.empty'))}</div></div>`;
    const cur = s.entries[n - 1], d7 = deltaDays(7), d30 = deltaDays(30), streak = D.streak(s.keySet);
    const hCm = num(D.S.profile.heightCm);
    let bmi = null, bmiCls = '', bmiZone = '';
    if (hCm && hCm > 0) { bmi = D.round(cur.w / Math.pow(hCm / 100, 2), 1); bmiCls = bmi < 18.5 ? 'under' : bmi < 25 ? 'normal' : bmi < 30 ? 'over' : 'obese'; bmiZone = bmiCls === 'normal' ? 'good' : bmiCls === 'obese' ? 'bad' : 'warn'; }
    const tiles = `<div class="stat-grid hl-wtiles">
      ${stat(`${D.round(cur.w, 1)}<small>${D.t('unit.kg')}</small>`, D.t('hl.w.current'), { sub: esc(D.fmtDate(cur.k)) })}
      ${stat(deltaHtml(d7, true), D.t('hl.w.d7'))}
      ${stat(deltaHtml(d30, true), D.t('hl.w.d30'))}
      ${stat(`${streak}<small>${D.t('unit.days')}</small>`, D.t('hl.w.streak'), { zone: streak >= 7 ? 'good' : streak >= 3 ? 'warn' : '' })}
      ${bmi !== null ? stat(bmi, 'BMI', { zone: bmiZone, sub: esc(D.t('hl.w.bmi.' + bmiCls)) }) : stat('—', 'BMI', { sub: esc(D.t('hl.w.noHeight')) })}
    </div>`;

    // range + chart
    const range = [30, 90, 365].includes(+D.ui.filters.hlRange) ? +D.ui.filters.hlRange : 90;
    const from = D.addDays(D.today(), -range);
    let startIdx = idxAtOrBefore(s.entries, from); if (startIdx < 0) startIdx = 0;
    const vals = [], tr = [];
    for (let i = startIdx; i < n; i++) { vals.push(s.entries[i].w); tr.push(s.trend[i]); }
    const tabs = `<div class="tabs hl-range">${[30, 90, 365].map((r) => `<button class="${range === r ? 'on' : ''}" data-act="hlRange" data-r="${r}">${esc(r === 365 ? D.t('hl.year1') : D.t('hl.days', { n: r }))}</button>`).join('')}</div>`;
    let chart;
    if (vals.length < 2) chart = `<div class="empty small">${esc(D.t('hl.w.few'))}</div>`;
    else {
      const lo = Math.min(...vals, ...tr), hi = Math.max(...vals, ...tr), padV = Math.max(0.3, (hi - lo) * 0.08);
      const mn = lo - padV, mx = hi + padV;
      const H = 120;
      chart = `<div class="hl-chart" style="height:${H}px">
        <div class="hl-layer">${D.chart.spark({ values: vals, color: 'var(--success)', height: H, fill: true, min: mn, max: mx })}</div>
        <div class="hl-layer hl-trend">${D.chart.spark({ values: tr, color: 'var(--warning)', height: H, fill: false, min: mn, max: mx })}</div>
        <span class="hl-minmax hl-max num">${D.round(hi, 1)}</span><span class="hl-minmax hl-min num">${D.round(lo, 1)}</span></div>
        <div class="spark-labels hl-axis"><span>${esc(D.fmtDate(s.entries[startIdx].k, 'dm'))}</span><span>${esc(D.fmtDate(cur.k, 'dm'))}</span></div>
        <div class="legend"><span><i class="hl-leg" style="background:var(--success)"></i>${esc(D.t('hl.w.daily'))}</span><span><i class="hl-leg" style="background:var(--warning)"></i>${esc(D.t('hl.w.trend'))} <span class="muted">(${esc(D.t('hl.wh.trendLegend'))})</span></span></div>`;
    }
    // weekly rate from trend
    const tNow = s.trend[n - 1], j = idxAtOrBefore(s.entries, D.addDays(cur.k, -7));
    const rate = j >= 0 && j !== n - 1 ? tNow - s.trend[j] : null;
    const fast = rate !== null && Math.abs(rate) / cur.w > 0.01;
    const rateRow = rate === null ? '' : `<div class="hl-rate ${fast ? 'bad' : 'good'}">${D.ic(fast ? 'alert' : 'check', 16)}<span>${esc(D.t('hl.w.rate'))}: <b class="num">${signed(rate, 2)} ${D.t('unit.kg')}</b> · ${esc(D.t(fast ? 'hl.w.rateFast' : 'hl.w.rateOk'))}</span></div>`;

    const list = s.entries.slice(-10).reverse().map((e, i, arr) => {
      const prev = idxAtOrBefore(s.entries, D.addDays(e.k, -1));
      const d = prev >= 0 ? e.w - s.entries[prev].w : null;
      return `<li class="li"><div class="li-body"><div class="li-text num">${D.round(e.w, 1)} ${D.t('unit.kg')}</div><div class="li-meta">${esc(D.fmtDate(e.k, 'weekday'))}${d !== null ? ' · ' + deltaHtml(d) : ''}</div></div>
        <button class="li-del" data-act="hlWeightDel" data-key="${e.k}" aria-label="${esc(D.t('btn.delete'))}">${D.ic('trash', 16)}</button></li>`;
    }).join('');

    return `${tiles}<div class="card"><div class="card-head"><div class="title">${D.ic('scale')} ${esc(D.t('hl.w.chart'))}</div>${tabs}</div>${chart}${rateRow}</div>
      <div class="section-title">${esc(D.t('hl.w.entries'))}<span class="right num">${n}</span></div><ul class="list">${list}</ul>`;
  }
  D.act.hlRange = (el) => { D.ui.filters.hlRange = +el.dataset.r; D.saveUi(); D.rerender(); };
  D.act.hlWeightDel = (el) => {
    const k = el.dataset.key, rec = hGet(k); if (!rec) return;
    const prev = rec.weight; rec.weight = null;
    D.undo.push({ label: D.t('hl.w.deleted'), undo: () => { hEnsure(k).weight = prev; } });
    D.save(); D.rerender();
    D.toast(D.t('hl.w.deleted'), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* WATER                                                               */
  /* ------------------------------------------------------------------ */
  function renderWater() {
    const today = D.today(), wt = waterTarget(), ml = servingMl(), serv = Math.max(1, Math.ceil(wt.total / ml));
    const done = waterOf(today), pct = (done / serv) * 100, doneMl = done * ml;
    const tip = done === 0 ? 'hl.wa.tip0' : pct < 50 ? 'hl.wa.tipLow' : pct < 100 ? 'hl.wa.tipMid' : pct < 130 ? 'hl.wa.tipDone' : 'hl.wa.tipOver';
    const color = pct >= 100 ? 'var(--success)' : 'var(--info)';
    const ring = D.chart.ring({ pct, size: 150, stroke: 11, color, label: `${D.fmtNum(done)}<span class="hl-ring-of">/${serv}</span>`, sub: `${fmtMl(doneMl)} · ${fmtMl(wt.total)}` });
    const why = !!D.ui.collapsed.hlWhy;
    const whyRows = wt.manual ? `<div class="hl-why-row"><span>${esc(D.t('hl.wa.manual'))}</span><b class="num">${fmtMl(wt.total)}</b></div>` : wt.parts.filter((p) => p.v > 0).map((p) => {
      const label = p.k === 'base' ? `${D.t('hl.wa.base', { kg: p.kg })} <span class="muted">(${esc(D.t('hl.wa.src' + (p.src === 'profile' ? 'Profile' : p.src === 'last' ? 'Last' : 'Default')))})</span>` : p.k === 'activity' ? esc(D.t('hl.wa.activity', { n: p.n })) : esc(D.t('hl.wa.' + p.k));
      return `<div class="hl-why-row"><span>${p.k === 'base' ? '' : '+ '}${label}</span><b class="num">${fmtMl(p.v)}</b></div>`;
    }).join('');
    const hero = `<div class="card hl-water"><div class="row hl-water-row">${ring}<div class="grow stack">
        <div class="eyebrow">${esc(D.t('hl.wa.target'))}</div><div class="kpi"><span class="kpi-num">${serv}</span><span class="kpi-total">${D.t('unit.glass')} · ${fmtMl(wt.total)}</span></div>
        <div class="small ${pct >= 100 ? 'good' : 'muted'}">${esc(D.t(tip, { n: Math.max(0, serv - Math.floor(done)) }))}</div></div></div>
      <div class="hl-water-btns"><button class="btn ghost sq" data-act="hlWater" data-n="-1" data-key="${today}" data-re="1" ${done <= 0 ? 'disabled' : ''} aria-label="−">${D.ic('minus', 20)}</button>
        <button class="btn hl-plus" data-act="hlWater" data-n="1" data-key="${today}" data-re="1">${D.ic('droplet')} +1 ${D.t('unit.glass')}</button>
        <button class="btn ghost" data-act="hlWaterCustom" data-key="${today}">${esc(D.t('hl.wa.custom'))}</button></div>
      <button class="hl-why-toggle" data-act="hlWhy" aria-expanded="${why}"><span>${esc(D.t('hl.wa.why'))}</span>${D.ic('chevD', 16)}</button>
      <div class="hl-why-body" ${why ? '' : 'hidden'}>${whyRows}<div class="hl-why-row total"><span>${esc(D.t('hl.wa.total'))}</span><b class="num">${fmtMl(wt.total)} ≈ ${serv} ${D.t('unit.glass')}</b></div></div></div>`;

    const days = D.lastDays(14, today);
    const bars = D.chart.bars({ values: days.map((k) => waterOf(k) * ml), labels: days.map((k) => String(D.parseKey(k).d)), color: 'var(--info)', height: 80, target: wt.total, colors: days.map((k) => (waterOf(k) * ml >= wt.total ? 'var(--success)' : 'var(--info)')) })
      + `<div class="legend"><span><i class="hl-leg" style="background:var(--success)"></i>${esc(D.t('hl.wa.target'))}</span><span><i class="hl-leg hl-leg-dash"></i>${esc(D.t('hl.wa.total'))} <b class="num">${fmtMl(wt.total)}</b></span></div>`;
    const hist = D.lastDays(7, today).reverse().map((k) => { const v = waterOf(k), p = D.clamp((v / serv) * 100, 0, 100); return `<div class="hl-hist"><span class="hl-hist-d">${esc(D.fmtDate(k, 'dm'))}</span><span class="bar"><i class="bar-fill" style="width:${p.toFixed(0)}%;background:${v >= serv ? 'var(--success)' : 'var(--info)'}"></i></span><span class="num hl-hist-n">${D.fmtNum(v)}/${serv}</span></div>`; }).join('');
    return `${hero}<div class="card"><div class="card-head"><div class="title">${D.ic('chart')} ${esc(D.t('hl.wa.days14'))}</div></div>${bars}</div>
      <div class="card"><div class="card-head"><div class="title">${D.ic('list')} ${esc(D.t('hl.wa.history'))}</div></div>${hist}</div>`;
  }
  D.act.hlWhy = () => { D.ui.collapsed.hlWhy = !D.ui.collapsed.hlWhy; D.saveUi(); D.rerender(); };
  D.act.hlWaterCustom = async (el) => {
    const v = await D.prompt({ title: D.t('hl.wa.customPrompt'), placeholder: '330', value: '' });
    const ml = num(v); if (!ml || ml <= 0) return;
    const rec = hEnsure(el.dataset.key || D.today());
    rec.water = D.round((+rec.water || 0) + ml / servingMl(), 1);
    D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* sleep & recovery insight                                            */
  /* ------------------------------------------------------------------ */
  const SLEEP_TARGET = 7.5;
  const MIN_PAIRS = 10;
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const stdev = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); };
  // Bedtimes after noon belong to the evening before, so 23:40 and 00:20 sit next to each other.
  const bedMin = (v) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || '')); if (!m) return null; let t = +m[1] * 60 + +m[2]; if (t < 12 * 60) t += 24 * 60; return t; };

  function sleepInsight() {
    const sl = [], beds = [];
    for (const k of D.lastDays(14)) {
      const r = D.S.health[k]; if (!r) continue;
      const v = num(r.sleep); if (v !== null) sl.push(v);
      const b = bedMin(r.bed); if (b !== null) beds.push(b);
    }
    if (sl.length < 3) return '';
    const debt = D.round(sl.reduce((s, x) => s + Math.max(0, SLEEP_TARGET - x), 0), 1);
    const avg = D.round(mean(sl), 1);
    const cons = beds.length >= 3 ? Math.max(0, Math.min(100, Math.round(100 - (stdev(beds) / 120) * 100))) : null;
    const zDebt = debt <= 3 ? 'z-good' : debt <= 10 ? 'z-warn' : 'z-bad';
    const zAvg = avg >= 7 ? 'z-good' : avg >= 6 ? 'z-warn' : 'z-bad';
    const zCons = cons === null ? '' : cons >= 75 ? 'z-good' : cons >= 50 ? 'z-warn' : 'z-bad';
    const tiles = `<div class="stat-grid">
      <div class="stat"><span class="zone ${zDebt}"></span><div class="stat-num num">${debt}<small>${esc(D.t('unit.h'))}</small></div><div class="stat-label">${esc(D.t('hl.ins.debt'))}</div><div class="stat-sub">${esc(D.t('hl.ins.debtSub', { n: SLEEP_TARGET }))}</div></div>
      <div class="stat"><span class="zone ${zAvg}"></span><div class="stat-num num">${avg}<small>${esc(D.t('unit.h'))}</small></div><div class="stat-label">${esc(D.t('hl.ins.avg'))}</div></div>
      ${cons !== null ? `<div class="stat"><span class="zone ${zCons}"></span><div class="stat-num num">${cons}<small>%</small></div><div class="stat-label">${esc(D.t('hl.ins.cons'))}</div><div class="stat-sub">${esc(D.t('hl.ins.consSub'))}</div></div>` : ''}
    </div>`;
    return `<div class="card"><div class="card-head"><div class="title">${D.ic('moon', 16)} ${esc(D.t('hl.ins'))}</div></div>${tiles}${linksHtml()}</div>`;
  }

  // Split-mean comparisons over 60 days. Association only, and only above a floor of paired days.
  function linksHtml() {
    const days = D.lastDays(60);
    const sleepOf = (k) => { const r = D.S.health[k]; return r ? num(r.sleep) : null; };
    const moodOf = (k) => { const r = D.S.health[k]; return r ? num(r.mood) : null; };
    const habitOf = (k) => { const due = D.dueHabits(k); if (!due.length) return null; return (due.filter((h) => D.habitDone(h, k)).length / due.length) * 100; };
    const split = (pairs) => {
      if (pairs.length < MIN_PAIRS) return null;
      const sorted = pairs.map((p) => p[0]).slice().sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      const hi = pairs.filter((p) => p[0] >= med).map((p) => p[1]);
      const lo = pairs.filter((p) => p[0] < med).map((p) => p[1]);
      if (hi.length < 3 || lo.length < 3) return null;
      return { d: mean(hi) - mean(lo), n: pairs.length };
    };
    const rows = [];
    const pSM = [], pSH = [];
    for (const k of days) {
      const s = sleepOf(k);
      const mNext = moodOf(D.addDays(k, 1));
      if (s !== null && mNext !== null) pSM.push([s, mNext]);
      const h = habitOf(k);
      if (s !== null && h !== null) pSH.push([s, h]);
    }
    // Each sentence has an up/down form so a negative delta never reads as "higher".
    const sm = split(pSM);
    if (sm && Math.abs(sm.d) >= 0.3) rows.push({ txt: D.t(sm.d > 0 ? 'hl.ins.sleepMoodUp' : 'hl.ins.sleepMoodDown', { d: D.round(Math.abs(sm.d), 1) }), n: sm.n, good: sm.d > 0 });
    const sh = split(pSH);
    if (sh && Math.abs(sh.d) >= 5) rows.push({ txt: D.t(sh.d > 0 ? 'hl.ins.sleepHabitUp' : 'hl.ins.sleepHabitDown', { d: Math.round(Math.abs(sh.d)) }), n: sh.n, good: sh.d > 0 });

    const head = `<div class="hl-links"><div class="eyebrow mb-s">${esc(D.t('hl.ins.link'))}</div>`;
    if (!rows.length) {
      const maxN = Math.max(pSM.length, pSH.length);
      return head + `<div class="empty">${esc(maxN < MIN_PAIRS ? D.t('hl.ins.needMore', { n: MIN_PAIRS }) : D.t('hl.ins.ok'))}</div></div>`;
    }
    const strip = (h) => h.replace(/^<p>/, '').replace(/<\/p>$/, '');
    return head + rows.map((r) => `<div class="hl-corr ${r.good ? 'good' : 'warn'}">${D.ic(r.good ? 'trend' : 'trendDown', 15)}
      <span class="grow">${D.ai ? strip(D.ai.md(r.txt)) : esc(r.txt)}</span>
      <span class="tiny muted">${esc(D.t('hl.ins.assoc', { n: r.n }))}</span></div>`).join('') + '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* WHOOP                                                               */
  /* ------------------------------------------------------------------ */
  D.act.hlWhoopConnect = () => {
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    // Cookie session carries the browser navigation; tokens are stored server-side per uid.
    // (D.tg guards stay null-safe for a legacy in-app webview — no Telegram shell is shipped.)
    const q = D.tg && D.tg.initData ? '?initData=' + encodeURIComponent(D.tg.initData) : '';
    const url = location.origin + '/api/whoop/login' + q;
    if (D.tg && D.tg.openLink) { try { D.tg.openLink(url); return; } catch (e) {} }
    location.href = url;
  };
  const whoopErr = (e) => { const m = String((e && e.message) || e); return m === 'not_connected' ? D.t('hl.wh.notConnected') : m === 'whoop_not_configured' ? D.t('hl.wh.notConfigured') : D.t('hl.wh.err', { e: m.slice(0, 60) }); };
  D.act.hlWhoopDisconnect = async () => {
    const ok = await D.confirm({ title: D.t('hl.wh.disconnect'), text: D.t('hl.wh.disconnectQ'), ok: D.t('hl.wh.disconnect'), danger: true });
    if (!ok) return;
    // the server keeps the tokens and re-asserts whoop.connected on every pull — revoke there first
    if (D.serverEnabled()) { try { await D.api('/api/whoop/disconnect', { method: 'POST', body: '{}' }); } catch (e) { D.toast(whoopErr(e), { ms: 4000 }); return; } }
    D.S.whoop.connected = false; D.S.whoop.cache = {}; D.S.whoop.lastSync = null;
    D.save(); D.rerender(); D.toast(D.t('hl.wh.disconnected'));
  };
  let syncing = false;
  D.act.hlWhoopCheck = async () => {
    if (syncing) return;
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    try {
      const st = await D.api('/api/whoop/status');
      if (st && st.configured === false) { D.toast(D.t('hl.wh.notConfigured'), { ms: 4000 }); return; }
      if (!st || !st.connected) { D.toast(D.t('hl.wh.notConnected'), { ms: 4000 }); return; }
      D.S.whoop.connected = true; D.save(); D.rerender();
      return D.act.hlWhoopRefresh();
    } catch (e) { D.toast(whoopErr(e), { ms: 4000 }); }
  };
  D.act.hlWhoopRefresh = async () => {
    if (syncing) return;
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    syncing = true;
    const btn = D.$('#hlWhRefresh'); if (btn) btn.disabled = true;
    try {
      // the server pulls WHOOP on its own clock; this asks it to go now and waits for the snapshot to move
      const r = await D.whoop.sync();
      D.rerender();
      D.toast(r && r.days ? D.t('wh.pulled', { n: r.days }) : D.t('hl.wh.noData'), { ms: 3000 });
    } catch (e) {
      D.toast(whoopErr(e), { ms: 4000 });
    } finally { syncing = false; const b = D.$('#hlWhRefresh'); if (b) b.disabled = false; }
  };

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'health', icon: 'heart', order: 20, nav: true, primary: true,
    render,
  });
})();
