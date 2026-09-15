/* =====================================================================
   Dash — Молия (finance)
   Ikki bo'lim, bitta savol: «bugun qancha sarflasam bo'ladi va pulim qayerga ketyapti?»
     Oy    — kunlik me'yor · tez yozuv · kategoriyalar · yozuvlar
     Hisob — qoldiqlar (sof boylik) · doimiy to'lovlar (avto-yechish)
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* strings                                                             */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'fin.tab.month': 'Oy', 'fin.tab.accounts': 'Hisob',
      'fin.net': 'Sof natija', 'fin.income': 'Kirim', 'fin.expense': 'Chiqim',
      'fin.daysLeft': '{n} kun qoldi', 'fin.monthOver': 'Oy tugagan',
      'fin.pace': 'Shu tezlikda oy oxirida ≈ {v}', 'fin.billsLeft': 'Doimiy to‘lovlar: {v}',
      'fin.daily': 'Kunlik chiqim', 'fin.dailyMax': 'eng katta kun',
      'fin.byCat': 'Pul qayerga ketdi', 'fin.noExpense': 'Bu oyda chiqim yo‘q',
      'fin.add': 'Yozib qo‘yish', 'fin.out': 'Chiqim', 'fin.in': 'Kirim',
      'fin.amount': 'Summa', 'fin.amountPh': '50 000 · 250k · 1.5m',
      'fin.cat': 'Kategoriya', 'fin.notePh': 'Izoh (ixtiyoriy)', 'fin.account': 'Hisob', 'fin.noAccount': 'Hisobsiz',
      'fin.txs': 'Yozuvlar', 'fin.searchPh': 'Izoh yoki kategoriya…', 'fin.emptyMonth': 'Bu oyda yozuv yo‘q', 'fin.emptySearch': 'Topilmadi',
      'fin.editTx': 'Yozuvni tahrirlash', 'fin.txDeleted': 'Yozuv o‘chirildi', 'fin.added': 'Qo‘shildi', 'fin.saved': 'Saqlandi',
      'fin.badAmount': 'Summani to‘g‘ri kiriting', 'fin.needName': 'Nom kiriting', 'fin.type': 'Turi',
      'fin.catsHint': 'Kategoriyalarni Sozlashda tahrirlash', 'fin.txCount': '{n} ta yozuv',
      'fin.netWorth': 'Jami qoldiq', 'fin.since30': '30 kun', 'fin.accounts': 'Hisoblar',
      'fin.addAccount': 'Hisob qo‘shish', 'fin.editAccount': 'Hisobni tahrirlash', 'fin.accName': 'Hisob nomi', 'fin.accType': 'Turi', 'fin.balance': 'Qoldiq',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Naqd', 'fin.type.bank': 'Bank', 'fin.type.card': 'Karta', 'fin.type.crypto': 'Kripto', 'fin.type.other': 'Boshqa',
      'fin.noAccounts': 'Hali hisob yo‘q — birinchisini qo‘shing', 'fin.accDeleted': 'Hisob o‘chirildi', 'fin.balUpdated': 'Qoldiq yangilandi',
      'fin.balEditHint': 'Qoldiq: +/- bilan farq, aks holda yangi summa', 'fin.noSnaps': 'Qoldiq o‘zgarganda tarix shu yerda chiziladi',
      'fin.subs': 'Doimiy to‘lovlar', 'fin.perYear': 'yiliga ≈ {v}',
      'fin.addSub': 'To‘lov qo‘shish', 'fin.editSub': 'To‘lovni tahrirlash', 'fin.period': 'Davr',
      'fin.per.monthly': 'Oylik', 'fin.per.yearly': 'Yillik', 'fin.per.weekly': 'Haftalik',
      'fin.next': 'Keyingi to‘lov', 'fin.auto': 'Avto-yechish', 'fin.payNow': 'To‘lash', 'fin.paid': 'To‘landi: {name}',
      'fin.autoDone': '{n} ta to‘lov avtomatik yechildi — {sum}',
      'fin.dueToday': 'Bugun', 'fin.dueTomorrow': 'Ertaga', 'fin.inDays': '{n} kunda', 'fin.late': '{n} kun kechikdi',
      'fin.noSubs': 'Doimiy to‘lov yo‘q', 'fin.subCat': 'Doimiy to‘lov', 'fin.mo': '/oy', 'fin.noDate': 'sana yo‘q',
      'fin.subDeleted': 'To‘lov o‘chirildi', 'fin.subNamePh': 'Internet, ijara, Netflix…',
      'fin.prevMonth': 'Oldingi oy', 'fin.nextMonth': 'Keyingi oy',
    },
    uzk: {
      'fin.tab.month': 'Ой', 'fin.tab.accounts': 'Ҳисоб',
      'fin.net': 'Соф натижа', 'fin.income': 'Кирим', 'fin.expense': 'Чиқим',
      'fin.daysLeft': '{n} кун қолди', 'fin.monthOver': 'Ой тугаган',
      'fin.pace': 'Шу тезликда ой охирида ≈ {v}', 'fin.billsLeft': 'Доимий тўловлар: {v}',
      'fin.daily': 'Кунлик чиқим', 'fin.dailyMax': 'энг катта кун',
      'fin.byCat': 'Пул қаерга кетди', 'fin.noExpense': 'Бу ойда чиқим йўқ',
      'fin.add': 'Ёзиб қўйиш', 'fin.out': 'Чиқим', 'fin.in': 'Кирим',
      'fin.amount': 'Сумма', 'fin.amountPh': '50 000 · 250k · 1.5m',
      'fin.cat': 'Категория', 'fin.notePh': 'Изоҳ (ихтиёрий)', 'fin.account': 'Ҳисоб', 'fin.noAccount': 'Ҳисобсиз',
      'fin.txs': 'Ёзувлар', 'fin.searchPh': 'Изоҳ ёки категория…', 'fin.emptyMonth': 'Бу ойда ёзув йўқ', 'fin.emptySearch': 'Топилмади',
      'fin.editTx': 'Ёзувни таҳрирлаш', 'fin.txDeleted': 'Ёзув ўчирилди', 'fin.added': 'Қўшилди', 'fin.saved': 'Сақланди',
      'fin.badAmount': 'Суммани тўғри киритинг', 'fin.needName': 'Ном киритинг', 'fin.type': 'Тури',
      'fin.catsHint': 'Категорияларни Созлашда таҳрирлаш', 'fin.txCount': '{n} та ёзув',
      'fin.netWorth': 'Жами қолдиқ', 'fin.since30': '30 кун', 'fin.accounts': 'Ҳисоблар',
      'fin.addAccount': 'Ҳисоб қўшиш', 'fin.editAccount': 'Ҳисобни таҳрирлаш', 'fin.accName': 'Ҳисоб номи', 'fin.accType': 'Тури', 'fin.balance': 'Қолдиқ',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Нақд', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Бошқа',
      'fin.noAccounts': 'Ҳали ҳисоб йўқ — биринчисини қўшинг', 'fin.accDeleted': 'Ҳисоб ўчирилди', 'fin.balUpdated': 'Қолдиқ янгиланди',
      'fin.balEditHint': 'Қолдиқ: +/- билан фарқ, акс ҳолда янги сумма', 'fin.noSnaps': 'Қолдиқ ўзгарганда тарих шу ерда чизилади',
      'fin.subs': 'Доимий тўловлар', 'fin.perYear': 'йилига ≈ {v}',
      'fin.addSub': 'Тўлов қўшиш', 'fin.editSub': 'Тўловни таҳрирлаш', 'fin.period': 'Давр',
      'fin.per.monthly': 'Ойлик', 'fin.per.yearly': 'Йиллик', 'fin.per.weekly': 'Ҳафталик',
      'fin.next': 'Кейинги тўлов', 'fin.auto': 'Авто-ечиш', 'fin.payNow': 'Тўлаш', 'fin.paid': 'Тўланди: {name}',
      'fin.autoDone': '{n} та тўлов автоматик ечилди — {sum}',
      'fin.dueToday': 'Бугун', 'fin.dueTomorrow': 'Эртага', 'fin.inDays': '{n} кунда', 'fin.late': '{n} кун кечикди',
      'fin.noSubs': 'Доимий тўлов йўқ', 'fin.subCat': 'Доимий тўлов', 'fin.mo': '/ой', 'fin.noDate': 'сана йўқ',
      'fin.subDeleted': 'Тўлов ўчирилди', 'fin.subNamePh': 'Интернет, ижара, Netflix…',
      'fin.prevMonth': 'Олдинги ой', 'fin.nextMonth': 'Кейинги ой',
    },
    ru: {
      'fin.tab.month': 'Месяц', 'fin.tab.accounts': 'Счета',
      'fin.net': 'Чистый итог', 'fin.income': 'Доход', 'fin.expense': 'Расход',
      'fin.daysLeft': 'осталось {n} дн.', 'fin.monthOver': 'Месяц завершён',
      'fin.pace': 'При таком темпе к концу месяца ≈ {v}', 'fin.billsLeft': 'Постоянные платежи: {v}',
      'fin.daily': 'Расходы по дням', 'fin.dailyMax': 'пик за день',
      'fin.byCat': 'Куда уходят деньги', 'fin.noExpense': 'В этом месяце нет расходов',
      'fin.add': 'Записать', 'fin.out': 'Расход', 'fin.in': 'Доход',
      'fin.amount': 'Сумма', 'fin.amountPh': '50 000 · 250k · 1.5m',
      'fin.cat': 'Категория', 'fin.notePh': 'Заметка', 'fin.account': 'Счёт', 'fin.noAccount': 'Без счёта',
      'fin.txs': 'Записи', 'fin.searchPh': 'Заметка или категория…', 'fin.emptyMonth': 'В этом месяце нет записей', 'fin.emptySearch': 'Ничего не найдено',
      'fin.editTx': 'Изменить запись', 'fin.txDeleted': 'Запись удалена', 'fin.added': 'Добавлено', 'fin.saved': 'Сохранено',
      'fin.badAmount': 'Введите корректную сумму', 'fin.needName': 'Введите название', 'fin.type': 'Тип',
      'fin.catsHint': 'Категории — в Настройках', 'fin.txCount': 'записей: {n}',
      'fin.netWorth': 'Всего на счетах', 'fin.since30': '30 дней', 'fin.accounts': 'Счета',
      'fin.addAccount': 'Добавить счёт', 'fin.editAccount': 'Изменить счёт', 'fin.accName': 'Название счёта', 'fin.accType': 'Тип', 'fin.balance': 'Баланс',
      'fin.balHint': '+50000 · -20000 · 1.5m', 'fin.type.cash': 'Наличные', 'fin.type.bank': 'Банк', 'fin.type.card': 'Карта', 'fin.type.crypto': 'Крипто', 'fin.type.other': 'Другое',
      'fin.noAccounts': 'Счетов пока нет — добавьте первый', 'fin.accDeleted': 'Счёт удалён', 'fin.balUpdated': 'Баланс обновлён',
      'fin.balEditHint': 'Баланс: с +/- — изменение, иначе новая сумма', 'fin.noSnaps': 'История появится, когда изменится баланс',
      'fin.subs': 'Постоянные платежи', 'fin.perYear': '≈ {v} в год',
      'fin.addSub': 'Добавить платёж', 'fin.editSub': 'Изменить платёж', 'fin.period': 'Период',
      'fin.per.monthly': 'Ежемесячно', 'fin.per.yearly': 'Ежегодно', 'fin.per.weekly': 'Еженедельно',
      'fin.next': 'Следующий платёж', 'fin.auto': 'Автосписание', 'fin.payNow': 'Оплатить', 'fin.paid': 'Оплачено: {name}',
      'fin.autoDone': 'Автосписано платежей: {n} — {sum}',
      'fin.dueToday': 'Сегодня', 'fin.dueTomorrow': 'Завтра', 'fin.inDays': 'через {n} дн.', 'fin.late': 'просрочено {n} дн.',
      'fin.noSubs': 'Постоянных платежей нет', 'fin.subCat': 'Постоянный платёж', 'fin.mo': '/мес', 'fin.noDate': 'без даты',
      'fin.subDeleted': 'Платёж удалён', 'fin.subNamePh': 'Интернет, аренда, Netflix…',
      'fin.prevMonth': 'Предыдущий месяц', 'fin.nextMonth': 'Следующий месяц',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants + helpers                                                 */
  /* ------------------------------------------------------------------ */
  const TABS = ['month', 'accounts'];
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
  // the hero tiles sit three-up on a phone: the currency word is dropped there (the big number above carries it)
  const plain = (n) => D.fmtNum(Math.round(+n || 0));
  const plainSigned = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + D.fmtNum(Math.abs(Math.round(+n || 0)));
  /* «Doimiy to'lovlar: 3 560 000 so'm» — mono belongs on the amount, not on the sentence around it */
  const SLOT = '\u0000';
  const line = (key, v) => esc(t(key, { v: SLOT })).split(SLOT).join(`<span class="num">${esc(v)}</span>`);

  // module-local UI state (device only, not persisted)
  let draftType = 'out';
  let draftDate = null; // last used date in the add form (kept while it is not today)
  let searchQ = '';
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
    if (n === null) return `<span class="pill">${t('fin.noDate')}</span>`;
    const cls = n < 0 || n <= 3 ? 'bad' : n <= 7 ? 'on' : '';
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
  /* Ko'zcha (summalarni yashirish) olib tashlandi — hisob yashirin turganda
     sahifa raqamsiz qolardi va uni yoqishning boshqa joyi yo'q edi. */
  function topBar(sub) {
    return `<div class="fin-top">
      <div class="seg">${TABS.map((x) => `<button class="${sub === x ? 'on' : ''}" data-act="sub" data-view="finance" data-sub="${x}">${esc(t('fin.tab.' + x))}</button>`).join('')}</div>
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
  const accOptions = (sel, none) => `<option value="">${esc(none || t('fin.noAccount'))}</option>` + F().accounts.map((a) => `<option value="${esc(a.id)}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)} · ${esc(money(a.balance))}</option>`).join('');
  const catOptions = (sel) => F().cats.map((c) => `<option value="${esc(c.id)}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const field = (label, inner) => `<div class="field"><label class="field-label">${esc(label)}</label>${inner}</div>`;

  /* ------------------------------------------------------------------ */
  /* OY — hero (safe to spend) · quick add · categories · list           */
  /* ------------------------------------------------------------------ */
  function heroCard(mk, A) {
    const left = daysLeftIn(mk);

    // daily spend bars — the flow of the month at a glance
    const dim = D.daysInMonth(mk), today = D.today();
    const vals = [], labels = [], colors = [];
    for (let d = 1; d <= dim; d++) {
      const k = mk + '-' + D.pad2(d);
      vals.push(Math.round(A.byDay[k] || 0));
      labels.push(d === 1 || d % 5 === 0 ? String(d) : '');
      colors.push(k === today ? 'var(--text)' : k > today ? 'var(--line3)' : 'var(--accent)');
    }
    const maxDay = vals.length ? Math.max(...vals) : 0;
    const bars = `<div class="fin-spark mt"><div class="row between mb-s"><div class="eyebrow">${esc(t('fin.daily'))}</div>${maxDay ? `<span class="small muted">${esc(t('fin.dailyMax'))} <span class="num">${esc(money(maxDay))}</span></span>` : ''}</div>${D.chart.bars({ values: vals, labels, colors, height: 56 })}</div>`;

    // bosh raqam — oyning sof natijasi (kirim − chiqim)
    const eyebrow = t('fin.net');
    const num = signed(A.net);
    const cls = A.net > 0 ? 'good' : A.net < 0 ? 'bad' : '';

    // oyni to'liq tasvirlaydigan uchta raqam
    const stats = `<div class="stat-grid mt">
      <div class="stat"><div class="stat-num num money good">${esc(plain(A.inc))}</div><div class="stat-label">${esc(t('fin.income'))}</div></div>
      <div class="stat"><div class="stat-num num money">${esc(plain(A.out))}</div><div class="stat-label">${esc(t('fin.expense'))}</div></div>
      <div class="stat"><div class="stat-num num money">${esc(plainSigned(A.net))}</div><div class="stat-label">${esc(t('fin.net'))}</div></div>
    </div>`;

    // one honest forecast line instead of a whole card
    const elapsed = mk === D.monthKey() ? D.parseKey(D.today()).d : mk < D.monthKey() ? dim : 0;
    const bills = billsLeft(mk);
    const notes = [];
    if (elapsed && A.out > 0) notes.push(line('fin.pace', money(Math.round((A.out / elapsed) * dim))));
    if (bills > 0) notes.push(line('fin.billsLeft', money(bills)));

    return `<div class="card fin-hero">
      <div class="card-head"><div class="eyebrow">${esc(eyebrow)}</div>
        <div class="row" style="gap:6px">${left ? `<span class="pill">${esc(t('fin.daysLeft', { n: left }))}</span>` : `<span class="pill on">${esc(t('fin.monthOver'))}</span>`}</div></div>
      <div class="kpi"><div class="kpi-num num ${cls}">${esc(num)}</div></div>
      ${stats}
      ${notes.length ? `<div class="fin-notes">${notes.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}
      ${bars}
    </div>`;
  }

  const chipsHtml = () => { const sel = selCat(); return catOrder(draftType).map((c) => `<button class="fin-chip ${c.id === sel ? 'on' : ''}" data-act="finChip" data-cat="${esc(c.id)}" role="radio" aria-checked="${c.id === sel}"><span class="fin-chip-i">${D.catMark(c.icon, 15)}</span>${esc(c.name)}</button>`).join(''); };
  /* keep the chosen chip visible without ever scrolling the page itself */
  function scrollChip() {
    const box = D.$('#finChips'), on = D.$('#finChips .fin-chip.on');
    if (box && on) box.scrollLeft = Math.max(0, on.offsetLeft - 12);
  }

  /* the fastest possible entry: amount → category chip → done */
  function addCard() {
    const hasAcc = F().accounts.length > 0;
    return `<div class="card fin-add">
      <div class="card-head"><div class="title">${D.ic('plus', 16)} ${esc(t('fin.add'))}</div>
        <div class="seg compact" id="finTypeSeg">
          <button class="${draftType === 'out' ? 'on' : ''}" data-act="finType" data-type="out">${esc(t('fin.out'))}</button>
          <button class="${draftType === 'in' ? 'on' : ''}" data-act="finType" data-type="in">${esc(t('fin.in'))}</button></div></div>
      <input class="inp num fin-amount" id="finAmount" inputmode="decimal" autocomplete="off" placeholder="${esc(t('fin.amountPh'))}" aria-label="${esc(t('fin.amount'))}" data-input="finAmountIn" data-enter="finAdd">
      <div class="fin-chips" id="finChips" role="radiogroup" aria-label="${esc(t('fin.cat'))}">${chipsHtml()}</div>
      <div class="fin-add-row">
        <input class="inp" id="finNote" placeholder="${esc(t('fin.notePh'))}" aria-label="${esc(t('common.note'))}" data-enter="finAdd">
        <input class="inp" type="date" id="finDate" value="${esc(draftDate || D.today())}" aria-label="${esc(t('common.date'))}">
        ${hasAcc ? `<select class="sel" id="finAcc" aria-label="${esc(t('fin.account'))}">${accOptions(D.ui.filters.finAcc)}</select>` : ''}
      </div>
      <button class="btn fin-add-btn" data-act="finAdd">${D.ic('plus', 16)} ${esc(t('btn.add'))}</button>
    </div>`;
  }

  function catsCard(A) {
    const cats = Object.entries(A.byCat).sort((a, b) => b[1] - a[1]);
    const max = cats.length ? cats[0][1] : 0;
    let h = `<div class="card"><div class="card-head"><div class="title">${D.ic('chart', 16)} ${esc(t('fin.byCat'))}</div><span class="small muted num">${esc(money(A.out))}</span></div>`;
    if (!cats.length) h += `<div class="empty">${esc(t('fin.noExpense'))}</div>`;
    else h += cats.map(([id, v], i) => D.chart.hbar({ label: catLabel(id), value: v, max, color: CAT_PALETTE[i % CAT_PALETTE.length], right: `${esc(money(v))} <span class="muted">${D.fmtPct(A.out ? (v / A.out) * 100 : 0)}</span>` })).join('');
    h += `<div class="fin-hint"><button class="fin-link" data-act="go" data-view="settings" data-sub="finance">${D.ic('gear', 13)} ${esc(t('fin.catsHint'))}</button></div></div>`;
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
        <span class="fin-ico">${D.catMark(c.icon, 17)}</span>
        <div class="li-body"><div class="li-text">${esc(x.note || c.name)}</div><div class="li-meta">${x.note ? esc(c.name) : ''}${a ? `<span>· ${esc(a.name)}</span>` : ''}</div></div>
        <span class="fin-amt num ${x.type === 'in' ? 'in' : 'out'}">${x.type === 'in' ? '+' : '−'}${esc(money(x.amount))}</span>
        <button class="li-del" data-act="finDelTx" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></li>`);
    }
    flush();
    return h;
  }

  function renderMonth() {
    const mk = curMonth(), A = monthAgg(mk);
    let h = monthNav(mk);
    h += heroCard(mk, A);
    h += addCard();
    h += catsCard(A);
    h += `<div class="section-title">${esc(t('fin.txs'))}<span class="right num">${esc(t('fin.txCount', { n: A.list.length }))}</span></div>
      <div class="fin-search"><span class="fin-search-ic">${D.ic('search', 16)}</span><input class="inp" id="finSearch" value="${esc(searchQ)}" placeholder="${esc(t('fin.searchPh'))}" data-input="finSearch" autocomplete="off"></div>
      <div id="finTxList">${renderTxList(A)}</div>`;
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* HISOB — balances + recurring payments                               */
  /* ------------------------------------------------------------------ */
  function accRow(a, ty) {
    ty = ty || (ACC_TYPES.includes(a.type) ? a.type : 'other');
    return `<span class="fin-acc-ic" style="--c:${ACC_COLOR[ty]}">${D.ic(ACC_ICON[ty], 18)}</span>
      <div class="li-body fin-acc-body" role="button" tabindex="0" data-act="finAccEdit" data-id="${esc(a.id)}" title="${esc(t('btn.edit'))}"><div class="li-text">${esc(a.name)}</div><div class="li-meta"><span>${esc(t('fin.type.' + ty))}</span></div></div>
      <button class="fin-bal num ${+a.balance < 0 ? 'bad' : ''}" data-act="finBalEdit" data-id="${esc(a.id)}" title="${esc(t('fin.balEditHint'))}" aria-label="${esc(t('fin.balance'))}: ${esc(money(a.balance, { force: true }))}">${esc(money(a.balance))}</button>
      <button class="li-del" data-act="finAccDel" data-id="${esc(a.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button>`;
  }

  function renderAccounts() {
    const accs = F().accounts, total = netWorth(), snaps = F().snapshots;
    const cut = Date.now() - 30 * 86400000;
    let ref30 = null;
    for (const s of snaps) { if (s.t <= cut) ref30 = s; else break; }
    const d30 = ref30 && total - ref30.v !== 0 ? total - ref30.v : null;   // a pill that reads «30 kun 0» says nothing

    let h = `<div class="card fin-hero">
      <div class="card-head"><div class="eyebrow">${esc(t('fin.netWorth'))}</div>
        ${d30 === null ? '' : `<span class="pill ${d30 > 0 ? 'good' : d30 < 0 ? 'bad' : ''}">${esc(t('fin.since30'))} ${esc(signed(d30))}</span>`}</div>
      <div class="kpi"><div class="kpi-num num ${total < 0 ? 'bad' : ''}">${esc(money(total))}</div></div>
      <div class="fin-spark mt">${snaps.length > 1 ? D.chart.spark({ values: snaps.map((s) => s.v), color: total >= snaps[0].v ? 'var(--success)' : 'var(--danger-text)', height: 64 }) : `<div class="fin-nosnap">${D.ic('chart', 14)} ${esc(t('fin.noSnaps'))}</div>`}</div>
    </div>`;

    h += `<div class="section-title">${esc(t('fin.accounts'))}<span class="right num">${accs.length}</span></div>`;
    if (!accs.length) h += `<div class="card flat"><div class="empty">${esc(t('fin.noAccounts'))}</div></div>`;
    else h += `<ul class="list">${accs.map((a) => `<li class="li" id="finAccRow_${esc(a.id)}">${accRow(a)}</li>`).join('')}</ul>`;
    h += `<button class="dashed mt" data-act="finAccEdit">${D.ic('plus', 14)} ${esc(t('fin.addAccount'))}</button>`;

    // recurring payments live here: they are what leaves the balance on its own
    const subs = F().subs.slice().sort((a, b) => ((a.next || '9') < (b.next || '9') ? -1 : 1));
    const mo = D.sum(subs, monthlyEq);
    h += `<div class="section-title">${esc(t('fin.subs'))}<span class="right num">${esc(subs.length ? money(mo) + t('fin.mo') : '')}</span></div>`;
    if (subs.length) h += `<div class="fin-subnote">${line('fin.perYear', money(mo * 12))}</div>`;
    if (!subs.length) h += `<div class="card flat"><div class="empty">${esc(t('fin.noSubs'))}</div></div>`;
    else {
      h += '<ul class="list">';
      for (const s of subs) {
        const a = acc(s.accountId), n = daysUntil(s.next);
        h += `<li class="li fin-sub ${n !== null && n <= 3 ? 'due' : ''}">
          <div class="li-body" role="button" tabindex="0" data-act="finSubEdit" data-id="${esc(s.id)}">
            <div class="li-text">${esc(s.name)}</div>
            <div class="li-meta"><span class="num">${esc(money(s.amount))}</span><span>· ${esc(t('fin.per.' + (PERIODS.includes(s.period) ? s.period : 'monthly')))}</span>${a ? `<span>· ${esc(a.name)}</span>` : ''}</div>
            <div class="row wrap mt-s">${duePill(n)}</div>
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
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'finance', icon: 'wallet', order: 30, primary: false,
    render() {
      let sub = D.sub('finance', 'month');
      if (!TABS.includes(sub)) sub = 'month';
      return `<div class="fin">${topBar(sub)}${sub === 'accounts' ? renderAccounts() : renderMonth()}</div>`;
    },
    mount() {
      scrollChip();
      clearTimeout(mountTimer);
      mountTimer = setTimeout(() => { mountTimer = null; try { runSubs(); } catch (e) { console.error(e); } }, 0);
    },
    unmount() { clearTimeout(mountTimer); mountTimer = null; },
  });

  /* ------------------------------------------------------------------ */
  /* actions: common                                                     */
  /* ------------------------------------------------------------------ */
  D.act.finMonthPrev = () => { setMonth(addMonths(curMonth(), -1)); D.rerender(); };
  D.act.finMonthNext = () => { setMonth(addMonths(curMonth(), 1)); D.rerender(); };
  D.act.finMonthToday = () => { setMonth(D.monthKey()); D.rerender(); };
  D.act.finType = (el) => {
    draftType = el.dataset.type === 'in' ? 'in' : 'out';
    D.$$('#finTypeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.type === draftType));
    D.patch('finChips', chipsHtml());   // income and expense keep their own order and their own last pick
    scrollChip();
  };
  D.act.finChip = (el) => {
    D.ui.filters[catKey()] = el.dataset.cat; D.saveUi();
    D.$$('#finChips .fin-chip').forEach((b) => { const on = b.dataset.cat === el.dataset.cat; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  };
  D.act.finSearch = (el) => {
    searchQ = el.value || '';
    D.patch('finTxList', renderTxList(monthAgg(curMonth())));
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
  };

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
    D.toast(t('fin.added'));
    /* Maydonlarni qo'lda tozalaymiz. D.rerender() o'zi tozalamaydi: morph
       INPUT ning qiymatiga faqat markupda `value` atributi bo'lsa tegadi, va
       fokusdagi maydonga umuman tegmaydi (odam yozayotgan matn yo'qolmasin
       degani). Natijada yozilgan summa qo'shilgandan keyin ham turib qolardi
       va keyingi yozuvga qo'shilib ketardi. */
    const a = D.$('#finAmount'); if (a) { a.value = ''; a.focus(); }
    const n = D.$('#finNote'); if (n) n.value = '';
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
})();
