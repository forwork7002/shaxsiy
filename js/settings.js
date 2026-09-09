/* =====================================================================
   Dash — Созлаш (settings): general · habits · prayer · finance · data
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* strings                                                             */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'set.tab.general': 'Umumiy', 'set.tab.habits': 'Odatlar', 'set.tab.prayer': 'Ibodat', 'set.tab.finance': 'Moliya', 'set.tab.data': "Ma'lumot",
      'set.lang': 'Til', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Mavzu',
      'set.profile': 'Profil', 'set.name': 'Ism', 'set.namePh': 'Ismingiz', 'set.height': "Bo'y", 'set.weight': 'Vazn', 'set.age': 'Yosh',
      'set.sex': 'Jins', 'set.sex.m': 'Erkak', 'set.sex.f': 'Ayol', 'set.activity': 'Faollik',
      'set.act.0': 'Harakatsiz', 'set.act.1': 'Kam harakat', 'set.act.2': 'Yengil', 'set.act.3': "O'rtacha", 'set.act.4': 'Faol', 'set.act.5': 'Juda faol',
      'set.bmi': 'BMI', 'set.bmiHint': "bo'y va vazndan",
      'set.day': 'Kun sozlamalari', 'set.tz': 'Vaqt mintaqasi', 'set.tz.browser': 'brauzer', 'set.dayStart': 'Kun boshlanishi',
      'set.dayStartHint': 'Shu soatgacha qilingan yozuvlar kechagi kunga tegishli', 'set.midnight': 'Yarim tun (00:00)', 'set.wake': "Uyg'onish soati", 'set.sleep': 'Uyqu soati',
      'set.units': 'Birliklar', 'set.weightUnit': 'Vazn birligi', 'set.waterMl': 'Stakan hajmi', 'set.waterTarget': 'Kunlik suv maqsadi',
      'set.waterAuto': "avto (vazn bo'yicha)", 'set.caffeine': 'Kofein limiti', 'set.currency': 'Valyuta',
      'set.shortcuts': 'Tezkor tugmalar', 'set.sc.search': 'Qidiruv / buyruqlar', 'set.sc.undo': 'Bekor qilish', 'set.sc.esc': 'Yopish',
      'set.about': 'Dastur haqida', 'set.version': 'Versiya', 'set.device': 'Qurilma ID', 'set.storage': "Ma'lumot hajmi",
      'set.h.title': 'Odatlar', 'set.h.count': '{n} faol / {total}',
      'set.h.help': "Belgini bosib faol/nofaol qiling. Nofaol odat Bugunda ko'rinmaydi, lekin tarixi saqlanadi.",
      'set.h.add': 'Yangi odat', 'set.h.namePh': 'Odat nomi…', 'set.h.sphere': 'Soha', 'set.h.schedule': 'Jadval',
      'set.sch.daily': 'Har kuni', 'set.sch.days': 'Kunlar', 'set.sch.week': 'Haftasiga', 'set.sch.weekN': 'haftasiga {n} marta', 'set.h.perWeek': 'marta haftasiga',
      'set.h.target': 'Maqsad', 'set.h.targetN': 'Miqdor', 'set.h.unit': 'Birlik', 'set.h.unitPh': 'sahifa, daq…', 'set.h.remind': 'Eslatma',
      'set.h.needName': 'Odat nomini kiriting', 'set.h.needDays': 'Kamida bitta kun tanlang', 'set.h.added': "Odat qo'shildi", 'set.h.saved': 'Saqlandi',
      'set.h.edit': 'Odatni tahrirlash', 'set.h.deleteTitle': "Odatni o'chirish",
      'set.h.deleteText': "«{name}» odati va uning BARCHA tarixi ({n} kun) o'chirilsinmi? Nofaol qilish tarixni saqlab qoladi.",
      'set.h.deleted': "O'chirildi: {name}", 'set.h.days': '{n} kun', 'set.h.up': 'Yuqoriga', 'set.h.down': 'Pastga',
      'set.h.empty': "Hali odat yo'q — birinchisini qo'shing", 'set.h.inactive': 'nofaol',
      'set.pr.location': 'Joylashuv', 'set.pr.lat': 'Kenglik', 'set.pr.lng': 'Uzunlik', 'set.pr.useGeo': 'Joylashuvimni aniqlash',
      'set.pr.noGeo': 'Geolokatsiya mavjud emas', 'set.pr.geoFail': "Joylashuvni aniqlab bo'lmadi", 'set.pr.geoOk': 'Joylashuv yangilandi', 'set.pr.qibla': 'Qibla',
      'set.pr.method': 'Hisoblash usuli', 'set.pr.fajr': 'Bomdod burchagi', 'set.pr.isha': 'Xufton burchagi', 'set.pr.asr': 'Asr', 'set.pr.hanafi': 'Hanafiy', 'set.pr.shafi': "Shofe'iy",
      'set.pr.offsets': 'Tuzatishlar (daqiqa)', 'set.pr.offsetsHint': 'Mahalliy taqvimga moslash uchun ± daqiqa',
      'set.pr.hijri': 'Hijriy tuzatish', 'set.pr.hijriHint': "Hilol ko'rinishiga qarab ±2 kun", 'set.pr.today': 'Bugungi vaqtlar', 'set.pr.next': 'keyingi',
      'set.pr.notify': 'Eslatmalar', 'set.pr.notifyHint': "Har namozdan 10 daqiqa oldin (faqat dastur ochiq bo'lganda)",
      'set.pr.notifyDenied': 'Bildirishnomalarga ruxsat berilmagan', 'set.pr.notifyNo': "Brauzer bildirishnomalarni qo'llamaydi",
      'set.pr.notifyOn': 'Eslatmalar yoqildi', 'set.pr.notifyOff': "Eslatmalar o'chirildi", 'set.pr.notifBody': '{name} — 10 daqiqadan keyin ({time})',
      'set.f.cats': 'Kategoriyalar', 'set.f.namePh': 'Kategoriya nomi…', 'set.f.catDeleted': "Kategoriya o'chirildi: {name}", 'set.f.txCount': '{n} ta yozuv',
      'set.f.cantDelete': "Bu kategoriyani o'chirib bo'lmaydi", 'set.f.needName': 'Nom kiriting', 'set.f.added': "Kategoriya qo'shildi",
      'set.f.reassign': 'Yozuvlar «Boshqa»ga o\'tkaziladi', 'set.f.accounts': 'Hisoblar',
      'set.f.accountsHint': "Hisoblar, qoldiqlar va obunalar Moliya bo'limida boshqariladi.", 'set.f.goAccounts': "Hisoblarga o'tish",
      'set.d.sync': 'Sinxronizatsiya', 'set.d.server': 'Server', 'set.d.serverOn': 'ulangan', 'set.d.serverOff': 'faqat lokal', 'set.d.state': 'Holat',
      'set.d.updated': "So'nggi o'zgarish", 'set.d.tgUser': 'Telegram', 'set.d.syncNow': 'Hozir sinxronlash',
      'set.d.backup': 'Zaxira nusxa', 'set.d.export': 'JSON eksport', 'set.d.import': 'JSON import',
      'set.d.importHint': 'Eski «Shaxsiy» mini-ilova eksporti (shaxsiy_*.json) ham qabul qilinadi — format avtomatik aniqlanadi.',
      'set.d.importFail': 'Import xatosi: {msg}', 'set.d.danger': 'Xavfli zona', 'set.d.reset': "Hammasini o'chirish",
      'set.d.resetTitle': "Hamma ma'lumotni o'chirish", 'set.d.resetText': "Barcha odatlar, tarix, vazifalar, moliya va sozlamalar o'chiriladi. Avval eksport qiling!",
      'set.d.resetOk': "Ha, o'chirish", 'set.d.resetDone': "Hamma ma'lumot o'chirildi",
      'set.d.diag': 'Diagnostika', 'set.d.noErrors': "Xatolar yo'q", 'set.d.copy': 'Nusxalash', 'set.d.copied': 'Nusxalandi', 'set.d.copyFail': "Nusxalab bo'lmadi",
      'set.d.errors': '{n} ta xato', 'set.d.tgClose': 'Telegram ilovani yopish', 'set.search.sub': 'Sozlamalar',
      'set.auto': 'avto', 'set.f.icon': 'Belgi',
    },
    uzk: {
      'set.tab.general': 'Умумий', 'set.tab.habits': 'Одатлар', 'set.tab.prayer': 'Ибодат', 'set.tab.finance': 'Молия', 'set.tab.data': 'Маълумот',
      'set.lang': 'Тил', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Мавзу',
      'set.profile': 'Профил', 'set.name': 'Исм', 'set.namePh': 'Исмингиз', 'set.height': 'Бўй', 'set.weight': 'Вазн', 'set.age': 'Ёш',
      'set.sex': 'Жинс', 'set.sex.m': 'Эркак', 'set.sex.f': 'Аёл', 'set.activity': 'Фаоллик',
      'set.act.0': 'Ҳаракатсиз', 'set.act.1': 'Кам ҳаракат', 'set.act.2': 'Енгил', 'set.act.3': 'Ўртача', 'set.act.4': 'Фаол', 'set.act.5': 'Жуда фаол',
      'set.bmi': 'BMI', 'set.bmiHint': 'бўй ва вазндан',
      'set.day': 'Кун созламалари', 'set.tz': 'Вақт минтақаси', 'set.tz.browser': 'браузер', 'set.dayStart': 'Кун бошланиши',
      'set.dayStartHint': 'Шу соатгача қилинган ёзувлар кечаги кунга тегишли', 'set.midnight': 'Ярим тун (00:00)', 'set.wake': 'Уйғониш соати', 'set.sleep': 'Уйқу соати',
      'set.units': 'Бирликлар', 'set.weightUnit': 'Вазн бирлиги', 'set.waterMl': 'Стакан ҳажми', 'set.waterTarget': 'Кунлик сув мақсади',
      'set.waterAuto': 'авто (вазн бўйича)', 'set.caffeine': 'Кофеин лимити', 'set.currency': 'Валюта',
      'set.shortcuts': 'Тезкор тугмалар', 'set.sc.search': 'Қидирув / буйруқлар', 'set.sc.undo': 'Бекор қилиш', 'set.sc.esc': 'Ёпиш',
      'set.about': 'Дастур ҳақида', 'set.version': 'Версия', 'set.device': 'Қурилма ID', 'set.storage': 'Маълумот ҳажми',
      'set.h.title': 'Одатлар', 'set.h.count': '{n} фаол / {total}',
      'set.h.help': 'Белгини босиб фаол/нофаол қилинг. Нофаол одат «Бугун»да кўринмайди, лекин тарихи сақланади.',
      'set.h.add': 'Янги одат', 'set.h.namePh': 'Одат номи…', 'set.h.sphere': 'Соҳа', 'set.h.schedule': 'Жадвал',
      'set.sch.daily': 'Ҳар куни', 'set.sch.days': 'Кунлар', 'set.sch.week': 'Ҳафтасига', 'set.sch.weekN': 'ҳафтасига {n} марта', 'set.h.perWeek': 'марта ҳафтасига',
      'set.h.target': 'Мақсад', 'set.h.targetN': 'Миқдор', 'set.h.unit': 'Бирлик', 'set.h.unitPh': 'саҳифа, дақ…', 'set.h.remind': 'Эслатма',
      'set.h.needName': 'Одат номини киритинг', 'set.h.needDays': 'Камида битта кун танланг', 'set.h.added': 'Одат қўшилди', 'set.h.saved': 'Сақланди',
      'set.h.edit': 'Одатни таҳрирлаш', 'set.h.deleteTitle': 'Одатни ўчириш',
      'set.h.deleteText': '«{name}» одати ва унинг БАРЧА тарихи ({n} кун) ўчирилсинми? Нофаол қилиш тарихни сақлаб қолади.',
      'set.h.deleted': 'Ўчирилди: {name}', 'set.h.days': '{n} кун', 'set.h.up': 'Юқорига', 'set.h.down': 'Пастга',
      'set.h.empty': 'Ҳали одат йўқ — биринчисини қўшинг', 'set.h.inactive': 'нофаол',
      'set.pr.location': 'Жойлашув', 'set.pr.lat': 'Кенглик', 'set.pr.lng': 'Узунлик', 'set.pr.useGeo': 'Жойлашувимни аниқлаш',
      'set.pr.noGeo': 'Геолокация мавжуд эмас', 'set.pr.geoFail': 'Жойлашувни аниқлаб бўлмади', 'set.pr.geoOk': 'Жойлашув янгиланди', 'set.pr.qibla': 'Қибла',
      'set.pr.method': 'Ҳисоблаш усули', 'set.pr.fajr': 'Бомдод бурчаги', 'set.pr.isha': 'Хуфтон бурчаги', 'set.pr.asr': 'Аср', 'set.pr.hanafi': 'Ҳанафий', 'set.pr.shafi': 'Шофеъий',
      'set.pr.offsets': 'Тузатишлар (дақиқа)', 'set.pr.offsetsHint': 'Маҳаллий тақвимга мослаш учун ± дақиқа',
      'set.pr.hijri': 'Ҳижрий тузатиш', 'set.pr.hijriHint': 'Ҳилол кўринишига қараб ±2 кун', 'set.pr.today': 'Бугунги вақтлар', 'set.pr.next': 'кейинги',
      'set.pr.notify': 'Эслатмалар', 'set.pr.notifyHint': 'Ҳар намоздан 10 дақиқа олдин (фақат дастур очиқ бўлганда)',
      'set.pr.notifyDenied': 'Билдиришномаларга рухсат берилмаган', 'set.pr.notifyNo': 'Браузер билдиришномаларни қўлламайди',
      'set.pr.notifyOn': 'Эслатмалар ёқилди', 'set.pr.notifyOff': 'Эслатмалар ўчирилди', 'set.pr.notifBody': '{name} — 10 дақиқадан кейин ({time})',
      'set.f.cats': 'Категориялар', 'set.f.namePh': 'Категория номи…', 'set.f.catDeleted': 'Категория ўчирилди: {name}', 'set.f.txCount': '{n} та ёзув',
      'set.f.cantDelete': 'Бу категорияни ўчириб бўлмайди', 'set.f.needName': 'Ном киритинг', 'set.f.added': 'Категория қўшилди',
      'set.f.reassign': 'Ёзувлар «Бошқа»га ўтказилади', 'set.f.accounts': 'Ҳисоблар',
      'set.f.accountsHint': 'Ҳисоблар, қолдиқлар ва обуналар Молия бўлимида бошқарилади.', 'set.f.goAccounts': 'Ҳисобларга ўтиш',
      'set.d.sync': 'Синхронизация', 'set.d.server': 'Сервер', 'set.d.serverOn': 'уланган', 'set.d.serverOff': 'фақат маҳаллий', 'set.d.state': 'Ҳолат',
      'set.d.updated': 'Сўнгги ўзгариш', 'set.d.tgUser': 'Telegram', 'set.d.syncNow': 'Ҳозир синхронлаш',
      'set.d.backup': 'Захира нусха', 'set.d.export': 'JSON экспорт', 'set.d.import': 'JSON импорт',
      'set.d.importHint': 'Эски «Шахсий» мини-илова экспорти (shaxsiy_*.json) ҳам қабул қилинади — формат автоматик аниқланади.',
      'set.d.importFail': 'Импорт хатоси: {msg}', 'set.d.danger': 'Хавфли зона', 'set.d.reset': 'Ҳаммасини ўчириш',
      'set.d.resetTitle': 'Ҳамма маълумотни ўчириш', 'set.d.resetText': 'Барча одатлар, тарих, вазифалар, молия ва созламалар ўчирилади. Аввал экспорт қилинг!',
      'set.d.resetOk': 'Ҳа, ўчириш', 'set.d.resetDone': 'Ҳамма маълумот ўчирилди',
      'set.d.diag': 'Диагностика', 'set.d.noErrors': 'Хатолар йўқ', 'set.d.copy': 'Нусхалаш', 'set.d.copied': 'Нусхаланди', 'set.d.copyFail': 'Нусхалаб бўлмади',
      'set.d.errors': '{n} та хато', 'set.d.tgClose': 'Telegram иловани ёпиш', 'set.search.sub': 'Созламалар',
      'set.auto': 'авто', 'set.f.icon': 'Белги',
    },
    ru: {
      'set.tab.general': 'Общие', 'set.tab.habits': 'Привычки', 'set.tab.prayer': 'Намаз', 'set.tab.finance': 'Финансы', 'set.tab.data': 'Данные',
      'set.lang': 'Язык', 'set.lang.uz': "O'zbek lotin", 'set.lang.uzk': 'Ўзбек кирилл', 'set.lang.ru': 'Русский', 'set.theme': 'Тема',
      'set.profile': 'Профиль', 'set.name': 'Имя', 'set.namePh': 'Ваше имя', 'set.height': 'Рост', 'set.weight': 'Вес', 'set.age': 'Возраст',
      'set.sex': 'Пол', 'set.sex.m': 'Муж.', 'set.sex.f': 'Жен.', 'set.activity': 'Активность',
      'set.act.0': 'Минимальная', 'set.act.1': 'Низкая', 'set.act.2': 'Лёгкая', 'set.act.3': 'Средняя', 'set.act.4': 'Высокая', 'set.act.5': 'Очень высокая',
      'set.bmi': 'ИМТ', 'set.bmiHint': 'по росту и весу',
      'set.day': 'Настройки дня', 'set.tz': 'Часовой пояс', 'set.tz.browser': 'браузер', 'set.dayStart': 'Начало дня',
      'set.dayStartHint': 'Записи до этого часа относятся к предыдущему дню', 'set.midnight': 'Полночь (00:00)', 'set.wake': 'Время подъёма', 'set.sleep': 'Время отхода ко сну',
      'set.units': 'Единицы', 'set.weightUnit': 'Единица веса', 'set.waterMl': 'Объём стакана', 'set.waterTarget': 'Дневная норма воды',
      'set.waterAuto': 'авто (по весу)', 'set.caffeine': 'Лимит кофеина', 'set.currency': 'Валюта',
      'set.shortcuts': 'Горячие клавиши', 'set.sc.search': 'Поиск / команды', 'set.sc.undo': 'Отменить', 'set.sc.esc': 'Закрыть',
      'set.about': 'О приложении', 'set.version': 'Версия', 'set.device': 'ID устройства', 'set.storage': 'Объём данных',
      'set.h.title': 'Привычки', 'set.h.count': '{n} активных / {total}',
      'set.h.help': 'Нажмите на галочку, чтобы включить/выключить. Неактивная привычка не показывается в «Сегодня», но её история сохраняется.',
      'set.h.add': 'Новая привычка', 'set.h.namePh': 'Название привычки…', 'set.h.sphere': 'Сфера', 'set.h.schedule': 'Расписание',
      'set.sch.daily': 'Ежедневно', 'set.sch.days': 'Дни', 'set.sch.week': 'В неделю', 'set.sch.weekN': '{n} раз в неделю', 'set.h.perWeek': 'раз в неделю',
      'set.h.target': 'Цель', 'set.h.targetN': 'Количество', 'set.h.unit': 'Единица', 'set.h.unitPh': 'стр., мин…', 'set.h.remind': 'Напоминание',
      'set.h.needName': 'Введите название привычки', 'set.h.needDays': 'Выберите хотя бы один день', 'set.h.added': 'Привычка добавлена', 'set.h.saved': 'Сохранено',
      'set.h.edit': 'Изменить привычку', 'set.h.deleteTitle': 'Удалить привычку',
      'set.h.deleteText': 'Удалить привычку «{name}» и ВСЮ её историю ({n} дн.)? Деактивация сохранит историю.',
      'set.h.deleted': 'Удалено: {name}', 'set.h.days': '{n} дн.', 'set.h.up': 'Выше', 'set.h.down': 'Ниже',
      'set.h.empty': 'Привычек пока нет — добавьте первую', 'set.h.inactive': 'неактивна',
      'set.pr.location': 'Местоположение', 'set.pr.lat': 'Широта', 'set.pr.lng': 'Долгота', 'set.pr.useGeo': 'Определить моё местоположение',
      'set.pr.noGeo': 'Геолокация недоступна', 'set.pr.geoFail': 'Не удалось определить местоположение', 'set.pr.geoOk': 'Местоположение обновлено', 'set.pr.qibla': 'Кибла',
      'set.pr.method': 'Метод расчёта', 'set.pr.fajr': 'Угол Фаджра', 'set.pr.isha': 'Угол Иша', 'set.pr.asr': 'Аср', 'set.pr.hanafi': 'Ханафитский', 'set.pr.shafi': 'Шафиитский',
      'set.pr.offsets': 'Поправки (минуты)', 'set.pr.offsetsHint': 'Поправка в минутах под местный календарь',
      'set.pr.hijri': 'Поправка хиджры', 'set.pr.hijriHint': 'Сдвиг на ±2 дня по видимости хиляля', 'set.pr.today': 'Время на сегодня', 'set.pr.next': 'следующий',
      'set.pr.notify': 'Напоминания', 'set.pr.notifyHint': 'За 10 минут до каждого намаза (только пока приложение открыто)',
      'set.pr.notifyDenied': 'Уведомления не разрешены', 'set.pr.notifyNo': 'Браузер не поддерживает уведомления',
      'set.pr.notifyOn': 'Напоминания включены', 'set.pr.notifyOff': 'Напоминания выключены', 'set.pr.notifBody': '{name} — через 10 минут ({time})',
      'set.f.cats': 'Категории', 'set.f.namePh': 'Название категории…', 'set.f.catDeleted': 'Категория удалена: {name}', 'set.f.txCount': 'записей: {n}',
      'set.f.cantDelete': 'Эту категорию нельзя удалить', 'set.f.needName': 'Введите название', 'set.f.added': 'Категория добавлена',
      'set.f.reassign': 'Записи будут перенесены в «Другое»', 'set.f.accounts': 'Счета',
      'set.f.accountsHint': 'Счета, балансы и подписки управляются в разделе Финансы.', 'set.f.goAccounts': 'Перейти к счетам',
      'set.d.sync': 'Синхронизация', 'set.d.server': 'Сервер', 'set.d.serverOn': 'подключён', 'set.d.serverOff': 'только локально', 'set.d.state': 'Состояние',
      'set.d.updated': 'Последнее изменение', 'set.d.tgUser': 'Telegram', 'set.d.syncNow': 'Синхронизировать',
      'set.d.backup': 'Резервная копия', 'set.d.export': 'Экспорт JSON', 'set.d.import': 'Импорт JSON',
      'set.d.importHint': 'Экспорт старого мини-приложения «Шахсий» (shaxsiy_*.json) тоже принимается — формат определяется автоматически.',
      'set.d.importFail': 'Ошибка импорта: {msg}', 'set.d.danger': 'Опасная зона', 'set.d.reset': 'Удалить всё',
      'set.d.resetTitle': 'Удалить все данные', 'set.d.resetText': 'Все привычки, история, задачи, финансы и настройки будут удалены. Сначала сделайте экспорт!',
      'set.d.resetOk': 'Да, удалить', 'set.d.resetDone': 'Все данные удалены',
      'set.d.diag': 'Диагностика', 'set.d.noErrors': 'Ошибок нет', 'set.d.copy': 'Копировать', 'set.d.copied': 'Скопировано', 'set.d.copyFail': 'Не удалось скопировать',
      'set.d.errors': 'ошибок: {n}', 'set.d.tgClose': 'Закрыть мини-приложение Telegram', 'set.search.sub': 'Настройки',
      'set.auto': 'авто', 'set.f.icon': 'Значок',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const TABS = ['general', 'habits', 'prayer', 'finance', 'data'];
  const TZS = ['Asia/Tashkent', 'Asia/Almaty', 'Europe/Moscow', 'Asia/Dubai', 'Europe/Istanbul', 'UTC'];
  const CURS = ['UZS', 'USD', 'EUR', 'RUB', 'KZT'];
  const HABIT_SPHERES = ['ruh', 'aql', 'qalb', 'tana', 'boshqa'];
  const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
  const OFFSET_IDS = ['bomdod', 'quyosh', 'peshin', 'asr', 'shom', 'xufton'];
  const FALLBACK_CAT = 'boshqa';

  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const S = () => D.S.settings;
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  const attr = (v) => (v === null || v === undefined ? '' : esc(v));

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
    return t('set.sch.daily');
  }

  /* small UI builders */
  const row = (label, ctl, hint) => `<div class="set-row"><div class="set-row-body"><div class="set-lbl">${label}</div>${hint ? `<div class="set-hint">${hint}</div>` : ''}</div><div class="set-ctl">${ctl}</div></div>`;
  const seg = (opts, cur, act, cls = '') => `<div class="seg ${cls}">${opts.map((o) => `<button type="button" class="${o.v === cur ? 'on' : ''}" data-act="${act}" data-val="${esc(o.v)}">${esc(o.l)}</button>`).join('')}</div>`;
  const sel = (opts, cur, change, extra = '') => `<select class="sel sm" data-change="${change}" ${extra}>${opts.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(cur) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
  const numInp = (v, change, extra = '') => `<input class="inp sm num set-num" type="number" inputmode="decimal" value="${attr(v)}" data-change="${change}" ${extra}>`;
  const sphereOpts = (cur) => HABIT_SPHERES.concat(cur === 'aralash' ? ['aralash'] : []).map((id) => ({ v: id, l: D.sphere(id).name() }));
  function daysPicker(act, days) {
    const W = D.t('weekdaysShort');
    return `<div class="set-days">${DOW_ORDER.map((d) => `<button type="button" class="set-day ${days.includes(d) ? 'on' : ''}" data-act="${act}" data-d="${d}" aria-pressed="${days.includes(d)}">${esc(W[d])}</button>`).join('')}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* GENERAL                                                             */
  /* ------------------------------------------------------------------ */
  function renderGeneral() {
    const s = S(), p = D.S.profile;
    const lb = s.weightUnit === 'lb';
    const wShown = p.weightKg == null ? null : lb ? D.round(p.weightKg * 2.20462, 1) : p.weightKg;
    const bmi = p.heightCm && p.weightKg ? D.round(p.weightKg / Math.pow(p.heightCm / 100, 2), 1) : null;
    const bmiZone = bmi == null ? '' : bmi < 18.5 ? 'z-warn' : bmi < 25 ? 'z-good' : bmi < 30 ? 'z-warn' : 'z-bad';
    const act = D.clamp(+p.activity || 0, 0, 5);
    const hours = Array.from({ length: 24 }, (_, i) => ({ v: i, l: D.fmtTime(i, 0) }));
    return `
    <div class="card">
      <div class="eyebrow mb-s">${t('set.lang')}</div>
      ${seg([{ v: 'uz', l: t('set.lang.uz') }, { v: 'uzk', l: t('set.lang.uzk') }, { v: 'ru', l: t('set.lang.ru') }], D.lang(), 'setLang', 'set-seg-lang')}
      <div class="eyebrow mb-s">${t('set.theme')}</div>
      ${seg([{ v: 'dark', l: t('theme.dark') }, { v: 'light', l: t('theme.light') }, { v: 'auto', l: t('theme.auto') }], s.theme || 'dark', 'setTheme', 'set-seg-last')}
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('user')} ${t('set.profile')}</div>
        ${bmi != null ? `<div class="set-bmi"><span class="zone ${bmiZone}"></span><span class="num">${D.fmtNum(bmi, 1)}</span><span class="tiny muted">${t('set.bmi')}</span></div>` : ''}</div>
      <div class="field"><label class="field-label">${t('set.name')}</label>
        <input class="inp" maxlength="40" value="${esc(p.name || '')}" placeholder="${esc(t('set.namePh'))}" data-input="setProfileText" data-k="name" autocomplete="off"></div>
      <div class="set-grid3">
        <div class="field"><label class="field-label">${t('set.height')} <span class="set-unit">cm</span></label>${numInp(p.heightCm, 'setProfileNum', 'data-k="heightCm" min="100" max="250" step="1" placeholder="—"')}</div>
        <div class="field"><label class="field-label">${t('set.weight')} <span class="set-unit">${lb ? 'lb' : 'kg'}</span></label>${numInp(wShown, 'setProfileNum', 'data-k="weightKg" min="20" max="500" step="0.1" placeholder="—"')}</div>
        <div class="field"><label class="field-label">${t('set.age')}</label>${numInp(p.age, 'setProfileNum', 'data-k="age" min="5" max="120" step="1" placeholder="—"')}</div>
      </div>
      <div class="set-grid2">
        <div class="field"><label class="field-label">${t('set.sex')}</label>${seg([{ v: 'm', l: t('set.sex.m') }, { v: 'f', l: t('set.sex.f') }], p.sex === 'f' ? 'f' : 'm', 'setSex', 'set-seg-last')}</div>
        <div class="field"><label class="field-label">${t('set.activity')}</label>
          <div class="set-slider-lbl" id="setActLabel">${actLabel(act)}</div>
          <input class="slider" type="range" min="0" max="5" step="1" value="${act}" data-input="setActivity" aria-label="${esc(t('set.activity'))}"></div>
      </div>
    </div>

    ${D.serverEnabled() && (D.device.uid || D.device.name) ? `<div class="card flat set-account"><div class="row between wrap">
      <div class="grow"><div class="eyebrow">${t('set.account')}</div><div class="small"><b>${esc(D.device.name || D.device.uid)}</b></div>
        <div class="tiny muted num">${esc(D.device.uid)}${D.tg && D.tg.initDataUnsafe && D.tg.initDataUnsafe.user ? ` · Telegram ${esc(String(D.tg.initDataUnsafe.user.id))}` : ''}</div></div>
      <button class="btn ghost sm" data-act="setLogout">${D.ic('logout', 14)} ${t('set.logout')}</button>
    </div></div>` : ''}

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('clock')} ${t('set.day')}</div></div>
      ${row(t('set.tz'), sel(tzOptions(), s.tz, 'setTz'))}
      ${row(t('set.dayStart'), sel(Array.from({ length: 7 }, (_, i) => ({ v: i, l: i === 0 ? t('set.midnight') : D.fmtTime(i, 0) })), +s.dayStart || 0, 'setDayStart'), t('set.dayStartHint'))}
      ${row(t('set.wake'), sel(hours, +s.wakeHour || 0, 'setHour', 'data-k="wakeHour"'))}
      ${row(t('set.sleep'), sel(hours, +s.sleepHour || 0, 'setHour', 'data-k="sleepHour"'))}
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('scale')} ${t('set.units')}</div></div>
      ${row(t('set.weightUnit'), seg([{ v: 'kg', l: 'kg' }, { v: 'lb', l: 'lb' }], lb ? 'lb' : 'kg', 'setWeightUnit', 'compact'))}
      ${row(t('set.waterMl'), `<div class="set-inp-unit">${numInp(s.waterMl, 'setNum', 'data-k="waterMl" min="50" max="2000" step="10"')}<span>${t('unit.ml')}</span></div>`)}
      ${row(t('set.waterTarget'), `<div class="set-inp-unit">${numInp(s.waterTargetMl, 'setNum', `data-k="waterTargetMl" min="500" max="8000" step="50" placeholder="${esc(t('set.auto'))}"`)}<span>${t('unit.ml')}</span></div>`, t('set.waterAuto'))}
      ${row(t('set.caffeine'), `<div class="set-inp-unit">${numInp(s.caffeineLimit, 'setNum', 'data-k="caffeineLimit" min="0" max="2000" step="10"')}<span>mg</span></div>`)}
      ${row(t('set.currency'), sel(CURS.map((c) => ({ v: c, l: c })), s.currency || 'UZS', 'setCurrency'))}
    </div>

    <div class="set-grid2 set-grid2-cards">
      <div class="card">
        <div class="card-head"><div class="title">${D.ic('keyboard')} ${t('set.shortcuts')}</div></div>
        <div class="set-kv"><span>${t('set.sc.search')}</span><span><kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd></span></div>
        <div class="set-kv"><span>${t('set.sc.undo')}</span><span><kbd class="kbd">Ctrl</kbd> <kbd class="kbd">Z</kbd></span></div>
        <div class="set-kv"><span>${t('set.sc.esc')}</span><span><kbd class="kbd">Esc</kbd></span></div>
      </div>
      <div class="card">
        <div class="card-head"><div class="title">${D.ic('info')} ${t('set.about')}</div></div>
        <div class="set-kv"><span>${t('set.version')}</span><span class="num">v${esc(D.VERSION)}</span></div>
        <div class="set-kv"><span>${t('set.device')}</span><span class="num set-mono-sm">${esc(D.S.meta.deviceId || '—')}</span></div>
        <div class="set-kv"><span>${t('set.storage')}</span><span class="num">${D.fmtNum(storageKb(), 1)} KB</span></div>
      </div>
    </div>`;
  }
  const actLabel = (a) => `<span>${esc(t('set.act.' + a))}</span><span class="num muted">${a}/5</span>`;

  D.act.setLang = (el) => { if (el.dataset.val !== D.lang()) D.setLang(el.dataset.val); };
  D.act.setTheme = (el) => D.theme.set(el.dataset.val);
  D.act.setProfileText = (el) => { D.S.profile[el.dataset.k] = el.value.trim().slice(0, 40); D.save(); };
  D.act.setProfileNum = (el) => {
    const k = el.dataset.k;
    let v = num(el.value);
    if (k === 'weightKg' && v != null && S().weightUnit === 'lb') v = D.round(v / 2.20462, 1);
    const lim = { heightCm: [50, 250], weightKg: [20, 500], age: [1, 120] }[k];
    if (v != null && lim) v = D.clamp(v, lim[0], lim[1]);
    if (v != null && k !== 'weightKg') v = Math.round(v);
    if (!lim) return;
    D.S.profile[k] = v;
    D.save(); D.rerender();
  };
  D.act.setSex = (el) => { D.S.profile.sex = el.dataset.val === 'f' ? 'f' : 'm'; D.save(); D.rerender(); };
  D.act.setActivity = (el) => { const a = D.clamp(+el.value || 0, 0, 5); D.S.profile.activity = a; D.save(); D.patch('setActLabel', actLabel(a)); };
  D.act.setTz = (el) => { S().tz = el.value; D.save(); D.renderNav(); D.rerender(); D.emit('day:changed', D.today()); };
  D.act.setDayStart = (el) => { S().dayStart = D.clamp(+el.value || 0, 0, 6); D.save(); D.rerender(); D.emit('day:changed', D.today()); };
  D.act.setHour = (el) => { S()[el.dataset.k] = D.clamp(+el.value || 0, 0, 23); D.save(); D.rerender(); };
  D.act.setWeightUnit = (el) => { S().weightUnit = el.dataset.val === 'lb' ? 'lb' : 'kg'; D.save(); D.rerender(); };
  D.act.setNum = (el) => { const v = num(el.value); S()[el.dataset.k] = v == null ? (el.dataset.k === 'waterTargetMl' ? null : S()[el.dataset.k]) : Math.max(0, v); D.save(); D.rerender(); };
  D.act.setCurrency = (el) => { S().currency = CURS.includes(el.value) ? el.value : 'UZS'; D.save(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* HABITS                                                              */
  /* ------------------------------------------------------------------ */
  const draft = { name: '', sphere: 'ruh', type: 'daily', days: [1, 2, 3, 4, 5], n: 3, tn: '', unit: '', remind: '' };

  function renderHabits() {
    const list = sortedHabits(), cnt = doneCounts();
    const active = list.filter((h) => h.active).length;
    return `
    <div class="card set-hero">
      <div class="card-head"><div class="title">${D.ic('checkSq')} ${t('set.h.title')}</div><span class="pill on num">${esc(t('set.h.count', { n: active, total: list.length }))}</span></div>
      <p class="help">${esc(t('set.h.help'))}</p>
    </div>

    <div class="card">
      <div class="eyebrow mb-s">${t('set.h.add')}</div>
      <div class="input-row">
        <input class="inp" value="${esc(draft.name)}" placeholder="${esc(t('set.h.namePh'))}" maxlength="60" autocomplete="off" data-input="setDraft" data-k="name" data-enter="setHabitAdd">
        <select class="sel set-sph-sel" data-change="setDraft" data-k="sphere" aria-label="${esc(t('set.h.sphere'))}">${sphereOpts(draft.sphere).map((o) => `<option value="${o.v}" ${o.v === draft.sphere ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>
      </div>
      <div class="set-sched">
        ${seg([{ v: 'daily', l: t('set.sch.daily') }, { v: 'days', l: t('set.sch.days') }, { v: 'week', l: t('set.sch.week') }], draft.type, 'setDraftType', 'compact')}
        ${draft.type === 'days' ? daysPicker('setDraftDay', draft.days) : ''}
        ${draft.type === 'week' ? `<div class="set-inp-unit">${numInp(draft.n, 'setDraft', 'data-k="n" min="1" max="7" step="1"')}<span>${t('set.h.perWeek')}</span></div>` : ''}
      </div>
      <div class="set-grid3 set-opt">
        <div class="field"><label class="field-label">${t('set.h.targetN')}</label>${numInp(draft.tn, 'setDraft', 'data-k="tn" min="1" step="1" placeholder="—"')}</div>
        <div class="field"><label class="field-label">${t('set.h.unit')}</label><input class="inp sm" maxlength="12" value="${esc(draft.unit)}" placeholder="${esc(t('set.h.unitPh'))}" data-input="setDraft" data-k="unit"></div>
        <div class="field"><label class="field-label">${t('set.h.remind')}</label><input class="inp sm" type="time" value="${esc(draft.remind)}" data-change="setDraft" data-k="remind"></div>
      </div>
      <button class="btn block" data-act="setHabitAdd">${D.ic('plus', 16)} ${t('btn.add')}</button>
    </div>

    <div class="card">
      ${list.length ? `<div class="list">${list.map((h, i) => habitRow(h, i, list.length, cnt[h.id] || 0)).join('')}</div>` : `<div class="empty">${esc(t('set.h.empty'))}</div>`}
    </div>`;
  }

  function habitRow(h, i, n, days) {
    const sph = D.sphere(h.sphere);
    const id = esc(h.id);
    return `<div class="li set-hab ${h.active ? '' : 'off'}">
      <input type="checkbox" class="chk big" ${h.active ? 'checked' : ''} data-change="setHabitActive" data-id="${id}" aria-label="${esc(h.name)}">
      <div class="li-body">
        <div class="li-text set-edit" data-act="setHabitName" data-id="${id}" title="${esc(t('btn.edit'))}">${esc(h.name)}</div>
        <div class="li-meta">
          <span class="tag" style="--c:${sph.color}">${esc(sph.name())}</span>
          <span>${esc(schedSummary(h))}</span>
          ${h.target && h.target.n ? `<span class="num">${D.ic('target', 11)} ${esc(h.target.n)} ${esc(h.target.unit || '')}</span>` : ''}
          ${h.remind ? `<span class="num">${D.ic('clock', 11)} ${esc(h.remind)}</span>` : ''}
          <span class="num muted">${esc(t('set.h.days', { n: days }))}</span>
          ${h.active ? '' : `<span class="muted">· ${esc(t('set.h.inactive'))}</span>`}
        </div>
      </div>
      <div class="set-hab-acts">
        <button class="btn icon set-up" data-act="setHabitMove" data-id="${id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="${esc(t('set.h.up'))}">${D.ic('chevD', 16)}</button>
        <button class="btn icon set-down" data-act="setHabitMove" data-id="${id}" data-dir="1" ${i === n - 1 ? 'disabled' : ''} aria-label="${esc(t('set.h.down'))}">${D.ic('chevD', 16)}</button>
        <button class="btn icon set-ed" data-act="setHabitEdit" data-id="${id}" aria-label="${esc(t('btn.edit'))}">${D.ic('edit', 16)}</button>
        <button class="li-del" data-act="setHabitDel" data-id="${id}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button>
      </div>
    </div>`;
  }

  D.act.setDraft = (el) => { const k = el.dataset.k; draft[k] = k === 'n' ? D.clamp(+el.value || 1, 1, 7) : el.value; };
  D.act.setDraftType = (el) => { draft.type = el.dataset.val; D.rerender(); };
  D.act.setDraftDay = (el) => {
    const d = +el.dataset.d;
    draft.days = draft.days.includes(d) ? draft.days.filter((x) => x !== d) : draft.days.concat(d);
    el.classList.toggle('on', draft.days.includes(d)); el.setAttribute('aria-pressed', String(draft.days.includes(d)));
  };
  function buildSchedule(type, days, n) {
    if (type === 'days') return { type: 'days', days: DOW_ORDER.filter((d) => days.includes(d)) };
    if (type === 'week') return { type: 'week', n: D.clamp(+n || 1, 1, 7) };
    return { type: 'daily' };
  }
  D.act.setHabitAdd = () => {
    const name = (draft.name || '').trim();
    if (!name) { D.toast(t('set.h.needName')); return; }
    if (draft.type === 'days' && !draft.days.length) { D.toast(t('set.h.needDays')); return; }
    normalizeOrder();
    const tn = num(draft.tn);
    D.S.habits.push({
      id: D.uid('h'), name, sphere: HABIT_SPHERES.includes(draft.sphere) ? draft.sphere : 'boshqa', active: true,
      schedule: buildSchedule(draft.type, draft.days, draft.n),
      target: tn && tn > 0 ? { n: Math.round(tn), unit: (draft.unit || '').trim().slice(0, 12) } : null,
      remind: draft.remind || null, createdAt: Date.now(), order: D.S.habits.length,
    });
    Object.assign(draft, { name: '', tn: '', unit: '', remind: '' });
    D.save(); D.rerender(); D.toast(t('set.h.added'));
  };
  D.act.setHabitActive = (el) => { const h = findHabit(el.dataset.id); if (!h) return; h.active = !!el.checked; D.save(); D.rerender(); };
  D.act.setHabitMove = (el) => {
    const h = findHabit(el.dataset.id); if (!h) return;
    normalizeOrder();
    const list = sortedHabits(), i = list.indexOf(h), j = i + (+el.dataset.dir || 0);
    if (j < 0 || j >= list.length) return;
    const o = list[j].order; list[j].order = h.order; h.order = o;
    D.save(); D.rerender();
  };
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
  D.act.setHabitName = (el) => { const h = findHabit(el.dataset.id); if (!h) return; inlineEdit(el, () => h.name, (v) => { h.name = v; D.save(); D.rerender(); }); };

  function habitForm(h) {
    const sc = h.schedule || { type: 'daily' };
    const id = esc(h.id);
    return `
      <div class="field"><label class="field-label">${t('common.name')}</label><input class="inp" id="setEhName" value="${esc(h.name)}" maxlength="60" data-enter="setHabitSave" data-id="${id}"></div>
      <div class="grid2">
        <div class="field"><label class="field-label">${t('set.h.sphere')}</label><select class="sel" id="setEhSphere">${sphereOpts(h.sphere).map((o) => `<option value="${o.v}" ${o.v === h.sphere ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select></div>
        <div class="field"><label class="field-label">${t('set.h.schedule')}</label><select class="sel" id="setEhType" data-change="setEhType">
          ${['daily', 'days', 'week'].map((v) => `<option value="${v}" ${sc.type === v ? 'selected' : ''}>${esc(t('set.sch.' + v))}</option>`).join('')}</select></div>
      </div>
      <div class="field" id="setEhDays" ${sc.type === 'days' ? '' : 'hidden'}>${daysPicker('setEhDay', sc.days || [])}</div>
      <div class="field" id="setEhWeek" ${sc.type === 'week' ? '' : 'hidden'}><div class="set-inp-unit"><input class="inp sm num set-num" id="setEhN" type="number" min="1" max="7" value="${attr(D.clamp(+sc.n || 3, 1, 7))}"><span>${t('set.h.perWeek')}</span></div></div>
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
  D.act.setEhType = (el) => { const d = D.$('#setEhDays'), w = D.$('#setEhWeek'); if (d) d.hidden = el.value !== 'days'; if (w) w.hidden = el.value !== 'week'; };
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
    h.schedule = buildSchedule(type, days, (D.$('#setEhN') || {}).value);
    h.target = tn && tn > 0 ? { n: Math.round(tn), unit: ((D.$('#setEhUnit') || {}).value || '').trim().slice(0, 12) } : null;
    h.remind = (D.$('#setEhRemind') || {}).value || null;
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

  function renderPrayer() {
    const pr = S().prayer || {};
    const off = pr.offsets || {};
    let times = [], nextId = null, qibla = null, hijri = '';
    const np = D.nowTz(), calKey = D.keyOf(np.y, np.m, np.d);
    try { times = D.prayer.list(calKey); const nx = D.prayer.next(); nextId = nx && nx.key === calKey ? nx.id : null; qibla = Math.round(D.prayer.qibla()); hijri = D.hijri.fmt(calKey); } catch (e) { console.warn(e); }
    const perm = notifSupported() ? Notification.permission : 'unsupported';
    const notifyOn = !!pr.notify && perm === 'granted';
    return `
    <div class="card">
      <div class="card-head"><div class="title">${D.ic('mosque')} ${t('set.pr.today')}</div>${hijri ? `<span class="small muted">${esc(hijri)}</span>` : ''}</div>
      <div class="set-times">${times.map((x) => `<div class="set-time ${x.id === nextId ? 'next' : ''} ${x.id === 'quyosh' ? 'sun' : ''}"><div class="set-time-name">${esc(t('prayer.' + x.id))}</div><div class="set-time-val num">${esc(x.time)}</div>${x.id === nextId ? `<div class="set-time-next">${esc(t('set.pr.next'))}</div>` : ''}</div>`).join('')}</div>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('compass')} ${t('set.pr.location')}</div>${qibla != null ? `<span class="pill">${t('set.pr.qibla')} <b class="num">${qibla}°</b></span>` : ''}</div>
      <div class="set-grid2">
        <div class="field"><label class="field-label">${t('set.pr.lat')}</label>${numInp(pr.lat, 'setPrNum', 'data-k="lat" min="-90" max="90" step="0.0001"')}</div>
        <div class="field"><label class="field-label">${t('set.pr.lng')}</label>${numInp(pr.lng, 'setPrNum', 'data-k="lng" min="-180" max="180" step="0.0001"')}</div>
      </div>
      <button class="btn ghost block" data-act="setGeo">${D.ic('compass', 16)} ${t('set.pr.useGeo')}</button>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('sun')} ${t('set.pr.method')}</div></div>
      ${row(t('set.pr.fajr'), `<div class="set-inp-unit">${numInp(pr.fajr, 'setPrNum', 'data-k="fajr" min="10" max="20" step="0.5"')}<span>°</span></div>`)}
      ${row(t('set.pr.isha'), `<div class="set-inp-unit">${numInp(pr.isha, 'setPrNum', 'data-k="isha" min="10" max="20" step="0.5"')}<span>°</span></div>`)}
      ${row(t('set.pr.asr'), seg([{ v: 'hanafi', l: t('set.pr.hanafi') }, { v: 'shafi', l: t('set.pr.shafi') }], pr.asr === 'shafi' ? 'shafi' : 'hanafi', 'setAsr', 'compact'))}
      <div class="eyebrow set-sub-eyebrow">${t('set.pr.offsets')}</div>
      <div class="help mb-s">${esc(t('set.pr.offsetsHint'))}</div>
      <div class="set-off-grid">${OFFSET_IDS.map((id) => `<label class="set-off"><span class="tiny muted">${esc(t('prayer.' + id))}</span>${numInp(+off[id] || 0, 'setPrOffset', `data-id="${id}" min="-60" max="60" step="1"`)}</label>`).join('')}</div>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('moon')} ${t('set.pr.hijri')}</div></div>
      ${row(t('set.pr.hijri'), seg([-2, -1, 0, 1, 2].map((v) => ({ v: String(v), l: v > 0 ? '+' + v : String(v) })), String(+pr.hijriOffset || 0), 'setHijri', 'compact num'), t('set.pr.hijriHint'))}
    </div>

    <div class="card">
      ${row(`${D.ic('bolt', 14)} ${t('set.pr.notify')}`, `<button type="button" class="toggle ${notifyOn ? 'on' : ''}" data-act="setNotify" role="switch" aria-checked="${notifyOn}" aria-label="${esc(t('set.pr.notify'))}"></button>`,
        perm === 'denied' ? t('set.pr.notifyDenied') : perm === 'unsupported' ? t('set.pr.notifyNo') : t('set.pr.notifyHint'))}
    </div>`;
  }

  D.act.setPrNum = (el) => {
    const k = el.dataset.k, v = num(el.value);
    if (v == null) { D.rerender(); return; }
    const lim = { lat: [-90, 90], lng: [-180, 180], fajr: [10, 20], isha: [10, 20] }[k] || [-1e9, 1e9];
    S().prayer[k] = D.clamp(v, lim[0], lim[1]);
    D.save(); D.rerender(); scheduleReminders();
  };
  D.act.setPrOffset = (el) => { S().prayer.offsets = S().prayer.offsets || {}; S().prayer.offsets[el.dataset.id] = D.clamp(Math.round(num(el.value) || 0), -60, 60); D.save(); D.rerender(); scheduleReminders(); };
  D.act.setAsr = (el) => { S().prayer.asr = el.dataset.val === 'shafi' ? 'shafi' : 'hanafi'; D.save(); D.rerender(); scheduleReminders(); };
  D.act.setHijri = (el) => { S().prayer.hijriOffset = D.clamp(+el.dataset.val || 0, -2, 2); D.save(); D.rerender(); };
  D.act.setGeo = (el) => {
    if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') { D.toast(t('set.pr.noGeo')); return; }
    el.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => { S().prayer.lat = D.round(pos.coords.latitude, 4); S().prayer.lng = D.round(pos.coords.longitude, 4); D.save(); D.rerender(); scheduleReminders(); D.toast(t('set.pr.geoOk')); },
      () => { D.toast(t('set.pr.geoFail')); D.rerender(); },
      { timeout: 10000, maximumAge: 600000 });
  };
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
    <div class="card">
      <div class="card-head"><div class="title">${D.ic('wallet')} ${t('set.f.cats')}</div><span class="pill num">${cats.length}</span></div>
      <div class="input-row mb">
        <input class="inp set-icon-inp" id="setCatIcon" maxlength="3" placeholder="📦" autocomplete="off" aria-label="${esc(t('set.f.icon'))}">
        <input class="inp" id="setCatName" maxlength="30" placeholder="${esc(t('set.f.namePh'))}" autocomplete="off" data-enter="setCatAdd">
        <button class="btn sq" data-act="setCatAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 18)}</button>
      </div>
      <div class="list">${cats.map((c) => `<div class="li set-cat">
        <input class="inp set-icon-inp sm" value="${esc(c.icon || '')}" maxlength="3" data-change="setCatIcon" data-id="${esc(c.id)}" aria-label="${esc(t('set.f.icon'))}">
        <div class="li-body"><div class="li-text set-edit" data-act="setCatName" data-id="${esc(c.id)}">${esc(c.name)}</div>
          <div class="li-meta"><span class="num">${esc(t('set.f.txCount', { n: txCount[c.id] || 0 }))}</span></div></div>
        ${c.id === FALLBACK_CAT ? '' : `<button class="li-del" data-act="setCatDel" data-id="${esc(c.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('trash', 16)}</button>`}
      </div>`).join('')}</div>
      <div class="help mt-s">${esc(t('set.f.reassign'))}</div>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('layers')} ${t('set.f.accounts')}</div><span class="pill num">${(F.accounts || []).length}</span></div>
      <p class="help">${esc(t('set.f.accountsHint'))}</p>
      <button class="btn ghost sm" data-act="go" data-view="finance" data-sub="accounts">${D.ic('chevR', 14)} ${t('set.f.goAccounts')}</button>
    </div>`;
  }
  const findCat = (id) => (D.S.finance.cats || []).find((c) => c.id === id);
  D.act.setCatAdd = () => {
    const nameEl = D.$('#setCatName'), iconEl = D.$('#setCatIcon');
    const name = ((nameEl && nameEl.value) || '').trim().slice(0, 30);
    if (!name) { D.toast(t('set.f.needName')); return; }
    const icon = ((iconEl && iconEl.value) || '').trim().slice(0, 3) || '📦';
    D.S.finance.cats.push({ id: D.uid('c'), name, icon });
    D.save(); D.rerender(); D.toast(t('set.f.added'));
  };
  D.act.setCatIcon = (el) => { const c = findCat(el.dataset.id); if (!c) return; c.icon = el.value.trim().slice(0, 3) || '📦'; D.save(); D.rerender(); };
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
  // Arxiv qatori: /api/history/range shu tab ochilganda so'raladi; natija hisobga (uid) bog'liq va 2 daqiqadan
  // keyin qayta so'raladi (import, kunning ilk saqlashi, boshqa hisob bilan kirish — reloadsiz ko'rinsin).
  let arch = null;
  const ARCH_MS = 120000;
  function archiveLine() {
    if (!D.serverEnabled()) return `<span class="zone"></span>${esc(t('set.d.archive'))}: ${esc(t('set.d.archiveOff'))}`;
    const uid = (D.device && D.device.uid) || '';
    if (!arch || arch.uid !== uid || (arch.state !== 'loading' && Date.now() - arch.ts > ARCH_MS)) {
      const prev = arch && arch.uid === uid && arch.state === 'ok' ? arch.r : null;   // yangilanayotganda eski raqam turadi
      arch = { state: 'loading', uid, ts: Date.now(), r: prev };
      D.api('/api/history/range').then((r) => { arch = { state: 'ok', uid, ts: Date.now(), r: r || {} }; }).catch(() => { arch = { state: 'err', uid, ts: Date.now() }; }).then(() => D.patch('setArchive', archiveLine()));
    }
    if (arch.state === 'loading' && !arch.r) return `<span class="zone z-warn"></span>${esc(t('set.d.archive'))}: …`;
    if (arch.state === 'err') return `<span class="zone z-bad"></span>${esc(t('set.d.archive'))}: ${esc(t('set.d.archiveOff'))}`;
    const r = arch.r, line = t('set.d.archiveLine', { days: D.fmtNum(+r.days || 0), first: r.first ? D.fmtDate(String(r.first), 'short') + ' ' + String(r.first).slice(0, 4) : '—', threads: D.fmtNum(+r.threads || 0) });
    return `<span class="zone z-good"></span><span>${esc(t('set.d.archive'))}: ${esc(line)}</span><button class="btn ghost sm" data-act="go" data-view="history">${D.ic('clock', 14)} ${esc(t('nav.history'))}</button>`;
  }
  function renderData() {
    const server = D.serverEnabled(), st = D.syncState();
    const tgUser = D.tg && D.tg.initDataUnsafe && D.tg.initDataUnsafe.user;
    const tgName = tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') + (tgUser.username ? ' @' + tgUser.username : '') : '';
    const errs = (D.errors || []).slice().reverse();
    return `
    <div class="card">
      <div class="card-head"><div class="title">${D.ic('refresh')} ${t('set.d.sync')}</div>${server ? `<button class="btn ghost sm" data-act="setSyncNow">${D.ic('refresh', 14)} ${t('set.d.syncNow')}</button>` : ''}</div>
      <div class="stat-grid">
        <div class="stat"><span class="zone ${server ? 'z-good' : ''}"></span><div class="stat-num set-stat-text">${server ? t('set.d.serverOn') : t('set.d.serverOff')}</div><div class="stat-label">${t('set.d.server')}</div></div>
        <div class="stat"><span class="zone ${st === 'ok' ? 'z-good' : st === 'err' ? 'z-bad' : st === 'wait' ? 'z-warn' : ''}"></span><div class="stat-num set-stat-text">${esc(t('sync.' + st))}</div><div class="stat-label">${t('set.d.state')}</div></div>
        <div class="stat"><div class="stat-num set-stat-text num">${esc(D.fmtTs(D.S.meta.updatedAt))}</div><div class="stat-label">${t('set.d.updated')}</div></div>
        ${tgName ? `<div class="stat"><div class="stat-num set-stat-text">${esc(tgName)}</div><div class="stat-label">${t('set.d.tgUser')} · <span class="num">${esc(String(tgUser.id))}</span></div></div>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('save')} ${t('set.d.backup')}</div><span class="pill num">${D.fmtNum(storageKb(), 1)} KB</span></div>
      <div class="set-grid2">
        <button class="btn" data-act="setExport">${D.ic('download', 16)} ${t('set.d.export')}</button>
        <button class="btn ghost" data-act="setImportPick">${D.ic('upload', 16)} ${t('set.d.import')}</button>
      </div>
      <input type="file" class="set-vh" id="setImportInp" accept=".json,application/json" data-change="setImportFile" tabindex="-1" aria-hidden="true">
      <div class="help mt">${esc(t('set.d.importHint'))}</div>
      <div class="set-ok mt" id="setArchive">${archiveLine()}</div>
    </div>

    <div class="card">
      <div class="card-head"><div class="title">${D.ic('alert')} ${t('set.d.diag')}</div>${errs.length ? `<span class="pill bad num">${esc(t('set.d.errors', { n: errs.length }))}</span>` : ''}</div>
      ${errs.length ? `<div class="set-diag">${errs.slice(0, 10).map((e) => `<div class="set-err"><span class="num tiny muted">${esc(D.fmtTs(e.ts))}</span><span>${esc(e.msg)}</span></div>`).join('')}</div>
        <button class="btn ghost sm mt-s" data-act="setCopyErrors">${D.ic('list', 14)} ${t('set.d.copy')}</button>` : `<div class="set-ok"><span class="zone z-good"></span>${esc(t('set.d.noErrors'))}</div>`}
    </div>

    <div class="card set-danger">
      <div class="eyebrow mb-s">${t('set.d.danger')}</div>
      <div class="row wrap">
        <button class="btn danger" data-act="setReset">${D.ic('trash', 16)} ${t('set.d.reset')}</button>
        ${D.tg && D.tg.initData ? `<button class="btn ghost" data-act="setTgClose">${D.ic('logout', 16)} ${t('set.d.tgClose')}</button>` : ''}
      </div>
    </div>`;
  }
  D.act.setLogout = async () => {
    if (!(await D.confirm({ text: t('set.logoutQ'), ok: t('set.logout') }))) return;
    D.auth.logout();
  };
  D.i18n.add({ uz: { 'set.d.archive': 'Arxiv', 'set.d.archiveLine': '{days} kun · {first} dan · {threads} suhbat', 'set.d.archiveOff': 'mavjud emas' },
    uzk: { 'set.d.archive': 'Архив', 'set.d.archiveLine': '{days} кун · {first} дан · {threads} суҳбат', 'set.d.archiveOff': 'мавжуд эмас' },
    ru: { 'set.d.archive': 'Архив', 'set.d.archiveLine': '{days} дн. · с {first} · бесед: {threads}', 'set.d.archiveOff': 'недоступен' } });
  D.i18n.add({ uz: { 'set.account': 'Hisob', 'set.logout': 'Chiqish', 'set.logoutQ': 'Chiqilsinmi? Bu qurilmadagi nusxa o‘chiriladi, serverdagi ma’lumot saqlanadi.' },
    uzk: { 'set.account': 'Ҳисоб', 'set.logout': 'Чиқиш', 'set.logoutQ': 'Чиқилсинми? Бу қурилмадаги нусха ўчирилади, сервердаги маълумот сақланади.' },
    ru: { 'set.account': 'Аккаунт', 'set.logout': 'Выйти', 'set.logoutQ': 'Выйти? Копия на этом устройстве будет удалена, данные на сервере сохранятся.' } });
  D.act.setSyncNow = async () => { await D.pull(); D.rerender(); };
  D.act.setExport = () => D.exportJson();
  D.act.setImportPick = () => { const i = D.$('#setImportInp'); if (i) i.click(); };
  D.act.setImportFile = async (el) => {
    const f = el.files && el.files[0];
    el.value = '';
    if (!f) return;
    try {
      const text = typeof f.text === 'function' ? await f.text()
        : await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => rej(r.error || new Error('read')); r.readAsText(f); });
      D.importJson(text);
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
    D.save(); D.theme.apply(); D.renderNav(); D.rerender();
    D.toast(t('set.d.resetDone'), { undo: () => D.undo.pop() });
  };
  D.act.setCopyErrors = async () => {
    const text = (D.errors || []).map((e) => `${D.fmtTs(e.ts)} ${e.msg}\n${e.stack || ''}`).join('\n\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      D.toast(t('set.d.copied'));
    } catch (e) { D.toast(t('set.d.copyFail')); }
  };
  D.act.setTgClose = () => { if (D.tg && D.tg.close) D.tg.close(); };

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  function render() {
    const sub = TABS.includes(D.sub('settings', 'general')) ? D.sub('settings', 'general') : 'general';
    const body = { general: renderGeneral, habits: renderHabits, prayer: renderPrayer, finance: renderFinance, data: renderData }[sub];
    return `<div class="set-page">
      <div class="seg set-tabs">${TABS.map((x) => `<button type="button" class="${x === sub ? 'on' : ''}" data-act="sub" data-view="settings" data-sub="${x}">${esc(t('set.tab.' + x))}</button>`).join('')}</div>
      ${body()}
    </div>`;
  }

  D.search.register((q) => {
    if (!q || q.length < 2) return [];
    const items = TABS.map((x) => ({ label: `${t('nav.settings')} › ${t('set.tab.' + x)}`, sub: t('search.view'), icon: 'gear', go: () => D.go('settings', x) }));
    const deep = [['set.lang', 'general'], ['set.theme', 'general'], ['set.tz', 'general'], ['set.currency', 'general'], ['set.h.add', 'habits'], ['set.pr.location', 'prayer'], ['set.pr.notify', 'prayer'], ['set.f.cats', 'finance'], ['set.d.export', 'data'], ['set.d.import', 'data']];
    for (const [k, tab] of deep) items.push({ label: `${t('nav.settings')} › ${t(k)}`, sub: t('set.search.sub'), icon: 'gear', go: () => D.go('settings', tab) });
    return items;
  });

  D.view({ id: 'settings', icon: 'gear', order: 90, nav: true, primary: false, render });
})();
