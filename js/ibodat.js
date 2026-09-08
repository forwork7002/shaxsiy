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
      'ib.per': 'Namozlar kesimida', 'ib.per.sub': "so'nggi 30 kun", 'ib.per.weak': 'Eng zaif: **{n}**',
      'ib.per.none': "Hali yetarli qayd yo'q", 'ib.per.ontime': "o'z vaqtida",
      'ib.st.jamaat': 'Jamoat', 'ib.st.alone': 'Yakka', 'ib.st.qaza': 'Qazo', 'ib.st.missed': "O'tkazib",
      'ib.qazaHint': 'qazo?',
      'ib.last30': "So'nggi 30 kun", 'ib.heatJamaat': 'Jamoat ulushi (kunlik)', 'ib.streak5': '5 vaqt seriyasi', 'ib.jamaat': 'Jamoat', 'ib.ontime': "O'z vaqtida",
      'ib.tasbih': 'Tasbeh', 'ib.rounds': '{n} davra', 'ib.prevDay': 'Oldingi kun', 'ib.nextDay': 'Keyingi kun', 'ib.tapHint': 'Sanash uchun bosing', 'ib.custom': 'Boshqa…', 'ib.customPh': 'Zikr nomi',
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
      'ib.per': 'Намозлар кесимида', 'ib.per.sub': 'сўнгги 30 кун', 'ib.per.weak': 'Энг заиф: **{n}**',
      'ib.per.none': 'Ҳали етарли қайд йўқ', 'ib.per.ontime': 'ўз вақтида',
      'ib.st.jamaat': 'Жамоат', 'ib.st.alone': 'Якка', 'ib.st.qaza': 'Қазо', 'ib.st.missed': 'Ўтказиб',
      'ib.qazaHint': 'қазо?',
      'ib.last30': 'Сўнгги 30 кун', 'ib.heatJamaat': 'Жамоат улуши (кунлик)', 'ib.streak5': '5 вақт серияси', 'ib.jamaat': 'Жамоат', 'ib.ontime': 'Ўз вақтида',
      'ib.tasbih': 'Тасбеҳ', 'ib.rounds': '{n} давра', 'ib.prevDay': 'Олдинги кун', 'ib.nextDay': 'Кейинги кун', 'ib.tapHint': 'Санаш учун босинг', 'ib.custom': 'Бошқа…', 'ib.customPh': 'Зикр номи',
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
      'ib.per': 'По намазам', 'ib.per.sub': 'последние 30 дн.', 'ib.per.weak': 'Слабее всего: **{n}**',
      'ib.per.none': 'Пока недостаточно записей', 'ib.per.ontime': 'вовремя',
      'ib.st.jamaat': 'Джамаат', 'ib.st.alone': 'Один', 'ib.st.qaza': 'Каза', 'ib.st.missed': 'Пропущен',
      'ib.qazaHint': 'каза?',
      'ib.last30': 'Последние 30 дней', 'ib.heatJamaat': 'Доля джамаата (по дням)', 'ib.streak5': 'Серия 5/5', 'ib.jamaat': 'Джамаат', 'ib.ontime': 'Вовремя',
      'ib.tasbih': 'Тасбих', 'ib.rounds': 'круг ×{n}', 'ib.prevDay': 'Предыдущий день', 'ib.nextDay': 'Следующий день', 'ib.tapHint': 'Нажмите, чтобы считать', 'ib.custom': 'Другой…', 'ib.customPh': 'Название зикра',
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

  /* Qazo — a full per-prayer debt ledger with its own tab. */
  D.i18n.add({
    uz: {
      'ib.sub.qaza': 'Qazo',
      'qz.title': 'Qazo daftari', 'qz.debt': 'namoz qarzi', 'qz.debtShort': 'Qazo qarzi',
      'qz.daysWorth': '≈ {n} kunlik namoz', 'qz.free': "Qazo qarzi yo'q", 'qz.freeSub': 'Alhamdulillah — daftar toza',
      'qz.todayDone': 'Bugun o‘qildi', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'Bugungi reja bajarildi',
      'qz.pay': 'Qazo o‘qish', 'qz.paySub': 'O‘qigan qazoyingizni shu yerda belgilang',
      'qz.owedN': '{n} ta qarz', 'qz.noneOwed': 'qarz yo‘q', 'qz.oneDay': 'Bir kunlik (5 vaqt)',
      'qz.added': '{p} qazosi qayd etildi', 'qz.removed': 'Qayd olib tashlandi', 'qz.nothingOwed': 'Bu namozda qarz yo‘q',
      'qz.dayAdded': 'Bir kunlik qazo qayd etildi',
      'qz.trend': 'Qarz kamayishi', 'qz.trendSub': 'so‘nggi {n} kun', 'qz.was': '{n} kun oldin', 'qz.now': 'Hozir', 'qz.change': 'O‘zgarish',
      'qz.trendDown': 'Qarz kamayyapti — davom eting', 'qz.trendUp': 'Qarz o‘syapti', 'qz.trendFlat': 'Qarz o‘zgarmadi',
      'qz.pace': 'To‘lov sur‘ati', 'qz.paceSub': 'kunlik qazo, so‘nggi 30 kun',
      'qz.p7': '7 kun', 'qz.p30': '30 kun', 'qz.avg': 'Kuniga', 'qz.streak': 'Seriya',
      'qz.eta': 'Tugash muddati', 'qz.etaAt': '{d} ga tugaydi', 'qz.etaIn': '{n} kun qoldi', 'qz.etaYears': '~{n} yil',
      'qz.etaNone': 'Hali sur‘at yo‘q — bugundan boshlang', 'qz.etaTarget': 'Kuniga {t} tadan — {d}',
      'qz.per': 'Namozlar kesimida', 'qz.perSub': 'to‘langan / jami', 'qz.owed': 'Qarz', 'qz.paidAll': 'To‘langan', 'qz.totalAll': 'Jami',
      'qz.setup': 'Boshlang‘ich qarz', 'qz.setupSub': 'Kuzatuvdan oldingi qazolaringiz sonini kiriting',
      'qz.byYears': 'Yillar bo‘yicha hisoblash', 'qz.yearsQ': 'Necha yil namoz qazo bo‘lgan?', 'qz.yearsPh': 'masalan: 3',
      'qz.yearsSet': '{y} yil = har bir namozdan {n} ta', 'qz.target': 'Kunlik reja', 'qz.targetHint': 'Kuniga nechta qazo o‘qiysiz',
      'qz.reset': 'Daftarni tozalash', 'qz.resetQ': 'Butun qazo daftari o‘chiriladi. Davom etamizmi?', 'qz.resetDone': 'Qazo daftari tozalandi',
      'qz.logged': 'Qaydlardan', 'qz.baseLabel': 'Boshlang‘ich',
      'qz.remind': 'Qazo: {n} ta · bugun {d}/{t}', 'qz.remindGo': 'Ochish', 'qz.remindDone': 'Qazo: {n} · bugungi reja bajarildi',
      'qz.calendar': 'To‘lov kalendari', 'qz.calSub': 'so‘nggi 12 hafta · kuniga o‘qilgan qazo',
      'qz.matrix': 'Namoz matritsasi', 'qz.matrixSub': 'so‘nggi 8 hafta · har bir vaqt alohida',
      'qz.mxNone': 'Hali qayd yo‘q — «Qayd» bo‘limidan boshlang',
      'qz.q1': 'Bugun', 'qz.hist': 'Tarix',
      'qz.start': 'Qazo daftari bo‘sh', 'qz.startSub': 'Quyida boshlang‘ich qarzingizni kiriting — keyin har kuni belgilab borasiz',
    },
    uzk: {
      'ib.sub.qaza': 'Қазо',
      'qz.title': 'Қазо дафтари', 'qz.debt': 'намоз қарзи', 'qz.debtShort': 'Қазо қарзи',
      'qz.daysWorth': '≈ {n} кунлик намоз', 'qz.free': 'Қазо қарзи йўқ', 'qz.freeSub': 'Алҳамдулиллаҳ — дафтар тоза',
      'qz.todayDone': 'Бугун ўқилди', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'Бугунги режа бажарилди',
      'qz.pay': 'Қазо ўқиш', 'qz.paySub': 'Ўқиган қазойингизни шу ерда белгиланг',
      'qz.owedN': '{n} та қарз', 'qz.noneOwed': 'қарз йўқ', 'qz.oneDay': 'Бир кунлик (5 вақт)',
      'qz.added': '{p} қазоси қайд этилди', 'qz.removed': 'Қайд олиб ташланди', 'qz.nothingOwed': 'Бу намозда қарз йўқ',
      'qz.dayAdded': 'Бир кунлик қазо қайд этилди',
      'qz.trend': 'Қарз камайиши', 'qz.trendSub': 'сўнгги {n} кун', 'qz.was': '{n} кун олдин', 'qz.now': 'Ҳозир', 'qz.change': 'Ўзгариш',
      'qz.trendDown': 'Қарз камаяпти — давом этинг', 'qz.trendUp': 'Қарз ўсяпти', 'qz.trendFlat': 'Қарз ўзгармади',
      'qz.pace': 'Тўлов суръати', 'qz.paceSub': 'кунлик қазо, сўнгги 30 кун',
      'qz.p7': '7 кун', 'qz.p30': '30 кун', 'qz.avg': 'Кунига', 'qz.streak': 'Серия',
      'qz.eta': 'Тугаш муддати', 'qz.etaAt': '{d} га тугайди', 'qz.etaIn': '{n} кун қолди', 'qz.etaYears': '~{n} йил',
      'qz.etaNone': 'Ҳали суръат йўқ — бугундан бошланг', 'qz.etaTarget': 'Кунига {t} тадан — {d}',
      'qz.per': 'Намозлар кесимида', 'qz.perSub': 'тўланган / жами', 'qz.owed': 'Қарз', 'qz.paidAll': 'Тўланган', 'qz.totalAll': 'Жами',
      'qz.setup': 'Бошланғич қарз', 'qz.setupSub': 'Кузатувдан олдинги қазоларингиз сонини киритинг',
      'qz.byYears': 'Йиллар бўйича ҳисоблаш', 'qz.yearsQ': 'Неча йил намоз қазо бўлган?', 'qz.yearsPh': 'масалан: 3',
      'qz.yearsSet': '{y} йил = ҳар бир намоздан {n} та', 'qz.target': 'Кунлик режа', 'qz.targetHint': 'Кунига нечта қазо ўқийсиз',
      'qz.reset': 'Дафтарни тозалаш', 'qz.resetQ': 'Бутун қазо дафтари ўчирилади. Давом этамизми?', 'qz.resetDone': 'Қазо дафтари тозаланди',
      'qz.logged': 'Қайдлардан', 'qz.baseLabel': 'Бошланғич',
      'qz.remind': 'Қазо: {n} та · бугун {d}/{t}', 'qz.remindGo': 'Очиш', 'qz.remindDone': 'Қазо: {n} · бугунги режа бажарилди',
      'qz.calendar': 'Тўлов календари', 'qz.calSub': 'сўнгги 12 ҳафта · кунига ўқилган қазо',
      'qz.matrix': 'Намоз матрицаси', 'qz.matrixSub': 'сўнгги 8 ҳафта · ҳар бир вақт алоҳида',
      'qz.mxNone': 'Ҳали қайд йўқ — «Қайд» бўлимидан бошланг',
      'qz.q1': 'Бугун', 'qz.hist': 'Тарих',
      'qz.start': 'Қазо дафтари бўш', 'qz.startSub': 'Қуйида бошланғич қарзингизни киритинг — кейин ҳар куни белгилаб борасиз',
    },
    ru: {
      'ib.sub.qaza': 'Каза',
      'qz.title': 'Учёт каза', 'qz.debt': 'намазов долга', 'qz.debtShort': 'Долг каза',
      'qz.daysWorth': '≈ {n} дней намазов', 'qz.free': 'Долга каза нет', 'qz.freeSub': 'Альхамдулиллях — учёт чист',
      'qz.todayDone': 'Восполнено сегодня', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'План на сегодня выполнен',
      'qz.pay': 'Восполнение каза', 'qz.paySub': 'Отмечайте здесь восполненные намазы',
      'qz.owedN': 'долг {n}', 'qz.noneOwed': 'долга нет', 'qz.oneDay': 'Целый день (5 намазов)',
      'qz.added': '{p} — каза записана', 'qz.removed': 'Запись убрана', 'qz.nothingOwed': 'По этому намазу долга нет',
      'qz.dayAdded': 'Записан день каза',
      'qz.trend': 'Снижение долга', 'qz.trendSub': 'последние {n} дн.', 'qz.was': '{n} дн. назад', 'qz.now': 'Сейчас', 'qz.change': 'Изменение',
      'qz.trendDown': 'Долг снижается — продолжайте', 'qz.trendUp': 'Долг растёт', 'qz.trendFlat': 'Долг без изменений',
      'qz.pace': 'Темп восполнения', 'qz.paceSub': 'каза в день, последние 30 дн.',
      'qz.p7': '7 дней', 'qz.p30': '30 дней', 'qz.avg': 'В день', 'qz.streak': 'Серия',
      'qz.eta': 'Срок завершения', 'qz.etaAt': 'завершение {d}', 'qz.etaIn': 'осталось {n} дн.', 'qz.etaYears': '~{n} лет',
      'qz.etaNone': 'Темпа пока нет — начните сегодня', 'qz.etaTarget': 'По {t} в день — {d}',
      'qz.per': 'По намазам', 'qz.perSub': 'восполнено / всего', 'qz.owed': 'Долг', 'qz.paidAll': 'Восполнено', 'qz.totalAll': 'Всего',
      'qz.setup': 'Начальный долг', 'qz.setupSub': 'Укажите число каза до начала учёта',
      'qz.byYears': 'Расчёт по годам', 'qz.yearsQ': 'Сколько лет намазы были пропущены?', 'qz.yearsPh': 'например: 3',
      'qz.yearsSet': '{y} г. = по {n} на каждый намаз', 'qz.target': 'Дневной план', 'qz.targetHint': 'Сколько каза в день вы читаете',
      'qz.reset': 'Очистить учёт', 'qz.resetQ': 'Весь учёт каза будет удалён. Продолжить?', 'qz.resetDone': 'Учёт каза очищен',
      'qz.logged': 'Из журнала', 'qz.baseLabel': 'Начальный',
      'qz.remind': 'Каза: {n} · сегодня {d}/{t}', 'qz.remindGo': 'Открыть', 'qz.remindDone': 'Каза: {n} · план на сегодня выполнен',
      'qz.calendar': 'Календарь восполнения', 'qz.calSub': 'последние 12 недель · каза в день',
      'qz.matrix': 'Матрица намазов', 'qz.matrixSub': 'последние 8 недель · каждый намаз отдельно',
      'qz.mxNone': 'Записей пока нет — начните в разделе «Журнал»',
      'qz.q1': 'Сегодня', 'qz.hist': 'История',
      'qz.start': 'Учёт каза пуст', 'qz.startSub': 'Укажите ниже начальный долг — дальше отмечайте каждый день',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const PR = D.PRAYERS;
  const STATES = ['jamaat', 'alone', 'qaza', 'missed'];
  const SUBS = ['times', 'log', 'qaza', 'tasbih', 'fasting', 'qibla'];
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
  /* ==================================================================== */
  /* QAZO ENGINE                                                          */
  /*   owed(p) = base(p) + every 'missed' in the journal − every repayment */
  /*   Repayments are dated, so pace, trend and a finish date fall out of  */
  /*   the same ledger instead of being guessed.                          */
  /* ==================================================================== */
  const ZERO = () => ({ bomdod: 0, peshin: 0, asr: 0, shom: 0, xufton: 0 });
  const int = (v) => Math.max(0, Math.floor(+v || 0));
  const HIJRI_YEAR = 354; // a lunar year — the unit qaza is normally counted in
  let qzMigrated = false;
  // eta dates land years out, so they must carry the year
  const qzDate = (k) => { const { y, m, d } = D.parseKey(k); const sep = D.t('date.sep') === 'date.sep' ? '-' : D.t('date.sep'); return `${d}${sep}${D.t('months')[m - 1]} ${y}`; };

  function QZ() {
    let q = D.S.prayers._qaza;
    if (!q || typeof q !== 'object') q = D.S.prayers._qaza = {};
    if (!q.base || typeof q.base !== 'object') q.base = ZERO();
    if (!q.pay || typeof q.pay !== 'object') q.pay = {};
    // Legacy shape { paid: n } was an untyped counter. Spread it evenly over the
    // five prayers on today's date so the total survives and the ledger gains a date.
    const legacy = int(q.paid);
    if (legacy) {
      const k = D.today();
      const day = q.pay[k] && typeof q.pay[k] === 'object' ? q.pay[k] : (q.pay[k] = {});
      const per = Math.floor(legacy / 5), rem = legacy % 5;
      PR.forEach((p, i) => { day[p] = int(day[p]) + per + (i < rem ? 1 : 0); });
      delete q.paid;
      // bump the signature in this same tick, or the memoised scan below would
      // still be answering with the pre-migration numbers
      if (!qzMigrated) { qzMigrated = true; D.S.meta.updatedAt = Math.max(Date.now(), (D.S.meta.updatedAt || 0) + 1); setTimeout(() => D.save(), 0); }
    }
    return q;
  }

  // One pass over the journal and the ledger; everything below reads this.
  function qzScan() {
    return memo('qzScan', stateSig(), () => {
      const missed = ZERO(), paid = ZERO(), missedDay = {}, payDay = {};
      for (const k of Object.keys(D.S.prayers)) {
        if (!isDay(k)) continue;
        const o = D.S.prayers[k]; if (!o || typeof o !== 'object') continue;
        let n = 0;
        for (const p of PR) if (o[p] === 'missed') { missed[p]++; n++; }
        if (n) missedDay[k] = n;
      }
      const pay = QZ().pay;
      for (const k of Object.keys(pay)) {
        if (!isDay(k)) continue;
        const d = pay[k]; if (!d || typeof d !== 'object') continue;
        let n = 0;
        for (const p of PR) { const v = int(d[p]); if (v) { paid[p] += v; n += v; } }
        if (n) payDay[k] = n;
      }
      return { missed, paid, missedDay, payDay };
    });
  }
  function qzOwed() {
    const s = qzScan(), b = QZ().base;
    const o = ZERO(); let total = 0, base = 0, all = 0;
    for (const p of PR) {
      const bp = int(b[p]);
      o[p] = Math.max(0, bp + s.missed[p] - s.paid[p]);
      base += bp; total += o[p]; all += bp + s.missed[p];
    }
    return { per: o, total, base, all, paid: PR.reduce((a, p) => a + s.paid[p], 0) };
  }
  const qzPaidOn = (k) => { const d = QZ().pay[k]; if (!d || typeof d !== 'object') return 0; let n = 0; for (const p of PR) n += int(d[p]); return n; };
  const qzTarget = () => { const v = int(QZ().target); return v > 0 ? Math.min(v, 200) : 5; };

  // Debt as it stood on each of the last n days — walked forward once.
  function qzSeries(n) {
    const days = D.lastDays(n), s = qzScan(), o = qzOwed();
    let run = o.base;
    for (const k in s.missedDay) if (k < days[0]) run += s.missedDay[k];
    for (const k in s.payDay) if (k < days[0]) run -= s.payDay[k];
    return days.map((k) => { run += (s.missedDay[k] || 0) - (s.payDay[k] || 0); return Math.max(0, run); });
  }
  function qzPace() {
    const sum = (arr) => arr.reduce((a, k) => a + qzPaidOn(k), 0);
    const p7 = sum(D.lastDays(7)), p30 = sum(D.lastDays(30));
    return { p7, p30, rate: p30 ? p30 / 30 : p7 ? p7 / 7 : 0 };
  }
  const qzStreak = () => memo('qzStreak', stateSig(), () => {
    const set = new Set();
    for (const k of Object.keys(QZ().pay)) if (isDay(k) && qzPaidOn(k) > 0) set.add(k);
    return D.streak(set);
  });
  // Finish date at a given per-day rate; null when the rate is zero or the horizon is absurd.
  function qzEta(rate) {
    const owed = qzOwed().total;
    if (!owed || !(rate > 0)) return null;
    const days = Math.ceil(owed / rate);
    if (days > 365 * 60) return { days, years: Math.round(days / 365), far: true };
    return { days, years: Math.round((days / 365) * 10) / 10, date: D.addDays(D.today(), days), far: false };
  }

  /* Shared with today.js — the reminder needs the same numbers, not its own copy. */
  D.qaza = {
    owed: () => qzOwed(),
    paidToday: () => qzPaidOn(D.today()),
    target: qzTarget,
    pace: qzPace,
    streak: qzStreak,
  };

  /* ------------------------------------------------------------------ */
  /* qaza — cards                                                        */
  /* ------------------------------------------------------------------ */
  const PCOLOR = { bomdod: 'var(--info)', peshin: 'var(--success)', asr: 'var(--warning)', shom: 'var(--violet)', xufton: 'var(--danger-text)' };

  function qzHero() {
    const o = qzOwed(), td = qzTarget(), done = qzPaidOn(D.today());
    if (!o.total) {
      const fresh = !o.all && !o.paid;   // nothing declared, nothing logged, nothing repaid
      return `<div class="hero ib-qz-hero zero">
        <div class="ib-qz-free ${fresh ? 'fresh' : ''}">${D.ic(fresh ? 'flag' : 'check', 30)}</div>
        <div class="ib-qz-free-t">${esc(t(fresh ? 'qz.start' : 'qz.free'))}</div>
        <div class="small muted">${esc(t(fresh ? 'qz.startSub' : 'qz.freeSub'))}</div>
        ${o.paid ? `<div class="ib-qz-freestat num">${D.fmtNum(o.paid)} <span>${esc(t('qz.paidAll'))}</span></div>` : ''}
      </div>`;
    }
    const parts = PR.filter((p) => o.per[p] > 0).map((p) => ({ v: o.per[p], color: PCOLOR[p], label: `${t('prayer.' + p)}: ${o.per[p]}` }));
    const cleared = o.all ? Math.round((o.paid / o.all) * 100) : 0;
    const donut = D.chart.donut({ parts, size: 108, stroke: 13, center: `<span class="ib-qz-dn">${cleared}%</span><span class="ib-qz-dl">${esc(t('qz.paidAll'))}</span>` });
    const pct = D.clamp((done / td) * 100, 0, 100);
    const legend = PR.map((p) => `<span class="ib-qz-lg"><i style="background:${PCOLOR[p]}"></i>${esc(t('prayer.' + p))}<b class="num">${D.fmtNum(o.per[p])}</b></span>`).join('');
    return `<div class="hero ib-qz-hero">
      <div class="ib-qz-top">
        <div class="ib-qz-main">
          <div class="eyebrow">${esc(t('qz.debtShort'))}</div>
          <div class="ib-qz-num num">${D.fmtNum(o.total)}</div>
          <div class="ib-qz-unit">${esc(t('qz.debt'))}</div>
          <div class="ib-qz-sub num">${esc(t('qz.daysWorth', { n: D.fmtNum(Math.ceil(o.total / 5)) }))}</div>
        </div>
        ${donut}
      </div>
      <div class="ib-qz-legend">${legend}</div>
      <div class="ib-qz-today ${done >= td ? 'met' : ''}">
        <div class="row between"><span class="eyebrow">${esc(t('qz.todayDone'))}</span><span class="num ib-qz-tn">${esc(t('qz.ofTarget', { n: done, t: td }))}</span></div>
        <span class="bar thick mt-s"><i class="bar-fill" style="width:${pct.toFixed(1)}%"></i></span>
        ${done >= td ? `<div class="small good mt-s">${D.ic('check', 13)} ${esc(t('qz.targetMet'))}</div>` : ''}
      </div>
    </div>`;
  }

  function qzPayCard() {
    const o = qzOwed(), k = D.today();
    const day = QZ().pay[k] || {};
    const mx = Math.max(1, ...PR.map((p) => o.per[p]));
    const rows = PR.map((p) => {
      const owed = o.per[p], n = int(day[p]);
      return `<div class="ib-qz-row ${owed ? '' : 'clear'}">
        <span class="ib-qz-name">${esc(t('prayer.' + p))}</span>
        <span class="ib-qz-bar"><i style="width:${((owed / mx) * 100).toFixed(1)}%;background:${PCOLOR[p]}"></i></span>
        <span class="ib-qz-owed num">${owed ? D.fmtNum(owed) : '—'}</span>
        <span class="ib-qz-step">
          <button class="ib-qz-b" data-act="ibQzUnpay" data-id="${p}" ${n ? '' : 'disabled'} aria-label="−1">${D.ic('minus', 14)}</button>
          <b class="num ${n ? 'on' : ''}">${n}</b>
          <button class="ib-qz-b add" data-act="ibQzPay" data-id="${p}" ${owed ? '' : 'disabled'} aria-label="+1">${D.ic('plus', 14)}</button>
        </span>
      </div>`;
    }).join('');
    const canDay = PR.every((p) => o.per[p] > 0);
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.pay'))}</div><div class="title">${esc(D.fmtDate(k, 'weekday'))}</div></div>
        <span class="pill">${D.ic('clock', 12)} ${esc(t('qz.q1'))}</span></div>
      <div class="small muted mb-s">${esc(t('qz.paySub'))}</div>
      ${rows}
      <button class="btn block mt" data-act="ibQzDay" ${canDay ? '' : 'disabled'}>${D.ic('layers', 15)} ${esc(t('qz.oneDay'))}</button>
    </div>`;
  }

  function qzTrendCard() {
    const N = 90, vals = qzSeries(N);
    const now = vals[N - 1], was = vals[0], diff = now - was;
    const color = diff < 0 ? 'var(--success)' : diff > 0 ? 'var(--danger-text)' : 'var(--text3)';
    const note = diff < 0 ? t('qz.trendDown') : diff > 0 ? t('qz.trendUp') : t('qz.trendFlat');
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.trend'))}</div><div class="title">${esc(t('qz.trendSub', { n: N }))}</div></div>
        <span class="pill ${diff < 0 ? 'good' : diff > 0 ? 'bad' : ''}">${D.ic(diff <= 0 ? 'trendDown' : 'trend', 12)} ${diff > 0 ? '+' : ''}${D.fmtNum(diff)}</span></div>
      ${D.chart.spark({ values: vals, color, height: 76 })}
      <div class="stat-grid mt">
        <div class="stat"><div class="stat-num num">${D.fmtNum(was)}</div><div class="stat-label">${esc(t('qz.was', { n: N }))}</div></div>
        <div class="stat"><div class="stat-num num">${D.fmtNum(now)}</div><div class="stat-label">${esc(t('qz.now'))}</div></div>
        <div class="stat"><i class="zone ${diff < 0 ? 'z-good' : diff > 0 ? 'z-bad' : ''}"></i><div class="stat-num num">${diff > 0 ? '+' : ''}${D.fmtNum(diff)}</div><div class="stat-label">${esc(t('qz.change'))}</div></div>
      </div>
      <div class="small muted mt-s">${esc(note)}</div>
    </div>`;
  }

  function qzPaceCard() {
    const days = D.lastDays(30), vals = days.map(qzPaidOn), p = qzPace(), td = qzTarget();
    const axis = `<div class="ib-mx-axis ib-qz-axis"><span>${esc(D.fmtDate(days[0], 'dm'))}</span><span>${esc(D.fmtDate(days[14], 'dm'))}</span><span>${esc(D.fmtDate(days[29], 'dm'))}</span></div>`;
    const eta = qzEta(p.rate), etaT = qzEta(td);
    const etaLine = eta
      ? (eta.far ? esc(t('qz.etaYears', { n: D.fmtNum(eta.years) })) : `${esc(t('qz.etaAt', { d: qzDate(eta.date) }))} · ${esc(t('qz.etaIn', { n: D.fmtNum(eta.days) }))}`)
      : esc(t('qz.etaNone'));
    const target = etaT && !etaT.far ? `<div class="small muted mt-s">${D.ic('target', 13)} ${esc(t('qz.etaTarget', { t: td, d: qzDate(etaT.date) }))}</div>` : '';
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.pace'))}</div><div class="title">${esc(t('qz.paceSub'))}</div></div></div>
      ${D.chart.bars({ values: vals, color: 'var(--success)', height: 66, target: td })}${axis}
      <div class="stat-grid mt">
        <div class="stat"><div class="stat-num num">${D.fmtNum(p.p7)}</div><div class="stat-label">${esc(t('qz.p7'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.fmtNum(p.p30)}</div><div class="stat-label">${esc(t('qz.p30'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.round(p.rate, 1)}</div><div class="stat-label">${esc(t('qz.avg'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.ic('fire', 15)} ${D.fmtNum(qzStreak())}</div><div class="stat-label">${esc(t('qz.streak'))}</div></div>
      </div>
      <div class="ib-qz-eta"><div class="eyebrow">${esc(t('qz.eta'))}</div><div class="small">${etaLine}</div>${target}</div>
    </div>`;
  }

  function qzCalendarCard() {
    const days = D.lastDays(84), td = qzTarget();
    const heat = D.chart.heat({
      days,
      valueFn: (k) => { const n = qzPaidOn(k); if (!n) return 0; return D.clamp(Math.ceil((n / td) * 4), 1, 4); },
    });
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.calendar'))}</div><div class="title">${esc(t('qz.calSub'))}</div></div></div>
      ${heat}
    </div>`;
  }

  function qzPerCard() {
    const o = qzOwed(), s = qzScan(), b = QZ().base;
    const rows = PR.map((p) => {
      const all = int(b[p]) + s.missed[p], paid = s.paid[p], owed = o.per[p];
      const pct = all ? D.clamp((paid / all) * 100, 0, 100) : 0;
      return `<div class="ib-qz-per">
        <div class="row between"><span class="ib-qz-pn">${esc(t('prayer.' + p))}</span>
          <span class="num small"><b>${D.fmtNum(owed)}</b> <span class="muted">/ ${D.fmtNum(all)}</span></span></div>
        <span class="bar"><i class="bar-fill" style="width:${pct.toFixed(1)}%;background:${PCOLOR[p]}"></i></span>
        <div class="ib-qz-pmeta small muted"><span>${esc(t('qz.baseLabel'))} ${D.fmtNum(int(b[p]))}</span><span>${esc(t('qz.logged'))} ${D.fmtNum(s.missed[p])}</span><span class="good">${esc(t('qz.paidAll'))} ${D.fmtNum(paid)}</span></div>
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.per'))}</div><div class="title">${esc(t('qz.perSub'))}</div></div>
        <span class="pill">${D.fmtNum(o.paid)} / ${D.fmtNum(o.all)}</span></div>
      ${rows}
    </div>`;
  }

  function qzSetupCard() {
    const b = QZ().base, o = qzOwed();
    const inputs = PR.map((p) => `<label class="ib-qz-in"><span>${esc(t('prayer.' + p))}</span>
      <input class="inp sm num" type="number" min="0" max="99999" inputmode="numeric" value="${int(b[p])}" data-change="ibQzBase" data-id="${p}" aria-label="${esc(t('prayer.' + p))}"></label>`).join('');
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.setup'))}</div><div class="title">${esc(t('qz.setupSub'))}</div></div></div>
      <div class="ib-qz-ins">${inputs}</div>
      <button class="btn ghost block mt" data-act="ibQzYears">${D.ic('calendar', 14)} ${esc(t('qz.byYears'))}</button>
      <div class="ib-qz-target mt">
        <div class="grow"><div class="eyebrow">${esc(t('qz.target'))}</div><div class="small muted">${esc(t('qz.targetHint'))}</div></div>
        <input class="inp sm num" type="number" min="1" max="200" inputmode="numeric" value="${qzTarget()}" data-change="ibQzTarget" aria-label="${esc(t('qz.target'))}">
      </div>
      ${o.total || o.all || o.paid ? `<button class="btn ghost danger block mt" data-act="ibQzReset">${D.ic('trash', 14)} ${esc(t('qz.reset'))}</button>` : ''}
    </div>`;
  }

  function renderQaza() {
    const o = qzOwed();
    // nothing owed and nothing ever repaid → the charts would all be flat zeroes.
    // Lead straight to the one card that matters: declaring the backlog.
    if (!o.total && !o.all && !o.paid) return qzHero() + qzSetupCard();
    return qzHero() + (o.total ? qzPayCard() : '') + qzTrendCard() + qzPaceCard() + qzCalendarCard() + qzPerCard() + qzSetupCard();
  }

  /* ------------------------------------------------------------------ */
  /* qaza — actions                                                      */
  /* ------------------------------------------------------------------ */
  function qzAdd(p, n) {
    const q = QZ(), k = D.today();
    const day = q.pay[k] && typeof q.pay[k] === 'object' ? q.pay[k] : (q.pay[k] = {});
    const v = int(day[p]) + n;
    if (v > 0) day[p] = v; else delete day[p];
    if (!PR.some((x) => int(day[x]))) delete q.pay[k];
  }
  D.act.ibQzPay = (el) => {
    const p = el.dataset.id; if (!PR.includes(p)) return;
    if (qzOwed().per[p] <= 0) { D.toast(t('qz.nothingOwed')); return; }
    qzAdd(p, 1);
    haptic('success'); D.save(); D.rerender(); D.toast(t('qz.added', { p: t('prayer.' + p) }));
  };
  D.act.ibQzUnpay = (el) => {
    const p = el.dataset.id; if (!PR.includes(p)) return;
    if (!int((QZ().pay[D.today()] || {})[p])) return;
    qzAdd(p, -1);
    haptic(); D.save(); D.rerender(); D.toast(t('qz.removed'));
  };
  D.act.ibQzDay = () => {
    const o = qzOwed();
    if (!PR.every((p) => o.per[p] > 0)) return;
    for (const p of PR) qzAdd(p, 1);
    haptic('success'); D.save(); D.rerender(); D.toast(t('qz.dayAdded'));
  };
  D.act.ibQzBase = (el) => {
    const p = el.dataset.id; if (!PR.includes(p)) return;
    QZ().base[p] = D.clamp(int(el.value), 0, 99999);
    D.save(); D.rerender();
  };
  D.act.ibQzTarget = (el) => { QZ().target = D.clamp(int(el.value) || 5, 1, 200); D.save(); D.rerender(); };
  D.act.ibQzYears = async () => {
    const v = await D.prompt({ title: t('qz.yearsQ'), placeholder: t('qz.yearsPh'), value: '' });
    if (v === null) return;
    const y = Math.max(0, Math.min(80, Math.round((parseFloat(String(v).replace(',', '.')) || 0) * 10) / 10));
    if (!y) return;
    const n = Math.round(y * HIJRI_YEAR);
    const b = QZ().base;
    for (const p of PR) b[p] = D.clamp(n, 0, 99999);
    haptic('success'); D.save(); D.rerender(); D.toast(t('qz.yearsSet', { y, n: D.fmtNum(n) }));
  };
  D.act.ibQzReset = async () => {
    if (!(await D.confirm({ text: t('qz.resetQ'), danger: true }))) return;
    delete D.S.prayers._qaza;
    D.save(); D.rerender(); D.toast(t('qz.resetDone'));
  };

  /* Reminder strip — sits above every Ibodat tab while a debt is open. */
  function qzBanner() {
    const o = qzOwed(); if (!o.total) return '';
    const done = qzPaidOn(D.today()), td = qzTarget(), met = done >= td;
    return `<button class="ib-qz-remind ${met ? 'met' : ''}" data-act="sub" data-view="prayer" data-sub="qaza">
      <i class="ib-qz-rdot">${D.ic(met ? 'check' : 'alert', 15)}</i>
      <span class="ib-qz-rtext">${esc(met ? t('qz.remindDone', { n: D.fmtNum(o.total) }) : t('qz.remind', { n: D.fmtNum(o.total), d: done, t: td }))}</span>
      <span class="ib-qz-rgo">${esc(t('qz.remindGo'))} ${D.ic('chevR', 13)}</span>
    </button>`;
  }

  /* ------------------------------------------------------------------ */
  /* prayer matrix — every waqt of the last 8 weeks, one cell each        */
  /* ------------------------------------------------------------------ */
  function matrixCard() {
    const days = D.lastDays(56), td = D.today();
    let any = false;
    const rows = PR.map((p) => {
      const cells = days.map((k) => {
        const s = stateOf(k, p);
        if (s) any = true;
        return `<i class="${s ? 's-' + s : ''}" title="${k} · ${esc(t('prayer.' + p))}${s ? ' · ' + esc(t('ib.st.' + s)) : ''}"></i>`;
      }).join('');
      return `<div class="ib-mx-row"><span class="ib-mx-name">${esc(t('prayer.' + p))}</span><span class="ib-mx-cells">${cells}</span></div>`;
    }).join('');
    const legend = STATES.map((s) => `<span><i class="ib-leg ib-mx-lg s-${s}"></i>${esc(t('ib.st.' + s))}</span>`).join('');
    const axis = `<div class="ib-mx-axis"><span>${esc(D.fmtDate(days[0], 'dm'))}</span><span>${esc(D.fmtDate(td, 'dm'))}</span></div>`;
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('qz.matrix'))}</div><div class="title">${esc(t('qz.matrixSub'))}</div></div></div>
      ${any ? `<div class="ib-mx">${rows}</div>${axis}<div class="legend">${legend}</div>` : `<div class="empty">${esc(t('qz.mxNone'))}</div>`}
    </div>`;
  }

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
  // Which prayer slips most? 30 days, per prayer, with the four states.
  function perPrayerCard() {
    const days = D.lastDays(30);
    const per = {};
    let any = 0;
    for (const k of days) {
      const d = D.S.prayers[k]; if (!d) continue;
      for (const id of D.PRAYERS) {
        const v = d[id]; if (!v) continue;
        any++;
        const p = (per[id] = per[id] || { j: 0, a: 0, q: 0, m: 0, n: 0 });
        p.n++;
        if (v === 'jamaat') p.j++; else if (v === 'alone') p.a++; else if (v === 'qaza') p.q++; else if (v === 'missed') p.m++;
      }
    }
    const head = `<div class="card"><div class="card-head"><div class="title">${D.ic('list', 16)} ${esc(t('ib.per'))}</div>`;
    if (!any) return head + `</div><div class="empty">${esc(t('ib.per.none'))}</div></div>`;
    const NAME = { j: 'jamaat', a: 'alone', q: 'qaza', m: 'missed' };
    const rows = D.PRAYERS.map((id) => {
      const p = per[id] || { j: 0, a: 0, q: 0, m: 0, n: 0 };
      return { id, name: t('prayer.' + id), j: p.j, a: p.a, q: p.q, m: p.m, n: p.n, onTime: p.n ? Math.round(((p.j + p.a) / p.n) * 100) : null };
    });
    const scored = rows.filter((r) => r.n >= 3);
    const weak = scored.length ? scored.slice().sort((a, b) => a.onTime - b.onTime)[0] : null;
    const seg = [['j', 'var(--success)'], ['a', 'var(--info)'], ['q', 'var(--warning)'], ['m', 'var(--danger-text)']];
    const body = rows.map((r) => {
      const bars = r.n ? seg.map(([f, c]) => (r[f] ? `<i style="width:${((r[f] / r.n) * 100).toFixed(1)}%;background:${c}" title="${esc(t('ib.st.' + NAME[f]))}: ${r[f]}"></i>` : '')).join('') : '';
      return `<div class="ib-per-row ${weak && weak.id === r.id ? 'weak' : ''}">
        <span class="ib-per-name">${esc(r.name)}</span>
        <span class="ib-per-bar">${bars}</span>
        <span class="ib-per-val num">${r.onTime === null ? '—' : r.onTime + '%'}</span></div>`;
    }).join('');
    const strip = (h) => h.replace(/^<p>/, '').replace(/<\/p>$/, '');
    const note = weak ? `<div class="ib-per-note">${D.ic('info', 14)}<span>${D.ai ? strip(D.ai.md(t('ib.per.weak', { n: weak.name }))) : esc(t('ib.per.weak', { n: weak.name }))}</span></div>` : '';
    const legend = `<div class="legend">${seg.map(([f, c]) => `<span><i class="ib-leg" style="background:${c}"></i>${esc(t('ib.st.' + NAME[f]))}</span>`).join('')}</div>`;
    return head + `<span class="small muted">${esc(t('ib.per.sub'))} · ${esc(t('ib.per.ontime'))}</span></div>${body}${legend}${note}</div>`;
  }

  function renderLog() {
    const k = logKey();
    return dateNav(k, 'log', { backfill: true }) + logCard(k) + last30Card() + matrixCard() + perPrayerCard();
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
    const body = s === 'log' ? safe(renderLog) : s === 'qaza' ? safe(renderQaza) : s === 'tasbih' ? safe(renderTasbih)
      : s === 'fasting' ? safe(renderFasting) : s === 'qibla' ? safe(renderQibla) : safe(renderTimes);
    // the qaza debt is the one thing that must never be out of sight
    const remind = s === 'qaza' ? '' : safe(qzBanner);
    const ai = D.ai && (s === 'times' || s === 'log' || s === 'qaza' || s === 'fasting') ? safe(() => D.ai.card('prayer')) : '';
    return `<div class="ib">${segHtml()}${remind}${body}${ai}</div>`;
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
