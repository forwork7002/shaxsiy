/* =====================================================================
   Dash — Спорт: Progressive Overload Coach.
   One top set per exercise per session → prescription for the next one.
   State: D.S.gym { gyms, days, exercises, logs:{exId:[{id,w,reps,date,ts,pr}]}, done:{date:ts}, split:{names,anchor:{date,i}} }
   Weights are stored in kg; displayed via settings.weightUnit.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'gym.title': 'Progressiv yuklama', 'gym.sub.log': 'Mashq', 'gym.sub.today': 'Bugun', 'gym.sub.history': 'Tarix',
      'gym.gym': 'Zal', 'gym.day': 'Kun', 'gym.both': 'Barcha zallar', 'gym.addGym': "Zal qo'shish", 'gym.addDay': "Kun qo'shish",
      'gym.newGym': 'Yangi zal nomi', 'gym.newDay': 'Yangi kun nomi', 'gym.manage': 'Boshqarish', 'gym.gyms': 'Zallar', 'gym.days': 'Kunlar',
      'gym.minOne': 'Kamida bittasi qolishi kerak', 'gym.gymDeleted': "Zal o'chirildi", 'gym.dayDeleted': "Kun o'chirildi",
      'gym.exercise': 'Mashq', 'gym.exercises': 'Mashqlar', 'gym.noEx': "Bu zal va kunda mashq yo'q", 'gym.addEx': "Mashq qo'shish", 'gym.editEx': 'Mashqni tahrirlash',
      'gym.repRange': "Takror oralig'i", 'gym.repMin': 'Min takror', 'gym.repMax': 'Max takror', 'gym.step': 'Qadam', 'gym.startWeight': "Boshlang'ich og'irlik",
      'gym.bw': 'Tana vazni', 'gym.bwTag': 'BW', 'gym.bwHint': 'Tana vazni — faqat takrorlar yoziladi', 'gym.nameReq': 'Nom kiritilishi shart',
      'gym.delEx': "Mashqni o'chirish", 'gym.delExText': "«{name}» va uning {n} ta yozuvi o'chiriladi", 'gym.deleted': "Mashq o'chirildi",
      'gym.last': 'Oxirgi set', 'gym.next': 'Keyingi set', 'gym.ago.days': '{n} kun oldin',
      'gym.rx.start': 'Boshlang', 'gym.rx.up': "Og'irlik qo'shing", 'gym.rx.hold': "Takror qo'shing", 'gym.rx.down': "Og'irlikni kamaytiring", 'gym.rx.repeat': 'Takrorlang',
      'gym.rx.startWhy': "{min}–{max} takror qiling. Birinchi yozuvdan so'ng murabbiy maslahat bera boshlaydi.",
      'gym.rx.bwStartWhy': "{min}–{max} toza takror qiling. {max}+ chiqsangiz — ko'proqqa intiling.",
      'gym.rx.upWhy': "{reps} takror — zo'r! {step} qo'shing va {min} takrorga chiqing.",
      'gym.rx.holdWhy': "{reps} takror — mo'ljalda. Shu og'irlikda {next} takrorga intiling.",
      'gym.rx.downWhy': "{reps} takror — {min} dan kam. Og'irlikni kamaytirib, toza bajaring.",
      'gym.rx.bwUpWhy': '{reps} takror — kuchli! Keyingi safar {next} ga intiling.',
      'gym.rx.bwRepeatWhy': '{reps} takror yetmadi. {min}+ chiqquncha takrorlang.',
      'gym.weight': "Og'irlik", 'gym.reps': 'Takror', 'gym.repsShort': 'takr.', 'gym.logSet': 'Setni saqlash',
      'gym.pickReps': 'Takror sonini tanlang', 'gym.enterWeight': "Og'irlikni kiriting", 'gym.saved': 'Set saqlandi', 'gym.pr': 'Yangi rekord!', 'gym.prTag': 'PR',
      'gym.sessions': "Mashg'ulot", 'gym.best1rm': 'Eng yaxshi 1RM', 'gym.bestReps': "Eng ko'p takror", 'gym.vol7': 'Hajm · 7 kun',
      'gym.trend': 'Kuch dinamikasi · 1RM', 'gym.trendEmpty': "Trend uchun kamida 2 ta mashg'ulot kerak",
      'gym.history': 'Tarix', 'gym.noHistory': "Hali yozuv yo'q", 'gym.setDeleted': "Set o'chirildi",
      'gym.todayWorkout': "Bugungi mashg'ulot", 'gym.sets': '{n} set', 'gym.setsLabel': 'set', 'gym.lifted': "ko'tarildi", 'gym.markDone': "Mashg'ulot bajarildi", 'gym.doneMark': 'Bajarildi',
      'gym.noneToday': "Bugun hali set yo'q — «Mashq» bo'limida yozing", 'gym.planned': 'Reja', 'gym.extra': "Qo'shimcha", 'gym.volume': 'Hajm',
      'gym.streak': 'Haftalik seriya', 'gym.weeks': '{n} hafta', 'gym.heat': 'Oxirgi 28 kun', 'gym.doneDays': 'Bajarilgan kunlar',
      'gym.split': 'Aylanma (split)', 'gym.splitDay': '{name} kuni', 'gym.rest': 'Dam', 'gym.restDay': 'Dam kuni', 'gym.splitEmpty': 'Aylanma sozlanmagan',
      'gym.anchor': 'Boshlanish', 'gym.editSplit': 'Aylanmani tahrirlash', 'gym.todayIs': 'Bugun →', 'gym.newDayName': 'Yangi kun', 'gym.cycle': 'Sikl',
      'gym.past': "O'tgan mashg'ulotlar", 'gym.noPast': "Hali o'tgan mashg'ulot yo'q",
      'gym.seed.home': 'Uy', 'gym.seed.comm': 'Zal', 'gym.seed.push': 'Push', 'gym.seed.pull': 'Pull', 'gym.seed.legs': 'Oyoq', 'gym.seed.rest': 'Dam',
      'gym.seed.bench': 'Shtanga jim (bench)', 'gym.seed.ohp': 'Yelka jim (OHP)', 'gym.seed.tricep': 'Tritseps (blok)', 'gym.seed.pullup': 'Turnik (tortilish)',
      'gym.seed.row': 'Shtanga tortish (row)', 'gym.seed.curl': 'Bitseps (gantel)', 'gym.seed.squat': 'Prised (shtanga)', 'gym.seed.rdl': 'Ruminiya tortishi (RDL)', 'gym.seed.legpress': 'Oyoq press',
    },
    uzk: {
      'gym.title': 'Прогрессив юклама', 'gym.sub.log': 'Машқ', 'gym.sub.today': 'Бугун', 'gym.sub.history': 'Тарих',
      'gym.gym': 'Зал', 'gym.day': 'Кун', 'gym.both': 'Барча заллар', 'gym.addGym': 'Зал қўшиш', 'gym.addDay': 'Кун қўшиш',
      'gym.newGym': 'Янги зал номи', 'gym.newDay': 'Янги кун номи', 'gym.manage': 'Бошқариш', 'gym.gyms': 'Заллар', 'gym.days': 'Кунлар',
      'gym.minOne': 'Камида биттаси қолиши керак', 'gym.gymDeleted': 'Зал ўчирилди', 'gym.dayDeleted': 'Кун ўчирилди',
      'gym.exercise': 'Машқ', 'gym.exercises': 'Машқлар', 'gym.noEx': 'Бу зал ва кунда машқ йўқ', 'gym.addEx': 'Машқ қўшиш', 'gym.editEx': 'Машқни таҳрирлаш',
      'gym.repRange': 'Такрор оралиғи', 'gym.repMin': 'Мин такрор', 'gym.repMax': 'Макс такрор', 'gym.step': 'Қадам', 'gym.startWeight': 'Бошланғич оғирлик',
      'gym.bw': 'Тана вазни', 'gym.bwTag': 'BW', 'gym.bwHint': 'Тана вазни — фақат такрорлар ёзилади', 'gym.nameReq': 'Ном киритилиши шарт',
      'gym.delEx': 'Машқни ўчириш', 'gym.delExText': '«{name}» ва унинг {n} та ёзуви ўчирилади', 'gym.deleted': 'Машқ ўчирилди',
      'gym.last': 'Охирги сет', 'gym.next': 'Кейинги сет', 'gym.ago.days': '{n} кун олдин',
      'gym.rx.start': 'Бошланг', 'gym.rx.up': 'Оғирлик қўшинг', 'gym.rx.hold': 'Такрор қўшинг', 'gym.rx.down': 'Оғирликни камайтиринг', 'gym.rx.repeat': 'Такрорланг',
      'gym.rx.startWhy': '{min}–{max} такрор қилинг. Биринчи ёзувдан сўнг мураббий маслаҳат бера бошлайди.',
      'gym.rx.bwStartWhy': '{min}–{max} тоза такрор қилинг. {max}+ чиқсангиз — кўпроққа интилинг.',
      'gym.rx.upWhy': '{reps} такрор — зўр! {step} қўшинг ва {min} такрорга чиқинг.',
      'gym.rx.holdWhy': '{reps} такрор — мўлжалда. Шу оғирликда {next} такрорга интилинг.',
      'gym.rx.downWhy': '{reps} такрор — {min} дан кам. Оғирликни камайтириб, тоза бажаринг.',
      'gym.rx.bwUpWhy': '{reps} такрор — кучли! Кейинги сафар {next} га интилинг.',
      'gym.rx.bwRepeatWhy': '{reps} такрор етмади. {min}+ чиққунча такрорланг.',
      'gym.weight': 'Оғирлик', 'gym.reps': 'Такрор', 'gym.repsShort': 'такр.', 'gym.logSet': 'Сетни сақлаш',
      'gym.pickReps': 'Такрор сонини танланг', 'gym.enterWeight': 'Оғирликни киритинг', 'gym.saved': 'Сет сақланди', 'gym.pr': 'Янги рекорд!', 'gym.prTag': 'PR',
      'gym.sessions': 'Машғулот', 'gym.best1rm': 'Энг яхши 1RM', 'gym.bestReps': 'Энг кўп такрор', 'gym.vol7': 'Ҳажм · 7 кун',
      'gym.trend': 'Куч динамикаси · 1RM', 'gym.trendEmpty': 'Тренд учун камида 2 та машғулот керак',
      'gym.history': 'Тарих', 'gym.noHistory': 'Ҳали ёзув йўқ', 'gym.setDeleted': 'Сет ўчирилди',
      'gym.todayWorkout': 'Бугунги машғулот', 'gym.sets': 'Сетов: {n}', 'gym.setsLabel': 'сетов', 'gym.lifted': 'кўтарилди', 'gym.markDone': 'Машғулот бажарилди', 'gym.doneMark': 'Бажарилди',
      'gym.noneToday': 'Бугун ҳали сет йўқ — «Машқ» бўлимида ёзинг', 'gym.planned': 'Режа', 'gym.extra': 'Қўшимча', 'gym.volume': 'Ҳажм',
      'gym.streak': 'Ҳафталик серия', 'gym.weeks': '{n} ҳафта', 'gym.heat': 'Охирги 28 кун', 'gym.doneDays': 'Бажарилган кунлар',
      'gym.split': 'Айланма (сплит)', 'gym.splitDay': '{name} куни', 'gym.rest': 'Дам', 'gym.restDay': 'Дам куни', 'gym.splitEmpty': 'Айланма созланмаган',
      'gym.anchor': 'Бошланиш', 'gym.editSplit': 'Айланмани таҳрирлаш', 'gym.todayIs': 'Бугун →', 'gym.newDayName': 'Янги кун', 'gym.cycle': 'Цикл',
      'gym.past': 'Ўтган машғулотлар', 'gym.noPast': 'Ҳали ўтган машғулот йўқ',
      'gym.seed.home': 'Уй', 'gym.seed.comm': 'Зал', 'gym.seed.push': 'Пуш', 'gym.seed.pull': 'Пулл', 'gym.seed.legs': 'Оёқ', 'gym.seed.rest': 'Дам',
      'gym.seed.bench': 'Штанга жим (bench)', 'gym.seed.ohp': 'Елка жим (OHP)', 'gym.seed.tricep': 'Трицепс (блок)', 'gym.seed.pullup': 'Турник (тортилиш)',
      'gym.seed.row': 'Штанга тортиш (row)', 'gym.seed.curl': 'Бицепс (гантел)', 'gym.seed.squat': 'Присед (штанга)', 'gym.seed.rdl': 'Руминия тортиши (RDL)', 'gym.seed.legpress': 'Оёқ пресс',
    },
    ru: {
      'gym.title': 'Прогрессивная нагрузка', 'gym.sub.log': 'Тренировка', 'gym.sub.today': 'Сегодня', 'gym.sub.history': 'История',
      'gym.gym': 'Зал', 'gym.day': 'День', 'gym.both': 'Все залы', 'gym.addGym': 'Добавить зал', 'gym.addDay': 'Добавить день',
      'gym.newGym': 'Название зала', 'gym.newDay': 'Название дня', 'gym.manage': 'Управление', 'gym.gyms': 'Залы', 'gym.days': 'Дни',
      'gym.minOne': 'Должен остаться хотя бы один', 'gym.gymDeleted': 'Зал удалён', 'gym.dayDeleted': 'День удалён',
      'gym.exercise': 'Упражнение', 'gym.exercises': 'Упражнения', 'gym.noEx': 'В этом зале и дне нет упражнений', 'gym.addEx': 'Добавить упражнение', 'gym.editEx': 'Изменить упражнение',
      'gym.repRange': 'Диапазон повторов', 'gym.repMin': 'Мин повторов', 'gym.repMax': 'Макс повторов', 'gym.step': 'Шаг', 'gym.startWeight': 'Стартовый вес',
      'gym.bw': 'Собственный вес', 'gym.bwTag': 'BW', 'gym.bwHint': 'Собственный вес — записываются только повторы', 'gym.nameReq': 'Введите название',
      'gym.delEx': 'Удалить упражнение', 'gym.delExText': '«{name}» и все записи по нему ({n}) будут удалены', 'gym.deleted': 'Упражнение удалено',
      'gym.last': 'Прошлый сет', 'gym.next': 'Следующий сет', 'gym.ago.days': '{n} дн. назад',
      'gym.rx.start': 'Начните', 'gym.rx.up': 'Добавьте вес', 'gym.rx.hold': 'Добавьте повтор', 'gym.rx.down': 'Сбавьте вес', 'gym.rx.repeat': 'Повторите',
      'gym.rx.startWhy': 'Сделайте {min}–{max} повторов. После первой записи тренер начнёт подсказывать.',
      'gym.rx.bwStartWhy': 'Сделайте {min}–{max} чистых повторов. Дойдёте до {max}+ — двигайтесь дальше.',
      'gym.rx.upWhy': '{reps} повторов — отлично! Добавьте {step} и выйдите на {min}.',
      'gym.rx.holdWhy': '{reps} повторов — в цели. На том же весе стремитесь к {next}.',
      'gym.rx.downWhy': '{reps} повторов — меньше {min}. Сбавьте вес и сделайте чисто.',
      'gym.rx.bwUpWhy': '{reps} повторов — сильно! В следующий раз стремитесь к {next}.',
      'gym.rx.bwRepeatWhy': '{reps} повторов — маловато. Повторяйте, пока не дойдёте до {min}+.',
      'gym.weight': 'Вес', 'gym.reps': 'Повторы', 'gym.repsShort': 'повт.', 'gym.logSet': 'Записать сет',
      'gym.pickReps': 'Выберите число повторов', 'gym.enterWeight': 'Введите вес', 'gym.saved': 'Сет записан', 'gym.pr': 'Новый рекорд!', 'gym.prTag': 'PR',
      'gym.sessions': 'Тренировок', 'gym.best1rm': 'Лучший 1RM', 'gym.bestReps': 'Макс повторов', 'gym.vol7': 'Объём · 7 дн.',
      'gym.trend': 'Динамика силы · 1RM', 'gym.trendEmpty': 'Для графика нужно минимум 2 тренировки',
      'gym.history': 'История', 'gym.noHistory': 'Записей пока нет', 'gym.setDeleted': 'Сет удалён',
      'gym.todayWorkout': 'Сегодняшняя тренировка', 'gym.sets': '{n} сет', 'gym.setsLabel': 'сет', 'gym.lifted': 'поднято', 'gym.markDone': 'Тренировка выполнена', 'gym.doneMark': 'Выполнено',
      'gym.noneToday': 'Сегодня сетов ещё нет — запишите во вкладке «Тренировка»', 'gym.planned': 'План', 'gym.extra': 'Дополнительно', 'gym.volume': 'Объём',
      'gym.streak': 'Недельная серия', 'gym.weeks': '{n} нед.', 'gym.heat': 'Последние 28 дней', 'gym.doneDays': 'Выполненные дни',
      'gym.split': 'Ротация (сплит)', 'gym.splitDay': 'День: {name}', 'gym.rest': 'Отдых', 'gym.restDay': 'День отдыха', 'gym.splitEmpty': 'Ротация не настроена',
      'gym.anchor': 'Отсчёт', 'gym.editSplit': 'Изменить ротацию', 'gym.todayIs': 'Сегодня →', 'gym.newDayName': 'Новый день', 'gym.cycle': 'Цикл',
      'gym.past': 'Прошлые тренировки', 'gym.noPast': 'Прошлых тренировок пока нет',
      'gym.seed.home': 'Дом', 'gym.seed.comm': 'Зал', 'gym.seed.push': 'Жим', 'gym.seed.pull': 'Тяга', 'gym.seed.legs': 'Ноги', 'gym.seed.rest': 'Отдых',
      'gym.seed.bench': 'Жим лёжа', 'gym.seed.ohp': 'Жим стоя', 'gym.seed.tricep': 'Трицепс на блоке', 'gym.seed.pullup': 'Подтягивания',
      'gym.seed.row': 'Тяга штанги', 'gym.seed.curl': 'Сгибание на бицепс', 'gym.seed.squat': 'Присед со штангой', 'gym.seed.rdl': 'Румынская тяга', 'gym.seed.legpress': 'Жим ногами',
    },
  });

  const t = (k, p) => D.t(k, p);
  const esc = (s) => D.esc(s);
  const G = () => D.S.gym;
  const UI = () => (D.ui.filters = D.ui.filters || {});
  const REST_RE = /^(rest|dam|дам|отдых)/i;
  const LB = 2.20462;

  /* ---------- units ---------- */
  const isLb = () => D.S.settings.weightUnit === 'lb';
  const unit = () => (isLb() ? 'lb' : 'kg');
  const toDisp = (kg) => (isLb() ? D.round((+kg || 0) * LB, 1) : D.round(+kg || 0, 2));
  const fromDisp = (v) => D.round(isLb() ? (+v || 0) / LB : +v || 0, 3);
  const fmtW = (kg) => D.fmtKg(kg);
  const fmtVol = (kg) => D.fmtNum(Math.round(isLb() ? kg * LB : kg)) + ' ' + unit();
  const est1RM = (w, reps) => (+w || 0) * (1 + (+reps || 0) / 30);
  const measure = (ex, l) => (ex.bw ? +l.reps || 0 : est1RM(l.w, l.reps));
  const fmtSet = (ex, l) => (ex.bw ? `${+l.reps || 0} ${t('gym.repsShort')}` : `${fmtW(l.w)} × ${+l.reps || 0}`);
  const fmtM = (ex, v) => (ex.bw ? Math.round(v) : D.round(toDisp(v), 1)); // measure → display (1RM 1 decimal / reps)
  const unitTag = (u) => `<span class="gym-unit">${u}</span>`;

  /* ---------- seed (first run only, like the original CONFIG block) ---------- */
  function ensureSeed() {
    const g = G();
    if (!g.split || typeof g.split !== 'object') g.split = { names: [], anchor: null };
    if (!Array.isArray(g.split.names)) g.split.names = [];
    if (g.gyms.length || g.days.length || g.exercises.length) return;
    const home = { id: D.uid('gg'), name: t('gym.seed.home') }, comm = { id: D.uid('gg'), name: t('gym.seed.comm') };
    const push = { id: D.uid('gd'), name: t('gym.seed.push') }, pull = { id: D.uid('gd'), name: t('gym.seed.pull') }, legs = { id: D.uid('gd'), name: t('gym.seed.legs') };
    g.gyms.push(home, comm);
    g.days.push(push, pull, legs);
    const seed = [
      ['bench', comm.id, push.id, 5, 8, 2.5, 60, false], ['ohp', comm.id, push.id, 5, 8, 2.5, 35, false], ['tricep', comm.id, push.id, 8, 12, 2.5, 25, false],
      ['pullup', 'both', pull.id, 5, 10, 1, 0, true], ['row', comm.id, pull.id, 6, 10, 2.5, 50, false], ['curl', comm.id, pull.id, 8, 12, 1.25, 15, false],
      ['squat', comm.id, legs.id, 5, 8, 5, 80, false], ['rdl', comm.id, legs.id, 6, 10, 5, 60, false], ['legpress', comm.id, legs.id, 8, 12, 5, 100, false],
    ];
    seed.forEach(([k, gymId, dayId, repMin, repMax, step, startWeight, bw], i) => {
      g.exercises.push({ id: D.uid('ex'), name: t('gym.seed.' + k), gymId, dayId, repMin, repMax, step, startWeight, bw, order: i });
    });
    if (!g.split.names.length) g.split = { names: [push.name, pull.name, legs.name, t('gym.seed.rest')], anchor: { date: D.today(), i: 0 } };
    UI().gymGym = comm.id;
    D.saveUi();
    D.save();
  }

  /* ---------- index (memoised per state change) ---------- */
  let IDX = null;
  D.on('state:changed', () => { IDX = null; });
  function idx() {
    const g = G();
    if (IDX && IDX.gym === g && IDX.logs === g.logs) return IDX;
    const byDay = {}, byEx = {}, exById = {};
    g.exercises.forEach((e) => { exById[e.id] = e; });
    for (const [exId, arr] of Object.entries(g.logs || {})) {
      if (!Array.isArray(arr) || !arr.length) continue;
      const sorted = arr.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
      byEx[exId] = sorted;
      for (const l of sorted) (byDay[l.date] = byDay[l.date] || []).push({ exId, log: l });
    }
    IDX = { gym: g, logs: g.logs, byDay, byEx, exById, days: Object.keys(byDay).sort() };
    return IDX;
  }
  const exLogs = (ex) => idx().byEx[ex.id] || [];

  /* ---------- selection helpers ---------- */
  const gymName = (ex) => (ex.gymId === 'both' ? t('gym.both') : ((G().gyms.find((x) => x.id === ex.gymId) || {}).name || '—'));
  const dayName = (ex) => ((G().days.find((x) => x.id === ex.dayId) || {}).name || '—');
  function curGym() { const g = G(); return g.gyms.find((x) => x.id === UI().gymGym) || g.gyms[0] || null; }
  function curDay() {
    const g = G();
    const picked = g.days.find((x) => x.id === UI().gymDay);
    if (picked) return picked;
    const sp = todaySplit();
    if (sp && !sp.rest) { const m = g.days.find((x) => String(x.name).trim().toLowerCase() === String(sp.name).trim().toLowerCase()); if (m) return m; }
    return g.days[0] || null;
  }
  function filtered(gym, day) {
    if (!day) return [];
    return G().exercises.filter((e) => e.dayId === day.id && (e.gymId === 'both' || (gym && e.gymId === gym.id))).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  function curEx(list) { return list.find((e) => e.id === UI().gymEx) || list[0] || null; }

  /* ---------- split rotation ---------- */
  function todaySplit() {
    const sp = G().split;
    const names = (sp && sp.names) || [];
    if (!names.length) return null;
    const a = sp.anchor && sp.anchor.date ? sp.anchor : { date: D.today(), i: 0 };
    const n = names.length;
    let i;
    try { i = (((D.daysBetween(a.date, D.today()) + (+a.i || 0)) % n) + n) % n; } catch (e) { i = 0; }
    return { i, name: names[i], rest: REST_RE.test(names[i]) };
  }

  /* ---------- prescription engine ---------- */
  function repBounds(ex) {
    const min = Math.max(1, parseInt(ex.repMin, 10) || 6);
    const max = Math.max(min, parseInt(ex.repMax, 10) || min);
    return { min, max, lo: Math.max(1, min - 2), end: Math.min(Math.max(max + 2, min + 5), min + 15) };
  }
  function getRx(ex) {
    const { min, max } = repBounds(ex);
    const step = +ex.step || 2.5;
    const logs = exLogs(ex), last = logs[logs.length - 1];
    if (!last) {
      return { type: 'start', w: ex.bw ? 0 : +ex.startWeight || 0, reps: min, why: t(ex.bw ? 'gym.rx.bwStartWhy' : 'gym.rx.startWhy', { min, max }) };
    }
    const r = +last.reps || 0, w = +last.w || 0;
    if (ex.bw) {
      if (r >= max) return { type: 'up', w: 0, reps: r + 1, why: t('gym.rx.bwUpWhy', { reps: r, next: r + 1 }) };
      if (r >= min) return { type: 'hold', w: 0, reps: r + 1, why: t('gym.rx.holdWhy', { reps: r, next: r + 1 }) };
      return { type: 'repeat', w: 0, reps: min, why: t('gym.rx.bwRepeatWhy', { reps: r, min }) };
    }
    if (r >= max) return { type: 'up', w: D.round(w + step, 2), reps: min, why: t('gym.rx.upWhy', { reps: r, step: fmtW(step), min }) };
    if (r < min) return { type: 'down', w: D.round(Math.max(0, w - step), 2), reps: min, why: t('gym.rx.downWhy', { reps: r, min }) };
    return { type: 'hold', w, reps: r + 1, why: t('gym.rx.holdWhy', { reps: r, next: r + 1 }) };
  }
  const RX_LABEL = { start: 'gym.rx.start', up: 'gym.rx.up', hold: 'gym.rx.hold', down: 'gym.rx.down', repeat: 'gym.rx.repeat' };

  function agoLabel(key) {
    const n = D.daysBetween(key, D.today());
    if (n <= 0) return t('common.today');
    if (n === 1) return t('common.yesterday');
    return t('gym.ago.days', { n });
  }

  /* ---------- stats ---------- */
  function exStats(ex) {
    const logs = exLogs(ex);
    const days = new Set(), from = D.addDays(D.today(), -6);
    let best = 0, bestLog = null, vol7 = 0;
    for (const l of logs) {
      days.add(l.date);
      const m = measure(ex, l);
      if (m > best) { best = m; bestLog = l; }
      if (l.date >= from) vol7 += (+l.w || 0) * (+l.reps || 0);
    }
    return { sessions: days.size, best, bestLog, vol7, count: logs.length };
  }
  function weekStreak() {
    const set = new Set(Object.keys(G().done || {}).map((k) => D.weekKey(k)));
    let cur = D.today(), n = 0, guard = 0;
    if (!set.has(D.weekKey(cur))) cur = D.addDays(cur, -7);
    while (set.has(D.weekKey(cur)) && guard++ < 520) { n++; cur = D.addDays(cur, -7); }
    return n;
  }
  function daySummary(key) {
    const rows = idx().byDay[key] || [];
    const byEx = new Map();
    let vol = 0;
    for (const { exId, log } of rows) {
      const ex = idx().exById[exId];
      if (!ex) continue;
      const e = byEx.get(exId) || { ex, sets: [] };
      e.sets.push(log);
      byEx.set(exId, e);
      vol += (+log.w || 0) * (+log.reps || 0);
    }
    return { groups: [...byEx.values()], sets: rows.length, vol };
  }

  /* ---------- render pieces ---------- */
  let pickedReps = null;
  const openPast = new Set();

  function splitPill() {
    const sp = todaySplit();
    const date = t('common.today');
    if (!sp) return `<button class="gym-splitpill" data-act="gymSplitEdit"><span class="gym-sp-date">${esc(date)}</span><span class="gym-sp-sep">·</span><span class="gym-sp-name muted">${t('gym.splitEmpty')}</span>${D.ic('edit', 14)}</button>`;
    return `<button class="gym-splitpill" data-act="gymSplitEdit" title="${esc(t('gym.editSplit'))}"><span class="gym-sp-date">${esc(date)}</span><span class="gym-sp-sep">·</span><span class="gym-sp-name ${sp.rest ? 'rest' : 'on'}">${sp.rest ? t('gym.restDay') : t('gym.splitDay', { name: esc(sp.name) })}</span>${D.ic('chevR', 14)}</button>`;
  }
  function subSeg(sub) {
    return `<div class="seg">${['log', 'today', 'history'].map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-sub="${s}">${t('gym.sub.' + s)}</button>`).join('')}</div>`;
  }
  function pickers(gym, day) {
    const g = G();
    return `<div class="gym-bar"><span class="eyebrow gym-bar-label">${t('gym.gym')}</span>
      <div class="tabs gym-tabs">${g.gyms.map((x) => `<button class="${gym && gym.id === x.id ? 'on' : ''}" data-act="gymPickGym" data-id="${esc(x.id)}">${esc(x.name)}</button>`).join('')}
        <button class="gym-tab-add" data-act="gymAddGym" aria-label="${esc(t('gym.addGym'))}" title="${esc(t('gym.addGym'))}">${D.ic('plus', 15)}</button></div>
      <button class="btn icon" data-act="gymManage" aria-label="${esc(t('gym.manage'))}" title="${esc(t('gym.manage'))}">${D.ic('gear', 18)}</button></div>
    <div class="gym-bar"><span class="eyebrow gym-bar-label">${t('gym.day')}</span>
      <div class="tabs gym-tabs">${g.days.map((x) => `<button class="${day && day.id === x.id ? 'on' : ''}" data-act="gymPickDay" data-id="${esc(x.id)}">${esc(x.name)}</button>`).join('')}
        <button class="gym-tab-add" data-act="gymAddDay" aria-label="${esc(t('gym.addDay'))}" title="${esc(t('gym.addDay'))}">${D.ic('plus', 15)}</button></div></div>`;
  }

  function renderLog(gym, day) {
    const list = filtered(gym, day);
    const ex = curEx(list);
    let h = pickers(gym, day);
    h += `<div class="input-row gym-pick">
      <select class="sel" data-change="gymPickEx" aria-label="${esc(t('gym.exercise'))}" ${list.length ? '' : 'disabled'}>
        ${list.length ? list.map((e) => `<option value="${esc(e.id)}" ${ex && ex.id === e.id ? 'selected' : ''}>${esc(e.name)}${e.bw ? ' · ' + t('gym.bwTag') : ''}${e.gymId === 'both' ? ' ★' : ''}</option>`).join('') : `<option>${t('gym.noEx')}</option>`}
      </select>
      ${ex ? `<button class="btn ghost sq" data-act="gymEditEx" data-id="${esc(ex.id)}" aria-label="${esc(t('gym.editEx'))}">${D.ic('edit', 18)}</button>` : ''}
      <button class="btn sq" data-act="gymAddEx" aria-label="${esc(t('gym.addEx'))}">${D.ic('plus', 20)}</button></div>`;
    if (!ex) {
      h += `<div class="card"><div class="empty">${t('gym.noEx')}</div><button class="dashed" data-act="gymAddEx">+ ${t('gym.addEx')}</button></div>`;
      return h;
    }
    const { min, max, lo, end } = repBounds(ex);
    const rx = getRx(ex);
    const logs = exLogs(ex), last = logs[logs.length - 1];
    pickedReps = D.clamp(rx.reps, lo, end);
    const st = exStats(ex);
    // exercise card
    h += `<div class="card gym-rx ${rx.type}">
      <div class="card-head"><div class="title">${esc(ex.name)}</div>
        <div class="row"><span class="tag" style="--c:var(--info)">${min}–${max} ${t('gym.repsShort')}</span>${ex.bw ? `<span class="tag" style="--c:var(--violet)">${t('gym.bwTag')}</span>` : ''}</div></div>
      <div class="gym-last"><span class="eyebrow">${t('gym.last')}</span>
        ${last ? `<span class="num gym-last-val">${fmtSet(ex, last)}</span><span class="num muted small">${esc(agoLabel(last.date))}</span>` : `<span class="muted small">—</span>`}</div>
      <div class="gym-rx-body">
        <div class="row between wrap"><span class="eyebrow">${t('gym.next')} · ${t('common.today')}</span><span class="pill gym-rxtag ${rx.type}">${t(RX_LABEL[rx.type])}</span></div>
        <div class="kpi gym-kpi">${ex.bw ? `<span class="kpi-num num">${rx.reps}</span><span class="kpi-total">${t('gym.repsShort')}</span>`
          : `<span class="kpi-num num">${toDisp(rx.w)}</span><span class="kpi-total">${unit()}</span><span class="kpi-num num gym-kpi-x">× ${rx.reps}</span>`}</div>
        <div class="gym-rxpills">${Array.from({ length: max - min + 1 }, (_, i) => min + i).map((r) => `<span class="pill ${r === rx.reps ? 'on' : ''}">${r}</span>`).join('')}${rx.reps > max ? `<span class="pill on">${rx.reps}</span>` : ''}</div>
        <div class="help">${esc(rx.why)}</div>
      </div>
      <div class="divider"></div>
      <div class="gym-form">
        ${ex.bw ? `<div class="gym-bwhint">${D.ic('info', 14)} ${t('gym.bwHint')}</div>` : `
        <div class="field"><label class="field-label" for="gymW">${t('gym.weight')} · ${unit()}</label>
          <div class="gym-wrow">
            <button class="btn ghost sq" data-act="gymWStep" data-d="-1" aria-label="−">${D.ic('minus', 18)}</button>
            <input type="number" class="inp num gym-w" id="gymW" inputmode="decimal" step="any" min="0" value="${toDisp(rx.w)}" data-enter="gymLog" data-id="${esc(ex.id)}">
            <button class="btn ghost sq" data-act="gymWStep" data-d="1" aria-label="+">${D.ic('plus', 18)}</button>
          </div></div>`}
        <div class="field"><span class="field-label">${t('gym.reps')}</span>
          <div class="seg compact gym-repseg" id="gymRepSeg">${Array.from({ length: end - lo + 1 }, (_, i) => lo + i).map((r) => `<button class="${r === pickedReps ? 'on' : ''}" data-act="gymRep" data-r="${r}">${r}</button>`).join('')}</div></div>
        <button class="btn block" data-act="gymLog" data-id="${esc(ex.id)}">${D.ic('check', 16)} ${t('gym.logSet')}</button>
      </div></div>`;
    // stats
    h += `<div class="stat-grid gym-stats">
      <div class="stat"><div class="stat-num num">${st.sessions}</div><div class="stat-label">${t('gym.sessions')}</div></div>
      <div class="stat"><div class="stat-num num">${st.best ? fmtM(ex, st.best) + (ex.bw ? '' : unitTag(unit())) : '—'}</div><div class="stat-label">${ex.bw ? t('gym.bestReps') : t('gym.best1rm')}</div>${st.bestLog ? `<div class="stat-sub num">${fmtSet(ex, st.bestLog)} · ${esc(D.fmtDate(st.bestLog.date))}</div>` : ''}</div>
      ${ex.bw ? '' : `<div class="stat"><div class="stat-num num">${D.fmtNum(Math.round(isLb() ? st.vol7 * LB : st.vol7))}${unitTag(unit())}</div><div class="stat-label">${t('gym.vol7')}</div></div>`}
    </div>`;
    // trend + history
    const tail = logs.slice(-10);
    h += `<div class="card"><div class="card-head"><div class="eyebrow">${t('gym.trend')}</div>${tail.length >= 2 ? `<span class="num small muted">${fmtM(ex, measure(ex, tail[0]))} → <b>${fmtM(ex, measure(ex, tail[tail.length - 1]))}</b> ${ex.bw ? t('gym.repsShort') : unit()}</span>` : ''}</div>
      ${tail.length >= 2 ? D.chart.spark({ values: tail.map((l) => measure(ex, l)), color: rx.type === 'down' ? 'var(--warning)' : 'var(--success)', height: 64, dots: true }) + `<div class="gym-spark-x num"><span>${esc(D.fmtDate(tail[0].date))}</span><span>${esc(D.fmtDate(tail[tail.length - 1].date))}</span></div>` : `<div class="empty small">${t('gym.trendEmpty')}</div>`}
      <div class="section-title">${t('gym.history')}<span class="right num">${st.count}</span></div>
      ${logs.length ? `<ul class="list gym-hist">${logs.slice(-12).reverse().map((l) => `<li class="li">
          <span class="num small muted gym-hist-date">${esc(D.fmtDate(l.date))}</span>
          <span class="li-body"><span class="li-text num">${fmtSet(ex, l)}</span>${l.pr ? ` <span class="tag" style="--c:var(--warning)">${t('gym.prTag')}</span>` : ''}</span>
          ${ex.bw ? '' : `<span class="num small muted gym-hist-1rm" title="1RM">${fmtM(ex, est1RM(l.w, l.reps))}</span>`}
          <button class="li-del" data-act="gymDelLog" data-ex="${esc(ex.id)}" data-id="${esc(l.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></li>`).join('')}</ul>`
        : `<div class="empty">${t('gym.noHistory')}</div>`}
    </div>`;
    return h;
  }

  function renderToday(gym, day) {
    const g = G(), today = D.today();
    const plan = filtered(gym, day);
    const sum = daySummary(today);
    const loggedIds = new Set(sum.groups.map((x) => x.ex.id));
    const extra = sum.groups.filter((x) => !plan.some((p) => p.id === x.ex.id));
    const done = !!(g.done && g.done[today]);
    const streak = weekStreak();
    const row = (ex, sets, planned) => `<li class="li ${sets.length ? 'done' : ''}">
        <span class="gym-status ${sets.length ? 'on' : ''}">${sets.length ? D.ic('check', 14) : ''}</span>
        <span class="li-body"><span class="li-text">${esc(ex.name)}</span>
          <span class="li-meta">${sets.length ? sets.map((s) => `<span class="num">${fmtSet(ex, s)}</span>`).join(' · ') : `<span>${[planned ? t('gym.planned') : '', esc(gymName(ex))].filter(Boolean).join(' · ')}</span>`}</span></span>
        ${sets.length && !ex.bw ? `<span class="li-right num small muted">${fmtVol(D.sum(sets, (s) => (+s.w || 0) * (+s.reps || 0)))}</span>` : ''}</li>`;
    let h = pickers(gym, day);
    h += `<div class="card ${done ? 'all-done' : ''}">
      <div class="card-head"><div><div class="eyebrow">${t('gym.todayWorkout')}</div><div class="small muted">${esc(D.fmtDate(today, 'weekday'))}${day ? ' · ' + esc(day.name) : ''}</div></div>
        ${done ? `<span class="pill good">${D.ic('check', 12)} ${t('gym.doneMark')}</span>` : ''}</div>
      <div class="kpi"><span class="kpi-num num">${sum.sets}</span><span class="kpi-label">${t('gym.setsLabel')}</span>${sum.vol ? `<span class="kpi-total">· ${fmtVol(sum.vol)} ${t('gym.lifted')}</span>` : ''}</div>
      ${plan.length || extra.length ? `<ul class="list mt">${plan.map((ex) => row(ex, loggedIds.has(ex.id) ? sum.groups.find((x) => x.ex.id === ex.id).sets : [], true)).join('')}
        ${extra.length ? `<li class="eyebrow gym-extra">${t('gym.extra')}</li>` + extra.map((x) => row(x.ex, x.sets, false)).join('') : ''}</ul>` : `<div class="empty">${t('gym.noneToday')}</div>`}
      <div class="form-foot"><button class="btn ${done ? 'ghost' : ''} block" data-act="gymToggleDone">${D.ic('check', 16)} ${done ? t('gym.doneMark') : t('gym.markDone')}</button></div>
    </div>`;
    h += `<div class="grid2 gym-streakgrid">
      <div class="stat"><div class="stat-num num">${D.ic('fire', 18)} ${streak}</div><div class="stat-label">${t('gym.streak')}</div><div class="stat-sub">${t('gym.weeks', { n: streak })}</div></div>
      <div class="stat"><div class="stat-num num">${Object.keys(g.done || {}).filter((k) => k >= D.addDays(today, -27)).length}</div><div class="stat-label">${t('gym.doneDays')}</div><div class="stat-sub">${t('gym.heat')}</div></div>
    </div>
    <div class="card gym-heat"><div class="eyebrow mb-s">${t('gym.heat')}</div>${D.chart.heat({ days: D.lastDays(28), valueFn: (k) => (g.done && g.done[k] ? 4 : idx().byDay[k] ? 2 : 0) })}</div>`;
    // split card
    const sp = todaySplit(), names = (g.split && g.split.names) || [];
    h += `<div class="card"><div class="card-head"><div class="eyebrow">${t('gym.split')}</div><button class="btn ghost sm" data-act="gymSplitEdit">${D.ic('edit', 14)} ${t('btn.edit')}</button></div>
      ${names.length ? `<div class="gym-cycle">${names.map((n, i) => `<span class="pill ${sp && sp.i === i ? (REST_RE.test(n) ? 'info' : 'on') : ''}">${esc(n)}</span>`).join('<span class="gym-cycle-arrow">→</span>')}</div>
        <div class="small muted mt-s">${t('gym.anchor')}: <span class="num">${esc(D.fmtDate(g.split.anchor && g.split.anchor.date || today))}</span> · ${t('common.today')}: <b>${sp.rest ? t('gym.restDay') : esc(sp.name)}</b></div>`
        : `<div class="empty">${t('gym.splitEmpty')}</div>`}
    </div>`;
    return h;
  }

  function renderHistory() {
    const g = G(), today = D.today();
    const days = idx().days.filter((k) => k !== today).reverse().slice(0, 10);
    let h = `<div class="section-title">${t('gym.past')}<span class="right num">${days.length}</span></div>`;
    if (!days.length) return h + `<div class="card"><div class="empty">${t('gym.noPast')}</div></div>`;
    for (const k of days) {
      const s = daySummary(k), open = openPast.has(k);
      h += `<div class="card gym-past ${open ? 'open' : ''}">
        <button class="gym-past-head" data-act="gymPastToggle" data-k="${esc(k)}" aria-expanded="${open}">
          <span class="gym-past-l"><span class="title">${esc(D.fmtDate(k, 'weekday'))}</span>
            <span class="small muted num">${t('gym.sets', { n: s.sets })}${s.vol ? ` · ${fmtVol(s.vol)}` : ''}${open ? '' : ` · <span class="ellipsis">${esc(s.groups.slice(0, 3).map((x) => x.ex.name).join(', '))}${s.groups.length > 3 ? '…' : ''}</span>`}</span></span>
          ${g.done && g.done[k] ? `<span class="pill good">${t('gym.doneMark')}</span>` : ''}${D.ic('chevD', 16)}</button>
        ${open ? `<ul class="list mt">${s.groups.map((x) => `<li class="li"><span class="li-body"><span class="li-text">${esc(x.ex.name)}</span><span class="li-meta">${x.sets.map((l) => `<span class="num">${fmtSet(x.ex, l)}${l.pr ? ' ★' : ''}</span>`).join(' · ')}</span></span></li>`).join('')}</ul>` : ''}
      </div>`;
    }
    return h;
  }

  function render() {
    ensureSeed();
    const sub = D.sub('gym', 'log');
    const gym = curGym(), day = curDay();
    let h = `<div class="gym">${splitPill()}${subSeg(sub)}`;
    if (sub === 'today') h += renderToday(gym, day);
    else if (sub === 'history') h += renderHistory();
    else h += renderLog(gym, day);
    return h + '</div>';
  }

  /* ---------- actions: selection ---------- */
  D.act.gymPickGym = (el) => { UI().gymGym = el.dataset.id; UI().gymEx = null; D.saveUi(); D.rerender(); };
  D.act.gymPickDay = (el) => { UI().gymDay = el.dataset.id; UI().gymEx = null; D.saveUi(); D.rerender(); };
  D.act.gymPickEx = (el) => { UI().gymEx = el.value; D.saveUi(); D.rerender(); };
  let manageOpen = false; // the manage sheet is replaced by D.prompt; reopen it afterwards
  D.act.gymAddGym = async () => {
    const back = manageOpen; manageOpen = false;
    const v = await D.prompt({ title: t('gym.newGym'), placeholder: t('gym.gym') });
    if (v && v.trim()) {
      const it = { id: D.uid('gg'), name: v.trim().slice(0, 40) };
      G().gyms.push(it); UI().gymGym = it.id; UI().gymEx = null; D.saveUi(); D.save(); D.rerender();
    }
    if (back) D.act.gymManage();
  };
  D.act.gymAddDay = async () => {
    const back = manageOpen; manageOpen = false;
    const v = await D.prompt({ title: t('gym.newDay'), placeholder: t('gym.day') });
    if (v && v.trim()) {
      const it = { id: D.uid('gd'), name: v.trim().slice(0, 40) };
      G().days.push(it); UI().gymDay = it.id; UI().gymEx = null; D.saveUi(); D.save(); D.rerender();
    }
    if (back) D.act.gymManage();
  };

  /* ---------- manage sheet (gyms + days) ---------- */
  function manageBody() {
    const g = G();
    const rows = (list, renameAct, delAct) => list.map((x) => `<div class="gym-mrow"><input class="inp sm" value="${esc(x.name)}" maxlength="40" data-input="${renameAct}" data-id="${esc(x.id)}"><button class="li-del" data-act="${delAct}" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button></div>`).join('');
    return `<div id="gymManageBody">
      <div class="field-label">${t('gym.gyms')}</div>${rows(g.gyms, 'gymRenameGym', 'gymDelGym')}<button class="dashed mb" data-act="gymAddGym">+ ${t('gym.addGym')}</button>
      <div class="field-label">${t('gym.days')}</div>${rows(g.days, 'gymRenameDay', 'gymDelDay')}<button class="dashed" data-act="gymAddDay">+ ${t('gym.addDay')}</button></div>`;
  }
  D.act.gymManage = () => { manageOpen = true; D.sheet(manageBody(), { title: t('gym.manage'), actions: [{ label: t('btn.close'), act: 'closeModal', primary: true }], onClose: () => { manageOpen = false; D.rerender(); } }); };
  const rename = (list) => (el) => { const it = list.find((x) => x.id === el.dataset.id); if (it) { it.name = el.value.slice(0, 40); D.save(); } };
  D.act.gymRenameGym = (el) => rename(G().gyms)(el);
  D.act.gymRenameDay = (el) => rename(G().days)(el);
  // Delete a gym/day: its exercises move to the first remaining one (never orphaned); one undo restores both.
  function delTagged(list, field, id, label, uiKey) {
    const g = G();
    if (list.length <= 1) { D.toast(t('gym.minOne')); return; }
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return;
    const [item] = list.splice(i, 1);
    const target = list[0].id;
    const moved = g.exercises.filter((e) => e[field] === id);
    moved.forEach((e) => { e[field] = target; });
    D.undo.push({ label, undo: () => { list.splice(Math.min(i, list.length), 0, item); moved.forEach((e) => { e[field] = id; }); } });
    if (UI()[uiKey] === id) UI()[uiKey] = null;
    D.saveUi(); D.save(); D.rerender();
    D.patch('gymManageBody', manageBody());
    D.toast(label, { undo: () => { D.undo.pop(); D.patch('gymManageBody', manageBody()); } });
  }
  D.act.gymDelGym = (el) => delTagged(G().gyms, 'gymId', el.dataset.id, t('gym.gymDeleted'), 'gymGym');
  D.act.gymDelDay = (el) => delTagged(G().days, 'dayId', el.dataset.id, t('gym.dayDeleted'), 'gymDay');

  /* ---------- exercise modal ---------- */
  function exModal(ex) {
    const g = G(), isNew = !ex;
    const gymSel = ex ? ex.gymId : (curGym() || {}).id, daySel = ex ? ex.dayId : (curDay() || {}).id;
    const v = { name: '', repMin: 6, repMax: 8, step: 2.5, startWeight: 20, bw: false, ...(ex || {}) };
    const body = `<div class="field"><label class="field-label" for="gymExName">${t('common.name')}</label><input class="inp" id="gymExName" maxlength="60" value="${esc(v.name)}" placeholder="${esc(t('gym.exercise'))}" data-enter="gymExSave" data-id="${esc(ex ? ex.id : '')}"></div>
      <div class="grid2">
        <div class="field"><label class="field-label" for="gymExGym">${t('gym.gym')}</label><select class="sel" id="gymExGym">${g.gyms.map((x) => `<option value="${esc(x.id)}" ${x.id === gymSel ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="both" ${gymSel === 'both' ? 'selected' : ''}>★ ${t('gym.both')}</option></select></div>
        <div class="field"><label class="field-label" for="gymExDay">${t('gym.day')}</label><select class="sel" id="gymExDay">${g.days.map((x) => `<option value="${esc(x.id)}" ${x.id === daySel ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      </div>
      <label class="gym-bwrow"><input type="checkbox" class="chk" id="gymExBw" data-change="gymExBwToggle" ${v.bw ? 'checked' : ''}><span><b>${t('gym.bw')}</b><span class="help">${t('gym.bwHint')}</span></span></label>
      <div class="grid2">
        <div class="field"><label class="field-label" for="gymExMin">${t('gym.repMin')}</label><input type="number" class="inp num" id="gymExMin" inputmode="numeric" min="1" max="50" value="${+v.repMin || 6}"></div>
        <div class="field"><label class="field-label" for="gymExMax">${t('gym.repMax')}</label><input type="number" class="inp num" id="gymExMax" inputmode="numeric" min="1" max="60" value="${+v.repMax || 8}"></div>
      </div>
      <div class="grid2" id="gymExWFields" ${v.bw ? 'hidden' : ''}>
        <div class="field"><label class="field-label" for="gymExStep">${t('gym.step')} · ${unit()}</label><input type="number" class="inp num" id="gymExStep" inputmode="decimal" step="any" min="0" value="${toDisp(+v.step || 2.5)}"></div>
        <div class="field"><label class="field-label" for="gymExStart">${t('gym.startWeight')} · ${unit()}</label><input type="number" class="inp num" id="gymExStart" inputmode="decimal" step="any" min="0" value="${toDisp(+v.startWeight || 0)}"></div>
      </div>`;
    const actions = [{ label: t('btn.cancel'), act: 'closeModal' }];
    if (!isNew) actions.push({ label: t('btn.delete'), act: 'gymExDel', danger: true, data: { id: ex.id } });
    actions.push({ label: isNew ? t('btn.add') : t('btn.save'), act: 'gymExSave', primary: true, data: { id: ex ? ex.id : '' } });
    D.modal({ title: isNew ? t('gym.addEx') : t('gym.editEx'), body, actions });
  }
  D.act.gymAddEx = () => exModal(null);
  D.act.gymEditEx = (el) => { const ex = G().exercises.find((x) => x.id === el.dataset.id); if (ex) exModal(ex); };
  D.act.gymExBwToggle = (el) => { const f = D.$('#gymExWFields'); if (f) f.hidden = !!el.checked; };
  D.act.gymExSave = (el) => {
    const g = G();
    const val = (id) => (D.$('#' + id) || {}).value;
    const name = String(val('gymExName') || '').trim().slice(0, 60);
    if (!name) { D.toast(t('gym.nameReq')); return; }
    const bw = !!(D.$('#gymExBw') || {}).checked;
    const repMin = Math.max(1, parseInt(val('gymExMin'), 10) || 6);
    const repMax = Math.max(repMin, parseInt(val('gymExMax'), 10) || 8);
    const step = bw ? 1 : (fromDisp(parseFloat(val('gymExStep'))) || 2.5);
    const startWeight = bw ? 0 : Math.max(0, fromDisp(parseFloat(val('gymExStart'))) || 0);
    const gymId = val('gymExGym') || (g.gyms[0] || {}).id || 'both', dayId = val('gymExDay') || (g.days[0] || {}).id;
    if (!dayId) { D.toast(t('gym.noEx')); return; }
    let ex = g.exercises.find((x) => x.id === el.dataset.id);
    if (ex) Object.assign(ex, { name, gymId, dayId, repMin, repMax, step, startWeight, bw });
    else { ex = { id: D.uid('ex'), name, gymId, dayId, repMin, repMax, step, startWeight, bw, order: g.exercises.length }; g.exercises.push(ex); }
    if (gymId !== 'both') UI().gymGym = gymId;
    UI().gymDay = dayId; UI().gymEx = ex.id; D.saveUi();
    D.closeModal(); D.save(); D.rerender();
  };
  D.act.gymExDel = async (el) => {
    const g = G();
    const i = g.exercises.findIndex((x) => x.id === el.dataset.id);
    if (i < 0) return;
    const ex = g.exercises[i], logs = g.logs[ex.id] || [];
    D.closeModal();
    if (logs.length) { const ok = await D.confirm({ title: t('gym.delEx'), text: t('gym.delExText', { name: ex.name, n: logs.length }), ok: t('btn.delete'), danger: true }); if (!ok) return; }
    g.exercises.splice(i, 1);
    delete g.logs[ex.id];
    D.undo.push({ label: t('gym.deleted'), undo: () => { g.exercises.splice(Math.min(i, g.exercises.length), 0, ex); if (logs.length) g.logs[ex.id] = logs; } });
    if (UI().gymEx === ex.id) UI().gymEx = null;
    D.saveUi(); D.save(); D.rerender();
    D.toast(t('gym.deleted'), { undo: () => D.undo.pop() });
  };

  /* ---------- logging ---------- */
  D.act.gymWStep = (el) => {
    const inp = D.$('#gymW'); if (!inp) return;
    const list = filtered(curGym(), curDay()), ex = curEx(list);
    const step = toDisp((ex && +ex.step) || 2.5) || 2.5;
    const v = Math.max(0, (parseFloat(inp.value) || 0) + (+el.dataset.d || 1) * step);
    inp.value = D.round(v, 2);
  };
  D.act.gymRep = (el) => {
    pickedReps = parseInt(el.dataset.r, 10) || null;
    D.$$('#gymRepSeg button').forEach((b) => b.classList.toggle('on', b === el));
  };
  D.act.gymLog = (el) => {
    const g = G();
    const ex = g.exercises.find((x) => x.id === el.dataset.id);
    if (!ex) return;
    const reps = pickedReps;
    if (!reps || reps < 1) { D.toast(t('gym.pickReps')); return; }
    let w = 0;
    if (!ex.bw) {
      const inp = D.$('#gymW');
      w = fromDisp(parseFloat(inp && inp.value));
      if (!(w > 0)) { D.toast(t('gym.enterWeight')); return; }
    }
    const arr = (g.logs[ex.id] = Array.isArray(g.logs[ex.id]) ? g.logs[ex.id] : []);
    const m = measure(ex, { w, reps });
    const prevBest = arr.reduce((b, l) => Math.max(b, measure(ex, l)), 0);
    const log = { id: D.uid('gl'), w, reps, date: D.today(), ts: Date.now() };
    const pr = arr.length > 0 && m > prevBest;
    if (pr) log.pr = true;
    arr.push(log);
    pickedReps = null;
    D.save(); D.rerender();
    D.toast(pr ? t('gym.pr') + ' ' + fmtSet(ex, log) : t('gym.saved') + ' · ' + fmtSet(ex, log));
  };
  D.act.gymDelLog = (el) => {
    const arr = G().logs[el.dataset.ex];
    if (Array.isArray(arr)) D.remove(arr, el.dataset.id, { label: t('gym.setDeleted') });
  };
  D.act.gymToggleDone = () => {
    const g = G(), k = D.today();
    g.done = g.done || {};
    if (g.done[k]) delete g.done[k]; else g.done[k] = Date.now();
    D.save(); D.rerender();
  };
  D.act.gymPastToggle = (el) => { const k = el.dataset.k; if (openPast.has(k)) openPast.delete(k); else openPast.add(k); D.rerender(); };

  /* ---------- split editor ---------- */
  let draft = null;
  function splitBody() {
    const rows = draft.names.map((n, i) => `<div class="gym-srow ${i === draft.today ? 'today' : ''}">
      <span class="num muted small">${i + 1}</span>
      <input class="inp sm" value="${esc(n)}" maxlength="30" data-input="gymSplitName" data-i="${i}">
      ${i === draft.today ? `<span class="tag" style="--c:var(--success)">${t('common.today')}</span>` : `<button class="btn ghost xs" data-act="gymSplitToday" data-i="${i}">${t('gym.todayIs')}</button>`}
      <button class="btn icon" data-act="gymSplitMove" data-i="${i}" data-d="-1" aria-label="↑" ${i === 0 ? 'disabled' : ''}>${D.ic('chevL', 14, 'style="transform:rotate(90deg)"')}</button>
      <button class="btn icon" data-act="gymSplitMove" data-i="${i}" data-d="1" aria-label="↓" ${i === draft.names.length - 1 ? 'disabled' : ''}>${D.ic('chevD', 14)}</button>
      <button class="li-del" data-act="gymSplitDel" data-i="${i}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 14)}</button></div>`).join('');
    return `<div id="gymSplitBody"><div class="help mb">${t('gym.cycle')} · ${t('gym.rest')}: «${t('gym.seed.rest')}»</div>${rows || `<div class="empty">${t('gym.splitEmpty')}</div>`}<button class="dashed mt-s" data-act="gymSplitAdd">+ ${t('gym.addDay')}</button></div>`;
  }
  D.act.gymSplitEdit = () => {
    const sp = G().split || { names: [] }, ts = todaySplit();
    draft = { names: (sp.names || []).slice(), today: ts ? ts.i : 0 };
    D.modal({ title: t('gym.editSplit'), body: splitBody(), actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('btn.save'), act: 'gymSplitSave', primary: true }], noFocus: true });
  };
  D.act.gymSplitName = (el) => { if (draft) draft.names[+el.dataset.i] = el.value; };
  D.act.gymSplitToday = (el) => { if (!draft) return; draft.today = +el.dataset.i; D.patch('gymSplitBody', splitBody()); };
  D.act.gymSplitMove = (el) => {
    if (!draft) return;
    const i = +el.dataset.i, j = i + (+el.dataset.d || 1);
    if (j < 0 || j >= draft.names.length) return;
    [draft.names[i], draft.names[j]] = [draft.names[j], draft.names[i]];
    if (draft.today === i) draft.today = j; else if (draft.today === j) draft.today = i;
    D.patch('gymSplitBody', splitBody());
  };
  D.act.gymSplitDel = (el) => {
    if (!draft) return;
    const i = +el.dataset.i;
    if (draft.names.length <= 1) { D.toast(t('gym.minOne')); return; }
    draft.names.splice(i, 1);
    if (draft.today > i || draft.today >= draft.names.length) draft.today = Math.max(0, draft.today - 1);
    D.patch('gymSplitBody', splitBody());
  };
  D.act.gymSplitAdd = () => {
    if (!draft) return;
    draft.names.push(t('gym.newDayName'));
    D.patch('gymSplitBody', splitBody());
    const inputs = D.$$('#gymSplitBody input'); const last = inputs[inputs.length - 1];
    if (last) setTimeout(() => { last.focus(); last.select(); }, 30);
  };
  D.act.gymSplitSave = () => {
    if (!draft) return;
    const names = draft.names.map((n) => String(n || '').trim().slice(0, 30)).filter(Boolean);
    const i = names.length ? D.clamp(draft.today, 0, names.length - 1) : 0;
    G().split = { names, anchor: { date: D.today(), i } };
    draft = null;
    D.closeModal(); D.save(); D.rerender();
  };

  /* ---------- search ---------- */
  D.search.register(() => G().exercises.map((ex) => ({
    label: ex.name, sub: `${t('gym.exercise')} · ${gymName(ex)} · ${dayName(ex)}`, icon: 'dumbbell',
    go: () => { UI().gymEx = ex.id; if (ex.gymId !== 'both') UI().gymGym = ex.gymId; UI().gymDay = ex.dayId; D.saveUi(); D.go('gym', 'log'); },
  })));

  D.view({ id: 'gym', icon: 'dumbbell', order: 55, nav: true, primary: false, render });
})();
