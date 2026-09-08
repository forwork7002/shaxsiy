/* =====================================================================
   Dash — Молия (finance): month ledger · accounts / net worth · subscriptions
   (auto-deduct engine) · envelope budgets · wishlist
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* strings                                                             */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'fin.tab.month': 'Oy', 'fin.tab.accounts': 'Hisoblar', 'fin.tab.subs': 'Obunalar', 'fin.tab.budget': 'Byudjet', 'fin.tab.wishlist': 'Xohishlar',
      'fin.net': 'Sof natija', 'fin.income': 'Kirim', 'fin.expense': 'Chiqim', 'fin.savings': "Jamg'arma", 'fin.savingsHint': 'sof ÷ kirim',
      'fin.daily': 'Kunlik xarajat', 'fin.byCat': "Kategoriyalar bo'yicha", 'fin.noExpense': "Bu oyda chiqim yo'q",
      'fin.add': 'Yangi yozuv', 'fin.out': 'Chiqim', 'fin.in': 'Kirim', 'fin.amount': 'Summa', 'fin.amountPh': '1 250 000 · 250k · 1.5m',
      'fin.cat': 'Kategoriya', 'fin.notePh': 'Izoh (ixtiyoriy)', 'fin.account': 'Hisob', 'fin.noAccount': 'Hisobsiz',
      'fin.txs': 'Yozuvlar', 'fin.searchPh': 'Izoh yoki kategoriya…', 'fin.emptyMonth': "Bu oyda yozuv yo'q", 'fin.emptySearch': 'Topilmadi',
      'fin.editTx': 'Yozuvni tahrirlash', 'fin.txDeleted': "Yozuv o'chirildi", 'fin.added': "Qo'shildi", 'fin.saved': 'Saqlandi',
      'fin.badAmount': "Summani to'g'ri kiriting", 'fin.needName': 'Nom kiriting', 'fin.type': 'Turi',
      'fin.hideAmounts': 'Summalarni yashirish', 'fin.showAmounts': "Summalarni ko'rsatish",
      'fin.catsHint': "Kategoriyalar Sozlash bo'limida tahrirlanadi", 'fin.txCount': '{n} ta yozuv',
      'fin.netWorth': 'Sof boylik', 'fin.sinceFirst': 'boshidan', 'fin.since30': '30 kun', 'fin.allocation': 'Taqsimot', 'fin.accounts': 'Hisoblar',
      'fin.addAccount': "Hisob qo'shish", 'fin.editAccount': 'Hisobni tahrirlash', 'fin.accName': 'Hisob nomi', 'fin.accType': 'Turi', 'fin.balance': 'Qoldiq',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Naqd', 'fin.type.bank': 'Bank', 'fin.type.card': 'Karta', 'fin.type.crypto': 'Kripto', 'fin.type.other': 'Boshqa',
      'fin.noAccounts': "Hali hisob yo'q — birinchi hisobni qo'shing", 'fin.accDeleted': "Hisob o'chirildi", 'fin.snapshots': 'nuqta', 'fin.balUpdated': 'Qoldiq yangilandi',
      'fin.subs': 'Obunalar', 'fin.monthlyBurn': 'Oylik obunalar', 'fin.perYear': 'yiliga ≈ {v}', 'fin.subCount': '{n} ta obuna',
      'fin.addSub': "Obuna qo'shish", 'fin.editSub': 'Obunani tahrirlash', 'fin.period': 'Davr', 'fin.per.monthly': 'Oylik', 'fin.per.yearly': 'Yillik', 'fin.per.weekly': 'Haftalik',
      'fin.next': "Keyingi to'lov", 'fin.auto': 'Avto-yechish', 'fin.payNow': "To'lash", 'fin.paid': "To'landi: {name}",
      'fin.autoDone': "{n} ta obuna avtomatik to'landi — {sum}", 'fin.dueToday': 'Bugun', 'fin.dueTomorrow': 'Ertaga', 'fin.inDays': '{n} kunda', 'fin.late': '{n} kun kechikdi',
      'fin.noSubs': "Obunalar yo'q", 'fin.subCat': 'Obuna', 'fin.mo': '/oy', 'fin.noDate': "sana yo'q", 'fin.subDeleted': "Obuna o'chirildi",
      'fin.budget': 'Byudjet', 'fin.spent': 'Sarflandi', 'fin.left': 'Qoldi', 'fin.perDay': 'kuniga', 'fin.copyLast': "O'tgan oydan nusxalash",
      'fin.copied': 'Byudjet nusxalandi', 'fin.noLast': "O'tgan oyda byudjet yo'q", 'fin.budgetTotal': 'Jami byudjet', 'fin.budgetPh': 'Limit',
      'fin.over': 'oshdi', 'fin.daysLeft': '{n} kun qoldi', 'fin.noBudget': 'Limit belgilanmagan', 'fin.monthOver': 'Oy tugagan',
      'fin.wishlist': 'Xohishlar', 'fin.wishTotal': 'Xohishlar jami', 'fin.ofNw': 'sof boylikdan', 'fin.monthsToSave': "≈ {n} oy yig'ish",
      'fin.addWish': "Xohish qo'shish", 'fin.wishName': 'Nomi', 'fin.noWish': "Hali xohish yo'q", 'fin.buy': 'Sotib olindi', 'fin.buyTitle': 'Sotib olish: {name}',
      'fin.bought': 'Xarajat sifatida yozildi', 'fin.avgNet': "o'rtacha oylik sof (3 oy)", 'fin.wishDeleted': "Xohish o'chirildi", 'fin.searchSub': 'Moliya · {d}',
      'fin.prevMonth': 'Oldingi oy', 'fin.nextMonth': 'Keyingi oy', 'fin.subNamePh': 'Netflix, Internet…', 'fin.balEditHint': 'Qoldiq: +/- bilan farq, aks holda yangi summa',
      'fin.dailyMax': 'eng katta kun', 'fin.noSnaps': "Qoldiq o'zgarganda tarix shu yerda chiziladi",
    },
    uzk: {
      'fin.tab.month': 'Ой', 'fin.tab.accounts': 'Ҳисоб', 'fin.tab.subs': 'Обуна', 'fin.tab.budget': 'Бюджет', 'fin.tab.wishlist': 'Хоҳиш',
      'fin.net': 'Соф натижа', 'fin.income': 'Кирим', 'fin.expense': 'Чиқим', 'fin.savings': 'Жамғарма', 'fin.savingsHint': 'соф ÷ кирим',
      'fin.daily': 'Кунлик харажат', 'fin.byCat': 'Категориялар бўйича', 'fin.noExpense': 'Бу ойда чиқим йўқ',
      'fin.add': 'Янги ёзув', 'fin.out': 'Чиқим', 'fin.in': 'Кирим', 'fin.amount': 'Сумма', 'fin.amountPh': '1 250 000 · 250k · 1.5m',
      'fin.cat': 'Категория', 'fin.notePh': 'Изоҳ (ихтиёрий)', 'fin.account': 'Ҳисоб', 'fin.noAccount': 'Ҳисобсиз',
      'fin.txs': 'Ёзувлар', 'fin.searchPh': 'Изоҳ ёки категория…', 'fin.emptyMonth': 'Бу ойда ёзув йўқ', 'fin.emptySearch': 'Топилмади',
      'fin.editTx': 'Ёзувни таҳрирлаш', 'fin.txDeleted': 'Ёзув ўчирилди', 'fin.added': 'Қўшилди', 'fin.saved': 'Сақланди',
      'fin.badAmount': 'Суммани тўғри киритинг', 'fin.needName': 'Ном киритинг', 'fin.type': 'Тури',
      'fin.hideAmounts': 'Суммаларни яшириш', 'fin.showAmounts': 'Суммаларни кўрсатиш',
      'fin.catsHint': 'Категориялар Созлаш бўлимида таҳрирланади', 'fin.txCount': '{n} та ёзув',
      'fin.netWorth': 'Соф бойлик', 'fin.sinceFirst': 'бошидан', 'fin.since30': '30 кун', 'fin.allocation': 'Тақсимот', 'fin.accounts': 'Ҳисоблар',
      'fin.addAccount': 'Ҳисоб қўшиш', 'fin.editAccount': 'Ҳисобни таҳрирлаш', 'fin.accName': 'Ҳисоб номи', 'fin.accType': 'Тури', 'fin.balance': 'Қолдиқ',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Нақд', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Бошқа',
      'fin.noAccounts': 'Ҳали ҳисоб йўқ — биринчи ҳисобни қўшинг', 'fin.accDeleted': 'Ҳисоб ўчирилди', 'fin.snapshots': 'нуқта', 'fin.balUpdated': 'Қолдиқ янгиланди',
      'fin.subs': 'Обуналар', 'fin.monthlyBurn': 'Ойлик обуналар', 'fin.perYear': 'йилига ≈ {v}', 'fin.subCount': '{n} та обуна',
      'fin.addSub': 'Обуна қўшиш', 'fin.editSub': 'Обунани таҳрирлаш', 'fin.period': 'Давр', 'fin.per.monthly': 'Ойлик', 'fin.per.yearly': 'Йиллик', 'fin.per.weekly': 'Ҳафталик',
      'fin.next': 'Кейинги тўлов', 'fin.auto': 'Авто-ечиш', 'fin.payNow': 'Тўлаш', 'fin.paid': 'Тўланди: {name}',
      'fin.autoDone': '{n} та обуна автоматик тўланди — {sum}', 'fin.dueToday': 'Бугун', 'fin.dueTomorrow': 'Эртага', 'fin.inDays': '{n} кунда', 'fin.late': '{n} кун кечикди',
      'fin.noSubs': 'Обуналар йўқ', 'fin.subCat': 'Обуна', 'fin.mo': '/ой', 'fin.noDate': 'сана йўқ', 'fin.subDeleted': 'Обуна ўчирилди',
      'fin.budget': 'Бюджет', 'fin.spent': 'Сарфланди', 'fin.left': 'Қолди', 'fin.perDay': 'кунига', 'fin.copyLast': 'Ўтган ойдан нусхалаш',
      'fin.copied': 'Бюджет нусхаланди', 'fin.noLast': 'Ўтган ойда бюджет йўқ', 'fin.budgetTotal': 'Жами бюджет', 'fin.budgetPh': 'Лимит',
      'fin.over': 'ошди', 'fin.daysLeft': '{n} кун қолди', 'fin.noBudget': 'Лимит белгиланмаган', 'fin.monthOver': 'Ой тугаган',
      'fin.wishlist': 'Хоҳишлар', 'fin.wishTotal': 'Хоҳишлар жами', 'fin.ofNw': 'соф бойликдан', 'fin.monthsToSave': '≈ {n} ой йиғиш',
      'fin.addWish': 'Хоҳиш қўшиш', 'fin.wishName': 'Номи', 'fin.noWish': 'Ҳали хоҳиш йўқ', 'fin.buy': 'Сотиб олинди', 'fin.buyTitle': 'Сотиб олиш: {name}',
      'fin.bought': 'Харажат сифатида ёзилди', 'fin.avgNet': 'ўртача ойлик соф (3 ой)', 'fin.wishDeleted': 'Хоҳиш ўчирилди', 'fin.searchSub': 'Молия · {d}',
      'fin.prevMonth': 'Олдинги ой', 'fin.nextMonth': 'Кейинги ой', 'fin.subNamePh': 'Netflix, Интернет…', 'fin.balEditHint': 'Қолдиқ: +/- билан фарқ, акс ҳолда янги сумма',
      'fin.dailyMax': 'энг катта кун', 'fin.noSnaps': 'Қолдиқ ўзгарганда тарих шу ерда чизилади',
    },
    ru: {
      'fin.tab.month': 'Месяц', 'fin.tab.accounts': 'Счета', 'fin.tab.subs': 'Подписки', 'fin.tab.budget': 'Бюджет', 'fin.tab.wishlist': 'Желания',
      'fin.net': 'Чистый итог', 'fin.income': 'Доход', 'fin.expense': 'Расход', 'fin.savings': 'Сбережения', 'fin.savingsHint': 'итог ÷ доход',
      'fin.daily': 'Расходы по дням', 'fin.byCat': 'По категориям', 'fin.noExpense': 'В этом месяце нет расходов',
      'fin.add': 'Новая запись', 'fin.out': 'Расход', 'fin.in': 'Доход', 'fin.amount': 'Сумма', 'fin.amountPh': '1 250 000 · 250k · 1.5m',
      'fin.cat': 'Категория', 'fin.notePh': 'Заметка', 'fin.account': 'Счёт', 'fin.noAccount': 'Без счёта',
      'fin.txs': 'Записи', 'fin.searchPh': 'Заметка или категория…', 'fin.emptyMonth': 'В этом месяце нет записей', 'fin.emptySearch': 'Ничего не найдено',
      'fin.editTx': 'Изменить запись', 'fin.txDeleted': 'Запись удалена', 'fin.added': 'Добавлено', 'fin.saved': 'Сохранено',
      'fin.badAmount': 'Введите корректную сумму', 'fin.needName': 'Введите название', 'fin.type': 'Тип',
      'fin.hideAmounts': 'Скрыть суммы', 'fin.showAmounts': 'Показать суммы',
      'fin.catsHint': 'Категории редактируются в Настройках', 'fin.txCount': 'записей: {n}',
      'fin.netWorth': 'Чистый капитал', 'fin.sinceFirst': 'с начала', 'fin.since30': '30 дней', 'fin.allocation': 'Распределение', 'fin.accounts': 'Счета',
      'fin.addAccount': 'Добавить счёт', 'fin.editAccount': 'Изменить счёт', 'fin.accName': 'Название счёта', 'fin.accType': 'Тип', 'fin.balance': 'Баланс',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Наличные', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Другое',
      'fin.noAccounts': 'Счетов пока нет — добавьте первый', 'fin.accDeleted': 'Счёт удалён', 'fin.snapshots': 'точек', 'fin.balUpdated': 'Баланс обновлён',
      'fin.subs': 'Подписки', 'fin.monthlyBurn': 'Подписки в месяц', 'fin.perYear': '≈ {v} в год', 'fin.subCount': 'подписок: {n}',
      'fin.addSub': 'Добавить подписку', 'fin.editSub': 'Изменить подписку', 'fin.period': 'Период', 'fin.per.monthly': 'Ежемесячно', 'fin.per.yearly': 'Ежегодно', 'fin.per.weekly': 'Еженедельно',
      'fin.next': 'Следующий платёж', 'fin.auto': 'Автосписание', 'fin.payNow': 'Оплатить', 'fin.paid': 'Оплачено: {name}',
      'fin.autoDone': 'Автосписано подписок: {n} — {sum}', 'fin.dueToday': 'Сегодня', 'fin.dueTomorrow': 'Завтра', 'fin.inDays': 'через {n} дн.', 'fin.late': 'просрочено {n} дн.',
      'fin.noSubs': 'Подписок нет', 'fin.subCat': 'Подписка', 'fin.mo': '/мес', 'fin.noDate': 'без даты', 'fin.subDeleted': 'Подписка удалена',
      'fin.budget': 'Бюджет', 'fin.spent': 'Потрачено', 'fin.left': 'Осталось', 'fin.perDay': 'в день', 'fin.copyLast': 'Скопировать прошлый месяц',
      'fin.copied': 'Бюджет скопирован', 'fin.noLast': 'В прошлом месяце нет бюджета', 'fin.budgetTotal': 'Общий бюджет', 'fin.budgetPh': 'Лимит',
      'fin.over': 'превышен', 'fin.daysLeft': 'осталось {n} дн.', 'fin.noBudget': 'Лимит не задан', 'fin.monthOver': 'Месяц завершён',
      'fin.wishlist': 'Список желаний', 'fin.wishTotal': 'Сумма желаний', 'fin.ofNw': 'от капитала', 'fin.monthsToSave': '≈ {n} мес. копить',
      'fin.addWish': 'Добавить желание', 'fin.wishName': 'Название', 'fin.noWish': 'Пока нет желаний', 'fin.buy': 'Куплено', 'fin.buyTitle': 'Покупка: {name}',
      'fin.bought': 'Записано как расход', 'fin.avgNet': 'средний чистый итог (3 мес.)', 'fin.wishDeleted': 'Желание удалено', 'fin.searchSub': 'Финансы · {d}',
      'fin.prevMonth': 'Предыдущий месяц', 'fin.nextMonth': 'Следующий месяц', 'fin.subNamePh': 'Netflix, Интернет…', 'fin.balEditHint': 'Баланс: с +/- — изменение, иначе новая сумма',
      'fin.dailyMax': 'пик за день', 'fin.noSnaps': 'История появится, когда изменится баланс',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const TABS = ['month', 'accounts', 'subs', 'budget', 'wishlist'];
  const ACC_TYPES = ['cash', 'bank', 'card', 'crypto', 'other'];
  const ACC_ICON = { cash: 'wallet', bank: 'layers', card: 'keyboard', crypto: 'globe', other: 'star' };
  const ACC_COLOR = { cash: 'var(--success)', bank: 'var(--info)', card: 'var(--violet)', crypto: 'var(--warning)', other: 'var(--boshqa)' };
  const PERIODS = ['monthly', 'yearly', 'weekly'];
  const CAT_PALETTE = ['var(--accent)', 'var(--info)', 'var(--violet)', 'var(--warning)', 'var(--qalb)', 'var(--aql)', 'var(--tana)', 'var(--ruh)', 'var(--boshqa)'];

  const F = () => D.S.finance;
  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const money = (n, o) => D.fmtMoney(n, o);
  const signed = (n) => (n > 0 ? '+' : '') + money(n);

  // module-local UI state (device only, not persisted)
  let draftType = 'out';
  let draftDate = null; // last used date in the add form (kept while it is not today)
  let searchQ = '';
  let mountTimer = null;

  /** "1 250 000", "1.250.000", "1,5m", "250k", "+50000" → number (NaN when unparseable) */
  function parseAmount(raw) {
    let s = String(raw ?? '').trim().toLowerCase();
    if (!s) return NaN;
    s = s.replace(/[\s _'’]/g, '').replace(/so'?m|сўм|сум|uzs|usd|eur|rub|kzt|[$€₽₸]/g, '');
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

  const cat = (id) => F().cats.find((c) => c.id === id) || { id, name: id || '—', icon: '📦' };
  const catLabel = (id) => { const c = cat(id); return (c.icon ? c.icon + ' ' : '') + c.name; };
  const acc = (id) => (id ? F().accounts.find((a) => a.id === id) : null);
  const effect = (tx) => (tx.type === 'in' ? 1 : -1) * (+tx.amount || 0);
  function applyTx(tx, dir) { // dir +1 apply, -1 revert
    const a = acc(tx.accountId);
    if (a) a.balance = (+a.balance || 0) + dir * effect(tx);
  }
  const netWorth = () => D.sum(F().accounts, (a) => a.balance);

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
  function avgNet3() { // average monthly net of the last 3 full months (incl. current)
    const now = D.monthKey();
    let s = 0, n = 0;
    for (let i = 0; i < 3; i++) { const a = monthAgg(addMonths(now, -i)); if (a.list.length) { s += a.net; n++; } }
    return n ? s / n : 0;
  }
  function daysLeftIn(mk) {
    const now = D.monthKey(), dim = D.daysInMonth(mk);
    if (mk < now) return 0;
    if (mk > now) return dim;
    return dim - D.parseKey(D.today()).d + 1;
  }
  const daysUntil = (key) => (key ? D.daysBetween(D.today(), key) : null);
  function duePill(n) {
    if (n === null) return `<span class="pill">${t('fin.noDate')}</span>`;
    const cls = n < 0 ? 'bad' : n <= 3 ? 'bad' : n <= 7 ? 'on' : '';
    const txt = n < 0 ? t('fin.late', { n: -n }) : n === 0 ? t('fin.dueToday') : n === 1 ? t('fin.dueTomorrow') : t('fin.inDays', { n });
    return `<span class="pill ${cls}">${esc(txt)}</span>`;
  }
  function ensureSubCat() {
    let c = F().cats.find((x) => x.id === 'obuna');
    if (!c) { c = { id: 'obuna', name: t('fin.subCat'), icon: '🔁' }; F().cats.push(c); }
    return c.id;
  }

  /* ------------------------------------------------------------------ */
  /* subscription auto-deduct engine                                     */
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
  D.on('boot', () => { try { runSubs(); } catch (e) { console.error(e); } });
  D.on('day:changed', () => { try { runSubs(); } catch (e) { console.error(e); } });

  /* ------------------------------------------------------------------ */
  /* shared render bits                                                  */
  /* ------------------------------------------------------------------ */
  function topBar(sub) {
    const show = D.S.settings.showAmounts !== false;
    return `<div class="fin-top">
      <div class="seg">${TABS.map((x) => `<button class="${sub === x ? 'on' : ''}" data-act="sub" data-view="finance" data-sub="${x}">${esc(t('fin.tab.' + x))}</button>`).join('')}</div>
      <button class="btn icon fin-eye ${show ? '' : 'off'}" data-act="finToggleAmounts" aria-label="${esc(t(show ? 'fin.hideAmounts' : 'fin.showAmounts'))}" title="${esc(t(show ? 'fin.hideAmounts' : 'fin.showAmounts'))}">${D.ic(show ? 'eye' : 'eyeOff', 20)}</button>
    </div>`;
  }
  function monthNav(mk) {
    const isNow = mk === D.monthKey();
    return `<div class="date-nav fin-nav">
      <button class="btn icon sq" data-act="finMonthPrev" aria-label="${esc(t('fin.prevMonth'))}" title="${esc(t('fin.prevMonth'))}">${D.ic('chevL', 20)}</button>
      <div class="label"><span class="fin-nav-lbl">${esc(D.fmtDate(mk + '-01', 'month'))}</span>${isNow ? '' : `<button class="fin-nav-today" data-act="finMonthToday">${esc(t('btn.today'))}</button>`}</div>
      <button class="btn icon sq" data-act="finMonthNext" aria-label="${esc(t('fin.nextMonth'))}" title="${esc(t('fin.nextMonth'))}">${D.ic('chevR', 20)}</button>
    </div>`;
  }
  const catOptions = (sel) => F().cats.map((c) => `<option value="${esc(c.id)}" ${c.id === sel ? 'selected' : ''}>${esc((c.icon ? c.icon + ' ' : '') + c.name)}</option>`).join('');
  const accOptions = (sel, none) => `<option value="">${esc(none || t('fin.noAccount'))}</option>` + F().accounts.map((a) => `<option value="${esc(a.id)}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)} · ${esc(money(a.balance))}</option>`).join('');
  const field = (label, inner) => `<div class="field"><label class="field-label">${esc(label)}</label>${inner}</div>`;

  /* ------------------------------------------------------------------ */
  /* MONTH                                                               */
  /* ------------------------------------------------------------------ */
  function renderMonth() {
    const mk = curMonth(), A = monthAgg(mk);
    const rate = A.inc > 0 ? (A.net / A.inc) * 100 : null;
    const netCls = A.net > 0 ? 'good' : A.net < 0 ? 'bad' : '';
    const rateCls = rate === null ? '' : rate >= 20 ? 'good' : rate >= 0 ? 'on' : 'bad';

    // daily spend bars
    const dim = D.daysInMonth(mk), today = D.today();
    const vals = [], labels = [], colors = [];
    for (let d = 1; d <= dim; d++) {
      const k = mk + '-' + D.pad2(d);
      vals.push(Math.round(A.byDay[k] || 0));
      labels.push(d === 1 || d % 5 === 0 ? String(d) : '');
      colors.push(k === today ? 'var(--text)' : k > today ? 'var(--line3)' : 'var(--accent)');
    }

    const maxDay = vals.length ? Math.max(...vals) : 0;

    // categories
    const cats = Object.entries(A.byCat).sort((a, b) => b[1] - a[1]);
    const maxCat = cats.length ? cats[0][1] : 0;

    let h = monthNav(mk);
    h += `<div class="card fin-kpi">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.net'))}</div>
        <span class="pill ${rateCls}" title="${esc(t('fin.savingsHint'))}">${esc(t('fin.savings'))} ${rate === null ? '—' : D.fmtPct(rate)}</span></div>
      <div class="kpi"><div class="kpi-num num ${netCls}">${esc(signed(A.net))}</div></div>
      <div class="grid2 mt">
        <div class="stat"><div class="stat-num num good">${esc(money(A.inc))}</div><div class="stat-label">${esc(t('fin.income'))}</div></div>
        <div class="stat"><div class="stat-num num">${esc(money(A.out))}</div><div class="stat-label">${esc(t('fin.expense'))}</div></div>
      </div>
      <div class="fin-spark mt"><div class="row between mb-s"><div class="eyebrow">${esc(t('fin.daily'))}</div>${maxDay ? `<span class="small muted num">${esc(t('fin.dailyMax'))} ${esc(money(maxDay))}</span>` : ''}</div>${D.chart.bars({ values: vals, labels, colors, height: 56 })}</div>
    </div>`;

    h += `<div class="card"><div class="card-head"><div class="title">${D.ic('chart', 16)} ${esc(t('fin.byCat'))}</div><span class="small muted num">${esc(money(A.out))}</span></div>`;
    if (!cats.length) h += `<div class="empty">${esc(t('fin.noExpense'))}</div>`;
    else h += cats.map(([id, v], i) => D.chart.hbar({ label: catLabel(id), value: v, max: maxCat, color: CAT_PALETTE[i % CAT_PALETTE.length], right: `${esc(money(v))} <span class="muted">${D.fmtPct(A.out ? (v / A.out) * 100 : 0)}</span>` })).join('');
    h += `<div class="fin-hint"><button class="fin-link" data-act="go" data-view="settings">${D.ic('gear', 13)} ${esc(t('fin.catsHint'))}</button></div></div>`;

    // add form
    const hasAcc = F().accounts.length > 0;
    h += `<div class="card fin-form">
      <div class="card-head"><div class="title">${D.ic('plus', 16)} ${esc(t('fin.add'))}</div>
        <div class="seg compact" id="finTypeSeg">
          <button class="${draftType === 'out' ? 'on' : ''}" data-act="finType" data-type="out">${esc(t('fin.out'))}</button>
          <button class="${draftType === 'in' ? 'on' : ''}" data-act="finType" data-type="in">${esc(t('fin.in'))}</button></div></div>
      <div class="fin-form-grid">
        <input class="inp num" id="finAmount" inputmode="decimal" autocomplete="off" placeholder="${esc(t('fin.amountPh'))}" aria-label="${esc(t('fin.amount'))}" data-enter="finAdd">
        <select class="sel" id="finCat" aria-label="${esc(t('fin.cat'))}">${catOptions(D.ui.filters.finCat)}</select>
        <input class="inp" id="finNote" placeholder="${esc(t('fin.notePh'))}" aria-label="${esc(t('common.note'))}" data-enter="finAdd">
        <input class="inp" type="date" id="finDate" value="${esc(draftDate || D.today())}" aria-label="${esc(t('common.date'))}">
        ${hasAcc ? `<select class="sel" id="finAcc" aria-label="${esc(t('fin.account'))}">${accOptions(D.ui.filters.finAcc)}</select>` : ''}
        <button class="btn" data-act="finAdd">${D.ic('plus', 16)} ${esc(t('btn.add'))}</button>
      </div></div>`;

    // list
    h += `<div class="section-title">${esc(t('fin.txs'))}<span class="right num">${esc(t('fin.txCount', { n: A.list.length }))}</span></div>
      <div class="fin-search"><span class="fin-search-ic">${D.ic('search', 16)}</span><input class="inp" id="finSearch" value="${esc(searchQ)}" placeholder="${esc(t('fin.searchPh'))}" data-input="finSearch" autocomplete="off"></div>
      <div id="finTxList">${renderTxList(A)}</div>`;
    return h;
  }
  function renderTxList(A) {
    const nq = D.translit.norm(searchQ);
    const list = nq ? A.list.filter((x) => D.translit.norm((x.note || '') + ' ' + cat(x.cat).name).includes(nq)) : A.list;
    if (!list.length) return `<div class="card flat"><div class="empty">${esc(t(nq ? 'fin.emptySearch' : 'fin.emptyMonth'))}</div></div>`;
    let h = '', day = null, dayOut = 0;
    const rows = [];
    const flush = () => { if (day !== null) h += `<div class="fin-day"><span>${esc(D.fmtDate(day, 'weekday'))}</span><span class="num">${dayOut ? '−' + esc(money(dayOut)) : ''}</span></div><ul class="list">${rows.join('')}</ul>`; };
    for (const x of list) {
      if (x.date !== day) { flush(); day = x.date; rows.length = 0; dayOut = 0; }
      if (x.type !== 'in') dayOut += +x.amount || 0;
      const c = cat(x.cat), a = acc(x.accountId);
      rows.push(`<li class="li tap" data-act="finEditTx" data-id="${esc(x.id)}">
        <span class="fin-ico">${esc(c.icon || '📦')}</span>
        <div class="li-body"><div class="li-text">${esc(x.note || c.name)}</div><div class="li-meta">${x.note ? esc(c.name) : ''}${a ? `<span>· ${esc(a.name)}</span>` : ''}</div></div>
        <span class="fin-amt num ${x.type === 'in' ? 'in' : 'out'}">${x.type === 'in' ? '+' : '−'}${esc(money(x.amount))}</span>
        <button class="li-del" data-act="finDelTx" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></li>`);
    }
    flush();
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* ACCOUNTS                                                            */
  /* ------------------------------------------------------------------ */
  function accRow(a, ty) {
    ty = ty || (ACC_TYPES.includes(a.type) ? a.type : 'other');
    const nw = netWorth(), share = nw > 0 && +a.balance > 0 ? D.fmtPct((+a.balance / nw) * 100) : '';
    return `<span class="fin-acc-ic" style="--c:${ACC_COLOR[ty]}">${D.ic(ACC_ICON[ty], 18)}</span>
      <div class="li-body fin-acc-body" role="button" tabindex="0" data-act="finAccEdit" data-id="${esc(a.id)}" title="${esc(t('btn.edit'))}"><div class="li-text">${esc(a.name)}</div><div class="li-meta"><span>${esc(t('fin.type.' + ty))}</span>${share ? `<span class="num">· ${share}</span>` : ''}</div></div>
      <button class="fin-bal num ${+a.balance < 0 ? 'bad' : ''}" data-act="finBalEdit" data-id="${esc(a.id)}" title="${esc(t('fin.balEditHint'))}" aria-label="${esc(t('fin.balance'))}: ${esc(money(a.balance, { force: true }))}">${esc(money(a.balance))}</button>
      <button class="li-del" data-act="finAccDel" data-id="${esc(a.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button>`;
  }
  function renderAccounts() {
    const accs = F().accounts, total = netWorth(), snaps = F().snapshots;
    const first = snaps[0];
    const cut = Date.now() - 30 * 86400000;
    let ref30 = null;
    for (const s of snaps) { if (s.t <= cut) ref30 = s; else break; }
    const dPill = (label, v) => v === null ? '' : `<span class="pill ${v > 0 ? 'good' : v < 0 ? 'bad' : ''}">${esc(label)} ${esc(signed(v))}</span>`;
    let h = `<div class="card fin-kpi">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.netWorth'))}</div>${snaps.length > 1 ? `<span class="small muted num">${snaps.length} ${esc(t('fin.snapshots'))}</span>` : ''}</div>
      <div class="kpi"><div class="kpi-num num ${total < 0 ? 'bad' : ''}">${esc(money(total))}</div></div>
      <div class="row wrap mt-s">${dPill(t('fin.sinceFirst'), first ? total - first.v : null)}${dPill(t('fin.since30'), ref30 ? total - ref30.v : null)}</div>
      <div class="fin-spark mt">${snaps.length > 1 ? D.chart.spark({ values: snaps.map((s) => s.v), color: total >= (first ? first.v : 0) ? 'var(--success)' : 'var(--danger-text)', height: 64 }) : `<div class="fin-nosnap">${D.ic('chart', 14)} ${esc(t('fin.noSnaps'))}</div>`}</div>
    </div>`;

    // allocation donut by type
    const byType = {};
    for (const a of accs) if (+a.balance > 0) byType[a.type] = (byType[a.type] || 0) + +a.balance;
    const parts = ACC_TYPES.filter((k) => byType[k]).map((k) => ({ v: byType[k], color: ACC_COLOR[k], label: t('fin.type.' + k) }));
    const pos = D.sum(parts, (p) => p.v);
    if (parts.length) {
      h += `<div class="card"><div class="card-head"><div class="title">${D.ic('target', 16)} ${esc(t('fin.allocation'))}</div></div>
        <div class="ring-row">${D.chart.donut({ parts, size: 116, stroke: 14, center: `<span class="small">${parts.length}</span>` })}
        <div class="spheres">${parts.map((p) => `<div class="sph"><span class="dot" style="--c:${p.color}"></span><span class="nm">${esc(p.label)}</span><span class="bar thin"><i class="bar-fill" style="width:${((p.v / pos) * 100).toFixed(1)}%;background:${p.color}"></i></span><span class="n">${D.fmtPct((p.v / pos) * 100)}</span></div>`).join('')}</div></div></div>`;
    }

    // accounts grouped by type
    h += `<div class="section-title">${esc(t('fin.accounts'))}<span class="right num">${accs.length}</span></div>`;
    if (!accs.length) h += `<div class="card flat"><div class="empty">${esc(t('fin.noAccounts'))}</div></div>`;
    for (const ty of ACC_TYPES) {
      const g = accs.filter((a) => (a.type || 'other') === ty);
      if (!g.length) continue;
      h += `<div class="fin-typehead" style="--c:${ACC_COLOR[ty]}"><span class="dot"></span>${esc(t('fin.type.' + ty))}<span class="num">${esc(money(D.sum(g, (a) => a.balance)))}</span></div><ul class="list">`;
      for (const a of g) {
        h += `<li class="li" id="finAccRow_${esc(a.id)}">${accRow(a, ty)}</li>`;
      }
      h += '</ul>';
    }
    h += `<button class="dashed mt" data-act="finAccEdit">${D.ic('plus', 14)} ${esc(t('fin.addAccount'))}</button>`;
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* SUBS                                                                */
  /* ------------------------------------------------------------------ */
  function renderSubs() {
    const subs = F().subs.slice().sort((a, b) => ((a.next || '9') < (b.next || '9') ? -1 : 1));
    const mo = D.sum(subs, monthlyEq);
    let h = `<div class="card fin-kpi">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.monthlyBurn'))}</div><span class="small muted">${esc(t('fin.subCount', { n: subs.length }))}</span></div>
      <div class="kpi"><div class="kpi-num num">${esc(money(mo))}</div><span class="kpi-total">${esc(t('fin.mo'))}</span></div>
      <div class="small muted mt-s">${esc(t('fin.perYear', { v: money(mo * 12) }))}</div></div>`;
    if (!subs.length) h += `<div class="card flat"><div class="empty">${esc(t('fin.noSubs'))}</div></div>`;
    else {
      h += '<ul class="list">';
      for (const s of subs) {
        const a = acc(s.accountId), n = daysUntil(s.next);
        h += `<li class="li fin-sub ${n !== null && n <= 3 ? 'due' : ''}">
          <div class="li-body" role="button" tabindex="0" data-act="finSubEdit" data-id="${esc(s.id)}">
            <div class="li-text">${esc(s.name)}</div>
            <div class="li-meta"><span class="num">${esc(money(s.amount))}</span><span>· ${esc(t('fin.per.' + (PERIODS.includes(s.period) ? s.period : 'monthly')))}</span>${a ? `<span>· ${esc(a.name)}</span>` : ''}${s.next ? `<span>· ${esc(D.fmtDate(s.next))}</span>` : ''}</div>
            <div class="row wrap mt-s">${duePill(n)}<span class="pill"><span class="num">${esc(money(monthlyEq(s)))}</span>${esc(t('fin.mo'))}</span></div>
          </div>
          <div class="fin-side">
            <button class="toggle ${s.auto ? 'on' : ''}" data-act="finSubAuto" data-id="${esc(s.id)}" aria-label="${esc(t('fin.auto'))}" title="${esc(t('fin.auto'))}"></button>
            <button class="btn ghost sm" data-act="finSubPay" data-id="${esc(s.id)}">${esc(t('fin.payNow'))}</button>
            <button class="li-del" data-act="finSubDel" data-id="${esc(s.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button>
          </div></li>`;
      }
      h += '</ul>';
    }
    h += `<button class="dashed mt" data-act="finSubEdit">${D.ic('plus', 14)} ${esc(t('fin.addSub'))}</button>`;
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* BUDGET                                                              */
  /* ------------------------------------------------------------------ */
  function renderBudget() {
    const mk = curMonth(), A = monthAgg(mk), B = F().budgets[mk] || {};
    const left = daysLeftIn(mk);
    const cats = F().cats.filter((c) => c.id !== 'maosh');
    cats.sort((a, b) => (B[b.id] ? 1 : 0) - (B[a.id] ? 1 : 0) || (A.byCat[b.id] || 0) - (A.byCat[a.id] || 0));
    const totalB = D.sum(Object.values(B)), spentB = D.sum(cats.filter((c) => B[c.id]), (c) => A.byCat[c.id] || 0);
    const pct = totalB ? (spentB / totalB) * 100 : 0;
    const state = (p) => (p > 100 ? 'bad' : p >= 80 ? 'warn' : 'good');
    const stateColor = { good: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger-text)' };
    let h = monthNav(mk);
    h += `<div class="card fin-kpi">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.budgetTotal'))}</div><span class="pill ${left ? '' : 'on'}">${esc(left ? t('fin.daysLeft', { n: left }) : t('fin.monthOver'))}</span></div>
      <div class="kpi"><div class="kpi-num num ${totalB ? state(pct) : ''}">${esc(money(spentB))}</div><span class="kpi-total">/ ${esc(money(totalB))}</span></div>
      <span class="bar thick mt-s"><i class="bar-fill" style="width:${D.clamp(pct, 0, 100).toFixed(1)}%;background:${stateColor[state(pct)]}"></i></span>
      <div class="row between mt-s small muted"><span>${esc(t('fin.spent'))} ${D.fmtPct(pct)}</span><span class="num">${esc(t('fin.left'))} ${esc(money(totalB - spentB))}</span></div>
    </div>`;
    h += `<div class="card"><div class="card-head"><div class="title">${D.ic('flag', 16)} ${esc(t('fin.budget'))}</div><span class="small muted num">${cats.filter((c) => B[c.id]).length}/${cats.length}</span></div>`;
    for (const c of cats) {
      const b = +B[c.id] || 0, sp = A.byCat[c.id] || 0, p = b ? (sp / b) * 100 : 0, st = state(p);
      const rem = b - sp, perDay = b && left > 0 ? rem / left : null;
      h += `<div class="fin-bud">
        <div class="fin-bud-row"><span class="fin-ico">${esc(c.icon || '📦')}</span><span class="fin-bud-name">${esc(c.name)}</span>
          <input class="inp sm num fin-bud-inp" inputmode="decimal" placeholder="${esc(t('fin.budgetPh'))}" value="${b ? esc(D.fmtNum(b)) : ''}" data-change="finBudgetSet" data-cat="${esc(c.id)}" data-month="${esc(mk)}" aria-label="${esc(c.name)}"></div>
        ${b ? `<span class="bar thin"><i class="bar-fill" style="width:${D.clamp(p, 0, 100).toFixed(1)}%;background:${stateColor[st]}"></i></span>
        <div class="fin-bud-meta"><span class="num">${esc(money(sp))} · ${D.fmtPct(p)}</span><span class="num ${st === 'bad' ? 'bad' : st === 'warn' ? 'warn' : 'good'}">${rem < 0 ? esc(t('fin.over')) + ' ' + esc(money(-rem)) : esc(t('fin.left')) + ' ' + esc(money(rem))}${perDay !== null && rem > 0 ? ` · ${esc(money(perDay))} ${esc(t('fin.perDay'))}` : ''}</span></div>`
        : `<div class="fin-bud-meta"><span class="num">${sp ? esc(money(sp)) : ''}</span><span class="muted">${esc(t('fin.noBudget'))}</span></div>`}
      </div>`;
    }
    h += `<button class="dashed mt" data-act="finBudgetCopy">${D.ic('undo', 14)} ${esc(t('fin.copyLast'))}</button>
      <div class="fin-hint"><button class="fin-link" data-act="go" data-view="settings">${D.ic('gear', 13)} ${esc(t('fin.catsHint'))}</button></div></div>`;
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* WISHLIST                                                            */
  /* ------------------------------------------------------------------ */
  function renderWishlist() {
    const W = F().wishlist.slice().sort((a, b) => (+b.amount || 0) - (+a.amount || 0));
    const nw = netWorth(), total = D.sum(W, (w) => w.amount), avg = avgNet3();
    const pctOf = (v) => (nw > 0 ? (v / nw) * 100 : null);
    const pctCls = (p) => (p === null ? '' : p < 5 ? 'good' : p < 25 ? 'warn' : 'bad');
    const tp = pctOf(total);
    let h = `<div class="card fin-kpi fin-wish-hero">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.wishTotal'))}</div><span class="pill ${pctCls(tp)}">${tp === null ? '—' : D.fmtPct(tp, 1)} ${esc(t('fin.ofNw'))}</span></div>
      <div class="kpi"><div class="kpi-num num">${esc(money(total))}</div></div>
      <span class="bar mt-s"><i class="bar-fill" style="width:${D.clamp(tp || 0, 0, 100).toFixed(1)}%;background:var(--violet)"></i></span>
      <div class="small muted mt-s">${esc(t('fin.avgNet'))}: <span class="num ${avg > 0 ? 'good' : avg < 0 ? 'bad' : ''}">${esc(signed(avg))}</span></div></div>`;
    h += `<div class="card fin-form"><div class="card-head"><div class="title">${D.ic('star', 16)} ${esc(t('fin.addWish'))}</div></div>
      <div class="fin-form-grid two">
        <input class="inp" id="finWishName" placeholder="${esc(t('fin.wishName'))}" data-enter="finWishAdd" autocomplete="off">
        <input class="inp num" id="finWishAmount" inputmode="decimal" placeholder="${esc(t('fin.amount'))}" aria-label="${esc(t('fin.amount'))}" data-enter="finWishAdd" autocomplete="off">
        <button class="btn" data-act="finWishAdd">${D.ic('plus', 16)} ${esc(t('btn.add'))}</button></div></div>`;
    if (!W.length) h += `<div class="card flat"><div class="empty">${esc(t('fin.noWish'))}</div></div>`;
    else {
      h += '<ul class="list">';
      for (const w of W) {
        const p = pctOf(+w.amount || 0);
        const months = avg > 0 && +w.amount > 0 ? Math.ceil(+w.amount / avg) : null;
        h += `<li class="li fin-wish">
          <div class="li-body"><div class="li-text">${esc(w.name)}</div>
            <div class="li-meta"><span class="num">${esc(money(w.amount))}</span>${p !== null ? `<span class="${pctCls(p)}">· ${D.fmtPct(p, 1)} ${esc(t('fin.ofNw'))}</span>` : ''}${months !== null ? `<span>· ${esc(t('fin.monthsToSave', { n: months }))}</span>` : ''}</div>
            <span class="bar thin mt-s"><i class="bar-fill" style="width:${D.clamp(p || 0, 0, 100).toFixed(1)}%;background:var(--violet)"></i></span></div>
          <div class="fin-side"><button class="btn ghost sm" data-act="finWishBuy" data-id="${esc(w.id)}">${D.ic('check', 14)} ${esc(t('fin.buy'))}</button>
          <button class="li-del" data-act="finWishDel" data-id="${esc(w.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div></li>`;
      }
      h += '</ul>';
    }
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'finance', icon: 'wallet', order: 35, primary: true,
    render() {
      let sub = D.sub('finance', 'month');
      if (!TABS.includes(sub)) sub = 'month';
      const body = sub === 'accounts' ? renderAccounts() : sub === 'subs' ? renderSubs() : sub === 'budget' ? renderBudget() : sub === 'wishlist' ? renderWishlist() : renderMonth();
      return `<div class="fin">${topBar(sub)}${body}</div>`;
    },
    mount() {
      clearTimeout(mountTimer);
      mountTimer = setTimeout(() => { mountTimer = null; try { runSubs(); } catch (e) { console.error(e); } }, 0);
    },
    unmount() { clearTimeout(mountTimer); mountTimer = null; },
  });

  /* ------------------------------------------------------------------ */
  /* actions: common                                                     */
  /* ------------------------------------------------------------------ */
  D.act.finToggleAmounts = () => { D.S.settings.showAmounts = D.S.settings.showAmounts === false; D.save(); D.rerender(); };
  D.act.finMonthPrev = () => { setMonth(addMonths(curMonth(), -1)); D.rerender(); };
  D.act.finMonthNext = () => { setMonth(addMonths(curMonth(), 1)); D.rerender(); };
  D.act.finMonthToday = () => { setMonth(D.monthKey()); D.rerender(); };
  D.act.finType = (el) => {
    draftType = el.dataset.type === 'in' ? 'in' : 'out';
    D.$$('#finTypeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.type === draftType));
  };
  D.act.finSearch = (el) => {
    searchQ = el.value || '';
    D.patch('finTxList', renderTxList(monthAgg(curMonth())));
  };

  /* ---- transactions ---- */
  D.act.finAdd = () => {
    const amount = parseAmount((D.$('#finAmount') || {}).value);
    if (!(amount > 0)) { D.toast(t('fin.badAmount')); const a = D.$('#finAmount'); if (a) a.focus(); return; }
    const catId = (D.$('#finCat') || {}).value || 'boshqa';
    const accId = (D.$('#finAcc') || {}).value || null;
    const date = (D.$('#finDate') || {}).value || D.today();
    draftDate = date === D.today() ? null : date;
    const tx = { id: D.uid('f'), date, type: draftType, amount, cat: catId, note: ((D.$('#finNote') || {}).value || '').trim(), accountId: accId };
    F().tx.push(tx);
    applyTx(tx, 1);
    if (accId) snap();
    D.ui.filters.finCat = catId; D.ui.filters.finAcc = accId; D.saveUi();
    if (D.monthKey(date) !== curMonth()) setMonth(D.monthKey(date));
    D.save(); D.rerender();
    D.toast(t('fin.added'));
    const a = D.$('#finAmount'); if (a) a.focus();
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
        ${field(t('fin.amount'), `<input class="inp num" id="finE_amount" inputmode="decimal" value="${esc(D.fmtNum(tx.amount))}" data-enter="finSaveTx" data-id="${esc(tx.id)}">`)}</div>
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
  const balInp = (id) => D.$('#finAccRow_' + id + ' input');
  D.act.finBalEdit = (el) => {
    const a = acc(el.dataset.id);
    if (!a) return;
    // close any other open inline editor first (ids must stay unique)
    for (const o of F().accounts) if (o.id !== a.id && balInp(o.id)) D.patch('finAccRow_' + o.id, accRow(o));
    const ty = ACC_TYPES.includes(a.type) ? a.type : 'other';
    D.patch('finAccRow_' + a.id, `<span class="fin-acc-ic" style="--c:${ACC_COLOR[ty]}">${D.ic(ACC_ICON[ty], 18)}</span>
      <div class="li-body fin-bal-edit"><div class="li-text ellipsis">${esc(a.name)}</div>
        <input class="inp sm num" id="finBalInp" value="${esc(Math.round(+a.balance || 0))}" inputmode="text" placeholder="${esc(t('fin.balHint'))}" aria-label="${esc(t('fin.balEditHint'))}" data-enter="finBalSave" data-id="${esc(a.id)}" autocomplete="off"></div>
      <button class="btn icon fin-bal-ok" data-act="finBalSave" data-id="${esc(a.id)}" aria-label="${esc(t('btn.save'))}">${D.ic('check', 18)}</button>
      <button class="li-del" data-act="finBalCancel" data-id="${esc(a.id)}" aria-label="${esc(t('btn.cancel'))}">${D.ic('x', 16)}</button>`);
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
    if (isNaN(bal)) bal = 0;
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

  /* ---- subscriptions ---- */
  D.act.finSubEdit = (el) => {
    const s = F().subs.find((x) => x.id === el.dataset.id);
    const idAttr = s ? `data-id="${esc(s.id)}"` : '';
    D.modal({
      title: t(s ? 'fin.editSub' : 'fin.addSub'),
      body: `${field(t('common.name'), `<input class="inp" id="finS_name" value="${esc(s ? s.name : '')}" placeholder="${esc(t('fin.subNamePh'))}" data-enter="finSubSave" ${idAttr}>`)}
        <div class="grid2">${field(t('fin.amount'), `<input class="inp num" id="finS_amount" inputmode="decimal" value="${s ? esc(D.fmtNum(s.amount)) : ''}" placeholder="${esc(t('fin.amountPh'))}" data-enter="finSubSave" ${idAttr}>`)}
        ${field(t('fin.period'), `<select class="sel" id="finS_period">${PERIODS.map((p) => `<option value="${p}" ${(s ? s.period : 'monthly') === p ? 'selected' : ''}>${esc(t('fin.per.' + p))}</option>`).join('')}</select>`)}</div>
        <div class="grid2">${field(t('fin.next'), `<input class="inp" type="date" id="finS_next" value="${esc(s && s.next ? s.next : D.today())}">`)}
        ${field(t('fin.account'), `<select class="sel" id="finS_acc">${accOptions(s ? s.accountId : D.ui.filters.finAcc)}</select>`)}</div>
        <label class="row fin-check"><input type="checkbox" class="chk" id="finS_auto" ${s && s.auto ? 'checked' : ''}><span>${esc(t('fin.auto'))}</span></label>`,
      actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t(s ? 'btn.save' : 'btn.add'), act: 'finSubSave', primary: true, data: s ? { id: s.id } : undefined }],
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
  D.act.finSubDel = (el) => { D.remove(F().subs, el.dataset.id, { label: t('fin.subDeleted') }); };

  /* ---- budget ---- */
  D.act.finBudgetSet = (el) => {
    const mk = el.dataset.month || curMonth(), c = el.dataset.cat;
    const v = parseAmount(el.value);
    const B = (F().budgets[mk] = F().budgets[mk] || {});
    if (v > 0) B[c] = Math.round(v); else delete B[c];
    if (!Object.keys(B).length) delete F().budgets[mk];
    D.save(); D.rerender();
  };
  D.act.finBudgetCopy = () => {
    const mk = curMonth(), prev = F().budgets[addMonths(mk, -1)];
    if (!prev || !Object.keys(prev).length) { D.toast(t('fin.noLast')); return; }
    F().budgets[mk] = { ...(F().budgets[mk] || {}), ...prev };
    D.save(); D.rerender();
    D.toast(t('fin.copied'));
  };

  /* ---- wishlist ---- */
  D.act.finWishAdd = () => {
    const name = ((D.$('#finWishName') || {}).value || '').trim();
    if (!name) { D.toast(t('fin.needName')); return; }
    const amount = parseAmount((D.$('#finWishAmount') || {}).value);
    if (!(amount > 0)) { D.toast(t('fin.badAmount')); return; }
    F().wishlist.push({ id: D.uid('w'), name, amount });
    D.save(); D.rerender();
    D.toast(t('fin.added'));
  };
  D.act.finWishDel = (el) => { D.remove(F().wishlist, el.dataset.id, { label: t('fin.wishDeleted') }); };
  D.act.finWishBuy = (el) => {
    const w = F().wishlist.find((x) => x.id === el.dataset.id);
    if (!w) return;
    D.modal({
      title: t('fin.buyTitle', { name: w.name }),
      body: `<div class="kpi mb"><div class="kpi-num num" style="font-size:26px">${esc(money(w.amount))}</div></div>
        ${field(t('fin.account'), `<select class="sel" id="finB_acc">${accOptions(D.ui.filters.finAcc)}</select>`)}
        ${field(t('fin.cat'), `<select class="sel" id="finB_cat">${catOptions(D.ui.filters.finCat || 'boshqa')}</select>`)}
        ${field(t('common.date'), `<input class="inp" type="date" id="finB_date" value="${D.today()}">`)}`,
      actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('fin.buy'), act: 'finWishBuyOk', primary: true, data: { id: w.id } }],
    });
  };
  D.act.finWishBuyOk = (el) => {
    const i = F().wishlist.findIndex((x) => x.id === el.dataset.id);
    if (i < 0) return;
    const w = F().wishlist[i];
    const tx = { id: D.uid('f'), date: (D.$('#finB_date') || {}).value || D.today(), type: 'out', amount: +w.amount || 0, cat: (D.$('#finB_cat') || {}).value || 'boshqa', note: w.name, accountId: (D.$('#finB_acc') || {}).value || null };
    F().tx.push(tx);
    applyTx(tx, 1);
    F().wishlist.splice(i, 1);
    snap();
    D.undo.push({ label: t('fin.bought'), undo: () => { const j = F().tx.findIndex((x) => x.id === tx.id); if (j >= 0) { applyTx(tx, -1); F().tx.splice(j, 1); } F().wishlist.splice(Math.min(i, F().wishlist.length), 0, w); snap(); } });
    D.closeModal(); D.save(); D.rerender();
    D.toast(t('fin.bought'), { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* search provider: transactions → month view                          */
  /* ------------------------------------------------------------------ */
  D.search.register((q) => {
    const nq = D.translit.norm(q);
    if (!nq || nq.length < 2) return [];
    const out = [];
    const tx = F().tx;
    for (let i = tx.length - 1; i >= 0 && out.length < 15; i--) {
      const x = tx[i], c = cat(x.cat);
      const label = (x.note || '') + (x.note ? ' · ' : '') + c.name;
      if (!D.translit.norm(label).includes(nq)) continue;
      out.push({ label: (x.type === 'in' ? '+' : '−') + money(x.amount) + ' ' + label, sub: t('fin.searchSub', { d: D.fmtDate(x.date) }), icon: 'wallet',
        go: () => { setMonth(D.monthKey(x.date)); searchQ = x.note || c.name; D.go('finance', 'month'); } });
    }
    return out;
  });
})();
