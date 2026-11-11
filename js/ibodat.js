/* =====================================================================
   Ibodat — prayer times · qaza ledger · fasting
   view id 'prayer'. Reads D.prayer / D.hijri (prayer.js).

   2026-10-09, EGASINING QARORI: namoz Ibodat sahifasining O'ZIDA
   belgilanadi — «Bugungi namozlar» kartasida vaqti kirgan qator bosiladi
   va Jamoat bilan / Yakka / Qazo bo'ldi tanlanadi. Vazifa › Trekkerdagi
   namoz jadvali (2026-09-16) ham joyida qoldi. Yozuvning YAGONA yo'li —
   shu fayldagi D.prayerLog.set: u holatni S.prayers ga yozadi va namoz
   nomli odatga ham ko'chiradi. Aylana ishlatilmaydi (egasi rad etgan):
   bosh kartada kun chizig'i turadi.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'ib.sub.times': 'Vaqtlar', 'ib.sub.fasting': "Ro'za", 
      'ib.next': 'Keyingi namoz', 'ib.left': 'qoldi', 'ib.current': 'Joriy vaqt', 'ib.night': 'Tun', 
      'ib.timesFor': 'Namoz vaqtlari', 'ib.backToday': 'Bugunga', 
      'ib.ramadan': 'Ramazon muborak!', 'ib.ramadanDay': 'Ramazon, {d}-kun',
      'ib.method': 'Hisoblash usuli', 
      'ib.qib.title': 'Qibla', 'ib.qib.fromN': 'shimoldan', 'ib.qib.on': 'Kompas yoqilgan',
      'ib.qib.live': 'Telefonni tekis ushlang \u2014 strelka qiblani ko\u2018rsatadi.',
      'ib.qib.static': 'Kompas yo\u2018q \u2014 shimoldan {d}\u00b0 o\u2018ngga buriling.',
      'ib.qib.enable': 'Kompasni yoqish', 'ib.qib.denied': 'Kompasga ruxsat berilmadi',
      'ib.sahar': 'Saharlik tugaydi', 'ib.iftor': 'Iftorlik',
      'ib.toSahar': 'Saharlikka {t} qoldi', 'ib.toIftor': 'Iftorlikka {t} qoldi',
      
      'ib.st.jamaat': 'Jamoat', 'ib.st.alone': 'Yakka', 'ib.st.qaza': 'Qazo', 'ib.st.missed': "O'tkazib",
      'ib.prevDay': 'Oldingi kun', 'ib.nextDay': 'Keyingi kun', 
      'ib.fastToday': "Bugun ro'za", 'ib.fasted': "Ro'za tutdim", 'ib.noSuggest': "Bugun sunnat ro'za kuni emas", 'ib.fastType': "Ro'za turi",
      'ib.f.ramadan': 'Ramazon', 'ib.f.ayyam_bid': 'Ayyomi biyz', 'ib.f.arafa': 'Arafa', 'ib.f.ashura': 'Ashuro', 'ib.f.shawwal': 'Shavvol 6', 'ib.f.mon_thu': 'Dushanba-Payshanba',
      'ib.ft.ramadan': 'Ramazon', 'ib.ft.sunnah': 'Sunnat', 'ib.ft.qaza': 'Qazo', 'ib.ft.nafl': 'Nafl',
      'ib.hijriMonth': 'Hijriy oy', 'ib.fastedN': '{n} kun', 'ib.sugDot': 'tavsiya kuni',
      'ib.qazaFast': "Qazo ro'zalar", 'ib.owed': 'qarz (kun)', 'ib.qazaDone': 'Tutilgan', 'ib.remaining': 'Qolgan',
      'ib.ramadanMode': 'Ramazon', 'ib.ramadanProgress': "Tutilgan ro'za", 'ib.khatm': "Xatm sur'ati", 'ib.khatmHint': 'Kuniga ~{p} sahifa · bugungacha {page}-sahifa (juz {juz})',
      'ib.toRamadan': 'Ramazongacha {n} kun', 'ib.lastTen': 'Oxirgi 10 kecha — Laylatul qadrni izlang',
    },
    uzk: {
      'ib.sub.times': 'Вақтлар', 'ib.sub.fasting': 'Рўза', 
      'ib.next': 'Кейинги намоз', 'ib.left': 'қолди', 'ib.current': 'Жорий вақт', 'ib.night': 'Тун', 
      'ib.timesFor': 'Намоз вақтлари', 'ib.backToday': 'Бугунга', 
      'ib.ramadan': 'Рамазон муборак!', 'ib.ramadanDay': 'Рамазон, {d}-кун',
      'ib.method': 'Ҳисоблаш усули', 
      'ib.qib.title': 'Қибла', 'ib.qib.fromN': 'шимолдан', 'ib.qib.on': 'Компас ёқилган',
      'ib.qib.live': 'Телефонни текис ушланг \u2014 стрелка қиблани кўрсатади.',
      'ib.qib.static': 'Компас йўқ \u2014 шимолдан {d}\u00b0 ўнгга бурилинг.',
      'ib.qib.enable': 'Компасни ёқиш', 'ib.qib.denied': 'Компасга рухсат берилмади',
      'ib.sahar': 'Саҳарлик тугайди', 'ib.iftor': 'Ифторлик',
      'ib.toSahar': 'Саҳарликка {t} қолди', 'ib.toIftor': 'Ифторликка {t} қолди',
      
      'ib.st.jamaat': 'Жамоат', 'ib.st.alone': 'Якка', 'ib.st.qaza': 'Қазо', 'ib.st.missed': 'Ўтказиб',
      'ib.prevDay': 'Олдинги кун', 'ib.nextDay': 'Кейинги кун', 
      'ib.fastToday': 'Бугун рўза', 'ib.fasted': 'Рўза тутдим', 'ib.noSuggest': 'Бугун суннат рўза куни эмас', 'ib.fastType': 'Рўза тури',
      'ib.f.ramadan': 'Рамазон', 'ib.f.ayyam_bid': 'Айёми бийз', 'ib.f.arafa': 'Арафа', 'ib.f.ashura': 'Ашуро', 'ib.f.shawwal': 'Шаввол 6', 'ib.f.mon_thu': 'Душанба-Пайшанба',
      'ib.ft.ramadan': 'Рамазон', 'ib.ft.sunnah': 'Суннат', 'ib.ft.qaza': 'Қазо', 'ib.ft.nafl': 'Нафл',
      'ib.hijriMonth': 'Ҳижрий ой', 'ib.fastedN': '{n} кун', 'ib.sugDot': 'тавсия куни',
      'ib.qazaFast': 'Қазо рўзалар', 'ib.owed': 'қарз (кун)', 'ib.qazaDone': 'Тутилган', 'ib.remaining': 'Қолган',
      'ib.ramadanMode': 'Рамазон', 'ib.ramadanProgress': 'Тутилган рўза', 'ib.khatm': 'Хатм суръати', 'ib.khatmHint': 'Кунига ~{p} саҳифа · бугунгача {page}-саҳифа (жуз {juz})',
      'ib.toRamadan': 'Рамазонгача {n} кун', 'ib.lastTen': 'Охирги 10 кеча — Лайлатул қадрни изланг',
    },
    ru: {
      'ib.sub.times': 'Время', 'ib.sub.fasting': 'Пост', 
      'ib.next': 'Следующий намаз', 'ib.left': 'осталось', 'ib.current': 'Сейчас', 'ib.night': 'Ночь', 
      'ib.timesFor': 'Время намазов', 'ib.backToday': 'Сегодня', 
      'ib.ramadan': 'Рамадан мубарак!', 'ib.ramadanDay': 'Рамадан, день {d}',
      'ib.method': 'Метод расчёта', 
      'ib.qib.title': 'Кибла', 'ib.qib.fromN': 'от севера', 'ib.qib.on': 'Компас включён',
      'ib.qib.live': 'Держите телефон ровно \u2014 стрелка укажет киблу.',
      'ib.qib.static': 'Компаса нет \u2014 повернитесь на {d}\u00b0 вправо от севера.',
      'ib.qib.enable': 'Включить компас', 'ib.qib.denied': 'Доступ к компасу не разрешён',
      'ib.sahar': 'Сухур заканчивается', 'ib.iftor': 'Ифтар',
      'ib.toSahar': 'До сухура {t}', 'ib.toIftor': 'До ифтара {t}',
      
      'ib.st.jamaat': 'Джамаат', 'ib.st.alone': 'Один', 'ib.st.qaza': 'Каза', 'ib.st.missed': 'Пропущен',
      'ib.prevDay': 'Предыдущий день', 'ib.nextDay': 'Следующий день', 
      'ib.fastToday': 'Пост сегодня', 'ib.fasted': 'Пост соблюдён', 'ib.noSuggest': 'Сегодня не день сунна-поста', 'ib.fastType': 'Тип поста',
      'ib.f.ramadan': 'Рамадан', 'ib.f.ayyam_bid': 'Айям аль-бид', 'ib.f.arafa': 'Арафа', 'ib.f.ashura': 'Ашура', 'ib.f.shawwal': '6 дней Шавваля', 'ib.f.mon_thu': 'Понедельник и четверг',
      'ib.ft.ramadan': 'Рамадан', 'ib.ft.sunnah': 'Сунна', 'ib.ft.qaza': 'Каза', 'ib.ft.nafl': 'Нафль',
      'ib.hijriMonth': 'Месяц хиджры', 'ib.fastedN': '{n} дн.', 'ib.sugDot': 'рекомендуемый день',
      'ib.qazaFast': 'Каза-посты', 'ib.owed': 'долг (дней)', 'ib.qazaDone': 'Восполнено', 'ib.remaining': 'Осталось',
      'ib.ramadanMode': 'Рамадан', 'ib.ramadanProgress': 'Дней поста', 'ib.khatm': 'Темп хатма', 'ib.khatmHint': '~{p} стр. в день · сегодня стр. {page} (джуз {juz})',
      'ib.toRamadan': 'До Рамадана {n} дн.', 'ib.lastTen': 'Последние 10 ночей — ищите Ляйлятуль-кадр',
    },
  });

  /* Qazo — a full per-prayer debt ledger with its own tab. */
  D.i18n.add({
    uz: {
      'ib.sub.qaza': 'Qazo',
      'qz.debt': 'namoz qarzi', 'qz.debtShort': 'Qazo qarzi',
      'qz.daysWorth': '≈ {n} kunlik namoz', 'qz.free': "Qazo qarzi yo'q", 'qz.freeSub': 'Alhamdulillah — daftar toza',
      'qz.todayDone': 'Bugun o‘qildi', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'Bugungi reja bajarildi',
      'qz.pay': 'Qazo o‘qish', 'qz.paySub': 'O‘qigan qazoyingizni shu yerda belgilang',
      'qz.oneDay': 'Bir kunlik (5 vaqt)',
      'qz.added': '{p} qazosi qayd etildi', 'qz.removed': 'Qayd olib tashlandi', 'qz.nothingOwed': 'Bu namozda qarz yo‘q',
      'qz.dayAdded': 'Bir kunlik qazo qayd etildi',
      
      
      
      'qz.paidAll': 'To‘langan', 
      'qz.setup': 'Boshlang‘ich qarz', 'qz.setupSub': 'Kuzatuvdan oldingi qazolaringiz sonini kiriting',
      'qz.byYears': 'Yillar bo‘yicha hisoblash', 'qz.yearsQ': 'Necha yil namoz qazo bo‘lgan?', 'qz.yearsPh': 'masalan: 3',
      'qz.yearsSet': '{y} yil = har bir namozdan {n} ta', 'qz.target': 'Kunlik reja', 'qz.targetHint': 'Kuniga nechta qazo o‘qiysiz',
      'qz.reset': 'Daftarni tozalash', 'qz.resetQ': 'Butun qazo daftari o‘chiriladi. Davom etamizmi?', 'qz.resetDone': 'Qazo daftari tozalandi',
      'qz.remind': 'Qazo: {n} ta · bugun {d}/{t}', 'qz.remindGo': 'Ochish', 'qz.remindDone': 'Qazo: {n} · bugungi reja bajarildi',
      
      'qz.q1': 'Bugun', 
      'qz.start': 'Qazo daftari bo‘sh', 'qz.startSub': 'Quyida boshlang‘ich qarzingizni kiriting — keyin har kuni belgilab borasiz',
    },
    uzk: {
      'ib.sub.qaza': 'Қазо',
      'qz.debt': 'намоз қарзи', 'qz.debtShort': 'Қазо қарзи',
      'qz.daysWorth': '≈ {n} кунлик намоз', 'qz.free': 'Қазо қарзи йўқ', 'qz.freeSub': 'Алҳамдулиллаҳ — дафтар тоза',
      'qz.todayDone': 'Бугун ўқилди', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'Бугунги режа бажарилди',
      'qz.pay': 'Қазо ўқиш', 'qz.paySub': 'Ўқиган қазойингизни шу ерда белгиланг',
      'qz.oneDay': 'Бир кунлик (5 вақт)',
      'qz.added': '{p} қазоси қайд этилди', 'qz.removed': 'Қайд олиб ташланди', 'qz.nothingOwed': 'Бу намозда қарз йўқ',
      'qz.dayAdded': 'Бир кунлик қазо қайд этилди',
      
      
      
      'qz.paidAll': 'Тўланган', 
      'qz.setup': 'Бошланғич қарз', 'qz.setupSub': 'Кузатувдан олдинги қазоларингиз сонини киритинг',
      'qz.byYears': 'Йиллар бўйича ҳисоблаш', 'qz.yearsQ': 'Неча йил намоз қазо бўлган?', 'qz.yearsPh': 'масалан: 3',
      'qz.yearsSet': '{y} йил = ҳар бир намоздан {n} та', 'qz.target': 'Кунлик режа', 'qz.targetHint': 'Кунига нечта қазо ўқийсиз',
      'qz.reset': 'Дафтарни тозалаш', 'qz.resetQ': 'Бутун қазо дафтари ўчирилади. Давом этамизми?', 'qz.resetDone': 'Қазо дафтари тозаланди',
      'qz.remind': 'Қазо: {n} та · бугун {d}/{t}', 'qz.remindGo': 'Очиш', 'qz.remindDone': 'Қазо: {n} · бугунги режа бажарилди',
      
      'qz.q1': 'Бугун', 
      'qz.start': 'Қазо дафтари бўш', 'qz.startSub': 'Қуйида бошланғич қарзингизни киритинг — кейин ҳар куни белгилаб борасиз',
    },
    ru: {
      'ib.sub.qaza': 'Каза',
      'qz.debt': 'намазов долга', 'qz.debtShort': 'Долг каза',
      'qz.daysWorth': '≈ {n} дней намазов', 'qz.free': 'Долга каза нет', 'qz.freeSub': 'Альхамдулиллях — учёт чист',
      'qz.todayDone': 'Восполнено сегодня', 'qz.ofTarget': '{n} / {t}', 'qz.targetMet': 'План на сегодня выполнен',
      'qz.pay': 'Восполнение каза', 'qz.paySub': 'Отмечайте здесь восполненные намазы',
      'qz.oneDay': 'Целый день (5 намазов)',
      'qz.added': '{p} — каза записана', 'qz.removed': 'Запись убрана', 'qz.nothingOwed': 'По этому намазу долга нет',
      'qz.dayAdded': 'Записан день каза',
      
      
      
      'qz.paidAll': 'Восполнено', 
      'qz.setup': 'Начальный долг', 'qz.setupSub': 'Укажите число каза до начала учёта',
      'qz.byYears': 'Расчёт по годам', 'qz.yearsQ': 'Сколько лет намазы были пропущены?', 'qz.yearsPh': 'например: 3',
      'qz.yearsSet': '{y} г. = по {n} на каждый намаз', 'qz.target': 'Дневной план', 'qz.targetHint': 'Сколько каза в день вы читаете',
      'qz.reset': 'Очистить учёт', 'qz.resetQ': 'Весь учёт каза будет удалён. Продолжить?', 'qz.resetDone': 'Учёт каза очищен',
      'qz.remind': 'Каза: {n} · сегодня {d}/{t}', 'qz.remindGo': 'Открыть', 'qz.remindDone': 'Каза: {n} · план на сегодня выполнен',
      
      'qz.q1': 'Сегодня', 
      'qz.start': 'Учёт каза пуст', 'qz.startSub': 'Укажите ниже начальный долг — дальше отмечайте каждый день',
    },
  });

  /* Joylashuv, dial navigatsiya va ixcham statistika matnlari */
  D.i18n.add({
    uz: {
      'ib.placeChange': "o'zgartirish",
      'ib.pickCity': 'Shaharni tanlang',
      'ib.useGeo': 'Joylashuvni aniqlash',
      'ib.geoOk': 'Joylashuv: {p}',
      'ib.geoWait': 'Aniqlanmoqda…',
      'ib.geoFail': "Joylashuvni aniqlab bo'lmadi — shaharni qo'lda tanlang",
      'ib.geoNo': 'Bu qurilma joylashuvni bermaydi',
      'ib.qzMore': 'Qazo sozlamalari',
      'ib.ishroq': 'Ishroq {t} dan', 'ib.ishroqHint': 'quyosh chiqqach {n} daqiqa namoz o‘qilmaydi',
      'ib.findCity': 'Shahar nomini yozing',
      'ib.cityNone': "Bunday shahar ro'yxatda yo'q",
      'ib.source': 'islom.uz taqvimi bilan bir xil',
      'ib.sourceOn': '{d}da tekshirildi',
      'ib.sourceGeo': "islom.uz hisob usuli · joylashuvingizga qarab",
    },
    uzk: {
      'ib.placeChange': 'ўзгартириш',
      'ib.pickCity': 'Шаҳарни танланг',
      'ib.useGeo': 'Жойлашувни аниқлаш',
      'ib.geoOk': 'Жойлашув: {p}',
      'ib.geoWait': 'Аниқланмоқда…',
      'ib.geoFail': 'Жойлашувни аниқлаб бўлмади — шаҳарни қўлда танланг',
      'ib.geoNo': 'Бу қурилма жойлашувни бермайди',
      'ib.qzMore': 'Қазо созламалари',
      'ib.ishroq': 'Ишроқ {t} дан', 'ib.ishroqHint': 'қуёш чиққач {n} дақиқа намоз ўқилмайди',
      'ib.findCity': 'Шаҳар номини ёзинг',
      'ib.cityNone': 'Бундай шаҳар рўйхатда йўқ',
      'ib.source': 'islom.uz тақвими билан бир хил',
      'ib.sourceOn': '{d}да текширилди',
      'ib.sourceGeo': 'islom.uz ҳисоб усули · жойлашувингизга қараб',
    },
    ru: {
      'ib.placeChange': 'изменить',
      'ib.pickCity': 'Выберите город',
      'ib.useGeo': 'Определить местоположение',
      'ib.geoOk': 'Местоположение: {p}',
      'ib.geoWait': 'Определяем…',
      'ib.geoFail': 'Не удалось определить — выберите город вручную',
      'ib.geoNo': 'Устройство не даёт местоположение',
      'ib.qzMore': 'Настройки каза',
      'ib.ishroq': 'Ишрак с {t}', 'ib.ishroqHint': 'после восхода {n} мин намаз не читается',
      'ib.findCity': 'Введите название города',
      'ib.cityNone': 'Такого города в списке нет',
      'ib.source': 'Совпадает с календарём islom.uz',
      'ib.sourceOn': 'проверено {d}',
      'ib.sourceGeo': 'Метод islom.uz · по вашим координатам',
    },
  });
  /* Ibodat 3.0 (2026-10-09) — yangi kartalar uchun qatorlar */
  D.i18n.add({
    uz: {
      'ib.h.now': 'Hozir: {p} vaqti', 'ib.h.night': 'Hozir: tun', 'ib.h.juma': 'Juma muborak', 'ib.h.until': '{p} namozigacha',
      'ib.h.min': 'daqiqa', 'ib.h.hour': 'soat', 'ib.h.at': '{t} da kiradi',
      'ib.day.title': 'Bugungi namozlar', 'ib.day.titleOn': '{d} namozlari', 'ib.day.count': "{a} / {b} o'qildi", 'ib.day.sub': 'Vaqti kirgan namozni bosib belgilang',
      'ib.row.now': 'hozir', 'ib.row.in': '{t} keyin', 'ib.row.notYet': 'hali kirmagan', 'ib.row.mark': 'Belgilash', 'ib.row.juma': 'Juma',
      'ib.c.jamaat': 'Jamoat bilan', 'ib.c.alone': 'Yakka', 'ib.c.qaza': "Qazo bo'ldi", 'ib.c.clear': 'Olib tashlash',
      'ib.p.jamaat': 'Jamoat bilan', 'ib.p.alone': 'Yakka', 'ib.p.qaza': 'Qazo', 'ib.p.missed': "O'tkazib",
      'ib.tahajjud': 'Tahajjud', 'ib.tahajjudSub': "kechasi o'qilgan nafl namoz",
      'ib.wk.title': 'Bu hafta', 'ib.wk.onTime': 'vaqtida', 'ib.wk.sub': '{n} tasi jamoat bilan · {p}%', 'ib.wk.none': 'Hali belgilanmagan',
      'ib.wk.lJ': 'Jamoat bilan', 'ib.wk.lA': 'Yakka', 'ib.wk.lQ': 'Qazo', 'ib.wk.lN': 'Hali kirmagan', 'ib.wk.lU': 'Belgilanmagan',
      'ib.qib.cw': "shimoldan soat mili bo'yicha",
      'ib.src.same': 'Vaqtlar islom.uz taqvimi bilan bir xil · {p}', 'ib.src.geo': "Vaqtlar joylashuvingiz bo'yicha hisoblangan · {p}", 'ib.src.change': "O'zgartirish",
      'ib.qzh.left': 'namoz qoldi', 'ib.qzh.plan': 'Kunlik reja: {n}', 'ib.qzh.paid': "To'landi",
      'ib.qzh.calc': "Kuniga {n} tadan o'qisangiz, {d} tugaydi.", 'ib.qzh.dateFmt': '{y}-yil {d}da',
      'ib.qzt.more': 'Rejagacha yana {n} ta', 'ib.qzr.left': '{n} qoldi', 'ib.qzr.today': 'bugun +{n}', 'ib.qzr.none': "bugun hali yo'q",
      'ib.qzr.sub': "O'qiganingizda «+» ni bosing", 'ib.qz.dayBtn': "Bir kunlik qazo o'qidim (5 vaqt)",
      'ib.qz.set': 'Qazo sozlamalari', 'ib.qz.setSub': "boshlang'ich qarz, yillar bo'yicha hisob, kunlik reja",
      'ib.fs.not': "Bugun sunnat ro'za kuni emas.", 'ib.fs.is': "Bugun — {f} ro'zasi kuni.", 'ib.fs.next': "Keyingisi: {d} — {f} ro'zasi",
      'ib.fs.banned': "Bugun ro'za tutilmaydi.",
      'ib.rm.until': 'Ramazongacha', 'ib.rm.days': '{n} kun', 'ib.rm.first': '1-Ramazon {y}',
      'ib.mg.count': "{n} kun ro'za", 'ib.mg.sug': "sunnat ro'za kuni",
      'ib.fq.owed': 'Qarz', 'ib.fq.done': 'Tutildi', 'ib.fq.left': 'Qoldi', 'ib.fq.days': '{n} kun', 'ib.fq.undo': 'Bekor', 'ib.fq.add': "Bitta qazo ro'za tutdim",
      'ib.fq.ask': "Necha kun qazo ro'zangiz bor?", 'ib.fq.added': "Qazo ro'za qayd etildi", 'ib.fq.undone': 'Qayd olib tashlandi', 'ib.fq.already': "Bugun allaqachon ro'za belgilangan",
      'ib.fq.tapEdit': "o'zgartirish",
    },
    uzk: {
      'ib.h.now': 'Ҳозир: {p} вақти', 'ib.h.night': 'Ҳозир: тун', 'ib.h.juma': 'Жума муборак', 'ib.h.until': '{p} намозигача',
      'ib.h.min': 'дақиқа', 'ib.h.hour': 'соат', 'ib.h.at': '{t} да киради',
      'ib.day.title': 'Бугунги намозлар', 'ib.day.titleOn': '{d} намозлари', 'ib.day.count': '{a} / {b} ўқилди', 'ib.day.sub': 'Вақти кирган намозни босиб белгиланг',
      'ib.row.now': 'ҳозир', 'ib.row.in': '{t} кейин', 'ib.row.notYet': 'ҳали кирмаган', 'ib.row.mark': 'Белгилаш', 'ib.row.juma': 'Жума',
      'ib.c.jamaat': 'Жамоат билан', 'ib.c.alone': 'Якка', 'ib.c.qaza': 'Қазо бўлди', 'ib.c.clear': 'Олиб ташлаш',
      'ib.p.jamaat': 'Жамоат билан', 'ib.p.alone': 'Якка', 'ib.p.qaza': 'Қазо', 'ib.p.missed': 'Ўтказиб',
      'ib.tahajjud': 'Таҳажжуд', 'ib.tahajjudSub': 'кечаси ўқилган нафл намоз',
      'ib.wk.title': 'Бу ҳафта', 'ib.wk.onTime': 'вақтида', 'ib.wk.sub': '{n} таси жамоат билан · {p}%', 'ib.wk.none': 'Ҳали белгиланмаган',
      'ib.wk.lJ': 'Жамоат билан', 'ib.wk.lA': 'Якка', 'ib.wk.lQ': 'Қазо', 'ib.wk.lN': 'Ҳали кирмаган', 'ib.wk.lU': 'Белгиланмаган',
      'ib.qib.cw': 'шимолдан соат мили бўйича',
      'ib.src.same': 'Вақтлар islom.uz тақвими билан бир хил · {p}', 'ib.src.geo': 'Вақтлар жойлашувингиз бўйича ҳисобланган · {p}', 'ib.src.change': 'Ўзгартириш',
      'ib.qzh.left': 'намоз қолди', 'ib.qzh.plan': 'Кунлик режа: {n}', 'ib.qzh.paid': 'Тўланди',
      'ib.qzh.calc': 'Кунига {n} тадан ўқисангиз, {d} тугайди.', 'ib.qzh.dateFmt': '{y}-йил {d}да',
      'ib.qzt.more': 'Режагача яна {n} та', 'ib.qzr.left': '{n} қолди', 'ib.qzr.today': 'бугун +{n}', 'ib.qzr.none': 'бугун ҳали йўқ',
      'ib.qzr.sub': 'Ўқиганингизда «+» ни босинг', 'ib.qz.dayBtn': 'Бир кунлик қазо ўқидим (5 вақт)',
      'ib.qz.set': 'Қазо созламалари', 'ib.qz.setSub': 'бошланғич қарз, йиллар бўйича ҳисоб, кунлик режа',
      'ib.fs.not': 'Бугун суннат рўза куни эмас.', 'ib.fs.is': 'Бугун — {f} рўзаси куни.', 'ib.fs.next': 'Кейингиси: {d} — {f} рўзаси',
      'ib.fs.banned': 'Бугун рўза тутилмайди.',
      'ib.rm.until': 'Рамазонгача', 'ib.rm.days': '{n} кун', 'ib.rm.first': '1-Рамазон {y}',
      'ib.mg.count': '{n} кун рўза', 'ib.mg.sug': 'суннат рўза куни',
      'ib.fq.owed': 'Қарз', 'ib.fq.done': 'Тутилди', 'ib.fq.left': 'Қолди', 'ib.fq.days': '{n} кун', 'ib.fq.undo': 'Бекор', 'ib.fq.add': 'Битта қазо рўза тутдим',
      'ib.fq.ask': 'Неча кун қазо рўзангиз бор?', 'ib.fq.added': 'Қазо рўза қайд этилди', 'ib.fq.undone': 'Қайд олиб ташланди', 'ib.fq.already': 'Бугун аллақачон рўза белгиланган',
      'ib.fq.tapEdit': 'ўзгартириш',
    },
    ru: {
      'ib.h.now': 'Сейчас: время {p}', 'ib.h.night': 'Сейчас: ночь', 'ib.h.juma': 'Джума мубарак', 'ib.h.until': 'До намаза {p}',
      'ib.h.min': 'минут', 'ib.h.hour': 'ч', 'ib.h.at': 'наступит в {t}',
      'ib.day.title': 'Намазы сегодня', 'ib.day.titleOn': 'Намазы {d}', 'ib.day.count': 'прочитано {a} / {b}', 'ib.day.sub': 'Нажмите на наступивший намаз, чтобы отметить',
      'ib.row.now': 'сейчас', 'ib.row.in': 'через {t}', 'ib.row.notYet': 'ещё не наступил', 'ib.row.mark': 'Отметить', 'ib.row.juma': 'Джума',
      'ib.c.jamaat': 'С джамаатом', 'ib.c.alone': 'Один', 'ib.c.qaza': 'Стал каза', 'ib.c.clear': 'Убрать',
      'ib.p.jamaat': 'С джамаатом', 'ib.p.alone': 'Один', 'ib.p.qaza': 'Каза', 'ib.p.missed': 'Пропущен',
      'ib.tahajjud': 'Тахаджуд', 'ib.tahajjudSub': 'ночной нафль-намаз',
      'ib.wk.title': 'Эта неделя', 'ib.wk.onTime': 'вовремя', 'ib.wk.sub': '{n} с джамаатом · {p}%', 'ib.wk.none': 'Пока не отмечено',
      'ib.wk.lJ': 'С джамаатом', 'ib.wk.lA': 'Один', 'ib.wk.lQ': 'Каза', 'ib.wk.lN': 'Ещё не наступил', 'ib.wk.lU': 'Не отмечен',
      'ib.qib.cw': 'от севера по часовой стрелке',
      'ib.src.same': 'Время совпадает с календарём islom.uz · {p}', 'ib.src.geo': 'Время рассчитано по вашим координатам · {p}', 'ib.src.change': 'Изменить',
      'ib.qzh.left': 'намазов осталось', 'ib.qzh.plan': 'План на день: {n}', 'ib.qzh.paid': 'Восполнено',
      'ib.qzh.calc': 'По {n} в день — закончите {d}.', 'ib.qzh.dateFmt': '{d} {y} г.',
      'ib.qzt.more': 'До плана ещё {n}', 'ib.qzr.left': 'осталось {n}', 'ib.qzr.today': 'сегодня +{n}', 'ib.qzr.none': 'сегодня пока нет',
      'ib.qzr.sub': 'Прочитали — нажмите «+»', 'ib.qz.dayBtn': 'Прочитал каза за день (5 намазов)',
      'ib.qz.set': 'Настройки каза', 'ib.qz.setSub': 'начальный долг, расчёт по годам, план на день',
      'ib.fs.not': 'Сегодня не день сунна-поста.', 'ib.fs.is': 'Сегодня — день поста «{f}».', 'ib.fs.next': 'Следующий: {d} — пост «{f}»',
      'ib.fs.banned': 'Сегодня поститься нельзя.',
      'ib.rm.until': 'До Рамадана', 'ib.rm.days': '{n} дн.', 'ib.rm.first': '1 Рамадана {y}',
      'ib.mg.count': 'дней поста: {n}', 'ib.mg.sug': 'день сунна-поста',
      'ib.fq.owed': 'Долг', 'ib.fq.done': 'Восполнено', 'ib.fq.left': 'Осталось', 'ib.fq.days': '{n} дн.', 'ib.fq.undo': 'Отмена', 'ib.fq.add': 'Держал один каза-пост',
      'ib.fq.ask': 'Сколько дней каза-поста у вас есть?', 'ib.fq.added': 'Каза-пост записан', 'ib.fq.undone': 'Запись убрана', 'ib.fq.already': 'Пост на сегодня уже отмечен',
      'ib.fq.tapEdit': 'изменить',
    },
  });


  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const PR = D.PRAYERS;
  const STATES = ['jamaat', 'alone', 'qaza']; // 'missed' olib tashlandi — eski yozuvlar o'z holicha qoladi
  const SUBS = ['times', 'qaza', 'fasting'];
  const FTYPES = ['ramadan', 'sunnah', 'qaza', 'nafl'];
  const PAGES = 604, JUZ = 30;
  // Bizning hisob islom.uz e'lon qilgan jadval bilan oxirgi marta solishtirilgan sana
  const VERIFIED = '2026-09-10';

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
        const p = D.prayer.matchName(h.name);
        if (p && !map[p]) map[p] = h.id;
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
  /* Kun yozuvida besh farzdan tashqari nafl namoz ham turadi (tahajjud).
     Kun faqat HAMMA kalit bo'sh bo'lganda o'chadi — aks holda farzlar
     belgilanmagan kechada o'qilgan tahajjud izsiz yo'qolardi. */
  const NAFL = ['tahajjud'];
  const dayEmpty = (o) => PR.concat(NAFL).every((p) => !o[p]);
  function setPrayer(k, id, v) {
    const o = D.S.prayers[k] || { bomdod: null, peshin: null, asr: null, shom: null, xufton: null };
    o[id] = v || null;
    if (NAFL.includes(id) && !v) delete o[id];
    if (dayEmpty(o)) delete D.S.prayers[k]; else D.S.prayers[k] = o;
    const hid = prayerHabits()[id];
    if (hid) { const h = D.S.habits.find((x) => x.id === hid); if (h && !(h.target && h.target.n)) setLog(k, hid, !!v && v !== 'missed'); }
  }
  const stateOf = (k, id) => { const o = D.S.prayers[k]; return o && typeof o === 'object' ? o[id] || null : null; };
  /* Trekkerdagi namoz jadvali shu yerdan o'qiydi va yozadi — odat bilan
     ko'zgu qoidasi ikki joyda ikki xil bo'lib qolmasin. */
  D.prayerLog = {
    STATES, NAFL,
    get: stateOf,
    set(k, id, v) {
      if (!isDay(k) || k > D.today()) return;
      // nafl namozda holat bitta — o'qildi yoki yo'q
      if (NAFL.includes(id)) { setPrayer(k, id, v ? 'alone' : null); return; }
      if (!PR.includes(id)) return;
      setPrayer(k, id, STATES.includes(v) || v === 'missed' ? v : null);
    },
    /** Namoz nomli faol odatlarning id lari — trekker ularni odat jadvaliga qo'shmaydi. */
    habitIds: () => Object.values(prayerHabits()),
    /** Beshala namoz belgilangan kunlar (Set) — ketma-ketlik shundan sanaladi. */
    fullDays: () => prayerTotals().full,
  };

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
  /* Namoz belgisi: har vaqtning o'z rangi (bomdod tong, peshin quyosh, asr
     past quyosh, shom botish, xufton oy). Rang CSS da (.ib-pi.p-*). */
  const PICON = { bomdod: 'sunrise', quyosh: 'sun', peshin: 'sun', asr: 'sun', shom: 'sunset', xufton: 'moon', tahajjud: 'moon' };
  const pIco = (id) => `<span class="ico ib-pi p-${id}">${D.ic(PICON[id] || 'sun', 19)}</span>`;

  function qzHero() {
    const o = qzOwed(), td = qzTarget();
    if (!o.total) {
      const fresh = !o.all && !o.paid;   // nothing declared, nothing logged, nothing repaid
      return `<div class="card hero hero--qazo ib-qz-hero zero">
        <div class="ib-qz-free ${fresh ? 'fresh' : ''}">${D.ic(fresh ? 'flag' : 'check', 30)}</div>
        <div class="ib-qz-free-t">${esc(t(fresh ? 'qz.start' : 'qz.free'))}</div>
        <div class="small muted">${esc(t(fresh ? 'qz.startSub' : 'qz.freeSub'))}</div>
        ${o.paid ? `<div class="ib-qz-freestat num">${D.fmtNum(o.paid)} <span>${esc(t('qz.paidAll'))}</span></div>` : ''}
      </div>`;
    }
    const cleared = o.all ? (o.paid / o.all) * 100 : 0;
    // tugash sanasi: qoldiq / kunlik reja
    const days = Math.ceil(o.total / td), end = D.addDays(D.today(), days);
    const endTxt = t('ib.qzh.dateFmt', { y: end.slice(0, 4), d: D.fmtDate(end) });
    return `<div class="card hero hero--qazo ib-qzh">
      <div class="ib-h-top"><h2>${esc(t('qz.debtShort'))}</h2><span class="hero-pill num">${esc(t('ib.qzh.plan', { n: td }))}</span></div>
      <div class="ib-big"><b class="num">${D.fmtNum(o.total)}</b><span>${esc(t('ib.qzh.left'))}</span></div>
      <div class="ib-qzh-sub num">${esc(t('qz.daysWorth', { n: D.fmtNum(Math.ceil(o.total / 5)) }))}</div>
      <div class="ib-qzh-row"><span>${esc(t('ib.qzh.paid'))}</span><b class="num">${D.fmtNum(o.paid)} / ${D.fmtNum(o.all)} · ${Math.round(cleared)}%</b></div>
      <span class="bar md ib-bar-good"><i class="bar-fill" style="width:${D.clamp(cleared, 0, 100).toFixed(1)}%"></i></span>
      <div class="advice warn ib-qzh-calc">${D.ic('calendar', 18)}<span>${esc(t('ib.qzh.calc', { n: td, d: endTxt }))}</span></div>
    </div>`;
  }
  function qzTodayCard() {
    const td = qzTarget(), done = qzPaidOn(D.today()), met = done >= td;
    return `<div class="card ib-qzt ${met ? 'met' : ''}">
      <div class="ib-qzh-row first"><b>${esc(t('qz.todayDone'))}</b><b class="num">${done} / ${td}</b></div>
      <span class="bar md"><i class="bar-fill" style="width:${D.clamp((done / td) * 100, 0, 100).toFixed(1)}%"></i></span>
      <div class="ib-qzt-n">${met ? `${D.ic('check', 14)} ${esc(t('qz.targetMet'))}` : esc(t('ib.qzt.more', { n: td - done }))}</div>
    </div>`;
  }

  function qzPayCard() {
    const o = qzOwed(), k = D.today(), s = qzScan(), b = QZ().base;
    const day = QZ().pay[k] || {};
    const rows = PR.map((p) => {
      const owed = o.per[p], n = int(day[p]);
      const all = int(b[p]) + s.missed[p], paid = all ? (s.paid[p] / all) * 100 : 0;
      const name = esc(t('prayer.' + p));
      return `<div class="ib-qzr ${owed ? '' : 'clear'}">
        ${pIco(p)}
        <div class="ib-qzr-b"><div class="ib-qzr-h"><b>${name}</b><span class="num">${owed ? esc(t('ib.qzr.left', { n: D.fmtNum(owed) })) : '—'}</span></div>
          <span class="bar thin ib-bar-good"><i class="bar-fill" style="width:${D.clamp(paid, 0, 100).toFixed(1)}%"></i></span>
          <div class="ib-qzr-t ${n ? 'on' : ''} num">${esc(n ? t('ib.qzr.today', { n }) : t('ib.qzr.none'))}</div></div>
        <button class="ib-rb" data-act="ibQzUnpay" data-id="${p}" ${n ? '' : 'disabled'} aria-label="${name} −1"><i>${D.ic('minus', 18)}</i></button>
        <button class="ib-rb add" data-act="ibQzPay" data-id="${p}" ${owed ? '' : 'disabled'} aria-label="${name} +1"><i>${D.ic('plus', 18)}</i></button>
      </div>`;
    }).join('');
    return `<div class="card ib-qzp">
      <div class="card-head"><h2 class="title">${esc(t('qz.pay'))}</h2></div>
      <p class="card-sub">${esc(t('ib.qzr.sub'))}</p>
      ${rows}
    </div>`;
  }
  function qzDayBtn() {
    const o = qzOwed(), canDay = PR.every((p) => o.per[p] > 0);
    return `<button class="btn main ib-qz-day" data-act="ibQzDay" ${canDay ? '' : 'disabled'}>${D.ic('check', 20)} ${esc(t('ib.qz.dayBtn'))}</button>`;
  }

  function qzSetupCard() {
    const b = QZ().base, o = qzOwed();
    const inputs = PR.map((p) => `<label class="ib-qz-in"><span>${esc(t('prayer.' + p))}</span>
      <input class="inp sm num" type="number" min="0" max="99999" inputmode="numeric" value="${int(b[p])}" data-change="ibQzBase" data-id="${p}" aria-label="${esc(t('prayer.' + p))}"></label>`).join('');
    return `<div class="card">
      <div class="card-head"><h2 class="title">${esc(t('qz.setup'))}</h2></div>
      <p class="card-sub">${esc(t('qz.setupSub'))}</p>
      <div class="ib-qz-ins">${inputs}</div>
      <button class="btn ghost block mt" data-act="ibQzYears">${D.ic('calendar', 14)} ${esc(t('qz.byYears'))}</button>
      <div class="ib-qz-target mt">
        <div class="grow"><b class="ib-lab">${esc(t('qz.target'))}</b><div class="small muted">${esc(t('qz.targetHint'))}</div></div>
        <input class="inp sm num" type="number" min="1" max="200" inputmode="numeric" value="${qzTarget()}" data-change="ibQzTarget" aria-label="${esc(t('qz.target'))}">
      </div>
      ${o.total || o.all || o.paid ? `<button class="btn ghost danger block mt" data-act="ibQzReset">${D.ic('trash', 14)} ${esc(t('qz.reset'))}</button>` : ''}
    </div>`;
  }

  function renderQaza() {
    const o = qzOwed();
    // nothing owed and nothing ever repaid → lead straight to the one card that matters: declaring the backlog.
    if (!o.total && !o.all && !o.paid) return qzHero() + qzSetupCard();
    const open = !!D.ui.collapsed.ibQzSet;
    const more = `<button class="card ib-linkrow ${open ? 'on' : ''}" data-act="ibQzMore" aria-expanded="${open}">
      <span class="ico">${D.ic('gear', 18)}</span><span class="ib-linkrow-t"><b>${esc(t('ib.qz.set'))}</b><span>${esc(t('ib.qz.setSub'))}</span></span>${D.ic(open ? 'chevD' : 'chevR', 18)}</button>`;
    return qzHero() + (o.total ? qzTodayCard() + qzPayCard() + qzDayBtn() : '') + more + (open ? qzSetupCard() : '');
  }
  D.act.ibQzMore = () => { D.ui.collapsed.ibQzSet = !D.ui.collapsed.ibQzSet; D.saveUi(); D.rerender(); };

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
    const v = await D.prompt({ title: t('qz.yearsQ'), placeholder: t('qz.yearsPh'), value: '', type: 'number' });
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
    return `<button class="ib-qz-remind ${met ? 'met' : ''}" data-act="go" data-view="prayer" data-sub="qaza">
      <i class="dot"></i>
      <span class="ib-qz-rtext num">${esc(met ? t('qz.remindDone', { n: D.fmtNum(o.total) }) : t('qz.remind', { n: D.fmtNum(o.total), d: done, t: td }))}</span>
      <span class="ib-qz-rgo">${esc(t('qz.remindGo'))} ${D.ic('chevR', 14)}</span>
    </button>`;
  }

  /* date (device-only) */
  function timesKey() { const k = F().ibTimesDate; return isDay(k) ? k : D.today(); }
  /* Sarlavha ustidagi qator: milodiy va hijriy sana. Boshqa kun ochilgan
     bo'lsa — «Bugunga» havolasi. Kun «Bu hafta» jadvalidagi kun nomini
     bosib tanlanadi (ilgari sahifada alohida strelkali qator turardi). */
  function daySub() {
    const td = D.today(), k = timesKey();
    return esc(D.fmtDate(k)) + ' · ' + esc(D.hijri.fmt(k))
      + (k === td ? '' : ` · <button class="top-link" data-act="ibToday">${esc(t('ib.backToday'))}</button>`);
  }
  D.act.ibShift = (el) => {
    const nk = D.addDays(timesKey(), +el.dataset.n || 0);
    if (nk > D.today()) return;
    F().ibTimesDate = nk === D.today() ? null : nk;
    D.saveUi(); D.rerender();
  };
  D.act.ibDay = (el) => {
    const k = el.dataset.key; if (!isDay(k) || k > D.today()) return;
    F().ibTimesDate = k === D.today() ? null : k; openRow = null;
    D.saveUi(); D.go('prayer', 'times');
  };
  D.act.ibToday = () => { F().ibTimesDate = null; D.saveUi(); D.go('prayer', sub()); };

  /* ------------------------------------------------------------------ */
  /* Bo'limcha tanlagichi — tepadagi segment (Tana va Vazifa bilan bir    */
  /* xil). Ilgari bu yerda o'ng pastda suzuvchi dial turardi; ko'mir       */
  /* qobiqda o'sha joyni Tana FAB'i egalladi (2026-09-15).                 */
  /* `data-act="go"`: setSub faqat qayta chizadi, go esa mount ham qiladi  */
  /* — Vaqtlar sahifasining soniya taymeri aynan mount da ishga tushadi.   */
  /* ------------------------------------------------------------------ */
  const SUB_LABEL = { times: 'ib.sub.times', qaza: 'ib.sub.qaza', fasting: 'ib.sub.fasting' };
  function segHtml() {
    const cur = sub();
    return `<div class="seg ib-seg" role="tablist">${SUBS.map((x) => `<button class="${cur === x ? 'on' : ''}" data-act="go" data-view="prayer" data-sub="${x}" role="tab" aria-selected="${cur === x ? 'true' : 'false'}">${esc(t(SUB_LABEL[x]))}</button>`).join('')}</div>`;
  }
  // swiping the page left/right is the second way through the same three sections
  function swipeTo(dir) {
    const i = SUBS.indexOf(sub()), n = D.clamp(i + dir, 0, SUBS.length - 1);
    if (n === i) return;
    haptic(); D.go('prayer', SUBS[n]);
  }
  let swipeOff = null;
  function bindSwipe() {
    unbindSwipe();
    const el = D.$('#view'); if (!el) return;
    let x0 = 0, y0 = 0, live = false;
    // Yon tomonga suriladigan idish ichidan boshlangan teginish — o'sha idishniki.
    // Jadval 400px ekranga sig'maydi va uni surishning yagona yo'li shu; ilgari
    // jadvalni surmoqchi bo'lgan odam boshqa bo'limchaga tushib ketardi.
    const start = (e) => {
      const p = e.touches && e.touches[0]; if (!p) return;
      if (e.target && e.target.closest && e.target.closest('[data-noswipe]')) { live = false; return; }
      x0 = p.clientX; y0 = p.clientY; live = true;
    };
    const end = (e) => {
      if (!live) return; live = false;
      const p = e.changedTouches && e.changedTouches[0]; if (!p) return;
      const dx = p.clientX - x0, dy = p.clientY - y0;
      // a real horizontal flick, not a scroll that drifted sideways
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      swipeTo(dx < 0 ? 1 : -1);
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    swipeOff = () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchend', end); };
  }
  function unbindSwipe() { if (swipeOff) { swipeOff(); swipeOff = null; } }

  /* ------------------------------------------------------------------ */
  /* 1. VAQTLAR                                                           */
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
  /* Sanoq: bir soatgacha «35 daqiqa», undan ko'p bo'lsa «1:20 soat».
     Daqiqada bir marta yangilanadi (tick). */
  function countHtml(mins) {
    const m = Math.max(0, Math.ceil(mins));
    return m > 60 ? `<b class="num">${Math.floor(m / 60)}:${D.pad2(m % 60)}</b><span>${esc(t('ib.h.hour'))}</span>` : `<b class="num">${m}</b><span>${esc(t('ib.h.min'))}</span>`;
  }
  /* Kun chizig'i: besh namoz teng oraliqda. Chiziq bomdoddan hozirgi vaqtgacha
     to'ladi: (joriy namoz indeksi + oraliqdagi ulush) / 4. */
  function dayLine(k, hs) {
    const list = D.prayer.list(k).filter((x) => x.id !== 'quyosh');
    const nowM = nowMins();
    let ci = -1;
    list.forEach((x, i) => { if (x.mins <= nowM) ci = i; });
    const frac = ci < 0 ? 0 : ci >= 4 ? 4 : ci + D.clamp((nowM - list[ci].mins) / Math.max(1, list[ci + 1].mins - list[ci].mins), 0, 1);
    const nextId = hs && hs.nx.key === k ? hs.nx.id : null;
    const stops = list.map((x, i) => {
      const st = stateOf(k, x.id), entered = x.mins <= nowM;
      const cls = st === 'jamaat' || st === 'alone' ? 'ok' : st === 'qaza' ? 'qz' : x.id === nextId ? 'next' : entered ? 'open' : '';
      return `<span class="ib-dl-s ${cls}"><i>${cls === 'ok' ? D.ic('check', 14) : ''}</i><b>${esc(t('prayer.' + x.id))}</b><em class="num">${x.time}</em></span>`;
    }).join('');
    return `<div class="ib-dl"><span class="ib-dl-t"><i style="width:${(frac / 4 * 100).toFixed(1)}%"></i></span>${stops}</div>`;
  }
  function heroHtml() {
    const hs = heroState(), k = D.today();
    if (!hs) return `<div class="card hero hero--namoz ib-hero"><div class="ib-h-until">${esc(t('ib.next'))}</div><div class="ib-count"><b class="num">—</b></div></div>`;
    const { nx } = hs;
    const juma = D.dowOf(k) === 5;
    const cur = nx.current && nx.current !== 'quyosh' ? t('ib.h.now', { p: t('prayer.' + nx.current) }) : nx.current === 'quyosh' ? t('prayer.quyosh') : t('ib.h.night');
    return `<div class="card hero hero--namoz ib-hero">
      <div class="ib-h-top"><span class="hero-pill">${D.ic(nx.current ? 'sun' : 'moon', 14)} ${esc(cur)}</span>${juma ? `<span class="ib-h-juma">${esc(t('ib.h.juma'))}</span>` : ''}</div>
      <div class="ib-h-until">${esc(t('ib.h.until', { p: t('prayer.' + nx.id) }))}</div>
      <div class="ib-count" id="ibCountdown">${countHtml(hs.secs / 60)}</div>
      <div class="ib-h-at"><span class="pill warn num">${esc(t('ib.h.at', { t: nx.time }))}</span></div>
      <div id="ibDayLine">${dayLine(k, hs)}</div>
    </div>`;
  }
  /* Bugungi namozlar. Vaqti kirgan qator bosiladi — ostida to'rtta chip
     ochiladi. Tanlov D.prayerLog.set orqali yoziladi (Trekkerdagi jadval
     bilan bir xil yo'l: S.prayers + namoz nomli odat). */
  let openRow = null;
  function prayersCard(k) {
    const td = D.today(), isToday = k === td;
    const list = D.prayer.list(k);
    const nowM = nowMins();
    const five = list.filter((x) => x.id !== 'quyosh');
    let cur = null;
    if (isToday) for (const x of list) if (x.mins <= nowM) cur = x.id;
    const juma = D.dowOf(k) === 5;
    let done = 0;
    const rows = list.map((x) => {
      if (x.id === 'quyosh') {
        return `<div class="ib-pr quyosh">${pIco('quyosh')}<div class="ib-pr-b"><b>${esc(t('prayer.quyosh'))}</b>
          <span class="num">${x.time} · ${esc(t('ib.ishroq', { t: D.prayer.fmt(D.prayer.ishroq(k)) }))}</span></div></div>`;
      }
      const i = five.indexOf(x), end = five[i + 1] ? five[i + 1].time : null;
      /* Holat saqlangan ma'lumotdan keladi va quyida class nomiga qo'shiladi —
         shuning uchun faqat ma'lum to'rtta qiymat o'tadi, qolgani «belgilanmagan». */
      const raw = stateOf(k, x.id);
      const st = STATES.includes(raw) || raw === 'missed' ? raw : null;
      const entered = !isToday || x.mins <= nowM;
      if (st && st !== 'missed') done++;
      const range = `${x.time}${end && entered ? ' – ' + (x.id === 'bomdod' ? (list.find((y) => y.id === 'quyosh') || {}).time || end : end) : ''}`;
      const sub = !entered ? (x.mins - nowM <= 180 ? t('ib.row.in', { t: D.fmtMins(x.mins - nowM) }) : t('ib.row.notYet'))
        : range + (isToday && x.id === cur ? ' · ' + t('ib.row.now') : '');
      const right = !entered ? `<span class="ib-pr-tm num">${x.time}</span>`
        : st ? `<span class="pill ib-st-${st}">${esc(t('ib.p.' + st))}</span>`
        : `<span class="ib-pr-mark">${esc(t('ib.row.mark'))}</span>`;
      const open = entered && openRow === x.id;
      const chips = open ? `<div class="chips ib-pr-chips">${STATES.map((s) => `<button class="chip${st === s ? ' on' : ''}" data-act="ibSet" data-id="${x.id}" data-v="${s}" aria-pressed="${st === s}">${esc(t('ib.c.' + s))}</button>`).join('')}${st ? `<button class="chip ib-chip-x" data-act="ibSet" data-id="${x.id}" data-v="">${esc(t('ib.c.clear'))}</button>` : ''}</div>` : '';
      const soon = !entered && x.mins - nowM <= 180;
      const inner = `${pIco(x.id)}<div class="ib-pr-b"><b>${esc(t('prayer.' + x.id))}${juma && x.id === 'peshin' ? `<i class="ib-juma">${esc(t('ib.row.juma'))}</i>` : ''}</b>
          <span class="num${soon ? ' soon' : ''}">${esc(sub)}</span></div>${right}`;
      return entered
        ? `<div class="ib-pr-w${open ? ' open' : ''}"><button type="button" class="ib-pr tap" data-act="ibRow" data-id="${x.id}" aria-expanded="${open}">${inner}</button>${chips}</div>`
        : `<div class="ib-pr${soon ? ' soon' : ''}">${inner}</div>`;
    }).join('');
    const tj = stateOf(k, 'tahajjud');
    const tahajjud = `<div class="ib-pr">${pIco('tahajjud')}<div class="ib-pr-b"><b>${esc(t('ib.tahajjud'))}</b><span>${esc(t('ib.tahajjudSub'))}</span></div>
      <button class="toggle${tj ? ' on' : ''}" data-act="ibTahajjud" role="switch" aria-checked="${tj ? 'true' : 'false'}" aria-label="${esc(t('ib.tahajjud'))}"></button></div>`;
    return `<div class="card ib-day">
      <div class="card-head"><h2 class="title">${esc(isToday ? t('ib.day.title') : t('ib.day.titleOn', { d: D.fmtDate(k) }))}</h2><span class="ib-cnt num">${esc(t('ib.day.count', { a: done, b: 5 }))}</span></div>
      <p class="card-sub">${esc(t('ib.day.sub'))}</p>
      ${rows}${tahajjud}
    </div>`;
  }
  D.act.ibRow = (el) => { const id = el.dataset.id; openRow = openRow === id ? null : id; D.rerender(); };
  D.act.ibSet = (el) => {
    const k = timesKey(), id = el.dataset.id; if (!PR.includes(id)) return;
    const v = el.dataset.v || null;
    D.prayerLog.set(k, id, stateOf(k, id) === v ? null : v);
    openRow = null;
    haptic(v ? 'success' : 'light'); D.save(); D.rerender();
  };
  D.act.ibTahajjud = () => {
    const k = timesKey();
    D.prayerLog.set(k, 'tahajjud', !stateOf(k, 'tahajjud'));
    haptic(); D.save(); D.rerender();
  };

  /* Bu hafta: 5 namoz × 7 kun (Du–Ya). Kun nomi bosilsa o'sha kun ochiladi. */
  function weekCard(k) {
    const td = D.today(), W = t('weekdaysShort');
    const start = D.addDays(td, -((D.dowOf(td) + 6) % 7));
    const days = []; for (let i = 0; i < 7; i++) days.push(D.addDays(start, i));
    const nowM = nowMins(), tmToday = timesOf(td) || {};
    let entered = 0, onTime = 0, jam = 0;
    const head = `<span></span>` + days.map((d) => `<button type="button" class="ib-wk-d${d === k ? ' on' : ''}" data-act="ibDay" data-key="${d}" ${d > td ? 'disabled' : ''} aria-label="${esc(D.fmtDate(d, 'weekday'))}"><i>${esc(W[D.dowOf(d)])}</i></button>`).join('');
    const rows = PR.map((p) => `<span class="ib-wk-n">${esc(t('prayer.' + p))}</span>` + days.map((d) => {
      const st = stateOf(d, p);
      const isIn = d < td || (d === td && tmToday[p] != null && tmToday[p] <= nowM);
      if (isIn) { entered++; if (st === 'jamaat' || st === 'alone') onTime++; if (st === 'jamaat') jam++; }
      const cls = st === 'jamaat' ? 'j' : st === 'alone' ? 'a' : st === 'qaza' ? 'q' : st === 'missed' ? 'm' : isIn ? 'u' : 'n';
      return `<i class="ib-wk-c ${cls}"></i>`;
    }).join('')).join('');
    const pctOn = entered ? Math.round((onTime / entered) * 100) : 0;
    return `<div class="card ib-wk">
      <div class="card-head"><h2 class="title">${esc(t('ib.wk.title'))}</h2><span class="ib-cnt num"><b>${onTime} / ${entered}</b> ${esc(t('ib.wk.onTime'))}</span></div>
      <p class="card-sub num">${esc(entered ? t('ib.wk.sub', { n: jam, p: pctOn }) : t('ib.wk.none'))}</p>
      <div class="ib-wk-g">${head}${rows}</div>
      <div class="legend ib-wk-l"><span><i class="ib-wk-c j"></i>${esc(t('ib.wk.lJ'))}</span><span><i class="ib-wk-c a"></i>${esc(t('ib.wk.lA'))}</span><span><i class="ib-wk-c q"></i>${esc(t('ib.wk.lQ'))}</span><span><i class="ib-wk-c u"></i>${esc(t('ib.wk.lU'))}</span><span><i class="ib-wk-c n"></i>${esc(t('ib.wk.lN'))}</span></div>
    </div>`;
  }
  /* Joylashuv — vaqtning eng muhim sharti. */
  function placeName() {
    const c = D.prayer.conf();
    if (c.place) return c.place;
    const near = D.prayer.nearest(c.lat, c.lng);
    return near ? near.n : D.round(c.lat, 2) + '°, ' + D.round(c.lng, 2) + '°';
  }
  /* Manba qatori: vaqtlar qayerdan olingani + shaharni almashtirish. Tishli
     g'ildirak hisoblash usuli sozlamalarini ochadi (Sozlashdagi karta). */
  function placeBar() {
    const open = !!D.ui.collapsed.ibPrayerSet;
    const body = open && D.settings && D.settings.prayerCard ? `<div class="ib-set-body">${D.settings.prayerCard()}</div>` : '';
    const busy = !!D.ui.ibGeoBusy;
    const txt = busy ? t('ib.geoWait') : t(D.prayer.listed() ? 'ib.src.same' : 'ib.src.geo', { p: placeName() });
    return `<div class="card ib-src2">
      ${D.ic(D.prayer.listed() ? 'check' : 'compass', 20)}
      <span class="ib-src2-t">${esc(txt)}</span>
      <button class="ib-link" data-act="ibPickPlace">${esc(t('ib.src.change'))}</button>
      <button class="ib-gear${open ? ' on' : ''}" data-act="ibSetToggle" aria-expanded="${open}" aria-label="${esc(t('ib.method'))}">${D.ic('gear', 18)}</button>
    </div>${body}`;
  }
  D.act.ibSetToggle = () => { D.ui.collapsed.ibPrayerSet = !D.ui.collapsed.ibPrayerSet; D.saveUi(); D.rerender(); };
  // Ro'yxatdan tanlangan shaharning koordinatasi yaxlitlanmaydi: 4 xonagacha
  // yaxlitlash yiliga bir-ikki marta biror vaqtni bir daqiqaga surib yuboradi
  // va jadval islom.uz bilan mos kelmay qoladi. GPS uchun yaxlitlash qoladi —
  // u yerda 11 metrning ahamiyati yo'q.
  function setPlace(lat, lng, name, exact) {
    const pr = D.S.settings.prayer || (D.S.settings.prayer = {});
    pr.lat = exact ? lat : D.round(lat, 4);
    pr.lng = exact ? lng : D.round(lng, 4);
    pr.place = name || ''; pr.fromList = !!exact; pr.geoAsked = true;
    D.save();
  }
  D.act.ibGeo = () => {
    const geo = typeof navigator !== 'undefined' && navigator.geolocation;
    if (!geo || typeof geo.getCurrentPosition !== 'function') { D.toast(t('ib.geoNo')); return; }
    D.ui.ibGeoBusy = true; D.rerender();
    geo.getCurrentPosition(
      (pos) => {
        const near = D.prayer.nearest(pos.coords.latitude, pos.coords.longitude);
        setPlace(pos.coords.latitude, pos.coords.longitude, near ? near.n : '');
        D.ui.ibGeoBusy = false; haptic('success'); D.rerender(); D.toast(t('ib.geoOk', { p: placeName() }));
      },
      () => { D.ui.ibGeoBusy = false; D.rerender(); D.toast(t('ib.geoFail')); },
      { timeout: 10000, maximumAge: 600000, enableHighAccuracy: true });
  };
  // 90 ta shahar bir ekranga sig'maydi — yozib qidiriladi, va alifbo to'siq bo'lmasligi
  // kerak. Har bir nom (lotincha, kirillcha, ruschasi) bitta lotin kalitiga keltiriladi:
  // apostroflar tashlanadi, kirill harflari lotinchaga o'giriladi. Shunda "Тошкент",
  // "Ташкент", "tashkent" va "toshk" — hammasi bir joyni topadi.
  const FOLD = {
    а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'e', ж: 'j', з: 'z',
    и: 'i', й: 'y', к: 'k', қ: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ў: 'u', ф: 'f', х: 'x', ҳ: 'x', ц: 'ts', ч: 'ch',
    ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  const cityKey = (s) => (s || '').toLowerCase()
    .replace(/[\u02bb\u02bc'\u2018\u2019`]/g, '')
    .replace(/[\u0400-\u04ff]/g, (c) => (c in FOLD ? FOLD[c] : c));
  function cityRows(q) {
    const cur = placeName(), k = cityKey(q);
    const hit = D.prayer.places.filter((x) => !k || cityKey(x.n).includes(k) || cityKey(x.c).includes(k));
    if (!hit.length) return `<div class="ib-note">${esc(t('ib.cityNone'))}</div>`;
    return `<div class="ib-cities">${hit.map((x) => `<button class="ib-city ${x.n === cur ? 'on' : ''}" data-act="ibCity" data-n="${esc(x.n)}">${esc(x.n)}</button>`).join('')}</div>`;
  }
  D.act.ibPickPlace = () => {
    D.modal({
      title: t('ib.pickCity'), noFocus: true,
      body: `<button class="btn block" data-act="ibCity" data-n="__geo">${D.ic('target', 15)} ${esc(t('ib.useGeo'))}</button>
        <input class="inp ib-city-find" id="ibCityFind" type="search" autocomplete="off" data-enter="ibCityFirst" placeholder="${esc(t('ib.findCity'))}">
        <div id="ibCityList">${cityRows('')}</div>`,
      onOpen: () => {
        const inp = D.$('#ibCityFind'), list = D.$('#ibCityList');
        if (!inp || !list) return;
        inp.addEventListener('input', () => { list.innerHTML = cityRows(inp.value); });
      },
    });
  };
  // qidiruvda Enter — ro'yxatdagi birinchi shahar (bitta qolganda aynan u)
  D.act.ibCityFirst = (el) => {
    const first = D.$('#ibCityList .ib-city');
    if (first && String(el.value || '').trim()) first.click(); else el.blur();
  };
  D.act.ibCity = (el) => {
    const n = el.dataset.n;
    D.closeModal();
    if (n === '__geo') { D.act.ibGeo(); return; }
    const x = D.prayer.places.find((v) => v.n === n);
    if (!x) return;
    setPlace(x.lat, x.lng, x.n, true); haptic('success'); D.rerender(); D.toast(t('ib.geoOk', { p: x.n }));
  };
  function ramadanBanner(k) {
    if (!D.hijri.isRamadan(k)) return '';
    const h = D.hijri.fromKey(k);
    return `<div class="banner good">${D.ic('moon', 16)} <b>${esc(t('ib.ramadan'))}</b> · ${esc(t('ib.ramadanDay', { d: h ? h.d : '' }))}</div>`;
  }
  /* ------------------------------------------------------------------ */
  /* QIBLA                                                                */
  /*                                                                      */
  /* Yo'nalish yerning sferasida hisoblanadi (katta doira), ya'ni bu       */
  /* «xaritadagi to'g'ri chiziq» emas: Toshkentdan qibla 240,3° — g'arbdan */
  /* biroz janubda, «janubi-g'arb» degan taxmindan sezilarli farq qiladi.  */
  /* Formula beshta shaharning nashr etilgan burchagiga aynan mos keladi.  */
  /*                                                                      */
  /* Telefonning kompasi bo'lsa strelka haqiqiy yo'nalishni ko'rsatadi;    */
  /* bo'lmasa — shimolga nisbatan burchak raqam bilan aytiladi. Yolg'on    */
  /* aniqlik ko'rsatmaymiz: kompas yo'q bo'lsa, yo'qligini aytamiz.        */
  /* ------------------------------------------------------------------ */
  let heading = null, orientOff = null;
  /* Ruxsat tugmasi faqat rostdan kerak bo'lganda ko'rinadi. Chrome ham
     requestPermission ni e'lon qiladi, lekin so'ramasdan ham ma'lumot beradi —
     shuning uchun avval tinglab ko'ramiz va tugmani faqat hech narsa
     kelmagandagina ko'rsatamiz. */
  const canAsk = () => typeof DeviceOrientationEvent !== 'undefined'
    && typeof DeviceOrientationEvent.requestPermission === 'function';
  const needPerm = () => canAsk() && heading === null && !D.ui.qiblaOk;

  function qiblaDeg() { const c = D.prayer.conf(); return D.prayer.qibla(c.lat, c.lng); }

  function qiblaDial(deg) {
    let ticks = '';
    for (const a of [90, 180, 270]) ticks += `<line x1="80" y1="14" x2="80" y2="24" stroke="var(--line3)" stroke-width="2.5" stroke-linecap="round" transform="rotate(${a} 80 80)"/>`;
    return `<div class="ib-qib-dial" id="ibQibDial">
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r="77" fill="var(--card2)" stroke="var(--line2)" stroke-width="2"/>
        <g id="ibQibRose">${ticks}<text x="80" y="32" text-anchor="middle" font-size="17" font-weight="700" fill="var(--danger)">N</text></g>
        <g id="ibQibNeedle" transform="rotate(${deg.toFixed(1)} 80 80)">
          <line x1="80" y1="80" x2="80" y2="30" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
          <rect x="70" y="14" width="20" height="20" rx="3" fill="var(--text)"/>
          <rect x="70" y="19" width="20" height="4" fill="#E0A82E"/>
          <circle cx="80" cy="80" r="8" fill="var(--card-bg)" stroke="var(--text)" stroke-width="4"/>
        </g>
      </svg>
    </div>`;
  }

  function qiblaCard() {
    const deg = qiblaDeg();
    const live = heading !== null;
    const shown = live ? (deg - heading + 360) % 360 : deg;
    return `<div class="card ib-qib">
      ${qiblaDial(shown)}
      <div class="ib-qib-b">
        <h2 class="title">${esc(t('ib.qib.title'))}</h2>
        <div class="ib-qib-deg num">${esc(D.fmtNum(Math.round(deg)))}°</div>
        <div class="ib-qib-n">${esc(live ? t('ib.qib.live') : t('ib.qib.cw'))}</div>
        ${needPerm() ? `<button class="btn ghost sm ib-qib-btn" data-act="ibQiblaOn">${esc(t('ib.qib.enable'))}</button>` : live ? `<span class="pill good">${D.ic('compass', 13)} ${esc(t('ib.qib.on'))}</span>` : ''}
      </div>
    </div>`;
  }


  /* Strelka soniyada o'nlab marta yangilanadi — sahifani qayta chizmaymiz,
     faqat bitta elementning burilishini o'zgartiramiz. */
  function onOrient(e) {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;      // iOS: allaqachon shimoldan
    else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;           // boshqalar: alpha teskari
    if (h === null || isNaN(h)) return;
    const first = heading === null;
    heading = (h + 360) % 360;
    const n = D.$('#ibQibNeedle');
    if (n) n.setAttribute('transform', `rotate(${((qiblaDeg() - heading + 360) % 360).toFixed(1)} 80 80)`);
    if (first && D.current() === 'prayer') D.rerender();   // sarlavhadagi holat bir marta yangilansin
  }
  function bindOrient() {
    unbindOrient();
    if (typeof window === 'undefined' || !window.addEventListener) return;
    const ev = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(ev, onOrient, true);
    orientOff = () => window.removeEventListener(ev, onOrient, true);
  }
  function unbindOrient() { if (orientOff) { orientOff(); orientOff = null; } heading = null; }
  D.act.ibQiblaOn = async () => {
    try {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r !== 'granted') { D.toast(t('ib.qib.denied')); return; }
      D.ui.qiblaOk = true; D.saveUi(); bindOrient(); D.rerender();
    } catch (e) { D.toast(t('ib.qib.denied')); }
  };

  /* ------------------------------------------------------------------ */
  /* SAHARLIK VA IFTORLIK — faqat Ramazonda                               */
  /* Ikkala vaqt ham jadvalda bor, lekin ro'zador kun davomida aynan shu   */
  /* ikkitasiga qaraydi. Ramazonda ular tepaga chiqadi va qolgan vaqtgacha */
  /* sanoq ko'rsatiladi.                                                   */
  /* ------------------------------------------------------------------ */
  function suhoorCard(k) {
    if (!D.hijri.isRamadan(k) || k !== D.today()) return '';
    const tm = timesOf(k); if (!tm) return '';
    const now = nowMins();
    const sah = tm.bomdod, ift = tm.shom;
    const nextIsIftar = now >= sah && now < ift;
    const left = nextIsIftar ? ift - now : (now < sah ? sah - now : 1440 - now + sah);
    return `<div class="card ib-sahar">
      <div class="ib-sahar-row">
        <div class="ib-sahar-one ${!nextIsIftar ? 'on' : ''}">
          <div class="eyebrow">${esc(t('ib.sahar'))}</div>
          <div class="ib-sahar-t num">${esc(D.prayer.fmt(sah))}</div>
        </div>
        <div class="ib-sahar-sep"></div>
        <div class="ib-sahar-one ${nextIsIftar ? 'on' : ''}">
          <div class="eyebrow">${esc(t('ib.iftor'))}</div>
          <div class="ib-sahar-t num">${esc(D.prayer.fmt(ift))}</div>
        </div>
      </div>
      <div class="ib-sahar-left">${esc(t(nextIsIftar ? 'ib.toIftor' : 'ib.toSahar', { t: D.fmtMins(left) }))}</div>
    </div>`;
  }

  function renderTimes() {
    const k = timesKey();
    // Sanoq faqat bugun uchun ma'noli: boshqa kunni ko'rayotganda bosh karta «hozir»ni,
    // ro'yxat esa o'sha kunni ko'rsatib, bir ekranda ikki xil kun chiqib qolardi.
    const hero = k === D.today() ? safe(heroHtml) : '';
    return ramadanBanner(k) + hero + safe(qzBanner) + safe(() => suhoorCard(k)) + safe(() => prayersCard(k)) + safe(() => weekCard(k)) + safe(qiblaCard) + placeBar();
  }

  /* ------------------------------------------------------------------ */
  /* 4. RO'ZA                                                            */
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
    const banned = D.hijri.forbiddenFast(td);
    // keyingi sunnat ro'za kuni (ertadan boshlab 60 kun ichida)
    const next = memo('nextSunnah', td, () => { for (let i = 1; i <= 60; i++) { const k = D.addDays(td, i), f = D.hijri.sunnahFast(k); if (f) return { k, f }; } return null; });
    const types = D.hijri.isRamadan(td) ? FTYPES : FTYPES.filter((f) => f !== 'ramadan');
    return `<div class="card ib-fs">
      <div class="card-head"><h2 class="title">${esc(t('ib.fastToday'))}</h2><span class="pill num">${esc(D.hijri.fmt(td).replace(/\s+\d{4}$/, ''))}</span></div>
      <p class="ib-fs-t">${esc(banned ? t('ib.fs.banned') : sug ? t('ib.fs.is', { f: t('ib.f.' + sug) }) : t('ib.fs.not'))}</p>
      ${next ? `<p class="ib-fs-n">${esc(t('ib.fs.next', { d: D.fmtDate(next.k, 'weekday'), f: t('ib.f.' + next.f) }))}</p>` : ''}
      <div class="ib-fs-row"><b>${esc(t('ib.fasted'))}</b>
        <button class="toggle${done ? ' on' : ''}" data-act="ibFastToggle" data-key="${td}" role="switch" aria-checked="${done ? 'true' : 'false'}" aria-label="${esc(t('ib.fasted'))}" ${banned && !done ? 'disabled' : ''}></button></div>
      ${done ? `<div class="chips ib-fs-chips">${types.map((f) => `<button class="chip${type === f ? ' on' : ''}" data-act="ibFastType" data-type="${f}" aria-pressed="${type === f}">${esc(t('ib.ft.' + f))}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  function ramadanCard() {
    const td = D.today();
    if (!D.hijri.isRamadan(td)) {
      const n = memo('toRamadan', td, () => { let k = td; for (let i = 0; i < 400; i++) { if (D.hijri.isRamadan(k)) return i; k = D.addDays(k, 1); } return null; });
      if (n === null) return '';
      const first = D.addDays(td, n), h = D.hijri.fromKey(first);
      return `<div class="card hero hero--uyqu ib-rm">
        <span class="ico ib-rm-ic">${D.ic('moon', 22)}</span>
        <div><div class="ib-rm-l">${esc(t('ib.rm.until'))}</div><div class="ib-rm-n num">${esc(t('ib.rm.days', { n }))}</div>
          <div class="ib-rm-d num">${esc(D.fmtDate(first))} ${first.slice(0, 4)}${h ? ' · ' + esc(t('ib.rm.first', { y: h.y })) : ''}</div></div>
      </div>`;
    }
    const hm = hijriMonth(td); if (!hm) return '';
    let n = 0;
    for (let i = 0; i < hm.len; i++) if (fasted(D.addDays(hm.start, i))) n++;
    const d = hm.h.d, perDay = Math.round((PAGES / hm.len) * 10) / 10, page = Math.min(PAGES, Math.round((d * PAGES) / hm.len)), juz = Math.min(JUZ, Math.ceil((d * JUZ) / hm.len));
    return `<div class="card hero hero--uyqu ib-ramadan">
      <div class="ib-h-top"><h2>${esc(t('ib.ramadanMode'))}</h2><span class="hero-pill num">${esc(t('ib.ramadanDay', { d }))}</span></div>
      <div class="ib-big"><b class="num">${n}</b><span class="num">/ ${hm.len} · ${esc(t('ib.ramadanProgress'))}</span></div>
      <span class="bar md ib-bar-violet"><i class="bar-fill" style="width:${((n / hm.len) * 100).toFixed(1)}%"></i></span>
      <div class="ib-rm-kh"><b>${esc(t('ib.khatm'))}</b><span>${esc(t('ib.khatmHint', { p: perDay, page, juz }))}</span></div>
      ${d > hm.len - 10 ? `<div class="advice ib-rm-ten">${D.ic('sparkles', 18)}<span>${esc(t('ib.lastTen'))}</span></div>` : ''}
    </div>`;
  }
  /* Hijriy oy jadvali: 7 ustun (Du–Ya), kun hafta kuniga to'g'rilab qo'yiladi. */
  function monthGrid() {
    const td = D.today(), hm = hijriMonth(td); if (!hm) return '';
    const W = t('weekdaysShort');
    let n = 0, cells = '';
    const lead = (D.dowOf(hm.start) + 6) % 7;
    for (let i = 0; i < lead; i++) cells += '<i class="ib-hcell pad"></i>';
    for (let i = 0; i < hm.len; i++) {
      const k = D.addDays(hm.start, i);
      const future = k > td;
      const rec = fastRec(k), done = !!(rec && rec.done);
      if (done) n++;
      const sug = D.hijri.sunnahFast(k);
      const cls = ['ib-hcell', done ? 'done ib-f-' + (FTYPES.includes(rec.type) ? rec.type : 'sunnah') : '', k === td ? 'today' : '', sug && sug !== 'ramadan' ? 'sug' : '', future ? 'future' : ''].join(' ');
      cells += `<button class="${cls}" data-act="ibFastToggle" data-key="${k}" ${future ? 'disabled' : ''} aria-pressed="${done}" aria-label="${esc(D.fmtDate(k))}${sug ? ' · ' + esc(t('ib.f.' + sug)) : ''}"><span class="num">${i + 1}</span></button>`;
    }
    const head = [1, 2, 3, 4, 5, 6, 0].map((d) => `<i>${esc(W[d])}</i>`).join('');
    const LEG = { sunnah: 'sunnah', qaza: 'qaza', nafl: 'nafl' };
    const legend = Object.keys(LEG).concat(D.hijri.isRamadan(td) ? ['ramadan'] : []).map((f) => `<span><i class="ib-lg ib-f-${f}"></i>${esc(t('ib.ft.' + f))}</span>`).join('')
      + `<span><i class="ib-lg dotg"></i>${esc(t('ib.mg.sug'))}</span>`;
    return `<div class="card ib-mg">
      <div class="card-head"><h2 class="title">${esc(D.t('hijri.months')[hm.h.m - 1])} ${hm.h.y}</h2><span class="ib-cnt num">${esc(t('ib.mg.count', { n }))}</span></div>
      <div class="ib-hhead">${head}</div>
      <div class="ib-hgrid">${cells}</div>
      <div class="legend ib-mg-l">${legend}</div>
    </div>`;
  }
  const fastOwed = () => { const d = D.S.fasting._debt; return d && typeof d === 'object' ? Math.max(0, Math.floor(+d.owed || 0)) : 0; };
  function fastLedger() {
    const owed = fastOwed();
    const logged = memo('qazaFasts', stateSig(), () => { let n = 0; for (const k of Object.keys(D.S.fasting)) { if (!isDay(k)) continue; const r = D.S.fasting[k]; if (r && r.done && r.type === 'qaza') n++; } return n; });
    const rem = Math.max(0, owed - logged);
    const todayRec = fastRec(D.today()), todayQaza = !!(todayRec && todayRec.done && todayRec.type === 'qaza');
    const days = (n) => esc(t('ib.fq.days', { n: D.fmtNum(n) }));
    return `<div class="card ib-fq">
      <div class="card-head"><h2 class="title">${esc(t('ib.qazaFast'))}</h2></div>
      <div class="ptiles">
        <button type="button" class="ptile flat ib-fq-edit" data-act="ibFastOwedAsk"><span class="ptile-l">${esc(t('ib.fq.owed'))}</span><span class="ptile-v num">${days(owed)}</span><span class="ptile-n">${esc(t('ib.fq.tapEdit'))}</span></button>
        <div class="ptile flat ib-fq-g"><span class="ptile-l">${esc(t('ib.fq.done'))}</span><span class="ptile-v num">${days(logged)}</span></div>
        <div class="ptile flat ib-fq-w"><span class="ptile-l">${esc(t('ib.fq.left'))}</span><span class="ptile-v num">${days(rem)}</span></div>
      </div>
      <span class="bar md ib-bar-good ib-fq-bar"><i class="bar-fill" style="width:${owed ? D.clamp((logged / owed) * 100, 0, 100).toFixed(1) : 0}%"></i></span>
      <div class="ib-fq-f">
        <button class="btn ghost ib-fq-undo" data-act="ibFastQazaUndo" ${todayQaza ? '' : 'disabled'}>${esc(t('ib.fq.undo'))}</button>
        <button class="btn main" data-act="ibFastQazaAdd" ${todayQaza ? 'disabled' : ''}>${D.ic('plus', 20)} ${esc(t('ib.fq.add'))}</button>
      </div>
    </div>`;
  }
  const renderFasting = () => safe(fastTodayCard) + safe(ramadanCard) + safe(monthGrid) + safe(fastLedger);

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
  function setFastOwed(raw) {
    const v = D.clamp(Math.floor(+raw || 0), 0, 9999);
    const d = D.S.fasting._debt && typeof D.S.fasting._debt === 'object' ? D.S.fasting._debt : {};
    d.owed = v; D.S.fasting._debt = d;
    D.save(); D.rerender();
  }
  D.act.ibFastOwed = (el) => setFastOwed(el.value);
  D.act.ibFastOwedAsk = async () => {
    const v = await D.prompt({ title: t('ib.fq.ask'), value: String(fastOwed() || ''), type: 'number' });
    if (v === null) return;
    setFastOwed(String(v).replace(',', '.'));
  };
  /* «Bitta qazo ro'za tutdim» — bugungi kunni qazo ro'za qilib belgilaydi
     (S.fasting[bugun] = {type:'qaza', done:true}); hisob shu yozuvlardan
     sanaladi, alohida hisoblagich yo'q. «Bekor» o'sha yozuvni oladi. */
  D.act.ibFastQazaAdd = () => {
    const td = D.today(), r = fastRec(td);
    /* Bugun allaqachon ro'za belgilangan bo'lsa — tegilmaydi. Ilgari boshqa
       turdagi ro'za jimgina qazoga aylanardi va «Bekor» uni butunlay
       o'chirardi: Ramazon kuni hisobdan tushib qolardi. Turini almashtirish
       «Bugun ro'za» kartasidagi chiplar bilan qilinadi. */
    if (r && r.done) { D.toast(t('ib.fq.already')); return; }
    D.S.fasting[td] = { type: 'qaza', done: true };
    haptic('success'); D.save(); D.rerender(); D.toast(t('ib.fq.added'));
  };
  D.act.ibFastQazaUndo = () => {
    const td = D.today(), r = fastRec(td);
    if (!(r && r.done && r.type === 'qaza')) return;
    delete D.S.fasting[td];
    haptic(); D.save(); D.rerender(); D.toast(t('ib.fq.undone'));
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
    // waqt rolled over (next prayer changed) → hero name/time/list are stale: full rerender
    if (lastId && hs.nx.id !== lastId) { stopTimer(); D.rerender(); return; }
    lastId = hs.nx.id;
    if (hs.secs <= 0) { stopTimer(); D.rerender(); return; }
    const m = hs.nx.minsLeft;
    if (m !== lastMin) {
      lastMin = m;
      D.patch('ibCountdown', countHtml(hs.secs / 60));
      try { D.patch('ibDayLine', dayLine(D.today(), hs)); } catch (e) {}
    }
  }

  function render() {
    // Eski «Qayd» havolasi (#prayer/log): namoz endi shu sahifaning o'zida belgilanadi.
    if (D.ui.sub.prayer === 'log') { D.ui.sub.prayer = 'times'; D.saveUi(); }
    const s = sub();
    const body = s === 'qaza' ? safe(renderQaza) : s === 'fasting' ? safe(renderFasting) : safe(renderTimes);
    // No AI here: ibodat is for marking and reading times, not for advice.
    return `<div class="ib">${segHtml()}${body}</div>`;
  }

  D.view({
    id: 'prayer', icon: 'mosque', order: 40, nav: true, primary: true,
    subtitle() { return sub() === 'times' ? daySub() : esc(D.fmtDate(D.today())) + ' · ' + esc(D.hijri.fmt(D.today())); },
    /* Sarlavha o'ngida shahar pilli — bosilsa shahar tanlash oynasi. */
    topRight() { return `<button class="head-pill" data-act="ibPickPlace">${D.ic('pin', 15)}<span>${esc(placeName())}</span></button>`; },
    render,
    mount() {
      stopTimer();
      const s = sub();
      if (s === 'times' && timesKey() === D.today()) { tick(); timer = setInterval(tick, 1000); }
      // Kompas faqat Vaqtlar sahifasida tinglanadi: boshqa joyda u batareyani
      // bekorga yeydi va hech narsa ko'rsatmaydi.
      if (s === 'times') bindOrient(); else unbindOrient();
      bindSwipe();
    },
    unmount() { stopTimer(); unbindSwipe(); unbindOrient(); },
  });

  D.on('day:changed', () => { F().ibTimesDate = null; D.saveUi(); if (D.current() === 'prayer') D.rerender(); });
})();
