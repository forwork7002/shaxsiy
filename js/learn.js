/* =====================================================================
   Dash — Ta'lim (learn): kitob · sura · kurs · audio
   Qur'an memorisation map (114 cells), x/6236 KPI, revision queue,
   books finished this year + pages read, translit-aware search.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* i18n                                                                */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'ln.type.kitob': 'Kitoblar', 'ln.type.sura': 'Suralar', 'ln.type.kurs': 'Kurslar', 'ln.type.audio': 'Audio',
      'ln.one.kitob': 'Kitob', 'ln.one.sura': 'Sura', 'ln.one.kurs': 'Kurs', 'ln.one.audio': 'Audio',
      'ln.sort.new': 'Yangi', 'ln.sort.name': 'Nomi', 'ln.sort.status': 'Holat',
      'ln.status.jarayonda': 'Jarayonda', 'ln.status.tugadi': 'Tugadi',
      'ln.search': 'Qidirish…',
      'ln.add.title': "Yangi qo'shish", 'ln.add.name': 'Nomi', 'ln.add.suraName': 'Sura nomi…', 'ln.add.author': 'Muallif (ixtiyoriy)',
      'ln.add.pages': 'Sahifa (ixtiyoriy)', 'ln.add.ayahs': 'Oyatlar',
      'ln.unit.page': 'sahifa', 'ln.unit.ayah': 'oyat', 'ln.unit.sura': 'sura',
      'ln.empty': "Hali hech narsa yo'q — birinchisini qo'shing",
      'ln.stat.total': 'Jami', 'ln.stat.done': 'Tugadi', 'ln.stat.prog': 'Jarayonda', 'ln.stat.year': 'Shu yil',
      'ln.book.year': 'Shu yil tugatildi', 'ln.book.pages': "O'qilgan sahifa", 'ln.book.total': 'Jami kitob', 'ln.book.prog': "O'qilmoqda",
      'ln.kpi.memorized': 'Yodlangan', 'ln.kpi.ofQuran': "Qur'onning {p}", 'ln.kpi.suras': '{n} / 114 sura yodlangan',
      'ln.grid.title': "Qur'on xaritasi", 'ln.grid.toggle': "Ko'rsatish / yashirish", 'ln.grid.cell': '{n}. {name} · {a} oyat',
      'ln.legend.done': 'Yodlangan', 'ln.legend.prog': 'Jarayonda', 'ln.legend.none': 'Boshlanmagan',
      'ln.rev.title': 'Takrorlash navbati', 'ln.rev.btn': 'Takrorladim', 'ln.rev.never': 'Hech takrorlanmagan',
      'ln.rev.today': 'Bugun takrorlandi', 'ln.rev.ago': '{n} kun oldin', 'ln.rev.empty': "Yodlangan sura hali yo'q", 'ln.rev.done': 'Takrorlandi',
      'ln.rev.hint': "Eng uzoq vaqt takrorlanmagan suralar",
      'ln.prompt.progress': 'Qayerdasiz? (jami {total} {unit})', 'ln.prompt.total': 'Jami sahifa soni', 'ln.setTotal': 'Sahifa sonini kiritish',
      'ln.toast.added': "Qo'shildi", 'ln.toast.needName': 'Nom kiriting', 'ln.toast.exists': 'Bu sura allaqachon bor',
      'ln.toast.done': 'Tugadi', 'ln.toast.prog': 'Jarayonga qaytdi', 'ln.toast.created': '{name} boshlandi',
      'ln.review.short': 'Takror', 'ln.pal.sub': "Ta'lim", 'ln.deleted': "O'chirildi",
    },
    uzk: {
      'ln.type.kitob': 'Китоблар', 'ln.type.sura': 'Суралар', 'ln.type.kurs': 'Курслар', 'ln.type.audio': 'Аудио',
      'ln.one.kitob': 'Китоб', 'ln.one.sura': 'Сура', 'ln.one.kurs': 'Курс', 'ln.one.audio': 'Аудио',
      'ln.sort.new': 'Янги', 'ln.sort.name': 'Номи', 'ln.sort.status': 'Ҳолат',
      'ln.status.jarayonda': 'Жараёнда', 'ln.status.tugadi': 'Тугади',
      'ln.search': 'Қидириш…',
      'ln.add.title': 'Янги қўшиш', 'ln.add.name': 'Номи', 'ln.add.suraName': 'Сура номи…', 'ln.add.author': 'Муаллиф (ихтиёрий)',
      'ln.add.pages': 'Саҳифа (ихтиёрий)', 'ln.add.ayahs': 'Оятлар',
      'ln.unit.page': 'саҳифа', 'ln.unit.ayah': 'оят', 'ln.unit.sura': 'сура',
      'ln.empty': 'Ҳали ҳеч нарса йўқ — биринчисини қўшинг',
      'ln.stat.total': 'Жами', 'ln.stat.done': 'Тугади', 'ln.stat.prog': 'Жараёнда', 'ln.stat.year': 'Шу йил',
      'ln.book.year': 'Шу йил тугатилди', 'ln.book.pages': 'Ўқилган саҳифа', 'ln.book.total': 'Жами китоб', 'ln.book.prog': 'Ўқилмоқда',
      'ln.kpi.memorized': 'Ёдланган', 'ln.kpi.ofQuran': 'Қуръоннинг {p}', 'ln.kpi.suras': '{n} / 114 сура ёдланган',
      'ln.grid.title': 'Қуръон харитаси', 'ln.grid.toggle': 'Кўрсатиш / яшириш', 'ln.grid.cell': '{n}. {name} · {a} оят',
      'ln.legend.done': 'Ёдланган', 'ln.legend.prog': 'Жараёнда', 'ln.legend.none': 'Бошланмаган',
      'ln.rev.title': 'Такрорлаш навбати', 'ln.rev.btn': 'Такрорладим', 'ln.rev.never': 'Ҳеч такрорланмаган',
      'ln.rev.today': 'Бугун такрорланди', 'ln.rev.ago': '{n} кун олдин', 'ln.rev.empty': 'Ёдланган сура ҳали йўқ', 'ln.rev.done': 'Такрорланди',
      'ln.rev.hint': 'Энг узоқ вақт такрорланмаган суралар',
      'ln.prompt.progress': 'Қаердасиз? (жами {total} {unit})', 'ln.prompt.total': 'Жами саҳифа сони', 'ln.setTotal': 'Саҳифа сонини киритиш',
      'ln.toast.added': 'Қўшилди', 'ln.toast.needName': 'Ном киритинг', 'ln.toast.exists': 'Бу сура аллақачон бор',
      'ln.toast.done': 'Тугади', 'ln.toast.prog': 'Жараёнга қайтди', 'ln.toast.created': '{name} бошланди',
      'ln.review.short': 'Такрор', 'ln.pal.sub': 'Таълим', 'ln.deleted': 'Ўчирилди',
    },
    ru: {
      'ln.type.kitob': 'Книги', 'ln.type.sura': 'Суры', 'ln.type.kurs': 'Курсы', 'ln.type.audio': 'Аудио',
      'ln.one.kitob': 'Книга', 'ln.one.sura': 'Сура', 'ln.one.kurs': 'Курс', 'ln.one.audio': 'Аудио',
      'ln.sort.new': 'Новые', 'ln.sort.name': 'Название', 'ln.sort.status': 'Статус',
      'ln.status.jarayonda': 'В процессе', 'ln.status.tugadi': 'Завершено',
      'ln.search': 'Поиск…',
      'ln.add.title': 'Добавить', 'ln.add.name': 'Название', 'ln.add.suraName': 'Название суры…', 'ln.add.author': 'Автор (необязательно)',
      'ln.add.pages': 'Страниц (необязательно)', 'ln.add.ayahs': 'Аятов',
      'ln.unit.page': 'стр.', 'ln.unit.ayah': 'аятов', 'ln.unit.sura': 'сур',
      'ln.empty': 'Пока пусто — добавьте первую запись',
      'ln.stat.total': 'Всего', 'ln.stat.done': 'Завершено', 'ln.stat.prog': 'В процессе', 'ln.stat.year': 'В этом году',
      'ln.book.year': 'Прочитано в этом году', 'ln.book.pages': 'Страниц прочитано', 'ln.book.total': 'Всего книг', 'ln.book.prog': 'Читаю',
      'ln.kpi.memorized': 'Выучено', 'ln.kpi.ofQuran': '{p} Корана', 'ln.kpi.suras': '{n} / 114 сур выучено',
      'ln.grid.title': 'Карта Корана', 'ln.grid.toggle': 'Показать / скрыть', 'ln.grid.cell': '{n}. {name} · {a} аятов',
      'ln.legend.done': 'Выучено', 'ln.legend.prog': 'В процессе', 'ln.legend.none': 'Не начато',
      'ln.rev.title': 'Очередь повторения', 'ln.rev.btn': 'Повторил', 'ln.rev.never': 'Ещё не повторялась',
      'ln.rev.today': 'Повторено сегодня', 'ln.rev.ago': '{n} дн. назад', 'ln.rev.empty': 'Выученных сур пока нет', 'ln.rev.done': 'Повторено',
      'ln.rev.hint': 'Суры, которые дольше всего не повторялись',
      'ln.prompt.progress': 'Где вы сейчас? (всего {total} {unit})', 'ln.prompt.total': 'Всего страниц', 'ln.setTotal': 'Указать число страниц',
      'ln.toast.added': 'Добавлено', 'ln.toast.needName': 'Введите название', 'ln.toast.exists': 'Эта сура уже есть',
      'ln.toast.done': 'Завершено', 'ln.toast.prog': 'Снова в процессе', 'ln.toast.created': '{name} начата',
      'ln.review.short': 'Повтор', 'ln.pal.sub': 'Учёба', 'ln.deleted': 'Удалено',
    },
  });

  /* ------------------------------------------------------------------ */
  /* constants                                                           */
  /* ------------------------------------------------------------------ */
  const TYPES = ['kitob', 'sura', 'kurs', 'audio'];
  const TOTAL_AYAHS = 6236;
  // [n, Uzbek Latin name, ayahs, aliases(optional, for matching legacy Cyrillic names)]
  const SURAS = [
    [1, 'Al-Fotiha', 7, 'Al-Fatiha'], [2, 'Al-Baqara', 286], [3, 'Oli Imron', 200, 'Ali Imron'], [4, 'An-Niso', 176, 'An-Nisa'],
    [5, 'Al-Moida', 120, 'Al-Maida'], [6, "Al-An'om", 165, 'Al-Anam'], [7, "Al-A'rof", 206, 'Al-Araf'], [8, 'Al-Anfol', 75, 'Al-Anfal'],
    [9, 'At-Tavba', 129, 'At-Tawba'], [10, 'Yunus', 109], [11, 'Hud', 123], [12, 'Yusuf', 111],
    [13, "Ar-Ra'd", 43], [14, 'Ibrohim', 52, 'Ibrahim'], [15, 'Al-Hijr', 99], [16, 'An-Nahl', 128],
    [17, 'Al-Isro', 111, 'Al-Isra'], [18, 'Al-Kahf', 110], [19, 'Maryam', 98], [20, 'Toha', 135, 'Ta-Ha,Taha'],
    [21, 'Al-Anbiyo', 112, 'Al-Anbiya'], [22, 'Al-Haj', 78, 'Al-Hajj'], [23, "Al-Mu'minun", 118, 'Al-Muminun'], [24, 'An-Nur', 64],
    [25, 'Al-Furqon', 77, 'Al-Furqan'], [26, "Ash-Shu'aro", 227, 'Ash-Shuara'], [27, 'An-Naml', 93], [28, 'Al-Qasas', 88],
    [29, 'Al-Ankabut', 69], [30, 'Ar-Rum', 60], [31, 'Luqmon', 34, 'Luqman'], [32, 'As-Sajda', 30],
    [33, 'Al-Ahzob', 73, 'Al-Ahzab'], [34, "Saba'", 54, 'Saba'], [35, 'Fotir', 45, 'Fatir'], [36, 'Yosin', 83, 'Yasin,Ya-Sin'],
    [37, 'As-Soffat', 182, 'As-Saffat'], [38, 'Sod', 88, 'Sad'], [39, 'Az-Zumar', 75], [40, "G'ofir", 85, 'Gofir,Ghafir'],
    [41, 'Fussilat', 54], [42, 'Ash-Shuro', 53, 'Ash-Shura'], [43, 'Az-Zuxruf', 89, 'Az-Zukhruf'], [44, 'Ad-Duxon', 59, 'Ad-Duxan,Ad-Dukhan'],
    [45, 'Al-Josiya', 37, 'Al-Jasiya'], [46, 'Al-Ahqof', 35, 'Al-Ahqaf'], [47, 'Muhammad', 38], [48, 'Al-Fath', 29],
    [49, 'Al-Hujurot', 18, 'Al-Hujurat'], [50, 'Qof', 45, 'Qaf'], [51, 'Az-Zoriyot', 60, 'Az-Zariyat,Az-Zoriyat'], [52, 'At-Tur', 49],
    [53, 'An-Najm', 62], [54, 'Al-Qamar', 55], [55, 'Ar-Rahmon', 78, 'Ar-Rahman'], [56, 'Al-Voqia', 96, 'Al-Waqia'],
    [57, 'Al-Hadid', 29], [58, 'Al-Mujodala', 22, 'Al-Mujadala'], [59, 'Al-Hashr', 24], [60, 'Al-Mumtahana', 13, 'Al-Mumtahina'],
    [61, 'As-Soff', 14, 'As-Saff'], [62, "Al-Jumu'a", 11, 'Al-Juma,Al-Jumua'], [63, 'Al-Munofiqun', 11, 'Al-Munafiqun'], [64, "At-Tag'obun", 18, 'At-Tagobun,At-Taghabun'],
    [65, 'At-Taloq', 12, 'At-Talaq'], [66, 'At-Tahrim', 12], [67, 'Al-Mulk', 30], [68, 'Al-Qalam', 52],
    [69, 'Al-Haqqa', 52, 'Al-Haqqo'], [70, "Al-Ma'orij", 44, 'Al-Maorij,Al-Maarij'], [71, 'Nuh', 28, 'Noh'], [72, 'Al-Jinn', 28, 'Al-Jin'],
    [73, 'Al-Muzzammil', 20], [74, 'Al-Muddassir', 56], [75, 'Al-Qiyoma', 40, 'Al-Qiyama'], [76, 'Al-Inson', 31, 'Al-Insan'],
    [77, 'Al-Mursalot', 50, 'Al-Mursalat'], [78, "An-Naba'", 40, 'An-Naba'], [79, "An-Nozi'ot", 46, 'An-Noziat,An-Naziat'], [80, 'Abasa', 42],
    [81, 'At-Takvir', 29, 'At-Takwir'], [82, 'Al-Infitor', 19, 'Al-Infitar'], [83, 'Al-Mutaffifin', 36], [84, 'Al-Inshiqoq', 25, 'Al-Inshiqaq'],
    [85, 'Al-Buruj', 22], [86, 'At-Toriq', 17, 'At-Tariq,At-Torik'], [87, "Al-A'lo", 19, 'Al-Ala'], [88, "Al-G'oshiya", 26, 'Al-Goshiya,Al-Ghashiya'],
    [89, 'Al-Fajr', 30], [90, 'Al-Balad', 20], [91, 'Ash-Shams', 15], [92, 'Al-Layl', 21, 'Al-Lail'],
    [93, 'Ad-Duho', 11, 'Ad-Duha'], [94, 'Ash-Sharh', 8, 'Al-Inshirah'], [95, 'At-Tiyn', 8, 'At-Tin'], [96, 'Al-Alaq', 19],
    [97, 'Al-Qadr', 5], [98, 'Al-Bayyina', 8], [99, 'Az-Zilzala', 8, 'Az-Zalzala'], [100, 'Al-Odiyot', 11, 'Al-Adiyat,Al-Odiyat'],
    [101, "Al-Qori'a", 11, 'Al-Qaria'], [102, 'At-Takosur', 8, 'At-Takasur'], [103, 'Al-Asr', 3], [104, 'Al-Humaza', 9],
    [105, 'Al-Fil', 5], [106, 'Quraysh', 4, 'Quraish'], [107, "Al-Mo'un", 7, 'Al-Maun,Al-Moun'], [108, 'Al-Kavsar', 3, 'Al-Kawsar'],
    [109, 'Al-Kofirun', 6, 'Al-Kafirun'], [110, 'An-Nasr', 3], [111, 'Al-Masad', 5, 'Al-Lahab'], [112, 'Al-Ixlos', 4, 'Al-Ikhlas'],
    [113, 'Al-Falaq', 5], [114, 'An-Nos', 6, 'An-Nas'],
  ];
  const AYAHS = {}; SURAS.forEach((s) => { AYAHS[s[0]] = s[2]; });
  const SURA_NAME = {}; SURAS.forEach((s) => { SURA_NAME[s[0]] = s[1]; });

  /* ------------------------------------------------------------------ */
  /* sura name matching (legacy Cyrillic names → sura number)            */
  /* ------------------------------------------------------------------ */
  const ARTICLE = /^(al|an|ar|as|at|ash|az|ad|oli|ali)\s+/;
  function suraKey(s) {
    s = String(s || '').replace(/\(.*?\)/g, ' ');           // drop translations in brackets
    s = D.translit.norm(s).replace(/^\d+[\s.]*/, '');        // drop leading number
    s = s.replace(ARTICLE, '');
    return s.replace(/\s+/g, '');
  }
  const KEY2N = new Map();
  for (const s of SURAS) {
    KEY2N.set(suraKey(s[1]), s[0]);
    if (s[3]) for (const a of s[3].split(',')) KEY2N.set(suraKey(a), s[0]);
  }
  const nameCache = new Map();
  function suraNum(item) {
    if (!item || item.type !== 'sura') return 0;
    if (item.sura && AYAHS[item.sura]) return +item.sura;
    const nm = item.name || '';
    if (nameCache.has(nm)) return nameCache.get(nm);
    let n = KEY2N.get(suraKey(nm)) || 0;
    if (!n) { // loose: key of the first word only (e.g. "Yusuf a.s.")
      const first = suraKey(nm).slice(0, 6);
      for (const [k, v] of KEY2N) if (first.length >= 4 && (k === first || (k.length >= 5 && k.startsWith(first)))) { n = v; break; }
    }
    nameCache.set(nm, n);
    return n;
  }
  function suraTotal(item) { return +item.total || AYAHS[suraNum(item)] || 0; }
  function itemTotal(item) { return item.type === 'sura' ? suraTotal(item) : (+item.total || 0); }

  // memoised sura index: n → best record (done > in progress > other) and memorised ayah total
  let idxCache = { L: null, key: '', map: null, memo: 0, done: 0 };
  function suraIndex() {
    const L = D.S.learn;
    let key = L.length + '|';
    for (const it of L) if (it.type === 'sura') key += it.id + ':' + (it.status === 'tugadi' ? 1 : 0) + ':' + (it.progress || 0) + ':' + (it.total || 0) + ';';
    // the map holds live object refs → must also invalidate when D.S was replaced (server merge / import / undo)
    if (idxCache.L === L && idxCache.key === key && idxCache.map) return idxCache;
    const map = new Map();
    let memo = 0, done = 0;
    for (const it of L) {
      if (it.type !== 'sura') continue;
      const n = suraNum(it);
      if (!n) { if (it.status === 'tugadi') memo += +it.total || 0; else memo += Math.min(+it.progress || 0, +it.total || Infinity) || 0; continue; }
      const prev = map.get(n);
      if (!prev || rank(it) > rank(prev)) map.set(n, it);
    }
    for (const [n, it] of map) {
      if (it.status === 'tugadi') { memo += AYAHS[n]; done++; }
      else memo += D.clamp(+it.progress || 0, 0, AYAHS[n]);
    }
    idxCache = { L, key, map, memo, done };
    return idxCache;
  }
  function rank(it) { return it.status === 'tugadi' ? 3 : (+it.progress || 0) > 0 ? 2 : 1; }

  /* ------------------------------------------------------------------ */
  /* small helpers                                                       */
  /* ------------------------------------------------------------------ */
  const yearOf = (ts) => (ts ? D.dayKey(new Date(ts)).slice(0, 4) : '');
  const thisYear = () => D.today().slice(0, 4);
  const done = (it) => it.status === 'tugadi';
  const pctOf = (it) => { const t = itemTotal(it); return t ? D.clamp(((done(it) ? t : +it.progress || 0) / t) * 100, 0, 100) : 0; };
  const typeLabel = (t) => D.t('ln.one.' + (TYPES.includes(t) ? t : 'kitob'));
  const unitOf = (it) => D.t(it.type === 'sura' ? 'ln.unit.ayah' : 'ln.unit.page');
  function daysAgo(ts) { if (!ts) return null; return Math.max(0, D.daysBetween(D.dayKey(new Date(ts)), D.today())); }
  function agoText(ts) { const d = daysAgo(ts); if (d === null) return D.t('ln.rev.never'); return d === 0 ? D.t('ln.rev.today') : D.t('ln.rev.ago', { n: d }); }
  function matches(it, nq) {
    if (!nq) return true;
    if (D.translit.score(it.name || '', nq) > 0) return true;
    if (it.author && D.translit.score(it.author, nq) > 0) return true;
    const n = suraNum(it);
    return !!(n && (String(n) === nq || D.translit.score(SURA_NAME[n], nq) > 0));
  }
  function findById(id) { return D.S.learn.find((x) => x.id === id); }

  /* ------------------------------------------------------------------ */
  /* view state (device only)                                            */
  /* ------------------------------------------------------------------ */
  let query = '';
  let formType = 'kitob';
  const draft = { name: '', author: '', total: '', type: '' };
  const tab = () => { const t = D.sub('learn', 'all'); return t === 'all' || TYPES.includes(t) ? t : 'all'; };
  const sortMode = () => D.ui.filters.learnSort || 'new';
  const curType = () => (tab() === 'all' ? formType : tab());

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  function render() {
    const t = tab();
    const L = D.S.learn;
    const counts = { all: L.length };
    for (const ty of TYPES) counts[ty] = 0;
    for (const it of L) if (counts[it.type] !== undefined) counts[it.type]++;
    const tabs = `<div class="tabs ln-tabs">${['all', ...TYPES].map((k) =>
      `<button class="${t === k ? 'on' : ''}" data-act="sub" data-sub="${k}">${D.esc(k === 'all' ? D.t('common.all') : D.t('ln.type.' + k))}<span class="ln-cnt num">${counts[k]}</span></button>`).join('')}</div>`;
    let extras = '';
    if (t === 'sura') extras = renderSura(L);
    else if (t === 'kitob') extras = renderBooks(L);
    else extras = renderStats(L, t);
    return `<div class="ln">${tabs}${extras}${renderAdd(t)}
      <div class="card ln-listcard">
        <div class="ln-tools">
          <label class="ln-search">${D.ic('search', 16)}<input class="inp sm" id="lnQ" value="${D.esc(query)}" placeholder="${D.esc(D.t('ln.search'))}" data-input="lnSearch" autocomplete="off" aria-label="${D.esc(D.t('common.search'))}"></label>
          <div class="seg compact ln-sort">${[['new', 'ln.sort.new'], ['name', 'ln.sort.name'], ['status', 'ln.sort.status']].map(([k, key]) =>
            `<button class="${sortMode() === k ? 'on' : ''}" data-act="lnSort" data-sort="${k}">${D.esc(D.t(key))}</button>`).join('')}</div>
        </div>
        <div id="lnList">${renderList()}</div>
      </div></div>`;
  }

  function renderStats(L, t) {
    const items = t === 'all' ? L : L.filter((x) => x.type === t);
    const y = thisYear();
    const nd = items.filter(done).length, ny = items.filter((x) => done(x) && yearOf(x.doneAt) === y).length;
    return `<div class="stat-grid ln-stats">
      ${stat(items.length, D.t('ln.stat.total'))}
      ${stat(nd, D.t('ln.stat.done'), nd ? 'z-good' : '')}
      ${stat(items.length - nd, D.t('ln.stat.prog'), items.length - nd ? 'z-warn' : '')}
      ${stat(ny, D.t('ln.stat.year'))}
    </div>`;
  }
  function stat(n, label, zone, sub) {
    return `<div class="stat">${zone ? `<i class="zone ${zone}"></i>` : ''}<div class="stat-num num">${D.fmtNum(n)}</div><div class="stat-label">${D.esc(label)}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
  }

  function renderBooks(L) {
    const books = L.filter((x) => x.type === 'kitob');
    const y = thisYear();
    const ny = books.filter((x) => done(x) && yearOf(x.doneAt) === y).length;
    const pages = D.sum(books, (b) => (done(b) ? +b.total || 0 : Math.min(+b.progress || 0, +b.total || Infinity) || 0));
    const nd = books.filter(done).length;
    return `<div class="stat-grid ln-stats">
      ${stat(ny, D.t('ln.book.year'), ny ? 'z-good' : '')}
      ${stat(pages, D.t('ln.book.pages'))}
      ${stat(nd, D.t('ln.stat.done'))}
      ${stat(books.length - nd, D.t('ln.book.prog'), books.length - nd ? 'z-warn' : '')}
    </div>`;
  }

  function renderSura(L) {
    const idx = suraIndex();
    const pct = (idx.memo / TOTAL_AYAHS) * 100;
    const open = !D.ui.collapsed.lnGrid;
    let cells = '';
    for (const s of SURAS) {
      const it = idx.map.get(s[0]);
      const st = it ? (done(it) ? 'done' : (+it.progress || 0) > 0 ? 'prog' : 'open') : '';
      cells += `<button class="ln-cell ${st}" data-act="lnCell" data-n="${s[0]}" title="${D.esc(D.t('ln.grid.cell', { n: s[0], name: s[1], a: s[2] }))}" aria-label="${D.esc(s[1])}"><span class="num">${s[0]}</span></button>`;
    }
    // revision queue: memorised suras, least recently reviewed first
    const queue = [];
    for (const [n, it] of idx.map) if (done(it)) queue.push({ n, it, ts: +it.reviewedAt || +it.doneAt || +it.createdAt || 0 });
    queue.sort((a, b) => a.ts - b.ts || a.n - b.n);
    const top = queue.slice(0, 5);
    return `<div class="card ln-kpi-card">
      <div class="ln-kpi">
        ${D.chart.ring({ pct, size: 96, stroke: 9, color: 'var(--success)', label: D.fmtPct(pct, pct < 10 ? 1 : 0) })}
        <div class="ln-kpi-txt">
          <div class="eyebrow">${D.esc(D.t('ln.kpi.memorized'))}</div>
          <div class="kpi"><span class="kpi-num num">${D.fmtNum(idx.memo)}</span><span class="kpi-total">/ ${D.fmtNum(TOTAL_AYAHS)} ${D.esc(D.t('ln.unit.ayah'))}</span></div>
          <div class="small muted">${D.esc(D.t('ln.kpi.ofQuran', { p: D.fmtPct(pct, 1) }))} · ${D.esc(D.t('ln.kpi.suras', { n: idx.done }))}</div>
        </div>
      </div>
      <div class="ln-grid-head">
        <span class="eyebrow">${D.esc(D.t('ln.grid.title'))}</span>
        <button class="btn icon ln-grid-tg" data-act="lnGridToggle" aria-label="${D.esc(D.t('ln.grid.toggle'))}">${D.ic(open ? 'chevD' : 'chevR', 18)}</button>
      </div>
      ${open ? `<div class="ln-grid">${cells}</div>
      <div class="legend ln-legend"><span><i class="ln-sw done"></i>${D.esc(D.t('ln.legend.done'))}</span><span><i class="ln-sw prog"></i>${D.esc(D.t('ln.legend.prog'))}</span><span><i class="ln-sw"></i>${D.esc(D.t('ln.legend.none'))}</span></div>` : ''}
    </div>
    <div class="card ln-rev">
      <div class="card-head ln-rev-head"><div class="title">${D.ic('refresh', 18)} ${D.esc(D.t('ln.rev.title'))}</div><div class="help">${D.esc(D.t('ln.rev.hint'))}</div></div>
      ${top.length ? `<ul class="list">${top.map(({ n, it, ts }) => `<li class="li ln-rev-li">
          <span class="ln-n num">${n}</span>
          <div class="li-body"><div class="li-text">${D.esc(it.name)}</div><div class="li-meta"><span class="num">${AYAHS[n]} ${D.esc(D.t('ln.unit.ayah'))}</span><span class="${daysAgo(ts) === null || daysAgo(ts) > 30 ? 'warn' : ''}">${D.esc(agoText(ts))}</span></div></div>
          <button class="btn ghost sm" data-act="lnReview" data-id="${D.esc(it.id)}">${D.ic('check', 14)} ${D.esc(D.t('ln.rev.btn'))}</button>
        </li>`).join('')}</ul>` : `<div class="empty">${D.esc(D.t('ln.rev.empty'))}</div>`}
    </div>`;
  }

  function renderAdd(t) {
    const ty = curType();
    if (draft.type !== ty) { draft.type = ty; draft.total = ''; } // ayah count auto-filled for a sura must not leak into a book
    const typeSeg = t === 'all' ? `<div class="seg compact ln-typeseg">${TYPES.map((k) => `<button class="${ty === k ? 'on' : ''}" data-act="lnFormType" data-type="${k}">${D.esc(D.t('ln.one.' + k))}</button>`).join('')}</div>` : '';
    const nameInp = ty === 'sura'
      ? `<input class="inp" id="lnName" list="lnSuras" value="${D.esc(draft.name)}" placeholder="${D.esc(D.t('ln.add.suraName'))}" data-enter="lnAdd" data-input="lnDraft" data-f="name" autocomplete="off">
         <datalist id="lnSuras">${SURAS.map((s) => `<option value="${D.esc(s[1])}">${s[0]} · ${s[2]}</option>`).join('')}</datalist>`
      : `<input class="inp" id="lnName" value="${D.esc(draft.name)}" placeholder="${D.esc(D.t('ln.add.name'))}" data-enter="lnAdd" data-input="lnDraft" data-f="name" autocomplete="off">`;
    const extra = ty === 'kitob'
      ? `<input class="inp" id="lnTotal" type="number" inputmode="numeric" min="1" value="${D.esc(draft.total)}" placeholder="${D.esc(D.t('ln.add.pages'))}" data-enter="lnAdd" data-input="lnDraft" data-f="total">`
      : ty === 'sura'
        ? `<input class="inp" id="lnTotal" type="number" inputmode="numeric" min="1" value="${D.esc(draft.total)}" placeholder="${D.esc(D.t('ln.add.ayahs'))}" data-enter="lnAdd" data-input="lnDraft" data-f="total">`
        : '';
    return `<div class="card ln-add">
      <div class="eyebrow mb-s">${D.esc(D.t('ln.add.title'))} · ${D.esc(typeLabel(ty))}</div>
      <div class="stack">
        ${nameInp}
        <div class="ln-add-row">
          <input class="inp" id="lnAuthor" value="${D.esc(draft.author)}" placeholder="${D.esc(D.t('ln.add.author'))}" data-enter="lnAdd" data-input="lnDraft" data-f="author" autocomplete="off">
          ${extra}
        </div>
        <div class="ln-add-foot">${typeSeg}<button class="btn" data-act="lnAdd">${D.ic('plus', 16)} ${D.esc(D.t('btn.add'))}</button></div>
      </div></div>`;
  }

  function renderList() {
    const t = tab();
    const nq = D.translit.norm(query);
    let items = D.S.learn.filter((x) => (t === 'all' || x.type === t) && matches(x, nq));
    const mode = sortMode();
    const byName = (a, b) => {
      const na = suraNum(a), nb = suraNum(b);
      if (na && nb) return na - nb;
      return String(a.name || '').localeCompare(String(b.name || ''));
    };
    if (mode === 'name') items.sort(byName);
    else if (mode === 'status') items.sort((a, b) => (done(a) ? 1 : 0) - (done(b) ? 1 : 0) || byName(a, b));
    else items = items.slice().sort((a, b) => (+b.createdAt || 0) - (+a.createdAt || 0));
    if (!items.length) return `<div class="empty">${D.esc(D.t(nq ? 'search.empty' : 'ln.empty'))}</div>`;
    return `<ul class="list">${items.map((it) => row(it, t)).join('')}</ul>`;
  }

  function row(it, t) {
    const isDone = done(it);
    const total = itemTotal(it), prog = isDone ? total : D.clamp(+it.progress || 0, 0, total || Infinity);
    const n = suraNum(it);
    const meta = [];
    if (t === 'all') meta.push(`<span class="tag" style="--c:var(--${{ kitob: 'aql', sura: 'ruh', kurs: 'tana', audio: 'qalb' }[it.type] || 'boshqa'})">${D.esc(typeLabel(it.type))}</span>`);
    if (it.author) meta.push(`<span>${D.esc(it.author)}</span>`);
    if (!total) meta.push(`<span class="${isDone ? 'good' : ''}">${D.esc(D.t('ln.status.' + (isDone ? 'tugadi' : 'jarayonda')))}</span>`);
    if (it.type === 'sura' && isDone) meta.push(`<span class="ln-ago">${D.ic('refresh', 11)} ${D.esc(agoText(+it.reviewedAt || 0))}</span>`);
    const bar = total ? `<button class="ln-prog" data-act="lnProgress" data-id="${D.esc(it.id)}" aria-label="${D.esc(D.t('ln.prompt.progress', { total, unit: unitOf(it) }))}">
        <span class="bar thin"><i class="bar-fill" style="width:${pctOf(it).toFixed(1)}%${isDone ? '' : ';background:var(--warning)'}"></i></span>
        <span class="ln-prog-n num">${D.fmtNum(prog)}<span class="muted">/${D.fmtNum(total)}</span></span></button>` : '';
    const right = it.type === 'sura' && isDone
      ? `<button class="btn icon ln-act" data-act="lnReview" data-id="${D.esc(it.id)}" aria-label="${D.esc(D.t('ln.rev.btn'))}" title="${D.esc(D.t('ln.rev.btn'))}">${D.ic('refresh', 16)}</button>`
      : it.type === 'kitob' && !total
        ? `<button class="btn icon ln-act" data-act="lnTotal" data-id="${D.esc(it.id)}" aria-label="${D.esc(D.t('ln.setTotal'))}" title="${D.esc(D.t('ln.setTotal'))}">${D.ic('edit', 16)}</button>`
        : '';
    return `<li class="li ${isDone ? 'done' : ''}">
      <input type="checkbox" class="chk" data-change="lnToggle" data-id="${D.esc(it.id)}" ${isDone ? 'checked' : ''} aria-label="${D.esc(it.name)}">
      <div class="li-body">
        <div class="li-text">${n ? `<span class="ln-n num">${n}</span>` : ''}${D.esc(it.name)}</div>
        ${meta.length ? `<div class="li-meta">${meta.join('')}</div>` : ''}
        ${bar}
      </div>
      ${right}
      <button class="li-del" data-act="lnDel" data-id="${D.esc(it.id)}" aria-label="${D.esc(D.t('btn.delete'))}">${D.ic('x', 16)}</button>
    </li>`;
  }

  /* ------------------------------------------------------------------ */
  /* actions                                                             */
  /* ------------------------------------------------------------------ */
  D.act.lnSearch = (el) => { query = el.value || ''; D.patch('lnList', renderList()); };
  D.act.lnSort = (el) => { D.ui.filters.learnSort = el.dataset.sort; D.saveUi(); D.rerender(); };
  D.act.lnFormType = (el) => { formType = TYPES.includes(el.dataset.type) ? el.dataset.type : 'kitob'; D.rerender(); };
  D.act.lnGridToggle = () => { D.ui.collapsed.lnGrid = !D.ui.collapsed.lnGrid; D.saveUi(); D.rerender(); };
  D.act.lnDraft = (el) => {
    const f = el.dataset.f;
    if (f === 'name' || f === 'author' || f === 'total') draft[f] = el.value;
    if (f === 'name' && curType() === 'sura') { // auto-fill ayah count from the datalist choice
      const n = KEY2N.get(suraKey(el.value));
      const tot = D.$('#lnTotal');
      if (n && tot) { tot.value = AYAHS[n]; draft.total = String(AYAHS[n]); }
    }
  };

  D.act.lnAdd = () => {
    const nameEl = D.$('#lnName'), authEl = D.$('#lnAuthor'), totEl = D.$('#lnTotal');
    const name = ((nameEl && nameEl.value) || draft.name || '').trim();
    if (!name) { D.toast(D.t('ln.toast.needName')); if (nameEl) nameEl.focus(); return; }
    const type = curType();
    const author = ((authEl && authEl.value) || '').trim();
    let total = totEl ? parseInt(totEl.value, 10) : NaN;
    if (!(total > 0)) total = null;
    const it = { id: D.uid('l'), type, name, author, status: 'jarayonda', progress: 0, total, createdAt: Date.now(), doneAt: null, reviewedAt: null };
    if (type === 'sura') {
      const n = KEY2N.get(suraKey(name)) || 0;
      if (n) {
        if (suraIndex().map.has(n)) { D.toast(D.t('ln.toast.exists')); return; }
        it.sura = n; it.total = total || AYAHS[n];
      }
    }
    D.S.learn.push(it);
    draft.name = ''; draft.author = ''; draft.total = '';
    D.save(); D.rerender();
    D.toast(D.t('ln.toast.added'));
    const again = D.$('#lnName'); if (again) again.focus();
  };

  function setDone(it, v) {
    if (v) {
      it.status = 'tugadi'; it.doneAt = Date.now();
      const t = itemTotal(it); if (t) it.progress = t;
    } else { it.status = 'jarayonda'; it.doneAt = null; if (it.progress && itemTotal(it) && it.progress >= itemTotal(it)) it.progress = 0; }
    if (it.type === 'sura' && !it.sura) { const n = suraNum(it); if (n) it.sura = n; }
  }
  D.act.lnToggle = (el) => {
    const it = findById(el.dataset.id); if (!it) return;
    setDone(it, !done(it));
    D.save(); D.rerender();
  };
  D.act.lnDel = (el) => { D.remove(D.S.learn, el.dataset.id, { label: D.t('ln.deleted') }); };

  D.act.lnProgress = async (el) => {
    const it = findById(el.dataset.id); if (!it) return;
    const total = itemTotal(it); if (!total) return;
    const v = await D.prompt({ title: it.name, value: String(done(it) ? total : +it.progress || 0), placeholder: D.t('ln.prompt.progress', { total, unit: unitOf(it) }), ok: D.t('btn.save') });
    if (v === null || v === undefined) return;
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    if (isNaN(n)) return;
    const p = D.clamp(n, 0, total);
    it.progress = p;
    if (it.type === 'sura' && !it.sura) { const sn = suraNum(it); if (sn) it.sura = sn; }
    if (p >= total && !done(it)) { setDone(it, true); D.toast(D.t('ln.toast.done')); }
    else if (p < total && done(it)) { it.status = 'jarayonda'; it.doneAt = null; }
    D.save(); D.rerender();
  };
  D.act.lnTotal = async (el) => {
    const it = findById(el.dataset.id); if (!it) return;
    const v = await D.prompt({ title: it.name, value: it.total ? String(it.total) : '', placeholder: D.t('ln.prompt.total'), ok: D.t('btn.save') });
    if (v === null || v === undefined) return;
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    if (!(n > 0)) return;
    it.total = n;
    if (done(it)) it.progress = n; else if (+it.progress > n) it.progress = n;
    D.save(); D.rerender();
  };
  D.act.lnReview = (el) => {
    const it = findById(el.dataset.id); if (!it) return;
    it.reviewedAt = Date.now();
    D.save(); D.rerender();
    D.toast(D.t('ln.rev.done') + ' · ' + it.name);
  };
  D.act.lnCell = (el) => {
    const n = +el.dataset.n; if (!AYAHS[n]) return;
    const it = suraIndex().map.get(n);
    if (!it) {
      D.S.learn.push({ id: D.uid('l'), type: 'sura', sura: n, name: SURA_NAME[n], author: '', status: 'jarayonda', progress: 0, total: AYAHS[n], createdAt: Date.now(), doneAt: null, reviewedAt: null });
      D.toast(D.t('ln.toast.created', { name: SURA_NAME[n] }));
    } else if (done(it)) { setDone(it, false); D.toast(D.t('ln.toast.prog')); }
    else { setDone(it, true); D.toast(D.t('ln.toast.done') + ' · ' + it.name); }
    D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* search provider + public helpers                                    */
  /* ------------------------------------------------------------------ */
  D.search.register((q) => {
    if (!q) return [];
    return D.S.learn.map((it) => ({
      label: it.name || '', sub: typeLabel(it.type) + (it.author ? ' · ' + it.author : '') + ' · ' + D.t('ln.pal.sub'), icon: 'book',
      go: () => { query = it.name || ''; D.go('learn', it.type); },
    }));
  });
  D.learn = { SURAS, TOTAL_AYAHS, suraNum, memorized: () => { const i = suraIndex(); return { ayahs: i.memo, suras: i.done, pct: (i.memo / TOTAL_AYAHS) * 100 }; } };

  D.view({ id: 'learn', icon: 'book', order: 50, primary: false, render });
})();
