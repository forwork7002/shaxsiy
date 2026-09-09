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
      'wh.i.need': 'kerak {h}', 'wh.i.target': 'me’yor {m}', 'wh.i.base': 'odatda {b}',
      'wh.i.vsBase': '30 kunlik odatingiz **{b}%** edi — bugun **{n}**',
      'wh.i.sleepOk': 'Uyqu yetarli — kerakli **{need}**ni qopladingiz',
      'wh.i.sleepShort': 'Uyqu **{h}** kam — kerak edi {need}',
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
      'wh.i.need': 'керак {h}', 'wh.i.target': 'меъёр {m}', 'wh.i.base': 'одатда {b}',
      'wh.i.vsBase': '30 кунлик одатингиз **{b}%** эди — бугун **{n}**',
      'wh.i.sleepOk': 'Уйқу етарли — керакли **{need}**ни қопладингиз',
      'wh.i.sleepShort': 'Уйқу **{h}** кам — керак эди {need}',
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
      'wh.i.need': 'нужно {h}', 'wh.i.target': 'норма {m}', 'wh.i.base': 'обычно {b}',
      'wh.i.vsBase': 'ваша норма за 30 дн. — **{b}%**, сегодня **{n}**',
      'wh.i.sleepOk': 'Сна достаточно — вы закрыли норму **{need}**',
      'wh.i.sleepShort': 'Сна меньше на **{h}** — нужно было {need}',
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
      'wh.sl.debt7': '7 kunlik uyqu qarzi', 'wh.sl.naps': 'kunduzgi uyqu: {n} marta, {h}', 'wh.sl.14': 'So‘nggi 14 kecha', 'wh.sl.needLine': 'chiziq — o‘sha kecha kerak bo‘lgan uyqu',
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
      'wh.sl.debt7': '7 кунлик уйқу қарзи', 'wh.sl.naps': 'кундузги уйқу: {n} марта, {h}', 'wh.sl.14': 'Сўнгги 14 кеча', 'wh.sl.needLine': 'чизиқ — ўша кеча керак бўлган уйқу',
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
      'wh.sl.debt7': 'Долг сна за 7 дней', 'wh.sl.naps': 'дневной сон: {n} раз, {h}', 'wh.sl.14': 'Последние 14 ночей', 'wh.sl.needLine': 'линия — сколько сна требовалось в ту ночь',
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

  D.i18n.add({
    uz: {
      'wh.bd.profile': 'WHOOP profili', 'wh.bd.noProfile': 'Profil hali olinmadi — bir daqiqa kuting', 'wh.bd.lastSync': 'Oxirgi sinx', 'wh.bd.never': 'hali yo‘q',
      'wh.bd.age': 'Yosh', 'wh.bd.whoopAge': 'WHOOP Age', 'wh.bd.pace': 'Pace of Aging', 'wh.bd.enteredAt': '{d} kiritilgan',
      'wh.bd.enter': 'Sozlamalarda kiriting', 'wh.bd.fromApp': 'WHOOP ilovasidagi Healthspan sahifasidan ko‘chiring — API bu raqamlarni bermaydi',
      'wh.bd.est': 'Biologik yosh (taxmin)', 'wh.bd.chrono': 'pasport yoshi {n}', 'wh.bd.younger': 'pasport yoshidan {n} yil yosh', 'wh.bd.older': 'pasport yoshidan {n} yil katta', 'wh.bd.same': 'pasport yoshi bilan teng',
      'wh.bd.inputs': '30 kunlik o‘rtacha', 'wh.bd.ref': 'me’yor', 'wh.bd.effect': 'ta’sir, yil',
      'wh.bd.caveat': 'Bu ilmiy o‘lchov emas — HRV, tinch puls, uyqu va yuklamaning yoshga nisbatan oddiy taxmini. Rasmiy raqam — WHOOP ilovasidagi WHOOP Age.',
      'wh.bd.needAge': 'Taxmin uchun Sozlamalarda yoshingizni yoki tug‘ilgan yilingizni kiriting', 'wh.bd.needData': 'Taxmin uchun kamida 7 kunlik WHOOP ma’lumoti kerak',
      'wh.bd.f.hrv': 'HRV', 'wh.bd.f.rhr': 'Tinch puls', 'wh.bd.f.sleepPerf': 'Uyqu sifati', 'wh.bd.f.sleepCons': 'Uyqu izchilligi', 'wh.bd.f.strain': 'Haftalik zo‘riqish', 'wh.bd.f.workouts': 'Mashg‘ulot / hafta',
    },
    uzk: {
      'wh.bd.profile': 'WHOOP профили', 'wh.bd.noProfile': 'Профил ҳали олинмади — бир дақиқа кутинг', 'wh.bd.lastSync': 'Охирги синх', 'wh.bd.never': 'ҳали йўқ',
      'wh.bd.age': 'Ёш', 'wh.bd.whoopAge': 'WHOOP Age', 'wh.bd.pace': 'Pace of Aging', 'wh.bd.enteredAt': '{d} киритилган',
      'wh.bd.enter': 'Созламаларда киритинг', 'wh.bd.fromApp': 'WHOOP иловасидаги Healthspan саҳифасидан кўчиринг — API бу рақамларни бермайди',
      'wh.bd.est': 'Биологик ёш (тахмин)', 'wh.bd.chrono': 'паспорт ёши {n}', 'wh.bd.younger': 'паспорт ёшидан {n} йил ёш', 'wh.bd.older': 'паспорт ёшидан {n} йил катта', 'wh.bd.same': 'паспорт ёши билан тенг',
      'wh.bd.inputs': '30 кунлик ўртача', 'wh.bd.ref': 'меъёр', 'wh.bd.effect': 'таъсир, йил',
      'wh.bd.caveat': 'Бу илмий ўлчов эмас — HRV, тинч пульс, уйқу ва юкламанинг ёшга нисбатан оддий тахмини. Расмий рақам — WHOOP иловасидаги WHOOP Age.',
      'wh.bd.needAge': 'Тахмин учун Созламаларда ёшингизни ёки туғилган йилингизни киритинг', 'wh.bd.needData': 'Тахмин учун камида 7 кунлик WHOOP маълумоти керак',
      'wh.bd.f.hrv': 'HRV', 'wh.bd.f.rhr': 'Тинч пульс', 'wh.bd.f.sleepPerf': 'Уйқу сифати', 'wh.bd.f.sleepCons': 'Уйқу изчиллиги', 'wh.bd.f.strain': 'Ҳафталик зўриқиш', 'wh.bd.f.workouts': 'Машғулот / ҳафта',
    },
    ru: {
      'wh.bd.profile': 'Профиль WHOOP', 'wh.bd.noProfile': 'Профиль ещё не получен — подождите минуту', 'wh.bd.lastSync': 'Последняя синхронизация', 'wh.bd.never': 'ещё нет',
      'wh.bd.age': 'Возраст', 'wh.bd.whoopAge': 'WHOOP Age', 'wh.bd.pace': 'Pace of Aging', 'wh.bd.enteredAt': 'введено {d}',
      'wh.bd.enter': 'Укажите в настройках', 'wh.bd.fromApp': 'Перепишите со страницы Healthspan в приложении WHOOP — API эти цифры не отдаёт',
      'wh.bd.est': 'Биологический возраст (оценка)', 'wh.bd.chrono': 'паспортный возраст {n}', 'wh.bd.younger': 'на {n} лет моложе паспортного', 'wh.bd.older': 'на {n} лет старше паспортного', 'wh.bd.same': 'совпадает с паспортным',
      'wh.bd.inputs': 'Среднее за 30 дней', 'wh.bd.ref': 'норма', 'wh.bd.effect': 'эффект, лет',
      'wh.bd.caveat': 'Это не научное измерение — простая оценка по HRV, пульсу покоя, сну и нагрузке относительно возраста. Официальная цифра — WHOOP Age в приложении WHOOP.',
      'wh.bd.needAge': 'Для оценки укажите возраст или год рождения в настройках', 'wh.bd.needData': 'Для оценки нужно минимум 7 дней данных WHOOP',
      'wh.bd.f.hrv': 'HRV', 'wh.bd.f.rhr': 'Пульс покоя', 'wh.bd.f.sleepPerf': 'Качество сна', 'wh.bd.f.sleepCons': 'Регулярность сна', 'wh.bd.f.strain': 'Нагрузка за неделю', 'wh.bd.f.workouts': 'Тренировок / нед.',
    },
  });

  /* Tayyorlik sahifasining o'lchovlar jadvali va ixcham tana kartasi */
  D.i18n.add({
    uz: {
      'wh.vt.title': "Bugungi o'lchovlar", 'wh.vt.sub': "30 kunlik shaxsiy me'yoringizga nisbatan",
      'wh.vt.metric': "Ko'rsatkich", 'wh.vt.value': 'Qiymat', 'wh.vt.base': "Me'yor", 'wh.vt.delta': 'Farq',
      'wh.vt.resp': 'Nafas', 'wh.vt.respUnit': 'marta/daq', 'wh.vt.skin': 'Teri harorati', 'wh.vt.kcalLab': 'Sarflangan energiya',
      'wh.vt.need': 'kerak edi', 'wh.vt.none': "Bu kun uchun WHOOP o'lchovi yo'q",
      'wh.vt.exact': "Har bir raqam WHOOP bergan aniqlikda — yaxlitlanmagan.",
      'wh.bd.title': 'Tana', 'wh.bd.bmi': 'Tana massasi indeksi', 'wh.bd.weightTrend': 'Vazn, 90 kun',
      'wh.bd.fromWhoop': 'WHOOP profilidan', 'wh.bd.noWeight': "Vazn WHOOP ilovasida ko'rsatilmagan",
      'wh.bd.bmi.under': 'Kam vazn', 'wh.bd.bmi.normal': 'Normal', 'wh.bd.bmi.over': 'Ortiqcha vazn', 'wh.bd.bmi.obese': 'Semizlik',
      'wh.bd.entries': 'yozuv',
    },
    uzk: {
      'wh.vt.title': 'Бугунги ўлчовлар', 'wh.vt.sub': '30 кунлик шахсий меъёрингизга нисбатан',
      'wh.vt.metric': 'Кўрсаткич', 'wh.vt.value': 'Қиймат', 'wh.vt.base': 'Меъёр', 'wh.vt.delta': 'Фарқ',
      'wh.vt.resp': 'Нафас', 'wh.vt.respUnit': 'марта/дақ', 'wh.vt.skin': 'Тери ҳарорати', 'wh.vt.kcalLab': 'Сарфланган энергия',
      'wh.vt.need': 'керак эди', 'wh.vt.none': 'Бу кун учун WHOOP ўлчови йўқ',
      'wh.vt.exact': 'Ҳар бир рақам WHOOP берган аниқликда — яхлитланмаган.',
      'wh.bd.title': 'Тана', 'wh.bd.bmi': 'Тана массаси индекси', 'wh.bd.weightTrend': 'Вазн, 90 кун',
      'wh.bd.fromWhoop': 'WHOOP профилидан', 'wh.bd.noWeight': 'Вазн WHOOP иловасида кўрсатилмаган',
      'wh.bd.bmi.under': 'Кам вазн', 'wh.bd.bmi.normal': 'Нормал', 'wh.bd.bmi.over': 'Ортиқча вазн', 'wh.bd.bmi.obese': 'Семизлик',
      'wh.bd.entries': 'ёзув',
    },
    ru: {
      'wh.vt.title': 'Показатели за день', 'wh.vt.sub': 'относительно вашей нормы за 30 дней',
      'wh.vt.metric': 'Показатель', 'wh.vt.value': 'Значение', 'wh.vt.base': 'Норма', 'wh.vt.delta': 'Разница',
      'wh.vt.resp': 'Дыхание', 'wh.vt.respUnit': 'раз/мин', 'wh.vt.skin': 'Температура кожи', 'wh.vt.kcalLab': 'Потрачено энергии',
      'wh.vt.need': 'требовалось', 'wh.vt.none': 'За этот день у WHOOP нет измерений',
      'wh.vt.exact': 'Каждое число — с точностью, которую даёт WHOOP, без округления.',
      'wh.bd.title': 'Тело', 'wh.bd.bmi': 'Индекс массы тела', 'wh.bd.weightTrend': 'Вес, 90 дней',
      'wh.bd.fromWhoop': 'из профиля WHOOP', 'wh.bd.noWeight': 'Вес не указан в приложении WHOOP',
      'wh.bd.bmi.under': 'Дефицит веса', 'wh.bd.bmi.normal': 'Норма', 'wh.bd.bmi.over': 'Избыток веса', 'wh.bd.bmi.obese': 'Ожирение',
      'wh.bd.entries': 'записей',
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
      if (r.nap) { const n = (naps[k] = naps[k] || { n: 0, h: 0 }); n.n++; n.h += +r.sleepH || 0; continue; }
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
    if (sleepH !== null && need !== null) { o.gapH = sleepH - need; o.metPct = Math.round((sleepH / need) * 100); }
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
    return seen ? { h: debt, days: seen } : null;
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
  /* Vaqt hech qachon kasr soatda ko'rsatilmaydi. `fmtH` plitka uchun ixcham,
     `fmtHm` matn ichi uchun to'liq — ikkalasi ham daqiqagacha aniq. */
  const fmtH = (h) => {
    if (h == null || isNaN(+h)) return '—';
    const total = Math.round(+h * 60), hh = Math.floor(total / 60), mm = total % 60;
    return hh ? `${hh}<small>${esc(t('unit.h'))}</small> ${mm}<small>${esc(t('unit.m'))}</small>` : `${mm}<small>${esc(t('unit.m'))}</small>`;
  };
  const fmtHm = (h) => D.fmtHm(h);
  const fmtMs = (ms) => D.fmtMsH(ms);
  const n1 = (v, d = 1) => (v == null || isNaN(+v) ? '—' : D.fmtNum(+v, d));
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
    const sub = i.recDelta !== undefined ? md(t('wh.i.vsBase', { n: D.fmtSigned(i.recDelta, 1), b: D.fmtNum(i.recBase, 1) })) : (w.days[key] && w.days[key].calibrating ? esc(t('wh.calibrating')) : '');
    const target = i.strainTarget || null;
    const load = strain != null && target ? (strain - target > 3 ? 'over' : strain - target < -4 ? 'under' : 'ok') : '';
    const gColor = load === 'over' ? 'var(--danger-text)' : load === 'ok' ? 'var(--success)' : 'var(--sec, var(--success))';
    const strainRow = strain != null ? `<div class="wh-strain ${live ? 'live' : ''}">
        <div class="wh-strain-head"><span class="wh-strain-lab">${esc(t('wh.strainLive'))}${live ? `<em>${esc(t('wh.live'))}</em>` : ''}</span><span class="wh-strain-val num">${D.fmtNum(strain, 1)}</span></div>
        ${gauge(strain, target || 21, 21, gColor)}
        <div class="wh-strain-foot">${target ? `<span>${esc(t('wh.st.target', { m: D.fmtNum(target, 1) }))}</span>` : ''}${kcal != null ? `<span>${esc(t('wh.st.kcal', { k: D.fmtNum(kcal) }))}</span>` : ''}${live && live.hrAvg ? `<span>${esc(t('wh.hr'))} <b class="num">${live.hrAvg}</b>${live.hrMax ? `, ${esc(t('wh.hrMaxShort'))} <b class="num">${live.hrMax}</b>` : ''}</span>` : ''}</div>
      </div>` : `<div class="wh-strain"><div class="small muted">${esc(t('wh.st.none'))}</div></div>`;
    const rows = [];
    if (i.gapH !== null && i.gapH !== undefined) { const good = i.gapH >= -0.5; rows.push({ good, txt: t(good ? 'wh.i.sleepOk' : 'wh.i.sleepShort', { h: fmtHm(Math.abs(i.gapH)), need: fmtHm(i.needH) }) }); }
    if (i.hrvPct !== undefined && Math.abs(i.hrvPct) >= 8) rows.push({ good: i.hrvPct > 0, txt: t(i.hrvPct > 0 ? 'wh.i.hrvUp' : 'wh.i.hrvDown', { p: D.fmtNum(Math.abs(i.hrvPct), 1), b: D.fmtNum(i.hrvBase, 1) }) });
    if (i.rhrDelta !== undefined && Math.abs(i.rhrDelta) >= 3) rows.push({ good: i.rhrDelta < 0, txt: t(i.rhrDelta > 0 ? 'wh.i.rhrUp' : 'wh.i.rhrDown', { n: D.fmtNum(Math.abs(i.rhrDelta), 1), b: D.fmtNum(i.rhrBase, 1) }) });
    if (load === 'over') rows.push({ good: false, txt: t('wh.i.over', { s: D.fmtNum(strain, 1), m: D.fmtNum(target, 1) }) });
    else if (load === 'under' && target) rows.push({ good: true, txt: t('wh.i.room', { m: D.fmtNum(target, 1) }) });
    const notes = rows.length ? `<div class="wh-notes">${rows.map((r) => `<div class="wh-note ${r.good ? 'good' : 'warn'}">${D.ic(r.good ? 'check' : 'alert', 14)}<span>${md(r.txt)}</span></div>`).join('')}</div>` : '';
    const err = w.err ? `<div class="wh-err">${D.ic('alert', 13)} ${esc(t('wh.err.' + w.err, { e: w.err }) === 'wh.err.' + w.err ? t('wh.err.http', { e: w.err }) : t('wh.err.' + w.err, { e: w.err }))}</div>` : '';
    return `<div class="hero wh-hero">
      <div class="wh-hero-top"><span class="wh-brand">${D.ic('bolt', 12)} WHOOP${key !== D.today() ? ` <span class="num">${esc(D.fmtDate(key, 'dm'))}</span>` : ''}</span>${key === D.today() ? freshHtml() : ''}</div>
      <div class="hero-main wh-hero-main">${ring}<div class="hero-body"><div class="hero-title">${esc(verdict)}</div>${sub ? `<div class="hero-sub">${sub}</div>` : ''}</div></div>
      ${strainRow}${notes}${err}
    </div>`;
  };

  /** Proportional stage bar with the minutes hanging under each segment. */
  function stagesHtml(st) {
    if (!st) return '';
    const tot = (+st.deep || 0) + (+st.rem || 0) + (+st.light || 0) + (+st.awake || 0);
    if (!tot) return '';
    const order = ['deep', 'rem', 'light', 'awake'];
    const bar = order.map((k) => `<i style="width:${(((+st[k] || 0) / tot) * 100).toFixed(1)}%;background:${STAGE_C[k]}"></i>`).join('');
    // har bosqich yonida aniq vaqti va kechadagi ulushi
    const legs = order.map((k) => `<span class="wh-stg"><i style="background:${STAGE_C[k]}"></i><b class="num">${fmtMs(st[k])}</b>${esc(t(k === 'awake' ? 'wh.sl.awake' : 'wh.sl.' + k))} <span class="num muted">${D.fmtNum(((+st[k] || 0) / tot) * 100, 1)}%</span></span>`).join('');
    return `<div class="wh-stages">${bar}</div><div class="wh-stg-row">${legs}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Tayyorlik: kunning o'lchovlari                                      */
  /* WHOOP tiklanishni to'rt kirishdan yig'adi — HRV, tinch puls, uyqu   */
  /* va nafas. Jadval o'sha to'rttasini va uch qo'shimcha o'lchovni      */
  /* ko'rsatadi; taqqoslash populyatsiya normasi bilan emas, o'zingizning */
  /* 30 kunlik o'rtachangiz bilan — u yagona ma'noli me'yor.             */
  /* Uyqu esa o'sha kecha WHOOP hisoblagan ehtiyoj bilan solishtiriladi. */
  /* ------------------------------------------------------------------ */
  const VITALS = [
    { f: 'recovery', lab: 'wh.recovery', unit: '%', dec: 0, dir: 'up' },   // WHOOP butun foiz beradi, me'yor bir kasrda
    { f: 'hrv', lab: 'wh.hrv', unit: 'ms', dec: 1, dir: 'up', pct: true },
    { f: 'rhr', lab: 'wh.rhr', unit: 'bpm', dec: 1, dir: 'down' },
    { f: 'sleepH', lab: 'wh.sleepH', dec: 2, dir: 'up', time: true, need: 'sleepNeedH' },
    { f: 'resp', lab: 'wh.vt.resp', unit: 'wh.vt.respUnit', dec: 1, dir: 'flat' },
    { f: 'spo2', lab: 'SpO₂', plain: true, unit: '%', dec: 1, dir: 'up' },
    { f: 'skin', lab: 'wh.vt.skin', unit: '°C', dec: 1, dir: 'flat' },
    { f: 'strain', lab: 'wh.strain', dec: 1, dir: 'flat' },
    { f: 'kcal', lab: 'wh.vt.kcalLab', unit: 'wh.kcal', dec: 0, refDec: 0, dir: 'flat' },
  ];
  const unitOf = (u) => (!u ? '' : u.indexOf('wh.') === 0 || u.indexOf('unit.') === 0 ? t(u) : u);

  D.whoop.vitals = (key) => {
    const w = W();
    if (!w.connected) return '';
    key = key || D.today();
    const d = w.days[key];
    if (!d) return `<div class="card"><div class="empty">${esc(t('wh.vt.none'))}</div></div>`;
    const rows = VITALS.map((v) => {
      const val = num(d[v.f]);
      if (val === null) return '';
      const unit = unitOf(v.unit);
      const value = v.time ? fmtH(val) : `${D.fmtNum(val, v.dec)}${unit ? `<small>${esc(unit)}</small>` : ''}`;
      // taqqoslash asosi: uyqu uchun o'sha kechaning ehtiyoji, qolganlari uchun 30 kunlik o'rtacha
      let ref = null, refNote = '';
      if (v.need && num(d[v.need]) !== null) { ref = num(d[v.need]); refNote = t('wh.vt.need'); }
      else ref = D.whoop.baseline(v.f, key, 30);
      let refCell = '<span class="muted">—</span>', deltaCell = '<span class="muted">—</span>';
      if (ref !== null) {
        const rd = v.refDec === undefined ? Math.max(v.dec, 1) : v.refDec;
        refCell = `<span class="num muted">${v.time ? fmtHm(ref) : D.fmtNum(ref, rd)}</span>${refNote ? `<em>${esc(refNote)}</em>` : ''}`;
        const diff = val - ref;
        const shown = v.pct ? (ref ? (diff / ref) * 100 : null) : diff;
        if (shown !== null) {
          // «sezilarli» chegara: foizda 3 %, uyquda 15 daqiqa, qolganda bir birlik
          const big = v.pct ? Math.abs(shown) >= 3 : v.time ? Math.abs(shown) >= 0.25 : Math.abs(shown) >= (v.dec ? 1 : 3);
          const good = v.dir === 'flat' || !big ? '' : (v.dir === 'up') === (shown > 0) ? 'good' : 'bad';
          const txt = v.pct ? `${D.fmtSigned(shown, 1)}%` : v.time ? D.fmtHm(shown, { sign: true }) : D.fmtSigned(shown, rd);
          deltaCell = `<b class="num ${good}">${txt}</b>`;
        }
      }
      return `<div class="wh-vt-row"><span class="wh-vt-lab">${esc(v.plain ? v.lab : t(v.lab))}</span>
        <b class="num wh-vt-val">${value}</b>${refCell}${deltaCell}</div>`;
    }).filter(Boolean).join('');
    if (!rows) return `<div class="card"><div class="empty">${esc(t('wh.vt.none'))}</div></div>`;
    return `<div class="card wh-vt"><div class="card-head"><div class="title">${D.ic('heart', 16)} ${esc(t('wh.vt.title'))}</div><span class="tiny muted">${esc(t('wh.vt.sub'))}</span></div>
      <div class="wh-vt-tbl">
        <div class="wh-vt-row head"><span>${esc(t('wh.vt.metric'))}</span><b>${esc(t('wh.vt.value'))}</b><span>${esc(t('wh.vt.base'))}</span><b>${esc(t('wh.vt.delta'))}</b></div>
        ${rows}
      </div><div class="help mt-s">${esc(t('wh.vt.exact'))}</div></div>`;
  };

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
        <div><div class="wh-sl-big num">${fmtH(d.sleepH)}</div><div class="small muted">${esc(t('wh.sl.got'))}${d.sleepNeedH ? `, ${esc(t('wh.sl.need'))} <b class="num">${fmtHm(d.sleepNeedH)}</b>` : ''}</div></div>
        ${d.bedTs && d.wakeTs ? `<div class="wh-sl-when num">${hm(d.bedTs)} <span>→</span> ${hm(d.wakeTs)}</div>` : ''}
      </div>
      ${metPct != null ? `<span class="bar thick mt-s"><i class="bar-fill" style="width:${D.clamp(metPct, 0, 100)}%;background:${recColor(z)}"></i></span>` : ''}
      <div class="wh-sl-meta">${d.inBedH != null ? `<span>${esc(t('wh.sl.inBed'))} <b class="num">${fmtHm(d.inBedH)}</b></span>` : ''}${d.awakeH != null ? `<span>${esc(t('wh.sl.awake'))} <b class="num">${fmtMs(d.stages && d.stages.awake != null ? d.stages.awake : d.awakeH * 3.6e6)}</b></span>` : ''}${d.cycles != null ? `<span>${esc(t('wh.sl.cycles', { n: d.cycles }))}</span>` : ''}${d.disturbances != null ? `<span>${esc(t('wh.sl.dist', { n: d.disturbances }))}</span>` : ''}</div>
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
    const hist = `<div class="card"><div class="card-head"><div class="title">${D.ic('moon', 16)} ${esc(t('wh.sl.14'))}</div>${debt ? `<span class="pill ${debt.h >= 3 ? 'bad' : debt.h >= 1 ? '' : 'good'}">${esc(t('wh.sl.debt7'))}: <b class="num">${fmtHm(debt.h)}</b></span>` : ''}</div>
      ${D.chart.bars({ values: got, colors, height: 72, target: need, max: Math.max(10, ...got, need || 0) })}${axis}
      <div class="help mt-s">${need ? esc(t('wh.sl.needLine')) : ''}${naps ? `${need ? ' · ' : ''}${esc(t('wh.sl.naps', { n: naps.n, h: D.fmtHm(naps.h) }))}` : ''}</div>
    </div>`;
    return head + ringRow + hist;
  };

  /** Today's workouts with their HR-zone bars; used by Health (strain) and Sport. */
  D.whoop.workoutRows = (key, opts = {}) => {
    const list = D.whoop.workoutsOn(key || D.today());
    if (!list.length) return opts.empty === false ? '' : `<div class="empty">${esc(t('wh.wo.none'))}</div>`;
    return `<div class="wh-wos">${list.map((x) => {
      // zonalar xom millisekundda saqlanadi — yaxlitlanmasdan soniyagacha ko'rsatiladi
      const zs = Array.isArray(x.zones) ? x.zones.map((ms) => +ms || 0) : null;
      const tot = zs ? D.sum(zs) : 0;
      const zones = zs && tot ? `<div class="wh-zones">${zs.map((ms, i) => (ms ? `<i style="width:${((ms / tot) * 100).toFixed(1)}%;background:${ZONE_C[i]}" title="${esc(t('wh.z.' + i))}: ${esc(D.fmtMsS(ms))}"></i>` : '')).join('')}</div>
        <div class="wh-zone-row">${zs.map((ms, i) => (ms ? `<span><i style="background:${ZONE_C[i]}"></i>${esc(t('wh.z.' + i))} <b class="num">${esc(D.fmtMsS(ms))}</b></span>` : '')).join('')}</div>` : '';
      const bits = [];
      if (x.start && x.end) bits.push(D.fmtMsS(new Date(x.end) - new Date(x.start)));
      else if (x.mins) bits.push(t('wh.wo.min', { n: x.mins }));
      if (x.hrAvg) bits.push(`${t('wh.hr')} ${D.fmtNum(x.hrAvg)}${x.hrMax ? `–${D.fmtNum(x.hrMax)}` : ''}`);
      if (x.kcal) bits.push(`${D.fmtNum(x.kcal)} ${t('wh.kcal')}`);
      if (x.meters) bits.push(`${D.fmtNum(x.meters)} m`);
      return `<div class="wh-wo"><div class="wh-wo-head"><span class="wh-wo-ic">${D.ic('dumbbell', 15)}</span><div class="grow"><div class="wh-wo-name">${esc(x.sport || t('wh.sport'))}<span class="num muted"> ${hm(x.start)}</span></div><div class="small muted">${esc(bits.join(', '))}</div></div>${x.strain != null ? `<span class="wh-wo-strain num">${D.fmtNum(x.strain, 1)}</span>` : ''}</div>${zones}</div>`;
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
      <div class="wh-sl-top"><div><div class="wh-sl-big num">${D.fmtNum(strain, 1)}</div><div class="small muted">${esc(t('wh.st.today'))}${live ? ` · <span class="wh-live-tag">${esc(t('wh.live'))}</span>` : ''}</div></div>
        ${live && live.since ? `<div class="wh-sl-when num">${esc(t('wh.sinceStart', { t: hm(live.since) }))}</div>` : ''}</div>
      <div class="mt-s">${gauge(strain, target || 21, 21, gColor)}</div>
      <div class="wh-sl-meta">${target ? `<span>${esc(t('wh.st.target', { m: D.fmtNum(target, 1) }))}</span>` : ''}${target && load === 'under' ? `<span class="good">${esc(t('wh.st.room', { n: D.fmtNum(target, 1) }))}</span>` : ''}${target && load === 'over' ? `<span class="bad">${esc(t('wh.st.over', { n: D.fmtNum(strain - target, 1) }))}</span>` : ''}</div>
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
    return top + wos + hist;
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

  /** Sog'liq → Tayyorlik sahifasining oxiridagi ixcham «Tana» kartasi.
   *  Bo'y, vazn va maksimal puls WHOOP profilidan keladi — bu yerda hech narsa kiritilmaydi.
   *  Vazn trendi eski yozuvlardan chiziladi va faqat o'qish uchun; yangi vaznni
   *  WHOOP ilovasi yozadi, qo'lda tuzatish Sozlash → Profil'da.
   *  Yosh bloki soat ulanmaganda ham ko'rinadi. */
  const BMI_Z = (b) => (b < 18.5 ? ['under', 'warn'] : b < 25 ? ['normal', 'good'] : b < 30 ? ['over', 'warn'] : ['obese', 'bad']);

  /** [{k, w}] — barcha yozilgan vaznlar, sanasi bo'yicha; WHOOP profili eng oxirgi nuqta. */
  function weightPoints() {
    const out = [];
    const h = D.S.health || {};
    for (const k of Object.keys(h).sort()) { const v = num(h[k] && h[k].weight); if (v && v > 0) out.push({ k, w: v }); }
    return out;
  }

  D.whoop.bodyCard = () => {
    const w = W();
    const p = w.profile || {}, b = w.body || {}, pr = D.S.profile || {};
    const dash = '<span class="muted">—</span>';
    const cell = (v, l, sub) => `<div class="wh-bd-cell"><b class="num">${v}</b><span>${esc(l)}</span>${sub ? `<em>${sub}</em>` : ''}</div>`;

    // ── 1) tana o'lchamlari: hammasi WHOOP profilidan ──
    const cm = num(b.heightCm) ?? num(pr.heightCm);
    const kg = num(b.weightKg) ?? (weightPoints().slice(-1)[0] || {}).w ?? null;
    const bmi = cm && kg ? kg / Math.pow(cm / 100, 2) : null;
    const [bmiCls, bmiZone] = bmi !== null ? BMI_Z(bmi) : ['', ''];
    const name = [p.first, p.last].filter(Boolean).join(' ');
    const grid = `<div class="wh-bd-grid">
      ${cell(cm !== null ? `${D.fmtNum(cm, 1)}<small>cm</small>` : dash, t('wh.height'))}
      ${cell(kg !== null ? `${D.fmtNum(kg, 1)}<small>${esc(t('unit.kg'))}</small>` : dash, t('wh.weight'), b.weightKg != null ? esc(t('wh.bd.fromWhoop')) : '')}
      ${cell(b.maxHr != null ? `${D.fmtNum(b.maxHr)}<small>bpm</small>` : dash, t('wh.maxHr'))}
      ${cell(bmi !== null ? `<span class="${bmiZone}">${D.fmtNum(bmi, 1)}</span>` : dash, t('wh.bd.bmi'), bmi !== null ? esc(t('wh.bd.bmi.' + bmiCls)) : '')}
    </div>`;

    // ── 2) vazn trendi — faqat o'qish uchun, 90 kun ──
    const pts = weightPoints();
    const from = D.addDays(D.today(), -90);
    const recent = pts.filter((x) => x.k >= from);
    let trend = '';
    if (recent.length >= 2) {
      const vals = recent.map((x) => x.w);
      const lo = Math.min(...vals), hi = Math.max(...vals), pad = Math.max(0.3, (hi - lo) * 0.08);
      const first = recent[0], last = recent[recent.length - 1], diff = last.w - first.w;
      trend = `<div class="wh-bd-trend"><div class="wh-bd-trend-head"><span class="eyebrow">${esc(t('wh.bd.weightTrend'))}</span>
          <b class="num ${diff > 0.05 ? 'warn' : diff < -0.05 ? 'good' : 'muted'}">${D.fmtSigned(diff, 1)} ${esc(t('unit.kg'))}</b></div>
        ${D.chart.spark({ values: vals, color: 'var(--success)', height: 54, fill: true, min: lo - pad, max: hi + pad })}
        <div class="spark-labels"><span>${esc(D.fmtDate(first.k, 'dm'))} · ${D.fmtNum(first.w, 1)}</span><span>${esc(D.fmtDate(last.k, 'dm'))} · ${D.fmtNum(last.w, 1)}</span></div></div>`;
    }

    const link = `<button class="wh-body-link" data-act="go" data-view="settings">${esc(t('wh.bd.enter'))}</button>`;
    const head = `<div class="card-head"><div class="title">${D.ic('user', 16)} ${esc(t('wh.bd.title'))}</div></div>`;
    const who = w.connected && (name || p.email) ? `<div class="tiny muted wh-bd-who">${esc(name || p.email)}${w.fetchedAt ? ` · ${esc(t('wh.bd.lastSync'))}: ${esc(D.fmtTs(w.fetchedAt))}` : ''}</div>` : '';
    const bodyCard = `<div class="card wh-bd">${head}${who}${grid}${trend}</div>`;

    // ── 3) yosh: WHOOP ilovasidan ko'chirilgan raqamlar + bizning oshkora taxminimiz ──
    const wa = num(pr.whoopAge), pa = num(pr.paceOfAging);
    const est = D.whoop.bioAge();
    let estBody;
    if (!est) {
      const hasAge = !!D.whoop.chronoAge();
      estBody = `<div class="empty small">${esc(hasAge ? t('wh.bd.needData') : t('wh.bd.needAge'))}${hasAge ? '' : ` · ${link}`}</div>`;
    } else {
      const dl = est.delta, z = dl <= -1 ? 'good' : dl >= 1 ? 'bad' : 'warn';
      const verdict = Math.abs(dl) < 0.5 ? t('wh.bd.same') : dl < 0 ? t('wh.bd.younger', { n: D.fmtNum(Math.abs(dl), 1) }) : t('wh.bd.older', { n: D.fmtNum(dl, 1) });
      const rows = est.inputs.map((i) => `<div class="wh-body-in"><span>${esc(t('wh.bd.f.' + i.k))}</span><b class="num">${D.fmtNum(i.v, 1)}${i.unit ? `<small>${esc(i.unit)}</small>` : ''}</b><span class="num muted">${D.fmtNum(i.ref, 1)}</span><b class="num ${i.effect < 0 ? 'good' : i.effect > 0 ? 'bad' : 'muted'}">${D.fmtSigned(i.effect, 1)}</b></div>`).join('');
      estBody = `<div class="wh-body-est"><div class="wh-body-num num ${z}">${D.fmtNum(est.est, 1)}</div><div class="grow"><div class="wh-body-verdict">${esc(verdict)}</div><div class="small muted">${esc(t('wh.bd.chrono', { n: est.chrono }))} · ${esc(t('wh.days', { n: est.days }))}</div></div></div>
        <div class="wh-body-ins"><div class="wh-body-in head"><span>${esc(t('wh.bd.inputs'))}</span><b></b><span>${esc(t('wh.bd.ref'))}</span><b>${esc(t('wh.bd.effect'))}</b></div>${rows}</div>`;
    }
    const typed = wa !== null || pa !== null;
    const ageCard = `<div class="card wh-body-estcard"><div class="card-head"><div class="title">${D.ic('bolt', 16)} ${esc(t('wh.bd.age'))}</div>
        ${typed && pr.whoopAgeAt ? `<span class="tiny muted">${esc(t('wh.bd.enteredAt', { d: D.fmtDate(pr.whoopAgeAt, 'short') }))}</span>` : ''}</div>
      ${typed ? `<div class="wh-body-big">
        <div class="wh-body-stat"><b class="num">${wa !== null ? D.fmtNum(wa, 1) : '—'}</b><span>${esc(t('wh.bd.whoopAge'))}</span></div>
        <div class="wh-body-stat"><b class="num">${pa !== null ? D.fmtNum(pa, 2) : '—'}</b><span>${esc(t('wh.bd.pace'))}</span></div>
      </div>` : `<div class="help">${esc(t('wh.bd.fromApp'))} · ${link}</div>`}
      <div class="wh-bd-sep">${esc(t('wh.bd.est'))}</div>${estBody}<div class="help mt-s">${esc(t('wh.bd.caveat'))}</div></div>`;

    return bodyCard + ageCard;
  };
  D.whoop.bodyPanel = D.whoop.bodyCard;   // eski nom

  /* ------------------------------------------------------------------ */
  /* render helpers used by the Health view                              */
  /* ------------------------------------------------------------------ */
  const FIELDS = [
    { f: 'recovery', c: 'var(--success)', unit: '%', dec: 1 },
    { f: 'sleepH', c: 'var(--info)', time: true },
    { f: 'strain', c: 'var(--accent)', dec: 1 },
    { f: 'hrv', c: 'var(--violet)', unit: 'ms', dec: 1 },
    { f: 'rhr', c: 'var(--warning)', unit: 'bpm', dec: 1 },
  ];
  const RANGES = [14, 30, 90];
  D.act.whRange = (el) => { D.ui.filters.whRange = +el.dataset.n; D.saveUi(); D.rerender(); };

  D.whoop.trendCard = () => {
    if (!D.whoop.has()) return '';
    const n = RANGES.includes(+D.ui.filters.whRange) ? +D.ui.filters.whRange : 30;
    const seg = `<div class="seg compact wh-range">${RANGES.map((r) => `<button class="${r === n ? 'on' : ''}" data-act="whRange" data-n="${r}">${esc(t('wh.days', { n: r }))}</button>`).join('')}</div>`;
    const rows = FIELDS.map(({ f, c, unit, dec, time }) => {
      const st = D.whoop.stats(f, n);
      if (!st) return '';
      // vaqt soat+daqiqada, qolgani bir kasrda — xom o'rtacha hech qachon ekranga chiqmaydi
      const show = (v) => (time ? fmtHm(v) : D.fmtNum(v, dec));
      const series = D.whoop.trend(f, n);
      const vals = series.map((x) => x.v);
      const known = vals.filter((v) => v !== null);
      const lo = Math.min(...known), hi = Math.max(...known);
      // gaps are carried forward so the line stays continuous; the count below says how many real readings there are
      let last = known[0];
      const filled = vals.map((v) => (v === null ? last : (last = v)));
      return `<div class="wh-trend-row">
        <div class="wh-trend-head"><span class="wh-trend-name">${esc(t('wh.' + f))}</span>
          <span class="wh-trend-val num" style="color:${c}">${show(st.avg)}${unit ? `<small>${unit}</small>` : ''}</span></div>
        <div class="wh-trend-chart">${D.chart.spark({ values: filled, color: c, height: 46, fill: true, min: lo, max: hi })}</div>
        <div class="wh-trend-foot"><span>${esc(t('wh.avg'))} <b class="num">${show(st.avg)}</b></span><span>${esc(t('wh.worst'))} <b class="num">${show(st.min)}</b></span><span>${esc(t('wh.best'))} <b class="num">${show(st.max)}</b></span><span class="muted num">${st.n}/${n}</span></div>
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
