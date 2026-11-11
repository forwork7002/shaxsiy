/* =====================================================================
   Dash — Молия (finance). «Yorug' qog'oz» (2026-10-09).
   Ikki bo'lim, bitta savol: «pulim qayerga ketyapti va qancha qoldi?»
     Oy      — yozish kartasi (doim ochiq, eng tepada) · oy natijasi (halqa) ·
               pul qayerga ketdi · yozuvlar
     Hisoblar — jami qoldiq (bo'lakli halqa) · hisoblar · doimiy to'lovlar
   Oy sarlavhadagi pill orqali tanlanadi (view.topRight → pastki oyna).
   Bu fayldagi 2026-10-09 o'zgarishi faqat KO'RINISH: holat shakli, summa
   tahlili va har bir yozish amali (D.act.fin*) avvalgidek ishlaydi.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* strings                                                             */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'fin.tab.month': 'Oy', 'fin.tab.accounts': 'Hisoblar',
      'fin.income': 'Kirim', 'fin.expense': 'Chiqim', 'fin.left': 'Qoldi',
      'fin.daysLeft': '{n} kun qoldi', 'fin.monthOver': 'Oy tugagan', 'fin.monthRes': 'Oy natijasi',
      'fin.pickMonth': 'Oyni tanlash', 'fin.thisMonth': 'Shu oyga qaytish', 'fin.done': 'Tayyor',
      'fin.spentOf': 'daromaddan sarflandi', 'fin.noIncome': 'kirim yozilmagan',
      'fin.adv.ok': 'Me‘yorida: oy {m}% o‘tdi, daromadning {s}% sarflandi.',
      'fin.adv.fast': 'Tez sarflayapsiz: oy {m}% o‘tdi, daromadning esa {s}% ketdi.',
      'fin.adv.endLeft': 'Shu tezlikda oy oxirida {v} qoladi.', 'fin.adv.endShort': 'Shu tezlikda oy oxirigacha {v} yetmaydi.',
      'fin.adv.neg': 'Bu oy chiqim kirimdan {v} ko‘p.',
      'fin.adv.noInc': 'Bu oy kirim yozilmagan — ulush chiqishi uchun kirimni ham yozing.',
      'fin.adv.past': 'Oy yakuni: daromadning {s}% sarflandi, {v} qoldi.', 'fin.adv.pastNeg': 'Oy yakuni: chiqim kirimdan {v} ko‘p bo‘ldi.',
      'fin.t.day': 'Kuniga', 'fin.t.dayN': 'o‘rtacha', 'fin.t.end': 'Oy oxiri', 'fin.t.endN': 'taxminiy chiqim', 'fin.t.bills': 'To‘lovlar', 'fin.t.billsN': 'hali to‘lanadi',
      'fin.u.k': 'ming', 'fin.u.m': 'mln', 'fin.u.b': 'mlrd',
      'fin.ringNote': 'Halqa — oylik daromadning qancha qismi sarflangani. Chiziqcha — oyning qancha qismi o‘tgani: halqa undan oldinda bo‘lsa, tez sarflayapsiz.',
      'fin.last7': 'So‘nggi 7 kun', 'fin.inK': 'ming {c}da',
      'fin.byCat': 'Pul qayerga ketdi', 'fin.total': 'jami {v}', 'fin.noExpense': 'Bu oyda chiqim yo‘q',
      'fin.addTitle': 'Kirim yoki chiqim yozish', 'fin.out': 'Chiqim', 'fin.in': 'Kirim',
      'fin.amount': 'Summa', 'fin.amountPh': '50 000 · 250k · 1.5m', 'fin.amountHint': '«k» — ming, «m» — million',
      'fin.what': 'Nimaga?', 'fin.whatIn': 'Qayerdan?', 'fin.goOut': 'Chiqimni yozish', 'fin.goIn': 'Kirimni yozish',
      'fin.more': 'Izoh, sana, hisob', 'fin.wrote': 'Yozildi: {v} · {c}',
      'fin.cat': 'Kategoriya', 'fin.notePh': 'Izoh (ixtiyoriy)', 'fin.account': 'Hisob', 'fin.noAccount': 'Hisobsiz',
      'fin.txs': 'Yozuvlar', 'fin.searchPh': 'Izoh yoki kategoriya…', 'fin.emptyMonth': 'Bu oyda yozuv yo‘q', 'fin.emptySearch': 'Topilmadi',
      'fin.emptyNow': 'Tepadagi kartadan birinchi kirim yoki chiqimni yozing — halqa va ro‘yxat shu yerda paydo bo‘ladi.',
      'fin.allTx': 'Barcha yozuvlar · {n} ta', 'fin.lessTx': 'Qisqartirish',
      'fin.editTx': 'Yozuvni tahrirlash', 'fin.txDeleted': 'Yozuv o‘chirildi', 'fin.saved': 'Saqlandi',
      'fin.badAmount': 'Summani to‘g‘ri kiriting', 'fin.needName': 'Nom kiriting', 'fin.type': 'Turi',
      'fin.catsHint': 'Kategoriyalarni Sozlashda tahrirlash',
      'fin.netWorth': 'Jami qoldiq', 'fin.in30': '30 kunda {v}', 'fin.last30': 'So‘nggi 30 kun', 'fin.accounts': 'Hisoblar',
      'fin.ringAcc': 'Halqa — pulingiz qaysi hisobda turgani. Raqamlar {u} hisobida.', 'fin.others': 'Yana {n} ta',
      'fin.accSub': 'Qoldiqni o‘zgartirish uchun bosing', 'fin.accRename': 'Nom va tur',
      'fin.addAccount': 'Hisob qo‘shish', 'fin.editAccount': 'Hisobni tahrirlash', 'fin.accName': 'Hisob nomi', 'fin.accType': 'Turi', 'fin.balance': 'Qoldiq',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Naqd', 'fin.type.bank': 'Bank', 'fin.type.card': 'Karta', 'fin.type.crypto': 'Kripto', 'fin.type.other': 'Boshqa',
      'fin.noAccounts': 'Hali hisob yo‘q', 'fin.noAccountsS': 'Karta, naqd pul yoki omonatni qo‘shing — jami qoldiq va har birining ulushi shu yerda ko‘rinadi.',
      'fin.accDeleted': 'Hisob o‘chirildi', 'fin.balUpdated': 'Qoldiq yangilandi',
      'fin.balEditHint': 'Qoldiq: +/- bilan farq, aks holda yangi summa', 'fin.noSnaps': 'Qoldiq o‘zgarganda tarix shu yerda chiziladi',
      'fin.subs': 'Doimiy to‘lovlar', 'fin.perMonth': 'oyiga {v}', 'fin.perYear': 'Yiliga ≈ {v}',
      'fin.addSub': 'To‘lov qo‘shish', 'fin.editSub': 'To‘lovni tahrirlash', 'fin.period': 'Davr',
      'fin.per.monthly': 'Oylik', 'fin.per.yearly': 'Yillik', 'fin.per.weekly': 'Haftalik',
      'fin.next': 'Keyingi to‘lov', 'fin.auto': 'Avto-yechish', 'fin.payNow': 'To‘lash', 'fin.paid': 'To‘landi: {name}',
      'fin.paidPill': 'to‘landi', 'fin.paidBtn': 'To‘landi',
      'fin.autoDone': '{n} ta to‘lov avtomatik yechildi — {sum}',
      'fin.dueToday': 'Bugun', 'fin.dueTomorrow': 'Ertaga', 'fin.inDays': '{n} kunda', 'fin.late': '{n} kun kechikdi',
      'fin.noSubs': 'Doimiy to‘lov yo‘q', 'fin.noSubsS': 'Internet, ijara, obuna kabi takrorlanadigan to‘lovlarni qo‘shing — muddati shu yerda ko‘rinadi.',
      'fin.subCat': 'Doimiy to‘lov', 'fin.noDate': 'sana yo‘q',
      'fin.subDeleted': 'To‘lov o‘chirildi', 'fin.subNamePh': 'Internet, ijara, Netflix…',
      'fin.prevMonth': 'Oldingi oy', 'fin.nextMonth': 'Keyingi oy',
    },
    uzk: {
      'fin.tab.month': 'Ой', 'fin.tab.accounts': 'Ҳисоблар',
      'fin.income': 'Кирим', 'fin.expense': 'Чиқим', 'fin.left': 'Қолди',
      'fin.daysLeft': '{n} кун қолди', 'fin.monthOver': 'Ой тугаган', 'fin.monthRes': 'Ой натижаси',
      'fin.pickMonth': 'Ойни танлаш', 'fin.thisMonth': 'Шу ойга қайтиш', 'fin.done': 'Тайёр',
      'fin.spentOf': 'даромаддан сарфланди', 'fin.noIncome': 'кирим ёзилмаган',
      'fin.adv.ok': 'Меъёрида: ой {m}% ўтди, даромаднинг {s}% сарфланди.',
      'fin.adv.fast': 'Тез сарфлаяпсиз: ой {m}% ўтди, даромаднинг эса {s}% кетди.',
      'fin.adv.endLeft': 'Шу тезликда ой охирида {v} қолади.', 'fin.adv.endShort': 'Шу тезликда ой охиригача {v} етмайди.',
      'fin.adv.neg': 'Бу ой чиқим киримдан {v} кўп.',
      'fin.adv.noInc': 'Бу ой кирим ёзилмаган — улуш чиқиши учун киримни ҳам ёзинг.',
      'fin.adv.past': 'Ой якуни: даромаднинг {s}% сарфланди, {v} қолди.', 'fin.adv.pastNeg': 'Ой якуни: чиқим киримдан {v} кўп бўлди.',
      'fin.t.day': 'Кунига', 'fin.t.dayN': 'ўртача', 'fin.t.end': 'Ой охири', 'fin.t.endN': 'тахминий чиқим', 'fin.t.bills': 'Тўловлар', 'fin.t.billsN': 'ҳали тўланади',
      'fin.u.k': 'минг', 'fin.u.m': 'млн', 'fin.u.b': 'млрд',
      'fin.ringNote': 'Ҳалқа — ойлик даромаднинг қанча қисми сарфлангани. Чизиқча — ойнинг қанча қисми ўтгани: ҳалқа ундан олдинда бўлса, тез сарфлаяпсиз.',
      'fin.last7': 'Сўнгги 7 кун', 'fin.inK': 'минг {c}да',
      'fin.byCat': 'Пул қаерга кетди', 'fin.total': 'жами {v}', 'fin.noExpense': 'Бу ойда чиқим йўқ',
      'fin.addTitle': 'Кирим ёки чиқим ёзиш', 'fin.out': 'Чиқим', 'fin.in': 'Кирим',
      'fin.amount': 'Сумма', 'fin.amountPh': '50 000 · 250k · 1.5m', 'fin.amountHint': '«k» — минг, «m» — миллион',
      'fin.what': 'Нимага?', 'fin.whatIn': 'Қаердан?', 'fin.goOut': 'Чиқимни ёзиш', 'fin.goIn': 'Киримни ёзиш',
      'fin.more': 'Изоҳ, сана, ҳисоб', 'fin.wrote': 'Ёзилди: {v} · {c}',
      'fin.cat': 'Категория', 'fin.notePh': 'Изоҳ (ихтиёрий)', 'fin.account': 'Ҳисоб', 'fin.noAccount': 'Ҳисобсиз',
      'fin.txs': 'Ёзувлар', 'fin.searchPh': 'Изоҳ ёки категория…', 'fin.emptyMonth': 'Бу ойда ёзув йўқ', 'fin.emptySearch': 'Топилмади',
      'fin.emptyNow': 'Тепадаги картадан биринчи кирим ёки чиқимни ёзинг — ҳалқа ва рўйхат шу ерда пайдо бўлади.',
      'fin.allTx': 'Барча ёзувлар · {n} та', 'fin.lessTx': 'Қисқартириш',
      'fin.editTx': 'Ёзувни таҳрирлаш', 'fin.txDeleted': 'Ёзув ўчирилди', 'fin.saved': 'Сақланди',
      'fin.badAmount': 'Суммани тўғри киритинг', 'fin.needName': 'Ном киритинг', 'fin.type': 'Тури',
      'fin.catsHint': 'Категорияларни Созлашда таҳрирлаш',
      'fin.netWorth': 'Жами қолдиқ', 'fin.in30': '30 кунда {v}', 'fin.last30': 'Сўнгги 30 кун', 'fin.accounts': 'Ҳисоблар',
      'fin.ringAcc': 'Ҳалқа — пулингиз қайси ҳисобда тургани. Рақамлар {u} ҳисобида.', 'fin.others': 'Яна {n} та',
      'fin.accSub': 'Қолдиқни ўзгартириш учун босинг', 'fin.accRename': 'Ном ва тур',
      'fin.addAccount': 'Ҳисоб қўшиш', 'fin.editAccount': 'Ҳисобни таҳрирлаш', 'fin.accName': 'Ҳисоб номи', 'fin.accType': 'Тури', 'fin.balance': 'Қолдиқ',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Нақд', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Бошқа',
      'fin.noAccounts': 'Ҳали ҳисоб йўқ', 'fin.noAccountsS': 'Карта, нақд пул ёки омонатни қўшинг — жами қолдиқ ва ҳар бирининг улуши шу ерда кўринади.',
      'fin.accDeleted': 'Ҳисоб ўчирилди', 'fin.balUpdated': 'Қолдиқ янгиланди',
      'fin.balEditHint': 'Қолдиқ: +/- билан фарқ, акс ҳолда янги сумма', 'fin.noSnaps': 'Қолдиқ ўзгарганда тарих шу ерда чизилади',
      'fin.subs': 'Доимий тўловлар', 'fin.perMonth': 'ойига {v}', 'fin.perYear': 'Йилига ≈ {v}',
      'fin.addSub': 'Тўлов қўшиш', 'fin.editSub': 'Тўловни таҳрирлаш', 'fin.period': 'Давр',
      'fin.per.monthly': 'Ойлик', 'fin.per.yearly': 'Йиллик', 'fin.per.weekly': 'Ҳафталик',
      'fin.next': 'Кейинги тўлов', 'fin.auto': 'Авто-ечиш', 'fin.payNow': 'Тўлаш', 'fin.paid': 'Тўланди: {name}',
      'fin.paidPill': 'тўланди', 'fin.paidBtn': 'Тўланди',
      'fin.autoDone': '{n} та тўлов автоматик ечилди — {sum}',
      'fin.dueToday': 'Бугун', 'fin.dueTomorrow': 'Эртага', 'fin.inDays': '{n} кунда', 'fin.late': '{n} кун кечикди',
      'fin.noSubs': 'Доимий тўлов йўқ', 'fin.noSubsS': 'Интернет, ижара, обуна каби такрорланадиган тўловларни қўшинг — муддати шу ерда кўринади.',
      'fin.subCat': 'Доимий тўлов', 'fin.noDate': 'сана йўқ',
      'fin.subDeleted': 'Тўлов ўчирилди', 'fin.subNamePh': 'Интернет, ижара, Netflix…',
      'fin.prevMonth': 'Олдинги ой', 'fin.nextMonth': 'Кейинги ой',
    },
    ru: {
      'fin.tab.month': 'Месяц', 'fin.tab.accounts': 'Счета',
      'fin.income': 'Доход', 'fin.expense': 'Расход', 'fin.left': 'Осталось',
      'fin.daysLeft': 'осталось {n} дн.', 'fin.monthOver': 'Месяц завершён', 'fin.monthRes': 'Итог месяца',
      'fin.pickMonth': 'Выбор месяца', 'fin.thisMonth': 'К текущему месяцу', 'fin.done': 'Готово',
      'fin.spentOf': 'дохода потрачено', 'fin.noIncome': 'доход не записан',
      'fin.adv.ok': 'В норме: прошло {m}% месяца, потрачено {s}% дохода.',
      'fin.adv.fast': 'Тратите быстро: прошло {m}% месяца, а ушло уже {s}% дохода.',
      'fin.adv.endLeft': 'При таком темпе к концу месяца останется {v}.', 'fin.adv.endShort': 'При таком темпе до конца месяца не хватит {v}.',
      'fin.adv.neg': 'В этом месяце расходы больше доходов на {v}.',
      'fin.adv.noInc': 'В этом месяце доход не записан — запишите его, чтобы увидеть долю.',
      'fin.adv.past': 'Итог месяца: потрачено {s}% дохода, осталось {v}.', 'fin.adv.pastNeg': 'Итог месяца: расходы превысили доходы на {v}.',
      'fin.t.day': 'В день', 'fin.t.dayN': 'в среднем', 'fin.t.end': 'К концу месяца', 'fin.t.endN': 'прогноз расходов', 'fin.t.bills': 'Платежи', 'fin.t.billsN': 'ещё к оплате',
      'fin.u.k': 'тыс.', 'fin.u.m': 'млн', 'fin.u.b': 'млрд',
      'fin.ringNote': 'Кольцо — какая часть дохода за месяц потрачена. Чёрточка — какая часть месяца прошла: если кольцо впереди неё, вы тратите быстро.',
      'fin.last7': 'Последние 7 дней', 'fin.inK': 'в тыс. {c}',
      'fin.byCat': 'Куда уходят деньги', 'fin.total': 'всего {v}', 'fin.noExpense': 'В этом месяце нет расходов',
      'fin.addTitle': 'Записать доход или расход', 'fin.out': 'Расход', 'fin.in': 'Доход',
      'fin.amount': 'Сумма', 'fin.amountPh': '50 000 · 250k · 1.5m', 'fin.amountHint': '«k» — тысяча, «m» — миллион',
      'fin.what': 'На что?', 'fin.whatIn': 'Откуда?', 'fin.goOut': 'Записать расход', 'fin.goIn': 'Записать доход',
      'fin.more': 'Заметка, дата, счёт', 'fin.wrote': 'Записано: {v} · {c}',
      'fin.cat': 'Категория', 'fin.notePh': 'Заметка', 'fin.account': 'Счёт', 'fin.noAccount': 'Без счёта',
      'fin.txs': 'Записи', 'fin.searchPh': 'Заметка или категория…', 'fin.emptyMonth': 'В этом месяце нет записей', 'fin.emptySearch': 'Ничего не найдено',
      'fin.emptyNow': 'Запишите первый доход или расход в карточке выше — кольцо и список появятся здесь.',
      'fin.allTx': 'Все записи · {n}', 'fin.lessTx': 'Свернуть',
      'fin.editTx': 'Изменить запись', 'fin.txDeleted': 'Запись удалена', 'fin.saved': 'Сохранено',
      'fin.badAmount': 'Введите корректную сумму', 'fin.needName': 'Введите название', 'fin.type': 'Тип',
      'fin.catsHint': 'Категории — в Настройках',
      'fin.netWorth': 'Всего на счетах', 'fin.in30': 'за 30 дней {v}', 'fin.last30': 'Последние 30 дней', 'fin.accounts': 'Счета',
      'fin.ringAcc': 'Кольцо — на каких счетах лежат деньги. Числа — {u}.', 'fin.others': 'Ещё {n}',
      'fin.accSub': 'Нажмите, чтобы изменить баланс', 'fin.accRename': 'Название и тип',
      'fin.addAccount': 'Добавить счёт', 'fin.editAccount': 'Изменить счёт', 'fin.accName': 'Название счёта', 'fin.accType': 'Тип', 'fin.balance': 'Баланс',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Наличные', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Другое',
      'fin.noAccounts': 'Счетов пока нет', 'fin.noAccountsS': 'Добавьте карту, наличные или вклад — здесь появятся общий баланс и доля каждого счёта.',
      'fin.accDeleted': 'Счёт удалён', 'fin.balUpdated': 'Баланс обновлён',
      'fin.balEditHint': 'Баланс: с +/- — изменение, иначе новая сумма', 'fin.noSnaps': 'История появится, когда изменится баланс',
      'fin.subs': 'Постоянные платежи', 'fin.perMonth': '{v} в месяц', 'fin.perYear': '≈ {v} в год',
      'fin.addSub': 'Добавить платёж', 'fin.editSub': 'Изменить платёж', 'fin.period': 'Период',
      'fin.per.monthly': 'Ежемесячно', 'fin.per.yearly': 'Ежегодно', 'fin.per.weekly': 'Еженедельно',
      'fin.next': 'Следующий платёж', 'fin.auto': 'Автосписание', 'fin.payNow': 'Оплатить', 'fin.paid': 'Оплачено: {name}',
      'fin.paidPill': 'оплачено', 'fin.paidBtn': 'Оплачено',
      'fin.autoDone': 'Автосписано платежей: {n} — {sum}',
      'fin.dueToday': 'Сегодня', 'fin.dueTomorrow': 'Завтра', 'fin.inDays': 'через {n} дн.', 'fin.late': 'просрочено {n} дн.',
      'fin.noSubs': 'Постоянных платежей нет', 'fin.noSubsS': 'Добавьте повторяющиеся платежи — интернет, аренду, подписки: срок будет виден здесь.',
      'fin.subCat': 'Постоянный платёж', 'fin.noDate': 'без даты',
      'fin.subDeleted': 'Платёж удалён', 'fin.subNamePh': 'Интернет, аренда, Netflix…',
      'fin.prevMonth': 'Предыдущий месяц', 'fin.nextMonth': 'Следующий месяц',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const TABS = ['month', 'accounts'];
  const ACC_TYPES = ['cash', 'bank', 'card', 'crypto', 'other'];
  const ACC_ICON = { cash: 'cash', bank: 'bank', card: 'card', crypto: 'globe', other: 'wallet' };
  /* Hisoblar halqasi bo'laklari — dizayn hujjati A.5 dagi qat'iy qator
     (ko'k, och ko'k, eng och ko'k, yashil). Bu ma'lumot qatori rangi, token
     emas: ikkala temada ham bir xil turadi. */
  const ACC_PAL = ['#2358E8', '#5B8CFF', '#A5BFFF', '#1FA854'];
  const PERIODS = ['monthly', 'yearly', 'weekly'];
  const TX_LIMIT = 10;   // «Yozuvlar»da sukut bo'yicha ko'rinadigan qatorlar; qolgani «Barcha yozuvlar» ortida

  const F = () => D.S.finance;
  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const money = (n, o) => D.fmtMoney(n, o);
  // karta ichidagi raqamlar valyuta so'zisiz: uni summa maydoni va izoh qatori aytadi
  const plain = (n) => D.fmtNum(Math.round(+n || 0));
  const plainSigned = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + D.fmtNum(Math.abs(Math.round(+n || 0)));
  const cap = (s) => { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
  const pct = (v) => D.clamp(+v || 0, 0, 100);
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('finance', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };
  /** valyuta belgisi («so'm», «$») — D.fmtMoney dagi jadvaldan, takrorlamasdan */
  const curSym = () => money(0).replace(/[\d\s −-]/g, '');
  /** «540 ming», «16,7 mln», «1,09 mln» — plitka va izoh uchun ixcham yozuv (uch raqamgacha) */
  const sig3 = (v) => D.fmtNum(v, v >= 100 ? 0 : v >= 10 ? 1 : 2);
  function compact(n) {
    const a = Math.abs(+n || 0), sg = +n < 0 ? '−' : '';
    if (a >= 999.5e6) return sg + sig3(a / 1e9) + ' ' + t('fin.u.b');
    if (a >= 999500) return sg + sig3(a / 1e6) + ' ' + t('fin.u.m');
    if (a >= 1000) return sg + D.fmtNum(Math.round(a / 1e3)) + ' ' + t('fin.u.k');
    return sg + D.fmtNum(Math.round(a));
  }
  /** jami qoldiq qaysi birlikda o'qiladi: mln · ming · o'zi */
  function unitOf(n) {
    const a = Math.abs(+n || 0);
    return a >= 1e6 ? { div: 1e6, u: t('fin.u.m') } : a >= 1e4 ? { div: 1e3, u: t('fin.u.k') } : { div: 1, u: '' };
  }

  // module-local UI state (device only, not persisted)
  let draftType = 'out';
  let draftDate = null; // last used date in the add form (kept while it is not today)
  let searchQ = '';
  let showAll = false;  // «Barcha yozuvlar» ochilganmi
  let mountTimer = null;

  /** "1 250 000", "1.250.000", "1,5m", "250k", "+50000" → number (NaN when unparseable) */
  function parseAmount(raw) {
    let s = String(raw ?? '').trim().toLowerCase();
    if (!s) return NaN;
    s = s.replace(/[\s _'’]/g, '').replace(/so'?m|сўм|сум|uzs|usd|eur|rub|kzt|[$€₽₸]/g, '');
    if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    if (/^[+-]?\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, '');
    const m = s.match(/^([+-]?)(\d+(?:[.,]\d+)?|[.,]\d+)(k|к|ming|минг|m|м|mln|млн|b|mlrd|млрд)?$/);
    if (!m) return NaN;
    let v = parseFloat(m[2].replace(',', '.'));
    const suf = m[3] || '';
    if (/^(k|к|ming|минг)$/.test(suf)) v *= 1e3;
    else if (/^(m|м|mln|млн)$/.test(suf)) v *= 1e6;
    else if (suf) v *= 1e9;
    if (!isFinite(v)) return NaN;
    return m[1] === '-' ? -v : v;
  }
  const isDelta = (raw) => /^\s*[+-]/.test(String(raw ?? ''));

  function addMonths(mk, n) {
    let [y, m] = mk.split('-').map(Number);
    m += n;
    y += Math.floor((m - 1) / 12);
    m = ((m - 1) % 12 + 12) % 12 + 1;
    return y + '-' + D.pad2(m);
  }
  function advance(key, period, anchorDay) {
    if (period === 'weekly') return D.addDays(key, 7);
    const d = anchorDay || D.parseKey(key).d;
    const mk = addMonths(D.monthKey(key), period === 'yearly' ? 12 : 1);
    return mk + '-' + D.pad2(Math.min(d, D.daysInMonth(mk)));
  }
  const monthlyEq = (s) => { const a = +s.amount || 0; return s.period === 'yearly' ? a / 12 : s.period === 'weekly' ? a * 52 / 12 : a; };
  const curMonth = () => D.ui.filters.finMonth || D.monthKey();
  const setMonth = (mk) => { D.ui.filters.finMonth = mk; D.saveUi(); };

  const cat = (id) => F().cats.find((c) => c.id === id) || { id, name: id || '—', icon: 'layers' };
  const catKey = () => (draftType === 'in' ? 'finCatIn' : 'finCat');
  /* categories the user actually reaches for come first — ordering is per type,
     so «Kirim» opens on Maosh instead of Oziq-ovqat */
  function catOrder(type) {
    const from = D.addDays(D.today(), -90), w = {};
    for (const x of F().tx) if (x && x.type === type && x.date >= from) w[x.cat] = (w[x.cat] || 0) + 1;
    return F().cats.map((c, i) => ({ c, i, n: w[c.id] || 0 })).sort((a, b) => b.n - a.n || a.i - b.i).map((x) => x.c);
  }
  /* a category deleted in Sozlash must not stay selected — it would file the next entry under a dead id */
  function selCat() {
    const id = D.ui.filters[catKey()];
    if (id && F().cats.some((c) => c.id === id)) return id;
    const o = catOrder(draftType);
    return (o[0] || F().cats[0] || {}).id || 'boshqa';
  }
  /* Faqat MATN. Ilgari bu yerga emoji qo'shilardi; endi c.icon ikonka nomi
     ('apple'), ya'ni qo'shilsa ekranda «apple Oziq-ovqat» bo'lib chiqardi. */
  const catLabel = (id) => cat(id).name;
  const acc = (id) => (id ? F().accounts.find((a) => a.id === id) : null);
  const effect = (tx) => (tx.type === 'in' ? 1 : -1) * (+tx.amount || 0);
  function applyTx(tx, dir) { // dir +1 apply, -1 revert
    const a = acc(tx.accountId);
    if (a) a.balance = (+a.balance || 0) + dir * effect(tx);
  }
  const netWorth = () => D.sum(F().accounts, (a) => a.balance);

  /* Oylik me'yor olib tashlandi: sahifaning bosh raqami endi doim oyning
     sof natijasi. Yozilgan me'yorlar F().budgets da tegilmay qoladi —
     o'chirilmaydi, shunchaki o'qilmaydi. */

  // push a snapshot when the total moved by ≥0.5 % (or first ever); cap 500
  function snap() {
    const s = F().snapshots, v = Math.round(netWorth());
    const last = s[s.length - 1];
    if (last && Math.abs(v - last.v) < Math.max(1, Math.abs(last.v)) * 0.005) return;
    s.push({ t: Date.now(), v });
    if (s.length > 500) s.splice(0, s.length - 500);
  }

  // removal with undo that also restores side effects (mirrors D.remove)
  function removeUndo(arr, id, label, onRemove, onRestore) {
    const i = arr.findIndex((x) => x.id === id);
    if (i < 0) return false;
    const [item] = arr.splice(i, 1);
    if (onRemove) onRemove(item);
    D.undo.push({ label, undo: () => { arr.splice(Math.min(i, arr.length), 0, item); if (onRestore) onRestore(item); } });
    D.save(); D.rerender();
    D.toast(label, { undo: () => D.undo.pop() });
    return true;
  }

  /* month aggregation, memoised on (month, tx.length, updatedAt) */
  let aggCache = {}, aggVer = '', aggRef = null;
  function monthAgg(mk) {
    const txs = F().tx, ver = txs.length + '|' + D.S.meta.updatedAt;
    if (ver !== aggVer || txs !== aggRef) { aggCache = {}; aggVer = ver; aggRef = txs; }
    if (aggCache[mk]) return aggCache[mk];
    const list = [], idx = new Map();
    for (let i = 0; i < txs.length; i++) { const x = txs[i]; if (x && x.date && String(x.date).startsWith(mk)) { idx.set(x, i); list.push(x); } }
    let inc = 0, out = 0;
    const byCat = {}, byDay = {};
    for (const x of list) {
      const a = +x.amount || 0;
      if (x.type === 'in') inc += a;
      else { out += a; byCat[x.cat] = (byCat[x.cat] || 0) + a; byDay[x.date] = (byDay[x.date] || 0) + a; }
    }
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : idx.get(b) - idx.get(a)));
    return (aggCache[mk] = { list, inc, out, net: inc - out, byCat, byDay });
  }
  function daysLeftIn(mk) {
    const now = D.monthKey(), dim = D.daysInMonth(mk);
    if (mk < now) return 0;
    if (mk > now) return dim;
    return dim - D.parseKey(D.today()).d + 1;
  }
  const daysUntil = (key) => (key ? D.daysBetween(D.today(), key) : null);
  function duePill(n) {
    if (n === null) return `<span class="pill">${esc(t('fin.noDate'))}</span>`;
    // dizayn hujjati A.9: kechikdi — qizil, bugun yoki ertaga — sariq, «N kunda» — kulrang
    const cls = n < 0 ? 'bad' : n <= 1 ? 'warn' : '';
    const txt = n < 0 ? t('fin.late', { n: -n }) : n === 0 ? t('fin.dueToday') : n === 1 ? t('fin.dueTomorrow') : t('fin.inDays', { n });
    return `<span class="pill ${cls}">${esc(txt)}</span>`;
  }
  function ensureSubCat() {
    let c = F().cats.find((x) => x.id === 'obuna');
    if (!c) { c = { id: 'obuna', name: t('fin.subCat'), icon: 'refresh' }; F().cats.push(c); }
    return c.id;
  }
  /** what the recurring payments will still take out of the current month.
      A charge whose date has already passed and was never paid still has to come
      out of what is left, so it counts too — only auto ones get their `next`
      moved forward by runSubs, so a past date here means genuinely unpaid. */
  function billsLeft(mk) {
    if (mk !== D.monthKey()) return 0;
    const start = mk + '-01', end = mk + '-' + D.pad2(D.daysInMonth(mk));
    let s = 0;
    for (const b of F().subs) {
      let k = b.next;
      if (!k) continue;
      const amt = +b.amount || 0;
      if (k < start) { s += amt; continue; }   // overdue from an earlier month: lands now, once
      const day = Math.max(+b.day || 0, D.parseKey(k).d);
      for (let g = 0; k && k <= end && g < 12; g++) { s += amt; k = advance(k, b.period, day); }
    }
    return s;
  }
  /* ------------------------------------------------------------------ */
  /* recurring-payment auto-deduct engine                                */
  /* ------------------------------------------------------------------ */
  function paySub(s, date, note) {
    const tx = { id: D.uid('f'), date, type: 'out', amount: +s.amount || 0, cat: ensureSubCat(), note: note || s.name || '', accountId: s.accountId || null };
    F().tx.push(tx);
    applyTx(tx, 1);
    s.last = date;
    return tx;
  }
  function runSubs() {
    if (!D.S) return 0;
    const today = D.today();
    let n = 0, sum = 0;
    for (const s of F().subs) {
      if (!s.auto || !s.next || s.next > today) continue;
      let guard = 0;
      const day = Math.max(+s.day || 0, D.parseKey(s.next).d);
      while (s.next && s.next <= today && guard++ < 24) {
        if (!s.last || s.last < s.next) { paySub(s, s.next); n++; sum += +s.amount || 0; }
        s.next = advance(s.next, s.period, day);
      }
    }
    if (n) {
      snap(); D.save();
      D.toast(t('fin.autoDone', { n, sum: money(sum) }), { ms: 4000 });
      if (D.current() === 'finance') D.rerender();
    }
    return n;
  }
  const sweepSubs = () => { try { runSubs(); } catch (e) { console.error(e); } };
  D.on('boot', sweepSubs);
  D.on('day:changed', sweepSubs);
  // This module is lazy-loaded (core.js LAZY), so 'boot' has usually already fired by
  // the time it runs — without this the auto-deduct would wait until Moliya is opened.
  if (D.S) setTimeout(sweepSubs, 0);

  /* ------------------------------------------------------------------ */
  /* shared render bits                                                  */
  /* ------------------------------------------------------------------ */
  /* Ko'zcha (summalarni yashirish) va oylik me'yor qaytarilmaydi — egasining
     qarori (dizayn hujjati 2.7). */
  const segBar = (sub) => `<div class="seg fin-seg" role="tablist">${TABS.map((x) => `<button class="${sub === x ? 'on' : ''}" data-act="sub" data-view="finance" data-sub="${x}" role="tab" aria-selected="${sub === x ? 'true' : 'false'}">${esc(t('fin.tab.' + x))}</button>`).join('')}</div>`;
  const monthName = (mk) => { const p = D.parseKey(mk + '-01'); return cap(t('months')[p.m - 1]) + (p.y === D.parseKey(D.today()).y ? '' : ' ' + p.y); };
  const monthLabel = (mk) => cap(D.fmtDate(mk + '-01', 'month'));
  const accOptions = (sel, none) => `<option value="">${esc(none || t('fin.noAccount'))}</option>` + F().accounts.map((a) => `<option value="${esc(a.id)}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)} · ${esc(money(a.balance))}</option>`).join('');
  const catOptions = (sel) => F().cats.map((c) => `<option value="${esc(c.id)}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const field = (label, inner) => `<div class="field"><label class="field-label">${esc(label)}</label>${inner}</div>`;
  const emptyBox = (icon, title, text, btn) => `<div class="empty fin-empty"><span class="empty-ic">${D.ic(icon, 20)}</span><span class="empty-t">${esc(title)}</span>${text ? `<span>${esc(text)}</span>` : ''}${btn || ''}</div>`;

  /* Oy tanlash — sarlavhadagi pill ochadigan pastki oyna. Yangi yo'l emas:
     strelkalar o'sha finMonthPrev / finMonthNext / finMonthToday. */
  function monthSheetHtml() {
    const mk = curMonth(), now = D.monthKey();
    const quick = [];
    for (let i = 0; i < 6; i++) quick.push(addMonths(now, -i));
    return `<div class="fin-ms-nav">
        <button class="fin-ms-b" data-act="finMonthPrev" aria-label="${esc(t('fin.prevMonth'))}">${D.ic('chevL', 20)}</button>
        <b class="fin-ms-l num">${esc(monthLabel(mk))}</b>
        <button class="fin-ms-b" data-act="finMonthNext" aria-label="${esc(t('fin.nextMonth'))}">${D.ic('chevR', 20)}</button>
      </div>
      <div class="chips fin-ms-q">${quick.map((m) => `<button class="chip" data-act="finMonthSet" data-mk="${m}" aria-pressed="${m === mk ? 'true' : 'false'}">${esc(monthName(m))}</button>`).join('')}</div>
      ${mk === now ? '' : `<button class="btn ghost main fin-ms-t" data-act="finMonthToday">${esc(t('fin.thisMonth'))}</button>`}
      <button class="btn main fin-ms-ok" data-act="closeSheet">${esc(t('fin.done'))}</button>`;
  }
  /** oy almashganda ochiq turgan oynadagi yozuv ham ergashsin (yopiq bo'lsa hech narsa qilmaydi) */
  const syncMonthSheet = () => D.patch('finMonthSheet', monthSheetHtml());

  /* ------------------------------------------------------------------ */
  /* OY · 1. KIRIM YOKI CHIQIM YOZISH                                     */
  /* Sahifadagi BIRINCHI karta va DOIM ochiq — egasining talabi (hujjat   */
  /* 7.1): eng ko'p qilinadigan ish eng yaqin joyda tursin. 2026-09 dagi  */
  /* «yig'iq forma» shu bilan bekor bo'ldi. Tartib: tur → summa → nimaga  */
  /* → tugma. Izoh, sana va hisob «yana» qatorida: tez yozuvga xalaqit    */
  /* bermaydi, lekin yo'qolgani ham yo'q (finAdd ularni DOM dan o'qiydi). */
  /* ------------------------------------------------------------------ */
  const chipsHtml = () => { const sel = selCat(); return catOrder(draftType).map((c) => `<button class="chip" data-act="finChip" data-cat="${esc(c.id)}" aria-pressed="${c.id === sel ? 'true' : 'false'}">${D.catMark(c.icon, 16)}<span>${esc(c.name)}</span></button>`).join(''); };
  /** «yana» qatorining o'ng tomoni: yashirin turgan tanlov (sana, hisob) ko'rinib tursin */
  function moreText(date, accId) {
    const a = acc(accId), parts = [];
    parts.push(!date || date === D.today() ? t('common.today') : D.fmtDate(date));
    if (a) parts.push(a.name);
    return parts.join(' · ');
  }
  function addCard() {
    const hasAcc = F().accounts.length > 0, isIn = draftType === 'in';
    const typeBtn = (ty, ic, key) => `<button class="fin-type ${ty}${draftType === ty ? ' on' : ''}" data-act="finType" data-type="${ty}" aria-pressed="${draftType === ty ? 'true' : 'false'}">${D.ic(ic, 18)}<span>${esc(t(key))}</span></button>`;
    return `<section class="card fin-add" aria-label="${esc(t('fin.addTitle'))}">
      <div class="card-head"><h2 class="title">${esc(t('fin.addTitle'))}</h2></div>
      <div class="fin-types" id="finTypeSeg">${typeBtn('out', 'minus', 'fin.out')}${typeBtn('in', 'plus', 'fin.in')}</div>
      <label class="fin-lbl" for="finAmount">${esc(t('fin.amount'))}</label>
      <div class="fin-amt-w">
        <input class="inp num fin-amount" id="finAmount" inputmode="decimal" autocomplete="off" placeholder="${esc(t('fin.amountPh'))}" data-input="finAmountIn" data-enter="finAdd">
        <span class="fin-cur" aria-hidden="true">${esc(curSym())}</span>
      </div>
      <div class="fin-eq num" id="finCheck" aria-live="polite">${esc(t('fin.amountHint'))}</div>
      <div class="fin-lbl" id="finWhat">${esc(t(isIn ? 'fin.whatIn' : 'fin.what'))}</div>
      <div class="chips fin-pick" id="finChips" role="group" aria-labelledby="finWhat">${chipsHtml()}</div>
      <details class="fin-more"${draftDate || moreWasOpen() ? ' open' : ''}>
        <summary><span>${esc(t('fin.more'))}</span><i class="num" id="finMoreVal">${esc(moreText(draftDate, hasAcc ? D.ui.filters.finAcc : null))}</i>${D.ic('chevD', 16)}</summary>
        <div class="fin-more-b">
          <input class="inp" id="finNote" placeholder="${esc(t('fin.notePh'))}" aria-label="${esc(t('common.note'))}" data-enter="finAdd">
          <input class="inp" type="date" id="finDate" value="${esc(draftDate || D.today())}" aria-label="${esc(t('common.date'))}" data-change="finMore">
          ${hasAcc ? `<select class="sel" id="finAcc" aria-label="${esc(t('fin.account'))}" data-change="finMore">${accOptions(D.ui.filters.finAcc)}</select>` : ''}
        </div>
      </details>
      <button class="btn main fin-go dim${isIn ? ' good' : ''}" id="finGo" data-act="finAdd" aria-disabled="true">${esc(t(isIn ? 'fin.goIn' : 'fin.goOut'))}</button>
    </section>`;
  }
  /* Tugma, tekshiruv qatori va tur — summa maydonining HOZIRGI qiymatidan.
     Render satr qaytaradi va maydonda nima yozilganini bilmaydi, shuning
     uchun bu holat chizilgandan keyin (mount) va har yozishda shu yerda
     tiklanadi. Tugma `disabled` emas, xira: bo'sh summada bosilsa finAdd
     «summani to'g'ri kiriting» deydi va maydonga olib boradi. */
  function syncAdd() {
    const inp = D.$('#finAmount'), go = D.$('#finGo'), chk = D.$('#finCheck');
    if (!inp || !go) return;
    const v = parseAmount(inp.value), ok = v > 0, isIn = draftType === 'in';
    go.classList.toggle('good', isIn);
    go.classList.toggle('dim', !ok);
    go.setAttribute('aria-disabled', ok ? 'false' : 'true');
    go.textContent = t(isIn ? 'fin.goIn' : 'fin.goOut');
    if (chk) { chk.classList.toggle('on', ok); chk.textContent = ok ? `= ${money(v)} · ${catLabel(selCat())}` : t('fin.amountHint'); }
  }

  /* ------------------------------------------------------------------ */
  /* OY · 2. OY NATIJASI — bosh karta                                     */
  /* Halqa — oylik kirimning necha foizi sarflangani; chiziqcha — oyning  */
  /* necha foizi o'tgani. Halqa chiziqchadan o'tib ketsa — tez sarflanyapti.*/
  /* Hamma son monthAgg / daysLeftIn / billsLeft dan: yangi hisob yo'q,   */
  /* faqat ularning nisbati.                                              */
  /* ------------------------------------------------------------------ */
  function monthRing(spent, mPct) {
    const R = 76, C = 2 * Math.PI * R, p = pct(spent);
    let tick = '';
    if (mPct != null) {
      // belgi halqani kesib o'tadi: radius 64 dan 88 gacha
      const a = (pct(mPct) / 100) * 2 * Math.PI - Math.PI / 2, x = Math.cos(a), y = Math.sin(a);
      tick = `<line class="fin-ring-k" x1="${(88 + 64 * x).toFixed(1)}" y1="${(88 + 64 * y).toFixed(1)}" x2="${(88 + 88 * x).toFixed(1)}" y2="${(88 + 88 * y).toFixed(1)}"/>`;
    }
    return `<svg class="fin-ring-svg" viewBox="0 0 176 176" width="176" height="176" fill="none" aria-hidden="true">
      <defs><linearGradient id="finG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDBA8C"/><stop offset="1" stop-color="#E8572F"/></linearGradient></defs>
      <circle class="fin-ring-t" cx="88" cy="88" r="${R}"/>
      ${p > 0 ? `<circle class="fin-ring-f" cx="88" cy="88" r="${R}" stroke="url(#finG)" transform="rotate(-90 88 88)" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p / 100)).toFixed(1)}"/>` : ''}
      ${tick}</svg>`;
  }
  const legRow = (cls, name, val) => `<div class="fin-leg ${cls}"><span class="fin-leg-n"><i class="dot"></i>${esc(name)}</span><b class="num${val.length > 11 ? ' sm' : ''}">${esc(val)}</b></div>`;

  /* Oxirgi yetti kun chiqimi, ming so'mda. O'rtachadan baland kun to'qroq,
     bugun eng to'q. Faqat joriy oyda: o'tgan oyga qaralganda «so'nggi 7 kun»
     o'sha oyga tegishli emas. */
  function week7() {
    const td = D.today(), W = t('weekdaysShort');
    const days = D.lastDays(7, td);
    const vals = days.map((k) => Math.round(monthAgg(D.monthKey(k)).byDay[k] || 0));
    const max = Math.max(...vals);
    if (!(max > 0)) return '';
    const avg = D.sum(vals) / vals.length;
    const cols = days.map((k, i) => {
      const v = vals[i], cls = k === td ? 'today' : v > avg ? 'hi' : '';
      return `<div class="fin-w7c ${cls}"><span class="fin-w7v num">${v ? esc(D.fmtNum(Math.round(v / 1000))) : '0'}</span>
        <span class="fin-w7t"><i style="height:${v ? Math.max(8, (v / max) * 100).toFixed(0) : 0}%"></i></span>
        <span class="fin-w7d">${esc(k === td ? t('common.today') : W[D.dowOf(k)])}</span></div>`;
    }).join('');
    return `<div class="fin-w7"><div class="fin-w7h"><b>${esc(t('fin.last7'))}</b><span>${esc(t('fin.inK', { c: curSym() }))}</span></div>
      <div class="fin-w7g" role="img" aria-label="${esc(t('fin.last7'))}: ${esc(days.map((k, i) => D.fmtDate(k) + ' — ' + plain(vals[i])).join(', '))}">${cols}</div></div>`;
  }

  function monthHero(mk, A) {
    const now = D.monthKey(), isNow = mk === now, dim = D.daysInMonth(mk);
    const left = daysLeftIn(mk);
    const pill = `<span class="hero-pill num">${esc(left ? t('fin.daysLeft', { n: left }) : t('fin.monthOver'))}</span>`;
    const head = `<div class="fin-hd"><h2>${esc(monthName(mk))}</h2>${pill}</div>`;
    if (!A.list.length) {
      return `<section class="card hero hero--yashil fin-hero" aria-label="${esc(t('fin.monthRes'))}">${head}
        ${emptyBox('wallet', t('fin.emptyMonth'), isNow ? t('fin.emptyNow') : '')}</section>`;
    }
    const elapsed = isNow ? D.parseKey(D.today()).d : mk < now ? dim : 0;
    const spent = A.inc > 0 ? (A.out / A.inc) * 100 : null;      // kirimning necha foizi ketdi
    const mPct = isNow ? (elapsed / dim) * 100 : null;           // oyning necha foizi o'tdi
    const pace = elapsed && A.out > 0 ? Math.round((A.out / elapsed) * dim) : null;   // shu tezlikda oy oxiridagi chiqim
    const bills = billsLeft(mk);
    const neg = A.net < 0;

    // maslahat: ikki foizni solishtiradi
    let adv = '';
    const S = spent == null ? '' : D.fmtNum(Math.round(spent)), M = mPct == null ? '' : D.fmtNum(Math.round(mPct));
    if (spent == null) adv = A.out > 0 ? `<div class="advice info fin-adv">${D.ic('info', 18)}<span>${esc(t('fin.adv.noInc'))}</span></div>` : '';
    else if (!isNow) {
      adv = neg ? `<div class="advice bad fin-adv">${D.ic('alert', 18)}<span>${esc(t('fin.adv.pastNeg', { v: compact(-A.net) }))}</span></div>`
        : `<div class="advice fin-adv">${D.ic('check', 18)}<span>${esc(t('fin.adv.past', { s: S, v: compact(A.net) }))}</span></div>`;
    } else if (neg) adv = `<div class="advice bad fin-adv">${D.ic('alert', 18)}<span>${esc(t('fin.adv.neg', { v: compact(-A.net) }))}</span></div>`;
    else {
      const fast = spent > mPct;
      const end = pace == null ? '' : ' ' + (A.inc - pace >= 0 ? t('fin.adv.endLeft', { v: compact(A.inc - pace) }) : t('fin.adv.endShort', { v: compact(pace - A.inc) }));
      adv = `<div class="advice ${fast ? 'warn' : ''} fin-adv">${D.ic(fast ? 'alert' : 'check', 18)}<span>${esc(t(fast ? 'fin.adv.fast' : 'fin.adv.ok', { m: M, s: S }) + end)}</span></div>`;
    }

    // plitkalar: faqat hisoblab bo'ladigani
    const tiles = [];
    const tile = (l, v, n) => `<div class="ptile"><span class="ptile-l">${esc(t(l))}</span><span class="ptile-v num">${esc(v)}</span><span class="ptile-n">${esc(t(n))}</span></div>`;
    if (elapsed && A.out > 0) tiles.push(tile('fin.t.day', compact(A.out / elapsed), 'fin.t.dayN'));
    if (isNow && pace != null) tiles.push(tile('fin.t.end', compact(pace), 'fin.t.endN'));
    if (bills > 0) tiles.push(tile('fin.t.bills', compact(bills), 'fin.t.billsN'));

    return `<section class="card hero ${neg ? 'hero--qazo fin-neg' : 'hero--yashil'} fin-hero" aria-label="${esc(t('fin.monthRes'))}">
      ${head}
      <div class="fin-rings">
        <div class="fin-ring-w">${monthRing(spent, mPct)}
          <div class="fin-ring-c">${spent == null ? `<b class="num">—</b><span>${esc(t('fin.noIncome'))}</span>`
            : `<b class="num">${S}<small>%</small></b><span>${esc(t('fin.spentOf'))}</span>`}</div></div>
        <div class="fin-legs">
          ${legRow('in', t('fin.income'), plain(A.inc))}
          ${legRow('out', t('fin.expense'), plain(A.out))}
          ${legRow(neg ? 'net neg' : 'net', t('fin.left'), plainSigned(A.net))}
        </div>
      </div>
      ${adv}
      ${tiles.length ? `<div class="ptiles fin-tiles${tiles.length === 3 ? '' : ' two'}">${tiles.join('')}</div>` : ''}
      ${spent != null && isNow ? `<p class="fin-note">${esc(t('fin.ringNote'))}</p>` : ''}
      ${isNow ? week7() : ''}
    </section>`;
  }

  /* ------------------------------------------------------------------ */
  /* OY · 3. PUL QAYERGA KETDI                                            */
  /* Bitta rang: kategoriyaning rangi hech narsa bildirmaydi (moliyada    */
  /* rang kirim/chiqimni anglatadi), kuchni chiziqning UZUNLIGI aytadi.   */
  /* ------------------------------------------------------------------ */
  function catsCard(A) {
    const cats = Object.entries(A.byCat).sort((a, b) => b[1] - a[1]);
    const max = cats.length ? cats[0][1] : 0;
    let h = `<section class="card fin-cats"><div class="card-head"><h2 class="title">${esc(t('fin.byCat'))}</h2>${cats.length ? `<span class="fin-cnt num">${esc(t('fin.total', { v: plain(A.out) }))}</span>` : ''}</div>`;
    if (!cats.length) h += emptyBox('chart', t('fin.noExpense'));
    else h += `<ul class="fin-cl">${cats.map(([id, v]) => {
      const c = cat(id);
      return `<li class="fin-c"><span class="ico coral">${D.catMark(c.icon, 18)}</span>
        <div class="fin-c-b"><div class="fin-c-r"><b>${esc(c.name)}</b><span class="fin-c-v num">${esc(plain(v))}</span><i class="num">${D.fmtPct(A.out ? (v / A.out) * 100 : 0)}</i></div>
          <span class="fin-c-bar"><i style="width:${max ? pct((v / max) * 100).toFixed(1) : 0}%"></i></span></div></li>`;
    }).join('')}</ul>`;
    h += `<div class="fin-hint"><button class="fin-link" data-act="go" data-view="settings" data-sub="finance">${D.ic('gear', 14)} ${esc(t('fin.catsHint'))}</button></div></section>`;
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* OY · 4. YOZUVLAR                                                     */
  /* Kunlarga bo'lingan; sarlavhada kun va o'sha kunning chiqimi. Qator   */
  /* bosilsa — mavjud tahrir oynasi (o'chirish ham o'sha yerda).          */
  /* Yozuvda vaqt maydoni yo'q, shuning uchun «Kategoriya · Hisob» xolos. */
  /* ------------------------------------------------------------------ */
  function dayLabel(k) {
    const td = D.today(), wd = t('weekdays')[D.dowOf(k)];
    return (k === td ? t('common.today') : k === D.addDays(td, -1) ? t('common.yesterday') : D.fmtDate(k)) + ' · ' + wd;
  }
  function renderTxList(A) {
    const nq = D.translit.norm(searchQ);
    const list = nq ? A.list.filter((x) => D.translit.norm((x.note || '') + ' ' + cat(x.cat).name).includes(nq)) : A.list;
    if (!list.length) return emptyBox(nq ? 'search' : 'list', t(nq ? 'fin.emptySearch' : 'fin.emptyMonth'));
    // kun jami — ko'rinib turgan qatorlardan emas, o'sha kunning HAMMA yozuvidan
    const dayOut = {};
    for (const x of list) if (x.type !== 'in') dayOut[x.date] = (dayOut[x.date] || 0) + (+x.amount || 0);
    const cut = !nq && !showAll && list.length > TX_LIMIT;
    const shown = cut ? list.slice(0, TX_LIMIT) : list;
    let h = '', day = null;
    for (const x of shown) {
      if (x.date !== day) {
        if (day !== null) h += '</ul>';
        day = x.date;
        h += `<div class="fin-day"><span>${esc(dayLabel(day))}</span><span class="num">${dayOut[day] ? '−' + esc(plain(dayOut[day])) : ''}</span></div><ul class="fin-tl">`;
      }
      const c = cat(x.cat), a = acc(x.accountId);
      const meta = [x.note ? c.name : '', a ? a.name : ''].filter(Boolean).join(' · ');
      h += `<li><button class="fin-tx" data-act="finEditTx" data-id="${esc(x.id)}">
        <span class="ico">${D.catMark(c.icon, 18)}</span>
        <span class="fin-tx-b"><b>${esc(x.note || c.name)}</b>${meta ? `<span>${esc(meta)}</span>` : ''}</span>
        <span class="fin-amt num ${x.type === 'in' ? 'in' : 'out'}">${x.type === 'in' ? '+' : '−'}${esc(plain(x.amount))}</span></button></li>`;
    }
    h += '</ul>';
    if (!nq && list.length > TX_LIMIT) h += `<button class="fin-all" data-act="finTxAll" aria-expanded="${cut ? 'false' : 'true'}">${esc(cut ? t('fin.allTx', { n: list.length }) : t('fin.lessTx'))}${cut ? D.ic('chevR', 16) : ''}</button>`;
    return h;
  }
  function txCard(A) {
    return `<section class="card fin-txs"><div class="card-head"><h2 class="title">${esc(t('fin.txs'))}</h2></div>
      <div class="fin-search"><span class="fin-search-ic">${D.ic('search', 17)}</span><input class="inp" id="finSearch" type="search" value="${esc(searchQ)}" placeholder="${esc(t('fin.searchPh'))}" aria-label="${esc(t('common.search'))}" data-input="finSearch" autocomplete="off"></div>
      <div id="finTxList">${renderTxList(A)}</div></section>`;
  }

  function renderMonth() {
    const mk = curMonth(), A = monthAgg(mk);
    let h = safe(addCard) + safe(() => monthHero(mk, A));
    // bo'sh oyda uchta bo'sh karta emas, bitta: bosh kartaning o'zi aytadi
    if (A.list.length) h += safe(() => catsCard(A)) + safe(() => txCard(A));
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* HISOBLAR · 1. JAMI QOLDIQ — bosh karta                               */
  /* Bo'lakli halqa: pul qaysi hisobda turgani. Bo'lak rangi hisobning    */
  /* qoldiq bo'yicha o'rnidan (eng kattasi — to'q ko'k); ro'yxatdagi      */
  /* ikonka ham o'sha rangda. Ulush musbat qoldiqlar yig'indisidan —      */
  /* qarzdagi hisob halqada bo'lak ololmaydi.                             */
  /* ------------------------------------------------------------------ */
  function accParts() {
    const pos = F().accounts.filter((a) => +a.balance > 0).sort((a, b) => b.balance - a.balance);
    const sum = D.sum(pos, (a) => a.balance);
    const color = {};
    // to'rttadan ko'p bo'lsa to'rtinchi rang «qolganlar»niki
    pos.forEach((a, i) => { color[a.id] = ACC_PAL[pos.length > 4 ? Math.min(i, 3) : i]; });
    const parts = pos.length > 4
      ? pos.slice(0, 3).map((a) => ({ name: a.name, v: +a.balance, c: color[a.id] })).concat([{ name: t('fin.others', { n: pos.length - 3 }), v: D.sum(pos.slice(3), (a) => a.balance), c: ACC_PAL[3] }])
      : pos.map((a) => ({ name: a.name, v: +a.balance, c: color[a.id] }));
    return { sum, color, parts };
  }
  const share = (v, sum) => (sum > 0 && v > 0 ? Math.round((v / sum) * 100) + '%' : '—');
  function accRing(P) {
    const R = 76, C = 2 * Math.PI * R, GAP = P.parts.length > 1 ? 5 : 0;
    let at = 0, segs = '';
    for (const p of P.parts) {
      const full = (p.v / P.sum) * C, len = Math.max(1, full - GAP);
      segs += `<circle cx="88" cy="88" r="${R}" stroke="${p.c}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-(at + GAP / 2)).toFixed(1)}"/>`;
      at += full;
    }
    return `<svg class="fin-ring-svg" viewBox="0 0 176 176" width="176" height="176" fill="none" aria-hidden="true">
      <circle class="fin-ring-t acc" cx="88" cy="88" r="${R}"/><g class="fin-ring-s" transform="rotate(-90 88 88)">${segs}</g></svg>`;
  }
  /* Oxirgi 30 kun qoldig'i — S.finance.snapshots dan. Nuqtalar vaqt o'qida
     o'z joyida turadi (snap() faqat qoldiq o'zgarganda yozadi, ya'ni ular
     teng oraliqda emas). Boshlang'ich nuqta — 30 kun oldingi oxirgi qiymat. */
  function balLine(snaps, total, U) {
    const now = Date.now(), cutT = now - 30 * 86400000;
    const pts = [];
    let ref = null;
    for (const s of snaps) { if (!s || !isFinite(+s.t) || !isFinite(+s.v)) continue; if (s.t <= cutT) ref = s; else if (s.t <= now) pts.push({ t: +s.t, v: +s.v }); }
    if (ref) pts.unshift({ t: cutT, v: +ref.v });
    if (pts.length) pts.push({ t: now, v: total });
    if (pts.length < 2) return `<div class="fin-nosnap">${D.ic('chart', 14)} ${esc(t('fin.noSnaps'))}</div>`;
    const W = 318, H = 72, t0 = pts[0].t, span = Math.max(1, now - t0);
    let lo = Infinity, hi = -Infinity;
    for (const p of pts) { lo = Math.min(lo, p.v); hi = Math.max(hi, p.v); }
    const rng = hi - lo || 1;
    const xy = pts.map((p) => [((p.t - t0) / span) * W, hi === lo ? H / 2 : 6 + (1 - (p.v - lo) / rng) * (H - 26)]);
    const d = xy.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
    const val = (v) => sig3(Math.abs(v) / U.div);
    return `<svg class="fin-line" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="finL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
        <path d="${d} L${W} ${H} L0 ${H} Z" fill="url(#finL)"/><path class="fin-line-p" d="${d}"/></svg>
      <div class="fin-line-l num"><span>${esc(D.fmtDate(D.dayKey(new Date(t0))))} · ${esc(val(pts[0].v))}</span><span>${esc(t('common.today').toLowerCase())} · ${esc(val(total))}</span></div>`;
  }

  function worthHero() {
    const accs = F().accounts, total = netWorth(), snaps = F().snapshots;
    if (!accs.length) {
      return `<section class="card hero hero--kok fin-hero fin-worth" aria-label="${esc(t('fin.netWorth'))}"><div class="fin-hd"><h2>${esc(t('fin.netWorth'))}</h2></div>
        ${emptyBox('wallet', t('fin.noAccounts'), t('fin.noAccountsS'), `<button class="btn" data-act="finAccEdit">${D.ic('plus', 16)} ${esc(t('fin.addAccount'))}</button>`)}</section>`;
    }
    const cut = Date.now() - 30 * 86400000;
    let ref30 = null;
    for (const s of snaps) { if (s.t <= cut) ref30 = s; else break; }
    const d30 = ref30 && total - ref30.v !== 0 ? total - ref30.v : null;   // «30 kunda 0» hech narsa aytmaydi
    const P = accParts(), U = unitOf(total), unit = (U.u ? U.u + ' ' : '') + curSym();
    const legs = P.parts.map((p) => `<div class="fin-leg" style="--c:${p.c}"><span class="fin-leg-n"><i class="dot"></i><span class="ellipsis">${esc(p.name)}</span></span>
      <b class="num sm">${esc(sig3(p.v / U.div))} · ${esc(share(p.v, P.sum))}</b></div>`).join('');
    return `<section class="card hero hero--kok fin-hero fin-worth" aria-label="${esc(t('fin.netWorth'))}">
      <div class="fin-hd"><h2>${esc(t('fin.netWorth'))}</h2>${d30 === null ? '' : `<span class="pill ${d30 > 0 ? 'good' : 'bad'} fin-d30 num">${esc(t('fin.in30', { v: (d30 > 0 ? '+' : '') + compact(d30) }))}</span>`}</div>
      <div class="fin-rings">
        <div class="fin-ring-w">${P.sum > 0 ? accRing(P) : `<svg class="fin-ring-svg" viewBox="0 0 176 176" width="176" height="176" fill="none" aria-hidden="true"><circle class="fin-ring-t acc" cx="88" cy="88" r="76"/></svg>`}
          <div class="fin-ring-c acc"><b class="num${total < 0 ? ' bad' : ''}">${total < 0 ? '−' : ''}${esc(D.fmtNum(Math.abs(total) / U.div, U.div > 1 ? 2 : 0))}</b><span>${esc(unit)}</span></div></div>
        ${legs ? `<div class="fin-legs">${legs}</div>` : ''}
      </div>
      ${P.sum > 0 ? `<p class="fin-note">${esc(t('fin.ringAcc', { u: unit }))}</p>` : ''}
      <div class="fin-l30"><div class="fin-w7h"><b>${esc(t('fin.last30'))}</b></div>${balLine(snaps, total, U)}</div>
    </section>`;
  }

  /* ------------------------------------------------------------------ */
  /* HISOBLAR · 2. HISOBLAR ro'yxati                                      */
  /* Qator bosilsa — qoldiq shu qatorning o'zida tahrirlanadi (finBalEdit,*/
  /* «+50k / −200k» ham). Nom/tur va o'chirish — ochilgan qator ichida.   */
  /* ------------------------------------------------------------------ */
  const accIco = (a, color) => { const ty = ACC_TYPES.includes(a.type) ? a.type : 'other'; return `<span class="ico fin-acc-ic"${color ? ` style="--cb:${color}"` : ''}>${D.ic(ACC_ICON[ty], 19)}</span>`; };
  function accRow(a, P) {
    P = P || accParts();
    const ty = ACC_TYPES.includes(a.type) ? a.type : 'other';
    return `<button class="fin-acc" data-act="finBalEdit" data-id="${esc(a.id)}" title="${esc(t('fin.balEditHint'))}">
      ${accIco(a, P.color[a.id])}
      <span class="fin-acc-b"><b>${esc(a.name)}</b><span>${esc(t('fin.type.' + ty))}</span></span>
      <span class="fin-acc-r"><b class="num${+a.balance < 0 ? ' bad' : ''}">${esc(plain(a.balance))}</b><span class="num">${esc(share(+a.balance, P.sum))}</span></span></button>`;
  }
  function accountsCard() {
    const accs = F().accounts;
    if (!accs.length) return '';
    const P = accParts();
    return `<section class="card fin-accs"><div class="card-head"><h2 class="title">${esc(t('fin.accounts'))}</h2></div>
      <p class="card-sub">${esc(t('fin.accSub'))}</p>
      <ul class="fin-al">${accs.map((a) => `<li id="finAccRow_${esc(a.id)}">${accRow(a, P)}</li>`).join('')}</ul>
      <button class="fin-plus" data-act="finAccEdit">${D.ic('plus', 17)} ${esc(t('fin.addAccount'))}</button></section>`;
  }

  /* ------------------------------------------------------------------ */
  /* HISOBLAR · 3. DOIMIY TO'LOVLAR                                       */
  /* Ular qoldiqdan o'zi chiqib ketadigan pul, shuning uchun shu yerda.   */
  /* ------------------------------------------------------------------ */
  /* To'lovda ikonka maydoni yo'q — nomidan taxmin qilinadi, topilmasa umumiy belgi. */
  const SUB_ICONS = [[/internet|wi ?fi|provayder/, 'wifi'], [/telefon|phone|aloqa|beeline|ucell|mobi|sim karta/, 'phone'],
    [/kommunal|ijara|arenda|kvartira|gaz|svet|elektr|uy /, 'home'], [/sport|zal|gym|fitnes/, 'dumbbell'],
    [/youtube|netflix|spotify|premium|kino|music|muzika|obuna|podpiska/, 'play'], [/kredit|bank|qarz|ipoteka/, 'bank'], [/mashina|avto|benzin|sugurta/, 'car']];
  function subIcon(name) {
    const n = D.translit.norm(name) + ' ';
    for (const [re, ic] of SUB_ICONS) if (re.test(n)) return ic;
    return 'refresh';
  }
  /** shu davr uchun to'langanmi: oxirgi to'lov shu oyda (haftalikda — shu hafta ichida) va navbatdagisi hali uzoq */
  function paidNow(s, n) {
    if (!s.last || n === null || n <= 1) return false;
    const td = D.today();
    return s.period === 'weekly' ? D.daysBetween(s.last, td) < 7 : D.monthKey(s.last) === D.monthKey(td);
  }
  function subsCard() {
    const subs = F().subs.slice().sort((a, b) => ((a.next || '9') < (b.next || '9') ? -1 : 1));
    const mo = D.sum(subs, monthlyEq);
    let h = `<section class="card fin-subs"><div class="card-head"><h2 class="title">${esc(t('fin.subs'))}</h2>${subs.length ? `<span class="fin-cnt strong num">${esc(t('fin.perMonth', { v: plain(mo) }))}</span>` : ''}</div>`;
    if (!subs.length) return h + emptyBox('refresh', t('fin.noSubs'), t('fin.noSubsS'), `<button class="btn" data-act="finSubEdit">${D.ic('plus', 16)} ${esc(t('fin.addSub'))}</button>`) + '</section>';
    h += `<p class="card-sub num">${esc(t('fin.perYear', { v: compact(mo * 12) + ' ' + curSym() }))}</p><ul class="fin-sl">`;
    for (const s of subs) {
      const a = acc(s.accountId), n = daysUntil(s.next), paid = paidNow(s, n);
      const meta = [t('fin.per.' + (PERIODS.includes(s.period) ? s.period : 'monthly')), a ? a.name : ''].filter(Boolean).join(' · ');
      h += `<li class="fin-sub">
        <div class="fin-sub-top" role="button" tabindex="0" data-act="finSubEdit" data-id="${esc(s.id)}" title="${esc(t('btn.edit'))}">
          <span class="ico">${D.ic(subIcon(s.name), 18)}</span>
          <span class="fin-sub-b"><b>${esc(s.name)}</b><span>${esc(meta)}</span></span>
          <span class="fin-sub-r"><b class="num">${esc(plain(s.amount))}</b>${paid ? `<span class="pill good">${esc(t('fin.paidPill'))}</span>` : duePill(n)}</span>
        </div>
        <div class="fin-sub-bot">
          <button class="fin-auto" data-act="finSubAuto" data-id="${esc(s.id)}" role="switch" aria-checked="${s.auto ? 'true' : 'false'}"><i class="toggle sm${s.auto ? ' on' : ''}"></i><span>${esc(t('fin.auto'))}</span></button>
          ${paid ? `<span class="fin-paid">${esc(t('fin.paidBtn'))}</span>` : `<button class="btn sm fin-pay" data-act="finSubPay" data-id="${esc(s.id)}">${esc(t('fin.payNow'))}</button>`}
        </div></li>`;
    }
    h += `</ul><button class="fin-plus" data-act="finSubEdit">${D.ic('plus', 17)} ${esc(t('fin.addSub'))}</button></section>`;
    return h;
  }

  const renderAccounts = () => safe(worthHero) + safe(accountsCard) + safe(subsCard);

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'finance', icon: 'wallet', order: 30, primary: false,
    render() {
      let sub = D.sub('finance', 'month');
      if (!TABS.includes(sub)) sub = 'month';
      return `<div class="fin">${segBar(sub)}${sub === 'accounts' ? renderAccounts() : renderMonth()}</div>`;
    },
    /* Sarlavha o'ngidagi pill — qaysi oy ko'rilayotgani; bosilsa oy tanlanadi. */
    topRight() { return `<button class="head-pill" data-act="finMonthPick" aria-label="${esc(t('fin.pickMonth'))}: ${esc(monthLabel(curMonth()))}"><span class="num">${esc(monthLabel(curMonth()))}</span>${D.ic('chevD', 15)}</button>`; },
    /* «+» — yangi yo'l emas: o'sha yozish kartasiga olib boradi (kerak bo'lsa
       «Oy» bo'limiga o'tib). Fokus shu bosishning o'zida qo'yiladi — telefonda
       klaviatura faqat bevosita bosishga javoban ochiladi. */
    fab() {
      if (D.sub('finance', 'month') !== 'month') D.setSub('finance', 'month');
      const a = D.$('#finAmount');
      if (!a) return;
      try { a.focus({ preventScroll: true }); } catch (e) { a.focus(); }
      if (a.scrollIntoView) a.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    mount() {
      syncAdd();
      clearTimeout(mountTimer);
      mountTimer = setTimeout(() => { mountTimer = null; try { runSubs(); } catch (e) { console.error(e); } }, 0);
    },
    unmount() { clearTimeout(mountTimer); mountTimer = null; },
  });

  /* ------------------------------------------------------------------ */
  /* actions: common                                                     */
  /* ------------------------------------------------------------------ */
  /* Oy almashsa: ro'yxat yana qisqa holatga qaytadi, ochiq oy oynasidagi yozuv ergashadi. */
  const monthGo = (mk) => { setMonth(mk); showAll = false; D.rerender(); syncMonthSheet(); };
  D.act.finMonthPrev = () => monthGo(addMonths(curMonth(), -1));
  D.act.finMonthNext = () => monthGo(addMonths(curMonth(), 1));
  D.act.finMonthToday = () => { monthGo(D.monthKey()); D.closeSheet(); };
  D.act.finMonthSet = (el) => { if (/^\d{4}-\d{2}$/.test(el.dataset.mk || '')) monthGo(el.dataset.mk); D.closeSheet(); };
  D.act.finMonthPick = () => D.sheet(`<div class="fin-ms" id="finMonthSheet">${monthSheetHtml()}</div>`, { title: t('fin.pickMonth') });
  D.act.finType = (el) => {
    draftType = el.dataset.type === 'in' ? 'in' : 'out';
    D.$$('#finTypeSeg button').forEach((b) => { const on = b.dataset.type === draftType; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    D.patch('finChips', chipsHtml());   // income and expense keep their own order and their own last pick
    D.patch('finWhat', esc(t(draftType === 'in' ? 'fin.whatIn' : 'fin.what')));
    syncAdd();
  };
  D.act.finChip = (el) => {
    D.ui.filters[catKey()] = el.dataset.cat; D.saveUi();
    D.$$('#finChips .chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === el.dataset.cat ? 'true' : 'false'));
    syncAdd();
  };
  D.act.finSearch = (el) => {
    searchQ = el.value || '';
    D.patch('finTxList', renderTxList(monthAgg(curMonth())));
  };
  D.act.finTxAll = () => { showAll = !showAll; D.patch('finTxList', renderTxList(monthAgg(curMonth()))); };
  /** «yana» qatoridagi sana yoki hisob o'zgardi — yig'iq holatda ham nima tanlangani ko'rinsin */
  /* Qayta chizilganda <details> yopilib qolmasin: brauzer qo'ygan `open`
     atributi markupda yo'q, ya'ni sinxron tortilishi ham uni olib tashlardi —
     odam izoh yozayotganda bo'lim yopilardi. */
  function moreWasOpen() { const el = typeof document !== 'undefined' && document.querySelector ? document.querySelector('.fin-more') : null; return !!(el && el.open); }
  D.act.finMore = () => {
    const el = D.$('#finMoreVal');
    if (el) el.textContent = moreText((D.$('#finDate') || {}).value, (D.$('#finAcc') || {}).value);
  };

  /* Yozilayotgan summa o'qilishi uchun uch xonadan ajratiladi: 20000 → 20 000.
     Ajratgich — ru-RU dagi uzilmas bo'shliq (U+00A0), ya'ni ekranda ko'ringan
     son bilan bir xil. parseAmount bo'shliqni baribir tashlab yuboradi.
     Faqat raqamdan iborat qiymatga tegiladi: «250k», «1.5m» kabi qisqa yozuv
     va nuqtali son o'z holicha qolsin — ular ham qabul qilinadi.
     Kursor guruhlashdan keyin o'z joyida qoladi: undan chapdagi RAQAMLAR
     sanaladi va yangi matnda o'sha sondagi raqamdan keyingi joy topiladi. */
  const NBSP = '\u00a0';
  D.act.finAmountIn = (el) => {
    groupDigits(el);
    // tahrir oynasidagi summa ham shu amalni ishlatadi — tekshiruv qatori esa faqat yozish kartasida
    if (el.id === 'finAmount') syncAdd();
  };
  function groupDigits(el) {
    const raw = String(el.value || '');
    if (!/^[\d\s\u00a0]*$/.test(raw)) return;
    const digits = raw.replace(/[\s\u00a0]/g, '');
    if (!digits) return;
    const out = digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    if (out === raw) return;
    const pos = el.selectionStart == null ? raw.length : el.selectionStart;
    const before = raw.slice(0, pos).replace(/[\s\u00a0]/g, '').length;
    el.value = out;
    let i = 0, n = 0;
    while (i < out.length && n < before) { if (out[i] >= '0' && out[i] <= '9') n++; i++; }
    try { el.setSelectionRange(i, i); } catch (e) { /* ba'zi brauzerlar ruxsat bermaydi */ }
  }

  /* ---- transactions ---- */
  D.act.finAdd = () => {
    const amount = parseAmount((D.$('#finAmount') || {}).value);
    if (!(amount > 0)) { D.toast(t('fin.badAmount')); const a = D.$('#finAmount'); if (a) a.focus(); return; }
    const catId = selCat();
    const accId = (D.$('#finAcc') || {}).value || null;
    const date = (D.$('#finDate') || {}).value || D.today();
    draftDate = date === D.today() ? null : date;
    const tx = { id: D.uid('f'), date, type: draftType, amount, cat: catId, note: ((D.$('#finNote') || {}).value || '').trim(), accountId: accId };
    F().tx.push(tx);
    applyTx(tx, 1);
    if (accId) snap();
    D.ui.filters.finAcc = accId; D.saveUi();
    if (D.monthKey(date) !== curMonth()) setMonth(D.monthKey(date));
    D.save(); D.rerender();
    D.toast(t('fin.wrote', { v: (tx.type === 'in' ? '+' : '−') + money(amount), c: catLabel(catId) }));
    /* Maydonlarni qo'lda tozalaymiz. D.rerender() o'zi tozalamaydi: morph
       INPUT ning qiymatiga faqat markupda `value` atributi bo'lsa tegadi, va
       fokusdagi maydonga umuman tegmaydi (odam yozayotgan matn yo'qolmasin
       degani). Natijada yozilgan summa qo'shilgandan keyin ham turib qolardi
       va keyingi yozuvga qo'shilib ketardi. */
    // fokus qaytarilmaydi: telefonda «Qo'shish»dan keyin klaviatura o'zi qayta ochilib ekranni yopardi
    const a = D.$('#finAmount'); if (a) { a.value = ''; if (document.activeElement === a) a.blur(); }
    const n = D.$('#finNote'); if (n) n.value = '';
    syncAdd();   // maydon bo'shadi — tugma yana xira, tekshiruv qatori yana izoh
  };
  D.act.finDelTx = (el, ev) => {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    const tx = F().tx.find((x) => x.id === el.dataset.id);
    if (!tx) return;
    D.closeModal();
    if (!tx.accountId) { D.remove(F().tx, tx.id, { label: t('fin.txDeleted') }); return; }
    removeUndo(F().tx, tx.id, t('fin.txDeleted'), (x) => { applyTx(x, -1); snap(); }, (x) => { applyTx(x, 1); snap(); });
  };
  D.act.finEditTx = (el) => {
    const tx = F().tx.find((x) => x.id === el.dataset.id);
    if (!tx) return;
    D.modal({
      title: t('fin.editTx'),
      body: `<div class="grid2">
        ${field(t('fin.type'), `<select class="sel" id="finE_type"><option value="out" ${tx.type !== 'in' ? 'selected' : ''}>${esc(t('fin.out'))}</option><option value="in" ${tx.type === 'in' ? 'selected' : ''}>${esc(t('fin.in'))}</option></select>`)}
        ${field(t('fin.amount'), `<input class="inp num" id="finE_amount" inputmode="decimal" value="${esc(D.fmtNum(tx.amount))}" data-input="finAmountIn" data-enter="finSaveTx" data-id="${esc(tx.id)}">`)}</div>
        ${field(t('fin.cat'), `<select class="sel" id="finE_cat">${catOptions(tx.cat)}</select>`)}
        ${field(t('common.note'), `<input class="inp" id="finE_note" value="${esc(tx.note || '')}" placeholder="${esc(t('fin.notePh'))}" data-enter="finSaveTx" data-id="${esc(tx.id)}">`)}
        <div class="grid2">${field(t('common.date'), `<input class="inp" type="date" id="finE_date" value="${esc(tx.date)}">`)}
        ${field(t('fin.account'), `<select class="sel" id="finE_acc">${accOptions(tx.accountId)}</select>`)}</div>`,
      actions: [
        { label: t('btn.delete'), act: 'finDelTx', danger: true, data: { id: tx.id } },
        { label: t('btn.cancel'), act: 'closeModal' },
        { label: t('btn.save'), act: 'finSaveTx', primary: true, data: { id: tx.id } },
      ],
    });
  };
  D.act.finSaveTx = (el) => {
    const tx = F().tx.find((x) => x.id === el.dataset.id);
    if (!tx) return;
    const amount = parseAmount((D.$('#finE_amount') || {}).value);
    if (!(amount > 0)) { D.toast(t('fin.badAmount')); return; }
    applyTx(tx, -1);
    tx.type = (D.$('#finE_type') || {}).value === 'in' ? 'in' : 'out';
    tx.amount = amount;
    tx.cat = (D.$('#finE_cat') || {}).value || tx.cat;
    tx.note = ((D.$('#finE_note') || {}).value || '').trim();
    tx.date = (D.$('#finE_date') || {}).value || tx.date;
    tx.accountId = (D.$('#finE_acc') || {}).value || null;
    applyTx(tx, 1);
    snap();
    D.closeModal(); D.save(); D.rerender();
    D.toast(t('fin.saved'));
  };

  /* ---- accounts ---- */
  // id holatdan keladi — selektorga qo'shilmaydi (buzuq id butun tahrirni yiqitardi)
  const balInp = (id) => { const row = document.getElementById('finAccRow_' + id); return row ? row.querySelector('input') : null; };
  D.act.finBalEdit = (el) => {
    const a = acc(el.dataset.id);
    if (!a) return;
    // close any other open inline editor first (ids must stay unique)
    for (const o of F().accounts) if (o.id !== a.id && balInp(o.id)) D.patch('finAccRow_' + o.id, accRow(o));
    /* Ochilgan qator: qoldiq maydoni + saqlash/bekor, ostida nom-tur tahriri va
       o'chirish. Ular ilgari har qatorda doim turardi; endi qator toza, amallar
       esa bir bosish ichkarida. */
    const id = esc(a.id);
    D.patch('finAccRow_' + a.id, `<div class="fin-acc-ed">
      ${accIco(a, accParts().color[a.id])}
      <div class="fin-acc-edb"><b class="ellipsis">${esc(a.name)}</b>
        <input class="inp num" id="finBalInp" value="${esc(Math.round(+a.balance || 0))}" inputmode="text" placeholder="${esc(t('fin.balHint'))}" aria-label="${esc(t('fin.balEditHint'))}" data-enter="finBalSave" data-id="${id}" autocomplete="off">
        <div class="fin-acc-eda">
          <button class="fin-link" data-act="finAccEdit" data-id="${id}">${D.ic('edit', 14)} ${esc(t('fin.accRename'))}</button>
          <button class="fin-link bad" data-act="finAccDel" data-id="${id}">${D.ic('trash', 14)} ${esc(t('btn.delete'))}</button></div></div>
      <button class="fin-ib ok" data-act="finBalSave" data-id="${id}" aria-label="${esc(t('btn.save'))}">${D.ic('check', 19)}</button>
      <button class="fin-ib" data-act="finBalCancel" data-id="${id}" aria-label="${esc(t('btn.cancel'))}">${D.ic('x', 18)}</button></div>`);
    const inp = balInp(a.id); if (inp) { inp.focus(); inp.select && inp.select(); }
  };
  D.act.finBalCancel = (el) => { const a = acc(el.dataset.id); if (a) D.patch('finAccRow_' + a.id, accRow(a)); };
  D.act.finBalSave = (el) => {
    const a = acc(el.dataset.id);
    const inp = balInp(el.dataset.id);
    if (!a || !inp) return;
    const raw = inp.value, v = parseAmount(raw);
    if (isNaN(v)) { D.toast(t('fin.badAmount')); return; }
    a.balance = isDelta(raw) ? (+a.balance || 0) + v : v;
    snap(); D.save(); D.rerender();
    D.toast(t('fin.balUpdated'));
  };
  D.act.finAccEdit = (el) => {
    const a = acc(el.dataset.id);
    D.modal({
      title: t(a ? 'fin.editAccount' : 'fin.addAccount'),
      body: `${field(t('fin.accName'), `<input class="inp" id="finA_name" value="${esc(a ? a.name : '')}" placeholder="${esc(t('fin.accName'))}" data-enter="finAccSave" ${a ? `data-id="${esc(a.id)}"` : ''}>`)}
        <div class="grid2">${field(t('fin.accType'), `<select class="sel" id="finA_type">${ACC_TYPES.map((k) => `<option value="${k}" ${(a ? a.type : 'cash') === k ? 'selected' : ''}>${esc(t('fin.type.' + k))}</option>`).join('')}</select>`)}
        ${field(t('fin.balance'), `<input class="inp num" id="finA_bal" inputmode="decimal" value="${a ? esc(Math.round(+a.balance || 0)) : ''}" placeholder="0" data-enter="finAccSave" ${a ? `data-id="${esc(a.id)}"` : ''}>`)}</div>`,
      actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t(a ? 'btn.save' : 'btn.add'), act: 'finAccSave', primary: true, data: a ? { id: a.id } : undefined }],
    });
  };
  D.act.finAccSave = (el) => {
    const name = ((D.$('#finA_name') || {}).value || '').trim();
    if (!name) { D.toast(t('fin.needName')); return; }
    const raw = (D.$('#finA_bal') || {}).value;
    let bal = parseAmount(raw);
    // noto'g'ri yozilgan balans jimgina 0 bo'lib qolmasin
    if (isNaN(bal)) { if (String(raw || '').trim()) { D.toast(t('fin.badAmount')); return; } bal = 0; }
    const type = (D.$('#finA_type') || {}).value;
    let a = acc(el.dataset.id);
    if (a) { a.name = name; a.type = ACC_TYPES.includes(type) ? type : 'other'; a.balance = bal; }
    else F().accounts.push({ id: D.uid('a'), name, type: ACC_TYPES.includes(type) ? type : 'other', balance: bal });
    snap(); D.closeModal(); D.save(); D.rerender();
    D.toast(t('fin.saved'));
  };
  D.act.finAccDel = (el) => {
    removeUndo(F().accounts, el.dataset.id, t('fin.accDeleted'), () => snap(), () => snap());
  };

  /* ---- recurring payments ---- */
  D.act.finSubEdit = (el) => {
    const s = F().subs.find((x) => x.id === el.dataset.id);
    const idAttr = s ? `data-id="${esc(s.id)}"` : '';
    D.modal({
      title: t(s ? 'fin.editSub' : 'fin.addSub'),
      body: `${field(t('common.name'), `<input class="inp" id="finS_name" value="${esc(s ? s.name : '')}" placeholder="${esc(t('fin.subNamePh'))}" data-enter="finSubSave" ${idAttr}>`)}
        <div class="grid2">${field(t('fin.amount'), `<input class="inp num" id="finS_amount" inputmode="decimal" value="${s ? esc(D.fmtNum(s.amount)) : ''}" placeholder="${esc(t('fin.amountPh'))}" data-input="finAmountIn" data-enter="finSubSave" ${idAttr}>`)}
        ${field(t('fin.period'), `<select class="sel" id="finS_period">${PERIODS.map((p) => `<option value="${p}" ${(s ? s.period : 'monthly') === p ? 'selected' : ''}>${esc(t('fin.per.' + p))}</option>`).join('')}</select>`)}</div>
        <div class="grid2">${field(t('fin.next'), `<input class="inp" type="date" id="finS_next" value="${esc(s && s.next ? s.next : D.today())}">`)}
        ${field(t('fin.account'), `<select class="sel" id="finS_acc">${accOptions(s ? s.accountId : D.ui.filters.finAcc)}</select>`)}</div>
        <label class="row fin-check"><input type="checkbox" class="chk" id="finS_auto" ${s && s.auto ? 'checked' : ''}><span>${esc(t('fin.auto'))}</span></label>`,
      // o'chirish qatordan shu oynaga ko'chdi (yozuv tahriridagi kabi)
      actions: (s ? [{ label: t('btn.delete'), act: 'finSubDel', danger: true, data: { id: s.id } }] : [])
        .concat([{ label: t('btn.cancel'), act: 'closeModal' }, { label: t(s ? 'btn.save' : 'btn.add'), act: 'finSubSave', primary: true, data: s ? { id: s.id } : undefined }]),
    });
  };
  D.act.finSubSave = (el) => {
    const name = ((D.$('#finS_name') || {}).value || '').trim();
    if (!name) { D.toast(t('fin.needName')); return; }
    const amount = parseAmount((D.$('#finS_amount') || {}).value);
    if (!(amount > 0)) { D.toast(t('fin.badAmount')); return; }
    const period = (D.$('#finS_period') || {}).value, next = (D.$('#finS_next') || {}).value || null;
    const accountId = (D.$('#finS_acc') || {}).value || null, auto = !!((D.$('#finS_auto') || {}).checked);
    let s = F().subs.find((x) => x.id === el.dataset.id);
    const patch = { name, amount, period: PERIODS.includes(period) ? period : 'monthly', next, accountId, auto, day: next ? D.parseKey(next).d : null };
    if (s) Object.assign(s, patch);
    else F().subs.push({ id: D.uid('s'), ...patch, last: null });
    D.closeModal(); D.save(); D.rerender();
    D.toast(t('fin.saved'));
    runSubs();
  };
  D.act.finSubAuto = (el) => {
    const s = F().subs.find((x) => x.id === el.dataset.id);
    if (!s) return;
    s.auto = !s.auto;
    D.save(); D.rerender();
    if (s.auto) runSubs();
  };
  D.act.finSubPay = (el) => {
    const s = F().subs.find((x) => x.id === el.dataset.id);
    if (!s) return;
    const today = D.today();
    paySub(s, today);
    if (s.next) { let g = 0; const day = Math.max(+s.day || 0, D.parseKey(s.next).d); do { s.next = advance(s.next, s.period, day); } while (s.next <= today && g++ < 24); }
    else s.next = advance(today, s.period);
    snap(); D.save(); D.rerender();
    D.toast(t('fin.paid', { name: s.name }));
  };
  D.act.finSubDel = (el) => { D.closeModal(); D.remove(F().subs, el.dataset.id, { label: t('fin.subDeleted') }); };
})();
