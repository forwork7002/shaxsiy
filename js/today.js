/* =====================================================================
   today.js — Asosiy: kunning ko'zgusi va ish maydoni.
   Bugungi holat (uch halqa, bosh karta) · Uyqu · Zo'riqish · Daraja ·
   Odatlar (belgilanadi) · Bugungi vazifalar (belgilanadi) · Yil
   maqsadlari · Kun yakuni (izoh + shukr).
   «Yorug' qog'oz», 2026-10-09 — egasi tasdiqlagan dizayn hujjati.

   2026-10-09, EGASINING QARORI: Asosiy sahifada odat va vazifani
   belgilash mumkin. 2026-09-15 dagi «Asosiyda hech narsa belgilanmaydi»
   qoidasi shu bilan bekor. Namoz esa bu sahifadan Ibodatga ko'chdi
   (u yerda sahifaning o'zida belgilanadi). Buni o'zaro o'zgartirmang.

   Olib tashlandi: hafta chizig'i (o'rniga «So'nggi 7 kun» ustunlari —
   ustun bosilsa o'sha kun ochiladi), namoz qatorlari, Ovqat plitkasi
   (Tanada bor), 2×2 plitkalar.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'today.dayList': 'Bugun qilinadi', 'today.spentToday': 'Sarflandi',
      'today.lvl': '{n}-daraja', 'today.lvDone': 'Bajarildi',

      'today.wrap': 'Kun yakuni',

      'today.prayers': 'Namozlar',
      'today.phase.sleeping': 'Uyqu', 'today.phase.morning': 'Tong', 'today.phase.midday': 'Kunduz', 'today.phase.afternoon': 'Tushdan keyin',
      'today.phase.evening': 'Kechqurun', 'today.phase.bedtime': 'Uyqu vaqti', 'today.phase.pastBed': 'Uyqudan kech',
      'today.status.sleeping': '😴 Hali uyqu vaqti', 'today.status.morning': '☀️ Tong — yangi boshlanish', 'today.status.midday': '⚡ Kunduz — davom eting',
      'today.status.afternoon': "🔥 Tushdan keyin — zo'r bering", 'today.status.evening': '⏳ Kechqurun — yakunlang', 'today.status.bedtime': '🌙 Uyqu vaqti yaqin',
      'today.status.pastBed': "⚠️ Uyqu vaqti o'tdi",
      'today.untilWake': "uyg'onishgacha {t}", 'today.awakeLeft': 'faol kun: {t} qoldi', 'today.sleepNow': 'Uxlang!',

      'today.pr.jamaat': 'jamoat', 'today.pr.alone': 'yakka', 'today.pr.qaza': 'qazo', 'today.pr.missed': "o'tkazib",
      'today.habits': 'Odatlar', 'today.tasks': 'Vazifalar', 'today.goals': 'Maqsadlar',

      'today.water': 'Suv',
      'today.notePh': 'Bugungi kun haqida qisqacha…', 'today.words': "{n} so'z",
      'today.gratitude': 'Shukr', 'today.gratPh': 'Bugun nimaga shukr qilasiz?', 'today.gratEmpty': 'Bugun hali shukr yozilmagan',
      'today.gratEarlier': 'Ilgari yozilgan', 'today.gratOnThisDay': 'Shu kuni', 'today.gratDeleted': "Shukr yozuvi o'chirildi",
    },
    uzk: {
      'today.dayList': 'Бугун қилинади', 'today.spentToday': 'Сарфланди',
      'today.lvl': '{n}-даража', 'today.lvDone': 'Бажарилди',

      'today.wrap': 'Кун якуни',

      'today.prayers': 'Намозлар',
      'today.phase.sleeping': 'Уйқу', 'today.phase.morning': 'Тонг', 'today.phase.midday': 'Кундуз', 'today.phase.afternoon': 'Тушдан кейин',
      'today.phase.evening': 'Кечқурун', 'today.phase.bedtime': 'Уйқу вақти', 'today.phase.pastBed': 'Уйқудан кеч',
      'today.status.sleeping': '😴 Ҳали уйқу вақти', 'today.status.morning': '☀️ Тонг — янги бошланиш', 'today.status.midday': '⚡ Кундуз — давом этинг',
      'today.status.afternoon': '🔥 Тушдан кейин — зўр беринг', 'today.status.evening': '⏳ Кечқурун — якунланг', 'today.status.bedtime': '🌙 Уйқу вақти яқин',
      'today.status.pastBed': '⚠️ Уйқу вақти ўтди',
      'today.untilWake': 'уйғонишгача {t}', 'today.awakeLeft': 'фаол кун: {t} қолди', 'today.sleepNow': 'Ухланг!',

      'today.pr.jamaat': 'жамоат', 'today.pr.alone': 'якка', 'today.pr.qaza': 'қазо', 'today.pr.missed': 'ўтказиб',
      'today.habits': 'Одатлар', 'today.tasks': 'Вазифалар', 'today.goals': 'Мақсадлар',

      'today.water': 'Сув',
      'today.notePh': 'Бугунги кун ҳақида қисқача…', 'today.words': '{n} сўз',
      'today.gratitude': 'Шукр', 'today.gratPh': 'Бугун нимага шукр қиласиз?', 'today.gratEmpty': 'Бугун ҳали шукр ёзилмаган',
      'today.gratEarlier': 'Илгари ёзилган', 'today.gratOnThisDay': 'Шу куни', 'today.gratDeleted': 'Шукр ёзуви ўчирилди',
    },
    ru: {
      'today.dayList': 'Сегодня нужно', 'today.spentToday': 'Потрачено',
      'today.lvl': '{n} уровень', 'today.lvDone': 'Выполнено',

      'today.wrap': 'Итог дня',

      'today.prayers': 'Намазы',
      'today.phase.sleeping': 'Сон', 'today.phase.morning': 'Утро', 'today.phase.midday': 'Полдень', 'today.phase.afternoon': 'После обеда',
      'today.phase.evening': 'Вечер', 'today.phase.bedtime': 'Ко сну', 'today.phase.pastBed': 'Пора спать',
      'today.status.sleeping': '😴 Ещё время сна', 'today.status.morning': '☀️ Утро — свежий старт', 'today.status.midday': '⚡ Полдень — продолжайте',
      'today.status.afternoon': '🔥 После обеда — поднажмите', 'today.status.evening': '⏳ Вечер — завершайте', 'today.status.bedtime': '🌙 Скоро спать',
      'today.status.pastBed': '⚠️ Время сна прошло',
      'today.untilWake': 'до подъёма {t}', 'today.awakeLeft': 'активный день: осталось {t}', 'today.sleepNow': 'Спать!',

      'today.pr.jamaat': 'джамаат', 'today.pr.alone': 'один', 'today.pr.qaza': 'каза', 'today.pr.missed': 'пропущен',
      'today.habits': 'Привычки', 'today.tasks': 'Задачи', 'today.goals': 'Цели',

      'today.water': 'Вода',
      'today.notePh': 'Коротко о сегодняшнем дне…', 'today.words': 'слов: {n}',
      'today.gratitude': 'Благодарность', 'today.gratPh': 'За что вы благодарны сегодня?', 'today.gratEmpty': 'Сегодня записей ещё нет',
      'today.gratEarlier': 'Из прошлых записей', 'today.gratOnThisDay': 'В этот день', 'today.gratDeleted': 'Запись удалена',
    },
  });

  /* Bugun 2.0 — WHOOP tahlili uchun qatorlar (holat so'zlari, maslahat) */
  D.i18n.add({
    uz: {
      'today.state.good': 'Yuqori', 'today.state.warn': "O'rtacha", 'today.state.bad': 'Past',
      'today.tile.sleep.good': 'Yetarli', 'today.tile.sleep.warn': 'Kamroq', 'today.tile.sleep.bad': 'Kam',
      'today.tile.strain.over': 'Chegaradan oshdi', 'today.tile.strain.ok': "Me'yorida", 'today.tile.strain.under': 'Hali kam',
      'today.tile.food': "Me'yor {n} kkal", 'today.tile.h': 's', 'today.tile.m': 'd', 'lv.xpUnit': 'ochko',
      'today.adv.good': "Bugun {n} gacha zo'riqish ko'tarasiz",
      'today.adv.warn': "{n} atrofida zo'riqish yetarli",
      'today.adv.bad': "Dam oling — {n} dan oshirmang",
      'today.adv.over': "Chegara oshdi ({s}/{n}) — qolgan kun dam",
      'today.adv.past': "Chegaraga yetdingiz — {n} edi, hozir {s}",
      'today.d.short': '{h} kam', 'today.d.over': '{h} ortiq', 'today.d.target': 'chegara {n}',
      'today.d.base': "o'rtachadan {p}", 'today.d.noData': "ma'lumot yo'q",
      'today.debt': '7 kunda {h} uyqu qarzi',
      'today.r.sleep': 'Uyqu', 'today.r.rec': 'Tiklanish', 'today.r.strain': "Zo'riqish",
    },
    uzk: {
      'today.state.good': 'Юқори', 'today.state.warn': 'Ўртача', 'today.state.bad': 'Паст',
      'today.tile.sleep.good': 'Етарли', 'today.tile.sleep.warn': 'Камроқ', 'today.tile.sleep.bad': 'Кам',
      'today.tile.strain.over': 'Чегарадан ошди', 'today.tile.strain.ok': 'Меъёрида', 'today.tile.strain.under': 'Ҳали кам',
      'today.tile.food': 'Меъёр {n} ккал', 'today.tile.h': 'с', 'today.tile.m': 'д', 'lv.xpUnit': 'очко',
      'today.adv.good': 'Бугун {n} гача зўриқиш кўтарасиз',
      'today.adv.warn': '{n} атрофида зўриқиш етарли',
      'today.adv.bad': 'Дам олинг — {n} дан оширманг',
      'today.adv.over': 'Чегара ошди ({s}/{n}) — қолган кун дам',
      'today.adv.past': 'Чегарага етдингиз — {n} эди, ҳозир {s}',
      'today.d.short': '{h} кам', 'today.d.over': '{h} ортиқ', 'today.d.target': 'чегара {n}',
      'today.d.base': 'ўртачадан {p}', 'today.d.noData': 'маълумот йўқ',
      'today.debt': '7 кунда {h} уйқу қарзи',
      'today.r.sleep': 'Уйқу', 'today.r.rec': 'Тикланиш', 'today.r.strain': 'Зўриқиш',
    },
    ru: {
      'today.state.good': 'Высокое', 'today.state.warn': 'Среднее', 'today.state.bad': 'Низкое',
      'today.tile.sleep.good': 'Достаточно', 'today.tile.sleep.warn': 'Маловато', 'today.tile.sleep.bad': 'Мало',
      'today.tile.strain.over': 'Выше нормы', 'today.tile.strain.ok': 'В норме', 'today.tile.strain.under': 'Пока мало',
      'today.tile.food': 'Норма {n} ккал', 'today.tile.h': 'ч', 'today.tile.m': 'м', 'lv.xpUnit': 'очков',
      'today.adv.good': 'Сегодня выдержите нагрузку до {n}',
      'today.adv.warn': 'Достаточно нагрузки около {n}',
      'today.adv.bad': 'Отдыхайте — не выше {n}',
      'today.adv.over': 'Предел превышен ({s}/{n}) — дальше отдых',
      'today.adv.past': 'Предел достигнут — было {n}, сейчас {s}',
      'today.d.short': 'меньше на {h}', 'today.d.over': 'больше на {h}', 'today.d.target': 'предел {n}',
      'today.d.base': '{p} от среднего', 'today.d.noData': 'нет данных',
      'today.debt': 'долг сна за 7 дней: {h}',
      'today.r.sleep': 'Сон', 'today.r.rec': 'Восстановление', 'today.r.strain': 'Нагрузка',
    },
  });

  /* Asosiy 3.0 (2026-10-09) — yangi kartalar uchun qatorlar */
  D.i18n.add({
    uz: {
      'today.hi.morning': 'Xayrli tong', 'today.hi.day': 'Xayrli kun', 'today.hi.evening': 'Xayrli kech',
      'today.now': 'Bugungi holat', 'today.day': 'Kun holati', 'today.rec': 'tiklanish',
      'today.rec.wait': 'hali hisoblanmagan', 'today.rec.waitTitle': 'Tiklanish hali hisoblanmagan', 'today.rec.waitSub': "Tiklanish hali hisoblanmagan. WHOOP uni uyquni qayta ishlagach beradi — soat kechasi taqilgan bo'lishi kerak.",
      'today.z.good': 'yaxshi', 'today.z.warn': "o'rtacha", 'today.z.bad': 'past', 'today.z.ok': "me'yorda", 'today.z.high': 'yuqori', 'today.z.low': 'past',
      'today.hrv': 'HRV', 'today.rhr': 'Tinch puls', 'today.resp': 'Nafas', 'today.u.ms': 'ms', 'today.u.beat': 'zarba', 'today.u.rpm': '/daq',
      'today.explain': "HRV — yurak ritmi o'zgaruvchanligi, yuqori bo'lsa yaxshi{a}. Tinch puls — dam olgandagi yurak urishi, past bo'lsa yaxshi{b}.",
      'today.explain.avg': " (sizda o'rtacha {n})", 'today.explain.avg2': " (o'rtacha {n})",
      'today.last7': "So'nggi 7 kun", 'today.avg': "o'rtacha {n}%", 'today.todayShort': 'Bugun',
      'today.sleep.need': "me'yor {t}", 'today.sleep.enough': 'Yetarli', 'today.sleep.less': 'Kamroq', 'today.sleep.low': 'Kam',
      'today.sleep.deep': 'Chuqur', 'today.sleep.rem': 'Tush (REM)', 'today.sleep.light': 'Yengil', 'today.sleep.awake': "Uyg'oq",
      'today.sleep.times': '{a} da yotdingiz · {b} da turdingiz',
      'today.strain.of': '21 dan', 'today.strain.rec': 'Tavsiya: {a}–{b}', 'today.strain.kcal': 'Sarflangan kaloriya', 'today.strain.wo': "Mashg'ulot",
      'today.strain.woN': '{n} ta · {t}', 'today.strain.none': "bugun yo'q",
      'today.strain.note': "Zo'riqish — bugungi jismoniy yuklama, 0 dan 21 gacha. Ko'k ramka — tiklanishingizga mos tavsiya.",
      'today.wh.none': 'WHOOP ulanmagan', 'today.wh.noneSub': "Tiklanish, uyqu va zo'riqish shu yerda ko'rinadi.", 'today.wh.connect': 'Ulash',
      'today.wh.noDay': "Bu kun uchun WHOOP ma'lumoti yo'q",
      'today.lv.toNext': '{n}-darajaga {x} ochko qoldi', 'today.lv.max': 'Eng yuqori daraja', 'today.lv.today': 'Bugungi ochko',
      'today.lv.streak': '{n} kun ketma-ket', 'today.lv.week': 'Bu hafta: {t}',
      'today.hb.title': 'Odatlar', 'today.hb.count': '{a} / {b} bajarildi', 'today.hb.sub': 'Bajarganingizni bosib belgilang',
      'today.hb.done': 'bajarildi', 'today.hb.todo': 'belgilang', 'today.hb.new': 'Yangi odat', 'today.hb.add': "qo'shish", 'today.hb.empty': "Bugun uchun odat yo'q",
      'today.xp': '+{n} ochko', 'today.hb.reset': '{name}: hisob nolga qaytdi',
      'today.tk.title': 'Bugungi vazifalar', 'today.tk.late': "vaqti o'tdi", 'today.tk.imp': 'Muhim', 'today.tk.in': '{t} keyin',
      'today.tk.add': "Vazifa qo'shish", 'today.tk.all': 'Barchasi', 'today.tk.empty': "Bugunga vazifa yo'q",
      'today.gl.title': '{y} yil maqsadlari', 'today.gl.left': '{n} ta qoldi', 'today.gl.noTasks': "vazifa bog'lanmagan", 'today.gl.allDone': 'vazifalari bajarildi',
      'today.wrap.sub': 'izoh va shukr',
    },
    uzk: {
      'today.hi.morning': 'Хайрли тонг', 'today.hi.day': 'Хайрли кун', 'today.hi.evening': 'Хайрли кеч',
      'today.now': 'Бугунги ҳолат', 'today.day': 'Кун ҳолати', 'today.rec': 'тикланиш',
      'today.rec.wait': 'ҳали ҳисобланмаган', 'today.rec.waitTitle': 'Тикланиш ҳали ҳисобланмаган', 'today.rec.waitSub': 'Тикланиш ҳали ҳисобланмаган. WHOOP уни уйқуни қайта ишлагач беради — соат кечаси тақилган бўлиши керак.',
      'today.z.good': 'яхши', 'today.z.warn': 'ўртача', 'today.z.bad': 'паст', 'today.z.ok': 'меъёрида', 'today.z.high': 'юқори', 'today.z.low': 'паст',
      'today.hrv': 'HRV', 'today.rhr': 'Тинч пульс', 'today.resp': 'Нафас', 'today.u.ms': 'мс', 'today.u.beat': 'зарба', 'today.u.rpm': '/дақ',
      'today.explain': 'HRV — юрак ритми ўзгарувчанлиги, юқори бўлса яхши{a}. Тинч пульс — дам олгандаги юрак уриши, паст бўлса яхши{b}.',
      'today.explain.avg': ' (сизда ўртача {n})', 'today.explain.avg2': ' (ўртача {n})',
      'today.last7': 'Сўнгги 7 кун', 'today.avg': 'ўртача {n}%', 'today.todayShort': 'Бугун',
      'today.sleep.need': 'меъёр {t}', 'today.sleep.enough': 'Етарли', 'today.sleep.less': 'Камроқ', 'today.sleep.low': 'Кам',
      'today.sleep.deep': 'Чуқур', 'today.sleep.rem': 'Туш (REM)', 'today.sleep.light': 'Енгил', 'today.sleep.awake': 'Уйғоқ',
      'today.sleep.times': '{a} да ётдингиз · {b} да турдингиз',
      'today.strain.of': '21 дан', 'today.strain.rec': 'Тавсия: {a}–{b}', 'today.strain.kcal': 'Сарфланган калория', 'today.strain.wo': 'Машғулот',
      'today.strain.woN': '{n} та · {t}', 'today.strain.none': 'бугун йўқ',
      'today.strain.note': 'Зўриқиш — бугунги жисмоний юклама, 0 дан 21 гача. Кўк рамка — тикланишингизга мос тавсия.',
      'today.wh.none': 'WHOOP уланмаган', 'today.wh.noneSub': 'Тикланиш, уйқу ва зўриқиш шу ерда кўринади.', 'today.wh.connect': 'Улаш',
      'today.wh.noDay': 'Бу кун учун WHOOP маълумоти йўқ',
      'today.lv.toNext': '{n}-даражага {x} очко қолди', 'today.lv.max': 'Энг юқори даража', 'today.lv.today': 'Бугунги очко',
      'today.lv.streak': '{n} кун кетма-кет', 'today.lv.week': 'Бу ҳафта: {t}',
      'today.hb.title': 'Одатлар', 'today.hb.count': '{a} / {b} бажарилди', 'today.hb.sub': 'Бажарганингизни босиб белгиланг',
      'today.hb.done': 'бажарилди', 'today.hb.todo': 'белгиланг', 'today.hb.new': 'Янги одат', 'today.hb.add': 'қўшиш', 'today.hb.empty': 'Бугун учун одат йўқ',
      'today.xp': '+{n} очко', 'today.hb.reset': '{name}: ҳисоб нолга қайтди',
      'today.tk.title': 'Бугунги вазифалар', 'today.tk.late': 'вақти ўтди', 'today.tk.imp': 'Муҳим', 'today.tk.in': '{t} кейин',
      'today.tk.add': 'Вазифа қўшиш', 'today.tk.all': 'Барчаси', 'today.tk.empty': 'Бугунга вазифа йўқ',
      'today.gl.title': '{y} йил мақсадлари', 'today.gl.left': '{n} та қолди', 'today.gl.noTasks': 'вазифа боғланмаган', 'today.gl.allDone': 'вазифалари бажарилди',
      'today.wrap.sub': 'изоҳ ва шукр',
    },
    ru: {
      'today.hi.morning': 'Доброе утро', 'today.hi.day': 'Добрый день', 'today.hi.evening': 'Добрый вечер',
      'today.now': 'Состояние сегодня', 'today.day': 'Состояние дня', 'today.rec': 'восстановление',
      'today.rec.wait': 'ещё не рассчитано', 'today.rec.waitTitle': 'Восстановление ещё не рассчитано', 'today.rec.waitSub': 'Восстановление ещё не рассчитано. WHOOP выдаёт его после обработки сна — браслет должен быть на руке ночью.',
      'today.z.good': 'хорошо', 'today.z.warn': 'средне', 'today.z.bad': 'низко', 'today.z.ok': 'в норме', 'today.z.high': 'высокий', 'today.z.low': 'низкий',
      'today.hrv': 'HRV', 'today.rhr': 'Пульс покоя', 'today.resp': 'Дыхание', 'today.u.ms': 'мс', 'today.u.beat': 'уд.', 'today.u.rpm': '/мин',
      'today.explain': 'HRV — вариабельность сердечного ритма, чем выше, тем лучше{a}. Пульс покоя — пульс в состоянии отдыха, чем ниже, тем лучше{b}.',
      'today.explain.avg': ' (ваше среднее {n})', 'today.explain.avg2': ' (среднее {n})',
      'today.last7': 'Последние 7 дней', 'today.avg': 'в среднем {n}%', 'today.todayShort': 'Сегодня',
      'today.sleep.need': 'норма {t}', 'today.sleep.enough': 'Достаточно', 'today.sleep.less': 'Маловато', 'today.sleep.low': 'Мало',
      'today.sleep.deep': 'Глубокий', 'today.sleep.rem': 'Быстрый (REM)', 'today.sleep.light': 'Лёгкий', 'today.sleep.awake': 'Без сна',
      'today.sleep.times': 'легли в {a} · встали в {b}',
      'today.strain.of': 'из 21', 'today.strain.rec': 'Совет: {a}–{b}', 'today.strain.kcal': 'Потрачено калорий', 'today.strain.wo': 'Тренировки',
      'today.strain.woN': '{n} · {t}', 'today.strain.none': 'сегодня нет',
      'today.strain.note': 'Нагрузка — физическая нагрузка за день, от 0 до 21. Синяя рамка — совет под ваше восстановление.',
      'today.wh.none': 'WHOOP не подключён', 'today.wh.noneSub': 'Здесь появятся восстановление, сон и нагрузка.', 'today.wh.connect': 'Подключить',
      'today.wh.noDay': 'Нет данных WHOOP за этот день',
      'today.lv.toNext': 'до {n} уровня — {x} очков', 'today.lv.max': 'Высший уровень', 'today.lv.today': 'Очки сегодня',
      'today.lv.streak': '{n} дн. подряд', 'today.lv.week': 'Эта неделя: {t}',
      'today.hb.title': 'Привычки', 'today.hb.count': 'выполнено {a} / {b}', 'today.hb.sub': 'Нажмите на выполненное',
      'today.hb.done': 'выполнено', 'today.hb.todo': 'отметьте', 'today.hb.new': 'Новая', 'today.hb.add': 'добавить', 'today.hb.empty': 'На сегодня привычек нет',
      'today.xp': '+{n} очков', 'today.hb.reset': '{name}: счёт обнулён',
      'today.tk.title': 'Задачи на сегодня', 'today.tk.late': 'просрочено', 'today.tk.imp': 'Важно', 'today.tk.in': 'через {t}',
      'today.tk.add': 'Добавить задачу', 'today.tk.all': 'Все', 'today.tk.empty': 'На сегодня задач нет',
      'today.gl.title': 'Цели {y} года', 'today.gl.left': 'осталось {n}', 'today.gl.noTasks': 'нет связанных задач', 'today.gl.allDone': 'задачи выполнены',
      'today.wrap.sub': 'заметка и благодарность',
    },
  });

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const key = () => { const td = D.today(), v = D.ui.viewDate; return v && v < td ? v : td; };
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) {} };
  const words = (s) => ((s || '').trim().match(/\S+/g) || []).length;
  const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('today', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };
  // safe() xato o'rniga karta qaytaradi; bu esa qiymat kutilgan joylar uchun
  const safeVal = (fn) => { try { return fn(); } catch (e) { console.error('today', e); return null; } };
  const pct = (v) => D.clamp(+v || 0, 0, 100);
  const zoneOf = (r) => (r >= 67 ? 'good' : r >= 34 ? 'warn' : 'bad');
  // «8 soat» / «7 soat 25 daq» — nol daqiqa yozilmaydi
  const durHm = (mins) => { const h = Math.floor(mins / 60), m = Math.round(mins % 60); return h && !m ? `${h} ${t('unit.h')}` : D.fmtMins(mins); };
  // Vaqt belgisi ms (lastSync) yoki ISO satr (WHOOP bedTs/wakeTs) bo'lishi mumkin.
  const hhmm = (ts) => { try { const d = new Date(typeof ts === 'number' || /^\d+$/.test(ts) ? +ts : ts); if (isNaN(d)) return ''; const p = D.nowTz(d); return D.fmtTime(p.h, p.min); } catch (e) { return ''; } };

  // prayer ↔ habit map, memoised on the habit list signature
  let phCache = { sig: null, map: {}, rev: {} };
  function prayerHabits() {
    const sig = D.S.habits.map((h) => h.id + ':' + h.name + ':' + (h.active ? 1 : 0)).join('|');
    if (sig !== phCache.sig) {
      const map = {}, rev = {};
      for (const h of D.S.habits) {
        if (!h.active) continue;
        const p = D.prayer.matchName(h.name);
        if (p && !map[p]) { map[p] = h.id; rev[h.id] = p; }
      }
      phCache = { sig, map, rev };
    }
    return phCache;
  }
  /* Namoz holatini yozadi. Bugun sahifasi endi hech narsani belgilamaydi,
     shuning uchun bu yerga bitta yo'l qoldi: odat trekkerida namoz nomli
     odat belgilanganda. Teskari yo'nalish — namoz belgilansa odat ham
     belgilanishi — Ibodat bo'limining o'z setPrayer'ida turadi. */
  function setPrayer(k, id, v) {
    const o = D.S.prayers[k] || { bomdod: null, peshin: null, asr: null, shom: null, xufton: null };
    o[id] = v || null;
    // tahajjud ham kun yozuvida turadi — faqat hammasi bo'sh bo'lsa kun o'chadi
    if (D.PRAYERS.concat(['tahajjud']).every((p) => !o[p])) delete D.S.prayers[k]; else D.S.prayers[k] = o;
  }
  function syncPrayerFromHabit(k, hid, on) {
    const p = prayerHabits().rev[hid];
    if (!p) return;
    const cur = (D.S.prayers[k] || {})[p] || null;
    if (on && !cur) setPrayer(k, p, 'alone');
    else if (!on && cur && cur !== 'missed') setPrayer(k, p, null);
  }

  D.act.tdShift = (el) => {
    const nk = D.addDays(key(), +el.dataset.n || 0);
    if (nk > D.today()) return;
    D.ui.viewDate = nk === D.today() ? null : nk;
    D.saveUi(); D.rerender();
  };
  D.act.tdToday = () => { D.ui.viewDate = null; D.saveUi(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* 1. BUGUNGI HOLAT — bosh karta                                        */
  /* Bir-birining ichida uch halqa: tashqi — tiklanish %, o'rta — uyqu    */
  /* (me'yorning %), ichki — zo'riqish / 21. Ostida maslahat, uch plitka  */
  /* (HRV · tinch puls · nafas), bir-ikki jumla izoh va oxirgi yetti kun. */
  /* ------------------------------------------------------------------ */
  /** Shu kunning WHOOP kesimi — bugun uchun ham, orqaga qaralgan kun uchun ham. */
  function dayRec(k) {
    if (!(D.S.whoop && D.S.whoop.connected && D.whoop && D.whoop.dayInsight)) return null;
    const i = safeVal(() => D.whoop.dayInsight(k));
    /* Tiklanish foizi bo'lmasa ham kun ko'rsatiladi: WHOOP uni uyquni qayta
       ishlagach beradi (yoki soat kechasi taqilmagan bo'lsa umuman bermaydi),
       uyqu va zo'riqish esa allaqachon bor. Ilgari (2026-10-09 dagi birinchi
       nusxada) tiklanish yo'q kunda butun WHOOP qismi yashirilardi. */
    if (!i) return null;
    const live = k === D.today() ? safeVal(() => (D.whoop.live ? D.whoop.live() : null)) : null;
    if (i.recovery == null && i.sleepH == null && i.strain == null && !(live && live.strain != null)) return null;
    i.zone = i.recovery != null ? zoneOf(i.recovery) : '';
    return i;
  }
  const whoopOn = () => !!(D.S.whoop && D.S.whoop.connected && D.whoop);
  /** Zo'riqish: bugun — jonli qiymat (bo'lsa), o'tgan kun — kunning o'zi. */
  function strainOf(i, k) {
    const live = k === D.today() ? safeVal(() => (D.whoop.live ? D.whoop.live() : null)) : null;
    return live && live.strain != null ? live.strain : i.strain;
  }
  // Halqa: C = 2πr, to'ldirish stroke-dashoffset = C·(1 − ulush)
  function ringArc(r, p, cls, grad) {
    const C = 2 * Math.PI * r, off = C * (1 - pct(p) / 100);
    return `<circle class="td-rg-t ${cls}" cx="88" cy="88" r="${r}"/>`
      + (p > 0 ? `<circle class="td-rg-f" cx="88" cy="88" r="${r}" stroke="url(#${grad})" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>` : '');
  }
  function ringsSvg(rec, sleepPct, strain) {
    return `<svg class="td-rings-svg" viewBox="0 0 176 176" width="176" height="176" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tdG1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6EE7A0"/><stop offset="1" stop-color="#16A34A"/></linearGradient>
        <linearGradient id="tdG2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C4B5FD"/><stop offset="1" stop-color="#5B3FC4"/></linearGradient>
        <linearGradient id="tdG3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A5BFFF"/><stop offset="1" stop-color="#2358E8"/></linearGradient>
      </defs>
      <g transform="rotate(-90 88 88)" stroke-width="13" stroke-linecap="round">
        ${ringArc(80, rec, 'a', 'tdG1')}${ringArc(63, sleepPct == null ? 0 : sleepPct, 'b', 'tdG2')}${ringArc(46, strain == null ? 0 : (strain / 21) * 100, 'c', 'tdG3')}
      </g></svg>`;
  }
  const legRow = (cls, name, big, note, noteCls) => `<div class="td-leg ${cls}"><span class="td-leg-n"><i class="dot"></i>${esc(name)}</span>
      <span class="td-leg-v"><b class="num">${big}</b>${note ? `<span class="td-leg-s ${noteCls || ''}">${note}</span>` : ''}</span></div>`;

  function adviceBox(i, strain) {
    const tgt = i.strainTarget;
    if (tgt == null) return '';
    const n = D.fmtNum(Math.round(tgt)), s = strain != null ? D.fmtNum(strain, 1) : '';
    let k = 'today.adv.' + i.zone, cls = i.zone === 'good' ? '' : i.zone === 'warn' ? 'warn' : 'bad', ic = i.zone === 'good' ? 'check' : i.zone === 'warn' ? 'info' : 'alert';
    if (strain != null && strain - tgt > 3) { k = 'today.adv.over'; cls = 'warn'; ic = 'alert'; }
    else if (strain != null && strain >= tgt) { k = 'today.adv.past'; cls = 'info'; ic = 'info'; }
    return `<div class="advice ${cls} td-adv">${D.ic(ic, 18)}<span>${esc(t(k, { n, s }))}</span></div>`;
  }
  function vitalTiles(i) {
    const out = [];
    if (i.hrv != null) {
      const z = i.hrvPct == null ? '' : i.hrvPct >= 5 ? 'good' : i.hrvPct <= -10 ? 'bad' : '';
      out.push(`<div class="ptile"><span class="ptile-l">${esc(t('today.hrv'))}</span><span class="ptile-v num">${D.fmtNum(i.hrv)} <small>${esc(t('today.u.ms'))}</small></span>
        <span class="ptile-n ${z}">${esc(t(z === 'good' ? 'today.z.good' : z === 'bad' ? 'today.z.low' : 'today.z.ok'))}</span></div>`);
    }
    if (i.rhr != null) {
      const z = i.rhrDelta == null ? '' : i.rhrDelta <= -1 ? 'good' : i.rhrDelta >= 3 ? 'bad' : '';
      out.push(`<div class="ptile"><span class="ptile-l">${esc(t('today.rhr'))}</span><span class="ptile-v num">${D.fmtNum(i.rhr)} <small>${esc(t('today.u.beat'))}</small></span>
        <span class="ptile-n ${z}">${esc(t(z === 'good' ? 'today.z.good' : z === 'bad' ? 'today.z.high' : 'today.z.ok'))}</span></div>`);
    }
    if (i.resp != null) {
      out.push(`<div class="ptile"><span class="ptile-l">${esc(t('today.resp'))}</span><span class="ptile-v num">${D.fmtNum(i.resp, 1)} <small>${esc(t('today.u.rpm'))}</small></span>
        <span class="ptile-n">${esc(t('today.z.ok'))}</span></div>`);
    }
    if (!out.length) return '';
    const a = i.hrvBase != null ? t('today.explain.avg', { n: D.fmtNum(i.hrvBase) }) : '';
    const b = i.rhrBase != null ? t('today.explain.avg2', { n: D.fmtNum(i.rhrBase) }) : '';
    return `<div class="ptiles td-vitals${out.length === 2 ? ' two' : ''}">${out.join('')}</div>
      ${i.hrv != null && i.rhr != null ? `<p class="td-note">${esc(t('today.explain', { a, b }))}</p>` : ''}`;
  }
  /* Oxirgi yetti kun: ustun — o'sha kunning tiklanishi, zona rangida.
     Ustun bosilsa o'sha kun ochiladi (hafta chizig'i o'rnida shu turadi). */
  function week7(k) {
    const td = D.today(), W = t('weekdaysShort');
    let cols = '', sum = 0, n = 0;
    for (let j = 6; j >= 0; j--) {
      const day = D.addDays(td, -j), d = D.whoop.day ? D.whoop.day(day) : null;
      const r = d && d.recovery != null ? +d.recovery : null;
      if (r != null) { sum += r; n++; }
      const z = r == null ? '' : zoneOf(r);
      cols += `<button type="button" class="td-w7c${day === k ? ' on' : ''}${day === td ? ' today' : ''}" data-act="tdPickDay" data-key="${day}" aria-label="${esc(D.fmtDate(day, 'weekday'))}${r != null ? ` — ${Math.round(r)}%` : ''}">
        <span class="td-w7v num">${r != null ? Math.round(r) + '%' : '—'}</span>
        <span class="td-w7t"><i class="${z}" style="height:${r != null ? Math.max(8, pct(r)).toFixed(0) : 0}%"></i></span>
        <span class="td-w7d">${esc(day === td ? t('today.todayShort') : W[D.dowOf(day)])}</span></button>`;
    }
    return `<div class="td-w7"><div class="td-w7h"><b>${esc(t('today.last7'))}</b>${n ? `<span class="num">${esc(t('today.avg', { n: Math.round(sum / n) }))}</span>` : ''}</div>
      <div class="td-w7g">${cols}</div></div>`;
  }
  function freshPill() {
    const ls = D.S.whoop && D.S.whoop.lastSync;
    return `<span class="hero-pill num">WHOOP${ls ? ' · ' + esc(hhmm(ls)) : ''}</span>`;
  }

  function heroCard(i, k) {
    const strain = strainOf(i, k);
    const sp = i.metPct != null ? i.metPct : i.perf;
    const z = i.zone, hasRec = i.recovery != null;
    const sm = i.sleepH != null ? Math.round(i.sleepH * 60) : null;
    const sleepNote = sm != null ? `${Math.floor(sm / 60)} ${esc(t('today.tile.h'))} ${sm % 60} ${esc(t('today.tile.m'))}` : '';
    const load = strain == null || i.strainTarget == null ? '' : strain - i.strainTarget > 3 ? 'over' : strain - i.strainTarget < -4 ? 'under' : 'ok';
    return `<section class="card hero hero--yashil td-hero">
      <div class="td-hero-h" data-act="go" data-view="health" data-sub="ready" role="button" tabindex="0">
        <h2>${esc(t(k === D.today() ? 'today.now' : 'today.day'))}</h2>${k === D.today() ? freshPill() : ''}</div>
      <div class="td-rings" data-act="go" data-view="health" data-sub="ready">
        <div class="td-rings-w">${ringsSvg(hasRec ? i.recovery : 0, sp, strain)}
          <div class="td-rings-c${hasRec ? '' : ' wait'}"><b class="num">${hasRec ? `${Math.round(i.recovery)}<small>%</small>` : '—'}</b><span>${esc(t('today.rec'))}</span></div></div>
        <div class="td-legs">
          ${hasRec ? legRow('a', t('today.r.rec'), `${Math.round(i.recovery)}%`, esc(t('today.z.' + z)), z) : legRow('a', t('today.r.rec'), '—', esc(t('today.rec.wait')), '')}
          ${sp != null ? legRow('b', t('today.r.sleep'), `${Math.round(sp)}%`, sleepNote, 'sleep') : ''}
          ${strain != null ? legRow('c', t('today.r.strain'), `${D.fmtNum(strain, 1)} <i>/ 21</i>`, load ? esc(t('today.tile.strain.' + load)) : '', 'info') : ''}
        </div>
      </div>
      ${hasRec ? adviceBox(i, strain) : `<div class="advice info td-adv">${D.ic('info', 18)}<span>${esc(t('today.rec.waitSub'))}</span></div>`}
      ${vitalTiles(i)}
      ${week7(k)}
    </section>`;
  }

  /* ------------------------------------------------------------------ */
  /* 2. UYQU                                                             */
  /* ------------------------------------------------------------------ */
  const STG = [['deep', '#4B32B8'], ['rem', '#8B7CF6'], ['light', '#C9C0FB'], ['awake', '#F4B4C0']];
  function sleepCard(i, k) {
    if (i.sleepH == null) return '';
    const d = D.whoop.day(k) || {};
    let z = '';
    if (i.gapH != null) z = i.gapH >= -0.5 ? 'enough' : i.gapH >= -1.5 ? 'less' : 'low';
    else if (i.perf != null) z = i.perf >= 85 ? 'enough' : i.perf >= 70 ? 'less' : 'low';
    // foiz bosh kartadagi halqa bilan bir xil manbadan: avval me'yorga nisbat, bo'lmasa WHOOP bahosi
    const p = i.metPct != null ? i.metPct : (i.perf != null ? Math.round(i.perf) : null);
    const pill = p != null || z ? `<span class="pill sleep num">${p != null ? p + '%' : ''}${p != null && z ? ' · ' : ''}${z ? esc(t('today.sleep.' + z)) : ''}</span>` : '';
    let stages = '';
    const st = d.stages;
    if (st && typeof st === 'object') {
      const tot = STG.reduce((a, [id]) => a + (+st[id] || 0), 0);
      if (tot > 0) {
        stages = `<div class="td-stg" aria-hidden="true">${STG.map(([id, c]) => (+st[id] > 0 ? `<i style="flex:${(+st[id] / tot * 100).toFixed(1)};background:${c}"></i>` : '')).join('')}</div>
          <div class="td-stg-l">${STG.map(([id, c]) => `<span><i class="dot" style="--c:${c}"></i>${esc(t('today.sleep.' + id))}<b class="num">${esc(shortDur(+st[id] || 0))}</b></span>`).join('')}</div>`;
      }
    }
    const bed = d.bedTs ? hhmm(d.bedTs) : '', wake = d.wakeTs ? hhmm(d.wakeTs) : '';
    const when = bed && wake ? `<p class="td-foot num">${esc(t('today.sleep.times', { a: bed, b: wake }))}</p>` : '';
    return `<button type="button" class="card td-c td-sleep" data-act="go" data-view="health" data-sub="sleep">
      <span class="td-c-h"><span class="ico sleep">${D.ic('moon', 19)}</span><b>${esc(t('today.r.sleep'))}</b>${pill}</span>
      <span class="td-big"><b class="num">${esc(D.fmtMins(Math.round(i.sleepH * 60)))}</b>${i.needH != null ? `<i class="num">${esc(t('today.sleep.need', { t: durHm(Math.round(i.needH * 60)) }))}</i>` : ''}</span>
      ${stages}${when}
    </button>`;
  }
  // «1 s 32 d» — bosqich davomiyligi, ixcham
  function shortDur(ms) {
    const m = Math.round(ms / 60000), h = Math.floor(m / 60), r = m % 60;
    return h ? `${h} ${t('today.tile.h')} ${r} ${t('today.tile.m')}` : `${r} ${t('today.tile.m')}`;
  }

  /* ------------------------------------------------------------------ */
  /* 3. ZO'RIQISH                                                        */
  /* ------------------------------------------------------------------ */
  function strainCard(i, k) {
    const strain = strainOf(i, k);
    if (strain == null) return '';
    const tgt = i.strainTarget;
    const load = tgt == null ? '' : strain - tgt > 3 ? 'over' : strain - tgt < -4 ? 'under' : 'ok';
    const a = tgt != null ? Math.max(0, Math.round(tgt) - 1) : null, b = tgt != null ? Math.min(21, Math.round(tgt) + 1) : null;
    const wos = safeVal(() => D.whoop.workoutsOn(k)) || [];
    const mins = wos.reduce((s, x) => s + (+x.mins || 0), 0);
    return `<button type="button" class="card td-c td-strain" data-act="go" data-view="health" data-sub="strain">
      <span class="td-c-h"><span class="ico info">${D.ic('bolt', 19)}</span><b>${esc(t('today.r.strain'))}</b>${load ? `<span class="pill ${load === 'over' ? 'warn' : 'info'}">${esc(t('today.tile.strain.' + load))}</span>` : ''}</span>
      <span class="td-big"><b class="num">${D.fmtNum(strain, 1)}</b><i>${esc(t('today.strain.of'))}</i>${a != null ? `<em class="num">${esc(t('today.strain.rec', { a, b }))}</em>` : ''}</span>
      <span class="td-sbar"><i style="width:${pct(strain / 21 * 100).toFixed(1)}%"></i>${a != null ? `<u style="left:${(a / 21 * 100).toFixed(1)}%;width:${((b - a) / 21 * 100).toFixed(1)}%"></u>` : ''}</span>
      <span class="td-scale num"><i>0</i><i>7</i><i>14</i><i>21</i></span>
      <span class="ptiles two td-st">
        ${i.kcal != null ? `<span class="ptile flat"><span class="ptile-l">${esc(t('today.strain.kcal'))}</span><span class="ptile-v num">${D.fmtNum(Math.round(i.kcal))} ${esc(t('food.kcal'))}</span></span>` : ''}
        <span class="ptile flat"><span class="ptile-l">${esc(t('today.strain.wo'))}</span><span class="ptile-v num">${wos.length ? esc(t('today.strain.woN', { n: wos.length, t: `${D.fmtNum(Math.round(mins))} ${t('unit.m')}` })) : esc(t('today.strain.none'))}</span></span>
      </span>
      <span class="td-note">${esc(t('today.strain.note'))}</span>
    </button>`;
  }

  function noWhoopCard(k) {
    if (whoopOn()) return `<div class="card td-nowh"><span class="ico">${D.ic('heart', 18)}</span><div><b>${esc(t('today.wh.noDay'))}</b></div></div>`;
    if (k !== D.today()) return '';
    return `<div class="card td-nowh"><span class="ico">${D.ic('heart', 18)}</span>
      <div><b>${esc(t('today.wh.none'))}</b><p>${esc(t('today.wh.noneSub'))}</p></div>
      <button class="btn sm" data-act="go" data-view="health">${esc(t('today.wh.connect'))}</button></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* 4. DARAJA                                                            */
  /* ------------------------------------------------------------------ */
  function levelCard() {
    const d = D.levels.day(), i = D.levels.info(), w = D.levels.week();
    const left = Math.max(0, (+i.need || 0) - (+i.have || 0));
    const sub = i.max ? t('today.lv.max') : t('today.lv.toNext', { n: D.fmtNum(i.next), x: D.fmtNum(left) });
    const wTxt = t('lv.w.' + w.id, { n: D.fmtNum(w.need) });
    return `<button type="button" class="card td-c td-lv${d.done ? ' done' : ''}" data-act="lvOpen">
      <span class="td-lv-top">
        <span class="td-hex num" aria-hidden="true">${D.fmtNum(i.level)}</span>
        <span class="td-lv-t"><b>${esc(t('today.lvl', { n: D.fmtNum(i.level) }))}</b><span>${esc(sub)}</span>
          <span class="bar"><i class="bar-fill" style="width:${pct(i.pct).toFixed(1)}%"></i></span></span>
      </span>
      <span class="td-lv-row"><span>${esc(t('today.lv.today'))}</span><span class="num"><b>${D.fmtNum(d.xp)}</b> / ${D.fmtNum(d.goal)}</span></span>
      <span class="bar md td-lv-bar"><i class="bar-fill" style="width:${pct(d.pct).toFixed(1)}%"></i></span>
      <span class="td-lv-pills">
        ${d.cur ? `<span class="pill warn">${D.ic('flame', 13)} ${esc(t('today.lv.streak', { n: D.fmtNum(d.cur) }))}</span>` : ''}
        <span class="pill td-lv-w${w.done ? ' good' : ''}"><span>${esc(t('today.lv.week', { t: wTxt }))}</span> <b class="num">${D.fmtNum(Math.min(w.cur, w.need))} / ${D.fmtNum(w.need)}</b></span>
      </span>
    </button>`;
  }

  /* ------------------------------------------------------------------ */
  /* 5. ODATLAR — to'rt ustunli to'r, shu yerning o'zida belgilanadi      */
  /*                                                                      */
  /* 2026-10-09, egasining qarori: Asosiy sahifada endi odat va vazifani  */
  /* BELGILASH MUMKIN. Ilgari (2026-09-15) qoida teskari edi — «Asosiyda  */
  /* hech narsa belgilanmaydi, har narsa o'z bo'limida». Belgilash yangi  */
  /* yozish yo'li emas: odat D.habits.toggle / bump va D.media.toggle     */
  /* orqali, vazifa Vazifa bo'limining o'z tkToggle amali orqali yoziladi */
  /* — Trekker bilan aynan bir xil ma'lumot. Vazifa › Trekkerdagi         */
  /* belgilash ham joyida qoldi.                                          */
  /* ------------------------------------------------------------------ */
  // odat bajarilganmi: sanaladigani me'yorga yetsa, oddiysi belgilangan bo'lsa
  function habitDoneOn(k) {
    const logs = new Set(D.S.logs[k] || []), counts = D.S.counts[k] || {};
    return (h) => (h.target && h.target.n ? (+counts[h.id] || 0) >= +h.target.n : logs.has(h.id));
  }
  /** Shu kunning odatlari: namoz nomli odatlar chiqariladi (ular Ibodatda),
      o'qilayotgan kitob esa odat qatorida turadi. */
  function habitItems(k) {
    const rev = prayerHabits().rev, isDone = habitDoneOn(k), counts = D.S.counts[k] || {};
    const out = [];
    for (const h of D.dueHabits(k)) {
      if (rev[h.id]) continue;
      const q = h.target && +h.target.n > 0 ? +h.target.n : 0;
      out.push({ id: h.id, kind: 'h', name: h.name, sphere: h.sphere, mark: D.habitMark(h, 24), done: isDone(h), q, n: q ? (+counts[h.id] || 0) : 0, unit: q ? (h.target.unit || '') : '' });
    }
    for (const m of D.S.media) {
      if (m.status !== 'now') continue;
      out.push({ id: m.id, kind: 'm', name: m.title, sphere: 'aql', mark: D.ic(m.kind === 'kitob' ? 'book' : 'layers', 24), done: D.media.on(m.id, k), q: 0, n: 0, unit: '' });
    }
    return out;
  }
  function habitsCard(k) {
    const items = habitItems(k), done = items.filter((x) => x.done).length;
    const cells = items.map((x) => {
      const part = !x.done && x.q && x.n > 0;
      const st = x.done ? 'done' : part ? 'part' : '';
      const sub = x.done ? t('today.hb.done') : x.q ? `${D.fmtNum(x.n)}/${D.fmtNum(x.q)}${x.unit ? ' ' + x.unit : ''}` : t('today.hb.todo');
      return `<button type="button" class="td-hb ${st}" style="--c:var(--${D.SPHERE_IDS.includes(x.sphere) ? x.sphere : 'boshqa'})" data-act="tdHabit" data-id="${esc(x.id)}" data-kind="${x.kind}" aria-pressed="${x.done ? 'true' : 'false'}" aria-label="${esc(x.name)} — ${esc(sub)}">
        <span class="td-hb-sq">${x.mark}${x.done ? `<i class="td-hb-ok">${D.ic('check', 12)}</i>` : ''}${part ? `<u><i style="width:${pct(x.n / x.q * 100).toFixed(0)}%"></i></u>` : ''}</span>
        <span class="td-hb-n">${esc(x.name)}</span><span class="td-hb-s num">${esc(sub)}</span></button>`;
    }).join('');
    const add = k === D.today() ? `<button type="button" class="td-hb add" data-act="tdHabitNew">
        <span class="td-hb-sq">${D.ic('plus', 22)}</span><span class="td-hb-n">${esc(t('today.hb.new'))}</span><span class="td-hb-s">${esc(t('today.hb.add'))}</span></button>` : '';
    return `<section class="card td-habits">
      <div class="card-head"><h2 class="title">${esc(t('today.hb.title'))}</h2>${items.length ? `<span class="td-cnt num">${esc(t('today.hb.count', { a: done, b: items.length }))}</span>` : ''}</div>
      <p class="card-sub">${esc(t(items.length ? 'today.hb.sub' : 'today.hb.empty'))}</p>
      <div class="td-hbs">${cells}${add}</div>
    </section>`;
  }
  const xpNow = () => safeVal(() => (D.levels ? D.levels.day().xp : null));
  // Tasbeh odati (33 ga bo'linadigan me'yor) bir bosishda bir aylanish — 33.
  const stepOf = (q) => (q >= 33 && q % 33 === 0 ? 33 : 1);
  D.act.tdHabit = (el) => {
    const k = key(), id = el.dataset.id;
    const before = xpNow();
    let reset = null;
    if (el.dataset.kind === 'm') D.media.toggle(id, k);
    else {
      const h = D.S.habits.find((x) => x.id === id);
      if (!h) return;
      const q = h.target && +h.target.n > 0 ? +h.target.n : 0;
      if (q) {
        const cur = +((D.S.counts[k] || {})[id]) || 0;
        if (cur >= q) { D.habits.bump(h, k, -cur); reset = { h, cur }; }
        else D.habits.bump(h, k, Math.min(stepOf(q), q - cur));
      } else D.habits.toggle(h, k);
      D.emit('habit:toggled', { habit: h, day: k, on: (D.S.logs[k] || []).includes(id) });
    }
    haptic(); D.save(); D.rerender();
    if (reset) {
      D.toast(t('today.hb.reset', { name: reset.h.name }), { undo: () => { D.habits.bump(reset.h, k, reset.cur); D.save(); D.rerender(); } });
      return;
    }
    const after = xpNow();
    if (before != null && after != null && after > before) D.toast(t('today.xp', { n: D.fmtNum(after - before) }));
  };
  const viaView = (view, act, el) => D.loadView(view).then(() => { if (D.act[act]) D.act[act](el); });
  D.act.tdHabitNew = () => viaView('habits', 'hbAddHabit');

  /* ------------------------------------------------------------------ */
  /* 6. BUGUNGI VAZIFALAR                                                 */
  /* ------------------------------------------------------------------ */
  // tasks that belong to a day: dated that day, plus undone older ones (overdue)
  function tasksFor(k) {
    const out = [];
    for (const x of D.S.tasks) { if (!x.date) continue; if (x.date === k || (x.date < k && !x.done)) out.push(x); }
    // bajarilmagani yuqorida: vaqtlisi vaqt tartibida, keyin muhimi; bajarilgani pastda
    out.sort((a, b) => (a.done - b.done) || ((a.time || '99') < (b.time || '99') ? -1 : (a.time || '99') > (b.time || '99') ? 1 : 0) || (b.priority || 2) - (a.priority || 2));
    return out;
  }
  const repLabel = (r) => { if (!r) return ''; const s = r.n === 1 ? t('tasks.rep.' + r.unit + '1') : t('tasks.rep.' + r.unit + 'n', { n: r.n }); return /^tasks\./.test(s) ? '' : s; };
  function tasksCard(k) {
    const list = tasksFor(k), done = list.filter((x) => x.done).length;
    const isToday = k === D.today();
    const p = D.nowTz(), nowMin = p.h * 60 + p.min;
    const mins = (hm) => { const m = /^(\d{1,2}):(\d{2})$/.exec(hm || ''); return m ? +m[1] * 60 + +m[2] : null; };
    // keyingi vazifa — bugungi, vaqti hali kelmagan, eng yaqini
    let next = null;
    if (isToday) for (const x of list) { const m = mins(x.time); if (!x.done && x.date === k && m != null && m > nowMin && (!next || m < mins(next.time))) next = x; }
    const goals = {}; for (const g of D.S.goals || []) goals[g.id] = g;
    const rows = list.map((x) => {
      const m = mins(x.time);
      const late = !x.done && (x.date < k || (isToday && m != null && m < nowMin));
      const g = x.goalId ? goals[x.goalId] : null;
      const rep = repLabel(x.repeat);
      const meta = [
        x.time ? `<span class="td-tk-tm num">${D.ic('clock', 13)} ${esc(x.time)}</span>` : (x.date < k ? `<span class="td-tk-tm num">${esc(D.fmtDate(x.date))}</span>` : ''),
        late ? `<span class="td-tag late">${esc(t('today.tk.late'))}</span>` : '',
        !x.done && (x.priority || 2) >= 3 ? `<span class="td-tag imp">${esc(t('today.tk.imp'))}</span>` : '',
        g ? `<span class="td-tag">${esc(t('dir.' + g.dir))}</span>` : '',
        rep ? `<span class="td-tk-rep">${esc(rep)}</span>` : '',
      ].join('');
      return `<div class="td-tk${x.done ? ' done' : ''}">
        <button type="button" class="td-tk-c${x.done ? ' on' : ''}" data-act="tdTask" data-id="${esc(x.id)}" role="checkbox" aria-checked="${x.done ? 'true' : 'false'}" aria-label="${esc(x.text)}"><i>${x.done ? D.ic('check', 16) : ''}</i></button>
        <div class="td-tk-b"><div class="td-tk-t"><span>${esc(x.text)}</span>${next && next.id === x.id ? `<span class="td-tag next num">${esc(t('today.tk.in', { t: D.fmtMins(m - nowMin) }))}</span>` : ''}</div>
          ${meta ? `<div class="td-tk-m">${meta}</div>` : ''}</div></div>`;
    }).join('');
    return `<section class="card td-tasks">
      <div class="card-head"><h2 class="title">${esc(t('today.tk.title'))}</h2>${list.length ? `<span class="td-cnt num">${esc(t('today.hb.count', { a: done, b: list.length }))}</span>` : ''}</div>
      ${rows || `<p class="card-sub">${esc(t('today.tk.empty'))}</p>`}
      <div class="td-tk-f">
        <button type="button" class="btn ghost td-tk-add" data-act="tdTaskNew">${D.ic('plus', 18)} ${esc(t('today.tk.add'))}</button>
        <button type="button" class="td-more" data-act="go" data-view="tasks" data-sub="tasks">${esc(t('today.tk.all'))} ${D.ic('chevR', 16)}</button>
      </div>
    </section>`;
  }
  /* Belgilash Vazifa bo'limining O'Z amali orqali (tkToggle): takrorlanuvchi
     vazifaning keyingisini tug'dirish, doneAt (ms) va bekor qilish — hammasi
     o'sha yerda. Modul kechiktirib yuklanadi, shuning uchun avval olib kelinadi. */
  let taskBusy = false;
  D.act.tdTask = (el) => {
    // modul hali yuklanayotganda ikkinchi bosish belgini qaytarib, takroriy vazifaning nusxasini qoldirardi
    if (taskBusy) return;
    taskBusy = true;
    const done = () => { taskBusy = false; };
    Promise.resolve(D.loadView('tasks')).then(() => { if (D.act.tkToggle) D.act.tkToggle(el); else D.toast(t('error.action')); }).then(done, done);
  };
  D.act.tdTaskNew = () => viaView('habits', 'hbAddTask');

  /* ------------------------------------------------------------------ */
  /* 7. YIL MAQSADLARI                                                    */
  /* Foiz — maqsadga bog'langan vazifalarning nechtasi bajarilgani        */
  /* (Vazifa › Maqsad sahifasidagi «3/5» ning o'zi).                      */
  /* ------------------------------------------------------------------ */
  function goalsCard(k) {
    const y = k.slice(0, 4);
    const all = (D.S.goals || []).filter((g) => !g.year || String(g.year) === y);
    if (!all.length) return '';
    const list = all.filter((g) => !g.done).sort((a, b) => (b.priority || 2) - (a.priority || 2)).slice(0, 3);
    if (!list.length) return '';
    const links = {};
    for (const x of D.S.tasks) if (x.goalId) (links[x.goalId] || (links[x.goalId] = [])).push(x);
    const rows = list.map((g) => {
      const l = links[g.id] || [], tot = l.length, dn = l.filter((x) => x.done).length;
      const note = !tot ? t('today.gl.noTasks') : dn === tot ? t('today.gl.allDone') : t('today.gl.left', { n: tot - dn });
      return `<button type="button" class="td-gl d-${D.DIRS.includes(g.dir) ? g.dir : 'shaxsiy'}" data-act="go" data-view="tasks" data-sub="goals">
        <span class="td-gl-h"><b>${esc(g.text)}</b><span class="num">${tot ? `${dn} / ${tot}` : '—'}</span></span>
        <span class="bar"><i class="bar-fill" style="width:${tot ? (dn / tot * 100).toFixed(0) : 0}%"></i></span>
        <span class="td-gl-m"><span class="td-tag dir">${esc(t('dir.' + g.dir))}</span><span>${esc(note)}</span></span></button>`;
    }).join('');
    return `<section class="card td-goals">
      <div class="card-head"><h2 class="title">${esc(t('today.gl.title', { y }))}</h2>
        <button type="button" class="td-more" data-act="go" data-view="tasks" data-sub="goals">${esc(t('today.tk.all'))}</button></div>
      ${rows}
    </section>`;
  }

  const wrapRow = () => `<button type="button" class="card td-wrapbtn" data-act="tdWrap"><span class="ico">${D.ic('edit', 17)}</span>
      <span class="td-wrapbtn-t"><b>${esc(t('today.wrap'))}</b><span>${esc(t('today.wrap.sub'))}</span></span>${D.ic('chevR', 18)}</button>`;

  function addRow(date, ph, act) {
    return `<div class="input-row td-add"><input class="inp" data-enter="${act}" data-date="${date}" placeholder="${esc(ph)}" autocomplete="off" enterkeyhint="done">
      <button class="btn sq" data-act="${act}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button></div>`;
  }

  /* 7. daily note                                                       */
  /* ------------------------------------------------------------------ */
  const saveNote = D.debounce(() => D.save(), 300);
  D.act.tdNote = (el) => {
    const k = el.dataset.key || key();
    const v = el.value || '';
    if (v.trim()) D.S.notes[k] = v; else delete D.S.notes[k];
    saveNote();
    D.patch('tdNoteCount', esc(t('today.words', { n: words(v) })));
  };

  /* ------------------------------------------------------------------ */
  /* 8. gratitude                                                        */
  /* ------------------------------------------------------------------ */
  /* ---------------------------------------------------------------- */
  /* KUN YAKUNI — kunlik izoh va shukr bitta kartada                     */
  /* ---------------------------------------------------------------- */
  function gratBody(k) {
    const all = D.S.gratitude || [];
    const today = [];
    for (let i = all.length - 1; i >= 0; i--) if (all[i].date === k) today.push(all[i]);
    let insp = '';
    if (!today.length) {
      // avval "shu kuni" (boshqa yildagi o'sha oy-kun), bo'lmasa kunga bog'langan barqaror tanlov
      const md = k.slice(5);
      const older = [], same = [];
      for (const g of all) { if (!g.text || g.date === k) continue; older.push(g); if (g.date && g.date.slice(5) === md) same.push(g); }
      const pool = same.length ? same : older;
      if (pool.length) {
        const g = pool[hashStr(k) % pool.length];
        insp = `<div class="td-insp"><div class="eyebrow">${D.ic('sparkles', 11)} ${esc(t(same.length ? 'today.gratOnThisDay' : 'today.gratEarlier'))}${g.date ? ` · ${esc(D.fmtDate(g.date, 'long'))}` : ''}</div><div class="td-insp-text">${esc(g.text)}</div></div>`;
      }
    }
    return `<div class="td-wrap-head"><div class="title">${D.ic('hands', 16)} ${esc(t('today.gratitude'))}</div><span class="small muted num">${today.length}</span></div>
      ${insp}
      <div class="list">${today.length ? today.map((g) => `<div class="li"><span class="td-grat-ic">${D.ic('heart', 14)}</span><div class="li-body"><div class="li-text">${esc(g.text)}</div></div>
        <button class="li-del" data-act="tdGratDel" data-id="${esc(g.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>`).join('') : insp ? '' : `<div class="empty">${esc(t('today.gratEmpty'))}</div>`}</div>
      ${addRow(k, t('today.gratPh'), 'tdAddGrat')}`;
  }
  /* Kun yakuni — kunda bir marta, kechqurun ochiladigan narsa. Sahifada doim
     turgani uchun har kirganda ko'zga tashlanardi va sahifani cho'zardi; endi
     ro'yxat ostidagi bitta qatordan chiqadi. */
  function wrapBody(k) {
    const note = D.S.notes[k] || '';
    return `<textarea class="ta" data-input="tdNote" data-key="${k}" placeholder="${esc(t('today.notePh'))}" rows="4">${esc(note)}</textarea>
      <div class="small muted num td-wrap-count" id="tdNoteCount">${esc(t('today.words', { n: words(note) }))}</div>
      <div class="td-wrap-sep"></div>
      ${gratBody(k)}`;
  }
  D.act.tdWrap = () => {
    const k = key();
    D.sheet(wrapBody(k), { title: t('today.wrap') + ' · ' + D.fmtDate(k, 'weekday'), noFocus: true });
  };
  // Shukr qo'shilgach oyna o'z ichini yangilaydi — sahifa emas, oyna ochiq turibdi
  const wrapRefresh = () => { const b = D.$('#sheet .sheet-body'); if (b) b.innerHTML = wrapBody(key()); };
  D.act.tdAddGrat = (el) => {
    const inp = el.matches('input') ? el : el.closest('.input-row').querySelector('input');
    const text = (inp.value || '').trim();
    if (!text) return;
    D.S.gratitude.push({ id: D.uid('gr'), date: inp.dataset.date || key(), text });
    inp.value = '';
    haptic(); D.save(); wrapRefresh();
  };
  D.act.tdGratDel = (el) => { D.remove(D.S.gratitude, el.dataset.id, { label: t('today.gratDeleted') }); wrapRefresh(); };

  D.act.tdPickDay = (el) => {
    const day = el.dataset.key;
    if (!day || day > D.today()) return;
    D.ui.viewDate = day === D.today() ? null : day;
    D.saveUi(); haptic(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* live updates                                                        */
  /* ------------------------------------------------------------------ */
  D.on('day:changed', () => { D.ui.viewDate = null; D.saveUi(); if (D.current() === 'today') D.rerender(); });
  // a prayer habit ticked on the Vazifa board (or any other view) mirrors into S.prayers like a Bugun tick; the emitter saves afterwards
  D.on('habit:toggled', (e) => { if (e && e.habit && e.day) syncPrayerFromHabit(e.day, e.habit.id, !!e.on); });
  // keyboard: core delegates clicks only — bosh karta sarlavhasi <div>, uni Enter/Space bilan ham ochish kerak
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== 'today' || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.td-hero-h[data-act]')) return;
    ev.preventDefault();
    el.click();
  });

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  function greeting() {
    const h = D.nowTz().h;
    return t(h >= 4 && h < 11 ? 'today.hi.morning' : h >= 11 && h < 18 ? 'today.hi.day' : 'today.hi.evening');
  }
  D.view({
    id: 'today', icon: 'calendar', order: 10, nav: true, primary: true,
    title() { return key() === D.today() ? greeting() : D.t('nav.today'); },
    subtitle() { const k = key(); return esc(D.fmtDate(k, 'weekday')) + (k === D.today() ? '' : ` · <button class="top-link" data-act="tdToday">${esc(t('btn.today'))}</button>`); },
    render() {
      const td = D.today();
      if (D.ui.viewDate && D.ui.viewDate >= td) { D.ui.viewDate = null; D.saveUi(); }
      const k = key();
      const i = dayRec(k);
      // WHOOP qismi: ma'lumot bo'lsa uch karta, bo'lmasa bitta «ulanmagan» kartasi.
      const body = i ? safe(() => heroCard(i, k)) + safe(() => sleepCard(i, k)) + safe(() => strainCard(i, k)) : safe(() => noWhoopCard(k));
      // Daraja faqat bugungi kunda: o'tgan kunni ochganda «bugungi ochko» yolg'on bo'lardi.
      const lv = k === td && D.levels ? safe(() => levelCard()) : '';
      return `<div class="td">${body}${lv}${safe(() => habitsCard(k))}${safe(() => tasksCard(k))}${safe(() => goalsCard(k))}${wrapRow()}</div>`;
    },
  });
})();
