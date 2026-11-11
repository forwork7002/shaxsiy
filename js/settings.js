/* =====================================================================
   Dash — Sozlash: bitta sahifa, tab yo'q (2026-09-10).
   Profil kartasi tepada (profile.js cardHtml), ostida YIG'ILADIGAN
   bo'limlar ro'yxati: tana · ilova va vaqt · ovqat · odatlar ·
   kategoriyalar · ma'lumot. Har bo'lim yopiq turganda ham sarlavhasida
   eng kerakli raqamni aytadi (2026-09-16) — ilgari sahifa 5000 px edi va
   kerakli maydonni topish uchun hamma kartani varaqlash kerak bo'lardi.
   Hisob tugmalari (parol, chiqish) sahifaning eng pastida.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* strings                                                             */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {

      'set.lang': 'Til', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Mavzu',
      'set.height': "Bo'y", 'set.weight': 'Vazn',
      'set.sex': 'Jins', 'set.sex.m': 'Erkak', 'set.sex.f': 'Ayol', 'set.activity': 'Faollik',
      'set.act.0': 'Harakatsiz', 'set.act.1': 'Kam harakat', 'set.act.2': 'Yengil', 'set.act.3': "O'rtacha", 'set.act.4': 'Faol', 'set.act.5': 'Juda faol',
      'set.body': 'Tana', 'set.app': 'Ilova', 'set.bmi': 'BMI',
      'set.birthYear': "Tug'ilgan yil", 'set.ageN': '{n} yosh', 'set.goal': 'Maqsad', 'set.goal.lose': 'Vazn tashlash', 'set.goal.keep': 'Saqlash', 'set.goal.gain': 'Vazn olish',
      'set.whoopAgeTitle': 'WHOOP yoshi', 'set.whoopAge': 'WHOOP Age', 'set.paceOfAging': 'Pace of Aging', 'set.whoopAgeHint': 'WHOOP ilovasidan ko‘chiring (Healthspan sahifasi)',
      'set.whoopAgeAt': '{d} holatiga', 'set.onboard': "Savol-javob bilan to'ldirish",
      'set.fd.title': 'Kunlik maqsadlar', 'set.fd.auto': 'Avto', 'set.fd.autoHint': "WHOOP o‘lchagan sarf bo‘lsa o‘shandan, bo‘lmasa bo‘y, vazn, yosh va faollikdan. Maqsad me’yorning ulushi.", 'set.fd.srcMeasured': "WHOOP o'lchagan {n} kunlik haqiqiy sarfdan — {t} kkal/kun", 'set.fd.srcFormula': "Formuladan — {t} kkal/kun; WHOOP 10 kun ma'lumot bersa o'lchangan sarfga o'tadi",
      'set.fd.manualHint': "Qo'lda kiritilgan — «Avto» yoqilsa profil bo'yicha qayta hisoblanadi",
      'set.fd.kcal': 'Kaloriya', 'set.fd.p': 'Oqsil', 'set.fd.c': 'Uglevod', 'set.fd.f': "Yog'", 'set.fd.recalc': 'Qayta hisoblash', 'set.fd.goFood': "Ovqat bo'limiga o'tish",
      'set.fd.needProfile': "Avto hisob uchun profilda bo'y, vazn va tug'ilgan yil kerak",
      'set.tz': 'Vaqt mintaqasi', 'set.tz.browser': 'brauzer',
      'set.waterMl': 'Stakan hajmi', 'set.waterTarget': 'Kunlik suv maqsadi',
      'set.waterAuto': "avto (vazn bo'yicha)", 'set.currency': 'Valyuta',

      'set.h.title': 'Odatlar', 'set.h.count': '{n} faol / {total}',
      'set.h.help': "Belgini bosib faol qiling, nomini bosib jadval va maqsadni o'zgartiring.",
      'set.h.namePh': 'Odat nomi…', 'set.h.sphere': 'Soha', 'set.h.schedule': 'Jadval',
      'set.sch.daily': 'Har kuni', 'set.sch.days': 'Kunlar', 'set.sch.week': 'Haftasiga', 'set.sch.weekN': 'haftasiga {n} marta', 'set.h.perWeek': 'marta haftasiga',
      'set.sch.month': 'Oyiga', 'set.sch.monthN': 'oyiga {n} marta', 'set.h.perMonth': 'marta oyiga',
      'set.h.targetN': 'Miqdor', 'set.h.unit': 'Birlik', 'set.h.unitPh': 'sahifa, daq…', 'set.h.remind': 'Eslatma',
      'set.h.emoji': 'Emoji', 'set.h.emojiHint': "Bo'sh qolsa — soha belgisi", 'set.h.doneLabel': 'Bajarildi yozuvi', 'set.h.doneLabelPh': 'Yozdim', 'set.h.doneLabelHint': 'Tezkor tugmada ko‘rinadi',
      'set.h.needName': 'Odat nomini kiriting', 'set.h.needDays': 'Kamida bitta kun tanlang', 'set.h.added': "Odat qo'shildi", 'set.h.saved': 'Saqlandi',
      'set.h.edit': 'Odatni tahrirlash', 'set.h.newTitle': "Yangi odat", 'set.h.deleteTitle': "Odatni o'chirish",
      'set.h.deleteText': "«{name}» odati va uning BARCHA tarixi ({n} kun) o'chirilsinmi? Nofaol qilish tarixni saqlab qoladi.",
      'set.h.deleted': "O'chirildi: {name}",
      'set.h.empty': "Hali odat yo'q — birinchisini qo'shing", 'set.h.inactive': 'nofaol',
      'set.pr.method': 'Hisoblash usuli', 'set.pr.fajr': 'Bomdod burchagi', 'set.pr.isha': 'Xufton burchagi', 'set.pr.asr': 'Asr', 'set.pr.hanafi': 'Hanafiy', 'set.pr.shafi': "Shofe'iy",
      'set.pr.offsets': 'Tuzatishlar (daqiqa)', 'set.pr.offsetsHint': 'Mahalliy taqvimga moslash uchun ± daqiqa',
      'set.pr.hijri': 'Hijriy tuzatish', 'set.pr.hijriHint': "Hilol ko'rinishiga qarab ±2 kun",
      'set.pr.notify': 'Eslatmalar', 'set.pr.notifyHint': "Har namozdan 10 daqiqa oldin (faqat dastur ochiq bo'lganda)",
      'set.pr.notifyDenied': 'Bildirishnomalarga ruxsat berilmagan', 'set.pr.notifyNo': "Brauzer bildirishnomalarni qo'llamaydi",
      'set.pr.notifyOn': 'Eslatmalar yoqildi', 'set.pr.notifyOff': "Eslatmalar o'chirildi", 'set.pr.notifBody': '{name} — 10 daqiqadan keyin ({time})',
      'set.f.cats': 'Kategoriyalar', 'set.f.namePh': 'Kategoriya nomi…', 'set.f.catDeleted': "Kategoriya o'chirildi: {name}", 'set.f.txCount': '{n} ta yozuv',
      'set.f.cantDelete': "Bu kategoriyani o'chirib bo'lmaydi", 'set.f.needName': 'Nom kiriting', 'set.f.added': "Kategoriya qo'shildi",
      'set.f.reassign': 'Yozuvlar «Boshqa»ga o\'tkaziladi',




      'set.d.backup': 'Zaxira nusxa', 'set.d.export': 'JSON eksport', 'set.d.import': 'JSON import',
      'set.d.importHint': 'Eski «Shaxsiy» mini-ilova eksporti (shaxsiy_*.json) ham qabul qilinadi — format avtomatik aniqlanadi.',
      'set.d.importFail': 'Import xatosi: {msg}', 'set.d.danger': 'Xavfli zona', 'set.d.reset': "Hammasini o'chirish",
      'set.d.resetTitle': "Hamma ma'lumotni o'chirish", 'set.d.resetText': "Barcha odatlar, tarix, vazifalar, moliya va sozlamalar o'chiriladi. Avval eksport qiling!",
      'set.d.resetOk': "Ha, o'chirish", 'set.d.resetDone': "Hamma ma'lumot o'chirildi",
      'set.d.diag': 'Diagnostika', 'set.d.copy': 'Nusxalash', 'set.d.copied': 'Nusxalandi', 'set.d.copyFail': "Nusxalab bo'lmadi",
      'set.d.errors': '{n} ta xato',
      'set.auto': 'avto', 'set.f.icon': 'Belgi',
    },
    uzk: {

      'set.lang': 'Тил', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Мавзу',
      'set.height': 'Бўй', 'set.weight': 'Вазн',
      'set.sex': 'Жинс', 'set.sex.m': 'Эркак', 'set.sex.f': 'Аёл', 'set.activity': 'Фаоллик',
      'set.act.0': 'Ҳаракатсиз', 'set.act.1': 'Кам ҳаракат', 'set.act.2': 'Енгил', 'set.act.3': 'Ўртача', 'set.act.4': 'Фаол', 'set.act.5': 'Жуда фаол',
      'set.body': 'Тана', 'set.app': 'Илова', 'set.bmi': 'BMI',
      'set.birthYear': 'Туғилган йил', 'set.ageN': '{n} ёш', 'set.goal': 'Мақсад', 'set.goal.lose': 'Вазн ташлаш', 'set.goal.keep': 'Сақлаш', 'set.goal.gain': 'Вазн олиш',
      'set.whoopAgeTitle': 'WHOOP ёши', 'set.whoopAge': 'WHOOP Age', 'set.paceOfAging': 'Pace of Aging', 'set.whoopAgeHint': 'WHOOP иловасидан кўчиринг (Healthspan саҳифаси)',
      'set.whoopAgeAt': '{d} ҳолатига', 'set.onboard': 'Савол-жавоб билан тўлдириш',
      'set.fd.title': 'Кунлик мақсадлар', 'set.fd.auto': 'Авто', 'set.fd.autoHint': "WHOOP ўлчаган сарф бўлса ўшандан, бўлмаса бўй, вазн, ёш ва фаолликдан. Мақсад меъёрнинг улуши.", 'set.fd.srcMeasured': "WHOOP ўлчаган {n} кунлик ҳақиқий сарфдан — {t} ккал/кун", 'set.fd.srcFormula': "Формуладан — {t} ккал/кун; WHOOP 10 кун маълумот берса ўлчанган сарфга ўтади",
      'set.fd.manualHint': 'Қўлда киритилган — «Авто» ёқилса профил бўйича қайта ҳисобланади',
      'set.fd.kcal': 'Калория', 'set.fd.p': 'Оқсил', 'set.fd.c': 'Углевод', 'set.fd.f': 'Ёғ', 'set.fd.recalc': 'Қайта ҳисоблаш', 'set.fd.goFood': 'Овқат бўлимига ўтиш',
      'set.fd.needProfile': 'Авто ҳисоб учун профилда бўй, вазн ва туғилган йил керак',
      'set.tz': 'Вақт минтақаси', 'set.tz.browser': 'браузер',

      'set.waterMl': 'Стакан ҳажми', 'set.waterTarget': 'Кунлик сув мақсади',
      'set.waterAuto': 'авто (вазн бўйича)', 'set.currency': 'Валюта',

      'set.h.title': 'Одатлар', 'set.h.count': '{n} фаол / {total}',
      'set.h.help': 'Белгини босиб фаол қилинг, номини босиб жадвал ва мақсадни ўзгартиринг.',
      'set.h.namePh': 'Одат номи…', 'set.h.sphere': 'Соҳа', 'set.h.schedule': 'Жадвал',
      'set.sch.daily': 'Ҳар куни', 'set.sch.days': 'Кунлар', 'set.sch.week': 'Ҳафтасига', 'set.sch.weekN': 'ҳафтасига {n} марта', 'set.h.perWeek': 'марта ҳафтасига',
      'set.sch.month': 'Ойига', 'set.sch.monthN': 'ойига {n} марта', 'set.h.perMonth': 'марта ойига',
      'set.h.targetN': 'Миқдор', 'set.h.unit': 'Бирлик', 'set.h.unitPh': 'саҳифа, дақ…', 'set.h.remind': 'Эслатма',
      'set.h.emoji': 'Эмодзи', 'set.h.emojiHint': 'Бўш қолса — соҳа белгиси', 'set.h.doneLabel': 'Бажарилди ёзуви', 'set.h.doneLabelPh': 'Ёздим', 'set.h.doneLabelHint': 'Тезкор тугмада кўринади',
      'set.h.needName': 'Одат номини киритинг', 'set.h.needDays': 'Камида битта кун танланг', 'set.h.added': 'Одат қўшилди', 'set.h.saved': 'Сақланди',
      'set.h.edit': 'Одатни таҳрирлаш', 'set.h.newTitle': 'Янги одат', 'set.h.deleteTitle': 'Одатни ўчириш',
      'set.h.deleteText': '«{name}» одати ва унинг БАРЧА тарихи ({n} кун) ўчирилсинми? Нофаол қилиш тарихни сақлаб қолади.',
      'set.h.deleted': 'Ўчирилди: {name}',
      'set.h.empty': 'Ҳали одат йўқ — биринчисини қўшинг', 'set.h.inactive': 'нофаол',
      'set.pr.method': 'Ҳисоблаш усули', 'set.pr.fajr': 'Бомдод бурчаги', 'set.pr.isha': 'Хуфтон бурчаги', 'set.pr.asr': 'Аср', 'set.pr.hanafi': 'Ҳанафий', 'set.pr.shafi': 'Шофеъий',
      'set.pr.offsets': 'Тузатишлар (дақиқа)', 'set.pr.offsetsHint': 'Маҳаллий тақвимга мослаш учун ± дақиқа',
      'set.pr.hijri': 'Ҳижрий тузатиш', 'set.pr.hijriHint': 'Ҳилол кўринишига қараб ±2 кун',
      'set.pr.notify': 'Эслатмалар', 'set.pr.notifyHint': 'Ҳар намоздан 10 дақиқа олдин (фақат дастур очиқ бўлганда)',
      'set.pr.notifyDenied': 'Билдиришномаларга рухсат берилмаган', 'set.pr.notifyNo': 'Браузер билдиришномаларни қўлламайди',
      'set.pr.notifyOn': 'Эслатмалар ёқилди', 'set.pr.notifyOff': 'Эслатмалар ўчирилди', 'set.pr.notifBody': '{name} — 10 дақиқадан кейин ({time})',
      'set.f.cats': 'Категориялар', 'set.f.namePh': 'Категория номи…', 'set.f.catDeleted': 'Категория ўчирилди: {name}', 'set.f.txCount': '{n} та ёзув',
      'set.f.cantDelete': 'Бу категорияни ўчириб бўлмайди', 'set.f.needName': 'Ном киритинг', 'set.f.added': 'Категория қўшилди',
      'set.f.reassign': 'Ёзувлар «Бошқа»га ўтказилади',




      'set.d.backup': 'Захира нусха', 'set.d.export': 'JSON экспорт', 'set.d.import': 'JSON импорт',
      'set.d.importHint': 'Эски «Шахсий» мини-илова экспорти (shaxsiy_*.json) ҳам қабул қилинади — формат автоматик аниқланади.',
      'set.d.importFail': 'Импорт хатоси: {msg}', 'set.d.danger': 'Хавфли зона', 'set.d.reset': 'Ҳаммасини ўчириш',
      'set.d.resetTitle': 'Ҳамма маълумотни ўчириш', 'set.d.resetText': 'Барча одатлар, тарих, вазифалар, молия ва созламалар ўчирилади. Аввал экспорт қилинг!',
      'set.d.resetOk': 'Ҳа, ўчириш', 'set.d.resetDone': 'Ҳамма маълумот ўчирилди',
      'set.d.diag': 'Диагностика', 'set.d.copy': 'Нусхалаш', 'set.d.copied': 'Нусхаланди', 'set.d.copyFail': 'Нусхалаб бўлмади',
      'set.d.errors': '{n} та хато',
      'set.auto': 'авто', 'set.f.icon': 'Белги',
    },
    ru: {

      'set.lang': 'Язык', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Тема',
      'set.height': 'Рост', 'set.weight': 'Вес',
      'set.sex': 'Пол', 'set.sex.m': 'Муж.', 'set.sex.f': 'Жен.', 'set.activity': 'Активность',
      'set.act.0': 'Минимальная', 'set.act.1': 'Низкая', 'set.act.2': 'Лёгкая', 'set.act.3': 'Средняя', 'set.act.4': 'Высокая', 'set.act.5': 'Очень высокая',
      'set.body': 'Тело', 'set.app': 'Приложение', 'set.bmi': 'ИМТ',
      'set.birthYear': 'Год рождения', 'set.ageN': '{n} лет', 'set.goal': 'Цель', 'set.goal.lose': 'Похудеть', 'set.goal.keep': 'Сохранить', 'set.goal.gain': 'Набрать',
      'set.whoopAgeTitle': 'Возраст WHOOP', 'set.whoopAge': 'WHOOP Age', 'set.paceOfAging': 'Pace of Aging', 'set.whoopAgeHint': 'Скопируйте из приложения WHOOP (страница Healthspan)',
      'set.whoopAgeAt': 'на {d}', 'set.onboard': 'Заполнить пошагово',
      'set.fd.title': 'Дневные цели', 'set.fd.auto': 'Авто', 'set.fd.autoHint': "Если есть измеренный расход WHOOP — от него, иначе по росту, весу, возрасту и активности. Цель — доля от нормы.", 'set.fd.srcMeasured': "По измеренному расходу WHOOP за {n} дн. — {t} ккал/день", 'set.fd.srcFormula': "По формуле — {t} ккал/день; после 10 дней данных WHOOP перейдёт на измеренный расход",
      'set.fd.manualHint': 'Введено вручную — при включении «Авто» пересчитается по профилю',
      'set.fd.kcal': 'Калории', 'set.fd.p': 'Белки', 'set.fd.c': 'Углеводы', 'set.fd.f': 'Жиры', 'set.fd.recalc': 'Пересчитать', 'set.fd.goFood': 'Перейти в Питание',
      'set.fd.needProfile': 'Для авторасчёта нужны рост, вес и год рождения в профиле',
      'set.tz': 'Часовой пояс', 'set.tz.browser': 'браузер',

      'set.waterMl': 'Объём стакана', 'set.waterTarget': 'Дневная норма воды',
      'set.waterAuto': 'авто (по весу)', 'set.currency': 'Валюта',

      'set.h.title': 'Привычки', 'set.h.count': '{n} активных / {total}',
      'set.h.help': 'Галочка включает привычку, нажатие на название — расписание и цель.',
      'set.h.namePh': 'Название привычки…', 'set.h.sphere': 'Сфера', 'set.h.schedule': 'Расписание',
      'set.sch.daily': 'Ежедневно', 'set.sch.days': 'Дни', 'set.sch.week': 'В неделю', 'set.sch.weekN': '{n} раз в неделю', 'set.h.perWeek': 'раз в неделю',
      'set.sch.month': 'В месяц', 'set.sch.monthN': '{n} раз в месяц', 'set.h.perMonth': 'раз в месяц',
      'set.h.targetN': 'Количество', 'set.h.unit': 'Единица', 'set.h.unitPh': 'стр., мин…', 'set.h.remind': 'Напоминание',
      'set.h.emoji': 'Эмодзи', 'set.h.emojiHint': 'Пусто — значок сферы', 'set.h.doneLabel': 'Подпись «сделано»', 'set.h.doneLabelPh': 'Записал', 'set.h.doneLabelHint': 'Показывается на быстрой кнопке',
      'set.h.needName': 'Введите название привычки', 'set.h.needDays': 'Выберите хотя бы один день', 'set.h.added': 'Привычка добавлена', 'set.h.saved': 'Сохранено',
      'set.h.edit': 'Изменить привычку', 'set.h.newTitle': 'Новая привычка', 'set.h.deleteTitle': 'Удалить привычку',
      'set.h.deleteText': 'Удалить привычку «{name}» и ВСЮ её историю ({n} дн.)? Деактивация сохранит историю.',
      'set.h.deleted': 'Удалено: {name}',
      'set.h.empty': 'Привычек пока нет — добавьте первую', 'set.h.inactive': 'неактивна',
      'set.pr.method': 'Метод расчёта', 'set.pr.fajr': 'Угол Фаджра', 'set.pr.isha': 'Угол Иша', 'set.pr.asr': 'Аср', 'set.pr.hanafi': 'Ханафитский', 'set.pr.shafi': 'Шафиитский',
      'set.pr.offsets': 'Поправки (минуты)', 'set.pr.offsetsHint': 'Поправка в минутах под местный календарь',
      'set.pr.hijri': 'Поправка хиджры', 'set.pr.hijriHint': 'Сдвиг на ±2 дня по видимости хиляля',
      'set.pr.notify': 'Напоминания', 'set.pr.notifyHint': 'За 10 минут до каждого намаза (только пока приложение открыто)',
      'set.pr.notifyDenied': 'Уведомления не разрешены', 'set.pr.notifyNo': 'Браузер не поддерживает уведомления',
      'set.pr.notifyOn': 'Напоминания включены', 'set.pr.notifyOff': 'Напоминания выключены', 'set.pr.notifBody': '{name} — через 10 минут ({time})',
      'set.f.cats': 'Категории', 'set.f.namePh': 'Название категории…', 'set.f.catDeleted': 'Категория удалена: {name}', 'set.f.txCount': 'записей: {n}',
      'set.f.cantDelete': 'Эту категорию нельзя удалить', 'set.f.needName': 'Введите название', 'set.f.added': 'Категория добавлена',
      'set.f.reassign': 'Записи будут перенесены в «Другое»',




      'set.d.backup': 'Резервная копия', 'set.d.export': 'Экспорт JSON', 'set.d.import': 'Импорт JSON',
      'set.d.importHint': 'Экспорт старого мини-приложения «Шахсий» (shaxsiy_*.json) тоже принимается — формат определяется автоматически.',
      'set.d.importFail': 'Ошибка импорта: {msg}', 'set.d.danger': 'Опасная зона', 'set.d.reset': 'Удалить всё',
      'set.d.resetTitle': 'Удалить все данные', 'set.d.resetText': 'Все привычки, история, задачи, финансы и настройки будут удалены. Сначала сделайте экспорт!',
      'set.d.resetOk': 'Да, удалить', 'set.d.resetDone': 'Все данные удалены',
      'set.d.diag': 'Диагностика', 'set.d.copy': 'Копировать', 'set.d.copied': 'Скопировано', 'set.d.copyFail': 'Не удалось скопировать',
      'set.d.errors': 'ошибок: {n}',
      'set.auto': 'авто', 'set.f.icon': 'Значок',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  // Uchta bo'limcha: men kimman · tahrirlanadigan ro'yxatlar · ma'lumot.
  // «Ovqat» me'yorlari Profil ichiga kirdi (ular ayni shu profil raqamlaridan hisoblanadi),
  // moliya kategoriyalari odatlar bilan bir sahifada — ikkalasi ham shunchaki ro'yxat.
  // Namoz sozlamalari butunlay Ibodat bo'limida: u yerda joylashuv ham, vaqtlar ham
  // ko'rinib turadi, shuning uchun bu yerda ikkinchi nusxasi yo'q. `D.settings.prayerCard()`
  // faqat usul/tuzatish/eslatma kartalarini beradi va uni Ibodat chaqiradi.
  const GOALS = ['lose', 'keep', 'gain'];
  const TZS = ['Asia/Tashkent', 'Asia/Almaty', 'Europe/Moscow', 'Asia/Dubai', 'Europe/Istanbul', 'UTC'];
  const CURS = ['UZS', 'USD', 'EUR', 'RUB', 'KZT'];
  const HABIT_SPHERES = ['ruh', 'aql', 'qalb', 'tana', 'boshqa'];
  const EMOJI_CHIPS = ['🕌', '📘', '💚', '🏃', '✍️', '💤', '🧘', '💧', '🥗', '📖', '🧠', '🚶', '🏋️', '🧹', '📵', '🌅'];
  const cleanEmoji = (v) => Array.from(String(v || '').trim()).slice(0, 4).join('');
  const cleanDoneLabel = (v) => Array.from(String(v || '').trim()).slice(0, 24).join('');
  const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
  const OFFSET_IDS = ['bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton'];
  const FALLBACK_CAT = 'boshqa';

  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const S = () => D.S.settings;
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  const attr = (v) => (v === null || v === undefined ? '' : esc(v));

  // yosh: D.profileAge — tug'ilgan yildan; bo'lmasa eski `age` maydonidan (hamma modulda bitta qoida)
  const ageOf = () => D.profileAge();

  D.i18n.add({
    uz: { 'set.sec.app': 'Ilova va vaqt', 'set.sec.data': "Ma'lumot va zaxira", 'set.sec.account': 'Hisob',
      'set.sum.none': "to'ldirilmagan", 'set.sum.habits': '{n} ta faol', 'set.sum.cats': '{n} ta', 'set.sum.errors': '{n} ta xato',
      'set.fd.autoLbl': 'Avto hisoblash', 'lang.short.uz': "O'zbekcha", 'lang.short.uzk': 'Кирилл', 'lang.short.ru': 'Русский' },
    uzk: { 'set.sec.app': 'Илова ва вақт', 'set.sec.data': 'Маълумот ва захира', 'set.sec.account': 'Ҳисоб',
      'set.sum.none': 'тўлдирилмаган', 'set.sum.habits': '{n} та фаол', 'set.sum.cats': '{n} та', 'set.sum.errors': '{n} та хато',
      'set.fd.autoLbl': 'Авто ҳисоблаш', 'lang.short.uz': "O'zbekcha", 'lang.short.uzk': 'Кирилл', 'lang.short.ru': 'Русский' },
    ru: { 'set.sec.app': 'Приложение и время', 'set.sec.data': 'Данные и копии', 'set.sec.account': 'Аккаунт',
      'set.sum.none': 'не заполнено', 'set.sum.habits': 'активных: {n}', 'set.sum.cats': '{n}', 'set.sum.errors': 'ошибок: {n}',
      'set.fd.autoLbl': 'Авторасчёт', 'lang.short.uz': "O'zbekcha", 'lang.short.uzk': 'Кирилл', 'lang.short.ru': 'Русский' },
  });

  /* ------------------------------------------------------------------ */
  /* YIG'ILADIGAN BO'LIM                                                  */
  /* Holat D.ui.collapsed['set.<id>'] da (qurilmaniki): yo'q — yopiq,     */
  /* `false` — ochiq. Yopiq bo'limning tanasi umuman chizilmaydi.         */
  /* ------------------------------------------------------------------ */
  const secOpen = (id) => D.ui.collapsed['set.' + id] === false;
  function section(id, icon, title, summary, body, warn) {
    const open = secOpen(id);
    return `<div class="card set-sec ${open ? 'open' : ''}">
      <button type="button" class="set-sec-h" data-act="setSec" data-id="${esc(id)}" aria-expanded="${open}">
        <span class="set-sec-ic">${D.ic(icon, 17)}</span>
        <span class="set-sec-txt"><span class="set-sec-t">${esc(title)}</span>${summary ? `<span class="set-sec-s ${warn ? 'warn' : ''}">${summary}</span>` : ''}</span>
        <span class="set-sec-chev">${D.ic('chevD', 16)}</span>
      </button>
      ${open ? `<div class="set-sec-b">${body()}</div>` : ''}
    </div>`;
  }
  D.act.setSec = (el) => {
    const k = 'set.' + el.dataset.id;
    if (D.ui.collapsed[k] === false) delete D.ui.collapsed[k]; else D.ui.collapsed[k] = false;
    D.saveUi(); D.rerender();
  };
  // S.food shakli — D.normalize (core.js) har doim to'ldiradi, shu yerda ikkinchi standart yo'q
  const FOOD = () => D.S.food;
  // profil o'zgarganda avto maqsadlar qayta hisoblanadi (food.js bo'lsa)
  function recalcFood() {
    try { if (D.food && D.food.recalcTargets && FOOD().targets.auto !== false) D.food.recalcTargets(); } catch (e) { console.warn('food targets', e); }
  }

  function browserTz() { try { return (Intl.DateTimeFormat().resolvedOptions().timeZone) || ''; } catch (e) { return ''; } }
  function tzOptions() {
    const out = TZS.slice(), b = browserTz(), cur = S().tz;
    if (b && !out.includes(b)) out.push(b);
    if (cur && !out.includes(cur)) out.push(cur);
    return out.map((z) => ({ v: z, l: z === b && !TZS.includes(z) ? `${z} (${t('set.tz.browser')})` : z }));
  }

  const sortedHabits = () => D.S.habits.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const findHabit = (id) => D.S.habits.find((h) => h.id === id);
  const normalizeOrder = () => { sortedHabits().forEach((h, i) => { h.order = i; }); };

  // memoised: days-with-log per habit (one pass over logs, cached until state changes)
  let cntCache = { key: null, map: null };
  function doneCounts() {
    const key = (D.S.meta.updatedAt || 0) + ':' + Object.keys(D.S.logs).length;
    if (cntCache.key === key) return cntCache.map;
    const map = {};
    for (const ids of Object.values(D.S.logs)) if (Array.isArray(ids)) for (const id of ids) map[id] = (map[id] || 0) + 1;
    cntCache = { key, map };
    return map;
  }
  let sizeCache = { key: null, kb: 0 };
  function storageKb() {
    const key = D.S.meta.updatedAt || 0;
    if (sizeCache.key !== key) { let n = 0; try { n = JSON.stringify(D.S).length; } catch (e) {} sizeCache = { key, kb: n / 1024 }; }
    return sizeCache.kb;
  }

  function schedSummary(h) {
    const sc = h.schedule || { type: 'daily' };
    if (sc.type === 'days') { const W = D.t('weekdaysShort'); const ds = DOW_ORDER.filter((d) => (sc.days || []).includes(d)); return ds.length === 7 ? t('set.sch.daily') : ds.map((d) => W[d]).join(' '); }
    if (sc.type === 'week') return t('set.sch.weekN', { n: sc.n || 1 });
    if (sc.type === 'month') return t('set.sch.monthN', { n: sc.n || 1 });
    return t('set.sch.daily');
  }

  /* small UI builders */
  const row = (label, ctl, hint) => `<div class="set-row"><div class="set-row-body"><div class="set-lbl">${label}</div>${hint ? `<div class="set-hint">${hint}</div>` : ''}</div><div class="set-ctl">${ctl}</div></div>`;
  const seg = (opts, cur, act, cls = '') => `<div class="seg ${cls}">${opts.map((o) => `<button type="button" class="${o.v === cur ? 'on' : ''}" data-act="${act}" data-val="${esc(o.v)}">${esc(o.l)}</button>`).join('')}</div>`;
  const sel = (opts, cur, change, extra = '') => `<select class="sel sm" data-change="${change}" ${extra}>${opts.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(cur) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
  /* type="text" + inputmode="decimal": type="number" vergulni qabul qilmaydi — «74,5» yozilsa
     brauzer bo'sh qiymat berardi va vazn jimgina o'chib ketardi. Chegaralarni ishlovchi o'zi
     qo'yadi (clamp). Manfiy bo'lishi mumkin bo'lgan maydonga (daqiqa tuzatish) `neg`:
     iPhone'ning o'nlik klaviaturasida minus yo'q. */
  const numInp = (v, change, extra = '', neg = false) => `<input class="inp sm num set-num" type="${neg ? 'number' : 'text'}" ${neg ? '' : 'inputmode="decimal"'} autocomplete="off" value="${attr(v)}" data-change="${change}" ${extra}>`;
  const sphereOpts = (cur) => HABIT_SPHERES.concat(cur === 'aralash' ? ['aralash'] : []).map((id) => ({ v: id, l: D.sphere(id).name() }));
  function daysPicker(act, days) {
    const W = D.t('weekdaysShort');
    return `<div class="set-days">${DOW_ORDER.map((d) => `<button type="button" class="set-day ${days.includes(d) ? 'on' : ''}" data-act="${act}" data-d="${d}" aria-pressed="${days.includes(d)}">${esc(W[d])}</button>`).join('')}</div>`;
  }

  /* «Hisob»: avatar (profile.js), ism, e-mail yoki hisob turi + uid, Profil va Chiqish */
  D.on('me:changed', () => { if (D.current() === 'settings') D.rerender(); });

  /* ------------------------------------------------------------------ */
  /* TANA — bo'y, vazn, yosh, maqsad; WHOOP yoshi ham shu kartada        */
  /* ------------------------------------------------------------------ */
  function bodyCard() {
    const s = S(), p = D.S.profile;
    const act = D.clamp(+p.activity || 0, 0, 5);
    const age = ageOf(), goal = GOALS.includes(p.goal) ? p.goal : 'keep';
    const lb = s.weightUnit === 'lb';   // onboarding lb'ni tanlagan bo'lsa maydon ham lb'da bo'lsin
    return `
      <div class="set-grid3">
        <div class="field"><label class="field-label">${t('set.height')} <span class="set-unit">cm</span></label>${numInp(p.heightCm, 'setProfileNum', 'data-k="heightCm" min="100" max="250" step="1" placeholder="—"')}</div>
        <div class="field"><label class="field-label">${t('set.weight')} <span class="set-unit">${lb ? 'lb' : 'kg'}</span></label>${numInp(p.weightKg == null ? null : D.round(lb ? p.weightKg * 2.20462 : p.weightKg, 1), 'setProfileNum', `data-k="weightKg" min="${lb ? 44 : 20}" max="${lb ? 1100 : 500}" step="0.1" placeholder="—"`)}</div>
        <div class="field"><label class="field-label">${t('set.birthYear')}${age != null ? ` <span class="set-unit num">${esc(t('set.ageN', { n: age }))}</span>` : ''}</label>${numInp(p.birthYear, 'setProfileNum', `data-k="birthYear" min="1900" max="${D.nowTz().y - 1}" step="1" placeholder="${p.birthYear ? '' : esc(String(D.nowTz().y - (age || 30)))}"`)}</div>
      </div>
      <div class="set-grid2">
        <div class="field"><label class="field-label">${t('set.sex')}</label>${seg([{ v: 'm', l: t('set.sex.m') }, { v: 'f', l: t('set.sex.f') }], p.sex === 'f' ? 'f' : 'm', 'setSex', 'set-seg-last')}</div>
        <div class="field"><label class="field-label">${t('set.activity')}</label>
          <div class="set-slider-lbl" id="setActLabel">${actLabel(act)}</div>
          <input class="slider" type="range" min="0" max="5" step="1" value="${act}" data-input="setActivity" aria-label="${esc(t('set.activity'))}"></div>
      </div>
      <div class="field"><label class="field-label">${t('set.goal')}</label>${seg(GOALS.map((g) => ({ v: g, l: t('set.goal.' + g) })), goal, 'setGoal', 'set-seg-last')}</div>

      <div class="eyebrow set-sub-eyebrow">${t('set.whoopAgeTitle')}</div>
      <div class="set-grid2">
        <div class="field"><label class="field-label">${t('set.whoopAge')}</label>${numInp(p.whoopAge, 'setWhoopAge', 'data-k="whoopAge" min="10" max="120" step="0.1" placeholder="—"')}</div>
        <div class="field"><label class="field-label">${t('set.paceOfAging')}</label>${numInp(p.paceOfAging, 'setWhoopAge', 'data-k="paceOfAging" min="0.3" max="2.5" step="0.01" placeholder="1.00"')}</div>
      </div>
      <div class="help">${esc(t('set.whoopAgeHint'))}${p.whoopAgeAt ? ' · ' + esc(t('set.whoopAgeAt', { d: D.fmtDate(p.whoopAgeAt, 'short') })) : ''}</div>
      ${D.onboard ? `<button class="btn ghost sm mt-s" data-act="setOnboard">${D.ic('chevR', 14)} ${t('set.onboard')}</button>` : ''}`;
  }
  function bodySummary() {
    const p = D.S.profile, lb = S().weightUnit === 'lb', age = ageOf();
    const parts = [];
    if (p.heightCm) parts.push(`${D.fmtNum(p.heightCm)} cm`);
    if (p.weightKg) parts.push(`${D.fmtNum(D.round(lb ? p.weightKg * 2.20462 : p.weightKg, 1))} ${lb ? 'lb' : 'kg'}`);
    if (age != null) parts.push(t('set.ageN', { n: age }));
    // BMI ilgari kartaning burchagida edi — endi bo'lim yopiq turganda ham ko'rinadi
    if (p.heightCm && p.weightKg) parts.push(`${t('set.bmi')} ${D.fmtNum(D.round(p.weightKg / Math.pow(p.heightCm / 100, 2), 1), 1)}`);
    return esc(parts.length ? parts.join(' · ') : t('set.sum.none'));
  }

  /* ------------------------------------------------------------------ */
  /* ILOVA — til, ko'rinish, vaqt, valyuta, suv: bitta karta            */
  /* ------------------------------------------------------------------ */
  function appCard() {
    const s = S();
    return `
      <div class="eyebrow mb-s">${t('set.lang')}</div>
      ${seg([{ v: 'uz', l: t('set.lang.uz') }, { v: 'uzk', l: t('set.lang.uzk') }, { v: 'ru', l: t('set.lang.ru') }], D.lang(), 'setLang', 'set-seg-lang')}
      <div class="eyebrow mb-s">${t('set.theme')}</div>
      ${seg([{ v: 'dark', l: t('theme.dark') }, { v: 'light', l: t('theme.light') }, { v: 'auto', l: t('theme.auto') }], s.theme || 'dark', 'setTheme')}
      ${row(t('set.currency'), sel(CURS.map((c) => ({ v: c, l: c })), s.currency || 'UZS', 'setCurrency'))}
      ${row(t('set.waterMl'), `<div class="set-inp-unit">${numInp(s.waterMl, 'setNum', 'data-k="waterMl" min="50" max="2000" step="10"')}<span>${t('unit.ml')}</span></div>`)}
      ${row(t('set.waterTarget'), `<div class="set-inp-unit">${numInp(s.waterTargetMl, 'setNum', `data-k="waterTargetMl" min="500" max="8000" step="50" placeholder="${esc(t('set.auto'))}"`)}<span>${t('unit.ml')}</span></div>`, t('set.waterAuto'))}`;
  }
  const actLabel = (a) => `<span>${esc(t('set.act.' + a))}</span><span class="num muted">${a}/5</span>`;

  D.act.setLang = (el) => { if (el.dataset.val !== D.lang()) D.setLang(el.dataset.val); };
  D.act.setTheme = (el) => D.theme.set(el.dataset.val);
  D.act.setOnboard = () => { if (D.onboard && D.onboard.open) D.onboard.open(); };   // Profilni qadam-baqadam qayta to'ldirish
  D.act.setProfileText = (el) => {
    D.S.profile[el.dataset.k] = el.value.trim().slice(0, 40);
    D.save();
    // ism serverdagi hisobga ham yozilsin — profil varag'i va kirish oynasi bir xil ismni ko'rsatadi
    if (el.dataset.k === 'name' && D.profile && D.profile.syncName) D.profile.syncName(D.S.profile.name);
  };
  D.act.setProfileNum = (el) => {
    const k = el.dataset.k;
    let v = num(el.value);
    if (k === 'weightKg' && v != null && S().weightUnit === 'lb') v = D.round(v / 2.20462, 1);
    const lim = { heightCm: [50, 250], weightKg: [20, 500], birthYear: [1900, D.nowTz().y - 1] }[k];
    if (v != null && lim) v = D.clamp(v, lim[0], lim[1]);
    if (v != null && k !== 'weightKg') v = Math.round(v);
    if (!lim) return;
    D.S.profile[k] = v;
    // yosh tug'ilgan yildan chiqadi; eski `age` maydoni o'qiydigan joylar uchun sinxron turadi
    if (k === 'birthYear') D.S.profile.age = v == null ? null : D.nowTz().y - v;
    recalcFood();
    D.save(); D.rerender();
  };
  D.act.setSex = (el) => { D.S.profile.sex = el.dataset.val === 'f' ? 'f' : 'm'; recalcFood(); D.save(); D.rerender(); };
  D.act.setActivity = (el) => { const a = D.clamp(+el.value || 0, 0, 5); D.S.profile.activity = a; recalcFood(); D.save(); D.patch('setActLabel', actLabel(a)); };
  D.act.setGoal = (el) => { D.S.profile.goal = GOALS.includes(el.dataset.val) ? el.dataset.val : 'keep'; recalcFood(); D.save(); D.rerender(); };
  // WHOOP Age / Pace of Aging — API bermaydi, foydalanuvchi WHOOP ilovasidan ko'chiradi; sana qachon ko'chirilganini eslab turadi
  D.act.setWhoopAge = (el) => {
    const k = el.dataset.k;
    const lim = { whoopAge: [10, 120], paceOfAging: [0.3, 2.5] }[k];
    if (!lim) return;
    let v = num(el.value);
    if (v != null) v = D.round(D.clamp(v, lim[0], lim[1]), 2);
    const p = D.S.profile;
    p[k] = v;
    p.whoopAgeAt = p.whoopAge != null || p.paceOfAging != null ? D.today() : null;
    D.save(); D.rerender();
  };
  /* Mintaqa ikki joydan o'zgaradi: «Ilova» kartasidagi ro'yxat va «Vaqt va joy»
     kartasidagi ogohlantirish tugmasi. Nomlari HAR XIL bo'lishi shart — ikkalasi
     ham D.act.setTz deb yozilganida ikkinchisi birinchisini bosib, ro'yxat jim
     ishlamay qolgandi. Ikkalasi ham bir joydan o'tadi: applyTz. */
  function applyTz(tz) {
    if (!tz || tz === S().tz) return;
    S().tz = tz;
    D.save(); D.renderNav(); D.rerender();
    // Kun kaliti o'zgardi — buni eshitishi kerak bo'lgan o'nga yaqin modul bor
    D.emit('day:changed', D.today());
  }
  D.act.setTzPick = (el) => applyTz(el.value);
  D.act.setNum = (el) => { const v = num(el.value); S()[el.dataset.k] = v == null ? (el.dataset.k === 'waterTargetMl' ? null : S()[el.dataset.k]) : Math.max(0, v); D.save(); D.rerender(); };
  D.act.setCurrency = (el) => { S().currency = CURS.includes(el.value) ? el.value : 'UZS'; D.save(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* HABITS                                                              */
  /* ------------------------------------------------------------------ */
  // Qo'shish qatorida faqat nom va soha turadi: qolgani (jadval, maqsad, emoji, eslatma)
  // odatni bosganda ochiladigan oynada — bir joyda, ikki marta emas.
  const draft = { name: '', sphere: 'ruh' };

  /** Ro'yxatlar — ilovadagi ikkita tahrirlanadigan ro'yxat bir sahifada. */

  function renderHabits() {
    const list = sortedHabits();
    const active = list.filter((h) => h.active).length;
    return `
      <div class="set-count num">${esc(t('set.h.count', { n: active, total: list.length }))}</div>
      <div class="input-row">
        <input class="inp" value="${esc(draft.name)}" placeholder="${esc(t('set.h.namePh'))}" maxlength="60" autocomplete="off" data-input="setDraft" data-k="name" data-enter="setHabitAdd">
        <button class="btn sq" data-act="setHabitAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button>
      </div>
      ${list.length ? `<div class="list mt">${list.map((h) => habitRow(h)).join('')}</div>` : `<div class="empty">${esc(t('set.h.empty'))}</div>`}
      <p class="help mt-s">${esc(t('set.h.help'))}</p>`;
  }

  /* Qator qisqartirilgan: belgi, emoji bilan nom, jadval. Soha, maqsad va
     eslatma nomni bosganda ochiladigan oynada turadi. */
  function habitRow(h) {
    const id = esc(h.id);
    return `<div class="li set-hab ${h.active ? '' : 'off'}">
      <input type="checkbox" class="chk big" ${h.active ? 'checked' : ''} data-change="setHabitActive" data-id="${id}" aria-label="${esc(h.name)}">
      <button type="button" class="li-body set-hab-open" data-act="setHabitEdit" data-id="${id}">
        <div class="li-text"><span class="set-hab-emoji" aria-hidden="true" style="--c:var(--${h.sphere || 'boshqa'})">${D.habitMark(h, 14)}</span>${esc(h.name)}</div>
        <div class="li-meta"><span>${esc(schedSummary(h))}</span>${h.active ? '' : `<span class="muted">${esc(t('set.h.inactive'))}</span>`}</div>
      </button>
      <div class="set-hab-acts">
        <button class="li-del" data-act="setHabitDel" data-id="${id}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button>
      </div>
    </div>`;
  }

  // emoji + done-label fields shared by the add form and the edit modal. The chip row fills the input in place (no rerender).
  function emojiFields(o) {
    const ph = D.habitEmoji({ sphere: o.sphere });
    const cur = cleanEmoji(o.emoji);
    return `
      <div class="set-grid2 set-emoji-grid">
        <div class="field"><label class="field-label" for="${o.inputId}">${t('set.h.emoji')}</label>
          <input class="inp sm set-emoji-inp" id="${o.inputId}" value="${esc(cur)}" placeholder="${esc(ph)}" maxlength="16" autocomplete="off" inputmode="text" ${o.bind || ''} data-k="emoji">
          <div class="set-hint">${esc(t('set.h.emojiHint'))}</div></div>
        <div class="field"><label class="field-label" for="${o.labelId}">${t('set.h.doneLabel')}</label>
          <input class="inp sm" id="${o.labelId}" value="${esc(o.doneLabel || '')}" placeholder="${esc(t('set.h.doneLabelPh'))}" maxlength="24" autocomplete="off" ${o.bind || ''} data-k="doneLabel">
          <div class="set-hint">${esc(t('set.h.doneLabelHint'))}</div></div>
      </div>
      <div class="set-emoji-row" role="group" aria-label="${esc(t('set.h.emoji'))}">
        ${EMOJI_CHIPS.map((e) => `<button type="button" class="set-emoji-chip ${e === cur ? 'on' : ''}" data-act="${o.chipAct}" data-e="${esc(e)}" data-for="${o.inputId}" aria-label="${esc(e)}" aria-pressed="${e === cur ? 'true' : 'false'}">${esc(e)}</button>`).join('')}
      </div>`;
  }
  function pickEmoji(el) {
    const e = cleanEmoji(el.dataset.e), inp = D.$('#' + el.dataset.for);
    if (inp) inp.value = e;
    const row = el.closest('.set-emoji-row');
    if (row) for (const b of row.querySelectorAll('.set-emoji-chip')) { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
    return e;
  }
  D.act.setEhEmoji = (el) => { pickEmoji(el); };

  D.act.setDraft = (el) => { draft[el.dataset.k] = el.value; };
  /* Takrorlanish soni ikki xil maydonda turadi: haftalik uchun #setEhN,
     oylik uchun #setEhMn. Qaysi biri o'qilishini tur belgilaydi. */
  const schedN = (type) => ((D.$(type === 'month' ? '#setEhMn' : '#setEhN') || {}).value);
  function buildSchedule(type, days, n) {
    if (type === 'days') return { type: 'days', days: DOW_ORDER.filter((d) => days.includes(d)) };
    if (type === 'week') return { type: 'week', n: D.clamp(+n || 1, 1, 7) };
    // Oylik odat: oyiga bir necha marta. Trekkerda o'z bloki bor va kunlik
    // jadvalga tushmaydi — oyiga bir marta qilinadigan ish 31 ta bo'sh
    // katakcha bo'lib turishi noto'g'ri ko'rinish berardi.
    if (type === 'month') return { type: 'month', n: D.clamp(+n || 1, 1, 31) };
    return { type: 'daily' };
  }
  D.act.setHabitAdd = () => {
    const name = (draft.name || '').trim();
    if (!name) { D.toast(t('set.h.needName')); return; }
    normalizeOrder();
    D.S.habits.push({
      id: D.uid('h'), name, sphere: HABIT_SPHERES.includes(draft.sphere) ? draft.sphere : 'boshqa', active: true,
      schedule: { type: 'daily' }, target: null, remind: null, createdAt: Date.now(), order: D.S.habits.length,
    });
    draft.name = '';
    D.save(); D.rerender(); D.toast(t('set.h.added'));
  };
  D.act.setHabitActive = (el) => { const h = findHabit(el.dataset.id); if (!h) return; h.active = !!el.checked; D.save(); D.rerender(); };
  // inline rename (contenteditable, Enter/blur commits, Esc cancels)
  function inlineEdit(el, getText, commit) {
    if (el.getAttribute('contenteditable') === 'true') return;
    const original = getText();
    let finished = false;
    el.setAttribute('contenteditable', 'true'); el.setAttribute('role', 'textbox'); el.focus();
    try { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    const finish = (ok) => {
      if (finished) return; finished = true;
      el.removeEventListener('keydown', onKey); el.removeEventListener('blur', onBlur);
      el.removeAttribute('contenteditable'); el.removeAttribute('role');
      const next = (el.textContent || '').trim().slice(0, 60);
      if (ok && next && next !== original) commit(next); else el.textContent = original;
    };
    const onKey = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); finish(true); } else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(false); } };
    const onBlur = () => finish(true);
    el.addEventListener('keydown', onKey); el.addEventListener('blur', onBlur);
  }
  function habitForm(h) {
    const sc = h.schedule || { type: 'daily' };
    const id = esc(h.id);
    return `
      <div class="field"><label class="field-label">${t('common.name')}</label><input class="inp" id="setEhName" value="${esc(h.name)}" maxlength="60" data-enter="${h.id ? 'setHabitSave' : 'setHabitCreate'}" data-id="${id}"></div>
      <div class="grid2">
        <div class="field"><label class="field-label">${t('set.h.sphere')}</label><select class="sel" id="setEhSphere">${sphereOpts(h.sphere).map((o) => `<option value="${o.v}" ${o.v === h.sphere ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select></div>
        <div class="field"><label class="field-label">${t('set.h.schedule')}</label><select class="sel" id="setEhType" data-change="setEhType">
          ${['daily', 'days', 'week', 'month'].map((v) => `<option value="${v}" ${sc.type === v ? 'selected' : ''}>${esc(t('set.sch.' + v))}</option>`).join('')}</select></div>
      </div>
      <div class="field" id="setEhDays" ${sc.type === 'days' ? '' : 'hidden'}>${daysPicker('setEhDay', sc.days || [])}</div>
      ${emojiFields({ emoji: h.emoji, doneLabel: h.doneLabel, sphere: h.sphere, inputId: 'setEhEmoji', labelId: 'setEhDoneLabel', chipAct: 'setEhEmoji' })}
      <div class="field" id="setEhWeek" ${sc.type === 'week' ? '' : 'hidden'}><div class="set-inp-unit"><input class="inp sm num set-num" id="setEhN" type="number" inputmode="numeric" min="1" max="7" value="${attr(D.clamp(+sc.n || 3, 1, 7))}"><span>${t('set.h.perWeek')}</span></div></div>
      <div class="field" id="setEhMonth" ${sc.type === 'month' ? '' : 'hidden'}><div class="set-inp-unit"><input class="inp sm num set-num" id="setEhMn" type="number" inputmode="numeric" min="1" max="31" value="${attr(D.clamp(+sc.n || 1, 1, 31))}"><span>${t('set.h.perMonth')}</span></div></div>
      <div class="set-grid3">
        <div class="field"><label class="field-label">${t('set.h.targetN')}</label><input class="inp sm num" id="setEhTn" type="number" inputmode="numeric" min="1" value="${h.target && h.target.n ? esc(h.target.n) : ''}" placeholder="—"></div>
        <div class="field"><label class="field-label">${t('set.h.unit')}</label><input class="inp sm" id="setEhUnit" maxlength="12" value="${esc(h.target ? h.target.unit || '' : '')}" placeholder="${esc(t('set.h.unitPh'))}"></div>
        <div class="field"><label class="field-label">${t('set.h.remind')}</label><input class="inp sm" id="setEhRemind" type="time" value="${esc(h.remind || '')}"></div>
      </div>`;
  }
  D.act.setHabitEdit = (el) => {
    const h = findHabit(el.dataset.id); if (!h) return;
    D.modal({ title: t('set.h.edit'), body: habitForm(h), actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('btn.save'), act: 'setHabitSave', primary: true, data: { id: h.id } }] });
  };

  /* Yangi odat — o'sha formaning o'zi, lekin bo'sh. Faqat «Saqlash» bosilganda
     ro'yxatga qo'shiladi: bekor qilingan yozuv qolib ketmasin. Odat bo'limi ham
     shu yerdan foydalanadi (D.settings.habitNew), ya'ni forma bitta joyda. */
  D.act.setHabitNew = () => {
    const blank = { id: '', name: '', sphere: 'boshqa', active: true, schedule: { type: 'daily' }, target: null, remind: null };
    D.modal({
      title: t('set.h.newTitle'), body: habitForm(blank),
      actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('btn.save'), act: 'setHabitCreate', primary: true }],
    });
  };
  D.act.setHabitCreate = () => {
    const name = ((D.$('#setEhName') || {}).value || '').trim();
    if (!name) { D.toast(t('set.h.needName')); return; }
    const type = (D.$('#setEhType') || {}).value || 'daily';
    const days = D.$$('#setEhDays .set-day.on').map((b) => +b.dataset.d);
    if (type === 'days' && !days.length) { D.toast(t('set.h.needDays')); return; }
    const tn = num((D.$('#setEhTn') || {}).value);
    const sph = (D.$('#setEhSphere') || {}).value;
    const h = {
      id: D.uid('h'), name: name.slice(0, 60),
      sphere: D.SPHERE_IDS.includes(sph) ? sph : 'boshqa', active: true,
      schedule: buildSchedule(type, days, schedN(type)),
      target: tn && tn > 0 ? { n: Math.round(tn), unit: ((D.$('#setEhUnit') || {}).value || '').trim().slice(0, 12) } : null,
      remind: (D.$('#setEhRemind') || {}).value || null,
      createdAt: Date.now(), order: D.S.habits.length,
    };
    const em = cleanEmoji((D.$('#setEhEmoji') || {}).value), dl = cleanDoneLabel((D.$('#setEhDoneLabel') || {}).value);
    if (em) h.emoji = em;
    if (dl) h.doneLabel = dl;
    D.S.habits.push(h);
    D.closeModal(); D.save(); D.rerender(); D.toast(t('set.h.added'));
  };
  D.act.setEhType = (el) => { const d = D.$('#setEhDays'), w = D.$('#setEhWeek'), m = D.$('#setEhMonth');
    if (d) d.hidden = el.value !== 'days'; if (w) w.hidden = el.value !== 'week'; if (m) m.hidden = el.value !== 'month'; };
  D.act.setEhDay = (el) => { const on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); };
  D.act.setHabitSave = (el) => {
    const h = findHabit(el.dataset.id); if (!h) { D.closeModal(); return; }
    const name = ((D.$('#setEhName') || {}).value || '').trim();
    if (!name) { D.toast(t('set.h.needName')); return; }
    const type = (D.$('#setEhType') || {}).value || 'daily';
    const days = D.$$('#setEhDays .set-day.on').map((b) => +b.dataset.d);
    if (type === 'days' && !days.length) { D.toast(t('set.h.needDays')); return; }
    const tn = num((D.$('#setEhTn') || {}).value);
    h.name = name.slice(0, 60);
    const sph = (D.$('#setEhSphere') || {}).value; if (D.SPHERE_IDS.includes(sph)) h.sphere = sph;
    h.schedule = buildSchedule(type, days, schedN(type));
    h.target = tn && tn > 0 ? { n: Math.round(tn), unit: ((D.$('#setEhUnit') || {}).value || '').trim().slice(0, 12) } : null;
    h.remind = (D.$('#setEhRemind') || {}).value || null;
    const em = cleanEmoji((D.$('#setEhEmoji') || {}).value), dl = cleanDoneLabel((D.$('#setEhDoneLabel') || {}).value);
    if (em) h.emoji = em; else delete h.emoji;
    if (dl) h.doneLabel = dl; else delete h.doneLabel;
    D.closeModal(); D.save(); D.rerender(); D.toast(t('set.h.saved'));
  };
  D.act.setHabitDel = async (el) => {
    const h = findHabit(el.dataset.id); if (!h) return;
    const n = doneCounts()[h.id] || 0;
    const ok = await D.confirm({ title: t('set.h.deleteTitle'), text: t('set.h.deleteText', { name: h.name, n }), ok: t('btn.delete'), danger: true });
    if (!ok) return;
    const idx = D.S.habits.indexOf(h);
    if (idx < 0) return;
    D.S.habits.splice(idx, 1);
    const logsBak = {}, countsBak = {}, logOrder = Object.keys(D.S.logs);
    for (const [k, ids] of Object.entries(D.S.logs)) {
      if (!Array.isArray(ids) || !ids.includes(h.id)) continue;
      logsBak[k] = ids;
      const rest = ids.filter((x) => x !== h.id);
      if (rest.length) D.S.logs[k] = rest; else delete D.S.logs[k];
    }
    for (const [k, m] of Object.entries(D.S.counts || {})) {
      if (!m || m[h.id] === undefined) continue;
      countsBak[k] = Object.assign({}, m);
      delete m[h.id];
      if (!Object.keys(m).length) delete D.S.counts[k];
    }
    D.undo.push({ label: t('set.h.deleted', { name: h.name }), undo: () => {
      D.S.habits.splice(Math.min(idx, D.S.habits.length), 0, h);
      // rebuild logs in place, preserving the original key order (date-keyed maps are iterated by modules)
      const cur = Object.assign({}, D.S.logs, logsBak);
      for (const k of Object.keys(D.S.logs)) delete D.S.logs[k];
      for (const k of logOrder) if (cur[k]) D.S.logs[k] = cur[k];
      for (const k of Object.keys(cur)) if (!D.S.logs[k]) D.S.logs[k] = cur[k];
      Object.assign(D.S.counts, countsBak);
    } });
    D.save(); D.rerender();
    D.toast(t('set.h.deleted', { name: h.name }), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* FOOD — kunlik kkal / oqsil / uglevod / yog' maqsadlari              */
  /* ------------------------------------------------------------------ */
  const FD_KEYS = [['kcal', 'kcal', 800, 6000, 10], ['p', 'g', 20, 400, 5], ['c', 'g', 20, 800, 5], ['f', 'g', 10, 300, 5]];
  function renderFood() {
    const f = FOOD();
    let tg = f.targets;
    try { if (D.food && D.food.targets) tg = D.food.targets() || tg; } catch (e) { console.warn('food targets', e); }
    const auto = tg.auto !== false;
    const p = D.S.profile, canAuto = !!(num(p.heightCm) && num(p.weightKg) && ageOf() != null);
    return `
      ${row(esc(t('set.fd.autoLbl')), `<button type="button" class="toggle ${auto ? 'on' : ''}" data-act="setFoodAuto" role="switch" aria-checked="${auto}" aria-label="${esc(t('set.fd.auto'))}"></button>`)}
      <div class="help mb-s">${esc(auto ? t('set.fd.autoHint') : t('set.fd.manualHint'))}</div>
      ${auto && !canAuto ? `<div class="set-ok mb-s"><span class="zone z-warn"></span>${esc(t('set.fd.needProfile'))}</div>` : ''}
      ${auto && tg.source && tg.tdee ? `<div class="set-ok mb-s"><span class="zone ${tg.source === 'measured' ? 'z-good' : 'z-warn'}"></span>${esc(tg.source === 'measured' ? t('set.fd.srcMeasured', { n: tg.days, t: D.fmtNum(tg.tdee) }) : t('set.fd.srcFormula', { t: D.fmtNum(tg.tdee) }))}</div>` : ''}
      <div class="set-grid2">
        ${FD_KEYS.map(([k, unit, min, max, step]) => `<div class="field"><label class="field-label">${t('set.fd.' + k)} <span class="set-unit">${unit}</span></label>${numInp(tg[k] == null ? null : Math.round(tg[k]), 'setFoodTarget', `data-k="${k}" min="${min}" max="${max}" step="${step}" placeholder="—" ${auto ? 'disabled' : ''}`)}</div>`).join('')}
      </div>
      <div class="row wrap mt-s">
        ${auto && D.food && D.food.recalcTargets ? `<button class="btn ghost sm" data-act="setFoodRecalc">${D.ic('refresh', 14)} ${t('set.fd.recalc')}</button>` : ''}
        <button class="btn ghost sm" data-act="go" data-view="food">${D.ic('chevR', 14)} ${t('set.fd.goFood')}</button>
      </div>`;
  }
  function foodSummary() {
    let tg = FOOD().targets;
    try { if (D.food && D.food.targets) tg = D.food.targets() || tg; } catch (e) { /* karta ichida ham shu xato ko'rinadi */ }
    const k = tg.kcal ? `${D.fmtNum(Math.round(tg.kcal))} kcal` : t('set.sum.none');
    return esc(tg.auto !== false ? `${k} · ${t('set.fd.auto')}` : k);
  }
  D.act.setFoodAuto = () => {
    const tg = FOOD().targets;
    tg.auto = tg.auto === false;
    if (tg.auto) recalcFood();
    D.save(); D.rerender();
  };
  D.act.setFoodTarget = (el) => {
    const k = el.dataset.k, spec = FD_KEYS.find((x) => x[0] === k);
    if (!spec) return;
    const v = num(el.value);
    if (v == null) { D.rerender(); return; }
    const tg = FOOD().targets;
    tg[k] = Math.round(D.clamp(v, spec[2], spec[3]));
    tg.auto = false; // qo'lda kiritildi — avto o'chadi
    D.save(); D.rerender();
  };
  D.act.setFoodRecalc = () => { FOOD().targets.auto = true; recalcFood(); D.save(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* AI — har kim o'z AI'sini ulaydi (2026-09-24)                        */
  /* Kalit serverda shifrlangan holda yotadi (api.py › ai_own_save) va   */
  /* brauzerga qaytib chiqmaydi: bu yerda faqat «sk-a…9f2c» ko'rinadi.   */
  /* Ulanmagan bo'lsa serverdagi umumiy kalit ishlaydi. Ovqat, Yusa va   */
  /* boshqa AI javoblari — hammasi shu sozlama orqali.                   */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'set.ai.title': "Sun'iy intellekt (AI)",
      'set.ai.hint': "O'z AI'ingizni ulang — ovqat tahlili, Yusa suhbati va boshqa AI javoblari shu orqali keladi. Xarajat o'z hisobingizdan.",
      'set.ai.nowOwn': "Sizning AI'ingiz ishlayapti: {p} · {m}", 'set.ai.nowServer': "Hozir umumiy server AI'si ishlayapti: {p} · {m}",
      'set.ai.nowNone': "AI ulanmagan — quyida o'zingiznikini ulang",
      'set.ai.broken': "Saqlangan kalitni o'qib bo'lmadi — kalitni qaytadan kiriting",
      'set.ai.provider': 'Provayder', 'set.ai.key': 'API kalit', 'set.ai.keyPh': "Kalitni shu yerga qo'ying",
      'set.ai.keyKeep': "Saqlangan: {k} — o'zgartirmasangiz bo'sh qoldiring", 'set.ai.getKey': 'Kalitni shu yerdan olasiz: {u}',
      'set.ai.base': 'Manzil (base URL)', 'set.ai.baseHint': "OpenAI'ga mos istalgan xizmat: Groq, Together, Mistral, xAI va boshqalar.",
      'set.ai.model': 'Model', 'set.ai.models': "Modellar ro'yxati", 'set.ai.modelsN': '{n} ta model',
      'set.ai.save': 'Ulash va tekshirish', 'set.ai.testing': 'Tekshirilmoqda…', 'set.ai.saved': 'AI ulandi: {m}',
      'set.ai.off': 'Uzish', 'set.ai.offQ': "O'z AI'ingiz uzilsinmi? Kalit serverdan o'chiriladi.", 'set.ai.offDone': 'AI uzildi',
      'set.ai.secure': "Kalit serverda shifrlangan holda saqlanadi va brauzerga qaytib chiqmaydi. Saqlashdan oldin kichik sinov so'rovi yuboriladi.",
      'set.ai.loading': 'Yuklanmoqda…', 'set.ai.srv': 'Umumiy', 'set.ai.sumNone': 'Ulanmagan', 'set.ai.k.custom': 'Boshqa',
      'set.ai.err.bad_key': "Kalit bo'sh yoki noto'g'ri", 'set.ai.err.bad_base': "Manzil noto'g'ri: faqat https va ochiq internetdagi manzil",
      'set.ai.err.bad_model': "Model nomi noto'g'ri", 'set.ai.err.auth': "Kalit qabul qilinmadi — to'g'ri nusxalanganini va hisobda mablag' borligini tekshiring",
      'set.ai.err.model': "Bunday model topilmadi — ro'yxatdan tanlang", 'set.ai.err.rate': "Juda ko'p so'rov — birozdan keyin urinib ko'ring",
      'set.ai.err.conn': "Provayderga ulanib bo'lmadi", 'set.ai.err.other': 'Xato: {m}',
    },
    uzk: {
      'set.ai.title': 'Сунъий интеллект (AI)',
      'set.ai.hint': 'Ўз AI’ингизни уланг — овқат таҳлили, Yusa суҳбати ва бошқа AI жавоблари шу орқали келади. Харажат ўз ҳисобингиздан.',
      'set.ai.nowOwn': 'Сизнинг AI’ингиз ишлаяпти: {p} · {m}', 'set.ai.nowServer': 'Ҳозир умумий сервер AI’си ишлаяпти: {p} · {m}',
      'set.ai.nowNone': 'AI уланмаган — қуйида ўзингизникини уланг',
      'set.ai.broken': 'Сақланган калитни ўқиб бўлмади — калитни қайтадан киритинг',
      'set.ai.provider': 'Провайдер', 'set.ai.key': 'API калит', 'set.ai.keyPh': 'Калитни шу ерга қўйинг',
      'set.ai.keyKeep': 'Сақланган: {k} — ўзгартирмасангиз бўш қолдиринг', 'set.ai.getKey': 'Калитни шу ердан оласиз: {u}',
      'set.ai.base': 'Манзил (base URL)', 'set.ai.baseHint': 'OpenAI’га мос исталган хизмат: Groq, Together, Mistral, xAI ва бошқалар.',
      'set.ai.model': 'Модель', 'set.ai.models': 'Моделлар рўйхати', 'set.ai.modelsN': '{n} та модель',
      'set.ai.save': 'Улаш ва текшириш', 'set.ai.testing': 'Текширилмоқда…', 'set.ai.saved': 'AI уланди: {m}',
      'set.ai.off': 'Узиш', 'set.ai.offQ': 'Ўз AI’ингиз узилсинми? Калит сервердан ўчирилади.', 'set.ai.offDone': 'AI узилди',
      'set.ai.secure': 'Калит серверда шифрланган ҳолда сақланади ва браузерга қайтиб чиқмайди. Сақлашдан олдин кичик синов сўрови юборилади.',
      'set.ai.loading': 'Юкланмоқда…', 'set.ai.srv': 'Умумий', 'set.ai.sumNone': 'Уланмаган', 'set.ai.k.custom': 'Бошқа',
      'set.ai.err.bad_key': 'Калит бўш ёки нотўғри', 'set.ai.err.bad_base': 'Манзил нотўғри: фақат https ва очиқ интернетдаги манзил',
      'set.ai.err.bad_model': 'Модель номи нотўғри', 'set.ai.err.auth': 'Калит қабул қилинмади — тўғри нусхаланганини ва ҳисобда маблағ борлигини текширинг',
      'set.ai.err.model': 'Бундай модель топилмади — рўйхатдан танланг', 'set.ai.err.rate': 'Жуда кўп сўров — бироздан кейин уриниб кўринг',
      'set.ai.err.conn': 'Провайдерга уланиб бўлмади', 'set.ai.err.other': 'Хато: {m}',
    },
    ru: {
      'set.ai.title': 'Искусственный интеллект (AI)',
      'set.ai.hint': 'Подключите свой AI — анализ еды, чат Yusa и другие ответы AI пойдут через него. Расходы — с вашего счёта.',
      'set.ai.nowOwn': 'Работает ваш AI: {p} · {m}', 'set.ai.nowServer': 'Сейчас работает общий AI сервера: {p} · {m}',
      'set.ai.nowNone': 'AI не подключён — подключите свой ниже',
      'set.ai.broken': 'Сохранённый ключ не удалось прочитать — введите ключ заново',
      'set.ai.provider': 'Провайдер', 'set.ai.key': 'API-ключ', 'set.ai.keyPh': 'Вставьте ключ сюда',
      'set.ai.keyKeep': 'Сохранён: {k} — оставьте пустым, если не меняете', 'set.ai.getKey': 'Ключ можно получить здесь: {u}',
      'set.ai.base': 'Адрес (base URL)', 'set.ai.baseHint': 'Любой сервис, совместимый с OpenAI: Groq, Together, Mistral, xAI и другие.',
      'set.ai.model': 'Модель', 'set.ai.models': 'Список моделей', 'set.ai.modelsN': 'моделей: {n}',
      'set.ai.save': 'Подключить и проверить', 'set.ai.testing': 'Проверяю…', 'set.ai.saved': 'AI подключён: {m}',
      'set.ai.off': 'Отключить', 'set.ai.offQ': 'Отключить ваш AI? Ключ будет удалён с сервера.', 'set.ai.offDone': 'AI отключён',
      'set.ai.secure': 'Ключ хранится на сервере в зашифрованном виде и не возвращается в браузер. Перед сохранением отправляется небольшой тестовый запрос.',
      'set.ai.loading': 'Загрузка…', 'set.ai.srv': 'Общий', 'set.ai.sumNone': 'Не подключён', 'set.ai.k.custom': 'Другой',
      'set.ai.err.bad_key': 'Ключ пустой или неверный', 'set.ai.err.bad_base': 'Неверный адрес: только https и публичный адрес',
      'set.ai.err.bad_model': 'Неверное имя модели', 'set.ai.err.auth': 'Ключ не принят — проверьте, что он скопирован целиком и на счёте есть средства',
      'set.ai.err.model': 'Такой модели нет — выберите из списка', 'set.ai.err.rate': 'Слишком много запросов — попробуйте чуть позже',
      'set.ai.err.conn': 'Не удалось связаться с провайдером', 'set.ai.err.other': 'Ошибка: {m}',
    },
  });
  // Tartib = ekrandagi tartib. Nomi brend — tarjima qilinmaydi (faqat «Boshqa»).
  const AI_KIND = [
    ['anthropic', 'Claude', 'console.anthropic.com/settings/keys'],
    ['openai', 'ChatGPT', 'platform.openai.com/api-keys'],
    ['gemini', 'Gemini', 'aistudio.google.com/apikey'],
    ['openrouter', 'OpenRouter', 'openrouter.ai/keys'],
    ['deepseek', 'DeepSeek', 'platform.deepseek.com/api_keys'],
    ['custom', null, ''],
  ];
  const aiKindName = (k) => { const x = AI_KIND.find((r) => r[0] === k); return x ? x[1] || t('set.ai.k.' + k) : k; };
  let aiInfo = null, aiLoading = false, aiBusy = false, aiMsg = '';
  const aiForm = { kind: null, model: '', base: '' };
  const aiModels = {};   // kind → ['model', …] (tugma bosilganda)
  /* Hisob almashganda (chiqish → boshqa odam kirishi, sahifa qayta yuklanmasdan)
     oldingi odamning AI ma'lumoti — provayder, model, kalit niqobi, yozib
     qo'yilgan manzil — xotirada qolmasin: aks holda yangi odam uni ko'rardi va
     «Saqlash» eski odamning manzili bilan o'z kalitini yuborishi mumkin edi. */
  let aiUid = D.me ? D.me.uid : null;
  D.on('me:changed', () => {
    // hodisa har /api/me so'rovidan keyin keladi — faqat ODAM almashganda tozalaymiz
    const uid = D.me ? D.me.uid : null;
    if (uid === aiUid) return;
    aiUid = uid;
    aiInfo = null; aiLoading = false; aiBusy = false; aiMsg = '';
    aiForm.kind = null; aiForm.model = ''; aiForm.base = '';
    for (const k of Object.keys(aiModels)) delete aiModels[k];
  });
  /** Server xatosini odam tiliga: api_401 → «kalit qabul qilinmadi». */
  function aiErrText(e) {
    const m = String((e && e.message) || e || '');
    if (/^bad_(key|base|model)$/.test(m)) return t('set.ai.err.' + m);
    if (/ai_bad_base/.test(m)) return t('set.ai.err.bad_base');
    if (/api_40[13]|authenticat|api key|api_key|unauthori/i.test(m)) return t('set.ai.err.auth');
    if (/api_404|model/i.test(m)) return t('set.ai.err.model');
    if (/rate_limited|429/.test(m)) return t('set.ai.err.rate');
    if (/ai_connection|timeout|Failed to fetch/i.test(m)) return t('set.ai.err.conn');
    return t('set.ai.err.other', { m: m.slice(0, 160) });
  }
  function aiLoad() {
    if (aiLoading) return;
    aiLoading = true;
    D.api('/api/me/ai').then((r) => { aiInfo = r; }).catch((e) => { aiMsg = aiErrText(e); })
      .finally(() => { aiLoading = false; if (D.current() === 'settings') D.rerender(); });
  }
  /* Bo'lim sarlavhasidagi qisqa xulosa: «Claude · claude-opus-5» yoki «Ulanmagan». */
  function aiSummary() {
    if (!aiInfo) { aiLoad(); return esc(t('set.ai.loading')); }
    const x = aiInfo.own || aiInfo.server;
    return x ? esc(`${aiInfo.own ? '' : t('set.ai.srv') + ' · '}${aiKindName(x.kind)} · ${x.model}`) : esc(t('set.ai.sumNone'));
  }
  const aiWarn = () => !!(aiInfo && (aiInfo.broken || (!aiInfo.own && !aiInfo.server)));
  function aiBody() {
    if (!aiInfo) { aiLoad(); return `<div class="help">${esc(aiMsg || t('set.ai.loading'))}</div>`; }
    const own = aiInfo.own, srv = aiInfo.server, kinds = aiInfo.kinds || {};
    const kind = aiForm.kind || (own && own.kind) || 'anthropic';
    const same = !!(own && own.kind === kind);
    const model = aiForm.model || (same ? own.model : (kinds[kind] || {}).model || '');
    const base = aiForm.base || (same ? own.base : '');
    const now = own ? `<div class="set-ok"><span class="zone z-good"></span>${esc(t('set.ai.nowOwn', { p: aiKindName(own.kind), m: own.model }))}</div>`
      : srv ? `<div class="set-ok"><span class="zone z-warn"></span>${esc(t('set.ai.nowServer', { p: aiKindName(srv.kind), m: srv.model }))}</div>`
      : `<div class="set-ok"><span class="zone z-bad"></span>${esc(t('set.ai.nowNone'))}</div>`;
    const url = (AI_KIND.find((r) => r[0] === kind) || [])[2];
    const list = aiModels[kind];
    const modelCtl = list && list.length
      ? `<select class="sel sm" id="setAiModel" data-change="setAiField" data-k="model">${(list.includes(model) ? list : [model].concat(list)).filter(Boolean).map((m) => `<option value="${esc(m)}" ${m === model ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>`
      : `<input class="inp sm" id="setAiModel" value="${esc(model)}" data-input="setAiField" data-k="model" autocomplete="off" spellcheck="false" autocapitalize="off">`;
    return `<div class="set-ai">
      <div class="help mb-s">${esc(t('set.ai.hint'))}</div>
      ${now}
      ${aiInfo.broken ? `<div class="set-ok"><span class="zone z-bad"></span>${esc(t('set.ai.broken'))}</div>` : ''}
      <div class="eyebrow set-sub-eyebrow">${esc(t('set.ai.provider'))}</div>
      <div class="set-ai-kinds" role="radiogroup" aria-label="${esc(t('set.ai.provider'))}">${AI_KIND.map(([k]) => `<button type="button" class="${k === kind ? 'on' : ''}" role="radio" aria-checked="${k === kind}" data-act="setAiKind" data-val="${k}">${esc(aiKindName(k))}</button>`).join('')}</div>
      ${kind === 'custom' ? `<div class="field"><label class="field-label" for="setAiBase">${esc(t('set.ai.base'))}</label>
        <input class="inp sm" id="setAiBase" type="url" inputmode="url" value="${esc(base)}" placeholder="https://…/v1" data-input="setAiField" data-k="base" autocomplete="off" spellcheck="false" autocapitalize="off">
        <div class="help">${esc(t('set.ai.baseHint'))}</div></div>` : ''}
      <div class="field"><label class="field-label" for="setAiKey">${esc(t('set.ai.key'))}</label>
        <input class="inp sm" id="setAiKey" type="password" placeholder="${esc(same ? t('set.ai.keyKeep', { k: own.key }) : t('set.ai.keyPh'))}" autocomplete="off" spellcheck="false" autocapitalize="off" data-enter="setAiSave">
        ${url ? `<div class="help">${esc(t('set.ai.getKey', { u: '' }))}<a href="https://${url}" target="_blank" rel="noopener noreferrer">${esc(url)}</a></div>` : ''}</div>
      <div class="field"><label class="field-label" for="setAiModel">${esc(t('set.ai.model'))}${list ? ` <span class="set-unit">${esc(t('set.ai.modelsN', { n: list.length }))}</span>` : ''}</label>
        <div class="set-ai-model">${modelCtl}<button class="btn ghost sm" data-act="setAiModels" ${aiBusy ? 'disabled' : ''}>${D.ic('list', 14)} ${esc(t('set.ai.models'))}</button></div></div>
      ${aiMsg ? `<div class="banner bad mt-s">${D.ic('alert', 16)}<span class="grow">${esc(aiMsg)}</span></div>` : ''}
      <div class="row wrap mt-s">
        <button class="btn" data-act="setAiSave" ${aiBusy ? 'disabled' : ''}>${D.ic(aiBusy ? 'refresh' : 'check', 14)} ${esc(t(aiBusy ? 'set.ai.testing' : 'set.ai.save'))}</button>
        ${own ? `<button class="btn ghost sm danger" data-act="setAiOff" ${aiBusy ? 'disabled' : ''}>${esc(t('set.ai.off'))}</button>` : ''}
      </div>
      <div class="help mt-s">${esc(t('set.ai.secure'))}</div>
    </div>`;
  }
  // Maydonlar yozilganda qayta chizilmaydi (fokus qolsin) — faqat eslab qolinadi.
  D.act.setAiField = (el) => { aiForm[el.dataset.k] = el.value.trim(); };
  D.act.setAiKind = (el) => {
    if (aiBusy) return;
    aiForm.kind = el.dataset.val; aiForm.model = ''; aiForm.base = ''; aiMsg = '';
    D.rerender();
  };
  const aiVal = (id) => { const i = D.$('#' + id); return i ? i.value.trim() : ''; };
  function aiReq() {
    const own = aiInfo && aiInfo.own;
    const kind = aiForm.kind || (own && own.kind) || 'anthropic';
    return { kind, key: aiVal('setAiKey'), model: aiVal('setAiModel'), base: kind === 'custom' ? aiVal('setAiBase') : '' };
  }
  D.act.setAiModels = async () => {
    if (aiBusy) return;
    const b = aiReq();
    aiBusy = true; aiMsg = ''; aiForm.kind = b.kind; aiForm.model = b.model; aiForm.base = b.base; D.rerender();
    const key = b.key;
    try {
      const r = await D.api('/api/me/ai/models', { method: 'POST', body: JSON.stringify(b), timeout: 30000 });
      aiModels[b.kind] = Array.isArray(r.models) ? r.models : [];
    } catch (e) { aiMsg = aiErrText(e); }
    aiBusy = false; D.rerender();
    const k = D.$('#setAiKey'); if (k && key) k.value = key;   // yozilgan kalit qayta chizishda yo'qolmasin
  };
  D.act.setAiSave = async () => {
    if (aiBusy) return;
    const b = aiReq();
    aiBusy = true; aiMsg = ''; aiForm.kind = b.kind; aiForm.model = b.model; aiForm.base = b.base; D.rerender();
    const key = b.key;
    try {
      const r = await D.api('/api/me/ai', { method: 'POST', body: JSON.stringify(b), timeout: 60000 });
      aiInfo = r; aiForm.kind = null; aiForm.model = ''; aiForm.base = '';
      D.toast(t('set.ai.saved', { m: (r.own && r.own.model) || b.model }));
    } catch (e) { aiMsg = aiErrText(e); }
    aiBusy = false; D.rerender();
    if (aiMsg) { const k = D.$('#setAiKey'); if (k && key) k.value = key; }
  };
  D.act.setAiOff = async () => {
    if (aiBusy || !(await D.confirm({ text: t('set.ai.offQ'), ok: t('set.ai.off'), danger: true }))) return;
    try { aiInfo = await D.api('/api/me/ai', { method: 'DELETE' }); aiForm.kind = null; aiMsg = ''; D.toast(t('set.ai.offDone')); }
    catch (e) { aiMsg = aiErrText(e); }
    D.rerender();
  };
  // Hisob almashsa (chiqib boshqasi kirsa) eski odamning holati ko'rinmasin
  D.on('me:changed', () => { aiInfo = null; aiMsg = ''; aiForm.kind = null; for (const k of Object.keys(aiModels)) delete aiModels[k]; });

  /* ------------------------------------------------------------------ */
  /* PRAYER                                                              */
  /* ------------------------------------------------------------------ */
  let reminderTimers = [];
  function clearReminders() { reminderTimers.forEach(clearTimeout); reminderTimers = []; }
  function notifSupported() { return typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function'; }
  function scheduleReminders() {
    clearReminders();
    try {
      if (!D.S || !S().prayer || !S().prayer.notify || !notifSupported() || Notification.permission !== 'granted' || !D.prayer) return;
      const p = D.nowTz(), nowM = p.h * 60 + p.min;
      for (const x of D.prayer.list(D.keyOf(p.y, p.m, p.d))) {
        if (x.id === 'quyosh') continue;
        const at = x.mins - 10;
        if (at <= nowM) continue;
        const ms = (at - nowM) * 60000 - p.s * 1000;
        reminderTimers.push(setTimeout(() => { try { new Notification(t('prayer.' + x.id), { body: t('set.pr.notifBody', { name: t('prayer.' + x.id), time: x.time }), tag: 'dash-prayer-' + x.id }); } catch (e) {} }, Math.max(1000, ms)));
      }
    } catch (e) { console.warn('reminders', e); }
  }
  D.on('boot', scheduleReminders);
  D.on('day:changed', scheduleReminders);
  D.on('state:changed', D.debounce(scheduleReminders, 1500)); // state may be replaced by pull/import/undo

  /** Namoz sozlamalari Sozlashda emas, faqat Ibodat › Vaqtlarda: gear tugmasi shuni ochadi.
      Vaqtlar jadvali va joylashuv o'sha ekranda yuqorida turibdi — bu yerda takrorlanmaydi. */
  D.settings = D.settings || {};
  /* Odat formasi Sozlashda yashaydi, lekin u Odat bo'limidan ham ochiladi:
     ikkita bir xil forma ikki xil joyda turishidan yomoni yo'q. */
  D.settings.habitNew = () => D.act.setHabitNew();
  D.settings.habitEdit = (id) => D.act.setHabitEdit({ dataset: { id } });
  D.settings.prayerCard = () => { try { return renderPrayer(); } catch (e) { console.error('prayer settings', e); D.logError(e); return ''; } };

  function renderPrayer() {
    const pr = S().prayer || {};
    const off = pr.offsets || {};
    // bo'sh maydon «usul yo'q» degan taassurot beradi — prayer.js nimadan foydalanayotgani ko'rsatiladi
    const eff = (() => { try { return D.prayer.conf(); } catch (e) { return { fajr: 15.5, isha: 15.5, asr: 'hanafi' }; } })();
    const perm = notifSupported() ? Notification.permission : 'unsupported';
    const notifyOn = !!pr.notify && perm === 'granted';
    return `
    <div class="card">
      <div class="card-head"><div class="title">${D.ic('sun')} ${t('set.pr.method')}</div></div>
      ${row(t('set.pr.fajr'), `<div class="set-inp-unit">${numInp(pr.fajr == null ? eff.fajr : pr.fajr, 'setPrNum', 'data-k="fajr" min="8" max="21" step="0.5"')}<span>\u00b0</span></div>`)}
      ${row(t('set.pr.isha'), `<div class="set-inp-unit">${numInp(pr.isha == null ? eff.isha : pr.isha, 'setPrNum', 'data-k="isha" min="8" max="21" step="0.5"')}<span>\u00b0</span></div>`)}
      ${row(t('set.pr.asr'), seg([{ v: 'hanafi', l: t('set.pr.hanafi') }, { v: 'shafi', l: t('set.pr.shafi') }], eff.asr, 'setAsr', 'compact'))}
      <div class="eyebrow set-sub-eyebrow">${t('set.pr.offsets')}</div>
      <div class="help mb-s">${esc(t('set.pr.offsetsHint'))}</div>
      <div class="set-off-grid">${OFFSET_IDS.map((id) => `<label class="set-off"><span class="tiny muted">${esc(t('prayer.' + id))}</span>${numInp(+off[id] || 0, 'setPrOffset', `data-id="${id}" min="-60" max="60" step="1"`, true)}</label>`).join('')}</div>
    </div>

    <div class="card">
      ${row(`${D.ic('moon', 14)} ${t('set.pr.hijri')}`, seg([-2, -1, 0, 1, 2].map((v) => ({ v: String(v), l: v > 0 ? '+' + v : String(v) })), String(+pr.hijriOffset || 0), 'setHijri', 'compact num'), t('set.pr.hijriHint'))}
    </div>

    <div class="card">
      ${row(`${D.ic('bolt', 14)} ${t('set.pr.notify')}`, `<button type="button" class="toggle ${notifyOn ? 'on' : ''}" data-act="setNotify" role="switch" aria-checked="${notifyOn}" aria-label="${esc(t('set.pr.notify'))}"></button>`,
        perm === 'denied' ? t('set.pr.notifyDenied') : perm === 'unsupported' ? t('set.pr.notifyNo') : t('set.pr.notifyHint'))}
    </div>`;
  }

  D.act.setPrNum = (el) => {
    const k = el.dataset.k, v = num(el.value);
    if (v == null) { D.rerender(); return; }
    const lim = { fajr: [8, 21], isha: [8, 21] }[k];
    if (!lim) return;
    S().prayer[k] = D.clamp(v, lim[0], lim[1]);
    D.save(); D.rerender(); scheduleReminders();
  };
  D.act.setPrOffset = (el) => { S().prayer.offsets = S().prayer.offsets || {}; S().prayer.offsets[el.dataset.id] = D.clamp(Math.round(num(el.value) || 0), -60, 60); D.save(); D.rerender(); scheduleReminders(); };
  D.act.setAsr = (el) => { S().prayer.asr = el.dataset.val === 'shafi' ? 'shafi' : 'hanafi'; D.save(); D.rerender(); scheduleReminders(); };
  D.act.setHijri = (el) => { S().prayer.hijriOffset = D.clamp(+el.dataset.val || 0, -2, 2); D.save(); D.rerender(); };
  D.act.setNotify = async () => {
    const pr = S().prayer;
    if (pr.notify) { pr.notify = false; clearReminders(); D.save(); D.rerender(); D.toast(t('set.pr.notifyOff')); return; }
    if (!notifSupported()) { D.toast(t('set.pr.notifyNo')); return; }
    let perm = Notification.permission;
    if (perm !== 'granted') { try { perm = await Notification.requestPermission(); } catch (e) { perm = 'denied'; } }
    if (perm !== 'granted') { pr.notify = false; D.save(); D.rerender(); D.toast(t('set.pr.notifyDenied')); return; }
    pr.notify = true; D.save(); D.rerender(); scheduleReminders(); D.toast(t('set.pr.notifyOn'));
  };

  /* ------------------------------------------------------------------ */
  /* FINANCE                                                             */
  /* ------------------------------------------------------------------ */
  function renderFinance() {
    const F = D.S.finance, cats = F.cats || [];
    const txCount = {};
    for (const x of F.tx || []) txCount[x.cat] = (txCount[x.cat] || 0) + 1;
    return `
      <div class="input-row mb">
        <input class="inp set-icon-inp" id="setCatIcon" maxlength="3" placeholder="—" autocomplete="off" aria-label="${esc(t('set.f.icon'))}">
        <input class="inp" id="setCatName" maxlength="30" placeholder="${esc(t('set.f.namePh'))}" autocomplete="off" data-enter="setCatAdd">
        <button class="btn sq" data-act="setCatAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button>
      </div>
      <div class="list">${cats.map((c) => `<div class="li set-cat">
        <span class="set-cat-ico" aria-hidden="true">${D.catMark(c.icon, 16)}</span>
        <input class="inp set-icon-inp sm" value="${esc(D.hasIcon(c.icon) ? '' : (c.icon || ''))}" maxlength="3" placeholder="—" data-change="setCatIcon" data-id="${esc(c.id)}" aria-label="${esc(t('set.f.icon'))}">
        <div class="li-body"><div class="li-text set-edit" data-act="setCatName" data-id="${esc(c.id)}">${esc(c.name)}</div>
          ${txCount[c.id] ? `<div class="li-meta"><span class="num">${esc(t('set.f.txCount', { n: txCount[c.id] }))}</span></div>` : ''}</div>
        ${c.id === FALLBACK_CAT ? '' : `<button class="li-del" data-act="setCatDel" data-id="${esc(c.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button>`}
      </div>`).join('')}</div>
      <div class="help mt-s">${esc(t('set.f.reassign'))}</div>`;
  }
  const findCat = (id) => (D.S.finance.cats || []).find((c) => c.id === id);
  D.act.setCatAdd = () => {
    const nameEl = D.$('#setCatName'), iconEl = D.$('#setCatIcon');
    const name = ((nameEl && nameEl.value) || '').trim().slice(0, 30);
    if (!name) { D.toast(t('set.f.needName')); return; }
    const icon = ((iconEl && iconEl.value) || '').trim().slice(0, 3) || 'layers';
    D.S.finance.cats.push({ id: D.uid('c'), name, icon });
    D.save(); D.rerender(); D.toast(t('set.f.added'));
  };
  /* Maydon FAQAT o'z belgisi uchun: bo'sh qolsa, kategoriya o'z sukut
     ikonkasiga qaytadi (chapdagi ko'rinish shuni chizadi). */
  D.act.setCatIcon = (el) => { const c = findCat(el.dataset.id); if (!c) return;
    const v = el.value.trim().slice(0, 3);
    c.icon = v || (D.defaultCats().find((d) => d.id === c.id) || {}).icon || 'layers';
    D.save(); D.rerender(); };
  D.act.setCatName = (el) => { const c = findCat(el.dataset.id); if (!c) return; inlineEdit(el, () => c.name, (v) => { c.name = v.slice(0, 30); D.save(); D.rerender(); }); };
  // delete category: reassign its transactions + budgets to 'boshqa' inside one undo-able op (mirrors D.remove)
  D.act.setCatDel = (el) => {
    const id = el.dataset.id;
    if (id === FALLBACK_CAT) { D.toast(t('set.f.cantDelete')); return; }
    const cats = D.S.finance.cats, i = cats.findIndex((c) => c.id === id);
    if (i < 0) return;
    const [cat] = cats.splice(i, 1);
    const moved = [];
    for (const x of D.S.finance.tx || []) if (x.cat === id) { moved.push(x); x.cat = FALLBACK_CAT; }
    const budBak = {};
    for (const [mk, b] of Object.entries(D.S.finance.budgets || {})) if (b && b[id] !== undefined) { budBak[mk] = b[id]; b[FALLBACK_CAT] = (+b[FALLBACK_CAT] || 0) + (+b[id] || 0); delete b[id]; }
    const label = t('set.f.catDeleted', { name: cat.name });
    D.undo.push({ label, undo: () => {
      cats.splice(Math.min(i, cats.length), 0, cat);
      for (const x of moved) x.cat = id;
      for (const [mk, v] of Object.entries(budBak)) { const b = D.S.finance.budgets[mk] = D.S.finance.budgets[mk] || {}; b[id] = v; b[FALLBACK_CAT] = (+b[FALLBACK_CAT] || 0) - (+v || 0); if (!b[FALLBACK_CAT]) delete b[FALLBACK_CAT]; }
    } });
    D.save(); D.rerender();
    D.toast(label, { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* DATA                                                                */
  /* ------------------------------------------------------------------ */
  /* «Ma'lumot sog'ligi» — /api/health dagi data bo'limi.
     Nega bu ekran bor: serverdagi hamma nusxa bitta diskda yotadi, ya'ni droplet yo'qolsa
     ular ham yo'qoladi. Yagona haqiqiy himoya — serverdan TASHQARIDAGI nusxa, va uning
     eskirib qolgani hech qayerda ko'rinmasa hech kim sezmaydi. Shu qator o'sha uchun. */
  let hl = null;
  const HL_MS = 60000;
  function healthData() {
    if (!D.serverEnabled()) return null;
    const uid = (D.device && D.device.uid) || '';
    if (!hl || hl.uid !== uid || (hl.state !== 'loading' && Date.now() - hl.ts > HL_MS)) {
      const prev = hl && hl.uid === uid && hl.state === 'ok' ? hl.r : null;
      hl = { state: 'loading', uid, ts: Date.now(), r: prev };
      D.api('/api/health').then((r) => { hl = { state: 'ok', uid, ts: Date.now(), r: (r && r.data) || {} }; })
        .catch(() => { hl = { state: 'err', uid, ts: Date.now() }; })
        .then(() => D.patch('setHealth', healthRows()));
    }
    return hl.state === 'ok' || hl.r ? hl.r : null;
  }
  function hrow(zone, label, value) {
    return `<div class="set-ok"><span class="zone ${zone}"></span><span>${esc(label)}: ${esc(value)}</span></div>`;
  }
  function daysWord(n) {
    return n === 0 ? t('set.h.today') : t('set.h.daysAgo', { n: D.fmtNum(n) });
  }
  function healthRows() {
    if (!D.serverEnabled()) return hrow('', t('set.dh.title'), t('set.d.archiveOff'));
    const h = healthData();
    if (!h) return hl && hl.state === 'err' ? hrow('z-bad', t('set.dh.title'), t('set.d.archiveOff'))
      : `<div class="set-ok"><span class="zone z-warn"></span><span>…</span></div>`;
    const warn = h.warn || [], db = h.db || {}, off = h.offsite || {};
    const rows = [];
    // 1) eng muhimi — serverdan tashqaridagi nusxa
    rows.push(hrow(warn.indexOf('offsite') >= 0 ? 'z-bad' : 'z-good', t('set.h.offsite'),
      off.ageDays === null || off.ageDays === undefined ? t('set.h.never') : daysWord(off.ageDays)));
    // 2) serverdagi kunlik nusxa
    rows.push(hrow(warn.indexOf('backup') >= 0 ? 'z-bad' : 'z-good', t('set.h.local'),
      h.lastDbBackup ? `${h.lastDbBackup} · ${t('set.h.copies', { n: D.fmtNum((+h.backups || 0) + (+h.dbBackups || 0)) })}` : t('set.h.never')));
    // 3) arxivning qamrovi va hajmi
    const rowsN = db.rows || {};
    const recs = (+rowsN.day_facts || 0) + (+rowsN.whoop_records || 0) + (+rowsN.chat_messages || 0);
    rows.push(hrow('z-good', t('set.h.records'),
      t('set.h.recordsLine', { n: D.fmtNum(recs), mb: D.fmtNum((+db.bytes || 0) / 1048576, 1) })));
    // 4) bazaning butunligi — kuniga bir marta tekshiriladi
    rows.push(hrow(h.integrity === 'ok' ? 'z-good' : h.integrity ? 'z-bad' : 'z-warn', t('set.h.integrity'),
      h.integrity === 'ok' ? t('set.h.ok') : h.integrity || t('set.h.unchecked')));
    // 5) shifrlash — serverdagi fayllar va arxiv AES-256 bilan yopiqmi
    if (h.vault) {
      const v = h.vault;
      rows.push(hrow(warn.indexOf('vault') >= 0 ? 'z-bad' : 'z-good', t('set.h.vault'),
        v.error ? v.error : warn.indexOf('vault') >= 0 ? t('set.h.vaultPlain', { n: D.fmtNum(+v.plain || 0) }) : t('set.h.vaultOk')));
    }
    // 6) disk
    if (h.diskFreeMb !== undefined) {
      rows.push(hrow(warn.indexOf('disk') >= 0 ? 'z-bad' : 'z-good', t('set.h.disk'),
        t('set.h.diskLine', { n: D.fmtNum(h.diskFreeMb / 1024, 1) })));
    }
    if (warn.indexOf('offsite') >= 0) rows.push(`<div class="help mt-s">${esc(t('set.h.warnOffsite'))}</div>`);
    return rows.join('');
  }

  function renderData() {
    const errs = (D.errors || []).slice().reverse();
    return `
      <div class="set-sub-h">${t('set.d.backup')} <span class="muted num">· ${D.fmtNum(storageKb(), 1)} KB</span></div>
      <div class="set-grid2">
        <button class="btn" data-act="setExport">${D.ic('download', 16)} ${t('set.d.export')}</button>
        <button class="btn ghost" data-act="setImportPick">${D.ic('upload', 16)} ${t('set.d.import')}</button>
      </div>
      <input type="file" class="set-vh" id="setImportInp" accept=".json,application/json" data-change="setImportFile" tabindex="-1" aria-hidden="true">
      <div class="help mt-s">${esc(t('set.d.importHint'))}</div>

      ${D.serverEnabled() ? `<div class="set-sub-h">${D.ic('shield', 15)} ${t('set.dh.title')}</div>
      <div id="setHealth">${healthRows()}</div>
      <button class="btn block mt-s" data-act="setVersions">${D.ic('undo', 16)} ${t('set.v.open')}</button>
      <div class="help mt-s">${esc(t('set.v.hint'))}</div>
      <a class="btn ghost block mt-s" href="/api/export/full" download>${D.ic('download', 16)} ${t('set.h.full')}</a>
      <div class="help mt-s">${esc(t('set.h.fullHint'))}</div>` : ''}

      ${errs.length ? `<div class="set-sub-h">${D.ic('alert', 15)} ${t('set.d.diag')} <span class="pill bad num">${esc(t('set.d.errors', { n: errs.length }))}</span></div>
      <div class="set-diag">${errs.slice(0, 10).map((e) => `<div class="set-err"><span class="num tiny muted">${esc(D.fmtTs(e.ts))}</span><span>${esc(e.msg)}</span></div>`).join('')}</div>
      <button class="btn ghost sm mt-s" data-act="setCopyErrors">${D.ic('list', 14)} ${t('set.d.copy')}</button>` : ''}

      <div class="set-sub-h set-danger-h">${t('set.d.danger')}</div>
      <button class="btn danger" data-act="setReset">${D.ic('trash', 16)} ${t('set.d.reset')}</button>`;
  }

  D.act.setLogout = async () => {
    // yuborilmagan yozuv bo'lsa — buni yashirmaymiz; chiqish paytida avval yuborishga urinib ko'riladi
    const text = t(D._pending ? 'set.logoutQ2' : 'set.logoutQ');
    if (!(await D.confirm({ text, ok: t('set.logout') }))) return;
    D.auth.logout();
  };
  D.i18n.add({ uz: { 'set.d.archiveOff': 'mavjud emas' }, uzk: { 'set.d.archiveOff': 'мавжуд эмас' }, ru: { 'set.d.archiveOff': 'недоступен' } });
  D.i18n.add({
    uz: { 'set.h.vault': 'Shifrlash', 'set.h.vaultOk': 'AES-256 · hammasi yopiq', 'set.h.vaultPlain': '{n} ta fayl ochiq qolgan' },
    uzk: { 'set.h.vault': 'Шифрлаш', 'set.h.vaultOk': 'AES-256 · ҳаммаси ёпиқ', 'set.h.vaultPlain': '{n} та файл очиқ қолган' },
    ru: { 'set.h.vault': 'Шифрование', 'set.h.vaultOk': 'AES-256 · всё закрыто', 'set.h.vaultPlain': 'открытых файлов: {n}' } });
  /* Ma'lumot sog'ligi — «hisobim yillar o'tsa ham joyidami?» degan savolga ko'rinadigan javob */
  D.i18n.add({
    uz: { 'set.dh.title': "Ma'lumot sog'ligi", 'set.h.offsite': 'Serverdan tashqaridagi nusxa', 'set.h.local': 'Serverdagi kunlik nusxa',
      'set.h.records': 'Arxivdagi yozuvlar', 'set.h.recordsLine': '{n} ta · {mb} MB', 'set.h.integrity': 'Bazaning butunligi',
      'set.h.ok': 'joyida', 'set.h.unchecked': 'hali tekshirilmagan', 'set.h.disk': 'Serverdagi disk', 'set.h.diskLine': "{n} GB bo'sh",
      'set.h.today': 'bugun', 'set.h.daysAgo': '{n} kun oldin', 'set.h.never': 'hali olinmagan', 'set.h.copies': '{n} ta nusxa',
      'set.h.full': "To'liq eksport (ZIP)",
      'set.h.fullHint': "Holat, butun arxiv, profil va suratlar — bitta faylda. Ichidagi hamma narsa oddiy JSON: ilova bo'lmasa ham o'qiladi.",
      'set.h.warnOffsite': "Diqqat: hamma nusxa serverning bitta diskida. Kompyuteringizda deploy\\pull-backup.ps1 ni ishga tushiring — u nusxani shu yerdan tashqariga chiqaradi." },
    uzk: { 'set.dh.title': 'Маълумот соғлиғи', 'set.h.offsite': 'Сервердан ташқаридаги нусха', 'set.h.local': 'Сервердаги кунлик нусха',
      'set.h.records': 'Архивдаги ёзувлар', 'set.h.recordsLine': '{n} та · {mb} МБ', 'set.h.integrity': 'Базанинг бутунлиги',
      'set.h.ok': 'жойида', 'set.h.unchecked': 'ҳали текширилмаган', 'set.h.disk': 'Сервердаги диск', 'set.h.diskLine': '{n} ГБ бўш',
      'set.h.today': 'бугун', 'set.h.daysAgo': '{n} кун олдин', 'set.h.never': 'ҳали олинмаган', 'set.h.copies': '{n} та нусха',
      'set.h.full': 'Тўлиқ экспорт (ZIP)',
      'set.h.fullHint': 'Ҳолат, бутун архив, профил ва суратлар — битта файлда. Ичидаги ҳамма нарса оддий JSON: илова бўлмаса ҳам ўқилади.',
      'set.h.warnOffsite': 'Диққат: ҳамма нусха сервернинг битта дискида. Компютерингизда deploy\\pull-backup.ps1 ни ишга туширинг — у нусхани шу ердан ташқарига чиқаради.' },
    ru: { 'set.dh.title': 'Сохранность данных', 'set.h.offsite': 'Копия вне сервера', 'set.h.local': 'Ежедневная копия на сервере',
      'set.h.records': 'Записей в архиве', 'set.h.recordsLine': '{n} · {mb} МБ', 'set.h.integrity': 'Целостность базы',
      'set.h.ok': 'в порядке', 'set.h.unchecked': 'ещё не проверялась', 'set.h.disk': 'Диск сервера', 'set.h.diskLine': '{n} ГБ свободно',
      'set.h.today': 'сегодня', 'set.h.daysAgo': '{n} дн. назад', 'set.h.never': 'ещё не делалась', 'set.h.copies': 'копий: {n}',
      'set.h.full': 'Полный экспорт (ZIP)',
      'set.h.fullHint': 'Состояние, весь архив, профиль и фото — одним файлом. Внутри обычный JSON: читается и без приложения.',
      'set.h.warnOffsite': 'Внимание: все копии на одном диске сервера. Запустите на компьютере deploy\\pull-backup.ps1 — он вынесет копию за пределы сервера.' } });
  D.i18n.add({
    uz: { 'set.pw': 'Parol', 'set.pw.title': "Parolni o'zgartirish", 'set.pw.old': 'Hozirgi parol', 'set.pw.new': 'Yangi parol',
      'set.pw.hint': 'Kamida 8 ta belgi', 'set.pw.save': 'Saqlash', 'set.pw.ok': 'Parol yangilandi',
      'set.pw.bad': "Hozirgi parol to'g'ri kelmadi", 'set.pw.weak': 'Yangi parol kamida 8 ta belgi',
      'set.pw.many': "Juda ko'p urinish — birozdan keyin", 'set.pw.err': "Bo'lmadi — qaytadan urinib ko'ring" },
    uzk: { 'set.pw': 'Парол', 'set.pw.title': 'Паролни ўзгартириш', 'set.pw.old': 'Ҳозирги парол', 'set.pw.new': 'Янги парол',
      'set.pw.hint': 'Камида 8 та белги', 'set.pw.save': 'Сақлаш', 'set.pw.ok': 'Парол янгиланди',
      'set.pw.bad': 'Ҳозирги парол тўғри келмади', 'set.pw.weak': 'Янги парол камида 8 та белги',
      'set.pw.many': 'Жуда кўп уриниш — бироздан кейин', 'set.pw.err': 'Бўлмади — қайтадан уриниб кўринг' },
    ru: { 'set.pw': 'Пароль', 'set.pw.title': 'Сменить пароль', 'set.pw.old': 'Текущий пароль', 'set.pw.new': 'Новый пароль',
      'set.pw.hint': 'Не короче 8 символов', 'set.pw.save': 'Сохранить', 'set.pw.ok': 'Пароль обновлён',
      'set.pw.bad': 'Текущий пароль не подошёл', 'set.pw.weak': 'Новый пароль не короче 8 символов',
      'set.pw.many': 'Слишком много попыток — попробуйте позже', 'set.pw.err': 'Не получилось — попробуйте ещё раз' } });
  D.i18n.add({ uz: { 'set.logout': 'Chiqish', 'set.logoutQ': 'Chiqilsinmi? Bu qurilmadagi nusxa o‘chiriladi, serverdagi ma’lumot saqlanadi.',
      'set.logoutQ2': 'Serverga yuborilmagan yozuvlar bor. Chiqishdan oldin ularni yuborib ko‘ramiz; yetmasa shu qurilmada saqlanadi va qaytib kirganingizda o‘zi qo‘shiladi. Chiqilsinmi?' },
    uzk: { 'set.logout': 'Чиқиш', 'set.logoutQ': 'Чиқилсинми? Бу қурилмадаги нусха ўчирилади, сервердаги маълумот сақланади.',
      'set.logoutQ2': 'Серверга юборилмаган ёзувлар бор. Чиқишдан олдин уларни юбориб кўрамиз; етмаса шу қурилмада сақланади ва қайтиб кирганингизда ўзи қўшилади. Чиқилсинми?' },
    ru: { 'set.logout': 'Выйти', 'set.logoutQ': 'Выйти? Копия на этом устройстве будет удалена, данные на сервере сохранятся.',
      'set.logoutQ2': 'Есть записи, не отправленные на сервер. Перед выходом попробуем их отправить; если не выйдет — они останутся на этом устройстве и вернутся при следующем входе. Выйти?' } });
  /* Parolni o'zgartirish: eski + yangi. Server eskisini tekshiradi, xeshni yangilaydi. */
  D.act.setPassword = () => D.modal({
    title: t('set.pw.title'),
    body: `<input class="inp" id="pwOld" type="password" autocomplete="current-password" placeholder="${esc(t('set.pw.old'))}" aria-label="${esc(t('set.pw.old'))}">
      <input class="inp" id="pwNew" type="password" autocomplete="new-password" placeholder="${esc(t('set.pw.new'))}" aria-label="${esc(t('set.pw.new'))}" data-enter="pwSave">
      <div class="tiny muted">${esc(t('set.pw.hint'))}</div>
      <div class="tiny bad" id="pwErr" hidden></div>`,
    actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('set.pw.save'), act: 'pwSave', primary: true }],
  });
  D.act.pwSave = async () => {
    const oldEl = D.$('#pwOld'), newEl = D.$('#pwNew'), err = D.$('#pwErr');
    if (!oldEl || !newEl) return;
    const fail = (key) => { err.textContent = t(key); err.hidden = false; };
    if ((newEl.value || '').length < 8) return fail('set.pw.weak');
    try {
      const r = await D.api('/api/me/password', { method: 'POST', body: JSON.stringify({ old: oldEl.value, new: newEl.value }) });
      if (r && r.ok) { D.closeModal(); D.toast(t('set.pw.ok'), { ms: 3500 }); return; }
    } catch (e) {
      // D.api xatoni Error(message = serverdagi error kaliti) qilib otadi
      const code = (e && e.message) || '';
      return fail(code === 'bad_pass' ? 'set.pw.bad' : code === 'weak_pass' ? 'set.pw.weak'
        : code === 'too_many' ? 'set.pw.many' : 'set.pw.err');
    }
    fail('set.pw.err');
  };
  D.act.setExport = () => D.exportJson();
  D.act.setImportPick = () => { const i = D.$('#setImportInp'); if (i) i.click(); };
  D.act.setImportFile = async (el) => {
    const f = el.files && el.files[0];
    el.value = '';
    if (!f) return;
    try {
      const text = typeof f.text === 'function' ? await f.text()
        : await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => rej(r.error || new Error('read')); r.readAsText(f); });
      await D.importJson(text);
    } catch (e) { D.toast(t('set.d.importFail', { msg: (e && e.message) || e }), { ms: 4000 }); }
  };
  D.act.setReset = async () => {
    const ok = await D.confirm({ title: t('set.d.resetTitle'), text: t('set.d.resetText'), ok: t('set.d.resetOk'), danger: true });
    if (!ok) return;
    const prev = D.S;
    const next = D.normalize(D.defaultState());
    next.meta.deviceId = prev.meta.deviceId;
    next.settings.lang = prev.settings.lang; next.settings.theme = prev.settings.theme;
    D.S = next;
    D.undo.push({ label: t('set.d.resetDone'), undo: () => { D.S = prev; } });
    D.saveReplace(); D.theme.apply(); D.renderNav(); D.rerender();
    D.toast(t('set.d.resetDone'), { undo: () => D.undo.pop() });
  };
  /* ---- Tiklash nuqtalari: serverdagi nusxalardan istalganiga qaytish ----
     Hozirgi holat server tomonida avval abadiy nusxa bo'ladi, ya'ni tiklashni ham
     orqaga qaytarsa bo'ladi. Qotirilgan (📌) nusxalar — katta o'zgarishdan oldingi holat. */
  D.i18n.add({
    uz: { 'set.v.open': 'Oldingi holatga qaytish', 'set.v.hint': "Har saqlashda nusxa olinadi. Nimadir yo'qolsa — shu yerdan istalgan kunga qaytarasiz. Hozirgi holat ham nusxa bo'lib qoladi.",
      'set.v.title': 'Tiklash nuqtalari', 'set.v.empty': "Hali nusxa yo'q", 'set.v.fail': "Ro'yxat olinmadi",
      'set.v.line': '{days} kun · {habits} odat · {tasks} vazifa · {tx} xarajat', 'set.v.pin': "o'zgarishdan oldin", 'set.v.pinRestore': 'tiklashdan oldin', 'set.v.pinReplace': 'import/tozalashdan oldin',
      'set.v.go': 'Qaytarish', 'set.v.q': '{when} dagi holatga qaytarilsinmi?', 'set.v.qText': "Hozirgi holat o'chmaydi — u ham ro'yxatda nusxa bo'lib qoladi.",
      'set.v.done': 'Holat tiklandi', 'set.v.err': 'Tiklab bo‘lmadi: {msg}', 'set.v.now': 'hozirgi' },
    uzk: { 'set.v.open': 'Олдинги ҳолатга қайтиш', 'set.v.hint': 'Ҳар сақлашда нусха олинади. Нимадир йўқолса — шу ердан исталган кунга қайтарасиз. Ҳозирги ҳолат ҳам нусха бўлиб қолади.',
      'set.v.title': 'Тиклаш нуқталари', 'set.v.empty': 'Ҳали нусха йўқ', 'set.v.fail': 'Рўйхат олинмади',
      'set.v.line': '{days} кун · {habits} одат · {tasks} вазифа · {tx} харажат', 'set.v.pin': 'ўзгаришдан олдин', 'set.v.pinRestore': 'тиклашдан олдин', 'set.v.pinReplace': 'импорт/тозалашдан олдин',
      'set.v.go': 'Қайтариш', 'set.v.q': '{when} даги ҳолатга қайтарилсинми?', 'set.v.qText': 'Ҳозирги ҳолат ўчмайди — у ҳам рўйхатда нусха бўлиб қолади.',
      'set.v.done': 'Ҳолат тикланди', 'set.v.err': 'Тиклаб бўлмади: {msg}', 'set.v.now': 'ҳозирги' },
    ru: { 'set.v.open': 'Вернуть прежнее состояние', 'set.v.hint': 'При каждом сохранении делается копия. Если что-то пропало — верните любой день отсюда. Текущее состояние тоже останется копией.',
      'set.v.title': 'Точки восстановления', 'set.v.empty': 'Копий пока нет', 'set.v.fail': 'Не удалось получить список',
      'set.v.line': '{days} дн · {habits} привычек · {tasks} задач · {tx} расходов', 'set.v.pin': 'до изменения', 'set.v.pinRestore': 'до восстановления', 'set.v.pinReplace': 'до импорта/сброса',
      'set.v.go': 'Вернуть', 'set.v.q': 'Вернуть состояние на {when}?', 'set.v.qText': 'Текущее состояние не удалится — оно тоже останется копией в списке.',
      'set.v.done': 'Состояние восстановлено', 'set.v.err': 'Не удалось восстановить: {msg}', 'set.v.now': 'текущее' },
  });
  const vWhen = (iso) => { const ms = Date.parse(iso); return Number.isFinite(ms) ? D.fmtTs(ms) : String(iso || ''); };
  function versionRow(v, i) {
    const sm = v.summary || {};
    const pinTxt = !v.pinned ? '' : t(v.note === 'restore' ? 'set.v.pinRestore' : v.note === 'replace' ? 'set.v.pinReplace' : 'set.v.pin');
    return `<div class="set-ver${v.pinned ? ' pin' : ''}">
      <div class="set-ver-b"><div class="set-ver-t num">${esc(vWhen(v.savedAt))}${i === 0 ? ` <span class="pill">${esc(t('set.v.now'))}</span>` : ''}${pinTxt ? ` <span class="pill on">📌 ${esc(pinTxt)}</span>` : ''}</div>
        <div class="set-ver-s num">${esc(t('set.v.line', { days: D.fmtNum(sm.days || 0), habits: D.fmtNum(sm.habits || 0), tasks: D.fmtNum(sm.tasks || 0), tx: D.fmtNum(sm.tx || 0) }))}</div></div>
      ${i === 0 ? '' : `<button class="btn ghost sm" data-act="setVerRestore" data-id="${esc(v.id)}" data-when="${esc(vWhen(v.savedAt))}">${esc(t('set.v.go'))}</button>`}
    </div>`;
  }
  D.act.setVersions = async () => {
    D.modal({ title: t('set.v.title'), body: `<div class="set-vers" id="setVers"><div class="muted small">…</div></div>` });
    let list = null;
    try { if (D.flush) await D.flush(); list = await D.api('/api/versions'); } catch (e) { list = null; }
    const box = D.$('#setVers'); if (!box) return;
    if (!Array.isArray(list)) { box.innerHTML = `<div class="empty">${esc(t('set.v.fail'))}</div>`; return; }
    box.innerHTML = list.length ? list.map(versionRow).join('') : `<div class="empty">${esc(t('set.v.empty'))}</div>`;
  };
  D.act.setVerRestore = async (el) => {
    const id = el.dataset.id, when = el.dataset.when;
    const ok = await D.confirm({ title: t('set.v.q', { when }), text: t('set.v.qText'), ok: t('set.v.go') });
    if (!ok) return;
    try {
      const r = await D.api(`/api/versions/${encodeURIComponent(id)}/restore`, { method: 'POST', body: '{}', timeout: 60000 });
      if (!r || !r.data) throw new Error('empty');
      const deviceId = D.S.meta.deviceId;
      D.S = D.normalize(r.data);
      D.S.meta.deviceId = deviceId;
      if (D.flushLocal) D.flushLocal();
      D.emit('state:changed');
      D.theme.apply(); D.renderNav(); D.rerender();
      D.toast(t('set.v.done'), { ms: 3500 });
    } catch (e) { D.toast(t('set.v.err', { msg: (e && e.message) || e }), { ms: 4000 }); }
  };
  D.act.setCopyErrors = async () => {
    const text = (D.errors || []).map((e) => `${D.fmtTs(e.ts)} ${e.msg}\n${e.stack || ''}`).join('\n\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      D.toast(t('set.d.copied'));
    } catch (e) { D.toast(t('set.d.copyFail')); }
  };

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  /* Bitta sahifa: profil eng tepada, keyin tana, ovqat, ilova, ro'yxatlar,
     oxirida ma'lumot. Eski havolalar (#settings/prayer, /general, /finance…)
     shu sahifaga tushadi — sub endi hech narsani almashtirmaydi. */
  let waitingProfile = false;
  D.i18n.add({
    uz: {
      'set.time.title': 'Vaqt va joy', 'set.time.zone': 'Vaqt mintaqasi', 'set.time.place': 'Namoz uchun shahar',
      'set.time.dayStart': 'Kun boshlanadi',
      'set.time.match': 'Telefoningizning vaqti bilan bir xil',
      'set.time.diff': 'Telefoningiz boshqa mintaqada: {d}',
      'set.time.diffWhy': 'Ilova pastdagi mintaqa bilan hisoblaydi. Boshqa shaharga ko\u2018chgan bo\u2018lsangiz almashtiring.',
      'set.time.switch': '{d} ga o\u2018tish', 'set.time.switchQ': '{d} ga o\u2018tilsinmi?',
      'set.time.switchWarn': 'Kun chegarasi siljiydi: ilgari yozilgan ba\u2019zi yozuvlar qo\u2018shni kunga tushishi mumkin. Namoz vaqtlari ham yangi mintaqa bo\u2018yicha hisoblanadi.',
      'set.time.switchOk': 'Almashtirish', 'set.time.switched': 'Endi {d} bilan hisoblanadi',
    },
    uzk: {
      'set.time.title': 'Вақт ва жой', 'set.time.zone': 'Вақт минтақаси', 'set.time.place': 'Намоз учун шаҳар',
      'set.time.dayStart': 'Кун бошланади',
      'set.time.match': 'Телефонингизнинг вақти билан бир хил',
      'set.time.diff': 'Телефонингиз бошқа минтақада: {d}',
      'set.time.diffWhy': 'Илова пастдаги минтақа билан ҳисоблайди. Бошқа шаҳарга кўчган бўлсангиз алмаштиринг.',
      'set.time.switch': '{d} га ўтиш', 'set.time.switchQ': '{d} га ўтилсинми?',
      'set.time.switchWarn': 'Кун чегараси силжийди: илгари ёзилган баъзи ёзувлар қўшни кунга тушиши мумкин. Намоз вақтлари ҳам янги минтақа бўйича ҳисобланади.',
      'set.time.switchOk': 'Алмаштириш', 'set.time.switched': 'Энди {d} билан ҳисобланади',
    },
    ru: {
      'set.time.title': 'Время и место', 'set.time.zone': 'Часовой пояс', 'set.time.place': 'Город для намаза',
      'set.time.dayStart': 'День начинается',
      'set.time.match': 'Совпадает с временем телефона',
      'set.time.diff': 'Телефон в другом поясе: {d}',
      'set.time.diffWhy': 'Приложение считает по поясу ниже. Если вы переехали — переключите.',
      'set.time.switch': 'Перейти на {d}', 'set.time.switchQ': 'Перейти на {d}?',
      'set.time.switchWarn': 'Граница суток сместится: часть прежних записей может попасть на соседний день. Время намаза тоже пересчитается.',
      'set.time.switchOk': 'Переключить', 'set.time.switched': 'Теперь считаем по {d}',
    },
  });

  /* ------------------------------------------------------------------ */
  /* VAQT VA JOY                                                          */
  /* Ilova hamma narsani bitta vaqt mintaqasi bilan hisoblaydi: kun qachon */
  /* boshlanadi, namoz vaqtlari, uyqu, tarix kalitlari. Foydalanuvchi      */
  /* boshqa shaharga borsa, ilova buni sezadi va aytadi — lekin O'ZI       */
  /* ALMASHTIRMAYDI: mintaqa almashsa, yozilgan kunlarning kaliti siljib,  */
  /* eski yozuvlar boshqa kunga tushib qoladi.                            */
  /* ------------------------------------------------------------------ */
  function timeCard() {
    const i = D.tzInfo();
    const pr = D.S.settings.prayer || {};
    let place = pr.place || '';
    if (!place && D.prayer && D.prayer.nearest) {
      try { const n = D.prayer.nearest(pr.lat, pr.lng); place = n ? n.n : ''; } catch (e) { place = ''; }
    }
    return `<div class="set-time">
      <div class="set-sub-h">${esc(t('set.time.title'))} <span class="muted num">· ${esc(i.city)} ${esc(i.offset)}</span>
        <span class="pill num set-clock" id="setClock">${D.ic('clock', 12)} ${esc(i.clock)}</span></div>
      <div class="set-time-rows">
        <div class="set-time-row"><span>${esc(t('set.time.zone'))}</span>${sel(tzOptions(), i.tz, 'setTzPick')}</div>
        ${place ? `<div class="set-time-row"><span>${esc(t('set.time.place'))}</span><b>${esc(place)}</b></div>` : ''}
        <div class="set-time-row"><span>${esc(t('set.time.dayStart'))}</span><b class="num">${esc(D.fmtTime(D.S.settings.dayStart || 0, 0))}</b></div>
      </div>
      ${i.same ? `<div class="set-time-ok">${D.ic('check', 14)} ${esc(t('set.time.match'))}</div>`
        : `<div class="set-time-warn">
            <div>${D.ic('alert', 15)} ${esc(t('set.time.diff', { d: i.device }))}</div>
            <div class="small">${esc(t('set.time.diffWhy'))}</div>
            <button class="btn ghost sm" data-act="setTz" data-tz="${esc(i.device)}">${esc(t('set.time.switch', { d: i.device }))}</button>
          </div>`}
    </div>`;
  }
  D.act.setTz = async (el) => {
    const tz = el.dataset.tz;
    if (!tz) return;
    const ok = await D.confirm({ title: t('set.time.switchQ', { d: tz }), text: t('set.time.switchWarn'), ok: t('set.time.switchOk'), danger: true });
    if (!ok) return;
    applyTz(tz);
    D.toast(t('set.time.switched', { d: tz }), { ms: 3000 });
  };

  function render() {
    const sub = D.sub('settings', '');
    // Eski '#settings/prayer' havolasi Ibodatga yo'naltiriladi. Yo'naltirish
    // tarixga yozuv QO'SHMASLIGI kerak: aks holda orqaga bosgan odam yana
    // shu yerga tushib, yana Ibodatga itariladi va oldinga tarix yo'qoladi.
    if (sub === 'prayer') {
      D.ui.sub.settings = ''; D.saveUi();
      try { history.replaceState(history.state, '', '#settings'); } catch (e) {}
      setTimeout(() => D.go('prayer', 'times', { fromHistory: true }), 0);
    }
    const safe = (f) => { try { return f(); } catch (e) { console.error('sozlash', e); D.logError(e); return ''; } };
    // profile.js fonda keladi va bu sahifadan keyin qolishi mumkin — kutamiz va
    // kelgach bir marta qayta chizamiz, aks holda profil kartasi ko'rinmay qoladi
    if (!D.profile && !waitingProfile && D.loadLib) {
      waitingProfile = true;
      D.loadLib('profile').then(() => { waitingProfile = false; if (D.current() === 'settings') D.rerender(); });
    }
    const s = S(), tz = (() => { try { return D.tzInfo(); } catch (e) { return null; } })();
    const langName = t('lang.short.' + D.lang());
    const themeName = t('theme.' + (s.theme || 'dark'));
    // Telefon boshqa mintaqada bo'lsa — bo'lim yopiq turganda ham ko'rinsin
    const tzWarn = !!(tz && !tz.same);
    const appSum = esc([langName, themeName, s.currency || 'UZS'].join(' · ')) + (tz ? esc(' · ' + tz.city) : '')
      + (tzWarn ? ` · ${D.ic('alert', 12)} ${esc(tz.device)}` : '');
    const hs = D.S.habits, cats = D.S.finance.cats || [], errs = (D.errors || []).length;
    const dataSum = esc(`${D.fmtNum(storageKb(), 1)} KB`) + (errs ? ' · ' + esc(t('set.sum.errors', { n: errs })) : '');
    return `<div class="set-page">
      ${D.profile ? safe(() => D.profile.cardHtml()) : ''}
      <div class="set-secs">
        ${D.install && D.install.available() ? `<div class="card set-sec set-inst"><button type="button" class="set-sec-h" data-act="installRun">
          <span class="set-sec-ic">${D.ic('download', 18)}</span>
          <span class="set-sec-txt"><span class="set-sec-t">${esc(t('install.row'))}</span><span class="set-sec-s">${esc(t('install.rowSub'))}</span></span>
          <span class="set-sec-chev">${D.ic('chevR', 16)}</span></button></div>` : ''}
        ${safe(() => section('body', 'scale', t('set.body'), bodySummary(), bodyCard))}
        ${safe(() => section('app', 'gear', t('set.sec.app'), appSum, () => appCard() + safe(timeCard), tzWarn))}
        ${safe(() => section('food', 'apple', t('set.fd.title'), foodSummary(), renderFood))}
        ${D.serverEnabled() ? safe(() => section('ai', 'sparkles', t('set.ai.title'), aiSummary(), aiBody, aiWarn())) : ''}
        ${safe(() => section('habits', 'checkSq', t('set.h.title'), esc(t('set.sum.habits', { n: hs.filter((h) => h.active).length })), renderHabits))}
        ${safe(() => section('cats', 'wallet', t('set.f.cats'), esc(t('set.sum.cats', { n: cats.length })), renderFinance))}
        ${safe(() => section('data', 'save', t('set.sec.data'), dataSum, renderData, errs > 0))}
      </div>
      ${D.profile && D.profile.accountHtml ? safe(() => D.profile.accountHtml()) : ''}
    </div>`;
  }

  D.view({ id: 'settings', icon: 'gear', order: 90, nav: true, primary: false, render });
})();
