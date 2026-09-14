/* =====================================================================
   Ibodat — prayer times · prayer log + qaza ledger · fasting
   view id 'prayer'. Reads D.prayer / D.hijri (prayer.js); mirrors prayer
   states into the ПЕШИН/АСР/ШОМ/БОМДОД/ХУФТОН habits (same rule as today.js).
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'ib.sub.times': 'Vaqtlar', 'ib.sub.log': 'Qayd', 'ib.sub.fasting': "Ro'za", 
      'ib.next': 'Keyingi namoz', 'ib.left': 'qoldi', 'ib.current': 'Joriy vaqt', 'ib.night': 'Tun', 
      'ib.timesFor': 'Namoz vaqtlari', 'ib.backToday': 'Bugunga', 
      'ib.ramadan': 'Ramazon muborak!', 'ib.ramadanDay': 'Ramazon, {d}-kun',
      'ib.method': 'Hisoblash usuli', 
      'ib.logTitle': 'Namoz qaydi', 'ib.loggedN': '{n}/5 qayd', 'ib.allJamaat': 'Hammasi jamoat',
      'ib.qib.title': 'Qibla', 'ib.qib.fromN': 'shimoldan', 'ib.qib.on': 'Kompas yoqilgan',
      'ib.qib.live': 'Telefonni tekis ushlang \u2014 strelka qiblani ko\u2018rsatadi.',
      'ib.qib.static': 'Kompas yo\u2018q \u2014 shimoldan {d}\u00b0 o\u2018ngga buriling.',
      'ib.qib.enable': 'Kompasni yoqish', 'ib.qib.denied': 'Kompasga ruxsat berilmadi',
      'ib.sahar': 'Saharlik tugaydi', 'ib.iftor': 'Iftorlik',
      'ib.toSahar': 'Saharlikka {t} qoldi', 'ib.toIftor': 'Iftorlikka {t} qoldi',
      'ib.trackTitle': 'Oylik jadval', 'ib.trackDays': '{n} kun',
      
      'ib.st.jamaat': 'Jamoat', 'ib.st.alone': 'Yakka', 'ib.st.qaza': 'Qazo', 'ib.st.missed': "O'tkazib",
      'ib.qazaHint': 'qazo?',
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
      'ib.sub.times': 'Вақтлар', 'ib.sub.log': 'Қайд', 'ib.sub.fasting': 'Рўза', 
      'ib.next': 'Кейинги намоз', 'ib.left': 'қолди', 'ib.current': 'Жорий вақт', 'ib.night': 'Тун', 
      'ib.timesFor': 'Намоз вақтлари', 'ib.backToday': 'Бугунга', 
      'ib.ramadan': 'Рамазон муборак!', 'ib.ramadanDay': 'Рамазон, {d}-кун',
      'ib.method': 'Ҳисоблаш усули', 
      'ib.logTitle': 'Намоз қайди', 'ib.loggedN': '{n}/5 қайд', 'ib.allJamaat': 'Ҳаммаси жамоат',
      'ib.qib.title': 'Қибла', 'ib.qib.fromN': 'шимолдан', 'ib.qib.on': 'Компас ёқилган',
      'ib.qib.live': 'Телефонни текис ушланг \u2014 стрелка қиблани кўрсатади.',
      'ib.qib.static': 'Компас йўқ \u2014 шимолдан {d}\u00b0 ўнгга бурилинг.',
      'ib.qib.enable': 'Компасни ёқиш', 'ib.qib.denied': 'Компасга рухсат берилмади',
      'ib.sahar': 'Саҳарлик тугайди', 'ib.iftor': 'Ифторлик',
      'ib.toSahar': 'Саҳарликка {t} қолди', 'ib.toIftor': 'Ифторликка {t} қолди',
      'ib.trackTitle': 'Ойлик жадвал', 'ib.trackDays': '{n} кун',
      
      'ib.st.jamaat': 'Жамоат', 'ib.st.alone': 'Якка', 'ib.st.qaza': 'Қазо', 'ib.st.missed': 'Ўтказиб',
      'ib.qazaHint': 'қазо?',
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
      'ib.sub.times': 'Время', 'ib.sub.log': 'Журнал', 'ib.sub.fasting': 'Пост', 
      'ib.next': 'Следующий намаз', 'ib.left': 'осталось', 'ib.current': 'Сейчас', 'ib.night': 'Ночь', 
      'ib.timesFor': 'Время намазов', 'ib.backToday': 'Сегодня', 
      'ib.ramadan': 'Рамадан мубарак!', 'ib.ramadanDay': 'Рамадан, день {d}',
      'ib.method': 'Метод расчёта', 
      'ib.logTitle': 'Журнал намазов', 'ib.loggedN': '{n}/5 отмечено', 'ib.allJamaat': 'Все в джамаате',
      'ib.qib.title': 'Кибла', 'ib.qib.fromN': 'от севера', 'ib.qib.on': 'Компас включён',
      'ib.qib.live': 'Держите телефон ровно \u2014 стрелка укажет киблу.',
      'ib.qib.static': 'Компаса нет \u2014 повернитесь на {d}\u00b0 вправо от севера.',
      'ib.qib.enable': 'Включить компас', 'ib.qib.denied': 'Доступ к компасу не разрешён',
      'ib.sahar': 'Сухур заканчивается', 'ib.iftor': 'Ифтар',
      'ib.toSahar': 'До сухура {t}', 'ib.toIftor': 'До ифтара {t}',
      'ib.trackTitle': 'Месячная таблица', 'ib.trackDays': '{n} дн.',
      
      'ib.st.jamaat': 'Джамаат', 'ib.st.alone': 'Один', 'ib.st.qaza': 'Каза', 'ib.st.missed': 'Пропущен',
      'ib.qazaHint': 'каза?',
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
      'ib.statOntime': "O'z vaqtida",
      'ib.statJamaat': 'Jamoat',
      'ib.statStreak': 'Seriya',
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
      'ib.statOntime': 'Ўз вақтида',
      'ib.statJamaat': 'Жамоат',
      'ib.statStreak': 'Серия',
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
      'ib.statOntime': 'Вовремя',
      'ib.statJamaat': 'Джамаат',
      'ib.statStreak': 'Серия',
      'ib.qzMore': 'Настройки каза',
      'ib.ishroq': 'Ишрак с {t}', 'ib.ishroqHint': 'после восхода {n} мин намаз не читается',
      'ib.findCity': 'Введите название города',
      'ib.cityNone': 'Такого города в списке нет',
      'ib.source': 'Совпадает с календарём islom.uz',
      'ib.sourceOn': 'проверено {d}',
      'ib.sourceGeo': 'Метод islom.uz · по вашим координатам',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const esc = D.esc, t = D.t;
  const PR = D.PRAYERS;
  const STATES = ['jamaat', 'alone', 'qaza']; // 'missed' olib tashlandi — eski yozuvlar o'z holicha qoladi
  const SUBS = ['times', 'log', 'qaza', 'fasting'];
  const FTYPES = ['ramadan', 'sunnah', 'qaza', 'nafl'];
  const NEXT_OF = { bomdod: 'quyosh', peshin: 'asr', asr: 'shom', shom: 'xufton' };
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
    // Debt number, today's repayments, and the rest folded away underneath.
    // The trend/pace/calendar charts were noise beside the one action that matters.
    const open = !!D.ui.collapsed.ibQzSet;
    const more = `<button class="ib-more ${open ? 'on' : ''}" data-act="ibQzMore" aria-expanded="${open}">
      ${D.ic('gear', 15)}<span class="grow">${esc(t('ib.qzMore'))}</span>${D.ic('chevD', 15)}</button>`;
    return qzHero() + (o.total ? qzPayCard() : '') + more + (open ? qzSetupCard() : '');
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

  /* date steppers (device-only) */
  function timesKey() { const k = F().ibTimesDate; return isDay(k) ? k : D.today(); }
  function logKey() { const td = D.today(), k = F().ibLogDate; return isDay(k) && k < td ? k : td; }
  /* Sana — tepa panelning chekkasida ikkita strelka. Kun va hijriy sana
     sarlavha ostida yozilib turadi, shuning uchun sahifa ustida alohida
     qator kerak emas: u sanani ikkinchi marta aytardi. */
  /* Kun o'qi — sahifaning ichida, tepa panelda emas. Ibodatda kunni
     almashtirishning boshqa yo'li yo'q: yon tomonga surish bo'limchani
     almashtiradi, kunni emas. */
  function dayBar(which) {
    const td = D.today(), k = which === 'log' ? logKey() : timesKey();
    const fwdOff = which === 'log' && k === td;
    return `<div class="ib-daybar">
      <button class="btn ghost sq sm" data-act="ibShift" data-which="${which}" data-n="-1" aria-label="${esc(t('ib.prevDay'))}">${D.ic('chevL', 16)}</button>
      <div class="ib-daybar-l">${esc(D.fmtDate(k, 'weekday'))}</div>
      <button class="btn ghost sq sm" data-act="ibShift" data-which="${which}" data-n="1" ${fwdOff ? 'disabled' : ''} aria-label="${esc(t('ib.nextDay'))}">${D.ic('chevR', 16)}</button>
    </div>`;
  }
  /* Tepa paneldagi izoh qatori: hijriy sana va «bugunga qaytish».
     Milodiy kun bu yerdan olib tashlandi — u sahifaning o'z kun o'qida
     (dayBar) yozilib turadi va ikki joyda takrorlanishi shart emas. */
  function daySub(which) {
    const td = D.today(), k = which === 'log' ? logKey() : timesKey();
    const hint = k === td ? t('common.today') : k === D.addDays(td, -1) ? t('common.yesterday') : '';
    return esc(D.hijri.fmt(k)) + (hint ? ' · ' + esc(hint) : '')
      + (k === td ? '' : ` · <button class="top-link" data-act="ibToday" data-which="${which}">${esc(t('ib.backToday'))}</button>`);
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

  /* ------------------------------------------------------------------ */
  /* section switcher — a thumb-reach dial above the main tab bar.       */
  /* The four labels fan out along a quarter arc; the dial itself always */
  /* shows where you are, so the top of the page stays free for content. */
  /* ------------------------------------------------------------------ */
  const SUB_ICON = { times: 'clock', log: 'check', qaza: 'flag', fasting: 'moon' };
  let dialOpen = false;   // ephemeral: never persisted, always closed on a fresh load
  const SUB_LABEL = { times: 'ib.sub.times', log: 'ib.sub.log', qaza: 'ib.sub.qaza', fasting: 'ib.sub.fasting' };
  function dialHtml() {
    const cur = sub(), open = dialOpen;
    const items = SUBS.map((x, i) => `<button class="ib-dial-item ${cur === x ? 'on' : ''}" style="--i:${i}"
        data-act="ibDial" data-sub="${x}" tabindex="${open ? 0 : -1}">
        <span class="ib-dial-lbl">${esc(t(SUB_LABEL[x]))}</span>
        <i class="ib-dial-ic">${D.ic(SUB_ICON[x], 17)}</i>
      </button>`).join('');
    return `<div class="ib-dial ${open ? 'open' : ''}">
      <button class="ib-dial-scrim" data-act="ibDial" tabindex="-1" aria-label="${esc(t('btn.close'))}"></button>
      <div class="ib-dial-items">${items}</div>
      <button class="ib-dial-btn" data-act="ibDial" aria-expanded="${open}">
        <i class="ib-dial-cur">${D.ic(SUB_ICON[cur], 21)}</i>
        <span class="ib-dial-now">${esc(t(SUB_LABEL[cur]))}</span>
      </button>
    </div>`;
  }
  D.act.ibDial = (el) => {
    const to = el.dataset.sub;
    if (to && SUBS.includes(to)) { dialOpen = false; haptic(); D.go('prayer', to); return; }
    dialOpen = !dialOpen; haptic(); D.rerender();
  };
  // swiping the page left/right is the second way through the same four sections
  function swipeTo(dir) {
    const i = SUBS.indexOf(sub()), n = D.clamp(i + dir, 0, SUBS.length - 1);
    if (n === i) return;
    dialOpen = false; haptic(); D.go('prayer', SUBS[n]);
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
      if (e.target && e.target.closest && e.target.closest('.trk-scroll, [data-noswipe]')) { live = false; return; }
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
  const heroRing = (pct) => D.chart.ring({ pct, size: 84, stroke: 8, color: 'var(--accent)', label: D.ic('mosque', 22), sub: D.fmtPct(pct) });
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
      // Quyosh namoz vaqti emas — makruh oynasi qachon tugashini shu yerda aytamiz
      const sub = x.id === 'quyosh' ? `<span class="ib-time-sub">${esc(t('ib.ishroq', { t: D.prayer.fmt(D.prayer.ishroq(k)) }))}</span>` : '';
      return `<div class="${cls}"><i class="ib-time-dot"></i><span class="ib-time-name">${esc(t('prayer.' + x.id))}${sub}</span>${stHtml}<span class="ib-time-val num">${x.time}</span></div>`;
    }).join('');
    const duha = isToday && cur === 'quyosh'
      ? `<div class="ib-note">${D.ic('sun', 13)} ${esc(t('ib.ishroqHint', { n: 20 }))}</div>` : '';
    // Namoz vaqti — ishonch masalasi. Qayerdan kelgani va qachon solishtirilgani ko'rinib tursin.
    // Ro'yxatdagi shaharda jadval islom.uz bilan aynan bir xil; GPS bilan esa
    // hisob o'sha nuqtaga bo'ladi — buni "bir xil" deb aytish to'g'ri bo'lmaydi.
    const src = D.prayer.listed()
      ? `<div class="ib-src">${D.ic('check', 13)}<span>${esc(t('ib.source'))} <span class="muted">· ${esc(t('ib.sourceOn', { d: D.fmtDate(VERIFIED) }))}</span></span></div>`
      : `<div class="ib-src geo">${D.ic('compass', 13)}<span>${esc(t('ib.sourceGeo'))}</span></div>`;
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.timesFor'))}</div><div class="title">${esc(D.fmtDate(k, 'weekday'))}</div></div>
        <span class="pill">${D.ic('moon', 12)} ${esc(D.hijri.fmt(k))}</span></div>
      <div class="ib-times">${rows}</div>${duha}${src}
    </div>`;
  }
  /* Joylashuv — vaqtning eng muhim sharti, shuning uchun jadval ostida
     bitta qatorda turadi: shahar, GPS, va yig'ilgan usul sozlamalari. */
  function placeName() {
    const c = D.prayer.conf();
    if (c.place) return c.place;
    const near = D.prayer.nearest(c.lat, c.lng);
    return near ? near.n : D.round(c.lat, 2) + '\u00b0, ' + D.round(c.lng, 2) + '\u00b0';
  }
  function placeBar() {
    const open = !!D.ui.collapsed.ibPrayerSet;
    const body = open && D.settings && D.settings.prayerCard ? `<div class="ib-set-body">${D.settings.prayerCard()}</div>` : '';
    const busy = !!D.ui.ibGeoBusy;
    return `<div class="ib-place">
      <button class="ib-place-main" data-act="ibPickPlace">
        ${D.ic('compass', 15)}
        <span class="ib-place-name">${esc(busy ? t('ib.geoWait') : placeName())}</span>
        <span class="ib-place-hint">${esc(t('ib.placeChange'))}</span>
      </button>
      <button class="ib-place-btn ${busy ? 'busy' : ''}" data-act="ibGeo" aria-label="${esc(t('ib.useGeo'))}">${D.ic('target', 16)}</button>
      <button class="ib-place-btn ${open ? 'on' : ''}" data-act="ibSetToggle" aria-expanded="${open}" aria-label="${esc(t('ib.method'))}">${D.ic('gear', 16)}</button>
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
        <input class="inp ib-city-find" id="ibCityFind" type="search" autocomplete="off" placeholder="${esc(t('ib.findCity'))}">
        <div id="ibCityList">${cityRows('')}</div>`,
      onOpen: () => {
        const inp = D.$('#ibCityFind'), list = D.$('#ibCityList');
        if (!inp || !list) return;
        inp.addEventListener('input', () => { list.innerHTML = cityRows(inp.value); });
      },
    });
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
    const marks = [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']].map(([a, l]) =>
      `<g transform="rotate(${a} 80 80)"><line x1="80" y1="10" x2="80" y2="17" stroke="var(--line3)" stroke-width="2"/>
        <text x="80" y="30" text-anchor="middle" font-size="11" fill="var(--text3)" transform="rotate(${-a} 80 ${24})">${l}</text></g>`).join('');
    let ticks = '';
    for (let a = 0; a < 360; a += 15) if (a % 90) ticks += `<line x1="80" y1="11" x2="80" y2="15" stroke="var(--line2)" stroke-width="1.5" transform="rotate(${a} 80 80)"/>`;
    return `<div class="ib-qib-dial" id="ibQibDial">
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r="72" fill="none" stroke="var(--line)" stroke-width="1.5"/>
        <g id="ibQibRose">${ticks}${marks}</g>
        <g id="ibQibNeedle" transform="rotate(${deg.toFixed(1)} 80 80)">
          <path d="M80 20 L89 78 L80 72 L71 78 Z" fill="var(--accent)"/>
          <circle cx="80" cy="80" r="4" fill="var(--accent)"/>
        </g>
      </svg>
      <div class="ib-qib-kaaba">\u{1F54B}</div>
    </div>`;
  }

  function qiblaCard() {
    const deg = qiblaDeg();
    const live = heading !== null;
    const shown = live ? (deg - heading + 360) % 360 : deg;
    const note = live ? t('ib.qib.live')
      : needPerm() ? ''
      : t('ib.qib.static', { d: D.fmtNum(deg, 1) });
    return `<div class="card ib-qib">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.qib.title'))}</div>
        <div class="title num">${esc(D.fmtNum(deg, 1))}° <span class="muted">${esc(t('ib.qib.fromN'))}</span></div></div>
        ${live ? `<span class="pill good">${D.ic('compass', 12)} ${esc(t('ib.qib.on'))}</span>` : ''}</div>
      ${qiblaDial(shown)}
      ${note ? `<div class="ib-note">${esc(note)}</div>` : ''}
      ${needPerm() ? `<button class="btn ghost sm block" data-act="ibQiblaOn">${D.ic('compass', 15)} ${esc(t('ib.qib.enable'))}</button>` : ''}
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
    // Sanoq faqat bugun uchun ma'noli: boshqa kunni ko'rayotganda hero "hozir"ni,
    // jadval esa o'sha kunni ko'rsatib, bir ekranda ikki xil kun chiqib qolardi.
    const hero = k === D.today() ? heroHtml() : '';
    return ramadanBanner(k) + hero + safe(() => suhoorCard(k)) + timesTable(k) + safe(qiblaCard) + placeBar();
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

  /* ------------------------------------------------------------------ */
  /* OYLIK JADVAL — besh qator, o'ttiz ustun                              */
  /*                                                                      */
  /* Bitta kunni belgilash — bu bitta kun. Odam esa oyni ko'rmoqchi:      */
  /* qaysi namoz oqsayapti, qaysi kunlar tushib qolgan. Shuni bitta       */
  /* to'rda ko'rsatamiz: har qator bitta namoz, har ustun bitta kun,      */
  /* o'ng chekkada o'sha namozning oylik soni. Katakni bosish o'sha kunni */
  /* ochadi — ro'yxat yuqorida, holat u yerda tanlanadi.                  */
  /* ------------------------------------------------------------------ */
  const CELL_STATE = { jamaat: 'j', alone: 'a', qaza: 'q', missed: 'x' };
  function monthTrack(k) {
    const td = D.today();
    // O'ttiz kun tanlangan kun bilan tugaydi, lekin kelajakka o'tmaydi
    const last = k > td ? td : k;
    const days = [];
    for (let i = 29; i >= 0; i--) days.push(D.addDays(last, -i));

    const rows = PR.map((id) => {
      let n = 0;
      const cells = days.map((day) => {
        const st = stateOf(day, id);
        if (st === 'jamaat' || st === 'alone') n++;
        return { cls: [st ? CELL_STATE[st] || '' : '', day === k ? 'sel' : '', day === td ? 'today' : ''].join(' '),
          title: D.fmtDate(day) + ' · ' + t('prayer.' + id) + (st ? ' · ' + t('ib.st.' + st) : ''),
          attrs: `data-act="ibTrackDay" data-key="${day}"` };
      });
      return { lab: t('prayer.' + id), cells, n, total: 30 };
    });

    // «O'tkazib» holatini endi qo'lda qo'yib bo'lmaydi (STATES da yo'q), lekin
    // eski yozuvlarda uchraydi. Izohda faqat ko'rinib turgan 30 kunda haqiqatan
    // bor bo'lsa ko'rsatiladi: aks holda izoh mavjud bo'lmagan narsani o'rgatadi.
    const hasMissed = days.some((d) => PR.some((p) => stateOf(d, p) === 'missed'));
    const legend = STATES.concat(hasMissed ? ['missed'] : []).map((x) =>
      `<span><i class="ib-c-${x}" style="background:var(--c)"></i>${esc(t('ib.st.' + x))}</span>`).join('');
    return `<div class="card">
      <div class="card-head"><div><div class="eyebrow">${esc(t('ib.trackTitle'))}</div>
        <div class="title">${esc(D.fmtDate(days[0], 'dm'))} – ${esc(D.fmtDate(days[29], 'dm'))}</div></div>
        <span class="pill">${esc(t('ib.trackDays', { n: 30 }))}</span></div>
      ${D.chart.tracker({ days, rows })}
      <div class="trk-legend">${legend}</div>
    </div>`;
  }
  D.act.ibTrackDay = (el) => {
    const k = el.dataset.key;
    if (!isDay(k) || k > D.today()) return;
    F().ibLogDate = k === D.today() ? null : k;
    D.saveUi(); haptic(); D.rerender();
    // Ro'yxat sahifaning tepasida — bosilgan kun o'sha yerda ochiladi
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  };

  /* One line of numbers under the log — the whole of "how am I doing"
     without a chart. The heavier breakdowns live in Tarix. */
  function statStrip() {
    const days = D.lastDays(30);
    let jam = 0, ontime = 0, logged = 0;
    for (const k of days) {
      const o = D.S.prayers[k]; if (!o || typeof o !== 'object') continue;
      for (const pr of PR) {
        const st = o[pr]; if (!st) continue;
        logged++;
        if (st === 'jamaat') { jam++; ontime++; } else if (st === 'alone') ontime++;
      }
    }
    if (!logged) return '';
    const streak = memo('streak5', stateSig(), () => D.streak(prayerTotals().full));
    const pct = (x) => D.fmtPct((x / logged) * 100);
    return `<div class="ib-strip">
      <span><b class="num">${pct(ontime)}</b>${esc(t('ib.statOntime'))}</span>
      <span><b class="num">${pct(jam)}</b>${esc(t('ib.statJamaat'))}</span>
      <span><b class="num">${D.ic('fire', 13)} ${D.fmtNum(streak)}</b>${esc(t('ib.statStreak'))}</span>
    </div>`;
  }
  function renderLog() {
    const k = logKey();
    return logCard(k) + statStrip() + safe(() => monthTrack(k));
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
      ${done ? `<div class="row wrap mt"><span class="eyebrow">${esc(t('ib.fastType'))}</span>
        <div class="seg compact">${FTYPES.map((f) => `<button class="${type === f ? 'on' : ''}" data-act="ibFastType" data-type="${f}">${esc(t('ib.ft.' + f))}</button>`).join('')}</div></div>` : ''}
    </div>`;
  }
  function ramadanCard() {
    const td = D.today();
    if (!D.hijri.isRamadan(td)) {
      const n = memo('toRamadan', td, () => { let k = td; for (let i = 0; i < 400; i++) { if (D.hijri.isRamadan(k)) return i; k = D.addDays(k, 1); } return null; });
      return n === null ? '' : `<div class="ib-note">${D.ic('moon', 13)} ${esc(t('ib.toRamadan', { n }))}</div>`;
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
    const day = s === 'times' || s === 'log' ? safe(() => dayBar(s)) : '';
    const body = s === 'log' ? safe(renderLog) : s === 'qaza' ? safe(renderQaza) : s === 'fasting' ? safe(renderFasting) : safe(renderTimes);
    // the qaza debt is the one thing that must never be out of sight
    const remind = s === 'qaza' ? '' : safe(qzBanner);
    // No AI here: ibodat is for marking and reading times, not for advice.
    return `<div class="ib">${remind}${day}${body}${safe(dialHtml)}</div>`;
  }

  D.view({
    id: 'prayer', icon: 'mosque', order: 40, nav: true, primary: true,
    subtitle() { const sb = sub(); return sb === 'times' || sb === 'log' ? daySub(sb) : esc(t('ib.sub.' + sb)); },
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
    unmount() { stopTimer(); unbindSwipe(); unbindOrient(); dialOpen = false; },
  });

  D.on('day:changed', () => { F().ibLogDate = null; F().ibTimesDate = null; D.saveUi(); if (D.current() === 'prayer') D.rerender(); });
})();
