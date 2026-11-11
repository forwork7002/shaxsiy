/* =====================================================================
   WHOOP — tarixni olish, kunlar bo'yicha saqlash, tendensiya va tayyorlik.
   Tokenlar serverda; bu yerda faqat /api/whoop/data proksisi orqali o'qish.
   D.whoop.sync({deep})   — recovery / sleep / cycle / workout / body
   D.whoop.day(key)       — o'sha kunning ko'rsatkichlari
   D.whoop.trend(field,n) — [{k, v}] grafik uchun
   D.whoop.readiness()    — Bugun bo'limidagi tayyorlik chizig'i
   D.whoop.bioAge()       — 30 kunlik o'rtachalardan biologik yosh taxmini
   D.whoop.vitals(key)    — Sog'liq → Tayyorlik: kunning o'lchovlari, 30 kunlik me'yorga nisbatan
   D.whoop.bodyCard()     — Sog'liq → Tayyorlik: tana, vazn trendi, yosh

   Raqamlar hech qayerda yaxlitlanmaydi: WHOOP bergan aniqlik ekranga shundayligicha chiqadi.
   Vaqt kasr soatda emas, soat + daqiqada yoziladi (D.fmtHm / D.fmtMsH).
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;
  const KEEP_DAYS = 180;            // kunlik yozuvlar tarixi
  const KEEP_WORKOUTS = 60;

  D.i18n.add({
    uz: {
      'wh.trend': 'Tendensiya', 'wh.trend.sub': 'oxirgi {n} kun', 'wh.workouts': "Mashg'ulotlar", 'wh.noWorkouts': "Mashg'ulot yozuvi yo'q",
      'wh.recovery': 'Tiklanish', 'wh.hrv': 'HRV', 'wh.rhr': 'Tinch puls', 'wh.sleepH': 'Uyqu', 'wh.strain': "Zo'riqish",
      'wh.ready.high': "Bugun kuch bering — tanangiz tayyor.", 'wh.ready.mid': "O'rtacha yuk oling.", 'wh.ready.low': "Bugun dam oling — tiklanish past.",
      'wh.kcal': 'kkal', 'wh.hrAvg': "o'rt. puls",
      'wh.height': "Bo'y", 'wh.weight': 'Vazn', 'wh.maxHr': 'Maks. puls',
      'wh.pulled': '{n} kunlik ma’lumot olindi', 'wh.sport': 'Mashq',
    },
    uzk: {
      'wh.trend': 'Тенденция', 'wh.trend.sub': 'охирги {n} кун', 'wh.workouts': 'Машғулотлар', 'wh.noWorkouts': 'Машғулот ёзуви йўқ',
      'wh.recovery': 'Тикланиш', 'wh.hrv': 'HRV', 'wh.rhr': 'Тинч пулс', 'wh.sleepH': 'Уйқу', 'wh.strain': 'Зўриқиш',
      'wh.ready.high': 'Бугун куч беринг — танангиз тайёр.', 'wh.ready.mid': 'Ўртача юк олинг.', 'wh.ready.low': 'Бугун дам олинг — тикланиш паст.',
      'wh.kcal': 'ккал', 'wh.hrAvg': 'ўрт. пулс',
      'wh.height': 'Бўй', 'wh.weight': 'Вазн', 'wh.maxHr': 'Макс. пулс',
      'wh.pulled': '{n} кунлик маълумот олинди', 'wh.sport': 'Машқ',
    },
    ru: {
      'wh.trend': 'Динамика', 'wh.trend.sub': 'последние {n} дн.', 'wh.workouts': 'Тренировки', 'wh.noWorkouts': 'Нет записей о тренировках',
      'wh.recovery': 'Восстановление', 'wh.hrv': 'HRV', 'wh.rhr': 'Пульс покоя', 'wh.sleepH': 'Сон', 'wh.strain': 'Нагрузка',
      'wh.ready.high': 'Сегодня можно нагрузку — тело готово.', 'wh.ready.mid': 'Средняя нагрузка.', 'wh.ready.low': 'Сегодня отдых — восстановление низкое.',
      'wh.kcal': 'ккал', 'wh.hrAvg': 'ср. пульс',
      'wh.height': 'Рост', 'wh.weight': 'Вес', 'wh.maxHr': 'Макс. пульс',
      'wh.pulled': 'Получены данные за {n} дн.', 'wh.sport': 'Тренировка',
    },
  });

  D.i18n.add({
    uz: {
      'wh.justNow': 'hozirgina', 'wh.minAgo': '{n} daqiqa oldin',
      'wh.connectedAs': 'WHOOP ulangan: {name}', 'wh.updated': 'yangilangan {t}', 'wh.refreshNow': 'Hozir yangilash',
      'wh.hrMaxShort': 'maks',
      'wh.calibrating': 'WHOOP hali kalibrlanmoqda — birinchi haftada raqamlar o‘zgaradi',
      'wh.err.rate_limited': 'WHOOP limiti — bir daqiqadan so‘ng yangilanadi', 'wh.err.http': 'WHOOP javob bermadi ({e})', 'wh.err.not_connected': 'WHOOP ulanmagan',
      'wh.sl.14': 'So‘nggi 14 kecha',
      'wh.sl.none': 'Bu kecha uchun uyqu yozuvi yo‘q', 'wh.sl.stagesTitle': 'Uyqu bosqichlari',
      'wh.st.none': 'Bugun hali zo‘riqish o‘lchanmadi',
      'wh.wo.today': 'Bugungi mashg‘ulotlar', 'wh.wo.none': 'Bugun WHOOP mashg‘ulot yozmagan',
      'wh.disconnect': 'Uzish', 'wh.connect': 'WHOOP’ni ulash', 'wh.intro': 'Soatingizdagi tiklanish, uyqu, zo‘riqish va mashg‘ulotlar shu yerga o‘zi keladi — har daqiqa.',
      'wh.needServer': 'Bu qurilmada server yo‘q — WHOOP faqat jonli saytda ishlaydi', 'wh.pending': 'WHOOP’dan birinchi ma’lumot olinmoqda…',
    },
    uzk: {
      'wh.justNow': 'ҳозиргина', 'wh.minAgo': '{n} дақиқа олдин',
      'wh.connectedAs': 'WHOOP уланган: {name}', 'wh.updated': 'янгиланган {t}', 'wh.refreshNow': 'Ҳозир янгилаш',
      'wh.hrMaxShort': 'макс',
      'wh.calibrating': 'WHOOP ҳали калибрланмоқда — биринчи ҳафтада рақамлар ўзгаради',
      'wh.err.rate_limited': 'WHOOP лимити — бир дақиқадан сўнг янгиланади', 'wh.err.http': 'WHOOP жавоб бермади ({e})', 'wh.err.not_connected': 'WHOOP уланмаган',
      'wh.sl.14': 'Сўнгги 14 кеча',
      'wh.sl.none': 'Бу кеча учун уйқу ёзуви йўқ', 'wh.sl.stagesTitle': 'Уйқу босқичлари',
      'wh.st.none': 'Бугун ҳали зўриқиш ўлчанмади',
      'wh.wo.today': 'Бугунги машғулотлар', 'wh.wo.none': 'Бугун WHOOP машғулот ёзмаган',
      'wh.disconnect': 'Узиш', 'wh.connect': 'WHOOP’ни улаш', 'wh.intro': 'Соатингиздаги тикланиш, уйқу, зўриқиш ва машғулотлар шу ерга ўзи келади — ҳар дақиқа.',
      'wh.needServer': 'Бу қурилмада сервер йўқ — WHOOP фақат жонли сайтда ишлайди', 'wh.pending': 'WHOOP’дан биринчи маълумот олинмоқда…',
    },
    ru: {
      'wh.justNow': 'только что', 'wh.minAgo': '{n} мин назад',
      'wh.connectedAs': 'WHOOP подключён: {name}', 'wh.updated': 'обновлено {t}', 'wh.refreshNow': 'Обновить сейчас',
      'wh.hrMaxShort': 'макс',
      'wh.calibrating': 'WHOOP ещё калибруется — в первую неделю цифры будут меняться',
      'wh.err.rate_limited': 'Лимит WHOOP — обновится через минуту', 'wh.err.http': 'WHOOP не ответил ({e})', 'wh.err.not_connected': 'WHOOP не подключён',
      'wh.sl.14': 'Последние 14 ночей',
      'wh.sl.none': 'За эту ночь записи сна нет', 'wh.sl.stagesTitle': 'Фазы сна',
      'wh.st.none': 'Сегодня нагрузка ещё не измерена',
      'wh.wo.today': 'Тренировки сегодня', 'wh.wo.none': 'WHOOP не записал тренировок сегодня',
      'wh.disconnect': 'Отключить', 'wh.connect': 'Подключить WHOOP', 'wh.intro': 'Восстановление, сон, нагрузка и тренировки с часов приходят сюда сами — каждую минуту.',
      'wh.needServer': 'На этом устройстве нет сервера — WHOOP работает только на живом сайте', 'wh.pending': 'Получаем первые данные от WHOOP…',
    },
  });

  D.i18n.add({
    uz: {
      'wh.bd.enter': 'Sozlamalarda kiriting', 'wh.bd.fromApp': 'WHOOP ilovasidagi Healthspan sahifasidan ko‘chiring — API bu raqamlarni bermaydi',
    },
    uzk: {
      'wh.bd.enter': 'Созламаларда киритинг', 'wh.bd.fromApp': 'WHOOP иловасидаги Healthspan саҳифасидан кўчиринг — API бу рақамларни бермайди',
    },
    ru: {
      'wh.bd.enter': 'Укажите в настройках', 'wh.bd.fromApp': 'Перепишите со страницы Healthspan в приложении WHOOP — API эти цифры не отдаёт',
    },
  });

  /* Tayyorlik sahifasining o'lchovlar jadvali va ixcham tana kartasi */
  D.i18n.add({
    uz: {
      'wh.vt.title': "Bugungi o'lchovlar", 'wh.vt.sub': "30 kunlik shaxsiy me'yoringizga nisbatan",
      'wh.vt.metric': "Ko'rsatkich", 'wh.vt.value': 'Qiymat', 'wh.vt.base': "Me'yor", 'wh.vt.delta': 'Farq',
      'wh.vt.resp': 'Nafas', 'wh.vt.skin': 'Teri harorati',
      'wh.vt.none': "Bu kun uchun WHOOP o'lchovi yo'q",
      'wh.bd.title': 'Tana', 'wh.bd.bmi': 'Tana massasi indeksi',
      'wh.bd.noWeight': "Vazn WHOOP ilovasida ko'rsatilmagan",
      'wh.bd.bmi.under': 'Kam vazn', 'wh.bd.bmi.normal': 'Normal', 'wh.bd.bmi.over': 'Ortiqcha vazn', 'wh.bd.bmi.obese': 'Semizlik',
    },
    uzk: {
      'wh.vt.title': 'Бугунги ўлчовлар', 'wh.vt.sub': '30 кунлик шахсий меъёрингизга нисбатан',
      'wh.vt.metric': 'Кўрсаткич', 'wh.vt.value': 'Қиймат', 'wh.vt.base': 'Меъёр', 'wh.vt.delta': 'Фарқ',
      'wh.vt.resp': 'Нафас', 'wh.vt.skin': 'Тери ҳарорати',
      'wh.vt.none': 'Бу кун учун WHOOP ўлчови йўқ',
      'wh.bd.title': 'Тана', 'wh.bd.bmi': 'Тана массаси индекси',
      'wh.bd.noWeight': 'Вазн WHOOP иловасида кўрсатилмаган',
      'wh.bd.bmi.under': 'Кам вазн', 'wh.bd.bmi.normal': 'Нормал', 'wh.bd.bmi.over': 'Ортиқча вазн', 'wh.bd.bmi.obese': 'Семизлик',
    },
    ru: {
      'wh.vt.title': 'Показатели за день', 'wh.vt.sub': 'относительно вашей нормы за 30 дней',
      'wh.vt.metric': 'Показатель', 'wh.vt.value': 'Значение', 'wh.vt.base': 'Норма', 'wh.vt.delta': 'Разница',
      'wh.vt.resp': 'Дыхание', 'wh.vt.skin': 'Температура кожи',
      'wh.vt.none': 'За этот день у WHOOP нет измерений',
      'wh.bd.title': 'Тело', 'wh.bd.bmi': 'Индекс массы тела',
      'wh.bd.noWeight': 'Вес не указан в приложении WHOOP',
      'wh.bd.bmi.under': 'Дефицит веса', 'wh.bd.bmi.normal': 'Норма', 'wh.bd.bmi.over': 'Избыток веса', 'wh.bd.bmi.obese': 'Ожирение',
    },
  });

  /* «Yorug' qog'oz» (2026-10-09) — Tana sahifalarining yangi matnlari.
     Bitta ixcham jadval [uz, uzk, ru], uch tilga yoyiladi. */
  const T9 = {
    // qisqa birliklar — tor joyda (xarita, plitka, jadval): «7 s 25 d»
    'wh.u.h': ['s', 'с', 'ч'], 'wh.u.m': ['d', 'д', 'м'], 'wh.u.mL': ['daqiqa', 'дақиқа', 'мин'],
    'wh.u.rpm': ['/daq', '/дақ', '/мин'], 'wh.u.beat': ['zarba', 'зарба', 'уд.'], 'wh.u.bpm': ['zarba/daq', 'зарба/дақ', 'уд/мин'],
    'wh.u.ms': ['ms', 'мс', 'мс'], 'wh.u.cm': ['sm', 'см', 'см'], 'wh.u.pcs': ['ta', 'та', 'шт.'], 'wh.u.km': ['km', 'км', 'км'], 'wh.u.age': ['yosh', 'ёш', 'лет'],
    'wh.avgOf': ["o'rtacha {n}", 'ўртача {n}', 'в среднем {n}'],
    'wh.c.good': ['yashil', 'яшил', 'зелёное'], 'wh.c.warn': ['sariq', 'сариқ', 'жёлтое'], 'wh.c.bad': ['qizil', 'қизил', 'красное'],
    // tana xaritasi
    'wh.map.title': ['Tana xaritasi', 'Тана харитаси', 'Карта тела'],
    'wh.map.rec': ['Tiklanish {n}%', 'Тикланиш {n}%', 'Восстановление {n}%'],
    'wh.map.brain': ['Miya · uyqu', 'Мия · уйқу', 'Мозг · сон'], 'wh.map.lung': ["O'pka", 'Ўпка', 'Лёгкие'], 'wh.map.skin': ['Teri', 'Тери', 'Кожа'],
    'wh.map.heart': ['Yurak', 'Юрак', 'Сердце'], 'wh.map.weight': ['Vazn', 'Вазн', 'Вес'], 'wh.map.mus': ['Mushaklar', 'Мушаклар', 'Мышцы'],
    'wh.map.strain': ["zo'riqish", 'зўриқиш', 'нагрузка'], 'wh.map.norm': ["me'yorda", 'меъёрда', 'в норме'],
    'wh.map.off': ["me'yordan {d}°", 'меъёрдан {d}°', '{d}° от нормы'], 'wh.map.w90': ['3 oyda {d}', '3 ойда {d}', 'за 3 мес. {d}'],
    'wh.map.note': ["Orqadagi {c} nur — bugungi tiklanish. Nuqtalar — WHOOP o'lchovlari.", 'Орқадаги {c} нур — бугунги тикланиш. Нуқталар — WHOOP ўлчовлари.', 'Свечение позади ({c}) — сегодняшнее восстановление. Точки — измерения WHOOP.'],
    'wh.map.notePast': ["Orqadagi {c} nur — o'sha kungi tiklanish. Nuqtalar — WHOOP o'lchovlari.", 'Орқадаги {c} нур — ўша кунги тикланиш. Нуқталар — WHOOP ўлчовлари.', 'Свечение позади ({c}) — восстановление в тот день. Точки — измерения WHOOP.'],
    'wh.map.noteNone': ["Nuqtalar — WHOOP o'lchovlari.", 'Нуқталар — WHOOP ўлчовлари.', 'Точки — измерения WHOOP.'],
    // tiklanish kartasi
    'wh.rc.avg30': ["30 kunlik o'rtacha {n}%", '30 кунлик ўртача {n}%', 'среднее за 30 дней {n}%'],
    'wh.rc.z.good': ['Yaxshi tiklangan', 'Яхши тикланган', 'Хорошее восстановление'], 'wh.rc.z.warn': ["O'rtacha tiklangan", 'Ўртача тикланган', 'Среднее восстановление'], 'wh.rc.z.bad': ['Past tiklangan', 'Паст тикланган', 'Низкое восстановление'],
    'wh.rc.adv.good': ["Bugun **{n} gacha** zo'riqish ko'tarishingiz mumkin. Kuchli mashg'ulot uchun yaxshi kun.", 'Бугун **{n} гача** зўриқиш кўтаришингиз мумкин. Кучли машғулот учун яхши кун.', 'Сегодня можно нагрузку **до {n}**. Хороший день для сильной тренировки.'],
    'wh.rc.adv.warn': ["Bugun **{n} atrofida** zo'riqish yetarli. O'rtacha yuk oling.", 'Бугун **{n} атрофида** зўриқиш етарли. Ўртача юк олинг.', 'Сегодня достаточно нагрузки **около {n}**. Выберите среднюю тренировку.'],
    'wh.rc.adv.bad': ['Bugun **{n} dan** oshirmang. Tanangizga dam bering.', 'Бугун **{n} дан** оширманг. Танангизга дам беринг.', 'Сегодня не выше **{n}**. Дайте телу отдохнуть.'],
    'wh.rc.sl.short': ['kerakdan {h} kam', 'керакдан {h} кам', 'меньше нужного на {h}'], 'wh.rc.sl.over': ["kerakdan {h} ko'p", 'керакдан {h} кўп', 'больше нужного на {h}'],
    'wh.rc.sl.ok': ["kerakli {need} to'liq qoplandi", 'керакли {need} тўлиқ қопланди', 'норма {need} закрыта полностью'],
    'wh.rc.up': ["o'rtachadan {p}% yuqori ({v})", 'ўртачадан {p}% юқори ({v})', 'выше среднего на {p}% ({v})'], 'wh.rc.down': ["o'rtachadan {p}% past ({v})", 'ўртачадан {p}% паст ({v})', 'ниже среднего на {p}% ({v})'],
    'wh.rc.same': ["o'rtacha atrofida ({v})", 'ўртача атрофида ({v})', 'около среднего ({v})'],
    'wh.rc.rhrUp': ["o'rtachadan {n} zarba yuqori ({v})", 'ўртачадан {n} зарба юқори ({v})', 'выше среднего на {n} уд. ({v})'], 'wh.rc.rhrDown': ["o'rtachadan {n} zarba past ({v})", 'ўртачадан {n} зарба паст ({v})', 'ниже среднего на {n} уд. ({v})'],
    'wh.rc.rhrSame': ["o'rtacha atrofida ({v})", 'ўртача атрофида ({v})', 'около среднего ({v})'],
    // o'lchovlar jadvali
    'wh.vt.titleDay': ["Kun o'lchovlari", 'Кун ўлчовлари', 'Показатели дня'],
    'wh.vt.noneSub': ["Soat taqilgan kunlarda o'lchovlar shu yerda ko'rinadi.", 'Соат тақилган кунларда ўлчовлар шу ерда кўринади.', 'В дни, когда вы носите браслет, показатели появляются здесь.'],
    // tendensiya
    'wh.tr.avg': ["O'rtacha", 'Ўртача', 'Среднее'], 'wh.tr.best': ['Eng yaxshi', 'Энг яхши', 'Лучшее'], 'wh.tr.worst': ['Eng past', 'Энг паст', 'Худшее'], 'wh.tr.today': ['bugun', 'бугун', 'сегодня'],
    'wh.tr.legend': ["Yashil — o'rtachangizdan yaxshi, qizil — yomon, kulrang — odatdagidek.", 'Яшил — ўртачангиздан яхши, қизил — ёмон, кулранг — одатдагидек.', 'Зелёный — лучше вашего среднего, красный — хуже, серый — как обычно.'],
    // tana kartasi
    'wh.bd.weightTrend': ['Vazn · 90 kun', 'Вазн · 90 кун', 'Вес · 90 дней'],
    'wh.bd.whoopAge': ['WHOOP yoshi', 'WHOOP ёши', 'Возраст WHOOP'], 'wh.bd.pace': ["Qarish sur'ati", 'Қариш суръати', 'Темп старения'],
    'wh.bd.slow': ['sekin', 'секин', 'медленно'], 'wh.bd.fast': ['tez', 'тез', 'быстро'], 'wh.bd.even': ["me'yorda", 'меъёрда', 'в норме'],
    // uyqu
    'wh.sl.last': ['Kechagi uyqu', 'Кечаги уйқу', 'Сон прошлой ночью'], 'wh.sl.night': ['Tungi uyqu', 'Тунги уйқу', 'Ночной сон'],
    'wh.sl.z.good': ['Yetarli', 'Етарли', 'Достаточно'], 'wh.sl.z.warn': ['Kamroq', 'Камроқ', 'Маловато'], 'wh.sl.z.bad': ['Kam', 'Кам', 'Мало'],
    'wh.sl.needWas': ['Kerak edi {t}', 'Керак эди {t}', 'Нужно было {t}'], 'wh.sl.less': ['{t} kam', '{t} кам', 'меньше на {t}'], 'wh.sl.more': ["{t} ko'p", '{t} кўп', 'больше на {t}'],
    'wh.sl.exact': ["to'liq qoplandi", 'тўлиқ қопланди', 'норма закрыта'],
    'wh.sl.bed': ['Yotdingiz', 'Ётдингиз', 'Легли'], 'wh.sl.wake': ['Turdingiz', 'Турдингиз', 'Встали'],
    'wh.sl.st.deep': ['Chuqur', 'Чуқур', 'Глубокий'], 'wh.sl.st.rem': ['Tush (REM)', 'Туш (REM)', 'Быстрый (REM)'], 'wh.sl.st.light': ['Yengil', 'Енгил', 'Лёгкий'], 'wh.sl.st.awake': ["Uyg'oq", 'Уйғоқ', 'Без сна'],
    'wh.sl.sd.deep': ['tanani tiklaydi', 'танани тиклайди', 'восстанавливает тело'], 'wh.sl.sd.rem': ['xotira va kayfiyat', 'хотира ва кайфият', 'память и настроение'],
    'wh.sl.sd.light': ['uyquning asosiy qismi', 'уйқунинг асосий қисми', 'основная часть сна'], 'wh.sl.sd.awake': ["tunda uyg'ongan vaqt", 'тунда уйғонган вақт', 'время бодрствования ночью'],
    'wh.sl.quality': ['Uyqu sifati', 'Уйқу сифати', 'Качество сна'],
    'wh.sl.q.perf': ['Natija', 'Натижа', 'Результат'], 'wh.sl.q.eff': ['Samaradorlik', 'Самарадорлик', 'Эффективность'], 'wh.sl.q.cons': ['Izchillik', 'Изчиллик', 'Регулярность'],
    'wh.sl.qd.perf': ['kerakli uyquning qanchasini oldingiz', 'керакли уйқунинг қанчасини олдингиз', 'какую часть нужного сна вы получили'],
    'wh.sl.qd.eff': ["to'shakdagi vaqtning qanchasi uyqu bo'ldi", 'тўшакдаги вақтнинг қанчаси уйқу бўлди', 'какая часть времени в постели ушла на сон'],
    'wh.sl.qd.cons': ['har kuni bir xil vaqtda yotib turish', 'ҳар куни бир хил вақтда ётиб туриш', 'ложиться и вставать в одно и то же время'],
    'wh.sl.t.inBed': ["To'shakda", 'Тўшакда', 'В постели'], 'wh.sl.t.cycles': ['Uyqu sikllari', 'Уйқу цикллари', 'Циклы сна'], 'wh.sl.t.dist': ["Uyg'onishlar", 'Уйғонишлар', 'Пробуждения'],
    'wh.sl.t.naps': ['Kunduzgi uyqu', 'Кундузги уйқу', 'Дневной сон'], 'wh.sl.t.none': ["yo'q", 'йўқ', 'нет'],
    'wh.sl.needLab': ['kerak {t}', 'керак {t}', 'нужно {t}'],
    'wh.sl.debt': ["7 kunda **{t}** uyqu qarzi to'plandi", '7 кунда **{t}** уйқу қарзи тўпланди', 'За 7 дней накопился долг сна **{t}**'],
    'wh.sl.debt0': ["7 kunda uyqu qarzi yo'q", '7 кунда уйқу қарзи йўқ', 'За 7 дней долга сна нет'],
    'wh.sl.noneSub': ["WHOOP uyquni yozgach shu yerda ko'rinadi.", 'WHOOP уйқуни ёзгач шу ерда кўринади.', 'Появится здесь, когда WHOOP запишет сон.'],
    // zo'riqish
    'wh.st.today': ["Bugungi zo'riqish", 'Бугунги зўриқиш', 'Нагрузка сегодня'],
    'wh.st.live': ['jonli · {t} dan', 'жонли · {t} дан', 'live · с {t}'], 'wh.st.of21': ['21 dan', '21 дан', 'из 21'],
    'wh.st.load.over': ["Me'yordan oshdi", 'Меъёрдан ошди', 'Выше нормы'], 'wh.st.load.ok': ["Me'yorida", 'Меъёрида', 'В норме'], 'wh.st.load.under': ['Hali kam', 'Ҳали кам', 'Пока мало'],
    'wh.st.rec': ['tavsiya {n}', 'тавсия {n}', 'совет {n}'],
    'wh.st.a.room': ["Tavsiyagacha yana **{n}** qoldi — yengil mashg'ulot sig'adi.", 'Тавсиягача яна **{n}** қолди — енгил машғулот сиғади.', 'До рекомендации осталось **{n}** — лёгкая тренировка уместна.'],
    'wh.st.a.hit': ['Tavsiyaga yetdingiz — bugunga shu yetarli.', 'Тавсияга етдингиз — бугунга шу етарли.', 'Рекомендация достигнута — на сегодня достаточно.'],
    'wh.st.a.over': ['Tavsiyadan **{n}** oshdi — qolgan kun dam oling.', 'Тавсиядан **{n}** ошди — қолган кун дам олинг.', 'Выше рекомендации на **{n}** — остаток дня отдыхайте.'],
    'wh.st.note': ["Zo'riqish — kunlik jismoniy yuklama, 0 dan 21 gacha. Tavsiya o'sha kungi tiklanishdan hisoblanadi.", 'Зўриқиш — кунлик жисмоний юклама, 0 дан 21 гача. Тавсия ўша кунги тикланишдан ҳисобланади.', 'Нагрузка — физическая нагрузка за день, от 0 до 21. Рекомендация считается от восстановления в этот день.'],
    'wh.st.t.kcal': ['Kaloriya', 'Калория', 'Калории'], 'wh.st.t.hrAvg': ["O'rt. puls", 'Ўрт. пульс', 'Ср. пульс'],
    'wh.st.t.ofM': ['kunlik {t} dan', 'кунлик {t} дан', 'из {t} в день'], 'wh.st.t.ofE': ['taxminan {t} dan', 'тахминан {t} дан', 'примерно из {t}'],
    'wh.st.14': ["So'nggi 14 kun", 'Сўнгги 14 кун', 'Последние 14 дней'],
    'wh.st.legend': ["Ustun balandligi — o'sha kungi zo'riqish. Rangi — o'sha kungi tiklanish: yashil yaxshi, sariq o'rtacha, qizil past.", 'Устун баландлиги — ўша кунги зўриқиш. Ранги — ўша кунги тикланиш: яшил яхши, сариқ ўртача, қизил паст.', 'Высота столбца — нагрузка в тот день. Цвет — восстановление в тот день: зелёный — хорошее, жёлтый — среднее, красный — низкое.'],
    'wh.st.noneDay': ["Bu kun uchun zo'riqish yozuvi yo'q", 'Бу кун учун зўриқиш ёзуви йўқ', 'За этот день записи нагрузки нет'],
    'wh.st.noneSub': ["WHOOP kun davomida o'lchab boradi — birinchi o'qishdan keyin shu yerda ko'rinadi.", 'WHOOP кун давомида ўлчаб боради — биринчи ўқишдан кейин шу ерда кўринади.', 'WHOOP измеряет в течение дня — появится здесь после первого чтения.'],
    'wh.wo.sum': ['{n} ta · {t}', '{n} та · {t}', '{n} · {t}'],
    'wh.z.0': ['Dam', 'Дам', 'Покой'], 'wh.z.1': ['Yengil', 'Енгил', 'Лёгкая'], 'wh.z.2': ["O'rtacha", 'Ўртача', 'Средняя'], 'wh.z.3': ['Kuchli', 'Кучли', 'Высокая'], 'wh.z.4': ["Og'ir", 'Оғир', 'Тяжёлая'], 'wh.z.5': ['Maks', 'Макс', 'Макс'],
    'wh.sp.run': ['Yugurish', 'Югуриш', 'Бег'], 'wh.sp.walk': ['Yurish', 'Юриш', 'Ходьба'], 'wh.sp.hike': ['Piyoda sayr', 'Пиёда сайр', 'Поход'], 'wh.sp.bike': ['Velosiped', 'Велосипед', 'Велосипед'],
    'wh.sp.swim': ['Suzish', 'Сузиш', 'Плавание'], 'wh.sp.lift': ['Kuch mashqi', 'Куч машқи', 'Силовая'], 'wh.sp.fit': ['Funksional mashq', 'Функционал машқ', 'Функциональная'],
    'wh.sp.hiit': ['HIIT', 'HIIT', 'HIIT'], 'wh.sp.yoga': ['Yoga', 'Йога', 'Йога'], 'wh.sp.ball': ['Futbol', 'Футбол', 'Футбол'], 'wh.sp.box': ['Boks', 'Бокс', 'Бокс'], 'wh.sp.any': ['Faollik', 'Фаоллик', 'Активность'],
    // ulanish kartasi
    'wh.intro.title': ['WHOOP ulanmagan', 'WHOOP уланмаган', 'WHOOP не подключён'],
  };
  {
    const tb = { uz: {}, uzk: {}, ru: {} };
    for (const k of Object.keys(T9)) { tb.uz[k] = T9[k][0]; tb.uzk[k] = T9[k][1]; tb.ru[k] = T9[k][2]; }
    D.i18n.add(tb);
  }

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
      if (r.nap) { const n = (naps[k] = naps[k] || { n: 0, h: 0 }); n.n++; n.h = D.round(n.h + (+r.sleepH || 0), 2); continue; }
      // WHOOP bergan aniqlik saqlanadi — yaxlitlash faqat ekranga chiqishda, soat+daqiqa sifatida
      merge(days, k, {
        sleepH: num(r.sleepH), inBedH: num(r.inBedH), awakeH: num(r.awakeH), stages: r.stages, cycles: r.cycles, disturbances: r.disturbances,
        sleepNeedH: num(r.sleepNeedH), needBaseH: num(r.needBaseH), debtH: num(r.debtH), sleepPerf: r.sleepPerf, sleepEff: r.sleepEff,
        sleepCons: r.sleepCons, resp: r.resp, bedTs: r.start, wakeTs: r.end,
        // xom millisekundlar: o'lchanmagan vaqt va uyqu ehtiyojining to'rt bo'lagi (asos / qarz / zo'riqish / kunduzgi uyqu)
        noData: num(r.noData), needBase: num(r.needBase), needDebt: num(r.needDebt), needStrain: num(r.needStrain), needNap: num(r.needNap),
      });
    }
    let live = null;
    for (const c of snap.cycle || []) {
      const k = c.start ? dayOfTs(new Date(new Date(c.start).getTime() + 12 * 3600e3)) : null; if (!k) continue;
      merge(days, k, { strain: c.strain, kcal: c.kcal, hrAvg: c.hrAvg, hrMax: c.hrMax });
      if (!c.end) live = { k, strain: c.strain, kcal: c.kcal, hrAvg: c.hrAvg, hrMax: c.hrMax, since: c.start, updatedAt: c.updatedAt };
    }
    const byId = new Map();
    // serverdagi mashg'ulot obyekti butunicha saqlanadi: sport, strain, puls, kcal, meters, altGain/altChange, percentRecorded, zones …
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
  const LIVE_VIEWS = new Set(['today', 'health', 'food']);

  async function fetchSnapshot() {
    const h = {};
    if (D.tg && D.tg.initData) h['X-Telegram-Init-Data'] = D.tg.initData;
    if (etag) h['If-None-Match'] = etag;
    const r = await D.fetchTimed('/api/whoop/snapshot', { credentials: 'same-origin', headers: h, cache: 'no-store' }, 15000);
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
      let snap = await fetchSnapshot();
      if (!snap) return false;
      if (snap.same && (!W().connected || !Object.keys(W().days).length)) { etag = null; snap = await fetchSnapshot(); if (!snap) return false; }
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
      const wasConnected = W().connected;
      const changed = applySnapshot(snap);
      // the server owns this data; persist locally without bumping updatedAt (no push, no 409 churn)
      // Faqat o'zgarganda. Ilgari bu shartsiz edi: WHOOP hech narsa yangilamagan
      // kunda ham har daqiqada butun blob JSON.stringify qilinib localStorage ga
      // qayta yozilardi — telefonda bu sezilarli va doimiy yuk.
      // wasConnected: ma'lumot bir xil bo'lsa ham, ulanish holati o'zgargan bo'lsa saqlaymiz.
      if (changed || !wasConnected) D.saveQuiet();
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
      await D.api('/api/whoop/refresh', { method: 'POST', body: '{}', timeout: 60000 });   // server WHOOP'dan tortadi — sekinroq
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
  /** Forget the ETag — the next poll fetches in full. Used when the account on this device changes. */
  D.whoop.resetCache = () => { etag = null; pendingTries = 0; };

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
    // bir kundan oshgan o'qish uchun daqiqa hisobi ma'nosiz — sanasini yozamiz
    const label = min < 1 ? t('wh.justNow') : min < 60 ? t('wh.minAgo', { n: min })
      : min < 1440 ? D.fmtHm(min / 60) : D.fmtTs(at);
    return { min, stale: min >= 3, label };
  };
  D.whoop.workoutsOn = (k) => W().workouts.filter((x) => x.k === k);
  D.whoop.workoutDays = (n) => { const set = new Set(); for (const x of W().workouts) if (x.k) set.add(x.k); return D.lastDays(n || 28).filter((k) => set.has(k)); };
  /** Minutes in each of WHOOP's six HR zones (0 = below 50% max) for one workout. */
  /** Mashg'ulot puls zonalari daqiqada — xom millisekundlar S.whoop.workouts[].zones da.
   *  Ekran uchun D.fmtMsS aniqroq; bu esa AI so'rovi va qisqa ro'yxatlar uchun. */
  D.whoop.zoneMins = (x) => (x && Array.isArray(x.zones) ? x.zones.map((ms) => Math.round((+ms || 0) / 60000)) : null);
  D.whoop.has = () => Object.keys(W().days).length > 0;
  D.whoop.trend = (field, n) => {
    const days = W().days;
    return D.lastDays(n || 30).map((k) => ({ k, v: num(days[k] && days[k][field]) }));
  };
  D.whoop.stats = (field, n) => {
    const vs = D.whoop.trend(field, n).map((x) => x.v).filter((x) => x !== null);
    if (!vs.length) return null;
    return { avg: D.avg(vs), min: Math.min(...vs), max: Math.max(...vs), n: vs.length };
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
  /* ------------------------------------------------------------------ */
  /* Energiya — ilovadagi yagona manba (Ovqat me'yori ham shu yerdan).   */
  /*                                                                     */
  /* O'lchangan sarf taxmindan ustun turadi. WHOOP har kuni to'liq       */
  /* siklning kaloriyasini beradi; so'nggi 28 kunda kamida 10 kun        */
  /* to'plansa TDEE o'sha kunlarning qirqilgan o'rtachasi bo'ladi — eng  */
  /* past va eng yuqori 10 % tashlanadi, kasal kun yoki marafon          */
  /* o'rtachani buzmasin. Bugun kirmaydi: sikl tugamagan, kaloriyasi     */
  /* to'liq emas va o'rtachani pastga tortadi.                           */
  /*                                                                     */
  /* Yetmasa — Mifflin-St Jeor x D.activityFactor, avvalgidek. Farqi     */
  /* shuki, bo'y yoki yosh bo'lmasa baho endi butunlay o'chib qolmaydi:  */
  /* 170 sm / 30 yosh o'rniga qo'yiladi va natija `approx: true` bilan   */
  /* belgilanadi. Ovqat bo'limi me'yorsiz qolgandan ko'ra taxminiy       */
  /* me'yor bergani yaxshi, faqat taxminligi aytilsin.                   */
  /* ------------------------------------------------------------------ */
  const TDEE_WINDOW = 28;     // necha kunlik oynaga qaraymiz
  const TDEE_MIN_DAYS = 10;   // o'lchangan qiymatga o'tish uchun eng kam kun
  const TDEE_FLOOR = 800;     // bundan past sikl — taqilmagan kun, hisobga olinmaydi

  function trimmedMean(vs, cut) {
    const a = vs.slice().sort((x, y) => x - y);
    const k = Math.floor(a.length * (cut || 0.1));
    const core = a.length - 2 * k >= 3 ? a.slice(k, a.length - k) : a;
    return D.avg(core);
  }
  /** Vazn: profil -> WHOOP tanasi -> so'nggi 60 kun ichidagi oxirgi o'lchov. */
  function bodyKg() {
    const p = D.S.profile || {};
    if (num(p.weightKg) !== null) return +p.weightKg;
    const b = W().body || {};
    if (num(b.weightKg) !== null) return +b.weightKg;
    for (const k of D.lastDays(60).reverse()) { const h = (D.S.health || {})[k]; if (h && num(h.weight) !== null) return +h.weight; }
    return null;
  }
  function bodyCm() {
    const p = D.S.profile || {};
    if (num(p.heightCm) !== null) return +p.heightCm;
    const b = W().body || {};
    return num(b.heightCm) !== null ? +b.heightCm : null;
  }
  /** {tdee, bmr, source:'measured'|'estimated', days, kg, cm, age, approx} | null */
  D.whoop.energy = () => {
    const p = D.S.profile || {};
    const kg = bodyKg(), cm = bodyCm(), age = D.profileAge();
    const bmr = kg === null ? null : Math.round(10 * kg + 6.25 * (cm || 170) - 5 * (age || 30) + (p.sex === 'f' ? -161 : 5));
    const days = W().days || {};
    const vals = [];
    for (const k of D.lastDays(TDEE_WINDOW, D.addDays(D.today(), -1))) {
      const v = num((days[k] || {}).kcal);
      if (v !== null && v >= TDEE_FLOOR) vals.push(v);
    }
    if (vals.length >= TDEE_MIN_DAYS) {
      return { tdee: Math.round(trimmedMean(vals)), bmr, source: 'measured', days: vals.length, kg, cm, age, approx: false };
    }
    if (kg === null) return null;
    return { tdee: Math.round(bmr * D.activityFactor(p.activity)), bmr, source: 'estimated', days: vals.length, kg, cm, age, approx: !cm || age === null };
  };
  D.whoop.tdee = () => { const e = D.whoop.energy(); return e ? e.tdee : null; };

  D.whoop.dayInsight = (key) => {
    key = key || D.today();
    const d = W().days[key];
    if (!d) return null;
    const o = { key };
    const sleepH = num(d.sleepH), need = num(d.sleepNeedH);
    o.sleepH = sleepH; o.needH = need;
    if (sleepH !== null && need !== null && need > 0) { o.gapH = D.round(sleepH - need, 2); o.metPct = Math.round((sleepH / need) * 100); }
    o.perf = num(d.sleepPerf); o.eff = num(d.sleepEff); o.cons = num(d.sleepCons); o.debtH = num(d.debtH);
    o.recovery = num(d.recovery); o.strain = num(d.strain); o.kcal = num(d.kcal);
    o.hrv = num(d.hrv); o.rhr = num(d.rhr); o.resp = num(d.resp); o.spo2 = num(d.spo2); o.skin = num(d.skin);
    // deviation from the user's own 30-day baseline — far more meaningful than a population range
    const bHrv = D.whoop.baseline('hrv', key, 30), bRhr = D.whoop.baseline('rhr', key, 30), bRec = D.whoop.baseline('recovery', key, 30);
    // me'yorlar ham yaxlitlanmaydi — ekranda bir kasr bilan chiqadi
    if (o.hrv !== null && bHrv) { o.hrvBase = D.round(bHrv, 1); o.hrvPct = D.round(((o.hrv - bHrv) / bHrv) * 100, 1); }
    if (o.rhr !== null && bRhr) { o.rhrBase = D.round(bRhr, 1); o.rhrDelta = D.round(o.rhr - bRhr, 1); }
    if (o.recovery !== null && bRec) { o.recBase = D.round(bRec, 1); o.recDelta = D.round(o.recovery - bRec, 1); }
    // strain the body was ready for: WHOOP's own rule of thumb is that recovery sets the ceiling
    if (o.recovery !== null) {
      o.strainTarget = D.round(4 + (o.recovery / 100) * 14, 1);   // 4 at 0% recovery → 18 at 100%
      if (o.strain !== null) {
        o.strainGap = D.round(o.strain - o.strainTarget, 1);
        o.load = o.strainGap > 3 ? 'over' : o.strainGap < -4 ? 'under' : 'ok';
      }
    }
    // energiya: kunning sarfi o'z me'yoriga nisbatan. `measured` manbada
    // me'yor aynan shu odamning 28 kunlik o'rtacha sarfi, taxmin emas.
    const en = D.whoop.energy();
    if (o.kcal !== null && en && en.tdee) { o.tdee = en.tdee; o.tdeeSource = en.source; o.kcalDelta = o.kcal - en.tdee; }
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
    return seen ? { h: D.round(debt, 2), days: seen } : null;
  };

  /* ------------------------------------------------------------------ */
  /* biologik yosh — oshkora taxmin, WHOOP raqami emas                   */
  /* WHOOP API Healthspan / WHOOP Age ni bermaydi; bu yerda 30 kunlik    */
  /* o'rtachalar pasport yoshiga nisbatan yillarga aylantiriladi.        */
  /* Har omilning ta'siri chegaralangan, yig'indi ±15 yil.               */
  /*                                                                     */
  /* Ma'lumotnoma qiymatlari (populyatsiya o'rtachalari, taxminiy):      */
  /*  · HRV (rMSSD) yoshga qarab: 65 ms × 0.985^(yosh−20) —              */
  /*    ≈65 (20), 56 (30), 48 (40), 41 (50), 35 (60), 30 (70) ms;        */
  /*    WHOOP a'zolarining yosh bo'yicha medianalariga yaqin egri.        */
  /*  · Tinch puls: 60 bpm; uyqu sifati 85 %; uyqu izchilligi 75 %;      */
  /*  · kunlik zo'riqish 8–14 oralig'i foydali (haftalik 56–98);         */
  /*  · haftasiga 3 mashg'ulot.                                          */
  /* Ta'sir (yil): HRV −12·ln(v/ref) [±6] · puls (v−60)·0.25 [±4] ·     */
  /*  sifat −(v−85)·0.08 [±2.5] · izchillik −(v−75)·0.05 [±2] ·          */
  /*  zo'riqish −(min(v,14)−8)·0.3 [±2] · mashg'ulot −(v−3)·0.4 [±2].    */
  /* ------------------------------------------------------------------ */
  const BIO_HRV_AT = (age) => 65 * Math.pow(0.985, age - 20);
  D.whoop.chronoAge = () => D.profileAge();
  D.whoop.bioAge = () => {
    const w = W();
    const chrono = D.whoop.chronoAge();
    if (!chrono) return null;
    const keys = D.lastDays(30);
    const acc = { hrv: [], rhr: [], sleepPerf: [], sleepCons: [], strain: [] };
    let n = 0;
    for (const k of keys) {
      const d = w.days[k]; if (!d) continue;
      let any = false;
      for (const f of Object.keys(acc)) { const v = num(d[f]); if (v !== null) { acc[f].push(v); any = true; } }
      if (any) n++;
    }
    if (n < 7) return null;
    const inputs = [];
    let delta = 0;
    const add = (k, v, ref, effect, cap, unit) => {
      effect = D.round(D.clamp(effect, -cap, cap), 1);
      inputs.push({ k, v, ref, effect, unit: unit || '' });
      delta += effect;
    };
    if (acc.hrv.length) { const v = Math.round(D.avg(acc.hrv)), ref = Math.round(BIO_HRV_AT(chrono)); if (v > 0) add('hrv', v, ref, -12 * Math.log(v / ref), 6, 'ms'); }
    if (acc.rhr.length) { const v = Math.round(D.avg(acc.rhr)); add('rhr', v, 60, (v - 60) * 0.25, 4, 'bpm'); }
    if (acc.sleepPerf.length) { const v = Math.round(D.avg(acc.sleepPerf)); add('sleepPerf', v, 85, -(v - 85) * 0.08, 2.5, '%'); }
    if (acc.sleepCons.length) { const v = Math.round(D.avg(acc.sleepCons)); add('sleepCons', v, 75, -(v - 75) * 0.05, 2, '%'); }
    if (acc.strain.length) { const s = D.avg(acc.strain); add('strain', D.round(s * 7, 0), 70, -(Math.min(s, 14) - 8) * 0.3, 2, ''); }
    const set = new Set(keys);
    const wk = D.round((w.workouts.filter((x) => set.has(x.k)).length / 30) * 7, 1);
    add('workouts', wk, 3, -(wk - 3) * 0.4, 2, '');
    delta = D.round(D.clamp(delta, -15, 15), 1);
    return { est: D.round(chrono + delta, 1), chrono, delta, inputs, days: n };
  };

  /* ------------------------------------------------------------------ */
  /* Tana sahifalari — «Yorug' qog'oz» (2026-10-09, egasi tasdiqlagan     */
  /* dizayn hujjati, 6-bo'lim).                                           */
  /*                                                                      */
  /* Bu yerda faqat KO'RINISH. Har bir raqam yuqoridagi yordamchilardan   */
  /* (dayInsight · day · baseline · stats · sleepDebt · energy) o'zgarish- */
  /* siz olinadi; yangi hisob yo'q, yangi saqlanadigan maydon yo'q.        */
  /*                                                                      */
  /* Tayyorlik: tana xaritasi → tiklanish halqasi → o'lchovlar jadvali →  */
  /*            tendensiya → tana.                                        */
  /* Uyqu:      kechagi uyqu → bosqichlar → sifat → 14 kecha.             */
  /* Zo'riqish: bugungi zo'riqish → uch plitka → mashg'ulotlar → 14 kun.  */
  /* ------------------------------------------------------------------ */
  const zRec = (v) => (v >= 67 ? 'good' : v >= 34 ? 'warn' : 'bad');
  const cl = (v) => D.clamp(+v || 0, 0, 100);
  const hm = (iso) => { if (!iso) return ''; const p = D.nowTz(new Date(iso)); return D.fmtTime(p.h, p.min); };
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('whoop', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };
  // «**14 gacha**» → qalin. Avval ekranlash, keyin belgilash: tarjima matni HTML bo'lib kira olmaydi.
  const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  /* Vaqt hech qachon kasr soatda ko'rsatilmaydi. Tor joyda (xarita yozuvi,
     plitka, jadval) qisqa birlik — «7 s 25 d», matn ichida D.fmtHm —
     «7 soat 25 daq». Ikkalasi ham daqiqagacha aniq. */
  const shortH = (h) => {
    if (h == null || isNaN(+h)) return '—';
    const tot = Math.round(Math.abs(+h) * 60), hh = Math.floor(tot / 60), mm = tot % 60;
    return hh ? (mm ? `${hh} ${t('wh.u.h')} ${mm} ${t('wh.u.m')}` : `${hh} ${t('wh.u.h')}`) : `${mm} ${t('wh.u.m')}`;
  };
  const shortMs = (ms) => shortH((+ms || 0) / 3.6e6);
  // jadval katagi uchun «7:25» — soat:daqiqa, kasr emas
  const clock = (h) => { const tot = Math.round(Math.abs(+h) * 60); return `${Math.floor(tot / 60)}:${D.pad2(tot % 60)}`; };
  const emptyCard = (ic, title, sub) => `<div class="card wh-empty"><span class="ico">${D.ic(ic, 18)}</span><div><b>${esc(title)}</b>${sub ? `<p>${esc(sub)}</p>` : ''}</div></div>`;
  /** Uyquning me'yorga nisbati va holati — Uyqu sahifasi ham, xarita ham shu bitta qoidadan o'qiydi. */
  function sleepState(i) {
    const p = i.metPct != null ? i.metPct : i.perf != null ? Math.round(i.perf) : null;
    return { p, z: p == null ? '' : p >= 90 ? 'good' : p >= 75 ? 'warn' : 'bad' };
  }
  /** Bugun — jonli sikl (bo'lsa), o'tgan kun — kunning o'zi. */
  function strainOf(i, key) {
    const live = key === D.today() ? D.whoop.live() : null;
    return { live, strain: live ? live.strain : i.strain, kcal: live ? live.kcal : i.kcal };
  }
  const loadOf = (strain, target) => (strain != null && target ? (strain - target > 3 ? 'over' : strain - target < -4 ? 'under' : 'ok') : '');

  /** [{k, w}] — barcha yozilgan vaznlar, sanasi bo'yicha. */
  function weightPoints() {
    const out = [];
    const h = D.S.health || {};
    for (const k of Object.keys(h).sort()) { const v = num(h[k] && h[k].weight); if (v && v > 0) out.push({ k, w: v }); }
    return out;
  }
  /** Tana o'lchamlari: bo'y, vazn va maksimal puls WHOOP profilidan; 90 kunlik
   *  vazn nuqtalari eski yozuvlardan. Xarita ham, Tana kartasi ham shuni o'qiydi. */
  function bodyNow() {
    const b = W().body || {}, pr = D.S.profile || {};
    const pts = weightPoints();
    const cm = num(b.heightCm) ?? num(pr.heightCm);
    const kg = num(b.weightKg) ?? (pts.slice(-1)[0] || {}).w ?? null;
    const from = D.addDays(D.today(), -90);
    const recent = pts.filter((x) => x.k >= from);
    const diff = recent.length >= 2 ? recent[recent.length - 1].w - recent[0].w : null;
    return { cm, kg, maxHr: num(b.maxHr), recent, diff };
  }

  /* ------------------------------------------------------------------ */
  /* TANA XARITASI — egasining iltimosi, Tayyorlikning bosh kartasi.      */
  /* SVG dizayn hujjatining A.10 bandidan aynan ko'chirilgan (siluyet,    */
  /* nurlar, chiziqlar, nuqtalar va ularning koordinatalari). Yozuvlar    */
  /* SVG ustidagi HTML: foizda joylashgan, shuning uchun 360px ekranda    */
  /* karta torayganda rasm bilan birga kichrayadi.                        */
  /* Qiymati yo'q a'zo butunlay chizilmaydi — yozuvi ham, chizig'i ham,   */
  /* nuqtasi ham. Vazn o'sha kunga emas, bugungi holatga tegishli,        */
  /* shuning uchun o'tgan kun ochilganda u ko'rsatilmaydi.                */
  /* ------------------------------------------------------------------ */
  const MAP_BODY = 'M70 47 L77 47 C77.5 52 78.5 55 81 57 C89 60.5 100 60 106.5 64.5 C113.5 69 115.5 77 116.5 86 C118 100 120 114 121.5 127 C123.5 141 126.5 156 128.5 168 C130 176 131.5 183 129.5 189 C127.5 195 121 195 120 189 C119 183 118 176 116.5 168 C113.5 155 110.5 143 108.5 131 C106.5 120 104.5 108 103 99 C102 110 101 121 100 131 C99 141 97.5 150 98.5 158 C100.5 168 101.5 177 100.5 187 C99.5 211 96.5 236 94.5 258 C93.5 270 93.5 280 95.5 287 C97 292 89 295 82.5 292 C80.5 284 80.5 272 80.5 262 C79.5 238 78.5 213 74.5 193 C73.5 189 71.5 187 70 187 C68.5 187 66.5 189 65.5 193 C61.5 213 60.5 238 59.5 262 C59.5 272 59.5 284 57.5 292 C51 295 43 292 44.5 287 C46.5 280 46.5 270 45.5 258 C43.5 236 40.5 211 39.5 187 C38.5 177 39.5 168 41.5 158 C42.5 150 41 141 40 131 C39 121 38 110 37 99 C35.5 108 33.5 120 31.5 131 C29.5 143 26.5 155 23.5 168 C22 176 21 183 20 189 C19 195 12.5 195 10.5 189 C8.5 183 10 176 11.5 168 C13.5 156 16.5 141 18.5 127 C20 114 22 100 23.5 86 C24.5 77 26.5 69 33.5 64.5 C40 60 51 60.5 59 57 C61.5 55 62.5 52 63 47 L70 47 Z';
  const MAP = [
    { id: 'brain', side: 'l', line: 'M86 32 L132 32 L153 37', dot: [159, 37, '#7C3AED'], glow: '<circle cx="70" cy="24" r="17" fill="url(#tbBrain)"></circle>' },
    { id: 'lung', side: 'l', line: 'M86 110 L120 110 L141 101', dot: [146, 99, '#0EA5E9'], glow: '<ellipse cx="57" cy="86" rx="13" ry="17" fill="url(#tbLung)"></ellipse><ellipse cx="83" cy="86" rx="13" ry="17" fill="url(#tbLung)"></ellipse>' },
    { id: 'heart', side: 'r', line: 'M234 72 L198 72 L174 97', dot: [169, 101, '#E11D48'], glow: '<circle cx="80" cy="88" r="16" fill="url(#tbHeart)"></circle>' },
    { id: 'mus', side: 'r', line: 'M234 228 L200 228 L182 234', dot: [177, 235, '#2358E8'], glow: '<ellipse cx="86" cy="222" rx="11" ry="27" fill="url(#tbMus)"></ellipse><ellipse cx="54" cy="222" rx="11" ry="27" fill="url(#tbMus)"></ellipse>' },
    { id: 'skin', side: 'l', line: 'M86 178 L96 178 L102 172', dot: [106, 171, '#D97706'], glow: '<circle cx="17" cy="158" r="12" fill="url(#tbSkin)"></circle>' },
    { id: 'weight', side: 'r', line: 'M234 150 L204 150 L186 158', dot: [181, 160, '#1FA854'], glow: '' },
  ];
  // orqadagi nur — tiklanish zonasi rangida
  const AURA = { good: '#34D06A', warn: '#F2B53A', bad: '#E5484D', '': '#A3AAB4' };
  const radial = (id, c, o) => `<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${c}" stop-opacity="${o}"></stop><stop offset="1" stop-color="${c}" stop-opacity="0"></stop></radialGradient>`;

  D.whoop.bodyMap = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const i = D.whoop.dayInsight(key);
    if (!i) return '';
    const today = key === D.today();
    const z = i.recovery != null ? zRec(i.recovery) : '';
    const sm = (s) => `<small> ${esc(s)}</small>`;
    const val = {};   // id → { big, sub }
    if (i.sleepH != null) {
      const s = sleepState(i);
      val.brain = { big: esc(shortH(i.sleepH)), sub: s.p != null ? `${s.p}% · ${esc(t('wh.sl.z.' + s.z).toLowerCase())}` : '' };
    }
    if (i.resp != null) val.lung = { big: D.fmtNum(i.resp, 1) + sm(t('wh.u.rpm')), sub: i.spo2 != null ? `SpO₂ ${D.fmtNum(i.spo2, 1)}%` : '' };
    else if (i.spo2 != null) val.lung = { big: `${D.fmtNum(i.spo2, 1)}%`, sub: 'SpO₂' };
    if (i.rhr != null) val.heart = { big: D.fmtNum(i.rhr) + sm(t('wh.u.beat')), sub: i.hrv != null ? `HRV ${D.fmtNum(i.hrv, 1)} ${esc(t('wh.u.ms'))}` : '' };
    else if (i.hrv != null) val.heart = { big: D.fmtNum(i.hrv, 1) + sm(t('wh.u.ms')), sub: 'HRV' };
    if (i.skin != null) {
      // o'z 30 kunlik o'rtachangizdan yarim darajagacha farq — me'yor
      const base = D.whoop.baseline('skin', key, 30), d = base !== null ? i.skin - base : null;
      val.skin = { big: `${D.fmtNum(i.skin, 1)}°`, sub: d === null ? '' : Math.abs(d) < 0.5 ? esc(t('wh.map.norm')) : esc(t('wh.map.off', { d: D.fmtSigned(d, 1) })) };
    }
    if (today) {
      const b = bodyNow();
      if (b.kg !== null) val.weight = { big: D.fmtNum(b.kg, 1) + sm(t('unit.kg')), sub: b.diff !== null ? esc(t('wh.map.w90', { d: D.fmtSigned(b.diff, 1) })) : '' };
    }
    const strain = strainOf(i, key).strain;
    if (strain != null) val.mus = { big: D.fmtNum(strain, 1), sub: esc(t('wh.map.strain')) };
    const on = MAP.filter((m) => val[m.id]);
    if (!on.length) return '';
    const labels = on.map((m) => `<div class="wh-map-l ${m.side} ${m.id}"><span>${esc(t('wh.map.' + m.id))}</span><b class="num">${val[m.id].big}</b>${val[m.id].sub ? `<em class="num">${val[m.id].sub}</em>` : ''}</div>`).join('');
    const svg = `<svg class="wh-map-svg" viewBox="0 0 318 320" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tbFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE6F1"></stop><stop offset="1" stop-color="#C5D2E3"></stop></linearGradient>
        ${radial('tbAura', AURA[z], '0.30')}${radial('tbHeart', '#F43F5E', '0.60')}${radial('tbLung', '#38BDF8', '0.50')}${radial('tbBrain', '#8B5CF6', '0.60')}${radial('tbMus', '#3B7BFF', '0.50')}${radial('tbSkin', '#F59E0B', '0.55')}
      </defs>
      <ellipse cx="159" cy="150" rx="96" ry="132" fill="url(#tbAura)"></ellipse>
      <ellipse class="wh-map-sh" cx="159" cy="309" rx="46" ry="5"></ellipse>
      <g transform="translate(89 13)">
        <g class="wh-map-body"><circle cx="70" cy="25" r="21" fill="url(#tbFill)" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.5"></circle>
        <path d="${MAP_BODY}" fill="url(#tbFill)" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.5" stroke-linejoin="round"></path></g>
        ${on.map((m) => m.glow).join('')}
      </g>
      <g stroke="#A3AAB4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none">${on.map((m) => `<path d="${m.line}"></path>`).join('')}</g>
      <g class="wh-map-dots" stroke-width="2.5">${on.map((m) => `<circle cx="${m.dot[0]}" cy="${m.dot[1]}" r="5" fill="${m.dot[2]}"></circle>`).join('')}</g>
    </svg>`;
    const note = z ? t(today ? 'wh.map.note' : 'wh.map.notePast', { c: t('wh.c.' + z) }) : t('wh.map.noteNone');
    return `<section class="card hero hero--tana wh-map${z ? ' ' + z : ''}" aria-label="${esc(t('wh.map.title'))}">
      <div class="card-head"><h2 class="title">${esc(t('wh.map.title'))}</h2>${z ? `<span class="hero-pill num"><i class="dot"></i>${esc(t('wh.map.rec', { n: Math.round(i.recovery) }))}</span>` : ''}</div>
      <div class="wh-map-box">${svg}${labels}</div>
      <p class="wh-fine wh-map-note">${esc(note)}</p>
    </section>`;
  };

  /* ------------------------------------------------------------------ */
  /* TIKLANISH — halqa (132px, A.5), holat pilli, maslahat va uch izoh   */
  /* qatori: uyqu, HRV va tinch puls o'z 30 kunlik o'rtachangizga         */
  /* nisbatan. Nuqta rangi — jadvaldagi «sezilarli farq» qoidasi bilan    */
  /* bir xil: yaxshi tomonga yashil, yomon tomonga qizil, aks holda kul.  */
  /* ------------------------------------------------------------------ */
  const RING_G = { good: ['#6EE7A0', '#16A34A'], warn: ['#F7D27A', '#E08A0C'], bad: ['#F8A5A8', '#E5484D'] };
  function recRing(rec, z) {
    const r = 56, C = 2 * Math.PI * r, g = RING_G[z] || RING_G.good;
    return `<div class="wh-ring ${z}"><svg viewBox="0 0 132 132" width="132" height="132" fill="none" aria-hidden="true">
        <defs><linearGradient id="whRg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
        <g transform="rotate(-90 66 66)" stroke-width="14" stroke-linecap="round"><circle class="wh-ring-t" cx="66" cy="66" r="${r}"/>
          ${rec > 0 ? `<circle cx="66" cy="66" r="${r}" stroke="url(#whRg)" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - cl(rec) / 100)).toFixed(1)}"/>` : ''}</g></svg>
      <div class="wh-ring-c"><b class="num">${rec == null ? '—' : `${Math.round(rec)}<small>%</small>`}</b></div></div>`;
  }
  D.whoop.hero = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const i = D.whoop.dayInsight(key);
    if (!i) return '';
    // tiklanish hali kelmagan (yoki soat kechasi taqilmagan): bo'sh joy emas, tushuntirish
    if (i.recovery == null) return emptyCard('heart', t('today.rec.waitTitle'), t('today.rec.waitSub'));
    const z = zRec(i.recovery);
    const rows = [];
    const row = (cls, lab, txt) => rows.push(`<li class="${cls}"><i class="dot"></i><span><b>${esc(lab)}:</b> ${esc(txt)}</span></li>`);
    if (i.gapH != null) {
      const k = Math.abs(i.gapH) < 1 / 120 ? 'ok' : i.gapH < 0 ? 'short' : 'over';
      row(i.gapH >= -0.5 ? 'good' : 'bad', t('wh.sleepH'), t('wh.rc.sl.' + k, { h: D.fmtHm(Math.abs(i.gapH)), need: D.fmtHm(i.needH) }));
    }
    if (i.hrvPct !== undefined) {
      const big = Math.abs(i.hrvPct) >= 3;
      row(!big ? '' : i.hrvPct > 0 ? 'good' : 'bad', t('wh.hrv'), t(!big ? 'wh.rc.same' : i.hrvPct > 0 ? 'wh.rc.up' : 'wh.rc.down', { p: D.fmtNum(Math.abs(i.hrvPct), 1), v: `${D.fmtNum(i.hrv, 1)} ${t('wh.u.ms')}` }));
    }
    if (i.rhrDelta !== undefined) {
      const big = Math.abs(i.rhrDelta) >= 1;
      row(!big ? '' : i.rhrDelta < 0 ? 'good' : 'bad', t('wh.rhr'), t(!big ? 'wh.rc.rhrSame' : i.rhrDelta > 0 ? 'wh.rc.rhrUp' : 'wh.rc.rhrDown', { n: D.fmtNum(Math.abs(i.rhrDelta), 1), v: D.fmtNum(i.rhr) }));
    }
    const adv = i.strainTarget != null ? bold(t('wh.rc.adv.' + z, { n: D.fmtNum(Math.round(i.strainTarget)) })) : esc(t(z === 'good' ? 'wh.ready.high' : z === 'warn' ? 'wh.ready.mid' : 'wh.ready.low'));
    const cal = w.days[key] && w.days[key].calibrating ? `<p class="wh-fine">${esc(t('wh.calibrating'))}</p>` : '';
    const errKey = w.err ? 'wh.err.' + w.err : '';
    const err = w.err ? `<div class="advice warn wh-err">${D.ic('alert', 18)}<span>${esc(t(errKey, { e: w.err }) === errKey ? t('wh.err.http', { e: w.err }) : t(errKey, { e: w.err }))}</span></div>` : '';
    return `<section class="card hero hero--yashil wh-rec">
      <div class="card-head"><h2 class="title">${esc(t('wh.recovery'))}</h2>${i.recBase != null ? `<span class="hero-pill num">${esc(t('wh.rc.avg30', { n: D.fmtNum(i.recBase, 1) }))}</span>` : ''}</div>
      <div class="wh-rec-main">${recRing(i.recovery, z)}
        <div class="wh-rec-txt"><span class="pill ${z}">${esc(t('wh.rc.z.' + z))}</span><p>${adv}</p></div></div>
      ${rows.length ? `<ul class="wh-rec-rows">${rows.join('')}</ul>` : ''}${cal}${err}
    </section>`;
  };

  /* ------------------------------------------------------------------ */
  /* Tayyorlik: kunning o'lchovlari                                      */
  /* WHOOP tiklanishni to'rt kirishdan yig'adi — HRV, tinch puls, uyqu   */
  /* va nafas. Jadval o'sha to'rttasini va uch qo'shimcha o'lchovni      */
  /* ko'rsatadi; taqqoslash populyatsiya normasi bilan emas, o'zingizning */
  /* 30 kunlik o'rtachangiz bilan — u yagona ma'noli me'yor.             */
  /* Uyqu esa o'sha kecha WHOOP hisoblagan ehtiyoj bilan solishtiriladi. */
  /* ------------------------------------------------------------------ */
  const VITALS = [
    { f: 'recovery', lab: 'wh.recovery', u: '%', dec: 0, dir: 'up' },   // WHOOP butun foiz beradi, me'yor bir kasrda
    { f: 'hrv', lab: 'wh.hrv', u: 'ms', dec: 1, dir: 'up', pct: true },
    { f: 'rhr', lab: 'wh.rhr', dec: 1, dir: 'down' },
    { f: 'sleepH', lab: 'wh.sleepH', dec: 2, dir: 'up', time: true, need: 'sleepNeedH' },
    { f: 'resp', lab: 'wh.vt.resp', dec: 1, dir: 'flat' },
    { f: 'spo2', lab: 'SpO₂', plain: true, u: '%', dec: 1, dir: 'up' },
    { f: 'skin', lab: 'wh.vt.skin', u: '°', dec: 1, dir: 'flat' },
  ];

  D.whoop.vitals = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const d = w.days[key];
    const none = () => emptyCard('heart', t('wh.vt.none'), t('wh.vt.noneSub'));
    if (!d) return none();
    const rows = VITALS.map((v) => {
      const val = num(d[v.f]);
      if (val === null) return '';
      const unit = v.u === 'ms' ? ' ' + esc(t('wh.u.ms')) : v.u || '';
      const value = v.time ? clock(val) : `${D.fmtNum(val, v.dec)}${unit}`;
      // taqqoslash asosi: uyqu uchun o'sha kechaning ehtiyoji, qolganlari uchun 30 kunlik o'rtacha
      const ref = v.need && num(d[v.need]) !== null ? num(d[v.need]) : D.whoop.baseline(v.f, key, 30);
      let refCell = '—', deltaCell = '—', cls = '';
      if (ref !== null) {
        const rd = Math.max(v.dec, 1);
        refCell = v.time ? clock(ref) : D.fmtNum(ref, rd);
        const diff = val - ref;
        const shown = v.pct ? (ref ? (diff / ref) * 100 : null) : diff;
        if (shown !== null) {
          // «sezilarli» chegara: foizda 3 %, uyquda 15 daqiqa, qolganda bir birlik
          const big = v.pct ? Math.abs(shown) >= 3 : v.time ? Math.abs(shown) >= 0.25 : Math.abs(shown) >= (v.dec ? 1 : 3);
          cls = v.dir === 'flat' || !big ? '' : (v.dir === 'up') === (shown > 0) ? 'good' : 'bad';
          deltaCell = v.pct ? `${D.fmtSigned(shown, 1)}%`
            : v.time ? (Math.round(Math.abs(shown) * 60) ? (shown < 0 ? '−' : '+') + esc(shortH(shown)) : '0')
            : D.fmtSigned(+shown.toFixed(rd), rd);   // «−0» chiqmasin: avval yaxlitlanadi, keyin ishora
        }
      }
      return `<tr><th scope="row">${esc(v.plain ? v.lab : t(v.lab))}</th><td class="num v">${value}</td><td class="num r">${refCell}</td><td class="num d ${cls}">${deltaCell}</td></tr>`;
    }).filter(Boolean).join('');
    if (!rows) return none();
    const today = key === D.today();
    return `<section class="card wh-vt"><div class="card-head"><h2 class="title">${esc(t(today ? 'wh.vt.title' : 'wh.vt.titleDay'))}</h2></div>
      <p class="card-sub">${esc(t('wh.vt.sub'))}</p>
      <table class="wh-vt-t"><thead><tr><th scope="col"><span class="sr">${esc(t('wh.vt.metric'))}</span></th><th scope="col">${esc(today ? t('common.today') : t('wh.vt.value'))}</th><th scope="col">${esc(t('wh.vt.base'))}</th><th scope="col">${esc(t('wh.vt.delta'))}</th></tr></thead>
        <tbody>${rows}</tbody></table></section>`;
  };

  /* ------------------------------------------------------------------ */
  /* UYQU sahifasi                                                       */
  /* ------------------------------------------------------------------ */
  // A.9: chuqur · REM · yengil · uyg'oq
  const STAGES = [['deep', '#4B32B8'], ['rem', '#8B7CF6'], ['light', '#C9C0FB'], ['awake', '#F4B4C0']];
  const qZone = (v) => (v >= 85 ? '' : v >= 70 ? 'warn' : 'bad');   // ≥85 binafsha, 70–84 sariq, <70 qizil

  function sleepHero(d, i, key) {
    const s = sleepState(i);
    const tot = Math.round(d.sleepH * 60), hh = Math.floor(tot / 60), mm = tot % 60;
    let sub = '';
    if (i.needH != null) {
      const gap = i.gapH, word = gap == null || Math.abs(gap) < 1 / 120 ? t('wh.sl.exact') : t(gap < 0 ? 'wh.sl.less' : 'wh.sl.more', { t: D.fmtHm(Math.abs(gap)) });
      sub = `${esc(t('wh.sl.needWas', { t: D.fmtHm(i.needH) }))} · ${esc(word)}`;
    }
    const tile = (ic, cls, lab, v) => `<div class="ptile wh-when"><span class="${cls}">${D.ic(ic, 18)}</span><div><span class="ptile-l">${esc(lab)}</span><span class="ptile-v num">${esc(v)}</span></div></div>`;
    return `<section class="card hero hero--uyqu wh-sl">
      <div class="card-head"><h2 class="title">${esc(t(key === D.today() ? 'wh.sl.last' : 'wh.sl.night'))}</h2>${s.p != null ? `<span class="hero-pill wh-sl-pill num">${s.p}% · ${esc(t('wh.sl.z.' + s.z))}</span>` : ''}</div>
      <div class="wh-big num">${hh ? `<b>${hh}</b><span>${esc(t('unit.h'))}</span>` : ''}<b>${mm}</b><span>${esc(t('wh.u.mL'))}</span></div>
      ${sub ? `<p class="wh-sub num">${sub}</p>` : ''}
      ${s.p != null ? `<span class="bar md wh-sl-bar"><i class="bar-fill" style="width:${cl(s.p).toFixed(0)}%"></i></span>` : ''}
      ${d.bedTs && d.wakeTs ? `<div class="ptiles two wh-sl-when">${tile('moon', 'bed', t('wh.sl.bed'), hm(d.bedTs))}${tile('sun', 'wake', t('wh.sl.wake'), hm(d.wakeTs))}</div>` : ''}
    </section>`;
  }
  function stagesCard(st) {
    if (!st || typeof st !== 'object') return '';
    const tot = STAGES.reduce((a, [id]) => a + (+st[id] || 0), 0);
    if (!tot) return '';
    const bar = STAGES.map(([id, c]) => (+st[id] > 0 ? `<i style="flex:${((+st[id] / tot) * 100).toFixed(1)};background:${c}"></i>` : '')).join('');
    const rows = STAGES.map(([id, c]) => `<li><i class="dot" style="--c:${c}"></i><div><b>${esc(t('wh.sl.st.' + id))}</b><span>${esc(t('wh.sl.sd.' + id))}</span></div>
        <div class="r num"><b>${esc(shortMs(st[id]))}</b><span>${D.fmtNum(((+st[id] || 0) / tot) * 100, 1)}%</span></div></li>`).join('');
    return `<section class="card wh-stg"><div class="card-head"><h2 class="title">${esc(t('wh.sl.stagesTitle'))}</h2></div>
      <div class="wh-stg-bar" aria-hidden="true">${bar}</div><ul class="wh-stg-rows">${rows}</ul></section>`;
  }
  function qualityCard(d, key) {
    const bars = [['perf', d.sleepPerf], ['eff', d.sleepEff], ['cons', d.sleepCons]].filter((x) => x[1] != null).map(([id, v]) => {
      const z = qZone(+v);
      return `<div class="wh-q ${z}"><div class="wh-q-h"><b>${esc(t('wh.sl.q.' + id))}</b><span class="num">${D.fmtNum(v)}%</span></div>
        <span class="bar md"><i class="bar-fill" style="width:${cl(v).toFixed(0)}%"></i></span><p>${esc(t('wh.sl.qd.' + id))}</p></div>`;
    }).join('');
    const naps = D.whoop.naps(key);
    const tiles = [];
    const tile = (lab, v) => tiles.push(`<div class="ptile flat"><span class="ptile-l">${esc(lab)}</span><span class="ptile-v num">${v}</span></div>`);
    if (d.inBedH != null) tile(t('wh.sl.t.inBed'), esc(shortH(d.inBedH)));
    if (d.cycles != null) tile(t('wh.sl.t.cycles'), `${D.fmtNum(d.cycles)} ${esc(t('wh.u.pcs'))}`);
    if (d.disturbances != null) tile(t('wh.sl.t.dist'), `${D.fmtNum(d.disturbances)} ${esc(t('unit.times'))}`);
    tile(t('wh.sl.t.naps'), naps ? `${D.fmtNum(naps.n)} · ${esc(shortH(naps.h))}` : esc(t('wh.sl.t.none')));
    if (!bars && tiles.length < 2) return '';
    return `<section class="card wh-qc"><div class="card-head"><h2 class="title">${esc(t('wh.sl.quality'))}</h2></div>
      ${bars}<div class="ptiles two wh-q-tiles">${tiles.join('')}</div></section>`;
  }
  /** 14 ustunli grafik (A.6): 96px, oraliq 4px, burchak 5px; ko'rilayotgan kun ichki ramka bilan. */
  function bars14(days, cols, label, line) {
    const WS = t('weekdaysShort'), last = days.length - 1;
    return `<div class="wh-b14" role="img" aria-label="${esc(label)}">
        ${line ? `<i class="wh-b14-line" style="bottom:${cl(line.pct).toFixed(1)}%"><b class="num">${esc(line.text)}</b></i>` : ''}
        <div class="wh-b14-cols">${cols.map((c, n) => `<i class="${c.cls}${n === last ? ' now' : ''}" style="height:${c.h == null ? 0 : Math.max(4, cl(c.h)).toFixed(1)}%" title="${esc(c.title)}"></i>`).join('')}</div></div>
      <div class="wh-b14-x" aria-hidden="true">${days.map((k, n) => `<span${n === last ? ' class="now"' : ''}>${esc(WS[D.dowOf(k)])}</span>`).join('')}</div>`;
  }
  function sleepHist(key) {
    const w = W();
    // 14 kecha: qancha uxlangani, uzuq chiziq — o'sha kechalarda kerak bo'lgan uyqu (o'rtacha)
    const days = D.lastDays(14, key);
    const got = days.map((k) => num(w.days[k] && w.days[k].sleepH) || 0);
    const needs = days.map((k) => num(w.days[k] && w.days[k].sleepNeedH)).filter((v) => v !== null);
    const need = needs.length ? D.round(D.avg(needs), 1) : null;
    const had = got.filter((v) => v > 0);
    if (!had.length) return '';
    const max = Math.max(10, ...got, need || 0);
    const cols = days.map((k, n) => {
      const x = w.days[k] || {};
      if (x.sleepH == null) return { cls: 'na', h: null, title: D.fmtDate(k) };
      // rang kerakli uyquning ulushiga qarab: ≥90 % to'q binafsha, 75–89 % och binafsha, <75 % pushti
      const p = x.sleepNeedH ? (x.sleepH / x.sleepNeedH) * 100 : null;
      return { cls: p == null || p >= 90 ? 's-hi' : p >= 75 ? 's-mid' : 's-lo', h: (got[n] / max) * 100, title: `${D.fmtDate(k)}: ${D.fmtHm(x.sleepH)}` };
    });
    const debt = D.whoop.sleepDebt(7);
    const debtBox = !debt ? '' : debt.h * 60 < 1 ? `<div class="advice wh-debt good"><i class="dot"></i><span>${esc(t('wh.sl.debt0'))}</span></div>`
      : `<div class="advice wh-debt ${debt.h >= 3 ? 'bad' : 'warn'}"><i class="dot"></i><span>${bold(t('wh.sl.debt', { t: D.fmtHm(debt.h) }))}</span></div>`;
    return `<section class="card wh-hist"><div class="card-head"><h2 class="title">${esc(t('wh.sl.14'))}</h2><span class="wh-side num">${esc(t('wh.avgOf', { n: shortH(D.avg(had)) }))}</span></div>
      ${bars14(days, cols, t('wh.sl.14'), need ? { pct: (need / max) * 100, text: t('wh.sl.needLab', { t: shortH(need) }) } : null)}
      ${debtBox}</section>`;
  }
  D.whoop.sleepPage = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const d = w.days[key] || {};
    const i = D.whoop.dayInsight(key) || {};
    if (d.sleepH == null) return emptyCard('moon', t('wh.sl.none'), t('wh.sl.noneSub')) + safe(() => sleepHist(key));
    return safe(() => sleepHero(d, i, key)) + safe(() => stagesCard(d.stages)) + safe(() => qualityCard(d, key)) + safe(() => sleepHist(key));
  };

  /* ------------------------------------------------------------------ */
  /* ZO'RIQISH sahifasi                                                  */
  /* ------------------------------------------------------------------ */
  // A.9: Dam · Yengil · O'rtacha · Kuchli · Og'ir · Maks
  const ZONE_C = ['#CBD2DA', '#8FB4FF', '#4FD08A', '#F2C94C', '#F59E5B', '#E5484D'];
  /* WHOOP sport nomini inglizcha beradi. Ko'p uchraydiganlari tarjima
     qilinadi, qolgani o'z nomi bilan (bosh harfi katta) chiqadi. */
  const SPORT = { running: 'run', walking: 'walk', hiking: 'hike', cycling: 'bike', swimming: 'swim', weightlifting: 'lift', powerlifting: 'lift',
    strengthtrainer: 'lift', functionalfitness: 'fit', hiit: 'hiit', yoga: 'yoga', soccer: 'ball', football: 'ball', boxing: 'box', activity: 'any' };
  const SPORT_WALK = new Set(['run', 'walk', 'hike']);
  function sportOf(x) {
    const raw = String(x.sport || '').trim(), id = SPORT[raw.toLowerCase().replace(/[^a-z]/g, '')];
    return { name: id ? t('wh.sp.' + id) : raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : t('wh.sport'), walk: SPORT_WALK.has(id) };
  }
  const woMins = (x) => (x.start && x.end ? Math.round((new Date(x.end) - new Date(x.start)) / 60000) : +x.mins || 0);

  /** Kunning mashg'ulotlari: nom, vaqt, zo'riqish, olti zonali chiziq va uning izohi. */
  D.whoop.workoutRows = (key, opts = {}) => {
    const list = D.whoop.workoutsOn(key || D.today());
    if (!list.length) return opts.empty === false ? '' : `<p class="wh-wo-none">${esc(t(key && key !== D.today() ? 'wh.noWorkouts' : 'wh.wo.none'))}</p>`;
    return `<ul class="wh-wos">${list.map((x) => {
      const sp = sportOf(x), mins = woMins(x);
      // zonalar xom millisekundda saqlanadi; izohda daqiqa (D.whoop.zoneMins), aniq vaqt — ustiga bosib turilganda
      const zs = Array.isArray(x.zones) ? x.zones.map((ms) => +ms || 0) : null, zm = D.whoop.zoneMins(x);
      const tot = zs ? D.sum(zs) : 0;
      const zones = zs && tot ? `<div class="wh-zones" aria-hidden="true">${zs.map((ms, n) => (ms ? `<i style="flex:${((ms / tot) * 100).toFixed(1)};background:${ZONE_C[n]}"></i>` : '')).join('')}</div>
        <div class="wh-zleg">${zs.map((ms, n) => `<span title="${esc(D.fmtMsS(ms))}"><i class="dot" style="--c:${ZONE_C[n]}"></i>${esc(t('wh.z.' + n))}<b class="num">${D.fmtNum(zm[n])} ${esc(t('wh.u.m'))}</b></span>`).join('')}</div>` : '';
      const bits = [];
      if (x.kcal) bits.push(`${D.fmtNum(x.kcal)} ${t('wh.kcal')}`);
      if (x.hrAvg) bits.push(`${t('wh.hrAvg')} ${D.fmtNum(x.hrAvg)}${x.hrMax ? ` · ${t('wh.hrMaxShort')} ${D.fmtNum(x.hrMax)}` : ''}`);
      if (x.meters) bits.push(x.meters >= 1000 ? `${D.fmtNum(x.meters / 1000, 1)} ${t('wh.u.km')}` : `${D.fmtNum(x.meters)} m`);
      return `<li class="wh-wo"><div class="wh-wo-h"><span class="ico ${sp.walk ? 'good' : 'info'}">${D.ic(sp.walk ? 'walk' : 'dumbbell', 19)}</span>
          <div class="wh-wo-t"><b>${esc(sp.name)}</b><span class="num">${esc([hm(x.start), mins ? D.fmtHm(mins / 60) : ''].filter(Boolean).join(' · '))}</span></div>
          ${x.strain != null ? `<div class="wh-wo-s"><b class="num">${D.fmtNum(x.strain, 1)}</b><span>${esc(t('wh.map.strain'))}</span></div>` : ''}</div>
        ${bits.length ? `<p class="wh-wo-m num">${bits.map((b) => `<span>${esc(b)}</span>`).join('')}</p>` : ''}${zones}</li>`;
    }).join('')}</ul>`;
  };

  function strainHero(i, key) {
    const { live, strain } = strainOf(i, key);
    const target = i.strainTarget || null, load = loadOf(strain, target);
    const today = key === D.today();
    let adv = '';
    if (target) {
      const gap = D.round(strain - target, 1);
      adv = gap < 0 ? `<div class="advice info">${D.ic('bolt', 18)}<span>${bold(t('wh.st.a.room', { n: D.fmtNum(-gap, 1) }))}</span></div>`
        : gap <= 3 ? `<div class="advice">${D.ic('check', 18)}<span>${esc(t('wh.st.a.hit'))}</span></div>`
        : `<div class="advice warn">${D.ic('alert', 18)}<span>${bold(t('wh.st.a.over', { n: D.fmtNum(gap, 1) }))}</span></div>`;
    }
    // belgi 0–21 shkalasida; yorlig'i chetga chiqib ketmasin deb 12–88 % oralig'ida ushlanadi
    const tp = target ? cl((target / 21) * 100) : null;
    return `<section class="card hero hero--kok wh-st">
      <div class="card-head"><h2 class="title">${esc(t(today ? 'wh.st.today' : 'wh.strain'))}</h2>${live && live.since ? `<span class="hero-pill wh-live num"><i class="dot"></i>${esc(t('wh.st.live', { t: hm(live.since) }))}</span>` : ''}</div>
      <div class="wh-big wh-st-big num"><b>${D.fmtNum(strain, 1)}</b><span>${esc(t('wh.st.of21'))}</span>${load ? `<em class="${load}">${esc(t('wh.st.load.' + load))}</em>` : ''}</div>
      <div class="wh-sbar${tp != null ? ' has-rec' : ''}"><i style="width:${cl((strain / 21) * 100).toFixed(1)}%"></i>${tp != null ? `<u style="left:${tp.toFixed(1)}%"></u><b class="num" style="left:${D.clamp(tp, 12, 88).toFixed(1)}%">${esc(t('wh.st.rec', { n: D.fmtNum(target, 1) }))}</b>` : ''}</div>
      <div class="wh-scale num" aria-hidden="true"><i>0</i><i>7</i><i>14</i><i>21</i></div>
      ${adv}<p class="wh-fine">${esc(t('wh.st.note'))}</p>
    </section>`;
  }
  function strainTiles(i, key) {
    const { live, kcal } = strainOf(i, key);
    const d = W().days[key] || {};
    // puls: bugun jonli sikldan, aks holda kunning o'z yozuvidan
    const hrAvg = (live || {}).hrAvg || d.hrAvg, hrMax = (live || {}).hrMax || d.hrMax;
    const en = D.whoop.energy();
    const out = [];
    const tile = (lab, v, note) => out.push(`<div class="ptile"><span class="ptile-l">${esc(lab)}</span><span class="ptile-v num">${v}</span><span class="ptile-n num">${esc(note)}</span></div>`);
    if (kcal != null) tile(t('wh.st.t.kcal'), D.fmtNum(Math.round(kcal)), en && en.tdee ? t(en.source === 'measured' ? 'wh.st.t.ofM' : 'wh.st.t.ofE', { t: D.fmtNum(en.tdee) }) : t('wh.kcal'));
    if (hrAvg) tile(t('wh.st.t.hrAvg'), D.fmtNum(hrAvg), t('wh.u.bpm'));
    if (hrMax) tile(t('wh.maxHr'), D.fmtNum(hrMax), t('wh.u.bpm'));
    return out.length ? `<div class="ptiles wh-st-tiles${out.length === 2 ? ' two' : ''}">${out.join('')}</div>` : '';
  }
  function workoutsCard(key) {
    const list = D.whoop.workoutsOn(key), mins = D.sum(list, woMins);
    return `<section class="card wh-wo-card"><div class="card-head"><h2 class="title">${esc(t(key === D.today() ? 'wh.wo.today' : 'wh.workouts'))}</h2>
        ${list.length ? `<span class="wh-side num">${esc(t('wh.wo.sum', { n: list.length, t: `${D.fmtNum(mins)} ${t('unit.m')}` }))}</span>` : ''}</div>
      ${D.whoop.workoutRows(key)}</section>`;
  }
  function strainHist(key) {
    const w = W();
    // 14 kun: ustun — zo'riqish, rangi — o'sha kunning tiklanish zonasi
    const days = D.lastDays(14, key);
    const vals = days.map((k) => num(w.days[k] && w.days[k].strain));
    const had = vals.filter((v) => v !== null);
    if (!had.length) return '';
    const cols = days.map((k, n) => {
      if (vals[n] === null) return { cls: 'na', h: null, title: D.fmtDate(k) };
      const r = num(w.days[k] && w.days[k].recovery);
      return { cls: r == null ? 'z-na' : 'z-' + zRec(r), h: (vals[n] / 21) * 100, title: `${D.fmtDate(k)}: ${D.fmtNum(vals[n], 1)}` };
    });
    return `<section class="card wh-hist"><div class="card-head"><h2 class="title">${esc(t('wh.st.14'))}</h2><span class="wh-side num">${esc(t('wh.avgOf', { n: D.fmtNum(D.avg(had), 1) }))}</span></div>
      ${bars14(days, cols, t('wh.st.14'), null)}<p class="wh-fine">${esc(t('wh.st.legend'))}</p></section>`;
  }
  D.whoop.strainPage = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const i = D.whoop.dayInsight(key) || {};
    const top = strainOf(i, key).strain == null
      ? emptyCard('bolt', t(key === D.today() ? 'wh.st.none' : 'wh.st.noneDay'), t('wh.st.noneSub'))
      : safe(() => strainHero(i, key)) + safe(() => strainTiles(i, key));
    return top + safe(() => workoutsCard(key)) + safe(() => strainHist(key));
  };

  /** Ulanish qatori: kim ulangan, qachon yangilangan, yangilash va uzish — yoki ulashga taklif. */
  D.whoop.footer = () => {
    const w = W();
    if (!w.connected) {
      return `<section class="card wh-intro"><span class="ico info">${D.ic('heart', 19)}</span>
        <h2 class="title">${esc(t('wh.intro.title'))}</h2><p>${esc(t('wh.intro'))}</p>
        ${D.serverEnabled() ? '' : `<div class="advice warn">${D.ic('info', 18)}<span>${esc(t('wh.needServer'))}</span></div>`}
        <button class="btn main" data-act="hlWhoopConnect">${D.ic('link', 18)} ${esc(t('wh.connect'))}</button>
        <button class="btn ghost wh-intro-chk" data-act="hlWhoopCheck">${D.ic('refresh', 16)} ${esc(t('hl.wh.check'))}</button></section>`;
    }
    const p = w.profile || {};
    const name = [p.first, p.last].filter(Boolean).join(' ') || 'WHOOP';
    const f = D.whoop.freshness();
    return `<div class="wh-foot"><div class="wh-foot-t"><b>${esc(t('wh.connectedAs', { name }))}</b>
        <span class="num">${f ? esc(t('wh.updated', { t: f.label })) : esc(t('wh.pending'))}${w.rl && w.rl.remaining != null ? ` · ${D.fmtNum(w.rl.remaining)}/${D.fmtNum(w.rl.limit)}` : ''}</span></div>
      <button class="btn icon" data-act="hlWhoopRefresh" id="hlWhRefresh" aria-label="${esc(t('wh.refreshNow'))}" title="${esc(t('wh.refreshNow'))}" ${syncing ? 'disabled' : ''}>${D.ic('refresh', 17)}</button>
      <button class="btn icon" data-act="hlWhoopDisconnect" aria-label="${esc(t('wh.disconnect'))}" title="${esc(t('wh.disconnect'))}">${D.ic('logout', 17)}</button></div>`;
  };

  /* ------------------------------------------------------------------ */
  /* TANA kartasi — Tayyorlikning oxirida.                               */
  /* Bo'y, vazn va maksimal puls WHOOP profilidan keladi — bu yerda hech */
  /* narsa kiritilmaydi. Vazn chizig'i eski yozuvlardan, faqat o'qish     */
  /* uchun; yangi vaznni WHOOP ilovasi yozadi, qo'lda tuzatish Sozlash →  */
  /* Profil'da. WHOOP yoshi va qarish sur'ati — WHOOP ilovasidan          */
  /* ko'chirilgan ikki raqam (API ularni bermaydi).                       */
  /* Soat ulanmaganda ham ko'rinadi: profildagi bo'y va vazn bilan.       */
  /* ------------------------------------------------------------------ */
  const BMI_Z = (b) => (b < 18.5 ? ['under', 'warn'] : b < 25 ? ['normal', 'good'] : b < 30 ? ['over', 'warn'] : ['obese', 'bad']);

  D.whoop.bodyCard = () => {
    const pr = D.S.profile || {};
    const b = bodyNow();
    const dash = '—';
    const bmi = b.cm && b.kg ? b.kg / Math.pow(b.cm / 100, 2) : null;
    const [bmiCls, bmiZone] = bmi !== null ? BMI_Z(bmi) : ['', ''];
    const tile = (lab, v, unit, note, cls) => `<div class="ptile flat"><span class="ptile-l">${esc(lab)}</span><span class="ptile-v num">${v}${unit ? ` <small>${esc(unit)}</small>` : ''}${note ? ` <em class="${cls}">${esc(note)}</em>` : ''}</span></div>`;
    const grid = `<div class="ptiles two wh-bd-tiles">
      ${tile(t('wh.weight'), b.kg !== null ? D.fmtNum(b.kg, 1) : dash, b.kg !== null ? t('unit.kg') : '')}
      ${tile(t('wh.height'), b.cm !== null ? D.fmtNum(b.cm, 1) : dash, b.cm !== null ? t('wh.u.cm') : '')}
      ${tile(t('wh.bd.bmi'), bmi !== null ? D.fmtNum(bmi, 1) : dash, '', bmi !== null ? t('wh.bd.bmi.' + bmiCls) : '', bmiZone)}
      ${tile(t('wh.maxHr'), b.maxHr !== null ? D.fmtNum(b.maxHr) : dash, b.maxHr !== null ? t('wh.u.beat') : '')}
    </div>`;

    // vazn chizig'i — faqat o'qish uchun, 90 kun
    let trend = '';
    if (b.recent.length >= 2) {
      const vals = b.recent.map((x) => x.w);
      const lo = Math.min(...vals), hi = Math.max(...vals), pad = Math.max(0.3, (hi - lo) * 0.08);
      const first = b.recent[0], last = b.recent[b.recent.length - 1];
      trend = `<div class="wh-bd-trend"><div class="wh-bd-trend-h"><h3>${esc(t('wh.bd.weightTrend'))}</h3>
          <b class="num ${b.diff > 0.05 ? 'warn' : b.diff < -0.05 ? 'good' : ''}">${D.fmtSigned(b.diff, 1)} ${esc(t('unit.kg'))}</b></div>
        ${D.chart.spark({ values: vals, color: 'var(--success)', height: 72, fill: true, min: lo - pad, max: hi + pad })}
        <div class="wh-bd-x num"><span>${D.fmtNum(first.w, 1)} ${esc(t('unit.kg'))} · ${esc(D.fmtDate(first.k))}</span><span>${D.fmtNum(last.w, 1)} ${esc(t('unit.kg'))} · ${esc(last.k === D.today() ? t('wh.tr.today') : D.fmtDate(last.k))}</span></div></div>`;
    } else if (b.kg === null) {
      trend = `<p class="wh-fine">${esc(t('wh.bd.noWeight'))}</p>`;
    }

    const wa = num(pr.whoopAge), pa = num(pr.paceOfAging);
    const paceZ = pa === null ? '' : pa < 0.995 ? 'good' : pa > 1.005 ? 'bad' : '';
    const age = wa !== null || pa !== null
      ? `<div class="wh-bd-age">
          <div><span class="ptile-l">${esc(t('wh.bd.whoopAge'))}</span><span class="ptile-v num">${wa !== null ? `${D.fmtNum(wa, 1)} ${esc(t('wh.u.age'))}` : dash}</span></div>
          <div><span class="ptile-l">${esc(t('wh.bd.pace'))}</span><span class="ptile-v num">${pa !== null ? `${D.fmtNum(pa, 2)}× <em class="${paceZ}">${esc(t(paceZ === 'good' ? 'wh.bd.slow' : paceZ === 'bad' ? 'wh.bd.fast' : 'wh.bd.even'))}</em>` : dash}</span></div></div>`
      : `<p class="wh-fine">${esc(t('wh.bd.fromApp'))} · <button class="wh-link" data-act="go" data-view="settings">${esc(t('wh.bd.enter'))}</button></p>`;
    return `<section class="card wh-bd"><div class="card-head"><h2 class="title">${esc(t('wh.bd.title'))}</h2></div>${grid}${trend}${age}</section>`;
  };
  D.whoop.bodyPanel = D.whoop.bodyCard;   // eski nom

  /* ------------------------------------------------------------------ */
  /* TENDENSIYA — oxirgi 30 kun, ichki yorliq: Tiklanish · HRV · Tinch   */
  /* puls. Tiklanish ustunlari zona rangida; HRV va tinch puls — o'sha   */
  /* 30 kunning o'rtachasiga nisbatan (jadvaldagi «sezilarli farq»       */
  /* chegaralari bilan): yaxshi tomonga yashil, yomon tomonga qizil.     */
  /* Tanlangan yorliq D.ui.filters da — bu ko'rinish holati, ma'lumot    */
  /* emas.                                                               */
  /* ------------------------------------------------------------------ */
  const TREND_N = 30;
  const TREND = [
    { f: 'recovery', lab: 'wh.recovery', u: '%', dir: 'up', zone: true },
    { f: 'hrv', lab: 'wh.hrv', u: 'ms', dir: 'up', pct: true },
    { f: 'rhr', lab: 'wh.rhr', u: '', dir: 'down' },
  ];
  D.act.whTrend = (el) => { D.ui.filters.whTrend = el.dataset.f; D.saveUi(); D.rerender(); };

  D.whoop.trendCard = () => {
    if (!D.whoop.has()) return '';
    const have = TREND.filter((x) => D.whoop.stats(x.f, TREND_N));
    if (!have.length) return '';
    const cur = have.find((x) => x.f === D.ui.filters.whTrend) || have[0];
    const st = D.whoop.stats(cur.f, TREND_N), series = D.whoop.trend(cur.f, TREND_N);
    const unit = cur.u === 'ms' ? ' ' + t('wh.u.ms') : cur.u;
    const show = (v) => `${D.fmtNum(v, 1)}${esc(unit)}`;
    const max = cur.zone ? 100 : st.max, td = D.today();
    const cls = (v) => {
      if (cur.zone) return 'z-' + zRec(v);
      const diff = cur.pct ? ((v - st.avg) / st.avg) * 100 : v - st.avg;
      const big = cur.pct ? Math.abs(diff) >= 3 : Math.abs(diff) >= 1;
      return !big ? 'z-na' : (cur.dir === 'up') === (diff > 0) ? 'z-good' : 'z-bad';
    };
    const cols = series.map(({ k, v }) => (v === null ? `<i class="na" title="${esc(D.fmtDate(k))}"></i>`
      : `<i class="${cls(v)}${k === td ? ' now' : ''}" style="height:${Math.max(6, cl((v / max) * 100)).toFixed(1)}%" title="${esc(D.fmtDate(k))}: ${show(v)}"></i>`)).join('');
    const seg = have.length > 1 ? `<div class="seg wh-tr-seg" role="tablist">${have.map((x) => `<button class="${x === cur ? 'on' : ''}" data-act="whTrend" data-f="${x.f}" role="tab" aria-selected="${x === cur}">${esc(t(x.lab))}</button>`).join('')}</div>` : '';
    // «eng yaxshi» tinch pulsda eng PAST qiymat — u qancha past bo'lsa shuncha yaxshi
    const best = cur.dir === 'down' ? st.min : st.max, worst = cur.dir === 'down' ? st.max : st.min;
    const tile = (lab, v) => `<div class="ptile flat"><span class="ptile-l">${esc(t(lab))}</span><span class="ptile-v num">${show(v)}</span></div>`;
    return `<section class="card wh-trend"><div class="card-head"><h2 class="title">${esc(t('wh.trend'))}</h2><span class="wh-side">${esc(t('wh.trend.sub', { n: TREND_N }))}</span></div>
      ${seg}
      <div class="wh-b30" role="img" aria-label="${esc(`${t(cur.lab)} — ${t('wh.trend.sub', { n: TREND_N })}: ${t('wh.avgOf', { n: D.fmtNum(st.avg, 1) + unit })}`)}">${cols}</div>
      <div class="wh-b30-x num" aria-hidden="true"><span>${esc(D.fmtDate(series[0].k))}</span><span>${esc(t('wh.tr.today'))}</span></div>
      ${cur.zone ? '' : `<p class="wh-fine">${esc(t('wh.tr.legend'))}</p>`}
      <div class="ptiles wh-tr-tiles">${tile('wh.tr.avg', st.avg)}${tile('wh.tr.best', best)}${tile('wh.tr.worst', worst)}</div>
    </section>`;
  };

  /* boot · every minute · when the app comes back to the foreground · day rollover */
  D.on('boot', () => { setTimeout(() => D.whoop.poll(), 1500); schedule(); });
  D.on('day:changed', () => D.whoop.poll({ force: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastPollAt > 15000) D.whoop.poll(); });
  window.addEventListener('focus', () => { if (Date.now() - lastPollAt > 15000) D.whoop.poll(); });
})();
