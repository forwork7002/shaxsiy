/* =====================================================================
   food.js — Ovqat: kunlik ovqat jurnali (Tana bo'limining birinchi sahifasi).
   «Yorug' qog'oz», 2026-10-09 — egasi tasdiqlagan dizayn hujjati, 6.1-band.
   matn (asosiy yo'l) yoki rasm → /api/food/analyze → odamning O'Z AI'si
   (Sozlamalar › AI; ulamagan bo'lsa serverdagi umumiy kalit) →
   kkal · oqsil · uglevod · yog' + tola · shakar · to'yingan yog' · tuz · xolesterin
   + kaliy · kalsiy · temir · magniy · rux · A · C · D · B12 · folat — har bir qism uchun alohida.
   Ko'rinish: Kaloriya (bosh karta: qoldiq + makro chizig'i) → Oqsil, uglevod, yog' (uch chiziq +
   maslahat: AI kun xulosasi bo'lsa o'sha, bo'lmasa oddiy qoida) → Suv (stakanlar) → «Nima yedingiz?» →
   tahlil (tuzatish bilan) → kunning ovqatlari → kunlik hisobot (moddalar me'yorga nisbatan) →
   so'nggi 7 kun (ustun bosilsa o'sha kun).
   Me'yorlar profildan (Mifflin-St Jeor × faollik ± maqsad) yoki qo'lda: kkal · oqsil · uglevod · yog' alohida kataklarda.
   Me'yordan oshgan kun qizil: kartalarda «oshdi» so'zi, 7 kunlik grafikda qizil ustun (D.food.overBy).
   Rasm baytlari holatda saqlanmaydi — server /api/food/photo/<id> orqali beradi.
   D.food.page(k) · dayTotals(k) · targets() · recalcTargets() · parseTargets(matn) · fillTargets(o) · NUTR · dailyRef(k)
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;
  /* Rasm id si holatdan keladi va URL ga qo'shiladi: faqat server bergan
     shakl (api.py › FOOD_ID_RE) o'tadi, aks holda «../» bilan boshqa yo'lga
     so'rov yuborib bo'lardi. */
  const photoOk = (id) => typeof id === 'string' && /^fp_[0-9a-f]{12,32}$/.test(id);
  // MAX_BYTES serverdagi FOOD_MAX_BYTES (1 500 000) dan kichik — base64 so'rov chegaraga tegmasin
  const MAX_SIDE = 1024, JPEG_Q = 0.82, MAX_BYTES = 1400000;

  D.i18n.add({
    uz: {
      'nav.food': 'Ovqat',
      'food.eaten': 'yeyildi', 'food.kcal': 'kkal',
      'food.protein': 'Oqsil', 'food.carbs': 'Uglevod', 'food.fat': "Yog'",
      'food.pS': 'O', 'food.cS': 'U', 'food.fS': 'Y',
      'food.burned': 'WHOOP {n} kkal sarfladi',
      'food.meals': 'Taomlar', 'food.empty': "Bu kunda hali taom yozilmagan — yuqorida nima yeganingizni yozing",
      'food.ask': 'Nima yedingiz?',
      'food.ph': "Masalan: tushlikka 1 kosa osh, 2 bo'lak non, shakarsiz choy",
      'food.askHint': "Qancha aniq yozsangiz, shuncha aniq: miqdor (kosa, dona, gramm), qanday pishirilgan, nima qo'shilgan.",
      'food.camera': 'Rasm', 'food.gallery': 'Galereya', 'food.send': 'Tahlil',
      'food.busy': 'Tahlil qilinmoqda…', 'food.result': 'Tahlil natijasi', 'food.rough': 'taxminiy',
      'food.save': 'Saqlash', 'food.edit': 'Tahrirlash', 'food.dismiss': 'Bekor',
      'food.notConfigured': "AI ulanmagan. Sozlamalar › AI bo'limida o'z AI'ingizni ulang yoki taomni qo'lda kiriting.",
      'food.badKey': "AI kalitingiz qabul qilinmadi — Sozlamalar › AI bo'limida tekshiring.",
      'food.rate': "Juda ko'p so'rov — birozdan keyin qayta urinib ko'ring.",
      'food.toSettings': 'Sozlamalar', 'food.failed': 'AI tahlil qila olmadi — taomni qo\'lda kiriting yoki qayta urinib ko\'ring.',
      'food.badImage': "Rasm o'qilmadi — boshqa rasm tanlang.", 'food.manual': "Qo'lda kiritish", 'food.retry': 'Qayta urinish',
      'food.offline': "Server yo'q — taomni qo'lda kiriting.",
      'food.name': 'Taom', 'food.grams': 'Gramm', 'food.note': 'Izoh', 'food.items': 'Tarkibi',
      'food.newMeal': "Taom qo'shish", 'food.editMeal': 'Taomni tahrirlash', 'food.deleted': "Taom o'chirildi", 'food.saved': 'Taom saqlandi',
      'food.targets': "Me'yorlar",
      'food.setTarget': "Me'yoringizni yozing", 'food.tgTitle': "Kunlik me'yoringiz",
      'food.tgHint': "Har birini alohida kiriting. Bo'sh qoldirilgan makro kaloriyadan hisoblanadi.",
      'food.tgAutoNow': "Hozir profil bo'yicha hisoblanmoqda",
      'food.tgReset': "Profil bo'yicha hisoblansin", 'food.tgNoNum': "Hech bo'lmasa bitta raqam kiriting",
      'food.tgSaved': "Me'yor saqlandi",
      'food.time': 'soat',
      'food.gramsHint': 'Gramm o\'zgarsa makrolar mutanosib qayta hisoblanadi',
      'food.tooBig': 'Rasm juda katta', 'food.notFood': "Ovqat topilmadi — taomni boshqacha yozib ko'ring yoki boshqa rasm oling.",
      'food.week': "So'nggi 7 kun", 'food.avgDay': "kunlik o'rtacha", 'food.weekEmpty': "Bu haftada hali yozuv yo'q",
      'food.water': 'Suv', 'food.waterUnit': 'stakan',
      'food.overTitle': "Me'yordan oshdi",
      'food.kcalWord': 'Kaloriya', 'food.leftW': 'qoldi', 'food.overW': 'oshdi',
      'food.n.fib': 'Tola', 'food.n.sug': 'Shakar', 'food.n.satf': "To'yingan yog'", 'food.n.salt': 'Tuz', 'food.n.chol': 'Xolesterin',
      'food.n.k': 'Kaliy', 'food.n.ca': 'Kalsiy', 'food.n.fe': 'Temir', 'food.n.mg': 'Magniy', 'food.n.zn': 'Rux',
      'food.n.va': 'A vitamini', 'food.n.vc': 'C vitamini', 'food.n.vd': 'D vitamini', 'food.n.b12': 'B12 vitamini', 'food.n.fol': 'Folat (B9)',
      'food.g.lim': "Tola, shakar va yog'lar", 'food.g.micro': 'Vitamin va minerallar',
      'food.pctDay': "kunlik me'yorning {n}%", 'food.limit': 'chegara',
      'food.score': 'Baho {n}/10',
      'food.proc.whole': 'Tabiiy', 'food.proc.mixed': 'Aralash', 'food.proc.processed': 'Qayta ishlangan', 'food.proc.ultra': "Ko'p qayta ishlangan",
      'food.asm': 'AI shunday tushundi', 'food.tips': 'Tavsiyalar', 'food.details': 'Batafsil tarkib',
      'food.fixPh': "Noto'g'rimi? Yozing: «guruch emas, grechka», «2 emas, 1 kosa»", 'food.fix': 'Tuzatish', 'food.fixing': 'Tuzatilmoqda…',
      'food.youWrote': 'Siz yozgan',
      'food.addPart': "Qism qo'shish", 'food.addPartPh': "masalan: 1 dona non yoki 200 g qatiq", 'food.partBusy': 'AI hisoblamoqda…',
      'food.partDel': 'Olib tashlash', 'food.fromParts': 'Jami tarkibdagi qismlardan hisoblanadi', 'food.partFail': "Qism qo'shilmadi",
      'food.report': 'Kunlik hisobot', 'food.rep.low': 'Kam', 'food.rep.over': 'Ortiqcha', 'food.rep.ok': "Hammasi me'yorda",
      'food.rep.partial': "{n} ta taomda batafsil tarkib yo'q — ular faqat kkal va makrolarda hisobga olindi",
      'food.rep.none': "Batafsil tarkib (vitamin, mineral) AI tahlil qilgan taomlarda chiqadi",
      'food.rep.all': "Hamma moddalar", 'food.rep.ai': 'AI xulosasi', 'food.rep.aiBusy': "AI o'ylayapti…", 'food.rep.aiAgain': 'Yangilash',
      'food.rep.aiFail': 'AI javob bermadi: {m}',
    },
    uzk: {
      'nav.food': 'Овқат',
      'food.eaten': 'ейилди', 'food.kcal': 'ккал',
      'food.protein': 'Оқсил', 'food.carbs': 'Углевод', 'food.fat': 'Ёғ',
      'food.pS': 'О', 'food.cS': 'У', 'food.fS': 'Ё',
      'food.burned': 'WHOOP {n} ккал сарфлади',
      'food.meals': 'Таомлар', 'food.empty': 'Бу кунда ҳали таом ёзилмаган — юқорида нима еганингизни ёзинг',
      'food.ask': 'Нима едингиз?',
      'food.ph': 'Масалан: тушликка 1 коса ош, 2 бўлак нон, шакарсиз чой',
      'food.askHint': 'Қанча аниқ ёзсангиз, шунча аниқ: миқдор (коса, дона, грамм), қандай пиширилган, нима қўшилган.',
      'food.camera': 'Расм', 'food.gallery': 'Галерея', 'food.send': 'Таҳлил',
      'food.busy': 'Таҳлил қилинмоқда…', 'food.result': 'Таҳлил натижаси', 'food.rough': 'тахминий',
      'food.save': 'Сақлаш', 'food.edit': 'Таҳрирлаш', 'food.dismiss': 'Бекор',
      'food.notConfigured': 'AI уланмаган. Созламалар › AI бўлимида ўз AI’ингизни уланг ёки таомни қўлда киритинг.',
      'food.badKey': 'AI калитингиз қабул қилинмади — Созламалар › AI бўлимида текширинг.',
      'food.rate': 'Жуда кўп сўров — бироздан кейин қайта уриниб кўринг.',
      'food.toSettings': 'Созламалар', 'food.failed': 'AI таҳлил қила олмади — таомни қўлда киритинг ёки қайта уриниб кўринг.',
      'food.badImage': 'Расм ўқилмади — бошқа расм танланг.', 'food.manual': 'Қўлда киритиш', 'food.retry': 'Қайта уриниш',
      'food.offline': 'Сервер йўқ — таомни қўлда киритинг.',
      'food.name': 'Таом', 'food.grams': 'Грамм', 'food.note': 'Изоҳ', 'food.items': 'Таркиби',
      'food.newMeal': 'Таом қўшиш', 'food.editMeal': 'Таомни таҳрирлаш', 'food.deleted': 'Таом ўчирилди', 'food.saved': 'Таом сақланди',
      'food.targets': 'Меъёрлар',
      'food.setTarget': 'Меъёрингизни ёзинг', 'food.tgTitle': 'Кунлик меъёрингиз',
      'food.tgHint': 'Ҳар бирини алоҳида киритинг. Бўш қолдирилган макро калориядан ҳисобланади.',
      'food.tgAutoNow': 'Ҳозир профил бўйича ҳисобланмоқда',
      'food.tgReset': 'Профил бўйича ҳисоблансин', 'food.tgNoNum': 'Ҳеч бўлмаса битта рақам киритинг',
      'food.tgSaved': 'Меъёр сақланди',
      'food.time': 'соат',
      'food.gramsHint': 'Грамм ўзгарса макролар мутаносиб қайта ҳисобланади',
      'food.tooBig': 'Расм жуда катта', 'food.notFood': 'Овқат топилмади — таомни бошқача ёзиб кўринг ёки бошқа расм олинг.',
      'food.week': 'Сўнгги 7 кун', 'food.avgDay': 'кунлик ўртача', 'food.weekEmpty': 'Бу ҳафтада ҳали ёзув йўқ',
      'food.water': 'Сув', 'food.waterUnit': 'стакан',
      'food.overTitle': 'Меъёрдан ошди',
      'food.kcalWord': 'Калория', 'food.leftW': 'қолди', 'food.overW': 'ошди',
      'food.n.fib': 'Тола', 'food.n.sug': 'Шакар', 'food.n.satf': 'Тўйинган ёғ', 'food.n.salt': 'Туз', 'food.n.chol': 'Холестерин',
      'food.n.k': 'Калий', 'food.n.ca': 'Кальций', 'food.n.fe': 'Темир', 'food.n.mg': 'Магний', 'food.n.zn': 'Рух',
      'food.n.va': 'A витамини', 'food.n.vc': 'C витамини', 'food.n.vd': 'D витамини', 'food.n.b12': 'B12 витамини', 'food.n.fol': 'Фолат (B9)',
      'food.g.lim': 'Тола, шакар ва ёғлар', 'food.g.micro': 'Витамин ва минераллар',
      'food.pctDay': 'кунлик меъёрнинг {n}%', 'food.limit': 'чегара',
      'food.score': 'Баҳо {n}/10',
      'food.proc.whole': 'Табиий', 'food.proc.mixed': 'Аралаш', 'food.proc.processed': 'Қайта ишланган', 'food.proc.ultra': 'Кўп қайта ишланган',
      'food.asm': 'AI шундай тушунди', 'food.tips': 'Тавсиялар', 'food.details': 'Батафсил таркиб',
      'food.fixPh': 'Нотўғрими? Ёзинг: «гуруч эмас, гречка», «2 эмас, 1 коса»', 'food.fix': 'Тузатиш', 'food.fixing': 'Тузатилмоқда…',
      'food.youWrote': 'Сиз ёзган',
      'food.addPart': 'Қисм қўшиш', 'food.addPartPh': 'масалан: 1 дона нон ёки 200 г қатиқ', 'food.partBusy': 'AI ҳисобламоқда…',
      'food.partDel': 'Олиб ташлаш', 'food.fromParts': 'Жами таркибдаги қисмлардан ҳисобланади', 'food.partFail': 'Қисм қўшилмади',
      'food.report': 'Кунлик ҳисобот', 'food.rep.low': 'Кам', 'food.rep.over': 'Ортиқча', 'food.rep.ok': 'Ҳаммаси меъёрда',
      'food.rep.partial': '{n} та таомда батафсил таркиб йўқ — улар фақат ккал ва макроларда ҳисобга олинди',
      'food.rep.none': 'Батафсил таркиб (витамин, минерал) AI таҳлил қилган таомларда чиқади',
      'food.rep.all': 'Ҳамма моддалар', 'food.rep.ai': 'AI хулосаси', 'food.rep.aiBusy': 'AI ўйлаяпти…', 'food.rep.aiAgain': 'Янгилаш',
      'food.rep.aiFail': 'AI жавоб бермади: {m}',
    },
    ru: {
      'nav.food': 'Еда',
      'food.eaten': 'съедено', 'food.kcal': 'ккал',
      'food.protein': 'Белки', 'food.carbs': 'Углеводы', 'food.fat': 'Жиры',
      'food.pS': 'Б', 'food.cS': 'У', 'food.fS': 'Ж',
      'food.burned': 'WHOOP сжёг {n} ккал',
      'food.meals': 'Приёмы пищи', 'food.empty': 'За этот день ещё ничего не записано — напишите выше, что вы съели',
      'food.ask': 'Что вы съели?',
      'food.ph': 'Например: на обед тарелка плова, 2 куска лепёшки, чай без сахара',
      'food.askHint': 'Чем точнее, тем лучше: количество (тарелка, штука, граммы), как приготовлено, что добавлено.',
      'food.camera': 'Фото', 'food.gallery': 'Галерея', 'food.send': 'Анализ',
      'food.busy': 'Анализирую…', 'food.result': 'Результат анализа', 'food.rough': 'примерно',
      'food.save': 'Сохранить', 'food.edit': 'Изменить', 'food.dismiss': 'Отмена',
      'food.notConfigured': 'AI не подключён. Подключите свой AI в Настройки › AI или введите блюдо вручную.',
      'food.badKey': 'Ваш ключ AI не принят — проверьте его в Настройки › AI.',
      'food.rate': 'Слишком много запросов — попробуйте чуть позже.',
      'food.toSettings': 'Настройки', 'food.failed': 'AI не смог разобрать — введите блюдо вручную или попробуйте снова.',
      'food.badImage': 'Не удалось прочитать фото — выберите другое.', 'food.manual': 'Ввести вручную', 'food.retry': 'Повторить',
      'food.offline': 'Нет сервера — введите блюдо вручную.',
      'food.name': 'Блюдо', 'food.grams': 'Граммы', 'food.note': 'Заметка', 'food.items': 'Состав',
      'food.newMeal': 'Добавить блюдо', 'food.editMeal': 'Изменить блюдо', 'food.deleted': 'Блюдо удалено', 'food.saved': 'Блюдо сохранено',
      'food.targets': 'Нормы',
      'food.setTarget': 'Укажите свою норму', 'food.tgTitle': 'Ваша дневная норма',
      'food.tgHint': 'Введите каждое значение отдельно. Пустые макросы посчитаются от калорий.',
      'food.tgAutoNow': 'Сейчас считается по профилю',
      'food.tgReset': 'Считать по профилю', 'food.tgNoNum': 'Введите хотя бы одно число',
      'food.tgSaved': 'Норма сохранена',
      'food.time': 'время',
      'food.gramsHint': 'При изменении граммов макросы пересчитываются пропорционально',
      'food.tooBig': 'Фото слишком большое', 'food.notFood': 'Еда не найдена — опишите блюдо иначе или сделайте другое фото.',
      'food.week': 'Последние 7 дней', 'food.avgDay': 'в среднем за день', 'food.weekEmpty': 'На этой неделе ещё нет записей',
      'food.water': 'Вода', 'food.waterUnit': 'стакан',
      'food.overTitle': 'Норма превышена',
      'food.kcalWord': 'Калории', 'food.leftW': 'до нормы', 'food.overW': 'сверх нормы',
      'food.n.fib': 'Клетчатка', 'food.n.sug': 'Сахар', 'food.n.satf': 'Насыщенные жиры', 'food.n.salt': 'Соль', 'food.n.chol': 'Холестерин',
      'food.n.k': 'Калий', 'food.n.ca': 'Кальций', 'food.n.fe': 'Железо', 'food.n.mg': 'Магний', 'food.n.zn': 'Цинк',
      'food.n.va': 'Витамин A', 'food.n.vc': 'Витамин C', 'food.n.vd': 'Витамин D', 'food.n.b12': 'Витамин B12', 'food.n.fol': 'Фолат (B9)',
      'food.g.lim': 'Клетчатка, сахар и жиры', 'food.g.micro': 'Витамины и минералы',
      'food.pctDay': '{n}% дневной нормы', 'food.limit': 'предел',
      'food.score': 'Оценка {n}/10',
      'food.proc.whole': 'Натуральное', 'food.proc.mixed': 'Смешанное', 'food.proc.processed': 'Переработанное', 'food.proc.ultra': 'Сильно переработанное',
      'food.asm': 'Как AI понял', 'food.tips': 'Советы', 'food.details': 'Подробный состав',
      'food.fixPh': 'Неверно? Напишите: «не рис, а гречка», «не 2, а 1 тарелка»', 'food.fix': 'Исправить', 'food.fixing': 'Исправляю…',
      'food.youWrote': 'Вы написали',
      'food.addPart': 'Добавить часть', 'food.addPartPh': 'например: 1 лепёшка или 200 г катыка', 'food.partBusy': 'AI считает…',
      'food.partDel': 'Убрать', 'food.fromParts': 'Итог считается по частям состава', 'food.partFail': 'Не удалось добавить часть',
      'food.report': 'Отчёт за день', 'food.rep.low': 'Мало', 'food.rep.over': 'Много', 'food.rep.ok': 'Всё в норме',
      'food.rep.partial': 'У {n} блюд нет подробного состава — они учтены только в ккал и макросах',
      'food.rep.none': 'Подробный состав (витамины, минералы) появляется у блюд, разобранных AI',
      'food.rep.all': 'Все вещества', 'food.rep.ai': 'Вывод AI', 'food.rep.aiBusy': 'AI думает…', 'food.rep.aiAgain': 'Обновить',
      'food.rep.aiFail': 'AI не ответил: {m}',
    },
  });

  /* «Yorug' qog'oz» (2026-10-09) — yangi kartalarning matnlari. Bitta ixcham
     jadval [uz, uzk, ru], uch tilga yoyiladi. */
  const T9 = {
    'food.g': ['g', 'г', 'г'],
    'food.h.target': ["Me'yor {n} kkal", 'Меъёр {n} ккал', 'Норма {n} ккал'],
    'food.h.left': ['kkal qoldi', 'ккал қолди', 'ккал осталось'], 'food.h.over': ['kkal oshdi', 'ккал ошди', 'ккал сверх нормы'], 'food.h.eaten': ['kkal yeyildi', 'ккал ейилди', 'ккал съедено'],
    'food.h.ate': ['Yedingiz', 'Едингиз', 'Съедено'], 'food.h.burn': ["WHOOP bo'yicha sarf", 'WHOOP бўйича сарф', 'Расход по WHOOP'],
    'food.h.note': ['Chiziq — yegan kaloriyangiz nimadan iborat. Kulrang qism — yana yeyish mumkin.', 'Чизиқ — еган калориянгиз нимадан иборат. Кулранг қисм — яна ейиш мумкин.', 'Полоса — из чего состоят съеденные калории. Серая часть — сколько ещё можно съесть.'],
    'food.h.noteOver': ["Chiziq — yegan kaloriyangiz nimadan iborat. Kunlik me'yor to'ldi.", 'Чизиқ — еган калориянгиз нимадан иборат. Кунлик меъёр тўлди.', 'Полоса — из чего состоят съеденные калории. Дневная норма выполнена.'],
    'food.h.noteNoTg': ["Chiziq — yegan kaloriyangiz nimadan iborat. Me'yor yozilsa qoldiq ham ko'rinadi.", 'Чизиқ — еган калориянгиз нимадан иборат. Меъёр ёзилса қолдиқ ҳам кўринади.', 'Полоса — из чего состоят съеденные калории. Укажите норму — появится остаток.'],
    'food.h.none': ["Bu kunda hali taom yozilmagan — chiziq birinchi ovqatdan keyin to'ladi.", 'Бу кунда ҳали таом ёзилмаган — чизиқ биринчи овқатдан кейин тўлади.', 'За этот день ещё ничего не записано — полоса заполнится после первой еды.'],
    'food.m.title': ["Oqsil, uglevod, yog'", 'Оқсил, углевод, ёғ', 'Белки, углеводы, жиры'],
    'food.m.left': ['{n} g qoldi', '{n} г қолди', 'осталось {n} г'], 'food.m.near': ["deyarli to'ldi · {n} g qoldi", 'деярли тўлди · {n} г қолди', 'почти норма · осталось {n} г'],
    'food.m.full': ["me'yor to'ldi", 'меъёр тўлди', 'норма выполнена'], 'food.m.over': ['{n} g oshdi', '{n} г ошди', 'сверх нормы на {n} г'],
    'food.adv.kcalOver': ["Kaloriya me'yordan {n} kkal oshdi. Kunning qolganini yengil o'tkazing.", 'Калория меъёрдан {n} ккал ошди. Куннинг қолганини енгил ўтказинг.', 'Калории выше нормы на {n} ккал. Остаток дня — полегче.'],
    'food.adv.over': ["{m} me'yordan {n} g oshdi — keyingi ovqatda kamaytiring.", '{m} меъёрдан {n} г ошди — кейинги овқатда камайтиринг.', '{m}: выше нормы на {n} г — в следующий приём поменьше.'],
    'food.adv.p': ["Oqsil kam: yana {n} g kerak. Tovuq, baliq, tuxum yoki tvorog qo'shing.", 'Оқсил кам: яна {n} г керак. Товуқ, балиқ, тухум ёки творог қўшинг.', 'Белка мало: нужно ещё {n} г. Добавьте курицу, рыбу, яйца или творог.'],
    'food.adv.c': ["Uglevoddan hali {n} g qoldi — guruch, non yoki meva sig'adi.", 'Углеводдан ҳали {n} г қолди — гуруч, нон ёки мева сиғади.', 'Углеводов осталось {n} г — подойдут рис, хлеб или фрукты.'],
    'food.adv.f': ["Yog'dan hali {n} g qoldi — yong'oq yoki zaytun moyi sig'adi.", 'Ёғдан ҳали {n} г қолди — ёнғоқ ёки зайтун мойи сиғади.', 'Жиров осталось {n} г — подойдут орехи или оливковое масло.'],
    'food.adv.ok': ["Uchala makro ham me'yorga yaqin — yaxshi kun.", 'Учала макро ҳам меъёрга яқин — яхши кун.', 'Все три макроса близки к норме — хороший день.'],
    'food.w.note': ['1 stakan — {ml} ml. Stakanni bosib belgilang.', '1 стакан — {ml} мл. Стаканни босиб белгиланг.', '1 стакан — {ml} мл. Нажмите на стакан, чтобы отметить.'],
    'food.w.glass': ['{n}-stakan', '{n}-стакан', 'Стакан {n}'],
    'food.in.ph': ['Masalan: 2 ta somsa va choy', 'Масалан: 2 та сомса ва чой', 'Например: 2 самсы и чай'],
    'food.in.help': ["Oddiy so'z bilan yozing yoki rasmga oling — kaloriya, oqsil, uglevod va yog' o'zi hisoblanadi.", 'Оддий сўз билан ёзинг ёки расмга олинг — калория, оқсил, углевод ва ёғ ўзи ҳисобланади.', 'Опишите простыми словами или сфотографируйте — калории, белки, углеводы и жиры посчитаются сами.'],
    'food.ml.today': ['Bugungi ovqatlar', 'Бугунги овқатлар', 'Еда за сегодня'], 'food.ml.day': ['Ovqatlar', 'Овқатлар', 'Еда за день'],
    'food.ml.sum': ['{n} ta · {k} kkal', '{n} та · {k} ккал', '{n} · {k} ккал'],
    'food.emptyT': ['Hali taom yozilmagan', 'Ҳали таом ёзилмаган', 'Пока ничего не записано'],
    'food.emptyS': ['Yuqorida yozing yoki rasmga oling — qolganini ilova hisoblaydi.', 'Юқорида ёзинг ёки расмга олинг — қолганини илова ҳисоблайди.', 'Опишите или сфотографируйте выше — остальное посчитает приложение.'],
    'food.wk.avg': ["o'rtacha {n} kkal", 'ўртача {n} ккал', 'в среднем {n} ккал'],
    'food.wk.in': ["me'yorda", 'меъёрда', 'в норме'], 'food.wk.over': ["me'yordan oshgan", 'меъёрдан ошган', 'выше нормы'],
    'food.wk.today': ['bugun (davom etmoqda)', 'бугун (давом этмоқда)', 'сегодня (ещё идёт)'], 'food.wk.target': ["me'yor {n}", 'меъёр {n}', 'норма {n}'],
  };
  {
    const tb = { uz: {}, uzk: {}, ru: {} };
    for (const k of Object.keys(T9)) { tb.uz[k] = T9[k][0]; tb.uzk[k] = T9[k][1]; tb.ru[k] = T9[k][2]; }
    D.i18n.add(tb);
  }

  /* ------------------------------------------------------------------ */
  /* holat                                                               */
  /* ------------------------------------------------------------------ */
  function F() {
    const S = D.S;
    if (!S.food || typeof S.food !== 'object') S.food = { logs: {}, targets: { kcal: null, p: null, c: null, f: null, auto: true } };
    if (!S.food.logs || typeof S.food.logs !== 'object') S.food.logs = {};
    if (!S.food.targets || typeof S.food.targets !== 'object') S.food.targets = { kcal: null, p: null, c: null, f: null, auto: true };
    return S.food;
  }
  // AI kun xulosasi: { 'YYYY-MM-DD': { text, ts } } — kichik, oxirgi 14 kun qoladi
  function notes() {
    const f = F();
    if (!f.notes || typeof f.notes !== 'object' || Array.isArray(f.notes)) f.notes = {};
    return f.notes;
  }
  const key = () => { const td = D.today(), v = D.ui.viewDate; return v && v < td ? v : td; };
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const r0 = (n) => Math.round(+n || 0);
  const meals = (k) => (Array.isArray(F().logs[k]) ? F().logs[k] : []);
  const mealsSorted = (k) => meals(k).slice().sort((a, b) => (+a.ts || 0) - (+b.ts || 0));
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('food', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };
  const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  // bir martalik UI holati (sahifa yangilansa yo'qoladi)
  let draft = '';          // kompozerdagi matn
  let busy = false;        // so'rov ketyapti
  let pending = null;      // { text, note, preview, src, fix }
  let result = null;       // server javobi + preview/text
  let errorKind = null;    // 'ai_not_configured' | 'ai_failed' | 'bad_image' | 'offline' | 'bad_key' | 'rate'
  let editing = null;      // ochiq tahrir oynasi: { k, id, isNew, base, seed, items, orig }
  let dayAi = null;        // kun xulosasi so'ralayotgan kun kaliti
  let dayAiErr = '';

  /* ------------------------------------------------------------------ */
  /* profil → me'yorlar                                                  */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* Kunlik me'yor. Energiya D.whoop.energy() dan: WHOOP yetarli kun      */
  /* bergan bo'lsa bu o'lchangan haqiqiy sarf, bo'lmasa Mifflin-St Jeor   */
  /* x D.activityFactor (jadval core.js da).                              */
  /*                                                                      */
  /* Maqsad qat'iy kkal emas, TDEE ning ulushi. Ilgari har kimga bir xil   */
  /* −400 qo'yilardi: 3 000 kkal sarflaydigan odam uchun bu 13 %, 1 600    */
  /* kkal sarflaydigan kichik odam uchun esa 25 % taqchillik edi.          */
  /* Me'yor hech qachon asosiy almashinuvdan (BMR) past tushmaydi.         */
  /*                                                                      */
  /* Oqsil taqchillikda ko'proq kerak — mushak aynan o'shanda yo'qoladi:   */
  /* tashlashda 2,0 g/kg (ilgari 1,6, ya'ni saqlash bilan bir xil edi),    */
  /* saqlashda 1,6, olishda 1,8.                                           */
  /* ------------------------------------------------------------------ */
  const GOAL = {
    lose: { share: -0.20, lo: -700, hi: -250, prot: 2.0 },
    keep: { share: 0, lo: 0, hi: 0, prot: 1.6 },
    gain: { share: 0.12, lo: 200, hi: 500, prot: 1.8 },
  };
  function computeTargets() {
    const p = D.S.profile || {};
    const e = D.whoop && D.whoop.energy ? D.whoop.energy() : null;
    if (!e || !e.tdee || !e.kg) return null;
    const goal = GOAL[p.goal] ? p.goal : 'keep';
    const g = GOAL[goal];
    const adj = g.share ? D.clamp(Math.round(e.tdee * g.share), g.lo, g.hi) : 0;
    const kcal = Math.max(1200, e.bmr || 1200, r0(e.tdee + adj));
    const prot = r0(e.kg * g.prot);
    const fat = r0((kcal * 0.25) / 9);
    const carbs = Math.max(0, r0((kcal - prot * 4 - fat * 9) / 4));
    return { kcal, p: prot, c: carbs, f: fat, approx: e.approx, source: e.source, days: e.days, bmr: e.bmr, tdee: e.tdee, goal, kg: e.kg };
  }
  D.food = D.food || {};
  D.food.recalcTargets = () => {
    const c = computeTargets(), tg = F().targets;
    if (tg.auto && c) { tg.kcal = c.kcal; tg.p = c.p; tg.c = c.c; tg.f = c.f; }
    return c;
  };
  D.food.targets = () => {
    const tg = F().targets;
    if (tg.auto) {
      const c = computeTargets();
      if (c) return { kcal: c.kcal, p: c.p, c: c.c, f: c.f, auto: true, approx: c.approx, source: c.source, days: c.days, tdee: c.tdee, bmr: c.bmr };
      return { kcal: num(tg.kcal), p: num(tg.p), c: num(tg.c), f: num(tg.f), auto: true, approx: true };
    }
    return { kcal: num(tg.kcal), p: num(tg.p), c: num(tg.c), f: num(tg.f), auto: false };
  };
  /* --- me'yorni gap bilan yozish: «2200 kkal, 150 g oqsil» ------------ */
  /* Chegaralar settings.js FD_KEYS bilan bir xil — ikkala joyda ham bitta qoida. */
  const TG_LIM = { kcal: [800, 6000], p: [20, 400], c: [20, 800], f: [10, 300] };
  /* So'z → qaysi raqam. Apostrof va bosh harflar tashlanadi: «Yog'» ham «yog» bo'ladi. */
  const TG_WORD = {
    kcal: ['kkal', 'kcal', 'kaloriya', 'kaloriyalar', 'kalori', 'ккал', 'калория', 'калории', 'калорий', 'каллория', 'каллорий'],
    p: ['oqsil', 'oqsillar', 'protein', 'proteyn', 'оқсил', 'оксил', 'белок', 'белки', 'белка', 'белков'],
    c: ['uglevod', 'uglevodlar', 'carb', 'carbs', 'углевод', 'углеводы', 'углеводов', 'карбо'],
    f: ['yog', 'yogi', 'fat', 'ёғ', 'ег', 'жир', 'жиры', 'жиров', 'жира'],
  };
  /* «150 g oqsil» — raqam bilan so'z orasida turishi mumkin bo'lgan o'lchov so'zlari. */
  const TG_UNIT = new Set(['g', 'gr', 'gm', 'gram', 'gramm', 'grammm', 'г', 'гр', 'грам', 'грамм']);
  const TG_KEY = (() => { const m = {}; for (const k of Object.keys(TG_WORD)) for (const w of TG_WORD[k]) m[w] = k; return m; })();

  /** Matndan kunlik me'yorni o'qiydi. Topilmagan raqam — null. */
  D.food.parseTargets = (text) => {
    const out = { kcal: null, p: null, c: null, f: null };
    let s = String(text || '').toLowerCase().replace(/[ʻʼ‘’'`´]/g, '');
    if (!s.trim()) return out;
    s = s.replace(/(\d)[\s ](?=\d{3}(?!\d))/g, '$1');   // «2 200» → 2200
    s = s.replace(/(\d{1,3})[.,](\d{3})(?!\d)/g, '$1$2');    // «2,200» → 2200
    const toks = [];
    const re = /(\d+(?:[.,]\d+)?)|([\p{L}]+)/gu;
    for (let m; (m = re.exec(s)); ) {
      if (m[1] !== undefined) toks.push({ n: +m[1].replace(',', '.'), used: false });
      else toks.push({ w: m[2] });
    }
    const isNum = (i) => i >= 0 && i < toks.length && toks[i].n !== undefined && !toks[i].used;
    const take = (i) => { toks[i].used = true; return toks[i].n; };
    const unit = (i) => i >= 0 && i < toks.length && toks[i].w !== undefined && TG_UNIT.has(toks[i].w);
    // avval nomi aytilgan raqamlar: «150 g oqsil» ham, «oqsil 150 g» ham
    for (let i = 0; i < toks.length; i++) {
      const k = toks[i].w !== undefined ? TG_KEY[toks[i].w] : null;
      if (!k || out[k] !== null) continue;
      if (isNum(i - 1)) out[k] = take(i - 1);
      else if (unit(i - 1) && isNum(i - 2)) out[k] = take(i - 2);
      else if (isNum(i + 1)) out[k] = take(i + 1);
      else if (unit(i + 1) && isNum(i + 2)) out[k] = take(i + 2);
    }
    // qolgan yolg'iz raqam — kaloriya (odam ko'pincha shunchaki «2200» deb yozadi)
    if (out.kcal === null) for (const x of toks) if (x.n !== undefined && !x.used && x.n >= 500 && x.n <= 9000) { out.kcal = x.n; break; }
    for (const k of Object.keys(out)) if (out[k] !== null) out[k] = Math.round(D.clamp(out[k], TG_LIM[k][0], TG_LIM[k][1]));
    return out;
  };

  /** O'qilgan me'yorni to'liq holga keltiradi: aytilmagan makro kkal dan chiqadi. */
  D.food.fillTargets = (got) => {
    const cur = D.food.targets();
    const kcal = got.kcal !== null ? got.kcal : num(cur.kcal);
    const out = { kcal, p: got.p, c: got.c, f: got.f };
    if (got.kcal === null) {   // faqat makro aytildi — qolganiga tegmaymiz
      for (const k of ['p', 'c', 'f']) if (out[k] === null) out[k] = num(cur[k]);
      return out;
    }
    if (!kcal) return out;
    // Oqsil qoidasi bitta joyda — GOAL jadvalida. Ilgari u shu yerda ham,
    // computeTargets da ham alohida yozilgan edi; aynan shunday takror
    // faollik jadvalining ikkiga bo'linib ketishiga sabab bo'lgan.
    const en = D.whoop && D.whoop.energy ? D.whoop.energy() : null;
    const kg = en ? en.kg : null, g = GOAL[(D.S.profile || {}).goal] || GOAL.keep;
    if (out.p === null) out.p = kg ? r0(kg * g.prot) : r0((kcal * 0.2) / 4);
    if (out.f === null) out.f = r0((kcal * 0.25) / 9);
    if (out.c === null) out.c = Math.max(0, r0((kcal - out.p * 4 - out.f * 9) / 4));
    return out;
  };

  /* ------------------------------------------------------------------ */
  /* Asosiydan tashqari moddalar. Kalitlar va birliklar serverdagi        */
  /* FOOD_NUTR bilan bir xil (api.py). need: 'min' — yetishi kerak,       */
  /* 'max' — oshmasligi kerak (chegara). d — ko'rsatiladigan kasr.        */
  /* ------------------------------------------------------------------ */
  const NUTR = {
    fib: { u: 'g', need: 'min', d: 1 }, sug: { u: 'g', need: 'max', d: 1 }, satf: { u: 'g', need: 'max', d: 1 },
    salt: { u: 'g', need: 'max', d: 1 }, chol: { u: 'mg', need: 'max', d: 0 },
    k: { u: 'mg', need: 'min', d: 0 }, ca: { u: 'mg', need: 'min', d: 0 }, fe: { u: 'mg', need: 'min', d: 1 },
    mg: { u: 'mg', need: 'min', d: 0 }, zn: { u: 'mg', need: 'min', d: 1 },
    va: { u: 'µg', need: 'min', d: 0 }, vc: { u: 'mg', need: 'min', d: 0 }, vd: { u: 'µg', need: 'min', d: 1 },
    b12: { u: 'µg', need: 'min', d: 1 }, fol: { u: 'µg', need: 'min', d: 0 },
  };
  const NKEYS = Object.keys(NUTR);
  const G_LIM = ['fib', 'sug', 'satf', 'salt', 'chol'];
  const G_MICRO = ['k', 'ca', 'fe', 'mg', 'zn', 'va', 'vc', 'vd', 'b12', 'fol'];
  // «batafsil tahlil qilingan» taom — hech bo'lmasa bitta vitamin/mineral bor (eski yozuvlarda faqat tola·shakar·tuz edi)
  const hasMicro = (m) => G_MICRO.some((x) => num(m[x]) !== null);
  D.food.NUTR = NUTR;

  /* Kunlik me'yor (kattalar): WHO (tuz 5 g, erkin shakar va to'yingan yog' ≤ 10 % energiya),
     tola — har 1000 kkal ga 14 g, qolgani — AQSh/EFSA tavsiya etilgan kunlik miqdori (RDA).
     Jinsga bog'liqlari profildan; jins noma'lum bo'lsa erkak qiymati. */
  D.food.dailyRef = (k) => {
    const pr = D.S.profile || {}, fem = pr.sex === 'f', age = D.profileAge() || 30;
    const kcal = num((D.food.targets() || {}).kcal) || 2000;
    switch (k) {
      case 'fib': return Math.round((kcal / 1000) * 14);
      case 'sug': return Math.round((kcal * 0.1) / 4);
      case 'satf': return Math.round((kcal * 0.1) / 9);
      case 'salt': return 5;
      case 'chol': return 300;
      case 'k': return 3500;
      case 'ca': return fem && age >= 51 ? 1200 : 1000;
      case 'fe': return fem && age < 51 ? 18 : 8;
      case 'mg': return fem ? 310 : 400;
      case 'zn': return fem ? 8 : 11;
      case 'va': return fem ? 700 : 900;
      case 'vc': return fem ? 75 : 90;
      case 'vd': return age > 70 ? 20 : 15;
      case 'b12': return 2.4;
      case 'fol': return 400;
      default: return null;
    }
  };
  const fmtN = (k, v) => D.fmtNum(+D.round(+v || 0, NUTR[k].d), NUTR[k].d || undefined);

  /* kkal/makrolar doim; qolgan moddalar — faqat hech bo'lmasa bitta taomda bo'lsa.
     detail — vitamin/mineral bilan tahlil qilingan taomlar soni (hisobot to'liqligini aytish uchun). */
  D.food.dayTotals = (k) => {
    const ms = meals(k || key());
    if (!ms.length) return null;
    const o = { kcal: 0, p: 0, c: 0, f: 0 };
    for (const m of ms) { o.kcal += +m.kcal || 0; o.p += +m.p || 0; o.c += +m.c || 0; o.f += +m.f || 0; }
    const out = { kcal: r0(o.kcal), p: r0(o.p), c: r0(o.c), f: r0(o.f), n: ms.length, detail: ms.filter(hasMicro).length };
    for (const x of NKEYS) {
      const has = ms.some((m) => num(m[x]) !== null);
      if (has) out[x] = +D.round(D.sum(ms, (m) => +m[x] || 0), 1);
    }
    return out;
  };

  /** Me'yordan oshgan qismi: { kcal, p, c, f } — faqat oshganlari, musbat son. Hech biri oshmagan bo'lsa null. */
  D.food.overBy = (tot, tg) => {
    if (!tot || !tg) return null;
    const o = {};
    for (const x of ['kcal', 'p', 'c', 'f']) { const lim = num(tg[x]); if (lim && r0(tot[x]) > lim) o[x] = r0(tot[x]) - lim; }
    return Object.keys(o).length ? o : null;
  };
  const OVER_LAB = { p: 'food.protein', c: 'food.carbs', f: 'food.fat' };

  /* ------------------------------------------------------------------ */
  /* SUV                                                                  */
  /*                                                                      */
  /* Suv Asosiy sahifada turardi va u yerdagi yagona bosiladigan narsa    */
  /* bo'lib qolgandi. U ham ichiladigan narsa, shuning uchun kkal bilan   */
  /* bir sahifada: Asosiy'da endi faqat raqami ko'rinadi.                 */
  /* Me'yor — sozlamadagi qo'lda kiritilgani, bo'lmasa vazndan 35 ml/kg   */
  /* va faollik/jins/yosh qo'shimchalari; stakanga bo'linadi.             */
  /* ------------------------------------------------------------------ */
  function waterTargetMl(dayK) {
    const st = D.S.settings, pr = D.S.profile || {};
    const manual = +st.waterTargetMl || 0;
    if (manual > 0) return manual;
    let kg = +pr.weightKg || 0;
    if (!kg) {
      let best = '';
      for (const [d, h] of Object.entries(D.S.health || {})) if (h && +h.weight > 0 && d > best) { best = d; kg = +h.weight; }
      if (!kg) kg = 70;
    }
    const act = D.clamp(pr.activity === null || pr.activity === undefined ? 3 : +pr.activity || 0, 0, 5);
    // Yosh D.profileAge() dan: `pr.age` onboardingda bir marta yoziladigan
    // surat, keyingi yili bir yilga eskiradi (ARCHITECTURE: yagona qoida).
    const age = D.profileAge() || 0;
    let ml = Math.round(kg * 35 + act * 100 + (pr.sex === 'm' ? 200 : 0) + (age >= 50 ? 100 : 0));
    // O'sha kunning WHOOP mashg'uloti: har soat mashqqa ~500 ml ter bilan
    // ketadi, ko'pi bilan +1 500 ml. Og'ir mashq qilgan kun me'yor o'zi
    // ko'tariladi — sozlamaga kirib qo'lda tuzatish shart emas.
    if (D.whoop && D.whoop.workoutsOn && (D.S.whoop || {}).connected) {
      try {
        const mins = D.sum(D.whoop.workoutsOn(dayK || D.today()), (w) => +w.mins || 0);
        if (mins > 0) ml += Math.min(1500, Math.round((mins / 60) * 500));
      } catch (e) { /* mashg'ulot yo'q — me'yor o'zgarmaydi */ }
    }
    return ml;
  }
  /** { n, goal, pct } — ichilgan stakan, kunlik me'yor va ulushi. */
  D.food.water = (k) => {
    const day = k || key();
    const n = +((D.S.health[day] || {}).water) || 0;
    const ml = Math.max(50, +D.S.settings.waterMl || 250);
    const goal = Math.max(1, Math.ceil(waterTargetMl(day) / ml));
    return { n, goal, pct: D.clamp((n / goal) * 100, 0, 100) };
  };
  D.act.fdWater = (el) => {
    const day = key();
    const h = D.S.health[day] || (D.S.health[day] = { weight: null, sleep: null, bed: null, wake: null, water: 0, mood: null, tags: [], note: '' });
    const cur = Math.max(0, +h.water || 0);
    /* Stakan mutlaq sonni yuboradi (data-n), farq shu yerda — HOZIRGI qiymatdan
       hisoblanadi: eskirgan DOM boshqa songa qo'llanib ketmaydi. Oxirgi to'lgan
       stakan bosilsa bittaga kamayadi. */
    const n = el.dataset.n != null ? Math.max(0, Math.floor(+el.dataset.n || 0)) : null;
    const next = n != null ? (n === cur ? cur - 1 : n) : Math.max(0, cur + (+el.dataset.d || 0));
    h.water = Math.max(0, next);
    // bir bosishda bir nechta stakan kamaysa — qaytarish imkoni
    if (cur - h.water > 1) { const back = cur; setTimeout(() => D.toast(`${t('food.water')}: ${D.fmtNum(h.water)}`, { undo: () => { const x = D.S.health[day]; if (x) { x.water = back; D.save(); D.rerender(); } } }), 0); }
    try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ }
    D.save(); D.rerender();
  };
  /* Stakanlar (A.9: 24×32 SVG). Bosilgan stakangacha belgilanadi; oxirgi
     to'lgan stakan bosilsa bittaga kamayadi. Yozish yo'li o'sha — fdWater,
     farq (data-d) shu yerda hisoblanadi. */
  const GLASS = '<svg viewBox="0 0 24 32" width="24" height="32" aria-hidden="true"><path class="g" d="M3.5 3.5h17l-1.9 23.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L3.5 3.5z"/><path class="l" d="M4.7 9.5h14.6"/></svg>';
  function waterCard(k) {
    const w = D.food.water(k);
    const ml = Math.max(50, +D.S.settings.waterMl || 250);
    // me'yordan oshib ichilganda ham keyingi stakan uchun bitta bo'sh joy qoladi
    const count = Math.min(30, Math.max(w.goal, w.n + (w.n >= w.goal ? 1 : 0)));
    // qatorda ko'pi bilan 6 ta (360px ekranda ham har biri 44px dan keng), qatorlar teng bo'linadi
    const perRow = Math.ceil(count / Math.ceil(count / 6));
    let cells = '';
    for (let n = 1; n <= count; n++) {
      const on = n <= w.n;
      cells += `<button type="button" class="fd-gl${on ? ' on' : ''}" data-act="fdWater" data-n="${n}" aria-pressed="${on}" aria-label="${esc(t('food.w.glass', { n }))}">${GLASS}</button>`;
    }
    return `<section class="card fd-water${w.n >= w.goal ? ' full' : ''}">
      <div class="card-head"><h2 class="title">${esc(t('food.water'))}</h2><span class="fd-side num"><b>${D.fmtNum(w.n)}</b> / ${D.fmtNum(w.goal)} ${esc(t('food.waterUnit'))}</span></div>
      <div class="fd-gls" style="--n:${perRow}">${cells}</div>
      <p class="fd-fine">${esc(t('food.w.note', { ml: D.fmtNum(ml) }))}</p>
    </section>`;
  }

  /** Kunning WHOOP sarfi: bugun jonli sikl, boshqa kunlar — sikl kkal. */
  function burned(k) {
    if (!D.whoop || !D.S.whoop || !D.S.whoop.connected) return null;
    if (k === D.today()) { const l = D.whoop.live(); if (l && num(l.kcal) !== null) return r0(l.kcal); }
    const d = D.whoop.day(k);
    return d && num(d.kcal) !== null ? r0(d.kcal) : null;
  }
  D.food.burned = burned;

  /* ------------------------------------------------------------------ */
  /* taomlar                                                             */
  /* ------------------------------------------------------------------ */
  const d1 = (v) => +D.round(+v || 0, 1);
  const fmt1 = (v) => D.fmtNum(d1(v));
  const cleanItem = (x) => {
    const o = { name: cut(x && x.name, 60), grams: num(x && x.grams) ?? 0, kcal: r0(x && x.kcal), p: d1(x && x.p), c: d1(x && x.c), f: d1(x && x.f) };
    for (const k of NKEYS) if (x && num(x[k]) !== null) o[k] = d1(x[k]);
    return o;
  };
  const sumItems = (items) => {
    const o = { kcal: r0(D.sum(items, (i) => i.kcal)), p: d1(D.sum(items, (i) => i.p)), c: d1(D.sum(items, (i) => i.c)), f: d1(D.sum(items, (i) => i.f)), grams: r0(D.sum(items, (i) => i.grams)) };
    for (const k of NKEYS) if (items.some((i) => num(i[k]) !== null)) o[k] = d1(D.sum(items, (i) => +i[k] || 0));
    return o;
  };
  // bitta qismni x barobar kattalashtiradi/kichraytiradi — hamma raqami birga
  const scaleItem = (i, x) => {
    const o = { ...i, grams: r0((+i.grams || 0) * x), kcal: r0((+i.kcal || 0) * x), p: d1((+i.p || 0) * x), c: d1((+i.c || 0) * x), f: d1((+i.f || 0) * x) };
    for (const k of NKEYS) if (num(i[k]) !== null) o[k] = d1(+i[k] * x);
    return o;
  };
  function nameFrom(items, text) {
    const names = (items || []).map((i) => i.name).filter(Boolean);
    if (names.length) return cut(names.slice(0, 3).join(', ') + (names.length > 3 ? ' …' : ''), 60);
    return cut(text, 60) || t('food.name');
  }
  const PROC = ['whole', 'mixed', 'processed', 'ultra'];
  function addMeal(k, m) {
    const logs = F().logs;
    if (!Array.isArray(logs[k])) logs[k] = [];
    const meal = {
      id: D.uid('fd'), ts: Date.now(), name: cut(m.name, 60) || t('food.name'), grams: r0(m.grams),
      kcal: r0(m.kcal), p: d1(m.p), c: d1(m.c), f: d1(m.f),
      photo: m.photo || null, items: Array.isArray(m.items) ? m.items.map(cleanItem) : [], note: cut(m.note, 200), src: m.src || 'manual',
    };
    for (const x of NKEYS) if (num(m[x]) !== null) meal[x] = d1(m[x]);
    // AI izohlari — bo'lsa saqlanadi (taomni keyin ochganda ham ko'rinsin), bo'lmasa kalit umuman yo'q
    if (num(m.score) !== null) meal.score = D.clamp(r0(m.score), 1, 10);
    if (PROC.includes(m.proc)) meal.proc = m.proc;
    if (m.advice) meal.advice = cut(m.advice, 400);
    if (Array.isArray(m.tips) && m.tips.length) meal.tips = m.tips.slice(0, 3).map((s) => cut(s, 160));
    if (m.asm) meal.asm = cut(m.asm, 300);
    if (m.desc) meal.desc = cut(m.desc, 600);
    logs[k].push(meal);
    D.save();
    return meal;
  }
  const findMeal = (k, id) => meals(k).find((m) => m.id === id);
  const timeOf = (m, k) => { if (!m.ts) return ''; const d = new Date(+m.ts); return D.dayKey(d) === k ? D.fmtTime(D.nowTz(d).h, D.nowTz(d).min) : ''; };

  /* ------------------------------------------------------------------ */
  /* rasm: ≤1024 px JPEG q0.82, canvas orqali (baytlar holatga tushmaydi) */
  /* ------------------------------------------------------------------ */
  const dataBytes = (u) => Math.floor(((u.length - (u.indexOf(',') + 1)) * 3) / 4);
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad_image')); };
      img.src = url;
    });
  }
  async function shrink(file) {
    const img = await loadImage(file);
    const draw = (side, q) => {
      const s = Math.min(1, side / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * s)), h = Math.max(1, Math.round((img.naturalHeight || img.height) * s));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      return cv.toDataURL('image/jpeg', q);
    };
    let u = draw(MAX_SIDE, JPEG_Q);
    if (dataBytes(u) > MAX_BYTES) u = draw(800, 0.7);
    if (dataBytes(u) > MAX_BYTES) throw new Error('too_big');
    return u;
  }

  /* ------------------------------------------------------------------ */
  /* tahlil so'rovi                                                      */
  /* ------------------------------------------------------------------ */
  /* Odamning kuni — AI maslahatni shunga moslasin («yana 800 kkal qoldi,
     oqsil kam»). Raqamlarning o'ziga ta'sir qilmaydi (server shunday aytadi). */
  const hhmm = () => { const n = D.nowTz(); return `${n.h}:${String(n.min).padStart(2, '0')}`; };
  const GOAL_EN = { lose: 'lose weight', keep: 'maintain weight', gain: 'gain weight' };
  function ctxLine(k) {
    try {
      const tg = D.food.targets(), tot = D.food.dayTotals(k) || { kcal: 0, p: 0 }, pr = D.S.profile || {};
      const parts = [];
      if (tg.kcal) parts.push(`daily target ${tg.kcal} kcal, protein ${tg.p} g`);
      parts.push(`already eaten that day ${tot.kcal} kcal, protein ${tot.p} g`);
      if (GOAL_EN[pr.goal]) parts.push('goal: ' + GOAL_EN[pr.goal]);
      if (pr.sex === 'm' || pr.sex === 'f') parts.push(pr.sex === 'f' ? 'female' : 'male');
      const age = D.profileAge(); if (age) parts.push(`${age} years old`);
      if (k === D.today()) parts.push('local time ' + hhmm());
      return parts.join('; ');
    } catch (e) { return ''; }
  }
  /** Server/AI xatosi → ekrandagi holat. */
  function errKind(e) {
    const m = String((e && e.message) || e);
    return /ai_not_configured|501/.test(m) ? 'ai_not_configured'
      : /bad_image/.test(m) ? 'bad_image'
      : /api_40[13]|authenticat|api key/i.test(m) ? 'bad_key'
      : /rate_limited|429/.test(m) ? 'rate' : 'ai_failed';
  }
  const ERR_MSG = { ai_not_configured: 'food.notConfigured', bad_image: 'food.badImage', too_big: 'food.tooBig', offline: 'food.offline', bad_key: 'food.badKey', rate: 'food.rate' };
  const errText = (kind) => t(ERR_MSG[kind] || 'food.failed');

  function shapeResult(r, p) {
    const items = (Array.isArray(r.items) ? r.items : []).map(cleanItem);
    const rt = r.total && typeof r.total === 'object' ? r.total : {};
    let total;
    if (items.length) total = sumItems(items);
    else {
      total = { kcal: r0(rt.kcal), p: d1(rt.p), c: d1(rt.c), f: d1(rt.f) };
      for (const x of NKEYS) if (num(rt[x]) !== null) total[x] = d1(rt[x]);
    }
    return {
      items, total, grams: sumItems(items).grams,
      confidence: num(r.confidence), score: num(r.score), proc: PROC.includes(r.processing) ? r.processing : null,
      asm: cut(r.assumptions, 300), advice: cut(r.advice, 400),
      tips: (Array.isArray(r.tips) ? r.tips : []).map((s) => cut(s, 160)).filter(Boolean).slice(0, 3),
      photo: r.photo || p.photo || null,
      preview: p.preview, text: p.text, note: p.note, src: p.src, name: cut(r.title, 60) || nameFrom(items, p.text),
    };
  }

  async function analyze(o) {
    if (busy) return;
    if (!D.serverEnabled()) { errorKind = 'offline'; result = null; D.rerender(); openEdit(key(), null, { name: o.text, note: o.note, desc: o.text, src: 'manual' }); return; }
    const before = o.fix ? result : null;   // tuzatish yiqilsa eski natija qaytadi
    busy = true; errorKind = null; result = null;
    pending = { text: o.text || '', note: o.note || '', preview: o.preview || null, image: o.image || null, photo: o.photo || null,
      src: o.src || (o.image ? 'photo' : 'text'), fix: o.fix || '', prev: o.prev || null };
    D.rerender();
    try {
      const body = { lang: D.lang(), ctx: ctxLine(key()) };
      if (pending.image) body.image = pending.image;
      if (pending.text) body.text = pending.text;
      if (pending.note) body.note = pending.note;
      if (pending.fix && pending.prev) { body.fix = pending.fix; body.prev = pending.prev; }
      const r = await D.api('/api/food/analyze', { method: 'POST', body: JSON.stringify(body), timeout: 90000 });   // AI javobi sekin bo'lishi mumkin
      result = shapeResult(r, pending);
    } catch (e) {
      errorKind = errKind(e);
      D.logError(e);
      if (before) { result = before; D.toast(errText(errorKind), { ms: 4000 }); errorKind = null; }
    } finally {
      busy = false;
      D.rerender();
      // tahlil bo'lmadi → matn bilan to'ldirilgan qo'lda kiritish oynasi
      if (errorKind === 'ai_failed') openEdit(key(), null, { name: pending.text, note: pending.note, desc: pending.text, src: 'manual' });
    }
  }

  /* Har harfda D.rerender() qilib bo'lmaydi — yozayotgan odam fokusdan
     ajralib qoladi. Shuning uchun «Tahlil» tugmasi shu yerda, qo'lda
     almashtiriladi: bo'sh maydonda ghost va o'chiq, matn paydo bo'lishi
     bilan to'ldirilgan va ishlaydigan. */
  D.act.fdDraft = (el) => {
    draft = el.value;
    /* Maydon bir qatordan boshlanadi va matnga qarab o'sadi. Yangi brauzerda
       buni CSS o'zi qiladi (field-sizing), eskisida — shu ikki qator. */
    if (el.style && el.scrollHeight) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight + 3, 168) + 'px'; }
    const card = el.closest && el.closest('.fd-cap');
    const b = card && card.querySelector('.fd-send');
    if (!b) return;
    const ready = !!draft.trim();
    b.disabled = !ready;
    b.classList.toggle('ghost', !ready);
  };
  D.act.fdSend = () => {
    const text = draft.trim();
    if (!text || busy) return;
    draft = '';
    const inp = D.$('#fdText'); if (inp) inp.value = '';
    analyze({ text });
  };
  D.act.fdPhoto = async (el) => {
    const file = el.files && el.files[0];
    el.value = '';
    if (!file || busy) return;
    let image;
    try { image = await shrink(file); }
    catch (e) { errorKind = String(e.message) === 'too_big' ? 'too_big' : 'bad_image'; D.rerender(); return; }
    // rasm bilan birga yozilgan matn — izoh (porsiya, brend)
    const note = draft.trim(); draft = '';
    const inp = D.$('#fdText'); if (inp) inp.value = '';
    analyze({ image, preview: image, note });
  };
  D.act.fdDismiss = () => { result = null; errorKind = null; pending = null; D.rerender(); };
  D.act.fdRetry = () => { if (!pending) return; const p = pending; errorKind = null; analyze({ ...p }); };
  /* Tuzatish: «guruch emas, grechka». Avvalgi qismlar va odamning gapi
     AI'ga qaytadi — rasmni qayta yuborish shart emas. */
  D.act.fdFix = () => {
    const i = D.$('#fdFix'); const fix = i ? i.value.trim() : '';
    if (!fix || !result || busy) return;
    const r = result;
    analyze({ text: r.text, note: r.note, fix, prev: r.items, preview: r.preview, photo: r.photo, src: r.src });
  };
  const resSeed = (r) => ({ ...r.total, name: r.name, grams: r.grams, photo: r.photo, items: r.items, note: r.note, src: r.src,
    score: r.score, proc: r.proc, advice: r.advice, tips: r.tips, asm: r.asm, desc: r.text });
  D.act.fdSaveRes = () => {
    if (!result) return;
    addMeal(key(), resSeed(result));
    result = null; pending = null;
    D.toast(t('food.saved')); D.rerender();
  };
  D.act.fdEditRes = () => { if (result) openEdit(key(), null, resSeed(result)); };
  D.act.fdManual = () => { const p = pending || {}; openEdit(key(), null, { name: p.text, note: p.note, desc: p.text, src: 'manual' }); };

  /* ------------------------------------------------------------------ */
  /* tahrir oynasi                                                       */
  /* Qismlari bor taom — har qismning grammi alohida o'zgaradi, qism      */
  /* olib tashlanadi yoki gap bilan qo'shiladi («1 dona non»), jami       */
  /* qismlardan hisoblanadi. Qismsiz (qo'lda) taom — eski to'rt katak:     */
  /* gramm o'zgarsa makrolar mutanosib qayta hisoblanadi.                 */
  /* ------------------------------------------------------------------ */
  function openEdit(k, id, seed) {
    const meal = id ? findMeal(k, id) : null;
    if (id && !meal) return;
    const v = { name: '', grams: 0, kcal: 0, p: 0, c: 0, f: 0, note: '', items: [], ...(meal || seed || {}) };
    const items = (Array.isArray(v.items) ? v.items : []).map(cleanItem);
    editing = {
      k, id: meal ? meal.id : null, isNew: !meal, seed: { ...v }, items, orig: items.map((i) => ({ ...i })), partBusy: false,
      base: { grams: +v.grams || 0, kcal: +v.kcal || 0, p: +v.p || 0, c: +v.c || 0, f: +v.f || 0 },
    };
    showEdit(false);
  }
  const val = (id) => { const i = D.$('#' + id); return i ? i.value : ''; };
  /* Tahrir maydonlari type="text": type="number" «12,5» ni bo'sh deb berardi va makro 0 bo'lib saqlanardi. */
  function numIn(v) { const n = num(String(v ?? '').trim().replace(/\s/g, '').replace(',', '.')); return n === null || n < 0 ? null : n; }
  /* Oyna qayta chizilishidan oldin yozilganlarni eslab qolamiz. */
  function edFields() {
    if (!editing) return;
    const s = editing.seed;
    if (D.$('#fdEdName')) s.name = val('fdEdName');
    if (D.$('#fdEdNote')) s.note = val('fdEdNote');
    if (!editing.items.length) for (const [id, k] of [['fdEdG', 'grams'], ['fdEdK', 'kcal'], ['fdEdP', 'p'], ['fdEdC', 'c'], ['fdEdF', 'f']]) {
      if (D.$('#' + id) && numIn(val(id)) !== null) s[k] = numIn(val(id));
    }
  }
  const macTxt = (i) => `${D.fmtNum(r0(i.kcal))} ${esc(t('food.kcal'))} · ${esc(t('food.pS'))} ${fmt1(i.p)} · ${esc(t('food.cS'))} ${fmt1(i.c)} · ${esc(t('food.fS'))} ${fmt1(i.f)}`;
  function edItemsHtml() {
    return editing.items.map((i, n) => `<div class="fd-ed-item">
        <div class="fd-ed-in"><div class="fd-ed-nm">${esc(i.name)}</div><div class="fd-ed-mac num" id="fdEdIm${n}">${macTxt(i)}</div></div>
        <input type="text" class="inp num sm fd-ed-g" inputmode="decimal" autocomplete="off" value="${r0(i.grams)}" data-input="fdEdItemG" data-i="${n}" aria-label="${esc(i.name)} · ${esc(t('food.grams'))}">
        <span class="fd-ed-u">g</span>
        <button class="btn icon" data-act="fdEdItemDel" data-i="${n}" aria-label="${esc(t('food.partDel'))}: ${esc(i.name)}">${D.ic('x', 14)}</button>
      </div>`).join('');
  }
  function edTotHtml() {
    const s = sumItems(editing.items);
    return `<div class="fd-big"><b class="num">${D.fmtNum(s.kcal)}</b><span>${esc(t('food.kcal'))}</span><span class="fd-big-g num">${D.fmtNum(s.grams)} g</span></div>
      ${macroRow(s)}<div class="help">${esc(t('food.fromParts'))}</div>`;
  }
  function showEdit(again) {
    const e = editing, v = e.seed, hasItems = e.items.length > 0;
    const macro = (fid, label, value, unit) => `<div class="field fd-ed-f"><label class="field-label" for="${fid}">${esc(label)}${unit ? ` · ${unit}` : ''}</label><input type="text" class="inp num sm" id="${fid}" inputmode="decimal" autocomplete="off" value="${esc(String(value))}"></div>`;
    const manual = `<div class="field"><label class="field-label" for="fdEdG">${esc(t('food.grams'))}</label><input type="text" class="inp num" id="fdEdG" inputmode="decimal" autocomplete="off" value="${r0(v.grams)}" data-input="fdEdGrams"><div class="help">${esc(t('food.gramsHint'))}</div></div>
      <div class="fd-ed-grid">${macro('fdEdK', t('food.kcal'), r0(v.kcal), '')}${macro('fdEdP', t('food.protein'), d1(v.p), 'g')}${macro('fdEdC', t('food.carbs'), d1(v.c), 'g')}${macro('fdEdF', t('food.fat'), d1(v.f), 'g')}</div>`;
    const parts = `<div class="eyebrow">${esc(t('food.items'))}</div><div class="fd-ed-items" id="fdEdItems">${edItemsHtml()}</div>
      <div class="fd-ed-tot" id="fdEdTot">${edTotHtml()}</div>`;
    const add = D.serverEnabled() ? `<div class="field fd-ed-add"><label class="field-label" for="fdEdPart">${esc(t('food.addPart'))}</label>
      <div class="fd-ed-addrow"><input class="inp sm" id="fdEdPart" maxlength="200" placeholder="${esc(t('food.addPartPh'))}" data-enter="fdEdPartAdd" autocomplete="off" ${e.partBusy ? 'disabled' : ''}>
      <button class="btn sm ghost" data-act="fdEdPartAdd" ${e.partBusy ? 'disabled' : ''} aria-label="${esc(t('food.addPart'))}">${D.ic(e.partBusy ? 'refresh' : 'plus', 14)}${e.partBusy ? ` ${esc(t('food.partBusy'))}` : ''}</button></div></div>` : '';
    const body = `<div class="field"><label class="field-label" for="fdEdName">${esc(t('food.name'))}</label><input class="inp" id="fdEdName" maxlength="60" value="${esc(v.name || '')}" placeholder="${esc(t('food.name'))}" data-enter="fdEdSave"></div>
      ${hasItems ? parts : manual}
      ${add}
      <div class="field"><label class="field-label" for="fdEdNote">${esc(t('food.note'))} <span class="muted">(${esc(t('common.optional'))})</span></label><input class="inp sm" id="fdEdNote" maxlength="200" value="${esc(v.note || '')}"></div>`;
    const actions = [{ label: t('btn.cancel'), act: 'closeModal' }];
    if (!e.isNew) actions.push({ label: t('btn.delete'), act: 'fdEdDel', danger: true });
    actions.push({ label: e.isNew ? t('btn.add') : t('btn.save'), act: 'fdEdSave', primary: true });
    D.modal({ title: e.isNew ? t('food.newMeal') : t('food.editMeal'), body, actions, noFocus: !!again, onClose: () => { editing = null; } });
  }
  D.act.fdAddManual = () => openEdit(key(), null, { src: 'manual' });
  D.act.fdEdGrams = (el) => {
    if (!editing) return;
    const g = numIn(el.value), b = editing.base;
    if (g === null || !b.grams) return;
    const f = g / b.grams;
    const set = (id, v, d) => { const i = D.$('#' + id); if (i) i.value = String(+D.round(v * f, d)); };
    set('fdEdK', b.kcal, 0); set('fdEdP', b.p, 1); set('fdEdC', b.c, 1); set('fdEdF', b.f, 1);
  };
  // Qism grammi: asl qiymatdan hisoblanadi (har harfda yaxlitlash yig'ilib ketmasin); oyna qayta chizilmaydi
  D.act.fdEdItemG = (el) => {
    const e = editing; if (!e) return;
    const i = +el.dataset.i, g = numIn(el.value), o = e.orig[i];
    if (!o || g === null) return;
    e.items[i] = o.grams > 0 ? scaleItem(o, g / o.grams) : { ...e.items[i], grams: r0(g) };
    D.patch('fdEdIm' + i, macTxt(e.items[i]));
    D.patch('fdEdTot', edTotHtml());
  };
  D.act.fdEdItemDel = (el) => {
    const e = editing; if (!e) return;
    const i = +el.dataset.i;
    if (!e.items[i]) return;
    edFields();
    e.items.splice(i, 1); e.orig.splice(i, 1);
    if (!e.items.length) Object.assign(e.seed, { grams: 0, kcal: 0, p: 0, c: 0, f: 0 });
    showEdit(true);
  };
  D.act.fdEdPartAdd = async () => {
    const e = editing;
    if (!e || e.partBusy) return;
    const text = val('fdEdPart').trim();
    if (!text) return;
    edFields();
    // qo'lda kiritilgan raqamlar yo'qolmasin — ular birinchi qism bo'ladi
    if (!e.items.length && (+e.seed.kcal || 0) > 0) {
      const first = cleanItem({ name: e.seed.name || t('food.name'), grams: e.seed.grams, kcal: e.seed.kcal, p: e.seed.p, c: e.seed.c, f: e.seed.f });
      for (const x of NKEYS) if (num(e.seed[x]) !== null) first[x] = d1(e.seed[x]);
      e.items.push(first); e.orig.push({ ...first });
    }
    e.partBusy = true; showEdit(true);
    try {
      const r = await D.api('/api/food/analyze', { method: 'POST', body: JSON.stringify({ lang: D.lang(), text }), timeout: 90000 });
      if (editing !== e) return;   // oyna kutish paytida yopilgan
      const add = (Array.isArray(r.items) ? r.items : []).map(cleanItem);
      if (!add.length) D.toast(t('food.notFood'));
      for (const x of add) { e.items.push(x); e.orig.push({ ...x }); }
    } catch (err) {
      if (editing === e) D.toast(t('food.partFail') + ' — ' + errText(errKind(err)), { ms: 4000 });
    } finally {
      if (editing === e) { edFields(); e.partBusy = false; showEdit(true); }
    }
  };
  // gramm o'zgarsa qo'shimcha moddalar ham shu nisbatda — taom 150 g deb tursa, tuzi 300 g niki bo'lib qolmasin
  const scaleExtra = (src, from, to) => {
    const out = {}, fx = from > 0 && to > 0 ? to / from : 1;
    for (const x of NKEYS) if (num(src[x]) !== null) out[x] = d1(+src[x] * fx);
    return out;
  };
  const AI_KEYS = ['score', 'proc', 'advice', 'tips', 'asm', 'desc'];
  D.act.fdEdSave = () => {
    if (!editing) return;
    edFields();
    const e = editing, s = e.seed, meal = e.id ? findMeal(e.k, e.id) : null;
    if (!e.isNew && !meal) { D.closeModal(); return; }
    let m;
    if (e.items.length) {
      const tot = sumItems(e.items);
      // eski taomlarda tola·shakar·tuz faqat jamida edi, qismlarda emas — ular gramm nisbatida qoladi
      const rest = scaleExtra(meal || s, e.base.grams, tot.grams);
      for (const x of NKEYS) if (num(tot[x]) === null && num(rest[x]) !== null) tot[x] = rest[x];
      m = { ...tot, items: e.items };
    } else {
      m = { grams: num(s.grams) ?? 0, kcal: num(s.kcal) ?? 0, p: num(s.p) ?? 0, c: num(s.c) ?? 0, f: num(s.f) ?? 0, items: [],
        ...scaleExtra(meal || s, e.base.grams, num(s.grams) ?? 0) };
    }
    m.name = String(s.name || '').trim(); m.note = String(s.note || '').trim();
    if (e.isNew) {
      const extra = {}; for (const x of AI_KEYS) if (s[x] !== undefined) extra[x] = s[x];
      addMeal(e.k, { ...extra, ...m, name: m.name || nameFrom(m.items, s.desc), photo: s.photo || null, src: s.src || 'manual' });
      result = null; pending = null; errorKind = null;
    } else {
      meal.items = m.items.map(cleanItem);
      meal.name = cut(m.name, 60) || meal.name; meal.grams = r0(m.grams); meal.kcal = r0(m.kcal);
      meal.p = d1(m.p); meal.c = d1(m.c); meal.f = d1(m.f); meal.note = cut(m.note, 200);
      for (const x of NKEYS) { if (num(m[x]) !== null) meal[x] = d1(m[x]); else delete meal[x]; }
      D.save();
    }
    D.closeModal(); D.toast(t('food.saved')); D.rerender();
  };
  D.act.fdEdDel = () => {
    if (!editing || !editing.id) return;
    const { k, id } = editing;
    const meal = findMeal(k, id);
    D.closeModal();
    D.remove(meals(k), id, { label: meal ? t('food.deleted') + ': ' + meal.name : t('food.deleted') });
  };

  /* ------------------------------------------------------------------ */
  /* me'yor oynasi: kkal · oqsil · uglevod · yog' — to'rtta alohida katak */
  /* Kataklarda hozirgi me'yor turadi; bo'shatilgan makro kkal dan chiqadi. */
  /* ------------------------------------------------------------------ */
  const TG_ROW = [['kcal', 'food.kcal', ''], ['p', 'food.protein', 'g'], ['c', 'food.carbs', 'g'], ['f', 'food.fat', 'g']];
  D.act.fdTargets = () => {
    const cur = D.food.targets();
    const cell = ([k, lab, u]) => `<div class="field fd-ed-f"><label class="field-label" for="fdTg_${k}">${esc(t(lab))}${u ? ` · ${u}` : ''}</label><input type="text" class="inp num" id="fdTg_${k}" inputmode="numeric" autocomplete="off" value="${num(cur[k]) === null ? '' : r0(cur[k])}" placeholder="${TG_LIM[k][0]}–${TG_LIM[k][1]}" data-enter="fdTgSave"></div>`;
    const body = `<div class="fd-ed-grid">${TG_ROW.map(cell).join('')}</div>
      <div class="help">${esc(t('food.tgHint'))}</div>
      ${cur.auto ? `<div class="small muted fd-tg-auto">${esc(t('food.tgAutoNow'))}</div>` : ''}`;
    const actions = [{ label: t('btn.cancel'), act: 'closeModal' }];
    if (!cur.auto && computeTargets()) actions.push({ label: t('food.tgReset'), act: 'fdTgAuto' });
    actions.push({ label: t('btn.save'), act: 'fdTgSave', primary: true });
    D.modal({ title: t('food.tgTitle'), body, actions });
  };
  D.act.fdTgSave = () => {
    const got = {};
    for (const [k] of TG_ROW) {
      const v = numIn(val('fdTg_' + k));
      got[k] = v ? Math.round(D.clamp(v, TG_LIM[k][0], TG_LIM[k][1])) : null;
    }
    if (got.kcal === null && got.p === null && got.c === null && got.f === null) { D.toast(t('food.tgNoNum')); return; }
    const full = D.food.fillTargets(got), tg = F().targets;
    tg.kcal = num(full.kcal); tg.p = num(full.p); tg.c = num(full.c); tg.f = num(full.f);
    tg.auto = false;   // qo'lda kiritildi — avto o'chadi (Sozlamalardagi kabi)
    D.save(); D.closeModal(); D.toast(t('food.tgSaved')); D.rerender();
  };
  D.act.fdTgAuto = () => { F().targets.auto = true; D.food.recalcTargets(); D.save(); D.closeModal(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* ko'rinish                                                           */
  /* ------------------------------------------------------------------ */
  /* Makro uchligi — har biri o'z rangida (A.9): oqsil ko'k, uglevod to'q
     sariq, yog' sariq. Kun kartalarida ham, bitta taom tahlilida ham bir xil.
     Ranglar food.css dagi --fd-p / --fd-c / --fd-f. */
  const MACROS = [['p', 'food.protein', 'var(--fd-p)', 'egg'], ['c', 'food.carbs', 'var(--fd-c)', 'wheat'], ['f', 'food.fat', 'var(--fd-f)', 'droplet']];
  const KC = { p: 4, c: 4, f: 9 };   // 1 g → kkal
  function macroRow(tot) {
    return `<div class="fd-macros fd-macros-flat">${MACROS.map(([x, lab, col, ic]) => `<div class="fd-macro" style="--mc:${col}">
      <div class="fd-macro-lab"><span class="fd-mi">${D.ic(ic, 13)}</span>${esc(t(lab))}</div>
      <div class="fd-macro-val num">${D.fmtNum(r0(tot[x] || 0))}<small> ${esc(t('food.g'))}</small></div>
    </div>`).join('')}</div>`;
  }
  /* Tola · shakar · tuz — makro chiziqlari ostida bitta jimgina qator (to'liq ro'yxat hisobotda). */
  const EXTRA = ['fib', 'sug', 'salt'];
  function extraLine(tot, cls) {
    const parts = EXTRA.filter((x) => num(tot[x]) !== null).map((x) => `${esc(t('food.n.' + x))} <b class="num">${fmtN(x, tot[x])}</b> ${esc(t('food.g'))}`);
    return parts.length ? `<div class="fd-extra${cls ? ' ' + cls : ''}">${parts.join('<span class="sep">·</span>')}</div>` : '';
  }
  /* Moddalar jadvali. «%» — kunlik me'yorga (yoki chegaraga) nisbatan.
     mode 'meal' — bitta taom: chegara moddalari yarmidan oshsa sariq;
     mode 'day' — kun: yetishi kerak bo'lganlar ham rang oladi (kam — sariq, yetdi — yashil). */
  function nutrRows(tot, keys, mode) {
    return keys.filter((x) => num(tot[x]) !== null).map((x) => {
      const n = NUTR[x], ref = D.food.dailyRef(x), v = +tot[x], pct = ref ? (v / ref) * 100 : 0;
      const col = n.need === 'max'
        ? (pct > 100 ? 'var(--danger)' : pct > (mode === 'day' ? 80 : 40) ? 'var(--warning)' : 'var(--success)')
        : mode === 'day' ? (pct >= 100 ? 'var(--success)' : pct >= 50 ? 'var(--info)' : 'var(--warning)') : 'var(--info)';
      return `<div class="fd-nut">
        <span class="fd-nut-l">${esc(t('food.n.' + x))}${n.need === 'max' ? ` <span class="fd-nut-lim">${esc(t('food.limit'))}</span>` : ''}</span>
        <span class="fd-nut-v num">${fmtN(x, v)}<small> ${n.u}</small></span>
        <span class="bar thin fd-nut-bar"><i class="bar-fill" style="width:${D.clamp(pct, 0, 100).toFixed(0)}%;background:${col}"></i></span>
        <span class="fd-nut-p num" title="${esc(t('food.pctDay', { n: r0(pct) }))}">${r0(pct)}%</span>
      </div>`;
    }).join('');
  }
  function nutrTable(tot, mode) {
    const a = nutrRows(tot, G_LIM, mode), b = nutrRows(tot, G_MICRO, mode);
    if (!a && !b) return '';
    return `${a ? `<div class="fd-nut-g">${esc(t('food.g.lim'))}</div>${a}` : ''}${b ? `<div class="fd-nut-g">${esc(t('food.g.micro'))}</div>${b}` : ''}`;
  }
  // <details> — ochiq/yopiqligi brauzerning o'zida, qayta chizishga bog'liq emas
  function detailsBlock(tot, mode, open, label) {
    const body = nutrTable(tot, mode);
    return body ? `<details class="fd-det"${open ? ' open' : ''}><summary>${D.ic('list', 16)} ${esc(t(label || 'food.details'))}</summary><div class="fd-det-b">${body}</div></details>` : '';
  }
  /* 10 ballik baho (6.1-band): ≥8 yashil, 5–7 sariq, <5 qizil. Sinf nomi
     shu yerda tanlanadi — holatdagi qiymat sinfga o'zi tushmaydi. */
  const scoreCls = (s) => (s >= 8 ? 'good' : s >= 5 ? 'warn' : 'bad');
  function chips(o) {
    const out = [];
    if (num(o.score) !== null) { const s = r0(o.score); out.push(`<span class="pill ${scoreCls(s)}">${esc(t('food.score', { n: s }))}</span>`); }
    if (PROC.includes(o.proc)) out.push(`<span class="pill">${esc(t('food.proc.' + o.proc))}</span>`);
    if (o.rough) out.push(`<span class="pill">${esc(t('food.rough'))}</span>`);
    return out.length ? `<div class="fd-chips">${out.join('')}</div>` : '';
  }
  const asmLine = (s) => (s ? `<div class="fd-asm">${D.ic('eye', 16)}<span><b>${esc(t('food.asm'))}:</b> ${esc(s)}</span></div>` : '');
  // maslahat va tavsiyalar holatdan keladi: ro'yxat bo'lmasa (buzilgan yozuv) tashlab ketiladi
  function adviceBlock(o) {
    const tips = Array.isArray(o.tips) ? o.tips.filter((s) => typeof s === 'string' && s) : [];
    if (!o.advice && !tips.length) return '';
    return `<div class="advice tint fd-advice">${D.ic('sparkles', 18)}<div class="grow">${o.advice ? `<div>${esc(o.advice)}</div>` : ''}${tips.length ? `<ul class="fd-tips">${tips.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</div></div>`;
  }
  // tarkib — bitta taomdan iborat bo'lsa nomning o'zi va makro qatori yetarli, takrorlash ortiqcha
  const partsBlock = (items) => (Array.isArray(items) && items.length > 1
    ? `<div class="fd-parts">${items.map((i) => `<div class="fd-part">
        <div class="fd-part-top"><span class="grow">${esc(i.name)}</span><span class="num">${r0(i.grams)} ${esc(t('food.g'))}<span class="sep">·</span>${D.fmtNum(r0(i.kcal))} ${esc(t('food.kcal'))}</span></div>
        <div class="fd-part-mac num">${esc(t('food.pS'))} ${fmt1(i.p)} · ${esc(t('food.cS'))} ${fmt1(i.c)} · ${esc(t('food.fS'))} ${fmt1(i.f)} ${esc(t('food.g'))}</div>
      </div>`).join('')}</div>`
    : '');

  /* KALORIYA — bosh karta. Katta raqam yeyilgani emas, QOLGANI: «860 kkal
     qoldi». Oshib ketgan bo'lsa ortiqchasi, qizil: «320 kkal oshdi». Me'yor
     yo'q bo'lsa qoldiq ham yo'q — unda yeyilgani yoziladi.
     Chiziq: yeyilgan kaloriya me'yorga nisbatan, ichi makro ulushlariga
     bo'lingan (oqsil va uglevod 4, yog' 9 kkal/g); qolgani kulrang.
     Butun karta bosiladi — me'yor oynasi ochiladi (fdTargets). */
  function summary(k) {
    const tg = D.food.targets(), tot = D.food.dayTotals(k) || { kcal: 0, p: 0, c: 0, f: 0 };
    const over = !!tg.kcal && tot.kcal > tg.kcal;
    const big = !tg.kcal ? tot.kcal : over ? tot.kcal - tg.kcal : tg.kcal - tot.kcal;
    const word = t(!tg.kcal ? 'food.h.eaten' : over ? 'food.h.over' : 'food.h.left');
    const burn = burned(k), sub = [];
    if (tg.kcal) sub.push(`${esc(t('food.h.ate'))} <b>${D.fmtNum(tot.kcal)}</b>`);
    if (burn !== null) sub.push(`${esc(t('food.h.burn'))} <b>${D.fmtNum(burn)}</b>`);
    const mk = MACROS.map(([x]) => (+tot[x] || 0) * KC[x]), sum = D.sum(mk);
    const fill = tg.kcal ? D.clamp(tot.kcal / tg.kcal, 0, 1) : tot.kcal ? 1 : 0;
    // makrosiz yozilgan taom (faqat kkal) — chiziq bitta kulrang bo'lak bilan to'ladi
    const bar = sum ? MACROS.map(([x], n) => (mk[n] > 0 ? `<i class="${x}" style="width:${((mk[n] / sum) * fill * 100).toFixed(1)}%"></i>` : '')).join('')
      : fill ? `<i class="k" style="width:${(fill * 100).toFixed(1)}%"></i>` : '';
    const leg = sum ? `<div class="fd-leg">${MACROS.map(([x, lab], n) => `<span><i class="dot ${x}"></i>${esc(t(lab))} <b class="num">${Math.round((mk[n] / sum) * 100)}%</b></span>`).join('')}</div>` : '';
    const note = !tot.kcal ? t('food.h.none') : over ? t('food.h.noteOver') : t(tg.kcal ? 'food.h.note' : 'food.h.noteNoTg');
    return `<section class="card hero hero--ovqat fd-hero${over ? ' over' : ''}" data-act="fdTargets" role="button" tabindex="0" aria-label="${esc(`${D.fmtNum(big)} ${word} · ${t('food.targets')}`)}">
      <div class="card-head"><h2 class="title">${esc(t('food.kcalWord'))}</h2><span class="hero-pill num">${tg.kcal ? esc(t('food.h.target', { n: D.fmtNum(tg.kcal) })) : esc(t('food.setTarget'))}</span></div>
      <div class="fd-hero-big"><b class="num">${D.fmtNum(big)}</b><span>${esc(word)}</span></div>
      ${sub.length ? `<p class="fd-hero-sub num">${sub.join(' · ')}</p>` : ''}
      <div class="fd-stack" aria-hidden="true">${bar}</div>
      ${leg}<p class="fd-fine">${esc(note)}</p>
    </section>`;
  }

  /* Oddiy qoida bo'yicha maslahat — AI xulosasi yo'q paytda: kaloriya oshgan
     bo'lsa shu, biror makro oshgan bo'lsa shu, aks holda me'yoridan eng
     orqada qolgan makro. Hammasi 90 % dan o'tgan bo'lsa — maqtov. */
  function dayAdvice(tot, tg) {
    if (!tot) return null;
    const ov = D.food.overBy(tot, tg);
    if (ov && ov.kcal) return ['warn', 'alert', t('food.adv.kcalOver', { n: D.fmtNum(ov.kcal) })];
    if (ov) { const x = Object.keys(ov)[0]; return ['warn', 'alert', t('food.adv.over', { m: t(OVER_LAB[x]), n: D.fmtNum(ov[x]) })]; }
    let low = null;
    for (const [x] of MACROS) {
      const max = num(tg[x]);
      if (!max) continue;
      const r = r0(tot[x]) / max;
      if (!low || r < low.r) low = { x, r, left: r0(max) - r0(tot[x]) };
    }
    if (!low) return null;
    return low.r >= 0.9 ? ['tint', 'check', t('food.adv.ok')] : ['tint', 'sparkles', t('food.adv.' + low.x, { n: D.fmtNum(low.left) })];
  }
  /* AI kun xulosasini O'QISH. notes() yo'q maydonni yaratib qo'yadi — u
     yozish uchun; chizish holatga tegmasligi kerak, shuning uchun alohida. */
  function noteOf(k) {
    const N = (D.S.food || {}).notes, x = N && typeof N === 'object' && !Array.isArray(N) ? N[k] : null;
    return x && typeof x.text === 'string' && x.text.trim() ? x : null;
  }
  /* Matn AI'dan keladi va holatda saqlanadi: D.ai.md avval esc() qiladi,
     keyin faqat o'zi yozgan teglarni qo'shadi. ai.js yuklanmagan bo'lsa — oddiy matn. */
  const aiText = (s) => (D.ai && D.ai.md ? D.ai.md(s) : `<p>${esc(s)}</p>`);

  /* Oqsil, uglevod, yog' — uch chiziq: «52 / 170 g», ostida «118 g qoldi».
     90 % dan o'tsa «deyarli to'ldi» (to'q sariq izoh), oshsa chiziq ham,
     izoh ham qizil.
     Maslahat qutisi (6.1-band): shu kun uchun AI xulosasi bo'lsa — o'sha
     (S.food.notes[kun], fdDayAi yozadi), bo'lmasa oddiy qoida. Qoida faqat
     bugungi kunda: o'tgan kun uchun «yana N g kerak» deyish ma'nosiz.
     Qutining ostidagi tugma xulosani so'raydi yoki yangilaydi. */
  function macroCard(k) {
    const tg = D.food.targets(), tot = D.food.dayTotals(k), v0 = tot || { p: 0, c: 0, f: 0 };
    const rows = MACROS.map(([x, lab]) => {
      const v = r0(v0[x] || 0), max = num(tg[x]) ? r0(tg[x]) : null;
      let cls = '', note = '';
      if (max) {
        const left = max - v;
        if (left < 0) { cls = ' over'; note = t('food.m.over', { n: D.fmtNum(-left) }); }
        else if (!left) { cls = ' near'; note = t('food.m.full'); }
        else if (v / max >= 0.9) { cls = ' near'; note = t('food.m.near', { n: D.fmtNum(left) }); }
        else note = t('food.m.left', { n: D.fmtNum(left) });
      }
      return `<div class="fd-m ${x}${cls}"><div class="fd-m-h"><b>${esc(t(lab))}</b><span class="num"><b>${D.fmtNum(v)}</b>${max ? ` / ${D.fmtNum(max)}` : ''} ${esc(t('food.g'))}</span></div>
        ${max ? `<span class="bar md"><i class="bar-fill" style="width:${D.clamp((v / max) * 100, 0, 100).toFixed(0)}%"></i></span><p class="num">${esc(note)}</p>` : ''}</div>`;
    }).join('');
    // xulosa faqat taomi bor kunda: taomlar o'chirilsa eski xulosa ham ko'rinmaydi
    const note = tot ? noteOf(k) : null, busyAi = dayAi === k;
    const canAi = !!tot && !!(D.ai && D.ai.ask && D.ai.available && D.ai.available());
    const rule = !note && !busyAi && k === D.today() ? dayAdvice(tot, tg) : null;
    const box = busyAi ? `<div class="advice tint fd-adv fd-ai-busy"><span class="fd-busy-row">${D.ic('sparkles', 18)}<span>${esc(t('food.rep.aiBusy'))}</span><span class="ai-dots"><i></i><i></i><i></i></span></span></div>`
      : note ? `<div class="advice tint fd-adv fd-ai">${D.ic('sparkles', 18)}<div class="grow ai-body fd-ai-b">${aiText(note.text)}</div></div>`
      : rule ? `<div class="advice ${rule[0]} fd-adv">${D.ic(rule[1], 18)}<span>${esc(rule[2])}</span></div>` : '';
    return `<section class="card fd-mc" data-k="fd-mc">
      <div class="card-head"><h2 class="title">${esc(t('food.m.title'))}</h2></div>
      ${rows}${extraLine(tot || {}, 'solo')}
      ${box}
      ${dayAiErr && !busyAi ? `<div class="advice bad fd-ai-err">${D.ic('alert', 18)}<span>${esc(dayAiErr)}</span></div>` : ''}
      ${canAi && !busyAi ? `<button type="button" class="btn sm ghost fd-ai-btn" data-act="fdDayAi">${D.ic(note ? 'refresh' : 'sparkles', 16)} ${esc(t(note ? 'food.rep.aiAgain' : 'food.rep.ai'))}</button>` : ''}
    </section>`;
  }

  /* «Nima yedingiz?» — matn asosiy, kamera ikkinchi. Maydon bir qatorli
     ko'rinadi, lekin <textarea>: uzun tavsif («1 kosa osh, 2 bo'lak non…»)
     sig'adi va maydon o'zi o'sadi; Enter — yuborish, Shift+Enter — yangi qator
     (pastdagi keydown). Kamera tugmasi `capture`siz: telefonda brauzer o'zi
     «kamera yoki galereya» deb so'raydi, ya'ni bitta tugma ikkala yo'lni ham
     ochadi. Rasm bilan birga yozilgan matn — izoh bo'lib ketadi. Yuborish
     tugmasi yozadigan narsa bo'lgandagina qora — bo'sh maydonda kulrang va o'chiq. */
  function capture() {
    const off = busy ? 'disabled' : '';
    const ready = !!draft.trim() && !busy;
    return `<section class="card fd-cap" data-k="fd-cap">
      <div class="card-head"><h2 class="title"><label for="fdText">${esc(t('food.ask'))}</label></h2></div>
      <div class="fd-cap-row">
        <textarea class="ta fd-text" id="fdText" rows="1" maxlength="600" placeholder="${esc(t('food.in.ph'))}" data-input="fdDraft" autocomplete="off" enterkeyhint="send" ${off}>${esc(draft)}</textarea>
        <label class="fd-cam" title="${esc(t('food.camera'))}">${D.ic('camera', 22)}<input type="file" accept="image/*" class="fd-pick" aria-label="${esc(t('food.camera'))}" data-change="fdPhoto" ${off}></label>
        <button type="button" class="fd-send${ready ? '' : ' ghost'}" data-act="fdSend" aria-label="${esc(t('food.send'))}" ${ready ? '' : 'disabled'}>${D.ic('arrowR', 22)}</button>
      </div>
      <p class="fd-fine">${esc(t('food.in.help'))} <button type="button" class="fd-link" data-act="fdAddManual">${esc(t('food.manual'))}</button></p>
    </section>`;
  }

  /* Tahlil kartasi — to'rt holat: kutish, xato (qayta urinish / qo'lda /
     sozlamalar), «ovqat topilmadi», natija. Natijada: baho va ishonch pillari,
     katta kkal, makrolar, «AI shunday tushundi», tarkib, moddalar, maslahat,
     bitta gap bilan tuzatish qatori va Saqlash / Tahrirlash / Bekor. */
  const previewImg = (src) => (src ? `<img class="fd-preview" src="${esc(src)}" alt="">` : '');
  function analysisCard() {
    if (busy && pending) {
      const said = pending.fix || pending.text;
      return `<section class="card fd-res fd-busy" data-k="fd-busy">
        ${previewImg(pending.preview)}
        <div class="fd-busy-row">${D.ic('sparkles', 18)}<span>${esc(t(pending.fix ? 'food.fixing' : 'food.busy'))}</span><span class="ai-dots"><i></i><i></i><i></i></span></div>
        ${said ? `<p class="fd-fine">${esc(cut(said, 160))}</p>` : ''}
      </section>`;
    }
    if (errorKind) {
      return `<section class="card fd-res" data-k="fd-err"><div class="advice bad">${D.ic('alert', 18)}<span>${esc(errText(errorKind))}</span></div>
        <div class="fd-res-acts">
          ${errorKind === 'ai_not_configured' || errorKind === 'bad_key' ? `<button class="btn sm ghost" data-act="go" data-view="settings">${D.ic('gear', 16)} ${esc(t('food.toSettings'))}</button>` : ''}
          ${(errorKind === 'ai_failed' || errorKind === 'rate') && pending ? `<button class="btn sm ghost" data-act="fdRetry">${D.ic('refresh', 16)} ${esc(t('food.retry'))}</button>` : ''}
          <button class="btn sm" data-act="fdManual">${D.ic('edit', 16)} ${esc(t('food.manual'))}</button>
          <button class="btn icon" data-act="fdDismiss" aria-label="${esc(t('btn.close'))}">${D.ic('x', 16)}</button>
        </div></section>`;
    }
    if (!result) return '';
    const r = result;
    // model ovqat topmadi — nol raqamlarni ko'rsatishdan ko'ra shuni aytgan yaxshi
    if (!r.items.length && !r.total.kcal) {
      return `<section class="card fd-res" data-k="fd-none">
        ${previewImg(r.preview)}
        <div class="advice warn">${D.ic('info', 18)}<span>${esc(r.advice || t('food.notFood'))}</span></div>
        <div class="fd-res-acts">
          <button class="btn sm ghost" data-act="fdManual">${D.ic('edit', 16)} ${esc(t('food.manual'))}</button>
          <button class="btn icon" data-act="fdDismiss" aria-label="${esc(t('food.dismiss'))}">${D.ic('x', 16)}</button>
        </div></section>`;
    }
    const rough = r.confidence !== null && r.confidence < 0.45;
    return `<section class="card fd-res" data-k="fd-result">
      <div class="card-head"><h2 class="title">${esc(t('food.result'))}</h2><span class="ico sleep fd-res-ic">${D.ic('sparkles', 18)}</span></div>
      ${previewImg(r.preview)}
      <div class="fd-res-name">${esc(r.name)}</div>
      ${chips({ score: r.score, proc: r.proc, rough })}
      <div class="fd-big"><b class="num">${D.fmtNum(r.total.kcal)}</b><span>${esc(t('food.kcal'))}</span>${r.grams ? `<span class="fd-big-g num">${D.fmtNum(r.grams)} ${esc(t('food.g'))}</span>` : ''}</div>
      ${macroRow(r.total)}
      ${asmLine(r.asm)}
      ${partsBlock(r.items)}
      ${detailsBlock(r.total, 'meal', false)}
      ${adviceBlock(r)}
      <div class="fd-fix"><input class="inp" id="fdFix" maxlength="300" placeholder="${esc(t('food.fixPh'))}" aria-label="${esc(t('food.fix'))}" data-enter="fdFix" autocomplete="off">
        <button class="btn ghost" data-act="fdFix">${D.ic('edit', 16)} ${esc(t('food.fix'))}</button></div>
      <div class="fd-res-acts">
        <button class="btn sm" data-act="fdSaveRes">${D.ic('check', 16)} ${esc(t('food.save'))}</button>
        <button class="btn sm ghost" data-act="fdEditRes">${D.ic('edit', 16)} ${esc(t('food.edit'))}</button>
        <button class="btn icon" data-act="fdDismiss" aria-label="${esc(t('food.dismiss'))}">${D.ic('x', 16)}</button>
      </div></section>`;
  }

  /* Saqlangan taomni bosganda avval o'sha tushunarli ko'rinish ochiladi —
     rasm, katta kaloriya, makrolar, tarkib, moddalar. Tahrirlash formasi undan keyin. */
  D.act.fdView = (el) => {
    const k = el.dataset.day || key(), m = findMeal(k, el.dataset.id);
    if (!m) return;
    const when = timeOf(m, k);
    const body = `${photoOk(m.photo) ? `<img class="fd-preview" src="/api/food/photo/${esc(m.photo)}" alt="">` : ''}
      ${chips(m)}
      <div class="fd-big"><b class="num">${D.fmtNum(r0(m.kcal))}</b><span>${esc(t('food.kcal'))}</span>${m.grams ? `<span class="fd-big-g num">${D.fmtNum(r0(m.grams))} ${esc(t('food.g'))}</span>` : ''}</div>
      ${macroRow(m)}
      ${asmLine(m.asm)}
      ${partsBlock(m.items)}
      ${detailsBlock(m, 'meal', true)}
      ${adviceBlock(m)}
      ${m.desc && m.desc !== m.name ? `<div class="fd-note"><b>${esc(t('food.youWrote'))}:</b> ${esc(m.desc)}</div>` : ''}
      ${m.note ? `<div class="fd-note">${esc(m.note)}</div>` : ''}
      ${when ? `<div class="fd-when">${esc(t('food.time'))} ${esc(when)}</div>` : ''}`;
    D.modal({
      title: m.name, body, noFocus: true,
      actions: [{ label: t('btn.delete'), act: 'fdViewDel', danger: true, data: { day: k, id: m.id } },
                { label: t('food.edit'), act: 'fdToEdit', primary: true, data: { day: k, id: m.id } }],
    });
  };
  D.act.fdToEdit = (el) => { const k = el.dataset.day, id = el.dataset.id; D.closeModal(); openEdit(k, id); };
  D.act.fdViewDel = (el) => {
    const k = el.dataset.day, id = el.dataset.id, m = findMeal(k, id);
    D.closeModal();
    D.remove(meals(k), id, { label: m ? t('food.deleted') + ': ' + m.name : t('food.deleted') });
  };

  /* Kunning ovqatlari — bitta kartada qatorlar: vaqt, nom, makro qatori,
     o'ngda kkal va (AI baholagan bo'lsa) 10 ballik baho pilli. Tartib kun
     bo'yicha (ertalabdan kechga). Qator bosilsa to'liq ko'rinish ochiladi
     (fdView), tahrir undan keyin. */
  function mealRow(m, k) {
    const time = timeOf(m, k), sc = num(m.score) !== null ? r0(m.score) : null;
    return `<li><button type="button" class="fd-meal" data-k="${esc(m.id)}" data-act="fdView" data-id="${esc(m.id)}" data-day="${esc(k)}">
      <span class="fd-meal-t num">${esc(time || '—')}</span>
      ${photoOk(m.photo) ? `<img class="fd-meal-ph" src="/api/food/photo/${esc(m.photo)}" alt="" width="40" height="40" loading="lazy">` : ''}
      <span class="fd-meal-b"><b>${esc(m.name)}</b><span class="num">${MACROS.map(([x, lab]) => `${esc(t(lab))} ${D.fmtNum(r0(m[x]))}`).join(' · ')} ${esc(t('food.g'))}</span></span>
      <span class="fd-meal-k num"><span><b>${D.fmtNum(r0(m.kcal))}</b> ${esc(t('food.kcal'))}</span>${sc !== null ? `<span class="pill ${scoreCls(sc)} fd-meal-sc" title="${esc(t('food.score', { n: sc }))}">${sc}/10</span>` : ''}</span>
    </button></li>`;
  }
  function mealList(k) {
    const ms = mealsSorted(k), kcal = r0(D.sum(ms, (m) => +m.kcal || 0));
    return `<section class="card fd-meals">
      <div class="card-head"><h2 class="title">${esc(t(k === D.today() ? 'food.ml.today' : 'food.ml.day'))}</h2>
        ${ms.length ? `<span class="fd-side num">${esc(t('food.ml.sum', { n: ms.length, k: D.fmtNum(kcal) }))}</span>` : ''}</div>
      ${ms.length ? `<ul class="fd-ml">${ms.map((m) => mealRow(m, k)).join('')}</ul>`
        : `<div class="fd-none"><span class="ico coral">${D.ic('apple', 19)}</span><div><b>${esc(t('food.emptyT'))}</b><p>${esc(t('food.emptyS'))}</p></div></div>`}
    </section>`;
  }


  /* ------------------------------------------------------------------ */
  /* AI kun xulosasi: odamning o'z AI'sidan kun bo'yicha maslahat         */
  /* (S.food.notes[kun] = { text, ts }). «Oqsil, uglevod, yog'» kartasining */
  /* maslahat qutisida ko'rinadi; tugmasi ham o'sha yerda.                */
  /* ------------------------------------------------------------------ */
  const N_EN = { fib: 'fibre', sug: 'sugars', satf: 'saturated fat', salt: 'salt', chol: 'cholesterol', k: 'potassium', ca: 'calcium', fe: 'iron',
    mg: 'magnesium', zn: 'zinc', va: 'vitamin A', vc: 'vitamin C', vd: 'vitamin D', b12: 'vitamin B12', fol: 'folate' };
  const LANG_EN = { uz: 'Uzbek (Latin script)', uzk: 'Uzbek (Cyrillic script)', ru: 'Russian' };
  const DAY_SYS = 'You are a friendly, practical dietitian reviewing one day of a person\'s food log. Write in {lang}. '
    + 'Be brief: at most 5 short bullet points in plain everyday words, no tables, no headings. Cover how the day compares with the targets, '
    + 'which nutrients are clearly short and which are over the limit, and concrete foods with rough amounts to fix it — for the rest of today '
    + 'if the day is still going, otherwise for tomorrow. Prefer foods that are easy to find in Uzbekistan. Do not repeat the numbers back.';
  function dayPrompt(k) {
    const tg = D.food.targets(), tot = D.food.dayTotals(k) || { kcal: 0, p: 0, c: 0, f: 0, n: 0, detail: 0 }, pr = D.S.profile || {};
    const age = D.profileAge(), burn = burned(k), L = [];
    L.push(`Date: ${k}${k === D.today() ? ` (today, local time ${hhmm()})` : ' (the day is over)'}.`);
    L.push(`Person: ${pr.sex === 'f' ? 'female' : pr.sex === 'm' ? 'male' : 'sex unknown'}${age ? `, ${age} years` : ''}${pr.weightKg ? `, ${pr.weightKg} kg` : ''}; goal: ${GOAL_EN[pr.goal] || GOAL_EN.keep}.`);
    if (tg.kcal) L.push(`Daily targets: ${tg.kcal} kcal, protein ${tg.p} g, carbs ${tg.c} g, fat ${tg.f} g.`);
    if (burn !== null) L.push(`Energy burned (WHOOP): ${burn} kcal.`);
    L.push('Meals:');
    for (const m of mealsSorted(k)) {
      L.push(`- ${timeOf(m, k) ? timeOf(m, k) + ' ' : ''}${m.name}${m.grams ? ` ${r0(m.grams)} g` : ''}: ${r0(m.kcal)} kcal, protein ${r0(m.p)} / carbs ${r0(m.c)} / fat ${r0(m.f)} g${m.desc && m.desc !== m.name ? ` (user wrote: "${cut(m.desc, 160)}")` : ''}`);
    }
    L.push(`Totals: ${tot.kcal} kcal, protein ${tot.p} g, carbs ${tot.c} g, fat ${tot.f} g.`);
    const nl = NKEYS.filter((x) => num(tot[x]) !== null).map((x) => {
      const ref = D.food.dailyRef(x), u = NUTR[x].u;
      return `${N_EN[x]} ${fmtN(x, tot[x])} ${u} (${r0((tot[x] / ref) * 100)}% of the daily ${NUTR[x].need === 'max' ? 'limit' : 'need'} ${ref} ${u})`;
    });
    if (nl.length) L.push(`Other nutrients: ${nl.join('; ')}.${tot.detail < tot.n ? ` Only ${tot.detail} of ${tot.n} meals have full nutrient data.` : ''}`);
    return L.join('\n');
  }
  D.act.fdDayAi = async () => {
    const k = key();
    if (dayAi || !D.ai || !D.ai.ask) return;
    dayAi = k; dayAiErr = ''; D.rerender();
    try {
      const text = await D.ai.ask([{ role: 'user', content: dayPrompt(k) }], DAY_SYS.replace('{lang}', LANG_EN[D.lang()] || LANG_EN.uz), { maxTokens: 1400, kind: 'food:day' });
      const N = notes();
      N[k] = { text: String(text || '').slice(0, 4000), ts: Date.now() };
      // eski xulosalar blobni to'ldirib yubormasin — so'nggi 14 kun qoladi
      const old = D.addDays(D.today(), -14);
      for (const d of Object.keys(N)) if (d < old) delete N[d];
      D.save();
    } catch (e) {
      const kind = errKind(e);
      dayAiErr = kind === 'ai_failed' ? t('food.rep.aiFail', { m: cut((e && e.message) || e, 120) }) : errText(kind);
    }
    dayAi = null; D.rerender();
  };

  /* Kunlik hisobot: hamma moddalar me'yorga nisbatan va qisqa hukm
     («Kam: D vitamini, kalsiy · Ortiqcha: tuz»). To'liq jadval — ochiladigan
     qator ichida. Taomsiz kunda karta yo'q. */
  function reportCard(k) {
    const tot = D.food.dayTotals(k);
    if (!tot) return '';
    // Bugun kun hali tugamagan: soat 13 da me'yorning yarmi yeyilmagani «kam» degani emas.
    // Kutilgan ulush 07:00 dan 21:00 gacha chiziqli o'sadi; kam — kutilganning yarmidan past.
    const now = D.nowTz(), share = k === D.today() ? D.clamp((now.h + now.min / 60 - 7) / 14, 0.25, 1) : 1;
    const lowP = [], overP = [];
    if (tot.detail) {
      for (const x of NKEYS) {
        if (num(tot[x]) === null) continue;
        const pct = (tot[x] / D.food.dailyRef(x)) * 100;
        if (NUTR[x].need === 'max' && pct > 100) overP.push([x, pct]);
        if (NUTR[x].need === 'min' && pct < 50 * share) lowP.push([x, pct]);
      }
    }
    // eng keskinlari oldinda; uzun ro'yxat o'qilmaydi — beshtasi va «+N»
    const names = (arr) => arr.slice(0, 5).map(([x]) => t('food.n.' + x)).join(', ') + (arr.length > 5 ? ` +${arr.length - 5}` : '');
    lowP.sort((a, b) => a[1] - b[1]); overP.sort((a, b) => b[1] - a[1]);
    const row = (cls, label, text) => `<div class="fd-rep-row ${cls}"><i class="dot"></i><span>${label ? `<b>${esc(t(label))}:</b> ` : ''}${esc(text)}</span></div>`;
    const verdict = !tot.detail ? `<p class="fd-fine fd-rep-none">${esc(t('food.rep.none'))}</p>`
      : `${overP.length ? row('bad', 'food.rep.over', names(overP)) : ''}
         ${lowP.length ? row('warn', 'food.rep.low', names(lowP)) : ''}
         ${!overP.length && !lowP.length ? row('good', '', t('food.rep.ok')) : ''}
         ${tot.detail < tot.n ? `<p class="fd-fine">${esc(t('food.rep.partial', { n: tot.n - tot.detail }))}</p>` : ''}`;
    return `<section class="card fd-rep" data-k="fd-rep">
      <div class="card-head"><h2 class="title">${esc(t('food.report'))}</h2></div>
      ${verdict}
      ${detailsBlock(tot, 'day', false, 'food.rep.all')}
    </section>`;
  }

  /* So'nggi 7 kun: kkal ustunlari, uzuq chiziq — me'yor. Me'yorda — yashil,
     oshgan — marjon, bugun (hali tugamagan) — och ko'k. Kunni tanlash shu
     yerda: ustun bosilsa o'sha kun ochiladi (fdGo). Juda eski kun ochiq
     bo'lsa oyna o'sha kun atrofiga suriladi. */
  const kShort = (v) => (v >= 1000 ? `${D.fmtNum(v / 1000, 1)}k` : D.fmtNum(v));
  function weekCard(k) {
    const tg = D.food.targets(), td = D.today(), WS = t('weekdaysShort');
    const end = k < D.addDays(td, -6) ? D.addDays(k, 3) : td;
    const days = D.lastDays(7, end);
    const tots = days.map((d) => D.food.dayTotals(d));
    const vals = tots.map((x) => (x ? x.kcal : 0));
    const eaten = vals.filter((v) => v > 0);
    const avg = eaten.length ? Math.round(D.sum(eaten) / eaten.length) : null;
    const max = Math.max(1, ...vals, tg.kcal || 0);
    const cols = days.map((d, n) => {
      const v = vals[n], ov = v ? D.food.overBy(tots[n], tg) : null;
      const cls = !v ? 'na' : ov ? 'over' : d === td ? 'now' : 'ok';
      const lab = `${D.fmtDate(d, 'weekday')}: ${v ? `${D.fmtNum(v)} ${t('food.kcal')}` : '—'}`;
      return `<button type="button" class="fd-wk-c ${cls}${d === k ? ' on' : ''}${d === td ? ' today' : ''}" data-act="fdGo" data-day="${esc(d)}" aria-pressed="${d === k}" aria-label="${esc(lab)}" ${d > td ? 'disabled' : ''}>
        <span class="fd-wk-t"><i style="height:${v ? Math.max(4, (v / max) * 100).toFixed(1) : 0}%">${v ? `<b class="num">${esc(kShort(v))}</b>` : ''}</i></span>
        <span class="fd-wk-d">${esc(d === td ? t('common.today') : WS[D.dowOf(d)])}</span></button>`;
    }).join('');
    return `<section class="card fd-week">
      <div class="card-head"><h2 class="title">${esc(t('food.week'))}</h2>${avg !== null ? `<span class="fd-side num">${esc(t('food.wk.avg', { n: D.fmtNum(avg) }))}</span>` : ''}</div>
      <div class="fd-wk"${tg.kcal ? ` style="--t:${(tg.kcal / max).toFixed(4)}"` : ''}>${tg.kcal ? '<i class="fd-wk-line"></i>' : ''}${cols}</div>
      ${eaten.length ? `<div class="fd-wk-leg"><span><i class="dot ok"></i>${esc(t('food.wk.in'))}</span><span><i class="dot over"></i>${esc(t('food.wk.over'))}</span><span><i class="dot now"></i>${esc(t('food.wk.today'))}</span>${tg.kcal ? `<span class="num"><i class="ln"></i>${esc(t('food.wk.target', { n: D.fmtNum(tg.kcal) }))}</span>` : ''}</div>`
        : `<p class="fd-fine">${esc(t('food.weekEmpty'))}</p>`}
    </section>`;
  }
  D.act.fdGo = (el) => {
    const d = el.dataset.day;
    if (!d || d > D.today()) return;
    D.ui.viewDate = d === D.today() ? null : d;
    D.saveUi(); D.rerender();
  };


  D.on('day:changed', () => { if (D.current() === 'health') D.rerender(); });

  /* Ovqat alohida bo'lim emas — Tana bo'limining birinchi sahifasi.
     Tartib: Kaloriya → makrolar (+ maslahat / AI xulosasi) → suv →
     «Nima yedingiz?» → tahlil → kunning ovqatlari → kunlik hisobot → so'nggi 7 kun. */
  D.food.page = (day) => {
    const td = D.today();
    if (D.ui.viewDate && D.ui.viewDate >= td) { D.ui.viewDate = null; D.saveUi(); }
    const k = day || key();
    return safe(() => summary(k)) + safe(() => macroCard(k)) + safe(() => waterCard(k)) + safe(() => capture())
      + safe(() => analysisCard()) + safe(() => mealList(k)) + safe(() => reportCard(k)) + safe(() => weekCard(k));
  };

  document.addEventListener('keydown', (ev) => {
    const el = ev.target;
    if (!el || !el.matches) return;
    // «Nima yedingiz?» maydonida Enter — yuborish (Shift+Enter — yangi qator)
    if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && el.matches('#fdText')) { ev.preventDefault(); D.act.fdSend(); return; }
    // Kaloriya kartasi <section role="button"> — Enter/Space ni o'zi tutmaydi (core faqat bosishni kuzatadi)
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    if (!el.matches('.fd-hero[data-act]')) return;
    ev.preventDefault(); el.click();
  });
})();
